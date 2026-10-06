"use client";

import { createContext, ReactNode, useContext, useId } from "react";
import type { ServiceId } from "@/content/site";

/* Small SVG operation scenes, one per service. Motion uses SMIL so it costs no JS per frame. */

const Anim = createContext(true);
const C = { navy: "#06141d", mid: "#0b2233", hull: "#0f2c40", marine: "#1267a5", cyan: "#20b9d4", cargo: "#f28c28", foam: "#edf3f5", steel: "#75838c", mist: "#c9d6dc" };

function Move({ path, dur, begin = "0s", rotate = "auto" }: { path: string; dur: string; begin?: string; rotate?: string }) {
  const on = useContext(Anim);
  return on ? <animateMotion path={path} dur={dur} begin={begin} rotate={rotate} repeatCount="indefinite" /> : null;
}
function A(props: { attributeName: string; values: string; dur: string; begin?: string; keyTimes?: string; calcMode?: string }) {
  const on = useContext(Anim);
  return on ? <animate repeatCount="indefinite" {...props} /> : null;
}
function T(props: { type: string; values: string; dur: string; begin?: string; keyTimes?: string; additive?: "replace" | "sum" }) {
  const on = useContext(Anim);
  return on ? <animateTransform attributeName="transform" repeatCount="indefinite" {...props} /> : null;
}
const Label = ({ x, y, children, fill = C.mist, anchor = "start" }: { x: number; y: number; children: ReactNode; fill?: string; anchor?: "start" | "middle" | "end" }) => (
  <text x={x} y={y} fill={fill} fontSize="11" letterSpacing="1.8" textAnchor={anchor} style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
    {children}
  </text>
);
const Box = ({ w = 34, h = 16, fill = C.cargo }: { w?: number; h?: number; fill?: string }) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} />
    {Array.from({ length: Math.floor(w / 5) }, (_, i) => (
      <line key={i} x1={-w / 2 + 3 + i * 5} x2={-w / 2 + 3 + i * 5} y1={-h / 2 + 2} y2={h / 2 - 2} stroke={C.navy} strokeOpacity=".25" />
    ))}
  </g>
);
const TruckGlyph = ({ fill = C.foam, load = C.cargo }: { fill?: string; load?: string }) => (
  <g>
    <rect x="-22" y="-9" width="30" height="13" fill={load} />
    <path d="M9 -7 h8 l5 5 v6 h-13z" fill={fill} />
    <circle cx="-14" cy="6" r="3" fill={C.navy} stroke={C.steel} />
    <circle cx="14" cy="6" r="3" fill={C.navy} stroke={C.steel} />
  </g>
);
const Node = ({ x, y, label, color = C.cyan, anchor = "middle", dy = 28 }: { x: number; y: number; label: string; color?: string; anchor?: "start" | "middle" | "end"; dy?: number }) => (
  <g>
    <circle cx={x} cy={y} r="18" fill="none" stroke={color} strokeOpacity=".4">
      <A attributeName="r" values="8;26" dur="2.4s" />
      <A attributeName="stroke-opacity" values=".7;0" dur="2.4s" />
    </circle>
    <circle cx={x} cy={y} r="6" fill={color} />
    <Label x={x} y={y + dy} anchor={anchor} fill={C.foam}>
      {label}
    </Label>
  </g>
);
const Grid = () => {
  const id = useId().replace(/:/g, "");
  return (
    <>
      <defs>
        <pattern id={`g${id}`} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke={C.foam} strokeOpacity=".05" />
        </pattern>
      </defs>
      <rect width="640" height="440" fill={`url(#g${id})`} />
    </>
  );
};

