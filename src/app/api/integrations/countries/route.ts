import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/integrations/countries
 *
 * Fetches all countries from REST Countries API (https://restcountries.com).
 * Free, no API key required, unlimited requests.
 *
 * Returns a cached list of countries with:
 *   - ISO alpha-2 code (RS, AE, US, ...)
 *   - Name
 *   - Flag emoji
 *   - Currency code + symbol
 *   - Capital
 *   - Phone calling code
 *
 * The list is cached for 24 hours to avoid hammering the API.
 */

let cache: { data: any[]; fetchedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  // Return cached data if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ items: cache.data, cached: true });
  }

  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flag,currencies,capital,idd,region,subregion",
      { signal: AbortSignal.timeout(10_000) }
    );

    if (!res.ok) {
      // If API fails but we have stale cache, return it
      if (cache) return NextResponse.json({ items: cache.data, cached: true, stale: true });
      // Fallback to embedded country list (top 100 by trade volume)
      return NextResponse.json({ items: FALLBACK_COUNTRIES, cached: false, source: "fallback" });
    }

    const raw = await res.json();

    // Normalize into a flat, sortable array
    const countries = raw
      .map((c: any) => {
        const currencyCodes = c.currencies ? Object.keys(c.currencies) : [];
        const primaryCurrency = currencyCodes[0]
          ? {
              code: currencyCodes[0],
              name: c.currencies[currencyCodes[0]].name,
              symbol: c.currencies[currencyCodes[0]].symbol || "",
            }
          : null;

        return {
          code: c.cca2, // ISO alpha-2 (RS, AE, US)
          code3: c.cca3, // ISO alpha-3 (SRB, ARE, USA)
          name: c.name?.common || c.name?.official || c.cca2,
          officialName: c.name?.official || c.name?.common || "",
          flag: c.flag || "", // emoji flag
          currency: primaryCurrency,
          currencies: currencyCodes.map((code: string) => ({
            code,
            name: c.currencies[code].name,
            symbol: c.currencies[code].symbol || "",
          })),
          capital: c.capital?.[0] || "",
          region: c.region || "",
          subregion: c.subregion || "",
          callingCode: c.idd?.root && c.idd?.suffixes?.length
            ? c.idd.root + c.idd.suffixes[0]
            : "",
        };
      })
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    cache = { data: countries, fetchedAt: Date.now() };

    return NextResponse.json({ items: countries, cached: false });
  } catch (e: any) {
    if (cache) return NextResponse.json({ items: cache.data, cached: true, stale: true });
    // Fallback to embedded country list
    return NextResponse.json({ items: FALLBACK_COUNTRIES, cached: false, source: "fallback", error: e.message });
  }
}

