import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrApiKey, resolveTenantId, hasPermission, audit, type AuthContext, type ApiKeyAuthContext } from "@/lib/api/helpers";
import { nextDocNumber, formatDocNumber } from "@/lib/api/doc-number";
import { getSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

function getAuthUser(auth: AuthContext | ApiKeyAuthContext) {
  if ("user" in auth) return auth.user;
  return { id: `api:${auth.apiKeyId}`, username: auth.apiKeyName, tenant_id: auth.tenantId };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(req);
    if (auth instanceof NextResponse) return auth;
    // Permission gate (offers.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "offers.read"); if (_d) return _d; } } /* requirePermission wired */

    const tid = resolveTenantId(auth, req);

    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "offers:read")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const partner_id = url.searchParams.get("partner_id") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
    const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;
    const result = await auth.store.listOffers(tid!, { search, limit, offset, filters: { partner_id, status } });
    // Defense-in-depth: even though SupabaseStore filters by tenant_id,
    // this post-filter provides an extra safety layer. Do NOT remove.
    const shouldFilter = "apiKeyId" in auth || !auth.isSuperAdmin;
    if (shouldFilter && auth.tenantId) {
      const before = result.items.length;
      result.items = result.items.filter((o) => o.tenant_id === auth.tenantId);
      result.total = result.total - (before - result.items.length);
    }
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[offers GET]", e);
    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(req);
    if (auth instanceof NextResponse) return auth;
    // Permission gate (offers.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "offers.create"); if (_d) return _d; } } /* requirePermission wired */
    // Feature gate (module_trade) — prevents Trial tenants with module_trade=false
    // from using the API directly even though the UI hides the menu.
    { const { requireFeature } = await import("@/lib/api/feature-guard");
      const _tid = ("apiKeyId" in auth) ? auth.tenantId : auth.tenantId;
      const _isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
      const _f = await requireFeature(_tid, "module_trade", _isSA); if (_f) return _f; }

    const tid = resolveTenantId(auth, req);

    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "offers:write")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
  body.tenant_id = tid!;
  if (!body.owner_id && "user" in auth) body.owner_id = auth.user.id;

  // CRITICAL FIX (audit P1-5): validate partner_id belongs to caller's tenant.
  // Without this, a tenant-A user can create an offer referencing tenant-B's
  // partner — polluting downstream reports and commission calculations.
  if (body.partner_id) {
    const partner = await auth.store.getPartner(body.partner_id);
    if (partner && partner.tenant_id !== tid) {
      return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    }
  }
  // ── Strip `_` prefixed metadata fields BEFORE upserting ──────────────
  // These are passed through by the offer form when the offer was pre-filled
  // from a Trade Calculator preview (Fix 1). They carry trade-calc-only
  // metadata (commission agent, buy price, margin…) used downstream by the
  // auto-track commission obligation block (Fix 2). They MUST be stripped
  // before `upsertOffer` because they're not real columns on the offers
  // table — leaving them in would make PostgREST reject the upsert with a
  // "column does not exist" error.
  const tradeCalcMeta = {
    _trade_calc_id: (body as any)._trade_calc_id || null,
    _commission_agent_id: (body as any)._commission_agent_id || null,
    _commission_type: (body as any)._commission_type || null,
    _commission_rate: Number((body as any)._commission_rate) || 0,
    _commission_amount: Number((body as any)._commission_amount) || 0,
    _buy_price_per_unit: Number((body as any)._buy_price_per_unit) || 0,
    _buy_currency: (body as any)._buy_currency || null,
    _landed_cost: Number((body as any)._landed_cost) || 0,
    _margin: Number((body as any)._margin) || 0,
  };
  for (const k of [
    "_trade_calc_id",
    "_commission_agent_id",
    "_commission_type",
    "_commission_rate",
    "_commission_amount",
    "_buy_price_per_unit",
    "_buy_currency",
    "_landed_cost",
    "_margin",
  ]) {
    delete (body as any)[k];
  }

  // Always recompute totals from items when items are provided — never trust
  // client-supplied totals (FLOW-7: previously skipped when body.total was
  // present, allowing tampered totals to disagree with line items).
  if (Array.isArray(body.items) && body.items.length > 0) {
    let subtotal = 0, discountTotal = 0, taxTotal = 0;
    for (const it of body.items) {
      const line = it.quantity * it.unit_price;
      const disc = line * (it.discount || 0) / 100;
      const net = line - disc;
      const tax = net * (it.tax_rate || 0) / 100;
      subtotal += line;
      discountTotal += disc;
      taxTotal += tax;
      // Round each line total to 2 decimals to prevent floating-point
      // drift (e.g. 32199.999999999996 → 32200.00). Audit fix P2-15.
      it.total = Math.round((net + tax) * 100) / 100;
    }
    body.subtotal = Math.round(subtotal * 100) / 100;
    body.discount_total = Math.round(discountTotal * 100) / 100;
    body.tax_total = Math.round(taxTotal * 100) / 100;
    body.total = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;
  }
  if (!body.id) {
    const isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const { enforceQuota } = await import("@/lib/api/plan-limits");
    const denied = await enforceQuota(body.tenant_id, "monthly_documents", isSA);
    if (denied) return denied;
  }

  // Auto-generate document number if not provided (e.g. manual "Create" click).
  // Atomic: tries the `get_next_doc_number` Postgres SEQUENCE RPC first;
  // falls back to the legacy `listOffers().total + 1` if the RPC is
  // unavailable (e.g. before the 004 migration has been applied).
  //   Format: OF-<year>-<NNNN>  (4-digit sequence)
  if (!body.id && !body.number) {
    const year = new Date().getFullYear();
    const seqNum = await nextDocNumber("offer");
    if (seqNum) {
      body.number = seqNum;
    } else {
      try {
        // FIX (audit P2-20): year-aware fallback — count only offers with
        // current year prefix so the sequence resets at year boundary.
        const existing = await auth.store.listOffers(tid!, { limit: 1000 });
        const yearPrefix = `${year}`;
        const yearCount = existing.items.filter((i: any) =>
          i.number?.startsWith(`OF-${yearPrefix}-`)
        ).length;
        const nextSeq = yearCount + 1;
        body.number = formatDocNumber("offer", year, nextSeq);
      } catch (e) {
        console.error("[offers.post] number auto-gen failed:", e);
        return NextResponse.json({ error: "Failed to auto-generate offer number." }, { status: 500 });
      }
    }
  }

  let created;
  try {
    created = await auth.store.upsertOffer(body);
  } catch (e: any) {
    // Retry once with bumped sequence in case of unique-collision race.
    if (!body.id && body.number) {
      try {
        const m = body.number.match(/^(OF-\d{4}-)(\d+)$/);
        if (m) {
          body.number = `${m[1]}${String(Number(m[2]) + 1).padStart(4, "0")}`;
          created = await auth.store.upsertOffer(body);
        } else {
          throw e;
        }
      } catch (e2: any) {
        console.error("[offers.post] upsert retry failed:", e2);
        return NextResponse.json({ error: e2.message || "Failed to create offer." }, { status: 500 });
      }
    } else {
      console.error("[offers.post] upsert failed:", e);
      return NextResponse.json({ error: e.message || "Failed to create offer." }, { status: 500 });
    }
  }
  await audit(auth.store, getAuthUser(auth), req, body.id ? "offer.update" : "offer.create", "offer", created.id, { number: created.number });

  // ── Fix 2: Auto-track commission obligation ─────────────────────────
  // When an offer is created from a trade calc that carried commission data
  // (agent_id + rate), automatically:
  //   1. Find or create a Deal linked to this offer
  //   2. Insert a `deal_commissions` row with status "pending" so the
  //      obligation is tracked from offer creation → invoice payment.
  //
  // Failures here MUST NOT fail the offer creation — we log + audit, and
  // the user can still create the commission manually from the deals view.
  if (!body.id && tradeCalcMeta._trade_calc_id && tradeCalcMeta._commission_agent_id) {
    try {
      const sb = getSupabase();

      // 1. Find or create a deal for this offer.
      let dealId: string | null = (created as any).deal_id || null;
      if (!dealId) {
        const dealRow = {
          tenant_id: tid,
          title: created.subject || `Deal for ${created.number}`,
          partner_id: created.partner_id,
          owner_id: "user" in auth ? auth.user.id : null,
          stage: "qualified",
          value: created.total,
          currency: created.currency,
          // Cost tracking — store buy cost so commission "profit_percent"
          // calculations work out of the box.
          buy_cost: tradeCalcMeta._landed_cost || 0,
          quantity: (created.items?.[0]?.quantity) || 0,
          unit: (created.items?.[0]?.unit) || "MT",
          commission_agent_id: tradeCalcMeta._commission_agent_id,
        };
        const { data: deal, error: dealErr } = await sb
          .from("deals")
          .insert(dealRow)
          .select()
          .maybeSingle();
        if (dealErr) throw dealErr;
        dealId = deal?.id || null;

        // Link offer to deal so future deal→commission flows can find it.
        if (dealId) {
          await sb.from("offers").update({ deal_id: dealId }).eq("id", created.id);
        }
      }

      // 2. Create pending commission record.
      if (dealId) {
        // Look up the agent's default settings so we can fall back when the
        // trade calc didn't carry an explicit rate / type.
        let commissionType = tradeCalcMeta._commission_type;
        let commissionRate = tradeCalcMeta._commission_rate;
        let commissionCurrency = created.currency || "USD";
        let commissionPerUnit = 0;
        let agentPartnerId: string | null = null;
        try {
          const { data: agent } = await sb
            .from("commission_agents")
            .select("*")
            .eq("id", tradeCalcMeta._commission_agent_id)
            .maybeSingle();
          if (agent) {
            commissionType = commissionType || agent.commission_type;
            commissionRate = commissionRate || Number(agent.commission_rate) || 0;
            commissionPerUnit = Number(agent.commission_per_unit) || 0;
            commissionCurrency = agent.commission_currency || commissionCurrency;
            agentPartnerId = agent.partner_id || null;
          }
        } catch { /* keep defaults */ }

        // Compute the commission amount. If the trade calc carried an
        // explicit `_commission_amount` (e.g. the calc UI computed it),
        // use it verbatim. Otherwise fall back to rate × base.
        const dealValue = Number(created.total) || 0;
        const dealProfit = Number(tradeCalcMeta._margin) || 0;
        let calculatedCommission = tradeCalcMeta._commission_amount;
        if (!calculatedCommission) {
          switch (commissionType) {
            case "profit_percent":
              calculatedCommission = (dealProfit * commissionRate) / 100;
              break;
            case "revenue_percent":
              calculatedCommission = (dealValue * commissionRate) / 100;
              break;
            case "per_unit":
              calculatedCommission = commissionPerUnit *
                (Number((created.items?.[0]?.quantity)) || 0);
              break;
            case "fixed":
              calculatedCommission = commissionRate;
              break;
            default:
              calculatedCommission = 0;
          }
        }

        const commissionRow = {
          tenant_id: tid,
          deal_id: dealId,
          agent_id: tradeCalcMeta._commission_agent_id,
          partner_id: agentPartnerId,
          commission_type: commissionType || "profit_percent",
          commission_rate: commissionRate,
          commission_per_unit: commissionPerUnit,
          commission_custom_formula: null,
          commission_currency: commissionCurrency,
          deal_value: dealValue,
          deal_profit: dealProfit,
          deal_quantity: Number((created.items?.[0]?.quantity)) || 0,
          deal_unit: (created.items?.[0]?.unit) || "MT",
          calculated_commission: Number(calculatedCommission) || 0,
          status: "pending",
          notes: `Auto-created from trade calculation ${tradeCalcMeta._trade_calc_id}`,
        };
        const { error: commErr } = await sb
          .from("deal_commissions")
          .insert(commissionRow);
        if (commErr) throw commErr;

        await audit(auth.store, getAuthUser(auth), req, "commission.obligation_created", "deal_commission", dealId, {
          agent_id: tradeCalcMeta._commission_agent_id,
          amount: calculatedCommission,
          trade_calc_id: tradeCalcMeta._trade_calc_id,
          offer_id: created.id,
          deal_id: dealId,
        });
      }
    } catch (e: any) {
      // Don't fail the offer creation — just log so ops can investigate.
      console.error("[offers.post] commission auto-track failed:", e);
    }
  }

  return NextResponse.json(created);
  } catch (e: any) {
    console.error("[offers POST]", e);
    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 },
    );
  }
}
