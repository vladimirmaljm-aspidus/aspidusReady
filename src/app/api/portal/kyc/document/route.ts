import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { getStore } from "@/lib/data/store";
import { uploadKycDocument } from "@/lib/upload/service";
import { audit } from "@/lib/api/helpers";
import { verifyKycUpload } from "@/lib/upload/verify-file";

export const runtime = "nodejs";

// Portal: upload a KYC document file (multipart form-data)
export async function POST(req: NextRequest) {
  const access = await getPortalSessionAccess();
  if (!access) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const store = await getStore();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const docType = formData.get("type") as string | null;

  if (!file || !docType) {
    return NextResponse.json({ error: "File and document type required." }, { status: 400 });
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Allowed: PDF, JPEG, PNG, WebP." }, { status: 400 });
  }

  // Ensure submission exists
  const existing = await store.getKycSubmissionByPartner(access.partner_id);
  if (!existing) {
    return NextResponse.json({ error: "Save KYC form first." }, { status: 400 });
  }

  // Read file buffer once and verify actual content via magic bytes (prevents MIME spoofing)
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const verification = verifyKycUpload(buffer, file.type);
  if (!verification.isValid) {
    return NextResponse.json({ error: verification.error }, { status: 400 });
  }

  // Upload to storage
  const uploadResult = await uploadKycDocument(
    existing.id,
    file.name,
    buffer,
    file.type,
    file.size
  );

  // Save document metadata
  const doc = await store.addKycDocument({
    submission_id: existing.id,
    type: docType as any,
    filename: file.name,
    storage_path: uploadResult.path,
    mime_type: file.type,
    size: file.size,
  });

  // Audit the document upload
  try {
    await audit(
      store,
      { id: `portal:${access.id}`, username: access.portal_email || "", tenant_id: access.tenant_id },
      req,
      "portal.kyc_document_uploaded",
      "kyc_document",
      (doc as any)?.id,
      { document_type: docType, filename: file.name, mime_type: file.type, size: file.size, submission_id: existing.id },
    );
  } catch (e) { console.error("[audit]", e); }

  return NextResponse.json(doc);
}
