import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const item = await auth.store.getDealCommission(id);
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
    const body = await req.json();

    // Handle approve action
    if (body.action === "approve") {
      const updated = await auth.store.approveDealCommission(id, auth.user.id);
      await audit(auth.store, auth.user, req, "deal_commission.approve", "deal_commission", id);
      return NextResponse.json(updated);
    }

    // Handle mark as paid action
    if (body.action === "mark_paid") {
      const updated = await auth.store.markDealCommissionPaid(id, body.payout_reference);
      await audit(auth.store, auth.user, req, "deal_commission.mark_paid", "deal_commission", id);
      return NextResponse.json(updated);
    }

    const updated = await auth.store.upsertDealCommission({ ...body, id });
    await audit(auth.store, auth.user, req, "deal_commission.update", "deal_commission", id);
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
    await auth.store.deleteDealCommission(id);
    await audit(auth.store, auth.user, req, "deal_commission.delete", "deal_commission", id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
