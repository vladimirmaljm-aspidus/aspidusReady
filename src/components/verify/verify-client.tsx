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
  MapPin,
  Loader2,
} from "lucide-react";
import type { DocumentVerification } from "@/lib/supabase/types";

interface VerifyClientProps {
  verification: DocumentVerification | null;
  code: string;
}

/**
 * Public QR document verification UI.
 *
 * Renders a "Requesting location..." spinner while the browser resolves
 * precise GPS coordinates via `navigator.geolocation.getCurrentPosition`,
 * then POSTs the result (GPS coords + source) to `/api/verify/[code]`.
 *
 * GPS capture is best-effort:
 *  - If the browser doesn't support geolocation, we submit with IP-only.
 *  - If the user denies or the request times out, we submit with IP-only.
 *  - Verification NEVER blocks on GPS failure — the document's validity
 *    is the source of truth, the GPS data just enriches the audit trail.
 *
 * The POST handler persists a row to `document_verification_logs` with
 * GPS coords taking PRIORITY over IP-based geo (when available). The
 * raw_headers column records which source supplied the coordinates.
 *
 * Mirrors `src/lib/portal/use-geolocation.ts` (portal client login) so
 * document verification now records the SAME level of precision as the
 * portal.
 */
export function VerifyClient({ verification: v, code }: VerifyClientProps) {
  const [gpsState, setGpsState] = React.useState<{
    loading: boolean;
    coords: { latitude: number; longitude: number; accuracy?: number } | null;
    error: string | null;
    submitted: boolean;
  }>({
    loading: true,
    coords: null,
    error: null,
    submitted: false,
  });

  // Request GPS once, then submit the verification result to the API.
  // `submitted` guards against React strict-mode double-invoke.
  React.useEffect(() => {
    if (gpsState.submitted) return;

    const submitVerification = (
      coords: { latitude: number; longitude: number; accuracy?: number } | null,
      source: "browser" | "ip"
    ) => {
      // Fire-and-forget — keepalive ensures the request completes even
      // if the user navigates away. Silent catch: verification should
      // still render even if the logging endpoint is unreachable.
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
        .catch(() => {
          /* silent — best-effort logging */
        })
        .finally(() => {
          setGpsState((s) => ({ ...s, submitted: true, loading: false }));
        });
    };

    // No geolocation support → IP-only audit trail.
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      submitVerification(null, "ip");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setGpsState((s) => ({ ...s, coords, error: null }));
        submitVerification(coords, "browser");
      },
      (err) => {
        // User denied, timed out, or position unavailable. Don't block —
        // the document is still verifiable, we just log IP-only.
        setGpsState((s) => ({ ...s, error: err.message }));
        submitVerification(null, "ip");
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, [code, gpsState.submitted]);

  // ── Loading: GPS still being requested ──────────────────────────────
  if (gpsState.loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="card-premium shadow-soft-xl p-8 md:p-10 text-center">
            <Loader2 className="size-12 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-xl font-semibold mb-2">Verifying Document</h1>
            <p className="text-sm text-muted-foreground">
              Requesting your location for security verification…
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This helps us protect against document fraud.
            </p>
          </div>
        </div>
      </div>
    );
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

          {/* GPS capture status */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 pb-4 border-b">
            {gpsState.coords ? (
              <>
                <MapPin className="size-3.5 text-success" />
                <span>
                  Location verified:{" "}
                  <span className="font-mono">
                    {gpsState.coords.latitude.toFixed(4)}, {gpsState.coords.longitude.toFixed(4)}
                  </span>
                  {typeof gpsState.coords.accuracy === "number" && (
                    <span className="text-muted-foreground/70">
                      {" "}
                      (±{Math.round(gpsState.coords.accuracy)}m)
                    </span>
                  )}
                </span>
              </>
            ) : (
              <>
                <MapPin className="size-3.5 text-muted-foreground" />
                <span>
                  Location: IP-based only
                  {gpsState.error ? ` — ${gpsState.error}` : " (GPS unavailable or denied)"}
                </span>
              </>
            )}
          </div>

          {!v ? (
            // ── Invalid code ──────────────────────────────────────────
            <div className="text-center py-8">
              <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="size-8 text-destructive" />
              </div>
              <h1 className="text-xl font-semibold mb-2">Invalid Document</h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                This verification code was not found in our system. The document may be
                fraudulent or incorrectly entered.
              </p>
              <div className="mt-6 p-3 rounded-lg bg-muted text-left">
                <p className="text-xs text-muted-foreground">Verification code</p>
                <p className="font-mono text-sm">{code}</p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Status icon ─────────────────────────────────────── */}
              <div className="text-center mb-6">
                <div
                  className={`size-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isValid
                      ? "bg-success/10"
                      : v.status === "revoked"
                      ? "bg-destructive/10"
                      : "bg-warning/10"
                  }`}
                >
                  {isValid ? (
                    <CheckCircle2 className="size-8 text-success" />
                  ) : v.status === "revoked" ? (
                    <XCircle className="size-8 text-destructive" />
                  ) : (
                    <AlertTriangle className="size-8 text-warning" />
                  )}
                </div>
                <h1 className="text-xl font-semibold mb-1">
                  {isValid
                    ? "Document Verified"
                    : v.status === "revoked"
                    ? "Document Revoked"
                    : "Document Superseded"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isValid
                    ? "This document is authentic and has been verified."
                    : v.status === "revoked"
                    ? "This document has been revoked by the issuer."
                    : "This document has been replaced by a newer version."}
                </p>
              </div>

              {/* ── Document details ─────────────────────────────────── */}
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
                    {v.issued_at
                      ? new Date(v.issued_at).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Eye className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Times Verified</span>
                  </div>
                  <span className="text-sm font-medium tabular">
                    {(v.verification_count ?? 0) + 1}
                  </span>
                </div>
              </div>

              {/* ── Verification code ───────────────────────────────── */}
              <div className="p-3 rounded-lg border border-border/60 bg-card">
                <p className="text-xs text-muted-foreground mb-1">Verification Code</p>
                <p className="font-mono text-sm">{v.verification_code}</p>
              </div>

              {/* ── Security note ───────────────────────────────────── */}
              <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-info/5">
                <ShieldCheck className="size-4 text-info shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  This verification is cryptographically secure. The document&apos;s SHA-256 hash is
                  stored on our servers and compared during forensic checks to detect any
                  modifications.
                </p>
              </div>
            </>
          )}

          {/* ── Footer ─────────────────────────────────────────────── */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} Aspidus Trade Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}
