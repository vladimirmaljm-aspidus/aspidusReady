import * as Sentry from "@sentry/nextjs";

/**
 * Sentry server-side initialization (F-8 — error monitoring).
 *
 * Activates ONLY when SENTRY_DSN is set in the environment — this lets
 * dev / preview deploys run with Sentry disabled (no DSN) and production
 * turn it on by setting the env var on Render.
 *
 * The server DSN does NOT need the NEXT_PUBLIC_ prefix because it's only
 * read by Node.js (never shipped to the browser). Use the same DSN as the
 * client if you want both server + client events in one project.
 */
const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% of transactions — Render starter tier
    environment: process.env.NODE_ENV || "development",
    enabled: process.env.NODE_ENV === "production",
    // Capture unhandled rejections + uncaught exceptions automatically.
    // Next.js already routes these through its error boundary, but the
    // Sentry server SDK adds them to the global scope so they reach the
    // ingest endpoint even if the route handler doesn't catch them.
  });
}
