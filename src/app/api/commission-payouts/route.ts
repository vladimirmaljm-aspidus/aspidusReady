import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// GET /api/commission-payouts?tenant_id=xxx
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    // Permission gate (commissions.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "commissions.read"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_finance", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

    const tenantId = resolveTenantId(auth, req);
    if (!tenantId) return NextResponse.json({ items: [], total: 0 });

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
    const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;

    const result = await auth.store.listCommissionPayouts(tenantId, { search, limit, offset });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/commission-payouts
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
  // Permission gate (commissions.payout)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "commissions.payout"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_finance", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

    const tenantId = resolveTenantId(auth, req);
    if (!tenantId) return NextResponse.json({ error: "Tenant ID is required." }, { status: 400 });

    const body = await req.json();
    body.tenant_id = tenantId;
    body.created_by = auth.user.id;

    // Validate commission ownership BEFORE creating the payout row (prevent TOCTOU)
    if (body.commission_ids && body.status === "completed") {
      for (const commissionId of body.commission_ids) {
        const commission = await auth.store.getDealCommission(commissionId);
        if (!commission) {
          return NextResponse.json({ error: `Commission ${commissionId} not found.` }, { status: 404 });
        }
        if (!auth.isSuperAdmin && commission.tenant_id !== auth.tenantId) {
          return NextResponse.json({ error: "Commission does not belong to tenant." }, { status: 403 });
        }
      }
    }

    const created = await auth.store.upsertCommissionPayout(body);
    await audit(auth.store, auth.user, req, "commission_payout.create", "commission_payout", created.id, { agent_id: created.agent_id, total_amount: created.total_amount });

    if (created.commission_ids && created.status === "completed") {
      for (const commissionId of created.commission_ids) {
        await auth.store.markDealCommissionPaid(commissionId, created.payment_reference || undefined);
      }
    }

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
