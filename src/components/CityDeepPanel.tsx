"use client";

import { useState } from "react";
import { inr } from "@/lib/cost";
import { CITY_DEEP } from "@/lib/deep";

export function CityDeepPanel({ slug, name, total }: { slug: string; name: string; total: number }) {
  const deep = CITY_DEEP[slug];
  const [tab, setTab] = useState<"areas" | "extras">("areas");
  if (!deep) return <p className="text-[var(--muted)] text-sm">No deep data for {name} yet.</p>;

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
