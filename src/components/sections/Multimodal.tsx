"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ComponentType, SVGProps, useEffect, useMemo, useRef, useState } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useIsMobile, useReducedMotion } from "@/hooks/useMediaQuery";
import { Anchor, Doc, Pin, Plane, Ship, Truck, Warehouse } from "../ui/Icons";
import { LegLabel } from "../ui/Section";

type Leg = "road" | "sea" | "air";
type Node = { icon: ComponentType<SVGProps<SVGSVGElement>>; name: string; role: string; service: string };
type Chain = { id: "sea" | "air" | "land"; label: string; tagline: string; nodes: Node[]; legs: Leg[] };

const CHAINS: Chain[] = [
  {
    id: "sea",
    label: "Sea freight",
    tagline: "Warehouse to customer by sea",
    legs: ["road", "road", "sea", "sea", "road", "road"],
    nodes: [
      { icon: Warehouse, name: "Warehouse", role: "Cargo is picked, packed and prepared for export.", service: "Warehouse & Distribution" },
      { icon: Truck, name: "Truck", role: "Container haulage to the port of loading.", service: "Transportation · Bexxbay Express" },
      { icon: Anchor, name: "Port", role: "Export documentation and customs formalities.", service: "Customs Brokerage" },
      { icon: Ship, name: "Vessel", role: "Ocean leg as FCL or LCL.", service: "Sea Freight" },
      { icon: Anchor, name: "Destination port", role: "Cargo discharged at the port of destination.", service: "Freight Forwarding" },
      { icon: Truck, name: "Truck", role: "Onward delivery from the port.", service: "Door to door" },
      { icon: Pin, name: "Customer", role: "Delivered to the consignee.", service: "Journey complete" },
    ],
  },
  {
    id: "air",
    label: "Air freight",
    tagline: "When time matters",
    legs: ["road", "road", "air", "road", "road"],
    nodes: [
      { icon: Warehouse, name: "Warehouse", role: "Packing, including dangerous goods and high value consignments.", service: "Warehouse & Distribution" },
      { icon: Truck, name: "Truck", role: "Transfer to the air cargo terminal.", service: "Transportation" },
      { icon: Doc, name: "Air cargo terminal", role: "Export clearance and air cargo documentation.", service: "Customs Brokerage" },
      { icon: Plane, name: "Aircraft", role: "Air freight, courier or hand carry.", service: "Air Freight" },
      { icon: Anchor, name: "Destination", role: "Arrival and release at destination.", service: "Freight Forwarding" },
      { icon: Pin, name: "Delivery", role: "Door to door to the consignee.", service: "Door to door" },
    ],
  },
  {
    id: "land",
    label: "Land · MY ⇄ SG",
    tagline: "Malaysia to Singapore by road",
    legs: ["road", "road", "road", "road"],
    nodes: [
      { icon: Warehouse, name: "Warehouse", role: "Bonded or non bonded storage before dispatch.", service: "Warehouse & Distribution" },
      { icon: Truck, name: "Truck", role: "Full or loose truck load, bonded or non bonded.", service: "Bexxbay Express" },
      { icon: Doc, name: "Border customs", role: "Cross border documentation and clearance.", service: "Customs Brokerage" },
      { icon: Truck, name: "Long haul", role: "Malaysia and Singapore long haul trucking.", service: "Transportation" },
      { icon: Pin, name: "Customer", role: "Delivered in Singapore.", service: "Journey complete" },
    ],
  },
];

const TW = 64; // iso tile half-width
const TH = 37; // iso tile half-height
const iso = (gx: number, gy: number) => [(gx - gy) * TW, (gx + gy) * TH] as const;

