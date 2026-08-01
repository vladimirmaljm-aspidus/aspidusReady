import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";
import { SafeUser } from "@/lib/store/app-store";

export interface AuthContext {
  user: SafeUser;
  store: Awaited<ReturnType<typeof getStore>>;
  ip: string;
  tenantId: string | null; // null = super-admin (platform level, sees all)
  isSuperAdmin: boolean;
}

export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const store = await getStore();
  const user = await store.getUserById(session.sub);
  if (!user || !user.active) {
    return NextResponse.json({ error: "Account not active." }, { status: 401 });
  }
  if (user.token_version !== session.token_version) {
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }
  const { password_hash, totp_secret, ...safe } = user;
  const isSuperAdmin = user.role === "super_admin";
  return {
    user: safe as SafeUser,
    store,
    ip: "",
    tenantId: user.tenant_id,
    isSuperAdmin,
  };
}

/**
 * Require admin or super_admin role.
 */
export async function requireAdmin(): Promise<AuthContext | NextResponse> {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  return auth;
}

/**
 * Require super_admin role (platform-level operations: create tenants, etc.)
 */
export async function requireSuperAdmin(): Promise<AuthContext | NextResponse> {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin) {
    return NextResponse.json({ error: "Super-admin access required." }, { status: 403 });
  }
  return auth;
}

/**
 * Resolve the effective tenant ID for a request.
 * Super-admins can pass ?tenant_id=xxx to act on a specific tenant.
 * Regular users are locked to their own tenant.
 */
export function resolveTenantId(auth: AuthContext, req: NextRequest): string | null {
  if (auth.isSuperAdmin) {
    const url = new URL(req.url);
    return url.searchParams.get("tenant_id") || auth.tenantId;
  }
  return auth.tenantId;
}

export function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function audit(
  store: AuthContext["store"],
  user: SafeUser,
  req: NextRequest,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await store.appendAudit({
      user_id: user.id,
      username: user.username,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      details: details || null,
      ip: getIp(req),
      user_agent: req.headers.get("user-agent") || null,
    });
  } catch (e) {
    console.error("[audit]", e);
  }
}
