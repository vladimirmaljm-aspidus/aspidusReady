# Deep Logic Audit — Cross-Module Business Logic

**Auditor:** business-logic-auditor (read-only)
**Date:** 2025-11
**Scope:** 8 critical end-to-end flows in `/home/z/aspidusReady/`

## Summary
- Flows audited: 8
- Issues found: 15
- Data loss risks: 6
- Logic gaps: 9

| Severity | Count |
|----------|-------|
| Critical (data loss / financial integrity) | 7 |
| High (audit / workflow gaps) | 5 |
| Medium (consistency) | 3 |

---

## Flow 1: Trade Calculator → Offer

### ✅ Confirmed
- Sell price + quantity + currency survive the flow (`offer-preview` sets `unit_price = sellPrice` → `/api/offers` POST recomputes totals from items, preserving the unit price).
- Buy cost / landed cost / margin are NOT included in the offer payload (verified: `offer-preview/route.ts:132-170` only emits `items`, `subtotal`, `total`, `notes` — no internal cost fields).
- Portal redaction (`redact.ts:18-60`) strips `cost`, `cost_price`, `landed_cost`, `margin`, `commission_*` from offer payload before it leaves the server.
- Commission metadata (`_commission_agent_id`, `_commission_rate`, `_commission_amount`, `_margin`) is correctly extracted by `/api/offers` POST, stripped from the persisted row, and used to auto-create a `deal_commissions` row at `offers/route.ts:181-302`.

### 🔴 Issue 1.1 — `POST /api/trade-calculator/[id]/create-offer` bypasses commission tracking
**File:** `src/app/api/trade-calculator/[id]/create-offer/route.ts:167-186`
**Impact:** HIGH — silently loses the commission obligation.

The UI uses `offer-preview` → `POST /api/offers` (which carries the `_commission_agent_id` metadata). However the **separate** `create-offer` route (line 167-186) builds an `offerData` object that omits `_trade_calc_id`, `_commission_agent_id`, `_commission_rate`, etc. entirely. Any caller (API client, future UI button) that hits `/api/trade-calculator/[id]/create-offer` will get an offer that NEVER triggers the auto-commission cascade (`offers/route.ts:181` checks `tradeCalcMeta._trade_calc_id && tradeCalcMeta._commission_agent_id` — both will be null).

**Result:** commission data is lost at the offer-creation step for this code path.

### 🟡 Issue 1.2 — `create-offer` route also drops trade-term fields
Same file (`create-offer/route.ts:181-185`) copies `payment_terms`, `incoterm`, `pol`, `pod` from the calc, but does NOT copy `vessel`, `container_no`, `lead_time`, `packaging`, `bank_details`. These exist on the `offers` table (`supabase-schema-live.sql:519-528`).

---

## Flow 2: Offer → Proforma → Invoice

### 🔴 Issue 2.1 — `create-proforma-from-offer` DROPS critical trade-term fields
**File:** `src/app/api/automation/create-proforma-from-offer/route.ts:78-96`

The `proformaData` object copies: `tenant_id, number, offer_id, partner_id, status, subject, currency, subtotal, discount_total, tax_total, total, issue_date, valid_until, notes, items`.

It does NOT copy from the offer:
- `incoterm`
- `pol`, `pod` (and `pol_country`, `pod_country`)
- `vessel`, `container_no`
- `lead_time`, `packaging`
- `payment_terms` ← critical: both tables have this column
- `bank_details`
- `delivery_address`, `delivery_city`, `delivery_country`
- `specification`, `origin_country`
- `exchange_rate`, `exchange_rate_date`, `exchange_rate_note`

The proformas table DOES have all of these columns (`supabase-schema-live.sql:1107-1150`), so the data is silently truncated by the automation route.

The UI claims "All offer data, partner info and items auto-filled" (`proformas-view.tsx:899`) — this is misleading.

### 🔴 Issue 2.2 — `create-invoice-from-offer` DROPS the same trade-term fields
**File:** `src/app/api/automation/create-invoice-from-offer/route.ts:98-117`

Same problem on the offer → invoice shortcut. `invoiceData` only copies: `tenant_id, number, offer_id, partner_id, status, subject, currency, subtotal, discount_total, tax_total, total, issue_date, due_date, payment_terms, notes, items`. Skips `incoterm`, `pol`, `pod`, `vessel`, `container_no`, `lead_time`, `packaging`, `bank_details`.

### 🔴 Issue 2.3 — `create-invoice-from-proforma` reads fields that were never written
**File:** `src/app/api/automation/create-invoice-from-proforma/route.ts:160-186`

