import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (mail-queue.delete)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "mail-queue.delete"); if (_d) return _d; } /* requirePermission wired */
  // Feature gate (module_mail_queue)
  { const { requireFeature } = await import("@/lib/api/feature-guard");
    const _f = await requireFeature(auth.tenantId, "module_mail_queue", auth.isSuperAdmin); if (_f) return _f; } /* requireFeature wired */

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
