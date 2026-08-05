import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { requireKycApproved } from "@/lib/portal/kyc-gate";
import { generatePdf } from "@/lib/pdf/generator";
import { markDocumentViewed } from "@/lib/portal/mark-viewed";

export const runtime = "nodejs";

/**
 * GET /api/portal/offers/[id]/pdf
 *
 * Generates and returns the PDF for a specific offer.
 * Only accessible by the portal client who owns the offer.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await getPortalSessionAccess();
    if (!access) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const { getStore } = await import("@/lib/data/store");
    const store = await getStore();

    const { id } = await params;

    // Verify the offer belongs to this portal client
    const offer = await store.getOffer(id);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }

    // Security: the offer's partner_id must match the portal access partner_id
    if (offer.partner_id !== access.partner_id) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // Check if portal client has permission to download PDFs
    if (!access.can_download_pdf) {
      return NextResponse.json({ error: "PDF download not available for your tier." }, { status: 403 });
    }

    const _kycBlock = await requireKycApproved(access);
    if (_kycBlock) return _kycBlock;

    const result = await generatePdf({
      docType: "offer",
      docId: id,
      tenantId: access.tenant_id,
      createVerification: false,
    });

    // Fire-and-forget: mark as viewed (status sent→viewed on first open).
    markDocumentViewed("offers", id, access.tenant_id, access.portal_email).catch(() => {});

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Offer-${offer.number}.pdf"`,
        "Content-Length": result.buffer.length.toString(),
      },
    });
  } catch (e: any) {
    console.error("[portal.offer.pdf]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