function Freight() {
  const sea = "M100,320 C210,420 430,410 545,175";
  const air = "M100,320 Q300,20 545,175";
  return (
    <>
      <path d={sea} fill="none" stroke={C.cyan} strokeWidth="2" strokeDasharray="6 8" className="route-flow" />
      <path d={air} fill="none" stroke={C.cargo} strokeWidth="2" strokeDasharray="3 7" className="route-flow" />
      {[0, 2.4, 4.8].map((b) => (
        <g key={b}>
          <Box w={30} h={13} fill={b === 0 ? C.cargo : C.marine} />
          <Move path={sea} dur="7.2s" begin={`${b}s`} />
        </g>
      ))}
      <g>
        <path d="M-14 0 L10 -3 L16 0 L10 3 Z M-2 -1 L-8 -12 L-4 -12 L6 -1 Z M-2 1 L-8 12 L-4 12 L6 1 Z M-14 0 L-18 -6 L-15 -6 L-10 -1Z" fill={C.foam} />
        <Move path={air} dur="4.2s" />
      </g>
      <Node x={100} y={320} label="Origin" color={C.cargo} />
      <Node x={545} y={175} label="Destination" />
      <Label x={250} y={420} fill={C.cyan}>Sea · FCL / LCL</Label>
      <Label x={240} y={96} fill={C.cargo}>Air · Courier · Hand carry</Label>
    </>
  );
}

function Customs() {
  const lane = "M-40,300 H680";
  return (
    <>
      <rect x="0" y="282" width="640" height="36" fill={C.mid} />
      <line x1="0" y1="300" x2="640" y2="300" stroke={C.foam} strokeOpacity=".25" strokeDasharray="10 10" />
      <rect x="40" y="236" width="230" height="24" fill="none" stroke={C.cargo} strokeOpacity=".5" strokeDasharray="4 4" />
      <Label x={52} y={252} fill={C.cargo}>Inspection · Documentation</Label>
      <rect x="370" y="236" width="230" height="24" fill="none" stroke={C.cyan} strokeOpacity=".5" strokeDasharray="4 4" />
      <Label x={382} y={252} fill={C.cyan}>Cleared · Released</Label>
      {/* checkpoint gate */}
      <rect x="306" y="190" width="10" height="130" fill={C.steel} />
      <rect x="350" y="190" width="10" height="130" fill={C.steel} />
      <rect x="296" y="178" width="74" height="18" fill={C.marine} />
      <Label x={333} y={191} anchor="middle" fill={C.foam}>Customs</Label>
      <rect x="318" y="200" width="30" height="110" fill={C.cyan} opacity=".12">
        <A attributeName="opacity" values=".05;.3;.05" dur="1.6s" />
      </rect>
      <line x1="318" y1="205" x2="348" y2="205" stroke={C.cyan} strokeWidth="2">
        <A attributeName="y1" values="205;305;205" dur="1.6s" />
        <A attributeName="y2" values="205;305;205" dur="1.6s" />
      </line>
      {[0, 2, 4].map((b) => (
        <g key={b}>
          <Box w={44} h={20} fill={[C.marine, C.cargo, C.steel][b / 2]} />
          <circle cx="0" cy="-16" r="4">
            <A attributeName="fill" values={`${C.cargo};${C.cargo};${C.cyan};${C.cyan}`} keyTimes="0;0.49;0.5;1" dur="6s" begin={`${b}s`} calcMode="discrete" />
          </circle>
          <Move path={lane} dur="6s" begin={`${b}s`} rotate="0" />
        </g>
      ))}
      {/* document checklist */}
      <g transform="translate(420 60)">
        <rect width="180" height="112" fill={C.mid} stroke={C.foam} strokeOpacity=".12" />
        <Label x={14} y={24} fill={C.steel}>Clearance file</Label>
        {["Declaration", "Permits", "Duties & taxes"].map((t, i) => (
          <g key={t} transform={`translate(14 ${46 + i * 22})`}>
            <rect width="12" height="12" fill="none" stroke={C.mist} strokeOpacity=".5" />
            <path d="M2 6 l3 3 l5 -6" fill="none" stroke={C.cyan} strokeWidth="2">
              <A attributeName="opacity" values="0;0;1;1;0" keyTimes={`0;${0.15 + i * 0.15};${0.2 + i * 0.15};0.95;1`} dur="4s" />
            </path>
            <Label x={22} y={10} fill={C.foam}>{t}</Label>
          </g>
        ))}
      </g>
      <Label x={40} y={372}>Licensed by Royal Malaysian Customs</Label>
    </>
  );
}

