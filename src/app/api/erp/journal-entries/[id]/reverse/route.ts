import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// POST /api/erp/journal-entries/[id]/reverse — Reverse a posted journal entry
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const existing = await auth.store.getErpJournalEntry(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    // Tenant Ownership check
    if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    if (existing.status !== "posted") {
      return NextResponse.json({ error: "Only posted entries can be reversed." }, { status: 400 });
    }

    const body = await req.json();
    const reversedBy = body.reversed_by || auth.user.id;

    const reversed = await auth.store.reverseErpJournalEntry(id, reversedBy);
    await audit(auth.store, auth.user, req, "journal_entry.reverse", "erp_journal_entry", id, {
      entry_number: existing.entry_number,
      reversed_by: reversedBy,
      reversal_entry: reversed.id,
    });
    return NextResponse.json(reversed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
