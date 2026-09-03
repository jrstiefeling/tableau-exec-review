/* Current-against-historical readings, placed on shared axes.
 *
 * The general case this solves: several subjects each hold a reading and a
 * benchmark for the same measure, and the interesting comparison is two
 * comparisons at once — each subject against its own benchmark, and the
 * subjects against each other. A per-subject paired mark answers only the
 * first, which is what velocity and coverage were doing inside a matrix cell
 * on the Q3 tab: four dumbbells on four private scales, each about 400 square
 * pixels, so the only reading available was "up a bit" or "down a bit" and
 * never "and by the way this motion is a third above that one".
 *
 * One axis per measure, every subject on it. Position is then shared, so the
 * two questions are answered by the same mark.
 *
 * Nothing here is specific to coverage, to velocity, or to the Q3 tab. An axis
 * is a domain, a tick list and a formatter; a row is a label and one reading
 * per axis; a row that holds no reading for an axis is simply absent from it,
 * which is how the Analytics roll-up renders the non-additivity rule rather
 * than stating it. Any current-versus-historical pair on this board can mount
 * this by authoring those two lists.
 *
 * Three conventions are borrowed rather than invented, so this is one more
 * instance of the board's paired-comparison grammar and not a second grammar:
 * the hollow benchmark dot and filled reading dot are metricMatrix's, the
 * severed-benchmark X in direct mode is the same mark the void bullet and the
 * broken lineage arrow use, and flat is a case rather than a failure — equal
 * readings collapse to one neutral dot with no stem, because there was no
 * move to draw. */

import { chartRoot, svgEl, group, linearScale } from "../svg.js";
import { palette, toneColor, tierMeta } from "../palette.js";
import { strokeDraw, fadeIn, countUp, stagger, wait, veil } from "../anim.js";

/* The plot's own viewBox. Everything else about the layout is CSS grid, so
 * this only has to be a coordinate space wide enough that the end dots are not
 * clipped: x0/x1 leave a dot's radius of margin at both ends. */
const PLOT = { w: 240, h: 30, x0: 9, x1: 231, cy: 20 };

const DOT = { hist: 6.4, now: 8, flat: 4.4 };

/* Left to right, like every other portlet, because the page sweep hands this
 * one slot based on its horizontal centre and a build that ran in any other
 * direction would fight the sweep it is nested inside. */
