import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
    // Permission gate (offers.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "offers.read"); if (_d) return _d; } /* requirePermission wired */

  const { id } = await params;

  try {
    // Fetch the offer FIRST so we know which tenant it belongs to. This also
    // fixes super-admin downloads: the document itself carries the tenant_id,
    // so super-admins no longer need to pass ?tenant_id= explicitly (the
    // previous silent fallback to tenants[0] was wrong — it returned a PDF
    // for the wrong tenant's first document).
    const offer = await auth.store.getOffer(id);
    if (!offer) return NextResponse.json({ error: "Not found." }, { status: 404 });
    // Tenant ownership check (super-admin can access any tenant's docs)
    if (!auth.isSuperAdmin && offer.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const tenantId = offer.tenant_id;

    const partner = offer?.partner_id ? await auth.store.getPartner(offer.partner_id) : null;
    const tenant = await auth.store.getTenant(tenantId);

    const result = await generatePdf({ docType: "offer", docId: id, tenantId });
    await audit(auth.store, auth.user, req, "offer.pdf", "offer", id, {
      verification_code: result.verificationCode,
      size: result.buffer.length,
    });

    // Build professional filename: CompanyName_Offer_123-2026_ClientName.pdf
    const safeName = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const tenantName = safeName(tenant?.name || "VELOS");
    const docNum = safeName(offer?.number || id);
    const partnerName = partner ? `_${safeName(partner.name)}` : "";
    const filename = `${tenantName}_Offer_${docNum}${partnerName}.pdf`;

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": result.buffer.length.toString(),
      },
    });
  } catch (e: any) {
    console.error("[pdf.offer]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
