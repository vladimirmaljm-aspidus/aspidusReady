import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { getStore } from "@/lib/data/store";
import { getSupabase } from "@/lib/supabase/client";
import { notifyKycSubmitted } from "@/lib/notif/helper";
import { audit } from "@/lib/api/helpers";

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

  // CRITICAL FIX (audit P0-2): validate at least one KYC document was uploaded
  // before allowing submission. Previously a partner could submit the KYC form
  // with zero supporting documents — admins would then have to bounce it back,
  // creating a back-and-forth loop and delaying approval. We require ≥1 active
  // (non-deleted) upload in the "kyc" category for this (partner, tenant).
  const { data: docs } = await getSupabase()
    .from("portal_uploads")
    .select("id, category")
    .eq("partner_id", access.partner_id)
    .eq("tenant_id", access.tenant_id)
    .eq("category", "kyc")
    .is("deleted_at", null) // exclude soft-deleted uploads
    .limit(1);
  if (!docs || docs.length === 0) {
    return NextResponse.json(
      { error: "Please upload at least one KYC document before submitting." },
      { status: 400 },
    );
  }

  const updated = await store.upsertKycSubmission({
    ...merged, id: existing.id, status: "submitted", submitted_at: new Date().toISOString(),
  });

  // Audit the KYC submission (FLOW-5)
  try {
    await audit(
      store,
      { id: `portal:${access.id}`, username: access.portal_email || "", tenant_id: access.tenant_id },
      req,
      "portal.kyc_submitted",
      "kyc_submission",
      updated.id,
      { submission_type: (updated as any)?.entity_type || (body as any)?.submission_type || null },
    );
  } catch (e) { console.error("[audit]", e); }

  // Notify tenant admins
  const partner = await store.getPartner(access.partner_id);
  await notifyKycSubmitted(access.tenant_id, partner?.name || "A client", updated.id);

  return NextResponse.json(updated);
}
