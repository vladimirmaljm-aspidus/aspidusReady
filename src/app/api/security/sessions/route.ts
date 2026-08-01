import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id") || auth.user.id;
  const sessions = await auth.store.listSessions(tid, userId);
  return NextResponse.json({ items: sessions });
}
