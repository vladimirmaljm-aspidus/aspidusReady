import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { onKycResubmit } from "@/lib/kyc/automation";

export const runtime = "nodejs";

/**
 * POST /api/kyc/[id]/resubmit
 *
 * Admin requests additional information from the client. Sets the submission
 * status back to "resubmit" and sends the "Update Required" email with the
 * admin's note (which fields/documents need attention).
 *
 * Body: { note?: string }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  let body: { note?: string } = {};
  try { body = await req.json(); } catch { /* ok */ }

  const updated = await auth.store.upsertKycSubmission({
    id,
    status: "resubmit",
    review_notes: body.note || null,
    reviewed_by: auth.user.id,
    reviewed_at: new Date().toISOString(),
  } as any);

  await audit(auth.store, auth.user, req, "kyc.resubmit", "kyc_submission", id, { note: body.note });

  const partner = await auth.store.getPartner(updated.partner_id);
  const tenant = await auth.store.getTenant(updated.tenant_id);
  await onKycResubmit({
    store: auth.store,
    submission: updated,
    partner: partner as any,
    tenant,
    note: body.note || null,
  });

  return NextResponse.json(updated);
}
