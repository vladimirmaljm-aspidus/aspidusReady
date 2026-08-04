import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { notifyKycApproved } from "@/lib/notif/helper";
import { onKycApproved } from "@/lib/kyc/automation";

/**
 * POST /api/kyc/[id]/approve
 *
 * Approves a KYC submission and runs the full automation chain:
 *   1. Updates submission status → "approved"
 *   2. Auto-transfers KYC data into the partner record (name, tax id, address, bank, etc.)
 *   3. Sends the "KYC Approved" email to the portal client
 *   4. Auto-provisions a PortalAccess row (status = invited) if none exists
 *   5. Sends the portal welcome email with password-setup link
 *
 * Body (optional): { tier?: "premium"|"business"|"standard"|"basic" }
 *   — lets the admin override the default tier when provisioning portal access.
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
  let body: { tier?: "premium" | "business" | "standard" | "basic" } = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }

  try {
    const { submission, partner } = await auth.store.approveKycAndTransfer(id, auth.user.id);

    await audit(auth.store, auth.user, req, "kyc.approve", "kyc_submission", id, {
      partner_id: partner.id,
      auto_transferred: true,
      tier: body.tier || "business",
    });

    await notifyKycApproved(auth.tenantId || submission.tenant_id, partner.name, partner.id);

    // Run the full automation chain (email + portal access + welcome email)
    const tenant = await auth.store.getTenant(submission.tenant_id);
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    const { access } = await onKycApproved({
      store: auth.store,
      submission,
      partner,
      tenant,
      reviewerName: auth.user.username,
      preferredTier: body.tier,
      baseUrl,
    });

    return NextResponse.json({
      submission,
      partner,
      transferred: true,
      portal_access: access ? { ...access, password_hash: undefined } : null,
    });
  } catch (e: any) {
    console.error("[kyc.approve]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
