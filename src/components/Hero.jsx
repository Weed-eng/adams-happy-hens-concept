/**
 * The hero — the page's opening argument.
 *
 * Two things are load-bearing here:
 *
 * 1. The egg mask. The farm is named for its hens and began as an egg stall, so
 *    the first photograph is revealed through an egg-shaped frame that wipes
 *    open on load. It is the site's signature image treatment.
 * 2. Layer separation on scroll. The headline, the egg and the background each
 *    move at a different rate, which is what gives the opening depth rather
 *    than the feel of one flat image scrolling away.
 */
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { EASE, Magnetic } from '../lib/motion.jsx';

const TITLE = ['Up before', 'the sun.'];

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // The headline drifts up faster than the egg, so the layers separate on scroll.
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-42%']);
  const eggY = useTransform(scrollYProgress, [0, 1], ['-50%', '-14%']);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <header className="hero" id="top" ref={ref}>
      {/* Hatching reveal: the egg wipes open, the photo settles out of a slow push-in. */}
      <motion.div
        className="hero__egg"
        style={{ y: eggY }}
        initial={reduce ? false : { clipPath: 'inset(100% 0 0 0)' }}
        animate={{ clipPath: 'inset(0% 0 0 0)' }}
        transition={{ duration: 1.6, ease: EASE, delay: 0.35 }}
      >
        <motion.img
          src="./img/hen.jpg"
          alt="One of the farm's hens in the yard"
          initial={reduce ? false : { scale: 1.35 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: EASE, delay: 0.35 }}
        />
      </motion.div>

      <motion.div className="wrap" style={{ y: titleY, opacity: fade }}>
        <motion.p
          className="eyebrow"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 1.2 }}
        >
          Holymoorside · Derbyshire
        </motion.p>

        <h1 className="display hero__title">
          {TITLE.map((line, i) => (
            <span className="line-mask" key={line}>
              <motion.span
                style={{ display: 'block' }}
                initial={reduce ? false : { y: '115%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.3, ease: EASE, delay: 0.45 + i * 0.12 }}
              >
                {i === 1 ? <em>{line}</em> : line}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="hero__grid">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.35 }}
          >
            <p className="lede">
              A third-generation farm shop and café on the edge of the Peak District. Eggs from our
              own hens, bread baked that morning, and a yard full of animals to meet.
            </p>
            <div className="hero__actions">
              <Magnetic>
                <a className="btn" href="#visit">
                  Plan your visit
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn--ghost" href="#shop">
                  See what's in
                </a>
              </Magnetic>
            </div>
          </motion.div>

          <motion.div
            className="hero__meta mono"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.5 }}
          >
            <div>
              <strong>Est. 2014</strong>
              from one egg stall
            </div>
            <div>
              <strong>10—5</strong>
              every day
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
