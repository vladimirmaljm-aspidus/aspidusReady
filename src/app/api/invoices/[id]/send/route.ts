import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";
import { sendEmail, documentEmail } from "@/lib/email/service";
import { generatePdf } from "@/lib/pdf/generator";
import { notify } from "@/lib/notif/helper";
import { validateStatusTransition } from "@/lib/api/status-validator";
import { assertNoSoDViolation } from "@/lib/permissions/sod-matrix";
import { triggerWebhooks } from "@/lib/webhooks/deliver";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
    // Permission gate (invoices.send)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "invoices.send"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_finance", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  if (auth.user.role !== "admin" && auth.user.role !== "super_admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // Body is optional — empty body means "use the partner's email"
  }
  // Fetch the invoice early so we can resolve the partner email — this
  // makes the email + PDF attach step default-on rather than opt-in.
  const invoice = await auth.store.getInvoice(id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }
  // Tenant ownership check
  if (!auth.isSuperAdmin && invoice.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  // Fetch partner for email info / portal notification
  const partner = invoice.partner_id ? await auth.store.getPartner(invoice.partner_id) : null;
  // CRITICAL FIX (FLOW-FIX): the UI calls this endpoint with an EMPTY body,
  // so the old `if (toEmail)` guard silently skipped PDF generation and
  // email send. Now we default `toEmail` to the partner's email so the
  // document is emailed + portal-notified on every send — the manual
  // override (explicit `body.email`) is still respected for the rare
  // case where the admin wants to send to a different address.
  const toEmail: string | undefined = body?.email || partner?.email || undefined;

  try {

    // ── P1-1 / Feature 2: Separation-of-Duties check ─────────────────
    // The "send" action IS the approval step for an invoice (once sent,
    // the invoice is locked). The creator (`invoice.created_by`, added
    // by migration 040) cannot approve their own invoice unless they
    // are a super_admin. `assertNoSoDViolation` short-circuits for
    // super_admin before consulting the SoD rules.
    // Note: `created_by` is null on legacy rows (pre-migration-040);
    // the SoD check fails OPEN in that case (does not block).
    {
      const sod = await assertNoSoDViolation(auth, (invoice as any).created_by, {
        create_perm: "invoices.create",
        approve_perm: "invoices.send",
      });
      if (sod) return sod;
    }

    // Resolve tenant (required for PDF generation and notification)
    const tenantId = resolveTenantId(auth, req);
    if (!tenantId) {
      return NextResponse.json({ error: "tenant_id query parameter is required for super-admin actions." }, { status: 400 });
    }

    // ─── Email send (default-on) ───
    // CRITICAL FIX (FLOW-FIX): previously the UI sent an EMPTY body, so
    // `toEmail` was undefined and the entire PDF + email leg was
    // silently skipped. We now default `toEmail` to the partner's email
    // (resolved above) — so every "Send" click generates the PDF and
    // emails the partner. The `email` field in the body still overrides
    // for ad-hoc recipients. The leg is skipped only when the partner
    // has no email AND none was supplied.
    let emailResult: { success: boolean; skipped?: boolean; error?: string } = { success: true, skipped: true };
    if (toEmail) {
      const result = await generatePdf({ docType: "invoice", docId: id, tenantId });
      const pdfBuffer = Buffer.from(result.buffer);

      const { subject, html } = documentEmail({
        partnerName: partner?.name || "Client",
        docType: "invoice",
        docNumber: invoice.number || id,
        tenantName: (await auth.store.getTenant(tenantId))?.name || "VELOS Trade",
        amount: invoice.total != null ? String(invoice.total) : undefined,
        currency: invoice.currency || undefined,
        dueDate: invoice.due_date || undefined,
      });

      emailResult = await sendEmail({
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
    }

    // Promote status draft→sent and stamp sent_at (only on first successful send).
    if (emailResult.success) {
      try {
        // Validate the status transition (Re-Audit-2 N4) — only allow
        // draft→sent via this send endpoint. Other transitions (e.g.
        // partial→paid) require the record-payment / PUT routes. Super-admins
        // bypass.
        const newStatus = invoice.status === "draft" || !invoice.status ? "sent" : invoice.status;
        if (newStatus !== invoice.status && !auth.isSuperAdmin) {
          const t = validateStatusTransition("invoice", invoice.status || "draft", newStatus);
          if (!t.valid) {
            return NextResponse.json({ error: t.error }, { status: 400 });
          }
        }
        await auth.store.upsertInvoice({ id, status: newStatus, sent_at: new Date().toISOString() } as any);
      } catch (e) { console.warn("[invoice.send] status bump failed:", e); }
    }

    // ─── Portal notification ───
    // Notify the partner's portal client that a new invoice is available.
    if (emailResult.success && invoice.partner_id) {
      try {
        await notify({
          tenantId: invoice.tenant_id,
          userId: null,
          partnerId: invoice.partner_id,
          type: "invoice_sent",
          title: `New invoice: ${invoice.number || id}`,
          message: invoice.subject || `Invoice ${invoice.number || id} has been sent to you`,
          entityType: "invoice",
          entityId: invoice.id,
          actionLabel: "View",
        });
      } catch (e) {
        console.error("[invoice.send] portal notification failed:", e);
        // Don't fail the send if notification fails
      }
    }

    // ── FLOW-FIX: outbound webhook `invoice.sent` ───────────────────
    // Fire-and-forget — webhook delivery failures must NEVER block the
    // send. Receivers get the invoice snapshot + recipient + timestamp.
    if (emailResult.success) {
      void triggerWebhooks(
        auth.store,
        tenantId,
        "invoice.sent",
        "invoice",
        id,
        {
          id: invoice.id,
          number: invoice.number,
          partner_id: invoice.partner_id,
          partner_name: partner?.name || null,
          total: invoice.total,
          currency: invoice.currency,
          due_date: invoice.due_date,
          sent_to: toEmail || null,
          sent_at: new Date().toISOString(),
        },
      ).catch((e) => console.error("[invoice.send] webhook trigger failed:", e));
    }

    await audit(auth.store, auth.user, req, "invoice.send_email", "invoice", id, { to: toEmail || "(portal only)" });

    return NextResponse.json(emailResult);
  } catch (e) {
    console.error("[invoice.send]", e);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
