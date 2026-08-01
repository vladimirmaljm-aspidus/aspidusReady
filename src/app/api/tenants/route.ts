import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await requireSuperAdmin();
    if (auth instanceof NextResponse) return auth;
    const tenants = await auth.store.listTenants();
    return NextResponse.json({ items: tenants });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (auth instanceof NextResponse) return auth;
    const body = await req.json();
    const created = await auth.store.upsertTenant(body);
    await audit(auth.store, auth.user, req, body.id ? "tenant.update" : "tenant.create", "tenant", created.id, { name: created.name });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