function WarehouseScene() {
  const inbound = "M-30,330 H170";
  const outbound = "M470,330 H680";
  return (
    <>
      <path d="M150 340 V170 L320 100 L490 170 V340" fill="none" stroke={C.mist} strokeOpacity=".5" strokeWidth="2" />
      <line x1="140" y1="340" x2="500" y2="340" stroke={C.mist} strokeOpacity=".5" strokeWidth="2" />
      {[0, 1, 2].map((r) => (
        <g key={r} transform={`translate(${200 + r * 95} 180)`}>
          <rect width="70" height="150" fill="none" stroke={C.steel} />
          {[0, 1, 2, 3].map((s) => (
            <g key={s}>
              <line x1="0" x2="70" y1={36 + s * 36} y2={36 + s * 36} stroke={C.steel} />
              {[0, 1].map((b) => (
                <rect key={b} x={6 + b * 32} y={14 + s * 36} width="26" height="20" fill={(r + s + b) % 3 === 0 ? C.cargo : C.marine}>
                  <A attributeName="opacity" values={`${(s + b + r) % 4 === 0 ? "0;1;1;0" : "1;1;1;1"}`} keyTimes="0;0.2;0.8;1" dur={`${5 + r}s`} begin={`${s * 0.6}s`} />
                </rect>
              ))}
            </g>
          ))}
        </g>
      ))}
      {[0, 1.5, 3].map((b) => (
        <g key={`i${b}`}>
          <Box w={22} h={16} fill={C.cargo} />
          <Move path={inbound} dur="4.5s" begin={`${b}s`} rotate="0" />
        </g>
      ))}
      {[0.7, 2.2, 3.7].map((b) => (
        <g key={`o${b}`}>
          <Box w={22} h={16} fill={C.marine} />
          <Move path={outbound} dur="4.5s" begin={`${b}s`} rotate="0" />
        </g>
      ))}
      <Label x={20} y={372}>Inbound</Label>
      <Label x={620} y={372} anchor="end">Distribution</Label>
      <Label x={320} y={380} anchor="middle" fill={C.foam}>Bonded · Non bonded</Label>
      <Label x={320} y={404} anchor="middle">Pick · Pack · Repack · Assembly</Label>
      <g transform="translate(470 130)">
        <rect x="-4" y="-6" width="26" height="12" fill={C.steel} />
        <circle cx="26" cy="0" r="3" fill={C.cargo} className="status-blink" />
        <Label x={36} y={4} fill={C.mist}>24h CCTV</Label>
      </g>
    </>
  );
}

function Transport() {
  const r1 = "M100,330 C200,330 220,170 320,160";
  const r2 = "M320,160 C420,150 450,280 560,270";
  const r3 = "M100,330 C260,380 420,360 560,270";
  return (
    <>
      {[r1, r2, r3].map((r) => (
        <g key={r}>
          <path d={r} fill="none" stroke={C.mid} strokeWidth="16" strokeLinecap="round" />
          <path d={r} fill="none" stroke={C.foam} strokeOpacity=".4" strokeDasharray="6 10" />
        </g>
      ))}
      {[
        [r1, "5s", "0s", C.cargo],
        [r2, "5s", "2.5s", C.marine],
        [r3, "7s", "1s", C.steel],
        [r3, "7s", "4.5s", C.cargo],
      ].map(([p, d, b, l], i) => (
        <g key={i}>
          <TruckGlyph load={l} />
          <Move path={p} dur={d} begin={b} />
        </g>
      ))}
      <Node x={100} y={330} label="Port" color={C.cargo} />
      <Node x={320} y={160} label="Warehouse" dy={-22} />
      <Node x={560} y={270} label="Destination" />
      <g transform="translate(40 50)">
        <Label x={0} y={0} fill={C.steel}>Fleet · 20+ trucks</Label>
        {["Container haulage", "Tipper", "Low loader"].map((t, i) => (
          <Label key={t} x={0} y={24 + i * 20} fill={C.foam}>
            {`· ${t}`}
          </Label>
        ))}
      </g>
      <Label x={600} y={410} anchor="end" fill={C.cyan}>Malaysia ⇄ Singapore</Label>
    </>
  );
}

