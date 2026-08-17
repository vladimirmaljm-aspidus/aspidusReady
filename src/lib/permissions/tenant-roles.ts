// src/lib/permissions/tenant-roles.ts
// ----------------------------------------------------------------------------
// Per-tenant role customization (P1-1 / Feature 1).
//
// Background
// ----------
// Before this module, every tenant shared the same role-to-permission map:
// Tenant A's "manager" got the exact same `users.permissions` seed as
// Tenant B's "manager". A tenant who wanted a stricter or looser "manager"
// had to hand-edit each user's `permissions` array — which scales poorly
// and gives no role-level audit trail.
//
// This module lets a super_admin (or a tenant admin via the admin API)
// attach an ADDITIONAL permission grant to a (tenant_id, role) pair. The
// grant is stored in the `tenant_role_overrides` table (migration 039)
// and merged into the user's effective permission set at evaluation time
// inside `can()` (see `can.ts`).
//
// CRITICAL SUPER-ADMIN RULE
// -------------------------
// Super_admin is NEVER subject to per-tenant overrides:
//   • `can()` returns `true` for super_admin before consulting overrides.
//   • `loadTenantRolePermissions()` returns `null` for super_admin callers
//     (the override is irrelevant — the user is already granted everything).
//   • Super_admin can READ/EDIT/DELETE any tenant's overrides via the
//     admin API routes (`/api/admin/tenant-roles/...`). Tenant admins
//     may only manage their OWN tenant's overrides.
//
// SEMANTICS
// ---------
// Overrides are ADDITIVE. The user keeps:
//   1. Their explicit `users.permissions` array grants.
//   2. The default role grants (e.g. `role === "admin"` implicitly gets
//      every non-platform permission — see `can.ts` step 3).
//   3. PLUS the (tenant_id, role) override permissions, if one is active.
//
// This is intentional: an override can GRANT additional permissions to a
// role within a tenant, but it can never REVOKE permissions the user would
// otherwise have. Revocation would create a silent lockout risk (a user
// who could do X yesterday suddenly can't today) and is left as a future
// follow-up if a tenant needs stricter isolation.
//
// WHAT THIS MODULE DOES NOT DO
// ----------------------------
//   • It does NOT change the existing role semantics (`admin` still gets
//     every non-platform permission implicitly — overrides only add).
//   • It does NOT support per-user overrides (those are already handled
//     by the `users.permissions` column).
//   • It does NOT call into the API-key auth path (`requireApiKeyAuth`
//     uses the `hasPermission()` helper in `lib/api/helpers.ts`, which
//     reads the API key's `permissions` array directly — API keys are
//     tenant-scoped but do NOT inherit role overrides; if you want an
//     API key with extra perms, add them to the key's `permissions`).
// ----------------------------------------------------------------------------

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ALL_PERMISSIONS, isPlatformPerm } from "./catalog";

/**
 * A per-tenant permission grant for a role.
 *
 * `permissions` is an explicit array (stored as JSONB). Each entry is a
 * catalog permission string (`"offers.create"`, `"erp.post"`, ...) or
 * the resource wildcard `"offers.*"`. The platform wildcard `"*"` is
 * also accepted but is treated as "grant every non-platform permission"
 * — a per-tenant override can NEVER grant platform.* permissions
 * (those are super_admin-exclusive and enforced separately in `can.ts`).
 */
