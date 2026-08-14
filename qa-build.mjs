// Builds a single self-contained HTML file so the site can be opened over
// file:// for screenshots. Inlining the module removes the CORS fetch that
// blocks <script type="module" src=...> on file:// URLs.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const dist = 'dist/';
let html = readFileSync(dist + 'index.html', 'utf8');
const assets = readdirSync(dist + 'assets');
const js = assets.find((f) => f.endsWith('.js'));
const css = assets.find((f) => f.endsWith('.css'));

// Replacement must be a FUNCTION: the minified bundle contains `$\`` and `$&`
// sequences that String.replace would otherwise expand as patterns.
const jsSrc = readFileSync(dist + 'assets/' + js, 'utf8').replaceAll('</script', '<\\/script');
const cssSrc = readFileSync(dist + 'assets/' + css, 'utf8');

html = html.replace(
  new RegExp(`<script[^>]*src="\\./assets/${js}"[^>]*></script>`),
  () => `<script type="module">\n${jsSrc}\n</script>`
);
html = html.replace(
  new RegExp(`<link[^>]*href="\\./assets/${css}"[^>]*>`),
  () => `<style>\n${cssSrc}\n</style>`
);

const scrollHook = `<script>
// QA harness: "#only=<sectionId>" hides every other block so the target
// section renders at the top of the viewport. Avoids relying on scrolled
// screenshots, which Chrome's --screenshot flag does not capture reliably.
addEventListener('load', function () {
  var m = /only=([a-z]+)/.exec(location.hash);
  if (!m) return;
  setTimeout(function () {
    var main = document.querySelector('main.shell');
    if (!main) return;
    var keep = document.getElementById(m[1]);
    [].forEach.call(main.children, function (child) {
      if (!keep || (child !== keep && !child.contains(keep))) child.style.display = 'none';
    });
    dispatchEvent(new Event('resize'));
    scrollTo(0, 0);
  }, 150);
});
</script>`;

// --standalone emits a plain double-clickable page with no QA harness.
const standalone = process.argv.includes('--standalone');
const outName = standalone ? 'standalone.html' : 'qa.html';
const out = standalone ? html : html.replace('</body>', () => scrollHook + '</body>');
writeFileSync(dist + outName, out);
console.log(outName + ':', (readFileSync(dist + outName).length / 1024).toFixed(0), 'kB');
