import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter.
 * In production, use Redis or a proper rate-limiting service.
 * This is a basic defense against brute-force attacks.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  "/api/auth/login": { maxRequests: 10, windowMs: 60_000 },       // 10 per minute
  "/api/portal/login": { maxRequests: 10, windowMs: 60_000 },     // 10 per minute
  "/api/setup": { maxRequests: 3, windowMs: 300_000 },            // 3 per 5 minutes
  "/api/auth/logout": { maxRequests: 20, windowMs: 60_000 },      // 20 per minute
};

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const config = RATE_LIMITS[pathname];

  if (!config) return NextResponse.next();

  const ip = getIp(req);
  const key = getRateLimitKey(pathname, ip);
  const now = Date.now();

  cleanupIfNeeded();

  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return NextResponse.next();
  }

  entry.count++;
  if (entry.count > config.maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/login", "/api/portal/login", "/api/setup", "/api/auth/logout"],
};
