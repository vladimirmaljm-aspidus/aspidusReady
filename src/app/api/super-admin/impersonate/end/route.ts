import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { createSession, setSessionCookie, getSessionFromCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/super-admin/impersonate/end
 * Strips the `impersonating` claim from the cookie, restoring the super_admin.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "No session." }, { status: 401 });

  if (!session.impersonating) {
    return NextResponse.json({ ok: true, note: "Not impersonating" });
  }

  const original = session.impersonating;

  // Re-mint the cookie WITHOUT the impersonating claim.
  const token = await createSession({
    sub: session.sub,
    username: session.username,
    role: session.role,
    tenant_id: session.tenant_id,
    token_version: session.token_version,
  });
  await setSessionCookie(token);

  await audit(
    auth.store,
    { id: session.sub, username: session.username, tenant_id: null },
    req,
    "super_admin.impersonate.end",
    "user",
    original.target_user_id,
    {
      target_user_id: original.target_user_id,
      target_tenant_id: original.target_tenant_id,
      original_expires_at: original.expires_at,
    },
  );

  return NextResponse.json({ ok: true });
}
