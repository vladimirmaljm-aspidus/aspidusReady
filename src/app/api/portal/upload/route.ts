import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { uploadPortalFile } from "@/lib/upload/service";
import { recordPortalUpload, PortalUploadCategory } from "@/lib/portal/uploads";
import { getStore } from "@/lib/data/store";
import { audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/csv",
]);
const MAX_SIZE = 25 * 1024 * 1024;

/**
 * POST /api/portal/upload  (multipart/form-data)
 *   file            : File
 *   category        : kyc|rfq|message|general|other (default: general)
 *   doc_type        : string (optional label — passport, invoice, etc.)
 *   description     : string (optional client-facing note)
 *   kyc_submission_id / message_id : optional links
 *
 * Uploaded to the portal-uploads bucket, recorded in portal_uploads table.
 * The admin can then browse everything a partner has uploaded from the new
 * Portal Uploads module.
 */
export async function POST(req: NextRequest) {
  const access = await getPortalSessionAccess();
  if (!access) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const category = ((form.get("category") as string) || "general") as PortalUploadCategory;
  const docType = (form.get("doc_type") as string) || null;
  const description = (form.get("description") as string) || null;
  const kycSubmissionId = (form.get("kyc_submission_id") as string) || null;
  const messageId = (form.get("message_id") as string) || null;

  if (!file) return NextResponse.json({ error: "File is required." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large. Max 25 MB." }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadPortalFile({
      tenantId: access.tenant_id,
      partnerId: access.partner_id,
      category,
      fileName: file.name,
      buffer: buf,
      contentType: file.type,
      size: file.size,
    });
    // portal_uploads canonical column is `size_bytes` (verified against
    // production DB introspection).
    const row = await recordPortalUpload({
      tenant_id: access.tenant_id,
      partner_id: access.partner_id,
      portal_access_id: access.id,
      category,
      doc_type: docType,
      kyc_submission_id: kycSubmissionId,
      message_id: messageId,
      filename: file.name,
      storage_bucket: "portal-uploads",
      storage_path: uploaded.path,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by_email: access.portal_email,
      description,
    });

    // Audit the upload
    try {
      const auditStore = await getStore();
      await audit(
        auditStore,
        { id: `portal:${access.id}`, username: access.portal_email || "", tenant_id: access.tenant_id },
        req,
        "portal.document_uploaded",
        "portal_upload",
        (row as any)?.id,
        { filename: file.name, content_type: file.type, size: file.size, category, doc_type: docType },
      );
    } catch (e) { console.error("[audit]", e); }

    return NextResponse.json(row);
  } catch (e: any) {
    console.error("[portal.upload]", e);
    return NextResponse.json({ error: e.message || "Upload failed." }, { status: 500 });
  }
}
