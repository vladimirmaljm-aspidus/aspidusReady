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

    // ── Impersonation surface ─────────────────────────────────────────────
    // When the session carries an active impersonation claim, return the
    // effective (target) user and the impersonation metadata so the UI can
    // render a banner + End button.
    if (session.impersonating && user.role === "super_admin") {
      const notExpired = new Date(session.impersonating.expires_at).getTime() > Date.now();
      if (notExpired) {
        const target = await store.getUserById(session.impersonating.target_user_id);
        if (target && target.active) {
          const { password_hash: _p1, totp_secret: _t1, ...safeTarget } = target;
          return NextResponse.json({
            user: safeTarget,
            impersonation: {
              original_super_admin_id: session.impersonating.original_super_admin_id,
              original_username: session.impersonating.original_username,
              target_user_id: session.impersonating.target_user_id,
              target_tenant_id: session.impersonating.target_tenant_id,
              expires_at: session.impersonating.expires_at,
            },
          });
        }
      }
    }

    const { password_hash, totp_secret, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    console.error("[auth/me] Error:", e);
    // Return null user instead of crashing — app will show login page
    return NextResponse.json({ user: null, error: "db_connection_failed" }, { status: 200 });
  }
}
