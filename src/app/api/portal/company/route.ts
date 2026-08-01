import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

// Portal: view tenant (company) info
export async function GET() {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access || !access.can_view_company_info) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }
  const tenant = await store.getTenant(access.tenant_id);
  return NextResponse.json({ tenant });
}
