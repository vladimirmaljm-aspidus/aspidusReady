import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";
import { SafeUser } from "@/lib/store/app-store";
import { createHash } from "crypto";

export interface AuthContext {
  user: SafeUser;
  store: Awaited<ReturnType<typeof getStore>>;
  ip: string;
  tenantId: string | null; // null = super-admin (platform level, sees all)
  isSuperAdmin: boolean;
}

export interface ApiKeyAuthContext {
  store: Awaited<ReturnType<typeof getStore>>;
  ip: string;
  tenantId: string;
  apiKeyId: string;
  apiKeyName: string;
  permissions: string[];
}

/**
 * Authenticate via session cookie OR API key (Bearer token).
 * API keys are checked first, then falls back to session auth.
 */
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
 * Authenticate via API key (Authorization: Bearer asp_xxx).
 * Returns ApiKeyAuthContext with tenant_id and permissions.
 */
export async function requireApiKeyAuth(req: NextRequest): Promise<ApiKeyAuthContext | NextResponse> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "API key required. Use Authorization: Bearer asp_xxx" }, { status: 401 });
  }
  const rawKey = authHeader.slice(7).trim();
  if (!rawKey.startsWith("asp_")) {
    return NextResponse.json({ error: "Invalid API key format." }, { status: 401 });
  }

  const store = await getStore();
  const result = await store.authenticateApiKey(rawKey);
  if (!result) {
    return NextResponse.json({ error: "Invalid or expired API key." }, { status: 401 });
  }

  const ip = getIp(req);

  // Update last used (fire-and-forget)
  store.updateApiKeyLastUsed(result.apiKey.id, ip).catch(() => {});

  return {
    store,
    ip,
    tenantId: result.tenantId,
    apiKeyId: result.apiKey.id,
    apiKeyName: result.apiKey.name,
    permissions: result.apiKey.permissions || [],
  };
}

/**
 * Check if an API key has the required permission.
 * Permissions format: "resource:action" or "resource:*" or "*"
 * e.g. "partners:read", "offers:*", "*"
 */
export function hasPermission(permissions: string[], required: string): boolean {
  if (permissions.includes("*")) return true;
  const [resource, action] = required.split(":");
  // Check for resource:* or resource:action
  return permissions.includes(`${resource}:*`) || permissions.includes(required);
}

/**
 * Authenticate via session cookie OR API key.
 * Returns either AuthContext (session) or ApiKeyAuthContext (API key).
 * Use this for endpoints that should support both auth methods.
 */
export async function requireAuthOrApiKey(req: NextRequest): Promise<AuthContext | ApiKeyAuthContext | NextResponse> {
  // Check API key first
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const rawKey = authHeader.slice(7).trim();
    if (rawKey.startsWith("asp_")) {
      return requireApiKeyAuth(req);
    }
  }

  // Fall back to session auth
  return requireAuth();
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
 * API key auth always uses the key's tenant_id.
 */
export function resolveTenantId(auth: AuthContext | ApiKeyAuthContext, req: NextRequest): string | null {
  if ("apiKeyId" in auth) {
    // API key auth — always scoped to the key's tenant
    return auth.tenantId;
  }
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
  user: SafeUser | { id: string; username: string },
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
