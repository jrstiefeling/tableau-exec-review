/* Q3 outlook as a 3 x 3 matrix of composed metric cells.
 *
 * The cells on this tab are not one number each. An ACV cell carries up to six
 * facts — the figure, its Y/Y, a second stated basis for the same measure, the
 * FinPlan attainment, and two paired comparisons — so the cell needs a grammar
 * that can rank facts rather than a chart type. Five ranks, each subordinate to
 * the one above it by size and by kind of channel, so the ordering survives a
 * squint: the numeral, the Y/Y stub, the attainment bullet, the dumbbells, the
 * week-over-week note.
 *
 * Nothing on the matrix tiles. Hierarchy is the containment rail in the label
 * gutter — a bracket spanning a parent's children — which is a claim about the
 * taxonomy rather than about arithmetic, and which never computes a residual.
 * The rows carry no total to divide by and the renderer never sums a column,
 * because the only thing tiling would add here is a residual nobody asked for.
 *
 * Three encodings are borrowed rather than invented. Y/Y is `growthFraction`,
 * the same symlog scale the product and segment tabs use, so +32% here is the
 * same proportion of its axis as +32% there. Attainment is `bulletTrack` from
 * attainment.js — the same 0-110 domain, the same `planBands`, the same ink
 * target tick and the same reach-to-plan contract as the exec hero cards, just
 * smaller. And the alternate basis is drawn in trendPanel.js's run-rate-ghost
 * vocabulary: a dashed hollow tick in `p.ghost` on the same axis as the primary
 * reading. A second copy of any of the three would be a second grammar for the
 * reader to learn and a second place for the rules to drift.
 *
 * Every field except `display` and `yoy` is optional, and an absent field
 * renders as absent — never as zero and never as a placeholder. The Attrition
 * and NNAOV cells are visibly lighter than the ACV column because fewer facts
 * are known about them, and that is information. */

import { chartRoot, svgEl, group, linearScale } from "../svg.js";
import { palette, toneOf, toneColor, tierMeta } from "../palette.js";
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

const BULLET = { w: 148, h: 22, pad: 6 };

/* The dumbbell axis. 16 and 132 leave room at both ends for a 3.8-unit dot, so
 * a reading at either extreme of its domain still draws a whole dot inside the
 * box rather than a clipped half-moon. */
