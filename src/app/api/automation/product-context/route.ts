import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId } from "@/lib/api/helpers";
import type { Product, ProductCatalogEntry } from "@/lib/supabase/types";

export const runtime = "nodejs";

/**
 * GET /api/automation/product-context?product_id=xxx&tenant_id=xxx
 * GET /api/automation/product-context?catalog_entry_id=xxx&tenant_id=xxx
 *
 * When a product is selected, return ALL related data in one response.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (dashboard.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "dashboard.read"); if (_d) return _d; } /* requirePermission wired */


  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ items: [], total: 0 });

  const url = new URL(req.url);
  const productId = url.searchParams.get("product_id");
  const catalogEntryId = url.searchParams.get("catalog_entry_id");

  if (!productId && !catalogEntryId) {
    return NextResponse.json(
      { error: "product_id or catalog_entry_id is required." },
      { status: 400 }
    );
  }

  try {
    const store = auth.store;
    let product: Product | null = null;
    let catalogEntry: ProductCatalogEntry | null = null;

    // 1. Product details
    if (productId) {
      product = await store.getProduct(productId);
      if (!product) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }
    }

    // 2. Product catalog entry details
    if (catalogEntryId) {
      catalogEntry = await store.getProductCatalogEntry(catalogEntryId);
      if (!catalogEntry) {
        return NextResponse.json({ error: "Catalog entry not found." }, { status: 404 });
      }
      if (catalogEntry.tenant_id !== tenantId) {
        return NextResponse.json({ error: "Catalog entry not found." }, { status: 404 });
      }
    } else if (product) {
      // Fallback: match a catalog spec-sheet entry to the selected product by
      // SKU (case-insensitive) or by exact name. Catalog carries richer trade
      // metadata (specifications, origin, HS) that Products may not have.
      try {
        const cat = await store.listProductCatalog(tenantId, { limit: 500 });
        const bySku = product.sku
          ? cat.items.find((c) => c.sku && c.sku.toLowerCase() === product!.sku.toLowerCase())
          : null;
        const byName = !bySku
          ? cat.items.find((c) => c.name.toLowerCase() === product!.name.toLowerCase())
          : null;
        catalogEntry = bySku || byName || null;
      } catch { /* catalog is optional — carry on with just product data */ }
    }

    // Determine the effective catalog entry ID for queries
    const effectiveCatalogId = catalogEntryId || (product?.id ?? null);
    const effectiveProductId = productId || (catalogEntry?.id ?? null);

    // 3. Supplier offers for this product
    const supplierOffers = await store.listSupplierOffers(tenantId, {
      limit: 20,
      filters: { product_id: effectiveCatalogId || undefined },
    });

    // 4. Recent trade calculations for this product
    const tradeCalculations = await store.listTradeCalculations(tenantId, {
      limit: 10,
      filters: { product_id: effectiveProductId || undefined },
    });

    // 5. Inventory status — find all inventory movements for this product
    // We need to get all partners and check inventory, but that's expensive.
    // Instead, we'll use the product's stock field directly.
    const inventoryStatus = product
      ? {
          stock: product.stock,
          reorder_level: product.reorder_level,
          low_stock: product.stock <= product.reorder_level,
          unit: product.unit,
        }
      : null;

    // 6. Price history — get from recent offers/invoices that include this product
    // We'll look through recent offers and filter items that match this product
    const recentOffers = await store.listOffers(tenantId, { limit: 50 });
    const priceHistory: Array<{
      date: string;
      source: string;
      source_number: string;
      unit_price: number;
      currency: string;
      quantity: number;
    }> = [];

    for (const offer of recentOffers.items) {
      for (const item of offer.items) {
        if (item.product_id === effectiveProductId || item.sku === product?.sku) {
          priceHistory.push({
            date: offer.created_at,
            source: "offer",
            source_number: offer.number,
            unit_price: item.unit_price,
            currency: offer.currency,
            quantity: item.quantity,
          });
        }
      }
    }

    // Sort price history by date descending
    priceHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      product,
      catalogEntry,
      supplierOffers: supplierOffers.items,
      tradeCalculations: tradeCalculations.items,
      inventoryStatus,
      priceHistory: priceHistory.slice(0, 20), // Last 20 price entries
    });
  } catch (e) {
    console.error("[automation/product-context]", e);
    return NextResponse.json(
      { error: "Failed to load product context." },
      { status: 500 }
    );
  }
}
