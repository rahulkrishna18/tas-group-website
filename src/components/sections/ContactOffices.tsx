"use client";

import { useState } from "react";
import { COMPANY, OFFICES, OfficeId } from "@/content/site";
import { RegionMap } from "./Network";
import { ArrowRight, Mail, Phone, Pin } from "../ui/Icons";
import { LegLabel } from "../ui/Section";

const tel = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

export default function ContactOffices() {
  const [selected, setSelected] = useState<OfficeId>("penang");

  return (
    <section aria-label="Contact TAS Group" className="relative min-h-[100svh] overflow-hidden bg-abyss pb-24 pt-28 lg:pb-32 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_30%,rgb(18_103_165/0.2),transparent_70%)]" />
      <div className="container-x relative">
        <LegLabel code="11">Contact</LegLabel>
        <h1 className="display mt-6 text-[clamp(2.6rem,6vw,5.6rem)]">
          Talk to <span className="text-cyan">TAS.</span>
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <a href={COMPANY.phoneHref} className="flex items-center gap-3 text-lg text-foam hover:text-cargo">
            <Phone className="h-5 w-5 text-cyan" /> {COMPANY.phone}
          </a>
          <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-3 text-lg text-foam hover:text-cargo">
            <Mail className="h-5 w-5 text-cyan" /> {COMPANY.email}
          </a>
          <a href="/quote" className="btn-cargo">
            Get a quote <ArrowRight className="arrow h-4 w-4" />
          </a>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-8">
          <ul className="grid content-start gap-3 sm:grid-cols-2" aria-label="Offices">
            {OFFICES.map((o) => {
              const on = o.id === selected;
              return (
                <li key={o.id} className={o.id === "penang" ? "sm:col-span-2" : ""}>
                  <article
                    onMouseEnter={() => setSelected(o.id)}
                    className={`h-full border p-6 transition-colors ${on ? "border-cargo/70 bg-midnight" : "border-foam/10 bg-midnight/40"}`}
                  >
                    <button type="button" onClick={() => setSelected(o.id)} aria-pressed={on} className="w-full text-left">
                      <span className="label flex items-center gap-2 text-cyan">
                        <span className={`h-2 w-2 rotate-45 ${o.id === "penang" ? "bg-cargo" : "bg-cyan"}`} />
                        {o.code} · {o.role}
                      </span>
                      <h2 className="display-wide mt-2 text-2xl text-foam">{o.name}</h2>
                    </button>
                    <address className="mt-3 text-sm not-italic leading-relaxed text-mist">
                      {o.address.map((l) => (
                        <span key={l} className="block">
                          {l}
                        </span>
                      ))}
                    </address>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                      <a href={tel(o.phone)} className="text-foam hover:text-cargo">
                        T {o.phone}
                      </a>
                      {o.fax && <span className="text-steel">F {o.fax}</span>}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address.join(", "))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="label ml-auto inline-flex items-center gap-1.5 text-mist hover:text-foam"
                      >
                        <Pin className="h-3.5 w-3.5" /> Directions
                      </a>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          <div className="relative aspect-[4/5] overflow-hidden border border-foam/10 bg-midnight/60 lg:sticky lg:top-28 lg:aspect-auto lg:h-[min(78vh,720px)]">
            <RegionMap selected={selected} onSelect={setSelected} modes={[]} toolbar={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
