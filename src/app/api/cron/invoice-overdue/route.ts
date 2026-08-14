import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

/**
 * Cron endpoint — daily sweep that marks invoices as overdue when their
 * due_date has passed. Idempotent; safe to run daily.
 *
 * Authentication: caller must supply an `Authorization: Bearer <CRON_TOKEN>`
 * header matching the CRON_TOKEN env var (preferred — F-8 security fix),
 * OR `?token=…` URL query (legacy, kept for backward compatibility), OR a
 * valid super_admin session (for manual runs from the browser).
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const expected = process.env.CRON_TOKEN;

    // Auth: shared cron token (header preferred, URL query legacy) OR a
    // super_admin session cookie (for manual runs from the browser).
    const authHeader = req.headers.get("authorization") || "";
    const headerToken = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;
    const queryToken = url.searchParams.get("token");
    const presentedToken = headerToken || queryToken;

    let authorised = !!expected && !!presentedToken && presentedToken === expected;
    if (!authorised) {
      const { requireSuperAdmin } = await import("@/lib/api/helpers");
      const sa = await requireSuperAdmin(req);
      if (sa instanceof NextResponse) return sa;
      authorised = true;
    }
    if (!authorised) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    const sb = getSupabase();
    const today = new Date().toISOString().split("T")[0];
    // Mark sent/viewed invoices as overdue when due_date < today.
    const { data, error } = await sb
      .from("invoices")
      .update({ status: "overdue" })
      .in("status", ["sent", "viewed"])
      .lt("due_date", today)
      .select("id, number, partner_id, tenant_id");
    if (error) throw error;
    const updated = (data as Array<{ id: string; number: string; partner_id: string | null; tenant_id: string }>) || [];
    // Fire notifications for each overdue invoice. Errors here are non-fatal
    // — the status update is the source of truth.
    const store = await getStore();
    void store; // kept for parity with other crons / future per-tenant logic
    for (const inv of updated) {
      try {
        const { notify } = await import("@/lib/notif/helper");
        await notify({
          tenantId: inv.tenant_id,
          userId: null,
          type: "invoice_overdue",
          title: `Invoice ${inv.number} is overdue`,
          message: `Invoice ${inv.number} has passed its due date.`,
          entityType: "invoice",
          entityId: inv.id,
        });
      } catch {
        /* non-fatal */
      }
    }
    return NextResponse.json({ ok: true, updated: updated.length });
  } catch (e: any) {
    console.error("[cron/invoice-overdue]", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
