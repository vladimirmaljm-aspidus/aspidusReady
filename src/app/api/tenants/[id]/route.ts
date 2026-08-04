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
    const { id } = await params;
    const body = await req.json();

    // Get the old tenant to check if plan changed
    const oldTenant = await auth.store.getTenant(id);
    const oldPlan = oldTenant?.plan;

    const updated = await auth.store.upsertTenant({ ...body, id });

    // If plan changed, update feature flags to match new plan
    if (body.plan && body.plan !== oldPlan) {
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
    const { id } = await params;
    await auth.store.deleteTenant(id);
    await audit(auth.store, auth.user, req, "tenant.delete", "tenant", id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
