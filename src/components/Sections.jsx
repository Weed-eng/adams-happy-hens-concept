/**
 * The scrolling content sections, in page order: Story, Stats, Shelves,
 * Animals, Visit, Contact, Footer.
 *
 * They share one module because each is a single-use composition of the shared
 * primitives in lib/motion.jsx rather than a reusable component — there is
 * exactly one Story and one Visit — and splitting them would spread closely
 * related copy and layout across the tree.
 *
 * Copy and imagery live in the arrays at the top of each section, so the shop's
 * range or the animals on the yard can be edited without reading any JSX.
 *
 * Any <figure data-webgl> is painted by the shader layer; the <img> inside is
 * the layout box and the fallback. See lib/webgl.js.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Counter, EASE, LineReveal, Magnetic, Rise } from '../lib/motion.jsx';
import Contours from './Contours.jsx';
import Terrain from './Terrain.jsx';

/* ============================ Story ============================ */

export function Story() {
  return (
    <section className="section ground" id="story">
      <div className="wrap story__grid">
        <Rise>
          <figure className="story__figure" style={{ margin: 0 }} data-webgl>
            <img src="./img/eggs-hands.jpg" alt="A bowl of freshly collected eggs" />
          </figure>
        </Rise>

        <div className="story__body">
          <p className="eyebrow">Our story</p>
          <LineReveal
            className="display section__title"
            lines={['It started', <em key="e">with eggs</em>]}
          />
          <Rise delay={0.1}>
            <p style={{ marginTop: '1.8rem' }}>
              In 2014 Adam set up a stall at the gate with a handful of hens behind it. People kept
              coming back, so the stall became a shed, and the shed became a shop.
            </p>
            <blockquote className="pull">
              Three generations have farmed this land. The hens just made it a shop.
            </blockquote>
            <p>
              A decade on, the same family runs the place — now with a café, a bakery counter and a
              yard of animals the kids come to see. We still sell the eggs. We still collect them
              ourselves.
            </p>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/* ============================ Stats ============================ */

const STATS = [
  [260, '+', 'five-star reviews'],
  [3, '', 'generations farming here'],
  [7, '', 'days a week, doors 10am—5pm'],
  [5, '/5', 'food hygiene rating'],
];

export function Stats() {
  return (
    <section className="ground" style={{ paddingBottom: '2rem' }}>
      <div className="wrap">
        <div className="stats">
          {STATS.map(([n, suffix, label], i) => (
            <Rise key={label} delay={i * 0.07} className="stat">
              <div className="stat__num">
                <Counter to={n} suffix={suffix} />
              </div>
              <div className="stat__label">{label}</div>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ Shelves ============================ */

const SHELF = [
  ['Eggs', 'Collected here, most days still warm.', './img/eggs-carton.jpg'],
  ['Bakery', 'Bread, pies and pastries baked each morning.', './img/bread.jpg'],
  ['Vegetables', 'Whatever the season is actually giving us.', './img/veg.jpg'],
  ['Meat', 'Derbyshire beef, lamb and pork from nearby farms.', './img/meat.jpg'],
  ['Preserves', 'Chutneys, jams and pickles made in small batches.', './img/preserves.jpg'],
  ['Ice cream', 'Real dairy, made the proper way.', './img/icecream.jpg'],
  ['The café', 'Breakfast, cake and a decent pot of tea.', './img/cafe.jpg'],
];

/**
 * The shelves run sideways while the section is pinned — the same way you'd
 * walk the length of a farm shop counter.
 */
export function Shelves() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [travel, setTravel] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // Measure the real overflow rather than guessing a percentage: a translate
  // percentage resolves against the element's own width, not its content width,
  // so any fixed value stops short of the last card or overshoots.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setTravel(Math.max(0, el.scrollWidth - el.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  return (
    <section className="shelves ground" id="shop" ref={ref}>
      <div className="shelves__pin">
        <div className="wrap shelves__head">
          <p className="eyebrow">The shop</p>
          <LineReveal className="display section__title" lines={[<>On the <em>shelves</em></>]} />
        </div>

        <motion.div className="shelves__track" ref={trackRef} style={{ x }}>
          {SHELF.map(([name, note, src], i) => (
            <article className="card" key={name}>
              <figure className="card__media" style={{ margin: 0 }} data-webgl>
                <img src={src} alt={name} loading="lazy" />
              </figure>
              <div className="card__body">
                <div className="card__idx">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="card__name">{name}</h3>
                <p className="card__note">{note}</p>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ Animals ============================ */

const ANIMALS = [
  ['Goats', 'Will try to eat your map', './img/goat.jpg'],
  ['Pigs', 'Happiest in the mud', './img/pig.jpg'],
  ['Hens', 'The originals', './img/hen.jpg'],
  ['Lambs', 'Spring regulars', './img/sheep.jpg'],
  ['Horses', 'Over by the far gate', './img/horse.jpg'],
  ['Emus', 'Yes, really', './img/emu.jpg'],
];

export function Animals() {
  return (
    <section className="section ground" id="animals">
      <div className="wrap">
        <div className="section__head">
          <div>
            <p className="eyebrow">Meet the animals</p>
            <LineReveal
              className="display section__title"
              lines={['A proper', <>farmyard <em key="e">day</em></>]}
            />
          </div>
          <p className="lede">
            Bring the kids and take your time. The yard is free to wander on your way round the
            shop — no ticket, no time slot.
          </p>
        </div>

        <div className="animals__grid">
          {ANIMALS.map(([name, tag, src], i) => (
            <Rise key={name} delay={(i % 3) * 0.07}>
              <figure className="animal" style={{ margin: 0 }} data-webgl>
                <img src={src} alt={name} loading="lazy" />
                <figcaption>{name}</figcaption>
                <span className="animal__tag">{tag}</span>
              </figure>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ Visit ============================ */

export function Visit() {
  return (
    <section className="section ground ground--ink" id="visit">
      <Terrain />
      <div className="wrap">
        <div className="section__head">
          <div>
            <p className="eyebrow">Visit &amp; press</p>
            <LineReveal
              className="display section__title"
              lines={['Find your way', <>to the <em key="e">farm</em></>]}
            />
          </div>
        </div>

        <div className="visit__grid">
          <div>
            <dl style={{ margin: 0 }}>
              <div className="info">
                <dt>Address</dt>
                <dd>
                  The Yews, Baslow Road
                  <br />
                  Holymoorside, Chesterfield
                  <br />
                  Derbyshire, S42 7BH
                </dd>
              </div>
              <div className="info">
                <dt>Opening</dt>
                <dd>Every day, 10:00am — 5:00pm</dd>
              </div>
              <div className="info">
                <dt>Phone</dt>
                <dd>
                  <a href="tel:+447903379213">07903 379213</a>
                </dd>
              </div>
              <div className="info">
                <dt>Recognition</dt>
                <dd>
                  5/5 food hygiene rating, inspected 3 February 2026
                  <br />
                  Featured in the Derbyshire Times as a family day out
                </dd>
              </div>
            </dl>

            <div style={{ display: 'flex', gap: '0.7rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <Magnetic>
                <a
                  className="btn"
                  href="https://www.google.com/maps/search/?api=1&query=The+Yews+Baslow+Road+Holymoorside+Chesterfield+S42+7BH"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn--ghost" href="tel:+447903379213">
                  Call the farm
                </a>
              </Magnetic>
            </div>
          </div>

          <Rise>
            <div className="map">
              <iframe
                title="Map showing Adam's Happy Hens on Baslow Road, Holymoorside"
                loading="lazy"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-1.5210%2C53.2170%2C-1.4790%2C53.2400&layer=mapnik&marker=53.2285%2C-1.5000"
              />
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/* ============================ Contact ============================ */

export function Contact() {
  return (
    <section className="section ground" id="contact">
      <div className="wrap section__head">
        <div>
          <p className="eyebrow">Get in touch</p>
          <LineReveal
            className="display section__title"
            lines={['Questions before', <>you <em key="e">visit?</em></>]}
          />
          <p className="lede" style={{ marginTop: '1.4rem' }}>
            Ring the farm, or message us on Facebook — we're happy to check what's in before you
            make the trip.
          </p>
        </div>

        <Rise>
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" />
            </div>
            <Magnetic>
              <button className="btn" type="submit">
                Send message
              </button>
            </Magnetic>
            <p className="form__note">
              This form is a design placeholder — it doesn't send anywhere yet. Call 07903 379213 or
              message the farm on Facebook.
            </p>
          </form>
        </Rise>
      </div>
    </section>
  );
}

/* ============================ Footer ============================ */

export function Footer() {
  return (
    <footer className="footer ground ground--ink">
      <div className="wrap footer__grid">
        <motion.div
          className="footer__mark"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          Adam's
          <br />
          Happy <em>Hens</em>
        </motion.div>
        <p className="footer__small">
          The Yews, Baslow Road, Holymoorside, Chesterfield S42 7BH · 07903 379213
          <br />
          <br />
          Portfolio demo — not the real business's official site. Photography is licensed stock
          standing in for the farm's own pictures. Preserve jars ©{' '}
          <a href="https://www.flickr.com/photos/93178668@N00/3867876777">NatalieMaynor</a>, CC BY
          2.0. Terrain from EU-DEM 25m, © European Union, Copernicus Land Monitoring Service / EEA.
        </p>
      </div>
    </footer>
  );
}
