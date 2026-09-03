/* Product-motion mix: two periods as a proportional alluvial.
 *
 * The portlet's argument is a two-period sentence — Embedded is taking share
 * of a base that is shrinking underneath it — and a one-period stacked bar
 * could only ever draw the second half of it. The share was in the chart; the
 * rotation, the fall in the base and the divergence were all in the prose
 * sitting under it.
 *
 * So: two columns, FY26 Q2 and FY27 Q2, whose *widths* are their totals on one
 * shared dollars-per-pixel scale and whose *heights* are the 100% split, with
 * a ribbon joining each segment's prior share to its current one. That makes
 * area dollars in both columns, which is what keeps the two encodings mutually
 * honest, and it puts three facts into the geometry that used to be in text:
 *
 *   the base shrank      — the right column is 72% of the left column's width
 *   the mix rotated      — the split boundary jumps from 14% up to 29%
 *   they diverged        — Embedded's ribbon widens while Agentic's pinches
 *
 * and the paradox the portlet is actually about is the one thing you cannot
 * miss, because Embedded's ribbon widens into a column that is narrower.
 *
 * Marimekko's standard caution is that variable width should not be used for a
 * time series, because width can imply growth that is not there. This is the
 * narrow case where it does not apply: the width *is* the decline, on one
 * measure, over two comparable quarters — and both totals are labelled, so
 * width is never doing unlabelled work.
 *
 * Every figure here is authored on both periods. Nothing is back-solved from a
 * rounded percentage: a renderer recovering a prior year by dividing +54% into
 * $24M would be the board doing the exact thing it criticises, and it would be
 * lossy besides. */

import { chartRoot, svgEl, group, smoothPath, linearScale } from "../svg.js";
import { palette, toneOf, toneColor, tierMeta } from "../palette.js";
import { countUp, strokeDraw, fadeIn, growFrom, stagger, wait, veil } from "../anim.js";

/* A wide, short viewBox, because that is the shape of the space: the mix
 * portlet is the 2.05fr column of the mix band, so the chart area is between
 * five and eight times as wide as it is tall at every breakpoint the board is
 * composed for. A squarer viewBox would letterbox to a narrow strip in the
 * middle of a very wide box and throw the width away.
 *
 * The bottom 22 units are not drawn into. They are the band the two column
 * labels occupy, and the labels are DOM nodes anchored to the bottom of the
 * plot box rather than <text> inside the viewBox — text in user units scales
 * with the container, and this plot is drawn at anything from 0.9x to 1.3x
 * depending on the breakpoint. */
const W = 460;
const H = 80;
const COL = { top: 3, bottom: 56 };
const MAXW = 88;
const EDGE = 12;

/* A Sankey ribbon edge, sampled along a smoothstep so the curve leaves each
 * column horizontally and arrives horizontally. smoothPath then carries it, at
 * the same low tension the trajectories use, so the ribbon never bulges past
 * either band it connects. */
function edgePoints(x0, x1, y0, y1, steps = 14) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const ease = t * t * (3 - 2 * t);
    pts.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * ease });
  }
  return pts;
}

