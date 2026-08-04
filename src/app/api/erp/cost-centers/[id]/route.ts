import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// DELETE /api/erp/cost-centers/[id] — Delete cost center (requires admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (erp.delete)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "erp.delete"); if (_d) return _d; } /* requirePermission wired */


  const { id } = await params;
  try {
    // Tenant Ownership check
    const all = await auth.store.listErpCostCenters(auth.tenantId ?? "", { limit: 100000 });
    const existing = all.items.find((c) => c.id === id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    await auth.store.deleteErpCostCenter(id);
    await audit(auth.store, auth.user, req, "cost_center.delete", "erp_cost_center", id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
