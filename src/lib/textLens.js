/**
 * Text lens.
 *
 * The same idea as the image lens in webgl.js — attention is light — applied to
 * type. A pool of the accent colour follows the cursor *inside* the letterforms,
 * rather than the whole heading flipping colour on hover.
 *
 * Done by clipping a radial gradient to the glyphs. The gradient's centre and
 * radius are written to CSS custom properties; everything else is CSS.
 *
 * The centre eases toward the pointer rather than tracking it exactly, and the
 * radius grows on enter and collapses on leave, so the pool feels like it has
 * weight instead of snapping about. Both are driven from one rAF loop that only
 * runs while there is something to animate.
 *
 * Applied to display type and the big figures only. Over body copy it would be
 * noise, and the accent does not hold enough contrast against the bone ground
 * to be safe under small text — at display sizes it clears the 3:1 bar.
 */
const SELECTOR = '.display, .stat__num, .footer__mark, .pull';

const RADIUS = 165;   // px, the pool's full size
const EASE = 0.16;    // how quickly the centre chases the pointer
const GROW = 0.12;    // how quickly the pool opens and closes

export function createTextLens() {
  // Coarse pointers have no hover state to speak of.
  if (!window.matchMedia('(hover: hover)').matches) return { destroy() {} };

  let active = null;          // element currently under the pointer
  let fading = null;          // element still collapsing after the pointer left
  const state = new WeakMap(); // el -> { x, y, tx, ty, r, tr }
  let raf = 0;

  const stateFor = (el, x, y) => {
    let s = state.get(el);
    if (!s) {
      // Start the pool at the entry point so it opens from where you arrived.
      s = { x, y, tx: x, ty: y, r: 0, tr: 0 };
      state.set(el, s);
    }
    return s;
  };

  const tick = () => {
    raf = 0;
    let busy = false;

    for (const el of [active, fading]) {
      if (!el) continue;
      const s = state.get(el);
      if (!s) continue;

      s.x += (s.tx - s.x) * EASE;
      s.y += (s.ty - s.y) * EASE;
      s.r += (s.tr - s.r) * GROW;

      el.style.setProperty('--mx', `${s.x.toFixed(1)}px`);
      el.style.setProperty('--my', `${s.y.toFixed(1)}px`);
      el.style.setProperty('--lens-r', `${s.r.toFixed(1)}px`);

      const settled =
        Math.abs(s.tx - s.x) < 0.5 && Math.abs(s.ty - s.y) < 0.5 && Math.abs(s.tr - s.r) < 0.5;

      if (settled && el === fading) {
        // Fully collapsed — drop the clip so the text goes back to plain paint.
        el.classList.remove('is-lit');
        el.style.removeProperty('--lens-r');
        fading = null;
      } else if (!settled) {
        busy = true;
      }
    }

    if (busy) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const onMove = (e) => {
    const el = e.target instanceof Element ? e.target.closest(SELECTOR) : null;

    if (el !== active) {
      if (active) {
        // Hand the old element to the fade-out slot and close its pool.
        const prev = state.get(active);
        if (prev) prev.tr = 0;
        fading?.classList.remove('is-lit');
        fading = active;
      }
      active = el;
      if (el) {
        const r = el.getBoundingClientRect();
        const s = stateFor(el, e.clientX - r.left, e.clientY - r.top);
        s.tr = RADIUS;
        el.classList.add('is-lit');
        if (el === fading) fading = null;
      }
    }

    if (active) {
      const r = active.getBoundingClientRect();
      const s = state.get(active);
      s.tx = e.clientX - r.left;
      s.ty = e.clientY - r.top;
    }
    wake();
  };

  const onLeave = () => {
    if (!active) return;
    const s = state.get(active);
    if (s) s.tr = 0;
    fading?.classList.remove('is-lit');
    fading = active;
    active = null;
    wake();
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);

  return {
    destroy() {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
      document.querySelectorAll('.is-lit').forEach((el) => {
        el.classList.remove('is-lit');
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
        el.style.removeProperty('--lens-r');
      });
    },
  };
}
