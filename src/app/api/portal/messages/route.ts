import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

/**
 * GET /api/portal/messages
 * Lists messages between portal client and admin team.
 *
 * POST /api/portal/messages
 * Body: { message: "text" }
 * Sends a message from portal client to admin team.
 */

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "portal_client") {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const accessId = session.sub?.replace("portal:", "");
    if (!accessId) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const store = await getStore();
    const access = await store.getPortalAccessById(accessId);
    if (!access) return NextResponse.json({ error: "Not found." }, { status: 404 });

    // Messages stored as audit log entries with action="portal.message"
    const audit = await store.listAudit(access.tenant_id, { limit: 100 });
    const messages = audit.items
      .filter((a: any) =>
        (a.action === "portal.message" || a.action === "admin.message") &&
        (a.entity_id === accessId || a.details?.access_id === accessId || a.details?.partner_id === access.partner_id)
      )
      .map((a: any) => ({
        id: a.id,
        direction: a.action === "portal.message" ? "outgoing" : "incoming",
        message: a.details?.message || "",
        sender: a.username || "System",
        timestamp: a.created_at,
        read: a.details?.read || false,
      }))
      .sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));

    return NextResponse.json({ items: messages });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "portal_client") {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const accessId = session.sub?.replace("portal:", "");
    if (!accessId) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const { message } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const store = await getStore();
    const access = await store.getPortalAccessById(accessId);
    if (!access) return NextResponse.json({ error: "Not found." }, { status: 404 });

    // Store message in audit log
    await store.appendAudit({
      tenant_id: access.tenant_id,
      user_id: null,
      username: `portal:${access.portal_email || accessId}`,
      action: "portal.message",
      entity_type: "portal_access",
      entity_id: accessId,
      details: {
        message: message.trim(),
        partner_id: access.partner_id,
        read: false,
      },
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      user_agent: req.headers.get("user-agent") || null,
    });

    // Create a notification for admin
    try {
      await store.createNotification({
        tenant_id: access.tenant_id,
        user_id: null,
        type: "system_message" as any,
        title: `Portal message from ${access.portal_email}`,
        message: message.trim().substring(0, 200),
        entity_type: "portal_access",
        entity_id: accessId,
      } as any);
    } catch { /* non-critical */ }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
