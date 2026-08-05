import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, audit } from "@/lib/api/helpers";
import { getSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

/**
 * Super-admin approves or rejects a plan-upgrade request.
 * On approve the tenant's plan is switched and a fresh subscription window
 * is stamped (12 months from now by default; caller can override).
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json();
  const decision = body.decision as "approve" | "reject";
  if (decision !== "approve" && decision !== "reject") {
    return NextResponse.json({ error: "decision must be 'approve' or 'reject'." }, { status: 400 });
  }

  const sb = getSupabase();
  const { data: current } = await sb.from("plan_upgrade_requests").select("*").eq("id", id).maybeSingle();
  if (!current) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if ((current as any).status !== "pending") {
    return NextResponse.json({ error: `Request already ${(current as any).status}.` }, { status: 409 });
  }

  const nowIso = new Date().toISOString();
  const { data: updated, error } = await sb.from("plan_upgrade_requests").update({
    status: decision === "approve" ? "approved" : "rejected",
    reviewed_by: auth.user.id,
    reviewed_at: nowIso,
    admin_note: body.admin_note || null,
    updated_at: nowIso,
  }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (decision === "approve") {
    const months = Number(body.months || 12);
    const end = new Date();
    end.setMonth(end.getMonth() + months);
    await sb.from("tenants").update({
      plan: (current as any).requested_plan,
      status: "active",
      subscription_start: nowIso,
      subscription_end: end.toISOString(),
      trial_ends_at: null,
      updated_at: nowIso,
    }).eq("id", (current as any).tenant_id);
  }

  await audit(auth.store, auth.user, req, `plan.${decision}`, "plan_upgrade_request", id, {
    tenant_id: (current as any).tenant_id,
    requested_plan: (current as any).requested_plan,
  });
  return NextResponse.json(updated);
}
