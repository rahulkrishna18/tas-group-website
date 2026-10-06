"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HERITAGE } from "@/content/site";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useIsDesktop, useReducedMotion } from "@/hooks/useMediaQuery";
import { LegLabel, Reveal } from "../ui/Section";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/* Track geometry in viewBox units (1 unit = 0.1vw of track width) */
const INTRO = 520;
const PANEL = 400;
const TAIL = 420;
const VB_W = INTRO + PANEL * HERITAGE.length + TAIL;
const VB_H = 240;
const NODE_X = HERITAGE.map((_, i) => INTRO + 40 + i * PANEL);
const NODE_Y = (i: number) => (i % 2 === 0 ? 150 : 96);

function routePath() {
  const pts: [number, number][] = [[0, 190], [INTRO - 160, 182], ...NODE_X.map((x, i) => [x, NODE_Y(i)] as [number, number]), [VB_W, 120]];
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return d;
}

export default function Heritage() {
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  return desktop && !reduced ? <HeritageTrack /> : <HeritageVertical />;
}

function HeritageTrack() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const ship = useRef<HTMLDivElement>(null);
  const clip = useRef<SVGRectElement>(null);
  const lut = useRef<{ x: number; y: number; a: number }[]>([]);
  const [active, setActive] = useState(-1);
  const d = useMemo(routePath, []);

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    const out: { x: number; y: number; a: number }[] = [];
    for (let i = 0; i <= 600; i++) {
      const a = p.getPointAtLength((i / 600) * len);
      const b = p.getPointAtLength(Math.min(len, ((i + 1) / 600) * len));
      out.push({ x: a.x, y: a.y, a: Math.atan2(b.y - a.y, b.x - a.x) });
    }
    lut.current = out;
  }, [d]);

  useScrollProgress(section, {
    onUpdate: (p) => {
      const t = track.current;
      if (!t) return;
      const vw = window.innerWidth;
      const tw = t.offsetWidth;
      const shift = Math.min(1, Math.max(0, (p - 0.05) / 0.93)) * (tw - vw);
      t.style.transform = `translate3d(${-shift}px,0,0)`;
      // ship sits ~38% across the viewport
      const shipX = ((shift + vw * 0.38) / tw) * VB_W;
      const L = lut.current;
      if (!L.length) return;
      let lo = 0;
      while (lo < L.length - 1 && L[lo].x < shipX) lo++;
      const pt = L[lo];
      if (ship.current) {
        ship.current.style.left = `${(pt.x / VB_W) * 100}%`;
        ship.current.style.top = `${pt.y}px`;
        ship.current.style.transform = `translate(-50%,-50%) rotate(${pt.a}rad)`;
      }
      clip.current?.setAttribute("width", String(pt.x));
      let a = -1;
      NODE_X.forEach((x, i) => {
        if (shipX >= x - 6) a = i;
      });
      setActive(a);
    },
  });

  return (
    <section id="heritage" ref={section} aria-label="Heritage" className="relative bg-abyss" style={{ height: "340vh" }}>
      <div className="chart-grid sticky top-0 h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_30%_40%,rgb(18_103_165/0.18),transparent_70%)]" />
        <div ref={track} className="relative h-full will-change-transform" style={{ width: `${VB_W / 10}vw` }}>
          {/* intro */}
          <div className="absolute left-0 top-0 flex h-full flex-col justify-center pl-[3.5rem]" style={{ width: `${(INTRO - 60) / 10}vw` }}>
            <LegLabel code="01">Heritage</LegLabel>
            <h2 className="display mt-6 text-[clamp(2.6rem,5.4vw,6rem)]">
              From Penang roots to <span className="text-cyan">integrated logistics.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-mist">
              The route below follows the Group from a stevedoring company on the Penang waterfront to a multi company logistics
              operation. Each port is a milestone.
            </p>
            <p className="label mt-8 text-steel">Scroll to sail the route →</p>
          </div>

          {/* route */}
          <div className="absolute inset-x-0" style={{ top: "calc(50% - 150px)", height: VB_H }}>
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <clipPath id="route-done">
                  <rect ref={clip} x="0" y="-50" width="0" height={VB_H + 100} />
                </clipPath>
              </defs>
              <path ref={pathRef} d={d} fill="none" stroke="rgb(237 243 245 / 0.25)" strokeWidth="1.5" strokeDasharray="4 8" vectorEffect="non-scaling-stroke" />
              <path d={d} fill="none" stroke="#f28c28" strokeWidth="2.5" clipPath="url(#route-done)" vectorEffect="non-scaling-stroke" />
            </svg>
            {/* ports */}
            {HERITAGE.map((h, i) => (
              <div key={h.id} className="absolute" style={{ left: `${(NODE_X[i] / VB_W) * 100}%`, top: NODE_Y(i) }}>
                <span className={`absolute left-0 top-0 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 transition-all duration-500 ${i <= active ? "border-cargo bg-cargo" : "border-foam/40 bg-abyss"}`} />
                {i <= active && <span className="absolute left-0 top-0 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-cargo/40" />}
                <span className="label absolute left-4 top-0 -translate-y-1/2 whitespace-nowrap text-steel">{h.code}</span>
              </div>
            ))}
            <div ref={ship} className="absolute z-10" style={{ left: 0, top: 190 }}>
              <svg viewBox="0 0 44 18" className="h-[18px] w-11 drop-shadow-[0_0_12px_rgba(242,140,40,0.6)]" aria-hidden="true">
                <path d="M2 9 L8 3 H36 L42 9 L36 15 H8 Z" fill="#edf3f5" />
                <rect x="11" y="6" width="5" height="6" fill="#f28c28" />
                <rect x="17" y="6" width="5" height="6" fill="#1267a5" />
                <rect x="23" y="6" width="5" height="6" fill="#f28c28" />
                <rect x="30" y="5" width="4" height="8" fill="#0b2233" />
              </svg>
            </div>
          </div>

          {/* milestone copy */}
          {HERITAGE.map((h, i) => (
            <article
              key={h.id}
              className="absolute transition-all duration-700 ease-ship"
              style={{
                left: `${(NODE_X[i] / VB_W) * 100}%`,
                width: "30vw",
                top: "calc(50% + 120px)",
                opacity: i <= active ? 1 : 0.28,
                transform: `translateY(${i <= active ? 0 : 16}px)`,
              }}
            >
              <p className="label text-cyan">{h.place}</p>
              <h3 className="display-wide mt-3 text-[clamp(1.4rem,2vw,2.1rem)] leading-tight text-foam">{h.title}</h3>
              <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-mist">{h.body}</p>
              <p className="label mt-4 inline-block border border-foam/15 px-2 py-1 text-foam/80">{h.capability}</p>
            </article>
          ))}
          {/* big markers above the route */}
          {HERITAGE.map((h, i) => (
            <div
              key={`m${h.id}`}
              aria-hidden="true"
              className="display pointer-events-none absolute whitespace-nowrap transition-colors duration-700"
              style={{
                left: `calc(${(NODE_X[i] / VB_W) * 100}% - 0.06em)`,
                bottom: "calc(50% + 170px)",
                fontSize: h.marker.length > 4 ? "clamp(2.4rem,4vw,4.4rem)" : "clamp(3rem,7vw,7.5rem)",
                color: i <= active ? (i === 0 ? "#f28c28" : "#edf3f5") : "transparent",
                WebkitTextStroke: "1px rgb(237 243 245 / 0.25)",
              }}
            >
              {h.marker}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeritageVertical() {
  const root = useRef<HTMLElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !line.current) return;
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: line.current.parentElement, start: "top 70%", end: "bottom 60%", scrub: true } }
      );
      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section id="heritage" ref={root} aria-label="Heritage" className="chart-grid relative bg-abyss py-24">
      <div className="container-x">
        <Reveal>
          <LegLabel code="01">Heritage</LegLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display mt-6 text-[clamp(2.4rem,9vw,4.5rem)]">
            From Penang roots to <span className="text-cyan">integrated logistics.</span>
          </h2>
        </Reveal>
        <ol className="relative mt-14 pl-10">
          <div className="absolute bottom-2 left-[7px] top-2 w-px border-l border-dashed border-foam/25" />
          <div ref={line} className="absolute bottom-2 left-[7px] top-2 w-0.5 origin-top bg-cargo" style={{ transform: reduced ? "none" : "scaleY(0)" }} />
          {HERITAGE.map((h, i) => (
            <Reveal as="li" key={h.id} className="relative pb-12 last:pb-0">
              <span className="absolute -left-10 top-2 block h-4 w-4 rotate-45 border-2 border-cargo bg-abyss" />
              <p className="display text-5xl" style={{ color: i === 0 ? "#f28c28" : "#edf3f5" }}>
                {h.marker}
              </p>
              <p className="label mt-3 text-cyan">
                {h.place} · {h.code}
              </p>
              <h3 className="display-wide mt-2 text-xl text-foam">{h.title}</h3>
              <p className="mt-2 leading-relaxed text-mist">{h.body}</p>
              <p className="label mt-3 inline-block border border-foam/15 px-2 py-1 text-foam/80">{h.capability}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
