/**
 * Downloads a real elevation grid for the ground around the farm and writes it
 * to public/data/terrain.json, which Terrain.jsx displaces a mesh from.
 *
 * Source: OpenTopoData's hosted EU-DEM 25m (Copernicus). Free, no key, but rate
 * limited to 100 locations per call and roughly 1 call/second — hence the
 * batching and the delay. Re-run only if the area changes; the output is
 * committed so a normal build never touches the network.
 */
import { writeFileSync } from 'node:fs';

const CENTRE = { lat: 53.2285, lon: -1.5 }; // The Yews, Holymoorside
const SIZE_KM = 8;
const N = 64; // grid resolution (N x N samples)

// Degrees per km varies with latitude for longitude, so compute both.
const latSpan = SIZE_KM / 111.2;
const lonSpan = SIZE_KM / (111.32 * Math.cos((CENTRE.lat * Math.PI) / 180));

const points = [];
for (let row = 0; row < N; row++) {
  for (let col = 0; col < N; col++) {
    points.push([
      CENTRE.lat + latSpan * (row / (N - 1) - 0.5),
      CENTRE.lon + lonSpan * (col / (N - 1) - 0.5),
    ]);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const elevations = [];

for (let i = 0; i < points.length; i += 100) {
  const batch = points.slice(i, i + 100);
  const locs = batch.map(([la, lo]) => `${la.toFixed(6)},${lo.toFixed(6)}`).join('|');
  const url = `https://api.opentopodata.org/v1/eudem25m?locations=${locs}`;

  let ok = false;
  for (let attempt = 0; attempt < 4 && !ok; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) { await sleep(3000); continue; }   // rate limited
    const json = await res.json();
    if (json.status !== 'OK') { await sleep(2000); continue; }
    // Sea/■no-data comes back null; clamp so the mesh never has holes.
    elevations.push(...json.results.map((r) => Math.round(r.elevation ?? 0)));
    ok = true;
  }
  if (!ok) throw new Error(`batch at ${i} failed after retries`);

  process.stdout.write(`\r  ${elevations.length}/${points.length}`);
  await sleep(1100);
}

const min = Math.min(...elevations);
const max = Math.max(...elevations);
writeFileSync(
  'public/data/terrain.json',
  JSON.stringify({
    source: 'EU-DEM 25m via OpenTopoData (© European Union, Copernicus Land Monitoring Service / EEA)',
    centre: CENTRE,
    sizeKm: SIZE_KM,
    n: N,
    min,
    max,
    elevations,
  })
);
console.log(`\ndone — ${N}x${N}, ${min}m to ${max}m`);
