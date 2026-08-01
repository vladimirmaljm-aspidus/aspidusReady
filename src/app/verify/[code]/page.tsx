import { getStore } from "@/lib/data/store";
import type { DocumentVerification } from "@/lib/supabase/types";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, FileText, Calendar, Hash, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  let v: DocumentVerification | null = null;

  try {
    const store = await getStore();
    v = await store.getDocumentVerificationByCode(code);

    // Log the verification attempt (resilient — won't throw)
    if (v) {
      const logResult: "valid" | "invalid" | "revoked" | "modified" =
        v.status === "active" ? "valid" :
        v.status === "revoked" ? "revoked" :
        v.status === "superseded" ? "modified" :
        "invalid";
      await store.logVerification({
        verification_id: v.id,
        code: v.verification_code,
        ip: null,
        user_agent: null,
        result: logResult,
        details: null,
      });
    }
  } catch (err) {
    console.warn("[VerifyPage] Error during verification lookup:", err);
  }

  const isValid = v && v.status === "active";

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card-premium shadow-soft-xl p-8 md:p-10">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-lg bg-foreground text-background flex items-center justify-center font-semibold">
              A
            </div>
            <div>
              <p className="font-semibold text-sm tracking-tight">Aspidus</p>
              <p className="text-xs text-muted-foreground">Document Verification</p>
            </div>
          </div>

          {!v ? (
            // Invalid code
            <div className="text-center py-8">
              <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="size-8 text-destructive" />
              </div>
              <h1 className="text-xl font-semibold mb-2">Invalid Document</h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                This verification code was not found in our system. The document may be fraudulent or incorrectly entered.
              </p>
              <div className="mt-6 p-3 rounded-lg bg-muted text-left">
                <p className="text-xs text-muted-foreground">Verification code</p>
                <p className="font-mono text-sm">{code}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Status icon */}
              <div className="text-center mb-6">
                <div className={`size-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isValid ? "bg-success/10" : v.status === "revoked" ? "bg-destructive/10" : "bg-warning/10"
                }`}>
                  {isValid ? <CheckCircle2 className="size-8 text-success" /> :
                   v.status === "revoked" ? <XCircle className="size-8 text-destructive" /> :
                   <AlertTriangle className="size-8 text-warning" />}
                </div>
                <h1 className="text-xl font-semibold mb-1">
                  {isValid ? "Document Verified" : v.status === "revoked" ? "Document Revoked" : "Document Superseded"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isValid
                    ? "This document is authentic and has been verified."
                    : v.status === "revoked"
                    ? "This document has been revoked by the issuer."
                    : "This document has been replaced by a newer version."}
                </p>
              </div>

              {/* Document details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Document Type</span>
                  </div>
                  <span className="text-sm font-medium capitalize">{v.document_type}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Hash className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Document Number</span>
                  </div>
                  <span className="text-sm font-medium font-mono">{v.document_number}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Issued On</span>
                  </div>
                  <span className="text-sm font-medium">
                    {v.issued_at ? new Date(v.issued_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Eye className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Times Verified</span>
                  </div>
                  <span className="text-sm font-medium tabular">{(v.verification_count ?? 0) + 1}</span>
                </div>
              </div>

              {/* Verification code */}
              <div className="p-3 rounded-lg border border-border/60 bg-card">
                <p className="text-xs text-muted-foreground mb-1">Verification Code</p>
                <p className="font-mono text-sm">{v.verification_code}</p>
              </div>

              {/* Security note */}
              <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-info/5">
                <ShieldCheck className="size-4 text-info shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  This verification is cryptographically secure. The document's SHA-256 hash is stored on our servers and compared during forensic checks to detect any modifications.
                </p>
              </div>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} Aspidus Trade Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}
