import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await auth.store.revokeTrustedDevice(id);
  await audit(auth.store, auth.user, req, "device.revoke", "trusted_device", id);
  return NextResponse.json({ ok: true });
}
