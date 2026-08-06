import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { notify } from "@/lib/notif/helper";

export const runtime = "nodejs";

/**
 * POST /api/invoices/[id]/record-payment
 *
 * Records a payment against an invoice:
 *   1. Looks up (or accepts) an `erp_bank_accounts` row for the tenant and
 *      inserts a credit `erp_bank_transactions` row carrying the amount,
 *      method, reference and date.
 *   2. Updates the invoice: status → "paid" (or "partial" when the amount is
 *      less than the outstanding total) and stamps `paid_at`.
 *   3. Fires an `invoice_paid` notification + audit log entry.
 *
 * Body:
 *   {
 *     amount: number,                // required, > 0
 *     method:  string,               // required — bank_transfer | cash | check | card | other
 *     reference?: string,            // optional — txn reference / cheque no.
 *     payment_date?: string,         // optional — ISO date (YYYY-MM-DD); defaults to today
 *     bank_account_id?: string       // optional — defaults to first active account
 *   }
 *
 * NOTE: the live `invoices` table has no payment_method/payment_reference/
 * payment_amount/bank_transaction_id columns, so those details are persisted
 * on the linked `erp_bank_transactions` row and in the audit log entry. A
 * future migration can mirror them onto the invoice for faster UI rendering.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    // Permission gate (invoices.update)
    {
      const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "invoices.update");
      if (_d) return _d;
    }
    // Feature gate (module_finance)
    {
      const { requireFeature } = await import("@/lib/api/feature-guard");
      const _f = await requireFeature(auth.tenantId, "module_finance", auth.isSuperAdmin);
      if (_f) return _f;
    }

    const tid = auth.tenantId;
    if (!tid) {
      return NextResponse.json({ error: "tenant_id is required." }, { status: 400 });
    }

    const { id } = await params;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { amount, method, reference, payment_date, bank_account_id } = body;

    // ── Validate input ───────────────────────────────────────────────────
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "A valid payment amount greater than zero is required." }, { status: 400 });
    }
    if (!method || typeof method !== "string") {
      return NextResponse.json({ error: "Payment method is required." }, { status: 400 });
    }
    const allowedMethods = new Set(["bank_transfer", "cash", "check", "card", "other"]);
    if (!allowedMethods.has(String(method).toLowerCase())) {
      return NextResponse.json({ error: `Unknown payment method: ${method}.` }, { status: 400 });
    }
    const paymentDateRaw = payment_date
      ? String(payment_date)
      : new Date().toISOString().slice(0, 10);
    // Accept either "YYYY-MM-DD" or full ISO; we store as timestamptz.
    const paymentDateIso = new Date(paymentDateRaw).toISOString();

    // ── Fetch invoice ────────────────────────────────────────────────────
    const invoice = await auth.store.getInvoice(id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    if (!auth.isSuperAdmin && invoice.tenant_id !== tid) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    if (invoice.status === "paid" || invoice.status === "cancelled") {
      return NextResponse.json(
        { error: `Invoice is already ${invoice.status} — no further payments can be recorded.` },
        { status: 409 }
      );
    }

    // ── Resolve bank account (required by erp_bank_transactions schema) ──
    let bankAccountId: string | null = bank_account_id || null;
    if (!bankAccountId) {
      try {
        const accounts = await auth.store.listErpBankAccounts(tid);
        const active = accounts.find((a) => a.is_active) || accounts[0];
        if (active) bankAccountId = active.id;
      } catch (e) {
        console.warn("[record-payment] listErpBankAccounts failed:", e);
      }
    }

    // ── Insert ERP bank transaction ──────────────────────────────────────
    let transactionId: string | null = null;
    if (bankAccountId) {
      try {
        const txn = await auth.store.upsertErpBankTransaction({
          tenant_id: tid,
          bank_account_id: bankAccountId,
          date: paymentDateIso,
          amount: numericAmount,
          transaction_type: "credit",
          description: `Payment for invoice ${invoice.number}`,
          reference: reference ? String(reference) : null,
          counterparty: invoice.partner_id || null,
          is_reconciled: false,
          reconciled_with: invoice.id,
          invoice_number: invoice.number,
          category: "invoice_payment",
          is_auto_generated: true,
        } as any);
        transactionId = (txn as any)?.id || null;
      } catch (e: any) {
        console.error("[record-payment] bank txn insert failed:", e);
        return NextResponse.json(
          { error: `Failed to record bank transaction: ${e.message || e}` },
          { status: 500 }
        );
      }
    } else {
      // No bank account on file — record a warning in the audit trail but
      // still proceed with the invoice status update so the workflow isn't
      // blocked on finance configuration.
      console.warn(
        `[record-payment] tenant ${tid} has no erp_bank_accounts — invoice ${invoice.number} marked paid without a bank txn.`
      );
    }

    // ── Update invoice status ────────────────────────────────────────────
    const invoiceTotal = Number(invoice.total ?? 0);
    const isFullPayment = numericAmount >= invoiceTotal - 0.01; // 1 cent tolerance
    const newStatus: string = isFullPayment ? "paid" : "partial";
    const nowIso = new Date().toISOString();

    try {
      await auth.store.upsertInvoice({
        id,
        status: newStatus as any,
        paid_at: nowIso,
      } as any);
    } catch (e: any) {
      console.error("[record-payment] invoice update failed:", e);
      return NextResponse.json(
        { error: `Failed to update invoice: ${e.message || e}` },
        { status: 500 }
      );
    }

    // ── Notification + audit ─────────────────────────────────────────────
    try {
      const partner = invoice.partner_id ? await auth.store.getPartner(invoice.partner_id) : null;
      const partnerName = partner?.name || "Client";
      await notify({
        tenantId: tid,
        userId: null,
        type: "invoice_paid",
        title: isFullPayment ? "Invoice Paid" : "Partial Payment Recorded",
        message:
          (isFullPayment ? "Payment recorded in full" : "Partial payment recorded") +
          ` for invoice ${invoice.number} (${partnerName}).` +
          (reference ? ` Ref: ${reference}.` : ""),
        entityType: "invoice",
        entityId: id,
        actionUrl: `/invoices?id=${id}`,
        actionLabel: "View Invoice",
      });
    } catch (e) {
      console.error("[record-payment] notification failed:", e);
    }

    // ── Cascade: mark pending commissions on the linked deal as approved ──
    // Issue #7 step 2: when an invoice is paid in full, the commissions on
    // the originating deal transition from "pending" → "approved" (a.k.a.
    // "earned"). We resolve deal_id via the invoice's offer link.
    if (isFullPayment && invoice.offer_id) {
      try {
        const offer = await auth.store.getOffer(invoice.offer_id);
        const dealId = (offer as any)?.deal_id;
        if (dealId) {
          const { markCommissionsEarnedOnInvoicePaid } = await import("@/lib/api/commission-cascade");
          markCommissionsEarnedOnInvoicePaid(dealId, tid).catch((e) =>
            console.warn("[record-payment] commission cascade failed:", e),
          );
        }
      } catch (e) {
        console.warn("[record-payment] commission cascade lookup failed:", e);
      }
    }

    try {
      await audit(auth.store, auth.user, req, "invoice.payment_recorded", "invoice", id, {
        amount: numericAmount,
        method,
        reference: reference || null,
        payment_date: paymentDateIso,
        transaction_id: transactionId,
        bank_account_id: bankAccountId,
        new_status: newStatus,
      });
    } catch (e) {
      console.error("[audit]", e);
    }

    return NextResponse.json({
      ok: true,
      status: newStatus,
      transaction_id: transactionId,
      bank_account_id: bankAccountId,
    });
  } catch (e: any) {
    console.error("[invoice.record-payment]", e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
