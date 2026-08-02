import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const tid = resolveTenantId(auth, req) ?? "";
  const url = new URL(req.url);
  const explicitUserId = url.searchParams.get("user_id");
  // Super-admin with no explicit user_id filter sees ALL login history system-wide.
  // Tenant admins/users default to their own history.
  const userId = explicitUserId ?? (auth.isSuperAdmin ? undefined : auth.user.id);
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 50;
  const items = await auth.store.listLoginHistory(tid, userId, limit);
  return NextResponse.json({ items });
}
