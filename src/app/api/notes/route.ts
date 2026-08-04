import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (notes.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "notes.read"); if (_d) return _d; } /* requirePermission wired */

  const tid = auth.tenantId!;
  const url = new URL(req.url);
  const entity_type = url.searchParams.get("entity_type");
  const entity_id = url.searchParams.get("entity_id");
  if (!entity_type || !entity_id) {
    return NextResponse.json({ error: "entity_type and entity_id required." }, { status: 400 });
  }
  const notes = await auth.store.listNotes(tid, entity_type, entity_id);
  return NextResponse.json({ items: notes });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  // Permission gate (notes.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "notes.create"); if (_d) return _d; } /* requirePermission wired */

  const body = await req.json();
  body.tenant_id = auth.tenantId!;
  if (!body.created_by) body.created_by = auth.user.id;
  const created = await auth.store.upsertNote(body);
  await audit(auth.store, auth.user, req, body.id ? "note.update" : "note.create", "entity_note", created.id);
  return NextResponse.json(created);
}
