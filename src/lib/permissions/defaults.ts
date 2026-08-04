/**
 * Default permission grants per role.
 *
 *   super_admin  → ["*"]                         (bypass, always allowed)
 *   admin        → ALL tenant-scoped perms       (implicit within their tenant)
 *   user         → []                            (explicit grants only — matches DB migration)
 *   portal_client → portal-scoped subset         (portal.read_own_docs, …)
 *
 * NOTE: The `admin` implicit-grant is enforced in `can.ts`, not by copying the
 * full array into the DB. This keeps `users.permissions` clean and lets admins
 * pick up new resources automatically as the catalog grows.
 */

import { PORTAL_CLIENT_PERMISSIONS, TENANT_PERMISSIONS } from "./catalog";

export const ROLE_DEFAULT_PERMISSIONS: Record<string, readonly string[]> = {
  super_admin: ["*"],
  // admin's true grants are computed dynamically in can(); this literal is a
  // convenience for callers that need to enumerate what admin *can* do
  // (e.g. UI listings, seeding scripts).
  admin: TENANT_PERMISSIONS,
  user: [],
  portal_client: PORTAL_CLIENT_PERMISSIONS,
};

/** Returns the literal default array for the given role, or [] if unknown. */
export function defaultPermissionsForRole(role: string): readonly string[] {
  return ROLE_DEFAULT_PERMISSIONS[role] ?? [];
}
