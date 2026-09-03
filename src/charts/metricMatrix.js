/* Q3 outlook as one row-keyed band: a plan landscape on a dollar scale, with
 * the remaining measures' Y/Y beside it on the same rows.
 *
 * The matrix used to carry four encodings in every ACV cell — a Y/Y stub, a
 * percent-of-plan bullet, a velocity dumbbell and a coverage dumbbell — and
 * read as clutter rather than as a comparison. Two of those four were never
 * cell content in the first place. Velocity and coverage are properties of a
 * *row*: they say something about the motion, not about the motion's ACV, and
 * putting them inside the ACV cell was a category error that cost them their
 * legibility. They now have a band of their own, on shared axes, in
 * benchmarkAxis.js.
 *
 * What is left is the ranking that always worked. Rank 1 is the numeral, rank
 * 2 the Y/Y stub on the board's shared symlog axis, and the alternate basis —
 * a second stated value for the same measure — is a dashed hollow tick on that
 * same axis in trendPanel.js's run-rate-ghost vocabulary, now named in a
 * readable strip at the foot instead of in 8px grey inside the cell.
 *
 * `metrics.landscape` turns one column into the band's hero. That column stops
 * being a cell and becomes two: a bar on a shared dollar scale with a target
 * tick at the derived plan, and a readout carrying the value, its Y/Y, the
 * authored attainment and the derived gap. The bar is bulletTrack from
 * attainment.js on a dollar domain rather than a percent one — the same
 * continuous run from zero to the target, solid where it was delivered and
 * dashed where it was not, the same ink tick standing proud of it, and the
 * same stepped cap where a motion is over plan. One target grammar on the
 * board, at two scales.
 *
 * Plan and gap are derived here, never authored: plan = commit ÷ attainment,
 * gap = plan − commit, both exact, both drawn with the board's derived tag.
 * The renderer states them per row and never adds them up. Summing them would
 * be arithmetic the source does not support, and a bridge or waterfall built
 * on them would assert a decomposition that does not hold.
 *
 * Nothing here tiles. Hierarchy is the containment rail in the label gutter —
 * a bracket spanning a parent's children — which is a claim about the taxonomy
 * rather than about arithmetic, and which never computes a residual.
 *
 * Every field except `display` and `yoy` is optional, and an absent field
 * renders as absent — never as zero and never as a placeholder. */

import { chartRoot, svgEl, group } from "../svg.js";
import { palette, toneOf, toneColor, planTone, tierMeta } from "../palette.js";
import { growthFraction, growthX, DECADE_FRACTIONS, CORE, CORE_FRACTION } from "./growth.js";
import { bulletTrack } from "./attainment.js";
import {
  countUp, scramble, strokeDraw, dashDraw, fadeIn, growFrom, stagger, wait, veil
} from "../anim.js";

/* The Y/Y stub. Its own small viewBox per cell, identical in every cell, so the
 * zero rule and the decade gridlines land on the same fraction down every
 * column and read as continuous vertical rules across the matrix without any
 * measurement pass. */
const STUB = { w: 132, h: 18, zero: 66, half: 54, cy: 9, barH: 5 };

/* The landscape plot. Wide enough that a bar and its dashed reach-to-plan are
 * both readable at a third of the band's width, and short enough that three of
 * them plus their labels fit the row height the band can afford. */
const LAND = { w: 420, h: 34, pad: 7 };

const RAIL = { w: 34, rowH: 100, x0: 8, step: 11, tick: 7 };

/* Column-major, and this is the load-bearing timing decision. The page sweep
 * hands each portlet one slot based on its horizontal centre, so a portlet this
 * wide has to build in +x or it fights the sweep it is nested inside. Every
 * beat below runs left to right at COL_STEP per column, with a soft cascade
 * down the rows inside each column. */
const COL_STEP = 200;
const ROW_STEP = 38;

const rowY = (i) => i * RAIL.rowH + RAIL.rowH / 2;

/* Percentage offset of a rate along the stub's own width, for placing a DOM
 * tick label over the SVG axis without measuring anything. */
function stubPercent(value) {
  const f = growthFraction(value);
  return (((STUB.zero + (f === null ? 0 : f) * STUB.half) / STUB.w) * 100).toFixed(3);
}

/* Derived, exactly, from two authored figures: the commit and the attainment
 * percentage stated beside it. Returns null rather than a zero when either is
 * missing, because a row with no authored attainment has no derivable plan and
 * a plan of zero would be a claim. */
function derive(cell) {
  const value = Number(cell.value);
  const pct = Number(cell.plan) / 100;
  if (!Number.isFinite(value) || !Number.isFinite(pct) || pct === 0) return null;
  const plan = value / pct;
  return { value, plan, gap: plan - value };
}

