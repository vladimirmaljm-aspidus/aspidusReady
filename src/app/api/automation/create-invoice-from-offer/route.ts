import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * POST /api/automation/create-invoice-from-offer
 *
 * Auto-create an invoice from an accepted offer:
 * - Copy all offer data (partner, items, totals)
 * - Auto-generate invoice number
 * - Set due date based on payment terms
 * - Auto-fill all partner data
 *
 * Body: { offer_id: string }
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const tid = auth.tenantId!;
  try {
    const body = await req.json();
    const { offer_id } = body;

    if (!offer_id) {
      return NextResponse.json(
        { error: "offer_id is required." },
        { status: 400 }
      );
    }

    const store = auth.store;

    // 1. Fetch the offer
    const offer = await store.getOffer(offer_id);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }

    // 2. Verify the offer is in a valid state (accepted or sent)
    if (offer.status !== "accepted" && offer.status !== "sent") {
      return NextResponse.json(
        { error: `Cannot create invoice from offer with status "${offer.status}". Offer must be accepted or sent.` },
        { status: 400 }
      );
    }

    // 3. Fetch partner data for auto-fill
    const partner = await store.getPartner(offer.partner_id);
    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found for this offer." },
        { status: 404 }
      );
    }

    // 4. Auto-generate invoice number
    const existingInvoices = await store.listInvoices(tid, { limit: 1 });
    const year = new Date().getFullYear();
    const nextSeq = existingInvoices.total + 1;
    const invoiceNumber = `INV-${year}-${String(nextSeq).padStart(3, "0")}`;

    // 5. Calculate due date based on payment terms
    const issueDate = new Date();
    let dueDate = new Date(issueDate);

    // Parse payment terms to determine due date
    const paymentTerms = offer.terms || partner.preferred_payment_terms || "Net 30";
    const netMatch = paymentTerms.match(/Net\s+(\d+)/i);
    if (netMatch) {
      dueDate.setDate(dueDate.getDate() + parseInt(netMatch[1], 10));
    } else {
      // Default to 30 days
      dueDate.setDate(dueDate.getDate() + 30);
    }

    // 6. Build the invoice object
    const invoiceData = {
      tenant_id: tid,
      number: invoiceNumber,
      offer_id: offer.id,
      partner_id: offer.partner_id,
      status: "draft" as const,
      subject: offer.subject,
      currency: offer.currency,
      subtotal: offer.subtotal,
      discount_total: offer.discount_total,
      tax_total: offer.tax_total,
      total: offer.total,
      issue_date: issueDate.toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
      notes: offer.notes
        ? `Auto-generated from offer: ${offer.number}. ${offer.notes}`
        : `Auto-generated from offer: ${offer.number}`,
      items: offer.items,
    };

    // 7. Create the invoice
    const created = await store.upsertInvoice(invoiceData);

    // 8. Audit log
    await audit(
      store,
      auth.user,
      req,
      "automation.create_invoice_from_offer",
      "invoice",
      created.id,
      {
        offer_id: offer.id,
        offer_number: offer.number,
        invoice_number: created.number,
        partner_id: offer.partner_id,
        partner_name: partner.name,
        total: offer.total,
        currency: offer.currency,
      }
    );

    return NextResponse.json(created);
  } catch (e) {
    console.error("[automation/create-invoice-from-offer]", e);
    return NextResponse.json(
      { error: "Failed to create invoice from offer." },
      { status: 500 }
    );
  }
}
