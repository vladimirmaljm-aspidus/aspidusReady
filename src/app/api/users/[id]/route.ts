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
    // Permission gate (users.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "users.read"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    const u = await auth.store.getUserById(id);
    if (!u) return NextResponse.json({ error: "Not found." }, { status: 404 });
    // Tenant ownership check: regular users can only see users in their own tenant.
    // Super_admin can see any user. Also hide super_admin accounts from non-super_admins.
    if (!auth.isSuperAdmin) {
      if (u.role === "super_admin" || u.tenant_id !== auth.tenantId) {
        return NextResponse.json({ error: "Not found." }, { status: 404 });
      }
    }
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
    const { id } = await params;
    const existing = await auth.store.getUserById(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    // Tenant ownership check:
    // - Super_admin can edit any user.
    // - Regular admins can only edit users in their own tenant (and never super_admin accounts).
    // - Regular non-admin users can only edit themselves.
    if (!auth.isSuperAdmin) {
      if (existing.role === "super_admin" || existing.tenant_id !== auth.tenantId) {
        return NextResponse.json({ error: "Not found." }, { status: 404 });
      }
      if (auth.user.role !== "admin" && auth.user.id !== id) {
        return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
      }
    }

    const body = await req.json();

    // Only a super-admin can grant super-admin (platform-level) access —
    // otherwise any user could self-promote via PUT on their own record.
    if (body.role === "super_admin" && existing.role !== "super_admin" && !auth.isSuperAdmin) {
      return NextResponse.json({ error: "Only a super-admin can grant super-admin access." }, { status: 403 });
    }

    // Prevent more than 2 admins per tenant when promoting to admin
    if (body.role === "admin" && existing.role !== "admin" && existing.tenant_id) {
      const existingUsers = await auth.store.listUsers(existing.tenant_id);
      const adminCount = existingUsers.filter(u => u.role === "admin" && u.active).length;
      if (adminCount >= 2) {
        return NextResponse.json({ error: "Maximum 2 admins allowed per company. Remove an existing admin first." }, { status: 400 });
      }
    }

    // Prevent demoting the last admin
    if (existing.role === "admin" && body.role && body.role !== "admin" && existing.tenant_id) {
      const users = await auth.store.listUsers(existing.tenant_id);
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
    // Preserve the user's tenant_id (regular users/admins cannot move users to another tenant)
    const whitelisted = whitelistUserFields(body);
    delete whitelisted.tenant_id;

    // A non-admin editing their own record must not be able to change their
    // own role, permissions, or active flag — otherwise self-service profile
    // editing doubles as a self-promotion path.
    if (!auth.isSuperAdmin && auth.user.role !== "admin" && auth.user.id === id) {
      delete whitelisted.role;
      delete whitelisted.permissions;
      delete whitelisted.active;
    }
    const updated = await auth.store.upsertUser({ ...whitelisted, id });
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
    if (auth.user.role !== "admin" && !auth.isSuperAdmin) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    const { id } = await params;
    if (id === auth.user.id) {
      return NextResponse.json({ error: "You cannot delete yourself." }, { status: 400 });
    }
    const existing = await auth.store.getUserById(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    // Tenant Ownership check
    if (!auth.isSuperAdmin) {
      if (existing.role === "super_admin" || existing.tenant_id !== auth.tenantId) {
        return NextResponse.json({ error: "Not found." }, { status: 404 });
      }
    }

    // Prevent deleting the last admin
    if (existing.role === "admin" && existing.tenant_id) {
      const users = await auth.store.listUsers(existing.tenant_id);
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
