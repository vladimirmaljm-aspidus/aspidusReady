import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { requireKycApproved } from "@/lib/portal/kyc-gate";
import { getStore } from "@/lib/data/store";
import { getSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

const BUCKET = "shared-documents";

/**
 * GET /api/portal/documents/[id]/download
 * Returns a 302 redirect to a short-lived signed URL for the shared document.
 * ?mode=inline requests a viewer-friendly URL (no forced download header).
 * Scope: partner-owned + visible_to_partner + KYC approved.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const access = await getPortalSessionAccess();
  if (!access) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!access.can_view_documents) return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  const kycBlock = await requireKycApproved(access);
  if (kycBlock) return kycBlock;

  const { id } = await params;
  const store = await getStore();
  const doc = await store.getDocument(id);
  if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if ((doc as any).tenant_id !== access.tenant_id) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if ((doc as any).partner_id !== access.partner_id) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!(doc as any).visible_to_partner) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const path = (doc as any).storage_path as string | undefined;
  if (!path) return NextResponse.json({ error: "No file attached to this document." }, { status: 404 });

  const inline = new URL(req.url).searchParams.get("mode") === "inline";
  const sb = getSupabase();
  const { data, error } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(path, 300, inline ? undefined : { download: (doc as any).filename || true });
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Storage unavailable." }, { status: 502 });

  return NextResponse.redirect(data.signedUrl, 302);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
