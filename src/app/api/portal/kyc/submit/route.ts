import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { getStore } from "@/lib/data/store";
import { notifyKycSubmitted } from "@/lib/notif/helper";

export const runtime = "nodejs";

// Portal: submit KYC for review (changes status from draft to submitted)
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
  const existing = await store.getKycSubmissionByPartner(access.partner_id);
  if (!existing) {
    return NextResponse.json({ error: "No KYC draft found. Save first." }, { status: 400 });
  }

  // Merge body fields on top of existing draft so validation checks the
  // combined data, not just what the client sent in this request.
  const merged = { ...existing, ...body };

  // Validate required fields before submission
  const required = ["legal_name", "tax_id", "address_line", "city", "country", "contact_name", "contact_email"];
  const missing = required.filter((f) => !merged[f]);
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const updated = await store.upsertKycSubmission({
    ...merged, id: existing.id, status: "submitted", submitted_at: new Date().toISOString(),
  });

  // Notify tenant admins
  const partner = await store.getPartner(access.partner_id);
  await notifyKycSubmitted(access.tenant_id, partner?.name || "A client", updated.id);

  return NextResponse.json(updated);
}
