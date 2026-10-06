"use client";

import Image from "next/image";
import { useState } from "react";
import SceneCanvas from "../three/SceneCanvas";
import { MarineScene } from "../three/scenes";
import type { MarineFocus } from "../scenes/MarineScene";
import { MARINE_FULL_LIST } from "@/content/site";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { LegLabel, Reveal } from "../ui/Section";
import { Check } from "../ui/Icons";


const TABS: { id: MarineFocus; label: string; title: string; body: string; items: string[] }[] = [
  {
    id: "agency",
    label: "Ship agency",
    title: "Vessels calling, fully attended",
    body: "Agency for owners and charterers while a vessel is in port or at anchor, with supplies, fuel and crew arranged around the call.",
    items: ["Ship agency & brokerage", "Chartering & chandling", "Bunkering: port & off port limits", "Vessel supplies & replenishment", "Cargo survey"],
  },
  {
    id: "tugbarge",
    label: "Tug & barge",
    title: "Tug & barge owner at Penang Port",
    body: "A specialised tug and barge fleet at Penang Port moves dry bulk cargo. Tugs and barges are also available for hire.",
    items: ["Dry bulk cargo transport", "Tug boat & barge hire", "Off port limit services"],
  },
  {
    id: "crew",
    label: "Crew & passenger boats",
    title: "Crew and people on the water",
    body: "Passenger boats operate within the port vicinity, and crew boats are available for hire to support crew changes.",
    items: ["Passenger / crew boat hire", "Crew change services", "Medical assistance", "Passenger boat operations"],
  },
  {
    id: "port",
    label: "Stevedoring & port",
    title: "The Group’s first trade, still on the quay",
    body: "The skilled port workforce that started TAS in 1978, plus equipment, spares and repair services for vessels in port.",
    items: ["Stevedoring services", "Supervisors, foremen & winchmen", "Tele clerks & lashing gangs", "Forklift, crane & shovel rental", "Ship & boat repair · sludge removal", "Ship spares clearance & JIT delivery"],
  },
];

export default function Marine() {
  const [focus, setFocus] = useState<MarineFocus>("agency");
  const reduced = useReducedMotion();
  const tab = TABS.find((t) => t.id === focus)!;

  return (
    <section id="marine" aria-label="Marine operations" className="relative bg-abyss">
      <div className="relative h-[100svh] min-h-[640px] overflow-hidden">
        <SceneCanvas
          eager={2}
          className="absolute inset-0"
          camera={{ fov: 36, near: 0.5, far: 5000, position: [130, 70, 20] }}
          fallback={<Image src="/images/tugboat.jpg" alt="" fill sizes="100vw" className="object-cover opacity-60" />}
        >
          <MarineScene focus={focus} onFocus={setFocus} still={reduced} />
        </SceneCanvas>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(6_20_29/0.85)_0%,transparent_28%,transparent_50%,rgb(6_20_29/0.92)_88%)] lg:bg-[linear-gradient(90deg,rgb(6_20_29/0.9)_0%,rgb(6_20_29/0.4)_38%,transparent_60%)]" />

        <div className="container-x pointer-events-none relative flex h-full flex-col justify-between pb-8 pt-24 lg:justify-center lg:pb-0 lg:pt-0">
          <div className="max-w-lg">
            <LegLabel code="06">Marine operations</LegLabel>
            <h2 className="display mt-5 text-[clamp(2.3rem,5vw,4.8rem)]">
              Working <span className="text-cyan">the water.</span>
            </h2>
            <p className="mt-4 hidden max-w-md text-mist sm:block">Select a vessel to see how TAS supports it.</p>
          </div>

          <div className="pointer-events-auto mt-6 max-w-lg lg:mt-10">
            <div role="tablist" aria-label="Marine capability" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={t.id === focus}
                  aria-controls="marine-panel"
                  onClick={() => setFocus(t.id)}
                  className={`label shrink-0 border px-3 py-2.5 transition-colors ${t.id === focus ? "border-cyan bg-cyan text-abyss" : "border-foam/20 bg-abyss/50 text-mist backdrop-blur hover:border-cyan/60 hover:text-foam"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div id="marine-panel" role="tabpanel" className="mt-3 border border-foam/12 bg-abyss/75 p-5 backdrop-blur-md" aria-live="polite">
              <div key={focus} className="animate-[fadeUp_.5s_var(--ease-ship)]">
                <h3 className="display-wide text-xl text-foam sm:text-2xl">{tab.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-mist">{tab.body}</p>
                <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                  {tab.items.map((it) => (
                    <li key={it} className="flex gap-2 text-sm text-foam/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x py-16 lg:py-20">
        <Reveal>
          <p className="label text-steel">Ship agency & marine services: the full list</p>
        </Reveal>
        <ul className="mt-6 grid grid-cols-1 border-l border-t border-foam/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {MARINE_FULL_LIST.map((m, i) => (
            <li key={m} className="group flex min-h-[5.5rem] flex-col justify-between border-b border-r border-foam/10 p-4 transition-colors hover:bg-hull">
              <span className="label text-steel group-hover:text-cyan">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-3 text-[0.95rem] leading-snug text-foam">{m}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
