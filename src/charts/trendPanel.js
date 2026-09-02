/* One metric's five-year trajectory, drawn as a small multiple.
 *
 * The load-bearing decision here is how FY27 H1 is plotted, and it is decided
 * by the measure rather than by the chart:
 *
 *   flow  (ACV, Revenue, NNAOV, Attrition, Productivity) accumulates across a
 *         period, so half a year is not comparable to a full one. H1 is drawn
 *         detached from the trajectory, behind a break, with an optional
 *         run-rate ghost showing what it annualises to.
 *
 *   stock (AOV, AE Capacity) is a balance read at a point in time, so an H1
 *         reading sits on the same footing as any year-end reading and joins
 *         the line normally — and is never offered a run-rate ghost, because
 *         doubling a balance is meaningless.
 *
 * A spreadsheet cannot tell those two rows apart. Both are five numbers in a
 * line. The distinction lives in the semantic layer, and this is what it buys.
 *
 * The value axis is anchored at zero throughout. A padded baseline would make
 * every panel's decline look steeper, and the panels are small enough that
 * nobody would notice the axis had been truncated. */

import { chartRoot, svgEl, group, text, linePath, smoothPath, linearScale, padHit } from "../svg.js";
import { palette, toneOf, toneColor, tierMeta } from "../palette.js";
import { countUp, strokeDraw, dashDraw, fadeIn, stagger, wait } from "../anim.js";

/* The viewBox is kept close to the aspect ratio of the grid cell it lands in.
 * preserveAspectRatio letterboxes anything that does not match, and a panel
 * that letterboxes wastes the vertical room the trajectory needs most. */
const W = 300;
const H = 240;
const PAD = { top: 26, right: 14, bottom: 52, left: 26 };

