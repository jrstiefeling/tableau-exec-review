/* Signed distance from a benchmark, several subjects to an axis.
 *
 * The general case this solves: several subjects each hold a reading and a
 * benchmark for the same measure, and the question is whether each subject is
 * on the right side of its own benchmark and by how much relative to the
 * others. Drawing both absolute positions and leaving the reader to difference
 * them answers neither question directly — it hands over two numbers per row
 * and a subtraction to perform, four times.
 *
 * So the subtraction is done in the data and the chart draws its result: one
 * signed axis per measure with a zero rule where the benchmark is, every
 * subject placed by its distance from that rule. The verdict — is this above
 * or below — is then a position, a colour AND a word, three channels agreeing,
 * rather than an inference from two dots a reader has to hold at once. The
 * absolute reading keeps its numeral, because that is the figure a reader
 * quotes, and loses its mark, because a dot sitting somewhere in the middle of
 * a 0-to-4 track was spending most of a panel's width saying "in the middle".
 *
 * Nothing here is specific to coverage, to velocity, or to the Q3 tab. An axis
 * is a signed domain and a tick list; a row is a label and one reading per
 * axis; a row that holds no reading for an axis is simply absent from it,
 * which is how the Analytics roll-up renders the non-additivity rule rather
 * than stating it.
 *
 * Two conventions are borrowed rather than invented, so this is one more
 * instance of the board's grammar and not a second grammar: the filled reading
 * dot on a tinted stem is the movement marks', and flat is a case rather than
 * a failure — a reading equal to its benchmark collapses to one neutral dot on
 * the rule with no stem, because there was no distance to draw. */

import { chartRoot, svgEl, group, linearScale } from "../svg.js";
import { palette, toneColor } from "../palette.js";
import { strokeDraw, fadeIn, countUp, stagger, wait, veil } from "../anim.js";

/* The plot's own viewBox. Everything else about the layout is CSS grid, so
 * this only has to be a coordinate space wide enough that the end dots are not
 * clipped: x0/x1 leave a dot's radius of margin at both ends. */
const PLOT = { w: 240, h: 30, x0: 9, x1: 231, cy: 20 };

const DOT = { now: 8, flat: 4.4 };

/* Left to right, like every other portlet, because the page sweep hands this
 * one slot based on its horizontal centre and a build that ran in any other
 * direction would fight the sweep it is nested inside. */
const AXIS_STEP = 190;
const ROW_STEP = 90;

