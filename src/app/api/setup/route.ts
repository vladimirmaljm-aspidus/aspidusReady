import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

/**
 * GET /api/setup — check if setup is needed
 * POST /api/setup — create initial tenant + admin user
 */
export async function GET() {
  try {
    const backend = process.env.DB_BACKEND;
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const hasSecretKey = Boolean(process.env.SECRET_KEY);

    const urlFormatOk = supabaseUrl.startsWith("https://");

    // Try to connect to DB
    let dbOk = false;
    let dbError = "";
    let hasAdmin = false;

    if (backend === "supabase" && supabaseUrl && supabaseKey && urlFormatOk) {
      try {
        const { getStore } = await import("@/lib/data/store");
        const store = await getStore();
        const tenants = await store.listTenants();
        dbOk = true;
        const users = await store.listUsers(tenants[0]?.id || "");
        hasAdmin = users.some((u) => u.role === "admin" || u.role === "super_admin");
      } catch (e: unknown) {
        dbError = e instanceof Error ? e.message : "Unknown DB error";
      }
    }

    return NextResponse.json({
      status: dbOk ? "connected" : "not_connected",
      backend,
      supabase: {
        url_set: Boolean(supabaseUrl),
        url_format_ok: urlFormatOk,
        key_set: Boolean(supabaseKey),
      },
      secretKey: hasSecretKey,
      dbConnection: dbOk ? "ok" : dbError || "not_configured",
      hasAdmin,
      nextStep: hasAdmin
        ? "Login with your admin credentials"
        : dbOk
        ? "Call POST /api/setup to create admin user"
        : "Fix Supabase connection first",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

/**
 * POST /api/setup — seeds the database with the initial tenant + admin user.
 * Called once after deployment — idempotent (won't overwrite existing data).
 */
export async function POST(req: NextRequest) {
  try {
    const backend = process.env.DB_BACKEND;
    if (backend !== "supabase") {
      return NextResponse.json(
        { error: "Setup only available when DB_BACKEND=supabase" },
        { status: 400 }
      );
    }

    let body: Record<string, string> = {};
    try {
      body = await req.json();
    } catch {
      // empty body is ok — use defaults
    }

    const username = body.username || process.env.ADMIN_USERNAME;
    const password = body.password || process.env.ADMIN_PASSWORD;
    const email = body.email || process.env.ADMIN_EMAIL;
    const fullName = body.full_name || "Administrator";

    if (!username || !password) {
      return NextResponse.json(
        { error: "ADMIN_USERNAME and ADMIN_PASSWORD are REQUIRED. Set them as environment variables or pass them in the request body. Do NOT deploy without custom admin credentials." },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL is REQUIRED. Set it as an environment variable or pass it in the request body." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    const tenantName = body.tenant_name || "Aspidus Trade";

    const { getStore } = await import("@/lib/data/store");
    const store = await getStore();

    // ── 1. Create default tenant ──
    const existingTenants = await store.listTenants();
    let tenant = existingTenants.find((t) => t.name === tenantName);

    if (!tenant) {
      tenant = await store.upsertTenant({
        name: tenantName,
        legal_name: tenantName,
        country: "RS",
        currency: "EUR",
        plan: "enterprise",
        status: "active",
        max_users: 50,
      });
      console.log("[setup] Created tenant:", tenant.id);
    } else {
      console.log("[setup] Tenant already exists:", tenant.id);
    }

    // ── 2. Create admin user ──
    const existingUser = await store.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({
        message: "Setup already completed — admin user exists",
        tenant_id: tenant.id,
        user_id: existingUser.id,
        username: existingUser.username,
      });
    }

    const passwordHash = await hashPassword(password);
    const admin = await store.upsertUser({
      tenant_id: tenant.id,
      username,
      email,
      full_name: fullName,
      role: "super_admin",
      password_hash: passwordHash,
      active: true,
      permissions: ["*"],
      token_version: 1,
    });

    console.log("[setup] Created admin user:", admin.id);

    // ── 3. Create default ERP settings ──
    try {
      const existingSettings = await store.getErpSettings(tenant.id);
      if (!existingSettings) {
        await store.upsertErpSettings({
          tenant_id: tenant.id,
          accounting_standard: "eu",
          default_currency: "EUR",
          vat_enabled: true,
          vat_rate: 20,
          auto_post_journal: false,
        });
        console.log("[setup] Created ERP settings");
      }
    } catch (e) {
      console.warn("[setup] Could not create ERP settings:", e);
    }

    return NextResponse.json({
      message: "Setup completed successfully!",
      tenant_id: tenant.id,
      user_id: admin.id,
      username,
      email,
      login_url: "/",
    });
  } catch (e: unknown) {
    console.error("[setup] Error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Setup failed", details: message },
      { status: 500 }
    );
  }
}
