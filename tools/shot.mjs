/**
 * Screenshot helper. Drives a real headless Chromium, so unlike a static
 * screenshot flag it can scroll, wait for fonts/WebGL, and emulate phone widths.
 *
 *   node tools/shot.mjs <url> <outDir> [scrollY,...] [width] [height] [dpr]
 *
 * ALWAYS check dpr 2 as well as 1. A canvas sizing bug shipped because every
 * capture was taken at 1x, where the drawing buffer happens to equal the
 * viewport and the fault is invisible.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [url, outDir, positions = '0', width = '1600', height = '900', dpr = '1'] =
  process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({
  viewport: { width: +width, height: +height },
  deviceScaleFactor: +dpr,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151 Safari/537.36',
});

const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch((e) => {
  console.log('nav warning:', e.message.split('\n')[0]);
});
await page.waitForTimeout(3500); // let intro animations and WebGL settle

for (const y of positions.split(',')) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), +y);
  await page.waitForTimeout(2200); // scroll-triggered animation needs real time
  await page.screenshot({ path: `${outDir}/y${y}.png` });
  console.log('captured', `${outDir}/y${y}.png`);
}

const info = await page.evaluate(() => ({
  height: document.documentElement.scrollHeight,
  title: document.title,
}));
console.log('page height:', info.height, '| errors:', errors.length ? errors.slice(0, 2) : 'none');
await browser.close();
