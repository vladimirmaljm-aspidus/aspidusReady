import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  setSessionCookie,
  enforceConcurrentSessionLimit,
} from "@/lib/auth/session";
import { lookupIp } from "@/lib/utils/geo-ip";
import { createHash } from "crypto";

export const runtime = "nodejs";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getRequestIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

/**
 * Derive a human-readable device name from a User-Agent string.
 * e.g. "Mozilla/5.0 (Macintosh) ... Chrome/120 ..." -> "Chrome on macOS"
 */
function deriveDeviceName(ua: string | null): string {
  if (!ua) return "Unknown device";
  const lower = ua.toLowerCase();

  let browser = "Browser";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("opr/") || lower.includes("opera")) browser = "Opera";
  else if (lower.includes("chrome/")) browser = "Chrome";
  else if (lower.includes("firefox/")) browser = "Firefox";
  else if (lower.includes("safari/")) browser = "Safari";

  let os = "Unknown OS";
  if (lower.includes("iphone") || lower.includes("ipad")) os = "iOS";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("mac os") || lower.includes("macintosh")) os = "macOS";
  else if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("linux")) os = "Linux";

  return `${browser} on ${os}`;
}

/**
 * Coarse IP bucket — /24 for IPv4 (192.168.1.x -> 192.168.1.0/24),
 * /64 prefix for IPv6 (collapsed to first group). Combined with the
 * user-agent hash so the same browser on the same network is recognized.
 */
function coarseIpBucket(ip: string): string {
  if (!ip) return "0.0.0.0/24";
  if (ip.includes(":")) {
    // IPv6 — use first group as a coarse bucket
    return ip.split(":")[0] + "::/64";
  }
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  return ip + "/32";
}

