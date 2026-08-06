import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { getSupabase } from "@/lib/supabase/client";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.tenantId) return NextResponse.json({ error: "No tenant context." }, { status: 400 });

  const { id } = await params;
  const sb = getSupabase();
  const { error } = await sb
    .from("quick_notes")
    .delete()
    .eq("id", id)
    .eq("tenant_id", auth.tenantId)
    .eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  try {
    await audit(auth.store, auth.user, req, "quick_note.delete", "quick_note", id, {});
  } catch (e) { console.error("[audit]", e); }
  return NextResponse.json({ ok: true });
}
