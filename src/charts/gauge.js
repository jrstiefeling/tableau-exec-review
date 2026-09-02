/* Hero KPI tile: a plan-attainment ring behind a rolling numeral.
 *
 * A bare number tells you what happened; a number against its plan tells you
 * whether that is a problem. The ring is the second half of that sentence,
 * and its polarity comes from the certified measure rather than from a colour
 * chosen in a deck — which is why 104% of an attrition plan renders as a miss
 * here without anyone having to remember that lower is better. */

import { chartRoot, svgEl, arcPath, text, group } from "../svg.js";
import { palette, toneOf, planTone, toneColor, tierMeta } from "../palette.js";
import { countUp, scramble, sweepArc, fadeIn, wait } from "../anim.js";

const W = 132;
const H = 132;
const CX = 66;
const CY = 66;
const R = 50;

export function mount(host, ctx) {
  const { metrics, accent, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const goodDirection = metrics.goodDirection || "up";
  const planDirection = metrics.planGoodDirection || goodDirection;
  const planTint = toneColor(planTone(metrics.plan, planDirection));
  const yoyTint = toneColor(toneOf(metrics.yoy, goodDirection));

  // Red and grey tiers have no defensible plan basis, so the ring renders
  // empty rather than drawing an attainment the data cannot support.
  const ringIsVoid = isDirect && (tier === "red" || tier === "grey");
  const ringTint = isDirect ? meta.color : planTint;

  const wrap = document.createElement("div");
  wrap.className = "gauge";

  /* ---- ring ---- */
  const ringHost = document.createElement("div");
  ringHost.className = "gauge-ring";
  const svg = chartRoot(W, H, { label: `${ctx.label} plan attainment`, class: "gauge-svg" });
  const marks = group();
  svg.appendChild(marks);

  const track = svgEl("path", {
    d: arcPath(CX, CY, R, 0, 360),
    fill: "none",
    stroke: p.track,
    "stroke-width": 9,
    "stroke-linecap": "round",
    class: "gauge-track"
  });
  if (isDirect) track.setAttribute("stroke-dasharray", "4 7");
  marks.appendChild(track);

  const planPct = Number(metrics.plan) || 0;
  const capped = Math.max(0, Math.min(planPct, 100));

  const fill = svgEl("path", {
    d: arcPath(CX, CY, R, 0, Math.max(0.6, (capped / 100) * 360)),
    fill: "none",
    stroke: ringTint,
    "stroke-width": 9,
    "stroke-linecap": "round",
    class: "gauge-fill",
    opacity: ringIsVoid ? 0 : 1
  });
  marks.appendChild(fill);

  // Attainment past 100% gets its own outer arc rather than wrapping over the
  // ring, so over-plan reads as overshoot instead of as a fuller circle.
  let overflow = null;
  if (!ringIsVoid && planPct > 100) {
    overflow = svgEl("path", {
      d: arcPath(CX, CY, R + 9, 0, ((planPct - 100) / 100) * 360),
      fill: "none",
      stroke: planTint,
      "stroke-width": 3.5,
      "stroke-linecap": "round",
      class: "gauge-overflow"
    });
    marks.appendChild(overflow);
  }

  const centreValue = text(ringIsVoid ? "—" : `${Math.round(planPct)}%`, {
    x: CX,
    y: CY + 2,
    "text-anchor": "middle",
    fill: ringIsVoid ? p.inkDim : p.ink,
    class: "gauge-centre-value"
  });
  const centreLabel = text(ringIsVoid ? "no basis" : "of plan", {
    x: CX,
    y: CY + 20,
    "text-anchor": "middle",
    fill: p.inkDim,
    class: "gauge-centre-label"
  });
  marks.appendChild(centreValue);
  marks.appendChild(centreLabel);

  ringHost.appendChild(svg);

  /* ---- readout ---- */
  const readout = document.createElement("div");
  readout.className = "gauge-readout";

  const value = document.createElement("div");
  value.className = "gauge-value";
  if (isDirect) value.dataset.contested = "true";
  readout.appendChild(value);

  const deltas = document.createElement("div");
  deltas.className = "gauge-deltas";

  const yoy = document.createElement("span");
  yoy.className = "delta";
  yoy.style.setProperty("--delta-tint", isDirect ? meta.color : yoyTint);
  yoy.textContent = metrics.yoyDisplay || "";
  deltas.appendChild(yoy);

  const planChip = document.createElement("span");
  planChip.className = "delta delta-plan";
  planChip.style.setProperty("--delta-tint", ringTint);
  planChip.textContent = metrics.planDisplay || "";
  deltas.appendChild(planChip);
  readout.appendChild(deltas);

  // A Y/Y bar anchored at centre, so direction is legible before the sign is
  // read. Magnitude is capped at 100% of the half-track — past that the exact
  // length stops carrying information the number does not already give.
  const bar = document.createElement("div");
  bar.className = "delta-bar";
  const barFill = document.createElement("span");
  barFill.className = "delta-bar-fill";
  const yoyValue = Number(metrics.yoy) || 0;
  barFill.dataset.dir = yoyValue < 0 ? "neg" : "pos";
  barFill.style.setProperty("--delta-tint", isDirect ? meta.color : yoyTint);
  barFill.style.setProperty("--delta-width", `${Math.min(Math.abs(yoyValue), 100)}%`);
  bar.appendChild(barFill);
  readout.appendChild(bar);

  const caption = document.createElement("p");
  caption.className = "gauge-caption";
  caption.textContent = metrics.caption || "";
  readout.appendChild(caption);

  wrap.appendChild(ringHost);
  wrap.appendChild(readout);
  host.appendChild(wrap);

  async function build(signal) {
    const display = metrics.display || "";
    const candidates = isDirect ? (ctx.portlet.directMode || {}).candidates : null;

    fadeIn(svg, { delay: 0, duration: 460, y: 6, signal });
    [centreValue, centreLabel].forEach((node, i) =>
      fadeIn(node, { delay: 420 + i * 70, duration: 380, y: 4, signal })
    );

    if (!ringIsVoid) sweepArc(fill, { delay: 140, duration: 1050, signal });
    if (overflow) sweepArc(overflow, { delay: 900, duration: 620, signal });

    // A governed value rolls up to one answer; a contested one flickers
    // between the answers nobody has ruled between.
    if (candidates && candidates.length > 1) {
      scramble(value, candidates, display, { delay: 180, signal });
    } else {
      countUp(value, display, { delay: 180, duration: 1080, signal });
    }
    fadeIn(value, { delay: 120, duration: 420, y: 10, signal });

    await wait(240, signal);
    fadeIn(yoy, { delay: 0, duration: 420, y: 6, signal });
    fadeIn(planChip, { delay: 90, duration: 420, y: 6, signal });
    fadeIn(bar, { delay: 180, duration: 420, y: 4, signal });
    fadeIn(caption, { delay: 300, duration: 460, y: 6, signal });

    await wait(560, signal);
    bar.classList.add("is-live");
  }

  return { build };
}
