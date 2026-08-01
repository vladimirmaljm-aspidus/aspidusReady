// Reference data for international trade — used in dropdowns across the app.
// All standardized, no manual entry needed.

// ============================================================
// Incoterms 2020 — all 11 rules
// ============================================================
export interface Incoterm {
  code: string;
  name: string;
  mode: "any" | "sea"; // sea-only = FAS, FOB, CFR, CIF
  transfer: string; // where risk transfers
  who_pays_freight: "buyer" | "seller";
  who_pays_insurance: "buyer" | "seller";
  who_clears_export: "buyer" | "seller";
  who_clears_import: "buyer" | "seller";
}

export const INCOTERMS: Incoterm[] = [
  { code: "EXW", name: "Ex Works", mode: "any", transfer: "Seller's premises", who_pays_freight: "buyer", who_pays_insurance: "buyer", who_clears_export: "buyer", who_clears_import: "buyer" },
  { code: "FCA", name: "Free Carrier", mode: "any", transfer: "Named place (carrier)", who_pays_freight: "buyer", who_pays_insurance: "buyer", who_clears_export: "seller", who_clears_import: "buyer" },
  { code: "FAS", name: "Free Alongside Ship", mode: "sea", transfer: "Alongside vessel (port)", who_pays_freight: "buyer", who_pays_insurance: "buyer", who_clears_export: "seller", who_clears_import: "buyer" },
  { code: "FOB", name: "Free On Board", mode: "sea", transfer: "On board vessel", who_pays_freight: "buyer", who_pays_insurance: "buyer", who_clears_export: "seller", who_clears_import: "buyer" },
  { code: "CFR", name: "Cost and Freight", mode: "sea", transfer: "On board vessel", who_pays_freight: "seller", who_pays_insurance: "buyer", who_clears_export: "seller", who_clears_import: "buyer" },
  { code: "CIF", name: "Cost, Insurance and Freight", mode: "sea", transfer: "On board vessel", who_pays_freight: "seller", who_pays_insurance: "seller", who_clears_export: "seller", who_clears_import: "buyer" },
  { code: "CPT", name: "Carriage Paid To", mode: "any", transfer: "First carrier", who_pays_freight: "seller", who_pays_insurance: "buyer", who_clears_export: "seller", who_clears_import: "buyer" },
  { code: "CIP", name: "Carriage and Insurance Paid To", mode: "any", transfer: "First carrier", who_pays_freight: "seller", who_pays_insurance: "seller", who_clears_export: "seller", who_clears_import: "buyer" },
  { code: "DAP", name: "Delivered at Place", mode: "any", transfer: "Named destination", who_pays_freight: "seller", who_pays_insurance: "seller", who_clears_export: "seller", who_clears_import: "buyer" },
  { code: "DPU", name: "Delivered at Place Unloaded", mode: "any", transfer: "Named destination (unloaded)", who_pays_freight: "seller", who_pays_insurance: "seller", who_clears_export: "seller", who_clears_import: "buyer" },
  { code: "DDP", name: "Delivered Duty Paid", mode: "any", transfer: "Named destination", who_pays_freight: "seller", who_pays_insurance: "seller", who_clears_export: "seller", who_clears_import: "seller" },
];

export const INCOTERM_CODES = INCOTERMS.map((i) => i.code);

