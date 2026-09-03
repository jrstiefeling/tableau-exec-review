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
 * nobody would notice the axis had been truncated.
 *
 * Under the trajectory sits a Y/Y deviation strip: one diverging bar per
 * period, growing out of a shared zero rule. Every panel already carries five
 * authored Y/Y figures that appear nowhere on its face — roughly thirty-five
 * numbers across the tab that a viewer cannot see at rest — and the strip is
 * the one form that can show them without risking the error the rest of the
 * tab exists to prevent: the bars are discrete and per-period, so they
 * interpolate nothing and span nothing, and the H1 bar needs no break rule
 * because there is no continuity there to break.
 *
 * The strip also gives the tab's stated colour threshold something to do.
 * The trajectory is drawn in the measure's accent, never in sentiment colour,
 * so the +/-10% rule the rules card claims was until now almost unexercised
 * on the panel faces. Polarity comes from toneOf(), which reads the measure's
 * own goodDirection — which is why attrition's falling H1 figure renders as
 * the only green bar on a tab running red without anyone recolouring a cell. */

import {
  chartRoot, svgEl, group, text, linePath, smoothPath, linearScale, roundedRectPath, padHit
} from "../svg.js";
import { palette, toneOf, toneColor, tierMeta } from "../palette.js";
import {
  countUp, strokeDraw, dashDraw, fadeIn, fadeTo, growFrom, stagger, wait, veil, reducedMotion
} from "../anim.js";

/* The viewBox is kept close to the aspect ratio of the grid cell it lands in.
 * preserveAspectRatio letterboxes anything that does not match, and a panel
 * that letterboxes wastes the vertical room the trajectory needs most.
 *
 * The strip is given its own 22-unit band rather than overlaid on the plot,
 * which is what the extra 24 units of height and the matching 24 units of
 * PAD.bottom buy: the baseline still lands at H - PAD.bottom = 188, so the
 * trajectory's geometry is byte-for-byte what it was before the strip
 * existed. `.trend-svg` is `flex: 1; min-height: 0`, so the taller viewBox
 * letterboxes inside the same box rather than making the panel taller. */
const W = 300;
const H = 264;
const PAD = { top: 26, right: 14, bottom: 76, left: 26 };

const DEV = { top: 196, h: 22 };
const DEV_ZERO = DEV.top + DEV.h / 2;
const DEV_REACH = 10;
const LABEL_DY = 44;
const NOTE_DY = 58;

/* One bound for all seven panels, stated rather than derived per panel.
 * The authored magnitudes run 0% to 33% with a single outlier — NNAOV's -74%
 * at H1 — so a per-panel maximum would give seven different rulers and flatten
 * six of them, and comparing change across the tab is the entire reason the
 * strip exists. 40 is the research document's bound: it clears every authored
 * figure except that one, which is clamped and notched so a clipped bar looks
 * clipped. */
const DEV_BOUND = 40;

/* A clamped bar's outer edge is a three-tooth zigzag instead of a straight
 * one — the same overflow idiom the attainment cards use past their domain,
 * rotated a quarter turn. */
