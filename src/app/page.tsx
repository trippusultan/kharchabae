import { prisma } from "@/lib/db";
import { rankCities, inr } from "@/lib/cost";
import { SEED_CITIES, totalOf } from "@/lib/seed";
import { MapLazy } from "@/components/MapLazy";
import { CityDeepPanel } from "@/components/CityDeepPanel";

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
    <>
      {/* FULL-SCREEN MAP HERO */}
      <section className="relative h-screen w-full overflow-hidden bg-[var(--bg)]">
        <MapLazy totals={totals} full />

        {/* overlay brand bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 md:p-7">
          <div className="pointer-events-auto flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] shadow-[0_0_28px_-6px_rgba(232,197,71,0.35)]">
              <span className="text-2xl font-black gold-text leading-none">₹</span>
            </div>
            <div className="leading-none">
              <h1 className="text-2xl md:text-3xl font-extrabold gold-text tracking-tight">KharchaBae</h1>
              <p className="mt-1 text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Cost of living, decoded</p>
            </div>
          </div>
          <span className="pointer-events-none hidden rounded-full border border-[var(--line)] bg-[var(--bg-2)]/80 px-3 py-1.5 text-xs text-[var(--muted)] backdrop-blur sm:inline-block">
            scroll = zoom · drag = pan · tap a city
          </span>
        </div>

        {/* hero headline (bottom-left, non-blocking) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 md:p-8">
          <div className="pointer-events-auto max-w-xl">
            <p className="text-2xl md:text-4xl font-bold leading-snug text-[var(--text)]">
              India ka asli monthly <span className="gold-text">kharcha</span>.
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {ranked.length} cities · spin the map, land on a city, see where your salary goes.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto w-full max-w-[var(--maxw)] px-5 md:px-8 py-12 md:py-16">
        {/* AT A GLANCE — compact strip right under the hero (the full interactive
            version lives inside the map above). Quick scan of cheapest → priciest. */}
        <div className="surface mt-10 p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold gold-text">At a glance</h2>
            <span className="text-xs text-[var(--muted)]">{ranked.length} cities · tap a pin on the map above</span>
          </div>
          <div className="marquee">
            <div className="marquee-track">
              {[...ranked, ...ranked].map((c, i) => (
                <a key={`${c.slug}-${i}`} href={`/city/${c.slug}`}
                  aria-hidden={i >= ranked.length}
                  tabIndex={i >= ranked.length ? -1 : undefined}
                  className="rank-row flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 transition hover:border-[var(--gold)]"
                  style={{ border: "1px solid transparent" }}
                  title={`${c.name} — ${inr(c.total)}/mo`}>
                  <span className="w-4 text-center text-xs font-semibold text-[var(--muted)]">{c.rank}</span>
                  <span className="whitespace-nowrap text-sm font-semibold">{c.name}</span>
                  <span className="gold-text text-sm font-bold">{inr(c.total)}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* three pillars */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { t: "Real surveys, not guesses", d: "Costs compiled from public 2024-25 India COL surveys." },
            { t: "City → neighborhood", d: "Drill from state to city to mohalla-level costs." },
            { t: "Compare & share", d: "Stack two cities, see the gap, send the link." },
          ].map((p) => (
            <div key={p.t} className="surface p-5 rounded-2xl text-center">
              <div className="text-base font-bold gold-text">{p.t}</div>
              <div className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{p.d}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[var(--muted)]">
          Shift {priciest.name} → {cheapest.name} = save {inr(cheapest.savesVsPriciest)}/mo.
        </p>

        <footer className="mt-14 border-t border-[var(--line)] pt-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="text-lg font-black gold-text">₹</span>
            <span className="text-sm font-bold gold-text tracking-tight">KharchaBae</span>
          </div>
          <p className="text-xs text-[var(--muted)]">Paisa samajh lo. · Cost-of-living intelligence for India.</p>
        </footer>
      </main>
    </>
  );
}
