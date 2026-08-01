import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

// Portal: list offers for the logged-in partner
export async function GET() {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access || !access.can_view_offers) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }
  const result = await store.listOffers(access.tenant_id, { filters: { partner_id: access.partner_id } });
  return NextResponse.json(result);
}
