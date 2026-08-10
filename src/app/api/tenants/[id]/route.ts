import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, audit } from "@/lib/api/helpers";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin();
    if (auth instanceof NextResponse) return auth;
    // Permission gate (platform.tenants.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "platform.tenants.read"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    const t = await auth.store.getTenant(id);
    if (!t) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(t);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin();
    if (auth instanceof NextResponse) return auth;
  // Permission gate (platform.tenants.write)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "platform.tenants.write"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    const body = await req.json();

    // Get the old tenant to check if plan changed
    const oldTenant = await auth.store.getTenant(id);
    const oldPlan = oldTenant?.plan;
    const oldStatus = (oldTenant as any)?.status;

    const updated = await auth.store.upsertTenant({ ...body, id });

    // If the tenant just got suspended / cancelled, kill every existing
    // session for every user in that tenant right now. Bumping
    // token_version on the users invalidates their JWTs — the next request
    // they make hits requireAuth which returns 401. Without this the user
    // could stay in the app on a stale session until the cookie expires.
    const nowSuspending = body.status &&
      body.status !== oldStatus &&
      (body.status === "suspended" || body.status === "cancelled");
    if (nowSuspending) {
      try {
        const users = await auth.store.listUsers(id);
        await Promise.all(users.map((u) => auth.store.upsertUser({
          id: u.id, token_version: (u.token_version || 0) + 1,
        } as any)));
      } catch (e) { console.warn("[tenant.suspend user bump]", e); }
      // Same for portal_access rows — their token_version lives on portal_access
      try {
        const { getSupabase } = await import("@/lib/supabase/client");
        const sb = getSupabase();
        // No dedicated RPC — do it in JS.
        const { data: rows } = await sb.from("portal_access").select("id, token_version").eq("tenant_id", id);
        for (const r of (rows as { id: string; token_version: number | null }[] | null) || []) {
          await sb.from("portal_access").update({ token_version: (r.token_version || 0) + 1 }).eq("id", r.id);
        }
      } catch (e) { console.warn("[tenant.suspend portal bump]", e); }
    }

    // If plan changed to a named preset (Starter/Business/Enterprise/Trial),
    // sync feature flags to the plan template. If plan === "custom", DON'T
    // touch feature flags — the super_admin manages them by hand from the
    // Feature Flags view for that tenant.
    if (body.plan && body.plan !== oldPlan && body.plan !== "custom") {
      try {
        let plan: any = null;
        if (isSupabaseConfigured()) {
          const sb = getSupabase();
          const planName = body.plan.charAt(0).toUpperCase() + body.plan.slice(1);
          const { data } = await sb.from("plans").select("*").eq("name", planName).maybeSingle();
          plan = data;
        }

        if (plan) {
          const includedModules = (() => {
            try { return JSON.parse(plan.included_modules || "[]"); } catch { return []; }
          })();

          await auth.store.upsertFeatureFlags({
            tenant_id: id,
            max_users: plan.max_users,
            max_partners: plan.max_partners,
            max_monthly_documents: plan.max_monthly_documents,
            module_crm: includedModules.includes("crm"),
            module_finance: includedModules.includes("finance"),
            module_trade: includedModules.includes("trade"),
            module_portal: includedModules.includes("portal"),
            module_document_templates: includedModules.includes("documents"),
            module_document_verification: includedModules.includes("documents"),
            module_security: includedModules.includes("security"),
            module_vault: includedModules.includes("security"),
            module_api_keys: includedModules.includes("security"),
            module_webhooks: includedModules.includes("security"),
            module_mail_queue: includedModules.includes("communications"),
            module_kyc: includedModules.includes("portal"),
            module_inventory: includedModules.includes("trade"),
            updated_by: auth.user.id,
          } as any);

          if (plan.max_users && (!body.max_users || body.max_users !== plan.max_users)) {
            await auth.store.upsertTenant({ id, max_users: plan.max_users } as any);
          }
        }
      } catch (e) {
        console.error("[tenants.update] Feature flags update failed:", e);
      }

      // Invalidate the in-memory feature-flag cache so the tenant's admin sees
      // the new plan's modules on their next API hit (no need to log out).
      try {
        const { invalidateFeatureCache } = await import("@/lib/api/feature-guard");
        invalidateFeatureCache(id);
      } catch { /* non-critical */ }
    }

    // If the super_admin bumped trial_days for a tenant that's still on
    // trial, re-anchor trial_ends_at to today + new N days. Otherwise leave
    // trial_ends_at alone (super_admin can set an explicit date instead).
    if (body.trial_days !== undefined && (String(updated.status) === "trial" || String(updated.plan) === "trial")) {
      const days = Number(body.trial_days);
      if (days > 0 && body.trial_ends_at === undefined) {
        const end = new Date();
        end.setDate(end.getDate() + days);
        await auth.store.upsertTenant({ id, trial_ends_at: end.toISOString() } as any);
      }
    }

    await audit(auth.store, auth.user, req, "tenant.update", "tenant", id, { name: updated.name, plan: body.plan });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin();
    if (auth instanceof NextResponse) return auth;
  // Permission gate (platform.tenants.delete)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "platform.tenants.delete"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    await auth.store.deleteTenant(id);
    await audit(auth.store, auth.user, req, "tenant.delete", "tenant", id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