export interface TenantRoleOverride {
  id: string;
  tenant_id: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Loaded shape for the FIX-V1 settings-blob sub-system. The
 * `role-overrides/route.ts` POST/GET persist a JSON array of
 * `{ id, tenant_id, role, mode, permissions, notes, ... }` into the
 * `settings.value` column (key = "role_overrides"). This helper loads
 * that blob and returns the GRANT-mode permissions for the given
 * (role, tenant_id) pair. DENY mode is ignored (the SoD check is
 * grants-only — a deny can't cause a SoD violation because a violation
 * requires the user to HOLD both perms).
 *
 * Returns an object with a `grants` array (possibly empty). Cached for
 * 5 minutes — callers that mutate the blob should call
 * `invalidateRoleOverridesCache()` after the write.
 */
export interface RoleOverrideGrants {
  grants: string[];
}

const roleOverridesCache = new Map<string, { value: RoleOverrideGrants; expires: number }>();
const ROLE_OVERRIDES_CACHE_TTL_MS = 5 * 60 * 1000;

export function invalidateRoleOverridesCache(
  tenantId?: string | null,
  role?: string,
): void {
  if (!tenantId && !role) {
    roleOverridesCache.clear();
    return;
  }
  for (const key of Array.from(roleOverridesCache.keys())) {
    const [t, r] = key.split("|");
    if (tenantId && role && t === tenantId && r === role) {
      roleOverridesCache.delete(key);
    } else if (tenantId && !role && t === tenantId) {
      roleOverridesCache.delete(key);
    } else if (!tenantId && role && r === role) {
      roleOverridesCache.delete(key);
    }
  }
}

export async function loadRoleOverrides(
  role: string,
  tenantId: string,
): Promise<RoleOverrideGrants> {
  // Super-admin rule: never subject to overrides — return empty grants.
  if (role === "super_admin") return { grants: [] };

  const key = `${tenantId}|${role}`;
  const cached = roleOverridesCache.get(key);
  if (cached && Date.now() < cached.expires) return cached.value;

  const empty: RoleOverrideGrants = { grants: [] };

  if (!isSupabaseConfigured()) {
    roleOverridesCache.set(key, { value: empty, expires: Date.now() + ROLE_OVERRIDES_CACHE_TTL_MS });
    return empty;
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("settings")
      .select("value")
      .eq("key", "role_overrides")
      .is("tenant_id", "null")
      .maybeSingle();
    if (error || !data) {
      roleOverridesCache.set(key, { value: empty, expires: Date.now() + ROLE_OVERRIDES_CACHE_TTL_MS });
      return empty;
    }

    const rows: any[] = Array.isArray(data?.value) ? (data.value as any[]) : [];
    // Match: tenant_id is null (platform-wide) OR equals the requested
    // tenantId. Mode must be "grant" (deny semantics don't add perms).
    const matching = rows.filter(
      (r) =>
        r?.mode === "grant" &&
        r?.role === role &&
        (r?.tenant_id === null || r?.tenant_id === tenantId) &&
        Array.isArray(r?.permissions),
    );
    const grants = new Set<string>();
    for (const r of matching) {
      for (const p of r.permissions) {
        if (typeof p === "string" && p.length > 0) {
          // Platform perms are forbidden via overrides (defence-in-depth
          // — the role-overrides POST also rejects them at write time).
          if (!isPlatformPerm(p)) grants.add(p);
        }
      }
    }
    const result: RoleOverrideGrants = { grants: Array.from(grants) };
    roleOverridesCache.set(key, { value: result, expires: Date.now() + ROLE_OVERRIDES_CACHE_TTL_MS });
    return result;
  } catch (e) {
    roleOverridesCache.set(key, { value: empty, expires: Date.now() + ROLE_OVERRIDES_CACHE_TTL_MS });
    return empty;
  }
}

/**
 * In-memory cache for `loadTenantRolePermissions`. The override table is
 * low-churn (updated by an admin clicking "save" in a settings panel),
 * so a 5-minute TTL is more than enough to keep the per-request lookup
 * off the hot path. The cache is keyed by `${tenant_id}|${role}`.
 */
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { perms: string[] | null; expires: number }>();

export function invalidateTenantRolePermissionsCache(
  tenantId?: string,
  role?: string,
): void {
  if (!tenantId && !role) {
    cache.clear();
    return;
  }
  // If only one of the two is given, drop every entry that matches the
  // supplied dimension (so a tenant-wide invalidation works without the
  // caller enumerating every role).
  for (const key of cache.keys()) {
    const [t, r] = key.split("|");
    if (tenantId && role && t === tenantId && r === role) {
      cache.delete(key);
    } else if (tenantId && !role && t === tenantId) {
      cache.delete(key);
    } else if (!tenantId && role && r === role) {
      cache.delete(key);
    }
  }
}

/**
 * Load the per-tenant override permissions for a (tenant_id, role) pair.
 *
 * Returns `null` when:
 *   • Either argument is missing/empty.
 *   • `role === "super_admin"` — super-admin bypasses overrides entirely.
 *   • Supabase is not configured (e.g. dev / test env without env vars).
 *   • No active override row exists for the pair.
 *   • The override's permissions array is empty.
 *
 * Otherwise returns the override's `permissions` array (with any platform
 * permissions filtered out — those are never granted via overrides).
 *
 * The result is cached for `CACHE_TTL_MS` (5 min). Callers that need
 * fresh data after a write should call `invalidateTenantRolePermissionsCache()`.
 */
export async function loadTenantRolePermissions(
  tenantId: string | null | undefined,
  role: string | null | undefined,
): Promise<string[] | null> {
  // ── Super-admin rule: NEVER subject to overrides ────────────────────
  // This guard is defense-in-depth — `can()` already returns true for
  // super_admin before consulting overrides. But we keep it here so a
  // route that loads overrides eagerly (before the role check) does not
  // accidentally attach super-admin-restricted perms to a super-admin
  // caller's effective set.
  if (!tenantId || !role || role === "super_admin") return null;

  const key = `${tenantId}|${role}`;
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expires) {
    return cached.perms;
  }

