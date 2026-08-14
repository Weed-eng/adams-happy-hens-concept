/**
 * Text lens.
 *
 * The same idea as the image lens in webgl.js — attention is light — applied to
 * type. A soft pool of the accent colour follows the cursor *inside* the
 * letterforms, rather than the whole heading flipping colour on hover.
 *
 * Done by clipping a radial-gradient background to the glyphs. The gradient's
 * centre is written to CSS custom properties on pointer move; everything else
 * is CSS, so the paint stays on the compositor.
 *
 * Applied only to display headings. Running it over body copy would be noise,
 * and the accent does not hold enough contrast against the bone ground to be
 * safe under small text — at display sizes it clears the 3:1 large-text bar.
 */
const SELECTOR = '.display';

export function createTextLens() {
  // Coarse pointers have no hover state to speak of.
  if (!window.matchMedia('(hover: hover)').matches) return { destroy() {} };

  const targets = [...document.querySelectorAll(SELECTOR)];
  let active = null;
  let pending = null;
  let raf = 0;

  const paint = () => {
    raf = 0;
    if (!pending) return;
    const { el, x, y } = pending;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
  };

  const onMove = (e) => {
    const el = e.target instanceof Element ? e.target.closest(SELECTOR) : null;

    if (el !== active) {
      active?.classList.remove('is-lit');
      active = el;
      active?.classList.add('is-lit');
    }
    if (!el) return;

    const r = el.getBoundingClientRect();
    pending = { el, x: e.clientX - r.left, y: e.clientY - r.top };
    // Coalesce to one write per frame; pointermove can fire far more often.
    if (!raf) raf = requestAnimationFrame(paint);
  };

  const onLeave = () => {
    active?.classList.remove('is-lit');
    active = null;
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);

  return {
    destroy() {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
      targets.forEach((el) => {
        el.classList.remove('is-lit');
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      });
    },
  };
}
