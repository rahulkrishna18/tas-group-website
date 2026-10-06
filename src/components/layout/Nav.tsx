"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Close, Menu } from "../ui/Icons";
import { COMPANY, NAV_SECTIONS } from "@/content/site";
import Wordmark from "../ui/Wordmark";

const LINKS = [
  { href: "#heritage", label: "Heritage" },
  { href: "#operations", label: "Services" },
  { href: "#network", label: "Network" },
  { href: "#group", label: "The Group" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const first = panel.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>("a,button"));
        const [a, b] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      menuBtn.current?.focus();
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color] duration-500 ${
          scrolled ? "border-b border-foam/10 bg-abyss/75 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <nav aria-label="Primary" className="container-x flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
          <a href="#top" className="shrink-0" aria-label="TAS Group of Companies, back to top">
            <Wordmark />
          </a>
          <ul className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="label group relative py-2 text-mist transition-colors hover:text-foam">
                  {l.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-cargo transition-transform duration-500 ease-ship group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a href="#quote" className="btn-cargo !px-4 !py-2.5 sm:!px-5">
              <span className="hidden sm:inline">Get a quote</span>
              <span className="sm:hidden">Quote</span>
              <ArrowRight className="arrow h-3.5 w-3.5" />
            </a>
            <button
              ref={menuBtn}
              type="button"
              className="grid h-10 w-10 place-items-center border border-foam/20 text-foam lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
        <div className="absolute inset-x-0 bottom-0 h-px">
          <div ref={bar} className="h-full origin-left bg-gradient-to-r from-cyan to-cargo" style={{ transform: "scaleX(0)" }} />
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed inset-0 z-[60] flex flex-col bg-abyss/97 backdrop-blur-xl transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="container-x flex h-16 items-center justify-between">
          <Wordmark />
          <button type="button" className="grid h-10 w-10 place-items-center border border-foam/20" aria-label="Close menu" onClick={() => setOpen(false)}>
            <Close className="h-5 w-5" />
          </button>
        </div>
        <div className="container-x chart-grid flex-1 overflow-y-auto pb-10 pt-6">
          <p className="label mb-6 text-steel">The journey</p>
          <ol className="relative border-l border-foam/15 pl-6">
            {NAV_SECTIONS.map((s) => (
              <li key={s.id} className="relative">
                <span className="absolute -left-[1.6rem] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-cyan bg-abyss" />
                <a href={`#${s.id}`} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-2.5 text-foam">
                  <span className="label text-cargo">{s.code}</span>
                  <span className="display-wide text-2xl">{s.label}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-10 space-y-2 text-sm text-mist">
            <a className="block" href={COMPANY.phoneHref}>{COMPANY.phone}</a>
            <a className="block" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </div>
        </div>
      </div>
    </>
  );
}
