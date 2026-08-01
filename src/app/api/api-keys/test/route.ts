import { NextRequest, NextResponse } from "next/server";
import { requireApiKeyAuth, hasPermission, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * Test API key authentication.
 * GET /api/api-keys/test — verifies the API key and returns auth context info.
 */
export async function GET(req: NextRequest) {
  const auth = await requireApiKeyAuth(req);
  if (auth instanceof NextResponse) return auth;

  const tid = resolveTenantId(auth, req);

  // Test basic data access
  let partnerCount = 0;
  let productCount = 0;
  if (tid) {
    try {
      const partners = await auth.store.listPartners(tid, { limit: 1 });
      partnerCount = partners.total;
    } catch { /* ok */ }
    try {
      const products = await auth.store.listProducts(tid, { limit: 1 });
      productCount = products.total;
    } catch { /* ok */ }
  }

  return NextResponse.json({
    authenticated: true,
    method: "api_key",
    key_name: auth.apiKeyName,
    key_id: auth.apiKeyId,
    tenant_id: auth.tenantId,
    permissions: auth.permissions,
    ip: auth.ip,
    can_read_partners: hasPermission(auth.permissions, "partners:read"),
    can_write_partners: hasPermission(auth.permissions, "partners:write"),
    can_read_offers: hasPermission(auth.permissions, "offers:read"),
    can_write_offers: hasPermission(auth.permissions, "offers:write"),
    can_read_products: hasPermission(auth.permissions, "products:read"),
    can_write_products: hasPermission(auth.permissions, "products:write"),
    data_access: {
      partner_count: partnerCount,
      product_count: productCount,
    },
  });
}
