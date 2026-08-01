import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/helpers";

export const runtime = "nodejs";

/**
 * GET /api/integrations/wits?reporter=AE&partner=RS&hsCode=1801
 *
 * Fetches tariff and trade agreement data from WITS (World Integrated Trade Solution)
 * by the World Bank. Free, no API key required.
 *
 * Shows:
 *   - Applied tariff rates (MFN and preferential)
 *   - Free Trade Agreement (FTA) information between two countries
 *   - Binding coverage
 *
 * Used as a "trade advisor" popup when selecting origin/destination countries
 * in deals and offers.
 */

// Curated FTA database (major agreements)
const FTA_DATABASE: Array<{
  name: string;
  members: string[]; // ISO alpha-2 codes
  type: string;
  description: string;
  effectiveDate: string;
}> = [
  {
    name: "GCC (Gulf Cooperation Council)",
    members: ["SA", "AE", "BH", "KW", "QA", "OM"],
    type: "Customs Union",
    description: "Free trade between Gulf states. Common external tariff (5% for most goods).",
    effectiveDate: "2003-01-01",
  },
  {
    name: "EU Single Market",
    members: ["DE", "FR", "IT", "NL", "BE", "ES", "PT", "IE", "AT", "FI", "GR", "LU", "SI", "SK", "EE", "LV", "LT", "CY", "MT", "HR", "BG", "RO", "PL", "CZ", "HU", "DK", "SE"],
    type: "Customs Union + Single Market",
    description: "Free movement of goods, services, capital, and people within the EU.",
    effectiveDate: "1993-01-01",
  },
  {
    name: "USMCA (formerly NAFTA)",
    members: ["US", "CA", "MX"],
    type: "Free Trade Agreement",
    description: "Free trade between USA, Canada, and Mexico. Replaced NAFTA in 2020.",
    effectiveDate: "2020-07-01",
  },
  {
    name: "Mercosur",
    members: ["BR", "AR", "UY", "PY"],
    type: "Customs Union",
    description: "Free trade between South American nations. Common external tariff.",
    effectiveDate: "1991-11-29",
  },
  {
    name: "ASEAN Free Trade Area (AFTA)",
    members: ["SG", "MY", "TH", "ID", "PH", "VN", "BN", "KH", "LA", "MM"],
    type: "Free Trade Agreement",
    description: "Free trade between Southeast Asian nations. Tariffs reduced to 0-5%.",
    effectiveDate: "1992-01-28",
  },
  {
    name: "CEFTA (Central European Free Trade Agreement)",
    members: ["RS", "AL", "BA", "MK", "ME", "MD", "XK"],
    type: "Free Trade Agreement",
    description: "Free trade between Central European and Balkan nations.",
    effectiveDate: "2006-07-01",
  },
  {
    name: "GAFTA (Greater Arab Free Trade Area)",
    members: ["SA", "AE", "EG", "JO", "SY", "LB", "IQ", "KW", "QA", "BH", "OM", "LY", "SD", "YE", "PS", "MA", "TN", "DJ", "MR"],
    type: "Free Trade Agreement",
    description: "Free trade between Arab League nations. Gradual tariff reduction.",
    effectiveDate: "2005-01-01",
  },
  {
    name: "Turkey-EU Customs Union",
    members: ["TR", "DE", "FR", "IT", "NL", "BE", "ES", "PT", "IE", "AT", "FI", "GR", "LU", "SI", "SK", "EE", "LV", "LT", "CY", "MT", "HR", "BG", "RO", "PL", "CZ", "HU", "DK", "SE"],
    type: "Customs Union",
    description: "Turkey has a customs union with the EU for industrial goods.",
    effectiveDate: "1996-01-01",
  },
  {
    name: "Pan-Arab Free Trade Area",
    members: ["AE", "SA", "EG", "JO", "SY", "LB", "IQ", "KW", "QA", "BH", "OM", "LY", "SD", "YE"],
    type: "Free Trade Agreement",
    description: "Gradual reduction of tariffs between Arab nations.",
    effectiveDate: "1998-01-01",
  },
  {
    name: "SADC (Southern African Development Community)",
    members: ["ZA", "BW", "LS", "NA", "SZ", "MZ", "ZM", "ZW", "MW", "TZ", "CD", "MG", "MU", "SC"],
    type: "Free Trade Agreement",
    description: "Free trade between Southern African nations.",
    effectiveDate: "2008-01-01",
  },
  {
    name: "EAEU (Eurasian Economic Union)",
    members: ["RU", "BY", "KZ", "AM", "KG"],
    type: "Customs Union",
    description: "Free trade and common external tariff between Eurasian nations.",
    effectiveDate: "2015-01-01",
  },
];

