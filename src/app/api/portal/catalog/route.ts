import { NextResponse } from "next/server";
import { getPortalSessionAccess } from "@/lib/auth/portal-session";
import { requireKycApproved } from "@/lib/portal/kyc-gate";
import { getStore } from "@/lib/data/store";
import { redactListForPortal } from "@/lib/portal/redact";
import type { Product, ProductCatalogEntry } from "@/lib/supabase/types";

export const runtime = "nodejs";

/**
 * Portal catalog = admin-curated view of what the tenant offers to clients.
 * Union of two sources:
 *   1) product_catalog (spec-sheet entries: HS code, specifications, images…)
 *   2) products where show_in_catalog=true AND active=true — admin opts a
 *      given inventory SKU in one product at a time.
 * Dedup key: SKU (case-insensitive) if present, else lower-case name.
 * A catalog entry wins on collision because it carries richer metadata.
 * No cost / price / margin is exposed — redactListForPortal strips it.
 */
function productToCatalogShape(p: Product): ProductCatalogEntry {
  return {
    id: p.id,
    tenant_id: (p.tenant_id ?? "") as string,
    name: p.name,
    category: p.category || "other",
    hs_code: p.hs_code ?? null,
    description: p.description,
    base_unit: p.unit || "pc",
    specifications: null,
    origin_country: null,
    images: p.image_url ? [p.image_url] : null,
    active: p.active,
    brand: p.brand ?? null,
    coa_params: p.coa_params ?? null,
    detailed_spec: p.detailed_spec ?? null,
    image_url: p.image_url ?? null,
    inventory: p.inventory ?? null,
    logistics: p.logistics ?? null,
    old_id: p.old_id ?? null,
    shelf_life: p.shelf_life ?? null,
    sku: p.sku ?? null,
    tags: p.tags ?? null,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

export async function GET() {
  const access = await getPortalSessionAccess();
  if (!access) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!access.can_view_catalog) return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  const kycBlock = await requireKycApproved(access);
  if (kycBlock) return kycBlock;

  const store = await getStore();
  const [catalogRes, productsRes] = await Promise.all([
    store.listProductCatalog(access.tenant_id, {}),
    store.listProducts(access.tenant_id, { limit: 1000 }),
  ]);

  const merged: ProductCatalogEntry[] = [...catalogRes.items];
  const seen = new Set<string>();
  for (const c of catalogRes.items) {
    const key = (c.sku && c.sku.trim()) ? `sku:${c.sku.toLowerCase()}` : `name:${c.name.toLowerCase()}`;
    seen.add(key);
  }
  for (const p of productsRes.items) {
    if (!p.active) continue;
    if (!p.show_in_catalog) continue; // admin opt-in per product
    if (p.tenant_id && p.tenant_id !== access.tenant_id) continue;
    const key = (p.sku && p.sku.trim()) ? `sku:${p.sku.toLowerCase()}` : `name:${p.name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(productToCatalogShape(p));
  }

  return NextResponse.json(redactListForPortal({ items: merged, total: merged.length }));
}
