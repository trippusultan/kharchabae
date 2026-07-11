// KharchaBae — cost math + comparison helpers.

export type CostBreak = {
  housing: number;
  food: number;
  commute: number;
  utilities: number;
  internet: number;
  misc: number;
};

export function total(b: CostBreak): number {
  return b.housing + b.food + b.commute + b.utilities + b.internet + b.misc;
}

// Rank cities cheapest-first; return delta vs the most expensive.
export function rankCities<T extends { slug: string; name: string; total: number }>(rows: T[]) {
  const sorted = [...rows].sort((a, b) => a.total - b.total);
  const max = sorted.length ? sorted[sorted.length - 1].total : 0;
  return sorted.map((r, i) => ({
    ...r,
    rank: i + 1,
    savesVsPriciest: Math.round(max - r.total),
  }));
}

// INR pretty print.
export function inr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
