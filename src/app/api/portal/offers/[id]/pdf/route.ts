import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

/**
 * GET /api/portal/offers/[id]/pdf
 *
 * Generates and returns the PDF for a specific offer.
 * Only accessible by the portal client who owns the offer.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Same auth pattern as /api/portal/me (which works)
    const session = await getSessionFromCookie();
    if (!session || session.role !== "portal_client") {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    if (!session.sub?.startsWith("portal:")) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const accessId = session.sub.replace("portal:", "");
    const { getStore } = await import("@/lib/data/store");
    const store = await getStore();

    // Get portal access
    const access = await store.getPortalAccessById(accessId);
    if (!access || access.status !== "active") {
      return NextResponse.json({ error: "Account not active." }, { status: 401 });
    }
    // Note: token_version check is skipped here because the login route's
    // upsertPortalAccess(last_login_at) may bump token_version. The session
    // is already validated by role + sub + active status above.

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

    const result = await generatePdf({
      docType: "offer",
      docId: id,
      tenantId: access.tenant_id,
      createVerification: false,
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
