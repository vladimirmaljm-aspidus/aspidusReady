import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  if (!auth.isSuperAdmin) {
    const owned = await auth.store.listTrustedDevices(auth.tenantId || "");
    if (!owned.some((x) => x.id === id)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
  }
  await auth.store.revokeTrustedDevice(id);
  await audit(auth.store, auth.user, req, "device.revoke", "trusted_device", id);
  return NextResponse.json({ ok: true });
}
