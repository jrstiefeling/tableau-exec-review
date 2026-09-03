/* Four product lines across four segments, on one shared growth axis.
 *
 * This replaces the 7x4 matrix on tab 3. The matrix drew 28 cells on 28
 * miniature axes, so comparing Cloud-in-ENTR to Cloud-in-PubSec meant
 * comparing two rulers a column apart, and the tab's actual argument — that
 * the four segments inside a product line agree while the four product lines
 * do not — was left for the reader to compute across a grid. At 1024x580 that
 * is roughly 55px of axis per cell and nobody computes anything.
 *
 * The slope form puts all sixteen leaf readings on one axis. Vertical
 * distance between lines is the product effect; the slope of each line is the
 * segment effect. Both are visible at once, which is what makes it a
 * three-second read rather than a grid to be worked through.
 *
 * Only the four LEAF rows are drawn. The three roll-up rows are sums of them
 * and are carried in full on the Analytics Performance tab, which
 * metrics.allSegmentsNote already says. They stay in metrics.rows so the
 * expand table and the Direct-mode row overrides — which are keyed by row
 * index — keep working untouched.
 *
 * What the picture is for: Cloud and Server very nearly coincide. That is not
 * a rendering accident to be nudged apart, it is the finding. $100M of
 * platform ACV moved as a single block at about -40% and no segment escaped
 * it. Next and CRMA, nominally one motion, are 429 points apart. So the right
 * strip groups the lines by motion and prints each motion's internal span:
 * one motion is real, the other is a bucket.
 *
 * Marks are SVG, every glyph of text is DOM, and the box is fixed so the four
 * columns land on identical offsets at every width — the same deal
 * growthMatrix takes, and for the same reason. */

import { chartRoot, group, svgEl, linePath } from "../svg.js";
import { palette, toneOf, toneColor } from "../palette.js";
import { growthFraction, GROWTH_TICKS } from "./growth.js";
import { strokeDraw, fadeIn, stagger, wait, veil } from "../anim.js";

const BOX = { w: 780, h: 366 };
const PAD = { l: 46, r: 186, t: 14, b: 30 };
/* Inset so the ENTR and PubSec marks are not welded to the plot edge, and so
 * a dot at either end has room for its stroke. */
