import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access || !access.can_view_documents) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }
  const result = await store.listDocuments(access.tenant_id, { filters: { partner_id: access.partner_id } });
  // only show docs visible to partner
  result.items = result.items.filter((d) => d.visible_to_partner);
  return NextResponse.json(result);
}
