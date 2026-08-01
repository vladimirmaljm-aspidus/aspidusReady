import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

// Portal: get + update own profile
export async function GET() {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access || !access.can_view_profile) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }
  const partner = await store.getPartner(access.partner_id);
  return NextResponse.json({ partner, access: { ...access, password_hash: undefined } });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }
  const body = await req.json();
  // Partner can only update limited fields (contact info)
  const allowed = {
    id: access.partner_id,
    contact_name: body.contact_name,
    contact_email: body.contact_email,
    contact_phone: body.contact_phone,
    phone: body.phone,
  };
  const updated = await store.upsertPartner(allowed);
  return NextResponse.json(updated);
}
