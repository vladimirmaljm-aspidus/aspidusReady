import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

// Portal: get partner's KYC submission
export async function GET() {
  try {
    const access = await getPortalSessionAccess();
    if (!access) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    // Premium clients are exempt — return exempt status
    if (access.exempt_kyc) {
      return NextResponse.json({ submission: null, exempt: true });
    }

    // Portal accounts must be linked to a partner before KYC can be loaded.
    if (!access.partner_id) {
      return NextResponse.json({ submission: null, exempt: false, unlinked: true });
    }

    const store = await getStore();
    const sub = await store.getKycSubmissionByPartner(access.partner_id);
    return NextResponse.json({ submission: sub, exempt: false });
  } catch (e: any) {
    console.error("[portal.kyc.GET]", e);
    return NextResponse.json(
      { error: "Could not load KYC status. Please refresh in a moment.", detail: e?.message || null },
      { status: 500 },
    );
  }
}

// Portal: save/update KYC submission (draft or submit)
export async function POST(req: NextRequest) {
  const access = await getPortalSessionAccess();
  if (!access) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const store = await getStore();

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
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
