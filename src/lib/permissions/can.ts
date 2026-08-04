/**
 * Server-side permission evaluator.
 *
 * The single source of truth for "can this user do X?".
 *
 * Rules (evaluated top-down; first match wins):
 *   1. Super-admin (role === "super_admin" OR permissions includes "*") → allow
 *   2. Platform permission (`platform.*`)                                → super-admin only (already handled by rule 1; anyone else → deny)
 *   3. Role === "admin"                                                  → allow ANY non-platform permission (implicit tenant-wide grant)
 *   4. Explicit grant in user.permissions                                → allow (supports wildcards: `partners.*`, `erp.*`)
 *   5. Otherwise                                                         → deny
 *
 * Wildcards recognised in the user's permissions array:
 *   - "*"                      → grants everything
 *   - "resource.*"             → grants every action on the resource
 *   - "resource.action"        → grants exactly that action
 *
 * Note about the legacy `foo:bar` (colon) format that the API-key layer uses:
 * this evaluator is for HUMAN users only. API-key permissions still use the
 * colon format and are checked by `hasPermission()` in `@/lib/api/helpers`.
 */

import { NextResponse } from "next/server";
import type { AuthContext, ApiKeyAuthContext } from "@/lib/api/helpers";
import { isPlatformPerm } from "./catalog";

export interface PermissionSubject {
  role: string;
  permissions?: string[] | null;
}

export function can(user: PermissionSubject | null | undefined, permission: string): boolean {
  if (!user) return false;

  // 1) Super-admin bypass
  if (user.role === "super_admin") return true;
  const perms = user.permissions || [];
  if (perms.includes("*")) return true;

  // 2) Platform permissions require super-admin (already denied above)
  if (isPlatformPerm(permission)) return false;

  // 3) Tenant admin has implicit access to every non-platform permission
  if (user.role === "admin") return true;

  // 4) Explicit grants (with wildcard support)
  if (perms.includes(permission)) return true;
  const dotIdx = permission.indexOf(".");
  if (dotIdx > 0) {
    const resourceWildcard = `${permission.slice(0, dotIdx)}.*`;
    if (perms.includes(resourceWildcard)) return true;
  }
  // Back-compat: also accept legacy "resource:*" and "resource:action" that
  // may still live in some seed data.
  const legacy = permission.replace(".", ":");
  if (perms.includes(legacy)) return true;
  const colonIdx = legacy.indexOf(":");
  if (colonIdx > 0 && perms.includes(`${legacy.slice(0, colonIdx)}:*`)) return true;

  return false;
}

/**
 * Route guard. Returns a NextResponse (403) when the auth context lacks the
 * permission, or `null` when the caller may proceed.
 *
 * Usage:
 *   const auth = await requireAuth();
 *   if (auth instanceof NextResponse) return auth;
 *   const denied = requirePermission(auth, "partners.read");
 *   if (denied) return denied;
 */
export function requirePermission(
  auth: AuthContext,
  permission: string
): NextResponse | null {
  if (can(auth.user, permission)) return null;
  return NextResponse.json(
    {
      error: "Insufficient permissions.",
      required_permission: permission,
    },
    { status: 403 }
  );
}

/** Convenience: returns true iff the auth context can do `permission`. */
export function authCan(auth: AuthContext, permission: string): boolean {
  return can(auth.user, permission);
}
