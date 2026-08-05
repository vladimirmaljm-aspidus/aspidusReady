import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireSuperAdmin, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Super-admin sees all tenants; regular admin sees only their own tenant.
    // No platform.* gate — non-super-admins are already limited to their own
    // tenant below, and many client views (impersonation banner, tenant
    // switcher, portal-uploads folder headers) need this endpoint to work
    // for any signed-in user.
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (auth.isSuperAdmin) {
      const tenants = await auth.store.listTenants();
      return NextResponse.json({ items: tenants });
    }
    // Regular admin/user: return only their own tenant
    if (auth.tenantId) {
      const tenant = await auth.store.getTenant(auth.tenantId);
      return NextResponse.json({ items: tenant ? [tenant] : [] });
    }
    return NextResponse.json({ items: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (auth instanceof NextResponse) return auth;
    // Permission gate (platform.tenants.create)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "platform.tenants.create"); if (_d) return _d; } /* requirePermission wired */

    const body = await req.json();
    const created = await auth.store.upsertTenant(body);
    await audit(auth.store, auth.user, req, body.id ? "tenant.update" : "tenant.create", "tenant", created.id, { name: created.name });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
