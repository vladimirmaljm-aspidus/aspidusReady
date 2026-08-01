import nodemailer from "nodemailer";
import { getStore } from "@/lib/data/store";

/**
 * Email service — multi-provider.
 *
 * Providers (selected per-tenant in Settings → Communications):
 *   1. resend    — HTTP API, recommended. No SMTP port blocks, works on Render free.
 *                  Free tier: 100 emails/day, 3000/month. https://resend.com
 *   2. smtp      — traditional SMTP. Works when the host allows outbound SMTP
 *                  (Render free plan blocks ports 465/587 — use Resend instead).
 *   3. supabase  — uses a Supabase Edge Function as the sender. Useful when
 *                  you want all outbound email routed through your Supabase
 *                  project. (Future — placeholder for now.)
 *
 * If no provider is configured, emails are queued in the mail_queue table
 * (dev mode) so they can be retried once a provider is set up.
 */

interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tenantId?: string;
  attachments?: EmailAttachment[];
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

interface ResendConfig {
  apiKey: string;
  fromName: string;
  fromEmail: string;
  /** Optional — reply-to address */
  replyTo?: string;
}

export type EmailProvider = "resend" | "smtp" | "none";

interface EmailConfig {
  provider: EmailProvider;
  smtp?: SmtpConfig;
  resend?: ResendConfig;
  fromName: string;
  fromEmail: string;
}

/**
 * Load the email configuration for a tenant (or the global config).
 * Returns the resolved provider + its credentials.
 */
export async function getEmailConfig(tenantId?: string): Promise<EmailConfig | null> {
  const store = await getStore();
  const comms = await store.getSetting<any>("comms");
  if (!comms) return null;

  const provider: EmailProvider = comms.email_provider || (comms.smtp_host ? "smtp" : "none");
  const fromName = comms.from_name || "Aspidus CRM";
  const fromEmail = comms.from_email || "noreply@aspidus.com";

  const config: EmailConfig = { provider, fromName, fromEmail };

  if (comms.smtp_host && comms.smtp_user) {
    config.smtp = {
      host: comms.smtp_host,
      port: comms.smtp_port || 587,
      user: comms.smtp_user,
      password: comms.smtp_password || "",
      fromName,
      fromEmail,
    };
  }

  if (comms.resend_api_key) {
    config.resend = {
      apiKey: comms.resend_api_key,
      fromName,
      fromEmail: comms.resend_from_email || fromEmail,
      replyTo: comms.reply_to || undefined,
    };
  }

  return config;
}

