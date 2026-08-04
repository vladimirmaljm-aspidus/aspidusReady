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
    // Permission gate (products.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "products.read"); if (_d) return _d; } } /* requirePermission wired */

    const tid = resolveTenantId(auth, req);

    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "products:read")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
    const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;
    const result = await auth.store.listProducts(tid!, { search, limit, offset, filters: { category } });
    // Tenant isolation: PrismaStore.listProducts ignores _tenantId, so we
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
  // Permission gate (products.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "products.create"); if (_d) return _d; } } /* requirePermission wired */

    const tid = resolveTenantId(auth, req);

    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "products:write")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const body = await req.json();
    body.tenant_id = tid!;
    if (!body.id) {
      const isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
      const { enforceQuota } = await import("@/lib/api/plan-limits");
      const denied = await enforceQuota(tid, "products", isSA);
      if (denied) return denied;

      // Duplicate check: same tenant + same SKU OR same name (case-insensitive).
      // A tenant may legitimately have two products with different SKUs but
      // the same name (variants) — so an SKU collision is a hard error,
      // a name-only collision is a soft warning returned as 409 with an
      // `existing` payload so the client can decide.
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const sb = getSupabase();
        if (body.sku && String(body.sku).trim() !== "") {
          const { data: bySku } = await sb.from("products").select("id, sku, name").eq("tenant_id", tid!).eq("sku", body.sku).maybeSingle();
          if (bySku) {
            return NextResponse.json({ error: `Product with SKU "${body.sku}" already exists.`, duplicate: "sku", existing: bySku }, { status: 409 });
          }
        }
        if (body.name && String(body.name).trim() !== "") {
          const { data: byName } = await sb.from("products").select("id, sku, name").eq("tenant_id", tid!).ilike("name", body.name).limit(1);
          if (byName && byName.length > 0 && !body.force) {
            return NextResponse.json({ error: `A product with name "${body.name}" already exists. Send force:true to override.`, duplicate: "name", existing: byName[0] }, { status: 409 });
          }
        }
      } catch (e) { console.warn("[products.upsert] dupe-check failed (allowing):", e); }
    }
    const created = await auth.store.upsertProduct(body);
    await audit(auth.store, getAuthUser(auth), req, body.id ? "product.update" : "product.create", "product", created.id, { sku: created.sku, name: created.name });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
