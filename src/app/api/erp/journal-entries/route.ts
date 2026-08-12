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
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_finance", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */


  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ items: [], total: 0 });

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
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  // Permission gate (erp.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "erp.create"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_finance)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_finance", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */


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

    // P2-12: Validate each line's debit/credit BEFORE the balance check.
    // `reduce` propagates NaN (NaN + x = NaN, Math.abs(NaN - NaN) > 0.01 === false),
    // so a single malformed line would silently bypass the balance gate. Negative
    // amounts are nonsensical in accounting and must also be rejected up-front.
    // We normalize the values so downstream code sees clean finite numbers.
    for (const l of body.lines) {
      const d = Number(l.debit) || 0;
      const c = Number(l.credit) || 0;
      if (!Number.isFinite(d) || d < 0) {
        return NextResponse.json({ error: "Invalid debit amount." }, { status: 400 });
      }
      if (!Number.isFinite(c) || c < 0) {
        return NextResponse.json({ error: "Invalid credit amount." }, { status: 400 });
      }
      // Normalize to clean numbers
      l.debit = d;
      l.credit = c;
    }

    // Validate debit/credit balance
    const totalDebit = body.lines.reduce((sum: number, l: any) => sum + (l.debit || 0), 0);
    const totalCredit = body.lines.reduce((sum: number, l: any) => sum + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ error: "Journal entry must be balanced (debits must equal credits)." }, { status: 400 });
    }

    // Fix 11 (Re-Audit-2 P0/journal): validate that every `account_id` on the
    // lines actually exists in `erp_accounts` for this tenant BEFORE inserting
    // the journal entry. A non-existent FK would otherwise trigger a 500 mid-
    // insert (after we've already validated + started persisting the header)
    // and produce an opaque error message. We resolve the set of unique
    // account_ids, fetch them in a single query, and 400 with the offending id
    // if any are missing.
    const accountIds = Array.from(
      new Set(
        body.lines
          .map((l: any) => l.account_id)
          .filter((id: any) => typeof id === "string" && id.length > 0),
      ),
    ) as string[];
    if (accountIds.length > 0) {
      const { getSupabase } = await import("@/lib/supabase/client");
      const sb = getSupabase();
      const { data: validAccounts, error: accErr } = await sb
        .from("erp_accounts")
        .select("id")
        .eq("tenant_id", tenantId)
        .in("id", accountIds);
      if (accErr) {
        return NextResponse.json(
          { error: `Failed to validate account_ids: ${accErr.message}` },
          { status: 500 },
        );
      }
      const validSet = new Set((validAccounts || []).map((a: any) => a.id));
      const missing = accountIds.filter((id) => !validSet.has(id));
      if (missing.length > 0) {
        return NextResponse.json(
          {
            error: `Invalid account_id(s): ${missing.join(", ")}. Each line's account_id must reference an existing erp_accounts row in this tenant.`,
          },
          { status: 400 },
        );
      }
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
