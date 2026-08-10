# Deep Logic Audit — API Routes

**Audit agent**: `api-logic-auditor`
**Date**: 2025-08-10
**Codebase**: `/home/z/aspidusReady/`
**Method**: Read-only inspection of all 212 `route.ts` files + supporting libs (`lib/api/*`, `lib/data/*`, `lib/auth/*`, `lib/portal/*`, `lib/kyc/*`, `lib/email/*`, `lib/upload/*`).

---

## Summary

| Severity | Count | Description |
|---|---|---|
| **P0** | 3 | Data corruption / loss / security hole |
| **P1** | 11 | Business logic error (wrong status, wrong calculation, wrong data saved) |
| **P2** | 9 | Missing validation (could accept invalid data) |
| **Total** | **23** | High-impact findings only |

Routes audited: **212 / 212** (top ~50 in detail, the rest spot-checked for the same patterns).

---

## P0 — Data Corruption / Loss / Security

### P0-1 — `invoices/[id]/record-payment` — partial payments never mark invoice as "paid"

- **File**: `src/app/api/invoices/[id]/record-payment/route.ts:150-151`
- **Issue**: The "paid vs partial" decision is computed per-call from the *single* payment amount, not from the *cumulative* total paid:
  ```ts
  const invoiceTotal = Number(invoice.total ?? 0);
  const isFullPayment = numericAmount >= invoiceTotal - 0.01; // 1 cent tolerance
  const newStatus: string = isFullPayment ? "paid" : "partial";
  ```
  For a $1000 invoice, two $500 payments both register as `"partial"` — the invoice never reaches `"paid"`. Each new payment also overwrites `paid_at` (so the timestamp drifts) but no `amount_paid` accumulator is stored on the invoice row.
- **Impact**:
  - `markCommissionsEarnedOnInvoicePaid(dealId, tid)` only fires when `isFullPayment` is true (line 194). So commissions stay `"pending"` forever on any invoice paid in instalments — agents are never credited for partially-paid invoices, even when the invoice is in fact fully settled across multiple calls.
  - The "auto-mark linked proforma as paid" cascade (line 218) also keys off `isFullPayment` — proforma stays `"accepted"`/`"sent"` even after the invoice is fully settled.
  - Dashboards / overdue reports keep showing the invoice as outstanding.
- **Fix**:
  ```ts
  // Track cumulative paid amount via erp_bank_transactions linked to this invoice
  const txns = await auth.store.listErpBankTransactions(tid, undefined, {
    search: undefined,
    filters: { invoice_id: id } as any,
  });
  const totalPaid = txns.items
    .filter(t => t.reconciled_with === id || t.invoice_number === invoice.number)
    .reduce((s, t) => s + Number(t.amount || 0) * (t.transaction_type === "credit" ? 1 : -1), 0);
  const isFullPayment = totalPaid >= invoiceTotal - 0.01;
  ```
  Alternatively, add an `amount_paid` column on `invoices` and increment it atomically.

---

### P0-2 — `trade-calculator/[id]/create-offer` — broken fallback produces duplicate offer numbers

- **File**: `src/app/api/trade-calculator/[id]/create-offer/route.ts:158-162`
- **Issue**: When the `get_next_doc_number` Postgres RPC is unavailable (e.g. migration 004 not applied, or Supabase blip), the fallback uses a wrong filter pattern:
  ```ts
  const existingOffers = await auth.store.listOffers(tenantId, { limit: 1000 });
  const yearOffers = existingOffers.items.filter((o: any) =>
    o.number?.includes(`/${year}`));        // ← BUG: looks for "/2025"
  const nextSeq = yearOffers.length + 1;     // ← always 1
  offerNumber = formatDocNumber("offer", year, nextSeq); // → "OF-2025-0001"
  ```
  The canonical format produced by `formatDocNumber` is `OF-2025-0001` (dashes, not slashes). So `o.number?.includes("/2025")` always returns false → `yearOffers.length === 0` → `nextSeq === 1` → every fallback attempt generates `OF-2025-0001`.
- **Impact**:
  - First call: `OF-2025-0001` succeeds.
  - Second call: same number → unique constraint violation → **500 error, no retry** (unlike `POST /api/offers`, `POST /api/invoices`, `POST /api/proformas` which all retry once with `+1`).
  - When the SEQUENCE RPC is down, **every trade-calc → offer conversion after the first one fails**.
- **Fix**: Replace the buggy filter with a dash match, list *all* offers (not just 1000), and add the same retry-on-collision loop used by the other three routes:
  ```ts
  const existingOffers = await auth.store.listOffers(tenantId, { limit: 100000 });
  const yearOffers = existingOffers.items.filter((o: any) =>
    typeof o.number === "string" && o.number.startsWith(`OF-${year}-`));
  const nextSeq = yearOffers.length + 1;
  offerNumber = formatDocNumber("offer", year, nextSeq);
  // … then on upsert catch, retry once with bumped sequence — same pattern as /api/offers POST.
  ```

---

### P0-3 — `portal/rfqs` — per-partner numbering + non-atomic read-then-write = duplicate RFQ numbers across tenants and partners

