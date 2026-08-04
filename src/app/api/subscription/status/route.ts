import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (auth.isSuperAdmin && !auth.tenantId) {
      return NextResponse.json({
        subscription: {
          plan: "platform",
          status: "active",
          is_trial: false,
          is_expired: false,
          days_remaining: null,
          warning_level: "none",
          billing_cycle: "platform",
        },
      });
    }

    const tenantId = resolveTenantId(auth, req);
    if (!tenantId) return NextResponse.json({ subscription: null });

    const tenant = await auth.store.getTenant(tenantId) as any;
    if (!tenant) return NextResponse.json({ subscription: null });

    const now = new Date();
    const trialEnd = tenant.trial_ends_at ? new Date(tenant.trial_ends_at) : null;
    const subEnd = tenant.subscription_end ? new Date(tenant.subscription_end) : null;
    const daysRemaining = subEnd ? Math.ceil((subEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : null;
    const trialDaysRemaining = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : null;
    const isExpired = subEnd ? subEnd < now : false;
    const isTrialExpired = trialEnd ? trialEnd < now : false;
    const isTrial = tenant.status === "trial" || (trialEnd !== null && trialEnd > now);

    let warningLevel = "none";
    if (isExpired || isTrialExpired) warningLevel = "expired";
    else if (isTrial && trialDaysRemaining !== null && trialDaysRemaining <= 3) warningLevel = "critical";
    else if (isTrial && trialDaysRemaining !== null && trialDaysRemaining <= 7) warningLevel = "warning";
    else if (!isTrial && daysRemaining !== null && daysRemaining <= 7) warningLevel = "warning";

    return NextResponse.json({
      subscription: {
        plan: tenant.plan, status: tenant.status, is_trial: isTrial,
        is_expired: isExpired, is_trial_expired: isTrialExpired,
        days_remaining: daysRemaining, trial_days_remaining: trialDaysRemaining,
        subscription_end: tenant.subscription_end || null,
        trial_ends_at: tenant.trial_ends_at || null,
        warning_level: warningLevel, billing_cycle: tenant.billing_cycle || "monthly",
        max_users: tenant.max_users || 5,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
