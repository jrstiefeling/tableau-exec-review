/* The rules this tab applies to every panel on it.
 *
 * Comparability, scaling, polarity and colour thresholds are usually
 * invisible decisions taken by whoever built the chart. Stating them as a
 * portlet makes the point that they are properties of the measures rather
 * than of this particular rendering — which is why they survive into every
 * other chart, export and agent that reads the same measures, and why they
 * are the first thing to disappear without a semantic layer.
 *
 * Two of the trend tab's four rules describe *shapes* rather than rules, and
 * those two get a mini-diagram inline with the rule text:
 *
 *   flowStock     — a flow accumulating across a period and offered a
 *                   run-rate ghost, beside a stock read at a point in time
 *                   and joined to the line. The rule names the two measures
 *                   the layer itself distinguishes rather than two panels on
 *                   this tab, so without the thumbnails the reader has to hold
 *                   the sentence in their head and picture both shapes. The
 *                   thumbnails do it in place, and they are drawn in the trend
 *                   panels' own vocabulary — same break rule, same detached
 *                   ring-with-core, same dashed ghost — so each one is a
 *                   miniature of the thing it describes rather than a separate
 *                   illustration.
 *
 *   zeroBaseline  — the same five values twice, once from zero and once from a
 *                   padded baseline, so the exaggeration the rule refuses is
 *                   visible instead of merely claimed. Explaining an optical
 *                   argument in prose when an SVG renderer is available is
 *                   leaving the argument on the table.
 *
 * The other rules stay text, because they are about rules and not about
 * shapes. Both diagrams are conditional on the rule naming one — this
 * renderer also draws the two rules cards on the product and segment tabs,
 * whose rules author no diagram — and the kind is switched on the authored
 * name rather than inferred from a title.
 *
 * The diagrams are aria-hidden. The rule text carries the meaning; the
 * thumbnail is a restatement of it in the tab's own grammar. */

import { svgEl, group, chartRoot, smoothPath } from "../svg.js";
import { palette, tierMeta } from "../palette.js";
import { strokeDraw, dashDraw, fadeIn, stagger, wait, veil } from "../anim.js";

const DW = 108;
const DH = 28;
const BASE_Y = 24;
const PANE = [
  { x0: 1, x1: 47 },
  { x0: 61, x1: 107 }
];

const DIAGRAMS = { flowStock, zeroBaseline };

function diagramRoot(kind) {
  const svg = chartRoot(DW, DH, { class: `rule-diagram is-${kind}` });
  svg.setAttribute("aria-hidden", "true");
  svg.removeAttribute("role");
  svg.removeAttribute("aria-label");
  const marks = group();
  svg.appendChild(marks);
  return { svg, marks, lines: [], dashes: [], dots: [] };
}

function pts(xs, ys) {
  return xs.map((x, i) => ({ x, y: ys[i] }));
}

/* Flow versus stock, in the trend panels' vocabulary: a break rule, a detached
 * ring-with-core and a dashed run-rate ghost on the left; an unbroken line
 * carried through to a solid point on the right.
 *
 * In direct mode both marks the semantic layer authorises are withheld — the
 * break, because nothing declares the measure a flow, and the ghost, because
 * nothing licenses annualising it — so the two thumbnails collapse into the
 * same picture. That is the degradation stated as geometry: a spreadsheet
 * cannot tell those two rows apart, and neither can this card any more. */
function flowStock({ accent, p, isDirect }) {
  const d = diagramRoot("flowStock");
  const declared = !isDirect;

  [0, 1].forEach((pane) => {
    const { x0, x1 } = PANE[pane];
    const isFlow = pane === 0 && declared;

    const base = svgEl("path", {
      d: `M ${x0} ${BASE_Y} H ${x1}`,
      stroke: p.axis,
      "stroke-width": 0.7,
      fill: "none"
    });
    d.marks.appendChild(base);
    d.lines.push(base);

    const xs = [x0 + 2, x0 + 12, x0 + 22, x0 + 31, x0 + 42];
    const ys = [7, 10, 12, 14.6, 17.4];
    const joined = isFlow ? pts(xs.slice(0, 4), ys.slice(0, 4)) : pts(xs, ys);

    const line = svgEl("path", {
      d: smoothPath(joined),
      fill: "none",
      stroke: accent,
      "stroke-width": 1.3,
      "stroke-linecap": "round"
    });
    d.marks.appendChild(line);
    d.lines.push(line);

    if (isFlow) {
      const bx = (xs[3] + xs[4]) / 2;
      const brk = svgEl("path", {
        d: `M ${bx} 3.5 V ${BASE_Y}`,
        stroke: p.axis,
        "stroke-width": 0.8,
        "stroke-dasharray": "1 3",
        fill: "none"
      });
      d.marks.appendChild(brk);
      d.dashes.push(brk);

      const link = svgEl("path", {
        d: `M ${xs[4]} ${ys[4]} V 8`,
        stroke: p.ghost,
        "stroke-width": 1,
        "stroke-dasharray": "1.2 2.2",
        fill: "none"
      });
      d.marks.appendChild(link);
      d.dashes.push(link);

      const ghost = svgEl("circle", {
        cx: xs[4],
        cy: 7,
        r: 1.9,
        fill: "none",
        stroke: p.ghost,
        "stroke-width": 1.1,
        "stroke-dasharray": "1.6 1.6"
      });
      d.marks.appendChild(ghost);
      d.dots.push(ghost);

      // Detached but still a real measurement: a solid ring around a smaller
      // core, exactly as the panels draw it. Dashes stay reserved for the
      // ghost, which was never measured at all.
      const ring = svgEl("circle", {
        cx: xs[4],
        cy: ys[4],
        r: 2.3,
        fill: "none",
        stroke: accent,
        "stroke-width": 1.3
      });
      const core = svgEl("circle", { cx: xs[4], cy: ys[4], r: 0.8, fill: accent });
      d.marks.appendChild(ring);
      d.marks.appendChild(core);
      d.dots.push(ring, core);
    } else {
      const dot = svgEl("circle", { cx: xs[4], cy: ys[4], r: 1.7, fill: accent });
      d.marks.appendChild(dot);
      d.dots.push(dot);
    }
  });

  return d;
}

