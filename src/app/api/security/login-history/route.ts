import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id") || auth.user.id;
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 50;
  const items = await auth.store.listLoginHistory(tid, userId, limit);
  return NextResponse.json({ items });
}
