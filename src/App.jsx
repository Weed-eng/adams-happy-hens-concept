/**
 * Page composition and global scroll behaviour.
 *
 * Section order is deliberate — it walks a visitor through the same sequence
 * they'd experience arriving at the farm: the place, what's sold, the animals,
 * then how to get there.
 *
 * Lenis provides the lerped ("smooth") scrolling. It is initialised here rather
 * than per-section because it takes over the whole document's scroll, and every
 * scroll-linked animation on the page reads from the position it drives.
 */
import { useEffect } from 'react';
import Lenis from 'lenis';
import Sky from './components/Sky.jsx';
import Hero from './components/Hero.jsx';
import { Cursor, Nav } from './components/Chrome.jsx';
import { Animals, Contact, Footer, Shelves, Stats, Story, Ticker, Visit } from './components/Sections.jsx';

export default function App() {
  // Lerped scrolling — the single biggest cue that a site is hand-built.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });

    // Anchor links have to go through Lenis or they fight the rAF loop.
    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const el = document.querySelector(link.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -20 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <Sky />
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Nav />
      <main className="shell">
        <Hero />
        <Ticker />
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
