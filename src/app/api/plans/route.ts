import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    // Permission gate (platform.plans.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "platform.plans.read"); if (_d) return _d; } /* requirePermission wired */


    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      const { data, error } = await sb.from("plans").select("*").eq("is_active", true).order("sort_order", { ascending: true });
      if (error) throw error;
      return NextResponse.json({ items: data || [] });
    }
    const plans = await db.plan.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } });
    return NextResponse.json({ items: plans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    if (!auth.isSuperAdmin) return NextResponse.json({ error: "Super-admin access required." }, { status: 403 });
    const body = await req.json();
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      const { data, error } = await sb.from("plans").insert(body).select().single();
      if (error) throw error;
      await audit(auth.store, auth.user, req, "plan.create", "plan", data.id, { name: data.name });
      return NextResponse.json(data);
    }
    const created = await db.plan.create({ data: body });
    await audit(auth.store, auth.user, req, "plan.create", "plan", created.id, { name: created.name });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
