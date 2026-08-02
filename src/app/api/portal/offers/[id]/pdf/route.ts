import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

/**
 * GET /api/portal/offers/[id]/pdf
 *
 * Generates and returns the PDF for a specific offer.
 * Only accessible by the portal client who owns the offer.
 * Security: checks that the offer's partner_id matches the portal access partner_id.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await getPortalSessionAccess();
  if (!access) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  // Verify the offer belongs to this portal client
  const store = await (await import("@/lib/data/store")).getStore();
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

  try {
    const result = await generatePdf({
      docType: "offer",
      docId: id,
      tenantId: access.tenant_id,
      createVerification: false, // Don't create new verification for portal downloads
    });

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
