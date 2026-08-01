import nodemailer from "nodemailer";
import { getStore } from "@/lib/data/store";

/**
 * Email service — uses SMTP config from tenant settings.
 * Falls back to console logging if SMTP is not configured (dev mode).
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

async function getSmtpConfig(tenantId?: string): Promise<SmtpConfig | null> {
  // Try tenant-specific config first, then global
  const store = await getStore();
  const comms = await store.getSetting<any>("comms");
  if (comms && comms.smtp_host && comms.smtp_user) {
    return {
      host: comms.smtp_host,
      port: comms.smtp_port || 587,
      user: comms.smtp_user,
      password: comms.smtp_password || "",
      fromName: comms.from_name || "Aspidus CRM",
      fromEmail: comms.from_email || "noreply@aspidus.com",
    };
  }
  return null;
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const smtp = await getSmtpConfig(opts.tenantId);

  // No SMTP configured — log to console (dev mode) and queue
  if (!smtp) {
    console.log(`[email:dev] To: ${opts.to} | Subject: ${opts.subject}`);
    console.log(`[email:dev] Body: ${opts.text || opts.html.substring(0, 200)}...`);
    // Queue in mail_queue table for later retry
    const store = await getStore();
    await store.upsertMailQueueEntry({
      to_email: opts.to,
      subject: opts.subject,
      body: opts.html,
      status: "queued",
    });
    return { success: true, messageId: "dev-queued" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.password },
    });

    const info = await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text || opts.html.replace(/<[^>]*>/g, ""),
      attachments: opts.attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });

    // Mark as sent in queue
    return { success: true, messageId: info.messageId };
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
    return { success: false, error: e.message };
  }
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
