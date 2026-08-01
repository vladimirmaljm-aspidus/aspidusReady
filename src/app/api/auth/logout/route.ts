import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

export async function POST() {
  // Invalidate the JWT by bumping token_version
  try {
    const session = await getSessionFromCookie();
    if (session) {
      const store = await getStore();
      await store.bumpUserTokenVersion(session.sub);
    }
  } catch (e) {
    console.error("[logout] Failed to invalidate token:", e);
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
