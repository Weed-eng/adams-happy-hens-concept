/**
 * WebGL image layer.
 *
 * One fixed full-screen canvas sits behind the page. Any DOM element marked
 * `data-webgl` is treated as a placeholder: its image is hidden in CSS and
 * redrawn as a textured plane positioned to match the element's rect exactly.
 * The DOM still owns layout, so the page stays responsive and accessible —
 * WebGL only changes how the pixels are painted.
 *
 * The photography is painted clean — no displacement, no chromatic split. The
 * layer's one job is the cursor lens: pictures rest slightly muted and lift to
 * full colour under a soft pool that follows the pointer, matching the text
 * lens in textLens.js.
 *
 * An earlier version rippled the imagery along a noise field driven by scroll
 * velocity. It read as distortion rather than atmosphere and was removed.
 */
import {
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Simplex-style value noise. Cheap enough to run per-pixel on a phone, and we
 * only need smooth low-frequency motion, not true gradient noise.
 */
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2  uSize;        // plane size in px, for aspect-correct cover
  uniform vec2  uImageSize;   // natural image size in px
  uniform float uHover;       // 0..1, eases in on pointer enter
  uniform float uReveal;      // 0..1, wipes the image in on first sight
  uniform vec2  uMouse;       // cursor in this plane's own uv space

  varying vec2 vUv;

  /** object-fit: cover, done in shader space. */
  vec2 coverUv(vec2 uv, vec2 planeSize, vec2 imageSize) {
    vec2 ratio = vec2(
      min((planeSize.x / planeSize.y) / (imageSize.x / imageSize.y), 1.0),
      min((planeSize.y / planeSize.x) / (imageSize.y / imageSize.x), 1.0)
    );
    return uv * ratio + (1.0 - ratio) * 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv, uSize, uImageSize);

    // The lens: a soft pool of attention around the cursor. Aspect-corrected so
    // it stays circular on any card shape, and gated on uHover so it eases in
    // rather than snapping when the pointer arrives.
    vec2 d = vUv - uMouse;
    d.x *= uSize.x / max(uSize.y, 1.0);
    float lens = (1.0 - smoothstep(0.0, 0.45, length(d))) * uHover;

    vec3 colour = texture2D(uTexture, uv).rgb;

    // Photography rests slightly muted and lifts to full under the lens, so
    // the grid feels lit by where you look rather than uniformly bright.
    float grey = dot(colour, vec3(0.299, 0.587, 0.114));
    colour = mix(vec3(grey), colour, mix(0.74, 1.0, lens)) * mix(0.92, 1.05, lens);

    // Soft upward wipe on first sight.
    float edge = vUv.y * 1.25 - 0.25;
    float mask = smoothstep(edge, edge + 0.3, uReveal * 1.6);

    gl_FragColor = vec4(colour, mask);
  }
`;

class Piece {
  constructor(el, renderer, scene) {
    this.el = el;
    this.img = el.querySelector('img');
    this.scene = scene;
    this.hover = 0;
    this.targetHover = 0;
    this.reveal = 0;

    const texture = new TextureLoader().load(this.img.currentSrc || this.img.src, (t) => {
      this.material.uniforms.uImageSize.value.set(t.image.naturalWidth, t.image.naturalHeight);
    });
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    // Colour management: the texture is already sRGB, three r152+ handles this
    // via colorSpace, and getting it wrong washes the photography out.
    texture.colorSpace = renderer.outputColorSpace;

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTexture: { value: texture },
        uSize: { value: new Vector2(1, 1) },
        uImageSize: { value: new Vector2(1, 1) },
        uHover: { value: 0 },
        uReveal: { value: 0 },
        uMouse: { value: new Vector2(0.5, 0.5) },
      },
    });

    this.mesh = new Mesh(new PlaneGeometry(1, 1), this.material);
    scene.add(this.mesh);

    this.onEnter = () => (this.targetHover = 1);
    this.onLeave = () => (this.targetHover = 0);
    this.onMove = (e) => {
      const r = el.getBoundingClientRect();
      // uv origin is bottom-left, the DOM's is top-left, hence the flip.
      this.material.uniforms.uMouse.value.set(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height
      );
    };
    el.addEventListener('pointerenter', this.onEnter);
    el.addEventListener('pointerleave', this.onLeave);
    el.addEventListener('pointermove', this.onMove);
  }

  /** Match the plane to wherever the DOM element currently is. */
  layout(viewport) {
    const r = this.el.getBoundingClientRect();
    this.mesh.scale.set(r.width, r.height, 1);
    this.mesh.position.x = r.left - viewport.width / 2 + r.width / 2;
    this.mesh.position.y = -r.top + viewport.height / 2 - r.height / 2;
    this.material.uniforms.uSize.value.set(r.width, r.height);
    // Skip work for anything comfortably off-screen.
    this.mesh.visible = r.bottom > -200 && r.top < viewport.height + 200;
    if (this.mesh.visible && r.top < viewport.height * 0.92) this.reveal = Math.min(1, this.reveal + 0.02);
  }

  update() {
    this.hover += (this.targetHover - this.hover) * 0.07;
    const u = this.material.uniforms;
    u.uHover.value = this.hover;
    u.uReveal.value = this.reveal;
  }

  dispose() {
    this.el.removeEventListener('pointerenter', this.onEnter);
    this.el.removeEventListener('pointerleave', this.onLeave);
    this.el.removeEventListener('pointermove', this.onMove);
    this.material.uniforms.uTexture.value.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
    this.scene.remove(this.mesh);
  }
}

export function createImageLayer(canvas) {
  const viewport = { width: window.innerWidth, height: window.innerHeight };

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewport.width, viewport.height, false);

  const scene = new Scene();
  // Orthographic camera in pixel units keeps plane maths 1:1 with the DOM.
  const camera = new OrthographicCamera(
    -viewport.width / 2, viewport.width / 2,
    viewport.height / 2, -viewport.height / 2,
    -1000, 1000
  );

  let pieces = [...document.querySelectorAll('[data-webgl]')].map(
    (el) => new Piece(el, renderer, scene)
  );

  let raf;
  const resize = () => {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    renderer.setSize(viewport.width, viewport.height, false);
    camera.left = -viewport.width / 2;
    camera.right = viewport.width / 2;
    camera.top = viewport.height / 2;
    camera.bottom = -viewport.height / 2;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);

  const frame = () => {
    for (const p of pieces) {
      p.layout(viewport);
      if (p.mesh.visible) p.update();
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      pieces.forEach((p) => p.dispose());
      pieces = [];
      renderer.dispose();
    },
  };
}