/* Formats a derived figure in the unit the authored figures are already in, so
 * a derived $120.7M sits in the same notation as an authored $105M. The shape
 * is authored in `landscape.format` rather than inferred, because guessing a
 * unit's notation from a sample of display strings is how a board ends up
 * printing "$120.69M" beside "$105M". */
function fmt(n, format = {}) {
  const decimals = format.decimals == null ? 1 : format.decimals;
  const body = Math.abs(n).toFixed(decimals).replace(/\.0+$/, "");
  return `${format.prefix || ""}${body}${format.suffix || ""}`;
}

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const allColumns = metrics.columns || [];
  const rows = metrics.rows || [];

  /* The landscape column leaves the cell grid and becomes the band's hero, so
   * its dollar figure is stated once here rather than restated in a cell two
   * columns to the right. */
  const landscape = metrics.landscape || null;
  const landIndex = landscape
    ? allColumns.findIndex((col) => col.id === landscape.column)
    : -1;
  const landColumn = landIndex >= 0 ? allColumns[landIndex] : null;
  const columns = landColumn ? allColumns.filter((col, i) => i !== landIndex) : allColumns;

  /* Grid columns: rail, labels, then either [plot, readout] or nothing, then
   * one per remaining measure. Placement is data, not styling — the renderer
   * knows where each node belongs and hands that to CSS as a custom property,
   * the same way mixBar.js hands the layout its segment widths. */
  const COL_PLOT = 3;
  const COL_READ = 4;
  const colStart = landColumn ? 5 : 3;

  const wrap = document.createElement("div");
  wrap.className = "mmx";
  if (landColumn) wrap.dataset.landscape = "true";

  const grid = document.createElement("div");
  grid.className = "mmx-grid";
  grid.style.setProperty("--mmx-rows", String(rows.length));
  grid.style.setProperty("--mmx-cols", String(columns.length));
  wrap.appendChild(grid);

  /* ---- the containment rail ----
   * One narrow SVG overlaying the label gutter and spanning every data row.
   * preserveAspectRatio is "none" because the rail has to stretch to whatever
   * height the rows resolve to, and every path carries a non-scaling stroke so
   * the hairlines stay hairlines under that non-uniform scale. The grid's
   * row-gap is zero for the same reason: with contiguous rows, rowY() lands on
   * the true row centres exactly rather than approximately. */
  const railSvg = chartRoot(RAIL.w, Math.max(1, rows.length) * RAIL.rowH, {
    class: "mmx-rail",
    preserveAspectRatio: "none"
  });
  railSvg.setAttribute("aria-hidden", "true");
  railSvg.removeAttribute("role");
  const railMarks = group();
  railSvg.appendChild(railMarks);

  const railSpines = [];
  const railTicks = [];
  rows.forEach((row, i) => {
    const children = rows.map((r, j) => (r.parent === row.id ? j : -1)).filter((j) => j >= 0);
    if (!children.length) return;
    const x = RAIL.x0 + (Number(row.level) || 0) * RAIL.step;
    const spine = svgEl("path", {
      d: `M ${x} ${rowY(i)} V ${rowY(children[children.length - 1])}`,
      stroke: p.axis,
      "stroke-width": 1,
      fill: "none",
      "vector-effect": "non-scaling-stroke",
      class: "mmx-rail-spine"
    });
    railMarks.appendChild(spine);
    railSpines.push(spine);

    [i, ...children].forEach((r) => {
      const tick = svgEl("path", {
        d: `M ${x} ${rowY(r)} H ${x + RAIL.tick}`,
        stroke: p.axis,
        "stroke-width": 1,
        fill: "none",
        "vector-effect": "non-scaling-stroke",
        class: "mmx-rail-tick"
      });
      railMarks.appendChild(tick);
      railTicks.push(tick);
    });
  });
  grid.appendChild(railSvg);

  /* ---- column headers ---- */
  const colHeads = [];
  if (landColumn) {
    colHeads.push(headEl(landscape.plotLabel || landColumn.label, COL_PLOT));
    colHeads.push(headEl(landscape.readLabel || `${landColumn.label} attainment`, COL_READ));
  }
  columns.forEach((col, c) => {
    const el = headEl(col.label, c + colStart);
    ctx.tip(
      el,
      `${col.label} — ${(col.goodDirection || "up") === "down" ? "lower is better" : "higher is better"}`
    );
    colHeads.push(el);
  });

  function headEl(label, column) {
    const el = document.createElement("p");
    el.className = "mmx-colhead";
    el.style.setProperty("--mmx-col", String(column));
    el.textContent = label;
    grid.appendChild(el);
    return el;
  }

  /* ---- rows ---- */
  const rowLabels = [];
  const rowSubs = [];
  const cellNodes = [];
  const landNodes = [];

  rows.forEach((row, r) => {
    const level = Number(row.level) || 0;

    const labelWrap = document.createElement("div");
    labelWrap.className = "mmx-rowlabel";
    labelWrap.dataset.level = String(level);
    labelWrap.dataset.rowIndex = String(r);
    labelWrap.style.setProperty("--mmx-row", String(r + 2));

    const label = document.createElement("p");
    label.className = "mmx-rowname";
    label.textContent = row.label;
    labelWrap.appendChild(label);
    rowLabels.push(label);

    if (row.sublabel) {
      const sub = document.createElement("p");
      sub.className = "mmx-rowsub";
      sub.textContent = row.sublabel;
      labelWrap.appendChild(sub);
      rowSubs.push(sub);
    }
    grid.appendChild(labelWrap);

    if (landColumn) {
      landNodes.push(buildLandscape({
        cell: (row.cells || [])[landIndex] || {}, col: landColumn, row, r
      }));
    }

    columns.forEach((col, c) => {
      const sourceIndex = allColumns.indexOf(col);
      cellNodes.push(buildCell({
        cell: (row.cells || [])[sourceIndex] || {}, col, row, r, c: c + (landColumn ? 1 : 0),
        column: c + colStart
      }));
    });
  });

  /* ---- axis strips ----
   * Rendered once under the column they are the ruler for, rather than
   * repeated in every cell. The dollar strip belongs to the landscape; the
   * growth strip to the first Y/Y column. */
  let landAxis = null;
  const landTicks = [];
  if (landColumn) {
    landAxis = document.createElement("div");
    landAxis.className = "mmx-landaxis";
    landAxis.style.setProperty("--mmx-row", String(rows.length + 2));
    (landscape.ticks || []).forEach((tick) => {
      const el = document.createElement("span");
      el.className = "mmx-landtick";
      const v = Number(tick.value);
      const domainMax = Number(landscape.domainMax) || 1;
      el.style.setProperty("--tick-x", `${landX(v, domainMax)}%`);
      if (v <= 0) el.dataset.edge = "start";
      if (v >= domainMax) el.dataset.edge = "end";
      el.textContent = tick.label ?? String(v);
      landAxis.appendChild(el);
      landTicks.push(el);
    });
    grid.appendChild(landAxis);
  }

  const axis = document.createElement("div");
  axis.className = "mmx-axis";
  axis.style.setProperty("--mmx-row", String(rows.length + 2));
  axis.style.setProperty("--mmx-col", String(colStart));

  const coreSwatch = document.createElement("span");
  coreSwatch.className = "mmx-axis-core";
  coreSwatch.style.setProperty("--core-tint", toneColor("warn"));
  coreSwatch.style.setProperty("--core-from", `${stubPercent(-CORE)}%`);
  coreSwatch.style.setProperty("--core-to", `${stubPercent(CORE)}%`);
  axis.appendChild(coreSwatch);

  /* Five labels will not sit on one line at this width at any breakpoint, so
   * the outer decade pair drops to a second line rather than colliding with
   * ±100%. The two decades also land exactly on the strip's ends, where a
   * centred label would hang off the edge, so they are marked as edges and
   * anchored inside instead. */
  const axisTicks = [-1000, -100, 0, 100, 1000].map((v) => {
    const el = document.createElement("span");
    el.className = "mmx-axis-tick";
    el.dataset.kind = v === 0 ? "zero" : Math.abs(v) >= 1000 ? "outer" : "inner";
    if (v === -1000) el.dataset.edge = "start";
    if (v === 1000) el.dataset.edge = "end";
    el.style.setProperty("--tick-x", `${stubPercent(v)}%`);
    el.textContent = v === 0 ? "0" : `${v > 0 ? "+" : "−"}${Math.abs(v)}%`;
    axis.appendChild(el);
    return el;
  });
  grid.appendChild(axis);

  /* ---- the alternate basis, named ----
   * A second stated value for the same measure is a finding about measure
   * identity, which is the argument this whole board is making, and it was
   * being carried in 8px grey inside a cell. Here it gets a strip of its own
   * at a size somebody reads, with each entry tied to the mark that carries it
   * — the diamond on the dollar axis, the ghost tick in the Y/Y stub.
   *
   * Stated, never differenced. Computing the disagreement would be
   * reconciliation, and the board's decision is to render the sources
   * faithfully and let the reader see two numbers. */
  const altEntries = [];
  rows.forEach((row, r) => {
    (row.cells || []).forEach((cell, c) => {
      if (!cell || !cell.altBasis) return;
      altEntries.push({ row, r, col: allColumns[c], cell, alt: cell.altBasis });
    });
  });

  let altStrip = null;
  const altItems = [];
  if (altEntries.length && !isDirect) {
    altStrip = document.createElement("p");
    altStrip.className = "mmx-altstrip";

    const stripLabel = document.createElement("b");
    stripLabel.className = "mmx-altstrip-label";
    stripLabel.textContent = metrics.altBasisLabel || "Second stated basis";
    altStrip.appendChild(stripLabel);

    altEntries.forEach((entry) => {
      const item = document.createElement("span");
      item.className = "mmx-altitem";

      const glyph = document.createElement("i");
      glyph.className = "mmx-altglyph";
      // Diamond where the basis also has a position on the dollar axis, ghost
      // tick where it only has one on the growth axis.
      glyph.dataset.kind = landColumn && entry.col === landColumn ? "diamond" : "tick";
      item.appendChild(glyph);

      const text = document.createElement("span");
      const name = document.createElement("b");
      name.textContent = `${entry.alt.label} ${entry.alt.display}`;
      text.append(`${entry.col ? entry.col.label : ""} `, name, ` · ${entry.alt.yoyDisplay}`);
      item.appendChild(text);

      altStrip.appendChild(item);
      altItems.push(item);
    });
    wrap.appendChild(altStrip);
  }

  /* ---- foot ---- */
  const foot = document.createElement("div");
  foot.className = "mmx-foot";

  const axisNote = document.createElement("p");
  axisNote.className = "mmx-axisnote";
  axisNote.textContent = metrics.axisNote || "";

  // The core band is the same region as toneOf()'s amber band, so the chip
  // carries the band's own tint rather than describing it in words.
  const coreChip = document.createElement("span");
  coreChip.className = "mmx-core-chip";
  coreChip.style.setProperty("--core-tint", toneColor("warn"));
  coreChip.textContent = `±${CORE}% linear core`;
  axisNote.appendChild(coreChip);
  foot.appendChild(axisNote);

  const caption = document.createElement("p");
  caption.className = "mmx-caption";
  caption.textContent = metrics.caption || "";
  foot.appendChild(caption);
  wrap.appendChild(foot);

  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  /* Every animated node, including every conditional one. The absent altBasis,
   * the absent plan, the notched overrun cap and the whole landscape branch
   * are nodes whose beat may never run, and settle() is the only thing
   * standing between them and invisibility. */
  const curtain = veil([
    railSpines, railTicks, colHeads, rowLabels, rowSubs,
    cellNodes.map((n) => n.veil),
    landNodes.map((n) => n.veil),
    landTicks, coreSwatch, axisTicks, altItems, axisNote, caption
  ]);
  curtain.hide();

  function landX(v, domainMax) {
    const inner = LAND.w - LAND.pad * 2;
    return (((LAND.pad + (v / domainMax) * inner) / LAND.w) * 100).toFixed(3);
  }

  /* ------------------------------ landscape ------------------------------- */

  /* The hero: commit as a bar, the derived plan as a target tick, and the
   * distance between them as the same dashed run every attainment card on this
   * board uses for "this length was not delivered". */
  function buildLandscape({ cell, col, row, r }) {
    const d = derive(cell);
    const good = col.goodDirection || "up";
    const yoy = Number(cell.yoy);
    const domainMax = Number(landscape.domainMax) || 1;
    const format = landscape.format || {};
    const over = d ? d.gap < 0 : false;
    const tone = toneColor(planTone(Number(cell.plan), cell.planGoodDirection || "up"));

    const plotCell = document.createElement("div");
    plotCell.className = "mmx-plot";
    plotCell.dataset.rowIndex = String(r);
    plotCell.style.setProperty("--mmx-row", String(r + 2));
    plotCell.style.setProperty("--mmx-col", String(COL_PLOT));

    /* Direct mode drops the plan bar and the tick entirely rather than drawing
     * them against a candidate spread. The commit is one of three defensible
     * numbers there, so the gap to plan would be three different gaps, and a
     * single hatched region would be picking one of them silently. What
     * survives is the bar, because a length is arithmetic. */
    let bullet = null;
    if (d && !isDirect) {
      bullet = bulletTrack({
        plan: Number(cell.plan),
        good: cell.planGoodDirection || "up",
        isDirect,
        width: LAND.w,
        height: LAND.h,
        pad: LAND.pad,
        // A dollar axis has no sentiment regions to band: 40% of the way along
        // a $125M scale is not "risk", it is $50M.
        withBands: false,
        withArrow: false,
        // The shortfall is the reading on this band, so it is drawn at the
        // bar's own weight rather than as a hairline under it.
        gapWeight: Math.max(4, LAND.h * 0.36),
        domainMax,
        target: d.plan,
        value: d.value,
        label: `${row.label} ${col.label} ${cell.display} against a derived plan of ${fmt(d.plan, format)}`
      });
      bullet.svg.classList.add("mmx-landbullet");
      // The bar carries the motion's own colour rather than a sentiment tone.
      // Which motion this is stays a categorical fact; how it is doing against
      // plan is already carried by the tick, the dashed run and the readout.
      if (bullet.bar && row.color) bullet.bar.setAttribute("stroke", row.color);
      plotCell.appendChild(bullet.svg);
    } else {
      const voidTrack = chartRoot(LAND.w, LAND.h, { class: "mmx-landbullet is-void" });
      voidTrack.setAttribute("aria-hidden", "true");
      voidTrack.removeAttribute("role");
      const marks = group();
      voidTrack.appendChild(marks);
      marks.appendChild(svgEl("path", {
        d: `M ${LAND.pad} ${LAND.h / 2} H ${LAND.w - LAND.pad}`,
        stroke: p.track,
        "stroke-width": Math.max(6, LAND.h * 0.5),
        "stroke-dasharray": "4 7",
        "stroke-linecap": "butt",
        class: "mmx-landvoid"
      }));
      plotCell.appendChild(voidTrack);
    }

    /* The plan tick's own label, in the DOM over the SVG, positioned off the
     * same scale the tick was placed with. It flips to the left of the tick
     * past the midpoint so it never runs off the column's right edge. */
    let tickLabel = null;
    if (d && !isDirect) {
      tickLabel = document.createElement("span");
      tickLabel.className = "mmx-landticklab";
      const tx = Number(landX(d.plan, domainMax));
      tickLabel.style.setProperty("--tick-x", `${tx}%`);
      tickLabel.dataset.flip = String(tx > 62);
      tickLabel.append(`${landscape.targetWord || "plan"} ${fmt(d.plan, format)}`);
      const derivedTag = document.createElement("em");
      derivedTag.textContent = "derived";
      tickLabel.appendChild(derivedTag);
      plotCell.appendChild(tickLabel);
    }

    /* The alternate basis, on the dollar axis this time rather than only on
     * the growth one: a hollow diamond where the second stated basis sits. */
    let altMark = null;
    const alt = cell.altBasis;
    if (alt && Number.isFinite(Number(alt.value)) && !isDirect) {
      altMark = document.createElement("span");
      altMark.className = "mmx-landalt";
      altMark.style.setProperty("--alt-x", `${landX(Number(alt.value), domainMax)}%`);
      ctx.tip(altMark, `${alt.label}: ${alt.display}, ${alt.yoyDisplay} — a second stated basis for the same measure, on the same scale`);
      plotCell.appendChild(altMark);
    }

    grid.appendChild(plotCell);

    /* The readout. One column carrying what the bar cannot say in position
     * alone: the figure, its Y/Y, the authored attainment, and the derived
     * gap, tagged as derived where it is. */
    const readCell = document.createElement("div");
    readCell.className = "mmx-read";
    readCell.dataset.rowIndex = String(r);
    readCell.style.setProperty("--mmx-row", String(r + 2));
    readCell.style.setProperty("--mmx-col", String(COL_READ));

    const valueLine = document.createElement("p");
    valueLine.className = "mmx-readvalue";
    const valueEl = document.createElement("span");
    valueEl.className = "mmx-readnum";
    if (isDirect) valueEl.dataset.contested = "true";
    valueLine.appendChild(valueEl);

    const yoyChip = document.createElement("span");
    yoyChip.className = "mmx-readyoy";
    yoyChip.style.setProperty("--delta-tint", toneColor(toneOf(yoy, good)));
    yoyChip.textContent = cell.yoyDisplay || "";
    valueLine.appendChild(yoyChip);
    readCell.appendChild(valueLine);

    const planLine = document.createElement("p");
    planLine.className = "mmx-readplan";
    planLine.style.setProperty("--plan-tint", tone);
    planLine.textContent = isDirect ? "no plan basis" : (cell.planDisplay || "");
    if (isDirect) planLine.dataset.void = "true";
    readCell.appendChild(planLine);

    let gapLine = null;
    if (d && !isDirect) {
      gapLine = document.createElement("p");
      gapLine.className = "mmx-readgap";
      gapLine.style.setProperty("--gap-tint", over ? toneColor("positive") : tone);
      gapLine.append(`${over ? "+" : "−"}${fmt(Math.abs(d.gap), format)} ${over ? (landscape.overWord || "over") : (landscape.gapWord || "gap")}`);
      const derivedTag = document.createElement("em");
      derivedTag.textContent = "derived";
      gapLine.appendChild(derivedTag);
      readCell.appendChild(gapLine);
    }

    grid.appendChild(readCell);

    ctx.tip(plotCell, isDirect
      ? "No plan basis: nothing a direct read can reach states which FinPlan version this quarter is graded against, so there is no target, and the gap to it cannot be derived from a commit that is itself one of three candidates."
      : `${row.label} ${cell.display} · plan ${fmt(d.plan, format)} derived from the authored ${cell.plan}% · ${over ? "over by" : "short by"} ${fmt(Math.abs(d.gap), format)}`);

    return {
      r,
      valueEl,
      display: cell.display || "",
      bullet,
      tickLabel,
      altMark,
      yoyChip,
      planLine,
      gapLine,
      veil: [
        bullet ? bullet.svg : null, bullet ? bullet.all : null,
        tickLabel, altMark, valueEl, yoyChip, planLine, gapLine
      ]
    };
  }

  /* -------------------------------- cells --------------------------------- */

  function buildCell({ cell, col, row, r, c, column }) {
    const good = col.goodDirection || "up";
    const yoy = Number(cell.yoy);
    const tint = toneColor(toneOf(yoy, good));

    const el = document.createElement("div");
    el.className = "mmx-cell";
    el.dataset.rowIndex = String(r);
    el.dataset.col = col.id;
    el.style.setProperty("--mmx-row", String(r + 2));
    el.style.setProperty("--mmx-col", String(column));

    /* Rank 1 — the value. No graphical encoding: dollars of attrition and
     * dollars of NNAOV are two measures at two magnitudes, and any scale
     * shared across them would assert something false. */
    const valueEl = document.createElement("div");
    valueEl.className = "mmx-value";
    if (isDirect) valueEl.dataset.contested = "true";
    el.appendChild(valueEl);

    /* Rank 2 — Y/Y, as a stub on the shared growth axis and a tinted chip. */
    const stubRow = document.createElement("div");
    stubRow.className = "mmx-stub-row";

    const stubSvg = chartRoot(STUB.w, STUB.h, {
      label: `${row.label} ${col.label} — ${cell.yoyDisplay || "no year-on-year movement authored"}`,
      class: "mmx-stub"
    });
    const stubMarks = group();
    stubSvg.appendChild(stubMarks);

    // The core band and the decade rules are drawn rather than assumed: a
    // symlog axis without visible decade marks is a lie by omission. Both
    // carry their translucency in a paint attribute, so the build can fade
    // them to element opacity 1 and settle() restores the authored value.
    const coreBand = svgEl("rect", {
      x: STUB.zero - CORE_FRACTION * STUB.half,
      y: 2.5,
      width: CORE_FRACTION * STUB.half * 2,
      height: STUB.h - 5,
      fill: toneColor("warn"),
      "fill-opacity": 0.06,
      class: "mmx-core"
    });
    stubMarks.appendChild(coreBand);

    const decadeLines = DECADE_FRACTIONS.flatMap((f) => [-f, f]).map((f) => {
      const node = svgEl("path", {
        d: `M ${STUB.zero + f * STUB.half} 3 V ${STUB.h - 3}`,
        stroke: p.ink,
        "stroke-opacity": 0.13,
        "stroke-width": 0.6,
        "stroke-dasharray": "1.6 2.2",
        fill: "none",
        class: "mmx-decade"
      });
      stubMarks.appendChild(node);
      return node;
    });

    const stubZero = svgEl("path", {
      d: `M ${STUB.zero} 2 V ${STUB.h - 2}`,
      stroke: p.axis,
      "stroke-width": 0.9,
      fill: "none",
      class: "mmx-stub-zero"
    });
    stubMarks.appendChild(stubZero);

    const stubEnd = growthX(yoy, STUB.zero, STUB.half);
    const negative = Number.isFinite(yoy) && yoy < 0;
    // Floored, because growFrom scales a rect that is already at its final
    // width and a zero-width rect scales to nothing on every frame including
    // the last one.
    const stubSpan = Math.max(0.9, Math.abs((stubEnd === null ? STUB.zero : stubEnd) - STUB.zero));
    const stubBar = svgEl("rect", {
      x: negative ? STUB.zero - stubSpan : STUB.zero,
      y: STUB.cy - STUB.barH / 2,
      width: stubSpan,
      height: STUB.barH,
      rx: 1.5,
      fill: tint,
      "fill-opacity": 0.9,
      class: "mmx-stub-bar"
    });
    stubMarks.appendChild(stubBar);

    /* The alternate basis: a second stated basis for the same measure, drawn
     * in the run-rate-ghost vocabulary trendPanel.js already uses — a dashed
     * hollow tick on the same axis, in p.ghost. No badge, no tone and no
     * comparison arrow; the two readings sit on one axis, and the strip at the
     * foot of the band names them. */
    const alt = cell.altBasis;
    const altX = alt ? growthX(Number(alt.yoy), STUB.zero, STUB.half) : null;
    let ghostTick = null;
    if (alt && altX !== null && !isDirect) {
      ghostTick = svgEl("path", {
        d: `M ${altX} 3.5 V ${STUB.h - 3.5}`,
        stroke: p.ghost,
        "stroke-width": 1.6,
        "stroke-dasharray": "2 2",
        fill: "none",
        class: "mmx-ghost-tick"
      });
      stubMarks.appendChild(ghostTick);
    }

    stubRow.appendChild(stubSvg);

    const chip = document.createElement("span");
    chip.className = "mmx-chip";
    chip.style.setProperty("--delta-tint", tint);
    chip.textContent = cell.yoyDisplay || "";
    stubRow.appendChild(chip);
    el.appendChild(stubRow);

    ctx.tip(stubSvg, [
      `${row.label} · ${col.label} ${cell.display || ""} ${cell.yoyDisplay || ""}`.trim(),
      alt ? `${alt.label}: ${alt.display}, ${alt.yoyDisplay} — a second stated basis for the same measure, on the same axis` : null,
      isDirect
        ? "Length is arithmetic and survives; which direction is good does not"
        : `${good === "down" ? "Lower is better" : "Higher is better"} (certified)`
    ].filter(Boolean).join(" · "));

    grid.appendChild(el);

    return {
      r,
      c,
      valueEl,
      display: cell.display || "",
      stubZero,
      coreBand,
      decadeLines,
      stubBar,
      negative,
      chip,
      ghostTick,
      veil: [
        valueEl, stubSvg, stubZero, coreBand, decadeLines, stubBar, ghostTick, chip
      ]
    };
  }

  /* -------------------------------- detail -------------------------------- */

  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    const table = document.createElement("table");
    table.className = "trend-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    headRow.appendChild(cellEl("th", "", "trend-table-rowlabel"));
    allColumns.forEach((col) => headRow.appendChild(cellEl("th", col.label)));
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const line = (label, pick) => {
      const anywhere = rows.some((row) =>
        allColumns.some((col, c) => pick((row.cells || [])[c]) != null));
      if (!anywhere) return;
      rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.appendChild(cellEl("th", `${row.label} · ${label}`, "trend-table-rowlabel"));
        allColumns.forEach((col, c) => {
          const value = pick((row.cells || [])[c]);
          tr.appendChild(cellEl("td", value == null || value === "" ? "—" : value));
        });
        tbody.appendChild(tr);
      });
    };

    const format = landscape ? landscape.format || {} : {};
    line(metrics.unit || "value", (cell) => (cell ? cell.display : null));
    line("Y/Y", (cell) => (cell ? cell.yoyDisplay : null));
    line("Plan attainment", (cell) => (cell && cell.planDisplay ? cell.planDisplay : null));
    // Derived, and named as derived in the table too — this is the one surface
    // where the arithmetic itself is worth stating.
    line("Plan (derived)", (cell) => {
      const d = cell ? derive(cell) : null;
      return d ? `${fmt(d.plan, format)} = ${cell.display} ÷ ${cell.plan}%` : null;
    });
    line("Gap to plan (derived)", (cell) => {
      const d = cell ? derive(cell) : null;
      if (!d) return null;
      return `${d.gap < 0 ? "+" : "−"}${fmt(Math.abs(d.gap), format)}`;
    });
    line("Alternate basis", (cell) =>
      cell && cell.altBasis
        ? `${cell.altBasis.label}: ${cell.altBasis.display}, ${cell.altBasis.yoyDisplay}`
        : null);
    table.appendChild(tbody);
    detail.appendChild(table);

    const note = document.createElement("p");
    note.className = "trend-table-note";
    note.textContent = `Y/Y is drawn on the board's shared growth axis — linear inside ±${CORE}%, logarithmic beyond it, with a rule at every decade.${
      landscape
        ? " Plan and gap are derived from the authored commit and the authored attainment percentage, exactly, and are stated per row: the three derived plans do not sum to the roll-up's own and are never added."
        : ""
    }`;
    detail.appendChild(note);

    return detail;
  }

  function cellEl(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value ?? "";
    if (className) node.className = className;
    return node;
  }

  /* --------------------------------- build -------------------------------- */

  async function build(signal) {
    const candidates = isDirect ? (ctx.portlet.directMode || {}).candidates : null;
    const contested = Boolean(candidates && candidates.length > 1);

    /* 1 — the tree, then the names it brackets. */
    railSpines.forEach((node) => strokeDraw(node, { duration: 240, signal }));
    stagger(railTicks, { step: 46, duration: 240, y: 0, signal });
    stagger([...rowLabels, ...rowSubs], { step: 50, duration: 320, y: 3, signal });
    stagger(colHeads, { step: 70, duration: 320, y: 3, signal });

    /* 2 — the landscape's rulers, then its bars. This is the hero, so it goes
     * first and it goes at length: the track, the bar growing left to right,
     * the ink tick dropping in, then exactly one of the two reach-to-plan
     * marks. Embedded's bar visibly crosses its tick and steps up; that is the
     * moment on this tab. */
    await wait(240, signal);
    landNodes.forEach((n) => {
      const delay = n.r * ROW_STEP;
      const b = n.bullet;
      if (!b) return;
      stagger([b.track, ...b.bands, ...b.rules], {
        delay, step: 40, maxTotal: 200, duration: 280, y: 0, signal
      });
      if (b.bar) strokeDraw(b.bar, { delay: delay + 180, duration: 620, signal });
      if (b.tick) strokeDraw(b.tick, { delay: delay + 640, duration: 280, signal });
      // dashDraw, never strokeDraw: these dashes mean "this length was not
      // delivered", and strokeDraw would consume the dash pattern as its own
      // reveal mechanism.
      if (b.gap) dashDraw(b.gap, { delay: delay + 780, duration: 420, signal });
      if (b.overrun) {
        const notched = b.overrun.classList.contains("is-notched");
        if (notched) fadeIn(b.overrun, { delay: delay + 760, duration: 380, y: 0, x: -4, signal });
        else strokeDraw(b.overrun, { delay: delay + 780, duration: 360, signal });
      }
    });

    /* 3 — the readout beside it. The numeral is the answer to "what is Q3
     * tracking to", so it arrives before anything that qualifies it, and the
     * derived gap arrives last because it is a conclusion. */
    await wait(200, signal);
    landNodes.forEach((n) => {
      const delay = n.r * ROW_STEP;
      fadeIn(n.valueEl, { delay, duration: 420, y: 8, signal });
      if (contested) scramble(n.valueEl, candidates, n.display, { delay: delay + 120, signal });
      else countUp(n.valueEl, n.display, { delay: delay + 120, duration: 900, signal });
      fadeIn(n.yoyChip, { delay: delay + 340, duration: 320, y: 0, x: -6, signal });
      fadeIn(n.planLine, { delay: delay + 420, duration: 320, y: 3, signal });
      if (n.gapLine) fadeIn(n.gapLine, { delay: delay + 520, duration: 340, y: 3, signal });
      if (n.tickLabel) fadeIn(n.tickLabel, { delay: delay + 700, duration: 320, y: 0, signal });
    });
    stagger(landTicks, { delay: 260, step: 50, duration: 300, y: 3, signal });

    /* 4 — the remaining measures, column by column, to the right of the hero
     * and after it, so the band reads in the order the sweep travels. */
    await wait(420, signal);
    cellNodes.forEach((n) => {
      const delay = n.c * COL_STEP + n.r * ROW_STEP;
      fadeIn(n.valueEl, { delay, duration: 420, y: 8, signal });
      if (contested) scramble(n.valueEl, candidates, n.display, { delay: delay + 120, signal });
      else countUp(n.valueEl, n.display, { delay: delay + 120, duration: 900, signal });
    });

    /* 5 — Y/Y. The ruler before the measurement, then the bar growing outward
     * from zero in its own direction, so the sign is legible before the hue is
     * read. */
    await wait(300, signal);
    cellNodes.forEach((n) => {
      const delay = n.c * COL_STEP + n.r * ROW_STEP;
      strokeDraw(n.stubZero, { delay, duration: 260, signal });
      fadeIn(n.coreBand, { delay: delay + 60, duration: 300, y: 0, signal });
      stagger(n.decadeLines, { delay: delay + 80, step: 40, duration: 280, y: 0, signal });
      growFrom(n.stubBar, {
        axis: "x",
        origin: n.negative ? "right center" : "left center",
        delay: delay + 160,
        duration: 460,
        signal
      });
      fadeIn(n.chip, { delay: delay + 320, duration: 320, y: 0, x: n.negative ? 6 : -6, signal });
    });

    /* 6 — the alternate basis, after every primary reading, so the second
     * stated value reads as a second reading of the same axis rather than as a
     * competing first one. Both of its marks and the strip that names them
     * arrive together. */
    await wait(520, signal);
    cellNodes.forEach((n) => {
      if (!n.ghostTick) return;
      dashDraw(n.ghostTick, { delay: n.c * COL_STEP + n.r * ROW_STEP, duration: 340, signal });
    });
    landNodes.forEach((n) => {
      if (n.altMark) fadeIn(n.altMark, { delay: n.r * ROW_STEP, duration: 340, y: 0, scaleFrom: 0.4, signal });
    });
    stagger(altItems, { delay: 160, step: 90, duration: 360, y: 4, signal });

    await wait(320, signal);
    fadeIn(coreSwatch, { duration: 320, y: 0, signal });
    stagger(axisTicks, { step: 60, duration: 320, y: 3, signal });
    fadeIn(axisNote, { delay: 140, duration: 400, y: 5, signal });
    fadeIn(caption, { delay: 220, duration: 420, y: 5, signal });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
