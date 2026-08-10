# AspidusReady — Integration & Deep Audit Worklog

This worklog tracks the integration of the new multi-currency Trade Calculator
logic into the real AspidusReady repository, plus a deep audit.

---
Task ID: 0-bootstrap
Agent: main (Z.ai Code)
Task: Clone the real repo, configure git identity, plan the integration.

Work Log:
- Cloned https://github.com/vladimirmaljm-aspidus/aspidusReady.git to /home/z/aspidusReady
- Configured git user.name=vladimirmaljm-aspidus, user.email=vladimir.maljm@gmail.com
- Inspected repo: 50 Prisma models, existing TradeCalculation model already has buy_currency, sell_currency, exchange_rate, cost_lines (JSON). Existing /api/integrations/exchange-rates endpoint uses Frankfurter+ExchangeRate-API. Existing trade-calculator-view.tsx is 2621 lines, has cost-line currency field but the math IGNORES per-line currency — sums amounts as if all in buy_currency (confirmed bug).
- Spotted the root cause of "edits don't save" suspicion: the Prisma store's upsertTradeCalculation writes to NON-EXISTENT fields (product_catalog_id, unit_price, currency, incoterm, total_cost, cost_per_unit). The Supabase store uses smartUpsert which passes through whatever's in the payload — that path should work. Live test needed to confirm what's actually broken.

Stage Summary:
- Repo ready at /home/z/aspidusReady
- Two confirmed bugs to fix: (1) per-line currency conversion missing in math, (2) prisma-store has stale field names (dev-only impact, but should be fixed).
- Plan: enhance existing types/routes/UI rather than replace; add per-line fx_rate; add live preview switcher; deep audit afterward.

---
Task ID: A-ui-audit
Agent: Explore (UI audit)
Task: Deep analysis of trade-calculator-view.tsx (2621 lines)

Work Log:
- Read /home/z/aspidusReady/src/components/views/trade-calculator-view.tsx in full (4 reads across offsets 1, 350, 600, 900, 1200, 1500, 1800, 2100, 2250).
- Read sibling CostBreakdownPanel: src/components/views/trade-cost-breakdown.tsx (710 lines).
- Read backend POST route: src/app/api/trade-calculator/route.ts.
- Read backend GET/PUT/DELETE route: src/app/api/trade-calculator/[id]/route.ts.
- Read offer-preview route: src/app/api/trade-calculator/[id]/offer-preview/route.ts.
- Read TradeCostLine / TradeCalculation types in src/lib/supabase/types.ts (line 715+).
- Read store selection logic: src/lib/data/store.ts (lines 353-376) — Supabase is default; prisma & mock are opt-in via DB_BACKEND env.
- Read supabase-store.ts smartUpsert (lines 60-136) + upsertTradeCalculation (line 921-922).
- Read prisma-store.ts upsertTradeCalculation (lines 1534-1561) — confirmed it still writes stale field names.
- Read mock-store.ts upsertTradeCalculation (lines 830-848).
- Read src/lib/utils/exchange-rates.ts (full file, 42 lines).
- Read src/lib/data/bank-costs.ts (head + calculateBankCosts/calculateTransferFees).
- Cross-referenced the form-state init useEffect, the save() function, and the auto-fetch-rate useEffect.

Stage Summary:

=== 1. "Edits don't save" bug — TRACE ===

Form state management (lines 797-835):
- Plain useState: `const [form, setForm] = useState<Partial<TradeCalculation>>({});`
  `const [lines, setLines] = useState<TradeCostLine[]>([]);`
- NO form library (no react-hook-form, no zod resolver).
- The `set` helper at line 942-944 uses a FUNCTIONAL update:
    function set<K extends keyof TradeCalculation>(k: K, v: TradeCalculation[K]) {
      setForm((f) => ({ ...f, [k]: v }));
    }
  → NOT vulnerable to stale-state closure capture.