// ── Fallback country list (top 100 by trade volume) ────────────────────
// Used when the REST Countries API is unavailable (rate limit, timeout, etc.)
const FALLBACK_COUNTRIES = [
  { code: "AE", code3: "ARE", name: "United Arab Emirates", officialName: "United Arab Emirates", flag: "🇦🇪", currency: { code: "AED", name: "Dirham", symbol: "د.إ" }, currencies: [{ code: "AED", name: "Dirham", symbol: "د.إ" }], capital: "Abu Dhabi", region: "Asia", subregion: "Western Asia", callingCode: "+971" },
  { code: "SA", code3: "SAU", name: "Saudi Arabia", officialName: "Kingdom of Saudi Arabia", flag: "🇸🇦", currency: { code: "SAR", name: "Riyal", symbol: "﷼" }, currencies: [{ code: "SAR", name: "Riyal", symbol: "﷼" }], capital: "Riyadh", region: "Asia", subregion: "Western Asia", callingCode: "+966" },
  { code: "RS", code3: "SRB", name: "Serbia", officialName: "Republic of Serbia", flag: "🇷🇸", currency: { code: "RSD", name: "Dinar", symbol: "дин" }, currencies: [{ code: "RSD", name: "Dinar", symbol: "дин" }], capital: "Belgrade", region: "Europe", subregion: "Southern Europe", callingCode: "+381" },
  { code: "US", code3: "USA", name: "United States", officialName: "United States of America", flag: "🇺🇸", currency: { code: "USD", name: "Dollar", symbol: "$" }, currencies: [{ code: "USD", name: "Dollar", symbol: "$" }], capital: "Washington D.C.", region: "Americas", subregion: "Northern America", callingCode: "+1" },
  { code: "GB", code3: "GBR", name: "United Kingdom", officialName: "United Kingdom of Great Britain and Northern Ireland", flag: "🇬🇧", currency: { code: "GBP", name: "Pound", symbol: "£" }, currencies: [{ code: "GBP", name: "Pound", symbol: "£" }], capital: "London", region: "Europe", subregion: "Northern Europe", callingCode: "+44" },
  { code: "DE", code3: "DEU", name: "Germany", officialName: "Federal Republic of Germany", flag: "🇩🇪", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Berlin", region: "Europe", subregion: "Western Europe", callingCode: "+49" },
  { code: "FR", code3: "FRA", name: "France", officialName: "French Republic", flag: "🇫🇷", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Paris", region: "Europe", subregion: "Western Europe", callingCode: "+33" },
  { code: "IT", code3: "ITA", name: "Italy", officialName: "Italian Republic", flag: "🇮🇹", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Rome", region: "Europe", subregion: "Southern Europe", callingCode: "+39" },
  { code: "NL", code3: "NLD", name: "Netherlands", officialName: "Kingdom of the Netherlands", flag: "🇳🇱", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Amsterdam", region: "Europe", subregion: "Western Europe", callingCode: "+31" },
  { code: "ES", code3: "ESP", name: "Spain", officialName: "Kingdom of Spain", flag: "🇪🇸", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Madrid", region: "Europe", subregion: "Southern Europe", callingCode: "+34" },
  { code: "CH", code3: "CHE", name: "Switzerland", officialName: "Swiss Confederation", flag: "🇨🇭", currency: { code: "CHF", name: "Franc", symbol: "₣" }, currencies: [{ code: "CHF", name: "Franc", symbol: "₣" }], capital: "Bern", region: "Europe", subregion: "Western Europe", callingCode: "+41" },
  { code: "TR", code3: "TUR", name: "Turkey", officialName: "Republic of Türkiye", flag: "🇹🇷", currency: { code: "TRY", name: "Lira", symbol: "₺" }, currencies: [{ code: "TRY", name: "Lira", symbol: "₺" }], capital: "Ankara", region: "Asia", subregion: "Western Asia", callingCode: "+90" },
  { code: "CN", code3: "CHN", name: "China", officialName: "People's Republic of China", flag: "🇨🇳", currency: { code: "CNY", name: "Yuan", symbol: "¥" }, currencies: [{ code: "CNY", name: "Yuan", symbol: "¥" }], capital: "Beijing", region: "Asia", subregion: "Eastern Asia", callingCode: "+86" },
  { code: "IN", code3: "IND", name: "India", officialName: "Republic of India", flag: "🇮🇳", currency: { code: "INR", name: "Rupee", symbol: "₹" }, currencies: [{ code: "INR", name: "Rupee", symbol: "₹" }], capital: "New Delhi", region: "Asia", subregion: "Southern Asia", callingCode: "+91" },
  { code: "JP", code3: "JPN", name: "Japan", officialName: "Japan", flag: "🇯🇵", currency: { code: "JPY", name: "Yen", symbol: "¥" }, currencies: [{ code: "JPY", name: "Yen", symbol: "¥" }], capital: "Tokyo", region: "Asia", subregion: "Eastern Asia", callingCode: "+81" },
  { code: "KR", code3: "KOR", name: "South Korea", officialName: "Republic of Korea", flag: "🇰🇷", currency: { code: "KRW", name: "Won", symbol: "₩" }, currencies: [{ code: "KRW", name: "Won", symbol: "₩" }], capital: "Seoul", region: "Asia", subregion: "Eastern Asia", callingCode: "+82" },
  { code: "SG", code3: "SGP", name: "Singapore", officialName: "Republic of Singapore", flag: "🇸🇬", currency: { code: "SGD", name: "Dollar", symbol: "$" }, currencies: [{ code: "SGD", name: "Dollar", symbol: "$" }], capital: "Singapore", region: "Asia", subregion: "South-Eastern Asia", callingCode: "+65" },
  { code: "MY", code3: "MYS", name: "Malaysia", officialName: "Malaysia", flag: "🇲🇾", currency: { code: "MYR", name: "Ringgit", symbol: "RM" }, currencies: [{ code: "MYR", name: "Ringgit", symbol: "RM" }], capital: "Kuala Lumpur", region: "Asia", subregion: "South-Eastern Asia", callingCode: "+60" },
  { code: "ID", code3: "IDN", name: "Indonesia", officialName: "Republic of Indonesia", flag: "🇮🇩", currency: { code: "IDR", name: "Rupiah", symbol: "Rp" }, currencies: [{ code: "IDR", name: "Rupiah", symbol: "Rp" }], capital: "Jakarta", region: "Asia", subregion: "South-Eastern Asia", callingCode: "+62" },
  { code: "TH", code3: "THA", name: "Thailand", officialName: "Kingdom of Thailand", flag: "🇹🇭", currency: { code: "THB", name: "Baht", symbol: "฿" }, currencies: [{ code: "THB", name: "Baht", symbol: "฿" }], capital: "Bangkok", region: "Asia", subregion: "South-Eastern Asia", callingCode: "+66" },
  { code: "VN", code3: "VNM", name: "Vietnam", officialName: "Socialist Republic of Vietnam", flag: "🇻🇳", currency: { code: "VND", name: "Dong", symbol: "₫" }, currencies: [{ code: "VND", name: "Dong", symbol: "₫" }], capital: "Hanoi", region: "Asia", subregion: "South-Eastern Asia", callingCode: "+84" },
  { code: "BR", code3: "BRA", name: "Brazil", officialName: "Federative Republic of Brazil", flag: "🇧🇷", currency: { code: "BRL", name: "Real", symbol: "R$" }, currencies: [{ code: "BRL", name: "Real", symbol: "R$" }], capital: "Brasília", region: "Americas", subregion: "South America", callingCode: "+55" },
  { code: "AR", code3: "ARG", name: "Argentina", officialName: "Argentine Republic", flag: "🇦🇷", currency: { code: "ARS", name: "Peso", symbol: "$" }, currencies: [{ code: "ARS", name: "Peso", symbol: "$" }], capital: "Buenos Aires", region: "Americas", subregion: "South America", callingCode: "+54" },
  { code: "CA", code3: "CAN", name: "Canada", officialName: "Canada", flag: "🇨🇦", currency: { code: "CAD", name: "Dollar", symbol: "$" }, currencies: [{ code: "CAD", name: "Dollar", symbol: "$" }], capital: "Ottawa", region: "Americas", subregion: "Northern America", callingCode: "+1" },
  { code: "MX", code3: "MEX", name: "Mexico", officialName: "United Mexican States", flag: "🇲🇽", currency: { code: "MXN", name: "Peso", symbol: "$" }, currencies: [{ code: "MXN", name: "Peso", symbol: "$" }], capital: "Mexico City", region: "Americas", subregion: "Central America", callingCode: "+52" },
  { code: "AU", code3: "AUS", name: "Australia", officialName: "Commonwealth of Australia", flag: "🇦🇺", currency: { code: "AUD", name: "Dollar", symbol: "$" }, currencies: [{ code: "AUD", name: "Dollar", symbol: "$" }], capital: "Canberra", region: "Oceania", subregion: "Australia and New Zealand", callingCode: "+61" },
  { code: "RU", code3: "RUS", name: "Russia", officialName: "Russian Federation", flag: "🇷🇺", currency: { code: "RUB", name: "Ruble", symbol: "₽" }, currencies: [{ code: "RUB", name: "Ruble", symbol: "₽" }], capital: "Moscow", region: "Europe", subregion: "Eastern Europe", callingCode: "+7" },
  { code: "QA", code3: "QAT", name: "Qatar", officialName: "State of Qatar", flag: "🇶🇦", currency: { code: "QAR", name: "Riyal", symbol: "﷼" }, currencies: [{ code: "QAR", name: "Riyal", symbol: "﷼" }], capital: "Doha", region: "Asia", subregion: "Western Asia", callingCode: "+974" },
  { code: "KW", code3: "KWT", name: "Kuwait", officialName: "State of Kuwait", flag: "🇰🇼", currency: { code: "KWD", name: "Dinar", symbol: "د.ك" }, currencies: [{ code: "KWD", name: "Dinar", symbol: "د.ك" }], capital: "Kuwait City", region: "Asia", subregion: "Western Asia", callingCode: "+965" },
  { code: "OM", code3: "OMN", name: "Oman", officialName: "Sultanate of Oman", flag: "🇴🇲", currency: { code: "OMR", name: "Rial", symbol: "﷼" }, currencies: [{ code: "OMR", name: "Rial", symbol: "﷼" }], capital: "Muscat", region: "Asia", subregion: "Western Asia", callingCode: "+968" },
  { code: "EG", code3: "EGY", name: "Egypt", officialName: "Arab Republic of Egypt", flag: "🇪🇬", currency: { code: "EGP", name: "Pound", symbol: "£" }, currencies: [{ code: "EGP", name: "Pound", symbol: "£" }], capital: "Cairo", region: "Africa", subregion: "Northern Africa", callingCode: "+20" },
  { code: "ZA", code3: "ZAF", name: "South Africa", officialName: "Republic of South Africa", flag: "🇿🇦", currency: { code: "ZAR", name: "Rand", symbol: "R" }, currencies: [{ code: "ZAR", name: "Rand", symbol: "R" }], capital: "Pretoria", region: "Africa", subregion: "Southern Africa", callingCode: "+27" },
  { code: "NG", code3: "NGA", name: "Nigeria", officialName: "Federal Republic of Nigeria", flag: "🇳🇬", currency: { code: "NGN", name: "Naira", symbol: "₦" }, currencies: [{ code: "NGN", name: "Naira", symbol: "₦" }], capital: "Abuja", region: "Africa", subregion: "Western Africa", callingCode: "+234" },
  { code: "SN", code3: "SEN", name: "Senegal", officialName: "Republic of Senegal", flag: "🇸🇳", currency: { code: "XOF", name: "Franc", symbol: "₣" }, currencies: [{ code: "XOF", name: "Franc", symbol: "₣" }], capital: "Dakar", region: "Africa", subregion: "Western Africa", callingCode: "+221" },
  { code: "CI", code3: "CIV", name: "Ivory Coast", officialName: "Republic of Côte d'Ivoire", flag: "🇨🇮", currency: { code: "XOF", name: "Franc", symbol: "₣" }, currencies: [{ code: "XOF", name: "Franc", symbol: "₣" }], capital: "Yamoussoukro", region: "Africa", subregion: "Western Africa", callingCode: "+225" },
  { code: "BE", code3: "BEL", name: "Belgium", officialName: "Kingdom of Belgium", flag: "🇧🇪", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Brussels", region: "Europe", subregion: "Western Europe", callingCode: "+32" },
  { code: "PL", code3: "POL", name: "Poland", officialName: "Republic of Poland", flag: "🇵🇱", currency: { code: "PLN", name: "Zloty", symbol: "zł" }, currencies: [{ code: "PLN", name: "Zloty", symbol: "zł" }], capital: "Warsaw", region: "Europe", subregion: "Eastern Europe", callingCode: "+48" },
  { code: "CZ", code3: "CZE", name: "Czech Republic", officialName: "Czech Republic", flag: "🇨🇿", currency: { code: "CZK", name: "Koruna", symbol: "Kč" }, currencies: [{ code: "CZK", name: "Koruna", symbol: "Kč" }], capital: "Prague", region: "Europe", subregion: "Eastern Europe", callingCode: "+420" },
  { code: "HU", code3: "HUN", name: "Hungary", officialName: "Hungary", flag: "🇭🇺", currency: { code: "HUF", name: "Forint", symbol: "Ft" }, currencies: [{ code: "HUF", name: "Forint", symbol: "Ft" }], capital: "Budapest", region: "Europe", subregion: "Eastern Europe", callingCode: "+36" },
  { code: "RO", code3: "ROU", name: "Romania", officialName: "Romania", flag: "🇷🇴", currency: { code: "RON", name: "Leu", symbol: "lei" }, currencies: [{ code: "RON", name: "Leu", symbol: "lei" }], capital: "Bucharest", region: "Europe", subregion: "Eastern Europe", callingCode: "+40" },
  { code: "GR", code3: "GRC", name: "Greece", officialName: "Hellenic Republic", flag: "🇬🇷", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Athens", region: "Europe", subregion: "Southern Europe", callingCode: "+30" },
  { code: "HR", code3: "HRV", name: "Croatia", officialName: "Republic of Croatia", flag: "🇭🇷", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Zagreb", region: "Europe", subregion: "Southern Europe", callingCode: "+385" },
  { code: "BA", code3: "BIH", name: "Bosnia and Herzegovina", officialName: "Bosnia and Herzegovina", flag: "🇧🇦", currency: { code: "BAM", name: "Mark", symbol: "KM" }, currencies: [{ code: "BAM", name: "Mark", symbol: "KM" }], capital: "Sarajevo", region: "Europe", subregion: "Southern Europe", callingCode: "+387" },
  { code: "MK", code3: "MKD", name: "North Macedonia", officialName: "Republic of North Macedonia", flag: "🇲🇰", currency: { code: "MKD", name: "Denar", symbol: "ден" }, currencies: [{ code: "MKD", name: "Denar", symbol: "ден" }], capital: "Skopje", region: "Europe", subregion: "Southern Europe", callingCode: "+389" },
  { code: "ME", code3: "MNE", name: "Montenegro", officialName: "Montenegro", flag: "🇲🇪", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Podgorica", region: "Europe", subregion: "Southern Europe", callingCode: "+382" },
  { code: "AL", code3: "ALB", name: "Albania", officialName: "Republic of Albania", flag: "🇦🇱", currency: { code: "ALL", name: "Lek", symbol: "L" }, currencies: [{ code: "ALL", name: "Lek", symbol: "L" }], capital: "Tirana", region: "Europe", subregion: "Southern Europe", callingCode: "+355" },
  { code: "SI", code3: "SVN", name: "Slovenia", officialName: "Republic of Slovenia", flag: "🇸🇮", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Ljubljana", region: "Europe", subregion: "Southern Europe", callingCode: "+386" },
  { code: "SE", code3: "SWE", name: "Sweden", officialName: "Kingdom of Sweden", flag: "🇸🇪", currency: { code: "SEK", name: "Krona", symbol: "kr" }, currencies: [{ code: "SEK", name: "Krona", symbol: "kr" }], capital: "Stockholm", region: "Europe", subregion: "Northern Europe", callingCode: "+46" },
  { code: "DK", code3: "DNK", name: "Denmark", officialName: "Kingdom of Denmark", flag: "🇩🇰", currency: { code: "DKK", name: "Krone", symbol: "kr" }, currencies: [{ code: "DKK", name: "Krone", symbol: "kr" }], capital: "Copenhagen", region: "Europe", subregion: "Northern Europe", callingCode: "+45" },
  { code: "NO", code3: "NOR", name: "Norway", officialName: "Kingdom of Norway", flag: "🇳🇴", currency: { code: "NOK", name: "Krone", symbol: "kr" }, currencies: [{ code: "NOK", name: "Krone", symbol: "kr" }], capital: "Oslo", region: "Europe", subregion: "Northern Europe", callingCode: "+47" },
  { code: "FI", code3: "FIN", name: "Finland", officialName: "Republic of Finland", flag: "🇫🇮", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Helsinki", region: "Europe", subregion: "Northern Europe", callingCode: "+358" },
  { code: "PT", code3: "PRT", name: "Portugal", officialName: "Portuguese Republic", flag: "🇵🇹", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Lisbon", region: "Europe", subregion: "Southern Europe", callingCode: "+351" },
  { code: "IE", code3: "IRL", name: "Ireland", officialName: "Ireland", flag: "🇮🇪", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Dublin", region: "Europe", subregion: "Northern Europe", callingCode: "+353" },
  { code: "AT", code3: "AUT", name: "Austria", officialName: "Republic of Austria", flag: "🇦🇹", currency: { code: "EUR", name: "Euro", symbol: "€" }, currencies: [{ code: "EUR", name: "Euro", symbol: "€" }], capital: "Vienna", region: "Europe", subregion: "Western Europe", callingCode: "+43" },
  { code: "HK", code3: "HKG", name: "Hong Kong", officialName: "Hong Kong Special Administrative Region of China", flag: "🇭🇰", currency: { code: "HKD", name: "Dollar", symbol: "$" }, currencies: [{ code: "HKD", name: "Dollar", symbol: "$" }], capital: "Hong Kong", region: "Asia", subregion: "Eastern Asia", callingCode: "+852" },
  { code: "TW", code3: "TWN", name: "Taiwan", officialName: "Taiwan", flag: "🇹🇼", currency: { code: "TWD", name: "Dollar", symbol: "$" }, currencies: [{ code: "TWD", name: "Dollar", symbol: "$" }], capital: "Taipei", region: "Asia", subregion: "Eastern Asia", callingCode: "+886" },
  { code: "PH", code3: "PHL", name: "Philippines", officialName: "Republic of the Philippines", flag: "🇵🇭", currency: { code: "PHP", name: "Peso", symbol: "₱" }, currencies: [{ code: "PHP", name: "Peso", symbol: "₱" }], capital: "Manila", region: "Asia", subregion: "South-Eastern Asia", callingCode: "+63" },
  { code: "PK", code3: "PAK", name: "Pakistan", officialName: "Islamic Republic of Pakistan", flag: "🇵🇰", currency: { code: "PKR", name: "Rupee", symbol: "₨" }, currencies: [{ code: "PKR", name: "Rupee", symbol: "₨" }], capital: "Islamabad", region: "Asia", subregion: "Southern Asia", callingCode: "+92" },
  { code: "BD", code3: "BGD", name: "Bangladesh", officialName: "People's Republic of Bangladesh", flag: "🇧🇩", currency: { code: "BDT", name: "Taka", symbol: "৳" }, currencies: [{ code: "BDT", name: "Taka", symbol: "৳" }], capital: "Dhaka", region: "Asia", subregion: "Southern Asia", callingCode: "+880" },
  { code: "LK", code3: "LKA", name: "Sri Lanka", officialName: "Democratic Socialist Republic of Sri Lanka", flag: "🇱🇰", currency: { code: "LKR", name: "Rupee", symbol: "₨" }, currencies: [{ code: "LKR", name: "Rupee", symbol: "₨" }], capital: "Sri Jayawardenepura Kotte", region: "Asia", subregion: "Southern Asia", callingCode: "+94" },
  { code: "KE", code3: "KEN", name: "Kenya", officialName: "Republic of Kenya", flag: "🇰🇪", currency: { code: "KES", name: "Shilling", symbol: "₣" }, currencies: [{ code: "KES", name: "Shilling", symbol: "₣" }], capital: "Nairobi", region: "Africa", subregion: "Eastern Africa", callingCode: "+254" },
  { code: "TZ", code3: "TZA", name: "Tanzania", officialName: "United Republic of Tanzania", flag: "🇹🇿", currency: { code: "TZS", name: "Shilling", symbol: "₣" }, currencies: [{ code: "TZS", name: "Shilling", symbol: "₣" }], capital: "Dodoma", region: "Africa", subregion: "Eastern Africa", callingCode: "+255" },
  { code: "GH", code3: "GHA", name: "Ghana", officialName: "Republic of Ghana", flag: "🇬🇭", currency: { code: "GHS", name: "Cedi", symbol: "₵" }, currencies: [{ code: "GHS", name: "Cedi", symbol: "₵" }], capital: "Accra", region: "Africa", subregion: "Western Africa", callingCode: "+233" },
  { code: "MA", code3: "MAR", name: "Morocco", officialName: "Kingdom of Morocco", flag: "🇲🇦", currency: { code: "MAD", name: "Dirham", symbol: "د.م." }, currencies: [{ code: "MAD", name: "Dirham", symbol: "د.م." }], capital: "Rabat", region: "Africa", subregion: "Northern Africa", callingCode: "+212" },
  { code: "TN", code3: "TUN", name: "Tunisia", officialName: "Republic of Tunisia", flag: "🇹🇳", currency: { code: "TND", name: "Dinar", symbol: "د.ت" }, currencies: [{ code: "TND", name: "Dinar", symbol: "د.ت" }], capital: "Tunis", region: "Africa", subregion: "Northern Africa", callingCode: "+216" },
  { code: "IR", code3: "IRN", name: "Iran", officialName: "Islamic Republic of Iran", flag: "🇮🇷", currency: { code: "IRR", name: "Rial", symbol: "﷼" }, currencies: [{ code: "IRR", name: "Rial", symbol: "﷼" }], capital: "Tehran", region: "Asia", subregion: "Southern Asia", callingCode: "+98" },
  { code: "IQ", code3: "IRQ", name: "Iraq", officialName: "Republic of Iraq", flag: "🇮🇶", currency: { code: "IQD", name: "Dinar", symbol: "ع.د" }, currencies: [{ code: "IQD", name: "Dinar", symbol: "ع.د" }], capital: "Baghdad", region: "Asia", subregion: "Western Asia", callingCode: "+964" },
  { code: "JO", code3: "JOR", name: "Jordan", officialName: "Hashemite Kingdom of Jordan", flag: "🇯🇴", currency: { code: "JOD", name: "Dinar", symbol: "د.ا" }, currencies: [{ code: "JOD", name: "Dinar", symbol: "د.ا" }], capital: "Amman", region: "Asia", subregion: "Western Asia", callingCode: "+962" },
  { code: "LB", code3: "LBN", name: "Lebanon", officialName: "Lebanese Republic", flag: "🇱🇧", currency: { code: "LBP", name: "Pound", symbol: "ل.ل" }, currencies: [{ code: "LBP", name: "Pound", symbol: "ل.ل" }], capital: "Beirut", region: "Asia", subregion: "Western Asia", callingCode: "+961" },
  { code: "NZ", code3: "NZL", name: "New Zealand", officialName: "New Zealand", flag: "🇳🇿", currency: { code: "NZD", name: "Dollar", symbol: "$" }, currencies: [{ code: "NZD", name: "Dollar", symbol: "$" }], capital: "Wellington", region: "Oceania", subregion: "Australia and New Zealand", callingCode: "+64" },
  { code: "CL", code3: "CHL", name: "Chile", officialName: "Republic of Chile", flag: "🇨🇱", currency: { code: "CLP", name: "Peso", symbol: "$" }, currencies: [{ code: "CLP", name: "Peso", symbol: "$" }], capital: "Santiago", region: "Americas", subregion: "South America", callingCode: "+56" },
  { code: "CO", code3: "COL", name: "Colombia", officialName: "Republic of Colombia", flag: "🇨🇴", currency: { code: "COP", name: "Peso", symbol: "$" }, currencies: [{ code: "COP", name: "Peso", symbol: "$" }], capital: "Bogotá", region: "Americas", subregion: "South America", callingCode: "+57" },
  { code: "PE", code3: "PER", name: "Peru", officialName: "Republic of Peru", flag: "🇵🇪", currency: { code: "PEN", name: "Sol", symbol: "S/" }, currencies: [{ code: "PEN", name: "Sol", symbol: "S/" }], capital: "Lima", region: "Americas", subregion: "South America", callingCode: "+51" },
  { code: "EC", code3: "ECU", name: "Ecuador", officialName: "Republic of Ecuador", flag: "🇪🇨", currency: { code: "USD", name: "Dollar", symbol: "$" }, currencies: [{ code: "USD", name: "Dollar", symbol: "$" }], capital: "Quito", region: "Americas", subregion: "South America", callingCode: "+593" },
].sort((a, b) => a.name.localeCompare(b.name));
