/**
 * The statement — the page's one dark set piece.
 *
 * Type at full-bleed scale, revealed word by word as the section crosses the
 * viewport, with the two words that carry the meaning set in the emphasis
 * serif. The light/dark flip between this and the sections either side is what
 * gives the page editorial range; without it a light site reads as one long
 * pale scroll.
 */
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Contours from './Contours.jsx';

/** `em: true` switches a word into the serif accent face. */
const WORDS = [
  { t: "We're" }, { t: 'up' }, { t: 'at' }, { t: 'five' }, { t: 'so' }, { t: 'the' },
  { t: 'eggs' }, { t: 'are' }, { t: 'still' }, { t: 'warm', em: true },
  { t: 'when' }, { t: 'the' }, { t: 'doors' }, { t: 'open.' },
  { t: "That's" }, { t: 'the' }, { t: 'whole', em: true }, { t: 'business.' },
];

export default function Statement() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.55'],
  });

  return (
    <section className="statement ground ground--ink" ref={ref}>
      <Contours />
      <div className="wrap">
        <h2 className="display statement__text">
          {WORDS.map((word, i) => (
            <Word key={i} index={i} total={WORDS.length} progress={scrollYProgress} {...word} />
          ))}
        </h2>
      </div>
    </section>
  );
}

/**
 * Each word brightens across its own slice of the section's scroll progress,
 * so the sentence resolves left to right as you read down.
 */
function Word({ t, em, index, total, progress }) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  const Tag = em ? motion.em : motion.span;

  return (
    <>
      <Tag style={{ opacity, display: 'inline-block' }}>{t}</Tag>{' '}
    </>
  );
}
