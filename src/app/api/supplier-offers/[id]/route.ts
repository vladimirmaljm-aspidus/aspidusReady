import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (supplier-offers.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "supplier-offers.read"); if (_d) return _d; } /* requirePermission wired */

  const { id } = await params;
  const item = await auth.store.getSupplierOffer(id);
  if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && item.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await auth.store.getSupplierOffer(id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const body = await req.json();
  const updated = await auth.store.upsertSupplierOffer({ ...body, id, tenant_id: existing.tenant_id });
  await audit(auth.store, auth.user, req, "supplier_offer.update", "supplier_offer", id, {});
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await auth.store.getSupplierOffer(id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await auth.store.deleteSupplierOffer(id);
  await audit(auth.store, auth.user, req, "supplier_offer.delete", "supplier_offer", id);
  return NextResponse.json({ ok: true });
}