export function mount(host, ctx) {
  const { metrics, tab, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);
  const accent = isDirect ? meta.color : ctx.accent;

  const periods = tab.periods || [];
  const partialFrom = tab.partialFrom ?? periods.length;
  const series = metrics.series || [];
  const isFlow = metrics.periodType === "flow";
  const hasRunRate = isFlow && metrics.runRate != null;

  // Flow metrics break the line before the partial period; stock metrics
  // carry it all the way through.
  const joinedCount = isFlow ? partialFrom : series.length;

  const maxValue = Math.max(...series, hasRunRate ? metrics.runRate : 0) || 1;
  const x = linearScale([0, Math.max(1, series.length - 1)], [PAD.left + 8, W - PAD.right - 20]);
  const y = linearScale([0, maxValue * 1.12], [H - PAD.bottom, PAD.top]);

  const points = series.map((value, i) => ({ x: x(i), y: y(value), value, i }));
  const joined = points.slice(0, joinedCount);

  const wrap = document.createElement("div");
  wrap.className = "trend";

  /* ---- headline ---- */
  const head = document.createElement("div");
  head.className = "trend-head";
  const headline = document.createElement("span");
  headline.className = "trend-headline";
  const headnote = document.createElement("span");
  headnote.className = "trend-headnote";
  headnote.textContent = metrics.headlineNote || "";
  head.appendChild(headline);
  head.appendChild(headnote);
  wrap.appendChild(head);

  /* ---- chart ---- */
  const svg = chartRoot(W, H, { label: `${ctx.label} FY23 to FY27 H1`, class: "trend-svg" });
  const marks = group();
  svg.appendChild(marks);

  const baseline = svgEl("path", {
    d: `M ${PAD.left} ${H - PAD.bottom} H ${W - PAD.right}`,
    stroke: p.axis,
    "stroke-width": 1,
    fill: "none",
    class: "trend-baseline"
  });
  marks.appendChild(baseline);

  // Sits outside the axis rather than under it, where it would collide with
  // the first period label.
  const zeroTick = text("0", {
    x: PAD.left - 8,
    y: H - PAD.bottom + 3.5,
    "text-anchor": "end",
    fill: p.inkDim,
    class: "trend-tick trend-zero"
  });
  marks.appendChild(zeroTick);

  // The break marker: a vertical rule saying "what follows is not the same
  // kind of measurement as what precedes it".
  let breakRule = null;
  if (isFlow && partialFrom < series.length) {
    const bx = (x(partialFrom - 1) + x(partialFrom)) / 2;
    breakRule = svgEl("path", {
      d: `M ${bx} ${PAD.top - 6} V ${H - PAD.bottom}`,
      stroke: p.axis,
      "stroke-width": 1,
      "stroke-dasharray": "2 5",
      fill: "none",
      class: "trend-break"
    });
    marks.appendChild(breakRule);
  }

  const area = svgEl("path", {
    d: `${smoothPath(joined)} L ${joined[joined.length - 1].x} ${H - PAD.bottom} L ${joined[0].x} ${H - PAD.bottom} Z`,
    fill: accent,
    opacity: 0,
    class: "trend-area"
  });
  marks.appendChild(area);

  const line = svgEl("path", {
    d: smoothPath(joined),
    fill: "none",
    stroke: accent,
    "stroke-width": 2.4,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    class: "trend-line"
  });
  marks.appendChild(line);

  /* ---- run-rate ghost ---- */
  let ghost = null;
  let ghostLink = null;
  let ghostLabel = null;
  if (hasRunRate) {
    const gx = x(series.length - 1);
    const gy = y(metrics.runRate);
    ghostLink = svgEl("path", {
      d: `M ${gx} ${y(series[series.length - 1])} V ${gy}`,
      stroke: p.ghost,
      "stroke-width": 1.2,
      "stroke-dasharray": "2 4",
      fill: "none",
      class: "trend-ghost-link"
    });
    ghost = svgEl("circle", {
      cx: gx,
      cy: gy,
      r: 3.6,
      fill: "none",
      stroke: p.ghost,
      "stroke-width": 1.4,
      "stroke-dasharray": "2.5 2.5",
      class: "trend-ghost"
    });
    ghostLabel = text(`×2 ${metrics.runRateDisplay || ""}`, {
      x: gx - 9,
      y: gy + 3,
      "text-anchor": "end",
      fill: p.inkDim,
      class: "trend-ghost-label"
    });
    marks.appendChild(ghostLink);
    marks.appendChild(ghost);
    marks.appendChild(ghostLabel);
    ctx.tip(
      ghost,
      `H1 annualised: ${metrics.runRateDisplay}. Offered because this measure is a flow — the semantic layer allows annualising an accumulation, and refuses it for a balance.`
    );
  }

  /* ---- points ---- */
  const dots = points.map((pt) => {
    const partial = pt.i >= partialFrom;
    const detached = partial && isFlow;
    // A detached point is still a real measurement, just on a different
    // basis — so it gets a solid ring around a smaller core, and dashes are
    // reserved for the run-rate ghost, which was never measured at all.
    const dot = svgEl("circle", {
      cx: pt.x,
      cy: pt.y,
      r: detached ? 4.6 : 3.6,
      fill: detached ? "none" : accent,
      stroke: detached ? accent : "none",
      "stroke-width": detached ? 2 : 0,
      class: `trend-dot${partial ? " is-partial" : ""}`
    });
    padHit(dot, 14);
    if (detached) {
      marks.appendChild(
        svgEl("circle", { cx: pt.x, cy: pt.y, r: 1.5, fill: accent, class: "trend-dot-core" })
      );
    }

    const yoy = (metrics.yoy || [])[pt.i];
    const cagr = (metrics.cagr || [])[pt.i];
    const bits = [`${periods[pt.i]}: ${(metrics.display || [])[pt.i] ?? pt.value}`];
    if (yoy) bits.push(`Y/Y ${yoy}`);
    if (cagr) bits.push(`2-yr CAGR ${cagr}`);
    if (partial) {
      bits.push(
        isFlow
          ? "Half year — plotted detached because a flow measured over six months is not comparable to a full year."
          : "Half year — plotted in line because this measure is a balance at a point in time, which is comparable across periods."
      );
    }
    ctx.tip(dot, bits.join(" · "));
    marks.appendChild(dot);
    return dot;
  });

  /* ---- period labels ---- */
  const labels = periods.map((label, i) => {
    const node = text(label, {
      x: x(i),
      y: H - PAD.bottom + 16,
      "text-anchor": "middle",
      fill: i >= partialFrom ? p.inkSoft : p.inkDim,
      class: `trend-tick${i >= partialFrom ? " is-partial" : ""}`
    });
    marks.appendChild(node);
    return node;
  });

  // Only flow panels carry the "not comparable" note. On a stock panel the H1
  // column genuinely is comparable, and saying otherwise would be wrong.
  let partialNote = null;
  if (partialFrom < periods.length) {
    // Pulled back from the right edge so the note cannot run off the viewBox
    // on the panel whose last column it describes.
    partialNote = text(isFlow ? "not comparable" : "point in time", {
      x: Math.min(x(series.length - 1), W - PAD.right - 26),
      y: H - PAD.bottom + 30,
      "text-anchor": "middle",
      fill: p.inkDim,
      class: "trend-partial-note"
    });
    marks.appendChild(partialNote);
  }

  wrap.appendChild(svg);

  const caption = document.createElement("p");
  caption.className = "trend-caption";
  caption.textContent = metrics.caption || "";
  wrap.appendChild(caption);

  /* ---- exact values, revealed when the panel is expanded ---- */
  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    const table = document.createElement("table");
    table.className = "trend-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    headRow.appendChild(cell("th", "", "trend-table-rowlabel"));
    periods.forEach((label, i) => {
      const th = cell("th", label);
      if (i >= partialFrom) th.dataset.partial = "true";
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    tbody.appendChild(row(metrics.unit || "value", metrics.display || [], null));
    if (metrics.yoy) tbody.appendChild(row("Y/Y", metrics.yoy, metrics.goodDirection || "up"));
    if (metrics.cagr) tbody.appendChild(row("2 yr CAGR", metrics.cagr, metrics.goodDirection || "up"));
    table.appendChild(tbody);
    detail.appendChild(table);

    const note = document.createElement("p");
    note.className = "trend-table-note";
    note.textContent = isFlow
      ? `${metrics.periodType === "flow" ? "Flow" : "Stock"} measure · ${tab.partialNote || ""}`
      : "Stock measure · a balance read at period end, so the H1 column is directly comparable to the year-end columns beside it and is never annualised.";
    detail.appendChild(note);

    return detail;
  }

  function cell(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value ?? "";
    if (className) node.className = className;
    return node;
  }

  function row(label, values, goodDirection) {
    const tr = document.createElement("tr");
    tr.appendChild(cell("th", label, "trend-table-rowlabel"));
    periods.forEach((_, i) => {
      const raw = values[i];
      const td = cell("td", raw == null || raw === "" ? "—" : raw);
      if (i >= partialFrom) td.dataset.partial = "true";
      // Percentage rows take their colour from the measure's own polarity, so
      // a falling attrition figure reads as the good news it is.
      if (goodDirection && typeof raw === "string" && raw.includes("%")) {
        const numeric = parseFloat(raw);
        if (!Number.isNaN(numeric)) {
          td.style.color = isDirect ? meta.color : toneColor(toneOf(numeric, goodDirection));
        }
      }
      tr.appendChild(td);
    });
    return tr;
  }

  async function build(signal) {
    fadeIn(head, { duration: 400, y: 6, signal });
    countUp(headline, metrics.headline || "", { delay: 80, duration: 860, signal });

    // Axis, then trajectory, then the marks that sit on it — the panel draws
    // itself in the order you would draw it by hand.
    strokeDraw(baseline, { duration: 460, signal });
    fadeIn(zeroTick, { delay: 300, duration: 320, y: 0, signal });
    await wait(260, signal);

    strokeDraw(line, { duration: 900, signal });
    area.style.transition = "opacity 700ms cubic-bezier(.4,0,.2,1) 420ms";
    area.style.opacity = "0.1";

    await wait(560, signal);
    stagger(labels, { step: 44, duration: 320, y: 4, signal });
    stagger(dots.slice(0, joinedCount), { step: 76, duration: 340, y: 0, scaleFrom: 0.2, signal });

    await wait(360, signal);
    if (breakRule) dashDraw(breakRule, { duration: 420, signal });
    stagger(dots.slice(joinedCount), { step: 90, duration: 420, y: 0, scaleFrom: 0.2, signal });
    if (partialNote) fadeIn(partialNote, { delay: 180, duration: 400, y: 4, signal });

    await wait(280, signal);
    if (ghostLink) dashDraw(ghostLink, { duration: 380, signal });
    if (ghost) fadeIn(ghost, { delay: 120, duration: 380, scaleFrom: 0.4, signal });
    if (ghostLabel) fadeIn(ghostLabel, { delay: 200, duration: 380, y: 3, signal });
    fadeIn(caption, { delay: 160, duration: 460, y: 6, signal });
  }

  return { build };
}
