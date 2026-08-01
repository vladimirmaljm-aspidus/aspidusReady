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
    const proforma = await auth.store.getProforma(id);
    const partner = proforma?.partner_id ? await auth.store.getPartner(proforma.partner_id) : null;
    const tenant = await auth.store.getTenant(tenantId);

    const result = await generatePdf({ docType: "proforma", docId: id, tenantId });
    await audit(auth.store, auth.user, req, "proforma.pdf", "proforma", id, {
      verification_code: result.verificationCode,
    });

    const safeName = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const tenantName = safeName(tenant?.name || "Aspidus");
    const docNum = safeName(proforma?.number || id);
    const partnerName = partner ? `_${safeName(partner.name)}` : "";
    const filename = `${tenantName}_Proforma_${docNum}${partnerName}.pdf`;

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": result.buffer.length.toString(),
      },
    });
  } catch (e: any) {
    console.error("[pdf.proforma]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
