import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId } from "@/lib/api/helpers";
import { createHash } from "crypto";

export const runtime = "nodejs";

// Admin: look up verification by document (offer/invoice/proforma)
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (document-verify.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "document-verify.read"); if (_d) return _d; } /* requirePermission wired */

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ error: "No tenant." }, { status: 400 });

  const url = new URL(req.url);
  const docType = url.searchParams.get("doc_type");
  const docId = url.searchParams.get("doc_id");
  if (!docType || !docId) {
    return NextResponse.json({ error: "doc_type and doc_id required." }, { status: 400 });
  }
  const v = await auth.store.getDocumentVerificationByDoc(tenantId, docType, docId);
  if (!v) return NextResponse.json({ verification: null });
  return NextResponse.json({ verification: v });
}
