import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

/**
 * GET /api/portal/proformas/[id]/pdf
 *
 * Generates and returns the PDF for a specific proforma.
 * Only accessible by the portal client who owns the proforma.
 * Supports ?mode=inline (preview) and ?mode=attachment (download).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await getPortalSessionAccess();
    if (!access) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    // Check if portal client has permission to download PDFs
    if (!access.can_download_pdf) {
      return NextResponse.json({ error: "PDF download not available for your tier." }, { status: 403 });
    }

    const { getStore } = await import("@/lib/data/store");
    const store = await getStore();
    const { id } = await params;

    // Verify the proforma belongs to this portal client
    const proforma = await store.getProforma(id);
    if (!proforma) {
      return NextResponse.json({ error: "Proforma not found." }, { status: 404 });
    }

    // Security: the proforma's partner_id must match the portal access partner_id
    if (proforma.partner_id !== access.partner_id) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const mode = req.nextUrl.searchParams.get("mode") || "inline";
    const disposition = mode === "attachment" ? "attachment" : "inline";

    const result = await generatePdf({
      docType: "proforma",
      docId: id,
      tenantId: access.tenant_id,
      createVerification: false,
    });

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="Proforma-${proforma.number}.pdf"`,
        "Content-Length": result.buffer.length.toString(),
      },
    });
  } catch (e: any) {
    console.error("[portal.proforma.pdf]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
