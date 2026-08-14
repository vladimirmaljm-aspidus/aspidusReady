import * as Sentry from "@sentry/nextjs";

/**
 * Sentry client-side initialization (F-8 — error monitoring).
 *
 * Activates ONLY when NEXT_PUBLIC_SENTRY_DSN is set in the environment —
 * this lets dev / preview deploys run with Sentry disabled (no DSN) and
 * production turn it on by setting the env var on Render.
 *
 * Why NEXT_PUBLIC_: Next.js only exposes env vars prefixed with NEXT_PUBLIC_
 * to the browser bundle. The DSN is public (it's an ingest URL, not a
 * secret) so this is safe.
 */
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% of transactions — Render starter tier
    environment: process.env.NODE_ENV || "development",
    // Don't send errors in dev — they're noisy and usually local-only.
    // Devs can opt in by setting NEXT_PUBLIC_SENTRY_DSN locally.
    enabled: process.env.NODE_ENV === "production",
    // Ignore common browser noise that Sentry reports by default.
    ignoreErrors: [
      "ResizeObserver loop completed with undelivered notifications",
      "Network request failed",
      "Failed to fetch",
      "Load failed",
      "cancelled",
    ],
  });
}
