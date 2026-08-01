import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Please enter username and password." }, { status: 400 });
    }

    const store = await getStore();
    const user = await store.getUserByUsername(username);

    if (!user || !user.active) {
      return NextResponse.json({ error: "User does not exist or is deactivated." }, { status: 401 });
    }

    // lockout check
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return NextResponse.json({ error: "Account is temporarily locked. Try again later." }, { status: 423 });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      // bump failed attempts (best-effort)
      const next = (user.failed_attempts || 0) + 1;
      const lockUntil = next >= 5 ? new Date(Date.now() + 15 * 60000).toISOString() : null;
      await store.upsertUser({ id: user.id, failed_attempts: next, locked_until: lockUntil });
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    // reset failed attempts + record login
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    await store.upsertUser({ id: user.id, failed_attempts: 0, locked_until: null });
    await store.updateUserLastLogin(user.id, ip);

    await store.appendAudit({
      user_id: user.id,
      username: user.username,
      action: "login",
      entity_type: "auth",
      entity_id: user.id,
      details: { method: "password" },
      ip,
      user_agent: req.headers.get("user-agent") || null,
    });

    const token = await createSession({
      sub: user.id,
      username: user.username,
      role: user.role,
      token_version: user.token_version,
      tenant_id: user.tenant_id,
    });
    await setSessionCookie(token);

    // strip sensitive fields
    const { password_hash, totp_secret, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
