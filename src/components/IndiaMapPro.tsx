"use client";

import { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } from "react";
import { geoMercator, geoCentroid } from "d3-geo";
import { CITIES_GEO, STATE_OF, AREA_OFFSETS } from "@/lib/geodata";
import { inr } from "@/lib/cost";
import { CountUp } from "@/components/CountUp";
import statesData from "@/lib/states.json";

type Feat = { name: string; d: string };
type View = { k: number; x: number; y: number };

const W = 900, H = 1000;
const EASE = 0.22; // higher = snappier, lower = floatier

export function IndiaMapPro({ totals }: { totals: Record<string, number> }) {
  const [geo, setGeo] = useState<Feat[]>([]);
  const [activeState, setActiveState] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const gRef = useRef<SVGGElement>(null);
  const bgRef = useRef<SVGGElement>(null);
  const gLinksRef = useRef<SVGGElement>(null);
  const miniRectRef = useRef<SVGRectElement>(null);
  const miniSvgRef = useRef<SVGSVGElement>(null);
  const MINI_W = 168, MINI_H = (MINI_W * H) / W, MINI_S = MINI_W / W;
  const view = useRef<View>({ k: 1, x: 0, y: 0 });
  const target = useRef<View>({ k: 1, x: 0, y: 0 });
  const drag = useRef<{ lx: number; ly: number; lt: number } | null>(null);
  const vel = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // per-frame momentum
  const svgRef = useRef<SVGSVGElement>(null);
  const animating = useRef(false);
  const zoomAnchor = useRef<{ mx: number; my: number; wx: number; wy: number } | null>(null);

  const base = useMemo(() => geoMercator().scale(1100).center([80, 22]).translate([W / 2, H / 2]), []);

  // constellation links: intra-state webs + a few national hub spines
  const links = useMemo(() => {
    const out: { a: [number, number]; b: [number, number]; hub: boolean; state: string }[] = [];
    const byState: Record<string, typeof CITIES_GEO> = {};
    CITIES_GEO.forEach((c) => { (byState[STATE_OF[c.slug]] ||= []).push(c); });
    Object.entries(byState).forEach(([st, group]) => {
      for (let i = 0; i < group.length - 1; i++) {
        const c1 = group[i], c2 = group[i + 1];
        out.push({ a: base([c1.lng, c1.lat]) as [number, number], b: base([c2.lng, c2.lat]) as [number, number], hub: false, state: st });
      }
    });
    // national hub spine: Mumbai -> Delhi -> Bengaluru -> Hyderabad -> Chennai
    const spine = ["mumbai", "delhi", "bangalore", "hyderabad", "chennai"];
    for (let i = 0; i < spine.length - 1; i++) {
      const c1 = CITIES_GEO.find((c) => c.slug === spine[i])!;
      const c2 = CITIES_GEO.find((c) => c.slug === spine[i + 1])!;
      out.push({ a: base([c1.lng, c1.lat]) as [number, number], b: base([c2.lng, c2.lat]) as [number, number], hub: true, state: "hub" });
    }
    return out;
  }, [base]);

  // static, pre-simplified state geometry (no runtime fetch)
  useEffect(() => { setGeo(statesData as Feat[]); }, []);

  // imperative animation loop (NO React re-render per frame)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = view.current, t = target.current, d = drag.current;
      if (!d) {
        const dkx = t.k - v.k, dxx = t.x - v.x, dyy = t.y - v.y;
        const easing = Math.abs(dkx) > 0.0005 || Math.abs(dxx) > 0.05 || Math.abs(dyy) > 0.05;
        if (!easing && (Math.abs(vel.current.x) > 0.01 || Math.abs(vel.current.y) > 0.01)) {
          const nv = { k: v.k, x: v.x + vel.current.x, y: v.y + vel.current.y };
          view.current = nv; apply(nv);
          vel.current.x *= 0.93; vel.current.y *= 0.93;
          animating.current = true;
        } else {
          const nk = v.k + dkx * EASE;
          const nx = v.x + dxx * EASE;
          const ny = v.y + dyy * EASE;
          const moving = Math.abs(nk - v.k) > 0.0005 || Math.abs(nx - v.x) > 0.05 || Math.abs(ny - v.y) > 0.05;
          if (moving) {
            // if a wheel-zoom is mid-flight, keep the cursor point pinned
            const a = zoomAnchor.current;
            if (a) {
              const nv = { k: nk, x: a.mx - a.wx * nk, y: a.my - a.wy * nk };
              view.current = nv; apply(nv);
            } else {
              const nv = { k: nk, x: nx, y: ny };
              view.current = nv; apply(nv);
            }
          }
          if (!moving) zoomAnchor.current = null; // zoom settled, release anchor
          animating.current = moving;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // sequential draw-in of constellation lines when a state is entered
  useLayoutEffect(() => {
    const g = gLinksRef.current;
    if (!g) return;
    const lines = Array.from(g.querySelectorAll<SVGLineElement>("line"));
    // default: everything hidden (offset = full), then reveal
    lines.forEach((ln) => {
      const len = Number(ln.style.strokeDasharray) || 1;
      ln.style.transition = "none";
      ln.style.strokeDashoffset = String(len);
    });
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const reveal = (pred: (ln: SVGLineElement) => boolean, baseDelay = 0) => {
      let order = 0;
      lines.forEach((ln) => {
        if (!pred(ln)) return;
        const len = Number(ln.style.strokeDasharray) || 1;
        if (reduce) { ln.style.strokeDashoffset = "0"; return; }
        const delay = baseDelay + order * 140;
        order++;
        requestAnimationFrame(() => {
          ln.style.transition = `stroke-dashoffset .55s ease ${delay}ms`;
          ln.style.strokeDashoffset = "0";
        });
      });
    };
    if (activeState) {
      reveal((ln) => ln.dataset.state === activeState);
      reveal((ln) => ln.dataset.hub === "1", 200); // hub spine draws slightly after
    } else {
      reveal(() => true, 0); // reset: draw all in
    }
  }, [activeState]);

  const totalCitiesIn = useCallback((state: string) => CITIES_GEO.filter((c) => STATE_OF[c.slug] === state), []);

  // cost heat: cheaper -> muted green, pricier -> gold (stays in palette, not neon)
  const { stateCost, heatMin, heatMax } = useMemo(() => {
    const sc: Record<string, number> = {};
    CITIES_GEO.forEach((c) => {
      const t = totals[c.slug] || 0;
      if (t > 0) sc[STATE_OF[c.slug]] = Math.max(sc[STATE_OF[c.slug]] || 0, t);
    });
    const vals = Object.values(sc);
    return { stateCost: sc, heatMin: Math.min(...vals, 0), heatMax: Math.max(...vals, 1) };
  }, [totals]);

  function heatFill(state: string, active: boolean): string {
    if (active) return "#2a2410";
    const t = stateCost[state];
    if (!t) return "#141414";
    const n = (t - heatMin) / (heatMax - heatMin || 1); // 0..1
    const r = Math.round(28 + (201 - 28) * n);
    const g = Math.round(58 + (162 - 58) * n);
    const b = Math.round(43 + (39 - 43) * n);
    return `rgb(${r},${g},${b})`;
  }

  const rankedStates = useMemo(
    () => Object.entries(stateCost)
      .map(([name, cost]) => ({ name, cost }))
      .sort((a, b) => a.cost - b.cost),
    [stateCost]
  );

  function flyTo(b: [[number, number], [number, number]], pad = 90, maxK = 7) {
    const [[x0, y0], [x1, y1]] = b;
    const w = x1 - x0, h = y1 - y0;
    const k = Math.min((W - pad * 2) / w, (H - pad * 2) / h, maxK);
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    target.current = { k, x: W / 2 - cx * k, y: H / 2 - cy * k };
  }

  function clickState(name: string) {
    const cities = totalCitiesIn(name);
    if (!cities.length) return;
    setActiveState(name);
    setActiveCity(null);
    const pts = cities.map((c) => base([c.lng, c.lat]) as [number, number]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    flyTo([[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]]);
  }

  function clickCity(c: { slug: string; lat: number; lng: number; name: string }) {
    if (compareMode) {
      setCompare((prev) => {
        if (prev.includes(c.slug)) return prev.filter((s) => s !== c.slug);
        if (prev.length >= 2) return [prev[1], c.slug];
        return [...prev, c.slug];
      });
      return;
    }
    setActiveCity(c.slug);
    window.location.hash = `city=${c.slug}`;
    const p = base([c.lng, c.lat]) as [number, number];
    target.current = { k: 5.5, x: W / 2 - p[0] * 5.5, y: H / 2 - p[1] * 5.5 };
  }

  function toggleCompare() {
    setCompareMode((m) => {
      const next = !m;
      if (!next) setCompare([]);
      return next;
    });
  }

  function shareCompare() {
    if (compare.length < 2) return;
    const url = `${window.location.origin}${window.location.pathname}#compare=${compare[0]},${compare[1]}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }

  // restore compare selection from URL hash on load
  useEffect(() => {
    const h = window.location.hash.match(/compare=([a-z]+),([a-z]+)/i);
    if (h) {
      const slugs = [h[1], h[2]].filter((s) => CITIES_GEO.some((c) => c.slug === s));
      if (slugs.length === 2) {
        setCompare(slugs);
        setCompareMode(true);
        const a = CITIES_GEO.find((c) => c.slug === slugs[0])!;
        const pa = base([a.lng, a.lat]) as [number, number];
        target.current = { k: 4, x: W / 2 - pa[0] * 4, y: H / 2 - pa[1] * 4 };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reset() {
    setActiveState(null); setActiveCity(null); setCompare([]);
    target.current = { k: 1, x: 0, y: 0 };
  }

  // wheel + pan: immediate, no easing
  function apply(v: View) {
    view.current = v; target.current = v;
    const g = gRef.current;
    if (g) {
      g.setAttribute("transform", `translate(${v.x} ${v.y}) scale(${v.k})`);
      const s = 1 / v.k;
      g.querySelectorAll<SVGGElement>(".pin").forEach((el) => {
        el.setAttribute("transform", `translate(${el.dataset.x} ${el.dataset.y}) scale(${s})`);
      });
    }
    // background parallax: drifts opposite + scales slower for depth
    const bg = bgRef.current;
    if (bg) {
      const bk = v.k * 0.82;
      bg.setAttribute("transform", `translate(${-v.x * 0.35} ${-v.y * 0.35}) scale(${bk})`);
    }
    // minimap viewport rectangle (imperative, no React re-render)
    const mr = miniRectRef.current;
    if (mr) {
      const rx = v.x * MINI_S, ry = v.y * MINI_S;
      const rw = W * v.k * MINI_S, rh = H * v.k * MINI_S;
      mr.setAttribute("x", String(rx));
      mr.setAttribute("y", String(ry));
      mr.setAttribute("width", String(rw));
      mr.setAttribute("height", String(rh));
    }
  }
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    vel.current = { x: 0, y: 0 };
    const rect = svgRef.current!.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    const my = ((e.clientY - rect.top) / rect.height) * H;
    const v = view.current;
    // world point currently under the cursor (so it stays pinned while zooming)
    const wx = (mx - v.x) / v.k;
    const wy = (my - v.y) / v.k;
    zoomAnchor.current = { mx, my, wx, wy };
    const nk = Math.min(14, Math.max(1, v.k * (e.deltaY < 0 ? 1.25 : 0.8)));
    // set target only; the rAF loop eases k and re-pins the anchor each frame
    target.current = { k: nk, x: mx - wx * nk, y: my - wy * nk };
  }
  function onDown(e: React.PointerEvent) {
    drag.current = { lx: e.clientX, ly: e.clientY, lt: performance.now() };
    vel.current = { x: 0, y: 0 };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = (e.clientX - d.lx) * (W / rect.width);
    const sy = (e.clientY - d.ly) * (H / rect.height);
    const now = performance.now();
    const dt = Math.max(1, now - d.lt);
    // velocity in view-units per frame (~16ms), clamped for sanity
    vel.current = {
      x: Math.max(-80, Math.min(80, (sx * (16 / dt)))),
      y: Math.max(-80, Math.min(80, (sy * (16 / dt)))),
    };
    d.lx = e.clientX; d.ly = e.clientY; d.lt = now;
    apply({ k: view.current.k, x: view.current.x + sx, y: view.current.y + sy });
  }
  function onUp() {
    // keep last vel.current so the loop glides + decays (inertia)
    drag.current = null;
  }

  // minimap: click/drag to recenter the main view
  function flyToWorldCenter(wx: number, wy: number, k = view.current.k) {
    vel.current = { x: 0, y: 0 };
    target.current = { k, x: W / 2 - wx * k, y: H / 2 - wy * k };
  }
  function onMini(e: React.PointerEvent) {
    const svg = miniSvgRef.current; if (!svg) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const move = (ev: React.PointerEvent) => {
      const rect = svg.getBoundingClientRect();
      const mx = ((ev.clientX - rect.left) / rect.width) * MINI_W;
      const my = ((ev.clientY - rect.top) / rect.height) * MINI_H;
      const wx = mx / MINI_S, wy = my / MINI_S;
      flyToWorldCenter(wx, wy);
    };
    move(e);
    const mm = (ev: PointerEvent) => {
      const rect = svg.getBoundingClientRect();
      const mx = ((ev.clientX - rect.left) / rect.width) * MINI_W;
      const my = ((ev.clientY - rect.top) / rect.height) * MINI_H;
      flyToWorldCenter(mx / MINI_S, my / MINI_S);
    };
    const mu = () => {
      window.removeEventListener("pointermove", mm);
      window.removeEventListener("pointerup", mu);
    };
    window.addEventListener("pointermove", mm);
    window.addEventListener("pointerup", mu);
  }

  const citiesShown = activeState ? totalCitiesIn(activeState) : [];
  const areasShown = activeCity && AREA_OFFSETS[activeCity]
    ? AREA_OFFSETS[activeCity].map((a) => {
        const c = CITIES_GEO.find((x) => x.slug === activeCity)!;
        const p = base([c.lat + a.dlat, c.lng + a.dlng]) as [number, number];
        return { name: a.name, x: p[0], y: p[1] };
      })
    : [];

  return (
    <div className="neo p-5 md:p-6 relative">
      <div className="flex items-center gap-2 text-sm mb-4 px-1">
        <button className="gold hover:gold-soft underline" onClick={reset}>🇮🇳 India</button>
        {activeState && (
          <span className="text-[var(--muted)]">› <button className="gold underline" onClick={() => { setActiveCity(null); reset(); }}>{activeState}</button></span>
        )}
        {activeCity && (
          <span className="text-[var(--muted)]">› <span className="gold-text">{CITIES_GEO.find((c) => c.slug === activeCity)?.name}</span></span>
        )}
        <span className="ml-auto text-xs text-[var(--muted)] flex items-center gap-3">
          <button type="button" onClick={toggleCompare}
            className={`px-2.5 py-1 rounded-lg text-xs transition ${compareMode ? "bg-[#241f10] text-[#e7c75a]" : "text-[#cfc9ba] hover:bg-[#161616]"}`}
            style={{ outline: "none" }} aria-pressed={compareMode}>
            {compareMode ? "✓ Compare: pick 2 cities" : "Compare cities"}
          </button>
          <span>scroll = zoom · drag = pan</span>
        </span>
      </div>

      <div className="relative overflow-hidden rounded-xl">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none"
        style={{ height: "76vh", cursor: drag.current ? "grabbing" : "grab", display: "block" }}
        onWheel={onWheel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        role="application" aria-label="Zoomable map of India. Click a state, then a city, to see costs.">

        {/* background parallax layer */}
        <defs>
          <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="#c9a227" opacity="0.18" />
          </pattern>
        </defs>
        <g ref={bgRef}>
          <rect x={-2000} y={-2000} width={5000} height={5000} fill="url(#dots)" />
        </g>

        <g ref={gRef}>
          {geo.map((f) => {
            const hasData = totalCitiesIn(f.name).length > 0;
            const isActive = activeState === f.name;
            return (
              <path key={f.name} className="state-path" d={f.d}
                tabIndex={hasData ? 0 : -1}
                role={hasData ? "button" : undefined}
                aria-label={hasData ? `${f.name}, has cost data. Zoom in.` : undefined}
                onClick={() => hasData && clickState(f.name)}
                onKeyDown={(e) => hasData && (e.key === "Enter" || e.key === " ") && clickState(f.name)}
                fill={heatFill(f.name, isActive)}
                stroke={hasData ? "#c9a227" : "#3a3424"}
                strokeWidth={hasData ? 1.5 : 0.6}
                vectorEffect="non-scaling-stroke"
                opacity={activeState && !isActive ? 0.32 : 1}
                style={{ cursor: hasData ? "pointer" : "default", transition: "fill .2s, opacity .2s" }}
              />
            );
          })}

          {/* constellation connectors */}
          <g ref={gLinksRef}>
          {links.map((l, i) => {
            const len = Math.hypot(l.b[0] - l.a[0], l.b[1] - l.a[1]);
            return (
              <line key={i} data-state={l.state} data-hub={l.hub ? "1" : "0"}
                x1={l.a[0].toFixed(3)} y1={l.a[1].toFixed(3)} x2={l.b[0].toFixed(3)} y2={l.b[1].toFixed(3)}
                stroke="#c9a227" strokeWidth={l.hub ? 1.1 : 0.7} opacity={l.hub ? 0.28 : 0.14}
                vectorEffect="non-scaling-stroke" className="constellation"
                style={{ strokeDasharray: Number(len.toFixed(4)) } as any} />
            );
          })}
          </g>

          {citiesShown.map((c, i) => {
            const p = base([c.lng, c.lat]) as [number, number];
            const tot = totals[c.slug] || 0;
            const isSel = activeCity === c.slug;
            return (
              <g key={c.slug} className="pin" data-x={p[0].toFixed(3)} data-y={p[1].toFixed(3)}
                tabIndex={0} role="button" aria-label={`${c.name}, ${inr(tot)} per month. Open.`}
                onClick={(e) => { e.stopPropagation(); clickCity(c); }}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && clickCity(c)}
                style={{ cursor: "pointer", outline: "none" }}>
                <g className="pin-pop" style={{ animationDelay: `${i * 70}ms` }}>
                  {isSel && <circle className="pin-pulse" r={11} fill="none" stroke="#e7c75a" strokeWidth={2} vectorEffect="non-scaling-stroke" />}
                  <circle r={9} fill="#c9a227" stroke="#0a0a0a" strokeWidth={2} vectorEffect="non-scaling-stroke"
                    style={{ filter: isSel ? "drop-shadow(0 0 6px #e7c75a)" : "none" }} />
                  <text y={26} textAnchor="middle" fontSize={15} fill="#e8e3d6" fontWeight={700}
                    style={{ paintOrder: "stroke", stroke: "#0a0a0a", strokeWidth: 3, strokeLinejoin: "round" } as any}>
                    {c.name}
                  </text>
                  {tot > 0 && (
                    <text y={42} textAnchor="middle" fontSize={11} fill="#c9a227" fontWeight={600}
                      style={{ paintOrder: "stroke", stroke: "#0a0a0a", strokeWidth: 3, strokeLinejoin: "round" } as any}>
                      ₹{tot.toLocaleString("en-IN")}
                    </text>
                  )}
                </g>
              </g>
            );
          })}

          {/* compare connector between two selected cities */}
          {compare.length === 2 && (() => {
            const a = CITIES_GEO.find((c) => c.slug === compare[0])!;
            const b = CITIES_GEO.find((c) => c.slug === compare[1])!;
            const pa = base([a.lng, a.lat]) as [number, number];
            const pb = base([b.lng, b.lat]) as [number, number];
            return (
              <line x1={pa[0].toFixed(3)} y1={pa[1].toFixed(3)} x2={pb[0].toFixed(3)} y2={pb[1].toFixed(3)}
                stroke="#e7c75a" strokeWidth={1.6} opacity={0.85} strokeDasharray="6 5"
                vectorEffect="non-scaling-stroke" className="compare-link" />
            );
          })()}

          {areasShown.map((a) => (
            <g key={a.name} className="pin" data-x={a.x.toFixed(3)} data-y={a.y.toFixed(3)} style={{ outline: "none" }}>
              <circle r={5} fill="#e7c75a" stroke="#0a0a0a" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              <text y={15} textAnchor="middle" fontSize={11} fill="#e8e3d6"
                style={{ paintOrder: "stroke", stroke: "#0a0a0a", strokeWidth: 3, strokeLinejoin: "round" } as any}>
                {a.name}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {/* minimap overview (bottom-right, draggable viewport) */}
      <div className="absolute bottom-4 right-4 neo p-2 rounded-xl" style={{ width: MINI_W, pointerEvents: "auto" }}>
        <svg ref={miniSvgRef} viewBox={`0 0 ${MINI_W} ${MINI_H}`} className="w-full touch-none select-none cursor-pointer"
          style={{ height: MINI_H, display: "block" }} onPointerDown={onMini}
          role="img" aria-label="Map overview. Drag to recenter.">
          <g transform={`scale(${MINI_S})`}>
            {geo.map((f) => (
              <path key={f.name} d={f.d} fill="#141414" stroke="#3a3424" strokeWidth={1.5} opacity={0.9} />
            ))}
            {CITIES_GEO.map((c) => {
              const p = base([c.lng, c.lat]) as [number, number];
              return <circle key={c.slug} cx={Number(p[0].toFixed(3))} cy={Number(p[1].toFixed(3))} r={6} fill="#c9a227" />;
            })}
          </g>
          <rect ref={miniRectRef} x={0} y={0} width={MINI_W} height={MINI_H} fill="rgba(201,162,39,0.12)" stroke="#e7c75a" strokeWidth={1.5} vectorEffect="non-scaling-stroke" rx={2} />
        </svg>
      </div>
      </div>

      {/* cost heat legend + interactive state list (a11y bridge) */}
      <div className="mt-5">
        <div className="flex items-center gap-3 text-xs mb-2" aria-hidden="true">
          <span className="text-[#3ca23e]">Cheaper</span>
          <div className="h-2 flex-1 rounded-full"
            style={{ background: "linear-gradient(90deg, rgb(28,58,43), rgb(114,110,41), rgb(201,162,39))" }} />
          <span className="gold-text">Pricier</span>
        </div>
        <ul className="grid grid-cols-2 gap-1.5">
          {rankedStates.map((s) => (
            <li key={s.name}>
              <button type="button" onClick={() => clickState(s.name)}
                aria-label={`${s.name}, ${inr(s.cost)} per month. Zoom in.`}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition ${activeState === s.name ? "bg-[#241f10] text-[#e7c75a]" : "text-[#cfc9ba] hover:bg-[#161616]"}`}
                style={{ outline: "none" }}>
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: heatFill(s.name, false) }} />
                <span className="flex-1 truncate">{s.name}</span>
                <span className="gold-text">{inr(s.cost)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* floating compare dock */}
      {compare.length > 0 && (
        <div className="mt-5 neo-inset p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs gold-text">Compare {compare.length}/2</span>
            <div className="flex items-center gap-3">
              {compare.length === 2 && (
                <button type="button" onClick={shareCompare} className="text-xs gold-text hover:gold-soft" style={{ outline: "none" }}>
                  {copied ? "✓ copied!" : "share ↗"}
                </button>
              )}
              <button type="button" onClick={() => setCompare([])} className="text-xs text-[var(--muted)] hover:gold-soft" style={{ outline: "none" }}>clear</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((idx) => {
              const slug = compare[idx];
              const c = slug ? CITIES_GEO.find((x) => x.slug === slug) : null;
              const t = c ? totals[c.slug] || 0 : 0;
              return (
                <div key={idx} className="rounded-lg bg-[#141414] p-2.5">
                  <div className="text-sm gold-text truncate">{c ? c.name : "—"}</div>
                  <div className="text-lg font-bold text-[#e8e3d6]">{c ? <>₹<CountUp value={t} /></> : "—"}</div>
                  <div className="text-[10px] text-[var(--muted)]">/ month</div>
                </div>
              );
            })}
          </div>
          {compare.length === 2 && (() => {
            const t0 = totals[compare[0]] || 0, t1 = totals[compare[1]] || 0;
            const diff = t1 - t0;
            const pct = t0 ? Math.round((diff / t0) * 100) : 0;
            const a = CITIES_GEO.find((x) => x.slug === compare[0])!;
            const b = CITIES_GEO.find((x) => x.slug === compare[1])!;
            return (
              <div className="mt-2 text-center text-xs">
                <span className="text-[var(--muted)]">{a.name} is </span>
                <span className={diff === 0 ? "gold-text" : diff > 0 ? "text-[#e0a0a0]" : "text-[#3ca23e]"}>
                  {diff === 0 ? "same cost" : `${diff > 0 ? "₹" + inr(diff) + " (" + pct + "%) pricier" : "₹" + inr(-diff) + " (" + pct + "%) cheaper"}`}
                </span>
                <span className="text-[var(--muted)]"> than {b.name}</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
