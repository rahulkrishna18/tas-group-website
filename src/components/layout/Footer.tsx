import { COMPANY, ENTITIES, OFFICES, SERVICES } from "@/content/site";
import Wordmark from "../ui/Wordmark";
import { ArrowRight } from "../ui/Icons";

/** Unsplash photographers, each listed once with links to the photos used. */
const CREDITS: [string, string[]][] = [
  ["CHUTTERSNAP", ["https://unsplash.com/photos/aerial-photo-of-cargo-crates-fN603qcEA7g", "https://unsplash.com/photos/brown-cardboard-boxes-on-white-metal-rack-BNBA1h-NgdY"]],
  ["Venti Views", ["https://unsplash.com/photos/FPKnAO-CF6M"]],
  ["Werner Hilversum", ["https://unsplash.com/photos/a-group-of-cranes-sitting-on-top-of-a-body-of-water-vFLJEhS_y5w"]],
  ["Bhargav Panchal", ["https://unsplash.com/photos/two-semi-trucks-driving-on-a-highway-P0bVatS8Jdw"]],
  ["martin bennie", ["https://unsplash.com/photos/a-large-crane-on-a-barge-X-kS3DTrKUA"]],
  ["Andrew Danks", ["https://unsplash.com/photos/red-and-white-ship-on-sea-during-daytime-2nrFx38XrIk"]],
  ["Fejuz", ["https://unsplash.com/photos/a-large-amount-of-containers-are-stacked-on-top-of-each-other-q6j5mSRpi50"]],
  ["Gunnar Ridderström", ["https://unsplash.com/photos/wake-of-a-boat-on-the-deep-blue-ocean-FYdzLpKei28"]],
];

export default function Footer() {
  return (
    <footer id="contact" className="relative border-t border-foam/10 bg-abyss">
      <div className="container-x py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
          <div>
            <Wordmark />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-mist">
              Integrated logistics from Penang since 1978: freight, customs, transport, warehousing, project cargo and marine
              services.
            </p>
            <a href="#quote" className="btn-cargo mt-8">
              Get a quote <ArrowRight className="arrow h-4 w-4" />
            </a>
            <div className="mt-8 space-y-1 text-sm">
              <a href={COMPANY.phoneHref} className="block text-foam hover:text-cargo">
                {COMPANY.phone}
              </a>
              <a href={`mailto:${COMPANY.email}`} className="block text-foam hover:text-cargo">
                {COMPANY.email}
              </a>
            </div>
          </div>

          <div>
            <p className="label text-steel">Offices</p>
            <ul className="mt-5 grid gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {OFFICES.map((o) => (
                <li key={o.id}>
                  <p className="label text-cyan">
                    {o.code} · {o.role}
                  </p>
                  <p className="display-wide mt-1 text-lg text-foam">{o.name}</p>
                  <address className="mt-2 text-sm not-italic leading-relaxed text-mist">
                    {o.address.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </address>
                  <a href={`tel:${o.phone.replace(/[^\d+]/g, "")}`} className="mt-2 block text-sm text-foam hover:text-cargo">
                    T {o.phone}
                  </a>
                  {o.fax && <span className="block text-sm text-steel">F {o.fax}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 grid gap-10 border-t border-foam/10 pt-10 md:grid-cols-3">
          <div>
            <p className="label text-steel">Services</p>
            <ul className="mt-4 space-y-2 text-sm">
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <a href="#operations" className="text-mist hover:text-foam">
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
          <div>
            <p className="label text-steel">Photography</p>
            <p className="mt-4 text-sm text-mist">
              Images from{" "}
              <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="underline decoration-foam/20 underline-offset-2 hover:text-foam">
                Unsplash
              </a>{" "}
              by:
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {CREDITS.map(([name, photos]) => (
                <li key={name} className="text-mist">
                  {photos.length === 1 ? (
                    <a href={photos[0]} target="_blank" rel="noopener noreferrer" className="hover:text-foam">
                      {name}
                    </a>
                  ) : (
                    <>
                      {name}{" "}
                      {photos.map((u, i) => (
                        <a key={u} href={u} target="_blank" rel="noopener noreferrer" aria-label={`${name}, photo ${i + 1}`} className="label ml-1 text-steel hover:text-foam">
                          {i + 1}
                        </a>
                      ))}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="label mt-14 flex flex-col justify-between gap-4 border-t border-foam/10 pt-6 text-steel sm:flex-row">
          <span>© {new Date().getFullYear()} TAS Group of Companies</span>
          <span>Routes marked illustrative and the shipment panel are demonstrations only.</span>
          <a href="#top" className="text-mist hover:text-foam">
            Back to origin ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
