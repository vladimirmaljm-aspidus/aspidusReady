import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (mail-queue.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "mail-queue.read"); if (_d) return _d; } /* requirePermission wired */

  const tid = auth.tenantId!;
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const result = await auth.store.listMailQueue(tid, { search, filters: { status } });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  // Permission gate (mail-queue.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "mail-queue.create"); if (_d) return _d; } /* requirePermission wired */

  const body = await req.json();
  body.tenant_id = auth.tenantId!;
  const created = await auth.store.upsertMailQueueEntry(body);
  await audit(auth.store, auth.user, req, body.id ? "mail.update" : "mail.queue", "mail_queue", created.id, { subject: created.subject });
  return NextResponse.json(created);
}
