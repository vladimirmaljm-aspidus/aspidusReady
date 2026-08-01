import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";
import { uploadKycDocument } from "@/lib/upload/service";

export const runtime = "nodejs";

// Portal: upload a KYC document file (multipart form-data)
export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const accessId = session.sub.replace("portal:", "");
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access) return NextResponse.json({ error: "Not permitted." }, { status: 403 });

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

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

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

  return NextResponse.json(doc);
}