function ribbonPath(top, bottom) {
  // The reversed bottom edge is spliced on as a line-to, which draws the right
  // edge of the ribbon; Z closes the left one.
  return `${smoothPath(top)} ${smoothPath([...bottom].reverse()).replace(/^M/, "L")} Z`;
}

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const segments = metrics.segments || [];
  const total =
    Number(metrics.total) || segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || 1;
  const priorTotal = Number(metrics.priorTotal) || total;
  const periodLabel = metrics.periodLabel || "current";
  const priorPeriodLabel = metrics.priorPeriodLabel || "prior";

  // The split always draws. Without a SKU-to-motion dimension a direct read
  // does not decline to answer — it name-matches product codes and returns a
  // split, and the ribbon it produces is the same shape as the governed one
  // because the rotation is real. What is wrong is where the boundary sits.
  const splitAvailable = true;

  const wrap = document.createElement("div");
  wrap.className = "mix";

  /* ---- the alluvial ---- */
  const canvas = document.createElement("div");
  canvas.className = "mix-canvas";
  const plot = document.createElement("div");
  plot.className = "mix-plot";

  const svg = chartRoot(W, H, {
    label: `${priorPeriodLabel} to ${periodLabel} ACV mix — column width is the period total, column height is the split`,
    class: "mix-svg"
  });
  const marks = group();
  svg.appendChild(marks);

  const wScale = linearScale([0, priorTotal], [0, MAXW]);
  const colH = COL.bottom - COL.top;
  const left = { x: EDGE, w: Math.max(4, wScale(priorTotal)) };
  const right = { w: Math.max(4, wScale(total)) };
  right.x = W - EDGE - right.w;

  function totalDisplayFor(period) {
    return period === priorPeriodLabel
      ? metrics.priorTotalDisplay || ""
      : metrics.totalDisplay || "";
  }

  /* One column. Segments stack in authored order from the top and are
   * contiguous, because the height channel is a share of a whole and a gap
   * between them would take dollars out of the column. The boundary is a
   * hairline in the paper colour instead. */
  function column(col, pick, colTotal, period) {
    const g = group({ class: "mix-col" });
    const rects = [];
    const bands = [];
    let y = COL.top;

    if (!splitAvailable) {
      const block = svgEl("rect", {
        x: col.x,
        y: COL.top,
        width: col.w,
        height: colH,
        rx: 2,
        fill: meta.color,
        "fill-opacity": 0.1,
        stroke: meta.color,
        "stroke-width": 1,
        "stroke-dasharray": "4 5",
        class: "mix-block"
      });
      g.appendChild(block);
      rects.push(block);

      // The same void mark the attainment cards use where there is no
      // defensible basis. Red earns a hard cross, and "the split cannot be
      // produced at all" is exactly that case.
      const cx = col.x + col.w / 2;
      const cy = COL.top + colH / 2;
      const r = Math.min(5, col.w / 3);
      [[-1, -1], [-1, 1]].forEach(([sx, sy]) => {
        const stroke = svgEl("path", {
          d: `M ${cx + sx * r} ${cy + sy * r} L ${cx - sx * r} ${cy - sy * r}`,
          stroke: meta.color,
          "stroke-width": 1.6,
          "stroke-linecap": "round",
          class: "mix-void"
        });
        g.appendChild(stroke);
        rects.push(stroke);
      });
      ctx.tip(block, `${period} · ${totalDisplayFor(period)} · no motion split available`);
      return { g, rects, bands, boundary: null };
    }

    segments.forEach((seg) => {
      const h = (Math.max(0, Number(seg[pick.value]) || 0) / colTotal) * colH;
      const rect = svgEl("rect", {
        x: col.x,
        y,
        width: col.w,
        height: Math.max(0.6, h),
        fill: seg.color || ctx.accent,
        class: "mix-seg-mark",
        "data-segment": seg.id
      });
      g.appendChild(rect);
      rects.push(rect);
      bands.push({ y0: y, y1: y + h, seg });
      ctx.tip(rect, `${period} · ${seg.label} · ${seg[pick.display] || ""}`);
      y += h;
    });

    let boundary = null;
    if (bands.length > 1) {
      boundary = svgEl("path", {
        d: `M ${col.x} ${bands[0].y1} H ${col.x + col.w}`,
        stroke: p.surface,
        "stroke-width": 1.1,
        fill: "none",
        class: "mix-boundary"
      });
      g.appendChild(boundary);
    }
    return { g, rects, bands, boundary };
  }

  const priorCol = column(
    left,
    { value: "priorValue", display: "priorDisplay" },
    priorTotal,
    priorPeriodLabel
  );
  const currentCol = column(right, { value: "value", display: "display" }, total, periodLabel);
  marks.appendChild(priorCol.g);

  /* Ribbons go in before the current column so the column edges stay crisp
   * over them, and each is two nodes: a hairline outline drawn on from the
   * prior column to the current one — left to right, in the direction of time
   * — and a translucent fill that arrives behind it. */
  const ribbonFills = [];
  const ribbonEdges = [];
  if (splitAvailable) {
    priorCol.bands.forEach((from, i) => {
      const to = currentCol.bands[i];
      if (!to) return;
      const x0 = left.x + left.w;
      const x1 = right.x;
      const d = ribbonPath(
        edgePoints(x0, x1, from.y0, to.y0),
        edgePoints(x0, x1, from.y1, to.y1)
      );
      const fill = svgEl("path", {
        d,
        fill: from.seg.color || ctx.accent,
        // A paint channel, not element opacity: the build fades these to
        // element opacity 1 and settle() leaves the authored translucency
        // intact, so a ribbon can never flood the columns it connects.
        "fill-opacity": 0.2,
        class: "mix-ribbon",
        "data-segment": from.seg.id
      });
      const edge = svgEl("path", {
        d,
        fill: "none",
        stroke: from.seg.color || ctx.accent,
        "stroke-opacity": 0.55,
        "stroke-width": 0.8,
        class: "mix-ribbon-edge"
      });
      marks.appendChild(fill);
      marks.appendChild(edge);
      ribbonFills.push(fill);
      ribbonEdges.push(edge);
      ctx.tip(
        fill,
        `${from.seg.label} · ${priorPeriodLabel} ${from.seg.priorDisplay || ""} → ${periodLabel} ${
          from.seg.display || ""
        } · ${from.seg.yoyDisplay || ""}`
      );
    });
  }

  marks.appendChild(currentCol.g);
  plot.appendChild(svg);

  /* ---- column labels ----
   * Anchored to the outer edge of each column rather than centred under it, so
   * a label can never be pushed out of the plot box by its own width, and the
   * inset is set from JS as a percentage of the box so it can never drift off
   * the column it names. */
  function colLabel(kind, period, totalDisplay, hero) {
    const el = document.createElement("div");
    el.className = `mix-col-label is-${kind}`;
    const periodEl = document.createElement("span");
    periodEl.className = "mix-col-period";
    periodEl.textContent = period;
    const totalEl = document.createElement("span");
    totalEl.className = "mix-col-total";
    if (hero) totalEl.dataset.hero = "true";
    el.appendChild(periodEl);
    el.appendChild(totalEl);
    plot.appendChild(el);
    ctx.tip(
      el,
      `${period} total ${totalDisplay} · the column's width is this total, on the same dollars-per-pixel scale as the other column`
    );
    return { el, totalEl, display: totalDisplay };
  }

  const priorLabel = colLabel("prior", priorPeriodLabel, metrics.priorTotalDisplay || "", false);
  const currentLabel = colLabel("current", periodLabel, metrics.totalDisplay || "", true);

  plot.style.setProperty("--mix-edge-x", `${((EDGE / W) * 100).toFixed(2)}%`);

  canvas.appendChild(plot);
  wrap.appendChild(canvas);

  /* ---- legend ----
   * The columns now carry both totals and the tooltips carry both segment
   * figures, so the legend is back to being what a legend is for: the key from
   * a colour to a motion, plus the one number the geometry does not state,
   * which is the rate of change. */
  /* The legend and the caption share one row. Both are short and the portlet
   * is the widest on the board, so stacking them spent a row of a card that
   * has about 130px of body at most of the breakpoints — and that row is what
   * pays for the chart. */
  const foot = document.createElement("div");
  foot.className = "mix-foot";

  const legend = document.createElement("div");
  legend.className = "mix-legend";
  const legendEls = [];

  if (splitAvailable) {
    segments.forEach((seg) => {
      const tint = seg.color || ctx.accent;
      const item = document.createElement("div");
      item.className = "mix-item";
      item.style.setProperty("--seg-color", tint);

      const label = document.createElement("span");
      label.className = "mix-item-label";
      label.textContent = seg.label;
      item.appendChild(label);

      if (seg.detail) {
        const detail = document.createElement("span");
        detail.className = "mix-item-detail";
        detail.textContent = seg.detail;
        item.appendChild(detail);
      }

      const yoy = document.createElement("span");
      yoy.className = "mix-item-yoy";
      yoy.style.setProperty(
        "--delta-tint",
        toneColor(toneOf(seg.yoy, seg.goodDirection || "up"))
      );
      yoy.textContent = seg.yoyDisplay || "";
      item.appendChild(yoy);

      legend.appendChild(item);
      legendEls.push(item);
    });
  }
  foot.appendChild(legend);

  const caption = document.createElement("p");
  caption.className = "mix-caption";
  caption.textContent = metrics.caption || "";
  foot.appendChild(caption);
  wrap.appendChild(foot);

  /* The insight is the one flexible element in the stack — line-clamped, with
   * min-height 0 — so vertical pressure at a tight breakpoint lands on the
   * element that can lose a line without losing meaning rather than on the
   * chart or on a label. The chart now states three of the four facts this
   * paragraph used to carry, which is what makes that a real fallback rather
   * than a shrug. */
  const insight = document.createElement("p");
  insight.className = "mix-insight";
  insight.innerHTML = metrics.insight || "";
  wrap.appendChild(insight);

  host.appendChild(wrap);

  /* Both column groups, every mark inside them, both ribbon layers, the void
   * strokes, the boundary hairlines and both DOM labels are veiled. The
   * conditional ones are veiled too — ribbons and boundaries exist only when
   * the split does, the void strokes only when it does not — and settle()
   * restores whichever set a build never reached. */
  const curtain = veil([
    priorCol.g, priorCol.rects, priorCol.boundary,
    currentCol.g, currentCol.rects, currentCol.boundary,
    ribbonFills, ribbonEdges,
    priorLabel.el, currentLabel.el,
    legendEls, caption, insight
  ]);
  curtain.hide();

  async function build(signal) {
    /* Narrative order, left to right: the base being compared against arrives
     * first, then the base being compared — and the width difference is
     * visible from the first frame of that second beat, which is the "the base
     * shrank" moment. */
    growFrom(priorCol.g, { axis: "y", origin: "center bottom", duration: 560, signal });
    fadeIn(priorLabel.el, { delay: 120, duration: 380, y: 4, signal });
    countUp(priorLabel.totalEl, priorLabel.display, { delay: 140, duration: 720, signal });
    stagger(priorCol.rects, { step: 90, delay: 160, duration: 340, y: 0, signal });
    if (priorCol.boundary) fadeIn(priorCol.boundary, { delay: 340, duration: 280, y: 0, signal });

    await wait(320, signal);
    growFrom(currentCol.g, { axis: "y", origin: "center bottom", duration: 560, signal });
    fadeIn(currentLabel.el, { delay: 140, duration: 400, y: 4, signal });
    countUp(currentLabel.totalEl, currentLabel.display, { delay: 160, duration: 860, signal });
    stagger(currentCol.rects, { step: 90, delay: 180, duration: 340, y: 0, signal });
    if (currentCol.boundary) fadeIn(currentCol.boundary, { delay: 360, duration: 280, y: 0, signal });

    await wait(360, signal);
    // Edge first, then fill: the ribbon is drawn from the prior column to the
    // current one before it is coloured in, which is the same
    // component-arriving idiom the rest of the board builds with.
    ribbonEdges.forEach((edge, i) => strokeDraw(edge, { delay: i * 120, duration: 700, signal }));
    ribbonFills.forEach((fill, i) =>
      fadeIn(fill, { delay: 300 + i * 120, duration: 520, y: 0, signal })
    );

    await wait(520, signal);
    stagger(legendEls, { step: 110, duration: 420, y: 8, signal });
    fadeIn(caption, { delay: 140, duration: 420, y: 6, signal });
    fadeIn(insight, { delay: 280, duration: 480, y: 8, signal });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
