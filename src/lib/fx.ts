// KharchaBae — live USD equivalent via a free, no-key public FX API.
// open.er-api.com is free, requires no API key, and is CORS-friendly.
// Result is cached in-memory for 1 hour to avoid redundant calls.

let cache: { rate: number; at: number } | null = null;

export async function usdRate(): Promise<number | null> {
  if (cache && Date.now() - cache.at < 3600_000) return cache.rate;
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/INR", { cache: "no-store" });
    const j = await r.json();
    const rate = j?.rates?.USD;
    if (typeof rate === "number") {
      cache = { rate, at: Date.now() };
      return rate;
    }
  } catch {
    /* offline / blocked — fall back to null (caller hides USD) */
  }
  return null;
}

export function toUsd(inrVal: number, rate: number | null): string | null {
  if (rate == null) return null;
  return "$" + Math.round(inrVal * rate).toLocaleString("en-US");
}
