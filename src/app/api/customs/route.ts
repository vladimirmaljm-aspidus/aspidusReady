/**
 * API Route — Customs Database
 * Reference data for customs tariff data, HS codes, and import/export regulations.
 * Uses WCO public data as static reference. Authenticated access only.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/helpers";

export const runtime = "nodejs";

interface HSCategory {
  code: string;
  description: string;
  dutyRate: string;
  vatRate: string;
  restrictions: string[];
  region: string;
}

interface CustomsRegulation {
  id: string;
  title: string;
  country: string;
  effectiveDate: string;
  type: "tariff" | "quota" | "sanction" | "preferential" | "documentation";
  impact: "high" | "medium" | "low";
  description: string;
}

const HS_CODES: HSCategory[] = [
  {
    code: "8471.30",
    description: "Automatic data processing machines — Digital, adp machines",
    dutyRate: "0%",
    vatRate: "20%",
    restrictions: ["CE marking required", "RoHS compliance"],
    region: "EU",
  },
  {
    code: "7208.39",
    description: "Flat-rolled products of iron or non-alloy steel — Hot-rolled",
    dutyRate: "3.2%",
    vatRate: "20%",
    restrictions: ["Anti-dumping duties may apply", "EU safeguard measure"],
    region: "EU",
  },
  {
    code: "1001.99",
    description: "Wheat and meslin — Other",
    dutyRate: "0%",
    vatRate: "10%",
    restrictions: ["Import license required", "TRQ applicable"],
    region: "EU",
  },
  {
    code: "2709.00",
    description: "Petroleum oils and oils from bituminous minerals — Crude",
    dutyRate: "0%",
    vatRate: "20%",
    restrictions: ["Excise duty applicable", "Strategic reserve requirement"],
    region: "EU",
  },
  {
    code: "8703.23",
    description: "Motor vehicles — Cylinder capacity > 1500cc but ≤ 3000cc",
    dutyRate: "10%",
    vatRate: "20%",
    restrictions: ["Type approval required", "CO2 emission standards"],
    region: "EU",
  },
  {
    code: "6203.42",
    description: "Men's or boys' trousers — Cotton",
    dutyRate: "12%",
    vatRate: "20%",
    restrictions: ["Rules of origin for preferential rates", "Textile quota"],
    region: "EU",
  },
  {
    code: "8517.13",
    description: "Smartphones — Telephones for cellular networks",
    dutyRate: "0%",
    vatRate: "20%",
    restrictions: ["CE marking", "R&TTE Directive compliance"],
    region: "EU",
  },
  {
    code: "0803.90",
    description: "Bananas — Other than plantains, fresh or dried",
    dutyRate: "€176/tonne",
    vatRate: "10%",
    restrictions: ["TRQ — preferential rate for ACP countries", "Phytosanitary certificate"],
    region: "EU",
  },
];

const REGULATIONS: CustomsRegulation[] = [
  {
    id: "reg-001",
    title: "EU Carbon Border Adjustment Mechanism (CBAM)",
    country: "European Union",
    effectiveDate: "2026-01-01",
    type: "tariff",
    impact: "high",
    description: "Importers of carbon-intensive goods (steel, cement, aluminum, fertilizers, electricity, hydrogen) must report embedded emissions and purchase CBAM certificates.",
  },
  {
    id: "reg-002",
    title: "EU Deforestation Regulation (EUDR)",
    country: "European Union",
    effectiveDate: "2026-03-30",
    type: "documentation",
    impact: "high",
    description: "Operators must provide due diligence statements confirming products (cattle, cocoa, coffee, oil palm, rubber, soya, wood) are deforestation-free.",
  },
  {
    id: "reg-003",
    title: "Bilateral Free Trade Agreement Update",
    country: "Regional",
    effectiveDate: "2026-06-01",
    type: "preferential",
    impact: "medium",
    description: "Expanded preferential tariff rates for industrial goods and agricultural products under bilateral trade agreements. New rules of origin requirements for cumulation.",
  },
  {
    id: "reg-004",
    title: "Regional Trade Facilitation Protocol",
    country: "Regional",
    effectiveDate: "2026-04-15",
    type: "documentation",
    impact: "medium",
    description: "Simplified customs procedures and mutual recognition of authorized economic operators among regional trade agreement members.",
  },
  {
    id: "reg-005",
    title: "EU Steel Safeguard Extension",
    country: "European Union",
    effectiveDate: "2026-06-30",
    type: "quota",
    impact: "high",
    description: "Extension of tariff-rate quotas on 26 steel product categories. Quota allocation adjusted to reflect recent import trends.",
  },
];

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase();
  const type = searchParams.get("type"); // "hs" | "regulations" | null (all)

  let filteredHS = HS_CODES;
  let filteredRegs = REGULATIONS;

  if (query) {
    filteredHS = HS_CODES.filter(
      (h) =>
        h.code.toLowerCase().includes(query) ||
        h.description.toLowerCase().includes(query)
    );
    filteredRegs = REGULATIONS.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
    );
  }

  if (type === "hs") {
    return NextResponse.json({ hsCodes: filteredHS, total: filteredHS.length });
  }

  if (type === "regulations") {
    return NextResponse.json({ regulations: filteredRegs, total: filteredRegs.length });
  }

  return NextResponse.json({
    hsCodes: filteredHS,
    regulations: filteredRegs,
    totalHS: filteredHS.length,
    totalRegulations: filteredRegs.length,
  });
}
