import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getStore } from "@/lib/data/store";

const COOKIE_NAME = "crm_session";
const SESSION_TTL_DAYS = 7;

export interface ImpersonationClaim {
  original_super_admin_id: string;
  original_username: string;
  target_user_id: string;
  target_tenant_id: string | null;
  expires_at: string; // ISO
  /**
   * Snapshot of `users.token_version` for the impersonation target at the
   * time the claim was minted. P1 ghost-JWT hardening (task C-5 Fix 6):
   * if the target's password is reset (or their token_version is bumped
   * for any other reason) while a super_admin is impersonating them, the
   * next request will detect the mismatch and revoke the impersonation.
   * Without this snapshot, the super_admin's own JWT (which carries the
   * super_admin's token_version, NOT the target's) would keep working
   * for up to MAX_DURATION_MIN minutes after the target was supposed to
   * be revoked — a narrow but real ghost-JWT window for the target user.
   *
   * Optional for backward compatibility — sessions issued before this
   * field was added simply omit it, and `requireAuth` falls back to the
   * expiry-only check for those.
   */
  target_token_version?: number;
}

export interface SessionPayload {
  sub: string;
  username: string;
  role: string;
  token_version: number;
  tenant_id: string | null;
  /** Optional impersonation context — present only while a super_admin is acting as another user. */
  impersonating?: ImpersonationClaim;
  iat?: number;
  exp?: number;
}

function getSecret(): Uint8Array {
  const s = process.env.SECRET_KEY;
  if (!s || s.length < 32) {
    throw new Error(
      "SECRET_KEY environment variable is required in every environment and must be at least 32 characters. " +
      "Generate one with: openssl rand -hex 32"
    );
  }
  return new TextEncoder().encode(s);
}

export async function createSession(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(getSecret());
  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

// ─────────────────────────────────────────────────────────────────────────────
// Session security helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maximum number of concurrent active sessions a single user may hold.
 * Enforced by `enforceConcurrentSessionLimit` below on every successful
 * login — oldest session is revoked (LRU) when the limit is exceeded.
 *
 * 5 is generous enough that a user with a phone, laptop, tablet, and two
 * browser profiles never hits it, but tight enough that a stolen-cookie
 * farm can't accumulate hundreds of sessions.
 */
export const MAX_CONCURRENT_SESSIONS = 5;

/**
 * Revoke every active session for a user.
 *
 * Called after a password change (admin reset OR user self-change) so that
 * any session cookies issued before the change — including ones on lost or
 * stolen devices — stop being accepted on their very next request.
 *
 * The JWT layer's `token_version` check already short-circuits revoked
 * sessions at the auth layer (`requireAuth`); this function performs the
 * matching DB-side cleanup so the admin "Sessions" panel reflects reality
 * and revocation survives across server restarts (JWT validation alone
 * can't, because the JWT is stateless).
 *
 * Failures are logged but never thrown — a password change must succeed even
 * if the sessions table is briefly unreachable.
 */
export async function rotateUserSessions(userId: string, tenantId: string | null): Promise<void> {
  if (!tenantId) {
    // Platform-level (super_admin) accounts have no tenant_id and the
    // sessions table has a NOT NULL constraint on tenant_id — there's
    // nothing to revoke. Their token_version is still bumped by callers
    // for the JWT-side invalidation.
    return;
  }
  try {
    const store = await getStore();
    const sessions = await store.listSessions(tenantId, userId);
    const active = sessions.filter((s) => !s.revoked);
    if (active.length === 0) return;
    // Revoke in parallel — best-effort, individual failures don't abort the rest.
    await Promise.all(
      active.map((s) =>
        store.revokeSession(s.id).catch((e) => {
          console.error("[rotateUserSessions] revokeSession failed for", s.id, e);
        })
      )
    );
  } catch (e) {
    console.error("[rotateUserSessions] failed for", userId, e);
  }
}

/**
 * Enforce the concurrent-session limit by revoking the OLDEST active sessions
 * that exceed the cap.
 *
 * CRITICAL FIX (audit P2-11): this MUST be called AFTER the new session row
 * has been created (not before). The previous "read-then-revoke-before-create"
 * flow had a race: two concurrent logins could both observe `count < max`
 * (stale read before either creates), then both create sessions, leaving the
 * user with `max + 1` active sessions. By running the cleanup AFTER the new
 * session exists, the new session is included in the count — if the total
 * exceeds `max`, the oldest (NOT the just-created one) is revoked.
 *
 * Idempotent + safe to call on every login: if the user is at or under the
 * limit, this is a no-op.
 */
export async function enforceConcurrentSessionLimit(
  userId: string,
  tenantId: string,
  max: number = MAX_CONCURRENT_SESSIONS
): Promise<void> {
  try {
    const store = await getStore();
    const sessions = await store.listSessions(tenantId, userId);
    // Only consider sessions that are BOTH unrevoked AND not yet expired —
    // expired rows are cleaned up by a separate cron and shouldn't count
    // against the limit (otherwise we'd evict live sessions to make room
    // for already-dead ones).
    const active = sessions
      .filter((s) => !s.revoked && new Date(s.expires_at) > new Date())
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    // If we're over the limit, revoke the OLDEST session(s) — `active` is
    // sorted oldest-first, so `slice(0, active.length - max)` yields exactly
    // the surplus. The just-created session is at the END of the array
    // (newest) and is never revoked.
    if (active.length > max) {
      const toRevoke = active.slice(0, active.length - max);
      for (const s of toRevoke) {
        try {
          await store.revokeSession(s.id);
        } catch (e) {
          console.error("[enforceConcurrentSessionLimit] revokeSession failed:", e);
        }
      }
    }
  } catch (e) {
    console.error("[enforceConcurrentSessionLimit] failed for", userId, e);
  }
}