// ============================================================
// Currencies — ISO 4217 (comprehensive trade-relevant subset)
// ============================================================
export const CURRENCIES = [
  { value: "RSD", label: "RSD — Serbian Dinar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "CHF", label: "CHF — Swiss Franc" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "CNY", label: "CNY — Chinese Yuan" },
  { value: "SEK", label: "SEK — Swedish Krona" },
  { value: "NOK", label: "NOK — Norwegian Krone" },
  { value: "DKK", label: "DKK — Danish Krone" },
  { value: "PLN", label: "PLN — Polish Zloty" },
  { value: "CZK", label: "CZK — Czech Koruna" },
  { value: "HUF", label: "HUF — Hungarian Forint" },
  { value: "RON", label: "RON — Romanian Leu" },
  { value: "BGN", label: "BGN — Bulgarian Lev" },
  { value: "HRK", label: "HRK — Croatian Kuna" },
  { value: "BAM", label: "BAM — Convertible Mark" },
  { value: "MKD", label: "MKD — Macedonian Denar" },
  { value: "ALL", label: "ALL — Albanian Lek" },
  { value: "TRY", label: "TRY — Turkish Lira" },
  { value: "RUB", label: "RUB — Russian Ruble" },
  { value: "UAH", label: "UAH — Ukrainian Hryvnia" },
  { value: "BRL", label: "BRL — Brazilian Real" },
  { value: "MXN", label: "MXN — Mexican Peso" },
  { value: "ARS", label: "ARS — Argentine Peso" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "KRW", label: "KRW — South Korean Won" },
  { value: "SGD", label: "SGD — Singapore Dollar" },
  { value: "HKD", label: "HKD — Hong Kong Dollar" },
  { value: "TWD", label: "TWD — Taiwan Dollar" },
  { value: "THB", label: "THB — Thai Baht" },
  { value: "MYR", label: "MYR — Malaysian Ringgit" },
  { value: "IDR", label: "IDR — Indonesian Rupiah" },
  { value: "PHP", label: "PHP — Philippine Peso" },
  { value: "VND", label: "VND — Vietnamese Dong" },
  { value: "ZAR", label: "ZAR — South African Rand" },
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "SAR", label: "SAR — Saudi Riyal" },
  { value: "ILS", label: "ILS — Israeli Shekel" },
  { value: "EGP", label: "EGP — Egyptian Pound" },
  { value: "NGN", label: "NGN — Nigerian Naira" },
  { value: "KES", label: "KES — Kenyan Shilling" },
  { value: "NZD", label: "NZD — New Zealand Dollar" },
  { value: "CLP", label: "CLP — Chilean Peso" },
  { value: "COP", label: "COP — Colombian Peso" },
  { value: "PEN", label: "PEN — Peruvian Sol" },
  { value: "GEL", label: "GEL — Georgian Lari" },
  { value: "ISK", label: "ISK — Icelandic Króna" },
];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.value);

// ============================================================
// Countries — ISO 3166-1 alpha-2 (trade-relevant + EU + Balkans)
// ============================================================
export interface Country {
  code: string;
  name: string;
  region: string;
}

