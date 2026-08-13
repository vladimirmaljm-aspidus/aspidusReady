import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie, ImpersonationClaim } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";
import { SafeUser } from "@/lib/store/app-store";
import { createHash } from "crypto";

export interface AuthContext {
  user: SafeUser;
  store: Awaited<ReturnType<typeof getStore>>;
  ip: string;
  tenantId: string | null; // null = super-admin (platform level, sees all)
  isSuperAdmin: boolean;
  /** Present when a super_admin is currently impersonating another user. */
  impersonation?: ImpersonationClaim;
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
 *
 * P2-18 (CSRF): callers MAY pass the inbound `req` so this helper can enforce
 * a server-side Origin check on state-changing requests (POST/PUT/PATCH/
 * DELETE). `SameSite=Lax` blocks cookies on cross-site sub-resource requests,
 * but top-level navigations still send the cookie — an explicit Origin check
 * closes that gap. The parameter is optional so existing call sites keep
 * working unchanged; routes that want the CSRF defense pass `req` through.
 * API-key-authenticated requests (detected via the `Authorization: Bearer`
 * header) are exempt — bearer tokens are not sent automatically by browsers,
 * so they are not vulnerable to CSRF.
 */
export async function requireAuth(req?: NextRequest): Promise<AuthContext | NextResponse> {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const store = await getStore();
  const baseUser = await store.getUserById(session.sub);
  if (!baseUser || !baseUser.active) {
    return NextResponse.json({ error: "Account not active." }, { status: 401 });
  }
  if (baseUser.token_version !== session.token_version) {
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }

  // ── Impersonation handling ────────────────────────────────────────────
  // If the session carries an `impersonating` claim, and it hasn't expired,
  // swap the effective user to the impersonation target. Only super_admins
  // can hold this claim (defense-in-depth check here).
  let impersonation: ImpersonationClaim | undefined;
  let effectiveUser = baseUser;
  if (session.impersonating && baseUser.role === "super_admin") {
    const expired = new Date(session.impersonating.expires_at).getTime() < Date.now();
    if (!expired) {
      const target = await store.getUserById(session.impersonating.target_user_id);
      if (target && target.active) {
        effectiveUser = target;
        impersonation = session.impersonating;
      }
    }
    // else: expired → fall through as the original super_admin. The next
    // /api/super-admin/impersonate/end call (or the client banner's timer)
    // will explicitly restore the cookie; the session still works meanwhile.
  }

  const { password_hash, totp_secret, ...safe } = effectiveUser;
  const isSuperAdmin = effectiveUser.role === "super_admin" && !impersonation;

  // ── Subscription enforcement ──────────────────────────────────────────
  // SUPER-ADMIN IS NEVER BLOCKED — they manage the platform.
  // Regular users are blocked if their tenant's subscription has expired.
  // When impersonating, we bypass this too — the super_admin is diagnosing.
  if (!isSuperAdmin && !impersonation && effectiveUser.tenant_id) {
    try {
      const tenant = await store.getTenant(effectiveUser.tenant_id);
      if (tenant) {
        // Suspended or cancelled tenants are always blocked
        if (tenant.status === "suspended" || tenant.status === "cancelled") {
          return NextResponse.json(
            { error: "Account suspended. Contact your platform administrator.", subscription_expired: true },
            { status: 402 }
          );
        }
        const now = new Date();
        const subEnd = (tenant as any).subscription_end ? new Date((tenant as any).subscription_end) : null;
        const trialEnd = (tenant as any).trial_ends_at ? new Date((tenant as any).trial_ends_at) : null;
        // Check expiry: if subscription_end is in the past, block
        if (subEnd && subEnd < now) {
          return NextResponse.json(
            { error: "Subscription expired. Contact your platform administrator to renew.", subscription_expired: true },
            { status: 402 }
          );
        }
        // Check trial expiry
        if (String(tenant.status) === "trial" && trialEnd && trialEnd < now) {
          return NextResponse.json(
            { error: "Trial period expired. Subscribe to continue.", subscription_expired: true },
            { status: 402 }
          );
        }
      }
    } catch (e) {
      console.error("[requireAuth] Subscription check failed:", e);
    }
  }

  // ── CSRF defense (P2-18) ─────────────────────────────────────────────
  // Reject cross-site state-changing requests. SameSite=Lax blocks cookies
  // on cross-site sub-resource requests, but top-level navigations still
  // send the cookie — an explicit Origin check closes this gap. We only
  // run the check when the caller has passed the inbound `req` (optional
  // parameter, kept optional so legacy call sites compile unchanged) AND
  // the request is cookie-authenticated (no `Authorization: Bearer` header
  // — bearer-token API-key auth is not vulnerable to CSRF and is exempt).
  if (req) {
    const authHeader = req.headers.get("authorization");
    const isApiKeyRequest =
      !!authHeader && authHeader.startsWith("Bearer ") && authHeader.slice(7).trim().startsWith("asp_");
    if (!isApiKeyRequest) {
      const method = req.method.toUpperCase();
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        const origin = req.headers.get("origin");
        const appBaseUrl = process.env.APP_BASE_URL;
        if (appBaseUrl && origin && !origin.startsWith(appBaseUrl)) {
          return NextResponse.json(
            { error: "Cross-site requests are not allowed." },
            { status: 403 },
          );
        }
        // If origin is missing (same-origin requests sometimes omit it),
        // allow — SameSite=Lax covers this case.
      }
    }
  }

