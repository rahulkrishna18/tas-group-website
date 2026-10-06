"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Keeps ScrollTrigger measurements correct when section heights change after hydration
 * (responsive layouts, fonts, lazy media), and mirrors reduced-motion onto <html>.
 */
export default function ScrollRefresh({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => document.documentElement.classList.toggle("reduce-motion", mql.matches);
    sync();
    mql.addEventListener("change", sync);

    let t: ReturnType<typeof setTimeout>;
    let lastH = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(document.body);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      ro.disconnect();
      clearTimeout(t);
      mql.removeEventListener("change", sync);
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
