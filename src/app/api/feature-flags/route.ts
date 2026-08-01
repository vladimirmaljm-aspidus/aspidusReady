import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, audit, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (auth instanceof NextResponse) return auth;
  const url = new URL(req.url);
  const tenantId = url.searchParams.get("tenant_id");
  if (!tenantId) return NextResponse.json({ error: "tenant_id required." }, { status: 400 });
  const flags = await auth.store.getFeatureFlags(tenantId);
  return NextResponse.json(flags);
}

export async function PUT(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.tenant_id) return NextResponse.json({ error: "tenant_id required." }, { status: 400 });
  body.updated_by = auth.user.id;
  const updated = await auth.store.upsertFeatureFlags(body);
  await audit(auth.store, auth.user, req, "feature_flags.update", "feature_flags", updated.id, { tenant_id: body.tenant_id });
  return NextResponse.json(updated);
}