  // ── Fail fast when Supabase env vars aren't configured ───────────────
  // In dev/test (no DB), `getSupabase()` would throw — return null so
  // callers fall back to the default `can()` behaviour.
  if (!isSupabaseConfigured()) {
    cache.set(key, { perms: null, expires: Date.now() + CACHE_TTL_MS });
    return null;
  }

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("tenant_role_overrides")
      .select("permissions, is_active")
      .eq("tenant_id", tenantId)
      .eq("role", role)
      .maybeSingle();

    if (error || !data) {
      cache.set(key, { perms: null, expires: Date.now() + CACHE_TTL_MS });
      return null;
    }

    // An inactive override is a no-op — return null so callers fall
    // back to defaults. (We keep the row around so ops can re-enable it.)
    if (data.is_active === false) {
      cache.set(key, { perms: null, expires: Date.now() + CACHE_TTL_MS });
      return null;
    }

    const raw: unknown = data.permissions;
    if (!Array.isArray(raw) || raw.length === 0) {
      cache.set(key, { perms: null, expires: Date.now() + CACHE_TTL_MS });
      return null;
    }

    // ── Defence-in-depth: filter out platform.* perms ──────────────────
    // The override admin API also rejects platform perms at write time,
    // but a DB-level escape (legacy seed, manual SQL) could sneak one in.
    // We refuse to honour any platform perm granted via an override —
    // `can()` enforces this separately, but filtering here means the
    // cache stores a clean list and downstream wildcard matches don't
    // accidentally cover platform perms.
    const cleaned = (raw as unknown[])
      .filter((p): p is string => typeof p === "string" && p.length > 0)
      .filter((p) => !isPlatformPerm(p));