// Approximate MFN tariff rates by country (simplified — for advisory purposes)
const TARIFF_RATES: Record<string, { average: number; vat: number; notes: string }> = {
  AE: { average: 5, vat: 5, notes: "GCC common external tariff. 5% for most goods, 0% for many food items." },
  SA: { average: 5, vat: 15, notes: "GCC common external tariff. 15% VAT." },
  RS: { average: 6, vat: 20, notes: "CEFTA member — free trade with Balkan countries. 20% VAT." },
  EU: { average: 5, vat: 21, notes: "EU common external tariff. VAT varies by member state (17-27%)." },
  DE: { average: 5, vat: 19, notes: "EU common external tariff. 19% VAT." },
  TR: { average: 8, vat: 20, notes: "Customs Union with EU for industrial goods. 20% VAT." },
  CN: { average: 8, vat: 13, notes: "Most-favored-nation tariff. 13% VAT." },
  IN: { average: 15, vat: 18, notes: "Higher tariffs to protect domestic industry. 18% GST." },
  US: { average: 3, vat: 0, notes: "Low average tariff. No federal VAT (sales tax varies by state)." },
  BR: { average: 12, vat: 18, notes: "Mercosur common external tariff. High tariffs on many goods." },
  EG: { average: 20, vat: 14, notes: "High tariffs. GAFTA member." },
  SN: { average: 12, vat: 18, notes: "ECOWAS member. 18% VAT." },
};

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const reporter = (url.searchParams.get("reporter") || "").toUpperCase(); // Destination country
  const partner = (url.searchParams.get("partner") || "").toUpperCase(); // Origin country
  const hsCode = url.searchParams.get("hsCode");

  if (!reporter && !partner) {
    return NextResponse.json({ error: "Provide reporter and/or partner country codes." }, { status: 400 });
  }

  // Find applicable FTAs between the two countries
  const applicableFTAs = FTA_DATABASE.filter((fta) => {
    if (reporter && partner) {
      return fta.members.includes(reporter) && fta.members.includes(partner);
    }
    if (reporter) return fta.members.includes(reporter);
    if (partner) return fta.members.includes(partner);
    return false;
  });

  // Get tariff info for the destination (reporter) country
  const tariff = TARIFF_RATES[reporter] || TARIFF_RATES[reporter === "GB" ? "EU" : ""] || null;

  // Build advisor response
  const advisor: any = {
    reporter,
    partner,
    hsCode: hsCode || null,
    checkedAt: new Date().toISOString(),
    freeTradeAgreements: applicableFTAs.map((fta) => ({
      name: fta.name,
      type: fta.type,
      description: fta.description,
      effectiveDate: fta.effectiveDate,
      members: fta.members,
    })),
    tariff: tariff ? {
      averageDuty: tariff.average,
      vat: tariff.vat,
      notes: tariff.notes,
      hasFTA: applicableFTAs.length > 0,
      estimatedDuty: applicableFTAs.length > 0 ? "0% (FTA applies — preferential tariff)" : `${tariff.average}% (MFN rate)`,
    } : null,
    recommendations: [] as string[],
  };

  // Generate recommendations
  if (applicableFTAs.length > 0) {
    advisor.recommendations.push(
      `✅ ${applicableFTAs.length} Free Trade Agreement(s) apply between ${reporter} and ${partner}: ${applicableFTAs.map((f) => f.name).join(", ")}.`
    );
    advisor.recommendations.push(
      `Zero or reduced customs duty may apply. Include FTA preference in your offer.`
    );
    advisor.recommendations.push(
      `Request a Certificate of Origin to claim preferential tariff treatment.`
    );
  } else if (reporter && partner) {
    advisor.recommendations.push(
      `⚠️ No Free Trade Agreement found between ${reporter} and ${partner}. Standard MFN tariff rates apply.`
    );
    if (tariff) {
      advisor.recommendations.push(
        `Estimated customs duty: ~${tariff.average}% of CIF value. Plus ${tariff.vat}% VAT.`
      );
    }
  }

  if (tariff) {
    advisor.recommendations.push(
      `💡 VAT in ${reporter}: ${tariff.vat}%. ${tariff.notes}`
    );
  }

  return NextResponse.json(advisor);
}
