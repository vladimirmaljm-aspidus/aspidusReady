import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { sendEmail } from "@/lib/email/service";

export const runtime = "nodejs";

/**
 * POST /api/portal-access/[id]/message
 *
 * Admin sends a message to a portal client.
 * Body: { message: "text", send_email?: boolean }
 *
 * The message is stored in the audit log AND optionally emailed to the client.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (portal.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "portal.create"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_portal)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_portal", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const { message, send_email } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const access = await auth.store.getPortalAccessById(id);
    if (!access) return NextResponse.json({ error: "Portal access not found." }, { status: 404 });
    // Tenant ownership check
    if (!auth.isSuperAdmin && access.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Portal access not found." }, { status: 404 });
    }

    // Store message in audit log
    await auth.store.appendAudit({
      tenant_id: access.tenant_id,
      user_id: auth.user.id,
      username: auth.user.username,
      action: "admin.message",
      entity_type: "portal_access",
      entity_id: id,
      details: {
        message: message.trim(),
        access_id: id,
        partner_id: access.partner_id,
        read: false,
        sent_by: auth.user.username,
      },
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      user_agent: req.headers.get("user-agent") || null,
    });

    // Optionally send email notification
    if (send_email && access.portal_email) {
      const tenant = await auth.store.getTenant(access.tenant_id);
      const baseUrl = process.env.APP_BASE_URL || "https://aspidus.onrender.com";

      await sendEmail({
        to: access.portal_email,
        subject: `New message from ${tenant?.name || "Aspidus"}`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;">
            <div style="background:#0f766e;color:white;padding:24px 28px;border-radius:12px 12px 0 0;">
              <h1 style="margin:0;font-size:18px;font-weight:600;">New Message</h1>
              <p style="margin:6px 0 0;opacity:0.9;font-size:13px;">From ${tenant?.name || "Aspidus"} Team</p>
            </div>
            <div style="background:white;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
              <p style="color:#333;font-size:14px;line-height:1.6;">${message.trim().replace(/\n/g, "<br>")}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              <a href="${baseUrl}/portal/login?email=${access.portal_email}" style="background:#0f766e;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;font-size:14px;">
                Go to Portal
              </a>
            </div>
          </div>
        `,
        tenantId: access.tenant_id,
      });
    }

    await audit(auth.store, auth.user, req, "portal.message_sent", "portal_access", id, {
      message_length: message.length,
      email_sent: !!send_email,
    });

    return NextResponse.json({ ok: true, message: "Message sent successfully." });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
