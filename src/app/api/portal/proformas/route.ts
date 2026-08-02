import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

/**
 * GET /api/portal/proformas
 *
 * List proformas for the logged-in portal partner.
 * Supports optional ?status= filter parameter.
 */
export async function GET(req: NextRequest) {
  try {
    const access = await getPortalSessionAccess();
    if (!access) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    if (!access.can_view_invoices) {
      return NextResponse.json({ error: "Not permitted." }, { status: 403 });
    }

    const statusFilter = req.nextUrl.searchParams.get("status") || undefined;

    const store = await getStore();
    const result = await store.listProformas(access.tenant_id, {
      filters: {
        partner_id: access.partner_id,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
    });

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[portal.proformas]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
