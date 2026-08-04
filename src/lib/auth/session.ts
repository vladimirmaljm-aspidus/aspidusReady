import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "crm_session";
const SESSION_TTL_DAYS = 7;

export interface ImpersonationClaim {
  original_super_admin_id: string;
  original_username: string;
  target_user_id: string;
  target_tenant_id: string | null;
  expires_at: string; // ISO
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
