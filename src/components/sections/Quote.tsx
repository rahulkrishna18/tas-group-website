"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { COMPANY, OFFICES } from "@/content/site";
import { ArrowLeft, ArrowRight, Check, Mail, Phone, Plane, Ship, Truck, Box } from "../ui/Icons";
import { LegLabel } from "../ui/Section";

type Mode = "sea" | "air" | "land" | "multimodal";
type Form = {
  mode: Mode | "";
  extras: string[];
  origin: string;
  destination: string;
  cargoType: string;
  load: string;
  weight: string;
  volume: string;
  ready: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const EMPTY: Form = { mode: "", extras: [], origin: "", destination: "", cargoType: "", load: "", weight: "", volume: "", ready: "", company: "", name: "", email: "", phone: "", notes: "" };

const MODES: { id: Mode; label: string; sub: string; icon: typeof Ship }[] = [
  { id: "sea", label: "Sea", sub: "FCL · LCL", icon: Ship },
  { id: "air", label: "Air", sub: "Air · courier · hand carry", icon: Plane },
  { id: "land", label: "Land", sub: "MY · SG trucking", icon: Truck },
  { id: "multimodal", label: "Multimodal", sub: "Let TAS plan the mix", icon: Box },
];
const EXTRAS = ["Customs brokerage", "Warehousing & distribution", "Project cargo / heavy lift", "Ship agency & marine services", "Tug & barge"];
const CARGO = ["General cargo", "Dangerous goods", "High value / sensitive", "Oversized / heavy machinery", "Dry bulk", "Other"];
const LOADS: Record<Mode, string[]> = {
  sea: ["FCL: 20ft", "FCL: 40ft", "LCL / consolidated", "Breakbulk"],
  air: ["General air cargo", "Courier", "Hand carry"],
  land: ["Full truck load", "Loose truck load", "Low loader", "Tipper"],
  multimodal: ["Not sure: advise me"],
};
const STEPS = ["Mode", "Route & cargo", "Contact", "Review"];

/** Maps service links (/quote?service=…) to a sensible starting point in the form. */
const SERVICE_PREFILL: Record<string, { mode?: Mode; extra?: string }> = {
  freight: { mode: "multimodal" },
  customs: { extra: "Customs brokerage" },
  warehouse: { extra: "Warehousing & distribution" },
  transport: { mode: "land" },
  project: { extra: "Project cargo / heavy lift" },
  tugbarge: { extra: "Tug & barge" },
  marine: { extra: "Ship agency & marine services" },
};

const required: Record<number, (keyof Form)[]> = {
  0: ["mode"],
  1: ["origin", "destination", "cargoType"],
  2: ["company", "name", "email"],
};

function validate(step: number, f: Form) {
  const errs: Partial<Record<keyof Form, string>> = {};
  for (const k of required[step] ?? []) if (!String(f[k]).trim()) errs[k] = "Required";
  if (step === 2 && f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email = "Enter a valid email";
  if (step === 1 && f.weight && Number(f.weight) < 0) errs.weight = "Must be positive";
  return errs;
}

export default function Quote({ standalone = false }: { standalone?: boolean }) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [done, setDone] = useState<string | null>(null);
  const [dir, setDir] = useState(1);
  const panel = useRef<HTMLDivElement>(null);

  // Prefill from links elsewhere on the site, e.g. /quote?origin=Penang or /quote?service=customs
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const origin = q.get("origin") ?? "";
    const destination = q.get("destination") ?? "";
    const svc = SERVICE_PREFILL[q.get("service") ?? ""];
    if (!origin && !destination && !svc) return;
    setForm((f) => ({
      ...f,
      origin: origin || f.origin,
      destination: destination || f.destination,
      mode: svc?.mode ?? f.mode,
      extras: svc?.extra && !f.extras.includes(svc.extra) ? [...f.extras, svc.extra] : f.extras,
    }));
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const go = (to: number) => {
    if (to > step) {
      const errs = validate(step, form);
      if (Object.keys(errs).length) {
        setErrors(errs);
        const first = Object.keys(errs)[0];
        panel.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
        return;
      }
    }
    setDir(to > step ? 1 : -1);
    setStep(to);
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("h3")?.focus());
  };

  const summary = useMemo(
    () =>
      [
        ["Mode", MODES.find((m) => m.id === form.mode)?.label ?? ""],
        ["Additional services", form.extras.join(", ")],
        ["Origin", form.origin],
        ["Destination", form.destination],
        ["Cargo type", form.cargoType],
        ["Load", form.load],
        ["Approx. weight (kg)", form.weight],
        ["Approx. volume (cbm)", form.volume],
        ["Cargo ready", form.ready],
        ["Company", form.company],
        ["Contact", form.name],
        ["Email", form.email],
        ["Phone", form.phone],
        ["Special requirements", form.notes],
      ].filter(([, v]) => v),
    [form]
  );

  const mailto = useMemo(() => {
    const body = `Hello TAS Group,\n\nI would like a quotation for the following shipment:\n\n${summary.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nReference: ${done ?? ""}\n\nThank you.`;
    return `mailto:${COMPANY.email}?subject=${encodeURIComponent(`Quote request: ${form.origin} → ${form.destination} (${form.mode})`)}&body=${encodeURIComponent(body)}`;
  }, [summary, form, done]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) return go(step + 1);
    const ref = `TAS Q ${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setDone(ref);
  };

  const ModeIcon = MODES.find((m) => m.id === form.mode)?.icon ?? Box;

  const Heading = standalone ? "h1" : "h2";

  return (
    <section id="quote" aria-label="Get a quote" className={`relative overflow-hidden bg-midnight ${standalone ? "min-h-[100svh] pb-24 pt-28 lg:pb-32 lg:pt-36" : "py-24 lg:py-32"}`}>
      <div className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full bg-cargo/10 blur-[120px]" />
      <div className="container-x relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          {/* Left: headline + live booking note */}
          <div>
            <LegLabel code="11">Get a quote</LegLabel>
            <Heading className="display mt-6 text-[clamp(2.6rem,6vw,5.6rem)]">
              Start the <span className="text-cargo">journey.</span>
            </Heading>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-mist">
              Tell us what’s moving and where. A TAS logistics specialist will come back with the right mode, route and
              services.
            </p>

            <div className="relative mt-10 max-w-md overflow-hidden border border-foam/15 bg-abyss" aria-hidden="true">
              <div className="corrugated h-2 bg-cargo" />
              <div className="p-5">
                <div className="label flex justify-between text-steel">
                  <span>Booking note · draft</span>
                  <span className="text-foam">{done ?? "TAS Q ······"}</span>
                </div>
                <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="min-w-0">
                    <p className="label text-[0.6rem] text-steel">From</p>
                    <p className="display-wide truncate text-2xl text-foam">{form.origin || "Origin"}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-cargo">
                    <ModeIcon className="h-5 w-5" />
                    <span className="block h-px w-14 bg-gradient-to-r from-cyan to-cargo" />
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="label text-[0.6rem] text-steel">To</p>
                    <p className="display-wide truncate text-2xl text-foam">{form.destination || "Destination"}</p>
                  </div>
                </div>
                <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-dashed border-foam/15 pt-4">
                  {[
                    ["Mode", MODES.find((m) => m.id === form.mode)?.label || "·"],
                    ["Cargo", form.cargoType || "·"],
                    ["Weight", form.weight ? `${form.weight} kg` : "·"],
                  ].map(([k, v]) => (
                    <div key={k} className="min-w-0">
                      <dt className="label text-[0.6rem] text-steel">{k}</dt>
                      <dd className="mt-1 truncate text-sm text-foam">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 flex gap-1">
                  {STEPS.map((s, i) => (
                    <span key={s} className={`h-1 flex-1 transition-colors duration-500 ${i < step || done ? "bg-cargo" : i === step ? "bg-cyan" : "bg-foam/10"}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <a href={COMPANY.phoneHref} className="flex items-center gap-2 text-foam hover:text-cargo">
                <Phone className="h-4 w-4 text-cyan" /> {COMPANY.phone}
              </a>
              <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 text-foam hover:text-cargo">
                <Mail className="h-4 w-4 text-cyan" /> {COMPANY.email}
              </a>
            </div>
          </div>

          {/* Right: form */}
          <div ref={panel} className="relative border border-foam/12 bg-abyss/80 backdrop-blur">
            <ol className="grid grid-cols-4 border-b border-foam/10" aria-label="Quote steps">
              {STEPS.map((s, i) => {
                // aria-disabled rather than the native attribute: Firefox restores native
                // disabled state on reload, which breaks hydration.
                const locked = !!done || i > step;
                return (
                <li key={s}>
                  <button
                    type="button"
                    aria-disabled={locked}
                    onClick={() => !locked && go(i)}
                    aria-current={i === step ? "step" : undefined}
                    className={`label w-full px-2 py-4 text-left text-[0.6rem] transition-colors sm:px-4 sm:text-[0.6875rem] ${locked ? "cursor-default" : ""} ${i === step && !done ? "bg-midnight text-foam" : i < step || done ? "text-cyan hover:text-foam" : "text-steel"}`}
                  >
                    <span className={i === step && !done ? "text-cargo" : ""}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="mt-1 block truncate">{s}</span>
                  </button>
                </li>
                );
              })}
            </ol>

            {done ? (
              <Success refCode={done} mailto={mailto} summary={summary} onReset={() => { setDone(null); setForm(EMPTY); setStep(0); }} />
            ) : (
              <form onSubmit={submit} noValidate autoComplete="off" className="p-5 sm:p-8">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.div
                    key={step}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -40 }}
                    transition={{ duration: 0.35, ease: [0.22, 0.8, 0.2, 1] }}
                  >
                    {step === 0 && (
                      <fieldset>
                        <h3 tabIndex={-1} className="display-wide text-2xl text-foam outline-none">How should it move?</h3>
                        <legend className="sr-only">Transport mode</legend>
                        <div className="mt-6 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Transport mode" aria-invalid={!!errors.mode}>
                          {MODES.map((m) => {
                            const on = form.mode === m.id;
                            return (
                              <label key={m.id} className={`group relative cursor-pointer border p-4 transition-all ${on ? "border-cargo bg-cargo/10" : "border-foam/12 hover:border-foam/35"}`}>
                                <input type="radio" name="mode" value={m.id} checked={on} onChange={() => { set("mode", m.id); set("load", ""); }} className="sr-only" />
                                <m.icon className={`h-6 w-6 transition-colors ${on ? "text-cargo" : "text-cyan"}`} />
                                <span className="display-wide mt-4 block text-lg text-foam">{m.label}</span>
                                <span className="mt-1 block text-xs text-steel">{m.sub}</span>
                                {on && <Check className="absolute right-3 top-3 h-4 w-4 text-cargo" />}
                              </label>
                            );
                          })}
                        </div>
                        {errors.mode && <p className="label mt-2 text-cargo" role="alert">Choose a transport mode</p>}
                        <p className="label mb-3 mt-8 text-steel">Also need (optional)</p>
                        <div className="flex flex-wrap gap-2">
                          {EXTRAS.map((x) => {
                            const on = form.extras.includes(x);
                            return (
                              <label key={x} className={`label cursor-pointer border px-3 py-2 transition-colors ${on ? "border-cyan bg-cyan/10 text-foam" : "border-foam/12 text-mist hover:border-foam/30"}`}>
                                <input type="checkbox" className="sr-only" checked={on} onChange={() => set("extras", on ? form.extras.filter((e) => e !== x) : [...form.extras, x])} />
                                {on ? "✓ " : "+ "}
                                {x}
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    )}

                    {step === 1 && (
                      <div>
                        <h3 tabIndex={-1} className="display-wide text-2xl text-foam outline-none">Route & cargo</h3>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          <Field label="Origin" name="origin" error={errors.origin} required>
                            {(id, desc) => <input id={id} aria-describedby={desc} name="origin" list="tas-places" value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="City, port or address" className={inputCls(errors.origin)} autoComplete="off" />}
                          </Field>
                          <Field label="Destination" name="destination" error={errors.destination} required>
                            {(id, desc) => <input id={id} aria-describedby={desc} name="destination" list="tas-places" value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="City, port or address" className={inputCls(errors.destination)} autoComplete="off" />}
                          </Field>
                          <datalist id="tas-places">
                            {OFFICES.map((o) => (
                              <option key={o.id} value={o.name} />
                            ))}
                          </datalist>
                          <Field label="Cargo type" name="cargoType" error={errors.cargoType} required>
                            {(id, desc) => (
                              <select id={id} aria-describedby={desc} name="cargoType" value={form.cargoType} onChange={(e) => set("cargoType", e.target.value)} className={inputCls(errors.cargoType)}>
                                <option value="">Select…</option>
                                {CARGO.map((c) => (
                                  <option key={c}>{c}</option>
                                ))}
                              </select>
                            )}
                          </Field>
                          <Field label="Load" name="load">
                            {(id) => (
                              <select id={id} name="load" value={form.load} onChange={(e) => set("load", e.target.value)} className={inputCls()}>
                                <option value="">Select…</option>
                                {(form.mode ? LOADS[form.mode] : []).map((c) => (
                                  <option key={c}>{c}</option>
                                ))}
                              </select>
                            )}
                          </Field>
                          <Field label="Approx. weight (kg)" name="weight" error={errors.weight}>
                            {(id, desc) => <input id={id} aria-describedby={desc} name="weight" type="number" min="0" inputMode="decimal" value={form.weight} onChange={(e) => set("weight", e.target.value)} className={inputCls(errors.weight)} />}
                          </Field>
                          <Field label="Approx. volume (cbm)" name="volume">
                            {(id) => <input id={id} name="volume" type="number" min="0" step="0.1" inputMode="decimal" value={form.volume} onChange={(e) => set("volume", e.target.value)} className={inputCls()} />}
                          </Field>
                          <Field label="Cargo ready date" name="ready">
                            {(id) => <input id={id} name="ready" type="date" value={form.ready} onChange={(e) => set("ready", e.target.value)} className={`${inputCls()} [color-scheme:dark]`} />}
                          </Field>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div>
                        <h3 tabIndex={-1} className="display-wide text-2xl text-foam outline-none">Who should we reply to?</h3>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          <Field label="Company" name="company" error={errors.company} required>
                            {(id, desc) => <input id={id} aria-describedby={desc} name="company" value={form.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" className={inputCls(errors.company)} />}
                          </Field>
                          <Field label="Your name" name="name" error={errors.name} required>
                            {(id, desc) => <input id={id} aria-describedby={desc} name="name" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" className={inputCls(errors.name)} />}
                          </Field>
                          <Field label="Email" name="email" error={errors.email} required>
                            {(id, desc) => <input id={id} aria-describedby={desc} name="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" className={inputCls(errors.email)} />}
                          </Field>
                          <Field label="Phone" name="phone">
                            {(id) => <input id={id} name="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" className={inputCls()} />}
                          </Field>
                          <div className="sm:col-span-2">
                            <Field label="Special requirements" name="notes">
                              {(id) => <textarea id={id} name="notes" rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Dimensions, DG class, temperature, permits, delivery windows…" className={`${inputCls()} resize-y`} />}
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div>
                        <h3 tabIndex={-1} className="display-wide text-2xl text-foam outline-none">Review your request</h3>
                        <dl className="mt-6 divide-y divide-foam/10 border-y border-foam/10">
                          {summary.map(([k, v]) => (
                            <div key={k} className="grid grid-cols-[9rem_1fr] gap-3 py-2.5 text-sm sm:grid-cols-[11rem_1fr]">
                              <dt className="label pt-0.5 text-[0.6rem] text-steel">{k}</dt>
                              <dd className="break-words text-foam">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between gap-3 border-t border-foam/10 pt-6">
                  {step > 0 ? (
                    <button type="button" onClick={() => go(step - 1)} className="label flex items-center gap-2 text-mist hover:text-foam">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                  ) : (
                    <span className="label text-steel">Step 1 of 4</span>
                  )}
                  <button type="submit" className="btn-cargo">
                    {step < 3 ? "Continue" : "Submit request"} <ArrowRight className="arrow h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const inputCls = (err?: string) =>
  `w-full border bg-midnight/70 px-3.5 py-3 text-[0.95rem] text-foam placeholder:text-steel/70 outline-none transition-colors focus:border-cyan focus:bg-midnight ${err ? "border-cargo" : "border-foam/15 hover:border-foam/30"}`;

function Field({ label, name, error, required, children }: { label: string; name: string; error?: string; required?: boolean; children: (id: string, describedBy?: string) => ReactNode }) {
  const id = `${useId()}-${name}`;
  const errId = `${id}-err`;
  return (
    <div>
      <label htmlFor={id} className="label mb-2 flex justify-between text-mist">
        <span>
          {label}
          {required && <span className="text-cargo"> *</span>}
        </span>
        {error && (
          <span id={errId} className="text-cargo" role="alert">
            {error}
          </span>
        )}
      </label>
      {children(id, error ? errId : undefined)}
    </div>
  );
}

function Success({ refCode, mailto, summary, onReset }: { refCode: string; mailto: string; summary: string[][]; onReset: () => void }) {
  return (
    <div className="animate-[fadeUp_.6s_var(--ease-ship)] p-6 sm:p-8" role="status">
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 place-items-center bg-cargo text-abyss">
          <Check className="h-6 w-6" />
        </span>
        <div>
          <p className="label text-cyan">Request prepared</p>
          <p className="display-wide text-2xl text-foam">{refCode}</p>
        </div>
      </div>
      <p className="mt-6 leading-relaxed text-mist">
        Your quote request is ready to send. Email it to the TAS team with one click, and quote the reference above in any
        follow up.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={mailto} className="btn-cargo">
          <Mail className="h-4 w-4" /> Send to TAS by email
        </a>
        <a href={COMPANY.phoneHref} className="btn-ghost">
          <Phone className="h-4 w-4" /> Call head office
        </a>
      </div>
      <p className="label mt-6 text-[0.6rem] leading-relaxed text-steel">
        Prototype: this form does not transmit data to a server yet. {summary.length} fields captured. Connect it to a CRM or
        email service before launch.
      </p>
      <button type="button" onClick={onReset} className="label mt-6 text-mist underline underline-offset-4 hover:text-foam">
        Start a new request
      </button>
    </div>
  );
}
