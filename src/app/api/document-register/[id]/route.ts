import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  // Tenant ownership check: listDocumentRegister ignores tenantId in the store,
  // so we fetch all and filter for non-super_admin.
  const all = await auth.store.listDocumentRegister(auth.tenantId ?? "", { limit: 100000 });
  const existing = all.items.find((d) => d.id === id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await auth.store.deleteDocumentRegisterEntry(id);
  await audit(auth.store, auth.user, req, "document.register.delete", "document_register", id);
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  // Tenant ownership check on the parent document before listing its revisions.
  const all = await auth.store.listDocumentRegister(auth.tenantId ?? "", { limit: 100000 });
  const existing = all.items.find((d) => d.id === id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const revisions = await auth.store.listDocumentRevisions(auth.tenantId ?? "", id);
  return NextResponse.json({ items: revisions });
}
