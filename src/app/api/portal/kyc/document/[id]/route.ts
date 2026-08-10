import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { getStore } from "@/lib/data/store";
import { getPortalUpload } from "@/lib/portal/uploads";
import { deleteFile } from "@/lib/upload/service";
import { audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * DELETE /api/portal/kyc/document/[id]
 * Soft-deletes the KYC document row and removes the storage object so we
 * don't leave orphaned files in the kyc-documents bucket.
 * Scope: partner must own the submission the doc belongs to.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const access = await getPortalSessionAccess();
  if (!access) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const { id } = await params;
  const store = await getStore();

  const upload = await getPortalUpload(id, access.tenant_id);
  if (!upload) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if ((upload as any).partner_id !== access.partner_id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if ((upload as any).category !== "kyc") {
    return NextResponse.json({ error: "Not a KYC document." }, { status: 400 });
  }

  await store.removeKycDocument(id);
  await deleteFile((upload as any).storage_bucket || "kyc-documents", (upload as any).storage_path).catch(() => {});

  // Audit the document deletion
  try {
    await audit(
      store,
      { id: `portal:${access.id}`, username: access.portal_email || "", tenant_id: access.tenant_id },
      req,
      "portal.kyc_document_deleted",
      "kyc_document",
      id,
      {
        filename: (upload as any).filename || null,
        submission_id: (upload as any).submission_id || null,
      },
    );
  } catch (e) { console.error("[audit]", e); }

  return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
