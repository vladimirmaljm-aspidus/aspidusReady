import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine");
  const userId = mine ? auth.user.id : undefined;
  const tasks = await auth.store.listTasks(tid, userId);
  return NextResponse.json({ items: tasks });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.user_id) body.user_id = auth.user.id;
  const created = await auth.store.upsertTask(body);
  await audit(auth.store, auth.user, req, body.id ? "task.update" : "task.create", "task", created.id, { title: created.title });
  return NextResponse.json(created);
}