The route tries to copy `proforma.incoterm`, `proforma.pol`, `proforma.pod`, `proforma.vessel`, `proforma.container_no`, `proforma.lead_time`, `proforma.packaging` — but because Flow 2.1 dropped these at the proforma stage, they are always `null`. The `?? null` fallback silently swallows the data loss.

**End-to-end impact:** any trade term entered on an offer (incoterm CIF, POL Rotterdam, POD Shanghai, vessel name "MV Maersk") is LOST by the time it reaches the invoice PDF.

### ✅ Confirmed
- When invoice is paid in full, the originating proforma is auto-marked paid (`record-payment/route.ts:218-308`). The cascade resolves the proforma via `invoice.offer_id` → `proformas.offer_id`.
- Proforma revision is recorded when status is auto-flipped (`record-payment/route.ts:278-287`).

### 🟡 Issue 2.4 — Invoice payment does NOT record a revision for the invoice itself
**File:** `src/app/api/invoices/[id]/record-payment/route.ts:154-166`

The invoice status changes from `draft`/`sent` → `paid`/`partial` (line 155-159), but `recordRevision({ docType: "invoice", ... })` is never called for the invoice itself. Only the proforma cascade records a revision. The invoice's status transition is invisible to the revision-history view.

---

## Flow 3: Commission Lifecycle

### ✅ Confirmed
- Trade calc sets `commission_agent_id` + `commission_type` + `commission_rate` (`trade_calculations` table).
- Offer creation auto-creates a pending `deal_commissions` row (`offers/route.ts:181-302`) — only when `_trade_calc_id && _commission_agent_id` are present.
- Invoice paid in full → `markCommissionsEarnedOnInvoicePaid` flips pending → approved (`record-payment/route.ts:194-207`, `commission-cascade.ts:183-211`).
- Commission payout (`commission-payouts/route.ts:65-72`) calls `markDealCommissionPaid` which uses `.neq("status", "paid")` to prevent double-payment (`supabase-store.ts:1590`).
- Cascade on offer cancel/delete voids pending commissions (`commission-cascade.ts:25-81`).

### 🔴 Issue 3.1 — Portal offer accept skips the commission cascade
**File:** `src/app/api/portal/offers/[id]/respond/route.ts:71-79`

The portal route calls `store.upsertOffer({ status: "accepted", ... })` directly. It does NOT call `createCommissionOnOfferAccepted` (which IS called by `/api/offers/[id]` PUT at `route.ts:84-92`).

**Result:** if an offer is created without trade-calc metadata (e.g. manually, or via `create-offer` route from Issue 1.1) and later assigned an agent on the deal, a portal-side acceptance will NOT auto-create the pending commission. The admin-side PUT path is the only one that triggers the cascade.

### 🔴 Issue 3.2 — `deal_commissions [id]` PUT allows unguarded status mutations
**File:** `src/app/api/deal-commissions/[id]/route.ts:46-64`

The generic PUT branch (line 62) calls `upsertDealCommission({ ...body, id, tenant_id })` with no validation against:
- Reverting a `paid` commission back to `pending` or `approved`
- Editing `calculated_commission`, `agent_id`, or `deal_value` on a paid commission
- Setting `status: "paid"` directly (bypassing the payout flow)

The store-layer `upsertDealCommission` (`supabase-store.ts:1558`) is a passthrough `smartUpsert` with no guards.

**Double-count vector:** if an admin reverts a paid commission to `pending`, the next `markCommissionsEarnedOnInvoicePaid` won't re-fire (it queries `status = "pending"` and the row will match), but the subsequent payout run will re-pay it because `markDealCommissionPaid` only skips when status is ALREADY "paid". Reverting to "pending" then "approved" then paid again WILL double-count.

### 🔴 Issue 3.3 — `action: "mark_paid"` PUT bypasses the payout audit trail
**File:** `src/app/api/deal-commissions/[id]/route.ts:56-60`

The route allows marking a commission as paid without creating a `commission_payouts` row. The audit log entry (`deal_commission.mark_paid`) is created, but there's no `commission_payouts` record linking the payment to a bank transaction, payment_reference, or payee.

**Result:** a commission paid via this path has no financial audit trail — just a status flag and an audit log line.

### 🟡 Issue 3.4 — `deal_commissions` DELETE hard-deletes without voiding
**File:** `src/app/api/deal-commissions/[id]/route.ts:81-88`

Hard-deletes the row. Compare with the offer-delete cascade (`offers/[id]/route.ts:115-119`) which voids (not deletes) commissions. The asymmetry means a hard-deleted commission leaves no trace for finance audits.

