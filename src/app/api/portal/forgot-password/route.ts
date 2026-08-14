import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { sendEmail } from "@/lib/email/service";
import { createPasswordReset } from "@/lib/auth/password-reset";
import { getIp } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * POST /api/portal/forgot-password
 * Body: { email: "client@example.com" }
 *
 * Sends a password reset email. Always returns 200 to prevent enumeration.
 * Token is stored HASHED in `password_resets` (plaintext token is only in the email).
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const store = await getStore();

    const tenants = await store.listTenants();
    let access: any = null;
    let tenant: any = null;
    for (const t of tenants) {
      try {
        const a = await store.getPortalAccessByEmail(t.id, email);
        if (a) { access = a; tenant = t; break; }
      } catch { /* skip */ }
    }

    // Always return the same message to prevent email enumeration.
    const genericOk = NextResponse.json({
      ok: true,
      message: "If an account exists for this email, a reset link has been sent.",
    });

    if (!access) return genericOk;

    const ip = getIp(req);
    const ua = req.headers.get("user-agent") || null;

    const { token, expiresAt } = await createPasswordReset({
      targetType: "portal_access",
      targetId: access.id,
      tenantId: tenant.id,
      ip, userAgent: ua,
    });

    await store.appendAudit({
      tenant_id: tenant.id,
      user_id: null,
      username: `portal:${email}`,
      action: "portal.password_reset_requested",
      entity_type: "portal_access",
      entity_id: access.id,
      details: { email, expires_at: expiresAt },
      ip: ip || "unknown",
      user_agent: ua,
    });

    const baseUrl = process.env.APP_BASE_URL || "https://velos.onrender.com";
    const resetUrl = `${baseUrl}/portal/login?reset_token=${token}`;

    await sendEmail({
      to: email,
      subject: `Password Reset — ${tenant.name || "VELOS"}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;">
          <div style="background:#0f766e;color:white;padding:24px 28px;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;font-size:18px;font-weight:600;">Password Reset Request</h1>
            <p style="margin:6px 0 0;opacity:0.9;font-size:13px;">${tenant.name || "VELOS"} Client Portal</p>
          </div>
          <div style="background:white;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <p style="color:#333;font-size:14px;">Hello,</p>
            <p style="color:#555;font-size:14px;line-height:1.6;">
              We received a request to reset your portal password. Click the button below
              to set a new password. This link will expire in 1 hour.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${resetUrl}" style="background:#0f766e;color:white;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;font-size:14px;">Reset My Password</a>
            </div>
            <p style="color:#888;font-size:12px;line-height:1.5;">
              If you didn't request this reset, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
      tenantId: tenant.id,
    });

    return genericOk;
  } catch (e: any) {
    console.error("[portal.forgot-password]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
