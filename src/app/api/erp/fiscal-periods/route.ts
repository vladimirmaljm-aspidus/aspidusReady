import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, resolveTenantId, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// GET /api/erp/fiscal-periods — List fiscal periods
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });
  }

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const fiscal_year = url.searchParams.get("fiscal_year") || undefined;

    const result = await auth.store.listFiscalPeriods(tenantId, {
      search,
      filters: { status, fiscal_year },
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/erp/fiscal-periods — Create/update fiscal period (requires admin)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const created = await auth.store.upsertFiscalPeriod({ ...body, tenant_id: tenantId });
    await audit(auth.store, auth.user, req, body.id ? "fiscal_period.update" : "fiscal_period.create", "fiscal_period", created.id, {
      name: created.name,
      fiscal_year: created.fiscal_year,
    });
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