- **File**: `src/app/api/portal/rfqs/route.ts:48-52`
- **Issue**:
  ```ts
  const year = new Date().getFullYear();
  const existingRfqs = await store.listPortalRfqsByPartner(access.partner_id);
  const yearRfqs = existingRfqs.filter((r: any) => r.number?.includes(`RFQ-${year}`));
  const nextNum = yearRfqs.length + 1;
  body.number = `RFQ-${year}-${String(nextNum).padStart(3, "0")}`;
  ```
  Three problems:
  1. `listPortalRfqsByPartner` is per-partner, so **two different partners** in the same tenant both get `RFQ-2026-001` — duplicates inside the tenant. RFQ numbers should be tenant-wide unique.
  2. `nextNum = yearRfqs.length + 1` is a **non-atomic read-then-write**. Two concurrent portal submissions from the same partner both read `length=0`, both compute `nextNum=1`, both insert `RFQ-2026-001`. The unique constraint (if any) either rejects one — or, if there isn't one, both succeed and you have a duplicate.
  3. If a partner deletes an old RFQ, the count drops and the next creation re-uses a previously issued number — re-issuing an old RFQ number is a compliance smell.
  4. `padStart(3, "0")` overflows at 1000 RFQs/year — the 1001st RFQ becomes `RFQ-2026-1000` (4 digits) and breaks the format assumption.
- **Impact**: RFQ numbers are used in audit logs, offer→RFQ linkages, and portal client-facing emails. Duplicates break audit trail integrity and create confusion in customer communications.
- **Fix**: Use the same `nextDocNumber` Postgres SEQUENCE wrapper that offers/invoices/proformas use. Add a `DocType = "rfq"` variant to `lib/api/doc-number.ts` and the `get_next_doc_number` SQL function, then call `nextDocNumber("rfq")` here. Fall back to `listPortalRfqs(tenantId).total + 1` (tenant-wide, not partner-scoped) with a retry-on-collision loop.

---

## P1 — Business Logic Errors

### P1-1 — `invoices/[id]` PUT does not recompute totals from line items

- **File**: `src/app/api/invoices/[id]/route.ts:46-47`
- **Issue**: The offers PUT (line 48-64) has the `FLOW-7` fix that recomputes `subtotal`, `discount_total`, `tax_total`, `total` from the items array before saving. The invoices PUT does **not** — it passes `body` straight through:
  ```ts
  const body = await req.json();
  const updated = await auth.store.upsertInvoice({ ...body, id, tenant_id: existing.tenant_id });
  ```
  So a client (or a tampered request) can send `items: [{…$500 line…}]` together with `total: 99999` and the invoice is saved with the wrong total. Same defect in `proformas/[id]/route.ts:46-47`.
- **Impact**: Invoice totals can disagree with the sum of line items → wrong PDF, wrong accounting journal entries (`autoJournalFromInvoice`), wrong commission calculations, wrong tax declarations.
- **Fix**: Replicate the offers PUT recompute block in both invoices and proformas PUT handlers:
  ```ts
  if (Array.isArray(body.items) && body.items.length > 0) {
    let subtotal = 0, discountTotal = 0, taxTotal = 0;
    for (const it of body.items) {
      const line = it.quantity * it.unit_price;
      const disc = line * (it.discount || 0) / 100;
      const net = line - disc;
      const tax = net * (it.tax_rate || 0) / 100;
      subtotal += line; discountTotal += disc; taxTotal += tax;
      it.total = net + tax;
    }
    body.subtotal = subtotal;
    body.discount_total = discountTotal;
    body.tax_total = taxTotal;
    body.total = subtotal - discountTotal + taxTotal;
  }
  ```

### P1-2 — `invoices/route` POST and `proformas/route` POST do not recompute totals

- **File**: `src/app/api/invoices/route.ts:69-93` and `src/app/api/proformas/route.ts:69-93`
- **Issue**: Same defect as P1-1 but on the create path. `offers/route.ts:101-117` recomputes; invoices and proformas do not.
- **Impact**: Same as P1-1 — a tampered create can persist an invoice whose `total` doesn't match its line items.
- **Fix**: Apply the same recompute block. The audit comment in `offers/route.ts` (`FLOW-7`) explains the rationale.

### P1-3 — No status-transition validation on offer/invoice/proforma/deal PUT

- **Files**:
  - `src/app/api/offers/[id]/route.ts:42-65` (status taken verbatim from body)
  - `src/app/api/invoices/[id]/route.ts:46-47` (same)
  - `src/app/api/proformas/[id]/route.ts:46-47` (same)
  - `src/app/api/deals/[id]/route.ts:40-41` (stage taken verbatim from body)
- **Issue**: All four PUT routes accept any status from the request body. Allowed transitions per the audit brief:
  - Offer: `draft → sent → accepted/rejected → (no return to draft)`
  - Invoice: `draft → sent → paid/partial → (no return to draft)`
  - Proforma: `draft → sent → accepted → paid → (no return to draft)`
  - Deal: `qualified → proposed → negotiated → won/lost → (no return)`
  None of these are enforced at the API layer. The downstream `cascadeCommissionOnStatusChange` reacts to `"draft"`/`"cancelled"`/`"declined"`/`"voided"` *after* the bad transition is already saved — it doesn't reject the transition itself.
- **Impact**:
  - Admin (or compromised cookie) can revert a paid invoice to draft → triggers `cascadeCommissionOnStatusChange` which voids the commissions already marked earned → money owed to agents vanishes from the books.
  - A won deal can be moved back to `qualified` (no audit-trail reason required).
  - An accepted offer can be silently flipped to `rejected` after a counter-signature, breaking the legal record.
