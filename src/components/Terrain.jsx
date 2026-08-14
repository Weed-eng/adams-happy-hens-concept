/**
 * The moor, as it actually is.
 *
 * A mesh displaced from real survey elevations for the 8km square around the
 * farm (see tools/fetch-terrain.mjs). It backs the Visit section, so the
 * contour lines used as flat texture everywhere else resolve into the genuine
 * landform at exactly the moment the page is telling you where the farm sits —
 * 169m at the gate, rising to 281m onto the moors north-west and dropping to
 * 127m toward Chesterfield south-east — 84m to 364m across the whole square.
 *
 * Drawn as stacked elevation profiles rather than a triangulated wireframe. A
 * wireframe of this grid just reads as a tech grid; profile lines read as land
 * immediately, stay quiet behind copy, and keep the contour language the rest
 * of the page uses.
 */
import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

const STRAW = 0xc4b79b;
const YOLK = 0xe3a22b;

export default function Terrain() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    let renderer;
    let raf;
    let disposed = false;

    (async () => {
      let data;
      try {
        const res = await fetch('./data/terrain.json');
        data = await res.json();
      } catch {
        return; // No data: the section simply has no backdrop.
      }
      if (disposed) return;

      try {
        renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        return; // No WebGL: same graceful nothing.
      }

      const size = () => ({ w: host.clientWidth, h: host.clientHeight });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new Scene();
      const camera = new PerspectiveCamera(38, 1, 0.1, 200);
      camera.position.set(0, 9, 15);
      camera.lookAt(0, 0, 1);

      const { n, elevations, min, max } = data;
      const span = 22;
      const range = Math.max(1, max - min);
      const HEIGHT = 4.2;   // vertical exaggeration — real relief is ~280m over 8km
      const STEP = 2;       // draw every Nth row; all 64 is visual noise

      const group = new Group();
      group.rotation.x = -Math.PI / 2.6;

      /**
       * One line per sampled row: an elevation profile across the land, stacked
       * back to front. Reads as terrain instantly, where a triangulated
       * wireframe just reads as a grid — and it keeps the contour language the
       * rest of the page uses.
       */
      const lineGroup = new Group();
      for (let row = 0; row < n; row += STEP) {
        const pts = [];
        for (let col = 0; col < n; col++) {
          const h = ((elevations[row * n + col] - min) / range) * HEIGHT;
          pts.push(
            new Vector3(
              (col / (n - 1) - 0.5) * span,
              (row / (n - 1) - 0.5) * span,
              h
            )
          );
        }
        // Rows nearer the front sit slightly brighter, which gives depth
        // without needing lighting.
        const depth = row / (n - 1);
        const line = new Line(
          new BufferGeometry().setFromPoints(pts),
          new LineBasicMaterial({
            color: STRAW,
            transparent: true,
            opacity: 0.16 + depth * 0.34,
          })
        );
        lineGroup.add(line);
      }
      group.add(lineGroup);

      // The farm: a short upright stem at the centre of the sampled square,
      // which is the only element allowed to use the accent colour.
      const centreIndex = Math.floor(n / 2) * n + Math.floor(n / 2);
      const centreH = ((elevations[centreIndex] - min) / range) * HEIGHT;
      const stem = new Line(
        new BufferGeometry().setFromPoints([
          new Vector3(0, 0, centreH),
          new Vector3(0, 0, centreH + 1.5),
        ]),
        new LineBasicMaterial({ color: YOLK })
      );
      group.add(stem);

      scene.add(group);

      const resize = () => {
        const { w, h } = size();
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener('resize', resize);

      const start = performance.now();
      const render = () => {
        const t = (performance.now() - start) / 1000;
        // A slow drift only — the land should feel surveyed, not spun.
        group.rotation.z = reduce ? 0.15 : 0.15 + Math.sin(t * 0.05) * 0.09;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(render);
      };
      render();

      canvas.__cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        group.traverse((o) => {
          o.geometry?.dispose();
          o.material?.dispose();
        });
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      canvas?.__cleanup?.();
    };
  }, [reduce]);

  return (
    <div className="terrain" ref={hostRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
