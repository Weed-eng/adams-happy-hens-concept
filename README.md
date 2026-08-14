# Adam's Happy Hens — concept site

A portfolio/pitch concept for a real Derbyshire farm shop that currently has no
website of its own. **This is not the business's official site.**

Built to a premium personal-brand standard (React + Motion, scroll-choreographed)
rather than a small-business template.

## Design direction

Researched against the current benchmark rather than guessed. The reference —
landonorris.com by OFF+BRAND, Awwwards Site of the Year — turns out to be a
Webflow site carrying three.js with hand-written GLSL, GSAP/ScrollTrigger, Rive
and Lenis, on a **light** bone palette with a deep tonal ramp. Not the dark,
moody thing you might assume from a screenshot.

Three techniques were taken from that study and rebuilt from scratch for this
subject — none of its assets, type or brand colours are used:

1. **Type is the composition.** Headlines are sized off viewport width so they
   span edge to edge, rather than sitting as a label above a paragraph.
2. **Mixed faces inside one sentence.** The words carrying the meaning switch to
   an italic serif in the accent colour. It is the one typographic device the
   site repeats, so it has to earn each use.
3. **Light/dark alternation.** A single dark set piece stops a light site from
   reading as one long pale scroll.

The palette is derived from the product and the ground it comes from — eggshell
and yolk, straw, gritstone, hedgerow — and runs as a ramp, because a ramp is
what lets a light page hold depth without going muddy.

| Token | Hex | From |
|---|---|---|
| `--bone` | `#f1ede2` | Eggshell — the page |
| `--straw` / `--stone` | `#c4b79b` / `#a2977f` | Straw, gritstone |
| `--ink` | `#232619` | Hedgerow — dark sections and all body text |
| `--yolk` | `#e3a22b` | The yolk — the single hot accent |

**Type:** Archivo (variable, set wide and heavy for display), Instrument Serif
italic for emphasis words, Space Mono for hours, prices and labels.

**Texture:** Ordnance Survey contour lines, drawn procedurally in
`Contours.jsx`. The farm sits on the edge of the Peak District, so contours are
the native visual language of the place rather than a generic gradient.

## The WebGL layer

`src/lib/webgl.js` is the signature and the main departure from a normal React
site. One fixed canvas sits behind the page; any `<figure data-webgl>` keeps its
layout box but has its `<img>` hidden, and the pixels are painted instead as a
textured plane positioned to match the element's rect exactly.

The DOM still owns layout, so the page stays responsive and accessible — the
shader only changes how pixels are painted.

The photography is painted **clean**: no displacement, no chromatic split. The
layer's one remaining job is the cursor lens — pictures rest slightly muted and
lift to full colour under a soft pool that follows the pointer.

An earlier version rippled the imagery along a noise field driven by scroll
velocity ("wind across the moor"). It read as distortion rather than atmosphere
and was cut. Worth knowing if you are tempted to add it back: on photography
this busy, warping reads as a fault, not an effect.

Because of that removal, three.js is now carrying a fairly small job. The lens
could be done in CSS with a radial mask for ~600kB less JavaScript, at the cost
of a slightly coarser falloff. That trade is open.

If WebGL throws for any reason, `App.jsx` adds a `no-webgl` class and every
image falls back to a plain `<img>`. The site must not need a GPU to be read.

### Stacking, which is the fragile part

The canvas sits at `z-index: 1` — above section backgrounds, below text. That
only works because neither `.shell` nor `.ground` sets a `z-index`; either would
create a stacking context and trap content on one side of the canvas.

`position: sticky` **also** creates a stacking context, which is why
`.shelves__pin` needs an explicit `z-index`. Without it the entire pinned
section renders beneath the canvas and every card label disappears behind the
photography. If images vanish or labels disappear, suspect this first.

## The terrain

`Terrain.jsx` backs the Visit section with the real landform around the farm,
built from survey elevations rather than noise: 169m at the gate, 281m on the
moors to the north-west, 127m falling toward Chesterfield, over an 8km square.

It exists so the contour lines used as flat texture everywhere else resolve into
actual land at the moment the page says where the farm is. It is drawn as
stacked elevation profiles, not a triangulated wireframe — a wireframe of this
grid reads as a generic tech grid, whereas profile lines read as terrain
immediately and stay quiet enough to sit behind copy.

Data is fetched once and committed, so a normal build never touches the network:

```
node tools/fetch-terrain.mjs    # re-run only if the area changes
```

Source: EU-DEM 25m via OpenTopoData — © European Union, Copernicus Land
Monitoring Service / EEA. Attribution is required and appears in the footer.

**WebGPU is deliberately not used.** three.js ships `three/webgpu` and
`three/tsl`, so it is available. But this page draws ~15 textured quads and a
few hundred lines; WebGPU's wins are compute shaders and large draw-call counts.
Adopting it would mean a second render path plus a WebGL fallback for no visible
gain.

## The cursor

One idea across two layers: **attention is light.** Photography rests slightly
desaturated and dimmed, and a soft lens follows the cursor across it — colour
and brightness lift where you point, and the wind ripple stirs harder there.
That is done in the shader (`uMouse`, `uHover`), not in CSS.

The drawn cursor mirrors it rather than being a separate trick: the ring opens
out to roughly the lens's size and takes the accent colour over photography, and
tightens over anything clickable. It uses `mix-blend-mode: difference`, so a
single cursor stays visible on both the bone page and the ink sections without
per-section overrides.

