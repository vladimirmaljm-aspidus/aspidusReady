import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAuthOrApiKey, audit, resolveTenantId } from "@/lib/api/helpers";
import { TradeCostLine } from "@/lib/supabase/types";
import { TRADE_COST_TYPES } from "@/lib/data/reference";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
    // Permission gate (trade-calculator.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "trade-calculator.read"); if (_d) return _d; } } /* requirePermission wired */

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant context." }, { status: 400 });
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

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant context." }, { status: 400 });
  const body = await req.json();
  body.tenant_id = tenantId;
  if (!body.created_by && "user" in auth) body.created_by = auth.user.id;

  // Compute totals from cost lines
  const qty = body.quantity || 0;
  const numContainers = body.num_containers || 1;
  const buyTotal = (body.buy_price_per_unit || 0) * qty;

  let landedCost = buyTotal;
  const computedLines: TradeCostLine[] = (body.cost_lines || []).map((line: TradeCostLine) => {
    const ref = TRADE_COST_TYPES.find((t) => t.code === line.type);
    let amount = 0;
    if (line.basis === "unit") amount = line.value * qty;
    else if (line.basis === "fixed") amount = line.value;
    else if (line.basis === "per_container") amount = line.value * numContainers;
    else if (line.basis === "percent") {
      // percent applies to buyTotal + accumulated costs (CIF value)
      amount = (landedCost * line.value) / 100;
    }
    landedCost += amount;
    return { ...line, amount: Math.round(amount * 100) / 100 };
  });

  const sellTotal = (body.sell_price_per_unit || 0) * qty;
  const margin = sellTotal - landedCost;
  const marginPct = landedCost > 0 ? (margin / sellTotal) * 100 : 0;

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
