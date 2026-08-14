/**
 * The hero.
 *
 * The composition *is* the type: the headline is sized off viewport width so it
 * always spans edge to edge, with one word set in the emphasis serif to carry
 * the accent colour. There is deliberately no image here — the type and the
 * contour texture carry the whole screen, and the restraint is the point.
 */
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { EASE, Magnetic } from '../lib/motion.jsx';
import Contours from './Contours.jsx';

const LINES = [['Up before'], ['the ', <em key="s">sun</em>]];

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

  return (
    <header className="hero" id="top" ref={ref}>
      <Contours />

      <motion.div className="wrap" style={{ y: titleY }}>
        <motion.p
          className="eyebrow"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 1 }}
          style={{ marginBottom: '1.2rem' }}
        >
          Holymoorside · Derbyshire · Est. 2014
        </motion.p>

        <h1 className="display hero__title">
          {LINES.map((line, i) => (
            <span className="line-mask" key={i}>
              <motion.span
                style={{ display: 'block' }}
                initial={reduce ? false : { y: '112%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.25, ease: EASE, delay: 0.3 + i * 0.11 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="hero__foot">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.1 }}
          >
            <p className="lede">
              A third-generation farm shop and café on the edge of the Peak District. Eggs from our
              own hens, bread baked that morning, and a yard full of animals to meet.
            </p>
            <div className="hero__actions">
              <Magnetic>
                <a className="btn" href="#visit">Plan your visit</a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn--ghost" href="#shop">See what's in</a>
              </Magnetic>
            </div>
          </motion.div>

          <motion.div
            className="meta"
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.2 }}
          >
            <div>
              <strong>10—5</strong>
              doors open daily
            </div>
            <div>
              <strong>5/5</strong>
              food hygiene
            </div>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}