---

## Flow 4: ERP / Finance Flow

### ✅ Confirmed
- When invoice is paid, an `erp_bank_transactions` credit row is auto-created with `is_auto_generated: true`, `reconciled_with: invoice.id`, `invoice_number`, `category: "invoice_payment"` (`record-payment/route.ts:113-130`).
- The bank transaction is properly linked to the invoice via `reconciled_with` and `invoice_number` fields.
- Journal entry POST validates `debit == credit` to 1 cent tolerance (`erp/journal-entries/route.ts:65-69`).

### 🔴 Issue 4.1 — NO journal entry auto-created when invoice is paid
**Files:** `src/app/api/invoices/[id]/record-payment/route.ts` (entire file), `src/app/api/erp/journal-entries/route.ts`

The payment flow creates only a bank transaction. No `erp_journal_entry` is created to record the double-entry (e.g., DR Bank / CR Accounts Receivable). The accountant must manually:
1. Open the ERP module
2. Create a new journal entry with balanced debit/credit lines
3. Open the bank transaction
4. Click "Reconcile" and link it to the journal entry

This is a significant workflow gap for a finance module that otherwise models double-entry accounting.

### 🔴 Issue 4.2 — NO journal entry auto-created when commission is paid out
**File:** `src/app/api/commission-payouts/route.ts:33-78`

The payout route calls `upsertCommissionPayout` + `markDealCommissionPaid`, but no journal entry is created for the commission liability → cash outflow. The payout row records the payment_reference and total_amount, but it's not linked to any `erp_journal_entry` or `erp_bank_transaction`.

### 🟡 Issue 4.3 — Bank transaction from invoice payment is created with `is_reconciled: false`
**File:** `src/app/api/invoices/[id]/record-payment/route.ts:125`

Even though `reconciled_with: invoice.id` is set, `is_reconciled: false`. This is inconsistent — the field semantics should be "the bank txn represents a payment that was already matched to an invoice", which is exactly what this flow does. The accountant must still manually reconcile, even though the system knows the link.

---

## Flow 5: Portal Bidirectional Flow

### ✅ Confirmed
- Portal client creates RFQ → tenant admins notified via `notifyRfqReceived` (`portal/rfqs/route.ts:74-75`).
- Admin converts portal RFQ → demand via `/api/automation/create-demand-from-portal-rfq`. RFQ status flips to "quoted" and `linked_demand_id` is set (`create-demand-from-portal-rfq/route.ts:99-104`).
- Portal client can accept/reject offer → tenant admins notified via `notify({type: "offer_accepted"|"offer_rejected"})` (`portal/offers/[id]/respond/route.ts:82-101`).
- KYC submission by portal client → tenant admins notified (`portal/kyc/submit/route.ts:55-56`).
- KYC approval by admin → triggers full automation chain: KYC transfer to partner record, "KYC Approved" email, portal access provisioning, welcome email (`kyc/[id]/approve/route.ts:44-66`).

### 🔴 Issue 5.1 — Portal-accepted offers skip commission cascade
(See Issue 3.1 above.) The portal `respond` route updates offer status to "accepted" but does not invoke `createCommissionOnOfferAccepted`. The admin-side PUT path is the only entry point that triggers commission auto-creation on accept.

### 🟡 Issue 5.2 — Portal RFQ → demand conversion skips product_id linkage
**File:** `src/app/api/automation/create-demand-from-portal-rfq/route.ts:64-73`

The demand items always set `product_id: null` — the RFQ's `product_id` (if any) is ignored, even when the portal catalog picker selected a real product. Demand items only carry `product_name`. This breaks downstream product-level reporting and inventory deduction (which would have been keyed on product_id).

### 🟡 Issue 5.3 — Portal client logistics status updates not reflected back to portal
**File:** `src/app/api/logistics-requests/[id]/route.ts:108-156`

When an admin updates a logistics request status (e.g., → "in_progress"), the route notifies the partner via `createNotification` + email. ✅ This part works.

But: portal client cannot accept/reject a logistics quote via the portal UI flow — the admin-side PATCH sets status to "accepted" directly when the client agrees. There's no `/api/portal/logistics/[id]/respond` endpoint. So the "client accepts quote" step is manual on the admin side (admin clicks "Accept on behalf of client"). This may be intentional but breaks the audit trail: it's impossible to prove WHO accepted the quote.

---

## Flow 6: Document Versioning

