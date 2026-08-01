import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

// Portal: view catalog products (tenant's product catalog)
export async function GET() {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access || !access.can_view_catalog) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }
  const result = await store.listProductCatalog(access.tenant_id, {});
  return NextResponse.json(result);
}
