import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAuthOrApiKey, audit, resolveTenantId } from "@/lib/api/helpers";
import { TradeCostLine } from "@/lib/supabase/types";
import { TRADE_COST_TYPES } from "@/lib/data/reference";
import { getExchangeRate } from "@/lib/utils/exchange-rates";

export const runtime = "nodejs";

/**
 * Normalize commission type from UI format to backend enum.
 * CRITICAL FIX (audit C-2): UI saves percent_profit/percent_revenue/fixed_per_unit/fixed_total
 * but backend expects profit_percent/revenue_percent/per_unit/fixed.
 * Without normalization, every commission computes to $0.
 */
function normalizeCommissionType(t: string | null | undefined): string | null {
  if (!t) return null;
  const map: Record<string, string> = {
    percent_profit: "profit_percent",
    percent_revenue: "revenue_percent",
    fixed_per_unit: "per_unit",
    fixed_total: "fixed",
    // Pass-through already-correct values:
    profit_percent: "profit_percent",
    revenue_percent: "revenue_percent",
    per_unit: "per_unit",
    fixed: "fixed",
  };
  return map[t] || t;
}

export async function GET(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
    // Permission gate (trade-calculator.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "trade-calculator.read"); if (_d) return _d; } } /* requirePermission wired */
  // Feature gate (module_trade)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _tid = ("apiKeyId" in auth) ? auth.tenantId : auth.tenantId;
    const _isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const _f = await requireFeature(_tid, "module_trade", _isSA); if (_f) return _f; } /* requireFeature wired */

  const tenantId = resolveTenantId(auth, req);
  // Super-admin without an active tenant selected: return empty rather than
  // 400 — the view is meant to be tenant-scoped and the client is not
  // "broken", the user just hasn't chosen a tenant yet.
  if (!tenantId) return NextResponse.json({ items: [], total: 0 });
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || undefined;
  const result = await auth.store.listTradeCalculations(tenantId, { search });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
  // Permission gate (trade-calculator.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "trade-calculator.create"); if (_d) return _d; } } /* requirePermission wired */
  // Feature gate (module_trade)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _tid = ("apiKeyId" in auth) ? auth.tenantId : auth.tenantId;
    const _isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const _f = await requireFeature(_tid, "module_trade", _isSA); if (_f) return _f; } /* requireFeature wired */

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant context." }, { status: 400 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  body.tenant_id = tenantId;
  if (!body.created_by && "user" in auth) body.created_by = auth.user.id;

  // Validate exchange_rate (Fix 8): must be positive when provided. A negative
  // rate flows through to `landedCostInSellCurrency` as a negative multiplier
  // → margin wildly inflates. Zero is silently coerced to 1 below (matches
  // existing behaviour for the same-currency edge case).
  if (body.exchange_rate !== undefined && body.exchange_rate !== null) {
    const rate = Number(body.exchange_rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      return NextResponse.json({ error: "Exchange rate must be a positive number." }, { status: 400 });
    }
  }

  // Validate commission_rate (Fix 8 — assertNonNegative): percent or fixed
  // amount cannot be negative. We allow 0 (no commission).
  if (body.commission_rate !== undefined && body.commission_rate !== null) {
    const cr = Number(body.commission_rate);
    if (!Number.isFinite(cr) || cr < 0) {
      return NextResponse.json({ error: "Commission rate must be a non-negative number." }, { status: 400 });
    }
    body.commission_rate = cr;
  }

  // Persist commission tracking fields (Fix 1) — they were previously dropped
  // because the columns didn't exist on the live schema. After migration 007
  // is applied, these flow through `upsertTradeCalculation` → smartUpsert
  // and are saved on the trade_calculations row. They're later read by the
  // offer-preview endpoint to auto-track commission obligations on accept.
  body.commission_agent_id = body.commission_agent_id ?? null;
  // CRITICAL FIX (audit C-2): normalize UI commission types to backend enum.
  // UI sends: percent_profit | percent_revenue | fixed_per_unit | fixed_total
  // Backend expects: profit_percent | revenue_percent | per_unit | fixed
  // Without this, every commission computes to $0 (switch falls through to default).
  body.commission_type = normalizeCommissionType(body.commission_type);

  // Compute totals from cost lines
  const qty = body.quantity || 0;
  const numContainers = body.num_containers || 1;
  const buyTotal = (body.buy_price_per_unit || 0) * qty;
  // Exchange rate: sell_currency per buy_currency. When currencies differ,
  // landed cost (in buy currency) must be converted to sell currency before
  // subtracting from sell revenue to compute margin. Audit T-series.
  const fxRate = Number(body.exchange_rate) || 1;
  const currenciesDiffer =
    !!body.buy_currency && !!body.sell_currency && body.buy_currency !== body.sell_currency;
  const effectiveFx = currenciesDiffer ? fxRate : 1;

  let landedCost = buyTotal;
  // Cost lines: each line has its own `currency`. Convert each line's amount
  // to buy_currency via its `fx_rate` before adding to landedCost. This is the
  // fix for the silent multi-currency bug (EUR freight was summed as if USD).
  // The `fx_rate` is snapshotted server-side from the live rate at save time
  // so historical calcs stay accurate when rates move.
  const buyCurrency = (body.buy_currency || "USD").toUpperCase();
  const computedLines: TradeCostLine[] = [];
  for (const line of (body.cost_lines || []) as TradeCostLine[]) {
    let amount = 0;
    if (line.basis === "unit") amount = line.value * qty;
    else if (line.basis === "fixed") amount = line.value;
    else if (line.basis === "per_container") amount = line.value * numContainers;
    else if (line.basis === "percent") {
      // percent applies to buyTotal + accumulated costs (CIF value)
      amount = (landedCost * line.value) / 100;
    }
    amount = Math.round(amount * 100) / 100;

    // Resolve line.fx_rate: prefer user-supplied, else snapshot live rate
    // when line.currency differs from buy_currency. Same currency = 1.
    const lineCurrency = (line.currency || buyCurrency).toUpperCase();
    let fxRate: number | undefined = undefined;
    if (lineCurrency === buyCurrency) {
      fxRate = 1;
    } else if (typeof line.fx_rate === "number" && line.fx_rate > 0) {
      // User-supplied (possibly manual) rate — trust it.
      fxRate = line.fx_rate;
    } else {
      const live = await getExchangeRate(lineCurrency, buyCurrency);
      fxRate = live && live > 0 ? live : 1;
    }
    const convertedAmount = Math.round(amount * fxRate * 100) / 100;

    landedCost += convertedAmount;
    computedLines.push({
      ...line,
      currency: lineCurrency,
      amount,
      fx_rate: fxRate,
      converted_amount: convertedAmount,
    });
  }

  const sellTotal = (body.sell_price_per_unit || 0) * qty;
  // Convert landed cost (buy currency) → sell currency for the margin math.
  const landedCostInSellCurrency = landedCost * effectiveFx;
  const margin = sellTotal - landedCostInSellCurrency;
  const marginPct = sellTotal > 0 ? (margin / sellTotal) * 100 : 0;

  body.cost_lines = computedLines;
  body.total_buy_cost = Math.round(buyTotal * 100) / 100;
  body.total_landed_cost = Math.round(landedCost * 100) / 100;
  body.total_sell_revenue = Math.round(sellTotal * 100) / 100;
  body.gross_margin = Math.round(margin * 100) / 100;
  body.margin_percent = Math.round(marginPct * 100) / 100;

  const created = await auth.store.upsertTradeCalculation(body);
  const auditUser = "user" in auth ? auth.user : { id: auth.apiKeyId, username: auth.apiKeyName, tenant_id: auth.tenantId };
  await audit(auth.store, auditUser, req, body.id ? "trade_calc.update" : "trade_calc.create", "trade_calculation", created.id, { name: created.name });
  return NextResponse.json(created);
}
