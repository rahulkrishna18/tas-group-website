"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import SceneCanvas from "../three/SceneCanvas";
import type { Mode } from "../three/Globe";
import { OFFICES, OfficeId } from "@/content/site";
import { REGION_COUNTRIES, REGION_LABELS, REGION_LAND, REGION_OFFICES, REGION_ROUTES, REGION_VIEWBOX } from "@/data/geo/regionMap";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { SectionHeader } from "../ui/Section";
import { ArrowRight, Phone, Pin, Plane, Ship, Truck } from "../ui/Icons";

const loadNetworkGlobeScene = () => import("../scenes/NetworkGlobeScene");
const NetworkGlobeScene = dynamic(loadNetworkGlobeScene, { ssr: false });

const MODES: { id: Mode; label: string; icon: typeof Ship; swatch: string }[] = [
  { id: "sea", label: "Sea", icon: Ship, swatch: "bg-cyan" },
  { id: "air", label: "Air", icon: Plane, swatch: "bg-cargo" },
  { id: "land", label: "Land", icon: Truck, swatch: "bg-foam" },
];

export function prefillQuote(detail: Record<string, string>) {
  window.dispatchEvent(new CustomEvent("tas:prefill", { detail }));
  document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
}

export default function Network() {
  const mobile = useIsMobile();
  const [view, setView] = useState<"globe" | "region">("globe");
  const [selected, setSelected] = useState<OfficeId>("penang");
  const [modes, setModes] = useState<Mode[]>(["sea", "air", "land"]);
  const [zoom, setZoom] = useState(2.4);
  const office = OFFICES.find((o) => o.id === selected)!;

  useEffect(() => {
    if (mobile) setView("region");
  }, [mobile]);

  const toggleMode = (m: Mode) => setModes((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));

  return (
    <section id="network" aria-label="Operational network" className="relative overflow-hidden bg-abyss py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_40%,rgb(18_103_165/0.22),transparent_70%)]" />
      <div className="container-x relative">
        <SectionHeader
          code="07"
          eyebrow="Network"
          title={
            <>
              Penang roots. <span className="text-cyan">Regional reach.</span>
            </>
          }
          intro="Five offices across Peninsular Malaysia, Langkawi and Singapore, covering seaports, an air cargo hub and cross border road routes. Select a node to see the office."
        />

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-8">
          {/* Map / globe */}
          <div className="relative overflow-hidden border border-foam/10 bg-midnight/60">
            <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
              <div role="tablist" aria-label="Map view" className="inline-flex border border-foam/15 bg-abyss/80 p-1 backdrop-blur">
                {(["globe", "region"] as const).map((v) => (
                  <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`label px-3 py-1.5 ${view === v ? "bg-foam text-abyss" : "text-mist hover:text-foam"}`}>
                    {v === "globe" ? "3D globe" : "Region map"}
                  </button>
                ))}
              </div>
              <div className="flex gap-1" role="group" aria-label="Filter routes by transport mode">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    aria-pressed={modes.includes(m.id)}
                    onClick={() => toggleMode(m.id)}
                    className={`label flex items-center gap-2 border px-2.5 py-1.5 backdrop-blur transition-colors ${modes.includes(m.id) ? "border-foam/30 bg-abyss/80 text-foam" : "border-foam/10 bg-abyss/40 text-steel line-through"}`}
                  >
                    <span className={`h-1.5 w-3 ${m.swatch}`} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative aspect-[4/5] sm:aspect-[16/12] lg:aspect-auto lg:h-[min(78vh,760px)]">
              {view === "globe" ? (
                <>
                  <SceneCanvas preload={loadNetworkGlobeScene} className="absolute inset-0 cursor-grab active:cursor-grabbing" camera={{ fov: 32, near: 0.01, far: 50, position: [0, 0, 2.4] }} mountMargin="40% 0px">
                    <NetworkGlobeScene selected={selected} onSelect={setSelected} modes={modes} zoom={zoom} />
                  </SceneCanvas>
                  <div className="absolute bottom-16 right-3 z-10 flex flex-col border border-foam/15 bg-abyss/80 backdrop-blur sm:right-4">
                    <button aria-label="Zoom in" className="grid h-9 w-9 place-items-center text-foam hover:bg-foam/10" onClick={() => setZoom((z) => Math.max(1.3, z - 0.35))}>
                      +
                    </button>
                    <button aria-label="Zoom out" className="grid h-9 w-9 place-items-center border-t border-foam/15 text-foam hover:bg-foam/10" onClick={() => setZoom((z) => Math.min(4.5, z + 0.5))}>
                      −
                    </button>
                  </div>
                  <p className="label pointer-events-none absolute left-4 top-16 z-10 hidden text-steel sm:block">Drag to rotate</p>
                </>
              ) : (
                <RegionMap selected={selected} onSelect={setSelected} modes={modes} />
              )}
            </div>

            {/* legend */}
            <div className="relative z-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-foam/10 bg-abyss/70 px-4 py-3">
              <span className="label flex items-center gap-2 text-foam">
                <span className="h-0.5 w-6 bg-foam" /> Land haulage MY ⇄ SG · published service area
              </span>
              <span className="label flex items-center gap-2 text-steel">
                <span className="w-6 border-t border-dashed border-cyan" /> <span className="w-6 border-t border-dashed border-cargo" /> Illustrative routes · demonstration only
              </span>
            </div>
          </div>

          {/* Office panel */}
          <div className="flex flex-col gap-4">
            <ul className="grid grid-cols-5 gap-1" aria-label="Offices">
              {OFFICES.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => setSelected(o.id)}
                    aria-pressed={o.id === selected}
                    className={`w-full border px-1 py-3 text-center transition-colors ${o.id === selected ? "border-cargo bg-cargo/10" : "border-foam/10 hover:border-foam/30"}`}
                  >
                    <span className={`label block ${o.id === selected ? "text-cargo" : "text-steel"}`}>{o.code}</span>
                    <span className="mt-1 block truncate text-[0.8rem] text-foam">{o.name}</span>
                  </button>
                </li>
              ))}
            </ul>

            <article key={office.id} className="flex-1 animate-[fadeUp_.5s_var(--ease-ship)] border border-foam/10 bg-midnight/70 p-6" aria-live="polite">
              <p className="label flex items-center gap-2 text-cyan">
                <span className={`h-2 w-2 rotate-45 ${office.id === "penang" ? "bg-cargo" : "bg-cyan"}`} />
                {office.role}
              </p>
              <h3 className="display mt-3 text-5xl text-foam">{office.name}</h3>
              <p className="label mt-2 text-steel">
                {office.lat.toFixed(2)}°N {office.lon.toFixed(2)}°E
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <p className="label mb-2 flex items-center gap-2 text-steel">
                    <Pin className="h-3.5 w-3.5" /> Address
                  </p>
                  <address className="text-[0.95rem] not-italic leading-relaxed text-foam/90">
                    {office.address.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </address>
                </div>
                <div>
                  <p className="label mb-2 flex items-center gap-2 text-steel">
                    <Phone className="h-3.5 w-3.5" /> Contact
                  </p>
                  <a href={`tel:${office.phone.replace(/[^\d+]/g, "")}`} className="block text-foam hover:text-cargo">
                    T {office.phone}
                  </a>
                  {office.fax && <span className="block text-mist">F {office.fax}</span>}
                </div>
              </div>

              <p className="label mb-2 mt-6 text-steel">At this location</p>
              <ul className="space-y-1.5">
                {office.capabilities.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[0.95rem] text-foam/90">
                    <span className="mt-2 h-px w-3 shrink-0 bg-cargo" />
                    {c}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => prefillQuote({ origin: office.name })} className="btn-cargo !py-3">
                  Quote from {office.name} <ArrowRight className="arrow h-4 w-4" />
                </button>
                <a
                  className="btn-ghost !py-3"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address.join(", "))}`}
                >
                  Directions
                </a>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegionMap({ selected, onSelect, modes }: { selected: OfficeId; onSelect: (id: OfficeId) => void; modes: Mode[] }) {
  const { w, h } = REGION_VIEWBOX;
  const klia = REGION_OFFICES.klia;
  return (
    <div className="absolute inset-0 flex items-center justify-center p-2 pt-14">
      <div className="relative h-full max-w-full" style={{ aspectRatio: `${w} / ${h}` }}>
        <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 h-full w-full" role="img" aria-label="Map of Peninsular Malaysia and Singapore showing TAS office locations">
          <defs>
            <pattern id="region-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="#20b9d4" strokeOpacity=".06" />
            </pattern>
          </defs>
          <rect width={w} height={h} fill="url(#region-grid)" />
          <path d={REGION_LAND} fill="#163b55" stroke="#20b9d4" strokeOpacity=".45" strokeWidth="1" />
          {REGION_COUNTRIES.map((c) => (
            <path key={c.name} d={c.d ?? ""} fill="none" stroke="#edf3f5" strokeOpacity=".12" strokeDasharray="3 4" />
          ))}
          {REGION_LABELS.map((l) => (
            <text
              key={l.t}
              x={l.p[0]}
              y={l.p[1]}
              transform={l.r ? `rotate(${l.r} ${l.p[0]} ${l.p[1]})` : undefined}
              fill={l.k === "sea" ? "#20b9d4" : "#75838c"}
              fillOpacity={l.k === "sea" ? 0.5 : 0.8}
              fontSize={l.k === "sea" ? 13 : 14}
              letterSpacing={l.k === "sea" ? 3 : 5}
              textAnchor="middle"
              style={{ fontFamily: "var(--font-mono)", fontStyle: l.k === "sea" ? "italic" : "normal" }}
            >
              {l.t}
            </text>
          ))}
          {modes.includes("sea") && (
            <>
              <path d={REGION_ROUTES.seaMalacca} fill="none" stroke="#20b9d4" strokeWidth="2" className="route-flow" />
              <path d={REGION_ROUTES.seaLangkawi} fill="none" stroke="#20b9d4" strokeWidth="2" className="route-flow" />
            </>
          )}
          {modes.includes("air") && (
            <path d={`M${klia[0]},${klia[1]} Q${klia[0] + 160},${klia[1] - 420} ${w + 40},${120}`} fill="none" stroke="#f28c28" strokeWidth="2" strokeDasharray="4 8" className="route-flow" />
          )}
          {modes.includes("land") && (
            <>
              <path d={REGION_ROUTES.landCorridor} fill="none" stroke="#06141d" strokeWidth="7" strokeLinejoin="round" />
              <path d={REGION_ROUTES.landCorridor} fill="none" stroke="#edf3f5" strokeWidth="2.5" strokeLinejoin="round" />
              <circle r="5" fill="#f28c28">
                <animateMotion path={REGION_ROUTES.landCorridor} dur="14s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>
        {/* office nodes as accessible buttons */}
        {OFFICES.map((o) => {
          const [x, y] = REGION_OFFICES[o.id];
          const on = o.id === selected;
          const hq = o.id === "penang";
          const left = o.id === "portklang";
          return (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              aria-pressed={on}
              aria-label={`${o.name} ${o.role}`}
              className="group absolute -translate-x-1/2 -translate-y-1/2 p-2"
              style={{ left: `${(x / w) * 100}%`, top: `${(y / h) * 100}%` }}
            >
              <span className={`absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full ${hq ? "bg-cargo/25" : "bg-cyan/20"} ${on ? "animate-ping" : ""}`} />
              <span className={`relative block h-3.5 w-3.5 rotate-45 border-2 transition-transform group-hover:scale-125 ${hq ? "border-cargo" : "border-cyan"} ${on ? (hq ? "bg-cargo" : "bg-cyan") : "bg-abyss"}`} />
              <span
                className={`label pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm bg-abyss/80 px-1.5 py-0.5 ${left ? "right-7" : "left-7"} ${on ? "text-foam" : "text-mist"}`}
              >
                <span className={hq ? "text-cargo" : "text-cyan"}>{o.code}</span> {o.name}
              </span>
            </button>
          );
        })}
        <span className="label pointer-events-none absolute bottom-2 right-2 text-steel/70">
          <Plane className="mr-1 inline h-3 w-3" /> via KLIA
        </span>
      </div>
    </div>
  );
}