### ✅ Confirmed
- `recordRevision` (`doc-revisions.ts:40-77`) computes a per-field diff (`{field, before, after}`) and stores it in `document_revisions.changed_fields`.
- Each revision records `changed_by_username` and `created_by` (user_id) — so "WHO changed WHAT" is captured.
- The parent document's `version` column is bumped atomically alongside the revision insert.
- Revisions are auto-recorded on PUT to `/api/offers/[id]`, `/api/proformas/[id]`, `/api/invoices/[id]`, and on the proforma auto-paid cascade from invoice payment.
- GET `/api/document-revisions/[documentId]` returns the full revision list with strict tenant scoping.

### 🔴 Issue 6.1 — Status transitions via `/send` and `/respond` routes skip revision tracking
**Files:**
- `src/app/api/offers/[id]/send/route.ts:82-86` — flips status `draft → sent` via `upsertOffer` without calling `recordRevision`.
- `src/app/api/portal/offers/[id]/respond/route.ts:71-79` — flips status `sent → accepted|rejected` without calling `recordRevision`.

Result: the most important commercial transitions (offer sent to client, offer accepted by client) are INVISIBLE in the revision history. The audit log captures them, but the version-comparison view does not.

### 🟡 Issue 6.2 — No "compare versions" endpoint
The `GET /api/document-revisions/[documentId]` endpoint returns the revision list with `snapshot_before` and `changed_fields`, but there's no server-side helper to compute a diff between two arbitrary versions. UI must compute the diff client-side from `snapshot_before`. Not a bug — just a feature gap.

### 🟡 Issue 6.3 — Document CREATION does not record a revision
**Files:** `POST /api/offers`, `POST /api/proformas`, `POST /api/invoices` — none call `recordRevision` on creation. The `version` column defaults to 1 in the schema, so v1 is implicit. This is acceptable (the audit log captures creation), but the revision history view shows nothing for v1.

---

## Flow 7: Logistics Flow + 3D Globe

### ✅ Confirmed
- Status transitions `quoted → accepted → in_progress → completed` auto-stamp milestone timestamps (`logistics-requests/[id]/route.ts:62-68`).
- Each status change logs a `logistics_event` via `logLogisticsEvent` (`logistics-requests/[id]/route.ts:82-106`).
- Client is notified on quote-available and status change (`logistics-requests/[id]/route.ts:108-156`), with email sent when a quote becomes available.
- 3D globe fetches `/api/logistics-requests?limit=100` and routes each through the maritime router (`trade-globe-view.tsx:128-217`).
- Distances use haversine with the correct Earth radius for nautical miles (R = 3440.065 nm, `maritime-router.ts:206`).
- Transit days estimated at 14 knots × 24h = 336 nm/day (`maritime-router.ts:263, 385`).
- Routes follow real maritime waypoints (canals, straits, capes) — no land crossings.

### 🟡 Issue 7.1 — Status "delivered" vs "completed" naming inconsistency
**Files:** `logistics-requests/[id]/route.ts:67` sets `delivered_at` when status becomes "completed". The trade-globe color picker (`trade-globe-view.tsx:77`) accepts both "delivered" and "completed" as green. But the task description asks about "delivered" — the actual stored status is "completed". Confusing for API consumers.

### 🟡 Issue 7.2 — Globe fetches max 100 requests, no pagination
**File:** `src/components/views/trade-globe-view.tsx:132`

`fetch(api("/api/logistics-requests", { limit: 100 }))` — silently truncates if a tenant has >100 logistics requests. Older routes won't appear on the globe.

---

## Flow 8: Inventory Management

### 🔴 Issue 8.1 — NO automatic stock decrement when an offer is accepted
**Verified by:** `grep -rn "stock" src/app/api/offers/ src/app/api/automation/` — only matches in `product-context/route.ts` (a read-only context endpoint) and `products/export/route.ts`.

The offer accept flow (`/api/offers/[id]` PUT when status → "accepted", or `/api/portal/offers/[id]/respond`) does NOT call any store method to decrement `products.stock`. The `products.stock` column exists and is shown on dashboards, but it only changes when an admin manually edits a product via `/api/products/[id]` PUT.

### 🔴 Issue 8.2 — NO automatic stock increment when a supplier delivery is received
The `addInventoryMovement` store method exists (`supabase-store.ts:474-479`) but is **never called by any route** (verified by `grep -rn "addInventoryMovement" src/app/`). The `inventory_movements` table is read-only from the API perspective — there's no POST endpoint to create a movement, no automatic creation when a supplier delivers.

### 🟡 Issue 8.3 — Reorder-level threshold never fires an alert
**File:** `src/lib/data/supabase-store.ts:523-527`

