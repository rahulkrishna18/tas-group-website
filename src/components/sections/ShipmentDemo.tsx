"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { REGION_LAND, REGION_OFFICES, REGION_ROUTES, REGION_VIEWBOX } from "@/data/geo/regionMap";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { Pause, Play, Reset, Plane, Ship, Truck, ArrowRight } from "../ui/Icons";
import { SectionHeader } from "../ui/Section";

const MILESTONES = ["Booked", "Picked up", "Customs", "In transit", "Port / Hub", "Out for delivery", "Delivered"];

type Scenario = {
  id: "sea" | "air" | "land";
  label: string;
  icon: typeof Ship;
  ref: string;
  unit: string;
  unitLabel: string;
  from: { name: string; code: string };
  to: { name: string; code: string };
  cargo: string;
  path: string;
  times: string[];
  hub: string;
  events: string[];
};

const k = REGION_OFFICES.klia;
const SCENARIOS: Scenario[] = [
  {
    id: "sea",
    label: "Sea · LCL",
    icon: Ship,
    ref: "SIM SEA 0001",
    unit: "DEMO 000001 0",
    unitLabel: "Container",
    from: { name: "Penang", code: "MYPEN" },
    to: { name: "Singapore", code: "SGSIN" },
    cargo: "Consolidated cargo · 6 pallets",
    path: REGION_ROUTES.seaMalacca,
    times: ["D+0 09:10", "D+0 15:40", "D+1 10:25", "D+1 22:00", "D+3 07:30", "D+3 13:15", "D+3 17:50"],
    hub: "Port of discharge",
    events: ["Booking confirmed", "Collected from shipper’s warehouse", "Export declaration cleared", "Vessel departed", "Discharged at destination port", "Released, truck dispatched", "Proof of delivery received"],
  },
  {
    id: "air",
    label: "Air · General cargo",
    icon: Plane,
    ref: "SIM AIR 0002",
    unit: "DEMO AWB 000 00000002",
    unitLabel: "Air waybill",
    from: { name: "KLIA", code: "KUL" },
    to: { name: "Destination airport", code: "DST" },
    cargo: "Electronics · 320 kg",
    path: `M${k[0]},${k[1]} Q${k[0] + 160},${k[1] - 420} ${REGION_VIEWBOX.w - 30},${110}`,
    times: ["D+0 08:00", "D+0 11:30", "D+0 16:45", "D+0 23:55", "D+1 06:40", "D+1 09:10", "D+1 12:35"],
    hub: "Destination air cargo terminal",
    events: ["Booking confirmed", "Collected and delivered to air cargo terminal", "Export clearance completed", "Flight departed", "Arrived at destination terminal", "Out for delivery", "Delivered, signed by consignee"],
  },
  {
    id: "land",
    label: "Land · FTL",
    icon: Truck,
    ref: "SIM LND 0003",
    unit: "DEMO TRK 0003",
    unitLabel: "Truck",
    from: { name: "Penang", code: "PEN" },
    to: { name: "Singapore", code: "SIN" },
    cargo: "Full truck load · 1 × 40ft",
    path: REGION_ROUTES.landCorridor,
    times: ["D+0 07:00", "D+0 09:20", "D+0 10:05", "D+0 10:40", "D+0 19:30", "D+1 08:15", "D+1 11:00"],
    hub: "Border checkpoint",
    events: ["Booking confirmed", "Loaded at origin warehouse", "Documents verified", "Departed on North South corridor", "Cleared at border checkpoint", "Out for delivery in Singapore", "Delivered"],
  },
];

/** Fraction of the route covered at each milestone (transit animates between 3 → 4). */
const AT = [0, 0.02, 0.06, 0.1, 0.92, 0.96, 1];

