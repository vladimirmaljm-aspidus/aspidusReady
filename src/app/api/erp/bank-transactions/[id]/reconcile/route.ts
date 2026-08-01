import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// POST /api/erp/bank-transactions/[id]/reconcile — Reconcile a bank transaction
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
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
