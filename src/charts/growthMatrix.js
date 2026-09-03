/* The stake-weighted growth cell, at two grains, from one file.
 *
 * Tab 2 reads the product taxonomy at All Segments and tab 3 reads the same
 * taxonomy across four segments. Both draw the same mark: a dot at the pivot
 * whose area is the ACV, a bar whose length is the Y/Y on the shared symlog
 * axis, and the exact rate as text. Dollars and growth stay two marks sharing
 * a pivot because they are two channels — one mark whose area was stake times
 * rate would be a quantity nobody can compare and everybody would try to.
 *
 * What separates the two grains is whether the arithmetic closes. It closes
 * exactly at All Segments, so tab 2 draws the roll-up as geometry: three
 * partition rows that tile, with a hairline dropping the level-1 boundary
 * into level 2 so the reader watches the partition inherit. It does not close
 * everywhere across segments, so tab 3 carries hierarchy as a containment
 * rail in the label gutter — a claim about the taxonomy rather than about
 * arithmetic, which never computes a residual and so can never surface one.
 * The roll-up bar is therefore drawn only where metrics.rollup is authored.
 *
 * Marks are SVG and every glyph of text is DOM. These portlets span roughly
 * 1300px at 1920 down to 660px at 1024, and text inside a viewBox scales with
 * its container, so a label authored legibly at one end would be six pixels
 * at the other. The per-cell viewBox pays for itself twice: identical boxes
 * in equal grid columns put the decade gridlines at identical offsets, so
 * they read as four continuous vertical rules down the matrix without a
 * measurement pass anywhere. */

import { chartRoot, svgEl, group } from "../svg.js";
import { palette, toneOf, toneColor, tierMeta } from "../palette.js";
import {
  growthFraction,
  growthX,
  growthClipped,
  notchPath,
  ratePercent,
  cellBox,
  cellAxis,
  CORE_FRACTION,
  DECADE_FRACTIONS,
  GROWTH_TICKS
} from "./growth.js";
import {
  strokeDraw, dashDraw, fadeIn, growFrom, stagger, wait, veil
} from "../anim.js";

/* The roll-up bar, in the units [§5.2] specifies: three 20-unit partition rows
 * with a 12-unit gutter between them for the ties to drop through. */
const ROLL = { w: 420, h: 96, rowH: 20, rows: [6, 38, 70] };

/* A block narrower than this cannot hold `$13M` at a legible size, so it
 * labels on hover instead. Every authored block clears it; the threshold is
 * what stops a future edit producing an unreadable overlay. */
const LABEL_MIN_UNITS = 46;

const RAIL = { w: 34, rowUnits: 100, x0: 8, step: 11, tick: 7 };

/* cellBox(1) is authored at 420x48 — 8.75:1, which is the aspect a lane would
 * have if the roll-up bar were not stacked above it. It is, so seven rows land
 * 60-90px tall inside a column 425-990px wide, and an 8.75:1 box would render
 * about two thirds of that column and letterbox the rest — which would also
 * put every rate label out of register with the bar tip it names, because
 * those are DOM and positioned as a percentage of the cell. The lane keeps
 * cellBox(1)'s height and padding and widens its box instead. growthFraction
 * is scale-free, so that changes the pixel budget and nothing else: every
 * decade still lands on the same fraction of the half-width it lands on in a
 * tab-3 cell, which is the property the shared scale exists to guarantee. */
const LANE_ASPECT = 12;

/* §10.2 and §10.3 are the same sequence at two tempos: a wide single-column
 * lane cascades down its rows, and a four-column matrix sweeps column-major
 * so its interior travels in +x, nesting inside the page sweep rather than
 * fighting it. */
