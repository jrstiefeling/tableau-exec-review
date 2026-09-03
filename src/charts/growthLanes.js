/* Growth lanes — several subjects on one axis per measure, oriented so that
 * better is always the same direction.
 *
 * The general case this solves: a small set of subjects each hold a rate for
 * the same few measures, the rates carry mixed polarity, and the finding is
 * which subjects are moving the right way rather than what any one of them
 * did. A grid of cells answers the second question and buries the first,
 * because the reader has to hold nine signs and nine polarities at once to
 * see a pattern that is actually one shape.
 *
 * One lane per measure, every subject on it, and the axis turned by the
 * measure's own authored `goodDirection` so that favourable is to the right
 * on every lane. The signs printed on the marks never move — only the
 * direction of the axis does, and each lane says so under its own name. That
 * is the board's authored polarity rendered instead of stated, and it is the
 * whole reason this form exists: with it, "which subjects are contributing"
 * is a shape you see before you read a number.
 *
 * Three conventions are borrowed rather than invented:
 *
 *  - the symlog scale and its decade rules are growth.js, shared with the
 *    product and segment tabs, so a rate means the same distance everywhere;
 *  - the roll-up is a vertical reference rule rather than a third dot,
 *    because a parent is a reference for its children and not a peer among
 *    them — and because two dots a few percent of the half-width apart is a
 *    collision the form should not have to survive;
 *  - the alternate basis is a dashed ghost tick, named in the strip at the
 *    foot, which is how the board has always carried a second stated basis.
 *
 * Nothing here is specific to ACV, to motions or to the Q3 tab. A lane is a
 * label, a polarity and a set of cells; a subject is a name, a colour and a
 * level. Any measure set with an authored good direction can mount it.
 *
 * Marks are placed as DOM percentages over an SVG carrying only the lane's
 * furniture. The furniture stretches with preserveAspectRatio="none", which
 * is right for rules and wrong for dots — a circle in a box whose aspect does
 * not match its viewBox is an ellipse, and these lanes are five times wider
 * than they are tall. So the rules are drawn and the marks are placed, and
 * neither has to compromise for the other.
 *
 * Every mark hangs off a zero-width pin at its own x rather than centring
 * itself with a transform. The animation primitives own `style.transform`
 * for the length of a build, so a mark that needed one for its geometry
 * would sit half a mark off-centre until the build finished and then snap. */

import { chartRoot, svgEl, group } from "../svg.js";
import { palette, toneOf, toneColor } from "../palette.js";
import { growthFraction, DECADE_FRACTIONS, CORE_FRACTION } from "./growth.js";
import { fadeIn, countUp, stagger, strokeDraw, growFrom, wait, veil } from "../anim.js";

/* The lane's own coordinate space. Only furniture lives in it, so this only
   has to be tall enough that a dashed rule reads as dashed. */
const LANE = { w: 240, h: 44, cy: 22 };

/* Left to right, like every other portlet: the page sweep hands this one slot
   based on its horizontal centre, and a build running any other way would
   fight the sweep it is nested inside. */
const LANE_STEP = 150;

/* How close to an end a mark may sit before its label is turned inward. */
const EDGE = 22;

