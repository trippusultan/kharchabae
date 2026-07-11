// KharchaBae — scraper (Bright Data, two paths) + reference data.
//
// PRIMARY: Scraping Browser over WebSocket (renders JS — needed for NoBroker/Swiggy).
//   SBR_WS_ENDPOINT=wss://brd-customer-xxx-zone-yyy:PASS@brd.superproxy.io:9222
//   NOTE: the Scraping Browser is NOT covered by Bright Data's free $2 test
//   credit — it needs a real balance. Until then this returns 403 and we fall back.
//
// FALLBACK: Web Unlocker API (Bearer API key) for server-rendered pages.
//   BRIGHTDATA_API_KEY=97b238f6-...   BRIGHTDATA_ZONE=kharchabae
//   Covered by the $2 test credit; works for SSR sites (not JS-heavy ones).
//
// REFERENCE: metro commute pass fares (public, accurate) — used as the commute bucket.

import puppeteer from "puppeteer-core";
import { SEED_CITIES, SeedCity, totalOf, COMMUTE_PASS } from "./seed";

const SBR_WS = (process.env.SBR_WS_ENDPOINT || "").trim();
const BD_KEY = (process.env.BRIGHTDATA_API_KEY || "").trim();
const BD_ZONE = (process.env.BRIGHTDATA_ZONE || "kharchabae").trim();

const sbrLive = SBR_WS.startsWith("wss://");
const apiLive = Boolean(BD_KEY);
export const isLive = sbrLive || apiLive;

type Src = "live" | "live-api" | "ref" | "est" | "seed";

function parseRent(text: string): number | null {
  const nums = (text.match(/₹\s?(\d{1,3}(?:,\d{3})+|\d{4,7})/g) || [])
    .map((s) => Number(s.replace(/[₹,\s]/g, "")))
    .filter((n) => n >= 3000 && n <= 500000)
    .sort((a, b) => a - b);
  if (!nums.length) return null;
  return nums[Math.floor(nums.length / 2)];
}

function parseFood(text: string): number | null {
  // Swiggy/Zomato meal prices
  const nums = (text.match(/₹\s?(\d{2,3}(?:\.\d{1,2})?)/g) || [])
    .map((s) => Number(s.replace(/[₹\s]/g, "")))
    .filter((n) => n >= 40 && n <= 900)
    .sort((a, b) => a - b);
  if (!nums.length) return null;
  const median = nums[Math.floor(nums.length / 2)];
  // ~22 meals/month eaten out (rest is home-cooked, cheaper) → monthly food
  return Math.round(median * 22 + 4000); // + grocery baseline
}

// Scraping Browser (renders JS — best for NoBroker & Swiggy/Zomato).
async function scrapeSBR(url: string): Promise<string | null> {
  const browser = await puppeteer.connect({ browserWSEndpoint: SBR_WS });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
    return await page.evaluate(() => document.body.innerText);
  } finally {
    await browser.disconnect();
  }
}

// Web Unlocker API (Bearer key) — SSR pages only.
async function scrapeAPI(url: string): Promise<string | null> {
  const https = require("https");
  const body = JSON.stringify({ zone: BD_ZONE, url, format: "raw" });
  return new Promise((resolve) => {
    const req = https.request(
      { host: "api.brightdata.com", path: "/request", method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${BD_KEY}` } },
      (res: any) => {
        let d = ""; res.on("data", (c: any) => (d += c));
        res.on("end", () => resolve(res.statusCode === 200 ? d : null));
      }
    );
    req.on("error", () => resolve(null));
    req.write(body); req.end();
  });
}

async function scrapeText(url: string): Promise<string | null> {
  if (sbrLive) {
    try { const t = await scrapeSBR(url); if (t) return t; } catch (e) { console.warn("[scraper] SBR fail:", (e as Error).message); }
  }
  if (apiLive) {
    try { const t = await scrapeAPI(url); if (t) return t; } catch (e) { console.warn("[scraper] API fail:", (e as Error).message); }
  }
  return null;
}

const SITE: Record<string, string> = {
  bangalore: "bangalore", mumbai: "mumbai", delhi: "delhi", hyderabad: "hyderabad",
  pune: "pune", chennai: "chennai", kolkata: "kolkata", goa: "goa",
  ahmedabad: "ahmedabad", jaipur: "jaipur",
};

export async function getCityCost(city: SeedCity) {
  const sources: Record<string, Src> = {};
  const b = {
    housing: city.housing,
    food: city.food,
    commute: city.commute,
    utilities: city.utilities,
    internet: city.internet,
    misc: city.misc,
  };
  let anyLive = false;

  // HOUSING — NoBroker (live via browser)
  const houseTxt = await scrapeText(`https://www.nobroker.in/flats-for-rent-in-${city.slug}`);
  const rent = houseTxt ? parseRent(houseTxt) : null;
  if (rent) { b.housing = rent; sources.housing = sbrLive ? "live" : "live-api"; anyLive = true; }

  // FOOD — Swiggy/Zomato (live via browser)
  if (anyLive || sbrLive || apiLive) {
    const foodTxt = await scrapeText(`https://www.swiggy.com/restaurants-bakery-cakes-${SITE[city.slug]}`);
    const food = foodTxt ? parseFood(foodTxt) : null;
    if (food) { b.food = food; sources.food = sbrLive ? "live" : "live-api"; }
  }

  // COMMUTE — metro pass reference (accurate, not scraped)
  if (COMMUTE_PASS[city.slug]) { b.commute = COMMUTE_PASS[city.slug]; sources.commute = "ref"; }

  // remaining buckets are typical estimates
  sources.utilities = "est"; sources.internet = "est"; sources.misc = "est";
  if (!sources.housing) sources.housing = "seed";
  if (!sources.food) sources.food = "seed";

  const total = b.housing + b.food + b.commute + b.utilities + b.internet + b.misc;
  return {
    break: b,
    total,
    source: anyLive ? "live" : "seed",
    sources: JSON.stringify(sources),
  };
}

export { SEED_CITIES };
