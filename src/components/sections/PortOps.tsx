"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState } from "react";
import SceneCanvas from "../three/SceneCanvas";
import { stepFromProgress, useScrollProgress } from "@/hooks/useScrollProgress";
import { useIsMobile, useReducedMotion } from "@/hooks/useMediaQuery";
import { LegLabel } from "../ui/Section";

const loadPortScene = () => import("../scenes/PortScene");
const PortScene = dynamic(loadPortScene, { ssr: false });

const STEPS = [
  {
    title: "Vessel arrives",
    body: "A ship calls at port. Ship agency coordinates the call, and tug, crew boat, bunkering and supply services stand by.",
    tags: ["Ship Agency & Marine Services", "Tug & Barge"],
  },
  {
    title: "Cargo discharged",
    body: "Containers come off the ship. TAS’s port roots are in stevedoring: skilled supervisors, winchmen, tele clerks and lashing gangs.",
    tags: ["Stevedoring", "Ganu Jaya"],
  },
  {
    title: "Customs clearance",
    body: "Documentation and declarations are handled under TAS’s own customs clearance licence, so cargo leaves the port compliant.",
    tags: ["Customs Brokerage"],
  },
  {
    title: "Into the warehouse",
    body: "Bonded or non bonded storage with 24 hour security and CCTV, plus pick and pack, repacking and assembly before onward shipment.",
    tags: ["Warehouse & Distribution"],
  },
  {
    title: "Truck dispatch",
    body: "Bexxbay Express trucks take over: container haulage, tipper and low loader trucks, on full or loose truck loads.",
    tags: ["Transportation", "Bexxbay Express"],
  },
  {
    title: "Final delivery",
    body: "Door to door: delivered locally across Malaysia or long haul into Singapore, managed as one move from vessel to consignee.",
    tags: ["Door to door", "Freight Forwarding"],
  },
];

export default function PortOps() {
  const section = useRef<HTMLElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const progress = useScrollProgress(section, {
    onUpdate: (p) => {
      if (!reduced) setStep(stepFromProgress(p, STEPS.length));
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
    },
  });

  const goTo = (i: number) => {
    const el = section.current;
    if (!el) return;
    if (reduced) return setStep(i);
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((i + 0.55) / STEPS.length) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  };

  return (
    <section
      id="port"
      ref={section}
      aria-label="Port operations"
      className="relative bg-abyss"
      style={{ height: reduced ? "auto" : mobile ? "520svh" : "620vh" }}
    >
      <div className={`${reduced ? "relative min-h-[100svh]" : "sticky top-0 h-[100svh]"} overflow-hidden`}>
        <SceneCanvas
          preload={loadPortScene}
          className="absolute inset-0"
          camera={{ fov: 38, near: 0.5, far: 5000, position: [-120, 70, 120] }}
          fallback={<Image src="/images/port-aerial.jpg" alt="" fill sizes="100vw" className="object-cover opacity-60" />}
        >
          <PortScene progress={progress} mobile={mobile} staticStep={reduced ? step : undefined} />
        </SceneCanvas>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(6_20_29/0.92)_0%,rgb(6_20_29/0.55)_32%,transparent_60%)] max-md:bg-[linear-gradient(180deg,rgb(6_20_29/0.85)_0%,transparent_30%,transparent_55%,rgb(6_20_29/0.92)_78%)]" />

        <div className="container-x relative flex h-full flex-col justify-between py-20 md:justify-center md:py-0">
          <div className="max-w-md">
            <LegLabel code="02">Port</LegLabel>
            <h2 className="display mt-5 text-[clamp(2.2rem,4.6vw,4.4rem)]">
              One port call. <span className="text-cyan">Many operations.</span>
            </h2>
            <p className="mt-4 hidden text-mist md:block">
              Logistics is more than shipping something. Scroll through a single container’s path from the vessel to its
              consignee.
            </p>
          </div>

          <div className="mt-8 flex max-w-md gap-5 md:mt-10">
            {/* step rail */}
            <div className="relative hidden w-px shrink-0 bg-foam/15 md:block">
              <div ref={fill} className="absolute inset-x-0 top-0 h-full origin-top bg-cargo" style={{ transform: "scaleY(0)" }} />
            </div>
            <div className="w-full">
              <ol className="hidden space-y-1 md:block" aria-label="Port operation steps">
                {STEPS.map((s, i) => (
                  <li key={s.title}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={i === step ? "step" : undefined}
                      className={`label flex w-full items-center gap-3 py-1 text-left transition-colors hover:text-foam ${i === step ? "text-foam" : i < step ? "text-mist/70" : "text-steel/70"}`}
                    >
                      <span className={i <= step ? "text-cargo" : ""}>{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                      {i === step && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cargo status-blink" />}
                    </button>
                  </li>
                ))}
              </ol>
              <div className="relative mt-6 min-h-[11.5rem] border border-foam/12 bg-abyss/70 p-5 backdrop-blur-md md:min-h-[12.5rem]" aria-live="polite">
                <div className="label flex justify-between text-steel">
                  <span>
                    Step <span className="text-cargo">{String(step + 1).padStart(2, "0")}</span> / 06
                  </span>
                  <span className="md:hidden">{STEPS[step].title}</span>
                </div>
                <h3 className="display-wide mt-3 hidden text-2xl text-foam md:block">{STEPS[step].title}</h3>
                <p key={step} className="mt-3 animate-[fadeUp_.6s_var(--ease-ship)] text-[0.95rem] leading-relaxed text-mist">
                  {STEPS[step].body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {STEPS[step].tags.map((t) => (
                    <span key={t} className="label border border-cyan/30 px-2 py-1 text-cyan">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-1 md:hidden">
                  {STEPS.map((st, i) => (
                    <button key={i} type="button" aria-label={`Step ${i + 1}: ${st.title}`} onClick={() => goTo(i)} className="flex-1 py-2">
                      <span className={`block h-0.5 ${i <= step ? "bg-cargo" : "bg-foam/15"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
