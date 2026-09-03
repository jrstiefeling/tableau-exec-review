/* Within-group dispersion, drawn as a dumbbell per group.
 *
 * The finding on both tabs that use this is a gap rather than a level: one
 * motion's product lines move together (-41% against -39%) and the other's do
 * not (-15% against +414%); every segment holds a declining line and a growing
 * one. A dumbbell encodes exactly that, because the mark *is* the spread — the
 * Platform's is a two-point stub and Embedded's crosses the zero rule and runs
 * most of the axis, and side by side in the same units that contrast needs no
 * sentence. A grouped bar pair would state the two rates and not the gap,
 * which is the whole finding, and can be misread as a magnitude; a dumbbell
 * cannot.
 *
 * It runs on the same symlog axis as the matrix beside it, imported rather
 * than reimplemented, which is what lets PubSec's row reach the +-1000%
 * gridline and be read as a decade past ENTR's rather than as "both are a
 * lot". A slope graph or a dollar dumbbell would need a prior-year value per
 * line, and back-solving one from a rounded rate does not close at any level.
 *
 * The plot box's height is chosen from the row count. A five-row portlet in
 * the side band gets about 45px per row against 250-480px of width, and a
 * two-row one gets about 150px against the same width — so one fixed aspect
 * would either letterbox a two-row portlet across half its column or overflow
 * a five-row one off the bottom. Widths and half-widths are unchanged, and
 * growthFraction is scale-free, so every decade still lands on the fraction
 * of the half-width it lands on everywhere else on the board. */

import { chartRoot, svgEl, group } from "../svg.js";
import { palette, toneOf, toneColor, tierMeta } from "../palette.js";
import {
  growthX, ratePercent, cellBox, cellAxis, CORE_FRACTION, DECADE_FRACTIONS
} from "./growth.js";
import { strokeDraw, dashDraw, fadeIn, stagger, wait, veil } from "../anim.js";

/* Width and padding come from the compact cell, so the axis is the same shape
 * it is in a matrix cell; only the row's own height budget differs. */
/* Two plot boxes, chosen by row count, and the aspect ratio is the point.
 *
 * `preserveAspectRatio` fits an SVG by its limiting dimension, so a viewBox
 * that does not match the shape of the box it lands in gives away the
 * difference as letterboxing — the same arithmetic that had the Five Year
 * trajectories drawing at a quarter of their allocation. These two are sized
 * against the two shapes this panel actually occupies:
 *
 *   PLOT_WIDE (5.5:1) — the Product tab's two rows, now side by side in a
 *     short wide strip under the matrix, each about 470x85 at 1024;
 *   PLOT_SHORT (10:1) — the Segment tab's five rows stacked in a tall narrow
 *     side column, each about 250x25.
 *
 * Every mark scales off box.h, so the wide box is also the bolder one: at
 * 470px of render width one unit is 1.57px, which puts the stem at 5px and
 * the end dots at 8px where the old 300x76 box in a 250px column drew them at
 * 3.8px and 6px. Flatter on paper, larger on screen. */
