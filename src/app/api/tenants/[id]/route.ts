import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, audit } from "@/lib/api/helpers";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSuperAdmin(_req);
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
    const auth = await requireSuperAdmin(req);
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
    const auth = await requireSuperAdmin(req);
    if (auth instanceof NextResponse) return auth;
  // Permission gate (platform.tenants.delete)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "platform.tenants.delete"); if (_d) return _d; } /* requirePermission wired */

    const { id } = await params;
    const existing = await auth.store.getTenant(id);
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    // The DELETE body is OPTIONAL — callers may send an empty body, a JSON
    // body with `{ confirm: true }` to hard-delete despite existing
    // dependent rows, or `{ soft: true }` to flip the tenant's status to
    // `cancelled` instead of deleting anything. `req.json()` throws on an
    // empty body, hence the try/catch fallback to an empty object.
    let body: { confirm?: boolean; soft?: boolean } = {};
    try { body = await req.json(); } catch { /* empty body — treat as default */ }

    // ── P0 / task C-1 — orphan prevention gate ────────────────────────────
    // The live DB has very few FK CASCADE constraints (migration 021
    // comment). A naive `DELETE FROM tenants WHERE id=?` orphans every
    // dependent row (users, offers, invoices, audit_logs, …) which then
    // dangles forever. We refuse the hard-delete unless the caller
    // explicitly confirms they understand the cascade, OR they ask for a
    // soft-delete instead (status → cancelled, no data loss).
    const deps = await auth.store.countTenantDependencies(id);

    if (deps.total > 0 && !body.confirm) {
      return NextResponse.json({
        error: "Tenant has existing data. Pass confirm=true to hard delete, or soft=true for soft delete.",
        dependencies: deps,
      }, { status: 409 });
    }

    // Soft-delete: keep all data, flip status to `cancelled`. Reversible
    // by a subsequent PUT to status=active. The tenant's users keep their
    // sessions until the next request (the session-invalidation on status
    // change happens in PUT, not here — soft-delete is meant to be a
    // "deactivate" rather than a true delete).
    if (body.soft) {
      await auth.store.upsertTenant({ id, status: "cancelled" });
      await audit(auth.store, auth.user, req, "tenant.soft_delete", "tenant", id, { name: existing.name });
      return NextResponse.json({ ok: true, mode: "soft" });
    }

    // Hard-delete: walk every tenant-scoped table in dependency order and
    // DELETE the rows, then DELETE the tenant row last. The dependency
    // snapshot is captured in the audit entry so the audit trail records
    // what was destroyed (the rows themselves go away). Note: append-only
    // audit_logs rows that belong to this tenant are NOT cascade-deleted
    // here (the trigger from migration 010 blocks DELETE); for tenant PII
    // in audit_logs, run `anonymize_user_audit_logs` per user first.
    await audit(auth.store, auth.user, req, "tenant.delete", "tenant", id, {
      name: existing.name,
      dependencies: deps,
    });
    await auth.store.deleteTenantCascade(id);
    return NextResponse.json({ ok: true, mode: "hard", deleted: deps });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