const PAIR = { w: 148, h: 14, x0: 16, x1: 132, cy: 7 };

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

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const columns = metrics.columns || [];
  const rows = metrics.rows || [];

  const wrap = document.createElement("div");
  wrap.className = "mmx";

  const grid = document.createElement("div");
  grid.className = "mmx-grid";
  grid.style.setProperty("--mmx-rows", String(rows.length));
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
  // Grid placement is data, not styling: the renderer knows which row and
  // column each node belongs to and hands that to CSS as a custom property,
  // the same way mixBar.js hands the layout its segment widths.
  const colHeads = columns.map((col, c) => {
    const el = document.createElement("p");
    el.className = "mmx-colhead";
    el.style.setProperty("--mmx-col", String(c + 3));
    el.textContent = col.label;
    ctx.tip(
      el,
      `${col.label} — ${(col.goodDirection || "up") === "down" ? "lower is better" : "higher is better"}`
    );
    grid.appendChild(el);
    return el;
  });

  /* ---- rows ---- */
  const rowLabels = [];
  const rowSubs = [];
  const cellNodes = [];

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

    columns.forEach((col, c) => {
      cellNodes.push(buildCell({ cell: (row.cells || [])[c] || {}, col, row, r, c }));
    });
  });

  /* ---- axis strip ----
   * Rendered once, under the leftmost data column, rather than repeated in
   * nine cells. The gridlines are the legend; this names them. */
  const axis = document.createElement("div");
  axis.className = "mmx-axis";
  axis.style.setProperty("--mmx-row", String(rows.length + 2));

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
    /* Three kinds, not two. Zero is separated out from the ±100% pair because
     * the laptop tier drops the pair and keeps zero: the strip is 90px wide
     * there, which is not enough for five labels on two lines — they were
     * overrunning the strip's own 22px and printing over the footnote below
     * it. Zero is the one label that cannot be inferred from the note, since
     * the note names the rule and the decades but not where the origin is. */
    el.dataset.kind = v === 0 ? "zero" : Math.abs(v) >= 1000 ? "outer" : "inner";
    if (v === -1000) el.dataset.edge = "start";
    if (v === 1000) el.dataset.edge = "end";
    el.style.setProperty("--tick-x", `${stubPercent(v)}%`);
    el.textContent = v === 0 ? "0" : `${v > 0 ? "+" : "−"}${Math.abs(v)}%`;
    axis.appendChild(el);
    return el;
  });
  grid.appendChild(axis);

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

  /* Every animated node, including every conditional one. The flat-dumbbell
   * branch, the absent altBasis, the absent pairs, the absent plan and the
   * notched overrun cap are all nodes whose beat may never run, and settle()
   * is the only thing standing between them and invisibility. */
  const curtain = veil([
    railSpines, railTicks, colHeads, rowLabels, rowSubs,
    cellNodes.map((n) => n.veil),
    coreSwatch, axisTicks, axisNote, caption
  ]);
  curtain.hide();

  /* -------------------------------- cells --------------------------------- */

  function buildCell({ cell, col, row, r, c }) {
    const good = col.goodDirection || "up";
    const yoy = Number(cell.yoy);
    const tint = isDirect ? p.inkSoft : toneColor(toneOf(yoy, good));

    const el = document.createElement("div");
    el.className = "mmx-cell";
    el.dataset.rowIndex = String(r);
    el.dataset.col = col.id;
    el.style.setProperty("--mmx-row", String(r + 2));
    el.style.setProperty("--mmx-col", String(c + 3));

    /* Rank 1 — the value. No graphical encoding: dollars of ACV, dollars of
     * attrition and dollars of NNAOV are three measures at three magnitudes,
     * and any scale shared across them would assert something false. */
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
     * comparison arrow; the two readings sit on one axis. */
    const alt = cell.altBasis;
    const altX = alt ? growthX(Number(alt.yoy), STUB.zero, STUB.half) : null;
    let ghostTick = null;
    let altEl = null;
    if (alt && altX !== null) {
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

    if (alt) {
      altEl = document.createElement("p");
      altEl.className = "mmx-alt";
      altEl.textContent = `${alt.label}: ${alt.display} · ${alt.yoyDisplay}`;
      el.appendChild(altEl);
    }

    /* Rank 3 — FinPlan attainment, on the exec board's own bullet grammar.
     * Red and grey have no defensible plan basis, so bulletTrack's own void
     * branch draws a dashed empty track and a tier-tinted X: what went is the
     * denominator, not the reading. */
    let bullet = null;
    let planLabel = null;
    if (cell.plan != null) {
      bullet = bulletTrack({
        plan: cell.plan,
        good: cell.planGoodDirection || "up",
        isDirect,
        voidTint: isDirect && (tier === "red" || tier === "grey") ? meta.color : null,
        width: BULLET.w,
        height: BULLET.h,
        pad: BULLET.pad,
        label: `${row.label} ${col.label} — ${cell.planDisplay || ""}`,
        // The arrow anchors at x(100), which on a 148-unit track sits 18 units
        // from the right edge — shorter than the arrow itself, so it would run
        // outside the viewBox. The tick and the bands carry the polarity here,
        // and all three authored cells are up-polarity in any case.
        withArrow: false
      });
      bullet.svg.classList.add("mmx-bullet");

      const planRow = document.createElement("div");
      planRow.className = "mmx-plan-row";
      planRow.appendChild(bullet.svg);

      planLabel = document.createElement("span");
      planLabel.className = "mmx-plan-label";
      planLabel.textContent = isDirect ? "no plan basis" : cell.planDisplay || "";
      if (isDirect) planLabel.dataset.void = "true";
      planRow.appendChild(planLabel);
      el.appendChild(planRow);

      ctx.tip(
        bullet.svg,
        isDirect
          ? "No plan basis: nothing a direct read can reach states which FinPlan version this quarter is graded against, so there is no target and no bands."
          : `${cell.planDisplay} · target 100% · higher is better (certified)`
      );
    }

    /* Rank 4 — the paired comparisons, as dumbbells. A parenthetical asks the
     * reader to do the subtraction; a dumbbell shows them the gap and its
     * direction. */
    const pairNodes = (cell.pairs || []).map((pair) => buildPair(pair, row));
    if (pairNodes.length) {
      const pairs = document.createElement("div");
      pairs.className = "mmx-pairs";
      pairNodes.forEach((n) => pairs.appendChild(n.row));
      el.appendChild(pairs);
    }

    /* Rank 5 — the authored week-over-week note, on the two cells that carry
     * one. Its rarity is informative, so the seven cells without one get
     * nothing rather than a placeholder. */
    let noteEl = null;
    if (cell.note) {
      noteEl = document.createElement("p");
      noteEl.className = "mmx-note";
      noteEl.textContent = cell.note;
      el.appendChild(noteEl);
    }

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
      altEl,
      bullet,
      planLabel,
      pairs: pairNodes,
      noteEl,
      veil: [
        valueEl, stubSvg, stubZero, coreBand, decadeLines, stubBar, ghostTick, chip,
        altEl, bullet ? bullet.svg : null, bullet ? bullet.all : null, planLabel,
        pairNodes.map((n) => n.veil), noteEl
      ]
    };
  }

  /* A paired comparison: hollow dot for the benchmark, filled dot for the
   * reading, stem tinted by the direction of the change. */
  function buildPair(pair, row) {
    const px = linearScale([0, Number(pair.domainMax) || 1], [PAIR.x0, PAIR.x1]);
    const good = pair.goodDirection || "up";
    const dh = px(Number(pair.hist));
    const dc = px(Number(pair.value));
    const better = good === "down" ? dc < dh : dc > dh;

    // Without the semantic layer there is nothing for the hollow dot to be:
    // `hist` is a governed same-day-of-quarter reading against the prior
    // period, not the prior period's closing number, and nothing in a direct
    // read states which day it was taken on. So the benchmark falls back to
    // the axis origin and the link between the two dots is cut.
    const severed = isDirect;
    const histX = severed ? PAIR.x0 : dh;

    // Flat is a statement about a benchmark, so it is only knowable while the
    // benchmark is: severed, the row is neither flat nor not-flat.
    const flat = !severed && Number(pair.hist) === Number(pair.value);

    const rowEl = document.createElement("div");
    rowEl.className = "mmx-pair";
    if (flat) rowEl.dataset.flat = "true";
    if (severed) rowEl.dataset.severed = "true";

    const label = document.createElement("span");
    label.className = "mmx-pair-label";
    label.textContent = `${pair.label} ${pair.valueDisplay || ""}`.trim();
    rowEl.appendChild(label);

    const svg = chartRoot(PAIR.w, PAIR.h, {
      label: severed
        ? `${row.label} ${pair.label} ${pair.valueDisplay} — no benchmark without the semantic layer`
        : `${row.label} ${pair.label} ${pair.valueDisplay} against ${pair.histDisplay}`,
      class: "mmx-pair-svg"
    });
    const marks = group();
    svg.appendChild(marks);

    /* Equal is a real finding on a benchmark comparison, so flat is a case and
     * not a failure: a filled core inside the hollow ring it coincides with,
     * no stem, and a label that reads "flat on history". */
    let stem = null;
    if (!flat && !severed) {
      stem = svgEl("path", {
        d: `M ${Math.min(dh, dc)} ${PAIR.cy} H ${Math.max(dh, dc)}`,
        stroke: toneColor(better ? "positive" : "risk"),
        "stroke-width": 2,
        "stroke-linecap": "round",
        fill: "none",
        class: "mmx-pair-stem"
      });
      marks.appendChild(stem);
    }

    // Hollow, because it is the benchmark and not the reading. Severed, it
    // keeps the ring and loses the position, so the shape still says
    // "benchmark" while sitting where no benchmark was read.
    const histDot = svgEl("circle", {
      cx: histX,
      cy: PAIR.cy,
      r: 3.4,
      fill: p.surface,
      stroke: severed ? meta.color : p.inkDim,
      "stroke-width": 1.5,
      "stroke-dasharray": severed ? "2 2" : null,
      class: "mmx-pair-hist"
    });
    marks.appendChild(histDot);

    // The severed-link X, the same vocabulary the broken lineage arrow and the
    // void bullet use: both ends exist and the thing that joined them does not.
    let severMark = null;
    if (severed) {
      severMark = group({ class: "mmx-pair-sever" });
      const cx = (histX + dc) / 2;
      const rr = 2.8;
      [[-1, -1], [-1, 1]].forEach(([sx, sy]) => severMark.appendChild(svgEl("path", {
        d: `M ${cx + sx * rr} ${PAIR.cy + sy * rr} L ${cx - sx * rr} ${PAIR.cy - sy * rr}`,
        stroke: meta.color,
        "stroke-width": 1.4,
        "stroke-linecap": "round"
      })));
      marks.appendChild(severMark);
    }

    const nowDot = svgEl("circle", {
      cx: dc,
      cy: PAIR.cy,
      r: flat ? 1.9 : 3.8,
      fill: severed || flat ? p.inkSoft : toneColor(better ? "positive" : "risk"),
      class: "mmx-pair-now"
    });
    marks.appendChild(nowDot);

    const hist = document.createElement("span");
    hist.className = "mmx-pair-hist-label";
    hist.textContent = severed
      ? "no benchmark"
      : (flat ? "flat on history" : pair.histDisplay || "");

    rowEl.appendChild(svg);
    rowEl.appendChild(hist);

    ctx.tip(
      svg,
      severed
        ? `${pair.label} ${pair.valueDisplay} — the benchmark is a governed same-day-of-quarter reading against the prior period, and a direct read cannot say which day it was taken on.`
        : `${pair.label} ${pair.valueDisplay} against ${pair.histDisplay}${flat ? " — equal" : ""}`
    );

    return {
      row: rowEl,
      flat,
      severed,
      stem,
      histDot,
      nowDot,
      veil: [svg, stem, histDot, severMark, nowDot, label, hist]
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
    columns.forEach((col) => headRow.appendChild(cellEl("th", col.label)));
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const line = (label, pick) => {
      const anywhere = rows.some((row) =>
        columns.some((col, c) => pick((row.cells || [])[c]) != null));
      if (!anywhere) return;
      rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.appendChild(cellEl("th", `${row.label} · ${label}`, "trend-table-rowlabel"));
        columns.forEach((col, c) => {
          const value = pick((row.cells || [])[c]);
          tr.appendChild(cellEl("td", value == null || value === "" ? "—" : value));
        });
        tbody.appendChild(tr);
      });
    };

    line(metrics.unit || "value", (cell) => (cell ? cell.display : null));
    line("Y/Y", (cell) => (cell ? cell.yoyDisplay : null));
    line("Plan", (cell) => (cell && cell.planDisplay ? cell.planDisplay : null));
    line("Alternate basis", (cell) =>
      cell && cell.altBasis
        ? `${cell.altBasis.label}: ${cell.altBasis.display}, ${cell.altBasis.yoyDisplay}`
        : null);
    line("Velocity and coverage", (cell) =>
      cell && (cell.pairs || []).length
        ? cell.pairs.map((pr) => `${pr.label} ${pr.valueDisplay} vs ${pr.histDisplay}`).join(" · ")
        : null);
    line("Week over week", (cell) => (cell && cell.note ? cell.note : null));
    table.appendChild(tbody);
    detail.appendChild(table);

    const note = document.createElement("p");
    note.className = "trend-table-note";
    note.textContent = `Y/Y is drawn on the board's shared growth axis — linear inside ±${CORE}%, logarithmic beyond it, with a rule at every decade. Attainment is drawn on the same 0-110% plan domain as the exec hero cards, so the two boards' plan ticks mean the same thing.`;
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

    /* 2 — the values, column by column. The numeral is the answer to "what is
     * Q3 tracking to", so it arrives before anything that qualifies it. */
    await wait(260, signal);
    cellNodes.forEach((n) => {
      const delay = n.c * COL_STEP + n.r * ROW_STEP;
      fadeIn(n.valueEl, { delay, duration: 420, y: 8, signal });
      if (contested) scramble(n.valueEl, candidates, n.display, { delay: delay + 120, signal });
      else countUp(n.valueEl, n.display, { delay: delay + 120, duration: 900, signal });
    });

    /* 3 — Y/Y. The ruler before the measurement, then the bar growing outward
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

    /* 4 — the alternate basis, after the primary tick, so the ghost reads as a
     * second reading of the same axis rather than a competing first one. */
    await wait(520, signal);
    cellNodes.forEach((n) => {
      if (!n.ghostTick) return;
      const delay = n.c * COL_STEP + n.r * ROW_STEP;
      dashDraw(n.ghostTick, { delay, duration: 340, signal });
      if (n.altEl) fadeIn(n.altEl, { delay: delay + 120, duration: 340, y: 3, signal });
    });

    /* 5 — the FinPlan bullet. The track and its bands first (the ruler), then
     * the target tick top-to-bottom, then the bar left-to-right, then exactly
     * one of the reach-to-plan marks. The 128% cell visibly crosses its tick
     * and steps up; that is the moment on this tab. */
    await wait(240, signal);
    cellNodes.forEach((n) => {
      if (!n.bullet) return;
      const b = n.bullet;
      const delay = n.c * COL_STEP + n.r * ROW_STEP;
      stagger([b.track, ...b.bands, ...b.rules], {
        delay, step: 40, maxTotal: 220, duration: 280, y: 0, signal
      });
      if (b.tick) strokeDraw(b.tick, { delay: delay + 180, duration: 260, signal });
      if (b.bar) strokeDraw(b.bar, { delay: delay + 300, duration: 420, signal });
      // dashDraw, never strokeDraw: these dashes mean "this length was not
      // delivered", and strokeDraw would consume the dash pattern as its own
      // reveal mechanism.
      if (b.gap) dashDraw(b.gap, { delay: delay + 640, duration: 380, signal });
      if (b.overrun) {
        // The notched cap past the domain end is a filled path carrying no
        // stroke, so there is no dash pattern for strokeDraw to run along.
        const notched = b.overrun.classList.contains("is-notched");
        if (notched) fadeIn(b.overrun, { delay: delay + 620, duration: 360, y: 0, x: -4, signal });
        else strokeDraw(b.overrun, { delay: delay + 640, duration: 340, signal });
      }
      if (b.voidMark) {
        Array.from(b.voidMark.children).forEach((path, i) =>
          strokeDraw(path, { delay: delay + 380 + i * 110, duration: 260, signal })
        );
        fadeIn(b.voidMark, { delay: delay + 380, duration: 200, y: 0, signal });
      }
      if (n.planLabel) fadeIn(n.planLabel, { delay: delay + 700, duration: 320, y: 0, x: -5, signal });
    });

    /* 6 — the dumbbells: here is where we were, here is the move, here is
     * where we are. A flat row has no move, so it skips the stem entirely and
     * settle() restores what the beat never touched. */
    await wait(620, signal);
    cellNodes.forEach((n) => {
      n.pairs.forEach((pair, i) => {
        const delay = n.c * COL_STEP + n.r * ROW_STEP + i * 90;
        fadeIn(pair.histDot, { delay, duration: 300, y: 0, scaleFrom: 0.4, signal });
        if (pair.stem) strokeDraw(pair.stem, { delay: delay + 160, duration: 360, signal });
        fadeIn(pair.nowDot, { delay: delay + 320, duration: 300, y: 0, scaleFrom: 0.4, signal });
      });
    });

    await wait(420, signal);
    cellNodes.forEach((n) => {
      if (n.noteEl) fadeIn(n.noteEl, { delay: n.c * COL_STEP, duration: 340, y: 4, signal });
    });
    fadeIn(coreSwatch, { duration: 320, y: 0, signal });
    stagger(axisTicks, { step: 60, duration: 320, y: 3, signal });
    fadeIn(axisNote, { delay: 140, duration: 400, y: 5, signal });
    fadeIn(caption, { delay: 220, duration: 420, y: 5, signal });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