export function mount(host, ctx) {
  const { metrics } = ctx;
  const p = palette();

  const columns = metrics.columns || [];
  const rows = metrics.rows || [];
  const rollup = rows.find((r) => r.id === metrics.rollup) || null;
  const children = rows.filter((r) => r !== rollup);

  const wrap = document.createElement("div");
  wrap.className = "gln";

  /* ------------------------------ the key ------------------------------- */

  /* Weight, read once. Every lane is a rate, and a rate says nothing about
   * how much of the book it applies to — so the subjects' levels, on one
   * shared scale, go here at the top rather than being repeated as a fourth
   * column on all three lanes.
   *
   * These are three positions on a common scale, NOT a composition. The
   * distinction is load-bearing on this board: one of the measures on this
   * tab has children that do not sum to their parent, so nothing here may
   * tile, stack or share a whole. Position is honest where area would not be.
   *
   * The value sits outside its bar rather than inside it. Inside is where it
   * was first, and the smallest of the three subjects is about a sixth of the
   * largest — at 1024 that bar is under thirty pixels and the numeral was
   * clipped by its own mark. */
  const keySpec = metrics.key || null;
  const keyRows = [];
  let keyNote = null;
  if (keySpec) {
    const keyEl = document.createElement("div");
    keyEl.className = "gln-key";
    const domainMax = Number(keySpec.domainMax) || 1;

    rows.forEach((row) => {
      const cell = cellFor(row, keySpec.columnId);
      if (!cell) return;

      const item = document.createElement("div");
      item.className = "gln-keyitem";
      item.dataset.level = String(row.level ?? 0);
      if (row.color) item.style.setProperty("--row-tint", row.color);

      /* The glyph each subject wears on the lanes below — a dot for a
         subject, a rule for the roll-up. That is what makes this a legend for
         marks already on the page rather than a second reading of them. */
      const glyph = document.createElement("i");
      glyph.className = "gln-keyglyph";
      glyph.dataset.kind = row === rollup ? "rule" : "dot";
      item.appendChild(glyph);

      const name = document.createElement("p");
      name.className = "gln-keyname";
      name.textContent = row.label || "";
      item.appendChild(name);

      const track = document.createElement("p");
      track.className = "gln-keybar";
      const fill = document.createElement("i");
      fill.style.width = `${clamp01(Number(cell.value) / domainMax) * 100}%`;
      track.appendChild(fill);
      item.appendChild(track);

      const val = document.createElement("span");
      val.className = "gln-keyval";
      item.appendChild(val);

      ctx.tip(item, `${row.label} · ${keySpec.tipLabel || "level"} ${cell.display}`);
      keyEl.appendChild(item);
      keyRows.push({ item, glyph, fill, val, display: cell.display || "" });
    });

    if (keySpec.label) {
      keyNote = document.createElement("p");
      keyNote.className = "gln-keynote";
      keyNote.textContent = keySpec.label;
      keyEl.appendChild(keyNote);
    }
    wrap.appendChild(keyEl);
  }

  /* ----------------------------- the lanes ------------------------------ */

  const lanesEl = document.createElement("div");
  lanesEl.className = "gln-lanes";
  wrap.appendChild(lanesEl);
  const laneNodes = columns.map(buildLane);

  /* ------------------------- the shared ruler --------------------------- */

  /* One tick strip for all three lanes, in the same grid column as the plots
   * so it cannot drift out of alignment with the marks it is the ruler for.
   * Ticks are authored: a renderer choosing its own interval would be
   * choosing how coarse the reading is.
   *
   * The strip is drawn unmirrored. All three lanes share it and two of them
   * read it left to right, so a mirrored strip would have to be per-lane —
   * and three rulers under three lanes is the thing this form exists to
   * avoid. The mirrored lane names its reversal on its own label instead. */
  const stripRow = document.createElement("div");
  stripRow.className = "gln-striprow";
  stripRow.appendChild(document.createElement("span"));

  const strip = document.createElement("div");
  strip.className = "gln-strip";
  const tickEls = (metrics.axisTicks || []).map((tick) => {
    const el = document.createElement("span");
    el.className = "gln-tick";
    const x = pct(Number(tick.value), "up");
    el.style.left = `${x.toFixed(2)}%`;
    if (Number(tick.value) === 0) el.dataset.kind = "zero";
    if (x <= 2) el.dataset.edge = "start";
    else if (x >= 98) el.dataset.edge = "end";
    el.textContent = tick.label ?? String(tick.value);
    strip.appendChild(el);
    return el;
  });
  stripRow.appendChild(strip);
  wrap.appendChild(stripRow);

  /* --------------------- the second stated basis ------------------------ */

  /* Two authored readings of the same measure at a different org grouping.
   * Stated, never differenced: the disagreement is the reader's to see, and
   * arithmetic across it would be reconciliation. Each entry carries the
   * glyph of the mark that holds it, so the strip names the ghost tick on
   * the lane rather than floating beside it unattached.
   *
   * Where no alternate basis is authored — which is the whole of direct mode,
   * since there is nothing left to arbitrate between once both bases are
   * inferred — the strip renders its own void state rather than vanishing. A
   * strip that disappears is a strip nobody notices went. */
  const altEntries = columns
    .map((column) => ({ column, cell: rollup && cellFor(rollup, column.id) }))
    .filter((e) => e.cell && e.cell.altBasis)
    .map((e) => ({ column: e.column, alt: e.cell.altBasis }));

  const altParts = [];
  if (metrics.altBasisLabel) {
    const altStrip = document.createElement("p");
    altStrip.className = "gln-alt";
    if (!altEntries.length) altStrip.dataset.void = "true";

    const head = document.createElement("b");
    head.textContent = metrics.altBasisLabel;
    altStrip.appendChild(head);
    altParts.push(head);

    if (altEntries.length) {
      altEntries.forEach(({ column, alt }) => {
        const span = document.createElement("span");
        span.className = "gln-altitem";
        span.innerHTML =
          `<i class="gln-altglyph"></i>${esc(column.label)} ` +
          `<b>${esc(alt.label || "")} ${esc(alt.display || "")}</b> · ${esc(alt.yoyDisplay || "")}`;
        altStrip.appendChild(span);
        altParts.push(span);
      });
    } else if (metrics.altBasisVoidNote) {
      const span = document.createElement("span");
      span.className = "gln-altvoid";
      span.textContent = metrics.altBasisVoidNote;
      altStrip.appendChild(span);
      altParts.push(span);
    }

    if (metrics.axisNote) {
      const note = document.createElement("em");
      note.textContent = metrics.axisNote;
      altStrip.appendChild(note);
      altParts.push(note);
    }
    wrap.appendChild(altStrip);
  }

  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  /* Every animated node, the conditional ones included: the ghost tick a lane
   * without an alternate basis never draws, the roll-up rule a set with no
   * parent never draws, the void strip that exists only in direct mode.
   * settle() is what stops any of them being left invisible when the beat
   * that would have revealed it never runs, so this list is exhaustive on
   * purpose — a mark missing from it is a mark that disappears on a tab the
   * viewer arrived at with reduced motion or mid-sweep. */
  const curtain = veil([
    keyRows.map((k) => [k.item, k.fill, k.val]),
    keyNote,
    laneNodes.map((n) => n.veil),
    tickEls,
    altParts
  ].flat(Infinity).filter(Boolean));
  curtain.hide();

  /* ------------------------------ helpers ------------------------------- */

  /* Cells are positional against `columns`, which is how the rest of the
     board indexes a row's measures and is what lets a direct-mode overlay
     touch cell 2 of row 1 without restating the other eight. */
  function cellFor(row, columnId) {
    const index = columns.findIndex((c) => c.id === columnId);
    return (row.cells || [])[index] || null;
  }

  /* Signed position along a lane as a percentage of its width, with the
     measure's polarity applied. This is the only place the mirror happens. */
  function pct(yoy, goodDirection) {
    const f = growthFraction(yoy);
    if (f === null) return 50;
    return 50 + (goodDirection === "down" ? -1 : 1) * f * 50;
  }

  function clamp01(v) {
    return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  }

  /* A zero-width column at one x on a lane. Everything a mark needs to hang
     off that x hangs off this, so nothing has to centre itself. */
  function pin(plot, x, className) {
    const el = document.createElement("div");
    el.className = `gln-pin ${className || ""}`.trim();
    el.style.left = `${x.toFixed(2)}%`;
    plot.appendChild(el);
    return el;
  }

  function buildLane(column, i) {
    const good = column.goodDirection || "up";

    const lane = document.createElement("div");
    lane.className = "gln-lane";
    lane.dataset.mirrored = String(good === "down");

    /* --- the label --- */
    const lab = document.createElement("div");
    lab.className = "gln-lanelab";

    const name = document.createElement("p");
    name.className = "gln-lanename";
    name.textContent = column.label || "";
    lab.appendChild(name);

    /* The polarity, and on a mirrored lane the fact of the mirror. Stated on
       the lane rather than in a legend, because a legend for a thing that is
       true of one lane out of three is a lookup the reader will not do. */
    const pol = document.createElement("p");
    pol.className = "gln-lanepol";
    pol.textContent = [column.polarityWord, good === "down" ? column.mirrorNote : null]
      .filter(Boolean).join(" · ");
    lab.appendChild(pol);
    lane.appendChild(lab);

    /* --- the furniture --- */
    const plot = document.createElement("div");
    plot.className = "gln-plotwrap";

    const svg = chartRoot(LANE.w, LANE.h, {
      label: `${column.label} year over year by ${metrics.subjectWord || "row"}`,
      class: "gln-plot",
      preserveAspectRatio: "none"
    });
    const furniture = group();
    svg.appendChild(furniture);

    const baseline = svgEl("path", {
      d: `M 0 ${LANE.cy} H ${LANE.w}`,
      stroke: p.track,
      "stroke-width": 2,
      fill: "none",
      "vector-effect": "non-scaling-stroke"
    });
    furniture.appendChild(baseline);

    /* The decade rules. A symlog axis without visible decade marks is a lie
       by omission — these are what say that the distance from 0 to 10% is
       not the distance from 100% to 1000%. The core rule is lighter than the
       decades because it is a threshold, not a compression boundary. */
    const rules = [];
    [[CORE_FRACTION, "core"], ...DECADE_FRACTIONS.map((f) => [f, "decade"])].forEach(([f, kind]) => {
      [1, -1].forEach((sign) => {
        const x = LANE.w / 2 + sign * f * (LANE.w / 2);
        const rule = svgEl("path", {
          d: `M ${x} 5 V ${LANE.h - 5}`,
          stroke: p.grid,
          "stroke-width": kind === "decade" ? 1.2 : 1,
          "stroke-dasharray": kind === "decade" ? "2.5 3" : "1.5 3.5",
          fill: "none",
          "vector-effect": "non-scaling-stroke"
        });
        furniture.appendChild(rule);
        rules.push(rule);
      });
    });

    const zero = svgEl("path", {
      d: `M ${LANE.w / 2} 1 V ${LANE.h - 1}`,
      stroke: p.axis,
      "stroke-width": 1.4,
      fill: "none",
      "vector-effect": "non-scaling-stroke"
    });
    furniture.appendChild(zero);
    plot.appendChild(svg);

    /* --- the end hints --- */
    /* Two words, one at each end, and they are the mirror's whole user
       interface: on the mirrored lane "better" still sits on the right and
       the tick under it still reads negative, which is the reading the lane
       is asking for and the point at which a reader either accepts it or
       does not. */
    const ends = ["worse", "better"].map((side) => {
      if (!metrics.endLabels || !metrics.endLabels[side]) return null;
      const el = document.createElement("span");
      el.className = "gln-end";
      el.dataset.side = side;
      el.textContent = metrics.endLabels[side];
      plot.appendChild(el);
      return el;
    }).filter(Boolean);

    /* --- the marks --- */
    const marks = children
      .map((row) => {
        const cell = cellFor(row, column.id);
        if (!cell || cell.yoy === null || cell.yoy === undefined) return null;
        return { row, cell, x: pct(cell.yoy, good) };
      })
      .filter(Boolean)
      .sort((a, b) => a.x - b.x);

    /* Labels are sided by rank within the lane, not against the roll-up.
       Both children can land the same side of their parent — in direct mode,
       on this tab's third lane, both do — and two labels reading outward
       from marks a few percent apart is the one collision this composition
       can produce. Leftmost reads left, rightmost reads right, and a mark
       close enough to an end that its label would run off the plot turns
       inward instead, unless turning it in would put it on top of its
       neighbour. */
    marks.forEach((m, j) => { m.side = j === 0 ? "l" : "r"; });
    marks.forEach((m, j) => {
      const want = m.x < EDGE ? "r" : m.x > 100 - EDGE ? "l" : m.side;
      const clash = marks.some((o, k) => k !== j && o.side === want);
      if (!clash) m.side = want;
    });

    /* The spread. Its length IS the finding — how far apart the subjects
       have moved on this measure — so it is a drawn interval rather than a
       gap the reader is left to measure between two dots. */
    let spread = null;
    if (marks.length > 1) {
      const lo = marks[0].x;
      const hi = marks[marks.length - 1].x;
      const span = pin(plot, lo, "gln-spanpin");
      span.style.width = `${(hi - lo).toFixed(2)}%`;
      spread = document.createElement("i");
      spread.className = "gln-spread";
      span.appendChild(spread);
    }

    /* The roll-up, as a reference rule. Built before the children so they
       stack over it: the parent is the line the children are read against,
       not a peer competing with them for the same z. */
    let rollRule = null;
    let rollLab = null;
    const rollCell = rollup && cellFor(rollup, column.id);
    if (rollCell && rollCell.yoy !== null && rollCell.yoy !== undefined) {
      const rx = pct(rollCell.yoy, good);
      const rollPin = pin(plot, rx);
      rollPin.style.setProperty("--row-tint", rollup.color || p.axis);

      rollRule = document.createElement("i");
      rollRule.className = "gln-roll";
      rollPin.appendChild(rollRule);

      rollLab = document.createElement("span");
      rollLab.className = "gln-rolllab";
      rollLab.dataset.side = rx > 50 ? "l" : "r";
      rollLab.innerHTML =
        `${esc(rollup.label)} <b style="--mark-tint:${toneColor(toneOf(rollCell.yoy, good))}">` +
        `${esc(rollCell.yoyDisplay || "")}</b> · ${esc(rollCell.display || "")}`;
      rollPin.appendChild(rollLab);

      ctx.tip(rollPin, `${rollup.label} · ${column.label} ${rollCell.yoyDisplay} on ${rollCell.display}`);
    }

    /* The alternate basis, as a ghost tick on the same lane. Two stated
       readings side by side, no arithmetic between them. */
    let ghost = null;
    const alt = rollCell && rollCell.altBasis;
    if (alt && alt.yoy !== null && alt.yoy !== undefined) {
      const gpin = pin(plot, pct(alt.yoy, good));
      ghost = document.createElement("i");
      ghost.className = "gln-ghost";
      gpin.appendChild(ghost);
      ctx.tip(gpin, `${alt.label} — a second stated basis for ${column.label}: ${alt.display} · ${alt.yoyDisplay}`);
    }

    const markNodes = marks.map((m) => {
      const mpin = pin(plot, m.x);
      mpin.style.setProperty("--row-tint", m.row.color || p.axis);

      const dot = document.createElement("i");
      dot.className = "gln-dot";
      mpin.appendChild(dot);

      const dotLab = document.createElement("span");
      dotLab.className = "gln-dotlab";
      dotLab.dataset.side = m.side;
      const rate = document.createElement("b");
      rate.style.setProperty("--mark-tint", toneColor(toneOf(m.cell.yoy, good)));
      const lvl = document.createElement("em");
      lvl.textContent = m.cell.display || "";
      dotLab.append(rate, lvl);
      mpin.appendChild(dotLab);

      ctx.tip(mpin, `${m.row.label} · ${column.label} ${m.cell.yoyDisplay} on ${m.cell.display}`);

      return { dot, dotLab, rate, lvl, display: m.cell.yoyDisplay || "" };
    });

    lane.appendChild(plot);
    lanesEl.appendChild(lane);

    /* The veil holds exactly the nodes a beat below reveals, and nothing
       else. A node in the list that no beat touches never comes back —
       notably the <svg> itself, which is not here: veiling a parent whose
       children are revealed individually hides the lot. */
    return {
      i, baseline, rules, zero, ends, spread, rollRule, rollLab, ghost, marks: markNodes,
      veil: [name, pol, baseline, rules, zero, ends, spread, rollRule, rollLab, ghost,
        markNodes.map((n) => [n.dot, n.dotLab, n.rate, n.lvl])]
    };
  }

  /* ------------------------------ the table ----------------------------- */

  /* The flip side carries the same figures as a table, both bases included,
     because a mirrored axis is a reading aid and not a substitute for being
     able to read the numbers straight. */
  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    const table = document.createElement("table");
    table.className = "trend-table";

    const head = document.createElement("tr");
    head.appendChild(cellEl("th", "", "trend-table-rowlabel"));
    columns.forEach((column) => {
      head.appendChild(cellEl("th", column.label));
      head.appendChild(cellEl("th", `${column.label} Y/Y`));
    });
    const thead = document.createElement("thead");
    thead.appendChild(head);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.appendChild(cellEl("th", row.label, "trend-table-rowlabel"));
      columns.forEach((column) => {
        const cell = cellFor(row, column.id);
        tr.appendChild(cellEl("td", cell ? cell.display : "—"));
        tr.appendChild(cellEl("td", cell ? cell.yoyDisplay : "—"));
      });
      tbody.appendChild(tr);

      columns.forEach((column) => {
        const cell = cellFor(row, column.id);
        if (!cell || !cell.altBasis) return;
        const altRow = document.createElement("tr");
        altRow.dataset.alt = "true";
        altRow.appendChild(cellEl("th", `${row.label} · ${cell.altBasis.label}`, "trend-table-rowlabel"));
        columns.forEach((c2) => {
          const same = c2.id === column.id;
          altRow.appendChild(cellEl("td", same ? cell.altBasis.display : ""));
          altRow.appendChild(cellEl("td", same ? cell.altBasis.yoyDisplay : ""));
        });
        tbody.appendChild(altRow);
      });
    });
    table.appendChild(tbody);
    detail.appendChild(table);

    if (metrics.caption) {
      const note = document.createElement("p");
      note.className = "trend-table-note";
      note.textContent = metrics.caption;
      detail.appendChild(note);
    }
    return detail;
  }

  function cellEl(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value ?? "";
    if (className) node.className = className;
    return node;
  }

  /* ---------------------------- choreography ---------------------------- */

  async function build(signal) {
    /* 1 — the lanes and their rulers, before anything is measured on them. */
    laneNodes.forEach((lane) => {
      const base = lane.i * LANE_STEP;
      strokeDraw(lane.baseline, { delay: base, duration: 380, signal });
      fadeIn(lane.zero, { delay: base + 120, duration: 300, y: 0, signal });
      stagger(lane.rules, { delay: base + 160, step: 24, duration: 260, y: 0, signal });
      stagger(lane.ends, { delay: base + 220, step: 60, duration: 300, y: 0, signal });
    });

    /* 2 — the reference the children are read against, before the children.
       Same beat order as the benchmark axes: the thing being compared to
       lands first, or the comparison arrives before it has a subject. */
    await wait(320, signal);
    laneNodes.forEach((lane) => {
      const base = lane.i * LANE_STEP;
      if (lane.rollRule) fadeIn(lane.rollRule, { delay: base, duration: 320, y: 0, signal });
      if (lane.rollLab) fadeIn(lane.rollLab, { delay: base + 140, duration: 320, y: -3, signal });
      if (lane.ghost) fadeIn(lane.ghost, { delay: base + 220, duration: 300, y: 0, signal });
    });

    /* 3 — the separation, drawn as an interval rather than left as a gap. */
    await wait(240, signal);
    laneNodes.forEach((lane) => {
      if (lane.spread) growFrom(lane.spread, { axis: "x", origin: "left", delay: lane.i * LANE_STEP, duration: 460, signal });
    });

    /* 4 — where each subject sits, then what it reads. The rate counts up
       last: it is the number the lane exists to make legible. */
    await wait(220, signal);
    laneNodes.forEach((lane) => {
      lane.marks.forEach((m, j) => {
        const delay = lane.i * LANE_STEP + j * 90;
        fadeIn(m.dot, { delay, duration: 340, y: 0, scaleFrom: 0.35, signal });
        fadeIn(m.dotLab, { delay: delay + 160, duration: 320, y: 4, signal });
        fadeIn(m.lvl, { delay: delay + 220, duration: 300, y: 0, signal });
        countUp(m.rate, m.display, { delay: delay + 200, duration: 620, signal });
      });
    });

    /* 5 — weight, the ruler and the second basis. The key lands after the
       lanes rather than before them: it is context for the rates, not a
       reading competing with them. */
    await wait(340, signal);
    stagger(keyRows.map((k) => k.item), { step: 70, duration: 320, y: 4, signal });
    keyRows.forEach((k, j) => {
      growFrom(k.fill, { axis: "x", origin: "left", delay: j * 70, duration: 420, signal });
      countUp(k.val, k.display, { delay: j * 70 + 120, duration: 540, signal });
    });
    if (keyNote) fadeIn(keyNote, { delay: 220, duration: 320, y: 0, signal });

    await wait(200, signal);
    stagger(tickEls, { step: 40, duration: 300, y: 3, signal });
    stagger(altParts, { delay: 120, step: 70, duration: 340, y: 4, signal });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