const INSET = 16;

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const degraded = isDirect && (tier === "red" || tier === "grey");

  const segments = metrics.segments || [];
  const stakeMax = Number(metrics.stakeMax) || 1;
  const good = metrics.goodDirection || "up";
  const leafLevel = (metrics.interval && metrics.interval.leafLevel) != null
    ? metrics.interval.leafLevel
    : 2;

  const allRows = metrics.rows || [];
  const rows = allRows.filter((r) => r.level === leafLevel);

  /* The motion each leaf belongs to is already authored: a leaf's `parent` is
   * a level-1 row whose label names the motion. Read rather than hardcoded,
   * so re-parenting a product line in the data moves it here too. */
  const motionOf = (row) => allRows.find((r) => r.id === row.parent) || null;
  const motions = [];
  rows.forEach((row) => {
    const m = motionOf(row);
    const key = m ? m.id : "_";
    let entry = motions.find((x) => x.key === key);
    if (!entry) {
      entry = { key, row: m, members: [] };
      motions.push(entry);
    }
    entry.members.push(row);
  });

  const plotW = BOX.w - PAD.l - PAD.r;
  const plotH = BOX.h - PAD.t - PAD.b;
  const midY = PAD.t + plotH / 2;
  const halfH = plotH / 2;
  const span = plotW - INSET * 2;
  const colX = (i) => PAD.l + INSET
    + (segments.length > 1 ? (i * span) / (segments.length - 1) : span / 2);
  const yOf = (yoy) => midY - growthFraction(yoy) * halfH;

  const wrap = document.createElement("div");
  wrap.className = "slope";

  /* preserveAspectRatio="none", the same deal the rest of the board takes: the
   * plot stretches to whatever box the column gives it and every glyph of text
   * is DOM, so nothing letterboxes and no label drifts off its mark. The marks
   * that cannot survive that stretch are the dots — a circle in a stretched
   * viewBox is an upright ellipse — so those are DOM too, positioned on the
   * same fractions the line vertices use. */
  const svg = chartRoot(BOX.w, BOX.h, {
    class: "slope-chart",
    preserveAspectRatio: "none",
    label: `Y/Y by product line across ${segments.length} segments`
  });

  /* ------------------------------- scaffold ------------------------------- */

  const scaffold = group({ class: "slope-scaffold" });
  svg.appendChild(scaffold);

  /* The core band. Inside ±10% the axis is linear, and shading it is what
   * stops a reader reading the compressed middle as a dead zone. */
  const coreTop = yOf(10);
  const coreBand = svgEl("rect", {
    x: PAD.l, y: coreTop, width: plotW, height: yOf(-10) - coreTop,
    fill: p.warn || "#8A6D1F", "fill-opacity": 0.07, class: "slope-core"
  });
  scaffold.appendChild(coreBand);

  const gridNodes = [];
  const tickNodes = [];
  GROWTH_TICKS.forEach((t) => {
    const levels = t.at === 0 ? [0] : [t.at, -t.at];
    levels.forEach((v) => {
      const y = yOf(v);
      const isZero = v === 0;
      const line = svgEl("path", {
        d: `M ${PAD.l} ${y} H ${PAD.l + plotW}`,
        stroke: isZero ? "#17181C" : "rgba(23,24,28,0.22)",
        "stroke-opacity": isZero ? 0.45 : 0.5,
        "stroke-width": isZero ? 1.2 : 1,
        "stroke-dasharray": isZero ? null : "1.5 3",
        fill: "none", "vector-effect": "non-scaling-stroke",
        class: isZero ? "slope-zero" : "slope-grid"
      });
      scaffold.appendChild(line);
      gridNodes.push(line);

      const label = document.createElement("span");
      label.className = "slope-ytick";
      label.textContent = isZero ? "0" : `${v < 0 ? "−" : "+"}${Math.abs(v)}%`;
      label.style.setProperty("--at-y", `${(y / BOX.h) * 100}%`);
      tickNodes.push(label);
    });
  });

  /* ------------------------------- the lines ------------------------------ */

  const lineLayer = group({ class: "slope-lines" });
  svg.appendChild(lineLayer);

  /* The DOM marks, in mount order, appended once the plot wrapper exists. */
  const markNodes = [];
  const lines = [];
  rows.forEach((row) => {
    const pts = segments.map((seg, i) => ({
      seg, i,
      x: colX(i),
      y: yOf(row.yoy[i]),
      yoy: row.yoy[i],
      yoyDisplay: row.yoyDisplay[i],
      value: row.values[i],
      display: row.display[i]
    }));

    const path = svgEl("path", {
      d: linePath(pts.map((pt) => ({ x: pt.x, y: pt.y }))),
      fill: "none",
      stroke: row.color,
      "stroke-width": 2.1,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "vector-effect": "non-scaling-stroke",
      class: "slope-line"
    });
    lineLayer.appendChild(path);

    const dots = pts.map((pt) => {
      const dot = document.createElement("span");
      dot.className = "slope-dot";
      /* Area carries the ACV, so the channel is the square root and the floor
       * stops the $1M cells disappearing under their own stroke. */
      const k = Math.max(0.26, Math.sqrt(Math.max(0, pt.value) / stakeMax));
      dot.style.setProperty("--at-x", `${(pt.x / BOX.w) * 100}%`);
      dot.style.setProperty("--at-y", `${(pt.y / BOX.h) * 100}%`);
      dot.style.setProperty("--k", k.toFixed(3));
      dot.style.borderColor = row.color;
      markNodes.push(dot);

      /* A generous transparent hit target. The smallest authored dot is a few
       * pixels across and nobody hovers that. */
      const hit = document.createElement("span");
      hit.className = "slope-hit";
      hit.style.setProperty("--at-x", `${(pt.x / BOX.w) * 100}%`);
      hit.style.setProperty("--at-y", `${(pt.y / BOX.h) * 100}%`);
      hit.tabIndex = 0;
      hit.setAttribute("role", "img");
      hit.setAttribute("aria-label", cellTip(row, pt));
      markNodes.push(hit);
      ctx.tip(hit, cellTip(row, pt));
      return dot;
    });

    lines.push({ row, pts, path, dots });
  });

  /* --------------------------- segment x labels --------------------------- */

  const xLabels = segments.map((seg, i) => {
    const el = document.createElement("span");
    el.className = "slope-xtick";
    el.textContent = seg.short || seg.label;
    el.style.setProperty("--at-x", `${(colX(i) / BOX.w) * 100}%`);
    if (seg.label && seg.label !== el.textContent) el.title = seg.label;
    return el;
  });

  /* ------------------------- the motion right strip ------------------------ */

  /* The lines are already two hue families. What the strip adds is the name of
   * the grouping and the one number that says whether the grouping is real:
   * the span between its members at All Segments. Platform's members are 2
   * points apart and Embedded's are 429, which is the whole argument for
   * treating one as a motion and not the other. */

  const strip = document.createElement("div");
  strip.className = "slope-strip";

  const motionNodes = [];
  const endNodes = [];

  motions.forEach((m) => {
    const block = document.createElement("div");
    block.className = "slope-motion";
    block.style.setProperty("--motion-color", (m.row && m.row.color) || p.ink);

    /* Anchor the block on the mean of its members' last marks, so the strip
     * reads against the lines rather than as a legend parked beside them. */
    const ys = m.members.map((row) => yOf(row.yoy[segments.length - 1]));
    const anchor = ys.reduce((a, b) => a + b, 0) / ys.length;
    block.style.setProperty("--at-y", `${(anchor / BOX.h) * 100}%`);

    const head = document.createElement("p");
    head.className = "slope-motion-name";
    head.textContent = motionName(m);
    block.appendChild(head);

    m.members.forEach((row) => {
      const line = document.createElement("p");
      line.className = "slope-motion-member";

      const swatch = document.createElement("i");
      swatch.style.background = row.color;
      line.appendChild(swatch);

      const name = document.createElement("b");
      name.textContent = shortName(row);
      line.appendChild(name);

      const rate = allSegRate(row);
      if (rate) {
        const el = document.createElement("span");
        el.textContent = rate.display;
        el.style.color = toneColor(toneOf(rate.value, good));
        line.appendChild(el);
      }
      block.appendChild(line);
      endNodes.push(line);
    });

    const spanEl = document.createElement("p");
    spanEl.className = "slope-motion-span";
    spanEl.textContent = motionSpanText(m);
    block.appendChild(spanEl);

    strip.appendChild(block);
    motionNodes.push(block);
  });

  /* ------------------------------- verdict -------------------------------- */

  const verdict = document.createElement("div");
  verdict.className = "slope-verdict";
  (metrics.verdict || []).forEach((v) => {
    const cell = document.createElement("div");
    cell.className = "slope-verdict-cell";
    const num = document.createElement("span");
    num.className = "slope-verdict-num";
    num.textContent = v.value;
    if (v.tone) num.style.color = toneColor(v.tone);
    const lab = document.createElement("span");
    lab.className = "slope-verdict-lab";
    lab.textContent = v.label;
    cell.appendChild(num);
    cell.appendChild(lab);
    verdict.appendChild(cell);
  });

  if (metrics.verdictNote) {
    const note = document.createElement("p");
    note.className = "slope-verdict-note derived";
    const b = document.createElement("b");
    b.textContent = "Derived · ";
    note.appendChild(b);
    note.appendChild(document.createTextNode(metrics.verdictNote));
    verdict.appendChild(note);
  }

  /* ------------------------------- assembly ------------------------------- */

  const plot = document.createElement("div");
  plot.className = "slope-plot";
  plot.appendChild(svg);
  markNodes.forEach((n) => plot.appendChild(n));
  tickNodes.forEach((n) => plot.appendChild(n));
  xLabels.forEach((n) => plot.appendChild(n));
  plot.appendChild(strip);

  wrap.replaceChildren(plot, verdict);

  const axisNoteEl = document.createElement("p");
  axisNoteEl.className = "slope-axisnote";
  axisNoteEl.textContent = metrics.axisNote || "";
  wrap.appendChild(axisNoteEl);

  const captionEl = document.createElement("p");
  captionEl.className = "slope-caption";
  captionEl.textContent = metrics.caption || "";
  wrap.appendChild(captionEl);

  wrap.appendChild(detailTable());
  host.appendChild(wrap);

  /* --------------------------------- veil --------------------------------- */

  /* Every animated node, conditional ones included. A mark left out of this
   * list mounts at full opacity, is driven to zero when its beat arrives, and
   * flashes. That regression has shipped here three times. */
  /* Array.from, not the NodeList: veil() flattens with Array.prototype.flat,
   * which leaves a NodeList intact as a single member and then dereferences
   * .style on it. */
  const verdictCells = Array.from(verdict.querySelectorAll(".slope-verdict-cell"));
  const verdictNote = verdict.querySelector(".slope-verdict-note");
  const curtain = veil([
    coreBand,
    gridNodes,
    tickNodes,
    xLabels,
    lines.map((l) => l.path),
    lines.map((l) => l.dots),
    motionNodes,
    verdictCells,
    verdictNote,
    axisNoteEl,
    captionEl
  ]);
  curtain.hide();

  async function build(signal) {
    /* 1 — the ruler, before anything is measured against it. */
    fadeIn(coreBand, { duration: 340, y: 0, signal });
    gridNodes.forEach((g, i) => strokeDraw(g, { duration: 300, delay: i * 34, signal }));
    stagger(tickNodes, { step: 40, duration: 280, y: 0, signal });

    /* 2 — the segments arrive left to right, which sets the sweep direction
     * everything after this one follows. */
    await wait(200, signal);
    stagger(xLabels, { step: 74, duration: 300, y: 3, signal });

    /* 3 — the lines draw. strokeDraw runs the dash offset along the path, and
     * every path is authored ENTR-first, so all four travel in +x together
     * and the sweep is the page's rather than four separate ones. */
    await wait(160, signal);
    lines.forEach((l, i) => strokeDraw(l.path, { duration: 760, delay: i * 90, signal }));

    /* 4 — the stakes land on the line, column by column in +x so the interior
     * nests inside the page sweep instead of fighting it. */
    await wait(300, signal);
    const columnMajor = [];
    segments.forEach((_, c) => lines.forEach((l) => columnMajor.push(l.dots[c])));
    stagger(columnMajor, {
      step: 22, duration: 280, y: 0, scaleFrom: 0.2, maxTotal: 520, signal
    });

    /* 5 — the grouping is a reading of the marks, so it cannot precede them. */
    await wait(240, signal);
    stagger(motionNodes, { step: 110, duration: 360, y: 0, signal });

    stagger(verdictCells, { step: 120, duration: 380, y: 4, delay: 160, signal });
    if (verdictNote) fadeIn(verdictNote, { delay: 380, duration: 420, y: 3, signal });

    fadeIn(axisNoteEl, { delay: 200, duration: 420, y: 4, signal });
    fadeIn(captionEl, { delay: 260, duration: 460, y: 6, signal });
  }

  /* -------------------------------- helpers ------------------------------- */

  function shortName(row) {
    return (row.label || "").replace(/^Tableau\s+/, "") || row.id;
  }

  function motionName(m) {
    if (!m.row) return "Other";
    /* "Agentic Analytics Platform" -> "Platform"; "Embedded Agentic
     * Analytics" -> "Embedded". The authored label is the full taxonomy name
     * and the strip has room for one word. */
    const label = m.row.label || "";
    if (/^Embedded/i.test(label)) return "Embedded";
    return label.replace(/\bAgentic\b|\bAnalytics\b/gi, "").trim() || label;
  }

  /* The All Segments reading of a row, copied onto seg-matrix from the
   * Analytics Performance tab where it is authored. It is a reading of the
   * same measure at a coarser grain, not a recomputation of these four
   * columns — the two differ slightly and that difference is one of the
   * inconsistencies this board renders faithfully and silently. Never
   * recomputed here. */
  function allSegRate(row) {
    if (!row.allSegments) return null;
    return { value: row.allSegments.yoy, display: row.allSegments.yoyDisplay };
  }

  function motionSpanText(m) {
    const rates = m.members.map(allSegRate).filter(Boolean);
    if (rates.length < 2) return "";
    const vals = rates.map((r) => r.value);
    const spread = Math.round(Math.max(...vals) - Math.min(...vals));
    const word = spread <= 10 ? "one motion" : "two motions";
    return `${spread} pts apart — ${word}`;
  }

  function cellTip(row, pt) {
    const all = allSegRate(row);
    const head = `${row.label} · ${pt.seg.label}`;
    const body = `${pt.display} ACV, ${pt.yoyDisplay} Y/Y`;
    const tail = all
      ? ` · ${all.display} at All Segments, on the Analytics Performance tab`
      : "";
    if (degraded) {
      return `${head} — ${body}${tail}. The segment column is a derived dimension, `
        + "not a field either model publishes.";
    }
    return `${head} — ${body}${tail}`;
  }

  /* The full grid, including the three roll-up rows the plot drops, so the
   * expand is the complete reading the plot deliberately is not. */
  function detailTable() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    const table = document.createElement("table");
    table.className = "slope-table";

    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    hr.appendChild(th(""));
    segments.forEach((s) => hr.appendChild(th(s.short || s.label)));
    hr.appendChild(th("All segments"));
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    allRows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.dataset.level = String(row.level);
      if (row.level !== leafLevel) tr.dataset.rollup = "true";
      tr.appendChild(td(row.label, "slope-table-name"));
      segments.forEach((_, i) => {
        tr.appendChild(td(`${row.display[i]} · ${row.yoyDisplay[i]}`));
      });
      const all = row.allSegments;
      tr.appendChild(td(all ? `${all.display} · ${all.yoyDisplay}` : "—"));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    detail.appendChild(table);

    if (metrics.detailNote) {
      const note = document.createElement("p");
      note.className = "slope-table-note";
      note.textContent = metrics.detailNote;
      detail.appendChild(note);
    }
    return detail;
  }

  function th(txt) {
    const el = document.createElement("th");
    el.textContent = txt;
    return el;
  }

  function td(txt, cls) {
    const el = document.createElement("td");
    el.textContent = txt;
    if (cls) el.className = cls;
    return el;
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
