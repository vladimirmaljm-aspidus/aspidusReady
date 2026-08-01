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
        source: body.source || (body.latitude != null ? "browser" : "ip"),
        ip,
        user_agent: userAgent,
        tier: access.tier,
        required: tier.requiresLocation,
      },
      ip,
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[portal.log-location]", e);
    return NextResponse.json({ error: "Failed to log location." }, { status: 500 });
  }
}
