import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

// Portal: get partner's KYC submission
export async function GET() {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  // Premium clients are exempt — return exempt status
  if (access.exempt_kyc) {
    return NextResponse.json({ submission: null, exempt: true });
  }

  const sub = await store.getKycSubmissionByPartner(access.partner_id);
  return NextResponse.json({ submission: sub, exempt: false });
}

// Portal: save/update KYC submission (draft or submit)
export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

  const body = await req.json();
  // Ensure partner + tenant are set correctly
  body.partner_id = access.partner_id;
  body.tenant_id = access.tenant_id;
  body.portal_access_id = access.id;

  const existing = await store.getKycSubmissionByPartner(access.partner_id);
  if (existing) {
    body.id = existing.id;
  } else if (!body.id) {
    body.status = body.status || "draft";
  }

  const saved = await store.upsertKycSubmission(body);
  return NextResponse.json(saved);
}
