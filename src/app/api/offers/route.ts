import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrApiKey, resolveTenantId, hasPermission, audit, type AuthContext, type ApiKeyAuthContext } from "@/lib/api/helpers";

export const runtime = "nodejs";

function getAuthUser(auth: AuthContext | ApiKeyAuthContext) {
  if ("user" in auth) return auth.user;
  return { id: `api:${auth.apiKeyId}`, username: auth.apiKeyName, tenant_id: auth.tenantId };
}

export async function GET(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
    // Permission gate (offers.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "offers.read"); if (_d) return _d; } } /* requirePermission wired */

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
  // Permission gate (offers.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "offers.create"); if (_d) return _d; } } /* requirePermission wired */

  const tid = resolveTenantId(auth, req);

  if ("apiKeyId" in auth && !hasPermission(auth.permissions, "offers:write")) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  body.tenant_id = tid!;
  if (!body.owner_id && "user" in auth) body.owner_id = auth.user.id;
  // Always recompute totals from items when items are provided — never trust
  // client-supplied totals (FLOW-7: previously skipped when body.total was
  // present, allowing tampered totals to disagree with line items).
  if (Array.isArray(body.items) && body.items.length > 0) {
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
  if (!body.id) {
    const isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const { enforceQuota } = await import("@/lib/api/plan-limits");
    const denied = await enforceQuota(body.tenant_id, "monthly_documents", isSA);
    if (denied) return denied;
  }

  // Auto-generate document number if not provided (e.g. manual "Create" click).
  // Matches the format used by /api/automation/create-offer-from-deal:
  //   OF-<year>-<NNN>  (3-digit sequence, total+1)
  if (!body.id && !body.number) {
    const year = new Date().getFullYear();
    try {
      const existing = await auth.store.listOffers(tid!, { limit: 1 });
      const nextSeq = (existing.total || 0) + 1;
      body.number = `OF-${year}-${String(nextSeq).padStart(3, "0")}`;
    } catch (e) {
      console.error("[offers.post] number auto-gen failed:", e);
      return NextResponse.json({ error: "Failed to auto-generate offer number." }, { status: 500 });
    }
  }

  let created;
  try {
    created = await auth.store.upsertOffer(body);
  } catch (e: any) {
    // Retry once with bumped sequence in case of unique-collision race.
    if (!body.id && body.number) {
      try {
        const m = body.number.match(/^(OF-\d{4}-)(\d+)$/);
        if (m) {
          body.number = `${m[1]}${String(Number(m[2]) + 1).padStart(3, "0")}`;
          created = await auth.store.upsertOffer(body);
        } else {
          throw e;
        }
      } catch (e2: any) {
        console.error("[offers.post] upsert retry failed:", e2);
        return NextResponse.json({ error: e2.message || "Failed to create offer." }, { status: 500 });
      }
    } else {
      console.error("[offers.post] upsert failed:", e);
      return NextResponse.json({ error: e.message || "Failed to create offer." }, { status: 500 });
    }
  }
  await audit(auth.store, getAuthUser(auth), req, body.id ? "offer.update" : "offer.create", "offer", created.id, { number: created.number });
  return NextResponse.json(created);
}
