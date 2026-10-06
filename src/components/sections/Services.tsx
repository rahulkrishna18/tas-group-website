"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SERVICES } from "@/content/site";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import ServiceScene from "../scenes/ServiceScenes";
import { Check } from "../ui/Icons";
import { SectionHeader } from "../ui/Section";

export default function Services() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const list = useRef<HTMLOListElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const stageVisible = useInView(stage, "0px");

  useEffect(() => {
    const items = list.current?.querySelectorAll<HTMLElement>("[data-service]");
    if (!items) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.service))),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="operations" aria-label="Services" className="relative bg-midnight py-24 lg:py-32">
      <div className="container-x">
        <SectionHeader
          code="04"
          eyebrow="Operations"
          title={
            <>
              Seven disciplines. <span className="text-cargo">One journey.</span>
            </>
          }
          intro="Each TAS service covers one stage of the cargo’s path. The Group runs them side by side, so handovers between stages happen inside one organisation."
        />

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          {/* Sticky operations stage (desktop) */}
          <div className="hidden lg:block">
            <div ref={stage} className="sticky top-24 h-[calc(100vh-8rem)] min-h-[520px] overflow-hidden border border-foam/10 bg-abyss">
              {SERVICES.map((s, i) => (
                <div key={s.id} className="absolute inset-0 transition-opacity duration-700 ease-ship" style={{ opacity: i === active ? 1 : 0 }} aria-hidden={i !== active}>
                  <Image src={s.image} alt="" fill sizes="(min-width:1024px) 55vw, 0px" className={`object-cover opacity-30 transition-transform duration-[2.4s] ease-ship ${i === active ? "scale-100" : "scale-110"}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/70 to-abyss/40" />
                  <ServiceScene id={s.id} animate={!reduced && i === active && stageVisible} className="absolute inset-x-6 bottom-20 top-16 h-[calc(100%-9rem)] w-[calc(100%-3rem)]" />
                </div>
              ))}
              <div className="label absolute left-6 top-6 flex items-center gap-3 text-mist">
                <span className="h-1.5 w-1.5 rounded-full bg-cargo status-blink" />
                Live operation · {SERVICES[active].title}
              </div>
              <ol className="absolute inset-x-6 bottom-6 grid grid-cols-7 gap-1.5" aria-hidden="true">
                {SERVICES.map((s, i) => (
                  <li key={s.id} className="label text-[0.6rem]">
                    <span className={`mb-2 block h-0.5 transition-colors duration-500 ${i <= active ? "bg-cargo" : "bg-foam/15"}`} />
                    <span className={i === active ? "text-foam" : "text-steel"}>{s.index}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Service list */}
          <ol ref={list} className="space-y-6 lg:space-y-0">
            {SERVICES.map((s, i) => (
              <li key={s.id} data-service={i} className="lg:flex lg:min-h-[78vh] lg:items-center">
                <article className={`w-full border-t border-foam/12 pt-8 transition-opacity duration-500 lg:pt-10 ${i === active ? "lg:opacity-100" : "lg:opacity-40"}`}>
                  <div className="relative mb-6 aspect-[16/11] overflow-hidden border border-foam/10 bg-abyss lg:hidden">
                    <Image src={s.image} alt="" fill sizes="100vw" className="object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-abyss to-abyss/30" />
                    <MobileScene id={s.id} reduced={reduced} />
                  </div>
                  <p className="label flex items-center gap-3 text-steel">
                    <span className="text-cargo">{s.index}</span>
                    <span className="h-px w-6 bg-foam/25" />
                    {s.stage}
                  </p>
                  <h3 className="display-wide mt-4 text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.05] text-foam">{s.title}</h3>
                  <p className="label mt-3 text-cyan">{s.kicker}</p>
                  <p className="mt-5 max-w-xl leading-relaxed text-mist">{s.body}</p>
                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {s.points.map((pt) => (
                      <li key={pt} className="flex gap-3 text-[0.94rem] text-foam/90">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-cargo" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <a href="#quote" className="label mt-7 inline-flex items-center gap-2 text-foam underline decoration-cargo decoration-2 underline-offset-[6px] transition-colors hover:text-cargo">
                    Request a quote for {s.title.split(",")[0].replace(" & Mover", "")}
                  </a>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function MobileScene({ id, reduced }: { id: (typeof SERVICES)[number]["id"]; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, "0px");
  return (
    <div ref={ref} className="absolute inset-0">
      <ServiceScene id={id} animate={!reduced && visible} className="h-full w-full" />
    </div>
  );
}
