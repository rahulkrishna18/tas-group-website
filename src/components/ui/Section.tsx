"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "p" }) {
  // Reduced motion is handled globally by <MotionConfig reducedMotion="user"> (transforms are skipped).
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 0.8, 0.2, 1] }}
    >
      {children}
    </Comp>
  );
}

export function LegLabel({ code, children, tone = "dark" }: { code: string; children: ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`label flex items-center gap-3 ${tone === "dark" ? "text-cyan" : "text-marine"}`}>
      <span className={`inline-flex h-6 shrink-0 items-center whitespace-nowrap border px-2 ${tone === "dark" ? "border-cargo/50 text-cargo" : "border-cargo text-cargo-deep"}`}>Leg {code}</span>
      {children}
    </p>
  );
}

export function SectionHeader({
  code,
  eyebrow,
  title,
  intro,
  tone = "dark",
  className = "",
}: {
  code: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal>
        <LegLabel code={code} tone={tone}>
          {eyebrow}
        </LegLabel>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className={`display mt-6 text-[clamp(2.4rem,6vw,5.5rem)] ${tone === "dark" ? "text-foam" : "text-abyss"}`}>{title}</h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.1}>
          <p className={`mt-6 max-w-2xl text-base leading-relaxed sm:text-lg ${tone === "dark" ? "text-mist" : "text-hull/80"}`}>{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