export const COUNTRIES: Country[] = [
  // Balkans
  { code: "RS", name: "Serbia", region: "Balkans" },
  { code: "BA", name: "Bosnia & Herzegovina", region: "Balkans" },
  { code: "HR", name: "Croatia", region: "Balkans" },
  { code: "SI", name: "Slovenia", region: "Balkans" },
  { code: "MK", name: "North Macedonia", region: "Balkans" },
  { code: "ME", name: "Montenegro", region: "Balkans" },
  { code: "AL", name: "Albania", region: "Balkans" },
  // EU
  { code: "DE", name: "Germany", region: "EU" },
  { code: "FR", name: "France", region: "EU" },
  { code: "IT", name: "Italy", region: "EU" },
  { code: "ES", name: "Spain", region: "EU" },
  { code: "NL", name: "Netherlands", region: "EU" },
  { code: "BE", name: "Belgium", region: "EU" },
  { code: "AT", name: "Austria", region: "EU" },
  { code: "PL", name: "Poland", region: "EU" },
  { code: "CZ", name: "Czech Republic", region: "EU" },
  { code: "HU", name: "Hungary", region: "EU" },
  { code: "GR", name: "Greece", region: "EU" },
  { code: "BG", name: "Bulgaria", region: "EU" },
  { code: "RO", name: "Romania", region: "EU" },
  // CIS / Eastern
  { code: "RU", name: "Russia", region: "CIS" },
  { code: "UA", name: "Ukraine", region: "CIS" },
  { code: "BY", name: "Belarus", region: "CIS" },
  { code: "KZ", name: "Kazakhstan", region: "CIS" },
  // Middle East
  { code: "AE", name: "United Arab Emirates", region: "Middle East" },
  { code: "SA", name: "Saudi Arabia", region: "Middle East" },
  { code: "TR", name: "Turkey", region: "Middle East" },
  { code: "EG", name: "Egypt", region: "Middle East" },
  { code: "IL", name: "Israel", region: "Middle East" },
  // Asia
  { code: "CN", name: "China", region: "Asia" },
  { code: "IN", name: "India", region: "Asia" },
  { code: "JP", name: "Japan", region: "Asia" },
  { code: "KR", name: "South Korea", region: "Asia" },
  { code: "VN", name: "Vietnam", region: "Asia" },
  { code: "TH", name: "Thailand", region: "Asia" },
  { code: "ID", name: "Indonesia", region: "Asia" },
  { code: "MY", name: "Malaysia", region: "Asia" },
  // Americas
  { code: "US", name: "United States", region: "Americas" },
  { code: "CA", name: "Canada", region: "Americas" },
  { code: "BR", name: "Brazil", region: "Americas" },
  { code: "AR", name: "Argentina", region: "Americas" },
  { code: "MX", name: "Mexico", region: "Americas" },
  // Africa
  { code: "ZA", name: "South Africa", region: "Africa" },
  { code: "NG", name: "Nigeria", region: "Africa" },
  { code: "MA", name: "Morocco", region: "Africa" },
  // Oceania
  { code: "AU", name: "Australia", region: "Oceania" },
  { code: "NZ", name: "New Zealand", region: "Oceania" },
];

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code);

// ============================================================
// Units of Measure — trade-standard
// ============================================================
export const UNITS_OF_MEASURE: { code: string; name: string; type: string }[] = [
  { code: "MT", name: "Metric Ton", type: "weight" },
  { code: "KG", name: "Kilogram", type: "weight" },
  { code: "G", name: "Gram", type: "weight" },
  { code: "LT", name: "Liter", type: "volume" },
  { code: "M3", name: "Cubic Meter", type: "volume" },
  { code: "BBL", name: "Barrel", type: "volume" },
  { code: "GAL", name: "Gallon", type: "volume" },
  { code: "M", name: "Meter", type: "length" },
  { code: "M2", name: "Square Meter", type: "area" },
  { code: "PCS", name: "Pieces", type: "count" },
  { code: "CTN", name: "Carton", type: "count" },
  { code: "PAL", name: "Pallet", type: "count" },
  { code: "BAG", name: "Bag", type: "count" },
  { code: "DRM", name: "Drum", type: "count" },
  { code: "BOX", name: "Box", type: "count" },
  { code: "SET", name: "Set", type: "count" },
  { code: "HR", name: "Hour", type: "service" },
  { code: "DAY", name: "Day", type: "service" },
];

export const UOM_CODES = UNITS_OF_MEASURE.map((u) => u.code);

// ============================================================
// Payment Terms — international trade standard
// ============================================================
export const PAYMENT_TERMS: { code: string; name: string; days: number }[] = [
  { code: "ADVANCE", name: "100% Advance", days: 0 },
  { code: "CIA", name: "Cash in Advance", days: 0 },
  { code: "NET7", name: "Net 7", days: 7 },
  { code: "NET14", name: "Net 14", days: 14 },
  { code: "NET30", name: "Net 30", days: 30 },
  { code: "NET45", name: "Net 45", days: 45 },
  { code: "NET60", name: "Net 60", days: 60 },
  { code: "NET90", name: "Net 90", days: 90 },
  { code: "LC_SIGHT", name: "L/C at Sight", days: 0 },
  { code: "LC_30", name: "L/C 30 days", days: 30 },
  { code: "LC_60", name: "L/C 60 days", days: 60 },
  { code: "LC_90", name: "L/C 90 days", days: 90 },
  { code: "D/P", name: "Documents against Payment", days: 0 },
  { code: "D/A", name: "Documents against Acceptance", days: 60 },
  { code: "30_70", name: "30% Advance / 70% on B/L", days: 30 },
  { code: "20_80", name: "20% Advance / 80% on B/L", days: 20 },
];

