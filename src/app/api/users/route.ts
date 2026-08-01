import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

function whitelistUserFields(body: Record<string, unknown>): Record<string, unknown> {
  const allowed = new Set([
    "tenant_id", "username", "email", "full_name", "role",
    "permissions", "active", "must_change_password", "password_hash",
  ]);
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (allowed.has(key)) result[key] = value;
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
    // only admins can list
    if (auth.user.role !== "admin" && !(auth.user.permissions || []).includes("*")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    const users = await auth.store.listUsers(tid);
    // strip hashes
    const safe = users.map(({ password_hash, totp_secret, ...u }) => u);
    return NextResponse.json({ items: safe });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    if (auth.user.role !== "admin" && !(auth.user.permissions || []).includes("*")) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    const body = await req.json();

    // Enforce tenant on new user
    body.tenant_id = auth.tenantId!;

    // Prevent more than 2 admins per tenant
    if (body.role === "admin") {
      const existingUsers = await auth.store.listUsers(auth.tenantId!);
      const adminCount = existingUsers.filter(u => u.role === "admin" && u.active).length;
      if (adminCount >= 2) {
        return NextResponse.json({ error: "Maximum 2 admins allowed per company. Remove an existing admin first." }, { status: 400 });
      }
    }

    // hash password if provided (create or reset)
    if (body.password) {
      body.password_hash = await hashPassword(body.password);
      delete body.password;
    }
    const created = await auth.store.upsertUser(whitelistUserFields(body));
    await audit(auth.store, auth.user, req, body.id ? "user.update" : "user.create", "user", created.id, { username: created.username });
    const { password_hash, totp_secret, ...safe } = created;
    return NextResponse.json(safe);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
