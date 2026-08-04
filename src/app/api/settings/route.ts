import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, audit, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * Tenant settings (SMTP config, security policy, misc per-tenant options).
 *
 * Scoping:
 *   - Tenant admin → sees ONLY their own tenant's settings.
 *   - Super admin without ?tenant_id  → sees platform-level settings (tenant_id NULL).
 *   - Super admin with ?tenant_id=X   → sees that tenant's settings.
 *
 * Secrets: SMTP passwords, API tokens etc. live under `key = "comms"` and are
 * returned to admins for editing. Never expose this endpoint to non-admins.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    // Permission gate (settings.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "settings.read"); if (_d) return _d; } /* requirePermission wired */


    // Determine scope
    let tenantId: string | null;
    if (auth.isSuperAdmin) {
      const url = new URL(req.url);
      const q = url.searchParams.get("tenant_id");
      tenantId = q && q !== "null" ? q : null; // super admin default = platform
    } else {
      tenantId = auth.tenantId; // regular admins locked to their tenant
      if (!tenantId) return NextResponse.json({ items: [] });
    }

    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (key) {
      const value = await auth.store.getSetting(key, tenantId);
      return NextResponse.json({ key, value, tenant_id: tenantId });
    }
    const all = await auth.store.getAllSettings(tenantId);
    return NextResponse.json({ items: all });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    let tenantId: string | null;
    if (auth.isSuperAdmin) {
      const url = new URL(req.url);
      const q = url.searchParams.get("tenant_id");
      tenantId = q && q !== "null" ? q : null;
    } else {
      tenantId = auth.tenantId;
      if (!tenantId) {
        return NextResponse.json({ error: "No tenant context." }, { status: 400 });
      }
    }

    const body = await req.json();
    const { key, value } = body;
    if (!key) return NextResponse.json({ error: "Missing key." }, { status: 400 });

    await auth.store.setSetting(key, value, tenantId);
    await audit(auth.store, auth.user, req, "settings.update", "settings", key, {
      key,
      scope: tenantId ? "tenant" : "platform",
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