// ============================================================
// Transport modes
// ============================================================
export const TRANSPORT_MODES: { code: string; name: string }[] = [
  { code: "SEA", name: "Sea Freight" },
  { code: "AIR", name: "Air Freight" },
  { code: "ROAD", name: "Road Transport" },
  { code: "RAIL", name: "Rail Freight" },
  { code: "MULTIMODAL", name: "Multimodal" },
];

// ============================================================
// Container types (for sea freight)
// ============================================================
export const CONTAINER_TYPES: { code: string; name: string; capacity: string }[] = [
  { code: "20DV", name: "20' Dry Van", capacity: "33.2 m³ / 28 ton" },
  { code: "40DV", name: "40' Dry Van", capacity: "67.5 m³ / 30 ton" },
  { code: "40HC", name: "40' High Cube", capacity: "76.3 m³ / 30 ton" },
  { code: "45HC", name: "45' High Cube", capacity: "86 m³ / 30 ton" },
  { code: "20RF", name: "20' Reefer", capacity: "28 m³ / 27 ton" },
  { code: "40RF", name: "40' Reefer", capacity: "67 m³ / 30 ton" },
  { code: "20OT", name: "20' Open Top", capacity: "32 m³ / 28 ton" },
  { code: "40OT", name: "40' Open Top", capacity: "66 m³ / 30 ton" },
  { code: "20FR", name: "20' Flat Rack", capacity: "27 ton" },
  { code: "40FR", name: "40' Flat Rack", capacity: "30 ton" },
];

// ============================================================
// Product categories (commodities for international trade)
// ============================================================
export const PRODUCT_CATEGORIES: { code: string; name: string }[] = [
  { code: "AGRI", name: "Agricultural Products" },
  { code: "FOOD", name: "Food & Beverage" },
  { code: "SUGAR", name: "Sugar & Sweeteners" },
  { code: "GRAIN", name: "Grains & Cereals" },
  { code: "OIL", name: "Oils & Fats" },
  { code: "METAL", name: "Metals & Minerals" },
  { code: "CHEM", name: "Chemicals" },
  { code: "CMT", name: "Cement & Construction" },
  { code: "ENERGY", name: "Energy & Fuel" },
  { code: "TEXTILE", name: "Textiles & Raw Materials" },
  { code: "MACHINERY", name: "Machinery & Equipment" },
  { code: "PACKAGING", name: "Packaging Materials" },
  { code: "OTHER", name: "Other" },
];

// ============================================================
// Partner types (extended for trade)
// ============================================================
export const PARTNER_TYPES: { code: string; name: string }[] = [
  { code: "supplier", name: "Supplier" },
  { code: "buyer", name: "Buyer" },
  { code: "both", name: "Supplier & Buyer" },
  { code: "agent", name: "Agent / Broker" },
  { code: "logistics", name: "Logistics Provider" },
  { code: "customs", name: "Customs Broker" },
  { code: "bank", name: "Bank / Financial" },
  { code: "inspector", name: "Inspection Agency" },
];

