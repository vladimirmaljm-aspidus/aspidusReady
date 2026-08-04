import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { onKycResubmit } from "@/lib/kyc/automation";

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
    // Permission gate (kyc.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "kyc.create"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_kyc)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_kyc", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  // Tenant ownership check
  const existing = await auth.store.getKycSubmission(id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
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
