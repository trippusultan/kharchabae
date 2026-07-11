import { prisma } from "@/lib/db";
import { rankCities, inr } from "@/lib/cost";
import { SEED_CITIES, totalOf } from "@/lib/seed";
import { IndiaMapPro } from "@/components/IndiaMapPro";
import { CityDeepPanel } from "@/components/CityDeepPanel";
import { SetupStatusPanel } from "@/components/SetupStatus";
import { DeepDock } from "@/components/DeepDock";
import { getSetupStatus } from "@/lib/setup";

export const dynamic = "force-static";

type Row = { slug: string; name: string; total: number; source: string; blurb: string };

// Seed-derived baseline so the site always renders, even with no DB / empty DB.
function seedRows(): Row[] {
  return SEED_CITIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    total: totalOf(c),
    source: "seed",
    blurb: c.blurb,
  }));
}

async function loadRows(): Promise<Row[]> {
  const base = seedRows();
  const bySlug = new Map(base.map((r) => [r.slug, r]));
  try {
    const month = new Date().toISOString().slice(0, 7);
    const cities = await prisma.city.findMany({
      include: { snapshots: { where: { month }, orderBy: { month: "desc" }, take: 1 } },
    });
    for (const c of cities) {
      const snap = c.snapshots[0];
      if (!snap) continue;
      const existing = bySlug.get(c.slug);
      if (existing) {
        existing.total = snap.total;
        existing.source = snap.source;
        existing.name = c.name;
      } else {
        bySlug.set(c.slug, { slug: c.slug, name: c.name, total: snap.total, source: snap.source, blurb: "" });
      }
    }
    // backfill blurbs for any DB-only cities
    for (const r of bySlug.values()) if (!r.blurb) r.blurb = SEED_CITIES.find((s) => s.slug === r.slug)?.blurb || "";
    return [...bySlug.values()];
  } catch {
    // DB unavailable (e.g. not provisioned yet) — use seed data
    return base;
  }
}

const BLURB: Record<string, string> = Object.fromEntries(
  SEED_CITIES.map((c) => [c.slug, c.blurb])
);

export default async function Home() {
  const rows = await loadRows();
  const ranked = rankCities(rows);
  const totals: Record<string, number> = Object.fromEntries(ranked.map((c) => [c.slug, c.total]));

  const cheapest = ranked[0];
  const priciest = ranked[ranked.length - 1];

  return (
    <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-16">
      {/* HERO + logo lockup */}
      <header className="mb-10 md:mb-14">
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2a2410] to-[#141414] border border-[#3a3424] flex items-center justify-center shadow-[0_0_28px_rgba(201,162,39,0.25)]">
            <span className="text-3xl font-black gold-text leading-none">₹</span>
          </div>
          <div className="leading-none">
            <h1 className="text-4xl md:text-5xl font-black gold-text tracking-tight">KharchaBae</h1>
            <p className="text-[10px] md:text-xs text-[var(--muted)] tracking-[0.22em] uppercase mt-2">Cost of living, decoded</p>
          </div>
        </div>
        <p className="text-center text-[var(--muted)] text-sm max-w-2xl mx-auto leading-relaxed">
          India ka asli monthly kharcha. Spin the map, land on a city, and see exactly where your salary goes — rent, food, commute, the whole <span className="gold-text">kharcha</span>.
        </p>

        {/* three pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { t: "Live, not guesses", d: "Median rents pulled via Bright Data — not blog opinions." },
            { t: "City → neighborhood", d: "Drill from state to city to mohalla-level costs." },
            { t: "Compare & share", d: "Stack two cities, see the gap, send the link." },
          ].map((p) => (
            <div key={p.t} className="neo p-5 rounded-2xl text-center">
              <div className="text-base font-bold gold-text">{p.t}</div>
              <div className="text-[var(--muted)] text-sm mt-2 leading-relaxed">{p.d}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8">
        {/* HEART: the map */}
        <IndiaMapPro totals={totals} />

        {/* DOCK: deep cost of selected city (client-side state via a tiny wrapper) */}
        <div className="neo p-6 md:p-7 min-h-[64vh] flex flex-col">
          <h2 className="text-xl font-bold gold-text mb-3">Deep dive</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed">Tap a city pin on the map to load its neighborhoods & extra costs.</p>
          <DeepDock totals={totals} />
        </div>
      </div>

      <p className="text-center text-sm text-[var(--muted)] mt-8">
        Shift {priciest.name} → {cheapest.name} = save {inr(cheapest.savesVsPriciest)}/mo · data via Bright Data
      </p>

      <details className="neo p-6 md:p-7 mt-10">
        <summary className="font-bold gold-text cursor-pointer text-lg">Methodology & FAQ</summary>
        <div className="text-[var(--muted)] mt-4 space-y-4 text-sm leading-relaxed">
          <p>An informative cost-of-living guide for Indians. Each city breaks into six buckets (housing, food, commute, utilities, internet, misc) using median live rents + typical spends.</p>
          <p><span className="gold">Housing</span> = median of live rental listings (Bright Data). <span className="gold">Commute</span> = official metro pass fares. Other buckets = typical estimates. Badges mark source: live / ref / est / seed.</p>
        </div>
      </details>

      <SetupStatusPanel status={getSetupStatus()} />

      <footer className="mt-14 pt-8 border-t border-[#1f1f1f] text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg font-black gold-text">₹</span>
          <span className="text-sm font-bold gold-text tracking-tight">KharchaBae</span>
        </div>
        <p className="text-[var(--muted)] text-xs">Paisa samajh lo. · Cost-of-living intelligence for India.</p>
      </footer>
    </main>
  );
}
