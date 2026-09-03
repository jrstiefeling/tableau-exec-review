/* Minimal SVG construction helpers. No charting library: every mark in this
 * app is a hand-placed element, which is what lets each chart choose a form
 * that fits its own data rather than bending it into a bar or a pie. */

const NS = "http://www.w3.org/2000/svg";

export function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  setAttrs(node, attrs);
  return node;
}

export function setAttrs(node, attrs = {}) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;
    node.setAttribute(key, String(value));
  });
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/* Creates a chart root sized in user units, scaled by CSS. Charts are laid
 * out against a fixed viewBox and left to fit whatever box the portlet gives
 * them, so a portlet can resize without any chart needing to re-measure. */
export function chartRoot(width, height, opts = {}) {
  return svgEl("svg", {
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: opts.preserveAspectRatio || "xMidYMid meet",
    class: `chart ${opts.class || ""}`.trim(),
    role: "img",
    "aria-label": opts.label || null,
    focusable: "false"
  });
}

export function group(attrs = {}) {
  return svgEl("g", attrs);
}

/* --------------------------------- paint --------------------------------- */

/* A monotonic id source.
 *
 * Nothing in this app used <defs> for a long time, and the reason was sound:
 * an id has to be unique in the document, the Knowledge Layer toggle
 * re-renders every portlet from scratch, and a gradient id derived from a
 * portlet id would collide with the copy that had not been torn down yet —
 * at which case a fill silently resolves to the wrong gradient or to none.
 * A counter closes that: every gradient minted in the lifetime of the page
 * gets its own id, and a discarded one is garbage collected with its <svg>. */
let seq = 0;

export function uid(prefix = "u") {
  seq += 1;
  return `${prefix}-${seq}`;
}

/* Mints a vertical linear gradient inside the given chart root and returns a
 * `url(#...)` ready to hand to a fill. Vertical because every use of it here
 * is an area fill under a trajectory, where the gradient's job is to hold
 * weight at the line and release the baseline. */
export function verticalGradient(svg, stops) {
  const id = uid("grad");
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = svgEl("defs");
    svg.insertBefore(defs, svg.firstChild);
  }
  const gradient = svgEl("linearGradient", {
    id,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  });
  stops.forEach(([offset, color, opacity]) => {
    gradient.appendChild(
      svgEl("stop", {
        offset,
        "stop-color": color,
        "stop-opacity": opacity
      })
    );
  });
  defs.appendChild(gradient);
  return `url(#${id})`;
}

/* --------------------------------- paths --------------------------------- */

function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/* An arc from startDeg to endDeg, clockwise, with 0 at twelve o'clock. */
export function arcPath(cx, cy, r, startDeg, endDeg) {
  const span = Math.abs(endDeg - startDeg);
  if (span >= 359.999) {
    // A full ring cannot be expressed as a single arc — two halves instead.
    const a = polar(cx, cy, r, 0);
    const b = polar(cx, cy, r, 180);
    return `M ${a.x} ${a.y} A ${r} ${r} 0 1 1 ${b.x} ${b.y} A ${r} ${r} 0 1 1 ${a.x} ${a.y}`;
  }
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = span > 180 ? 1 : 0;
  const sweep = endDeg > startDeg ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

export function linePath(points) {
  return points.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
}

/* A gently smoothed line through the points. Tension stays low so the curve
 * never bulges past a real data point — these are financial trajectories,
 * and a curve that overshoots invents a value that was never measured. */
export function smoothPath(points, tension = 0.18) {
  if (points.length < 3) return linePath(points);
  let out = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + ((p2.x - p0.x) * tension);
    const c1y = p1.y + ((p2.y - p0.y) * tension);
    const c2x = p2.x - ((p3.x - p1.x) * tension);
    const c2y = p2.y - ((p3.y - p1.y) * tension);
    out += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return out;
}

export function roundedRectPath(x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + rad} ${y}`,
    `H ${x + w - rad}`,
    `A ${rad} ${rad} 0 0 1 ${x + w} ${y + rad}`,
    `V ${y + h - rad}`,
    `A ${rad} ${rad} 0 0 1 ${x + w - rad} ${y + h}`,
    `H ${x + rad}`,
    `A ${rad} ${rad} 0 0 1 ${x} ${y + h - rad}`,
    `V ${y + rad}`,
    `A ${rad} ${rad} 0 0 1 ${x + rad} ${y}`,
    "Z"
  ].join(" ");
}

/* --------------------------------- scales -------------------------------- */

export function linearScale(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}

/* --------------------------------- hit area ------------------------------- */

/* Widens a small mark's hit area without changing how it looks. A transparent
 * paint still hit-tests under pointer-events: visiblePainted, so this buys a
 * comfortable tap target for a 3px dot. Skipped when the mark already carries
 * a real stroke, which would be overwritten. */
export function padHit(node, width = 16) {
  const existing = node.getAttribute("stroke");
  if (existing && existing !== "none" && existing !== "transparent") return node;
  node.setAttribute("stroke", "transparent");
  node.setAttribute("stroke-width", String(width));
  return node;
}

export function text(content, attrs = {}) {
  const node = svgEl("text", attrs);
  node.textContent = content;
  return node;
}