The init useEffect (lines 849-883) — deps `[open, calc]`:
  useEffect(() => {
    if (open) {
      const baseForm = calc ? { ...calc } : { ...defaultForm };
      const editableLines = (calc?.cost_lines || []).filter(l => l.type !== "BUY_PRICE" && l.type !== "SELL_PRICE");
      setForm(baseForm);
      setLines(editableLines);
      setPaymentTerms(""); // and 10 other reset calls
      ...
    }
  }, [open, calc]);

  This effect does NOT clobber user edits during typing because:
  - deps are `[open, calc]`, NOT `[form]` — it only re-fires when the dialog opens
    or when the parent passes a different `calc` reference.
  - While the user is typing, `open` is true and stable, `calc` is the same
    object the parent passed when the dialog opened → effect does NOT re-run.
  - On save success, `onSaved()` sets showForm=false → `open` flips false →
    effect re-runs but the `if (open)` guard short-circuits, leaving state intact.
  → The "edits don't save" bug is NOT in this useEffect.

save() function (lines 1381-1404):
  async function save() {
    if (!form.name) { toast.error("Name is required."); return; }
    setSaving(true);
    try {
      const payload = { ...form, cost_lines: lines };
      const method = calc ? "PUT" : "POST";
      const url = calc ? api(`/api/trade-calculator/${calc.id}`) : api("/api/trade-calculator");
      const r = await fetch(url, { method, headers: {...}, body: JSON.stringify(payload) });
      ...
      onSaved();
    } ...
  }
  - payload = { ...form, cost_lines: lines } — spreads the latest form state.
  - sell_price_per_unit, buy_price_per_unit, etc. ARE inside `form` and ARE sent.
  - Backend PUT (src/app/api/trade-calculator/[id]/route.ts lines 88-127)
    recomputes totals and writes via `auth.store.upsertTradeCalculation(body)`.
  → On Supabase store (default), edits to sell_price_per_unit DO save correctly.

ACTUAL ROOT CAUSE OF "edits don't save" reports (3 candidates, in priority):

(a) Commission UI state is NEVER synced to form before save — CONFIRMED BUG:
    The local state hooks `commissionAgentId` (line 810), `commissionType`
    (line 811), `commissionRate` (line 813) are NOT copied into `form` before
    `payload = { ...form, cost_lines: lines }` is sent. The backend PUT handler
    at /api/trade-calculator/[id]/route.ts lines 84-86 then falls back to the
    existing values (or null/0) — meaning any change the user made to the
    commission agent/type/rate in the UI is silently dropped.
    FIX: in save() (line 1385), build the payload as:
      const payload = {
        ...form,
        cost_lines: lines,
        commission_agent_id: commissionAgentId,
        commission_type: commissionType,
        commission_rate: commissionRate,
      };

(b) Prisma store writes to non-existent fields — CONFIRMED (dev-only):
    src/lib/data/prisma-store.ts lines 1534-1553 hardcodes:
      product_catalog_id, origin_country, destination_country, unit_price,
      currency, incoterm, total_cost, cost_per_unit
    — none of which exist in the TradeCalculation type or the live Prisma
    schema. When DB_BACKEND=prisma, every PUT silently drops
    buy_price_per_unit, sell_price_per_unit, buy_currency, sell_currency,
    exchange_rate, buy_incoterm, sell_incoterm, transport_mode, container_type,
    num_containers, loading_port, delivery_port, name. The Prisma store is
    deprecated (warning logged at store.ts line 364) and Supabase is the
    default, so production users won't hit this — but anyone running the
    Prisma path will see exactly the "edits don't save" symptom.
    FIX: rewrite prisma-store.ts upsertTradeCalculation to map the real fields.

(c) Migration 007 columns may be missing — POTENTIAL:
    The PUT route at /api/trade-calculator/[id]/route.ts lines 84-86 always
    sets `body.commission_agent_id / commission_type / commission_rate`.
    On Supabase, smartUpsert UPDATEs whatever fields are in the payload
    (supabase-store.ts line 109-114). If migration 007 has not been applied
    to the live DB, the UPDATE will fail with PostgREST
    "column 'commission_agent_id' does not exist" → 500 → user sees
    toast.error("Saving failed.").
    FIX: verify migration 007 is applied; OR strip undefined/null commission_*
    fields in smartUpsert (defensive, like the portal_access path does).

=== 2. Per-line currency conversion gap — CONFIRMED at 4 sites ===