const AXIS_STEP = 190;
const ROW_STEP = 90;

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

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

    const x = linearScale([0, Number(axis.domainMax) || 1], [PLOT.x0, PLOT.x1]);
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
      if (v <= 0) el.dataset.edge = "start";
      if (v >= (Number(axis.domainMax) || 1)) el.dataset.edge = "end";
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
    const value = Number(reading.value);
    const hist = Number(reading.hist);

    /* Severed rather than absent. `hist` is a governed measure — the same
     * fiscal quarter averaged over the prior two years — and a direct read
     * cannot say which window it was taken over, so the benchmark loses its
     * position while keeping its ring. What goes is the comparison, not the
     * reading. */
    const severed = isDirect;
    const flat = !severed && value === hist;
    const better = good === "down" ? value < hist : value > hist;
    const tint = severed ? p.inkSoft : (flat ? p.inkSoft : toneColor(better ? "positive" : "risk"));

    const rowEl = document.createElement("div");
    rowEl.className = "bxa-row";
    if (flat) rowEl.dataset.flat = "true";
    if (severed) rowEl.dataset.severed = "true";

    const name = document.createElement("p");
    name.className = "bxa-name";
    name.textContent = row.label || "";
    if (row.color) name.style.setProperty("--row-tint", row.color);
    rowEl.appendChild(name);

    const svg = chartRoot(PLOT.w, PLOT.h, {
      label: severed
        ? `${row.label} ${axis.label} ${reading.valueDisplay} — no benchmark without the semantic layer`
        : `${row.label} ${axis.label} ${reading.valueDisplay} against ${reading.histDisplay}`,
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

    const histX = severed ? PLOT.x0 : x(hist);
    const nowX = x(value);

    let stem = null;
    if (!flat && !severed) {
      stem = svgEl("path", {
        d: `M ${Math.min(histX, nowX)} ${PLOT.cy} H ${Math.max(histX, nowX)}`,
        stroke: tint,
        "stroke-width": 5,
        "stroke-linecap": "round",
        fill: "none",
        "vector-effect": "non-scaling-stroke",
        class: "bxa-stem"
      });
      marks.appendChild(stem);
    }

    const histDot = svgEl("circle", {
      cx: histX,
      cy: PLOT.cy,
      r: DOT.hist,
      fill: p.surface,
      stroke: severed ? meta.color : p.inkDim,
      "stroke-width": 1.7,
      "stroke-dasharray": severed ? "2 2" : null,
      "vector-effect": "non-scaling-stroke",
      class: "bxa-hist"
    });
    marks.appendChild(histDot);

    let severMark = null;
    if (severed) {
      severMark = group({ class: "bxa-sever" });
      const cx = (histX + nowX) / 2;
      const r = 3.4;
      [[-1, -1], [-1, 1]].forEach(([sx, sy]) => severMark.appendChild(svgEl("path", {
        d: `M ${cx + sx * r} ${PLOT.cy + sy * r} L ${cx - sx * r} ${PLOT.cy - sy * r}`,
        stroke: meta.color,
        "stroke-width": 1.6,
        "stroke-linecap": "round",
        "vector-effect": "non-scaling-stroke"
      })));
      marks.appendChild(severMark);
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

    /* The benchmark's own label, above its dot rather than below it, so it
     * never collides with the tick strip under the last row. Positioned in the
     * DOM off the same scale the dot was placed with. */
    const histLabel = document.createElement("span");
    histLabel.className = "bxa-histlab";
    const histPct = ((histX - PLOT.x0) / (PLOT.x1 - PLOT.x0)) * 100;
    histLabel.style.setProperty("--hist-x", `${histPct}%`);
    // A centred label at either end of the scale hangs outside the plot and
    // over the column beside it, which in direct mode — where the benchmark
    // falls back to the origin — is every row at once. Anchored inside at the
    // ends, the same rule the tick strip below already follows.
    if (histPct <= 4) histLabel.dataset.edge = "start";
    if (histPct >= 96) histLabel.dataset.edge = "end";
    histLabel.textContent = severed ? "no benchmark" : (reading.histDisplay || "");

    const plot = document.createElement("div");
    plot.className = "bxa-plotwrap";
    plot.appendChild(svg);
    plot.appendChild(histLabel);
    rowEl.appendChild(plot);

    const read = document.createElement("div");
    read.className = "bxa-read";

    const val = document.createElement("p");
    val.className = "bxa-val";
    val.style.setProperty("--val-tint", tint);
    read.appendChild(val);

    const delta = document.createElement("p");
    delta.className = "bxa-delta";
    delta.textContent = severed
      ? "no benchmark"
      : (flat ? (reading.flatDisplay || "flat") : (reading.deltaDisplay || ""));
    read.appendChild(delta);
    rowEl.appendChild(read);

    col.appendChild(rowEl);

    // The row itself is display:contents so its children can be cells of the
    // axis grid, which leaves it without a box to hit-test. The plot carries
    // the tip instead — it is the mark being explained in any case.
    ctx.tip(plot, severed
      ? `${row.label} · ${axis.label} ${reading.valueDisplay} — the benchmark is a governed measure over a stated window, and a direct read cannot say which window it was taken over.`
      : `${row.label} · ${axis.label} ${reading.valueDisplay} against ${reading.histDisplay}${flat ? " — equal" : ""}`);

    return {
      name, val, delta, histLabel,
      display: reading.valueDisplay || "",
      line, stem, histDot, nowDot, severMark,
      veil: [name, svg, line, stem, histDot, severMark, nowDot, histLabel, val, delta]
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

    /* 2 — where we were. The hollow dot lands first, so the benchmark is
     * established as the reference before the reading arrives to be compared
     * against it. */
    await wait(300, signal);
    axisNodes.forEach((axisNode) => {
      axisNode.rows.forEach((n, i) => {
        const delay = axisNode.a * AXIS_STEP + i * ROW_STEP;
        fadeIn(n.histDot, { delay, duration: 300, y: 0, scaleFrom: 0.4, signal });
        fadeIn(n.histLabel, { delay: delay + 140, duration: 300, y: 0, signal });
      });
    });

    /* 3 — the move, then where we are. A flat row has no move and skips the
     * stem; a severed one draws the X instead. */
    await wait(280, signal);
    axisNodes.forEach((axisNode) => {
      axisNode.rows.forEach((n, i) => {
        const delay = axisNode.a * AXIS_STEP + i * ROW_STEP;
        if (n.stem) strokeDraw(n.stem, { delay, duration: 420, signal });
        if (n.severMark) {
          Array.from(n.severMark.children).forEach((path, j) =>
            strokeDraw(path, { delay: delay + 120 + j * 110, duration: 260, signal }));
          fadeIn(n.severMark, { delay: delay + 120, duration: 200, y: 0, signal });
        }
        fadeIn(n.nowDot, { delay: delay + 260, duration: 320, y: 0, scaleFrom: 0.35, signal });
      });
    });

    /* 4 — the readings. These are the numbers the band exists to make
     * legible, so they roll up last and largest. */
    await wait(380, signal);
    axisNodes.forEach((axisNode) => {
      axisNode.rows.forEach((n, i) => {
        const delay = axisNode.a * AXIS_STEP + i * ROW_STEP;
        fadeIn(n.val, { delay, duration: 340, y: 6, signal });
        countUp(n.val, n.display, { delay: delay + 90, duration: 720, signal });
        fadeIn(n.delta, { delay: delay + 280, duration: 320, y: 0, x: -4, signal });
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
