import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";

export const runtime = "nodejs";

export async function POST() {
  // Invalidate the JWT by bumping token_version, and revoke the SecuritySession
  // record (if any) so the Sessions tab shows the session as revoked.
  try {
    const session = await getSessionFromCookie();
    if (session) {
      const store = await getStore();
      try {
        await store.bumpUserTokenVersion(session.sub);
      } catch (e) {
        console.error("[logout] Failed to invalidate token:", e);
      }
      // Find the user's most recent non-revoked current session and revoke it.
      try {
        const sessions = await store.listSessions(session.tenant_id ?? "", session.sub);
        const current = sessions.find((s) => s.current && !s.revoked) || sessions.find((s) => !s.revoked);
        if (current) {
          await store.revokeSessionById(current.id);
        }
      } catch (e) {
        console.error("[logout] Failed to revoke security session:", e);
      }
    }
  } catch (e) {
    console.error("[logout] Unexpected error:", e);
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
