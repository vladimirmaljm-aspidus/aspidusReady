import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { requireKycApproved } from "@/lib/portal/kyc-gate";
import { getStore } from "@/lib/data/store";
import { notifyRfqReceived } from "@/lib/notif/helper";

export const runtime = "nodejs";

// Portal: list partner's RFQs
export async function GET() {
  const access = await getPortalSessionAccess();
  if (!access) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!access.can_submit_rfq) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }
  const _kycBlock = await requireKycApproved(access);
  if (_kycBlock) return _kycBlock;
  const store = await getStore();
  const rfqs = await store.listPortalRfqsByPartner(access.partner_id);
  return NextResponse.json({ items: rfqs });
}

// Portal: create RFQ
export async function POST(req: NextRequest) {
  const access = await getPortalSessionAccess();
  if (!access) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!access.can_submit_rfq) {
    return NextResponse.json({ error: "RFQ submission not permitted." }, { status: 403 });
  }
  const store = await getStore();

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  body.partner_id = access.partner_id;
  body.tenant_id = access.tenant_id;
  body.portal_access_id = access.id;

  // Auto-generate RFQ number (format: RFQ-2026-001)
  const year = new Date().getFullYear();
  const existingRfqs = await store.listPortalRfqsByPartner(access.partner_id);
  const yearRfqs = existingRfqs.filter((r: any) => r.number?.includes(`RFQ-${year}`));
  const nextNum = yearRfqs.length + 1;
  body.number = `RFQ-${year}-${String(nextNum).padStart(3, "0")}`;

  // Set default status
  if (!body.status) body.status = "pending";

  try {
    const created = await store.upsertPortalRfq(body);

    // Notify tenant admins
    const partner = await store.getPartner(access.partner_id);
    await notifyRfqReceived(access.tenant_id, partner?.name || "A client", body.product_name || "a product", created.id);

    return NextResponse.json(created);
  } catch (e: any) {
    console.error("[portal.rfqs.create]", e);
    return NextResponse.json({ error: e.message || "Failed to create RFQ." }, { status: 500 });
  }
}