- **Fix**: Add a transition-guard helper (e.g. `lib/api/status-machine.ts`) that returns 409 on illegal transitions. Wire it into the four PUT routes after fetching `existing.status` and before calling `upsertX`:
  ```ts
  const ALLOWED = {
    offer:    { draft: ["sent","cancelled"], sent: ["accepted","rejected","cancelled"],
                accepted: ["cancelled"], rejected: ["cancelled"] },
    invoice:  { draft: ["sent","cancelled"], sent: ["paid","partial","cancelled"],
                partial: ["paid","cancelled"], paid: [], cancelled: [] },
    proforma: { draft: ["sent","cancelled"], sent: ["accepted","cancelled","paid"],
                accepted: ["paid","cancelled"], paid: [] },
    deal:     { qualified: ["proposed","lost"], proposed: ["negotiated","won","lost"],
                negotiated: ["won","lost"], won: [], lost: [] },
  } as const;
  ```
  (Each business may want to relax some transitions — the matrix above is the conservative interpretation of the audit brief.)

### P1-4 — `automation/create-invoice-from-offer` allows duplicate invoices from the same offer

- **File**: `src/app/api/automation/create-invoice-from-offer/route.ts:40-127`
- **Issue**: Unlike its sister endpoint `create-invoice-from-proforma/route.ts:90-116` (which explicitly checks for an existing invoice linked via `offer_id` or partner+subject), `create-invoice-from-offer` has **no duplicate guard**. Every call to this endpoint against an accepted offer mints a fresh `INV-YYYY-NNNN` invoice against the same offer.
- **Impact**: Two clicks in the UI → two invoices for the same deal. The customer gets two invoices with different numbers for the same amount. Both can be sent, both can be "paid", both fire the commission cascade. Duplicate revenue recognition in the books.
- **Fix**: Add the same lookup that `create-invoice-from-proforma` does (line 94-106):
  ```ts
  const existingInvoices = await store.listInvoices(tid, { limit: 1000 });
  const alreadyInvoiced = existingInvoices.items.find(
    (inv: any) => inv.offer_id === offer_id && inv.status !== "cancelled");
  if (alreadyInvoiced) {
    return NextResponse.json({ error: "Invoice already exists for this offer.",
      existing_invoice_id: alreadyInvoiced.id,
      existing_invoice_number: alreadyInvoiced.number }, { status: 409 });
  }
  ```

### P1-5 — `automation/create-proforma-from-offer` allows duplicate proformas from the same offer

- **File**: `src/app/api/automation/create-proforma-from-offer/route.ts:40-106`
- **Issue**: Same as P1-4 but for proformas. No existing-proforma-for-offer check. Multiple `PRO-YYYY-NNNN` proformas can be auto-generated from one offer.
- **Impact**: Same magnitude as P1-4 — duplicate proformas sent to the same customer.
- **Fix**: Same pattern — list proformas filtered by `offer_id`, return 409 if a non-cancelled one exists.

### P1-6 — `trade-calculator/[id]/create-offer` bypasses commission auto-track

- **File**: `src/app/api/trade-calculator/[id]/create-offer/route.ts:167-188`
- **Issue**: The `POST /api/offers` route has a `tradeCalcMeta` block (line 73-95, 181-302) that, when the offer body carries `_trade_calc_id` + `_commission_agent_id` metadata, auto-creates a `deal_commissions` row with `status:"pending"`. This is the documented mechanism ("Fix 2: Auto-track commission obligation"). The `trade-calculator/[id]/create-offer` endpoint builds `offerData` directly and never populates those `_`-prefixed fields:
  ```ts
  const offerData: any = {
    tenant_id: tenantId,
    number: offerNumber,
    partner_id: partnerId,
    // … no _trade_calc_id, no _commission_agent_id, no _commission_rate
  };
  const created = await auth.store.upsertOffer(offerData);
  ```
  So offers generated via the "Create Offer" button on a trade calc that has a commission agent + rate set never create the pending commission obligation. The commission tracking chain (calc → offer → deal → commission) is broken at the first link.
- **Impact**: Commission obligations for trade-calc-derived offers are silently lost. The downstream `createCommissionOnOfferAccepted` cascade only fires on offer acceptance, but it pulls `deal.commission_agent_id` — which is also never set by this route (unlike the `tradeCalcMeta` block in `POST /api/offers` which sets `commission_agent_id` on the created deal).
- **Fix**: After creating the offer in `create-offer/route.ts`, mirror the tradeCalcMeta block:
  ```ts
  // Find-or-create a deal for this offer.
  // (same logic as offers/route.ts lines 186-215)
  // Then insert deal_commissions row with status:"pending" using the
  // trade calc's _commission_* fields. (lines 217-301)
  ```
  Alternatively, refactor the tradeCalcMeta block out of `offers/route.ts` into a shared helper (`lib/api/offer-commission-track.ts`) and call it from both routes.

### P1-7 — `logistics-requests/[id]` PATCH allows any status transition (incl. delivered → pending)

