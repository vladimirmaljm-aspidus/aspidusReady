import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const insights = await auth.store.getInsights();
    return NextResponse.json(insights);
  } catch (e) {
    console.error("[dashboard]", e);
    return NextResponse.json({ error: "Error loading." }, { status: 500 });
  }
}
