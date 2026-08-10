import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { notify } from "@/lib/notif/helper";
import { recordRevision } from "@/lib/api/doc-revisions";

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

    // ── Update invoice status (cumulative total check) ──────────────────
    // The "paid vs partial" decision MUST be based on the SUM of all
    // payments recorded against this invoice — not the single payment amount
    // we just received. Otherwise two $500 payments on a $1000 invoice both
    // register as "partial" and the invoice never reaches "paid".
    //
    // We resolve prior payments via `erp_bank_transactions` filtered by the
    // invoice's `number` + `tenant_id` (this is exactly how the
    // create-bank-txn step above tags the row).
    const invoiceTotal = Number(invoice.total ?? 0);
    let totalPaid = numericAmount; // include the payment we just recorded
    try {
      const { getSupabase } = await import("@/lib/supabase/client");
      const sb = getSupabase();
      const { data: priorTxns, error: txErr } = await sb
        .from("erp_bank_transactions")
        .select("amount")
        .eq("invoice_number", invoice.number)
        .eq("tenant_id", tid);
      if (txErr) {
        console.warn("[record-payment] cumulative lookup failed:", txErr.message);
      } else if (priorTxns && priorTxns.length > 0) {
        totalPaid = (priorTxns as Array<{ amount: number | string }>).reduce(
          (sum, t) => sum + Number(t.amount || 0),
          0,
        );
      }
    } catch (e) {
      console.warn("[record-payment] cumulative lookup threw:", e);
    }

    const isFullPayment = totalPaid >= invoiceTotal - 0.01; // 1 cent tolerance
    const newStatus: string = isFullPayment ? "paid" : "partial";
    const nowIso = new Date().toISOString();

    try {
      // Only stamp `paid_at` when transitioning to "paid". On a partial
      // payment we preserve any existing `paid_at` (which should be null,
      // but we don't want to overwrite a prior "paid" mark if the invoice
      // is somehow re-opened later).
      const patch: { id: string; status: any; paid_at?: string; updated_at: string } = {
        id,
        status: newStatus as any,
        updated_at: nowIso,
      };
      if (isFullPayment) {
        patch.paid_at = nowIso;
      }
      await auth.store.upsertInvoice(patch as any);
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

    // ── Cascade: auto-mark the linked proforma as paid ──────────────────
    // Linear flow: Offer → Proforma → Invoice. When the invoice is paid in
    // full, the originating proforma should also be marked "paid".
    //
    // The `invoices` table has no `proforma_id` column, so we resolve the
    // linked proforma via:
    //   1. `invoice.proforma_id` if it ever exists (forward-compat), else
    //   2. the most recent non-paid proforma linked to `invoice.offer_id`
    //      (skipped when offer_id is null — no way to know which proforma).
    if (isFullPayment) {
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const sb = getSupabase();
        const paidAtIso = nowIso;

        let proformaId: string | null = (invoice as any).proforma_id || null;

        if (!proformaId && invoice.offer_id) {
          // Resolve the latest "accepted"/"sent" proforma linked to the
          // same offer — that's almost certainly the one this invoice was
          // generated from.
          const { data: linked, error: lErr } = await sb
            .from("proformas")
            .select("id, status, tenant_id")
            .eq("offer_id", invoice.offer_id)
            .eq("tenant_id", tid)
            .order("created_at", { ascending: false })
            .limit(5);
          if (lErr) {
            console.warn("[proforma auto-paid] lookup failed:", lErr.message);
          } else if (linked && linked.length > 0) {
            // Prefer a non-paid one; fall back to the most recent overall.
            const target =
              linked.find((p: any) => p.status !== "paid" && p.status !== "expired") ||
              linked[0];
            proformaId = target?.id || null;
          }
        }

        if (proformaId) {
          // Fetch the BEFORE snapshot so we can record a proper revision.
          const { data: beforeProforma } = await sb
            .from("proformas")
            .select("*")
            .eq("id", proformaId)
            .eq("tenant_id", tid)
            .maybeSingle();

          const { error: updErr } = await sb
            .from("proformas")
            .update({
              status: "paid",
              paid_at: paidAtIso,
              updated_at: paidAtIso,
            })
            .eq("id", proformaId)
            .eq("tenant_id", tid);
          if (updErr) {
            console.warn("[proforma auto-paid] update failed:", updErr.message);
          } else {
            // Fetch the AFTER snapshot for the revision diff.
            const { data: afterProforma } = await sb
              .from("proformas")
              .select("*")
              .eq("id", proformaId)
              .eq("tenant_id", tid)
              .maybeSingle();

            // Record revision (auto-versioning) — fire-and-forget.
            recordRevision({
              docType: "proforma",
              documentId: proformaId,
              tenantId: tid,
              before: (beforeProforma as Record<string, unknown>) || {},
              after: (afterProforma as Record<string, unknown>) || {},
              userId: auth.user.id,
              username: auth.user.username,
              changeNote: `Auto-marked paid when invoice ${invoice.number} was paid`,
            }).catch((e) => console.warn("[proforma auto-paid] revision:", e));

            // Audit the cascade so we have a paper trail.
            audit(
              auth.store,
              auth.user,
              req,
              "proforma.auto_paid_from_invoice",
              "proforma",
              proformaId,
              {
                invoice_id: id,
                invoice_number: invoice.number,
                paid_at: paidAtIso,
              },
            ).catch(() => {});
          }
        }
      } catch (e) {
        console.error("[proforma auto-paid] failed:", e);
      }
    }

    // ── Cascade: auto-create a balanced journal entry for the payment ────
    // When the invoice transitions to "paid", we record a DR Bank / CR Revenue
    // entry so finance reports reflect the cash received. The lines use the
    // tenant's ERP chart-of-accounts — we resolve `cash_account_id` (or fall
    // back to the linked bank account's `account_id`) for the debit, and
    // `revenue_account_id` for the credit. Skipped silently if the tenant has
    // not configured ERP accounts yet (e.g. ERP module not initialized).
    if (newStatus === "paid") {
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const sb = getSupabase();

        // Resolve the real erp_accounts IDs (FK-constrained, can't use string
        // literals like "bank" / "sales_revenue"). The settings row holds the
        // tenant's preferred accounts; if it's missing we abort cleanly.
        const { data: settings } = await sb
          .from("erp_settings")
          .select("cash_account_id, revenue_account_id, receivable_account_id, auto_post_journal, default_currency")
          .eq("tenant_id", tid)
          .maybeSingle();

        let bankAccountIdResolved: string | null = (settings as any)?.cash_account_id || null;
        if (!bankAccountIdResolved && bankAccountId) {
          // Fall back to the erp_bank_accounts row used for the payment.
          const { data: ba } = await sb
            .from("erp_bank_accounts")
            .select("account_id")
            .eq("id", bankAccountId)
            .maybeSingle();
          if (ba?.account_id) bankAccountIdResolved = (ba as any).account_id;
        }
        const revenueAccountId: string | null =
          (settings as any)?.revenue_account_id || (settings as any)?.receivable_account_id || null;

        if (bankAccountIdResolved && revenueAccountId) {
          // Generate a unique journal entry number. The `get_next_doc_number`
          // RPC only supports offer/invoice/proforma, so we synthesize one.
          const jeNumber = `PMT-${invoice.number}-${Date.now()}`;
          const todayIso = new Date().toISOString().slice(0, 10);
          const jeCurrency = (invoice.currency as string) || (settings as any)?.default_currency || "USD";
          const shouldPost = Boolean((settings as any)?.auto_post_journal);

          const { data: je, error: jeError } = await sb
            .from("erp_journal_entries")
            .insert({
              tenant_id: tid,
              entry_number: jeNumber,
              date: todayIso,
              description: `Auto-journal for invoice ${invoice.number} payment`,
              reference_type: "invoice",
              reference_id: id,
              status: shouldPost ? "posted" : "draft",
              source_type: "auto",
              debit_total: numericAmount,
              credit_total: numericAmount,
              currency: jeCurrency,
              exchange_rate: 1,
              created_by: auth.user.id,
              posted_by: shouldPost ? auth.user.id : null,
              posted_at: shouldPost ? new Date().toISOString() : null,
            })
            .select()
            .maybeSingle();

          if (jeError) {
            console.warn("[record-payment] auto journal header insert failed:", jeError.message);
          } else if (je) {
            const { error: linesError } = await sb.from("erp_journal_lines").insert([
              {
                journal_entry_id: (je as any).id,
                tenant_id: tid,
                account_id: bankAccountIdResolved,
                description: `Payment received - ${invoice.number}`,
                debit: numericAmount,
                credit: 0,
                line_number: 1,
                currency: jeCurrency,
                partner_id: invoice.partner_id || null,
              },
              {
                journal_entry_id: (je as any).id,
                tenant_id: tid,
                account_id: revenueAccountId,
                description: `Revenue - ${invoice.number}`,
                debit: 0,
                credit: numericAmount,
                line_number: 2,
                currency: jeCurrency,
                partner_id: invoice.partner_id || null,
              },
            ]);
            if (linesError) {
              console.warn("[record-payment] auto journal lines insert failed:", linesError.message);
            }
          }
        }
      } catch (e) {
        console.error("[record-payment] auto journal failed:", e);
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
