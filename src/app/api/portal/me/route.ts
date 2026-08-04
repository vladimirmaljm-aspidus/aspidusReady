import { NextResponse } from "next/server";
import { getSessionFromCookie, clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "portal_client") {
      return NextResponse.json({ access: null }, { status: 200 });
    }
    const accessId = session.sub.replace("portal:", "");
    const { getStore } = await import("@/lib/data/store");
    const store = await getStore();
    const access = await store.getPortalAccessById(accessId);
    if (!access || access.status !== "active") {
      return NextResponse.json({ access: null }, { status: 200 });
    }
    if ((session.token_version || 0) !== (access.token_version || 0)) {
      return NextResponse.json({ access: null }, { status: 200 });
    }
    return NextResponse.json({ access: { ...access, password_hash: undefined } });
  } catch (e) {
    console.error("[portal/me] Error:", e);
    return NextResponse.json({ access: null }, { status: 200 });
  }
}

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
