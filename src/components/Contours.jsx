/**
 * Ordnance Survey style contour lines.
 *
 * The farm sits on the edge of the Peak District, and contour lines are the
 * native visual language of that landscape — so this is the page's texture
 * rather than a generic gradient or noise field. Drawn procedurally from a
 * seeded wave so the shape is stable between renders but never a tiled repeat.
 */
const LINES = 14;

function contourPath(index) {
  const y = 60 + index * 62;
  const amp = 26 + (index % 4) * 13;
  const wavelength = 320 + (index % 3) * 140;
  const phase = index * 0.7;

  let d = `M -100 ${y}`;
  for (let x = -100; x <= 1700; x += 40) {
    const yy =
      y +
      Math.sin(x / wavelength + phase) * amp +
      Math.sin(x / (wavelength * 0.42) + phase * 1.8) * (amp * 0.35);
    d += ` L ${x} ${yy.toFixed(1)}`;
  }
  return d;
}

export default function Contours({ className = 'contours' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {Array.from({ length: LINES }, (_, i) => (
        <path key={i} d={contourPath(i)} fill="none" stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  );
}
