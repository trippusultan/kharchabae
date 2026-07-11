"use client";

import { inr } from "@/lib/cost";

const LABELS: Record<string, string> = {
  housing: "Housing", food: "Food", commute: "Commute", utilities: "Utilities", internet: "Internet", misc: "Misc",
};
const SRC_BADGE: Record<string, { t: string; c: string }> = {
  live: { t: "live", c: "#c9a227" },
  "live-api": { t: "live", c: "#c9a227" },
  ref: { t: "ref", c: "#8a8475" },
  est: { t: "est", c: "#6b5d2a" },
  seed: { t: "seed", c: "#6b5d2a" },
};

export function CityBreakdown({
  b, total, sources,
}: { b: Record<string, number>; total: number; sources: Record<string, string>; }) {
  const keys = ["housing", "food", "commute", "utilities", "internet", "misc"];
  const max = Math.max(...keys.map((k) => b[k]), 1);

  return (
    <section className="neo p-7 mt-8">
      <h2 className="text-xl font-bold gold-text mb-5">Monthly breakdown</h2>
      <div className="space-y-4">
        {keys.map((k) => {
          const pct = (b[k] / max) * 100;
          const share = Math.round((b[k] / total) * 100);
          const badge = SRC_BADGE[sources[k] || "est"];
          return (
            <div key={k}>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  {LABELS[k]}
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: badge.c, color: "#0a0a0a" }}>{badge.t}</span>
                </span>
                <span className="gold-text font-semibold">{inr(b[k])}</span>
              </div>
              <div className="neo-inset h-3 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #e7c75a, #c9a227)",
                }} />
              </div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">{share}% of total</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
