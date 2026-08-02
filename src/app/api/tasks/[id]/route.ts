import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  // Tenant ownership check: listTasks returns tasks; the store ignores tenantId,
  // so we filter here for regular users.
  const allTasks = await auth.store.listTasks(auth.tenantId ?? "");
  const existing = allTasks.find((t) => t.id === id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const body = await req.json();
  // Preserve the entity's tenant_id
  const updated = await auth.store.upsertTask({ ...body, id, tenant_id: existing.tenant_id });
  await audit(auth.store, auth.user, req, "task.update", "task", id, { done: (updated as any).done });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const allTasks = await auth.store.listTasks(auth.tenantId ?? "");
  const existing = allTasks.find((t) => t.id === id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!auth.isSuperAdmin && existing.tenant_id !== auth.tenantId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await auth.store.deleteTask(id);
  await audit(auth.store, auth.user, req, "task.delete", "task", id);
  return NextResponse.json({ ok: true });
}
