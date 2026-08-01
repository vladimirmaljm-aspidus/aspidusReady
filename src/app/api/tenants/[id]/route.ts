import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin();
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const t = await auth.store.getTenant(id);
    if (!t) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(t);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin();
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await req.json();
    const updated = await auth.store.upsertTenant({ ...body, id });
    await audit(auth.store, auth.user, req, "tenant.update", "tenant", id, { name: updated.name });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin();
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    await auth.store.deleteTenant(id);
    await audit(auth.store, auth.user, req, "tenant.delete", "tenant", id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
