/**
 * API Route — Logistics Tracking
 * Lists deals with shipping/tracking information from the database.
 * Authenticated access only. Returns shipment data derived from deals.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveTenantId } from "@/lib/api/helpers";

export const runtime = "nodejs";

interface ShipmentEvent {
  timestamp: string;
  location: string;
  description: string;
  type: "departure" | "arrival" | "customs" | "transit" | "delay";
}

interface Shipment {
  id: string;
  trackingNumber: string;
  status: "in_transit" | "customs" | "delivered" | "loading" | "delayed";
  origin: string;
  destination: string;
  carrier: string;
  mode: "sea" | "air" | "road" | "rail";
  eta: string;
  departureDate: string;
  currentLocation: string;
  progress: number;
  containers: string[];
  weight: string;
  value: string;
  customsStatus: "cleared" | "pending" | "inspection" | "held";
  lastUpdate: string;
  events: ShipmentEvent[];
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
    // Permission gate (documents.read)
    { const { requirePermission } = await import("@/lib/permissions/can");
      const _d = requirePermission(auth, "logistics.read"); if (_d) return _d; } /* requirePermission wired */


  try {
    const tenantId = resolveTenantId(auth, req);
    if (!tenantId) return NextResponse.json({ items: [], total: 0 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const mode = searchParams.get("mode");

    // Fetch deals from the store — these are the real business records
    // that may have logistics/shipping information attached.
    const dealsResult = await auth.store.listDeals(tenantId, {
      limit: 200,
      filters: { stage: "won" },
    });

    // Map deals with logistics-relevant fields to shipment objects.
    // Deals that have shipping metadata (stored in description or custom fields)
    // will appear as shipments. For now, deals without explicit shipping info
    // are not included in the shipments list.
    const shipments: Shipment[] = dealsResult.items
      .filter((deal) => {
        // Include deals that have logistics-related keywords in their description
        // or that are in "won" stage (implying fulfillment/shipping).
        // This is a basic heuristic; in future, deals will have explicit
        // shipping/tracking fields.
        const desc = (deal.description || "").toLowerCase();
        return (
          desc.includes("shipping") ||
          desc.includes("shipment") ||
          desc.includes("delivery") ||
          desc.includes("freight") ||
          desc.includes("cargo") ||
          desc.includes("transport")
        );
      })
      .map((deal) => ({
        id: `sh-${deal.id}`,
        trackingNumber: `DEAL-${deal.id.slice(0, 8).toUpperCase()}`,
        status: "in_transit" as const,
        origin: "",
        destination: "",
        carrier: "",
        mode: "sea" as const,
        eta: deal.expected_close || "",
        departureDate: deal.created_at,
        currentLocation: "",
        progress: deal.stage === "won" ? 100 : 50,
        containers: [],
        weight: `${deal.quantity} ${deal.unit}`,
        value: `${deal.currency} ${deal.value.toLocaleString()}`,
        customsStatus: "pending" as const,
        lastUpdate: deal.updated_at,
        events: [
          {
            timestamp: deal.created_at,
            location: "",
            description: `Deal "${deal.title}" created`,
            type: "departure" as const,
          },
          {
            timestamp: deal.updated_at,
            location: "",
            description: `Deal updated — stage: ${deal.stage}`,
            type: "transit" as const,
          },
        ],
      }));

    // Apply filters
    let filtered = shipments;
    if (status && status !== "all") {
      filtered = filtered.filter((s) => s.status === status);
    }
    if (mode && mode !== "all") {
      filtered = filtered.filter((s) => s.mode === mode);
    }

    // Build summary from full shipments list
    const allStatuses = ["in_transit", "customs", "delivered", "loading", "delayed"] as const;
    const summary = Object.fromEntries(
      allStatuses.map((s) => [s, shipments.filter((sh) => sh.status === s).length])
    );

    return NextResponse.json({
      shipments: filtered,
      total: filtered.length,
      summary,
    });
  } catch (error) {
    console.error("[logistics] Error fetching shipments:", error);
    return NextResponse.json(
      { error: "Failed to fetch logistics data." },
      { status: 500 }
    );
  }
}
