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
    const _d = requirePermission(auth, "documents.read"); if (_d) return _d; }

  const { id } = await params;
  const row = await loadOwned(id, auth);
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "documents.update"); if (_d) return _d; }

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
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "documents.delete"); if (_d) return _d; }

  const { id } = await params;
  const row = await loadOwned(id, auth);
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const sb = getSupabase();
  await sb.from("logistics_requests").delete().eq("id", id);
  await audit(auth.store, auth.user, req, "logistics.delete", "logistics_request", id, { number: row.number });
  return NextResponse.json({ ok: true });
}