The `TradeCostLine` type (src/lib/supabase/types.ts line 717-724) HAS a
`currency: string` field, and the cost-line editor UI exposes a per-line
currency picker (trade-calculator-view.tsx lines 1943-1954). But the math
IGNORES `line.currency` everywhere:

  Client-side preview  — trade-calculator-view.tsx computeTotals():
    lines 252-260: loops `lines`, computes `amount` per line and does
      `landedCost += amount`  ← no conversion from line.currency to buy_currency
    line 266: `totalCosts = computedLines.reduce((s, l) => s + l.amount, 0)`
      ← sums raw amounts
    line 267: `totalCostsInSellCurrency = totalCosts * effectiveFx`
      ← multiplies the (mis-)sum by the buy→sell FX rate, implying all lines
        are in buy_currency

  Backend POST — src/app/api/trade-calculator/route.ts:
    lines 96-108:
      computedLines = body.cost_lines.map(line => { ... landedCost += amount; ...})
      ← same bug: amount added without converting from line.currency to body.buy_currency

  Backend PUT — src/app/api/trade-calculator/[id]/route.ts:
    lines 103-114: identical to POST — `landedCost += amount` ignores line.currency

  CostBreakdownPanel — src/components/views/trade-cost-breakdown.tsx:
    line 275: `fmtMoney(line.amount, buyCurrency)` — every line amount is
      rendered using the calc-level buyCurrency, regardless of the line's own
      currency. The CostLine interface at lines 25-31 doesn't even include a
      `currency` field — so when `preview.computedLines` (TradeCostLine[]) is
      passed to the panel, the per-line currency is silently dropped at the
      TS boundary.

Net effect: a freight line entered in EUR while buy_currency=USD is summed
as if it were USD. With buy→sell FX applied later, the math gets wrong twice
(wrong currency on the line + wrong FX multiplier).

=== 3. Cost line editor UI ===

File: src/components/views/trade-calculator-view.tsx, lines 1888-1964.
Grid layout per line (line 1909): `grid grid-cols-12 gap-2 items-center`.
Columns:
  - col-span-3  Type      — Select (line 1910-1921)
  - col-span-3  Label     — Input (line 1922-1929)
  - col-span-2  Basis     — Badge, read-only (line 1930-1932)
  - col-span-2  Value     — Input number (line 1933-1942)
  - col-span-1  Currency  — Select CURRENCIES (line 1943-1954)  ← EXISTS
  - col-span-1  Remove    — icon button (line 1955-1959)

There IS a per-line currency picker. There is NO per-line FX rate input and
NO per-line converted-amount display. The Currency select uses CURRENCIES
from src/lib/data/reference.ts.

=== 4. Live preview currency switcher — NONE EXISTS ===

Confirmed via grep: `displayCurrency|previewCurrency|viewCurrency|switcher`
appears ONLY in CalcDetail (read-only detail sheet), hardcoded at line 595:
  const displayCurrency = calc.sell_currency || calc.buy_currency || "USD";
CostBreakdownPanel has no displayCurrency concept at all (grep returned no
matches). The form's right-hand sticky panel (CostBreakdownPanel, mounted
at lines 2484-2523) renders every total in either buyCurrency (buy side) or
sellCurrency (sell side), with no user-selectable display currency.

Recommended insertion point for a "View totals in" switcher:
  - PRIMARY: top of CostBreakdownPanel's CardHeader (trade-cost-breakdown.tsx
    lines 217-223) — a Select with options [Sell currency, Buy currency,
    EUR, USD] (filtered to unique currencies among buy/sell/per-line). When
    switched, all fmtMoney calls in the panel re-render with the chosen
    currency and a converted amount.
  - SECONDARY: CalcDetail summary grid (trade-calculator-view.tsx lines
    642-687) — add a small Select in the header row (line 627) to re-render
    the 4 summary cards in the chosen currency.

Implementation must NOT mutate the form — purely a derived view. Add a
`displayCurrency` state and a `convert(amount, fromCurr, toCurr)` helper
that uses the existing `form.exchange_rate` for buy↔sell and fetches other
pairs via `getExchangeRate` (cached 1h, see exchange-rates.ts line 7-8).

=== 5. Bank costs / commission preview ===

