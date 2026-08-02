import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { hashPassword } from "@/lib/auth/password";
import { validatePassword } from "@/lib/auth/password-policy";

export const runtime = "nodejs";

/**
 * POST /api/portal/reset-password
 * Body: { reset_token: "xxx", password: "newpassword123" }
 *
 * Validates the reset token (from audit log), checks expiry,
 * and sets the new password on the portal access record.
 */
export async function POST(req: NextRequest) {
  try {
    const { reset_token, password } = await req.json();

    if (!reset_token || !password) {
      return NextResponse.json({ error: "Reset token and password are required." }, { status: 400 });
    }

    const validation = validatePassword(password);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
    }

    const store = await getStore();

    // Search audit logs for the reset token
    // We check all tenants (the token was stored with the tenant_id)
    const tenants = await store.listTenants();
    let foundAccess: any = null;
    let foundTenant: any = null;

    for (const t of tenants) {
      try {
        const auditLogs = await store.listAudit(t.id, { limit: 100 });
        for (const log of auditLogs.items) {
          if (log.action === "portal.password_reset_requested") {
            const details = log.details as any;
            if (details?.reset_token === reset_token) {
              // Check expiry
              if (new Date(details.expires_at) < new Date()) {
                return NextResponse.json({ error: "Reset token has expired. Please request a new one." }, { status: 400 });
              }
              foundAccess = { id: log.entity_id, email: details.email };
              foundTenant = t;
              break;
            }
          }
        }
        if (foundAccess) break;
      } catch { /* skip */ }
    }

    if (!foundAccess) {
      return NextResponse.json({ error: "Invalid reset token." }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await hashPassword(password);

    // Update the portal access record
    // Note: failed_attempts and locked_until columns may not exist yet.
    // Only update columns we know exist.
    await store.upsertPortalAccess({
      id: foundAccess.id,
      password_hash: passwordHash,
      must_set_password: false,
    });

    // Audit the password reset
    await store.appendAudit({
      tenant_id: foundTenant.id,
      user_id: null,
      username: `portal:${foundAccess.email}`,
      action: "portal.password_reset_completed",
      entity_type: "portal_access",
      entity_id: foundAccess.id,
      details: { email: foundAccess.email },
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      user_agent: req.headers.get("user-agent") || null,
    });

    return NextResponse.json({ ok: true, message: "Password reset successfully. You can now log in." });
  } catch (e: any) {
    console.error("[portal.reset-password]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
