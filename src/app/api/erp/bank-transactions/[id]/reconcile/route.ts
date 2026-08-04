import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// POST /api/erp/bank-transactions/[id]/reconcile — Reconcile a bank transaction
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (erp.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "erp.create"); if (_d) return _d; } /* requirePermission wired */


  const { id } = await params;
  try {
    // Tenant Ownership check
    const all = await auth.store.listErpBankTransactions(auth.tenantId ?? "", undefined, { limit: 100000 });
    const existing = all.items.find((t) => t.id === id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const body = await req.json();
    if (!body.journal_entry_id) {
      return NextResponse.json({ error: "journal_entry_id is required." }, { status: 400 });
    }

    const reconciled = await auth.store.reconcileBankTransaction(id, body.journal_entry_id);
    await audit(auth.store, auth.user, req, "bank_transaction.reconcile", "erp_bank_transaction", id, {
      journal_entry_id: body.journal_entry_id,
    });
    return NextResponse.json(reconciled);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
