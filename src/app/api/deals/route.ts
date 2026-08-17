import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrApiKey, resolveTenantId, hasPermission, audit, sanitizeError, type AuthContext, type ApiKeyAuthContext } from "@/lib/api/helpers";

export const runtime = "nodejs";

function getAuthUser(auth: AuthContext | ApiKeyAuthContext) {
  if ("user" in auth) return auth.user;
  return { id: `api:${auth.apiKeyId}`, username: auth.apiKeyName, tenant_id: auth.tenantId };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(req);
    if (auth instanceof NextResponse) return auth;
    // Permission gate (deals.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "deals.read"); if (_d) return _d; } } /* requirePermission wired */

    const tid = resolveTenantId(auth, req);
    if (!tid) return NextResponse.json({ error: "No tenant context." }, { status: 400 });

    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "deals:read")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const partner_id = url.searchParams.get("partner_id") || undefined;
    const stage = url.searchParams.get("stage") || undefined;
    const limit = url.searchParams.get("limit") ? Math.min(Number(url.searchParams.get("limit")), 500) : undefined;
    const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;
    const result = await auth.store.listDeals(tid, { search, limit, offset, filters: { partner_id, stage } });
    // Defense-in-depth: even though SupabaseStore filters by tenant_id,
    // this post-filter provides an extra safety layer. Do NOT remove.
    const shouldFilter = "apiKeyId" in auth || !auth.isSuperAdmin;
    if (shouldFilter && auth.tenantId) {
      const before = result.items.length;
      result.items = result.items.filter((d) => d.tenant_id === auth.tenantId);
      result.total = result.total - (before - result.items.length);
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[deals GET]", error);
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(req);
    if (auth instanceof NextResponse) return auth;
  // Permission gate (deals.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "deals.create"); if (_d) return _d; } } /* requirePermission wired */
  // Feature gate (module_crm)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _tid = ("apiKeyId" in auth) ? auth.tenantId : auth.tenantId;
    const _isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const _f = await requireFeature(_tid, "module_crm", _isSA); if (_f) return _f; } /* requireFeature wired */

    const tid = resolveTenantId(auth, req);
    if (!tid) return NextResponse.json({ error: "No tenant context." }, { status: 400 });

    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "deals:write")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const body = await req.json();
    body.tenant_id = tid;
    if (!body.owner_id && "user" in auth) body.owner_id = auth.user.id;
    // CRITICAL FIX (audit F-1): validate commission_agent_id points to a real
    // commission_agents row in the caller's tenant. Previously, partner_id values
    // were stored here, causing all commissions to silently compute as $0.
    if (body.commission_agent_id) {
      const agent = await auth.store.getCommissionAgent(body.commission_agent_id);
      if (!agent || agent.tenant_id !== tid) {
        return NextResponse.json({ error: "Commission agent not found." }, { status: 400 });
      }
    }
    // F-FINAL / P1: the deals table has 4 NOT NULL columns with no DB-side
    // defaults (probability, buy_cost, quantity, unit). Without these
    // defaults, the typical CRM "create deal" payload (title / partner_id /
    // stage / value / currency) hit HTTP 500 with a sanitized
    // "Required field missing." message — counterintuitive for a CRM entity
    // that conceptually doesn't need a buy_cost at creation time. Supply
    // sane defaults so the typical payload works; callers who care about
    // cost-tracking can override.
    const deal = {
      ...body,
      probability: body.probability ?? 0,
      buy_cost: body.buy_cost ?? 0,
      quantity: body.quantity ?? 1,
      unit: body.unit ?? "MT",
    };
    const created = await auth.store.upsertDeal(deal);
    await audit(auth.store, getAuthUser(auth), req, body.id ? "deal.update" : "deal.create", "deal", created.id, { title: created.title });
    return NextResponse.json(created);
  } catch (error: any) {
    console.error("[deals POST]", error);
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 });
  }
}
