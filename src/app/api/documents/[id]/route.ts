import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (documents.delete)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "documents.delete"); if (_d) return _d; } /* requirePermission wired */

  const { id } = await params;
  // Tenant ownership check: listDocuments ignores tenantId in the store,
  // so we fetch all and filter for non-super_admin.
  const all = await auth.store.listDocuments(auth.tenantId ?? "", { limit: 100000 });
  const existing = all.items.find((d) => d.id === id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && (existing as any).tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await auth.store.deleteDocument(id);
  await audit(auth.store, auth.user, req, "document.delete", "document", id);
  return NextResponse.json({ ok: true });
}