bankCostsTotal (lines 1235-1246):
  - useMemo on `[paymentTerms, form.sell_price_per_unit, form.quantity, bankCostOverrides]`
  - txValue = sell_price_per_unit × quantity → IN SELL CURRENCY
  - calculateBankCosts returns BankCostResult[] (sell currency)
  - Rendered in the form (line 2052-2054) with `fmtMoney(cost.amount, form.sell_currency)`
  - PASSED to CostBreakdownPanel via prop `bankCosts={bankCosts}` and
    `totalBankCosts={totalBankCosts}` (lines 2505-2506)

commissionAmount (lines 1306-1330):
  - calcCommissionForProfit(profitBase) where
    profitBase = preview.margin − totalBankCosts − totalTransferFees − totalDocCosts
    preview.margin = sellTotal − landedCostInSellCurrency  ← sell currency
  - All sub-types compute in sell currency (percent_revenue uses preview.sellTotal,
    fixed_per_unit uses rate × qty where rate is entered in sell currency, etc.)
  - Rendered in the form (line 2437) with `fmtMoney(commissionAmount, form.sell_currency)`
  - PASSED to CostBreakdownPanel as `commissionAmount={commissionAmount}` (line 2513)

STORAGE: Both bankCosts and commissionAmount are PURELY CLIENT-SIDE PREVIEW.
The form's `save()` (lines 1381-1404) only sends `{ ...form, cost_lines: lines }`
— it does NOT include totalBankCosts, transferFees, documentationCosts,
commissionAmount, paymentTerms, bankCostOverrides, transferFeeOverrides,
docValueOverrides, commissionAgentId, commissionType, or commissionRate.
None of these are persisted. They reset to defaults every time the dialog
re-opens (see the useEffect at lines 849-883: `setPaymentTerms("")`,
`setBankCostOverrides({})`, `setSelectedDocIds(getDefaultDocumentationIds())`,
`setCommissionAgentId(null)`, `setCommissionType("percent_profit")`,
`setCommissionRate(0)`).

This is the deepest gap of the "edits don't save" report: the entire
Bank/Transfer/Documentation/Commission section is preview-only. Even after
fix (a) above, the bank costs / transfer fees / doc costs themselves are
not persisted — only commission_agent_id/type/rate would be (via the 3
columns from migration 007).

=== 6. Existing exchange rate UI ===

Auto-fetch useEffect (lines 885-910):
  - Endpoint: `getExchangeRate(from, to)` from src/lib/utils/exchange-rates.ts
    → fetches `https://open.er-api.com/v6/latest/${from}` (open.er-api.com,
      free, no API key, 5-second timeout, 1-hour in-memory cache).
  - Fires when `[open, form.buy_currency, form.sell_currency]` change AND
    buy ≠ sell.
  - Stores result via `set("exchange_rate", Math.round(rate * 10000) / 10000)`
    → writes to `form.exchange_rate`.

Manual UI (lines 1825-1886):
  - Input type=number step=0.0001, value={form.exchange_rate ?? 1}
    → EDITABLE. Disabled when buy_currency === sell_currency.
  - Refresh button (RefreshCw icon) calls `getExchangeRate` and
    `set("exchange_rate", rate)` on click (lines 1849-1878).
  - Hint badge "1 {buy} = {rate} {sell}" (lines 1829-1832).

The rate is the buy→sell FX rate. There is NO per-line FX rate field and
NO rate for any other currency pair (e.g. EUR→USD when neither is buy/sell).

=== Recommendations (concrete, minimal-risk) ===

A) Fix the per-line currency conversion (4 sites, additive):
   1. Extend TradeCostLine (src/lib/supabase/types.ts line 717-724) with
      an optional `fx_rate?: number` (rate from line.currency → buy_currency)
      and `amount_in_buy_currency?: number` (cached converted amount).
   2. In computeTotals (trade-calculator-view.tsx lines 252-267): when
      `line.currency !== form.buy_currency`, multiply amount by
      `line.fx_rate || 1` before adding to landedCost and before pushing
      to computedLines. Cache the converted amount on the line object.
   3. Mirror in backend POST (route.ts lines 96-108) and PUT
      ([id]/route.ts lines 103-114) — same logic, server-authoritative.
   4. In the cost-line editor (trade-calculator-view.tsx lines 1909-1960),
      add a small "FX" input (col-span-1, replacing the empty space) that
      shows when `l.currency !== form.buy_currency`. Auto-fetch via
      `getExchangeRate(l.currency, form.buy_currency)` on currency change.
   5. Fix CostBreakdownPanel: extend its CostLine interface (lines 25-31)
      to include `currency?: string`, then render
      `fmtMoney(line.amount, line.currency || buyCurrency)` at line 275
      and add a small "≈ {fmtMoney(convertedAmount, buyCurrency)}" line
      below when currencies differ.

