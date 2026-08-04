import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, requireAuthOrApiKey, resolveTenantId, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// GET /api/erp/settings — Get ERP settings
export async function GET(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
    // Permission gate (erp.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "erp.read"); if (_d) return _d; } } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _tid = ("apiKeyId" in auth) ? auth.tenantId : auth.tenantId;
    const _isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const _f = await requireFeature(_tid, "module_finance", _isSA); if (_f) return _f; } /* requireFeature wired */


  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });
  }

  try {
    const settings = await auth.store.getErpSettings(tenantId);
    if (!settings) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(settings);
  } catch (e: any) {
    console.error("[erp/settings GET]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/erp/settings — Create/update ERP settings (requires admin)
export async function POST(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
  // Permission gate (erp.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "erp.create"); if (_d) return _d; } } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _tid = ("apiKeyId" in auth) ? auth.tenantId : auth.tenantId;
    const _isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const _f = await requireFeature(_tid, "module_finance", _isSA); if (_f) return _f; } /* requireFeature wired */


  // For session auth, require admin role; for API key auth, check permissions
  if ("apiKeyId" in auth) {
    // API key auth — permission check handled by hasPermission if needed
  } else if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const upserted = await auth.store.upsertErpSettings({ ...body, tenant_id: tenantId });
    await audit(auth.store, "user" in auth ? auth.user : { id: auth.apiKeyId, username: auth.apiKeyName, tenant_id: auth.tenantId }, req, "erp_settings.update", "erp_setting", upserted.id, {
      accounting_standard: upserted.accounting_standard,
      default_currency: upserted.default_currency,
    });
    return NextResponse.json(upserted);
  } catch (e: any) {
    console.error("[erp/settings POST]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
