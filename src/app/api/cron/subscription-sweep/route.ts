import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/client";
import { authorizeCron } from "@/lib/api/cron-auth";

export const runtime = "nodejs";

/**
 * Cron endpoint — sweeps subscription state and auto-suspends tenants whose
 * trial or paid subscription window has expired. Idempotent; safe to run
 * every hour.
 *
 * Authentication: caller must supply an `Authorization: Bearer <CRON_TOKEN>`
 * header matching the CRON_TOKEN env var (preferred — F-8 security fix),
 * OR `?token=…` URL query (legacy, kept for backward compatibility), OR a
 * valid super_admin session (for manual runs from the browser).
 */
export async function GET(req: NextRequest) {
  try {
    // Auth: shared cron token (header preferred, URL query legacy) OR a
    // super_admin session cookie (for manual runs from the browser).
    // P1 timing-attack fix (task C-5 Fix 1): token comparison is now
    // constant-time via `crypto.timingSafeEqual` — see `authorizeCron`.
    const unauth = await authorizeCron(req);
    if (unauth) return unauth;

    const sb = getSupabase();
    const nowIso = new Date().toISOString();

    // 1) Trials that have expired → suspend the tenant.
    const { data: expiredTrials } = await sb
      .from("tenants")
      .select("id, name")
      .eq("status", "trial")
      .not("trial_ends_at", "is", null)
      .lt("trial_ends_at", nowIso);

    const trialSuspended = [] as string[];
    for (const t of (expiredTrials as { id: string; name: string }[] | null) || []) {
      await sb.from("tenants").update({ status: "suspended", updated_at: nowIso }).eq("id", t.id);
      trialSuspended.push(t.id);
    }

    // 2) Paid subscriptions whose subscription_end has passed → suspend.
    const { data: expiredPaid } = await sb
      .from("tenants")
      .select("id, name")
      .eq("status", "active")
      .not("subscription_end", "is", null)
      .lt("subscription_end", nowIso);

    const paidSuspended = [] as string[];
    for (const t of (expiredPaid as { id: string; name: string }[] | null) || []) {
      await sb.from("tenants").update({ status: "suspended", updated_at: nowIso }).eq("id", t.id);
      paidSuspended.push(t.id);
    }

    return NextResponse.json({
      ok: true,
      ran_at: nowIso,
      trial_suspended: trialSuspended.length,
      paid_suspended: paidSuspended.length,
      trial_suspended_ids: trialSuspended,
      paid_suspended_ids: paidSuspended,
    });
  } catch (e: any) {
    console.error("[cron/subscription-sweep]", e);
    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 },
    );
  }
}
