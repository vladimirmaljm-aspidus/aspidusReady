import { NextRequest, NextResponse } from "next/server";
import { requireAuthOrApiKey, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuthOrApiKey(req);
  if (auth instanceof NextResponse) return auth;
    // Permission gate (dashboard.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      if (!("apiKeyId" in auth)) { const _d = requirePermission(auth, "dashboard.read"); if (_d) return _d; } } /* requirePermission wired */

  const tid = resolveTenantId(auth, req);
  try {
    const insights = await auth.store.getInsights(tid ?? undefined);
    return NextResponse.json(insights);
  } catch (e) {
    console.error("[dashboard]", e);
    return NextResponse.json({ error: "Error loading." }, { status: 500 });
  }
}
