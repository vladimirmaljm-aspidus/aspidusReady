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
      return NextResponse.json({ error: "Failed to fetch countries" }, { status: 502 });
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
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
