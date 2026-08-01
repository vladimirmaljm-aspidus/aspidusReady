import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

// Portal login — separate session type (partner, not user)
export async function POST(req: NextRequest) {
  try {
    const { email, password, tenant_id } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    const store = await getStore();

    // If tenant_id is provided, verify with it; otherwise look up by email alone
    let access;
    if (tenant_id) {
      access = await store.verifyPortalCredentials(tenant_id, email, password);
    } else {
      // Look up portal access by email alone — find the matching record
      access = await store.verifyPortalCredentialsByEmail(email, password);
    }

    if (!access) {
      return NextResponse.json({ error: "Invalid credentials or account not active." }, { status: 401 });
    }

    // Check if portal account is locked
    if (access.locked_until && new Date(access.locked_until) > new Date()) {
      return NextResponse.json({ error: "Account is temporarily locked. Try again later." }, { status: 423 });
    }

    // Check status is active
    if (access.status !== "active") {
      return NextResponse.json({ error: "Account is not yet active. Please set up your password first." }, { status: 403 });
    }

    const token = await createSession({
      sub: `portal:${access.id}`,
      username: access.portal_email || "",
      role: "portal_client",
      token_version: access.token_version || 1,
      tenant_id: access.tenant_id,
    });
    await setSessionCookie(token);

    // Update last login
    try {
      await store.upsertPortalAccess({
        id: access.id,
        last_login_at: new Date().toISOString(),
      });
    } catch { /* non-critical */ }

    return NextResponse.json({ access: { ...access, password_hash: undefined } });
  } catch (e) {
    console.error("[portal.login]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
