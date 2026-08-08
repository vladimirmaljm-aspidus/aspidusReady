/**
 * Live currency exchange rates.
 * Uses exchangerate-api.com (free, no key needed for the free tier)
 * or falls back to manual entry.
 */

const cache = new Map<string, { rate: number; expiresAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getExchangeRate(from: string, to: string): Promise<number | null> {
  if (!from || !to) return null;
  if (from === to) return 1;

  const cacheKey = `${from}-${to}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.rate;
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rate = data.rates?.[to];
    if (rate) {
      cache.set(cacheKey, { rate, expiresAt: Date.now() + CACHE_TTL });
      return rate as number;
    }
    return null;
  } catch (e) {
    console.warn("[exchange-rates] lookup failed:", e);
    return null;
  }
}

export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "CHF", "AED", "SAR", "CNY", "INR", "RUB",
  "JPY", "TRY", "BRL", "ZAR", "SGD", "HKD", "AUD", "CAD", "RSD",
];
