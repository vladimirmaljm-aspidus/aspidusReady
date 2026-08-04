import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// DELETE /api/erp/bank-accounts/[id] — Delete bank account (requires admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (erp.delete)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "erp.delete"); if (_d) return _d; } /* requirePermission wired */


  const { id } = await params;
  try {
    // Tenant Ownership check: listErpBankAccounts returns the tenant's bank accounts.
    // (The store currently returns an empty array as ERP is not implemented; this check
    // will become active once ERP is wired up.)
    const all = await auth.store.listErpBankAccounts(auth.tenantId ?? "");
    const existing = all.find((b) => b.id === id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    await auth.store.deleteErpBankAccount(id);
    await audit(auth.store, auth.user, req, "bank_account.delete", "erp_bank_account", id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
