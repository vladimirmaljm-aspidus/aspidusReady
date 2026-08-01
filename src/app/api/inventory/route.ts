import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const tid = auth.tenantId!;
  const url = new URL(req.url);
  const partner_id = url.searchParams.get("partner_id") || undefined;
  const result = await auth.store.listAllInventory(tid, { filters: { partner_id } });
  return NextResponse.json(result);
}
