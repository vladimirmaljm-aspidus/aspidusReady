"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Calendar,
  Hash,
  Eye,
  Loader2,
  Lock,
  Fingerprint,
  Clock,
  Building2,
} from "lucide-react";
import type { DocumentVerification } from "@/lib/supabase/types";

interface VerifyClientProps {
  verification: DocumentVerification | null;
  code: string;
}

export function VerifyClient({ verification: v, code }: VerifyClientProps) {
  const [phase, setPhase] = React.useState<"requesting" | "denied" | "ready">("requesting");
  const [gpsCoords, setGpsCoords] = React.useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const submittedRef = React.useRef(false);

  // Request GPS — BLOCK if user denies
  React.useEffect(() => {
    if (submittedRef.current) return;

    const submit = (coords: { latitude: number; longitude: number; accuracy?: number } | null, source: "browser" | "ip") => {
      fetch(`/api/verify/${encodeURIComponent(code)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          accuracy: coords?.accuracy ?? null,
          source,
        }),
        keepalive: true,
      })
        .catch(() => {})
        .finally(() => {
          submittedRef.current = true;
          setPhase("ready");
        });
    };

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      submit(null, "ip");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setGpsCoords(coords);
        submit(coords, "browser");
      },
      () => {
        // User denied — BLOCK, don't submit, don't show document
        setPhase("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 0,
      }
    );
  }, [code]);

  // ── Phase: Requesting location ──────────────────────────────────
  if (phase === "requesting") {
    return (
      <div className="verify-bg min-h-screen flex items-center justify-center p-4">
        <div className="verify-card w-full max-w-md p-10 text-center">
          <div className="verify-glow" />
          <div className="relative z-10">
            <div className="verify-logo mb-8">
              <div className="size-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mt-2">Aspidus</p>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-24 rounded-full border-2 border-slate-200/40 animate-ping-slow" />
              </div>
              <Loader2 className="size-10 animate-spin mx-auto text-slate-600 relative z-10 mt-7" />
            </div>

            <h1 className="text-lg font-semibold text-slate-800 mb-2">Authenticating</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Please allow location access to verify this document.
            </p>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Location verification is required to protect against document fraud and unauthorized access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: Location denied — BLOCKED ─────────────────────────────
  if (phase === "denied") {
    return (
      <div className="verify-bg min-h-screen flex items-center justify-center p-4">
        <div className="verify-card w-full max-w-md p-10 text-center">
          <div className="verify-glow verify-glow-red" />
          <div className="relative z-10">
            <div className="verify-logo mb-8">
              <div className="size-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mx-auto shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mt-2">Aspidus</p>
            </div>

            <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <Lock className="size-8 text-red-500" />
            </div>

            <h1 className="text-lg font-semibold text-slate-800 mb-2">Location Access Required</h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              This document cannot be verified without location access. Please enable location permissions and reload this page.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2">
              <p className="text-xs font-semibold text-slate-700">How to enable:</p>
              <div className="text-xs text-slate-500 space-y-1.5">
                <p>📱 <strong>iOS Safari:</strong> Settings → Privacy → Location Services → On</p>
                <p>🤖 <strong>Android Chrome:</strong> Site settings → Location → Allow</p>
                <p>💻 <strong>Desktop:</strong> Click the location icon in the address bar → Allow</p>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-colors"
            >
              Reload & Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: Ready — show document ─────────────────────────────────
  const isValid = v && v.status === "active";

  return (
    <div className="verify-bg min-h-screen flex items-center justify-center p-4">
      <div className="verify-card w-full max-w-md p-8 md:p-10">
        <div className="verify-glow" />
        <div className="relative z-10">
          {/* Brand */}
          <div className="verify-brand mb-8">
            <div className="size-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm tracking-tight text-slate-800">Aspidus</p>
              <p className="text-[10px] tracking-[0.15em] uppercase text-slate-400">Trade Management Platform</p>
            </div>
          </div>

          {!v ? (
            // Invalid code
            <div className="text-center py-6">
              <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <XCircle className="size-8 text-red-500" />
              </div>
              <h1 className="text-lg font-semibold text-slate-800 mb-2">Document Not Found</h1>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                This verification code was not found in our system. The document may be fraudulent or incorrectly entered.
              </p>
              <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <p className="text-xs text-slate-400">Verification code</p>
                <p className="font-mono text-sm text-slate-700">{code}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Status icon + title */}
              <div className="text-center mb-6">
                <div className={`size-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isValid ? "bg-emerald-50" : v.status === "revoked" ? "bg-red-50" : "bg-amber-50"
                }`}>
                  {isValid ? (
                    <CheckCircle2 className="size-8 text-emerald-500" />
                  ) : v.status === "revoked" ? (
                    <XCircle className="size-8 text-red-500" />
                  ) : (
                    <AlertTriangle className="size-8 text-amber-500" />
                  )}
                </div>
                <h1 className="text-xl font-semibold text-slate-800 mb-1">
                  {isValid ? "Document Verified" : v.status === "revoked" ? "Document Revoked" : "Document Updated"}
                </h1>
                <p className="text-sm text-slate-500">
                  {isValid
                    ? "This document is authentic and verified."
                    : v.status === "revoked"
                    ? "This document has been revoked by the issuer."
                    : "This document has been replaced by a newer version."}
                </p>
              </div>

              {/* Document details — forensic grid */}
              <div className="space-y-2 mb-6">
                {/* Document type */}
                <div className="verify-detail-row">
                  <div className="verify-detail-icon">
                    <FileText className="size-3.5" />
                  </div>
                  <span className="verify-detail-label">Document Type</span>
                  <span className="verify-detail-value capitalize">{v.document_type || "Document"}</span>
                </div>

                {/* Document number */}
                {v.document_number && (
                  <div className="verify-detail-row">
                    <div className="verify-detail-icon">
                      <Hash className="size-3.5" />
                    </div>
                    <span className="verify-detail-label">Document No.</span>
                    <span className="verify-detail-value font-mono">{v.document_number}</span>
                  </div>
                )}

                {/* Date issued */}
                <div className="verify-detail-row">
                  <div className="verify-detail-icon">
                    <Calendar className="size-3.5" />
                  </div>
                  <span className="verify-detail-label">Date Issued</span>
                  <span className="verify-detail-value">
                    {v.issued_at
                      ? new Date(v.issued_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                      : new Date(v.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* Valid until (if available) */}
                {(v as any).valid_until && (
                  <div className="verify-detail-row">
                    <div className="verify-detail-icon">
                      <Clock className="size-3.5" />
                    </div>
                    <span className="verify-detail-label">Valid Until</span>
                    <span className="verify-detail-value">
                      {new Date((v as any).valid_until).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}

                {/* Issued by */}
                <div className="verify-detail-row">
                  <div className="verify-detail-icon">
                    <Building2 className="size-3.5" />
                  </div>
                  <span className="verify-detail-label">Issued By</span>
                  <span className="verify-detail-value">Aspidus DMCC</span>
                </div>

                {/* Verification count */}
                <div className="verify-detail-row">
                  <div className="verify-detail-icon">
                    <Eye className="size-3.5" />
                  </div>
                  <span className="verify-detail-label">Times Verified</span>
                  <span className="verify-detail-value tabular">{(v.verification_count ?? 0) + 1}</span>
                </div>
              </div>

              {/* Verification code */}
              <div className="p-3 rounded-xl border border-slate-200/60 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-1">
                  <Fingerprint className="size-3 text-slate-400" />
                  <p className="text-[10px] tracking-wider uppercase text-slate-400">Verification Hash</p>
                </div>
                <p className="font-mono text-xs text-slate-600 break-all">{v.verification_code}</p>
              </div>

              {/* Security footer */}
              <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <ShieldCheck className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  This document is protected by Aspidus Secure Verification™. The document hash is stored on our servers and compared during forensic checks to detect any modifications.
                </p>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 text-center">
            <p className="text-[10px] text-slate-400">
              © {new Date().getFullYear()} Aspidus Trade Management Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Embedded styles — standalone page, no external CSS */}
    </div>
  );
}
