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
  // Super-admin with no explicit user_id filter sees ALL trusted devices system-wide.
  // Tenant admins/users default to their own devices.
  const userId = explicitUserId ?? (auth.isSuperAdmin ? undefined : auth.user.id);
  const items = await auth.store.listTrustedDevices(tid, userId);
  return NextResponse.json({ items });
}
