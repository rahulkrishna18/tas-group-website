import { COMPANY, ENTITIES, SERVICES } from "@/content/site";
import Wordmark from "../ui/Wordmark";
import { ArrowRight } from "../ui/Icons";

export default function Footer() {
  return (
    <footer className="relative border-t border-foam/10 bg-abyss">
      <div className="container-x py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-mist">
              Integrated logistics from Penang since 1978: freight, customs, transport, warehousing, project cargo and marine
              services.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="/quote" className="btn-cargo !py-3">
                Get a quote <ArrowRight className="arrow h-4 w-4" />
              </a>
              <a href="/contact" className="btn-ghost !py-3">
                Contact
              </a>
            </div>
            <div className="mt-6 space-y-1 text-sm">
              <a href={COMPANY.phoneHref} className="block text-foam hover:text-cargo">
                {COMPANY.phone}
              </a>
              <a href={`mailto:${COMPANY.email}`} className="block text-foam hover:text-cargo">
                {COMPANY.email}
              </a>
            </div>
          </div>

          <div>
            <p className="label text-steel">Services</p>
            <ul className="mt-4 space-y-2 text-sm">
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <a href="/#operations" className="text-mist hover:text-foam">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-steel">Group companies</p>
            <ul className="mt-4 space-y-2 text-sm">
              {ENTITIES.map((e) => (
                <li key={e.id} className="flex justify-between gap-4 text-mist">
                  <span>{e.name} Sdn Bhd</span>
                  <span className="font-mono text-xs text-steel">{e.reg}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="label mt-12 flex flex-col justify-between gap-4 border-t border-foam/10 pt-6 text-steel sm:flex-row">
          <span>© {new Date().getFullYear()} TAS Group of Companies</span>
          <span>Routes marked illustrative and the shipment panel are demonstrations only.</span>
          <a href="#main" className="text-mist hover:text-foam">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
