# Adam's Happy Hens — concept site

A portfolio/pitch concept for a real Derbyshire farm shop that currently has no
website of its own. **This is not the business's official site.**

Built to a premium personal-brand standard (React + Motion, scroll-choreographed)
rather than a small-business template.

## Design direction

**"The farm day."** A farm runs on light — you're up before dawn to collect the
eggs and shut the birds in at dusk. So the backdrop isn't decoration: the page
runs one full day as you scroll. The base tone travels pre-dawn indigo → warm
earth at midday → back to indigo, while a soft sun rises up the viewport and
sets again (`src/components/Sky.jsx`). Everything above it stays light-on-dark,
so contrast never breaks.

| Token | Value | Where it comes from |
|---|---|---|
| Night | `#0e1018` | Pre-dawn sky |
| Yolk | `#e8a33d` | The product itself |
| Shell | `#f2e8d8` | Eggshell — all body copy |
| Earth | `#2a1f1e` | Midday ground tone |

**Type:** Bodoni Moda (display, set large and tight), Manrope (body),
Space Mono for hours, prices and labels — the register of a market chalkboard.

**Signature:** the hero photograph hatches into view through an egg-shaped mask.

## Motion

Driven by [Motion](https://motion.dev) (`motion/react`) and Lenis for lerped scrolling:

- Lenis smooth scroll, with anchor links routed through it
- Scroll-linked sky (base colour + sun position)
- Pinned horizontal shelf scroll — you walk the counter sideways
- Line-mask headline reveals, parallax images, magnetic buttons, custom cursor
- Counters that run once in view

Every entry animation is gated on `useReducedMotion()`, and the reduced-motion
path is a real layout, not just "animations off": Lenis is skipped and the
pinned shelf becomes a plain wrapped grid.

## Running it

```
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
```

Requires Node 18+. There is no test suite — this is a single static marketing
page, and its correctness is visual.

## Project structure

```
src/
  main.jsx               React entry point
  App.jsx                Page composition + Lenis smooth scroll
  index.css              All styling: tokens, layout, reduced-motion fallbacks
  lib/motion.jsx         Reusable motion primitives (see below)
  components/
    Sky.jsx              The scroll-linked dawn->dusk backdrop
    Hero.jsx             Opening screen and the egg-mask reveal
    Chrome.jsx           Fixed header, mobile menu, custom cursor, wordmark
    Sections.jsx         Every scrolling section, in page order
public/img/              Photography (see licensing below)
qa-build.mjs             Screenshot harness — see below
```

`lib/motion.jsx` holds the five primitives the sections are built from, so the
motion vocabulary stays consistent:

| Primitive | What it does |
|---|---|
| `LineReveal` | Headline lines rise out from behind a mask |
| `Rise` | Generic fade-and-rise for non-headline blocks |
| `Magnetic` | Buttons lean toward the cursor |
| `Counter` | Counts up once scrolled into view |
| `ParallaxImage` | Slow vertical drift as an image crosses the viewport |

A single shared easing curve (`EASE`) is used everywhere. If you add motion, use
it rather than introducing a second curve.

## Editing the content

Copy and imagery live in plain arrays at the top of each section in
`Sections.jsx` — `SHELF`, `ANIMALS`, `STATS`, `TICKER`. Changing what the shop
sells or which animals are listed means editing an array, not the JSX.

Swapping in the farm's real photography is a matter of replacing files in
`public/img/` with the same names.

## Screenshotting it (WSL/aarch64 note)

This machine is aarch64 WSL, where Google ships no Linux Chrome, so Puppeteer's
bundled browser cannot install. Screenshots go through **Windows Chrome**
instead, which imposes three constraints worth knowing:

1. `file://` cannot load ES modules (CORS), so `node qa-build.mjs` inlines the
   bundle into `dist/qa.html`.
2. Chrome's `--screenshot` does **not** capture a scrolled page. `qa.html`
   therefore supports `#only=<sectionId>`, which hides every other block so the
   target section renders at the top of the viewport.
3. Windows Chrome floors the viewport at ~512 CSS px, so true phone-width
   rendering can't be captured here. 512px still triggers the mobile rules.

```
npm run build && node qa-build.mjs
# then point Windows Chrome at dist/qa.html#only=animals
```

## Photography

No photograph here is of the actual business — we don't have rights to their
pictures. Every image is licensed stock standing in for the farm's own
photography, and swaps out by replacing files in `public/img/`.

- Most images from **Unsplash** (Unsplash License — free commercial use, no
  attribution required)
- `emu.jpg` — "emu" by Mathias Appel, **CC0 1.0** (public domain), via Openverse
- `preserves.jpg` — "Mississippi Honey" by NatalieMaynor, **CC BY 2.0**, via
  Openverse. This one *requires* attribution, which is credited in the footer:
  https://www.flickr.com/photos/93178668@N00/3867876777

Check each image actually shows what its card claims. Two originally didn't —
"Meat" was a fruit-and-veg stall and "Preserves" was a wheel of cheese.

## Business facts

Address, hours, phone, the 5/5 hygiene rating (inspected 3 February 2026) and
the Derbyshire Times mention are all from public sources — the FSA register,
the farm's own Facebook page, and local press. No private information is used.

The enquiry form is a labelled placeholder and does not submit anywhere.

## Previous version

`../adams-happy-hens-demo/` is the earlier static HTML/CSS/JS build, kept for
reference.
