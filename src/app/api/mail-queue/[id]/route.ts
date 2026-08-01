import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await auth.store.deleteMailQueueEntry(id);
  await audit(auth.store, auth.user, req, "mail.delete", "mail_queue", id);
  return NextResponse.json({ ok: true });
}
