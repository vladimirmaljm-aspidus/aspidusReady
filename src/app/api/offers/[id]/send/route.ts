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
    // Permission gate (offers.send)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "offers.send"); if (_d) return _d; } /* requirePermission wired */

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
  // Fetch the offer early so we can resolve the partner email — this
  // makes the email + PDF attach step default-on rather than opt-in.
  const offer = await auth.store.getOffer(id);
  if (!offer) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }
  // Tenant ownership check
  if (!auth.isSuperAdmin && offer.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }

  // Fetch partner for email info / portal notification
  const partner = offer.partner_id ? await auth.store.getPartner(offer.partner_id) : null;
  // CRITICAL FIX (FLOW-FIX): the UI calls this endpoint with an EMPTY body,
  // so the old `if (toEmail)` guard silently skipped PDF generation and
  // email send. Now we default `toEmail` to the partner's email so the
  // document is emailed + portal-notified on every send — the manual
  // override (explicit `body.email`) is still respected for the rare
  // case where the admin wants to send to a different address.
  const toEmail: string | undefined = body?.email || partner?.email || undefined;

  try {

    // ── P1-1 / Feature 2: Separation-of-Duties check ─────────────────
    // The "send" action IS the approval step for an offer (once sent,
    // the offer is locked). The creator (`offer.owner_id`) cannot
    // approve their own offer unless they are a super_admin.
    // `assertNoSoDViolation` short-circuits for super_admin (never
    // blocked) before consulting the SoD rules.
    {
      const sod = await assertNoSoDViolation(auth, offer.owner_id, {
        create_perm: "offers.create",
        approve_perm: "offers.send",
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
      const result = await generatePdf({ docType: "offer", docId: id, tenantId });
      const pdfBuffer = Buffer.from(result.buffer);

      const { subject, html } = documentEmail({
        partnerName: partner?.name || "Client",
        docType: "offer",
        docNumber: offer.number || id,
        tenantName: (await auth.store.getTenant(tenantId))?.name || "VELOS Trade",
        amount: offer.total != null ? String(offer.total) : undefined,
        currency: offer.currency || undefined,
        dueDate: offer.valid_until || undefined,
      });

      emailResult = await sendEmail({
        to: toEmail,
        subject,
        html,
        tenantId,
        attachments: [{
          filename: `offer-${offer.number || id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        }],
      });
    }

    // Promote status draft→sent and stamp sent_at (only on first successful send).
    if (emailResult.success) {
      try {
        // Validate the status transition (Re-Audit-2 N4) — only allow
        // draft→sent. Other states (e.g. accepted) are not allowed via this
        // send endpoint — the user must use the PUT /api/offers/[id] route
        // to move to other states. Super-admins bypass.
        const newStatus = offer.status === "draft" || !offer.status ? "sent" : offer.status;
        if (newStatus !== offer.status && !auth.isSuperAdmin) {
          const t = validateStatusTransition("offer", offer.status || "draft", newStatus);
          if (!t.valid) {
            return NextResponse.json({ error: t.error }, { status: 400 });
          }
        }
        // CRITICAL FIX (audit P2-6): only set sent_at on FIRST send — don't
        // overwrite the original send timestamp on subsequent re-sends.
        const updateFields: any = { status: newStatus };
        if (!offer.sent_at) {
          updateFields.sent_at = new Date().toISOString();
        }
        await auth.store.upsertOffer({ id, ...updateFields } as any);
      } catch (e) { console.warn("[offer.send] status bump failed:", e); }
    }

    // ─── Portal notification ───
    // Notify the partner's portal client that a new offer is available.
    if (emailResult.success && offer.partner_id) {
      try {
        await notify({
          tenantId: offer.tenant_id,
          userId: null,
          partnerId: offer.partner_id,
          type: "offer_sent",
          title: `New offer: ${offer.number || id}`,
          message: offer.subject || `Offer ${offer.number || id} has been sent to you`,
          entityType: "offer",
          entityId: offer.id,
          actionLabel: "View",
        });
      } catch (e) {
        console.error("[offer.send] portal notification failed:", e);
        // Don't fail the send if notification fails
      }
    }

    // ── FLOW-FIX: outbound webhook `offer.sent` ─────────────────────
    // Fire-and-forget — webhook delivery failures must NEVER block the
    // send. Receivers get the offer snapshot + recipient + timestamp.
    if (emailResult.success) {
      void triggerWebhooks(
        auth.store,
        tenantId,
        "offer.sent",
        "offer",
        id,
        {
          id: offer.id,
          number: offer.number,
          partner_id: offer.partner_id,
          partner_name: partner?.name || null,
          total: offer.total,
          currency: offer.currency,
          sent_to: toEmail || null,
          sent_at: new Date().toISOString(),
        },
      ).catch((e) => console.error("[offer.send] webhook trigger failed:", e));
    }

    await audit(auth.store, auth.user, req, "offer.send_email", "offer", id, { to: toEmail || "(portal only)" });

    return NextResponse.json(emailResult);
  } catch (e) {
    console.error("[offer.send]", e);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
