import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * POST /api/trade-calculator/[id]/create-offer
 *
 * Creates a new offer from a saved trade calculation. Pre-fills:
 *   - partner_id (from calc.partner_id or body.partner_id)
 *   - currency (from calc.currency)
 *   - line item with product name, quantity, unit, sell price
 *   - incoterm, payment_terms, pol, pod
 *   - notes with cost breakdown summary
 *
 * Body (optional overrides):
 *   partner_id, valid_until, payment_terms, notes
 *
 * Returns the created offer.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant context." }, { status: 400 });

  const { id } = await params;
  const calc = await auth.store.getTradeCalculation(id);
  if (!calc) return NextResponse.json({ error: "Trade calculation not found." }, { status: 404 });

  let body: {
    partner_id?: string;
    valid_until?: string;
    payment_terms?: string;
    notes?: string;
  } = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  const partnerId = body.partner_id || (calc as any).partner_id;
  if (!partnerId) {
    return NextResponse.json(
      { error: "Partner ID is required. Specify a partner in the body or save the calculation with a partner." },
      { status: 400 }
    );
  }

  const currency = (calc as any).currency || "USD";
  const qty = (calc as any).quantity || 0;
  const unit = (calc as any).unit || "kg";
  const sellPrice = (calc as any).sell_price_per_unit || 0;
  const productName = (calc as any).product_name || (calc as any).name || "Product";
  const totalSell = (calc as any).total_sell_revenue || qty * sellPrice;
  const totalLanded = (calc as any).total_landed_cost || 0;
  const margin = (calc as any).gross_margin || 0;
  const marginPct = (calc as any).margin_percent || 0;

  // Build line item
  const items = [{
    product_id: (calc as any).product_id || null,
    product_name: productName,
    sku: (calc as any).product_sku || "",
    quantity: qty,
    unit,
    unit_price: sellPrice,
    discount: 0,
    tax_rate: 0,
    total: totalSell,
  }];

  // Build notes with cost breakdown
  const costLines = (calc as any).cost_lines || [];
  const costBreakdown = costLines.map((l: any) => `  • ${l.label || l.type}: ${currency} ${l.amount?.toFixed(2)}`).join("\n");
  const notes = body.notes || `Trade calculation: ${calc.name}
Product: ${productName}
Quantity: ${qty} ${unit}

Cost breakdown:
  • Buy cost: ${currency} ${((calc as any).total_buy_cost || 0).toFixed(2)}
${costBreakdown}
  • Total landed cost: ${currency} ${totalLanded.toFixed(2)}

Selling price: ${currency} ${sellPrice.toFixed(2)} / ${unit}
Total revenue: ${currency} ${totalSell.toFixed(2)}
Gross margin: ${currency} ${margin.toFixed(2)} (${marginPct.toFixed(1)}%)`;

  // Generate offer number
  const year = new Date().getFullYear();
  const existingOffers = await auth.store.listOffers(tenantId, { limit: 1000 });
  const yearOffers = existingOffers.items.filter((o: any) => o.number?.includes(`/${year}`));
  const nextNum = yearOffers.length + 1;
  const offerNumber = `${nextNum}/${year}`;

  const offerData: any = {
    tenant_id: tenantId,
    number: offerNumber,
    partner_id: partnerId,
    owner_id: auth.user.id,
    status: "draft",
    subject: `Offer for ${productName} — ${qty} ${unit}`,
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
  await audit(auth.store, auth.user, req, "offer.create_from_calc", "offer", created.id, {
    trade_calc_id: id,
    offer_number: created.number,
    total: created.total,
  });

  return NextResponse.json(created);
}