B) Add a "View totals in" switcher (pure UI, no save impact):
   1. In CostBreakdownPanel (trade-cost-breakdown.tsx), add a
      `displayCurrency?: string` prop and a local `useState` for the user's
      choice. Default: sellCurrency. Options: dedupe([sellCurrency, buyCurrency, ...line currencies, "USD", "EUR"]).
   2. Add a Select in the CardHeader (after the title, lines 218-222).
   3. Wrap all `fmtMoney(amount, X)` calls in a `display(amount, fromCurr)`
      helper that converts `fromCurr → displayCurrency` using either
      `props.exchangeRate` (buy↔sell) or a fetched rate (cached via
      getExchangeRate). Use `useEffect` to fetch when displayCurrency
      changes and isn't buy/sell.
   4. Add the same Select to CalcDetail's header (trade-calculator-view.tsx
      line 627) for consistency on the read-only view.

C) Persist the commission + bank-cost state:
   1. In save() (trade-calculator-view.tsx line 1385), extend payload with
      commission_agent_id, commission_type, commission_rate (Fix (a) above).
   2. Decide whether to persist bankCosts / transferFees / documentationCosts
      as additional cost_lines (with type=BANK_COST / TRANSFER_FEE / DOC_COST)
      or as separate JSON columns on trade_calculations. Recommendation:
      ADD AS COST LINES on save (one BUY_PRICE-style implicit row each),
      so the existing totals math picks them up. Filter them back out
      when re-opening the dialog (the existing filter at line 862-865 only
      strips BUY_PRICE/SELL_PRICE — extend it to strip the new types too).

D) Fix prisma-store (low priority — deprecated):
   Rewrite src/lib/data/prisma-store.ts upsertTradeCalculation (lines 1534-1561)
   to map the real TradeCalculation fields. The current code writes to
   non-existent columns (product_catalog_id, unit_price, currency, incoterm,
   total_cost, cost_per_unit) and silently drops all the real fields.

=== Side effects / dependencies to be aware of ===
- The form's `save()` payload includes the entire `form` object, which
  contains `created_at`, `updated_at`, `tenant_id`, `created_by` from the
  original `calc` prop. smartUpsert strips created_at/created_by/updated_at
  (supabase-store.ts lines 105-108) and preserves tenant_id, so this is safe
  on Supabase. The PUT route also explicitly re-sets `body.tenant_id` from
  the existing row ([id]/route.ts line 61) — defensive.
- The PUT route preserves commission_* fields via `?? existing` fallback
  ([id]/route.ts lines 84-86). This means partial PUTs (without commission)
  won't clobber previously-saved commission — but Fix (a) above sends
  commission every save, so partial PUTs won't happen for this view.
- CostBreakdownPanel is also used by any other view that imports it (grep
  showed only trade-calculator-view.tsx imports it — line 71-72). Safe to
  extend its props.
