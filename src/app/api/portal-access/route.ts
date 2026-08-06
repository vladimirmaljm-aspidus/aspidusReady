import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

// Admin: list portal access for a tenant
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (portal.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "portal.read"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_portal)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_portal", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ items: [], total: 0 });
  const items = await auth.store.listPortalAccess(tenantId);
  return NextResponse.json({ items: items.map((p) => ({ ...p, password_hash: undefined })) });
}

// Admin: create/update portal access (approve, invite, set tier)
export async function POST(req: NextRequest) {
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
  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant." }, { status: 400 });
  const body = await req.json();
  body.tenant_id = tenantId;

  // ── Fresh-create defaults (id absent) ─────────────────────────────────
  if (!body.id) {
    // Auto-fill portal_email from the partner record if the admin didn't
    // supply one. Portal cannot invite anyone without a working email.
    if (!body.portal_email && body.partner_id) {
      const partner = await auth.store.getPartner(body.partner_id);
      if (partner?.email) body.portal_email = partner.email;
    }
    if (!body.portal_email) {
      return NextResponse.json({
        error: "Portal email is required. Add an email address to the partner record first, or set portal_email explicitly.",
      }, { status: 400 });
    }
    // Refuse duplicate portal email inside the tenant — this would corrupt
    // login lookups (getPortalAccessByEmail uses .maybeSingle()).
    const dupe = await auth.store.getPortalAccessByEmail(tenantId, body.portal_email).catch(() => null);
    if (dupe) {
      return NextResponse.json({
        error: `A portal account with email ${body.portal_email} already exists in this tenant.`,
      }, { status: 409 });
    }
    // Force must_set_password so the invite → setup-password gate stays valid.
    body.must_set_password = true;
    if (body.status === "approved" && !body.approved_by) {
      body.approved_by = auth.user.id;
      body.approved_at = new Date().toISOString();
    }
    // Default status the admin can rely on: "invited" (not "active" — no
    // password yet). The client-facing setup-password flow flips to active.
    if (!body.status) body.status = "invited";
  }
  const created = await auth.store.upsertPortalAccess(body);
  await audit(auth.store, auth.user, req, body.id ? "portal_access.update" : "portal_access.create", "portal_access", created.id, { tier: created.tier, status: created.status });
  return NextResponse.json({ ...created, password_hash: undefined });
}
