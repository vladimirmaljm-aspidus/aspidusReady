import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const body = await req.json();
  const updated = await auth.store.upsertTask({ ...body, id });
  await audit(auth.store, auth.user, req, "task.update", "task", id, { done: updated.done });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await auth.store.deleteTask(id);
  await audit(auth.store, auth.user, req, "task.delete", "task", id);
  return NextResponse.json({ ok: true });
}
