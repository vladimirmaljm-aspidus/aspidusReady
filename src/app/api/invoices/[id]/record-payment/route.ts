import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { notify } from "@/lib/notif/helper";
import { recordRevision } from "@/lib/api/doc-revisions";
import { validateStatusTransition } from "@/lib/api/status-validator";

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
    //
    // Fix 3 (Re-Audit-2 N1): we additionally filter `transaction_type = "credit"
    // and `category = "invoice_payment"` — without this filter, refunds (debits)
    // or manual adjustments are summed as positive contributions, inflating
    // `totalPaid` and marking the invoice "paid" prematurely.
    //
    // RACE NOTE (P1-7 / advisory lock): this cumulative lookup + subsequent
    // `upsertInvoice` is NOT atomic against concurrent record-payment calls
    // on the same invoice. Two simultaneous payments could both read the
    // same prior-txns snapshot, both compute "partial", and both write
    // "partial" — leaving a fully-paid invoice stuck in "partial" status.
    // Defense-in-depth currently relies on:
    //   1. The unique constraint on `erp_bank_transactions` (prevents dup rows
    //      if the client retries with identical reference + date).
    //   2. The cumulative SELECT re-runs on every call, so the *next* payment
    //      after a race will recompute correctly and flip the invoice to "paid".
    //   3. The journal-entry idempotency check below prevents double-booking.
    // A proper fix would wrap this block in a Postgres advisory lock (e.g.
    // `pg_advisory_xact_lock(hashtext(invoice_id))`) or move the cumulative
    // sum into a conditional `UPDATE ... SET status = CASE WHEN ... ` RPC.
    // Out of scope for this hotfix — documented for the next sprint.
    const invoiceTotal = Number(invoice.total ?? 0);
    let totalPaid = numericAmount; // include the payment we just recorded
    try {
      const { getSupabase } = await import("@/lib/supabase/client");
      const sb = getSupabase();
      const { data: priorTxns, error: txErr } = await sb
        .from("erp_bank_transactions")
        .select("amount")
        .eq("invoice_number", invoice.number)
        .eq("tenant_id", tid)
        .eq("transaction_type", "credit")
        .eq("category", "invoice_payment");
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

    // ── Validate status transition (P1-6) ───────────────────────────────
    // Enforce the invoice state machine BEFORE persisting the new status.
    // Without this, a "draft" invoice could be marked "paid" directly,
    // skipping the required "sent" step (e.g. when a clerk records a payment
    // against a draft they forgot to send). This guard applies to all
    // callers (including super-admins) because record-payment is a workflow
    // action, not a manual status correction — the super-admin bypass that
    // exists in the PUT /api/invoices/[id] handler is intentionally NOT
    // mirrored here.
    if (newStatus !== invoice.status) {
      const transitionError = validateStatusTransition("invoice", invoice.status, newStatus);
      if (typeof transitionError === "string") {
        return NextResponse.json({ error: transitionError }, { status: 409 });
      }
      if (transitionError && !transitionError.valid) {
        return NextResponse.json(
          { error: transitionError.error || "Invalid status transition." },
          { status: 409 },
        );
      }
    }

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
    //
    // Fix 2 (Re-Audit-2 N2): idempotency check — skip the cascade if the
    // proforma is already "paid". Two concurrent record-payment calls on the
    // same invoice would both fire this cascade, double-record the revision,
    // and double-audit. The `maybeSingle()` + `status === "paid"` guard makes
    // the second call a no-op.
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
          // Idempotency check: skip the cascade if the proforma is already
          // paid (a concurrent record-payment call beat us to it).
          const { data: proformaNow } = await sb
            .from("proformas")
            .select("id, status, tenant_id")
            .eq("id", proformaId)
            .eq("tenant_id", tid)
            .maybeSingle();

          if (proformaNow && (proformaNow as any).status === "paid") {
            console.log("[proforma auto-paid] already paid, skipping cascade");
          } else {
          // Fetch the BEFORE snapshot so we can record a proper revision.
          const { data: beforeProforma } = await sb
            .from("proformas")
            .select("*")
            .eq("id", proformaId)
            .eq("tenant_id", tid)
            .maybeSingle();

          const { data: updatedRows, error: updErr } = await sb
            .from("proformas")
            .update({
              status: "paid",
              paid_at: paidAtIso,
              updated_at: paidAtIso,
            })
            .eq("id", proformaId)
            .eq("tenant_id", tid)
            // Conditional update — only fire if status is not already "paid".
            // This is the second layer of idempotency (race-safe at the DB
            // layer: if the row flips to "paid" between our SELECT above and
            // this UPDATE, the WHERE clause returns 0 rows affected and we
            // skip the revision + audit).
            .neq("status", "paid")
            .select("id");
          if (updErr) {
            console.warn("[proforma auto-paid] update failed:", updErr.message);
          } else if (updatedRows && updatedRows.length > 0) {
            // Update succeeded → record revision + audit. The `updatedRows.length > 0`
            // guard prevents the double-fire when a concurrent call already
            // flipped the proforma to "paid" between our SELECT and UPDATE.
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
    //
    // Fix 2 (Re-Audit-2 N2): idempotency check — before inserting, we look
    // for an existing posted journal entry with `reference_type=invoice` +
    // `reference_id=<invoice id>`. Two concurrent record-payment calls on the
    // same invoice would both reach this block and insert two DR Bank / CR
    // Revenue entries → revenue double-counted. The check makes the second
    // call a no-op.
    //
    // Fix 11 (Re-Audit-2 N3): removed the `receivable_account_id` fallback —
    // crediting AR instead of Revenue is wrong for cash-basis. If
    // `revenue_account_id` is unset we skip cleanly.
    //
    // Fix 11b (Re-Audit-2 N16): `entry_number` now uses a crypto.randomUUID
    // suffix instead of `Date.now()` — concurrent calls in the same
    // millisecond would otherwise mint the same `entry_number`.
    if (newStatus === "paid") {
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const sb = getSupabase();

        // Idempotency check — bail if a posted journal entry already exists
        // for this invoice (concurrent record-payment call already fired).
        const { data: existingJE } = await sb
          .from("erp_journal_entries")
          .select("id, entry_number")
          .eq("reference_type", "invoice")
          .eq("reference_id", id)
          .eq("tenant_id", tid)
          .eq("status", "posted")
          .maybeSingle();

        if (existingJE) {
          console.log("[record-payment] journal entry already exists, skipping");
        } else {
        // Resolve the real erp_accounts IDs (FK-constrained, can't use string
        // literals like "bank" / "sales_revenue"). The settings row holds the
        // tenant's preferred accounts; if it's missing we abort cleanly.
        const { data: settings } = await sb
          .from("erp_settings")
          .select("cash_account_id, revenue_account_id, auto_post_journal, default_currency")
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
        // Re-Audit-2 N3: removed the `receivable_account_id` fallback.
        // Crediting AR instead of Revenue is wrong for cash-basis; if
        // `revenue_account_id` is unset, we skip the auto-journal cleanly.
        const revenueAccountId: string | null =
          (settings as any)?.revenue_account_id || null;

        // Fix 11: validate that the resolved account_ids actually exist in
        // erp_accounts before inserting — a stale settings row pointing at a
        // deleted account would otherwise produce a FK violation.
        let bankAccountValid = false;
        let revenueAccountValid = false;
        if (bankAccountIdResolved) {
          const { data: ba } = await sb
            .from("erp_accounts")
            .select("id")
            .eq("id", bankAccountIdResolved)
            .eq("tenant_id", tid)
            .maybeSingle();
          bankAccountValid = !!ba;
        }
        if (revenueAccountId) {
          const { data: ra } = await sb
            .from("erp_accounts")
            .select("id")
            .eq("id", revenueAccountId)
            .eq("tenant_id", tid)
            .maybeSingle();
          revenueAccountValid = !!ra;
        }

        if (bankAccountIdResolved && revenueAccountId && bankAccountValid && revenueAccountValid) {
          // Generate a unique journal entry number. The `get_next_doc_number`
          // RPC only supports offer/invoice/proforma, so we synthesize one.
          // Re-Audit-2 N16: use crypto.randomUUID() suffix instead of Date.now()
          // so concurrent calls in the same millisecond don't collide.
          const { randomUUID } = await import("node:crypto");
          const jeNumber = `PMT-${invoice.number}-${randomUUID().slice(0, 8)}`;
          const todayIso = new Date().toISOString().slice(0, 10);
          const jeCurrency = (invoice.currency as string) || (settings as any)?.default_currency || "USD";
          const shouldPost = Boolean((settings as any)?.auto_post_journal);

          // When this payment flips the invoice to "paid", book the FULL cumulative
          // revenue (totalPaid) — the prior partial payments were booked as advances
          // or were not booked at all. For partial payments that don't flip the
          // status, book only this payment's amount. (Audit finding E P0 #1.)
          const jeAmount = (newStatus === "paid") ? totalPaid : numericAmount;

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
              debit_total: jeAmount,
              credit_total: jeAmount,
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
                debit: jeAmount,
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
                credit: jeAmount,
                line_number: 2,
                currency: jeCurrency,
                partner_id: invoice.partner_id || null,
              },
            ]);
            if (linesError) {
              console.warn("[record-payment] auto journal lines insert failed:", linesError.message);
            }
          }
        } else {
          // Settings row missing or referenced accounts no longer exist —
          // log + skip silently so the payment workflow isn't blocked on
          // finance configuration.
          console.warn(
            "[record-payment] auto journal skipped: revenue_account_id unset or account_ids invalid",
            { bankAccountIdResolved, revenueAccountId, bankAccountValid, revenueAccountValid }
          );
        }
        } // end of `else` (no existing JE) branch
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