/**
 * Send an email using the configured provider.
 * Falls back to queueing in mail_queue if no provider is set up.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string; provider?: EmailProvider }> {
  const config = await getEmailConfig(opts.tenantId);

  // No provider configured — queue for later
  if (!config || config.provider === "none" || (config.provider === "smtp" && !config.smtp) || (config.provider === "resend" && !config.resend)) {
    console.log(`[email:dev] To: ${opts.to} | Subject: ${opts.subject}`);
    const store = await getStore();
    await store.upsertMailQueueEntry({
      to_email: opts.to,
      subject: opts.subject,
      body: opts.html,
      status: "queued",
    });
    return { success: true, messageId: "dev-queued", provider: "none" };
  }

  try {
    let result: { success: boolean; messageId?: string; error?: string };

    if (config.provider === "resend" && config.resend) {
      result = await sendViaResend(opts, config.resend);
    } else if (config.provider === "smtp" && config.smtp) {
      result = await sendViaSmtp(opts, config.smtp);
    } else {
      throw new Error("No email provider available");
    }

    if (!result.success) throw new Error(result.error || "Unknown error");
    return { success: true, messageId: result.messageId, provider: config.provider };
  } catch (e: any) {
    console.error("[email:error]", e.message);
    // Queue for retry
    const store = await getStore();
    await store.upsertMailQueueEntry({
      to_email: opts.to,
      subject: opts.subject,
      body: opts.html,
      status: "failed",
      attempts: 1,
      error: e.message,
    });
    return { success: false, error: e.message, provider: config.provider };
  }
}

// ============================================================
// Provider: Resend (HTTP API — recommended)
// ============================================================

async function sendViaResend(opts: SendEmailOptions, cfg: ResendConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const payload: Record<string, unknown> = {
    from: `${cfg.fromName} <${cfg.fromEmail}>`,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.text) payload.text = opts.text;
  if (cfg.replyTo) payload.reply_to = cfg.replyTo;

  // Attachments — Resend expects base64 content
  if (opts.attachments && opts.attachments.length > 0) {
    payload.attachments = opts.attachments.map((a) => ({
      filename: a.filename,
      content: a.content.toString("base64"),
      content_type: a.contentType,
    }));
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `Resend API error ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.message || errJson.error || errMsg;
    } catch {
      errMsg = errText || errMsg;
    }
    return { success: false, error: errMsg };
  }

  const data = await res.json();
  return { success: true, messageId: data.id };
}

// ============================================================
// Provider: SMTP (traditional)
// ============================================================

async function sendViaSmtp(opts: SendEmailOptions, cfg: SmtpConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const info = await transporter.sendMail({
    from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text || opts.html.replace(/<[^>]*>/g, ""),
    attachments: opts.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  });

  return { success: true, messageId: info.messageId };
}

// ============================================================
// Email templates
// ============================================================

export function welcomePortalEmail(opts: {
  partnerName: string;
  portalEmail: string;
  accessId: string;
  tenantName: string;
  baseUrl: string;
  tier: string;
}): { subject: string; html: string } {
  const setupUrl = `${opts.baseUrl}/portal/login?access_id=${opts.accessId}`;
  const subject = `Welcome to ${opts.tenantName} Client Portal`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: #0f766e; color: white; padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Welcome to ${opts.tenantName}</h1>
        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Your client portal account is ready</p>
      </div>
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #333; font-size: 15px; line-height: 1.6;">Hello ${opts.partnerName},</p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Your account has been created with <strong style="text-transform: capitalize;">${opts.tier}</strong> tier access.
          You can now view your offers, download documents, browse our product catalog, and submit requests.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${setupUrl}" style="background: #0f766e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Set Up Your Password
          </a>
        </div>
        <p style="color: #888; font-size: 12px; line-height: 1.5;">
          This link will expire in 7 days. If you didn't expect this email, please ignore it.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <h3 style="color: #333; font-size: 14px; margin: 0 0 8px;">What you can do in the portal:</h3>
        <ul style="color: #555; font-size: 13px; line-height: 1.8; padding-left: 20px;">
          <li>View and download your offers and invoices</li>
          <li>Browse our product catalog with specifications</li>
          <li>Request quotes for products not in catalog</li>
          <li>Complete your KYC verification (if required)</li>
          <li>Update your profile and company information</li>
        </ul>
      </div>
      <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} ${opts.tenantName}. Powered by Aspidus.
      </p>
    </div>
  `;
  return { subject, html };
}

export function documentEmail(opts: {
  partnerName: string;
  docType: string; // "offer", "invoice", "proforma"
  docNumber: string;
  tenantName: string;
  amount?: string;
  currency?: string;
  dueDate?: string;
}): { subject: string; html: string } {
  const typeLabel = opts.docType.charAt(0).toUpperCase() + opts.docType.slice(1);
  const subject = `${typeLabel} ${opts.docNumber} — ${opts.tenantName}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: #0f766e; color: white; padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 600;">${typeLabel} ${opts.docNumber}</h1>
        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">From ${opts.tenantName}</p>
      </div>
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #333; font-size: 15px; line-height: 1.6;">Hello ${opts.partnerName},</p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Please find attached your ${typeLabel.toLowerCase()} <strong>${opts.docNumber}</strong>.
          ${opts.amount ? `The total amount is <strong>${opts.currency || ''} ${opts.amount}</strong>.` : ''}
          ${opts.dueDate ? `Due date: <strong>${opts.dueDate}</strong>.` : ''}
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          The document is attached as a PDF file. Please review it and contact us if you have any questions.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="color: #888; font-size: 12px; line-height: 1.5;">
          This is an automated message from ${opts.tenantName}. Please do not reply to this email.
        </p>
      </div>
      <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} ${opts.tenantName}. Powered by Aspidus.
      </p>
    </div>
  `;
  return { subject, html };
}

export function kycStatusEmail(opts: {
  partnerName: string;
  to: string;
  status: string;
  tenantName: string;
  reason?: string | null;
}): { subject: string; html: string } {
  const approved = opts.status === "approved";
  const subject = approved
    ? `KYC Approved — ${opts.tenantName}`
    : `KYC ${opts.status === "rejected" ? "Rejected" : "Update Required"} — ${opts.tenantName}`;
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: ${approved ? "#0f766e" : "#dc2626"}; color: white; padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 22px;">KYC ${approved ? "Approved" : opts.status === "rejected" ? "Rejected" : "Update Required"}</h1>
      </div>
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #333; font-size: 15px;">Hello ${opts.partnerName},</p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          ${approved
            ? "Your KYC verification has been approved. Your account is now fully active and all data has been saved to your profile."
            : opts.status === "rejected"
            ? `Your KYC submission has been rejected. Reason: ${opts.reason || "Please contact your account manager for details."}`
            : "Your KYC submission requires updates. Please log in to the portal to review and resubmit."}
        </p>
      </div>
    </div>
  `;
  return { subject, html };
}
