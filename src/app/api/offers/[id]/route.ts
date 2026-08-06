import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    // Permission gate (offers.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "offers.read"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    const item = await auth.store.getOffer(id);
    if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && item.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
  // Permission gate (offers.update)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "offers.update"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    const tid = resolveTenantId(auth, req);
    // Tenant ownership check
    const existing = await auth.store.getOffer(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const body = await req.json();
    // Preserve the entity's tenant_id
    body.tenant_id = existing.tenant_id;
    // Always recompute totals from items when items are provided — never trust
    // client-supplied totals (FLOW-7: previously skipped when body.total was
    // present, allowing tampered totals to disagree with line items).
    if (Array.isArray(body.items) && body.items.length > 0) {
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
    // Record revision with per-field diff so we always know WHO changed WHAT.
    try {
      const { recordRevision } = await import("@/lib/api/doc-revisions");
      await recordRevision({
        docType: "offer", documentId: id, tenantId: existing.tenant_id,
        before: existing as any, after: updated as any,
        userId: auth.user.id, username: auth.user.username,
      });
    } catch (e) { console.warn("[offer.update] revision failed:", e); }
    // If this update transitioned the offer to a cancelling status, void
    // any commissions computed from its deal.
    if ((updated as any).deal_id && updated.status !== existing.status) {
      const { cascadeCommissionOnStatusChange, createCommissionOnOfferAccepted } = await import("@/lib/api/commission-cascade");
      cascadeCommissionOnStatusChange((updated as any).deal_id, existing.tenant_id, updated.status, `offer ${id} status→${updated.status}`).catch(() => {});
      // Issue #7: when an offer transitions to "accepted", auto-create a
      // pending DealCommission row for the linked deal's commission agent
      // (if the deal has one and no active commission already exists).
      if (updated.status.toLowerCase() === "accepted") {
        createCommissionOnOfferAccepted(auth.store, (updated as any).deal_id, existing.tenant_id)
          .then((res) => {
            if (res.created) {
              console.info(`[offer.update] auto-created commission for deal ${(updated as any).deal_id}`);
            }
          })
          .catch(() => {});
      }
    }
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
  // Permission gate (offers.delete)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "offers.delete"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    const existing = await auth.store.getOffer(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    // Void commissions tied to this offer's deal before we hard-delete.
    if ((existing as any).deal_id) {
      const { cascadeCommissionOnDelete } = await import("@/lib/api/commission-cascade");
      await cascadeCommissionOnDelete((existing as any).deal_id, existing.tenant_id, `offer ${id} deleted`);
    }
    await auth.store.deleteOffer(id);
    await audit(auth.store, auth.user, req, "offer.delete", "offer", id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