const TEMPO = {
  lane: { rule: 0, dot: 54, dotTotal: 380, bar: 620, barCol: 0, barRow: 70 },
  matrix: { rule: 90, dot: 26, dotTotal: 520, bar: 540, barCol: 130, barRow: 48 }
};

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const segments = metrics.segments || [];
  const columnCount = Math.max(1, segments.length);
  const single = columnCount === 1;
  const rollup = metrics.rollup || null;
  /* Authored only where a column interval means something. Four segment
   * columns make it a comparison — PubSec's leaves span a decade and a half
   * where CMRCL's span two thirds of one — and the single-column lane makes
   * it one bracket with nothing to compare against, which is why the lane
   * does not author it. A data decision, not a special case in here. */
  const interval = !single && metrics.interval ? metrics.interval : null;
  const stakeMax = Number(metrics.stakeMax) || 1;
  const good = metrics.goodDirection || "up";
  const degraded = isDirect && (tier === "red" || tier === "grey");

  /* One column gets the wide lane; four get the compact cell straight from
   * growth.js, whose 200x44 is already the right aspect for a matrix column. */
  const authoredCell = cellBox(columnCount);
  const box = single
    ? { w: authoredCell.h * LANE_ASPECT, h: authoredCell.h, pad: authoredCell.pad }
    : authoredCell;
  const ax = cellAxis(box);
  const BAR_H = box.h * 0.25;
  const RMAX = box.h * 0.2;

  /* Tab 3 drops the reference column and spends the ~30px per column that
   * frees on a rate numeral in every cell, so the exact figure is on screen
   * for a board that is presented rather than read. Tab 2 authors one column
   * and marks it as the reference, so it always labels. */
  const labelEveryCell = metrics.rateLabels === "all";
  const referenceIndex = segments.findIndex((s) => s && s.reference);

  /* Degraded mode authors metrics.rows down to the one row that survives and
   * lists the six that do not in metrics.sockets. Their labels come from the
   * portlet's own governed spec — the same move the provenance face makes when
   * it strikes a semantic field, and for the same reason: what is being shown
   * is that these rows were being relied on, not that they never existed. */
  const authoredRows = (ctx.portlet.metrics || {}).rows || [];
  const socketIds = new Set(metrics.sockets || []);
  const liveRows = metrics.rows || [];
  const rows = socketIds.size
    ? authoredRows.map((spec) => {
      const live = liveRows.find((r) => r.id === spec.id);
      return live && !socketIds.has(spec.id) ? live : { ...spec, socket: true };
    })
    : liveRows;

  const wrap = document.createElement("div");
  wrap.className = "growth";
  if (single) wrap.dataset.lane = "true";
  /* The four blocks below are separate grids rather than one, so the roll-up
   * bar, the column headers, the matrix and the axis strip can each size their
   * own row without a shared template having to describe all four. They are
   * siblings of one width carrying one column template, which is what keeps
   * the roll-up bar, every cell and the tick labels in one vertical register. */
  wrap.style.setProperty(
    "--cell-tracks",
    single
      ? "[value] 56px [cell] minmax(0, 1fr)"
      : `repeat(${columnCount}, minmax(0, 1fr))`
  );
  wrap.style.setProperty("--row-tracks", `repeat(${rows.length}, minmax(0, 1fr))`);

  const rollupNodes = rollup ? buildRollup() : null;
  const headNodes = single ? null : buildColumnHeads();
  const bodyNodes = buildBody();
  const axisNodes = buildAxis();

  const axisNoteEl = document.createElement("p");
  axisNoteEl.className = "growth-axisnote";
  axisNoteEl.textContent = metrics.axisNote || "";
  wrap.appendChild(axisNoteEl);

  const captionEl = document.createElement("p");
  captionEl.className = "growth-caption";
  captionEl.textContent = metrics.caption || "";
  wrap.appendChild(captionEl);

  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  /* ------------------------------- roll-up -------------------------------- */

  /* Three partition rows on one dollar scale. The roll-up is visible as three
   * things at once, none of them typographic: the rows are the same total
   * width, the level-1 boundary recurs one level down with a hairline dropping
   * through the gutter to it, and the boundaries introduced at level 2 have no
   * tie because there is nothing above them to carry down.
   *
   * Every x comes from a running sum of the authored dollars, so Server's
   * right edge and the Platform|Embedded boundary are the same expression on
   * the same total and land on the same fraction of a pixel. Applying the
   * scale twice with two roundings would break the one claim this portlet is
   * here to make. */
  function buildRollup() {
    const total = Number(rollup.total) || 1;
    const xOf = (dollars) => (dollars / total) * ROLL.w;
    const byId = new Map(rows.map((r) => [r.id, r]));
    const levels = (rollup.levels || []).map((ids) => ids.map((id) => byId.get(id)).filter(Boolean));

    const section = document.createElement("div");
    section.className = "growth-rollup";

    const head = document.createElement("div");
    head.className = "growth-rollup-head";
    const totalEl = document.createElement("span");
    totalEl.className = "growth-rollup-total";
    totalEl.textContent = rollup.totalDisplay || "";
    const eyebrowEl = document.createElement("span");
    eyebrowEl.className = "growth-rollup-eyebrow";
    eyebrowEl.textContent = levels.length > 1 ? "tiles at every level" : "one level, nothing to tile";
    head.appendChild(totalEl);
    head.appendChild(eyebrowEl);
    section.appendChild(head);

    const plot = document.createElement("div");
    plot.className = "growth-rollup-plot";
    const svg = chartRoot(ROLL.w, ROLL.h, {
      preserveAspectRatio: "none",
      label: `${ctx.label} — ${rollup.totalDisplay || ""} partitioned across ${levels.length} levels`,
      class: "growth-rollup-svg"
    });
    const marks = group();
    svg.appendChild(marks);

    const blocks = levels.map(() => []);
    const labels = [];
    const extentTies = [];
    const carryTies = [];
    const boundaries = [];

    levels.forEach((level, li) => {
      const y = ROLL.rows[li] ?? ROLL.rows[ROLL.rows.length - 1];
      const interior = [];
      let cum = 0;

      level.forEach((row) => {
        const x0 = xOf(cum);
        cum += Number(row.value) || 0;
        const x1 = xOf(cum);
        if (cum < total) interior.push(cum);

        const block = svgEl("rect", {
          x: x0,
          y,
          width: Math.max(0.4, x1 - x0),
          height: ROLL.rowH,
          rx: 2,
          fill: row.color || ctx.accent,
          // Undifferentiated rather than guessed: without the taxonomy there
          // are no boundaries to draw, so the one block that survives carries
          // a dashed outline instead of six siblings.
          "fill-opacity": 0.86,
          stroke: p.surface,
          "stroke-width": 1,
          "stroke-dasharray": null,
          "vector-effect": "non-scaling-stroke",
          class: "growth-block"
        });
        marks.appendChild(block);
        blocks[li].push(block);
        ctx.tip(
          block,
          li === 0
            ? `${row.label} · ${row.display} · ${rollup.note || ""}`.trim()
            : `${row.label} · ${row.display} · inside ${labelOfRow(row.parent) || "the total"}`
        );

        if (x1 - x0 < LABEL_MIN_UNITS) return;
        const label = document.createElement("span");
        label.className = "growth-block-label";
        label.textContent = row.display || "";
        label.style.setProperty("--at-x", `${(((x0 + x1) / 2) / ROLL.w) * 100}%`);
        label.style.setProperty("--at-y", `${((y + ROLL.rowH / 2) / ROLL.h) * 100}%`);
        // Painted from the palette rather than a token, because which way it
        // has to read depends on the mark under it: paper on a block filled at
        // 0.86, and the tier colour on a dashed one filled at 0.16.
        label.style.color = p.surface;
        plot.appendChild(label);
        labels.push(label);
      });

      boundaries.push(interior);

      if (li === 0) return;
      // The gutter this level inherits through: from the previous row's bottom
      // edge to this row's top edge.
      const top = (ROLL.rows[li - 1] ?? 0) + ROLL.rowH;
      const bottom = y;
      [0, ROLL.w].forEach((x) => extentTies.push(tie(x, top, bottom, "extent")));

      const above = boundaries[li - 1] || [];
      interior
        .filter((at) => above.some((prev) => Math.abs(prev - at) < 1e-9))
        .forEach((at) => {
          const node = tie(xOf(at), top, bottom, "carry");
          carryTies.push(node);
          // The tie has a real stroke, so padHit() would overwrite it — a
          // transparent rect over the gutter is the hit target instead.
          const hit = svgEl("rect", {
            x: xOf(at) - 6,
            y: top,
            width: 12,
            height: bottom - top,
            fill: "transparent",
            class: "growth-tie-hit"
          });
          marks.appendChild(hit);
          ctx.tip(
            hit,
            `The boundary at ${formatDollars(at)} is a boundary at both levels — this line is the roll-up, not a check on it.`
          );
        });
    });

    plot.appendChild(svg);
    section.appendChild(plot);
    wrap.appendChild(section);

    function tie(x, top, bottom, kind) {
      const node = svgEl("path", {
        d: `M ${x} ${top} V ${bottom}`,
        stroke: p.ink,
        "stroke-opacity": kind === "carry" ? 0.72 : 0.34,
        "stroke-width": kind === "carry" ? 1.2 : 1,
        fill: "none",
        "vector-effect": "non-scaling-stroke",
        class: `growth-tie is-${kind}`
      });
      marks.appendChild(node);
      return node;
    }

    function labelOfRow(id) {
      const row = rows.find((r) => r.id === id);
      return row ? row.label : null;
    }

    function formatDollars(value) {
      return `${metrics.unit === "$M" ? "$" : ""}${value}${metrics.unit === "$M" ? "M" : ""}`;
    }

    return { head, blocks, labels, extentTies, carryTies };
  }

  /* ---------------------------- column headers ---------------------------- */

  function buildColumnHeads() {
    const head = document.createElement("div");
    head.className = "growth-head";
    const nodes = segments.map((seg, c) => {
      const cell = document.createElement("div");
      cell.className = "growth-colhead";
      cell.style.setProperty("--col", String(3 + c));
      if (seg.reference) cell.dataset.reference = "true";
      // Not struck. The inferred segmentation names its columns with total
      // confidence; that it named them from a different field than last
      // quarter is not something the column head can know.
      cell.textContent = seg.short || seg.label;
      ctx.tip(cell, degraded
        ? `${seg.label} — one of three candidate segment sources, with nothing ruling between them`
        : `${seg.label} · certified customer segment, resolved as of the period close`);
      head.appendChild(cell);
      return cell;
    });
    wrap.appendChild(head);
    return nodes;
  }

  /* ------------------------------- the body ------------------------------- */

  function buildBody() {
    const body = document.createElement("div");
    body.className = "growth-body";

    const rail = buildRail(body);
    // Before the rows, so every cell and every numeral paints over it. The
    // interval is context for the marks, not a mark competing with them.
    const intervals = interval ? buildIntervals(body) : [];

    const rowLabels = [];
    const valueLabels = [];
    const cells = [];

    rows.forEach((row, index) => {
      const label = document.createElement("div");
      label.className = "growth-row-label";
      label.style.setProperty("--level", String(row.level || 0));
      label.style.setProperty("--row", String(index + 1));
      label.dataset.level = String(row.level || 0);
      if (row.socket) {
        const struck = document.createElement("s");
        struck.className = `strike strike-${tier}`;
        struck.textContent = row.label;
        label.appendChild(struck);
      } else {
        label.textContent = row.label;
      }
      body.appendChild(label);
      rowLabels.push(label);

      if (single) {
        const value = document.createElement("div");
        value.className = "growth-row-value";
        value.style.setProperty("--row", String(index + 1));
        value.textContent = row.socket ? "—" : row.display || "";
        body.appendChild(value);
        valueLabels.push(value);
      }

      segments.forEach((seg, c) => cells.push(buildCell(body, row, index, seg, c)));
    });

    wrap.appendChild(body);
    return { body, rail, intervals, rowLabels, valueLabels, cells };
  }

  /* The column interval: two hairlines down each column at its slowest and
   * fastest leaf rate, capped top and bottom.
   *
   * This is what is left of the dispersion panel that stood beside this
   * matrix. Two of that panel's three jobs were already done here — the
   * minimum and the maximum of every column are two cells of this grid, and
   * the reader is looking at them — and the third, the width of the interval,
   * was the arithmetic difference of two Y/Y figures off bases three orders
   * of magnitude apart. So the interval moves into the column it describes,
   * at no cost in slot, and the panel's slot goes to the dollar movement that
   * difference was standing in for.
   *
   * Endpoints are selected rather than authored. The board's own catalog
   * rules on this: the low and high of an interval are a selection over
   * governed values, not a new formula, so taking min and max client-side
   * creates no ungoverned measure. Authoring them would put a second copy of
   * four rates in the data file to drift from the first.
   *
   * Capped, because a pair of bare verticals in a chart already carrying four
   * decade gridlines reads as two more gridlines; closed at both ends it
   * reads as one interval. And the caps are what let it span the full body
   * height honestly — every non-leaf rate in all four columns falls inside
   * its own column's leaf interval, so the bracket says "every rate in this
   * column lies between these two", which is true of the total and both
   * motion rows as well as of the leaves it is taken over.
   *
   * Offsets come from ratePercent() against the same box the axis tick labels
   * use, which is the alignment guarantee: the bracket cannot drift from the
   * ruler that reads it, because both are positioned by one function against
   * one track. */
  function buildIntervals(body) {
    const leafLevel = Number(interval.leafLevel);
    const leaves = rows.filter((r) => Number(r.level) === leafLevel && !r.socket);
    if (leaves.length < 2) return [];

    return segments.map((seg, c) => {
      const rates = leaves
        .map((r) => Number((r.yoy || [])[c]))
        .filter((v) => Number.isFinite(v));
      if (rates.length < 2) return null;

      const lo = Math.min(...rates);
      const hi = Math.max(...rates);
      const loRow = leaves.find((r) => Number(r.yoy[c]) === lo);
      const hiRow = leaves.find((r) => Number(r.yoy[c]) === hi);

      const slot = document.createElement("div");
      slot.className = "growth-dispwrap";
      slot.style.setProperty("--col", String(3 + c));

      // left and right rather than left and width: the two edges are two
      // rates, and expressing the second as a distance from the first would
      // make it a span — which is the figure this whole change exists to stop
      // printing.
      const left = ratePercent(lo, box);
      const right = 100 - ratePercent(hi, box);
      slot.style.setProperty("--disp-lo", `${left.toFixed(2)}%`);
      slot.style.setProperty("--disp-hi", `${right.toFixed(2)}%`);

      const bar = document.createElement("div");
      bar.className = "growth-disp";
      slot.appendChild(bar);

      /* The hit target cannot be the bracket itself: it spans the whole
       * column and would swallow every cell tooltip underneath it. A strip
       * at the top of the column instead, over the header row where there is
       * no mark to compete with. */
      const hit = document.createElement("div");
      hit.className = "growth-disphit";
      ctx.tip(hit, degraded
        ? `${seg.label} — an interval over ${interval.tipLabel || "leaf rows"} that nothing certifies as a set`
        : `${seg.label} · slowest to fastest of the ${leaves.length} ${interval.tipLabel || "leaf rows"}: `
          + `${hiRow.label} at ${signed(hi)}, ${loRow.label} at ${signed(lo)}`);
      slot.appendChild(hit);

      body.appendChild(slot);
      return { slot, bar };
    }).filter(Boolean);
  }

  function signed(v) {
    return `${v < 0 ? "\u2212" : "+"}${Math.abs(v)}%`;
  }

  /* The containment rail: a vertical spine per parent spanning its children's
   * rows with a short tick into each. Indentation on its own is a typographic
   * hint rather than an encoding, and this is the standard tree bracket — a
   * claim that Cloud is inside the Platform, never that Cloud plus Server
   * equals it. preserveAspectRatio="none" stretches it over however tall the
   * rows end up, and non-scaling-stroke keeps the hairlines at 1px under that
   * stretch. */
  function buildRail(body) {
    const wrapEl = document.createElement("div");
    wrapEl.className = "growth-rail";
    const height = rows.length * RAIL.rowUnits;
    const svg = chartRoot(RAIL.w, height, {
      preserveAspectRatio: "none",
      label: "Product taxonomy — which lines sit inside which motion",
      class: "growth-rail-svg"
    });
    const marks = group();
    svg.appendChild(marks);

    const rowY = (i) => i * RAIL.rowUnits + RAIL.rowUnits / 2;
    const railX = (level) => RAIL.x0 + level * RAIL.step;
    const spines = [];
    const ticks = [];
    const breaks = [];

    rows.forEach((row, index) => {
      const children = rows
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => r.parent === row.id);
      if (!children.length) return;

      const x = railX(row.level || 0);
      const from = rowY(index);
      const to = rowY(children[children.length - 1].i);

      /* The rail draws whole in both modes. A severed spine with an X in the
       * gap said "this parentage is missing", which is the one thing a raw
       * read never says: it infers a parentage, draws it continuous, and the
       * roll-up closes. On this panel the inferred hierarchy closes at every
       * level — see the `shownFrom` arithmetic — so an additivity check
       * confirms a partition with a line in it the business does not use. */
      spines.push(spine(`M ${x} ${from} V ${to}`));

      ticks.push(tick(x, from));
      children.forEach(({ i }) => ticks.push(tick(x, rowY(i))));
    });

    wrapEl.appendChild(svg);
    body.appendChild(wrapEl);

    /* Painted from inkDim rather than the gridline tone: the rail carries a
       structural assertion about the taxonomy, and at the gridline's 0.22 it
       reads as a smudge in the gutter instead of a bracket. */
    function spine(d) {
      const node = svgEl("path", {
        d,
        stroke: p.inkDim,
        "stroke-opacity": 0.6,
        "stroke-width": 1.2,
        fill: "none",
        "vector-effect": "non-scaling-stroke",
        class: "growth-rail-spine"
      });
      marks.appendChild(node);
      return node;
    }

    function tick(x, y) {
      const node = svgEl("path", {
        d: `M ${x} ${y} H ${x + RAIL.tick}`,
        stroke: p.inkDim,
        "stroke-opacity": 0.8,
        "stroke-width": 1,
        fill: "none",
        "vector-effect": "non-scaling-stroke",
        class: "growth-rail-tick"
      });
      marks.appendChild(node);
      return node;
    }

    return { spines, ticks, breaks };
  }

  /* ------------------------------- one cell ------------------------------- */

  function buildCell(body, row, index, seg, c) {
    const value = single ? row.value : (row.values || [])[c];
    const display = single ? row.display : (row.display || [])[c];
    const yoy = single ? row.yoy : (row.yoy || [])[c];
    const yoyDisplay = single ? row.yoyDisplay : (row.yoyDisplay || [])[c];
    const rowGood = row.goodDirection || good;
    const barTint = toneColor(toneOf(yoy, rowGood));

    const cell = document.createElement("div");
    cell.className = "growth-cell";
    cell.style.setProperty("--col", String(single ? 4 : 3 + c));
    cell.style.setProperty("--row", String(index + 1));

    const svg = chartRoot(box.w, box.h, {
      label: `${seg.label} ${row.label} ${display || "no reading"} ${yoyDisplay || ""}`.trim(),
      class: "growth-cell-svg"
    });
    const marks = group();
    svg.appendChild(marks);

    /* The ruler, drawn in every cell. A symlog axis without visible decade
     * marks is a lie by omission, and the core band is tinted at 0.06 in the
     * same amber the colour threshold uses, so the linear region of the axis
     * and the neutral region of the palette are shown as the one thing they
     * are. fill-opacity and stroke-opacity are paint channels independent of
     * element opacity, which is what lets the veil drive these to 1 and
     * settle() restore their authored translucency. */
    const core = svgEl("rect", {
      x: ax.zeroX - CORE_FRACTION * ax.halfWidth,
      y: 0,
      width: 2 * CORE_FRACTION * ax.halfWidth,
      height: box.h,
      fill: p.warn,
      "fill-opacity": 0.06,
      class: "growth-core"
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
        class: "growth-decade"
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
      class: "growth-zero"
    });
    marks.appendChild(zero);

    let bar = null;
    let stake = null;
    let notch = null;
    let socket = null;
    let floored = false;

    if (row.socket) {
      socket = pivotSquare(marks, meta.color);
    } else if (yoy === null || yoy === undefined || Number.isNaN(Number(yoy))) {
      // "Not measured" and "no change" are different facts, and a zero-length
      // bar would conflate them. No authored cell reaches this branch; it
      // exists so a future edit cannot quietly lie.
      socket = pivotSquare(marks, p.axis);
    } else {
      const gx = growthX(yoy, ax.zeroX, ax.halfWidth);
      // growFrom scales a rect from one edge and renders nothing at all from a
      // zero-width one, so a flat rate still gets a mark at the pivot.
      const width = Math.max(0.8, Math.abs(gx - ax.zeroX));
      bar = svgEl("rect", {
        x: yoy < 0 ? ax.zeroX - width : ax.zeroX,
        y: ax.midY - BAR_H / 2,
        width,
        height: BAR_H,
        rx: 1.5,
        fill: barTint,
        "fill-opacity": 0.9,
        class: "growth-bar"
      });
      marks.appendChild(bar);

      const area = Math.max(0, Number(value) || 0) / stakeMax;
      const r = Math.max(1.6, RMAX * Math.sqrt(area));
      floored = RMAX * Math.sqrt(area) < 1.6;
      stake = svgEl("circle", {
        cx: ax.zeroX,
        cy: ax.midY,
        r,
        fill: p.surface,
        // Solid in both modes. An inferred stake is drawn exactly as firmly as
        // a certified one, because that is how it arrives.
        stroke: row.color || ctx.accent,
        "stroke-width": 1.6,
        class: "growth-stake"
      });
      marks.appendChild(stake);

      if (growthClipped(yoy)) {
        const dir = Math.sign(yoy);
        notch = svgEl("path", {
          d: notchPath(ax.zeroX + dir * ax.halfWidth, ax.midY - BAR_H / 2, BAR_H, dir),
          fill: "none",
          stroke: barTint,
          "stroke-width": 1.2,
          class: "growth-notch"
        });
        marks.appendChild(notch);
      }
    }

    // The whole cell is the hit target rather than the dot: a 4px circle is
    // not a pointer target, and the figures behind the mark are what the
    // reader is reaching for.
    const hit = svgEl("rect", {
      x: 0, y: 0, width: box.w, height: box.h, fill: "transparent", class: "growth-cell-hit"
    });
    marks.appendChild(hit);
    ctx.tip(hit, cellTip(seg, row, display, yoyDisplay, floored));

    cell.appendChild(svg);

    let rateEl = null;
    const labelled = labelEveryCell || c === referenceIndex || (referenceIndex < 0 && single);
    if (labelled && !row.socket && yoyDisplay) {
      /* DOM because it is text, positioned as a percentage of the cell because
       * the cell SVG fills the cell's width exactly. Anchored away from zero so
       * it reads as the bar's tip, and clamped against the cell's own edge in
       * ch units so a saturated rate cannot push its numeral out of the
       * column — no measurement, one declaration. */
      rateEl = document.createElement("span");
      rateEl.className = "growth-rate";
      rateEl.textContent = yoyDisplay;
      rateEl.dataset.dir = Number(yoy) < 0 ? "neg" : "pos";
      rateEl.style.setProperty("--rate-at", `${ratePercent(yoy, box).toFixed(2)}%`);
      // ch is the zero's advance and a rate string is mostly wider glyphs —
      // the sign and the per-cent sign both exceed it — so the clamp is given
      // the slack those and the chip's padding cost, or a saturated numeral
      // leaves the column by a few pixels and the portlet clips it.
      rateEl.style.setProperty("--rate-w", `${(yoyDisplay.length + 2.4).toFixed(1)}ch`);
      rateEl.style.color = barTint;
      cell.appendChild(rateEl);
    }

    body.appendChild(cell);
    return { cell, svg, core, decades, zero, bar, stake, notch, socket, rateEl, yoy, r: index, c };
  }

  function pivotSquare(marks, stroke) {
    const node = svgEl("rect", {
      x: ax.zeroX - 3.5,
      y: ax.midY - 3.5,
      width: 7,
      height: 7,
      fill: "none",
      stroke,
      "stroke-width": 1.2,
      "stroke-dasharray": "2 2",
      class: "growth-socket"
    });
    marks.appendChild(node);
    return node;
  }

  function cellTip(seg, row, display, yoyDisplay, floored) {
    if (row.socket) {
      return `${row.label} — no reading without the product taxonomy. The rate and the stake both need a level this hierarchy no longer has.`;
    }
    const bits = [seg.label, row.label, display || "no reading", `${yoyDisplay || "no rate"} Y/Y`];
    if (floored) {
      bits.push("dot at its minimum radius — below roughly $3M the floor binds rather than the area");
    }
    return bits.join(" · ");
  }

  /* ------------------------------ axis strip ------------------------------ */

  /* Rendered once per portlet under the leftmost column rather than repeated
   * in 28 cells. The decade gridlines run down every column and read as
   * continuous rules, so one set of labels locates every cell on the tab. */
  function buildAxis() {
    const strip = document.createElement("div");
    strip.className = "growth-axis";

    const ticks = document.createElement("div");
    ticks.className = "growth-ticks";
    ticks.style.setProperty("--col", String(single ? 4 : 3));

    const nodes = [];
    const ordered = [];
    GROWTH_TICKS.filter((t) => t.at > 0).slice().reverse().forEach((t) => ordered.push({ ...t, sign: -1 }));
    ordered.push({ at: 0, kind: "zero", sign: 1 });
    GROWTH_TICKS.filter((t) => t.at > 0).forEach((t) => ordered.push({ ...t, sign: 1 }));

    ordered.forEach((t) => {
      const at = t.at * t.sign;
      const node = document.createElement("span");
      node.className = "growth-tick";
      node.dataset.tick = t.at === 0 ? "zero" : (t.at >= 1000 ? "far" : t.kind);
      node.textContent = t.at === 0 ? "0" : `${t.sign < 0 ? "\u2212" : "+"}${t.at}%`;
      node.style.setProperty("--at-x", `${ratePercent(at, box).toFixed(2)}%`);
      // The outermost labels anchor to their own edge instead of centring on
      // it, so the axis strip cannot run out of the column it belongs to.
      const f = growthFraction(at) || 0;
      node.dataset.anchor = f <= -0.9 ? "start" : (f >= 0.9 ? "end" : "mid");
      ticks.appendChild(node);
      nodes.push(node);
    });

    strip.appendChild(ticks);

    let note = null;
    if (metrics.allSegmentsNote) {
      // What replaces the dropped reference column: both tabs resolve to the
      // same certified measure, and each states so on its own provenance face.
      note = document.createElement("p");
      note.className = "growth-allnote";
      note.textContent = metrics.allSegmentsNote;
      strip.appendChild(note);
    }

    wrap.appendChild(strip);
    return { ticks: nodes, note };
  }

  /* -------------------------------- detail -------------------------------- */

  /* Every exact figure, one click away through the control the portlet head
   * already provides. Two tables at four columns rather than one nine-column
   * table: nine columns in an 860px inspector is 95px each, and separating the
   * exact channel makes the same point the chart does. */
  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    if (single) {
      detail.appendChild(table(
        [metrics.unit || "value", "Y/Y"],
        rows.map((row) => [
          row.label,
          row.socket ? "—" : row.display || "—",
          row.socket ? "—" : row.yoyDisplay || "—"
        ]),
        rows.map((row) => row.level || 0)
      ));
    } else {
      const heads = segments.map((s) => s.short || s.label);
      detail.appendChild(caption(`${metrics.unit || "value"} by segment`));
      detail.appendChild(table(
        heads,
        rows.map((row) => [row.label, ...segments.map((_, c) => (row.display || [])[c] ?? "—")]),
        rows.map((row) => row.level || 0)
      ));
      detail.appendChild(caption("Y/Y by segment"));
      detail.appendChild(table(
        heads,
        rows.map((row) => [row.label, ...segments.map((_, c) => (row.yoyDisplay || [])[c] ?? "—")]),
        rows.map((row) => row.level || 0),
        rows.map((row) => segments.map((_, c) => (row.yoy || [])[c]))
      ));
    }

    const note = document.createElement("p");
    note.className = "trend-table-note";
    note.textContent = rollup
      ? "Levels tile exactly: 38 + 21 = 59, 13 + 11 = 24, 59 + 24 = 83. The bar above draws that partition rather than reporting it."
      : "One certified ACV measure read at product line crossed with customer segment, so any two cells were made the same way.";
    detail.appendChild(note);

    return detail;
  }

  function caption(text) {
    const el = document.createElement("p");
    el.className = "growth-table-caption";
    el.textContent = text;
    return el;
  }

  function table(heads, bodyRows, levels, tones) {
    const el = document.createElement("table");
    el.className = "trend-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    headRow.appendChild(cell("th", "", "trend-table-rowlabel"));
    heads.forEach((h) => headRow.appendChild(cell("th", h)));
    thead.appendChild(headRow);
    el.appendChild(thead);

    const tbody = document.createElement("tbody");
    bodyRows.forEach((values, i) => {
      const tr = document.createElement("tr");
      const th = cell("th", values[0], "trend-table-rowlabel");
      th.dataset.level = String(levels[i]);
      tr.appendChild(th);
      values.slice(1).forEach((v, j) => {
        const td = cell("td", v);
        const numeric = tones ? tones[i][j] : null;
        // The polarity comes from the measure, so a rate reads as the news it
        // is without anybody colouring a cell by hand.
        if (numeric !== null && numeric !== undefined && !Number.isNaN(Number(numeric))) {
          td.style.color = toneColor(toneOf(Number(numeric), good));
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    el.appendChild(tbody);
    return el;
  }

  function cell(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value ?? "";
    if (className) node.className = className;
    return node;
  }

  /* --------------------------------- veil --------------------------------- */

  const cells = bodyNodes.cells;
  const byColumn = segments.map((_, c) => cells.filter((cellNode) => cellNode.c === c));
  // Column-major, which is what makes the interior sweep travel in +x and nest
  // inside the page sweep instead of fighting it.
  const columnMajor = byColumn.flat();
  const tempo = single ? TEMPO.lane : TEMPO.matrix;

  /* Every animated node, including every conditional one. A mark that is not
   * veiled is mounted at full opacity and driven to zero when its beat
   * arrives — visible for as long as the sequence takes to reach it, then
   * flashing out and drawing back in. settle() restores whatever a beat never
   * reached, which is the only thing standing between an overflow notch, a
   * degraded-mode socket or a severed rail and invisibility. */
  const curtain = veil([
    rollupNodes && [
      rollupNodes.head,
      rollupNodes.blocks,
      rollupNodes.labels,
      rollupNodes.extentTies,
      rollupNodes.carryTies
    ],
    headNodes,
    bodyNodes.intervals.map((i) => i.bar),
    bodyNodes.rail.spines,
    bodyNodes.rail.ticks,
    bodyNodes.rail.breaks,
    bodyNodes.rowLabels,
    bodyNodes.valueLabels,
    cells.map((c) => [c.core, c.decades, c.zero, c.bar, c.stake, c.notch, c.socket, c.rateEl]),
    axisNodes.ticks,
    axisNodes.note,
    axisNoteEl,
    captionEl
  ]);
  curtain.hide();

  async function build(signal) {
    if (rollupNodes) {
      /* 1 — the total arrives as one quantity. */
      fadeIn(rollupNodes.head, { duration: 380, y: 4, signal });
      (rollupNodes.blocks[0] || []).forEach((b) =>
        growFrom(b, { axis: "x", origin: "left center", duration: 620, signal }));

      /* 2 — the two motions partition it. */
      await wait(240, signal);
      (rollupNodes.blocks[1] || []).forEach((b, i) =>
        growFrom(b, { axis: "x", origin: "left center", duration: 560, delay: i * 120, signal }));

      /* 3 — the boundary descends. This beat is the portlet: the level-1
       * boundary drops through the gutter as level 2's blocks grow, so the
       * reader watches the partition inherit rather than being told it does. */
      await wait(300, signal);
      rollupNodes.carryTies.forEach((t) => strokeDraw(t, { duration: 280, signal }));
      (rollupNodes.blocks[2] || []).forEach((b, i) =>
        growFrom(b, { axis: "x", origin: "left center", duration: 520, delay: i * 90, signal }));

      /* 4 — the figure closes. */
      await wait(360, signal);
      rollupNodes.extentTies.forEach((t) => strokeDraw(t, { duration: 220, signal }));
      stagger(rollupNodes.labels, { step: 70, duration: 300, y: 0, signal });

      await wait(260, signal);
    }

    /* 5 — the tree assembles. */
    bodyNodes.rail.spines.forEach((s) => strokeDraw(s, { duration: 240, signal }));
    bodyNodes.rail.ticks.forEach((t, i) =>
      strokeDraw(t, { duration: 160, delay: 140 + i * 26, signal }));
    bodyNodes.rail.breaks.forEach((b) =>
      fadeIn(b, { delay: 260, duration: 280, y: 0, scaleFrom: 0.4, signal }));
    stagger(bodyNodes.rowLabels, { step: single ? 44 : 40, duration: 300, y: 3, signal });
    stagger(bodyNodes.valueLabels, { step: 44, duration: 300, y: 3, delay: 70, signal });

    /* 6 — the ruler before the measurement, left to right. */
    await wait(300, signal);
    byColumnOrAll((list, c) => {
      list.forEach((cellNode) =>
        strokeDraw(cellNode.zero, { duration: single ? 420 : 380, delay: c * tempo.rule, signal }));
      stagger(list.map((cellNode) => cellNode.core), {
        step: 16, maxTotal: 120, duration: 300, y: 0, delay: 140 + c * tempo.rule, signal
      });
      stagger(list.flatMap((cellNode) => cellNode.decades), {
        step: 8, maxTotal: 160, duration: 300, y: 0, delay: 140 + c * tempo.rule, signal
      });
    });
    if (headNodes) stagger(headNodes, { step: 70, duration: 300, y: 0, signal });
    stagger(axisNodes.ticks, { step: 46, duration: 300, y: 0, delay: 160, signal });

    /* 7 — the stakes land on the pivot. maxTotal is explicit: the default 620
     * would compress a 28-item step to 22ms and the cascade would read as one
     * flash rather than as a sweep. */
    await wait(200, signal);
    stagger(columnMajor.map((c) => c.stake).filter(Boolean), {
      step: tempo.dot, duration: single ? 300 : 280, y: 0, scaleFrom: 0.2, maxTotal: tempo.dotTotal, signal
    });
    stagger(columnMajor.map((c) => c.socket).filter(Boolean), {
      step: tempo.dot, duration: 300, y: 0, maxTotal: tempo.dotTotal, signal
    });

    /* 8 — the rates grow out of zero, each bar outward from zero in its own
     * direction, so the reader sees which way before how far or what hue. */
    await wait(180, signal);
    columnMajor.forEach((cellNode) => {
      const delay = cellNode.c * tempo.barCol + cellNode.r * tempo.barRow;
      if (cellNode.bar) {
        growFrom(cellNode.bar, {
          axis: "x",
          origin: Number(cellNode.yoy) < 0 ? "right center" : "left center",
          duration: tempo.bar,
          delay,
          signal
        });
      }
      // dashDraw, not strokeDraw: the notch's teeth carry the meaning and
      // strokeDraw would consume them as its reveal mechanism.
      if (cellNode.notch) dashDraw(cellNode.notch, { duration: 300, delay: delay + 240, signal });
    });
    stagger(columnMajor.map((c) => c.rateEl).filter(Boolean), {
      step: single ? 60 : 34, duration: 320, y: 0, delay: 220, maxTotal: 620, signal
    });

    /* 9 — and the interval closes over the column, once every rate inside it
     * has arrived. Last, and column by column in +x so it nests inside the
     * page sweep: it is a reading of the marks, so it cannot precede them. */
    stagger(bodyNodes.intervals.map((i) => i.bar), {
      step: tempo.barCol || 90, duration: 380, y: 0, delay: 420, maxTotal: 520, signal
    });

    fadeIn(axisNoteEl, { delay: 140, duration: 420, y: 4, signal });
    if (axisNodes.note) fadeIn(axisNodes.note, { delay: 200, duration: 420, y: 0, signal });
    fadeIn(captionEl, { delay: 200, duration: 460, y: 6, signal });
  }

  function byColumnOrAll(run) {
    byColumn.forEach((list, c) => run(list, c));
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
