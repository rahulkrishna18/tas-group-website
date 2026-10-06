"use client";

import { useState } from "react";
import { ENTITIES, SERVICES, ServiceId } from "@/content/site";
import { Reveal, SectionHeader } from "../ui/Section";

const W = 1200;
const H = 640;
const X = { root: 110, entity: 430, service: 800, out: 1100 };
const ey = (i: number) => 70 + i * ((H - 140) / (ENTITIES.length - 1));
const sy = (i: number) => 60 + i * ((H - 120) / (SERVICES.length - 1));
const curve = (x0: number, y0: number, x1: number, y1: number) => {
  const mx = (x0 + x1) / 2;
  return `M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
};

export default function Ecosystem() {
  const [active, setActive] = useState<string>("agency");
  const ent = ENTITIES.find((e) => e.id === active)!;
  const lit = new Set<ServiceId>(ent.links);
  const serviceIndex = (id: ServiceId) => SERVICES.findIndex((s) => s.id === id);

  return (
    <section id="group" aria-label="TAS Group companies" className="chart-grid-light relative bg-paper py-24 text-abyss lg:py-32">
      <div className="container-x">
        <SectionHeader
          tone="light"
          code="08"
          eyebrow="The Group"
          title={
            <>
              Six companies. <span className="text-marine">One operation.</span>
            </>
          }
          intro="TAS Group brings together six companies. Each covers part of the logistics chain or the Group’s management, and together they cover the cargo’s whole path. Select a company to trace its role."
        />

        {/* Desktop flow diagram */}
        <Reveal className="mt-14 hidden lg:block">
          <div className="border border-abyss/10 bg-white/60 p-6 backdrop-blur-sm">
            <div className="relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Diagram: TAS Group companies linked to their logistics disciplines, converging on one integrated journey">
              {/* root → entities */}
              {ENTITIES.map((e, i) => (
                <path key={e.id} d={curve(X.root + 70, H / 2, X.entity - 120, ey(i))} fill="none" stroke={e.id === active ? "#f28c28" : "#75838c"} strokeOpacity={e.id === active ? 1 : 0.35} strokeWidth={e.id === active ? 2 : 1} />
              ))}
              {/* entities → services */}
              {ENTITIES.flatMap((e, i) =>
                e.links.map((sid) => {
                  const on = e.id === active;
                  return (
                    <path
                      key={`${e.id}-${sid}`}
                      d={curve(X.entity + 120, ey(i), X.service - 130, sy(serviceIndex(sid)))}
                      fill="none"
                      stroke={on ? "#f28c28" : "#1267a5"}
                      strokeOpacity={on ? 1 : 0.22}
                      strokeWidth={on ? 2.5 : 1.2}
                      strokeDasharray={e.verifiedRole ? undefined : "5 6"}
                      className={on ? "route-flow" : undefined}
                      style={on && e.verifiedRole ? { strokeDasharray: "14 6" } : undefined}
                    />
                  );
                })
              )}
              {/* services → outcome */}
              {SERVICES.map((s, i) => (
                <path key={s.id} d={curve(X.service + 130, sy(i), X.out - 70, H / 2)} fill="none" stroke={lit.has(s.id) ? "#f28c28" : "#20b9d4"} strokeOpacity={lit.has(s.id) ? 0.9 : 0.35} strokeWidth={lit.has(s.id) ? 2 : 1} />
              ))}

              {/* root */}
              <g transform={`translate(${X.root} ${H / 2})`}>
                <rect x="-80" y="-44" width="160" height="88" fill="#06141d" />
                <text y="-8" textAnchor="middle" fill="#edf3f5" fontSize="26" fontWeight="800" style={{ fontFamily: "var(--font-display)" }}>
                  TAS
                </text>
                <text y="20" textAnchor="middle" fill="#c9d6dc" fontSize="10" letterSpacing="2.4" style={{ fontFamily: "var(--font-mono)" }}>
                  GROUP OF COMPANIES
                </text>
              </g>
              {/* outcome */}
              <g transform={`translate(${X.out} ${H / 2})`}>
                <circle r="62" fill="#f28c28" />
                <circle r="78" fill="none" stroke="#f28c28" strokeOpacity=".35" className="node-ping" />
                <text y="-6" textAnchor="middle" fill="#06141d" fontSize="15" fontWeight="800" style={{ fontFamily: "var(--font-display)" }}>
                  ONE
                </text>
                <text y="14" textAnchor="middle" fill="#06141d" fontSize="15" fontWeight="800" style={{ fontFamily: "var(--font-display)" }}>
                  JOURNEY
                </text>
              </g>
              {/* services */}
              {SERVICES.map((s, i) => (
                <g key={s.id} transform={`translate(${X.service} ${sy(i)})`}>
                  <rect x="-130" y="-22" width="260" height="44" fill={lit.has(s.id) ? "#0b2233" : "#ffffff"} stroke={lit.has(s.id) ? "#f28c28" : "rgb(6 20 29 / .12)"} />
                  <text x="-114" y="5" fill={lit.has(s.id) ? "#f28c28" : "#75838c"} fontSize="11" style={{ fontFamily: "var(--font-mono)" }}>
                    {s.index}
                  </text>
                  <text x="-88" y="5" fill={lit.has(s.id) ? "#edf3f5" : "#0b2233"} fontSize="14" fontWeight="500">
                    {s.title.replace(", Heavy Lift & Mover", " & Heavy Lift")}
                  </text>
                </g>
              ))}
            </svg>

            {/* entity buttons overlaid on the diagram's entity column */}
            {ENTITIES.map((e, i) => (
              <button
                key={e.id}
                onClick={() => setActive(e.id)}
                onMouseEnter={() => setActive(e.id)}
                onFocus={() => setActive(e.id)}
                aria-pressed={e.id === active}
                className={`absolute -translate-x-1/2 -translate-y-1/2 border px-3 py-2 text-left transition-all duration-300 ${e.id === active ? "z-10 scale-105 border-cargo bg-abyss text-foam shadow-xl" : "border-abyss/15 bg-white text-abyss hover:border-abyss/40"}`}
                style={{ left: `${(X.entity / W) * 100}%`, top: `${(ey(i) / H) * 100}%`, width: "20%" }}
              >
                <span className={`label block text-[0.6rem] ${e.id === active ? "text-cargo" : "text-steel"}`}>{e.reg}</span>
                <span className="mt-0.5 block text-[0.9rem] font-medium leading-tight">{e.name}</span>
              </button>
            ))}
            </div>
          </div>
        </Reveal>

        {/* Detail + legend */}
        <div className="mt-6 hidden gap-6 lg:grid lg:grid-cols-[1fr_auto] lg:items-start">
          <div key={ent.id} className="animate-[fadeUp_.5s_var(--ease-ship)] border-l-2 border-cargo bg-white/70 p-5">
            <p className="label text-steel">
              {ent.name} Sdn Bhd · {ent.reg}
            </p>
            <p className="display-wide mt-2 text-2xl">{ent.role}</p>
            <p className="mt-2 text-sm text-hull/80">
              {ent.links.length ? `Linked disciplines: ${ent.links.map((l) => SERVICES.find((s) => s.id === l)!.title).join(" · ")}` : "Management and holding entity for the Group."}
            </p>
          </div>
          <div className="label space-y-2 text-hull/70">
            <p className="flex items-center gap-2">
              <span className="w-6 border-t-2 border-marine" /> Role published by TAS
            </p>
            <p className="flex items-center gap-2">
              <span className="w-6 border-t-2 border-dashed border-marine" /> Indicated by company name
            </p>
          </div>
        </div>

        {/* Mobile / tablet: stacked entities */}
        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:hidden">
          {ENTITIES.map((e) => (
            <Reveal as="li" key={e.id} className="border border-abyss/10 bg-white/80 p-5">
              <p className="label text-steel">{e.reg}</p>
              <h3 className="display-wide mt-1 text-xl">{e.name}</h3>
              <p className="mt-2 text-sm text-hull/80">{e.role}</p>
              {e.links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.links.map((l) => (
                    <span key={l} className={`label border px-2 py-1 text-[0.6rem] ${e.verifiedRole ? "border-marine/40 text-marine" : "border-dashed border-steel/50 text-steel"}`}>
                      {SERVICES.find((s) => s.id === l)!.title.split(",")[0]}
                    </span>
                  ))}
                </div>
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
