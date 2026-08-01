import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import type { OfferLineItem } from "@/lib/supabase/types";

export const runtime = "nodejs";

/**
 * POST /api/automation/create-offer-from-deal
 *
 * Auto-create an offer from a deal:
 * - Copy deal partner, products, and pricing
 * - Auto-generate offer number
 * - Auto-fill all partner data
 * - Auto-calculate totals
 *
 * Body: { deal_id: string }
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const tid = auth.tenantId!;
  try {
    const body = await req.json();
    const { deal_id } = body;

    if (!deal_id) {
      return NextResponse.json(
        { error: "deal_id is required." },
        { status: 400 }
      );
    }

    const store = auth.store;

    // 1. Fetch the deal
    const deal = await store.getDeal(deal_id);
    if (!deal) {
      return NextResponse.json({ error: "Deal not found." }, { status: 404 });
    }

    // 2. Fetch partner data for auto-fill
    const partner = await store.getPartner(deal.partner_id);
    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found for this deal." },
        { status: 404 }
      );
    }

    // 3. Auto-generate offer number
    const existingOffers = await store.listOffers(tid, { limit: 1 });
    const year = new Date().getFullYear();
    const nextSeq = existingOffers.total + 1;
    const offerNumber = `OF-${year}-${String(nextSeq).padStart(3, "0")}`;

    // 4. Build offer items from deal data
    // Since deals don't have line items directly, we'll create a single line item
    // from the deal value as a placeholder
    const items: OfferLineItem[] = [
      {
        product_id: "",
        product_name: deal.title,
        sku: "",
        quantity: 1,
        unit: "pcs",
        unit_price: deal.value,
        discount: 0,
        tax_rate: 0,
        total: deal.value,
      },
    ];

    // 5. Calculate totals
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    for (const it of items) {
      const line = it.quantity * it.unit_price;
      const disc = line * (it.discount || 0) / 100;
      const net = line - disc;
      const tax = net * (it.tax_rate || 0) / 100;
      subtotal += line;
      discountTotal += disc;
      taxTotal += tax;
      it.total = net + tax;
    }

    const total = subtotal - discountTotal + taxTotal;

    // 6. Determine currency from partner preference or deal
    const currency = partner.preferred_currency || deal.currency;

    // 7. Build the offer object
    const offerData = {
      number: offerNumber,
      deal_id: deal.id,
      partner_id: deal.partner_id,
      owner_id: auth.user.id,
      status: "draft" as const,
      subject: `Offer for: ${deal.title}`,
      currency,
      subtotal,
      discount_total: discountTotal,
      tax_total: taxTotal,
      total,
      notes: `Auto-generated from deal: ${deal.title}`,
      terms: partner.preferred_payment_terms || null,
      valid_until: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      items,
    };

    // 8. Create the offer
    const created = await store.upsertOffer(offerData);

    // 9. Audit log
    await audit(
      store,
      auth.user,
      req,
      "automation.create_offer_from_deal",
      "offer",
      created.id,
      {
        deal_id: deal.id,
        deal_title: deal.title,
        offer_number: created.number,
        partner_id: deal.partner_id,
        partner_name: partner.name,
      }
    );

    return NextResponse.json(created);
  } catch (e) {
    console.error("[automation/create-offer-from-deal]", e);
    return NextResponse.json(
      { error: "Failed to create offer from deal." },
      { status: 500 }
    );
  }
}
