import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getSessionFromCookie, createSession, setSessionCookie } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { validatePassword } from "@/lib/auth/password-policy";

export const runtime = "nodejs";

// Password policy for portal *clients* is intentionally lighter than for staff
// users — most portal clients type on mobile keyboards and the strong staff
// policy (uppercase + number required) caused silent failures where the user
// typed something valid-looking and got a generic "setup failed" toast. The
// full staff policy still applies to CRM/ERP users.
const PORTAL_CLIENT_POLICY = {
  minLength: 8,
  requireUppercase: false,
  requireLowercase: false,
  requireNumbers: false,
  requireSymbols: false,
};

// Portal password setup — used two ways:
//  1. Anonymous first-time setup: the customer follows the emailed invite
//     link (?access_id=...), which is valid while must_set_password is still
//     true. Once a password has been set, this path closes.
//  2. Staff-initiated: an authenticated admin of the same tenant (or a
//     super-admin) sets/resets a portal account's password from the CRM.
export async function POST(req: NextRequest) {
  try {
    const { access_id, password } = await req.json();
    if (!access_id || !password) {
      return NextResponse.json({ error: "Access ID and password are required." }, { status: 400 });
    }

    const validation = validatePassword(password, PORTAL_CLIENT_POLICY);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
    }

    const store = await getStore();
    const access = await store.getPortalAccessById(access_id);
    if (!access) {
      return NextResponse.json({ error: "Invalid or expired setup link. Ask your account manager to re-send the invitation." }, { status: 404 });
    }

    // Is this call coming from a staff (admin/super_admin) session?
    let staffAuthorized = false;
    const session = await getSessionFromCookie();
    if (session && session.role !== "portal_client") {
      const staffUser = await store.getUserById(session.sub);
      if (
        staffUser &&
        staffUser.active &&
        staffUser.token_version === session.token_version &&
        (staffUser.role === "super_admin" || staffUser.tenant_id === access.tenant_id)
      ) {
        staffAuthorized = true;
      }
    }

    // Anonymous path is only allowed while must_set_password is still true.
    // If the user bookmarks the invite link and comes back after already
    // setting a password, point them to the right flow instead of failing
    // silently.
    if (!staffAuthorized && !access.must_set_password) {
      return NextResponse.json(
        {
          error: "This account already has a password. Use sign-in, or click 'Forgot password' if you need to reset it.",
          already_has_password: true,
        },
        { status: 403 }
      );
    }

    if (access.status === "revoked" || access.status === "suspended") {
      return NextResponse.json({ error: "This portal account is not currently active. Contact your account manager." }, { status: 403 });
    }

    const passwordHash = await hashPassword(password);
    const updated = await store.upsertPortalAccess({
      id: access_id,
      password_hash: passwordHash,
      must_set_password: false,
      status: "active",
      failed_attempts: 0,
      locked_until: null,
      token_version: (access.token_version || 0) + 1,
    } as any);

    // Anonymous first-time setup → mint a portal session immediately. Making
    // the user re-type their brand-new password on the login screen after
    // this endpoint returns is what produced the "nothing happens" reports:
    // the setup succeeded but the browser just sat on an empty login form.
    if (!staffAuthorized) {
      try {
        const token = await createSession({
          sub: `portal:${updated.id}`,
          username: updated.portal_email || "",
          role: "portal_client",
          token_version: updated.token_version || 0,
          tenant_id: updated.tenant_id,
        });
        await setSessionCookie(token);
      } catch (e) {
        console.warn("[setup-password] auto-login failed, user will need to sign in manually:", e);
      }
    }

    const { password_hash: _, ...safe } = updated as any;
    return NextResponse.json({ ok: true, access: safe, auto_signed_in: !staffAuthorized });
  } catch (e) {
    console.error("[portal.setup]", e);
    return NextResponse.json({ error: "Server error while setting up your password. Please try again in a minute or ask your account manager to re-send the invitation." }, { status: 500 });
  }
}