The same idea extends to display type (`lib/textLens.js`): a pool of accent
follows the cursor *inside* the letterforms, done by clipping a radial gradient
to the glyphs and writing its centre to `--mx`/`--my` once per frame.

It covers display headings, the stat figures, the pull quote and the footer
mark — anything set large enough to carry it.

The centre eases toward the pointer rather than tracking it exactly, and the
radius grows on enter and collapses on leave, so the pool has some weight
instead of snapping about. One rAF loop drives both and stops itself once
everything has settled.

It is deliberately not applied to body copy. Over body copy it would be noise, and the accent
does not hold enough contrast on the bone ground to be safe under small text —
which is also why `--lens-hot` is darkened on light sections and full yolk on
ink ones. Both the `@supports` guard and the `.is-lit` class matter: without
either, a heading would clip to an absent background and vanish.

Hidden entirely on coarse pointers, where a drawn cursor is meaningless.

Note that screenshots cannot capture a cursor, so this is verified by simulating
pointer movement and reading computed styles — see the probe pattern in the
commit history, not a visual diff.

## Motion

Motion (`motion/react`) drives DOM animation and Lenis drives scroll, feeding
its velocity into the shader. GSAP was evaluated and deliberately **not** used:
Motion already covers the same ground, and running two animation libraries side
by side to match the reference site's stack would be cargo-culting.

Every entry animation is gated on `useReducedMotion()`, and the reduced-motion
path is a real alternate layout rather than "animations off" — Lenis is skipped
and the pinned horizontal shelf becomes a wrapped grid.

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
  App.jsx                Page composition, Lenis scroll, WebGL bootstrap
  index.css              All styling: tokens, layout, reduced-motion fallbacks
  lib/
    webgl.js             three.js image layer + GLSL (the signature)
    motion.jsx           Reusable motion primitives (see below)
  components/
    Hero.jsx             Opening screen — type as composition
    Statement.jsx        The dark set piece, revealed word by word
    Contours.jsx         Procedural OS-style contour texture
    Chrome.jsx           Fixed header, mobile menu, custom cursor, wordmark
    Sections.jsx         Every scrolling section, in page order
public/img/              Photography (see licensing below)
tools/shot.mjs           Playwright screenshot harness — see below
```

`lib/motion.jsx` holds the five primitives the sections are built from, so the
motion vocabulary stays consistent:

| Primitive | What it does |
|---|---|
| `LineReveal` | Headline lines rise out from behind a mask |
| `Rise` | Generic fade-and-rise for non-headline blocks |
| `Magnetic` | Buttons lean toward the cursor |
| `Counter` | Counts up once scrolled into view |
| `ParallaxImage` | Slow vertical drift as an image crosses the viewport (unused since the WebGL layer took over imagery; kept as a non-GPU option) |

A single shared easing curve (`EASE`) is used everywhere. If you add motion, use
it rather than introducing a second curve.

## Editing the content

Copy and imagery live in plain arrays at the top of each section in
`Sections.jsx` — `SHELF`, `ANIMALS`, `STATS`, and `WORDS` in `Statement.jsx`.
Changing what the shop
sells or which animals are listed means editing an array, not the JSX.

Swapping in the farm's real photography is a matter of replacing files in
`public/img/` with the same names.

## Screenshotting it

`tools/shot.mjs` drives a real headless Chromium via Playwright, so unlike a
static screenshot flag it can scroll, wait for fonts and WebGL to settle, and
emulate true phone widths.

```
npm run build && npx vite preview --port 4180
node tools/shot.mjs http://localhost:4180/ /tmp/shots "0,1400,3000" 1600 900 1
node tools/shot.mjs http://localhost:4180/ /tmp/shots2x "0,1400,3000" 1600 900 2
```

**Always check at dpr 2 as well as 1.** A canvas sizing bug shipped because
every capture was taken at 1x: `<canvas>` is a replaced element, so `inset: 0`
does not stretch it, and `width: auto` falls back to the drawing-buffer size.
At 1x that buffer equals the viewport and the page looks perfect; at 2x every
image renders at double size. Hence the explicit `width/height: 100%` on
`.gl-canvas`.

On aarch64 Linux, Playwright's Chromium needs two system packages that are not
installed by default — without them it downloads fine and then fails to launch:

```
sudo apt-get install -y libnss3 libasound2
```

## Responsive coverage

Audited with real device emulation (`tools/shot.mjs` uses the same Playwright
setup). Verified: no horizontal overflow at 320 / 375 / 393 / 412 / 768 / 834 /
1280 / 1920 / 2560, correct grid collapse (stats 4→2, animals 3→2→1, visit
2→1), the nav toggle and menu appearing on touch, and the cursor and text lens
correctly disabled on coarse pointers.

Phone landscape needed its own rules: a full-height hero cannot hold a display
headline, lede, two buttons and a meta row in ~390px, so under
`(orientation: landscape) and (max-height: 540px)` the hero stops trying to
fill the screen and sizes to content instead.

Not verified, and worth checking on real hardware: WebGL performance on a
mid-range phone (the shader is cheap, but this has never run on a real mobile
GPU), and actual touch gestures — touch is emulated here, not performed.

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
