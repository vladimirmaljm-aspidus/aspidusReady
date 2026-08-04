import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// GET /api/erp/journal-entries — List journal entries
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
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const date_from = url.searchParams.get("date_from") || undefined;
    const date_to = url.searchParams.get("date_to") || undefined;
    const reference_type = url.searchParams.get("reference_type") || undefined;

    const result = await auth.store.listErpJournalEntries(tenantId, {
      search,
      filters: { status, date_from, date_to, reference_type },
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/erp/journal-entries — Create journal entry (with lines array)
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });
  }

  try {
    const body = await req.json();

    // Validate lines exist
    if (!body.lines || !Array.isArray(body.lines) || body.lines.length === 0) {
      return NextResponse.json({ error: "Journal entry must have at least one line." }, { status: 400 });
    }

    // Validate debit/credit balance
    const totalDebit = body.lines.reduce((sum: number, l: any) => sum + (l.debit || 0), 0);
    const totalCredit = body.lines.reduce((sum: number, l: any) => sum + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ error: "Journal entry must be balanced (debits must equal credits)." }, { status: 400 });
    }

    const created = await auth.store.upsertErpJournalEntry({
      ...body,
      tenant_id: tenantId,
      created_by: auth.user.id,
      debit_total: totalDebit,
      credit_total: totalCredit,
    });
    await audit(auth.store, auth.user, req, "journal_entry.create", "erp_journal_entry", created.id, {
      entry_number: created.entry_number,
      debit_total: totalDebit,
      credit_total: totalCredit,
    });
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
