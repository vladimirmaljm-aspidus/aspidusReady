import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { hashPassword } from "@/lib/auth/password";
import { validatePassword } from "@/lib/auth/password-policy";

export const runtime = "nodejs";

// Portal password setup — first-time password after admin invite
export async function POST(req: NextRequest) {
  try {
    const { access_id, password } = await req.json();
    if (!access_id || !password) {
      return NextResponse.json({ error: "Access ID and password are required." }, { status: 400 });
    }

    const validation = validatePassword(password);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
    }

    const store = await getStore();
    const access = await store.getPortalAccessById(access_id);
    if (!access) {
      return NextResponse.json({ error: "Invalid access link." }, { status: 404 });
    }
    if (access.status !== "invited" && access.status !== "active" && access.status !== "approved") {
      return NextResponse.json({ error: "Account is not in setup state." }, { status: 400 });
    }
    const passwordHash = await hashPassword(password);
    await store.upsertPortalAccess({
      id: access_id, password_hash: passwordHash, must_set_password: false, status: "active",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[portal.setup]", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
