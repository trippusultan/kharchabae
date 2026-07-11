"use client";

// Simplified India map. Pins are positioned by approximate lat/long mapped to
// the viewBox. Not geographically perfect, but clear & accessible.
// City coords as [x, y] in a 0..1000 x 0..1000 viewBox.
const PINS: Record<string, { x: number; y: number; name: string }> = {
  mumbai:     { x: 250, y: 470, name: "Mumbai" },
  delhi:      { x: 420, y: 230, name: "Delhi" },
  bangalore:  { x: 360, y: 660, name: "Bengaluru" },
  hyderabad:  { x: 420, y: 560, name: "Hyderabad" },
  pune:       { x: 310, y: 520, name: "Pune" },
  chennai:    { x: 430, y: 720, name: "Chennai" },
  kolkata:    { x: 600, y: 360, name: "Kolkata" },
  goa:        { x: 290, y: 540, name: "Goa" },
  ahmedabad:  { x: 300, y: 380, name: "Ahmedabad" },
  jaipur:     { x: 380, y: 300, name: "Jaipur" },
};

export function IndiaMap({
  cities, onSelect, selected,
}: {
  cities: { slug: string; name: string; total: number }[];
  onSelect: (slug: string) => void;
  selected: string | null;
}) {
  return (
    <svg viewBox="0 0 1000 1000" className="w-full max-w-md mx-auto" role="group" aria-label="Map of India with city cost pins">
      {/* Stylised India landmass */}
      <path
        d="M300,150 C360,120 470,130 520,180 C560,210 600,200 640,250 C700,320 660,400 700,470 C740,540 700,620 660,700 C620,770 560,820 500,800 C440,780 420,720 380,700 C340,680 300,640 290,580 C280,520 250,500 250,460 C250,420 230,400 240,360 C250,320 270,300 270,260 C272,220 280,180 300,150 Z"
        fill="#141414" stroke="#c9a227" strokeWidth="3" opacity="0.9"
      />
      {cities.map((c) => {
        const p = PINS[c.slug];
        if (!p) return null;
        const isSel = selected === c.slug;
        return (
          <g key={c.slug} transform={`translate(${p.x},${p.y})`}
             tabIndex={0} role="button" aria-label={`${c.name}, ${c.total} rupees per month. Open details.`}
             onClick={() => onSelect(c.slug)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(c.slug)}
             style={{ cursor: "pointer", outline: "none" }}>
            <circle r={isSel ? 16 : 11} fill="#c9a227" stroke="#0a0a0a" strokeWidth="3"
              style={{ filter: isSel ? "drop-shadow(0 0 8px #e7c75a)" : "none" }} />
            <text x="0" y="-22" textAnchor="middle" fontSize="22" fill="#e8e3d6" fontWeight="700">{c.name}</text>
            <text x="0" y="34" textAnchor="middle" fontSize="18" fill="#c9a227">₹{c.total.toLocaleString("en-IN")}</text>
          </g>
        );
      })}
    </svg>
  );
}