- The offer-preview route reads `c.commission_*` ([offer-preview/route.ts
  lines 167-170). Until Fix (a) is applied, these will always be null/0 on
  the calc row — the "auto-track commission obligation on accept" chain
  documented at offer-preview/route.ts lines 160-165 is currently broken.
- Adding per-line fx_rate requires no DB migration if stored inside the
  JSON `cost_lines` column (the existing schema already stores cost_lines
  as JSON). Verify the Supabase `trade_calculations.cost_lines` column is
  JSONB (it should be, per the type definition).
- Migration 007 must be applied for commission_* columns to exist on the
  live DB. If not applied, the PUT will 500 (see finding 1c above).

=== Exact line numbers for modifications ===
- 1a fix (commission persistence): trade-calculator-view.tsx line 1385
- 1b fix (prisma-store rewrite): prisma-store.ts lines 1534-1561
- 2 fix (per-line FX math, client): trade-calculator-view.tsx lines 252-267
- 2 fix (per-line FX math, POST): app/api/trade-calculator/route.ts lines 96-108
- 2 fix (per-line FX math, PUT): app/api/trade-calculator/[id]/route.ts lines 103-114
- 2 fix (CostBreakdownPanel CostLine interface): trade-cost-breakdown.tsx lines 25-31
- 2 fix (CostBreakdownPanel line.amount rendering): trade-cost-breakdown.tsx line 275
- 3 fix (per-line FX input UI): trade-calculator-view.tsx lines 1909-1960
- 4 (view-totals-in switcher in form panel): trade-cost-breakdown.tsx lines 217-223 (header), and fmtMoney calls throughout
- 4 (view-totals-in switcher in detail sheet): trade-calculator-view.tsx line 627 (header) and 642-687 (summary cards)
- 6 (existing exchange rate UI): trade-calculator-view.tsx lines 885-910 (auto-fetch), 1825-1886 (manual edit + refresh button)

---
Task ID: B-db-live-check
Agent: Explore (live DB + API check)
Task: Verify live Supabase schema + run real API tests

Work Log:
- Read prior worklog (tasks 0-bootstrap, A-ui-audit) to understand the audit context and confirmed-bug list.
- Step 2 — Supabase Management API (POST https://api.supabase.com/v1/projects/nwmwdsslgozqwuufjudj/database/query, Bearer sbp_279e...):
  a. Pulled information_schema.columns for public.trade_calculations (33 columns).
  b. Pulled pg_policies for public.trade_calculations (1 policy).
  c. Confirmed commission_agent_id, commission_type, commission_rate columns exist (migration 007 applied).
  d. Confirmed no separate public.trade_cost_lines table (empty result set).
  e. Pulled pg_stat_user_tables row counts (top 50 of 71 total public tables).
  f. Confirmed no public.exchange_rate_cache table (empty result set).
  Bonus: queried pg_class to confirm RLS is ENABLED but NOT FORCED on trade_calculations (relrowsecurity=t, relforcerowsecurity=f).
- Step 3 — Live Aspidus API (https://aspidus.onrender.com, Bearer asp_f1386...):
  a. GET /api/trade-calculator → HTTP 200, body { items:[...], total:1 }. Single live calc id 45dd7fd7-0fbf-444d-bab8-daa3bfdc0236 "Ponuda Kikiriki za Istanbul". Response includes commission_agent_id / commission_type / commission_rate keys (NULL/NULL/0). cost_lines array contains currency per line.
  b. GET /api/trade-calculator/{id} → HTTP 200. Full object returned (see below). cost_lines[0].currency="EUR", cost_lines[1].currency="USD" — per-line currency IS returned by the API. commission_* present on the single GET too.
  c. PUT /api/trade-calculator/{id} with {"name":"...[verify-edit]"} → HTTP 200, name updated to "Ponuda Kikiriki za Istanbul [verify-edit]". GET confirms persistence (updated_at bumped to 2026-08-10T20:42:33.845868Z). Reverted with second PUT — final name confirmed "Ponuda Kikiriki za Istanbul".
  d. PUT /api/trade-calculator/{id} with {"commission_agent_id":null,"commission_type":"percent_revenue","commission_rate":5} → HTTP 200, response shows commission_type="percent_revenue", commission_rate=5. GET confirms persistence. MIGRATION 007 IS APPLIED ON PROD. (Reverted commission_rate to 0 and commission_type to "" — backend route [id]/route.ts lines 84-86 use `?? existing` fallback so null cannot clear commission_type; sending "" cleared it.)
  e. POST /api/trade-calculator with foreign-currency cost lines (FREIGHT 15000 EUR + INSURANCE 5000 AED, buy/sell both USD, qty 1000 MT, prices 250/300) → HTTP 200, returned id 8e36ab9f-501c-47ce-abc2-976eefa595b6. total_landed_cost=270000 (250*1000+15000+5000), gross_margin=30000 (300*1000-270000), margin_percent=10. SILENT BUG CONFIRMED: 15000 EUR and 5000 AED were added to USD as if 1:1, no FX conversion. Deleted via DELETE /api/trade-calculator/{id} → HTTP 200 {"ok":true}; GET after delete → HTTP 404.
- Verified final state: GET /api/trade-calculator → total=1, only the original calc remains with name="Ponuda Kikiriki za Istanbul", commission_* reset to null/0/null. (Note: updated_at bumped from 2026-08-10T19:59:11 to 2026-08-10T20:43:36 — unavoidable side effect of the revert PUTs.)

Stage Summary:

=== LIVE SCHEMA (public schema on nwmwdsslgozqwuufjudj) ===

trade_calculations columns (33 total, in storage order):
  id                       text           NOT NULL  default (gen_random_uuid())::text
  tenant_id                text           NOT NULL
  name                     text           NOT NULL
  product_id               text           NULL
  supplier_offer_id        text           NULL
  supplier_id              text           NULL
  buyer_id                 text           NULL
  quantity                 numeric        NOT NULL  default 0
  unit                     text           NOT NULL  default 'MT'
  num_containers           integer        NOT NULL  default 1
  container_type           text           NULL
  buy_price_per_unit       numeric        NOT NULL  default 0
  buy_currency             text           NOT NULL  default 'USD'
  buy_incoterm             text           NOT NULL  default 'FOB'
  sell_price_per_unit      numeric        NOT NULL  default 0
  sell_currency            text           NOT NULL  default 'USD'
  sell_incoterm            text           NOT NULL  default 'CIF'
  transport_mode           text           NOT NULL  default 'SEA'
  loading_port             text           NULL
  delivery_port            text           NULL
  exchange_rate            numeric        NOT NULL  default 1
  cost_lines               jsonb          NOT NULL  default '[]'::jsonb     ← JSONB, NOT a separate table
  total_buy_cost           numeric        NOT NULL  default 0
  total_landed_cost        numeric        NOT NULL  default 0
  total_sell_revenue       numeric        NOT NULL  default 0
  gross_margin             numeric        NOT NULL  default 0
  margin_percent           numeric        NOT NULL  default 0
  created_by               text           NULL
  created_at               timestamptz    NOT NULL  default now()
  updated_at               timestamptz    NOT NULL  default now()
  commission_agent_id      text           NULL      ← migration 007
  commission_type          text           NULL      ← migration 007
  commission_rate          real           NULL  default 0   ← migration 007

Migration 007 applied: YES (all 3 commission_* columns present with nullable / default 0, matching the route's `?? existing ?? null/0` fallback).

cost_lines column type: JSONB (udt_name = jsonb). NOT a separate table.

trade_cost_lines separate table: NO (information_schema returned 0 rows). Prisma schema likely defines a relation but it's not materialized as a table — lines live inside trade_calculations.cost_lines JSONB.

exchange_rate_cache table: NO (information_schema returned 0 rows). The Frankfurter/er-api.com integration in src/lib/utils/exchange-rates.ts uses an in-memory 1-hour cache (per task 0-bootstrap + A-ui-audit findings); no DB-backed cache exists on prod.

Total public tables: 71. Top 10 by n_live_tup:
  audit_logs 1127, products 364, login_history 291, sessions 104, supplier_offers 61,
  erp_accounts 54, user_preferences 32, product_catalog 31, verification_logs 26,
  notifications 25.
trade_calculations: n_live_tup=1, n_dead_tup=7 (7 historical deletes — prior testing). Other notable tables:
  commission_agents 3, offers 7, portal_access 5, document_register 21, partners 17,
  tenants 3, users 6, api_keys 2, feature_flags 3.

=== RLS POLICIES on trade_calculations ===
Single policy:
  policyname : trade_calculations_tenant_isolated
  cmd        : ALL
  qual       : (tenant_id = current_setting('app.tenant_id'::text, true))
  with_check : (tenant_id = current_setting('app.tenant_id'::text, true))
RLS enabled on the table (relrowsecurity=true) but NOT FORCED (relforcerowsecurity=false), meaning table owners bypass RLS even when impersonating.
The API server presumably sets app.tenant_id via SET LOCAL before each query (or uses the service-role key which bypasses RLS entirely). Either way, tenant scoping for ordinary requests is enforced via this single policy.

=== LIVE API TEST RESULTS ===

List endpoint GET /api/trade-calculator:
  - WORKS. HTTP 200. Returns { items: [...], total: N }.
  - Current prod count: 1 calc (id 45dd7fd7-0fbf-444d-bab8-daa3bfdc0236, "Ponuda Kikiriki za Istanbul").
  - Response objects DO include commission_agent_id / commission_type / commission_rate keys (so migration 007 columns are exposed via the API surface, not just present in the DB).

GET single /api/trade-calculator/{id}:
  - WORKS. HTTP 200.
  - Returns full object identical in shape to the list item (no extra fields).
  - cost_lines DO contain currency per line (confirmed: EUR + USD on the live calc).
  - commission_agent_id DOES appear on the response (null on the only existing calc).

PUT name change:
  - HTTP 200. Name persisted (verified via GET).
  - updated_at bumped appropriately.
  - Reverted successfully.

PUT commission fields (migration 007 prod verification):
  - HTTP 200 (NOT 500). Body returned with commission_type="percent_revenue", commission_rate=5.
  - Persistence verified via GET.
  - CONFIRMED: migration 007 is applied on prod. The "500 on missing column" failure mode from finding 1c in the prior audit DOES NOT exist on prod.
  - Backend route [id]/route.ts lines 84-86 use `body.commission_* ?? existing ?? null/0` — sending null DOES NOT clear (because null ?? existing returns existing). Sending "" DID clear commission_type back to null. So the API has a hidden quirk: clear-to-null requires sending empty string, not null.

POST with foreign-currency cost lines:
  - HTTP 200. Created id 8e36ab9f-501c-47ce-abc2-976eefa595b6.
  - Returned total_landed_cost = 270000   (= 250*1000 + 15000 + 5000)
  - Returned total_buy_cost   = 250000   (= 250*1000)         ✓ correct
  - Returned total_sell_revenue = 300000 (= 300*1000)         ✓ correct
  - Returned gross_margin      = 30000   (= 300000 - 270000)  ← matches predicted bug math
  - Returned margin_percent    = 10
  - cost_lines returned with currency preserved per line (EUR, AED), AND each line's "amount" was set to its raw "value" (15000, 5000) — NO conversion applied.
  - SILENT BUG CONFIRMED: the server treats EUR 15000 and AED 5000 as if they were USD 15000 and USD 5000. The correct math would require FX conversion (15000 EUR ≈ 16200 USD, 5000 AED ≈ 1360 USD), which is exactly the bug documented in finding 2 of the prior audit. There is no warning, no error, no per-line FX column.
  - Deleted the test calc via DELETE /api/trade-calculator/{id} → HTTP 200 {"ok":true}; subsequent GET → HTTP 404.

=== CONFIRMED BROKEN vs WORKING on PROD ===

WORKING on prod:
- Migration 007 columns present and writable via API.
- All CRUD endpoints on /api/trade-calculator respond correctly (list, get-by-id, post, put, delete).
- cost_lines JSONB stores and returns per-line `currency` field intact.
- RLS tenant-isolation policy in place.
- Name edits persist (the "edits don't save" symptom is NOT a server-side failure on Supabase for fields the form actually sends).
- commission_* PUT works (resolves prior audit finding 1c — that scenario does not reproduce on prod).
- offer-preview chain (which reads c.commission_*) is unblocked at the DB layer (still depends on Fix (a) actually populating the columns — see prior audit).

CONFIRMED BROKEN on prod:
- Per-line currency conversion is silently skipped server-side (POST + PUT routes compute `landedCost += amount` without applying any FX per line). A freight line in EUR while buy_currency=USD is summed as USD 1:1. Same on the existing live calc (Customs Broker 300 EUR is added to 235 USD as if both were USD → total_landed_cost=33855 instead of ~33855+FX-on-300).
- No DB-backed exchange_rate_cache table exists; FX is fetched ad-hoc from open.er-api.com with only an in-memory 1-hour cache (works, but no audit trail / no per-pair history).
- commission_type cannot be cleared to null via the API (requires sending "" — a hidden quirk; mild concern for the UI once Fix (a) lands).
- The entire Bank/Transfer/Documentation/Commission UI section is preview-only — none of those numbers persist (per prior audit finding 5; confirmed by inspecting the returned object on the live calc — no bank_costs/transfer_fees/documentation_costs columns exist, no extra cost_lines of those types present).

State left in: the live DB / API was returned to its original state. The only unavoidable side-effect is that updated_at on the single existing calc bumped from 2026-08-10T19:59:11 to 2026-08-10T20:43:36 (a result of the verification PUTs and the revert PUT). No data was created, modified, or destroyed other than the temporary test calc which was created then deleted.
