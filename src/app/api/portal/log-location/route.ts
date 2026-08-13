import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { getTierMeta } from "@/lib/portal/tiers";

export const runtime = "nodejs";

/**
 * POST /api/portal/log-location
 *
 * Called by the portal client right after a successful login (and periodically
 * afterwards) to record the client's geolocation. Required for all non-PREMIUM
 * tiers — the portal shell refuses to render content until the location has
 * been shared.
 *
 * Body: { latitude, longitude, accuracy?, source? }
 *
 * The IP is read from request headers so we always have at least one
 * geolocation signal even if the browser denies navigator.geolocation.
 */
export async function POST(req: NextRequest) {
  const access = await getPortalSessionAccess();
  if (!access) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const tier = getTierMeta(access.tier);

  let body: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    source?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = req.headers.get("user-agent") || null;

  const store = await getStore();
  try {
    // Resolve the effective source BEFORE writing the audit row, so we can
    // both record it in the audit details AND use it to decide whether to
    // bump gps_verified_at. "browser" = the navigator.geolocation API gave
    // us a real fix (precise GPS); "ip" = we only have a coarse IP-derived
    // location as a fallback when the browser denied or didn't prompt.
    const effectiveSource =
      body.source || (typeof body.latitude === "number" && typeof body.longitude === "number" ? "browser" : "ip");

    // Append to the audit log with a structured details blob so admins can
    // review the full location history of any portal client.
    await store.appendAudit({
      tenant_id: access.tenant_id,
      user_id: null,
      username: `portal:${access.portal_email || access.id}`,
      action: "portal.location",
      entity_type: "portal_access",
      entity_id: access.id,
      details: {
        latitude: typeof body.latitude === "number" ? body.latitude : null,
        longitude: typeof body.longitude === "number" ? body.longitude : null,
        accuracy: typeof body.accuracy === "number" ? body.accuracy : null,
        source: effectiveSource,
        ip,
        user_agent: userAgent,
        tier: access.tier,
        required: tier.requiresLocation,
      },
      ip,
      user_agent: userAgent,
    });

    // Only precise GPS ("browser") counts as a real location verification.
    // IP-derived location is too coarse (city/region level) to satisfy the
    // requireGpsVerified() gate on portal data endpoints. Bumping
    // gps_verified_at here is what unlocks /api/portal/{offers,invoices,
    // proformas,documents,catalog} for non-premium, non-exempt clients.
    //
    // Wrapped in its own try/catch and best-effort: the audit row above is
    // the source of truth for the full location history; the gps_verified_at
    // column is just a denormalised "latest browser GPS" marker used by the
    // server-side gate. A DB error here (e.g. migration 015 not yet applied)
    // must NOT fail the whole request — the client already has its location
    // captured in the audit log and the gate will keep returning 403 until
    // the migration is applied, which is the intended fail-closed behaviour.
    if (effectiveSource === "browser") {
      try {
        await store.upsertPortalAccess({
          id: access.id,
          gps_verified_at: new Date().toISOString(),
        });
      } catch (gpsErr) {
        console.warn("[portal.log-location] failed to set gps_verified_at:", gpsErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[portal.log-location]", e);
    return NextResponse.json({ error: "Failed to log location." }, { status: 500 });
  }
}
