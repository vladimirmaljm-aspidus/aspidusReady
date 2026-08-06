import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { requireKycApproved } from "@/lib/portal/kyc-gate";
import { getStore } from "@/lib/data/store";
import { audit } from "@/lib/api/helpers";
import { notify } from "@/lib/notif/helper";

export const runtime = "nodejs";

/**
 * POST /api/portal/offers/[id]/respond
 *
 * Allows a portal client to accept or reject an offer that has been sent to
 * them. Validates that the offer belongs to the calling portal access record
 * and is in a state where a response is still allowed ("sent" or "viewed").
 *
 * Body: { decision: "accept" | "reject", note?: string, signature?: unknown }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await getPortalSessionAccess();
    if (!access) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    if (!access.can_view_offers) {
      return NextResponse.json({ error: "Not permitted." }, { status: 403 });
    }
    const _kycBlock = await requireKycApproved(access);
    if (_kycBlock) return _kycBlock;

    const { id } = await params;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { decision, note, signature } = body;
    if (!decision || !["accept", "reject"].includes(decision)) {
      return NextResponse.json({ error: "Decision must be 'accept' or 'reject'." }, { status: 400 });
    }

    const store = await getStore();

    // Fetch the offer (global lookup, then verify ownership).
    const offer = await store.getOffer(id);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }
    if (offer.tenant_id !== access.tenant_id) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }
    if (offer.partner_id !== access.partner_id) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // Only allow responses on offers that are currently "sent" or "viewed".
    const currentStatus = String(offer.status || "").toLowerCase();
    if (currentStatus !== "sent" && currentStatus !== "viewed") {
      return NextResponse.json(
        { error: `Offer cannot be responded to in its current status (${offer.status}).` },
        { status: 409 }
      );
    }

    const newStatus = decision === "accept" ? "accepted" : "rejected";
    const nowIso = new Date().toISOString();

    await store.upsertOffer({
      id,
      status: newStatus as any,
      responded_at: nowIso,
      client_accepted_at: decision === "accept" ? nowIso : null,
      client_note: note || null,
      client_signature: signature ?? null,
      admin_reviewed_by_client: true,
    } as any);

    // Notify tenant admins (broadcast = user_id null).
    try {
      const partner = offer.partner_id ? await store.getPartner(offer.partner_id) : null;
      const partnerName = partner?.name || "Portal client";
      await notify({
        tenantId: access.tenant_id,
        userId: null,
        type: decision === "accept" ? "offer_accepted" : "offer_rejected",
        title: decision === "accept" ? "Offer Accepted" : "Offer Rejected",
        message:
          decision === "accept"
            ? `${partnerName} accepted offer ${offer.number}.${note ? " Note: " + note : ""}`
            : `${partnerName} rejected offer ${offer.number}.${note ? " Reason: " + note : ""}`,
        entityType: "offer",
        entityId: id,
        actionUrl: `/offers?id=${id}`,
        actionLabel: "View Offer",
      });
    } catch (e) {
      console.error("[portal.respond] notification failed:", e);
    }

    // Audit log — portal client acts as the "user".
    try {
      await audit(
        store,
        {
          id: `portal:${access.id}`,
          username: access.portal_email || `portal:${access.id}`,
          tenant_id: access.tenant_id,
        },
        req,
        "portal.offer_responded",
        "offer",
        id,
        { decision, note: note || null }
      );
    } catch (e) {
      console.error("[audit]", e);
    }

    return NextResponse.json({ ok: true, status: newStatus });
  } catch (e: any) {
    console.error("[portal.offer.respond]", e);
    return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
  }
}
