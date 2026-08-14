/**
 * Persistent page furniture: the fixed header, the mobile menu overlay, the
 * custom cursor, and the egg wordmark glyph.
 *
 * Grouped into one module because these are the elements that sit *outside*
 * the scrolling content and persist across every section.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { EASE } from '../lib/motion.jsx';

export const NAV = [
  ['Story', '#story'],
  ['The shop', '#shop'],
  ['Animals', '#animals'],
  ['Visit', '#visit'],
  ['Contact', '#contact'],
];

/** Dot tracks the pointer exactly; the ring trails it on a spring. */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 30, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 380, damping: 30, mass: 0.5 });

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [x, y]);

  return (
    <>
      <motion.div className="cursor-ring" style={{ x: rx, y: ry }} aria-hidden="true" />
      <motion.div className="cursor-dot" style={{ x, y }} aria-hidden="true" />
    </>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  // Keep the page from scrolling behind the open menu.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <motion.nav
        className="nav"
        initial={reduce ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 1.5 }}
      >
        <a className="nav__mark" href="#top">
          <Egg />
          <span>
            Adam's
            <br />
            Happy Hens
          </span>
        </a>

        <div className="nav__links">
          {NAV.map(([label, href]) => (
            <a className="nav__link" key={href} href={href}>
              {label}
            </a>
          ))}
        </div>

        <button className="nav__toggle" onClick={() => setOpen(true)} aria-expanded={open}>
          Menu
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <button className="menu__close" onClick={() => setOpen(false)}>
              Close
            </button>
            {NAV.map(([label, href], i) => (
              <motion.a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.06 }}
              >
                {label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Wordmark glyph: an egg with a yolk dot. */
export function Egg({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5c3.6 0 7 5.2 7 10a7 7 0 0 1-14 0c0-4.8 3.4-10 7-10Z"
        stroke="#e8a33d"
        strokeWidth="1.3"
      />
      <circle cx="12" cy="13.6" r="2.6" fill="#e8a33d" />
    </svg>
  );
}
