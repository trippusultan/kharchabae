"use client";

import { IndiaMapPro } from "@/components/IndiaMapPro";

// The map is the hero — render it directly (client component). The static home
// HTML paints instantly; the map hydrates and fills the hero. No fragile
// next/dynamic ssr:false loader.
export function MapLazy(props: { totals: Record<string, number>; full?: boolean }) {
  return <IndiaMapPro totals={props.totals} full={props.full} />;
}
