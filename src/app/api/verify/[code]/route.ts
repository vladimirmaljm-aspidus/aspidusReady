import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

// Public QR verification — no auth required.
// Returns document validity + metadata (no sensitive data).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const store = await getStore();
  const v = await store.getDocumentVerificationByCode(code);
  if (!v) {
    return NextResponse.json({
      valid: false,
      result: "invalid",
      message: "Verification code not found. This document may be fraudulent.",
    });
  }
  // log the verification
  const logResult: "valid" | "invalid" | "revoked" | "modified" =
    v.status === "active" ? "valid" :
    v.status === "revoked" ? "revoked" :
    v.status === "superseded" ? "modified" :
    "invalid";
  await store.logVerification({
    verification_id: v.id,
    code: v.verification_code,
    ip: _req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    user_agent: _req.headers.get("user-agent") || null,
    result: logResult,
    details: null,
  });

  if (v.status !== "active") {
    return NextResponse.json({
      valid: false,
      result: logResult,
      message: v.status === "revoked"
        ? "This document has been revoked by the issuer."
        : "This document has been superseded by a newer version.",
      document_number: v.document_number,
      document_type: v.document_type,
      issued_at: v.issued_at,
    });
  }

  return NextResponse.json({
    valid: true,
    result: "valid",
    message: "This document is valid and authentic.",
    document_type: v.document_type,
    document_number: v.document_number,
    issued_at: v.issued_at,
    verification_count: v.verification_count + 1,
    last_verified_at: new Date().toISOString(),
  });
}
