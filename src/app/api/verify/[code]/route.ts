import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getSupabase } from "@/lib/supabase/client";
import { parseUserAgent } from "@/lib/utils/device-parser";
import { lookupIp, GeoData } from "@/lib/utils/geo-ip";

export const runtime = "nodejs";

// Public QR verification — no auth required.
// Returns document validity + metadata (no sensitive data).
//
// SIDE EFFECT: persists a row to `document_verification_logs` capturing
// WHO (IP, country, city, lat/lng), WHAT device (UA-parsed browser/OS/type),
// and the verification result. This is for fraud prevention: super-admins
// can review every verification via /api/super-admin/verification-logs.
// The write is best-effort — if the table is missing or the insert fails,
// the public verify endpoint MUST still return the correct result.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const store = await getStore();
  const v = await store.getDocumentVerificationByCode(code);
  if (!v) {
    // Even for unknown codes, attempt to log the attempt for fraud analysis.
    // The store.getDocumentVerificationByCode already returned null — we don't
    // have a verification_id, but we still want to know WHO probed a bad code.
    void logVerificationAttempt(_req, code, null, "invalid", null);
    return NextResponse.json({
      valid: false,
      result: "invalid",
      message: "Verification code not found. This document may be fraudulent.",
    });
  }

  // Determine the result BEFORE recording — the log captures the resolved
  // status so the super-admin viewer can filter by valid/invalid/revoked.
  const logResult: "valid" | "invalid" | "revoked" | "modified" =
    v.status === "active" ? "valid" :
    v.status === "revoked" ? "revoked" :
    v.status === "superseded" ? "modified" :
    "invalid";

  // ── Original verification_logs table (kept for back-compat) ───────────
  // Failures here are non-fatal — the public verification endpoint must
  // never turn a valid document into a 500.
  try {
    await store.logVerification({
      verification_id: v.id,
      code: v.verification_code,
      ip: _req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      user_agent: _req.headers.get("user-agent") || null,
      result: logResult,
      details: null,
    });
  } catch (e) {
    console.error("[verify] logVerification failed:", e);
  }

  // ── Detailed document_verification_logs row (WHO/WHERE/HOW) ───────────
  void logVerificationAttempt(
    _req,
    v.verification_code,
    v.tenant_id,
    logResult,
    v,
  );

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

// ─── Helper: capture detailed verification metadata ────────────────────────
//
// Persisted via service_role (bypasses RLS). The table is created by
// supabase/migrations/006_document_verification_logs.sql. If the table is
// missing (migration not yet applied), the insert fails silently — the
// public verify endpoint continues to function.
async function logVerificationAttempt(
  req: NextRequest,
  code: string,
  tenantId: string | null,
  result: "valid" | "invalid" | "revoked" | "modified",
  v: {
    id: string;
    document_type?: string | null;
    document_id?: string | null;
    document_number?: string | null;
  } | null,
): Promise<void> {
  try {
    // Resolve the caller's IP. x-forwarded-for may contain a chain
    // (client, proxy1, proxy2) — take the first (closest to the client).
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = req.headers.get("user-agent") || null;
    const device = parseUserAgent(userAgent);

    // Geo lookup is non-blocking — failures fall through to nulls via the
    // EMPTY_GEO sentinel returned by lookupIp on error / loopback IPs.
    let geo: GeoData = {
      country: null,
      city: null,
      region: null,
      latitude: null,
      longitude: null,
    };
    try {
      geo = await lookupIp(ip);
    } catch {
      // Keep the empty-geo default; the row is still useful for IP/UA analysis.
    }

    const sb = getSupabase();
    const { error } = await sb.from("document_verification_logs").insert({
      tenant_id: tenantId,
      verification_code: code,
      document_type: v?.document_type ?? null,
      document_id: v?.document_id ?? null,
      document_number: v?.document_number ?? null,
      ip,
      country: geo.country,
      city: geo.city,
      region: geo.region,
      latitude: geo.latitude,
      longitude: geo.longitude,
      user_agent: userAgent,
      device_type: device.deviceType,
      browser: device.browser,
      os: device.os,
      device_name: device.deviceName,
      result,
      verification_id: v?.id ?? null,
      referrer: req.headers.get("referer") || null,
      accept_language: req.headers.get("accept-language") || null,
    });
    if (error) {
      // Most common cause: migration 006 not yet applied (table missing).
      // Log once per error type and move on — do not crash the verify path.
      console.error("[verify] document_verification_logs insert failed:", error.message);
    }
  } catch (e) {
    // Defense-in-depth: any unexpected error must not propagate to the
    // public verify caller. The verification result is the source of truth.
    console.error("[verify] logVerificationAttempt unexpected error:", e);
  }
}
