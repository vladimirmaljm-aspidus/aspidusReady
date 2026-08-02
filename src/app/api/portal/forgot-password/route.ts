import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { sendEmail } from "@/lib/email/service";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

/**
 * POST /api/portal/forgot-password
 * Body: { email: "client@example.com" }
 *
 * Sends a password reset email with a unique reset token.
 * The token expires in 1 hour.
 * Always returns 200 (even if email doesn't exist) to prevent email enumeration.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const store = await getStore();

    // Find portal access by email across all tenants
    // We need to search — the store doesn't have a global search method,
    // so we list all tenants and check each
    const tenants = await store.listTenants();
    let access: any = null;
    let tenant: any = null;

    for (const t of tenants) {
      try {
        const a = await store.getPortalAccessByEmail(t.id, email);
        if (a) {
          access = a;
          tenant = t;
          break;
        }
      } catch { /* skip */ }
    }

    // Always return success to prevent email enumeration
    if (!access) {
      return NextResponse.json({
        ok: true,
        message: "If an account exists for this email, a reset link has been sent.",
      });
    }

    // Generate reset token (32 bytes = 64 hex chars)
    const resetToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Store the reset token on the portal access record
    // We use the audit log to store it (key-value style)
    await store.appendAudit({
      tenant_id: tenant.id,
      user_id: null,
      username: `portal:${email}`,
      action: "portal.password_reset_requested",
      entity_type: "portal_access",
      entity_id: access.id,
      details: {
        reset_token: resetToken,
        expires_at: expiresAt,
        email,
      },
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      user_agent: req.headers.get("user-agent") || null,
    });

    // Send reset email
    const baseUrl = process.env.APP_BASE_URL || "https://aspidus.onrender.com";
    const resetUrl = `${baseUrl}/portal/login?reset_token=${resetToken}`;

    const { subject, html } = {
      subject: `Password Reset — ${tenant.name || "Aspidus"}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;">
          <div style="background:#0f766e;color:white;padding:24px 28px;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;font-size:18px;font-weight:600;">Password Reset Request</h1>
            <p style="margin:6px 0 0;opacity:0.9;font-size:13px;">${tenant.name || "Aspidus"} Client Portal</p>
          </div>
          <div style="background:white;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <p style="color:#333;font-size:14px;">Hello,</p>
            <p style="color:#555;font-size:14px;line-height:1.6;">
              We received a request to reset your portal password. Click the button below
              to set a new password. This link will expire in 1 hour.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${resetUrl}" style="background:#0f766e;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;font-size:14px;">
                Reset My Password
              </a>
            </div>
            <p style="color:#888;font-size:12px;line-height:1.5;">
              If you didn't request this reset, you can safely ignore this email.
              Your password remains unchanged.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
            <p style="color:#888;font-size:11px;">
              This is an automated message. Please do not reply.
            </p>
          </div>
        </div>
      `,
    };

    await sendEmail({
      to: email,
      subject,
      html,
      tenantId: tenant.id,
    });

    return NextResponse.json({
      ok: true,
      message: "If an account exists for this email, a reset link has been sent.",
    });
  } catch (e: any) {
    console.error("[portal.forgot-password]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
