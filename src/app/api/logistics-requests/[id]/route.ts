import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { getSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

/**
 * GET    /api/logistics/[id]  → single request
 * PATCH  /api/logistics/[id]  → admin updates status / quote / notes
 * DELETE /api/logistics/[id]  → admin removes (only if cancelled)
 */

async function loadOwned(id: string, auth: any) {
  const sb = getSupabase();
  const { data } = await sb.from("logistics_requests").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  if (!auth.isSuperAdmin && data.tenant_id !== auth.tenantId) return null;
  return data;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "logistics.read"); if (_d) return _d; }

  const { id } = await params;
  const row = await loadOwned(id, auth);
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "logistics.update"); if (_d) return _d; }

  const { id } = await params;
  const row = await loadOwned(id, auth);
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = await req.json();
  const allow = [
    "status", "quoted_price", "quoted_currency", "quoted_transit_days",
    "quoted_notes", "linked_offer_id", "admin_notes",
    "target_pickup_date", "target_delivery_date",
  ];
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of allow) if (body[k] !== undefined) patch[k] = body[k];

  const sb = getSupabase();
  const { data, error } = await sb.from("logistics_requests").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await audit(auth.store, auth.user, req, "logistics.update", "logistics_request", id, { fields: Object.keys(patch) });

  // Notify the client if the quote just became available or status meaningfully changed
  const becameQuoted = row.status !== "quoted" && data.status === "quoted";
  const statusChanged = row.status !== data.status;

  // Timeline event for any status change or quote assignment
  try {
    const { logLogisticsEvent } = await import("@/lib/logistics/events");
    if (statusChanged) {
      await logLogisticsEvent({
        tenant_id: data.tenant_id,
        logistics_request_id: id,
        event_type: becameQuoted ? "quoted" : (data.status as any),
        from_status: row.status,
        to_status: data.status,
        actor_id: auth.user.id,
        actor_role: "admin",
        message: becameQuoted && data.quoted_price != null
          ? `Quoted ${data.quoted_currency || ""} ${data.quoted_price} · ${data.quoted_transit_days || "?"} days`
          : `Status changed to ${data.status}`,
        metadata: becameQuoted ? { price: data.quoted_price, currency: data.quoted_currency, transit_days: data.quoted_transit_days } : {},
      });
    } else if (patch.quoted_notes || patch.admin_notes) {
      await logLogisticsEvent({
        tenant_id: data.tenant_id,
        logistics_request_id: id,
        event_type: "note",
        actor_id: auth.user.id,
        actor_role: "admin",
        message: (patch.quoted_notes as string) || (patch.admin_notes as string) || null,
      });
    }
  } catch { /* non-critical */ }
  if (becameQuoted || statusChanged) {
    try {
      const { getStore } = await import("@/lib/data/store");
      const store = await getStore();
      const partner = await store.getPartner(data.partner_id);
      await store.createNotification({
        tenant_id: data.tenant_id,
        user_id: null,
        partner_id: data.partner_id,
        type: (becameQuoted ? "logistics_quoted" : "logistics_status") as any,
        title: becameQuoted
          ? `Freight quote available for ${data.number}`
          : `Freight request ${data.number} · ${data.status}`,
        message: becameQuoted && data.quoted_price != null
          ? `${data.quoted_currency || ""} ${data.quoted_price} · ${data.quoted_transit_days || "?"} days`
          : `Status updated to ${data.status}`,
        entity_type: "logistics_request",
        entity_id: id,
        action_url: `/portal/logistics`,
        action_label: "Open request",
      } as any);
    } catch (e) { console.warn("[logistics.PATCH notify]", e); }
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "logistics.delete"); if (_d) return _d; }

  const { id } = await params;
  const row = await loadOwned(id, auth);
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const sb = getSupabase();
  await sb.from("logistics_requests").delete().eq("id", id);
  await audit(auth.store, auth.user, req, "logistics.delete", "logistics_request", id, { number: row.number });
  return NextResponse.json({ ok: true });
}
