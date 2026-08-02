import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrApiKey, resolveTenantId, hasPermission, audit, type AuthContext, type ApiKeyAuthContext } from "@/lib/api/helpers";

export const runtime = "nodejs";

function getAuthUser(auth: AuthContext | ApiKeyAuthContext) {
  if ("user" in auth) return auth.user;
  return { id: `api:${auth.apiKeyId}`, username: auth.apiKeyName };
}

export async function GET(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
  const tid = resolveTenantId(auth, req);

  if ("apiKeyId" in auth && !hasPermission(auth.permissions, "offers:read")) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search") || undefined;
  const partner_id = url.searchParams.get("partner_id") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
  const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;
  const result = await auth.store.listOffers(tid!, { search, limit, offset, filters: { partner_id, status } });
  // Tenant isolation: PrismaStore.listOffers ignores _tenantId, so we
  // post-filter for non-super_admin (and for API keys, which are scoped to
  // their tenant).
  const shouldFilter = "apiKeyId" in auth || !auth.isSuperAdmin;
  if (shouldFilter && auth.tenantId) {
    const before = result.items.length;
    result.items = result.items.filter((o) => o.tenant_id === auth.tenantId);
    result.total = result.total - (before - result.items.length);
  }
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
  const tid = resolveTenantId(auth, req);

  if ("apiKeyId" in auth && !hasPermission(auth.permissions, "offers:write")) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  const body = await req.json();
  body.tenant_id = tid!;
  if (!body.owner_id && "user" in auth) body.owner_id = auth.user.id;
  // recompute totals from items if not provided
  if (Array.isArray(body.items) && body.items.length > 0 && body.total === undefined) {
    let subtotal = 0, discountTotal = 0, taxTotal = 0;
    for (const it of body.items) {
      const line = it.quantity * it.unit_price;
      const disc = line * (it.discount || 0) / 100;
      const net = line - disc;
      const tax = net * (it.tax_rate || 0) / 100;
      subtotal += line;
      discountTotal += disc;
      taxTotal += tax;
      it.total = net + tax;
    }
    body.subtotal = subtotal;
    body.discount_total = discountTotal;
    body.tax_total = taxTotal;
    body.total = subtotal - discountTotal + taxTotal;
  }
  const created = await auth.store.upsertOffer(body);
  await audit(auth.store, getAuthUser(auth), req, body.id ? "offer.update" : "offer.create", "offer", created.id, { number: created.number });
  return NextResponse.json(created);
}
