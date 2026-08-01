import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

// Portal password setup — first-time password after admin invite
export async function POST(req: NextRequest) {
  try {
    const { access_id, password } = await req.json();
    if (!access_id || !password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    const store = await getStore();
    const access = await store.getPortalAccessById(access_id);
    if (!access) {
      return NextResponse.json({ error: "Invalid access link." }, { status: 404 });
    }
    if (access.status !== "invited" && access.status !== "active") {
      return NextResponse.json({ error: "Account is not in setup state." }, { status: 400 });
    }
    const { isSupabaseConfigured } = await import("@/lib/supabase/client");
    const passwordHash = isSupabaseConfigured()
      ? await hashPassword(password)
      : `mock$${Buffer.from(password).toString("base64")}`;
    await store.upsertPortalAccess({
      id: access_id, password_hash: passwordHash, must_set_password: false, status: "active",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[portal.setup]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
