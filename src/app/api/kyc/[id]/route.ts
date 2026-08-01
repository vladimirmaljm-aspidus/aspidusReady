import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  const sub = await auth.store.getKycSubmission(id);
  if (!sub) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(sub);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const updated = await auth.store.upsertKycSubmission({ ...body, id });
  await audit(auth.store, auth.user, req, "kyc.update", "kyc_submission", id, { status: updated.status });
  return NextResponse.json(updated);
}
