import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { retryFailedDeliveries } from "@/lib/webhooks/deliver";
import { authorizeCron } from "@/lib/api/cron-auth";

export const runtime = "nodejs";

/**
 * Cron endpoint — retries failed webhook deliveries.
 *
 * Called every 5 minutes by pg_cron via `net.http_get`:
 *   SELECT net.http_get(
 *     url := 'https://aspidus.onrender.com/api/cron/webhook-retry',
 *     headers := jsonb_build_object(
 *       'Authorization',
 *       'Bearer ' || current_setting('app.cron_token', true)
 *     )
 *   );
 *
 * Auth: caller must supply an `Authorization: Bearer <CRON_TOKEN>` header
 * matching the CRON_TOKEN env var (preferred — keeps the token out of URL
 * query strings / logs), OR `?token=…` URL query (legacy, kept for
 * backward compatibility), OR a valid super_admin session cookie
 * (for manual runs from the browser).
 *
 * Idempotent: re-reads the failed deliveries list each run. If a delivery
 * was already retried by a previous run, the `next_attempt_at` gate
 * (set by the previous retry) prevents it from being retried prematurely.
 *
 * Per-delivery cap: MAX_WEBHOOK_ATTEMPTS=5. After the 5th failed attempt,
 * the delivery stays in status='failed' with next_attempt_at=NULL and is
 * no longer picked up by this cron.
 */
export async function GET(req: NextRequest) {
  try {
    // Auth: shared cron token (header preferred, URL query legacy) OR a
    // super_admin session cookie (for manual runs from the browser).
    // P1 timing-attack fix (task C-5 Fix 1): token comparison is now
    // constant-time via `crypto.timingSafeEqual` — see `authorizeCron`.
    const unauth = await authorizeCron(req);
    if (unauth) return unauth;

    const store = await getStore();
    const result = await retryFailedDeliveries(store, 50);

    // Log a summary line so cron.job_run_details carries something useful
    // for ops triage (vs. just "200 OK").
    console.info(
      `[cron/webhook-retry] retried=${result.retried} delivered=${result.delivered} ` +
      `stillFailing=${result.stillFailing} skipped=${result.skipped}`,
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("[cron/webhook-retry]", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
