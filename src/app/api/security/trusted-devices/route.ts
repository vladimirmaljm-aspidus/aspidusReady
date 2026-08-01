import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id") || auth.user.id;
  const items = await auth.store.listTrustedDevices(tid, userId);
  return NextResponse.json({ items });
}
