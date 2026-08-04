import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// POST /api/erp/journal-entries/[id]/post — Post a journal entry (change status from draft to posted)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (erp.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "erp.create"); if (_d) return _d; } /* requirePermission wired */


  const { id } = await params;
  try {
    const existing = await auth.store.getErpJournalEntry(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    // Tenant Ownership check
    if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    if (existing.status !== "draft") {
      return NextResponse.json({ error: "Only draft entries can be posted." }, { status: 400 });
    }

    const body = await req.json();
    const postedBy = body.posted_by || auth.user.id;

    const posted = await auth.store.postErpJournalEntry(id, postedBy);
    await audit(auth.store, auth.user, req, "journal_entry.post", "erp_journal_entry", id, {
      entry_number: posted.entry_number,
      posted_by: postedBy,
    });
    return NextResponse.json(posted);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