- **File**: `src/app/api/logistics-requests/[id]/route.ts:33-68`
- **Issue**: The PATCH endpoint accepts any `body.status` and updates it directly. No transition guard. The audit brief says: `pending → quoted → accepted → in_progress → delivered → (should NOT go back)`. This route allows:
  - `delivered → pending` (re-opening a delivered shipment as pending)
  - `in_progress → quoted` (reverting an in-progress shipment back to draft quote)
  - `accepted → pending` (cancelling acceptance without audit trail)
  The auto-stamping of milestone timestamps at line 62-67 partially mitigates this (it only stamps forward transitions, never un-stamps), but the `status` column itself can move backwards.
- **Impact**: Logistics timeline / dashboard reports become unreliable. A shipment marked `delivered` then silently moved back to `pending` shows as "never shipped" in reports. Customers who already received "Delivered" emails get conflicting status updates if they re-query.
- **Fix**: Add a transition guard:
  ```ts
  const FORWARD = ["pending","quoted","accepted","in_progress","delivered","cancelled"];
  const iOld = FORWARD.indexOf(row.status);
  const iNew = FORWARD.indexOf(patch.status);
  if (iNew > -1 && iNew < iOld && patch.status !== "cancelled") {
    return NextResponse.json({ error: `Cannot move status backwards from ${row.status} to ${patch.status}.` }, { status: 409 });
  }
  ```

### P1-8 — `commission-payouts/[id]` PUT skips `markDealCommissionPaid` cascade when transitioning to "completed"

- **File**: `src/app/api/commission-payouts/[id]/route.ts:46-49`
- **Issue**: The POST route (line 68-72) calls `markDealCommissionPaid` for each commission when `status === "completed"`:
  ```ts
  if (created.commission_ids && created.status === "completed") {
    for (const commissionId of created.commission_ids) {
      await auth.store.markDealCommissionPaid(commissionId, created.payment_reference || undefined);
    }
  }
  ```
  The PUT route does **not** — it just upserts the body and returns. So if a payout is created with `status: "pending"` (the typical flow), and later moved to `status: "completed"` via PUT (the "mark paid" action), the linked `deal_commissions` rows stay at `"approved"` forever. The agent's payout shows as completed in the payout table but the underlying commission is never marked paid — they appear in both the "still owed" report and the "paid out" report.
- **Impact**: Double-counting of paid commissions in accounting reports. Agents see their commission as unpaid even after the payout hit their bank account.
- **Fix**: Mirror the POST logic in PUT — detect the `pending → completed` transition and call `markDealCommissionPaid` for every commission in `commission_ids`:
  ```ts
  const transitioningToCompleted =
    existing.status !== "completed" && body.status === "completed";
  const updated = await auth.store.upsertCommissionPayout({ ...body, id, tenant_id: existing.tenant_id });
  if (transitioningToCompleted && updated.commission_ids) {
    // Re-validate ownership (TOCTOU) before marking paid
    for (const cid of updated.commission_ids) {
      const c = await auth.store.getDealCommission(cid);
      if (!c || (!auth.isSuperAdmin && c.tenant_id !== auth.tenantId)) continue;
      if (c.status !== "paid" && c.status !== "voided") {
        await auth.store.markDealCommissionPaid(cid, updated.payment_reference || undefined);
      }
    }
  }
  ```

### P1-9 — `automation/create-demand-from-portal-rfq` — broken demand number generation

