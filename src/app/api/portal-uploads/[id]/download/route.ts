import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { getPortalUpload } from "@/lib/portal/uploads";
import { getSignedDownloadUrl } from "@/lib/upload/service";

export const runtime = "nodejs";

/**
 * GET /api/portal-uploads/[id]/download
 * Returns a 302 redirect to a short-lived signed URL for the storage object.
 * Audit-logged so we know who fetched which portal document.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "portal-uploads.download"); if (_d) return _d; }

  const { id } = await params;
  const upload = await getPortalUpload(id, auth.tenantId || "");
  if (!upload) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && upload.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (upload.deleted_at) return NextResponse.json({ error: "This file was deleted." }, { status: 410 });

  const signed = await getSignedDownloadUrl(upload.storage_bucket, upload.storage_path, 300);
  if (!signed) return NextResponse.json({ error: "Storage unavailable." }, { status: 502 });

  await audit(auth.store, auth.user, req, "portal_upload.download", "portal_upload", id, { filename: upload.filename }).catch(() => {});
  return NextResponse.redirect(signed, 302);
}