function HeavyLift() {
  return (
    <>
      <line x1="0" y1="350" x2="640" y2="350" stroke={C.mist} strokeOpacity=".3" />
      {/* mobile crane */}
      <rect x="60" y="300" width="110" height="34" fill={C.cargo} />
      <rect x="70" y="276" width="40" height="26" fill={C.cargo} opacity=".85" />
      {[80, 115, 150].map((x) => (
        <circle key={x} cx={x} cy="340" r="10" fill={C.navy} stroke={C.steel} />
      ))}
      <line x1="120" y1="290" x2="380" y2="70" stroke={C.foam} strokeWidth="7" />
      <line x1="120" y1="290" x2="380" y2="70" stroke={C.steel} strokeWidth="1" strokeDasharray="4 6" />
      {/* hook + load moves together */}
      <g>
        <line x1="380" y1="72" x2="380" y2="170" stroke={C.mist} strokeWidth="1.5">
          <A attributeName="y2" values="190;120;120;190;190" keyTimes="0;0.3;0.55;0.8;1" dur="8s" />
        </line>
        <g>
          <T type="translate" values="0 0;0 -70;0 -70;0 0;0 0" keyTimes="0;0.3;0.55;0.8;1" dur="8s" />
          <path d="M372 192 h16 l-8 10z" fill={C.mist} />
          <g transform="translate(380 245)">
            <rect x="-48" y="-42" width="96" height="84" fill={C.marine} />
            <rect x="-38" y="-52" width="76" height="10" fill={C.steel} />
            {[-30, -10, 10, 30].map((x) => (
              <rect key={x} x={x - 3} y="-36" width="6" height="72" fill={C.navy} opacity=".35" />
            ))}
            <Label x={0} y={64} anchor="middle" fill={C.foam}>Oversized</Label>
          </g>
        </g>
      </g>
      {/* low loader */}
      <g>
        <T type="translate" values="0 0;0 0;0 0;160 0;160 0" keyTimes="0;0.55;0.8;0.98;1" dur="8s" />
        <rect x="300" y="300" width="220" height="10" fill={C.steel} />
        <path d="M520 284 h30 l14 14 v12 h-44z" fill={C.foam} />
        {[320, 345, 470, 495, 545].map((x) => (
          <circle key={x} cx={x} cy="318" r="8" fill={C.navy} stroke={C.steel} />
        ))}
      </g>
      <Label x={40} y={400}>Plan · Approve · Lift · Transport · Position</Label>
    </>
  );
}

