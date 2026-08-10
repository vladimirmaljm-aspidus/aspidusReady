/**
 * Server-side geocoding via Nominatim (OpenStreetMap) — free, no API key.
 *
 * Usage policy (https://operations.osmfoundation.org/policies/nominatim/)
 * requires: max 1 request/second, a descriptive User-Agent, and caching of
 * results where reasonable. This module enforces both: a sequential queue
 * that spaces out requests, and an in-memory cache (process lifetime) keyed
 * by the normalized query string.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "AspidusTradeGlobe/1.0 (trade@aspidus.co)";
const MIN_INTERVAL_MS = 1100; // stay under Nominatim's 1 req/s limit

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  countryCode: string | null;
}

const cache = new Map<string, GeocodeResult | null>();

// Sequential request queue so concurrent geocode calls never exceed 1/sec.
let queueTail: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queueTail.then(async () => {
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - lastRequestAt));
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
    return fn();
  });
  // Swallow errors in the tail chain so one failed lookup doesn't jam the queue.
  queueTail = run.then(() => undefined, () => undefined);
  return run;
}

/**
 * Geocode a free-text address (or place name) to coordinates.
 * Returns null if nothing was found or the lookup failed.
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (!q) return null;
  const key = q.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  const result = await enqueue(async () => {
    try {
      const params = new URLSearchParams({
        q,
        format: "json",
        limit: "1",
        addressdetails: "1",
      });
      const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const hit = Array.isArray(data) ? data[0] : null;
      if (!hit) return null;
      return {
        lat: parseFloat(hit.lat),
        lng: parseFloat(hit.lon),
        displayName: hit.display_name as string,
        countryCode: (hit.address?.country_code as string | undefined)?.toUpperCase() || null,
      } satisfies GeocodeResult;
    } catch {
      return null;
    }
  });

  cache.set(key, result);
  return result;
}

/**
 * Build a single geocodable query string from structured address fields,
 * falling back to progressively less specific combinations when the full
 * address doesn't resolve (Nominatim is picky about house-number/street
 * formatting across countries).
 */
export function buildAddressQueries(fields: {
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}): string[] {
  const { addressLine, city, state, postalCode, country } = fields;
  const queries: string[] = [];
  const full = [addressLine, city, state, postalCode, country].filter(Boolean).join(", ");
  if (full) queries.push(full);
  const cityLevel = [city, state, country].filter(Boolean).join(", ");
  if (cityLevel && cityLevel !== full) queries.push(cityLevel);
  const countryOnly = country || "";
  if (countryOnly && countryOnly !== cityLevel) queries.push(countryOnly);
  return queries;
}

/**
 * Geocode structured address fields, trying progressively broader queries
 * until one resolves. Never throws — returns null on total failure.
 */
export async function geocodeStructured(fields: {
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}): Promise<GeocodeResult | null> {
  for (const q of buildAddressQueries(fields)) {
    const r = await geocodeAddress(q);
    if (r) return r;
  }
  return null;
}