export default function ShipmentDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const t = useRef(0);
  const host = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const dot = useRef<SVGGElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const inView = useInView(host, "-20% 0px");
  const reduced = useReducedMotion();
  const s = SCENARIOS[scenarioIdx];

  const draw = useCallback(() => {
    const path = routeRef.current;
    if (!path) return;
    const tt = t.current;
    const i = Math.floor(tt);
    const frac = i >= 6 ? 1 : AT[i] + (AT[i + 1] - AT[i]) * (tt - i);
    const len = path.getTotalLength();
    const pt = path.getPointAtLength(len * frac);
    dot.current?.setAttribute("transform", `translate(${pt.x},${pt.y})`);
    trail.current?.setAttribute("stroke-dashoffset", String(len * (1 - frac)));
    trail.current?.setAttribute("stroke-dasharray", String(len));
  }, []);

  // auto-play once visible
  useEffect(() => {
    if (inView && !reduced && t.current === 0) setPlaying(true);
  }, [inView, reduced]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const speed = Math.floor(t.current) === 3 ? 0.22 : 0.6; // linger on the transit leg
      t.current = Math.min(6, t.current + dt * speed);
      const st = Math.floor(t.current);
      setStage((p) => (p !== st ? st : p));
      draw();
      if (t.current >= 6) setPlaying(false);
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, draw]);

  useEffect(() => {
    draw();
  }, [scenarioIdx, draw]);

  const reset = (play = !reduced) => {
    t.current = 0;
    setStage(0);
    draw();
    setPlaying(play);
  };
  const step = () => {
    setPlaying(false);
    t.current = Math.min(6, Math.floor(t.current) + 1);
    setStage(Math.floor(t.current));
    draw();
  };
  const choose = (i: number) => {
    setScenarioIdx(i);
    t.current = 0;
    setStage(0);
    setPlaying(!reduced);
  };

  const Icon = s.icon;
  const pct = Math.round((stage / 6) * 100);

  return (
    <section id="control" aria-label="Shipment visibility demo" className="relative bg-abyss py-24 lg:py-32">
      <div className="container-x">
        <SectionHeader
          code="09"
          eyebrow="Control"
          title={
            <>
              Every milestone, <span className="text-cyan">in view.</span>
            </>
          }
          intro="A design concept for how shipment visibility could look on a TAS digital platform. All data in this panel is simulated, and it is not connected to any live tracking system."
        />

        <div ref={host} className="mt-12 overflow-hidden border border-foam/12 bg-midnight shadow-[0_40px_120px_-40px_rgb(32_185_212/0.25)] lg:mt-16">
          {/* console bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foam/10 bg-abyss/60 px-4 py-3 sm:px-5">
            <div className="label flex items-center gap-3 text-mist">
              <span className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-foam/20" />
                <span className="h-2 w-2 rounded-full bg-foam/20" />
                <span className="h-2 w-2 rounded-full bg-foam/20" />
              </span>
              Shipment view
            </div>
            <span className="label border border-cargo bg-cargo/10 px-2.5 py-1 text-cargo">Demo · Simulated data</span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.95fr)]">
            {/* details */}
            <div className="border-b border-foam/10 p-5 lg:border-b-0 lg:border-r">
              <div role="tablist" aria-label="Demo scenario" className="grid grid-cols-3 gap-1">
                {SCENARIOS.map((sc, i) => {
                  const I = sc.icon;
                  return (
                    <button
                      key={sc.id}
                      role="tab"
                      aria-selected={i === scenarioIdx}
                      onClick={() => choose(i)}
                      className={`label flex flex-col items-center gap-1.5 border px-1 py-2.5 text-[0.6rem] transition-colors ${i === scenarioIdx ? "border-cyan bg-cyan/10 text-foam" : "border-foam/10 text-steel hover:text-foam"}`}
                    >
                      <I className="h-4 w-4" />
                      {sc.label}
                    </button>
                  );
                })}
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                <Field label="Reference" value={s.ref} mono />
                <Field label={s.unitLabel} value={s.unit} mono />
                <Field label="Origin" value={`${s.from.name}`} sub={s.from.code} />
                <Field label="Destination" value={`${s.to.name}`} sub={s.to.code} />
                <Field label="Mode" value={<span className="flex items-center gap-2"><Icon className="h-4 w-4 text-cyan" />{s.label}</span>} />
                <Field label="Cargo" value={s.cargo} />
                <Field label="Current stage" value={<span className="text-cargo">{MILESTONES[stage]}</span>} />
                <Field label="ETA" value={s.times[6]} sub="simulated" mono />
              </dl>
              <div className="mt-6">
                <div className="label flex justify-between text-steel">
                  <span>Progress</span>
                  <span className="text-foam">{pct}%</span>
                </div>
                <div className="mt-2 h-1 bg-foam/10">
                  <div className="h-full bg-gradient-to-r from-cyan to-cargo transition-[width] duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => (t.current >= 6 ? reset(true) : setPlaying((p) => !p))} className="label flex items-center gap-2 border border-foam/20 px-3 py-2 text-foam hover:border-cyan">
                  {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {playing ? "Pause" : "Play"}
                </button>
                <button onClick={step} className="label flex items-center gap-2 border border-foam/20 px-3 py-2 text-foam hover:border-cyan">
                  Step <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => reset(false)} className="label flex items-center gap-2 border border-foam/20 px-3 py-2 text-foam hover:border-cyan" aria-label="Reset demo">
                  <Reset className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* map */}
            <div className="relative min-h-[360px] border-b border-foam/10 bg-abyss/40 lg:border-b-0 lg:border-r">
              <svg viewBox={`0 0 ${REGION_VIEWBOX.w} ${REGION_VIEWBOX.h}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <path d={REGION_LAND} fill="#163b55" stroke="#20b9d4" strokeOpacity=".35" />
                <path ref={routeRef} key={s.id} d={s.path} fill="none" stroke="#edf3f5" strokeOpacity=".25" strokeWidth="2.5" strokeDasharray="6 8" />
                <path ref={trail} key={`${s.id}-t`} d={s.path} fill="none" stroke={s.id === "air" ? "#f28c28" : "#20b9d4"} strokeWidth="3.5" />
                <g ref={dot}>
                  <circle r="22" fill="#f28c28" opacity=".18" className="node-ping" />
                  <circle r="8" fill="#f28c28" stroke="#06141d" strokeWidth="3" />
                </g>
              </svg>
              <div className="label absolute left-4 top-4 text-steel">Live route · simulated</div>
              <div className="label absolute bottom-4 left-4 right-4 flex justify-between text-mist">
                <span>{s.from.code}</span>
                <span className="text-steel">→</span>
                <span>{s.to.code}</span>
              </div>
            </div>

            {/* milestones */}
            <div className="p-5">
              <p className="label text-steel">Milestones</p>
              <ol className="relative mt-4">
                <span className="absolute bottom-3 left-[7px] top-3 w-px bg-foam/12" />
                {MILESTONES.map((m, i) => {
                  const done = i < stage || stage === 6;
                  const now = i === stage && stage < 6;
                  return (
                    <li key={m} className="relative flex gap-4 pb-4 last:pb-0">
                      <span
                        className={`relative z-10 mt-0.5 grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 ${
                          done ? "border-cyan bg-cyan" : now ? "border-cargo bg-abyss" : "border-foam/25 bg-midnight"
                        }`}
                      >
                        {now && <span className="h-1.5 w-1.5 rounded-full bg-cargo status-blink" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`text-sm font-medium ${done || now ? "text-foam" : "text-steel"}`}>{i === 4 ? s.hub : m}</span>
                          <span className={`label shrink-0 text-[0.6rem] ${done || now ? "text-mist" : "text-steel/50"}`}>{done || now ? s.times[i] : "·"}</span>
                        </div>
                        {(done || now) && <p className="mt-0.5 truncate text-xs text-steel">{s.events[i]}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
        <p className="label mt-4 text-steel">
          Prototype UI only. For real shipment status, contact TAS Group directly.
        </p>
      </div>
    </section>
  );
}

function Field({ label, value, sub, mono }: { label: string; value: React.ReactNode; sub?: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="label text-[0.6rem] text-steel">{label}</dt>
      <dd className={`mt-1 truncate text-foam ${mono ? "font-mono text-[0.8rem]" : ""}`}>
        {value}
        {sub && <span className="label ml-2 text-[0.6rem] text-steel">{sub}</span>}
      </dd>
    </div>
  );
}
