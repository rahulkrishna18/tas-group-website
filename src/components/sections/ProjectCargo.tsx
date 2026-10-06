"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { stepFromProgress, useScrollProgress } from "@/hooks/useScrollProgress";
import { useIsMobile, useReducedMotion } from "@/hooks/useMediaQuery";
import { LegLabel } from "../ui/Section";
import { Check } from "../ui/Icons";

const STEPS = [
  { name: "Planning", items: ["Planning & consultation", "Sourcing"] },
  { name: "Approvals", items: ["Authority approvals", "Insurance"] },
  { name: "Handling", items: ["Heavy lift operations", "Export packing", "Consolidation & warehousing"] },
  { name: "Transport", items: ["Low loader trucks (Bexxbay Express)", "Door to door coordination"] },
  { name: "Positioning", items: ["Heavy machinery positioning", "Installation & commissioning"] },
];

export default function ProjectCargo() {
  const section = useRef<HTMLElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  useScrollProgress(section, {
    onUpdate: (p) => {
      if (reduced) return;
      setStep(stepFromProgress(p, STEPS.length));
      if (photo.current) photo.current.style.transform = `scale(${1.12 - p * 0.12}) translate3d(0, ${p * -3}%, 0)`;
      if (rig.current) rig.current.style.left = `${p * 100}%`;
      if (fill.current) fill.current.style.transform = `scaleX(${p})`;
    },
  });

  return (
    <section
      id="project-cargo"
      ref={section}
      aria-label="Project cargo and heavy lift"
      className="relative bg-abyss"
      style={{ height: reduced ? "auto" : mobile ? "240svh" : "260vh" }}
    >
      <div className={`${reduced ? "relative min-h-[100svh]" : "sticky top-0 h-[100svh]"} overflow-hidden`}>
        <div ref={photo} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.12)" }}>
          <Image src="/images/heavy-lift.jpg" alt="A floating crane lifting an oversized industrial module in a harbour" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(6_20_29/0.75)_0%,rgb(6_20_29/0.25)_35%,rgb(6_20_29/0.55)_60%,rgb(6_20_29/0.96)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(6_20_29/0.7),transparent_60%)]" />

        <div className="container-x relative flex h-full flex-col justify-between pb-10 pt-24 sm:pb-14 lg:pt-28">
          <div className="max-w-3xl">
            <LegLabel code="05">Project Cargo · Heavy Lift · Mover</LegLabel>
            <h2 className="display mt-6 text-[clamp(2.5rem,7vw,7rem)]">
              Cargo that doesn’t <br className="hidden sm:block" />
              fit <span className="text-cargo">in a box.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
              Oversized machinery and heavy equipment move as engineered projects. Every lift is planned, approved, handled,
              transported and positioned in sequence.
            </p>
          </div>

          <div>
            {reduced && (
              <div className="mb-10 grid gap-6 sm:grid-cols-5">
                {STEPS.map((s, i) => (
                  <div key={s.name}>
                    <p className="label text-cargo">{String(i + 1).padStart(2, "0")} {s.name}</p>
                    <ul className="mt-2 space-y-1 text-sm text-foam">
                      {s.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {/* active step detail */}
            <div className={`mb-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-end ${reduced ? "hidden" : ""}`} aria-live="polite">
              <div className="display text-[clamp(4rem,10vw,9rem)] leading-none text-foam/90">
                {String(step + 1).padStart(2, "0")}
              </div>
              <div key={step} className="animate-[fadeUp_.6s_var(--ease-ship)] pb-2">
                <h3 className="display-wide text-2xl text-cargo sm:text-3xl">{STEPS[step].name}</h3>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  {STEPS[step].items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-foam">
                      <Check className="h-4 w-4 text-cargo" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* process track */}
            <div className="relative pt-14">
              <div className="absolute inset-x-0 top-14 h-[3px] bg-foam/15" />
              <div ref={fill} className="absolute inset-x-0 top-14 h-[3px] origin-left bg-cargo" style={{ transform: reduced ? "scaleX(1)" : "scaleX(0)" }} />
              {/* low loader with oversized load */}
              {!reduced && (
                <div ref={rig} className="absolute top-14 -translate-x-1/2 -translate-y-full transition-[left] duration-150" style={{ left: 0 }} aria-hidden="true">
                  <svg viewBox="0 0 120 52" className="w-20 sm:w-28">
                    <rect x="22" y="4" width="54" height="30" fill="#1267a5" />
                    <rect x="28" y="0" width="42" height="6" fill="#75838c" />
                    {[34, 46, 58].map((x) => (
                      <rect key={x} x={x} y="8" width="4" height="22" fill="#06141d" opacity=".35" />
                    ))}
                    <rect x="6" y="34" width="86" height="5" fill="#c9d6dc" />
                    <path d="M92 24 h14 l8 8 v7 h-22z" fill="#f28c28" />
                    {[14, 24, 70, 80, 104].map((x) => (
                      <circle key={x} cx={x} cy="44" r="5" fill="#06141d" stroke="#c9d6dc" />
                    ))}
                  </svg>
                </div>
              )}
              <ol className="relative grid grid-cols-5">
                {STEPS.map((s, i) => (
                  <li key={s.name} className="relative pt-5" style={{ textAlign: i === 0 ? "left" : i === STEPS.length - 1 ? "right" : "center" }}>
                    <span
                      className={`absolute top-0 block h-3 w-3 -translate-y-1/2 rotate-45 border-2 transition-colors duration-500 ${i <= step || reduced ? "border-cargo bg-cargo" : "border-foam/40 bg-abyss"}`}
                      style={{ left: i === 0 ? 0 : i === STEPS.length - 1 ? "calc(100% - 12px)" : "calc(50% - 6px)", top: "-1px" }}
                    />
                    <span className={`label text-[0.55rem] !tracking-[0.06em] sm:text-[0.6875rem] sm:!tracking-[0.16em] ${i === step ? "text-foam" : "text-steel"}`}>{s.name}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
