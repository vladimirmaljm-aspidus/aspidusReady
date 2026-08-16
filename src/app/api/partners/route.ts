import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrApiKey, resolveTenantId, hasPermission, audit, type AuthContext, type ApiKeyAuthContext, sanitizeError } from "@/lib/api/helpers";
import { triggerWebhooks } from "@/lib/webhooks/deliver";

export const runtime = "nodejs";

function getAuthUser(auth: AuthContext | ApiKeyAuthContext) {
  if ("user" in auth) return auth.user;
  return { id: `api:${auth.apiKeyId}`, username: auth.apiKeyName, tenant_id: auth.tenantId };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(req);
    if (auth instanceof NextResponse) return auth;
    // Permission gate (partners.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "partners.read"); if (_d) return _d; } } /* requirePermission wired */

    const tid = resolveTenantId(auth, req);

    // Permission check for API keys
    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "partners:read")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const type = url.searchParams.get("type") || undefined;
    // F-9-3: cap limit to 500 to prevent ?limit=999999 style abuse that
    // would pull the entire table into memory and serialize a multi-MB JSON
    // response. The audit found a 100KB product name being stored — even
    // a single malicious row would balloon the response payload.
    const limit = url.searchParams.get("limit") ? Math.min(Number(url.searchParams.get("limit")), 500) : undefined;
    const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;

    const result = await auth.store.listPartners(tid!, {
      search, limit, offset,
      filters: { status, type },
    });
    // Defense-in-depth: even though SupabaseStore filters by tenant_id,
    // this post-filter provides an extra safety layer. Do NOT remove.
    const shouldFilter = "apiKeyId" in auth || !auth.isSuperAdmin;
    if (shouldFilter && auth.tenantId) {
      const before = result.items.length;
      result.items = result.items.filter((p) => p.tenant_id === auth.tenantId);
      result.total = result.total - (before - result.items.length);
    }
    // CRITICAL FIX (audit D-5): strip portal_token from API responses.
    // This field is a 32+ char secret stored on the partner row and was
    // being leaked to anyone with partners:read permission (including API keys).
    // The field is legacy (no code path uses it for auth) — safe to strip.
    const safeItems = result.items.map(({ portal_token, ...rest }: any) => rest);
    return NextResponse.json({ ...result, items: safeItems });
  } catch (e: any) {
    console.error("[partners.list]", e);
    return NextResponse.json(
      { error: sanitizeError(e) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(req);
    if (auth instanceof NextResponse) return auth;
    // Permission gate (partners.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "partners.create"); if (_d) return _d; } } /* requirePermission wired */

    const tid = resolveTenantId(auth, req);

    // Permission check for API keys
    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "partners:write")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const body = await req.json();
    body.tenant_id = tid!;
    if (!body.id) {
      const isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
      const { enforceQuota } = await import("@/lib/api/plan-limits");
      const denied = await enforceQuota(tid, "partners", isSA);
      if (denied) return denied;

      // Duplicate check: tax_id / vat_number collision within the same tenant
      // is a hard error; identical name is a soft-warn 409 (client can force).
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const sb = getSupabase();
        for (const field of ["tax_id", "vat_number"]) {
          const v = (body as any)[field];
          if (v && String(v).trim() !== "") {
            const { data: hit } = await sb.from("partners").select("id, name, tax_id, vat_number").eq("tenant_id", tid!).eq(field, v).maybeSingle();
            if (hit) {
              return NextResponse.json({ error: `Partner with ${field} "${v}" already exists (${hit.name}).`, duplicate: field, existing: hit }, { status: 409 });
            }
          }
        }
        if (body.name && String(body.name).trim() !== "" && !body.force) {
          const { data: byName } = await sb.from("partners").select("id, name, country").eq("tenant_id", tid!).ilike("name", body.name).limit(1);
          if (byName && byName.length > 0) {
            return NextResponse.json({ error: `Partner "${body.name}" already exists. Send force:true to override.`, duplicate: "name", existing: byName[0] }, { status: 409 });
          }
        }
      } catch (e) { console.warn("[partners.upsert] dupe-check failed (allowing):", e); }
    }
    // CRITICAL FIX (audit M-6): `force` is route-only logic (used by the
    // duplicate-name soft-warn above) and is NOT a column on `partners`.
    // PostgREST rejects the insert with a 400 if it reaches the upsert.
    // Strip it, mirroring products/route.ts.
    delete body.force;
    const created = await auth.store.upsertPartner(body);
    await audit(auth.store, getAuthUser(auth), req, body.id ? "partner.update" : "partner.create", "partner", created.id, { name: created.name });

    // ── F-4: fire outbound webhooks (partner.created / partner.updated) ────
    // Fire-and-forget — webhook delivery failures must NEVER block the
    // partner mutation. We strip `portal_token` from the payload (parity
    // with the GET handler's defense-in-depth strip — see audit D-5).
    const { portal_token: _omit, ...partnerSafe } = created as any;
    void triggerWebhooks(
      auth.store,
      tid!,
      body.id ? "partner.updated" : "partner.created",
      "partner",
      created.id,
      partnerSafe as Record<string, unknown>,
    ).catch((e) => console.error("[partners.post] webhook trigger failed:", e));

    return NextResponse.json(created);
  } catch (e: any) {
    console.error("[partners.upsert]", e);
    return NextResponse.json(
      { error: sanitizeError(e) },
      { status: 500 },
    );
  }
}