function layout(chain: Chain) {
  const n = chain.nodes.length;
  const span = 9.6;
  const pts = chain.nodes.map((_, i) => {
    const gx = (i / (n - 1)) * span;
    const gy = [0, 1.3, 0.2, 1.5, 0.3, 1.4, 0.2][i] ?? 0;
    return iso(gx, gy);
  });
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const pad = 110;
  const box = { x: Math.min(...xs) - pad, y: Math.min(...ys) - 190, w: Math.max(...xs) - Math.min(...xs) + pad * 2, h: Math.max(...ys) - Math.min(...ys) + 290 };
  // marker path across all legs (air legs arc upward)
  let d = `M${pts[0][0]},${pts[0][1] - 24}`;
  chain.legs.forEach((leg, i) => {
    const [x1, y1] = pts[i + 1];
    if (leg === "air") {
      const [x0, y0] = pts[i];
      d += ` Q${(x0 + x1) / 2},${Math.min(y0, y1) - 210} ${x1},${y1 - 24}`;
    } else d += ` L${x1},${y1 - 24}`;
  });
  return { pts, box, d };
}

function IsoBlock({ x, y, h, active, done }: { x: number; y: number; h: number; active: boolean; done: boolean }) {
  const top = `${x},${y - h - 26} ${x + 44},${y - h} ${x},${y - h + 26} ${x - 44},${y - h}`;
  const left = `${x - 44},${y - h} ${x},${y - h + 26} ${x},${y + 26} ${x - 44},${y}`;
  const right = `${x + 44},${y - h} ${x},${y - h + 26} ${x},${y + 26} ${x + 44},${y}`;
  return (
    <g style={{ transition: "all .6s cubic-bezier(.22,.8,.2,1)" }}>
      <polygon points={left} fill={active ? "#d9741a" : done ? "#0f2c40" : "#c9d6dc"} />
      <polygon points={right} fill={active ? "#b45f14" : done ? "#0b2233" : "#a9b9c1"} />
      <polygon points={top} fill={active ? "#f28c28" : done ? "#1267a5" : "#e4ecef"} stroke={active ? "#f6a95e" : "rgb(6 20 29 / .15)"} />
    </g>
  );
}

