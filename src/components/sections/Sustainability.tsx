import Image from "next/image";
import { CREDENTIALS, MISSION_POINTS, VALUES, VISION } from "@/content/site";
import { LegLabel, Reveal } from "../ui/Section";
import { Leaf, Shield } from "../ui/Icons";

export default function Sustainability() {
  return (
    <section id="responsibility" aria-label="Responsibility and values" className="relative overflow-hidden bg-abyss">
      <div className="relative">
        <div className="absolute inset-0">
          <Image src="/images/ocean.jpg" alt="" fill sizes="100vw" className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-abyss/60 to-abyss" />
        </div>
        <div className="container-x relative py-24 lg:py-36">
          <Reveal>
            <LegLabel code="10">Responsibility</LegLabel>
          </Reveal>
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
            <Reveal>
              <figure>
                <p className="label mb-6 flex items-center gap-2 text-cyan">
                  <Leaf className="h-4 w-4" /> Our vision
                </p>
                <blockquote className="display-wide text-[clamp(1.7rem,3.4vw,3.2rem)] leading-[1.12] text-foam">
                  “{VISION}”
                </blockquote>
                <figcaption className="label mt-6 text-steel">TAS Group vision statement</figcaption>
              </figure>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="label text-steel">Our mission</p>
              <ol className="mt-5 space-y-5">
                {MISSION_POINTS.map((m, i) => (
                  <li key={m} className="flex gap-4 border-t border-foam/12 pt-5">
                    <span className="label text-cargo">{String(i + 1).padStart(2, "0")}</span>
                    <p className="leading-relaxed text-mist">{m}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="container-x pb-24 lg:pb-32">
        <Reveal>
          <p className="label text-steel">How we work</p>
        </Reveal>
        <ul className="mt-6 grid gap-px overflow-hidden border border-foam/10 bg-foam/10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal as="li" key={v.title} delay={i * 0.06} className="group bg-abyss p-6 transition-colors hover:bg-midnight">
              <span className="corrugated mb-6 block h-2 w-10 bg-cargo transition-all duration-500 group-hover:w-16" />
              <h3 className="display-wide text-lg leading-snug text-foam">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{v.body}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-16">
          <p className="label flex items-center gap-2 text-steel">
            <Shield className="h-4 w-4" /> Licences & registrations
          </p>
        </Reveal>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CREDENTIALS.map((c, i) => (
            <Reveal as="li" key={c.code} delay={i * 0.05} className="flex items-start gap-4 border border-foam/10 p-5">
              <span className="display-wide grid h-12 w-12 shrink-0 place-items-center border border-cyan/40 text-sm text-cyan">{c.code}</span>
              <div>
                <p className="font-medium leading-snug text-foam">{c.title}</p>
                <p className="mt-1 text-sm text-steel">{c.detail}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
