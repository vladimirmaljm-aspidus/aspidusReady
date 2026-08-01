import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Dynamically import store to avoid crashes if DB is not configured
    const { getStore } = await import("@/lib/data/store");
    const store = await getStore();
    const user = await store.getUserById(session.sub);
    if (!user || !user.active) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // token version mismatch → invalid session
    if (user.token_version !== session.token_version) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { password_hash, totp_secret, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    console.error("[auth/me] Error:", e);
    // Return null user instead of crashing — app will show login page
    return NextResponse.json({ user: null, error: "db_connection_failed" }, { status: 200 });
  }
}
