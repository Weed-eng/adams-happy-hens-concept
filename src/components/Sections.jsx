/**
 * The scrolling content sections, in page order: Ticker, Story, Stats, Shelves,
 * Animals, Visit, Contact, Footer.
 *
 * They live in one module because each is a single-use composition of the
 * shared primitives in lib/motion.jsx rather than a reusable component — there
 * is exactly one Story and one Visit on the site, and splitting them into eight
 * files would spread closely-related copy and layout across the tree.
 *
 * Content is held in the small arrays at the top of each section so the copy and
 * the imagery can be edited without reading the JSX.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Counter, EASE, LineReveal, Magnetic, ParallaxImage, Rise } from '../lib/motion.jsx';

/* ============================ Ticker ============================ */

const TICKER = [
  'Free-range eggs',
  'Bread baked this morning',
  'Derbyshire beef',
  'Homemade preserves',
  'Real dairy ice cream',
  'Seasonal veg',
];

export function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      {[0, 1].map((row) => (
        <motion.div
          className="ticker__row"
          key={row}
          animate={{ x: ['0%', '-100%'] }}
          transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
        >
          {TICKER.map((t) => (
            <span key={t}>
              {t} <i>·</i>
            </span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

/* ============================ Story ============================ */

export function Story() {
  return (
    <section className="section" id="story">
      <div className="wrap story__grid">
        <Rise>
          <div className="story__figure">
            <ParallaxImage
              className="story__media"
              src="./img/eggs-hands.jpg"
              alt="A bowl of freshly collected eggs"
            />
            <div className="story__inset">
              <img src="./img/eggs-carton.jpg" alt="Eggs sorted into trays" loading="lazy" />
            </div>
          </div>
        </Rise>

        <div className="story__body">
          <p className="eyebrow">Our story</p>
          <LineReveal
            className="display section__title"
            lines={['It started', <em key="e">with eggs.</em>]}
          />
          <Rise delay={0.1}>
            <p style={{ marginTop: '2rem' }}>
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
  [7, '', 'days a week, 10—5'],
  [5, '/5', 'food hygiene rating'],
];

export function Stats() {
  return (
    <section className="wrap">
      <div className="stats">
        {STATS.map(([n, suffix, label], i) => (
          <Rise key={label} delay={i * 0.08} className="stat">
            <div className="stat__num display">
              <Counter to={n} suffix={suffix} />
            </div>
            <div className="stat__label">{label}</div>
          </Rise>
        ))}
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
 * The shelves scroll sideways while the section is pinned — the same way you'd
 * actually walk the length of a farm shop counter.
 */
export function Shelves() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [travel, setTravel] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // Measure the real overflow rather than guessing a percentage: a translate
  // percentage resolves against the track's own width, not its content width,
  // so any fixed value either stops short of the last card or overshoots.
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
    <section className="shelves" id="shop" ref={ref}>
      <div className="shelves__pin">
        <div className="wrap shelves__head">
          <p className="eyebrow">The shop</p>
          <LineReveal className="display section__title" lines={["What's on the shelves"]} />
        </div>

        <motion.div className="shelves__track" ref={trackRef} style={{ x }}>
          {SHELF.map(([name, note, src], i) => (
            <article className="card" key={name}>
              <img src={src} alt={name} loading="lazy" />
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
    <section className="section" id="animals">
      <div className="wrap">
        <div className="section__head">
          <div>
            <p className="eyebrow">Meet the animals</p>
            <LineReveal
              className="display section__title"
              lines={['A proper', <em key="e">farmyard day.</em>]}
            />
          </div>
          <p className="lede">
            Bring the kids and take your time. The yard is free to wander on your way round the
            shop — no ticket, no time slot.
          </p>
        </div>

        <div className="animals__grid">
          {ANIMALS.map(([name, tag, src], i) => (
            <Rise key={name} delay={(i % 3) * 0.08}>
              <figure className="animal" style={{ margin: 0 }}>
                <img src={src} alt={name} loading="lazy" />
                <figcaption className="animal__name">{name}</figcaption>
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
    <section className="section" id="visit">
      <div className="wrap">
        <div className="section__head">
          <div>
            <p className="eyebrow">Visit &amp; press</p>
            <LineReveal
              className="display section__title"
              lines={['Find your way', <em key="e">to the farm.</em>]}
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

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem', flexWrap: 'wrap' }}>
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
    <section className="section" id="contact">
      <div className="wrap section__head">
        <div>
          <p className="eyebrow">Get in touch</p>
          <LineReveal
            className="display section__title"
            lines={['Questions before', <em key="e">you visit?</em>]}
          />
          <p className="lede" style={{ marginTop: '1.6rem' }}>
            Ring the farm, or drop us a message on Facebook — we're happy to check what's in before
            you make the trip.
          </p>
        </div>

        <Rise>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
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
    <footer className="footer">
      <div className="wrap footer__grid">
        <motion.div
          className="footer__mark display"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1, ease: EASE }}
        >
          Adam's
          <br />
          Happy Hens
        </motion.div>
        <p className="footer__small">
          The Yews, Baslow Road, Holymoorside, Chesterfield S42 7BH · 07903 379213
          <br />
          <br />
          Portfolio demo — not the real business's official site. Photography is licensed stock
          standing in for the farm's own pictures. Preserve jars ©{' '}
          <a href="https://www.flickr.com/photos/93178668@N00/3867876777">NatalieMaynor</a>, CC BY
          2.0.
        </p>
      </div>
    </footer>
  );
}
