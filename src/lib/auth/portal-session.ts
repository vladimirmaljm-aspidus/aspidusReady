import { getSessionFromCookie } from "@/lib/auth/session";
import { getStore } from "@/lib/data/store";
import type { PortalAccess } from "@/lib/supabase/types";

/**
 * Server-side helper that reads the portal session cookie and returns the
 * active PortalAccess row (or null when not signed in / signed in as admin).
 *
 * Centralised so every portal API route can use the same lookup + same
 * status checks (active, not locked) without duplicating the logic.
 */
export async function getPortalSessionAccess(): Promise<PortalAccess | null> {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "portal_client") return null;
  if (!session.sub?.startsWith("portal:")) return null;

  const accessId = session.sub.slice("portal:".length);
  const store = await getStore();
  const access = await store.getPortalAccessById(accessId);
  if (!access) return null;
  if (access.status !== "active") return null;
  // Note: token_version and locked_until are no longer in the DB schema;
  // session validation is handled by the session cookie itself.
  return access;
}
