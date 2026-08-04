import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { notifyKycRejected } from "@/lib/notif/helper";
import { onKycRejected } from "@/lib/kyc/automation";

/**
 * POST /api/kyc/[id]/reject
 *
 * Rejects a KYC submission and sends the "KYC Rejected" email to the portal
 * client with the admin-provided reason.
 *
 * Body: { reason?: string }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (kyc.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "kyc.create"); if (_d) return _d; } /* requirePermission wired */

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
  let body: { reason?: string } = {};
  try { body = await req.json(); } catch { /* ok */ }

  const updated = await auth.store.upsertKycSubmission({
    id, status: "rejected", rejection_reason: body.reason || null,
    reviewed_by: auth.user.id, reviewed_at: new Date().toISOString(),
  });
  await audit(auth.store, auth.user, req, "kyc.reject", "kyc_submission", id, { reason: body.reason });

  const partner = await auth.store.getPartner(updated.partner_id);
  await notifyKycRejected(auth.tenantId || updated.tenant_id, partner?.name || "Client", id, body.reason);

  // Send the rejection email
  const tenant = await auth.store.getTenant(updated.tenant_id);
  await onKycRejected({
    store: auth.store,
    submission: updated,
    partner: partner as any,
    tenant,
    reason: body.reason || null,
  });

  return NextResponse.json(updated);
}
