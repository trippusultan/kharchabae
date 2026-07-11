"use client";

import { useState } from "react";

export function CompareWidget({ cities }: { cities: { slug: string; name: string }[] }) {
  const [from, setFrom] = useState(cities[0]?.slug || "");
  const [to, setTo] = useState(cities[1]?.slug || "");
  const [res, setRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function compare() {
    setLoading(true);
    const r = await fetch(`/api/compare?from=${from}&to=${to}`);
    setRes(await r.json());
    setLoading(false);
  }

  return (
    <div className="neo p-7 mt-10">
      <h2 className="text-2xl font-bold gold-text">Shift calculator</h2>
      <p className="text-sm text-[var(--muted)] mt-1">Dusre city me shift hua toh kitna bachta? dekh lo.</p>
      <div className="flex flex-wrap gap-3 mt-4">
        <select className="neo-inset px-3 py-2 text-sm bg-transparent text-[var(--text)]" value={from} onChange={(e) => setFrom(e.target.value)}>
          {cities.map((c) => <option key={c.slug} value={c.slug} className="bg-[#141414]">{c.name}</option>)}
        </select>
        <span className="self-center text-[var(--muted)]">➡️</span>
        <select className="neo-inset px-3 py-2 text-sm bg-transparent text-[var(--text)]" value={to} onChange={(e) => setTo(e.target.value)}>
          {cities.map((c) => <option key={c.slug} value={c.slug} className="bg-[#141414]">{c.name}</option>)}
        </select>
        <button className="btn-gold" onClick={compare} disabled={loading}>
          {loading ? "soch raha..." : "Batao 💸"}
        </button>
      </div>
      {res && !res.error && (
        <div className="mt-5 text-lg">
          <p>{res.from.inr}/mo <span className="text-[var(--muted)] text-sm">({res.from.name})</span></p>
          <p>{res.to.inr}/mo <span className="text-[var(--muted)] text-sm">({res.to.name})</span></p>
          <p className="gold-text mt-2 font-semibold">{res.verdict}</p>
        </div>
      )}
      {res?.error && <p className="mt-4 text-[var(--gold)]">{res.error}</p>}
    </div>
  );
}
