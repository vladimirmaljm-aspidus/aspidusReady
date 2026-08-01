import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, resolveTenantId, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// GET /api/erp/settings — Get ERP settings
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });
  }

  try {
    const settings = await auth.store.getErpSettings(tenantId);
    if (!settings) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(settings);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/erp/settings — Create/update ERP settings (requires admin)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const upserted = await auth.store.upsertErpSettings({ ...body, tenant_id: tenantId });
    await audit(auth.store, auth.user, req, "erp_settings.update", "erp_setting", upserted.id, {
      accounting_standard: upserted.accounting_standard,
      default_currency: upserted.default_currency,
    });
    return NextResponse.json(upserted);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
