import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * POST /api/automation/create-invoice-from-proforma
 *
 * Auto-create an invoice from an accepted proforma (linear flow:
 * Offer → Proforma → Invoice):
 *   - Copies all proforma data (partner, items, totals, trade fields)
 *   - Auto-generates invoice number (INV-YYYY-NNNN)
 *   - Sets due date based on payment terms (default: net 30)
 *   - Sets status to "draft"
 *   - Chains offer_id back to the original offer (when the proforma has one)
 *
 * Body: { proforma_id: string }
 *
 * NOTE: the live `invoices` table has no `proforma_id` column, so we link
 * back to the original `offer_id` instead (which the proforma already
 * carries). The downstream "invoice paid → proforma paid" cascade resolves
 * the proforma via that offer_id chain.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  // Permission gate (invoices.create)
  {
    const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "invoices.create");
    if (_d) return _d;
  }

  // Feature gate (module_finance)
  {
    const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_finance", auth.isSuperAdmin);
    if (_f) return _f;
  }

  const tid = resolveTenantId(auth, req);
  if (!tid) {
    return NextResponse.json({ error: "No tenant context." }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { proforma_id } = body;
  if (!proforma_id) {
    return NextResponse.json({ error: "proforma_id is required." }, { status: 400 });
  }

  try {
    const store = auth.store;

    // 1. Fetch the proforma (with tenant ownership check)
    const proforma = await store.getProforma(proforma_id);
    if (!proforma) {
      return NextResponse.json({ error: "Proforma not found." }, { status: 404 });
    }
    if (!auth.isSuperAdmin && proforma.tenant_id !== tid) {
      return NextResponse.json({ error: "Proforma not found." }, { status: 404 });
    }

    // 2. Verify proforma is in a valid state. Proformas don't have an
    //    "accepted" status — "sent" is the closest analog (the customer
    //    has received the proforma). We also allow invoicing from a "paid"
    //    proforma for retroactive record-keeping. Cast to string so TS
    //    doesn't complain about the missing "accepted" case.
    const pStatus = String(proforma.status) as string;
    if (pStatus !== "accepted" && pStatus !== "sent" && pStatus !== "paid") {
      return NextResponse.json(
        {
          error: `Cannot create invoice from proforma with status "${proforma.status}". Proforma must be sent (or paid) first.`,
        },
        { status: 400 },
      );
    }

    // 3. Check if an invoice already exists for this proforma.
    //    The `invoices` table has no `proforma_id` column, so we link via the
    //    shared `offer_id` (when present). When the proforma has no offer
    //    link, we fall back to checking by partner+subject to avoid dupes.
    const existingInvoices = await store.listInvoices(tid, { limit: 1000 });
    const pAny = proforma as any;
    const alreadyInvoiced =
      pAny.offer_id
        ? existingInvoices.items.find(
            (inv: any) => inv.offer_id === pAny.offer_id && inv.status !== "cancelled",
          )
        : existingInvoices.items.find(
            (inv: any) =>
              inv.partner_id === proforma.partner_id &&
              inv.subject === proforma.subject &&
              inv.status !== "cancelled",
          );
    if (alreadyInvoiced) {
      return NextResponse.json(
        {
          error: "Invoice already exists for this proforma.",
          existing_invoice_id: (alreadyInvoiced as any).id,
          existing_invoice_number: (alreadyInvoiced as any).number,
        },
        { status: 409 },
      );
    }

    // 4. Auto-generate invoice number (INV-YYYY-NNNN)
    const year = new Date().getFullYear();
    const nextSeq = existingInvoices.total + 1;
    const invoiceNumber = `INV-${year}-${String(nextSeq).padStart(4, "0")}`;

    // 5. Calculate due date based on payment terms (default: net 30)
    const issueDate = new Date();
    let dueDate = new Date(issueDate);
    const paymentTerms = (proforma as any).payment_terms || "net30";
    const netMatch = String(paymentTerms).match(/net\s*(\d+)/i);
    if (netMatch) {
      dueDate.setDate(dueDate.getDate() + parseInt(netMatch[1], 10));
    } else if (
      String(paymentTerms).toLowerCase().trim() === "immediate" ||
      String(paymentTerms).toLowerCase().trim() === "advance"
    ) {
      // Due immediately
    } else {
      dueDate.setDate(dueDate.getDate() + 30);
    }

    // 6. Enforce monthly_documents quota (parity with POST /api/invoices)
    {
      const { enforceQuota } = await import("@/lib/api/plan-limits");
      const denied = await enforceQuota(tid, "monthly_documents", auth.isSuperAdmin);
      if (denied) return denied;
    }

    // 7. Build the invoice object. Copy partner/items/totals + the trade
    //    fields that exist on both `proformas` and `invoices` tables.
    //    Skip `bank_details`/`terms` (offers-only columns) and
    //    `proforma_id` (no such column on invoices).
    const invoiceData: Record<string, unknown> = {
      tenant_id: tid,
      number: invoiceNumber,
      partner_id: proforma.partner_id,
      offer_id: proforma.offer_id, // chain back to the original offer
      subject: proforma.subject,
      currency: proforma.currency,
      items: proforma.items,
      subtotal: proforma.subtotal,
      discount_total: proforma.discount_total,
      tax_total: proforma.tax_total,
      total: proforma.total,
      status: "draft",
      issue_date: issueDate.toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
      payment_terms: (proforma as any).payment_terms ?? null,
      incoterm: (proforma as any).incoterm ?? null,
      pol: (proforma as any).pol ?? null,
      pod: (proforma as any).pod ?? null,
      vessel: (proforma as any).vessel ?? null,
      container_no: (proforma as any).container_no ?? null,
      lead_time: (proforma as any).lead_time ?? null,
      packaging: (proforma as any).packaging ?? null,
      notes: `Auto-generated from proforma: ${proforma.number}${
        proforma.notes ? `. ${proforma.notes}` : ""
      }`,
    };

    // 8. Create the invoice
    const created = await store.upsertInvoice(invoiceData as any);

    // 9. Audit log
    await audit(
      store,
      auth.user,
      req,
      "automation.create_invoice_from_proforma",
      "invoice",
      created.id,
      {
        proforma_id: proforma.id,
        proforma_number: proforma.number,
        invoice_number: created.number,
        partner_id: proforma.partner_id,
        offer_id: proforma.offer_id,
        total: proforma.total,
        currency: proforma.currency,
      },
    );

    return NextResponse.json(created);
  } catch (e: any) {
    console.error("[automation/create-invoice-from-proforma]", e);
    return NextResponse.json(
      { error: e?.message || "Failed to create invoice from proforma." },
      { status: 500 },
    );
  }
}