// ============================================================
// Trade cost types (for landed cost calculation)
// ============================================================
export const TRADE_COST_TYPES: { code: string; name: string; basis: "unit" | "percent" | "fixed" | "per_container" }[] = [
  { code: "BUY_PRICE", name: "Buy Price", basis: "unit" },
  { code: "SELL_PRICE", name: "Sell Price", basis: "unit" },
  { code: "FREIGHT", name: "Sea/Air/Road Freight", basis: "per_container" },
  { code: "FREIGHT_INLAND", name: "Inland Freight (origin)", basis: "fixed" },
  { code: "FREIGHT_INLAND_DEST", name: "Inland Freight (destination)", basis: "fixed" },
  { code: "INSURANCE", name: "Insurance", basis: "percent" },
  { code: "CUSTOMS_DUTY", name: "Customs Duty", basis: "percent" },
  { code: "VAT", name: "VAT / Import Tax", basis: "percent" },
  { code: "EXCISE", name: "Excise Tax", basis: "percent" },
  { code: "CUSTOMS_BROKER", name: "Customs Broker Fee", basis: "fixed" },
  { code: "PORT_HANDLING", name: "Port Handling (THC)", basis: "per_container" },
  { code: "DOC_FEES", name: "Documentation Fees", basis: "fixed" },
  { code: "INSPECTION", name: "Inspection / SGS", basis: "fixed" },
  { code: "BANK_FEES", name: "Bank / L/C Fees", basis: "fixed" },
  { code: "WAREHOUSE", name: "Warehousing", basis: "fixed" },
  { code: "COMMISSION", name: "Agent Commission", basis: "percent" },
  { code: "OTHER", name: "Other Cost", basis: "fixed" },
];

// ============================================================
// Entity types (for partners)
// ============================================================
export const ENTITY_TYPES = [
  { value: "company", label: "Company" },
  { value: "individual", label: "Individual" },
];

// ============================================================
// Deal stages
// ============================================================
export const DEAL_STAGES = [
  { value: "lead", label: "Lead" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

// ============================================================
// Partner categories
// ============================================================
export const PARTNER_CATEGORIES = [
  { value: "strategic", label: "Strategic" },
  { value: "regular", label: "Regular" },
  { value: "new", label: "New" },
  { value: "inactive", label: "Inactive" },
  { value: "vip", label: "VIP" },
];

// ============================================================
// Payment terms (localized)
// ============================================================
export const PAYMENT_TERMS_LOCAL = [
  { value: "immediate", label: "Immediate" },
  { value: "net15", label: "Net 15" },
  { value: "net30", label: "Net 30" },
  { value: "net45", label: "Net 45" },
  { value: "net60", label: "Net 60" },
  { value: "net90", label: "Net 90" },
];

// ============================================================
// Invoice statuses
// ============================================================
export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

// ============================================================
// Offer statuses
// ============================================================
export const OFFER_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

// ============================================================
// Product categories (localized)
// ============================================================
export const PRODUCT_CATEGORIES_LOCAL = [
  { value: "raw_materials", label: "Raw Materials" },
  { value: "finished_goods", label: "Finished Goods" },
  { value: "semi_finished", label: "Semi-Finished" },
  { value: "consumables", label: "Consumables" },
  { value: "equipment", label: "Equipment" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

// ============================================================
// Product units
// ============================================================
export const PRODUCT_UNITS = [
  { value: "pcs", label: "Piece" },
  { value: "kg", label: "Kilogram" },
  { value: "ton", label: "Ton" },
  { value: "m", label: "Meter" },
  { value: "m2", label: "Square Meter" },
  { value: "m3", label: "Cubic Meter" },
  { value: "l", label: "Liter" },
  { value: "box", label: "Box" },
  { value: "pallet", label: "Pallet" },
  { value: "set", label: "Set" },
];

// ============================================================
// Helper: lookup functions
// ============================================================
export function getIncoterm(code: string): Incoterm | undefined {
  return INCOTERMS.find((i) => i.code === code);
}

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function getCurrencyLabel(code: string): string {
  const c = CURRENCIES.find((c) => c.value === code);
  return c ? c.label : code;
}

// Legacy interface for backward compatibility
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export function getCurrency(code: string): Currency | undefined {
  const c = CURRENCIES.find((c) => c.value === code);
  if (!c) return undefined;
  return { code: c.value, name: c.label, symbol: c.value };
}
