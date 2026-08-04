import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";
import { sendEmail, documentEmail } from "@/lib/email/service";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (proformas.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "proformas.create"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_finance", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  if (auth.user.role !== "admin" && auth.user.role !== "super_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const { email: toEmail } = await req.json();
  if (!toEmail) {
    return NextResponse.json({ error: "Email address is required." }, { status: 400 });
  }

  try {
    // Fetch the proforma
    const proforma = await auth.store.getProforma(id);
    if (!proforma) {
      return NextResponse.json({ error: "Proforma not found." }, { status: 404 });
    }
    // Tenant ownership check
    if (!auth.isSuperAdmin && proforma.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Proforma not found." }, { status: 404 });
    }

    // Fetch partner for email info
    const partner = proforma.partner_id ? await auth.store.getPartner(proforma.partner_id) : null;

    // Generate the PDF
    let tenantId = resolveTenantId(auth, req);
    if (!tenantId && auth.isSuperAdmin) {
      const tenants = await auth.store.listTenants();
      tenantId = tenants[0]?.id || null;
    }
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant." }, { status: 400 });
    }

    const result = await generatePdf({ docType: "proforma", docId: id, tenantId });
    const pdfBuffer = Buffer.from(result.buffer);

    // Send email with PDF attachment
    const { subject, html } = documentEmail({
      partnerName: partner?.name || "Client",
      docType: "proforma",
      docNumber: proforma.number || id,
      tenantName: (await auth.store.getTenant(tenantId))?.name || "Aspidus Trade",
      amount: proforma.total != null ? String(proforma.total) : undefined,
      currency: proforma.currency || undefined,
      dueDate: proforma.valid_until || undefined,
    });

    const emailResult = await sendEmail({
      to: toEmail,
      subject,
      html,
      tenantId,
      attachments: [{
        filename: `proforma-${proforma.number || id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      }],
    });

    await audit(auth.store, auth.user, req, "proforma.send_email", "proforma", id, { to: toEmail });

    return NextResponse.json(emailResult);
  } catch (e) {
    console.error("[proforma.send]", e);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
