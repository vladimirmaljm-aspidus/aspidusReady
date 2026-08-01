import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { notifyKycRejected } from "@/lib/notif/helper";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const updated = await auth.store.upsertKycSubmission({
    id, status: "rejected", rejection_reason: body.reason || null,
    reviewed_by: auth.user.id, reviewed_at: new Date().toISOString(),
  });
  await audit(auth.store, auth.user, req, "kyc.reject", "kyc_submission", id, { reason: body.reason });
  // Notify
  const partner = await auth.store.getPartner(updated.partner_id);
  await notifyKycRejected(auth.tenantId || updated.tenant_id, partner?.name || "Client", id, body.reason);
  return NextResponse.json(updated);
}