export function mount(host, ctx) {
  const { metrics, isDirect } = ctx;
  const p = palette();

  const axes = metrics.axes || [];
  const rows = metrics.rows || [];

  const wrap = document.createElement("div");
  wrap.className = "bxa";
  wrap.style.setProperty("--bxa-axes", String(Math.max(1, axes.length)));

  const grid = document.createElement("div");
  grid.className = "bxa-grid";
  wrap.appendChild(grid);

  const axisNodes = axes.map((axis, a) => buildAxis(axis, a));

  /* The void note. Rows carrying no reading on any axis are not drawn as empty
   * tracks — a subject with no coverage has no position on a coverage axis,
   * and an empty track at the origin would be a reading of zero. They are
   * named once, here, with the reason. */
  const absent = rows.filter((row) => !axes.some((axis) => readingFor(row, axis.id)));
  let voidNote = null;
  if (absent.length && metrics.voidNote) {
    voidNote = document.createElement("p");
    voidNote.className = "bxa-void";
    voidNote.textContent = metrics.voidNote;
    wrap.appendChild(voidNote);
  }

  const foot = document.createElement("div");
  foot.className = "bxa-foot";

  const key = document.createElement("span");
  key.className = "bxa-key";
  foot.appendChild(key);

  const caption = document.createElement("p");
  caption.className = "bxa-caption";
  caption.textContent = (isDirect && metrics.directCaption) || metrics.caption || "";
  foot.appendChild(caption);
  wrap.appendChild(foot);

  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  /* Every animated node, the conditional ones included: the stem a flat row
   * never draws, the sever X only direct mode draws, and the void note that
   * exists only when a row is absent. settle() is what stops any of them being
   * left invisible when its beat never runs. */
  const curtain = veil([
    axisNodes.map((n) => n.veil), voidNote, key, caption
  ].flat(Infinity));
  curtain.hide();

  function readingFor(row, axisId) {
    const readings = row.readings || {};
    return readings[axisId] || null;
  }

  function buildAxis(axis, a) {
    const col = document.createElement("div");
    col.className = "bxa-axis";
    col.style.setProperty("--bxa-col", String(a + 1));

    const head = document.createElement("div");
    head.className = "bxa-head";

    const title = document.createElement("p");
    title.className = "bxa-title";
    title.textContent = axis.label || "";
    head.appendChild(title);

    const sub = document.createElement("p");
    sub.className = "bxa-sub";
    sub.textContent = axis.sublabel || "";
    head.appendChild(sub);
    col.appendChild(head);

    /* Signed and authored, not fitted. A domain fitted to the data would
     * rescale itself between the governed and the direct reading, and the
     * argument the toggle makes is that the marks move — they cannot be seen
     * to move if the ruler moves with them. */
    const deltaMax = Number(axis.deltaMax) || 1;
    const x = linearScale([-deltaMax, deltaMax], [PLOT.x0, PLOT.x1]);
    const rowNodes = rows
      .map((row) => ({ row, reading: readingFor(row, axis.id) }))
      .filter((r) => r.reading)
      .map((r) => buildRow(r.row, r.reading, axis, x, col));

    /* The tick strip is a cell of the same grid as the plots, in the same
     * column, so it cannot drift out of alignment with the marks it is the
     * ruler for. Ticks are authored, not generated: a renderer choosing its
     * own tick interval would be choosing how coarse the reading is. */
    const strip = document.createElement("div");
    strip.className = "bxa-strip";
    strip.style.setProperty("--bxa-stripcol", "2");
    const ticks = (axis.ticks || []).map((tick) => {
      const el = document.createElement("span");
      el.className = "bxa-tick";
      const v = Number(tick.value);
      el.style.setProperty("--tick-x", `${((x(v) - PLOT.x0) / (PLOT.x1 - PLOT.x0)) * 100}%`);
      if (v === 0) el.dataset.kind = "zero";
      if (v <= -deltaMax) el.dataset.edge = "start";
      if (v >= deltaMax) el.dataset.edge = "end";
      el.textContent = tick.label ?? String(v);
      strip.appendChild(el);
      return el;
    });
    col.appendChild(strip);

    grid.appendChild(col);

    return {
      a,
      ticks,
      rows: rowNodes,
      veil: [title, sub, rowNodes.map((n) => n.veil), ticks]
    };
  }

  function buildRow(row, reading, axis, x, col) {
    const good = reading.goodDirection || "up";
    const delta = Number(reading.delta);

    /* Flat is the sign being zero, not the two absolute figures being equal
     * to the precision they are printed at. They are the same thing here, and
     * where they stop being the same thing the sign is the one that decides:
     * a chart drawn from a delta must agree with the delta it was drawn
     * from. */
    const flat = !delta;
    const better = good === "down" ? delta < 0 : delta > 0;
    const tint = flat ? p.inkSoft : toneColor(better ? "positive" : "risk");

    const verdicts = metrics.verdicts || {};
    const verdictWord = flat
      ? (verdicts.flat || "level")
      : ((better ? verdicts.above : verdicts.below) || (delta > 0 ? "above" : "below"));

    const rowEl = document.createElement("div");
    rowEl.className = "bxa-row";
    if (flat) rowEl.dataset.flat = "true";

    const name = document.createElement("p");
    name.className = "bxa-name";
    name.textContent = row.label || "";
    if (row.color) name.style.setProperty("--row-tint", row.color);
    rowEl.appendChild(name);

    const svg = chartRoot(PLOT.w, PLOT.h, {
      label: `${row.label} ${axis.label} ${reading.valueDisplay}, ${reading.deltaShort || "level"} against ${reading.histDisplay}`,
      class: "bxa-plot",
      preserveAspectRatio: "none"
    });
    const marks = group();
    svg.appendChild(marks);

    const line = svgEl("path", {
      d: `M ${PLOT.x0} ${PLOT.cy} H ${PLOT.x1}`,
      stroke: p.track,
      "stroke-width": 2,
      "stroke-linecap": "round",
      fill: "none",
      "vector-effect": "non-scaling-stroke",
      class: "bxa-line"
    });
    marks.appendChild(line);

    const zeroX = x(0);
    const nowX = x(delta);

    /* The benchmark, as one rule shared by every row on the axis rather than
     * a hollow dot per row at its own position. Four benchmarks at four
     * positions is four references; one rule is a reference. */
    const zero = svgEl("path", {
      d: `M ${zeroX} ${PLOT.cy - 10} V ${PLOT.cy + 10}`,
      stroke: p.axis,
      "stroke-width": 1.5,
      fill: "none",
      "vector-effect": "non-scaling-stroke",
      class: "bxa-zero"
    });
    marks.appendChild(zero);

    let stem = null;
    if (!flat) {
      stem = svgEl("path", {
        d: `M ${Math.min(zeroX, nowX)} ${PLOT.cy} H ${Math.max(zeroX, nowX)}`,
        stroke: tint,
        "stroke-width": 5,
        "stroke-linecap": "round",
        fill: "none",
        "vector-effect": "non-scaling-stroke",
        class: "bxa-stem"
      });
      marks.appendChild(stem);
    }

    const nowDot = svgEl("circle", {
      cx: nowX,
      cy: PLOT.cy,
      r: flat ? DOT.flat : DOT.now,
      fill: tint,
      stroke: p.surface,
      "stroke-width": flat ? 0 : 2.4,
      "vector-effect": "non-scaling-stroke",
      class: "bxa-now"
    });
    marks.appendChild(nowDot);

    const plot = document.createElement("div");
    plot.className = "bxa-plotwrap";
    plot.appendChild(svg);
    rowEl.appendChild(plot);

    const read = document.createElement("div");
    read.className = "bxa-read";

    const val = document.createElement("p");
    val.className = "bxa-val";
    read.appendChild(val);

    /* The finding, in words. Position and colour already say it; the word is
     * what makes it a statement rather than an inference, and it is the one
     * channel that survives a reader who does not know which way is good on
     * this measure. A flat row states the word and nothing else — "level" is
     * the whole reading, and "level −0%" would be a numeral pretending to add
     * something to it. */
    const verdict = document.createElement("p");
    verdict.className = "bxa-verdict";
    verdict.style.setProperty("--val-tint", tint);
    const word = document.createElement("b");
    word.textContent = verdictWord;
    verdict.appendChild(word);
    if (!flat && reading.deltaShort) {
      const amount = document.createElement("span");
      amount.textContent = reading.deltaShort;
      verdict.appendChild(amount);
    }
    read.appendChild(verdict);

    const base = document.createElement("p");
    base.className = "bxa-base";
    base.textContent = reading.histDisplay ? `vs ${reading.histDisplay}` : "";
    read.appendChild(base);
    rowEl.appendChild(read);

    col.appendChild(rowEl);

    // The row itself is display:contents so its children can be cells of the
    // axis grid, which leaves it without a box to hit-test. The plot carries
    // the tip instead — it is the mark being explained in any case.
    ctx.tip(plot, `${row.label} · ${axis.label} ${reading.valueDisplay} — ${verdictWord} ${reading.histDisplay}${flat ? "" : ` by ${reading.deltaShort}`}`);

    return {
      name, val, verdict, base,
      display: reading.valueDisplay || "",
      line, zero, stem, nowDot,
      veil: [name, line, zero, stem, nowDot, val, verdict, base]
    };
  }

  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    const table = document.createElement("table");
    table.className = "trend-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    headRow.appendChild(cellEl("th", "", "trend-table-rowlabel"));
    axes.forEach((axis) => {
      headRow.appendChild(cellEl("th", axis.label));
      headRow.appendChild(cellEl("th", `${axis.label} benchmark`));
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.appendChild(cellEl("th", row.label, "trend-table-rowlabel"));
      axes.forEach((axis) => {
        const reading = readingFor(row, axis.id);
        tr.appendChild(cellEl("td", reading ? reading.valueDisplay : "—"));
        tr.appendChild(cellEl("td", reading && !isDirect ? reading.histDisplay : "—"));
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    detail.appendChild(table);

    const note = document.createElement("p");
    note.className = "trend-table-note";
    note.textContent = metrics.caption || "";
    detail.appendChild(note);

    return detail;
  }

  function cellEl(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value ?? "";
    if (className) node.className = className;
    return node;
  }

  async function build(signal) {
    /* 1 — the names and the rulers, before anything is measured on them. */
    axisNodes.forEach((axisNode) => {
      const base = axisNode.a * AXIS_STEP;
      stagger(axisNode.rows.map((n) => n.name), { delay: base, step: 60, duration: 320, y: 3, signal });
      axisNode.rows.forEach((n, i) =>
        strokeDraw(n.line, { delay: base + i * ROW_STEP, duration: 320, signal }));
    });

    /* 2 — the benchmark, as the rule every reading will be placed against.
     * It lands before any of them, or the comparison arrives before it has
     * something to be a comparison with. */
    await wait(300, signal);
    axisNodes.forEach((axisNode) => {
      axisNode.rows.forEach((n, i) => {
        const delay = axisNode.a * AXIS_STEP + i * ROW_STEP;
        fadeIn(n.zero, { delay, duration: 300, y: 0, signal });
      });
    });

    /* 3 — the distance, drawn out from the rule, then the reading at the end
     * of it. A flat row has no distance and skips the stem. */
    await wait(260, signal);
    axisNodes.forEach((axisNode) => {
      axisNode.rows.forEach((n, i) => {
        const delay = axisNode.a * AXIS_STEP + i * ROW_STEP;
        if (n.stem) strokeDraw(n.stem, { delay, duration: 420, signal });
        fadeIn(n.nowDot, { delay: delay + 240, duration: 320, y: 0, scaleFrom: 0.35, signal });
      });
    });

    /* 4 — the readings. These are the numbers the band exists to make
     * legible, so they roll up last and largest, and the verdict lands after
     * the numeral it is the judgement on. */
    await wait(380, signal);
    axisNodes.forEach((axisNode) => {
      axisNode.rows.forEach((n, i) => {
        const delay = axisNode.a * AXIS_STEP + i * ROW_STEP;
        fadeIn(n.val, { delay, duration: 340, y: 6, signal });
        countUp(n.val, n.display, { delay: delay + 90, duration: 720, signal });
        fadeIn(n.verdict, { delay: delay + 280, duration: 320, y: 0, x: -4, signal });
        fadeIn(n.base, { delay: delay + 360, duration: 300, y: 0, signal });
      });
    });

    await wait(320, signal);
    axisNodes.forEach((axisNode) =>
      stagger(axisNode.ticks, { delay: axisNode.a * AXIS_STEP, step: 50, duration: 300, y: 3, signal }));
    if (voidNote) fadeIn(voidNote, { duration: 380, y: 4, signal });
    fadeIn(key, { delay: 120, duration: 320, y: 0, signal });
    fadeIn(caption, { delay: 180, duration: 400, y: 5, signal });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