function TugBarge() {
  const wave = (y: number, o: number) => `M-40 ${y} ${Array.from({ length: 12 }, (_, i) => `q 30 ${o} 60 0`).join(" ")}`;
  return (
    <>
      {/* port silhouette */}
      {[60, 130, 200].map((x) => (
        <g key={x} opacity=".35">
          <rect x={x} y="130" width="6" height="120" fill={C.steel} />
          <rect x={x + 34} y="130" width="6" height="120" fill={C.steel} />
          <rect x={x - 30} y="124" width="110" height="8" fill={C.steel} />
        </g>
      ))}
      <rect x="0" y="250" width="280" height="10" fill={C.steel} opacity=".3" />
      <Label x={20} y={290} fill={C.steel}>Penang Port</Label>
      {[300, 330, 360, 390].map((y, i) => (
        <path key={y} d={wave(y, i % 2 ? -5 : 5)} fill="none" stroke={C.cyan} strokeOpacity={0.12 + i * 0.06}>
          <T type="translate" values={`0 0;${i % 2 ? -60 : 60} 0`} dur={`${6 + i}s`} />
        </path>
      ))}
      <g>
        <T type="translate" values="-120 0;380 0" dur="22s" />
        <g>
          <T type="translate" values="0 0;0 -3;0 0" dur="3s" additive="sum" />
          {/* barge */}
          <path d="M120 330 h190 l-10 22 h-170z" fill="#5a463b" />
          <path d="M140 330 q60 -46 150 0z" fill="#8d8173" />
          {/* tow line */}
          <path d="M310 336 Q350 346 392 336" fill="none" stroke={C.mist} strokeWidth="1.2" />
          {/* tug */}
          <path d="M390 336 h70 l-8 18 h-56z" fill={C.hull} stroke={C.foam} strokeOpacity=".3" />
          <rect x="405" y="314" width="34" height="22" fill={C.foam} />
          <rect x="410" y="300" width="22" height="14" fill={C.foam} />
          <rect x="412" y="304" width="18" height="5" fill={C.cyan} opacity=".6" />
          <rect x="436" y="296" width="9" height="20" fill={C.cargo} />
        </g>
      </g>
      <Label x={620} y={410} anchor="end" fill={C.foam}>Dry bulk · Passenger boats</Label>
    </>
  );
}

function Marine() {
  const orbit = "M320,150 C470,150 560,230 520,300 C480,370 160,370 120,300 C80,230 170,150 320,150Z";
  return (
    <>
      <ellipse cx="320" cy="262" rx="230" ry="96" fill="none" stroke={C.cyan} strokeOpacity=".18" strokeDasharray="4 8" />
      {/* vessel at anchor */}
      <g transform="translate(320 262)">
        <path d="M-150 -6 h290 l18 -14 v20 l-24 26 h-264z" fill={C.hull} stroke={C.foam} strokeOpacity=".25" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-130 + i * 24} y="-30" width="22" height="24" fill={i % 3 === 0 ? C.cargo : i % 2 ? C.marine : C.steel} />
        ))}
        <rect x="96" y="-56" width="26" height="50" fill={C.foam} />
        <rect x="92" y="-60" width="34" height="8" fill={C.foam} />
        <line x1="-150" y1="20" x2="-170" y2="70" stroke={C.mist} strokeOpacity=".5" />
        <Label x={-178} y={88} fill={C.steel}>At anchor</Label>
      </g>
      {[
        ["Bunkering", "0s", C.cargo],
        ["Crew change", "3s", C.cyan],
        ["Supplies", "6s", C.foam],
        ["Spares · JIT", "9s", C.mist],
      ].map(([t, b, c]) => (
        <g key={t}>
          <Move path={orbit} dur="12s" begin={b} rotate="0" />
          <path d="M-14 0 h28 l-5 7 h-18z" fill={c} />
          <rect x="-6" y="-7" width="10" height="7" fill={c} />
          <Label x={18} y={-6} fill={c}>
            {t}
          </Label>
        </g>
      ))}
      <Label x={40} y={410}>Agency · Brokerage · Chartering · Chandling</Label>
    </>
  );
}

const SCENES: Record<ServiceId, () => React.JSX.Element> = {
  freight: Freight,
  customs: Customs,
  warehouse: WarehouseScene,
  transport: Transport,
  project: HeavyLift,
  tugbarge: TugBarge,
  marine: Marine,
};

export default function ServiceScene({ id, animate = true, className = "" }: { id: ServiceId; animate?: boolean; className?: string }) {
  const Scene = SCENES[id];
  return (
    <Anim.Provider value={animate}>
      <svg viewBox="0 0 640 440" className={className} role="img" aria-label={`Animated illustration: ${id}`}>
        <Grid />
        <Scene />
      </svg>
    </Anim.Provider>
  );
}
