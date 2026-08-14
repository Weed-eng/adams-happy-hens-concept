import { motion, useScroll, useSpring, useTransform } from 'motion/react';

/**
 * The signature element.
 *
 * A farm's day is scored by light — you're up before dawn to collect the eggs
 * and shut up the birds at dusk. So the page's backdrop isn't decoration: it
 * runs one full day as you scroll. The base tone moves from pre-dawn indigo
 * through warm earth at midday and back to indigo, while a soft sun rises up
 * the viewport and sets again.
 *
 * Everything above it stays light-on-dark, so contrast never breaks.
 */
export default function Sky() {
  const { scrollYProgress } = useScroll();
  // Smooth the raw progress so the colour shift lags the scroll very slightly.
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 24, mass: 0.4 });

  const base = useTransform(
    p,
    [0, 0.28, 0.55, 0.8, 1],
    ['#0e1018', '#191428', '#2a1f1e', '#221729', '#0e1018']
  );

  const sunTop = useTransform(p, [0, 0.5, 1], ['92%', '14%', '92%']);

  const sunColour = useTransform(
    p,
    [0, 0.25, 0.5, 0.75, 1],
    [
      'rgba(196,122,28,0.20)',
      'rgba(232,163,61,0.34)',
      'rgba(244,196,120,0.30)',
      'rgba(232,120,61,0.30)',
      'rgba(120,80,140,0.18)',
    ]
  );

  const sunGradient = useTransform(
    sunColour,
    (c) => `radial-gradient(circle at center, ${c} 0%, rgba(14,16,24,0) 62%)`
  );

  return (
    <motion.div className="sky" style={{ background: base }} aria-hidden="true">
      <motion.div className="sun" style={{ top: sunTop, y: '-50%', backgroundImage: sunGradient }} />
    </motion.div>
  );
}