  return {
    user: safe as SafeUser,
    store,
    ip: "",
    tenantId: effectiveUser.tenant_id,
    isSuperAdmin,
    impersonation,
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

  // FIX-P1-LOGIC Fix 4: enforce tenant suspension/expiry for API key auth,
  // mirroring the same checks `requireAuth` applies to cookie sessions.
  // Without this, a suspended tenant's API key kept working indefinitely.
  try {
    const tenant = await store.getTenant(result.tenantId);
    if (tenant) {
      if (tenant.status === "suspended" || tenant.status === "cancelled") {
        return NextResponse.json(
          { error: "Account suspended. Contact your platform administrator.", subscription_expired: true },
          { status: 402 }
        );
      }
      const now = new Date();
      const subEnd = (tenant as any).subscription_end ? new Date((tenant as any).subscription_end) : null;
      const trialEnd = (tenant as any).trial_ends_at ? new Date((tenant as any).trial_ends_at) : null;
      if (subEnd && subEnd < now) {
        return NextResponse.json(
          { error: "Subscription expired. Contact your platform administrator to renew.", subscription_expired: true },
          { status: 402 }
        );
      }
      if (String(tenant.status) === "trial" && trialEnd && trialEnd < now) {
        return NextResponse.json(
          { error: "Trial period expired. Subscribe to continue.", subscription_expired: true },
          { status: 402 }
        );
      }
    }
  } catch (e) {
    console.error("[requireApiKeyAuth] Subscription check failed:", e);
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
    // Super-admin: prefer explicit ?tenant_id=xxx. If none is provided, return
    // NULL — tenant-scoped routes MUST refuse rather than silently fall back
    // to the super-admin's own tenant_id (which is null anyway). Platform-
    // level routes (that don't need a tenant scope) shouldn't be calling this.
    const url = new URL(req.url);
    return url.searchParams.get("tenant_id") || null;
  }
  // Impersonation: auth.tenantId already reflects the impersonated user's
  // tenant (requireAuth sets tenantId from effectiveUser.tenant_id).
  return auth.tenantId;
}

export function getIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    // Render's proxy appends the real client IP at the END of the chain.
    // The first value is attacker-controlled and must NOT be trusted.
    // CRITICAL FIX (audit S-1/C-1): previously this returned the FIRST entry,
    // allowing an attacker to spoof `X-Forwarded-For: 1.2.3.4` and bypass
    // rate-limiting / audit-IP attribution.
    const parts = xff.split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function audit(
  store: AuthContext["store"],
  user: SafeUser | { id: string; username: string; tenant_id?: string | null },
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
      tenant_id: user.tenant_id || null,
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
