import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

// Global settings (SMTP/API credentials, etc.) are not tenant-scoped and can
// contain secrets — restricted to admin/super_admin, not every authenticated user.
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (key) {
      const value = await auth.store.getSetting(key);
      return NextResponse.json({ key, value });
    }
    const all = await auth.store.getAllSettings();
    return NextResponse.json({ items: all });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;
    const body = await req.json();
    const { key, value } = body;
    if (!key) return NextResponse.json({ error: "Missing key." }, { status: 400 });
    await auth.store.setSetting(key, value);
    await audit(auth.store, auth.user, req, "settings.update", "settings", key, { key });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
