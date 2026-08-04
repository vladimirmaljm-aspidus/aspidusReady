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

  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant." }, { status: 400 });
  const items = await auth.store.listPortalAccess(tenantId);
  return NextResponse.json({ items: items.map((p) => ({ ...p, password_hash: undefined })) });
}

// Admin: create/update portal access (approve, invite, set tier)
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant." }, { status: 400 });
  const body = await req.json();
  body.tenant_id = tenantId;
  if (!body.id && body.status === "approved" && !body.approved_by) {
    body.approved_by = auth.user.id;
    body.approved_at = new Date().toISOString();
  }
  const created = await auth.store.upsertPortalAccess(body);
  await audit(auth.store, auth.user, req, body.id ? "portal_access.update" : "portal_access.create", "portal_access", created.id, { tier: created.tier, status: created.status });
  return NextResponse.json({ ...created, password_hash: undefined });
}