function deviceFingerprint(ua: string | null, ip: string): string {
  const fp = `${ua || "no-ua"}|${coarseIpBucket(ip)}`;
  return createHash("sha256").update(fp).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Please enter username and password." }, { status: 400 });
    }

    const store = await getStore();
    const user = await store.getUserByUsername(username);

    const ip = getRequestIp(req);
    const userAgent = req.headers.get("user-agent") || null;

    // ── IP → Country resolution ───────────────────────────────────────────
    // Kick off the geo lookup early (runs concurrently with the lookup work
    // below). 5s timeout + null fallback means this can never block a login.
    const geoPromise = lookupIp(ip).catch(() => ({
      country: null as string | null,
      city: null, region: null, latitude: null, longitude: null,
    }));

    // ---- User does not exist OR is inactive ----
    if (!user || !user.active) {
      // The LoginHistoryEntry model has a non-nullable user_id with a FK to User.
      // For non-existent users we cannot persist a row without violating the FK
      // constraint. The audit log below still captures the attempt.
      console.warn(
        `[login] Login attempt for non-existent/inactive user "${username}" from ${ip} — skipping LoginHistoryEntry (FK constraint).`
      );
      await store.appendAudit({
        user_id: null,
        username,
        action: "login.failed",
        entity_type: "auth",
        entity_id: null,
        details: { reason: user ? "User inactive" : "User not found" },
        ip,
        user_agent: userAgent,
      });
      return NextResponse.json(
        { error: "User does not exist or is deactivated." },
        { status: 401 }
      );
    }

    // ── Resolve geo (awaited here — by now the lookup has run in parallel
    //    with the user query above, so this await is usually instant).
    const geo = await geoPromise;
    const country = geo?.country ?? null;

    // ---- Lockout check ----
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      try {
        await store.recordLoginHistory({
          user_id: user.id,
          username: user.username,
          ip,
          user_agent: userAgent,
          country,
          success: false,
          reason: "Account locked",
        });
      } catch (e) {
        console.error("[login] recordLoginHistory (locked) failed:", e);
      }
      await store.appendAudit({
        user_id: user.id,
        username: user.username,
        action: "login.failed",
        entity_type: "auth",
        entity_id: user.id,
        details: { reason: "Account locked" },
        ip,
        user_agent: userAgent,
      });
      return NextResponse.json(
        { error: "Account is temporarily locked. Try again later." },
        { status: 423 }
      );
    }

    // ---- Verify password ----
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      // bump failed attempts (best-effort)
      const next = (user.failed_attempts || 0) + 1;
      const lockUntil = next >= 5 ? new Date(Date.now() + 15 * 60000).toISOString() : null;
      await store.upsertUser({ id: user.id, failed_attempts: next, locked_until: lockUntil });

      try {
        await store.recordLoginHistory({
          user_id: user.id,
          username: user.username,
          ip,
          user_agent: userAgent,
          country,
          success: false,
          reason: "Wrong password",
        });
      } catch (e) {
        console.error("[login] recordLoginHistory (wrong pw) failed:", e);
      }
      await store.appendAudit({
        user_id: user.id,
        username: user.username,
        action: "login.failed",
        entity_type: "auth",
        entity_id: user.id,
        details: { reason: "Wrong password", failed_attempts: next },
        ip,
        user_agent: userAgent,
      });
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    // ---- Tenant status gate ---------------------------------------------
    // Suspended / cancelled tenants must not be able to log in — otherwise a
    // client whose subscription expired could keep working normally. Super
    // admins bypass (they need to be able to unblock the tenant).
    if (user.role !== "super_admin" && user.tenant_id) {
      const tenant = await store.getTenant(user.tenant_id) as any;
      if (tenant?.status === "suspended" || tenant?.status === "cancelled") {
        try {
          await store.recordLoginHistory({
            user_id: user.id,
            username: user.username,
            ip,
            user_agent: userAgent,
            country,
            success: false,
            reason: `Tenant ${tenant.status}`,
          });
        } catch { /* non-critical */ }
        await store.appendAudit({
          user_id: user.id,
          username: user.username,
          action: "login.blocked",
          entity_type: "auth",
          entity_id: user.id,
          details: { reason: `tenant_${tenant.status}` },
          ip,
          user_agent: userAgent,
        });
        return NextResponse.json(
          {
            error: tenant.status === "suspended"
              ? "Your workspace is suspended. Contact the platform administrator to reactivate it."
              : "Your workspace has been cancelled. Contact the platform administrator.",
            subscription_blocked: true,
            tenant_status: tenant.status,
          },
          { status: 402 },
        );
      }
      // Also block on expired subscription / trial (belt + braces on top of the cron sweep).
      const now = new Date();
      const subEnd = tenant?.subscription_end ? new Date(tenant.subscription_end) : null;
      const trialEnd = tenant?.trial_ends_at ? new Date(tenant.trial_ends_at) : null;
      if (subEnd && subEnd < now && tenant.status !== "trial") {
        return NextResponse.json({ error: "Subscription expired. Contact the platform administrator to renew.", subscription_expired: true }, { status: 402 });
      }
      if (String(tenant?.status) === "trial" && trialEnd && trialEnd < now) {
        return NextResponse.json({ error: "Trial period has ended. Upgrade to continue using Aspidus.", subscription_expired: true }, { status: 402 });
      }
    }

    // ---- SUCCESS: reset failed attempts + record login ----
    await store.upsertUser({ id: user.id, failed_attempts: 0, locked_until: null });
    await store.updateUserLastLogin(user.id, ip);

    await store.appendAudit({
      user_id: user.id,
      username: user.username,
      action: "login",
      entity_type: "auth",
      entity_id: user.id,
      details: { method: "password" },
      ip,
      user_agent: userAgent,
    });

    // ---- Security module: write session, login history, known IP, trusted device ----
    // NOTE: sessions/known_ips/trusted_devices all have NOT NULL tenant_id
    // in Postgres, and super_admin users have no tenant. Skip these tables
    // entirely for platform-level accounts — nothing meaningful to write and
    // trying to insert null tenant_id crashes with 23502.
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    if (user.tenant_id) {
      // ── Concurrent session limit (LRU eviction) ───────────────────────
      // Cap each user to MAX_CONCURRENT_SESSIONS active sessions. When the
      // limit is reached, the oldest session is revoked before the new one
      // is created. Defense against stolen-cookie farms and "session
      // sharing" abuse. Implemented centrally in session.ts so the cap is
      // enforced identically across every login surface.
      await enforceConcurrentSessionLimit(user.id, user.tenant_id);

      try {
        await store.createSession({
          user_id: user.id,
          tenant_id: user.tenant_id,
          ip,
          user_agent: userAgent,
          country,
          expires_at: expiresAt,
          current: true,
        } as any);
      } catch (e) {
        console.error("[login] createSession failed:", e);
      }
    }

    try {
      await store.recordLoginHistory({
        user_id: user.id,
        username: user.username,
        ip,
        user_agent: userAgent,
        country,
        success: true,
        reason: null,
      });
    } catch (e) {
      console.error("[login] recordLoginHistory (success) failed:", e);
    }

    if (user.tenant_id) {
      try {
        await store.upsertKnownIp({
          user_id: user.id,
          tenant_id: user.tenant_id,
          ip,
          country,
        } as any);
      } catch (e) {
        console.error("[login] upsertKnownIp failed:", e);
      }

      try {
        await store.upsertTrustedDevice({
          user_id: user.id,
          tenant_id: user.tenant_id,
          device_name: deriveDeviceName(userAgent),
          fingerprint: deviceFingerprint(userAgent, ip),
          ip,
        } as any);
      } catch (e) {
        console.error("[login] upsertTrustedDevice failed:", e);
      }
    }

    const token = await createSession({
      sub: user.id,
      username: user.username,
      role: user.role,
      token_version: user.token_version,
      tenant_id: user.tenant_id,
    });
    await setSessionCookie(token);

    // strip sensitive fields
    const { password_hash, totp_secret, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
