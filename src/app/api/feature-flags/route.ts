import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, audit, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (auth instanceof NextResponse) return auth;
  const url = new URL(req.url);
  // Use resolveTenantId so super-admin can pass ?tenant_id=xxx but if omitted
  // we fall back to their own tenant (or the first tenant in the system).
  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "tenant_id required." }, { status: 400 });
  const flags = await auth.store.getFeatureFlags(tenantId);
  return NextResponse.json(flags);
}

export async function PUT(req: NextRequest) {
  const auth = await requireSuperAdmin();
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.tenant_id) {
    // Fall back to the resolved tenant so callers don't have to pass it.
    body.tenant_id = resolveTenantId(auth, req) || undefined;
  }
  if (!body.tenant_id) return NextResponse.json({ error: "tenant_id required." }, { status: 400 });
  body.updated_by = auth.user.id;
  const updated = await auth.store.upsertFeatureFlags(body);
  await audit(auth.store, auth.user, req, "feature_flags.update", "feature_flags", updated.id, { tenant_id: body.tenant_id });
  return NextResponse.json(updated);
}
