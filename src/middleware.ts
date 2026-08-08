import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter.
 *
 * Two tiers:
 *   1. Per-route limits — strict caps on sensitive endpoints (login,
 *      uploads, RFQs, password reset, code verification, …).
 *   2. Global limit — a generous ceiling on ALL /api/* routes per IP to
 *      blunt generic API abuse (scraping,枚举, fuzzing) on endpoints that
 *      don't have a specific cap.
 *
 * In production, use Redis or a proper rate-limiting service. The in-memory
 * Map here is per-instance (resets on cold start and is not shared across
 * horizontal replicas) but is sufficient as a defense-in-depth layer.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Per-route limits. Keys are path *prefixes* — a request matches the longest
 * matching prefix, so `/api/products/abc` falls under `/api/products`.
 */
const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  // ── auth flows (pre-existing) ────────────────────────────────────────────
  "/api/auth/login": { maxRequests: 10, windowMs: 60_000 },            // 10/min
  "/api/portal/login": { maxRequests: 10, windowMs: 60_000 },         // 10/min
  "/api/setup": { maxRequests: 3, windowMs: 300_000 },               // 3/5min
  "/api/auth/logout": { maxRequests: 20, windowMs: 60_000 },          // 20/min

  // ── upload / KYC (slow, expensive, file-system side effects) ────────────
  "/api/portal/upload": { maxRequests: 10, windowMs: 60_000 },         // 10/min
  "/api/portal/kyc/document": { maxRequests: 10, windowMs: 60_000 },  // 10/min

  // ── read-heavy list endpoints (search / API access) ─────────────────────
  "/api/products": { maxRequests: 30, windowMs: 60_000 },             // 30/min
  "/api/offers": { maxRequests: 30, windowMs: 60_000 },               // 30/min
  "/api/invoices": { maxRequests: 30, windowMs: 60_000 },             // 30/min
  "/api/partners": { maxRequests: 30, windowMs: 60_000 },             // 30/min

  // ── portal write actions (prevent spam / abuse) ─────────────────────────
  "/api/portal/rfqs": { maxRequests: 5, windowMs: 60_000 },           // 5/min (RFQ spam)
  "/api/portal/messages": { maxRequests: 20, windowMs: 60_000 },      // 20/min

  // ── account recovery / verification ─────────────────────────────────────
  "/api/auth/forgot-password": { maxRequests: 3, windowMs: 60_000 },  // 3/min (email flood)
  "/api/portal/forgot-password": { maxRequests: 3, windowMs: 60_000 },// 3/min (portal email flood)
  "/api/verify": { maxRequests: 10, windowMs: 60_000 },               // 10/min (code brute-force)
};

/**
 * Global ceiling — applied to every /api/* request that doesn't match a
 * specific cap above. Generous enough (100/min) that normal UI workflows
 * never hit it, but tight enough to stop a script scanning endpoints.
 */
const GLOBAL_LIMIT = { maxRequests: 100, windowMs: 60_000 };

function getRateLimitKey(path: string, ip: string): string {
  return `${path}:${ip}`;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Clean up expired entries every 5 minutes
let lastCleanup = Date.now();
function cleanupIfNeeded() {
  const now = Date.now();
  if (now - lastCleanup > 5 * 60_000) {
    for (const [key, val] of rateLimitMap) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
    lastCleanup = now;
  }
}

/**
 * Find the most specific rate-limit config for a path. Returns the matching
 * prefix key + config, or null if no specific rule applies.
 *
 * Matches longest-prefix-first so `/api/products/export` is governed by
 * `/api/products` (not, say, `/api`).
 */
function findRouteConfig(pathname: string): { key: string; config: { maxRequests: number; windowMs: number } } | null {
  // Exact match wins outright.
  if (RATE_LIMITS[pathname]) {
    return { key: pathname, config: RATE_LIMITS[pathname] };
  }
  // Otherwise longest-prefix match.
  let bestKey: string | null = null;
  for (const prefix of Object.keys(RATE_LIMITS)) {
    if (pathname.startsWith(prefix + "/")) {
      if (!bestKey || prefix.length > bestKey.length) {
        bestKey = prefix;
      }
    }
  }
  if (bestKey) return { key: bestKey, config: RATE_LIMITS[bestKey] };
  return null;
}

function tooManyRequests(resetAt: number): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIp(req);
  const now = Date.now();

  cleanupIfNeeded();

  // ── 1. Specific route limit ─────────────────────────────────────────────
  const route = findRouteConfig(pathname);
  if (route) {
    const key = getRateLimitKey(route.key, ip);
    const entry = rateLimitMap.get(key);
    if (!entry || entry.resetAt < now) {
      rateLimitMap.set(key, { count: 1, resetAt: now + route.config.windowMs });
      return NextResponse.next();
    }
    entry.count++;
    if (entry.count > route.config.maxRequests) {
      return tooManyRequests(entry.resetAt);
    }
    return NextResponse.next();
  }

  // ── 2. Global API ceiling (any other /api/* route) ──────────────────────
  // Applies to every /api/* request that didn't match a specific rule above.
  // Belt-and-braces against generic endpoint scraping / enumeration.
  const globalKey = `global:${ip}`;
  const globalEntry = rateLimitMap.get(globalKey);
  if (!globalEntry || globalEntry.resetAt < now) {
    rateLimitMap.set(globalKey, { count: 1, resetAt: now + GLOBAL_LIMIT.windowMs });
    return NextResponse.next();
  }
  globalEntry.count++;
  if (globalEntry.count > GLOBAL_LIMIT.maxRequests) {
    return tooManyRequests(globalEntry.resetAt);
  }

  return NextResponse.next();
}

// Run on every /api/* request. Specific routes get their own cap; everything
// else falls through to the global 100/min ceiling. Non-API routes (pages,
// static assets) bypass the middleware entirely.
export const config = {
  matcher: ["/api/:path*"],
};
