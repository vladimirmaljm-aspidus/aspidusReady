import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";
import { sendEmail, documentEmail } from "@/lib/email/service";
import { generatePdf } from "@/lib/pdf/generator";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (auth.user.role !== "admin" && auth.user.role !== "super_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const { email: toEmail } = await req.json();
  if (!toEmail) {
    return NextResponse.json({ error: "Email address is required." }, { status: 400 });
  }

  try {
    // Fetch the offer
    const offer = await auth.store.getOffer(id);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }

    // Fetch partner for email info
    const partner = offer.partner_id ? await auth.store.getPartner(offer.partner_id) : null;

    // Generate the PDF
    let tenantId = resolveTenantId(auth, req);
    if (!tenantId && auth.isSuperAdmin) {
      const tenants = await auth.store.listTenants();
      tenantId = tenants[0]?.id || null;
    }
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant." }, { status: 400 });
    }

    const result = await generatePdf({ docType: "offer", docId: id, tenantId });
    const pdfBuffer = Buffer.from(result.buffer);

    // Send email with PDF attachment
    const { subject, html } = documentEmail({
      partnerName: partner?.name || "Client",
      docType: "offer",
      docNumber: offer.number || id,
      tenantName: auth.user.tenant_id || "Aspidus Trade",
      amount: offer.total != null ? String(offer.total) : undefined,
      currency: offer.currency || undefined,
      dueDate: offer.valid_until || undefined,
    });

    const emailResult = await sendEmail({
      to: toEmail,
      subject,
      html,
      attachments: [{
        filename: `offer-${offer.number || id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      }],
    });

    await audit(auth.store, auth.user, req, "offer.send_email", "offer", id, { to: toEmail });

    return NextResponse.json(emailResult);
  } catch (e) {
    console.error("[offer.send]", e);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
