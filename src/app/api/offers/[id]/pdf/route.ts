import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  let tenantId = resolveTenantId(auth, req);
  if (!tenantId && auth.isSuperAdmin) {
    const tenants = await auth.store.listTenants();
    tenantId = tenants[0]?.id || null;
  }
  if (!tenantId) return NextResponse.json({ error: "No tenant." }, { status: 400 });

  try {
    // Fetch the offer to build a professional filename
    const offer = await auth.store.getOffer(id);
    const partner = offer?.partner_id ? await auth.store.getPartner(offer.partner_id) : null;
    const tenant = await auth.store.getTenant(tenantId);

    const result = await generatePdf({ docType: "offer", docId: id, tenantId });
    await audit(auth.store, auth.user, req, "offer.pdf", "offer", id, {
      verification_code: result.verificationCode,
      size: result.buffer.length,
    });

    // Build professional filename: CompanyName_Offer_123-2026_ClientName.pdf
    const safeName = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const tenantName = safeName(tenant?.name || "Aspidus");
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
