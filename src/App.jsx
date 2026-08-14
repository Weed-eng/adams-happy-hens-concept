/**
 * Page composition, smooth scrolling, and the WebGL bootstrap.
 *
 * Section order walks a visitor through the same sequence they'd meet arriving
 * at the farm: the place, the claim, the story, what's sold, the animals, then
 * how to get there.
 *
 * Two global systems are set up here because both take over the whole document:
 *
 * - Lenis owns scrolling. Every scroll-linked animation reads the position it
 *   drives.
 * - The WebGL layer paints every [data-webgl] image. It is initialised after
 *   paint so it can measure real DOM rects, and if it throws for any reason the
 *   page falls back to plain <img> via the `no-webgl` class — the site must not
 *   depend on a GPU to be readable.
 */
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Hero from './components/Hero.jsx';
import Statement from './components/Statement.jsx';
import { Cursor, Nav } from './components/Chrome.jsx';
import {
  Animals,
  Contact,
  Footer,
  Shelves,
  Stats,
  Story,
  Visit,
} from './components/Sections.jsx';
import { createImageLayer } from './lib/webgl.js';
import { createTextLens } from './lib/textLens.js';

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let layer = null;
    try {
      layer = createImageLayer(canvasRef.current);
    } catch (err) {
      document.documentElement.classList.add('no-webgl');
      console.warn('WebGL unavailable, falling back to plain images:', err.message);
    }

    // Same idea as the image lens, applied to display type.
    const textLens = createTextLens();

    if (reduced) {
      // No lerped scroll and no ripple, but the images still render through
      // the shader so the page looks the same — it simply stops moving.
      return () => {
        layer?.destroy();
        textLens.destroy();
      };
    }

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });

    // Anchor links must go through Lenis or they fight its rAF loop.
    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const el = document.querySelector(link.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -10 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
      layer?.destroy();
      textLens.destroy();
    };
  }, []);

  return (
    <>
      <canvas className="gl-canvas" ref={canvasRef} aria-hidden="true" />
      <Cursor />
      <Nav />
      <main className="shell">
        <Hero />
        <Statement />
        <Story />
        <Stats />
        <Shelves />
        <Animals />
        <Visit />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
