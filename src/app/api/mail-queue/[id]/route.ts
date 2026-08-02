import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  // Tenant ownership check: listMailQueue ignores tenantId in the store,
  // so we fetch all and filter for non-super_admin.
  const all = await auth.store.listMailQueue(auth.tenantId ?? "", { limit: 100000 });
  const existing = all.items.find((m) => m.id === id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await auth.store.deleteMailQueueEntry(id);
  await audit(auth.store, auth.user, req, "mail.delete", "mail_queue", id);
  return NextResponse.json({ ok: true });
}
