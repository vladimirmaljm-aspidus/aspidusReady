import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

export async function GET() {
  try {
    let needsSetup = false;
    try {
      const { getStore } = await import("@/lib/data/store");
      const store = await getStore();
      const tenants = await store.listTenants();
      if (tenants.length === 0) {
        needsSetup = true;
      } else {
        for (const t of tenants) {
          const users = await store.listUsers(t.id);
          if (users.some((u) => u.role === "admin" || u.role === "super_admin")) {
            needsSetup = false;
            break;
          }
          needsSetup = true;
        }
      }
    } catch {
      needsSetup = false;
    }
    return NextResponse.json({ needsSetup, nextStep: needsSetup ? "Call POST /api/setup to create admin user" : "Login with your credentials" });
  } catch {
    return NextResponse.json({ needsSetup: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const backend = process.env.DB_BACKEND;
    if (backend !== "supabase") {
      return NextResponse.json({ error: "Setup only available when DB_BACKEND=supabase" }, { status: 400 });
    }
    let body: Record<string, string> = {};
    try { body = await req.json(); } catch {}
    // Extra bootstrap guard: when SETUP_TOKEN is configured, require it —
    // closes the window between a fresh deploy and the first admin login
    // where this endpoint would otherwise mint a super_admin for anyone.
    if (process.env.SETUP_TOKEN && body.setup_token !== process.env.SETUP_TOKEN) {
      return NextResponse.json({ error: "Invalid setup token." }, { status: 403 });
    }
    const username = body.username || process.env.ADMIN_USERNAME;
    const password = body.password || process.env.ADMIN_PASSWORD;
    const email = body.email || process.env.ADMIN_EMAIL;
    const fullName = body.full_name || "Administrator";
    if (!username || !password) return NextResponse.json({ error: "Admin credentials are required." }, { status: 400 });
    if (!email) return NextResponse.json({ error: "Admin email is required." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    const tenantName = body.tenant_name || "VELOS Trade";
    const { getStore } = await import("@/lib/data/store");
    const store = await getStore();
    const existingTenants = await store.listTenants();

    // Setup is a one-time bootstrap: once ANY tenant has an admin/super_admin
    // user, refuse further calls. Without this, an unauthenticated attacker
    // could POST here at any time and mint a fresh super_admin account.
    for (const t of existingTenants) {
      const users = await store.listUsers(t.id);
      if (users.some((u) => u.role === "admin" || u.role === "super_admin")) {
        return NextResponse.json({ error: "Setup already completed." }, { status: 403 });
      }
    }

    let tenant = existingTenants.find((t) => t.name === tenantName);
    if (!tenant) {
      tenant = await store.upsertTenant({ name: tenantName, legal_name: tenantName, country: "RS", currency: "EUR", plan: "enterprise", status: "active", max_users: 50 });
    }
    const existingUser = await store.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ message: "Setup already completed — admin user exists", tenant_id: tenant.id, user_id: existingUser.id, username: existingUser.username });
    }
    const passwordHash = await hashPassword(password);
    const admin = await store.upsertUser({ tenant_id: tenant.id, username, email, full_name: fullName, role: "super_admin", password_hash: passwordHash, active: true, permissions: ["*"], token_version: 1 });
    try {
      const existingSettings = await store.getErpSettings(tenant.id);
      if (!existingSettings) {
        await store.upsertErpSettings({ tenant_id: tenant.id, accounting_standard: "eu", default_currency: "EUR", vat_enabled: true, vat_rate: 20, auto_post_journal: false });
      }
    } catch (e) { console.warn("[setup] Could not create ERP settings:", e); }
    return NextResponse.json({ message: "Setup completed successfully!", tenant_id: tenant.id, user_id: admin.id, username, email, login_url: "/" });
  } catch (e: unknown) {
    console.error("[setup] Error:", e);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
