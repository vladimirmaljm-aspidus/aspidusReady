import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

/**
 * GET /api/portal/invoices/[id]/pdf
 *
 * Generates and returns the PDF for a specific invoice.
 * Only accessible by the portal client who owns the invoice.
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

    // Verify the invoice belongs to this portal client
    const invoice = await store.getInvoice(id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    // Security: the invoice's partner_id must match the portal access partner_id
    if (invoice.partner_id !== access.partner_id) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const mode = req.nextUrl.searchParams.get("mode") || "inline";
    const disposition = mode === "attachment" ? "attachment" : "inline";

    const result = await generatePdf({
      docType: "invoice",
      docId: id,
      tenantId: access.tenant_id,
      createVerification: false,
    });

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="Invoice-${invoice.number}.pdf"`,
        "Content-Length": result.buffer.length.toString(),
      },
    });
  } catch (e: any) {
    console.error("[portal.invoice.pdf]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
