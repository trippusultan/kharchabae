"use client";

import dynamic from "next/dynamic";

// Lazy-load the heavy map so hero/text paint immediately; map hydrates after.
const IndiaMapPro = dynamic(() => import("@/components/IndiaMapPro").then((m) => m.IndiaMapPro), {
  ssr: false,
  loading: () => (
    <div className="neo p-5 md:p-6 relative flex items-center justify-center" style={{ minHeight: "76vh" }}>
      <div className="text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-[#3a3424] border-t-[#c9a227] animate-spin" />
        <div className="text-sm text-[var(--muted)]">Loading map…</div>
      </div>
    </div>
  ),
});

export function MapLazy(props: { totals: Record<string, number> }) {
  return <IndiaMapPro totals={props.totals} />;
}
