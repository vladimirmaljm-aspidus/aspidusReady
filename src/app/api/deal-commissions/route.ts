import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// GET /api/deal-commissions?tenant_id=xxx&deal_id=xxx&agent_id=xxx
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    // Permission gate (commissions.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "commissions.read"); if (_d) return _d; } /* requirePermission wired */

    const tenantId = resolveTenantId(auth, req);
    if (!tenantId) return NextResponse.json({ error: "Tenant ID is required." }, { status: 400 });

    const url = new URL(req.url);
    const dealId = url.searchParams.get("deal_id");
    const agentId = url.searchParams.get("agent_id");

    if (dealId) {
      const items = await auth.store.listDealCommissionsByDeal(dealId);
      return NextResponse.json({ items, total: items.length });
    }
    if (agentId) {
      const items = await auth.store.listDealCommissionsByAgent(agentId);
      return NextResponse.json({ items, total: items.length });
    }

    const search = url.searchParams.get("search") || undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
    const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;

    const result = await auth.store.listDealCommissions(tenantId, { search, limit, offset });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/deal-commissions
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
  // Permission gate (commissions.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "commissions.create"); if (_d) return _d; } /* requirePermission wired */

    const tenantId = resolveTenantId(auth, req);
    if (!tenantId) return NextResponse.json({ error: "Tenant ID is required." }, { status: 400 });

    const body = await req.json();
    body.tenant_id = tenantId;

    // Normalize field names (same as commission-agents route)
    if (body.rate !== undefined && body.commission_rate === undefined) {
      body.commission_rate = body.rate;
    }
    if (body.currency !== undefined && body.commission_currency === undefined) {
      body.commission_currency = body.currency;
    }
    if (body.per_unit !== undefined && body.commission_per_unit === undefined) {
      body.commission_per_unit = body.per_unit;
    }
    if (body.custom_formula !== undefined && body.commission_custom_formula === undefined) {
      body.commission_custom_formula = body.custom_formula;
    }
    if (!body.commission_currency) body.commission_currency = "USD";
    if (!body.commission_type) body.commission_type = "profit_percent";

    // Validate required fields
    if (!body.deal_id) return NextResponse.json({ error: "deal_id is required." }, { status: 400 });
    if (!body.agent_id) return NextResponse.json({ error: "agent_id is required." }, { status: 400 });
    if (!body.partner_id) {
      // Try to resolve partner_id from the agent
      const agent = await auth.store.getCommissionAgent(body.agent_id);
      if (agent) body.partner_id = agent.partner_id;
    }

    // Auto-calculate commission if agent_id is provided
    if (body.agent_id && !body.calculated_commission) {
      const agent = await auth.store.getCommissionAgent(body.agent_id);
      if (agent) {
        body.commission_type = body.commission_type || agent.commission_type;
        body.commission_rate = body.commission_rate ?? agent.commission_rate;
        body.commission_per_unit = body.commission_per_unit ?? agent.commission_per_unit;
        body.commission_custom_formula = body.commission_custom_formula ?? agent.commission_custom_formula;
        body.commission_currency = body.commission_currency || agent.commission_currency;
        body.calculated_commission = await auth.store.calculateCommission(
          agent.id,
          body.deal_value || 0,
          body.deal_profit || 0,
          body.deal_quantity || 0,
          body.deal_unit || "",
          body.commission_currency || "USD"
        );
      }
    }

    const created = await auth.store.upsertDealCommission(body);
    await audit(auth.store, auth.user, req, "deal_commission.create", "deal_commission", created.id, { deal_id: created.deal_id, agent_id: created.agent_id });

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