/* The same five values twice. On the left the axis is anchored at zero and the
 * decline is what it is; on the right the baseline is padded to just under the
 * lowest value and the identical series falls off a cliff. The padded pane is
 * drawn in dim ink over a dashed axis, so the pane the tab actually uses is
 * the accented one and the refused option reads as the quotation it is.
 *
 * In direct mode neither axis is asserted, so both are dashed and both series
 * are dim — the rule is still describable and nothing is left claiming to be
 * the governed choice. */
function zeroBaseline({ accent, p, isDirect }) {
  const d = diagramRoot("zeroBaseline");
  const series = [100, 96, 92, 88, 80];
  const REACH = 17;

  [0, 1].forEach((pane) => {
    const { x0, x1 } = PANE[pane];
    const padded = pane === 1;
    const floor = padded ? 78 : 0;
    const ceiling = 100;
    const tint = padded || isDirect ? p.inkDim : accent;

    const base = svgEl("path", {
      d: `M ${x0} ${BASE_Y} H ${x1}`,
      stroke: p.axis,
      "stroke-width": 0.8,
      fill: "none"
    });
    // A truncated axis is drawn as truncated. That is the whole argument.
    if (padded || isDirect) base.setAttribute("stroke-dasharray", "2 2");
    d.marks.appendChild(base);
    (padded || isDirect ? d.dashes : d.lines).push(base);

    const step = (x1 - x0 - 6) / (series.length - 1);
    const xs = series.map((_, i) => x0 + 3 + i * step);
    const ys = series.map((v) => BASE_Y - ((v - floor) / (ceiling - floor)) * REACH);

    const line = svgEl("path", {
      d: smoothPath(pts(xs, ys)),
      fill: "none",
      stroke: tint,
      "stroke-width": 1.3,
      "stroke-linecap": "round"
    });
    d.marks.appendChild(line);
    d.lines.push(line);

    const dot = svgEl("circle", {
      cx: xs[xs.length - 1],
      cy: ys[ys.length - 1],
      r: 1.6,
      fill: tint
    });
    d.marks.appendChild(dot);
    d.dots.push(dot);
  });

  return d;
}

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const meta = tierMeta(tier);
  const p = palette();
  const accent = isDirect ? meta.color : ctx.accent;

  const list = document.createElement("ul");
  list.className = "rules";
  const items = [];
  const diagrams = [];

  (metrics.rules || []).forEach((rule) => {
    const li = document.createElement("li");
    li.className = "rule";
    li.style.setProperty("--card-accent", accent);

    const title = document.createElement("p");
    title.className = "rule-title";
    title.textContent = rule.title;
    li.appendChild(title);

    // Only a rule that names a diagram gets one, and only a kind this renderer
    // knows how to draw. Nothing is inferred from the title: the product and
    // segment tabs' rules cards run through here too, and a rule called
    // "Roll-up is geometry" is not a request for a trajectory.
    const make = rule.diagram ? DIAGRAMS[rule.diagram] : null;
    if (make) {
      const d = make({ accent, p, isDirect });
      li.appendChild(d.svg);
      diagrams.push(d);
    }

    const body = document.createElement("p");
    body.className = "rule-body";
    body.textContent = rule.body;
    li.appendChild(body);

    list.appendChild(li);
    items.push(li);
  });

  host.appendChild(list);

  /* The diagram nodes are veiled alongside the list items. Veiling the <li>
   * alone would not do it: opacity multiplies, so an unveiled child appears
   * the moment its item fades in rather than when its own beat arrives, which
   * is the flash in miniature. Both diagrams are conditional on authored
   * fields, which is exactly the case settle() exists for. */
  const curtain = veil([
    items,
    diagrams.map((d) => [d.svg, d.lines, d.dashes, d.dots])
  ]);
  curtain.hide();

  async function build(signal) {
    for (let i = 0; i < items.length; i += 1) {
      fadeIn(items[i], { duration: 420, y: 10, signal });
      const d = diagrams.find((x) => items[i].contains(x.svg));
      if (d) {
        fadeIn(d.svg, { delay: 60, duration: 300, y: 0, signal });
        // strokeDraw for the trajectories and axes, dashDraw wherever the
        // dashes carry the meaning — the break, the run-rate ghost's link and
        // the truncated axis — because strokeDraw would consume the pattern as
        // its own reveal mechanism.
        d.lines.forEach((line, n) => strokeDraw(line, { delay: 80 + n * 60, duration: 280, signal }));
        d.dashes.forEach((dash, n) => dashDraw(dash, { delay: 220 + n * 70, duration: 300, signal }));
        stagger(d.dots, { step: 70, delay: 320, duration: 280, y: 0, scaleFrom: 0.4, signal });
      }
      const cancelled = await wait(88, signal);
      if (cancelled) return;
    }
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
