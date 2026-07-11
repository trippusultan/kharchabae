"use client";

import { useEffect, useState } from "react";
import { CityDeepPanel } from "./CityDeepPanel";

export function DeepDock({ totals }: { totals: Record<string, number> }) {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h.startsWith("city=")) setSlug(h.slice(5));
    };
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (!slug) return <p className="text-[var(--muted)] text-sm mt-2">No city selected yet.</p>;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
  return <CityDeepPanel slug={slug} name={name} total={totals[slug] || 0} />;
}
