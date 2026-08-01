import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { notifyKycApproved } from "@/lib/notif/helper";

export const runtime = "nodejs";

// Approve KYC + auto-transfer data to partner record
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  try {
    const { submission, partner } = await auth.store.approveKycAndTransfer(id, auth.user.id);
    await audit(auth.store, auth.user, req, "kyc.approve", "kyc_submission", id, {
      partner_id: partner.id,
      auto_transferred: true,
    });
    // Notify
    await notifyKycApproved(auth.tenantId || submission.tenant_id, partner.name, partner.id);
    return NextResponse.json({ submission, partner, transferred: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
