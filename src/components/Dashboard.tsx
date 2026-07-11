"use client";

import { useState, useMemo } from "react";
import { IndiaMap } from "./IndiaMap";
import { inr } from "@/lib/cost";
import { CITY_DEEP } from "@/lib/deep";

type CityRow = { slug: string; name: string; total: number; source: string };

export function Dashboard({ cities }: { cities: CityRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"cheap" | "exp">("cheap");
  const [maxBudget, setMaxBudget] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let list = cities.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    if (maxBudget > 0) list = list.filter((c) => c.total <= maxBudget);
    list = [...list].sort((a, b) => (sort === "cheap" ? a.total - b.total : b.total - a.total));
    return list;
  }, [cities, query, sort, maxBudget]);

  const sel = cities.find((c) => c.slug === selected) || null;
  const deep = selected ? CITY_DEEP[selected] : null;

  function toggleCompare(slug: string) {
    setCompare((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length < 3 ? [...cur, slug] : cur));
  }

  return (
    <div>
      {/* STICKY TOOLBAR: search + sort + budget + compare */}
      <div className="sticky top-0 z-20 neo p-4 flex flex-wrap gap-3 items-center">
        <input
          className="neo-inset px-3 py-2 text-sm bg-transparent text-[var(--text)] outline-none flex-1 min-w-[160px]"
          placeholder="🔍 search city..." value={query} onChange={(e) => setQuery(e.target.value)}
          aria-label="Search city"
        />
        <select className="neo-inset px-3 py-2 text-sm bg-transparent text-[var(--text)]" value={sort}
          onChange={(e) => setSort(e.target.value as "cheap" | "exp")} aria-label="Sort">
          <option value="cheap" className="bg-[#141414]">Cheapest first</option>
          <option value="exp" className="bg-[#141414]">Priciest first</option>
        </select>
        <label className="text-xs text-[var(--muted)] flex items-center gap-2">
          Max ₹
          <input type="number" className="neo-inset px-2 py-1 w-24 text-sm bg-transparent text-[var(--text)] outline-none"
            value={maxBudget || ""} onChange={(e) => setMaxBudget(Number(e.target.value))} placeholder="all" aria-label="Max budget" />
        </label>
        <span className="text-xs text-[var(--gold)]">Compare ({compare.length}/3)</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* LEFT: MAP + GRID */}
        <div>
          <div className="neo p-4">
            <IndiaMap cities={filtered} onSelect={setSelected} selected={selected} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {filtered.map((c) => (
              <button key={c.slug} onClick={() => setSelected(c.slug)}
                className="neo p-3 text-left focus:outline-none"
                style={{ borderColor: selected === c.slug ? "#c9a227" : undefined }}>
                <div className="font-semibold gold-text">{c.name}</div>
                <div className="text-sm text-[var(--muted)]">{inr(c.total)}/mo</div>
                <label className="mt-2 flex items-center gap-1 text-xs text-[var(--muted)]"
                  onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={compare.includes(c.slug)} onChange={() => toggleCompare(c.slug)} /> compare
                </label>
              </button>
            ))}
            {!filtered.length && <p className="text-[var(--muted)] text-sm">No cities match.</p>}
          </div>
        </div>

        {/* RIGHT: DOCKED DEEP DETAIL (no full scroll) */}
        <div className="neo p-5 min-h-[400px]">
          {sel && deep ? (
            <DeepPanel slug={sel.slug} name={sel.name} total={sel.total} deep={deep} />
          ) : (
            <p className="text-[var(--muted)] text-sm">Tap a pin or city card to see deep in-city costs.</p>
          )}
        </div>
      </div>

      {/* COMPARE TRAY (sticky bottom) */}
      {compare.length > 1 && (
        <div className="sticky bottom-0 z-20 neo p-4 mt-6 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${compare.length}, 1fr)` }}>
          {compare.map((slug) => {
            const c = cities.find((x) => x.slug === slug)!;
            return (
              <div key={slug}>
                <div className="font-semibold gold-text">{c.name}</div>
                <div className="text-sm text-[var(--muted)]">{inr(c.total)}/mo</div>
                <button className="text-xs text-[var(--gold)] underline mt-1" onClick={() => setSelected(slug)}>open</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DeepPanel({ slug, name, total, deep }: { slug: string; name: string; total: number; deep: any }) {
  const [tab, setTab] = useState<"areas" | "extras">("areas");
  const avg = deep.avgTakeHome;
  const rentShare = Math.round(((deep.areas[0]?.rent1bhk || 0) / avg) * 100);
  return (
    <div>
      <h2 className="text-2xl font-black gold-text">{name}</h2>
      <p className="text-[var(--muted)] text-sm">Total {inr(total)}/mo · avg take-home {inr(avg)}/mo</p>

      <div className="flex gap-2 mt-4">
        <button className={`neo-inset px-3 py-1 text-sm ${tab === "areas" ? "gold-text" : "text-[var(--muted)]"}`} onClick={() => setTab("areas")}>Neighborhoods</button>
        <button className={`neo-inset px-3 py-1 text-sm ${tab === "extras" ? "gold-text" : "text-[var(--muted)]"}`} onClick={() => setTab("extras")}>Extra costs</button>
      </div>

      {tab === "areas" ? (
        <div className="mt-3 space-y-2">
          {deep.areas.map((a: any) => (
            <div key={a.name} className="neo-inset p-3 flex justify-between">
              <div>
                <div className="font-semibold text-[var(--text)]">{a.name}</div>
                <div className="text-xs text-[var(--muted)]">{a.note}</div>
              </div>
              <div className="gold-text font-semibold text-right">{inr(a.rent1bhk)}<div className="text-[10px] text-[var(--muted)]">1BHK</div></div>
            </div>
          ))}
          <p className="text-xs text-[var(--muted)] mt-2">Cheapest area rents {inr(Math.min(...deep.areas.map((a: any) => a.rent1bhk)))} — about {rentShare}% of avg salary.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {deep.extras.map((e: any) => (
            <div key={e.label} className="neo-inset p-3 flex justify-between">
              <div>
                <div className="font-semibold text-[var(--text)]">{e.label}</div>
                <div className="text-xs text-[var(--muted)]">{e.note}</div>
              </div>
              <div className="gold-text font-semibold">{inr(e.cost)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="neo-inset p-3 mt-3">
        <div className="text-xs text-[var(--gold)] font-semibold">💡 Bae tip</div>
        <p className="text-sm text-[var(--muted)] mt-1">{deep.tip}</p>
      </div>
    </div>
  );
}
