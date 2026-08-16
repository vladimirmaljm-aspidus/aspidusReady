import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit, sanitizeError } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(_req);
    if (auth instanceof NextResponse) return auth;
    // Permission gate (partners.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "partners.read"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    const partner = await auth.store.getPartner(id);
    if (!partner) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && partner.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    // CRITICAL FIX (audit D-5 / F-9-1): strip portal_token from the API
    // response. The list route already strips it, but this [id] route was
    // returning the full row including the secret. `portal_token` is a
    // legacy 32+ char secret stored on the partner row — leaking it to any
    // partner:read principal (including API keys) is a credential exposure.
    const { portal_token: _omit, ...safePartner } = partner as any;
    return NextResponse.json(safePartner);
  } catch (error: any) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
  // Permission gate (partners.update)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "partners.update"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    // Tenant ownership check: fetch existing first
    const existing = await auth.store.getPartner(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const body = await req.json();
    // Preserve the entity's tenant_id — regular users cannot move it to another tenant
    const updated = await auth.store.upsertPartner({ ...body, id, tenant_id: existing.tenant_id });
    await audit(auth.store, auth.user, req, "partner.update", "partner", id, { name: updated.name });
    // Strip portal_token from response (parity with GET / list — audit D-5 / F-9-1).
    const { portal_token: _omit, ...safeUpdated } = updated as any;
    return NextResponse.json(safeUpdated);
  } catch (error: any) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
  // Permission gate (partners.delete)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "partners.delete"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    const existing = await auth.store.getPartner(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    // Dependency check (H-5) — refuse delete if dependent records exist
    // (offers / invoices / proformas / KYC / portal access / trade
    // calculations). Caller can pass ?force=1 to override (will leave
    // orphans — admin recovery only).
    const sb = (auth.store as any).sb();
    const [offers, invoices, proformas, kyc, portal, tradeCalcs, demands, deals, sharedDocs, portalRfqs] = await Promise.all([
      sb.from("offers").select("id", { count: "exact", head: true }).eq("partner_id", id),
      sb.from("invoices").select("id", { count: "exact", head: true }).eq("partner_id", id),
      sb.from("proformas").select("id", { count: "exact", head: true }).eq("partner_id", id),
      sb.from("kyc_submissions").select("id", { count: "exact", head: true }).eq("partner_id", id),
      sb.from("portal_access").select("id", { count: "exact", head: true }).eq("partner_id", id),
      sb.from("trade_calculations").select("id", { count: "exact", head: true }).eq("buyer_id", id),
      // FIX-P1: extend dependency check (PT-1) — demands, deals, shared_documents,
      // portal_rfqs all reference the partner.
      sb.from("demands").select("id", { count: "exact", head: true }).eq("partner_id", id),
      sb.from("deals").select("id", { count: "exact", head: true }).eq("partner_id", id),
      sb.from("shared_documents").select("id", { count: "exact", head: true }).eq("partner_id", id),
      sb.from("portal_rfqs").select("id", { count: "exact", head: true }).eq("partner_id", id),
    ]);
    const depCount =
      (offers.count || 0) +
      (invoices.count || 0) +
      (proformas.count || 0) +
      (kyc.count || 0) +
      (portal.count || 0) +
      (tradeCalcs.count || 0) +
      (demands.count || 0) +
      (deals.count || 0) +
      (sharedDocs.count || 0) +
      (portalRfqs.count || 0);
    const force = req.nextUrl.searchParams.get("force") === "1";
    if (depCount > 0 && !force) {
      return NextResponse.json({
        error: `Cannot delete partner — ${depCount} dependent record(s) exist.`,
        dependencies: {
          offers: offers.count,
          invoices: invoices.count,
          proformas: proformas.count,
          kyc: kyc.count,
          portal: portal.count,
          trade_calcs: tradeCalcs.count,
          demands: demands.count,
          deals: deals.count,
          shared_documents: sharedDocs.count,
          portal_rfqs: portalRfqs.count,
        },
        hint: "Pass ?force=1 to delete anyway (will leave orphans).",
      }, { status: 409 });
    }

    await auth.store.deletePartner(id);
    await audit(auth.store, auth.user, req, "partner.delete", "partner", id, {
      forced: force,
      dependencies_ignored: force ? depCount : 0,
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 });
  }
}
