import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const item = await auth.store.getOffer(id);
    if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const tid = resolveTenantId(auth, req);
    const body = await req.json();
    body.tenant_id = tid!;
    // recompute totals from items if not provided
    if (Array.isArray(body.items) && body.items.length > 0 && body.total === undefined) {
      let subtotal = 0, discountTotal = 0, taxTotal = 0;
      for (const it of body.items) {
        const line = it.quantity * it.unit_price;
        const disc = line * (it.discount || 0) / 100;
        const net = line - disc;
        const tax = net * (it.tax_rate || 0) / 100;
        subtotal += line;
        discountTotal += disc;
        taxTotal += tax;
        it.total = net + tax;
      }
      body.subtotal = subtotal;
      body.discount_total = discountTotal;
      body.tax_total = taxTotal;
      body.total = subtotal - discountTotal + taxTotal;
    }
    const updated = await auth.store.upsertOffer({ ...body, id });
    await audit(auth.store, auth.user, req, "offer.update", "offer", id, { status: updated.status });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    await auth.store.deleteOffer(id);
    await audit(auth.store, auth.user, req, "offer.delete", "offer", id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
