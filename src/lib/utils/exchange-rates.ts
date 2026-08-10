/**
 * Live currency exchange rates.
 *
 * Primary source: open.er-api.com (free, no API key, ~160 currencies).
 * - 1-hour in-memory cache per pair.
 * - `getExchangeRate(from, to)` returns a single pair rate.
 * - `getRateMap(base)` returns the full rate map (all quotes) for a base
 *   currency, so the client can convert many currencies in one shot.
 *
 * The free open.er-api.com endpoint is reachable from the sandbox and prod.
 */

const cache = new Map<string, { rate: number; expiresAt: number }>();
const mapCache = new Map<string, { rates: Record<string, number>; fetchedAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export type RateMapResult = {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
  source: string;
};

/**
 * Returns a single pair rate (from → to). Returns 1 when from === to.
 * Returns null on failure (callers should fall back to 1 to avoid crashing).
 */
export async function getExchangeRate(from: string, to: string): Promise<number | null> {
  if (!from || !to) return null;
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) return 1;

  const cacheKey = `${f}-${t}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.rate;
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${f}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rate = data.rates?.[t];
    if (typeof rate !== "number" || !isFinite(rate) || rate <= 0) return null;
    cache.set(cacheKey, { rate, expiresAt: Date.now() + CACHE_TTL });
    // Also cache the inverse so we don't double-fetch.
    cache.set(`${t}-${f}`, { rate: 1 / rate, expiresAt: Date.now() + CACHE_TTL });
    return rate as number;
  } catch (e) {
    console.warn("[exchange-rates] lookup failed:", e);
    return null;
  }
}

/**
 * Returns the full rate map for a base currency.
 * `rates[X]` means "1 base = rates[X] X".
 * Used by the trade calculator UI to convert all cost lines + show a live
 * "View totals in <currency>" preview without re-fetching per pair.
 */
export async function getRateMap(base: string): Promise<RateMapResult> {
  const b = (base || "USD").toUpperCase();
  const cached = mapCache.get(b);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return {
      base: b,
      rates: cached.rates,
      fetchedAt: new Date(cached.fetchedAt).toISOString(),
      source: "open.er-api.com (cached)",
    };
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${b}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.result !== "success" || !data?.rates) throw new Error("bad response");
    const rates = data.rates as Record<string, number>;
    // Sanity: drop non-finite / non-positive entries.
    for (const k of Object.keys(rates)) {
      const v = rates[k];
      if (typeof v !== "number" || !isFinite(v) || v <= 0) delete rates[k];
    }
    rates[b] = 1;
    const fetchedAt = Date.now();
    mapCache.set(b, { rates, fetchedAt });
    return {
      base: b,
      rates,
      fetchedAt: new Date(fetchedAt).toISOString(),
      source: "open.er-api.com",
    };
  } catch (e) {
    console.warn("[exchange-rates] getRateMap failed:", e);
    // Fallback: minimal hardcoded USD-anchored rates (covers the most common
    // trade currencies). If the base isn't USD, we cross through USD.
    const FALLBACK_USD: Record<string, number> = {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149, CHF: 0.88, CAD: 1.36, AUD: 1.52,
      CNY: 7.1, INR: 83, AED: 3.67, SAR: 3.75, EGP: 48, RUB: 92, ZAR: 18,
      TRY: 32, BRL: 5.4, MXN: 17, HKD: 7.8, SGD: 1.34, KRW: 1350, MYR: 4.7,
      THB: 36, IDR: 15700, PHP: 56, NZD: 1.64, SEK: 10.5, NOK: 10.7, DKK: 6.85,
      PLN: 4.0, CZK: 23, HUF: 350, RON: 4.5, BGN: 1.8, ILS: 3.7, RSD: 107,
    };
    let rates: Record<string, number>;
    if (b === "USD") {
      rates = { ...FALLBACK_USD };
    } else {
      const usdBase = FALLBACK_USD[b];
      rates = usdBase
        ? Object.fromEntries(
            Object.entries(FALLBACK_USD).map(([q, r]) => [q, r / usdBase]),
          )
        : { [b]: 1 };
    }
    rates[b] = rates[b] ?? 1;
    return {
      base: b,
      rates,
      fetchedAt: new Date().toISOString(),
      source: "fallback (hardcoded)",
    };
  }
}

/**
 * Synchronous pair lookup against an already-fetched rate map.
 * Returns the rate to convert `amount` from `from` to `to`.
 * `rates` is a map keyed by quote currency, with base = `baseCurrency`.
 */
export function convertViaMap(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
  baseCurrency: string,
): number {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) return amount;
  // rates[X] = 1 base → X. So 1 from = (rates[from] / rates[to]) to.
  const fromRate = rates[f];
  const toRate = rates[t];
  if (!fromRate || !toRate) return amount;
  return amount * (toRate / fromRate);
}

export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "CHF", "AED", "SAR", "CNY", "INR", "RUB",
  "JPY", "TRY", "BRL", "ZAR", "SGD", "HKD", "AUD", "CAD", "RSD",
  "EGP", "KRW", "MXN", "MYR", "THB", "IDR", "PHP", "NZD", "SEK",
  "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "BGN", "ILS",
];