function notchedBarPath(x0, w, yBase, h, dir) {
  const yEnd = yBase + dir * h;
  const back = yEnd - dir * Math.min(2.2, h * 0.55);
  const t = w / 3;
  return [
    `M ${x0} ${yBase}`,
    `L ${x0 + w} ${yBase}`,
    `L ${x0 + w} ${yEnd}`,
    `L ${x0 + w - t / 2} ${back}`,
    `L ${x0 + w - t} ${yEnd}`,
    `L ${x0 + w - t * 1.5} ${back}`,
    `L ${x0 + w - t * 2} ${yEnd}`,
    `L ${x0 + w - t * 2.5} ${back}`,
    `L ${x0} ${yEnd}`,
    "Z"
  ].join(" ");
}

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
  const svg = chartRoot(W, H, {
    label: `${ctx.label} FY23 to FY27 H1, with a year-on-year deviation strip beneath the trajectory on a shared ${DEV_BOUND}% scale`,
    class: "trend-svg"
  });
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
  const dotCores = [];
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
      const core = svgEl("circle", { cx: pt.x, cy: pt.y, r: 1.5, fill: accent, class: "trend-dot-core" });
      marks.appendChild(core);
      dotCores.push(core);
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

  /* ---- Y/Y deviation strip ---- */
  const devZero = svgEl("path", {
    d: `M ${PAD.left} ${DEV_ZERO} H ${W - PAD.right}`,
    stroke: p.axis,
    "stroke-width": 0.8,
    fill: "none",
    class: "trend-dev-zero"
  });
  // Without a semantic layer nothing declares which way is good, so the rule
  // the bars diverge from stops being an asserted reference and is dashed the
  // way every other ungoverned reference on the board is.
  if (isDirect) devZero.setAttribute("stroke-dasharray", "3 4");
  marks.appendChild(devZero);

  const cellW = Math.max(
    5,
    ((x(Math.max(1, series.length - 1)) - x(0)) / Math.max(1, periods.length)) * 0.72
  );
  const devScale = linearScale([0, DEV_BOUND], [0, DEV_REACH]);

  // The half-period column is tinted rather than detached — the same faint
  // accent wash the expand table already uses to mark it — because a Y/Y bar
  // for a half period is a real reading on a different basis, not a break.
  let devPartial = null;
  if (partialFrom < periods.length) {
    devPartial = svgEl("rect", {
      x: x(partialFrom) - cellW / 2 - 3,
      y: DEV.top,
      width: (x(periods.length - 1) - x(partialFrom)) + cellW + 6,
      height: DEV.h,
      rx: 2,
      fill: accent,
      "fill-opacity": 0.07,
      class: "trend-dev-partial"
    });
    marks.appendChild(devPartial);
  }

  const devBars = [];
  const devGaps = [];

  periods.forEach((label, i) => {
    const raw = (metrics.yoy || [])[i];
    const parsed = raw == null || raw === "" ? NaN : parseFloat(raw);
    /* The first plotted period has no prior period anywhere on this board, so
     * it is a gap and renders as one. A zero-height bar there would read as
     * "no change", and "not measured" and "no change" are different findings
     * — which is the one thing a strip like this must never blur. */
    const measured = i > 0 && !Number.isNaN(parsed);
    const x0 = x(i) - cellW / 2;

    if (!measured) {
      const gap = svgEl("path", {
        d: roundedRectPath(x0, DEV_ZERO - 3.6, cellW, 7.2, 1.6),
        fill: "none",
        stroke: p.axis,
        "stroke-width": 0.9,
        "stroke-dasharray": "2 2",
        class: `trend-dev is-gap${i >= partialFrom ? " is-partial" : ""}`
      });
      marks.appendChild(gap);
      devGaps.push(gap);
    } else {
      const dir = parsed < 0 ? 1 : -1;
      const magnitude = Math.abs(parsed);
      const clamped = magnitude > DEV_BOUND;
      // Guarded to a visible minimum: an exactly flat movement is a real
      // reading and has to be seen sitting on the rule, not vanish into it.
      const h = Math.max(1.1, Math.min(devScale(magnitude), DEV_REACH));
      const bar = svgEl("path", {
        d: clamped
          ? notchedBarPath(x0, cellW, DEV_ZERO, h, dir)
          : roundedRectPath(x0, dir < 0 ? DEV_ZERO - h : DEV_ZERO, cellW, h, 1.4),
        // Sentiment from the measure's own polarity — the reason attrition's
        // falling figure reads as good news without a hand-coloured cell.
        fill: isDirect ? meta.color : toneColor(toneOf(parsed, metrics.goodDirection || "up")),
        // A paint channel, so the build can drive these to element opacity 1
        // and settle() restores them to their authored translucency.
        "fill-opacity": isDirect ? 0.5 : 0.88,
        class: `trend-dev${clamped ? " is-clamped" : ""}${i >= partialFrom ? " is-partial" : ""}`,
        "data-dir": dir < 0 ? "up" : "down"
      });
      marks.appendChild(bar);
      devBars.push({ node: bar, dir, delay: i * 60 });
    }

    // A transparent rect rather than padHit(): the gap cells already carry a
    // real stroke, which padHit refuses to overwrite, and a flat bar is a
    // 1-unit target. One hit rule for all five cells instead of two.
    const hit = svgEl("rect", {
      x: x0 - 2,
      y: DEV.top,
      width: cellW + 4,
      height: DEV.h,
      fill: "transparent",
      class: "trend-dev-hit"
    });
    marks.appendChild(hit);
    ctx.tip(hit, devTip(label, raw, measured, parsed, i));
  });

  function devTip(label, raw, measured, parsed, i) {
    if (!measured) {
      return i === 0
        ? `${label} · first plotted period — no prior year on this board to measure a movement against, so the cell is a gap rather than a zero`
        : `${label} · Y/Y not measured`;
    }
    const bits = [`${label} · Y/Y ${raw}`];
    if (Math.abs(parsed) > DEV_BOUND) {
      bits.push(`beyond the ±${DEV_BOUND}% strip scale shared by all seven panels, so the bar is notched`);
    } else {
      bits.push(`strip scale ±${DEV_BOUND}%, shared by all seven panels`);
    }
    bits.push(
      isDirect
        ? "Direction of good is not asserted without the semantic layer, so the colour means nothing here"
        : `${(metrics.goodDirection || "up") === "down" ? "Lower is better" : "Higher is better"} (certified), so the colour follows the measure's own polarity`
    );
    return bits.join(" · ");
  }

  /* ---- period labels ---- */
  const labels = periods.map((label, i) => {
    const node = text(label, {
      x: x(i),
      y: H - PAD.bottom + LABEL_DY,
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
      y: H - PAD.bottom + NOTE_DY,
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

  /* Every strip mark is in the veil list, including the conditional ones — the
   * partial wash exists only on a tab with a partial period, the gap cells
   * only where a period has no measured movement. A mark left out is mounted
   * at full opacity and then driven to zero when its beat arrives, which is
   * the flash the veil exists to prevent; settle() is what makes veiling a
   * conditional mark safe, because it restores anything a beat never reached. */
  const curtain = veil([
    head, baseline, zeroTick, line, breakRule,
    ghostLink, ghost, ghostLabel,
    dots, dotCores, labels, partialNote, caption,
    devZero, devPartial, devGaps, devBars.map((b) => b.node)
  ]);

  function prime() {
    curtain.hide();
    // The area is handled apart from the veil: build fades it to 0.1, not to 1,
    // so settling it would flood the panel.
    if (!reducedMotion()) area.style.opacity = "0";
  }

  prime();

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

    const stripNote = document.createElement("p");
    stripNote.className = "trend-table-note";
    stripNote.textContent = `Deviation strip · one bar per period on a ±${DEV_BOUND}% scale shared by all seven panels, so the movements are comparable across the tab rather than only within a panel. Beyond ±${DEV_BOUND}% the bar is notched. ${periods[0]} has no prior period on this board and renders as a gap rather than as no change.`;
    detail.appendChild(stripNote);

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
    fadeTo(area, 0.1, { delay: 420, duration: 700, signal });

    await wait(560, signal);
    stagger(labels, { step: 44, duration: 320, y: 4, signal });
    stagger(dots.slice(0, joinedCount), { step: 76, duration: 340, y: 0, scaleFrom: 0.2, signal });

    await wait(360, signal);
    if (breakRule) dashDraw(breakRule, { duration: 420, signal });
    stagger([...dots.slice(joinedCount), ...dotCores], { step: 90, duration: 420, y: 0, scaleFrom: 0.2, signal });
    if (partialNote) fadeIn(partialNote, { delay: 180, duration: 400, y: 4, signal });

    /* The strip is its own beat, after the trajectory's marks and before the
     * ghost. Each bar grows out of the zero rule in the direction of its sign,
     * so the sign is legible before the colour is read — and the rule arrives
     * first, because you draw the ruler before the measurement. */
    await wait(240, signal);
    fadeIn(devZero, { duration: 300, y: 0, signal });
    if (devPartial) fadeIn(devPartial, { delay: 60, duration: 340, y: 0, signal });
    devBars.forEach(({ node, dir, delay }) =>
      growFrom(node, {
        axis: "y",
        // Bars diverge from the rule, so each one grows from the edge that
        // sits on it rather than from a shared baseline.
        origin: dir < 0 ? "center bottom" : "center top",
        delay: 90 + delay,
        duration: 380,
        signal
      })
    );
    stagger(devGaps, { step: 60, delay: 90, duration: 300, y: 0, signal });

    await wait(280, signal);
    if (ghostLink) dashDraw(ghostLink, { duration: 380, signal });
    if (ghost) fadeIn(ghost, { delay: 120, duration: 380, scaleFrom: 0.4, signal });
    if (ghostLabel) fadeIn(ghostLabel, { delay: 200, duration: 380, y: 3, signal });
    fadeIn(caption, { delay: 160, duration: 460, y: 6, signal });
  }

  return { build, prime, settle: curtain.settle };
}