const PLOT_W = 300;
const PLOT_WIDE = 54;
const PLOT_SHORT = 30;

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const rows = metrics.rows || [];
  const good = metrics.goodDirection || "up";
  /* The parentage that defines "inside this motion" is what a direct read
   * loses, so the stem is severed rather than dropped: the two stubs keep the
   * interval's extent and the gap says nothing certifies the population it was
   * taken over. Same vocabulary as a broken lineage arrow. */
  const severed = isDirect && (tier === "red" || tier === "grey");

  const box = {
    w: PLOT_W,
    h: rows.length > 3 ? PLOT_SHORT : PLOT_WIDE,
    pad: cellBox(5).pad
  };
  const ax = cellAxis(box);
  const stemW = Math.max(2.2, box.h * 0.06);
  const lowR = Math.max(4, box.h * 0.1);
  const highR = lowR * 1.1;
  // The caret sits above the end labels rather than beside them, so a row whose
  // two ends are two points apart does not stack three marks on one pixel.
  const caretTip = box.h * 0.2;
  const caretTop = box.h * 0.06;

  const wrap = document.createElement("div");
  wrap.className = "spread";

  /* The rows get a box of their own inside the panel.
   *
   * They used to be direct children of `.spread` alongside the footnotes,
   * which meant their axis was the panel's axis: whichever way the panel
   * stacked, the rows stacked. That was fine while this panel only ever lived
   * in a tall narrow side column. It stopped being fine on the Product tab,
   * where the panel is now a short wide strip under the matrix and the two
   * rows want to sit side by side while the footnotes stay underneath them
   * both. One container, two axes, and the tab picks which. */
  const rowsEl = document.createElement("div");
  rowsEl.className = "spread-rows";
  rowsEl.dataset.count = String(rows.length);
  wrap.appendChild(rowsEl);

  const built = rows.map((row, i) => buildRow(row, i));

  // The two notes travel together so the rows above them can share the slack
  // between themselves rather than opening one hole above the caption.
  const foot = document.createElement("div");
  foot.className = "spread-foot";

  const axisNoteEl = document.createElement("p");
  axisNoteEl.className = "spread-axisnote";
  axisNoteEl.textContent = metrics.axisNote || "";
  foot.appendChild(axisNoteEl);

  const captionEl = document.createElement("p");
  captionEl.className = "spread-caption";
  captionEl.textContent = metrics.caption || "";
  foot.appendChild(captionEl);
  wrap.appendChild(foot);

  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  function buildRow(row, index) {
    const low = Number(row.low);
    const high = Number(row.high);
    const lowX = growthX(low, ax.zeroX, ax.halfWidth);
    const highX = growthX(high, ax.zeroX, ax.halfWidth);
    const lowTint = severed ? meta.color : toneColor(toneOf(low, good));
    const highTint = severed ? meta.color : toneColor(toneOf(high, good));

    const rowEl = document.createElement("div");
    rowEl.className = "spread-row";

    const head = document.createElement("div");
    head.className = "spread-head";
    const nameEl = document.createElement("span");
    nameEl.className = "spread-name";
    nameEl.textContent = row.label;
    head.appendChild(nameEl);

    const linesEl = document.createElement("span");
    linesEl.className = "spread-lines";
    // Rendered as authored. Where two lines tie at the slow end the label is a
    // tie — the pair, not a winner picked between them.
    linesEl.textContent = `${row.lowLabel} \u2192 ${row.highLabel}`;
    head.appendChild(linesEl);

    const spanEl = document.createElement("span");
    spanEl.className = "spread-span";
    spanEl.textContent = severed ? "no interval to take" : row.spreadDisplay || "";
    head.appendChild(spanEl);
    rowEl.appendChild(head);

    const plot = document.createElement("div");
    plot.className = "spread-plot";

    const svg = chartRoot(box.w, box.h, {
      label: `${row.label} — ${row.lowLabel} ${row.lowDisplay} to ${row.highLabel} ${row.highDisplay}`,
      class: "spread-svg"
    });
    const marks = group();
    svg.appendChild(marks);

    /* The same ruler every cell on the board draws: the core band tinted once
     * at 0.06 across +-10%, a dashed rule at every decade, and the zero rule as
     * the darkest and thinnest mark. Paint-channel opacities, so the veil can
     * drive them to element opacity 1 and settle() restores the translucency. */
    const core = svgEl("rect", {
      x: ax.zeroX - CORE_FRACTION * ax.halfWidth,
      y: 0,
      width: 2 * CORE_FRACTION * ax.halfWidth,
      height: box.h,
      fill: p.warn,
      "fill-opacity": 0.06,
      class: "spread-core"
    });
    marks.appendChild(core);

    const decades = [];
    DECADE_FRACTIONS.forEach((f) => [-1, 1].forEach((s) => {
      const node = svgEl("path", {
        d: `M ${ax.zeroX + s * f * ax.halfWidth} 2 V ${box.h - 2}`,
        stroke: p.axis,
        "stroke-opacity": 0.5,
        "stroke-width": 1,
        "stroke-dasharray": "1.5 3",
        fill: "none",
        class: "spread-decade"
      });
      marks.appendChild(node);
      decades.push(node);
    }));

    const zero = svgEl("path", {
      d: `M ${ax.zeroX} 0 V ${box.h}`,
      stroke: p.ink,
      "stroke-opacity": 0.5,
      "stroke-width": 1.2,
      fill: "none",
      class: "spread-zero"
    });
    marks.appendChild(zero);

    const stems = [];
    let breakEl = null;
    if (severed) {
      const mid = (lowX + highX) / 2;
      const gap = Math.min(Math.abs(highX - lowX), box.w * 0.06);
      // strokeDraw calls getTotalLength() and renders nothing at all on 0, so a
      // stub with no room to exist is not created rather than created invisible.
      [[lowX, mid - gap / 2], [mid + gap / 2, highX]].forEach(([from, to]) => {
        if (Math.abs(to - from) < 0.5) return;
        stems.push(stem(from, to));
      });
      breakEl = document.createElement("span");
      breakEl.className = "spread-break";
      breakEl.textContent = "\u2715";
      breakEl.setAttribute("aria-hidden", "true");
      breakEl.style.setProperty("--at-x", `${((mid / box.w) * 100).toFixed(2)}%`);
      plot.appendChild(breakEl);
    } else if (Math.abs(highX - lowX) >= 0.5) {
      stems.push(stem(lowX, highX));
    }

    const lowDot = svgEl("circle", {
      cx: lowX,
      cy: ax.midY,
      r: lowR,
      fill: p.surface,
      stroke: lowTint,
      "stroke-width": 2,
      class: "spread-dot is-low"
    });
    marks.appendChild(lowDot);

    const highDot = svgEl("circle", {
      cx: highX,
      cy: ax.midY,
      r: highR,
      fill: highTint,
      class: "spread-dot is-high"
    });
    marks.appendChild(highDot);

    /* The group's own rate, as a hollow caret above the axis position. Only
     * drawn where something certifies the grouping: without it there is no
     * motion or segment for a rate to belong to, and an ungoverned caret would
     * assert one. */
    let caret = null;
    if (!severed && row.parentYoy !== null && row.parentYoy !== undefined) {
      const cx = growthX(Number(row.parentYoy), ax.zeroX, ax.halfWidth);
      caret = svgEl("path", {
        d: `M ${cx} ${caretTip} L ${cx + 3.4} ${caretTop} L ${cx - 3.4} ${caretTop} Z`,
        fill: "none",
        stroke: p.ghost,
        "stroke-width": 1.2,
        class: "spread-caret"
      });
      marks.appendChild(caret);
      const caretHit = svgEl("rect", {
        x: cx - 6, y: 0, width: 12, height: caretTip + 2, fill: "transparent", class: "spread-caret-hit"
      });
      marks.appendChild(caretHit);
      ctx.tip(caretHit, `${row.label} overall · ${row.parentYoyDisplay} Y/Y — one certified measure at the group's own grain, not an average of the two ends`);
    }

    const hit = svgEl("rect", {
      x: 0, y: 0, width: box.w, height: box.h, fill: "transparent", class: "spread-hit"
    });
    marks.appendChild(hit);
    ctx.tip(hit, severed
      ? `${row.label} — ${row.lowLabel} ${row.lowDisplay} to ${row.highLabel} ${row.highDisplay}, over a population nothing certifies`
      : `${row.label} · ${row.lowLabel} ${row.lowDisplay} to ${row.highLabel} ${row.highDisplay} · ${row.spreadDisplay}`);

    plot.appendChild(svg);

    /* End labels are DOM and anchored away from their own dot — the slow end
     * reading leftward and the fast end rightward — so a row whose ends are
     * two points apart still reads as two numerals rather than one overlap.
     * Clamped in ch units against the plot's own edges. */
    const lowEl = endLabel(row.lowDisplay, low, "low", lowTint);
    const highEl = endLabel(row.highDisplay, high, "high", highTint);
    plot.appendChild(lowEl);
    plot.appendChild(highEl);

    rowEl.appendChild(plot);
    rowsEl.appendChild(rowEl);

    function stem(from, to) {
      const node = svgEl("path", {
        d: `M ${from} ${ax.midY} H ${to}`,
        stroke: severed ? meta.color : p.inkSoft,
        "stroke-opacity": 0.55,
        "stroke-width": stemW,
        "stroke-linecap": "butt",
        "stroke-dasharray": severed ? "3 3" : null,
        fill: "none",
        class: "spread-stem"
      });
      marks.appendChild(node);
      return node;
    }

    function endLabel(text, value, end, tint) {
      const node = document.createElement("span");
      node.className = "spread-end";
      node.dataset.end = end;
      node.textContent = text || "";
      node.style.setProperty("--at-x", `${ratePercent(value, box).toFixed(2)}%`);
      // Slack for the sign and per-cent glyphs, which both run wider than the
      // zero that defines ch, and for the chip's own padding.
      node.style.setProperty("--end-w", `${((text || "").length + 2.4).toFixed(1)}ch`);
      node.style.color = tint;
      return node;
    }

    return {
      head, plot, core, decades, zero, stems, lowDot, highDot, caret, breakEl, lowEl, highEl,
      index
    };
  }

  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    const table = document.createElement("table");
    table.className = "trend-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["", "Slowest line", "Fastest line", "Spread", "Group Y/Y"].forEach((h, i) =>
      headRow.appendChild(cell("th", h, i === 0 ? "trend-table-rowlabel" : null)));
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.appendChild(cell("th", row.label, "trend-table-rowlabel"));
      const lowCell = cell("td", `${row.lowLabel} ${row.lowDisplay}`);
      const highCell = cell("td", `${row.highLabel} ${row.highDisplay}`);
      if (!severed) {
        lowCell.style.color = toneColor(toneOf(Number(row.low), good));
        highCell.style.color = toneColor(toneOf(Number(row.high), good));
      } else {
        lowCell.style.color = meta.color;
        highCell.style.color = meta.color;
      }
      tr.appendChild(lowCell);
      tr.appendChild(highCell);
      tr.appendChild(cell("td", row.spreadDisplay || "—"));
      tr.appendChild(cell("td", row.parentYoyDisplay || "—"));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    detail.appendChild(table);

    const note = document.createElement("p");
    note.className = "trend-table-note";
    note.textContent = "Both ends of every interval are the same certified measure at the same grain, which is what makes the interval a comparison rather than two numbers set beside each other.";
    detail.appendChild(note);

    return detail;
  }

  function cell(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value ?? "";
    if (className) node.className = className;
    return node;
  }

  /* Every animated node, conditional ones included: the caret exists only in a
   * governed read, the break glyph only in a direct one, and a stem exists only
   * where its two ends are far enough apart to draw one. settle() is what keeps
   * each of those visible when its beat never runs. */
  const curtain = veil([
    built.map((r) => [
      r.head, r.core, r.decades, r.zero, r.stems, r.lowDot, r.highDot,
      r.caret, r.breakEl, r.lowEl, r.highEl
    ]),
    axisNoteEl,
    captionEl
  ]);
  curtain.hide();

  async function build(signal) {
    /* 1 — the ruler. */
    built.forEach((r) => {
      strokeDraw(r.zero, { duration: 380, signal });
      fadeIn(r.core, { delay: 120, duration: 320, y: 0, signal });
      stagger(r.decades, { step: 30, maxTotal: 140, duration: 300, y: 0, delay: 120, signal });
    });
    stagger(built.map((r) => r.head), { step: 60, duration: 320, y: 3, signal });

    /* 2 — the declining end first, which is also the left end, so the row
     * reads in +x. */
    await wait(200, signal);
    stagger(built.map((r) => r.lowDot), { step: 80, duration: 300, y: 0, scaleFrom: 0.3, signal });
    stagger(built.map((r) => r.lowEl), { step: 80, duration: 300, y: 0, delay: 90, signal });

    /* 3 — the spread opens left to right. This is the beat: Embedded's stem
     * visibly crosses the zero rule and the Platform's barely moves. */
    await wait(240, signal);
    built.forEach((r, i) => {
      r.stems.forEach((s) => strokeDraw(s, { duration: 480, delay: i * 90, signal }));
      if (r.breakEl) fadeIn(r.breakEl, { delay: i * 90 + 240, duration: 280, y: 0, scaleFrom: 0.4, signal });
    });

    /* 4 — the fast end, then the group's own rate, then the axis copy. */
    await wait(360, signal);
    stagger(built.map((r) => r.highDot), { step: 80, duration: 320, y: 0, scaleFrom: 0.3, signal });
    stagger(built.map((r) => r.highEl), { step: 80, duration: 320, y: 0, delay: 90, signal });
    // dashDraw rather than strokeDraw: a five-unit closed caret has almost no
    // length to reveal along, and its outline is the mark.
    built.forEach((r, i) => {
      if (r.caret) dashDraw(r.caret, { duration: 300, delay: 160 + i * 70, signal });
    });

    await wait(260, signal);
    fadeIn(axisNoteEl, { duration: 400, y: 4, signal });
    fadeIn(captionEl, { delay: 120, duration: 460, y: 6, signal });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
