import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (proformas.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "proformas.read"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_finance", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  const { id } = await params;

  try {
    // Fetch the proforma FIRST so we know which tenant it belongs to. This
    // fixes super-admin downloads: the document itself carries the tenant_id,
    // so super-admins no longer need ?tenant_id= explicitly (the previous
    // silent fallback to tenants[0] returned a PDF for the wrong tenant).
    const proforma = await auth.store.getProforma(id);
    if (!proforma) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && proforma.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const tenantId = proforma.tenant_id;

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
