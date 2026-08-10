import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

/**
 * Cron endpoint — sweeps subscription state and auto-suspends tenants whose
 * trial or paid subscription window has expired. Idempotent; safe to run
 * every hour.
 *
 * Authentication: caller must supply `?token=…` matching CRON_TOKEN env var,
 * OR a valid super_admin session (for manual runs from the browser).
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const expected = process.env.CRON_TOKEN;

    // Auth: either the shared cron token or a super_admin session cookie
    let authorised = !!expected && token === expected;
    if (!authorised) {
      const { requireSuperAdmin } = await import("@/lib/api/helpers");
      const sa = await requireSuperAdmin();
      if (sa instanceof NextResponse) return sa;
      authorised = true;
    }
    if (!authorised) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

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
