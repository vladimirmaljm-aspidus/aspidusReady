import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (invoices.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "invoices.read"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_finance", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  const { id } = await params;
  let tenantId = resolveTenantId(auth, req);
  if (!tenantId && auth.isSuperAdmin) {
    const tenants = await auth.store.listTenants();
    tenantId = tenants[0]?.id || null;
  }
  if (!tenantId) return NextResponse.json({ error: "No tenant." }, { status: 400 });

  try {
    const invoice = await auth.store.getInvoice(id);
    // Tenant ownership check
    if (!invoice) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && invoice.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const partner = invoice?.partner_id ? await auth.store.getPartner(invoice.partner_id) : null;
    const tenant = await auth.store.getTenant(tenantId);

    const result = await generatePdf({ docType: "invoice", docId: id, tenantId });
    await audit(auth.store, auth.user, req, "invoice.pdf", "invoice", id, {
      verification_code: result.verificationCode,
    });

    const safeName = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const tenantName = safeName(tenant?.name || "Aspidus");
    const docNum = safeName(invoice?.number || id);
    const partnerName = partner ? `_${safeName(partner.name)}` : "";
    const filename = `${tenantName}_Invoice_${docNum}${partnerName}.pdf`;

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": result.buffer.length.toString(),
      },
    });
  } catch (e: any) {
    console.error("[pdf.invoice]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
