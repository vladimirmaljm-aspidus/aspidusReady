import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getSessionFromCookie } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { validatePassword } from "@/lib/auth/password-policy";

export const runtime = "nodejs";

// Portal password setup — used two ways:
//  1. Anonymous first-time setup: the customer follows the emailed invite
//     link (?access_id=...), which is only valid while must_set_password
//     is still true. Once a password has been set, this path closes.
//  2. Staff-initiated: an authenticated admin of the same tenant (or a
//     super-admin) sets/resets a portal account's password from the CRM.
export async function POST(req: NextRequest) {
  try {
    const { access_id, password } = await req.json();
    if (!access_id || !password) {
      return NextResponse.json({ error: "Access ID and password are required." }, { status: 400 });
    }

    const validation = validatePassword(password);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
    }

    const store = await getStore();
    const access = await store.getPortalAccessById(access_id);
    if (!access) {
      return NextResponse.json({ error: "Invalid access link." }, { status: 404 });
    }

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

    if (!staffAuthorized && !access.must_set_password) {
      return NextResponse.json(
        { error: "This account already has a password. Use sign-in or the forgot-password flow instead." },
        { status: 403 }
      );
    }

    const passwordHash = await hashPassword(password);
    await store.upsertPortalAccess({
      id: access_id,
      password_hash: passwordHash,
      must_set_password: false,
      status: "active",
      token_version: (access.token_version || 0) + 1,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[portal.setup]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
