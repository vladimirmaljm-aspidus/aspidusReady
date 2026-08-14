import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * GET /api/search?q=xxx&limit=20
 *
 * Global search across partners, products, deals, offers, invoices, demands.
 * Returns a flat list of matches with entity type + id + label + subtitle.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
    // Permission gate (dashboard.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "dashboard.read"); if (_d) return _d; } /* requirePermission wired */

  const tenantId = resolveTenantId(auth, req);
  if (!tenantId) return NextResponse.json({ items: [] });

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const limit = Math.min(Number(url.searchParams.get("limit") || 20), 50);

  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const results: Array<{
    type: string;
    id: string;
    label: string;
    subtitle: string;
    url: string;
  }> = [];

  // Search partners
  try {
    const partners = await auth.store.listPartners(tenantId, { limit: 1000 });
    for (const p of partners.items) {
      const hay = `${p.name} ${p.email || ""} ${p.phone || ""} ${p.contact_name || ""}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          type: "partner",
          id: p.id,
          label: p.name,
          subtitle: [p.type, p.email, p.country].filter(Boolean).join(" · "),
          url: "partners",
        });
      }
    }
  } catch {}

  // Search products
  try {
    const products = await auth.store.listProducts(tenantId, { limit: 1000 });
    for (const p of products.items) {
      const hay = `${p.name} ${p.sku} ${p.category || ""}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          type: "product",
          id: p.id,
          label: p.name,
          subtitle: [p.sku, p.category, `${p.currency} ${p.price}`].filter(Boolean).join(" · "),
          url: "products",
        });
      }
    }
  } catch {}

  // Search deals
  try {
    const deals = await auth.store.listDeals(tenantId, { limit: 1000 });
    for (const d of deals.items) {
      const hay = `${d.title} ${d.stage} ${d.currency} ${d.value}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          type: "deal",
          id: d.id,
          label: d.title,
          subtitle: [d.stage, `${d.currency} ${d.value}`].filter(Boolean).join(" · "),
          url: "deals",
        });
      }
    }
  } catch {}

  // Search offers
  try {
    const offers = await auth.store.listOffers(tenantId, { limit: 1000 });
    for (const o of offers.items) {
      const hay = `${o.number} ${o.subject} ${o.status} ${o.currency} ${o.total}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          type: "offer",
          id: o.id,
          label: `Offer ${o.number}`,
          subtitle: [o.status, o.subject, `${o.currency} ${o.total}`].filter(Boolean).join(" · "),
          url: "offers",
        });
      }
    }
  } catch {}

  // Search invoices
  try {
    const invoices = await auth.store.listInvoices(tenantId, { limit: 1000 });
    for (const i of invoices.items) {
      const hay = `${i.number} ${i.subject} ${i.status} ${i.currency} ${i.total}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({
          type: "invoice",
          id: i.id,
          label: `Invoice ${i.number}`,
          subtitle: [i.status, i.subject, `${i.currency} ${i.total}`].filter(Boolean).join(" · "),
          url: "invoices",
        });
      }
    }
  } catch {}

  // Sort by relevance (exact label match first, then starts-with, then includes)
  results.sort((a, b) => {
    const aLabel = a.label.toLowerCase();
    const bLabel = b.label.toLowerCase();
    if (aLabel === q && bLabel !== q) return -1;
    if (bLabel === q && aLabel !== q) return 1;
    if (aLabel.startsWith(q) && !bLabel.startsWith(q)) return -1;
    if (bLabel.startsWith(q) && !aLabel.startsWith(q)) return 1;
    return aLabel.localeCompare(bLabel);
  });

  return NextResponse.json({ items: results.slice(0, limit) });
}
