import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrApiKey, resolveTenantId, hasPermission, audit, type AuthContext, type ApiKeyAuthContext } from "@/lib/api/helpers";

export const runtime = "nodejs";

function getAuthUser(auth: AuthContext | ApiKeyAuthContext) {
  if ("user" in auth) return auth.user;
  return { id: `api:${auth.apiKeyId}`, username: auth.apiKeyName };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(req);
    if (auth instanceof NextResponse) return auth;
    const tid = resolveTenantId(auth, req);

    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "proformas:read")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const partner_id = url.searchParams.get("partner_id") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const result = await auth.store.listProformas(tid!, { search, filters: { partner_id, status } });
    // Tenant isolation: PrismaStore.listProformas ignores _tenantId, so we
    // post-filter for non-super_admin (and for API keys, which are scoped to
    // their tenant).
    const shouldFilter = "apiKeyId" in auth || !auth.isSuperAdmin;
    if (shouldFilter && auth.tenantId) {
      const before = result.items.length;
      result.items = result.items.filter((p) => p.tenant_id === auth.tenantId);
      result.total = result.total - (before - result.items.length);
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(req);
    if (auth instanceof NextResponse) return auth;
    const tid = resolveTenantId(auth, req);

    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "proformas:write")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const body = await req.json();
    body.tenant_id = tid!;
    if (!body.id) {
      const isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
      const { enforceQuota } = await import("@/lib/api/plan-limits");
      const denied = await enforceQuota(tid, "monthly_documents", isSA);
      if (denied) return denied;
    }
    const created = await auth.store.upsertProforma(body);
    await audit(auth.store, getAuthUser(auth), req, body.id ? "proforma.update" : "proforma.create", "proforma", created.id, { number: created.number });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
