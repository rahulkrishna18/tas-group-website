import { COMPANY, OFFICES } from "@/content/site";
import { ArrowRight, Mail, Phone, Pin } from "../ui/Icons";
import { LegLabel, Reveal } from "../ui/Section";

/** End of the journey on the home page: hands off to the quote and contact pages. */
export default function Destination() {
  return (
    <section id="destination" aria-label="Get a quote or contact TAS" className="chart-grid relative overflow-hidden bg-midnight py-24 lg:py-28">
      <div className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-cargo/10 blur-[120px]" />
      <div className="container-x relative">
        <Reveal>
          <LegLabel code="11">Destination</LegLabel>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="display mt-6 max-w-4xl text-[clamp(2.4rem,5.5vw,5rem)]">
            Wherever it needs to go, <span className="text-cargo">start here.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <a href="/quote" className="group relative flex h-full flex-col justify-between overflow-hidden bg-cargo p-7 text-abyss transition-colors sm:p-9">
              <span className="corrugated absolute inset-0 opacity-40" aria-hidden="true" />
              <span className="relative">
                <span className="label">Get a quote</span>
                <span className="display-wide mt-4 block text-3xl leading-tight sm:text-4xl">Tell us what’s moving.</span>
                <span className="mt-3 block max-w-md text-abyss/80">Mode, route, cargo and contact details in four short steps.</span>
              </span>
              <span className="label relative mt-10 inline-flex items-center gap-3">
                Start a quote <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-ship group-hover:translate-x-1.5" />
              </span>
            </a>
          </Reveal>
          <Reveal delay={0.08}>
            <a href="/contact" className="group flex h-full flex-col justify-between border border-foam/15 bg-abyss/60 p-7 backdrop-blur transition-colors hover:border-cyan sm:p-9">
              <span>
                <span className="label text-cyan">Contact</span>
                <span className="display-wide mt-4 block text-3xl leading-tight text-foam sm:text-4xl">Talk to our offices.</span>
                <span className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-mist">
                  <Pin className="h-4 w-4 text-cyan" /> {OFFICES.map((o) => o.name).join(" · ")}
                </span>
              </span>
              <span className="mt-10 flex flex-wrap items-center justify-between gap-4">
                <span className="space-y-1 text-sm text-foam">
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-cyan" /> {COMPANY.phone}
                  </span>
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-cyan" /> {COMPANY.email}
                  </span>
                </span>
                <span className="label inline-flex items-center gap-3 text-foam">
                  All offices <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-ship group-hover:translate-x-1.5" />
                </span>
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
