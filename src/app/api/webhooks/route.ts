import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
  const items = await auth.store.listWebhooks(tid);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  body.tenant_id = auth.tenantId!;
  const created = await auth.store.upsertWebhook(body);
  await audit(auth.store, auth.user, req, body.id ? "webhook.update" : "webhook.create", "webhook", created.id, { name: created.name });
  return NextResponse.json(created);
}
