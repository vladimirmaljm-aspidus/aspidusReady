import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * GET /api/seals?tenant_id=xxx
 * List all seals (zigled) for the resolved tenant.
 * Super-admin can pass ?tenant_id=xxx to manage a specific tenant.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (seals.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "seals.read"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_document_templates)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_document_templates", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  let tenantId = resolveTenantId(auth, req);
  if (!tenantId && auth.isSuperAdmin) {
    const tenants = await auth.store.listTenants();
    tenantId = tenants[0]?.id || null;
  }
  if (!tenantId) return NextResponse.json({ items: [], total: 0 });
  const items = await auth.store.listSeals(tenantId);
  return NextResponse.json({ items });
}

/**
 * POST /api/seals?tenant_id=xxx
 * Create or update a seal. The body should include all seal fields.
 * The tenant_id is resolved server-side (super-admin can override via query).
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  // Permission gate (seals.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "seals.create"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_document_templates)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_document_templates", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  let tenantId = resolveTenantId(auth, req);
  if (!tenantId && auth.isSuperAdmin) {
    const tenants = await auth.store.listTenants();
    tenantId = tenants[0]?.id || null;
  }
  if (!tenantId) return NextResponse.json({ error: "No tenant." }, { status: 400 });
  const body = await req.json();
  body.tenant_id = tenantId;
  if (!body.created_by) body.created_by = auth.user.id;
  const created = await auth.store.upsertSeal(body);
  await audit(
    auth.store,
    auth.user,
    req,
    body.id ? "seal.update" : "seal.create",
    "tenant_seal",
    created.id,
    { name: created.name }
  );
  return NextResponse.json(created);
}
