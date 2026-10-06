"use client";

import { useEffect, useState } from "react";
import { NAV_SECTIONS } from "@/content/site";

/** Desktop route rail: shows which leg of the cargo journey the visitor is on. */
export default function JourneyRail() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = NAV_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(NAV_SECTIONS.findIndex((s) => s.id === e.target.id));
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const hidden = active <= 0;
  const pct = (active / (NAV_SECTIONS.length - 1)) * 100;

  return (
    <nav
      aria-label="Journey progress"
      className={`fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 transition-opacity duration-500 xl:block ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <div className="relative py-1">
        <div className="absolute bottom-2 right-[5px] top-2 w-px bg-foam/15" />
        <div className="absolute right-[5px] top-2 w-px bg-cargo transition-[height] duration-700 ease-ship" style={{ height: `calc(${pct}% - ${pct / 100}rem)` }} />
        <ol className="relative flex flex-col gap-[1.05rem]">
          {NAV_SECTIONS.map((s, i) => (
            <li key={s.id} className="group flex items-center justify-end gap-3">
              <a
                href={`#${s.id}`}
                className={`label translate-x-1 whitespace-nowrap rounded-sm bg-abyss/80 px-1.5 py-0.5 opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 focus:translate-x-0 focus:opacity-100 ${
                  i === active ? "text-foam" : "text-mist"
                }`}
                aria-current={i === active ? "step" : undefined}
              >
                <span className="text-cargo">{s.code}</span> {s.label}
              </a>
              <span
                className={`block shrink-0 transition-all duration-500 ${
                  i === active ? "h-[11px] w-[11px] bg-cargo" : i < active ? "h-[7px] w-[7px] translate-x-[-2px] rounded-full bg-cargo/80" : "h-[7px] w-[7px] translate-x-[-2px] rounded-full border border-foam/40 bg-abyss"
                }`}
                aria-hidden="true"
              />
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
