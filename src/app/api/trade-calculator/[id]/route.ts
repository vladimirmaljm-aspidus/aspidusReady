import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrApiKey, audit, resolveTenantId } from "@/lib/api/helpers";
import { TradeCostLine } from "@/lib/supabase/types";
import { TRADE_COST_TYPES } from "@/lib/data/reference";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthOrApiKey(_req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const item = await auth.store.getTradeCalculation(id);
  if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
  // Tenant ownership check (for session auth — API keys are always scoped to their tenant)
  if ("user" in auth && !auth.isSuperAdmin && (item as any).tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(item);
}

/**
 * PUT /api/trade-calculator/[id]
 * Update an existing trade calculation.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant context." }, { status: 400 });

  const { id } = await params;
  const existing = await auth.store.getTradeCalculation(id);
  if (!existing) return NextResponse.json({ error: "Trade calculation not found." }, { status: 404 });
  // Tenant ownership check (for session auth)
  if ("user" in auth && !auth.isSuperAdmin && (existing as any).tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Trade calculation not found." }, { status: 404 });
  }

  try {
    const body = await req.json();
    body.id = id;
    // Preserve the entity's tenant_id (regular users cannot move it to another tenant)
    body.tenant_id = (existing as any).tenant_id || tenantId;

    // Compute totals from cost lines
    const qty = body.quantity || (existing as any).quantity || 0;
    const numContainers = body.num_containers || (existing as any).num_containers || 1;
    const buyPrice = body.buy_price_per_unit ?? (existing as any).buy_price_per_unit ?? 0;
    const sellPrice = body.sell_price_per_unit ?? (existing as any).sell_price_per_unit ?? 0;
    const buyTotal = buyPrice * qty;

    let landedCost = buyTotal;
    const computedLines: TradeCostLine[] = (body.cost_lines || (existing as any).cost_lines || []).map((line: TradeCostLine) => {
      const ref = TRADE_COST_TYPES.find((t) => t.code === line.type);
      let amount = 0;
      if (line.basis === "unit") amount = line.value * qty;
      else if (line.basis === "fixed") amount = line.value;
      else if (line.basis === "per_container") amount = line.value * numContainers;
      else if (line.basis === "percent") {
        amount = (landedCost * line.value) / 100;
      }
      landedCost += amount;
      return { ...line, amount: Math.round(amount * 100) / 100 };
    });

    const sellTotal = sellPrice * qty;
    const margin = sellTotal - landedCost;
    const marginPct = landedCost > 0 ? (margin / sellTotal) * 100 : 0;

    body.cost_lines = computedLines;
    body.total_buy_cost = Math.round(buyTotal * 100) / 100;
    body.total_landed_cost = Math.round(landedCost * 100) / 100;
    body.total_sell_revenue = Math.round(sellTotal * 100) / 100;
    body.gross_margin = Math.round(margin * 100) / 100;
    body.margin_percent = Math.round(marginPct * 100) / 100;

    const updated = await auth.store.upsertTradeCalculation(body);
    const auditUser = "user" in auth ? auth.user : { id: auth.apiKeyId, username: auth.apiKeyName, tenant_id: auth.tenantId };
    await audit(auth.store, auditUser, req, "trade_calc.update", "trade_calculation", updated.id, { name: updated.name });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("[trade-calculator PUT]", e);
    return NextResponse.json({ error: e.message || "Failed to update trade calculation." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  // Tenant ownership check before delete
  const existing = await auth.store.getTradeCalculation(id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if ("user" in auth && !auth.isSuperAdmin && (existing as any).tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await auth.store.deleteTradeCalculation(id);
  const auditUser = "user" in auth ? auth.user : { id: auth.apiKeyId, username: auth.apiKeyName, tenant_id: auth.tenantId };
  await audit(auth.store, auditUser, req, "trade_calc.delete", "trade_calculation", id);
  return NextResponse.json({ ok: true });
}
