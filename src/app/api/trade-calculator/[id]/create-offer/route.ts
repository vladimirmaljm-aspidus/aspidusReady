import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAuthOrApiKey, audit, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * POST /api/trade-calculator/[id]/create-offer
 *
 * Creates a new offer from a saved trade calculation.
 *
 * CRITICAL RULES:
 *   1. Product name MUST come from the product catalog entry (not calc.name)
 *   2. Buy cost, landed cost, margin — NEVER included in the offer (internal only)
 *   3. Offer notes contain only client-facing info (product specs, origin, delivery)
 *   4. Subject uses the actual product name, not the calc name
 *
 * Pre-fills:
 *   - partner_id (from calc.partner_id or calc.buyer_id or body.partner_id)
 *   - currency, quantity, unit, sell price
 *   - product name, specs, origin country from the catalog entry
 *   - incoterm, payment_terms, pol, pod
 *
 * Body (optional overrides):
 *   partner_id, valid_until, payment_terms, notes
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
    // Permission gate (trade-calculator.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "trade-calculator.create"); if (_d) return _d; } } /* requirePermission wired */
  // Feature gate (module_trade)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _tid = ("apiKeyId" in auth) ? auth.tenantId : auth.tenantId;
    const _isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const _f = await requireFeature(_tid, "module_trade", _isSA); if (_f) return _f; } /* requireFeature wired */

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant context." }, { status: 400 });

  const { id } = await params;
  const calc = await auth.store.getTradeCalculation(id);
  if (!calc) return NextResponse.json({ error: "Trade calculation not found." }, { status: 404 });
  // Tenant ownership check (for session auth — API keys are always scoped to their tenant)
  if ("user" in auth && !auth.isSuperAdmin && (calc as any).tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Trade calculation not found." }, { status: 404 });
  }

  let body: {
    partner_id?: string;
    valid_until?: string;
    payment_terms?: string;
    notes?: string;
  } = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  // Resolve partner_id — check body, then calc.partner_id, then calc.buyer_id
  const partnerId = body.partner_id || (calc as any).partner_id || (calc as any).buyer_id;
  if (!partnerId) {
    return NextResponse.json(
      { error: "Partner ID is required. Specify a partner in the body or save the calculation with a buyer/partner." },
      { status: 400 }
    );
  }

  const currency = (calc as any).currency || "USD";
  const qty = (calc as any).quantity || 0;
  const unit = (calc as any).unit || "kg";
  const sellPrice = (calc as any).sell_price_per_unit || 0;
  const totalSell = (calc as any).total_sell_revenue || qty * sellPrice;

  // ── Fetch the product catalog entry for REAL product data ────────────
  // The calc stores product_id (catalog entry id) — use it to get the actual
  // product name, specifications, origin country, HS code, etc.
  let productName = "Product";
  let productSku = "";
  let productHsCode: string | null = null;
  let productOrigin: string | null = null;
  let productSpecs: any = null;
  let productCategory: string | null = null;

  const productId = (calc as any).product_id || (calc as any).product_catalog_id;
  if (productId) {
    try {
      const catalogEntry = await auth.store.getProductCatalogEntry(productId);
      if (catalogEntry) {
        productName = catalogEntry.name;
        productHsCode = catalogEntry.hs_code;
        productOrigin = catalogEntry.origin_country;
        productSpecs = catalogEntry.specifications;
        productCategory = catalogEntry.category;
      }
    } catch { /* ignore — fallback to calc data */ }
  }

  // Fallback: if no catalog entry, use calc.product_name (NOT calc.name)
  if (productName === "Product" && (calc as any).product_name) {
    productName = (calc as any).product_name;
  }

  // Build line item with real product data
  const items = [{
    product_id: productId || null,
    product_name: productName,
    sku: productSku,
    quantity: qty,
    unit,
    unit_price: sellPrice,
    discount: 0,
    tax_rate: 0,
    total: totalSell,
  }];

  // ── Build CLIENT-FACING notes ────────────────────────────────────────
  // NEVER include buy cost, landed cost, or margin — those are internal.
  // Only include product info, specifications, origin, delivery terms.
  let notes = body.notes || "";
  if (!notes) {
    const specLines: string[] = [];
    if (productSpecs) {
      const rawSpecs = productSpecs as unknown;
      if (Array.isArray(rawSpecs)) {
        for (const s of rawSpecs as { name: string; value: string }[]) {
          specLines.push(`  ${s.name}: ${s.value}`);
        }
      } else if (typeof rawSpecs === "object" && rawSpecs !== null) {
        for (const [k, v] of Object.entries(rawSpecs as Record<string, string>)) {
          specLines.push(`  ${k}: ${v}`);
        }
      }
    }

    notes = [
      `Product: ${productName}`,
      productHsCode ? `HS Code: ${productHsCode}` : null,
      productOrigin ? `Origin: ${productOrigin}` : null,
      productCategory ? `Category: ${productCategory}` : null,
      `Quantity: ${qty} ${unit}`,
      specLines.length > 0 ? `\nSpecifications:\n${specLines.join("\n")}` : null,
      (calc as any).incoterm ? `\nIncoterm: ${(calc as any).incoterm}` : null,
      (calc as any).pol ? `Loading port: ${(calc as any).pol}` : null,
      (calc as any).pod ? `Discharge port: ${(calc as any).pod}` : null,
      (calc as any).lead_time ? `Lead time: ${(calc as any).lead_time}` : null,
      (calc as any).packaging ? `Packaging: ${(calc as any).packaging}` : null,
    ].filter(Boolean).join("\n");
  }

  // Generate offer number
  const year = new Date().getFullYear();
  const existingOffers = await auth.store.listOffers(tenantId, { limit: 1000 });
  const yearOffers = existingOffers.items.filter((o: any) => o.number?.includes(`/${year}`));
  const nextNum = yearOffers.length + 1;
  const offerNumber = `${nextNum}/${year}`;

  // Subject uses the actual product name (NOT calc.name)
  const subject = `Offer: ${productName} — ${qty} ${unit}`;

  const offerData: any = {
    tenant_id: tenantId,
    number: offerNumber,
    partner_id: partnerId,
    owner_id: "user" in auth ? auth.user.id : null,
    status: "draft",
    subject,
    currency,
    subtotal: totalSell,
    discount_total: 0,
    tax_total: 0,
    total: totalSell,
    items,
    notes,
    valid_until: body.valid_until || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    payment_terms: body.payment_terms || (calc as any).payment_terms || "T/T in Advance",
    incoterm: (calc as any).incoterm || "CIF",
    pol: (calc as any).pol || null,
    pod: (calc as any).pod || null,
  };

  const created = await auth.store.upsertOffer(offerData);
  const auditUser = "user" in auth ? auth.user : { id: auth.apiKeyId, username: auth.apiKeyName, tenant_id: auth.tenantId };
  await audit(auth.store, auditUser, req, "offer.create_from_calc", "offer", created.id, {
    trade_calc_id: id,
    offer_number: created.number,
    product_name: productName,
    total: created.total,
  });

  return NextResponse.json(created);
}
