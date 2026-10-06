"use client";

import { RefObject, useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";

type Options = {
  start?: string;
  end?: string;
  /** Called on every scroll update; keep it cheap. */
  onUpdate?: (progress: number) => void;
};

/**
 * Scroll progress (0 to 1) of a tall "scrollytelling" section whose inner stage is position: sticky.
 * Returned as a ref so 3D render loops can read it without React re-renders.
 */
export function useScrollProgress(target: RefObject<HTMLElement | null>, opts: Options = {}) {
  const progress = useRef(0);
  const cb = useRef(opts.onUpdate);
  cb.current = opts.onUpdate;
  const { start = "top top", end = "bottom bottom" } = opts;

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      onUpdate: (self) => {
        progress.current = self.progress;
        cb.current?.(self.progress);
      },
      onRefresh: (self) => {
        progress.current = self.progress;
        cb.current?.(self.progress);
      },
    });
    return () => st.kill();
  }, [target, start, end]);

  return progress;
}

/** Converts continuous progress into a discrete step index (re-renders only when the step changes). */
export function stepFromProgress(p: number, steps: number) {
  return Math.min(steps - 1, Math.floor(p * steps * 0.9999));
}
