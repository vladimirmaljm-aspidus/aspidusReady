import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";
import { notifyRfqReceived } from "@/lib/notif/helper";

export const runtime = "nodejs";

// Portal: list partner's RFQs
export async function GET() {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access || !access.can_submit_rfq) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }
  const rfqs = await store.listPortalRfqsByPartner(access.partner_id);
  return NextResponse.json({ items: rfqs });
}

// Portal: create RFQ
export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access || !access.can_submit_rfq) {
    return NextResponse.json({ error: "RFQ submission not permitted." }, { status: 403 });
  }

  const body = await req.json();
  body.partner_id = access.partner_id;
  body.tenant_id = access.tenant_id;
  body.portal_access_id = access.id;

  const created = await store.upsertPortalRfq(body);

  // Notify tenant admins
  const partner = await store.getPartner(access.partner_id);
  await notifyRfqReceived(access.tenant_id, partner?.name || "A client", body.product_name || "a product", created.id);

  return NextResponse.json(created);
}
