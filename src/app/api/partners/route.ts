import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrApiKey, resolveTenantId, hasPermission, audit, type AuthContext, type ApiKeyAuthContext } from "@/lib/api/helpers";

export const runtime = "nodejs";

function getAuthUser(auth: AuthContext | ApiKeyAuthContext) {
  if ("user" in auth) return auth.user;
  return { id: `api:${auth.apiKeyId}`, username: auth.apiKeyName };
}

export async function GET(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
  const tid = resolveTenantId(auth, req);

  // Permission check for API keys
  if ("apiKeyId" in auth && !hasPermission(auth.permissions, "partners:read")) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const type = url.searchParams.get("type") || undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
    const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;

    const result = await auth.store.listPartners(tid!, {
      search, limit, offset,
      filters: { status, type },
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[partners.list]", e);
    return NextResponse.json({ error: "Error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
  const tid = resolveTenantId(auth, req);

  // Permission check for API keys
  if ("apiKeyId" in auth && !hasPermission(auth.permissions, "partners:write")) {
    return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
  }

  try {
    const body = await req.json();
    body.tenant_id = tid!;
    const created = await auth.store.upsertPartner(body);
    await audit(auth.store, getAuthUser(auth), req, body.id ? "partner.update" : "partner.create", "partner", created.id, { name: created.name });
    return NextResponse.json(created);
  } catch (e) {
    console.error("[partners.upsert]", e);
    return NextResponse.json({ error: "Error saving." }, { status: 500 });
  }
}