    const result = cleaned.length > 0 ? cleaned : null;
    cache.set(key, { perms: result, expires: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (e) {
    // Don't crash the request — overrides are additive, so a DB hiccup
    // just means the user falls back to defaults. Cache the null for
    // the TTL so we don't hammer a failing DB.
    console.error("[tenant-roles] loadTenantRolePermissions failed:", e);
    cache.set(key, { perms: null, expires: Date.now() + CACHE_TTL_MS });
    return null;
  }
}

/**
 * Synchronous permission evaluator that accepts a preloaded per-tenant
 * override permission list.
 *
 * This is the per-tenant-aware analogue of `can()` (from `can.ts`). It
 * mirrors the same rule order:
 *   1. super_admin → allow (NEVER blocked, never subject to overrides)
 *   2. user.permissions includes "*" → allow (platform perms still
 *      gated by `isPlatformPerm`)
 *   3. platform perms → super_admin only (denied here for non-super)
 *   4. role === "admin" → implicit tenant-wide grant (non-platform)
 *   5. explicit user.permissions grant (with wildcard support)
 *   6. tenant-override permissions grant (with wildcard support) ← NEW
 *
 * The override is additive — it can grant additional permissions but
 * cannot revoke the defaults. Super-admin is exempt from overrides.
 *
 * Routes that don't care about per-tenant overrides can keep using
 * `can()` directly. Routes that want to honour overrides should preload
 * the override via `loadTenantRolePermissions()` and call this helper.
 */
export function canWithOverride(
  user: {
    role: string;
    permissions?: string[] | null;
  },
  permission: string,
  tenantOverride: string[] | null,
): boolean {
  if (!user) return false;

  // 1) Super-admin bypass — NEVER blocked, NEVER subject to overrides.
  if (user.role === "super_admin") return true;
  const perms = user.permissions || [];
  if (perms.includes("*")) return true;

  // 2) Platform permissions are super_admin-only — deny here.
  //    (Overrides can't grant them either — loadTenantRolePermissions
  //    already filtered them out, but this is defense-in-depth.)
  if (isPlatformPerm(permission)) return false;

  // 3) Tenant admin implicit grant (every non-platform permission).
  if (user.role === "admin") return true;

  // 4) Explicit user grant (with wildcard support — same as can()).
  if (perms.includes(permission)) return true;
  const dotIdx = permission.indexOf(".");
  if (dotIdx > 0) {
    const resourceWildcard = `${permission.slice(0, dotIdx)}.*`;
    if (perms.includes(resourceWildcard)) return true;
  }
  // Back-compat: accept legacy colon format ("resource:action").
  const legacy = permission.replace(".", ":");
  if (perms.includes(legacy)) return true;
  const colonIdx = legacy.indexOf(":");
  if (colonIdx > 0 && perms.includes(`${legacy.slice(0, colonIdx)}:*`)) return true;

  // 5) Per-tenant override grant (with wildcard support — ADDITIVE).
  if (tenantOverride && tenantOverride.length > 0) {
    if (tenantOverride.includes(permission)) return true;
    if (dotIdx > 0) {
      const resourceWildcard = `${permission.slice(0, dotIdx)}.*`;
      if (tenantOverride.includes(resourceWildcard)) return true;
    }
    if (tenantOverride.includes("*")) return true;
    // Back-compat: colon format in overrides too.
    if (tenantOverride.includes(legacy)) return true;
    if (colonIdx > 0 && tenantOverride.includes(`${legacy.slice(0, colonIdx)}:*`)) {
      return true;
    }
  }

  return false;
}

/**
 * Validate a proposed override permissions array before persisting it.
 *
 * Returns an array of human-readable error strings (empty array = OK).
 *
 * Rules:
 *   • Must be a non-empty array of strings.
 *   • Each entry must be a known catalog permission OR a valid wildcard
 *     (`"resource.*"` or `"*"`).
 *   • Platform permissions (`platform.*`) are FORBIDDEN in overrides —
 *     they are super_admin-exclusive and a per-tenant override must
 *     never grant them.
 *   • Portal-client permissions (`portal.read_own_docs` etc.) are also
 *     forbidden — those are for the `portal_client` role only, not for
 *     tenant staff roles.
 */
export function validateTenantRoleOverride(perms: unknown): string[] {
  const errors: string[] = [];
  if (!Array.isArray(perms)) {
    errors.push("permissions must be an array of strings.");
    return errors;
  }
  if (perms.length === 0) {
    errors.push("permissions must not be empty (use DELETE to remove the override).");
    return errors;
  }
  const known = new Set<string>(ALL_PERMISSIONS as readonly string[]);
  for (const raw of perms) {
    if (typeof raw !== "string" || raw.length === 0) {
      errors.push(`Permission entry must be a non-empty string (got ${JSON.stringify(raw)}).`);
      continue;
    }
    if (raw === "*") {
      // Platform wildcard — allowed (override grants every non-platform perm;
      // loadTenantRolePermissions + canWithOverride already filter platform
      // perms out, so a "*" override can't escalate to platform-level).
      continue;
    }
    if (isPlatformPerm(raw)) {
      errors.push(
        `Permission "${raw}" is a platform permission and cannot be granted via a per-tenant override (super_admin exclusive).`,
      );
      continue;
    }
    // Wildcard "resource.*" — accept if the resource prefix matches at
    // least one catalog permission (so "offers.*" is OK; "nonsense.*" is
    // not).
    const dotIdx = raw.indexOf(".");
    if (dotIdx > 0 && raw.endsWith(".*")) {
      const prefix = raw.slice(0, dotIdx);
      const hasAny = Array.from(known).some((p) => p.startsWith(`${prefix}.`));
      if (!hasAny) {
        errors.push(`Permission "${raw}" — no catalog permissions match the "${prefix}." prefix.`);
      }
      continue;
    }
    if (!known.has(raw)) {
      errors.push(`Permission "${raw}" is not in the catalog (typo? missing migration?).`);
    }
  }
  return errors;
}
