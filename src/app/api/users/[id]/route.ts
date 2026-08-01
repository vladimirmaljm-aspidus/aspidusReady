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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const u = await auth.store.getUserById(id);
    if (!u) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const { password_hash, totp_secret, ...safe } = u;
    return NextResponse.json(safe);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    if (auth.user.role !== "admin" && auth.user.id !== req.url.split("/").slice(-2, -1)[0]) {
      // non-admins can edit only themselves
      if (auth.user.role !== "admin") {
        return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
      }
    }
    const { id } = await params;
    const existing = await auth.store.getUserById(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
    const body = await req.json();

    // Prevent more than 2 admins per tenant when promoting to admin
    if (body.role === "admin" && existing.role !== "admin") {
      const existingUsers = await auth.store.listUsers(auth.tenantId!);
      const adminCount = existingUsers.filter(u => u.role === "admin" && u.active).length;
      if (adminCount >= 2) {
        return NextResponse.json({ error: "Maximum 2 admins allowed per company. Remove an existing admin first." }, { status: 400 });
      }
    }

    // Prevent demoting the last admin
    if (existing.role === "admin" && body.role && body.role !== "admin") {
      const users = await auth.store.listUsers(auth.tenantId!);
      const adminCount = users.filter(u => u.role === "admin" && u.active && u.id !== existing.id).length;
      if (adminCount < 1) {
        return NextResponse.json({ error: "Cannot demote the last admin. Promote another user first." }, { status: 400 });
      }
    }

    if (body.password) {
      body.password_hash = await hashPassword(body.password);
      delete body.password;
      body.must_change_password = false;
    }
    const updated = await auth.store.upsertUser({ ...whitelistUserFields(body), id });
    await audit(auth.store, auth.user, req, "user.update", "user", id, { username: updated.username });
    const { password_hash, totp_secret, ...safe } = updated;
    return NextResponse.json(safe);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    if (auth.user.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    const { id } = await params;
    if (id === auth.user.id) {
      return NextResponse.json({ error: "You cannot delete yourself." }, { status: 400 });
    }
    const existing = await auth.store.getUserById(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    // Prevent deleting the last admin
    if (existing.role === "admin") {
      const users = await auth.store.listUsers(auth.tenantId!);
      const adminCount = users.filter(u => u.role === "admin" && u.active && u.id !== existing.id).length;
      if (adminCount < 1) {
        return NextResponse.json({ error: "Cannot delete the last admin." }, { status: 400 });
      }
    }

    await auth.store.deleteUser(id);
    await audit(auth.store, auth.user, req, "user.delete", "user", id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
