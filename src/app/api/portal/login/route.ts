import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

function getRequestIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

// Portal login — separate session type (partner, not user)
export async function POST(req: NextRequest) {
  try {
    const { email, password, tenant_id } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    const store = await getStore();
    const ip = getRequestIp(req);

    // If no tenant_id is provided, look up ALL matching accounts for this email.
    // If more than one exists (same email across tenants), the client MUST
    // specify which tenant they are logging into — otherwise we risk
    // authenticating against the wrong tenant (data leakage).
    if (!tenant_id) {
      const allByEmail = await store.listPortalAccessByEmail(email);
      if (allByEmail.length > 1) {
        // Return the list of tenant names so the UI can show a picker.
        const tenants = await Promise.all(
          allByEmail.map(async (pa) => {
            const t = await store.getTenant(pa.tenant_id);
            return { tenant_id: pa.tenant_id, tenant_name: t?.name || "Unknown" };
          })
        );
        return NextResponse.json({
          error: "This email is registered with multiple organizations. Please select which one to sign into.",
          multiple_tenants: true,
          tenants,
        }, { status: 409 });
      }
    }

    // Look up the account first (independent of the password check) so a
    // lockout/failure counter can be tracked even on a wrong password.
    const existing = tenant_id
      ? await store.getPortalAccessByEmail(tenant_id, email)
      : await store.getPortalAccessByEmailAnyTenant(email);

    if (existing?.locked_until && new Date(existing.locked_until) > new Date()) {
      return NextResponse.json({ error: "Account is temporarily locked. Try again later." }, { status: 423 });
    }

    // If tenant_id is provided, verify with it; otherwise look up by email alone
    let access;
    if (tenant_id) {
      access = await store.verifyPortalCredentials(tenant_id, email, password);
    } else {
      // Look up portal access by email alone — find the matching record
      access = await store.verifyPortalCredentialsByEmail(email, password);
    }

    if (!access) {
      // Bump the failed-attempt counter on a known account (best-effort —
      // we don't fail the request if this write has trouble).
      if (existing) {
        const next = (existing.failed_attempts || 0) + 1;
        const lockUntil = next >= 5 ? new Date(Date.now() + 15 * 60000).toISOString() : null;
        try {
          await store.upsertPortalAccess({ id: existing.id, failed_attempts: next, locked_until: lockUntil });
        } catch { /* non-critical */ }
      }
      return NextResponse.json({ error: "Invalid credentials or account not active." }, { status: 401 });
    }

    // Check status is active
    if (access.status !== "active") {
      return NextResponse.json({ error: "Account is not yet active. Please set up your password first." }, { status: 403 });
    }

    const token = await createSession({
      sub: `portal:${access.id}`,
      username: access.portal_email || "",
      role: "portal_client",
      token_version: access.token_version || 0,
      tenant_id: access.tenant_id,
    });
    await setSessionCookie(token);

    // Success: reset the failed-attempt counter and record the login.
    try {
      await store.upsertPortalAccess({
        id: access.id,
        failed_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
        last_login_ip: ip,
      });
    } catch { /* non-critical */ }

    return NextResponse.json({ access: { ...access, password_hash: undefined } });
  } catch (e) {
    console.error("[portal.login]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
