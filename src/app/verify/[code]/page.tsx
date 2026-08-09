import { getStore } from "@/lib/data/store";
import type { DocumentVerification } from "@/lib/supabase/types";
import { VerifyClient } from "@/components/verify/verify-client";
import "../verify.css";

export const dynamic = "force-dynamic";

/**
 * Public QR verification page.
 *
 * Server-rendered lookup of the document verification by code — the
 * resulting `DocumentVerification` (or null) is handed to the client
 * component which:
 *   1. Requests precise GPS via `navigator.geolocation.getCurrentPosition`
 *      (same as the portal — see src/lib/portal/use-geolocation.ts).
 *   2. Shows a "Requesting location…" spinner while waiting.
 *   3. POSTs the captured coords (or nulls on GPS failure) to
 *      `/api/verify/[code]` so the audit trail records precise lat/lng
 *      instead of IP-based city-level geo only.
 *   4. Renders the verification result.
 *
 * Logging moved out of the page (was `store.logVerification`) into the
 * POST handler — keeps the page purely presentational and lets the API
 * capture GPS + IP + UA + device in a single coherent row.
 */
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  let v: DocumentVerification | null = null;

  try {
    const store = await getStore();
    v = await store.getDocumentVerificationByCode(code);
  } catch (err) {
    // Non-fatal — the client component renders the "invalid code" state
    // when v is null, so even a store failure still serves a useful page.
    console.warn("[VerifyPage] Error during verification lookup:", err);
  }

  return <VerifyClient verification={v} code={code} />;
}
