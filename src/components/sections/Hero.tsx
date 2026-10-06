"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState } from "react";
import SceneCanvas from "../three/SceneCanvas";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useIsMobile, useReducedMotion } from "@/hooks/useMediaQuery";
import { range } from "@/lib/math";
import { COMPANY } from "@/content/site";
import { ArrowRight } from "../ui/Icons";

const loadHeroScene = () => import("../scenes/HeroScene");
const HeroScene = dynamic(loadHeroScene, { ssr: false });

const STAGES = [
  { at: 0, code: "00", name: "Origin" },
  { at: 0.08, code: "01", name: "Port" },
  { at: 0.42, code: "02", name: "Under way" },
  { at: 0.58, code: "03", name: "Sea · Air · Land" },
  { at: 0.76, code: "04", name: "Network" },
];
const stageAt = (p: number) => STAGES.reduce((acc, s, i) => (p >= s.at ? i : acc), 0);

const CAPTIONS = [
  null,
  {
    title: "Every journey starts at the quay.",
    body: "TAS began on the Penang waterfront in 1978, supplying stevedoring labour to the port. The Group has worked cargo at the water’s edge ever since.",
  },
  {
    title: "Loaded, documented, under way.",
    body: "Sea and air freight forwarding, with customs clearance handled under TAS’s own licence from the Royal Malaysian Customs.",
  },
  {
    title: "Sea, air and land, connected.",
    body: "As a certified Multimodal Transport Operator, TAS moves cargo between vessels, aircraft and its own fleet of 20+ trucks.",
  },
  {
    title: "Wherever the cargo needs to go, TAS manages the journey.",
    body: "Penang · Port Klang · KLIA · Langkawi · Singapore",
  },
];

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const [stage, setStage] = useState(0);

  const progress = useScrollProgress(section, {
    onUpdate: (p) => {
      setStage(stageAt(p));
      if (title.current) {
        const k = range(p, 0.015, 0.07);
        title.current.style.opacity = String(1 - k);
        title.current.style.transform = `translate3d(0, ${-k * 40}px, 0)`;
        title.current.style.visibility = k >= 1 ? "hidden" : "visible";
      }
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    },
  });

  const caption = CAPTIONS[stage];

  return (
    <section
      id="top"
      ref={section}
      aria-label="TAS Group: from port to possibility"
      className="relative"
      style={{ height: reduced ? "100svh" : mobile ? "440svh" : "560svh" }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* poster: paints immediately while the WebGL scene loads behind it */}
        <div className="absolute inset-0">
          <Image src="/images/port-cranes.jpg" alt="" fill preload sizes="100vw" className="object-cover opacity-50" />
        </div>
        <SceneCanvas
          preload={loadHeroScene}
          loader={false}
          className="absolute inset-0"
          camera={{ fov: 40, near: 0.5, far: 6000, position: [62, 21, 66] }}
          mountMargin="0px"
          fallback={<div className="absolute inset-0 bg-abyss/30" />}
        >
          <HeroScene progress={progress} mobile={mobile} staticFrame={reduced} />
        </SceneCanvas>

        {/* legibility scrims */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_100%,rgb(6_20_29/0.88)_0%,rgb(6_20_29/0.35)_45%,transparent_70%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-abyss/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-abyss/80 to-transparent" />

        {/* HUD */}
        <div className="label pointer-events-none absolute right-4 top-24 hidden text-right text-mist/80 sm:block lg:right-14">
          <div className="text-foam">{COMPANY.coords}</div>
          <div>Butterworth · Penang · MY</div>
          <div className="mt-3 inline-flex items-center gap-2 border border-foam/15 bg-abyss/40 px-2.5 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-cargo status-blink" />
            <span>
              Leg {STAGES[stage].code} / {STAGES[stage].name}
            </span>
          </div>
        </div>

        {/* Title */}
        <div ref={title} className="container-x absolute inset-x-0 bottom-28 will-change-transform sm:bottom-32 lg:bottom-36">
          <p className="label mb-5 flex items-center gap-3 text-cyan">
            <span className="h-px w-8 bg-cyan" />
            TAS Group of Companies · Penang · Est. 1978
          </p>
          <h1 className="display max-w-[14ch] text-[clamp(3rem,9.5vw,9.5rem)] text-foam text-shadow-soft">
            From port to <span className="text-cargo">possibility.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
            Freight forwarding, customs, transport, warehousing and marine operations, managed as one journey from the quays
            of Penang to wherever your cargo needs to go.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#quote" className="btn-cargo">
              Get a quote <ArrowRight className="arrow h-4 w-4" />
            </a>
            <a href="#network" className="btn-ghost">
              Explore our network
            </a>
          </div>
        </div>

        {/* Stage captions */}
        <div className="container-x pointer-events-none absolute inset-x-0 bottom-28 sm:bottom-32" aria-live="polite">
          {CAPTIONS.map((c, i) =>
            c ? (
              <div
                key={i}
                className="absolute bottom-0 max-w-2xl pr-4 transition-all duration-700 ease-ship"
                style={{
                  opacity: stage === i ? 1 : 0,
                  transform: `translateY(${stage === i ? 0 : stage > i ? -24 : 24}px)`,
                }}
                aria-hidden={stage !== i}
              >
                <p className="label mb-4 text-cargo">Leg {STAGES[i].code} · {STAGES[i].name}</p>
                <h2 className="display text-[clamp(2.2rem,5.6vw,5rem)] text-foam text-shadow-soft">{c.title}</h2>
                <p className={`mt-5 max-w-lg text-mist ${i === 4 ? "label !text-xs !tracking-[0.22em] text-foam" : "text-base leading-relaxed sm:text-lg"}`}>
                  {c.body}
                </p>
                {i === 4 && (
                  <div className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3">
                    <a href="#network" className="btn-cargo" tabIndex={stage === 4 ? 0 : -1}>
                      Explore our network <ArrowRight className="arrow h-4 w-4" />
                    </a>
                    <span className="label text-steel">Arcs beyond the Malaysia to Singapore corridor are illustrative</span>
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>

        {/* Journey progress */}
        <div className="container-x absolute inset-x-0 bottom-8 sm:bottom-10">
          <div className="relative h-px w-full bg-foam/15">
            <div ref={bar} className="absolute inset-y-0 left-0 w-full origin-left bg-cargo" style={{ transform: "scaleX(0)" }} />
          </div>
          <ol className="label mt-3 grid grid-cols-5 text-[0.6rem] text-steel sm:text-[0.6875rem]">
            {STAGES.map((s, i) => (
              <li key={s.code} className={`transition-colors ${i <= stage ? "text-foam" : ""} ${i === 0 ? "" : "text-center"} ${i === 4 ? "!text-right" : ""}`}>
                <span className={i === stage ? "text-cargo" : ""}>{s.code}</span>
                <span className="hidden sm:inline"> {s.name}</span>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </section>
  );
}
