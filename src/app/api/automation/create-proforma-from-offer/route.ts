import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * POST /api/automation/create-proforma-from-offer
 *
 * Auto-create a proforma from an offer:
 * - Copy all offer data
 * - Auto-generate proforma number
 * - Auto-fill all partner data
 *
 * Body: { offer_id: string }
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (dashboard.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "dashboard.create"); if (_d) return _d; } /* requirePermission wired */


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
    // Tenant ownership check
    if (!auth.isSuperAdmin && offer.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }

    // 2. Fetch partner data for auto-fill
    const partner = await store.getPartner(offer.partner_id);
    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found for this offer." },
        { status: 404 }
      );
    }

    // 3. Auto-generate proforma number
    const existingProformas = await store.listProformas(tid, { limit: 1 });
    const year = new Date().getFullYear();
    const nextSeq = existingProformas.total + 1;
    const proformaNumber = `PRO-${year}-${String(nextSeq).padStart(3, "0")}`;

    // 4. Calculate valid until (typically 30 days from now)
    const issueDate = new Date();
    const validUntil = new Date(issueDate);
    validUntil.setDate(validUntil.getDate() + 30);

    // 5. Build the proforma object
    const proformaData = {
      tenant_id: tid,
      number: proformaNumber,
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
      valid_until: validUntil.toISOString().split("T")[0],
      notes: offer.notes
        ? `Auto-generated from offer: ${offer.number}. ${offer.notes}`
        : `Auto-generated from offer: ${offer.number}`,
      items: offer.items,
    };

    // 6. Create the proforma
    const created = await store.upsertProforma(proformaData);

    // 7. Audit log
    await audit(
      store,
      auth.user,
      req,
      "automation.create_proforma_from_offer",
      "proforma",
      created.id,
      {
        offer_id: offer.id,
        offer_number: offer.number,
        proforma_number: created.number,
        partner_id: offer.partner_id,
        partner_name: partner.name,
        total: offer.total,
        currency: offer.currency,
      }
    );

    return NextResponse.json(created);
  } catch (e) {
    console.error("[automation/create-proforma-from-offer]", e);
    return NextResponse.json(
      { error: "Failed to create proforma from offer." },
      { status: 500 }
    );
  }
}
