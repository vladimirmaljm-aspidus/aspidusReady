import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";
import { notifyKycSubmitted } from "@/lib/notif/helper";

export const runtime = "nodejs";

// Portal: submit KYC for review (changes status from draft to submitted)
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
  const existing = await store.getKycSubmissionByPartner(access.partner_id);
  if (!existing) {
    return NextResponse.json({ error: "No KYC draft found. Save first." }, { status: 400 });
  }

  // Validate required fields before submission
  const required = ["legal_name", "tax_id", "address_line", "city", "country", "contact_name", "contact_email"];
  const missing = required.filter((f) => !body[f]);
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const updated = await store.upsertKycSubmission({
    ...body, id: existing.id, status: "submitted", submitted_at: new Date().toISOString(),
  });

  // Notify tenant admins
  const partner = await store.getPartner(access.partner_id);
  await notifyKycSubmitted(access.tenant_id, partner?.name || "A client", updated.id);

  return NextResponse.json(updated);
}
