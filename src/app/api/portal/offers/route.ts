import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

// Portal: list offers for the logged-in partner
export async function GET() {
  const access = await getPortalSessionAccess();
  if (!access) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!access.can_view_offers) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }
  const store = await getStore();
  const result = await store.listOffers(access.tenant_id, { filters: { partner_id: access.partner_id } });
  return NextResponse.json(result);
}
