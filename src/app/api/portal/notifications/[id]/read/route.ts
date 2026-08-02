import { NextRequest, NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

/**
 * PUT /api/portal/notifications/[id]/read
 *
 * Mark a notification as read for the logged-in portal partner.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await getPortalSessionAccess();
    if (!access) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { id } = await params;
    const store = await getStore();

    // Verify the notification belongs to this partner's tenant
    const notifications = await store.listNotificationsByPartner(access.tenant_id, access.partner_id);
    const notification = notifications.find((n) => n.id === id);

    if (!notification) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    }

    await store.markNotificationRead(id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[portal.notifications.read]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
