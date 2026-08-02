import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!auth.isSuperAdmin && auth.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  const tid = auth.tenantId ?? "";
  const url = new URL(req.url);
  const explicitUserId = url.searchParams.get("user_id");
  // Super-admin with no explicit user_id filter sees ALL sessions system-wide.
  // Tenant admins/users default to their own sessions.
  const userId = explicitUserId ?? (auth.isSuperAdmin ? undefined : auth.user.id);
  const sessions = await auth.store.listSessions(tid, userId);
  return NextResponse.json({ items: sessions });
}
