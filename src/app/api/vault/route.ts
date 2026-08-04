import { NextRequest, NextResponse } from "next/server";
import { requireAuth, audit } from "@/lib/api/helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (vault.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "vault.read"); if (_d) return _d; } /* requirePermission wired */

  const tid = auth.tenantId!;
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const result = await auth.store.listVault(tid, { search, filters: { category } });
  // Tenant isolation: PrismaStore.listVault ignores _tenantId, so we
  // post-filter for non-super_admin.
  if (!auth.isSuperAdmin && auth.tenantId) {
    result.items = result.items.filter((s) => s.tenant_id === auth.tenantId);
    result.total = result.items.length;
  }
  // strip encrypted_value from list response (only reveal on explicit get)
  return NextResponse.json({ items: result.items.map(({ encrypted_value, ...s }) => s), total: result.total });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  // Permission gate (vault.create)
  { const { requirePermission } = await import("@/lib/permissions/can");
    const _d = requirePermission(auth, "vault.create"); if (_d) return _d; } /* requirePermission wired */

  const body = await req.json();
  body.tenant_id = auth.tenantId!;
  const created = await auth.store.upsertVaultSecret(body);
  await audit(auth.store, auth.user, req, body.id ? "vault.update" : "vault.create", "vault_secret", created.id, { key: created.key });
  const { encrypted_value, ...safe } = created;
  return NextResponse.json(safe);
}
