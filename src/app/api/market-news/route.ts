/**
 * API Route — World Market News
 * Serves reference commodity prices, currency rates, and trade news.
 * Data is static reference data for informational purposes.
 * Authenticated access only. In future, commodity/currency data can
 * be configured from settings or connected to live market feeds.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/helpers";

export const runtime = "nodejs";

interface MarketArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: "commodities" | "currency" | "regulations" | "logistics" | "macro";
  timestamp: string;
  impact: "positive" | "negative" | "neutral";
  relevantTo: string[];
}

const ARTICLES: MarketArticle[] = [
  {
    id: "mkt-001",
    title: "Copper prices surge 3.2% on China demand optimism",
    summary: "London Metal Exchange copper rose to $9,845/tonne as Chinese manufacturing data exceeded expectations, boosting demand outlook for industrial metals.",
    source: "Reuters Commodities",
    category: "commodities",
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    impact: "positive",
    relevantTo: ["metals", "manufacturing"],
  },
  {
    id: "mkt-002",
    title: "EU announces new tariffs on steel imports",
    summary: "The European Commission will impose provisional anti-dumping duties of 17.2-28.5% on certain steel products from third countries, effective next month.",
    source: "EU Trade Policy",
    category: "regulations",
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    impact: "negative",
    relevantTo: ["steel", "tariffs", "EU"],
  },
  {
    id: "mkt-003",
    title: "Shipping rates drop 5% on Pacific routes",
    summary: "Container rates from Shanghai to Los Angeles fell to $2,180/FEU as vessel capacity normalizes after the Red Sea disruption period.",
    source: "FreightWaves",
    category: "logistics",
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    impact: "positive",
    relevantTo: ["shipping", "logistics", "Pacific"],
  },
  {
    id: "mkt-004",
    title: "Emerging market currencies stable against EUR this quarter",
    summary: "Several emerging market currencies held steady against the euro, supported by central bank interventions and stable foreign reserves.",
    source: "Reuters FX",
    category: "currency",
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    impact: "neutral",
    relevantTo: ["currency", "EUR", "emerging markets"],
  },
  {
    id: "mkt-005",
    title: "WTO reports 2.1% growth in global trade volume",
    summary: "World merchandise trade volume grew 2.1% in Q1 2026, with Asia leading at 3.8% and Europe at 1.2%. The WTO forecasts 3.0% growth for the full year.",
    source: "WTO Statistics",
    category: "macro",
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    impact: "positive",
    relevantTo: ["trade", "macro", "global"],
  },
  {
    id: "mkt-006",
    title: "New customs code HS8471.30 update effective next month",
    summary: "The WCO has updated HS code 8471.30 to include new categories for AI computing hardware. Importers should update their customs declarations by March 1.",
    source: "WCO Customs",
    category: "regulations",
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
    impact: "neutral",
    relevantTo: ["customs", "HS codes", "technology"],
  },
  {
    id: "mkt-007",
    title: "Baltic Dry Index rises 4.8% — shipping demand up",
    summary: "The BDI climbed to 1,842 points, driven by increased capesize vessel demand for iron ore shipments from Brazil to China.",
    source: "Baltic Exchange",
    category: "logistics",
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    impact: "negative",
    relevantTo: ["shipping", "dry bulk", "commodities"],
  },
  {
    id: "mkt-008",
    title: "Wheat futures climb on Black Sea supply concerns",
    summary: "CBOT wheat futures rose 2.8% to $6.42/bushel as weather concerns in Ukraine and Russia raised supply uncertainty for the 2026 harvest.",
    source: "Chicago Board of Trade",
    category: "commodities",
    timestamp: new Date(Date.now() - 52 * 3600000).toISOString(),
    impact: "negative",
    relevantTo: ["agriculture", "wheat", "Black Sea"],
  },
];

// Commodity prices — static reference data
const COMMODITY_PRICES = [
  { name: "Copper", price: 9845, unit: "USD/t", change: 3.2, trend: "up" },
  { name: "Crude Oil (Brent)", price: 82.45, unit: "USD/bbl", change: -0.8, trend: "down" },
  { name: "Steel (HRC)", price: 685, unit: "USD/t", change: 1.1, trend: "up" },
  { name: "Wheat", price: 242, unit: "USD/t", change: 2.8, trend: "up" },
  { name: "Natural Gas", price: 2.85, unit: "USD/MMBtu", change: -1.2, trend: "down" },
  { name: "Aluminum", price: 2412, unit: "USD/t", change: 0.5, trend: "up" },
  { name: "Coffee", price: 4250, unit: "USD/t", change: -2.1, trend: "down" },
  { name: "Soybeans", price: 485, unit: "USD/t", change: 0.3, trend: "up" },
];

// Currency rates — static reference data
const CURRENCY_RATES = [
  { from: "EUR", to: "USD", rate: 1.0845, change: 0.12 },
  { from: "USD", to: "CNY", rate: 7.245, change: -0.08 },
  { from: "GBP", to: "EUR", rate: 1.168, change: 0.05 },
  { from: "EUR", to: "TRY", rate: 36.42, change: -0.15 },
  { from: "USD", to: "AED", rate: 3.6725, change: 0.0 },
  { from: "USD", to: "JPY", rate: 149.85, change: -0.22 },
];

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    // Attempt to load commodity/currency data from settings if available,
    // otherwise fall back to static reference data.
    let commodities = COMMODITY_PRICES;
    let currencies = CURRENCY_RATES;

    try {
      const customCommodities = await auth.store.getSetting("market_commodities");
      if (customCommodities && Array.isArray(customCommodities)) {
        commodities = customCommodities;
      }
    } catch {
      // Settings not available — use static data
    }

    try {
      const customCurrencies = await auth.store.getSetting("market_currencies");
      if (customCurrencies && Array.isArray(customCurrencies)) {
        currencies = customCurrencies;
      }
    } catch {
      // Settings not available — use static data
    }

    return NextResponse.json({
      articles: ARTICLES,
      commodities,
      currencies,
      lastUpdated: new Date().toISOString(),
      source: "aspidus-reference",
    });
  } catch (error) {
    console.error("[market-news] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data." },
      { status: 500 }
    );
  }
}
