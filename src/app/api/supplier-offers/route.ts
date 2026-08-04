import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (supplier-offers.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "supplier-offers.read"); if (_d) return _d; } /* requirePermission wired */

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant context." }, { status: 400 });
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || undefined;
  const product_id = url.searchParams.get("product_id") || undefined;
  const supplier_id = url.searchParams.get("supplier_id") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const result = await auth.store.listSupplierOffers(tenantId, { search, filters: { product_id, supplier_id, status } });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  // Permission gate (supplier-offers.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "supplier-offers.create"); if (_d) return _d; } /* requirePermission wired */

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant context." }, { status: 400 });
  const body = await req.json();
  body.tenant_id = tenantId;
  const created = await auth.store.upsertSupplierOffer(body);
  await audit(auth.store, auth.user, req, body.id ? "supplier_offer.update" : "supplier_offer.create", "supplier_offer", created.id, {});
  return NextResponse.json(created);
}