- **File**: `src/app/api/automation/create-demand-from-portal-rfq/route.ts:58-61`
- **Issue**:
  ```ts
  const existingDemands = await store.listDemands(tid, { limit: 1 });
  const year = new Date().getFullYear();
  const nextSeq = existingDemands.total + 1;
  const demandNumber = `RFQ-${year}-${String(nextSeq).padStart(3, "0")}`;
  ```
  Three problems:
  1. `existingDemands.total` is the count of **all** demands in the tenant (regardless of number prefix), not just `RFQ-`-prefixed ones. If the tenant has any `DM-`-prefixed demands (created via `POST /api/demands`, which doesn't auto-generate a number — see P2-1), the `nextSeq` count is wrong.
  2. The prefix `RFQ-${year}-` **collides with the portal RFQ numbering** (`RFQ-${year}-NNN`, see P0-3). A demand and a portal RFQ can share the same number — they live in different tables but appear together in audit logs and the partner-360 view.
  3. `padStart(3, "0")` overflows at 1000 demands/year, breaking the format.
  4. **No retry-on-collision** (unlike offers/invoices/proformas). Two concurrent calls produce the same number; the unique constraint rejects the second, returns 500.
- **Impact**: Demand numbers can collide with RFQ numbers and with each other under concurrency.
- **Fix**: Use a distinct prefix (`DM-` not `RFQ-`), call `nextDocNumber("demand")` (add to `lib/api/doc-number.ts`), filter by year-prefix on fallback, and add the same retry-on-collision loop as the other doc-number routes.

### P1-10 — `users/route` POST — super-admin without tenant_id crashes

- **File**: `src/app/api/users/route.ts:77-81`
- **Issue**:
  ```ts
  if (auth.isSuperAdmin && body.tenant_id) {
    // super_admin explicitly chose a tenant — keep it
  } else {
    body.tenant_id = auth.tenantId!;   // ← super_admin: auth.tenantId is null
  }
  // Then:
  const denied = await enforceQuota(body.tenant_id, "users", auth.isSuperAdmin);
  ```
  For a super_admin calling this endpoint without `?tenant_id=` and without `body.tenant_id`, `body.tenant_id` becomes `undefined`. `enforceQuota(undefined, ...)` likely no-ops or returns null (denied = null → falls through), then `auth.store.upsertUser(whitelistUserFields(body))` is called with `tenant_id: undefined`. The Postgres `users.tenant_id` column is NOT NULL for non-super-admin roles, so this either crashes with 23502 or silently creates a user with null tenant_id and role=user (broken, can't log in to any tenant).
- **Impact**: Super-admin "create user" calls without tenant context produce a confusing 500 error or a broken user record.
- **Fix**: After the `if`, validate:
  ```ts
  if (!body.tenant_id && body.role !== "super_admin") {
    return NextResponse.json({ error: "tenant_id is required to create a non-super-admin user." }, { status: 400 });
  }
  ```

### P1-11 — `invoices/[id]/record-payment` proceeds without a bank transaction when no bank account is configured

- **File**: `src/app/api/invoices/[id]/record-payment/route.ts:139-146`
- **Issue**: When `bankAccountId` is null (tenant has no `erp_bank_accounts` configured), the route logs a warning and **continues to mark the invoice as paid** — without writing any `erp_bank_transactions` row. The audit log captures the amount/method/reference, but the ERP books have no record of the money coming in.
- **Impact**:
  - Trial balance / P&L reports under-count cash receipts.
  - The bank reconciliation screen has nothing to reconcile against.
  - An admin who clicks "Record Payment" with no bank account set silently creates an un-auditable payment record (only the audit log has it; the finance tables don't).
- **Fix**: Either (a) refuse with 400 + a clear message ("Configure a bank account in ERP settings before recording payments"), or (b) auto-create a default "Unallocated Cash" bank account on the fly so the money always lands somewhere in the books. Option (a) is safer:
  ```ts
  if (!bankAccountId) {
    return NextResponse.json({ error: "No active bank account found. Configure one in ERP Settings → Bank Accounts before recording payments.", code: "no_bank_account" }, { status: 400 });
  }
  ```

---

## P2 — Missing Validations

### P2-1 — `demands/route` POST does not auto-generate a demand number

- **File**: `src/app/api/demands/route.ts:43-45`
- **Issue**: The route takes `body` as-is and calls `upsertDemand`. There is no auto-number generation (unlike offers/invoices/proformas). Demands created via the UI either get no `number` at all or whatever the client sends. Combined with P1-9 (`create-demand-from-portal-rfq` *does* generate a number, but with a wrong prefix), demands end up with inconsistent numbering.
- **Fix**: Add the same `nextDocNumber("demand")` call + retry-on-collision pattern. Pick a prefix distinct from `RFQ-` (e.g. `DM-`).

### P2-2 — No negative-value validation anywhere

- **Files**: every POST/PUT on offers/invoices/proformas/trade-calculator/deal-commissions/supplier-offers/products.
- **Issue**: None of these routes validate that `quantity`, `unit_price`, `discount` (when percent), `tax_rate`, `value`, `commission_rate`, `price`, `buy_price_per_unit`, `sell_price_per_unit` are non-negative. A client can send `unit_price: -100` and it gets stored; the totals recompute to negative; ERP journal entries mirror the negative.
- **Impact**: Negative invoices can be used for credit-note fraud; negative trade-calc margins can hide losses; negative commission rates can pay agents more than 100% of revenue.
- **Fix**: Add a shared `assertNonNegative(obj, fields)` helper in `lib/api/helpers.ts` and call it at the top of each POST/PUT handler:
  ```ts
  const bad = assertNonNegative(body, ["quantity", "unit_price", "discount", "tax_rate"]);
  if (bad) return NextResponse.json({ error: `Negative value not allowed for ${bad}.` }, { status: 400 });
  ```

### P2-3 — `invoices/[id]` and `offers/[id]` DELETE allow hard-deleting paid/accepted documents

- **Files**: `src/app/api/invoices/[id]/route.ts:64-87`, `src/app/api/offers/[id]/route.ts:101-126`, `src/app/api/proformas/[id]/route.ts:64-87`
- **Issue**: DELETE has no status check. A paid invoice (`status:"paid"`) can be hard-deleted, destroying the financial audit trail. Same for accepted offers/proformas. Compare with ERP `journal-entries/[id]/route.ts:80-101` which correctly rejects deletion unless status is `"draft"`.
- **Impact**: Loss of accounting records; downstream proforma-auto-paid cascade references invoices that no longer exist; commissions computed from a deal whose offer was deleted reference non-existent rows.
- **Fix**: Reject DELETE on non-draft documents:
  ```ts
  if (existing.status !== "draft" && existing.status !== "cancelled") {
    return NextResponse.json({ error: `Cannot delete an invoice in status "${existing.status}". Cancel it instead.` }, { status: 409 });
  }
  ```

### P2-4 — `logistics-requests/[id]/to-offer` creates a $0 offer when no quote is set

- **File**: `src/app/api/logistics-requests/[id]/to-offer/route.ts:32`
- **Issue**: `const price = Number(lr.quoted_price || 0);` — if the admin clicks "Convert to Offer" before entering a quote, the offer is created with `unit_price: 0, total: 0, subtotal: 0`. The customer receives an offer for $0.
- **Fix**: Validate before conversion:
  ```ts
  if (!lr.quoted_price || Number(lr.quoted_price) <= 0) {
    return NextResponse.json({ error: "Enter a quoted price on the logistics request before converting it to an offer." }, { status: 400 });
  }
  ```

### P2-5 — `kyc/[id]/approve` and `kyc/[id]/reject` don't check existing status

- **Files**: `src/app/api/kyc/[id]/approve/route.ts:36-45`, `src/app/api/kyc/[id]/reject/route.ts:31-43`, `src/app/api/kyc/[id]/resubmit/route.ts:31-45`
- **Issue**: No `if (existing.status !== "submitted")` guard. Approving an already-approved KYC re-runs the full automation chain (re-provisions portal access, re-sends welcome email, re-transfers KYC data into the partner record). Rejecting an already-approved KYC silently flips the partner back to `kyc_status: "rejected"` even though they may already have an active portal account.
- **Fix**: Add a status gate:
  ```ts
  if (existing.status !== "submitted" && existing.status !== "resubmit") {
    return NextResponse.json({ error: `Cannot approve a KYC in status "${existing.status}".` }, { status: 409 });
  }
  ```

### P2-6 — `logistics-requests/[id]` DELETE allows deleting in-progress / delivered shipments

- **File**: `src/app/api/logistics-requests/[id]/route.ts:161-178`
- **Issue**: DELETE has no status guard. A delivered or in-progress shipment can be hard-deleted, losing the shipment history and breaking `linked_offer_id` references on offers.
- **Fix**: Restrict to `pending` / `cancelled`:
  ```ts
  if (!["pending", "cancelled", "draft"].includes(row.status)) {
    return NextResponse.json({ error: `Cannot delete a logistics request in status "${row.status}". Cancel it instead.` }, { status: 409 });
  }
  ```

### P2-7 — `partners/[id]` DELETE doesn't check for or cascade child records

- **File**: `src/app/api/partners/[id]/route.ts:51-71`
- **Issue**: The route calls `store.deletePartner(id)` directly. There is no check for:
  - Offers / invoices / proformas / deals / demands referencing this partner
  - Portal access rows (`partner_id` FK)
  - KYC submissions (`partner_id` FK)
  - Trade calculations (`buyer_id`, `supplier_id`)
  - Inventory movements, supplier offers, deal commissions
- **Impact**: Either (a) Postgres FK ON DELETE RESTRICT rejects the delete with an opaque error, or (b) FK ON DELETE CASCADE silently destroys every offer/invoice/proforma/KYC submission for that partner — a catastrophic data loss. Either outcome is bad: the route gives the admin no preview of what will be destroyed, no warning, and no audit trail of the cascade.
- **Fix**: Before deleting, list dependent records and either (a) refuse with a "has N offers, M invoices, …" message, or (b) require `?force=1` and explicitly cascade with an audit entry per child:
  ```ts
  const deps = await countPartnerDependencies(id);
  if (deps.total > 0 && !req.url.includes("force=1")) {
    return NextResponse.json({ error: `Partner has ${deps.offers} offers, ${deps.invoices} invoices, ${deps.kyc} KYC submissions. Send ?force=1 to delete all.`, dependencies: deps }, { status: 409 });
  }
  ```

### P2-8 — `deal-commissions/[id]` PUT — `approve` / `mark_paid` actions don't validate current status

- **File**: `src/app/api/deal-commissions/[id]/route.ts:48-60`
- **Issue**: The PUT route accepts `body.action: "approve"` or `body.action: "mark_paid"` and immediately calls `store.approveDealCommission(id, …)` / `markDealCommissionPaid(id, …)` without checking `existing.status`. So:
  - An already-`paid` commission can be re-approved → moves status backwards.
  - A `voided` commission can be marked paid → resurrects a voided obligation.
  - A `pending` commission can be marked paid directly, skipping the `approved` step.
- **Fix**: Validate transitions:
  ```ts
  if (body.action === "approve" && !["pending"].includes(existing.status as string)) {
    return NextResponse.json({ error: `Cannot approve commission in status "${existing.status}".` }, { status: 409 });
  }
  if (body.action === "mark_paid" && !["approved"].includes(existing.status as string)) {
    return NextResponse.json({ error: `Cannot mark commission paid from status "${existing.status}". Approve first.` }, { status: 409 });
  }
  ```

### P2-9 — `invoices/route` POST and `demands/route` POST use `auth.tenantId!` non-null assertion (super-admin path crashes)

- **Files**: `src/app/api/invoices/route.ts:70` (`body.tenant_id = tid!`), `src/app/api/demands/route.ts:44` (`body.tenant_id = auth.tenantId!`)
- **Issue**: `tid` comes from `resolveTenantId(auth, req)` which returns null when a super_admin calls without `?tenant_id=`. The non-null assertion `!` lies to TypeScript but at runtime `tid!` is `undefined`. `body.tenant_id = undefined` flows through to `upsertInvoice`, which sends `tenant_id: undefined` to PostgREST — Postgres rejects with 23502 NOT NULL violation, surfaced as a 500 with no helpful message. The `enforceQuota` call also receives undefined, returning a confusing "Tenant not found" error.
- **Fix**: Replace `!` with an explicit null guard:
  ```ts
  const tid = resolveTenantId(auth, req);
  if (!tid) return NextResponse.json({ error: "tenant_id query parameter is required for super-admin actions." }, { status: 400 });
  body.tenant_id = tid;
  ```
  (The `letters/route.ts` and `seals/route.ts` already do this correctly — replicate that pattern.)

---

## Routes with Correct Logic (spot-checked, verified)

These routes were inspected line-by-line and found to have **no high-impact logic defects**:

1. `auth/login/route.ts` — lockout (5 attempts / 15min), token_version check, tenant status gate, session rotation, geo-IP, device fingerprint, login history. Solid.
2. `auth/logout/route.ts` — bumps token_version, revokes SecuritySession, clears cookie. Correct.
3. `auth/me/route.ts` — token_version check, impersonation surface with expiry, target user active check.
4. `portal/login/route.ts` — multi-tenant email discrimination (409 with tenant picker), lockout, tenant status gate, trial/sub expiry gates.
5. `portal/change-password/route.ts` — verifies current password, validates new against policy, rejects same-as-old, bumps token_version.
6. `portal/reset-password/route.ts` — single-use hashed token, expiry check, token_version bump.
7. `portal/setup-password/route.ts` — `must_set_password` gate, staff override path, token_version bump, auto-login on anonymous setup.
8. `super-admin/impersonate/route.ts` — refuses to impersonate another super_admin, max duration clamp, expiry stamp in claim.
9. `super-admin/impersonate/end/route.ts` — re-mints cookie without impersonating claim.
10. `erp/journal-entries/route.ts` — validates lines exist, validates debit==credit balance.
11. `erp/journal-entries/[id]/route.ts` — PUT rejects non-draft, DELETE rejects non-draft.
12. `erp/journal-entries/[id]/post/route.ts` — only drafts can be posted.
13. `erp/journal-entries/[id]/reverse/route.ts` — only posted can be reversed.
14. `erp/fiscal-periods/[id]/close/route.ts` — refuses to close already-closed/locked.
15. `erp/bank-transactions/[id]/reconcile/route.ts` — tenant-scoped query (no client-side filter), requires journal_entry_id.
16. `api-keys/route.ts` — generates real key (`asp_` + 24 random bytes hex), hashes with SHA-256, strips hash from response.
17. `api-keys/[id]/route.ts` — fetches all tenant keys, filters for non-super_admin.
18. `vault/route.ts` — strips `encrypted_value` from list response (only reveals on explicit get).
19. `tenants/[id]/route.ts` — on suspend/cancel, bumps `token_version` for every user + every portal_access row in the tenant.
20. `tenants/route.ts` — POST auto-computes `trial_ends_at` from `trial_days` for fresh trial tenants.
21. `cron/subscription-sweep/route.ts` — token-or-super-admin auth, idempotent, suspends both expired trials and expired paid subscriptions.
22. `offers/[id]/send/route.ts` — only promotes draft→sent; preserves non-draft status; PDF generation + email send + portal notification fire-and-forget.
23. `invoices/[id]/send/route.ts` — same correct pattern.
24. `portal/offers/[id]/respond/route.ts` — validates offer belongs to the calling portal access; only allows responses on `"sent"` / `"viewed"`; stamps `responded_at`, `client_accepted_at`, `client_signature`.
25. `portal-access/[id]/change-email/route.ts` — duplicate-email check across tenant, token_version bump, optional welcome email to new address.
26. `portal-access/[id]/invite/route.ts` — only downgrades status to "invited" if not already "active"; refreshes `invited_at` + `welcome_email_sent: false`.
27. `portal-access/route.ts` POST — duplicate-email check, force `must_set_password: true`, defaults status to `"invited"` (not `"active"`).
28. `kyc/[id]/route.ts` — tenant ownership check, attaches uploaded KYC documents scoped to the submission.
29. `verify/[code]/route.ts` — public, no auth; logs every verification attempt with IP/UA/device/geo/GPS; never turns a valid verification into a 500.
30. `plan-upgrade-requests/[id]/route.ts` — refuses to act on already-decided requests; on approve, updates tenant.plan + subscription_end + clears trial_ends_at; busts feature-flag cache.
31. `feature-flags/route.ts` — only super_admin can PUT.
32. `settings/route.ts` — super_admin can write platform-level (tenant_id NULL) settings; tenant admins locked to own tenant.
33. `documents/[id]/route.ts` — tenant-scoped signed URL (300s), supports inline vs download mode.
34. `portal-uploads/[id]/download/route.ts` — tenant ownership check, refuses deleted files (410), 300s signed URL.
35. `audit/route.ts` — applies `redactDetails` with `TENANT_REDACT_KEYS` so secret-bearing fields are stripped before display.
36. `super-admin/users/route.ts` — super_admin only, strips `password_hash` + `totp_secret`.
37. `users/[id]/route.ts` PUT — prevents self-promotion to super_admin, enforces max-2-admins-per-tenant, prevents demoting/deleting the last admin, rotates sessions on password change.
38. `users/[id]/route.ts` DELETE — refuses self-delete, prevents deleting last admin.
39. `products/route.ts` — duplicate SKU check (hard 409) + duplicate name check (soft 409 with `force:true` override), strips `force` before upsert.
40. `partners/route.ts` — duplicate `tax_id` / `vat_number` check (hard 409) + duplicate name check (soft 409 with `force:true`).
41. `security/sessions/[id]/route.ts` — tenant ownership check via `listSessions` + `.find`.
42. `security/trusted-devices/[id]/route.ts` — same correct pattern.
43. `mail-queue/[id]/route.ts` — tenant ownership check.
44. `webhooks/[id]/route.ts` — tenant ownership check.
45. `vault/[id]/route.ts` — tenant ownership check.
46. `erp/initialize/route.ts` — admin-only, validates `standard ∈ {eu, uae}`, creates default chart of accounts + ERP settings atomically (per-account upserts).
47. `erp/accounts/route.ts` — admin-only on POST.
48. `erp/bank-transactions/route.ts` — admin-only on POST.
49. `letterheads/route.ts` + `seals/route.ts` — admin-only, refuses super_admin-without-tenant with 400 on POST (but empty list on GET).
50. `setup/route.ts` — one-time bootstrap, refuses further calls once any tenant has an admin/super_admin user.
51. `portal/kyc/submit/route.ts` — requires existing draft, validates required fields, sets `status: "submitted"`, notifies admins.
52. `portal/upload/route.ts` — magic-byte MIME verification (defeats `Content-Type` spoofing), 25MB cap, allowlist.
53. `portal/kyc/document/route.ts` — magic-byte verification, 10MB cap, requires saved submission first.
54. `tenants/[id]/logo/route.ts` — magic-byte verification, SVG banned (XSS risk), 2MB cap.
55. `trade-calculator/route.ts` and `trade-calculator/[id]/route.ts` — server-side recompute of `total_buy_cost`, `total_landed_cost`, `total_sell_revenue`, `gross_margin`, `margin_percent` from `cost_lines` (never trusts client-supplied totals).

---

## Race-condition notes

The doc-numbering race is the most consequential one. It is mitigated for offers/invoices/proformas by:

1. Postgres SEQUENCE via `get_next_doc_number(doc_type)` RPC (`lib/api/doc-number.ts`) — atomic.
2. Unique-constraint retry-once-with-`+1` in each POST handler.
3. Defense-in-depth post-filter on GET (`items.filter(o => o.tenant_id === auth.tenantId)`).

**Gaps in the mitigation**:

- `trade-calculator/[id]/create-offer` — no retry (P0-2 above).
- `portal/rfqs` POST — non-atomic read-then-write (P0-3 above).
- `automation/create-demand-from-portal-rfq` — non-atomic, no retry (P1-9 above).
- `demands/route.ts` POST — no number generation at all (P2-1 above).
- The `record-payment` route doesn't lock the invoice row — two concurrent payments on the same invoice both read `invoice.status` as `"sent"`, both proceed, both call `upsertInvoice({ id, status: "paid", paid_at: now })`. The second one wins. No P&L corruption (the bank txn amounts add up) but the `paid_at` timestamp is wrong and the proforma cascade can fire twice. **Mitigation**: wrap the read-update in a Postgres advisory lock keyed on invoice id, or use a conditional update (`UPDATE invoices SET status='paid' WHERE id=$1 AND status IN ('sent','partial')`).

---

## Cascade summary

| Parent deleted | Children handling | Verdict |
|---|---|---|
| Tenant | `deleteTenant` — implementation-defined in store | Not audited at store layer; route has no pre-delete check |
| Partner | None — direct `deletePartner` | **P2-7** — children orphaned or FK violation |
| Product | None — direct `deleteProduct` | Same risk; offers/invoices store product_id as JSONB in items[], so they survive but reference a deleted product_id |
| Deal | None — direct `deleteDeal` | Linked offers keep `deal_id` pointing at deleted row |
| Offer | `cascadeCommissionOnDelete(deal_id, …)` runs first, voids commissions on the linked deal | Correct |
| Invoice | None — direct `deleteInvoice` | **P2-3** — paid invoice can be hard-deleted |
| Proforma | None — direct `deleteProforma` | **P2-3** |
| Logistics request | None — direct `delete` | **P2-6** |

---

## Next actions (recommended priority order)

1. **P0-1 (partial payments)** — Fix the cumulative-paid tracking in `record-payment`. Highest impact: commissions + proforma cascade + dashboard accuracy all depend on this single boolean.
2. **P0-2 (trade-calc create-offer numbering)** — One-line filter fix + retry-on-collision. Low effort, unblocks every trade-calc conversion when the SEQUENCE RPC is down.
3. **P0-3 (portal RFQ numbering)** — Move to tenant-wide SEQUENCE-backed numbering. Touches `lib/api/doc-number.ts` and the SQL function.
4. **P1-3 (status-transition validation)** — Build `lib/api/status-machine.ts` with the transition matrix; wire into offers/invoices/proformas/deals PUT routes. Largest blast-radius fix.
5. **P1-1, P1-2 (totals recompute)** — Replicate the FLOW-7 block from offers PUT into invoices + proformas POST + PUT. Mechanical change.
6. **P1-4, P1-5 (duplicate-invoice / duplicate-proforma from offer)** — Add existing-link checks to the two automation routes. Small change.
7. **P1-6 (trade-calc→offer commission bypass)** — Extract `tradeCalcMeta` block into shared helper, call from both routes.
8. **P1-8 (commission-payouts PUT cascade)** — Mirror POST's `markDealCommissionPaid` cascade on the `→completed` transition.
9. **P2-7 (partner delete cascade)** — Add dependency-count endpoint + force flag.
10. **P2-2 (negative-value validation)** — Roll out shared `assertNonNegative` helper across the 6 affected routes.

All other findings are either lower-impact or one-line guards that can ride along with the relevant route's next edit.
