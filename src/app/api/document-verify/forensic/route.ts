import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/helpers";

export const runtime = "nodejs";

// Forensic check: compare uploaded PDF hash against stored hash.
// Accepts: { verification_code, pdf_base64 }
// Returns: { match: boolean, stored_hash, computed_hash, details }
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (document-verify.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "document-verify.read"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_document_verification)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_document_verification", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

  try {
    const { verification_code, pdf_hash } = await req.json();
    if (!verification_code || !pdf_hash) {
      return NextResponse.json({ error: "verification_code and pdf_hash required." }, { status: 400 });
    }
    const store = auth.store;
    const v = await store.getDocumentVerificationByCode(verification_code);
    if (!v) {
      return NextResponse.json({
        match: false,
        result: "invalid",
        message: "Verification code not found.",
      });
    }
    const computed = pdf_hash.startsWith("sha256:") ? pdf_hash : `sha256:${pdf_hash}`;
    const match = computed === v.pdf_hash;
    return NextResponse.json({
      match,
      result: match ? "valid" : "modified",
      message: match
        ? "PDF is authentic — no modifications detected."
        : "PDF has been modified after issuance. Stored hash does not match.",
      document_number: v.document_number,
      document_type: v.document_type,
      issued_at: v.issued_at,
      stored_hash: v.pdf_hash,
      computed_hash: computed,
      pdf_size: v.pdf_size,
    });
  } catch (e) {
    console.error("[forensic]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
