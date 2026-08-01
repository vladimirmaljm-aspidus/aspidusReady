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
    const created = await auth.store.upsertProforma(body);
    await audit(auth.store, getAuthUser(auth), req, body.id ? "proforma.update" : "proforma.create", "proforma", created.id, { number: created.number });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
