# TAS Group of Companies: website

A single-page, scroll-driven experience built around one idea: **From Port to Possibility**.
The visitor follows a TAS container from the Penang quayside through port operations, sea / air / land,
customs, warehousing and distribution to a regional network, ending at a quote request.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4
- Three.js, React Three Fiber, Drei: procedural 3D (no external model files)
- GSAP + ScrollTrigger (scroll progress), Framer Motion (UI transitions)

## Run

Requires Node 20.9+ (`.nvmrc` pins 20).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (static)
npm start
npm run typecheck
```

## Deploy (Vercel)

Import the folder as a project. The framework preset is detected as Next.js and no environment variables are required.
Optionally set `NEXT_PUBLIC_SITE_URL` to the production domain for absolute Open Graph URLs.

## Structure

```
src/
  app/                 layout, page, global styles, icon, 404
  content/site.ts      ALL company facts and copy (single source of truth)
  data/geo/            generated map data (see scripts/build-geo.mjs)
  components/
    sections/          one file per story leg (Hero → Quote)
    scenes/            3D scenes (hero, port, marine, globe) + SVG service scenes
    three/             shared 3D primitives, water/sky shaders, globe, lazy canvas
    layout/            nav, journey rail, footer, scroll refresh
    ui/                icons, section header, wordmark
scripts/build-geo.mjs  regenerates globe dots + regional map from Natural Earth (npm run build:geo)
```

## Content sources and verification

All company facts come from tasgroup.com.my (About the Company, Our Services and Contact Us pages), retrieved October 2026,
and live in `src/content/site.ts`. The copy is written for this site from those facts. The site does **not** invent clients,
volumes, routes, awards, statistics or dates.

- Dated milestones are limited to **1978** (Ganu Jaya, stevedoring, Penang) and **1998** (TAS Agency, Butterworth).
  The later stages of the heritage route are deliberately undated.
- The **20+ truck fleet** figure is TAS's own published figure for Bexxbay Express.
- **Routes:** only the Malaysia–Singapore land haulage corridor is shown as a solid line, because it matches the published
  service area. Every other arc or lane is dashed and labelled *illustrative*.
- The **shipment panel** is labelled DEMO / SIMULATED and is not connected to any tracking system.
- Office map positions are place-level approximations of the published addresses.
- Unrelated entities sharing the name were excluded: the Philippine "Tas Group" bus operator on Wikipedia,
  and TAS Shipping & Transport Sdn Bhd (taship.com).

### To confirm with TAS before launch

1. **Logo.** `components/ui/Wordmark.tsx` is a typographic placeholder. Replace it with official artwork.
2. **TAS Maritime, TAS Freight Services, TAS Management Holdings.** Published sources list these entities but do not describe
   their roles. The Group diagram infers roles from the company names and marks those links as dashed ("indicated by company name").
3. **Quote form.** The form is frontend-only. On submit it prepares a reference and opens a pre-filled email to
   enquiry@tasgroup.com.my. Connect it to a CRM or email API before launch.
4. **Port Klang fax.** The website lists `+6 04-3318 9330`, which looks like a typo (04 is the Penang area code), so it is omitted.

## Performance & accessibility

- three.js and every 3D scene load on demand. The initial JS is about 310 KB gzipped.
- Canvases mount near the viewport, stop rendering off-screen and cap DPR on mobile. If WebGL is unavailable, they fall back to photography.
- `prefers-reduced-motion`: pinned scroll sequences collapse to static frames with clickable steps, and decorative loops stop.
- Semantic landmarks, a skip link, a focus-trapped mobile menu, labelled tabs and toggles, and form errors linked with `aria-describedby`.

## Image credits

Photography is from Unsplash (Unsplash License). See `docs/IMAGE-CREDITS.md`; the credits also appear in the site footer.