export default function Multimodal() {
  const section = useRef<HTMLElement>(null);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const [chainIdx, setChainIdx] = useState(0);
  const [nodeIdx, setNodeIdx] = useState(0);
  const local = useRef(0);
  const chainRef = useRef(0);
  const pathRef = useRef<SVGPathElement>(null);
  const marker = useRef<SVGGElement>(null);
  const chain = CHAINS[chainIdx];
  const geo = useMemo(() => layout(chain), [chain]);

  const placeMarker = () => {
    const path = pathRef.current;
    const m = marker.current;
    if (!path || !m) return;
    const len = path.getTotalLength();
    const pt = path.getPointAtLength(local.current * len);
    m.setAttribute("transform", `translate(${pt.x},${pt.y})`);
  };

  const nodeAt = (chain: number, lp: number) => {
    const n = CHAINS[chain].nodes.length;
    return Math.min(n - 1, Math.floor(lp * (n - 1) + 0.15));
  };

  // Scroll drives one journey: the cargo travels the currently selected mode's route.
  useScrollProgress(section, {
    onUpdate: (p) => {
      if (reduced) return;
      const lp = Math.min(1, Math.max(0, (p - 0.06) / 0.88));
      local.current = lp;
      setNodeIdx(nodeAt(chainRef.current, lp));
      placeMarker();
    },
  });
  // after a chain swap the path changes: re-place the marker
  useEffect(() => {
    const id = requestAnimationFrame(placeMarker);
    return () => cancelAnimationFrame(id);
  });

  // Without scroll animation, show the selected journey as complete.
  useEffect(() => {
    if (!reduced) return;
    local.current = 1;
    setNodeIdx(nodeAt(chainRef.current, 1));
  }, [reduced]);

  // Tabs switch the mode in place (no scrolling); the cargo keeps its progress along the new route.
  const jump = (i: number) => {
    chainRef.current = i;
    setChainIdx(i);
    if (reduced) local.current = 1;
    setNodeIdx(nodeAt(i, local.current));
  };

  const node = chain.nodes[nodeIdx];
  const legType: Leg | null = nodeIdx < chain.legs.length ? chain.legs[nodeIdx] : null;
  const LegIcon = legType === "air" ? Plane : legType === "sea" ? Ship : Truck;

  return (
    <section
      id="multimodal"
      ref={section}
      aria-label="Multimodal logistics"
      className="relative bg-paper text-abyss"
      style={{ height: reduced ? "auto" : mobile ? "260svh" : "280vh" }}
    >
      <div className={`${reduced ? "relative py-24" : "sticky top-0 h-[100svh]"} chart-grid-light overflow-hidden`}>
        <div className="container-x grid h-full grid-rows-[auto_1fr_auto] gap-4 py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] lg:grid-rows-1 lg:items-center lg:gap-10 lg:py-0">
          {/* copy + controls */}
          <div>
            <LegLabel code="03" tone="light">
              Sea · Air · Land
            </LegLabel>
            <h2 className="display mt-5 text-[clamp(2.1rem,4.4vw,4.2rem)] text-abyss">
              Three modes. <span className="text-marine">One journey.</span>
            </h2>
            <p className="mt-4 hidden max-w-md leading-relaxed text-hull/80 md:block">
              Cargo rarely travels by one mode. As a certified Multimodal Transport Operator, TAS links warehouse, road, port,
              vessel and aircraft into a single managed move.
            </p>
            <div role="tablist" aria-label="Transport mode" className="mt-6 inline-flex border border-abyss/15 bg-white/60 p-1 backdrop-blur">
              {CHAINS.map((c, i) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={i === chainIdx}
                  onClick={() => jump(i)}
                  className={`label px-3 py-2 transition-colors sm:px-4 ${i === chainIdx ? "bg-abyss text-foam" : "text-hull hover:text-abyss"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="mt-6 hidden min-h-[9.5rem] border-l-2 border-cargo bg-white/70 p-5 shadow-[0_20px_60px_-30px_rgb(6_20_29/0.4)] lg:block" aria-live="polite">
              <NodeCard node={node} index={nodeIdx} total={chain.nodes.length} />
            </div>
          </div>

          {/* diorama */}
          <div className="relative min-h-0 [perspective:1400px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={chain.id}
                className="h-full w-full"
                initial={{ opacity: 0, rotateX: 28, rotateZ: -4, y: 60, scale: 0.94 }}
                animate={{ opacity: 1, rotateX: 0, rotateZ: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, rotateX: -22, rotateZ: 3, y: -50, scale: 0.95 }}
                transition={{ duration: 0.7, ease: [0.22, 0.8, 0.2, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <svg viewBox={`${geo.box.x} ${geo.box.y} ${geo.box.w} ${geo.box.h}`} className="h-full max-h-[70svh] w-full" role="img" aria-label={`${chain.label}: ${chain.nodes.map((n) => n.name).join(" to ")}`}>
                  <defs>
                    <pattern id="waves" width="24" height="10" patternUnits="userSpaceOnUse">
                      <path d="M0 5 Q6 0 12 5 T24 5" fill="none" stroke="#20b9d4" strokeOpacity=".35" strokeWidth="1.2" />
                    </pattern>
                  </defs>
                  {/* ground legs */}
                  {chain.legs.map((leg, i) => {
                    const [x0, y0] = geo.pts[i];
                    const [x1, y1] = geo.pts[i + 1];
                    const done = i < nodeIdx;
                    if (leg === "air") {
                      return (
                        <g key={i}>
                          <path d={`M${x0},${y0 - 24} Q${(x0 + x1) / 2},${Math.min(y0, y1) - 210} ${x1},${y1 - 24}`} fill="none" stroke="#f28c28" strokeWidth="2.5" strokeDasharray="7 7" className={done ? "" : "route-flow"} opacity={done ? 1 : 0.7} />
                          <ellipse cx={(x0 + x1) / 2} cy={(y0 + y1) / 2 + 6} rx="80" ry="16" fill="rgb(6 20 29 / .05)" />
                        </g>
                      );
                    }
                    if (leg === "sea") {
                      const mx = (x0 + x1) / 2;
                      const my = (y0 + y1) / 2;
                      return (
                        <g key={i}>
                          <polygon points={`${mx - 120},${my} ${mx},${my - 70} ${mx + 120},${my} ${mx},${my + 70}`} fill="url(#waves)" opacity=".9" />
                          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#1267a5" strokeWidth="3" strokeDasharray="10 8" className="route-flow" />
                        </g>
                      );
                    }
                    return (
                      <g key={i}>
                        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={done ? "#0b2233" : "#75838c"} strokeWidth="14" strokeLinecap="round" opacity={done ? 0.9 : 0.35} />
                        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#edf3f5" strokeWidth="1.5" strokeDasharray="6 8" />
                      </g>
                    );
                  })}
                  {/* hidden path the cargo marker follows */}
                  <path ref={pathRef} d={geo.d} fill="none" stroke="none" />
                  {/* nodes */}
                  {chain.nodes.map((n, i) => {
                    const [x, y] = geo.pts[i];
                    const active = i === nodeIdx;
                    const done = i < nodeIdx;
                    const h = active ? 30 : 16;
                    const Icon = n.icon;
                    return (
                      <g key={i}>
                        <IsoBlock x={x} y={y} h={h} active={active} done={done} />
                        <Icon x={x - 13} y={y - h - 13} width="26" height="26" color={active || done ? "#edf3f5" : "#0b2233"} strokeWidth={1.8} />
                        <text x={x} y={y + (mobile ? 66 : 58)} textAnchor="middle" className="font-mono" fontSize={mobile ? 24 : 13} letterSpacing="1.6" fill={active ? "#d9741a" : "#0b2233"} stroke="#f4f7f8" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke" style={{ textTransform: "uppercase" }}>
                          {String(i + 1).padStart(2, "0")} {n.name}
                        </text>
                      </g>
                    );
                  })}
                  {/* cargo marker */}
                  <g
                    ref={(el) => {
                      // the board remounts on mode change: position the cargo as soon as it exists
                      marker.current = el;
                      if (el) placeMarker();
                    }}
                  >
                    <ellipse cx="0" cy="30" rx="16" ry="6" fill="rgb(6 20 29 / .18)" />
                    <polygon points="0,-30 22,-19 0,-8 -22,-19" fill="#f6a95e" />
                    <polygon points="-22,-19 0,-8 0,10 -22,-1" fill="#f28c28" />
                    <polygon points="22,-19 0,-8 0,10 22,-1" fill="#c96a14" />
                    <circle cx="0" cy="-19" r="40" fill="none" stroke="#f28c28" strokeOpacity=".35" className="node-ping" />
                  </g>
                </svg>
              </motion.div>
            </AnimatePresence>
            <p className="label absolute bottom-0 right-0 text-steel">Illustrative journey · destinations are generic</p>
          </div>

          {/* mobile node card */}
          <div className="border-l-2 border-cargo bg-white/80 p-4 lg:hidden" aria-live="polite">
            <NodeCard node={node} index={nodeIdx} total={chain.nodes.length} compact />
          </div>
        </div>
        {!reduced && (
          <div className="label pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-hull/70 lg:flex">
            <LegIcon className="h-4 w-4" /> {legType ? `In transit by ${legType === "road" ? "road" : legType}` : "Delivered"}
          </div>
        )}
      </div>
    </section>
  );
}

function NodeCard({ node, index, total, compact }: { node: Node; index: number; total: number; compact?: boolean }) {
  return (
    <div key={node.name + index} className="animate-[fadeUp_.5s_var(--ease-ship)]">
      <p className="label flex justify-between text-steel">
        <span>
          Stage <span className="text-cargo-deep">{String(index + 1).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
        </span>
        <span className="text-marine">{node.service}</span>
      </p>
      <h3 className={`display-wide mt-2 text-abyss ${compact ? "text-lg" : "text-2xl"}`}>{node.name}</h3>
      <p className={`mt-1 text-hull/80 ${compact ? "text-sm" : ""}`}>{node.role}</p>
    </div>
  );
}

