import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { sendEmail, welcomePortalEmail } from "@/lib/email/service";
import { notifyPortalInviteSent } from "@/lib/notif/helper";

export const runtime = "nodejs";

// Send welcome email to a portal client with password setup link
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (portal.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "portal.invite"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_portal)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_portal", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  const access = await auth.store.getPortalAccessById(id);
  if (!access) return NextResponse.json({ error: "Not found." }, { status: 404 });
  // Tenant ownership check
  if (!auth.isSuperAdmin && access.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!access.portal_email) return NextResponse.json({ error: "No portal email set." }, { status: 400 });

  // Always refresh invite metadata; only downgrade status if not already active
  // (previously the `if (access.status !== "active")` guard meant re-inviting an
  // active user silently no-oped on invited_at / welcome_email_sent).
  const newStatus = access.status === "active" ? "active" : "invited";
  await auth.store.upsertPortalAccess({
    ...access,
    status: newStatus,
    invited_at: new Date().toISOString(),
    welcome_email_sent: false,
  });

  const tenant = await auth.store.getTenant(access.tenant_id);
  const partner = await auth.store.getPartner(access.partner_id);
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  const { subject, html } = welcomePortalEmail({
    partnerName: partner?.name || "Client",
    portalEmail: access.portal_email,
    accessId: access.id,
    tenantName: tenant?.name || "Aspidus",
    baseUrl,
    tier: access.tier,
  });

  const result = await sendEmail({
    to: access.portal_email,
    subject,
    html,
    tenantId: access.tenant_id,
  });

  await audit(auth.store, auth.user, req, "portal.invite", "portal_access", id, {
    email: access.portal_email,
    sent: result.success,
  });
  // Notify
  await notifyPortalInviteSent(access.tenant_id, partner?.name || "Client", access.portal_email || "", id);

  if (!result.success) {
    return NextResponse.json({ error: "Email failed to send. Queued for retry.", details: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, sent: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
