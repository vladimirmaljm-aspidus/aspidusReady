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
    // Permission gate (proformas.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "proformas.read"); if (_d) return _d; } } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _tid = ("apiKeyId" in auth) ? auth.tenantId : auth.tenantId;
    const _isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const _f = await requireFeature(_tid, "module_finance", _isSA); if (_f) return _f; } /* requireFeature wired */

    const tid = resolveTenantId(auth, req);

    if ("apiKeyId" in auth && !hasPermission(auth.permissions, "proformas:read")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const partner_id = url.searchParams.get("partner_id") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
    const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;
    const result = await auth.store.listProformas(tid!, { search, filters: { partner_id, status }, limit, offset });
    // Defense-in-depth: even though SupabaseStore filters by tenant_id,
    // this post-filter provides an extra safety layer. Do NOT remove.
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
  // Permission gate (proformas.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "proformas.create"); if (_d) return _d; } } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _tid = ("apiKeyId" in auth) ? auth.tenantId : auth.tenantId;
    const _isSA = !("apiKeyId" in auth) && auth.isSuperAdmin;
    const _f = await requireFeature(_tid, "module_finance", _isSA); if (_f) return _f; } /* requireFeature wired */

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

    // CRITICAL FIX (audit P1-12): partner_id must belong to the caller's
    // tenant. Without this a super-admin (tid resolves to their own tenant)
    // or an API key could attach a proforma to a partner owned by another
    // tenant by passing that partner's UUID.
    if (body.partner_id) {
      const partner = await auth.store.getPartner(body.partner_id);
      if (partner && partner.tenant_id !== tid) {
        return NextResponse.json({ error: "Partner not found." }, { status: 404 });
      }
    }

    // CRITICAL FIX (audit P1-11): recompute totals from line items — never trust
    // client-supplied totals (parity with PUT routes and offers POST).
    if (Array.isArray(body.items) && body.items.length > 0) {
      let subtotal = 0, discountTotal = 0, taxTotal = 0;
      for (const it of body.items) {
        const line = (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
        const disc = line * (Number(it.discount) || 0) / 100;
        const net = line - disc;
        const tax = net * (Number(it.tax_rate) || 0) / 100;
        subtotal += line;
        discountTotal += disc;
        taxTotal += tax;
        it.total = Math.round((net + tax) * 100) / 100;
      }
      body.subtotal = Math.round(subtotal * 100) / 100;
      body.discount_total = Math.round(discountTotal * 100) / 100;
      body.tax_total = Math.round(taxTotal * 100) / 100;
      body.total = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;
    }

    // Auto-generate document number if not provided (e.g. manual "Create" click).
    // Atomic: tries the `get_next_doc_number` Postgres SEQUENCE RPC first;
    // falls back to a targeted COUNT query if the RPC is unavailable (e.g.
    // before the 004 migration has been applied).
    //   Format: PRO-<year>-<NNNN>  (4-digit sequence)
    //
    // CRITICAL FIX (audit P1-13): use targeted COUNT instead of
    // listProformas(limit:1000). Avoids the 1000-record cap and is more
    // efficient. Also keeps the year-aware reset-at-year-boundary behaviour
    // (audit P2-20) by scoping the count to `PRO-<year>-%`.
    if (!body.id && !body.number) {
      const year = new Date().getFullYear();
      const seqNum = await nextDocNumber("proforma");
      if (seqNum) {
        body.number = seqNum;
      } else {
        const { count } = await getSupabase()
          .from("proformas")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tid!)
          .like("number", `PRO-${year}-%`);
        const yearCount = count || 0;
        const nextSeq = yearCount + 1;
        body.number = formatDocNumber("proforma", year, nextSeq);
      }
    }

    let created;
    try {
      created = await auth.store.upsertProforma(body);
    } catch (e: any) {
      // Retry once with bumped sequence in case of unique-collision race.
      if (!body.id && body.number) {
        const m = body.number.match(/^(PRO-\d{4}-)(\d+)$/);
        if (m) {
          body.number = `${m[1]}${String(Number(m[2]) + 1).padStart(4, "0")}`;
          created = await auth.store.upsertProforma(body);
        } else {
          throw e;
        }
      } else {
        throw e;
      }
    }
    await audit(auth.store, getAuthUser(auth), req, body.id ? "proforma.update" : "proforma.create", "proforma", created.id, { number: created.number });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