`getInsights` computes `low_stock_count` and `low_stock_products` for the dashboard, but **no notification is created** when a product's stock crosses the reorder threshold. The dashboard KPI just displays the count — there's no proactive alert to procurement.

### 🟡 Issue 8.4 — Stock field is not part of the offer acceptance cascade
There's no `deal_commissions`-style cascade (`commission-cascade.ts`) for inventory. The schema supports it (`products.stock`, `products.reorder_level`, `inventory_movements` table), the store supports it (`addInventoryMovement`), but the route layer never wires them together.

---

## Critical Issues (ranked by impact)

| # | Issue | Severity | Files |
|---|-------|----------|-------|
| 1 | `create-proforma-from-offer` drops incoterm/pol/pod/vessel/container_no/lead_time/packaging/payment_terms/bank_details | 🔴 Critical data loss | `automation/create-proforma-from-offer/route.ts:78-96` |
| 2 | `create-invoice-from-offer` drops the same trade-term fields | 🔴 Critical data loss | `automation/create-invoice-from-offer/route.ts:98-117` |
| 3 | `create-invoice-from-proforma` reads proforma.incoterm etc. that were never written → silent nulls | 🔴 Critical data loss | `automation/create-invoice-from-proforma/route.ts:160-186` |
| 4 | No journal entry auto-created on invoice payment — only a bank txn | 🔴 Critical finance gap | `invoices/[id]/record-payment/route.ts` |
| 5 | No journal entry auto-created on commission payout | 🔴 Critical finance gap | `commission-payouts/route.ts:65-72` |
| 6 | Portal offer accept skips `createCommissionOnOfferAccepted` cascade | 🔴 Critical commission gap | `portal/offers/[id]/respond/route.ts:71-79` |
| 7 | `deal_commissions [id]` PUT allows unguarded status mutations (paid → pending → re-pay = double count) | 🔴 Critical financial integrity | `deal-commissions/[id]/route.ts:46-64` |
| 8 | `action: "mark_paid"` on deal_commissions bypasses payout audit trail | 🔴 Critical audit gap | `deal-commissions/[id]/route.ts:56-60` |
| 9 | No automatic stock decrement when offer accepted | 🔴 Critical inventory gap | (no caller exists) |
| 10 | No automatic stock increment when supplier delivers | 🔴 Critical inventory gap | (no caller exists; `addInventoryMovement` orphaned) |
| 11 | `create-offer` route (separate from `offer-preview`) bypasses commission metadata | 🟡 High | `trade-calculator/[id]/create-offer/route.ts:167-186` |
| 12 | Offer status changes via `/send` and portal `/respond` skip `recordRevision` | 🟡 High | `offers/[id]/send/route.ts:82-86`, `portal/offers/[id]/respond/route.ts:71-79` |
| 13 | Invoice payment doesn't record revision for the invoice itself (only the proforma cascade) | 🟡 High | `invoices/[id]/record-payment/route.ts:154-166` |
| 14 | Portal RFQ → demand conversion drops `product_id` (always null) | 🟡 High | `automation/create-demand-from-portal-rfq/route.ts:64-73` |
| 15 | `deal_commissions` DELETE hard-deletes (vs. offer-delete which voids) — finance audit gap | 🟡 Medium | `deal-commissions/[id]/route.ts:81-88` |

---

## Recommendations (priority order)

1. **Fix the trade-term field copy** in `create-proforma-from-offer` and `create-invoice-from-offer` — one-line spread of `incoterm, pol, pod, vessel, container_no, lead_time, packaging, payment_terms, bank_details` from the source row.
2. **Add journal-entry auto-creation** in `record-payment` (DR Bank / CR AR) and `commission-payouts` (DR Commission Expense / CR Bank or AP).
3. **Move the `createCommissionOnOfferAccepted` call** into a shared helper invoked by BOTH `/api/offers/[id]` PUT and `/api/portal/offers/[id]/respond` POST.
4. **Add status guards to `deal_commissions [id]` PUT** — reject edits to `status`, `calculated_commission`, `agent_id`, `deal_value` when `existing.status === "paid"`. Force delete-the-old + create-new pattern instead.
5. **Wire `addInventoryMovement` into the offer-accept flow** with a `direction: "out"` movement, and add a `POST /api/inventory/movements` route for receipts.
6. **Add `recordRevision` calls** in `/api/offers/[id]/send` and `/api/portal/offers/[id]/respond` for status transitions.
7. **Auto-reconcile** the bank transaction created by `record-payment` (set `is_reconciled: true` since the system knows the link).
8. **Fire a notification** when `products.stock <= products.reorder_level` (after product updates and after inventory movements).
