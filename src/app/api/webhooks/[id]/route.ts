import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (webhooks.delete)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "webhooks.delete"); if (_d) return _d; } /* requirePermission wired */

  const { id } = await params;
  // Tenant ownership check: listWebhooks ignores tenantId in the store,
  // so we fetch all and filter for non-super_admin.
  const all = await auth.store.listWebhooks(auth.tenantId ?? "");
  const existing = all.find((w) => w.id === id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await auth.store.deleteWebhook(id);
  await audit(auth.store, auth.user, req, "webhook.delete", "webhook", id);
  return NextResponse.json({ ok: true });
}
