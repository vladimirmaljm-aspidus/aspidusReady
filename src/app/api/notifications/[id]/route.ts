import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (notifications.update)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "notifications.update"); if (_d) return _d; } /* requirePermission wired */

  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (body.read) {
    const existing = await auth.store.getNotificationById(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    await auth.store.markNotificationRead(id);
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Mark all as read for this user
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  // Permission gate (notifications.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "notifications.update"); if (_d) return _d; } /* requirePermission wired */

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  if (action === "mark_all_read") {
    const tenantId = auth.tenantId || "";
    if (tenantId) {
      await auth.store.markAllNotificationsRead(tenantId, auth.user.id);
    }
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  // Permission gate (notifications.delete)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "notifications.delete"); if (_d) return _d; } /* requirePermission wired */

  const { id } = await params;
  // Tenant ownership check
  const all = await auth.store.listNotifications(auth.tenantId ?? "", auth.user.id);
  const existing = all.find((n) => n.id === id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await auth.store.deleteNotification(id);
  try {
    await audit(auth.store, auth.user, req, "notification.delete", "notification", id, {});
  } catch (e) { console.error("[audit]", e); }
  return NextResponse.json({ ok: true });
}
