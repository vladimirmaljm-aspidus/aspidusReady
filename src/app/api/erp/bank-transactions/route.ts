import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, resolveTenantId, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// GET /api/erp/bank-transactions — List bank transactions (optional bank_account_id filter)
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (erp.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "erp.read"); if (_d) return _d; } /* requirePermission wired */


  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });
  }

  try {
    const url = new URL(req.url);
    const bank_account_id = url.searchParams.get("bank_account_id") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const result = await auth.store.listErpBankTransactions(tenantId, bank_account_id, { search });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/erp/bank-transactions — Create bank transaction (requires admin)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (erp.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "erp.create"); if (_d) return _d; } /* requirePermission wired */


  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const created = await auth.store.upsertErpBankTransaction({ ...body, tenant_id: tenantId });
    await audit(auth.store, auth.user, req, "bank_transaction.create", "erp_bank_transaction", created.id, {
      bank_account_id: created.bank_account_id,
      amount: created.amount,
      transaction_type: created.transaction_type,
    });
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
