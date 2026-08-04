import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";
import { sendEmail, documentEmail } from "@/lib/email/service";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (invoices.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "invoices.create"); if (_d) return _d; } /* requirePermission wired */

  if (auth.user.role !== "admin" && auth.user.role !== "super_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const { email: toEmail } = await req.json();
  if (!toEmail) {
    return NextResponse.json({ error: "Email address is required." }, { status: 400 });
  }

  try {
    // Fetch the invoice
    const invoice = await auth.store.getInvoice(id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    // Tenant ownership check
    if (!auth.isSuperAdmin && invoice.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    // Fetch partner for email info
    const partner = invoice.partner_id ? await auth.store.getPartner(invoice.partner_id) : null;

    // Generate the PDF
    let tenantId = resolveTenantId(auth, req);
    if (!tenantId && auth.isSuperAdmin) {
      const tenants = await auth.store.listTenants();
      tenantId = tenants[0]?.id || null;
    }
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant." }, { status: 400 });
    }

    const result = await generatePdf({ docType: "invoice", docId: id, tenantId });
    const pdfBuffer = Buffer.from(result.buffer);

    // Send email with PDF attachment
    const { subject, html } = documentEmail({
      partnerName: partner?.name || "Client",
      docType: "invoice",
      docNumber: invoice.number || id,
      tenantName: (await auth.store.getTenant(tenantId))?.name || "Aspidus Trade",
      amount: invoice.total != null ? String(invoice.total) : undefined,
      currency: invoice.currency || undefined,
      dueDate: invoice.due_date || undefined,
    });

    const emailResult = await sendEmail({
      to: toEmail,
      subject,
      html,
      tenantId,
      attachments: [{
        filename: `invoice-${invoice.number || id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      }],
    });

    await audit(auth.store, auth.user, req, "invoice.send_email", "invoice", id, { to: toEmail });

    return NextResponse.json(emailResult);
  } catch (e) {
    console.error("[invoice.send]", e);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
