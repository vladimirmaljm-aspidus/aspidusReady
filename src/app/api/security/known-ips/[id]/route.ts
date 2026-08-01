import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const body = await req.json();
  await auth.store.trustIp(id, !!body.trusted);
  await audit(auth.store, auth.user, req, "ip.trust", "known_ip", id, { trusted: body.trusted });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await auth.store.forgetIp(id);
  await audit(auth.store, auth.user, req, "ip.forget", "known_ip", id);
  return NextResponse.json({ ok: true });
}
