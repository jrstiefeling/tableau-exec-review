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
  chartRoot, svgEl, group, text, linePath, smoothPath, linearScale, roundedRectPath, padHit,
  verticalGradient, publishPixelUnit
} from "../svg.js";
import { palette, toneOf, toneColor, tierMeta } from "../palette.js";
import {
  countUp, strokeDraw, dashDraw, fadeIn, fadeTo, growFrom, stagger, wait, veil, reducedMotion
} from "../anim.js";

/* The viewBox has to match the aspect ratio of the grid cell, and this is
 * where the "40px faint wisp" came from.
 *
 * `preserveAspectRatio: xMidYMid meet` fits by the limiting dimension and
 * gives away the mismatch as letterboxing. The viewBox was 300x264 — 1.14:1 —
 * and at 1024x580 the cell resolved to a box of about 200x75, which is 2.7:1.
 * So the chart drew at 85x75 inside a 200x75 box: 57% of the width thrown
 * away, and the trajectory reduced to a quarter of the area the layout had
 * actually given it. It was not a small chart. It was a chart drawn at 24% of
 * its allocation.
 *
 * Two changes fix it, and they compound. The tab's grid now gives each panel
 * a cell of roughly 169x109 rather than 200x75 (four columns and two rows,
 * with the rules card gone and the 3x3 fallback with it), and the viewBox is
 * re-proportioned to sit inside that. The result draws at essentially the full
 * width of its box.
 *
 * WIDE is the hero's viewBox. ACV spans two columns on the tab, so its cell is
 * about 3.4:1, and a narrow-card viewBox in it would letterbox a third of the
 * width back off again — the same mistake one level up.
 *
 * The strip keeps its own band under the baseline rather than being overlaid
 * on the plot: the plot is 132 units deep and the strip 26, and both grew
 * in absolute terms because the cell did.
 *
 * ---------------------------------------------------------------------------
 * Why the bottom of this viewBox is so tall, and why the type in it is not
 * measured in user units
 *
 * A viewBox scales as one thing. That is the point of it for marks — a
 * trajectory drawn at 300 units wide is the same trajectory in any box — and
 * it is exactly wrong for type, because a reader's eye does not scale with the
 * cell. The axis ticks were authored at 10 user units and rendered between
 * 7.8px on the hero and 4.4px on AOV, which is not a font-size problem: it is
 * the same 10 units multiplied by seven different scale factors.
 *
 * So the ticks, the zero label, the run-rate label and the partial note are
 * sized in real pixels, against a --u custom property the chart publishes on
 * its own root (see publishPixelUnit in svg.js) holding user-units-per-CSS-px.
 * `font-size: calc(9.5px * var(--u))` is 9.5px on screen in every cell, at
 * every viewport, whatever the scale underneath it. Nothing else in the panel
 * changes: the marks still scale, because marks are the thing a small multiple
 * is comparing.
 *
 * That has a consequence for the layout, and it is the reason the box is
 * 348x224 rather than 300x198. Type that does not scale needs a band under
 * the strip measured in pixels, and the number of user units a pixel costs is
 * largest where the scale is smallest — the 1024x580 floor, where one pixel
 * is about 2.06 units. Two lines of type and their leading need 50 units
 * there, against a 28-unit budget before. PAD.bottom absorbs the difference,
 * so the plot keeps its depth; at wider viewports the same two lines cost
 * fewer units and the surplus reads as air under the note, which is what a
 * chart composed at its own floor should do.
 *
 * Both boxes are then proportioned to the cell they land in at that floor —
 * 348x224 is 1.55:1 against a 169x109 chart box, and 756x224 is 3.37:1
 * against the hero's 367x109 — so `meet` has almost nothing to letterbox.
 * That is worth stating because it is easy to get wrong in the other
 * direction: a box left at 300 wide against a taller H would have thrown 57px
 * off each side of the widest panel on the tab. The two widths also put the
 * hero and the narrow cards at the same scale, which is what makes seven
 * panels a small multiple rather than seven charts. */
const H = 224;
const W_NARROW = 348;
const W_WIDE = 756;
/* PAD.top is 10 rather than 18 because the y scale already carries 12%
 * headroom above the largest value, so the top pad was padding padding. The
 * eight units go to the plot, which is the only element on the tab whose job
 * is the shape of a trend. */
const PAD = { top: 10, right: 14, bottom: 82, left: 20 };

/* The plotted columns are inset from both edges by the half-width of the tick
 * label centred on them, because the labels are now a fixed pixel size and
 * the widest of them is wider than the column pitch. "FY27 H1" is 35px of a
 * 169px card; centred on the old right-hand position it ran off the box, and
 * an outermost <svg> clips. Left is PAD.left + 8, which puts "FY23" 2px inside
 * the frame; right is 28 units in, which leaves the same margin. */
const X_INSET_RIGHT = 28;

const DEV = { top: 148, h: 26 };
const DEV_ZERO = DEV.top + DEV.h / 2;
/* 14, from 12, on a band grown from 22 to 26. The strip carries thirty-five
 * authored Y/Y figures that appear nowhere else on the tab, and it was the
 * one mark on the panel the reviewer could not see at all. */
const DEV_REACH = 14;
/* Both measured down from the plot's baseline at H - PAD.bottom, and both set
 * by the pixel budget rather than by eye: the tick baseline has to clear the
 * strip's bottom edge by a 3px gap plus a 7px cap height, and the note's has
 * to clear the tick's descender by the same kind of sum. At the 1024 floor
 * that is 21 units and 21 more. */
const LABEL_DY = 53;
const NOTE_DY = 74;

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
  const accent = ctx.accent;

  // Authored on the spec, not inferred from the DOM: the panel that spans two
  // columns is an editorial decision about which measure this tab is about,
  // and it is stated in the data file beside the measure it applies to.
  const W = (ctx.portlet || {}).span === 2 ? W_WIDE : W_NARROW;

  const periods = tab.periods || [];
  const partialFrom = tab.partialFrom ?? periods.length;
  const series = metrics.series || [];
  const isFlow = metrics.periodType === "flow";
  const hasRunRate = isFlow && metrics.runRate != null;

  // Flow metrics break the line before the partial period; stock metrics
  // carry it all the way through.
  const joinedCount = isFlow ? partialFrom : series.length;

  const maxValue = Math.max(...series, hasRunRate ? metrics.runRate : 0) || 1;
  const x = linearScale(
    [0, Math.max(1, series.length - 1)],
    [PAD.left + 8, W - PAD.right - X_INSET_RIGHT]
  );
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
  publishPixelUnit(svg);
  const marks = group();
  svg.appendChild(marks);

  const baseline = svgEl("path", {
    d: `M ${PAD.left} ${H - PAD.bottom} H ${W - PAD.right}`,
    stroke: p.axis,
    "stroke-width": 1.3,
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

  /* A gradient rather than a flat 10% wash. The fill's job is to hold weight
   * at the trajectory and release the baseline, so that the line reads as the
   * top edge of a body of ink rather than as a stroke sitting on a tinted
   * rectangle — which is most of the difference between a chart that looks
   * finished and one that looks like a wireframe. The stops are the measure's
   * own accent, or its tier colour in direct mode, so nothing here needs its
   * own mode branch.
   *
   * fadeTo() drives element opacity and the stops carry the paint, which keeps
   * the two channels independent: the build can fade the area to 0.1 and
   * settle() can restore it without either of them flooding the panel. */
  const area = svgEl("path", {
    d: `${smoothPath(joined)} L ${joined[joined.length - 1].x} ${H - PAD.bottom} L ${joined[0].x} ${H - PAD.bottom} Z`,
    fill: verticalGradient(svg, [
      ["0%", accent, 0.9],
      ["58%", accent, 0.34],
      ["100%", accent, 0.04]
    ]),
    opacity: 0,
    class: "trend-area"
  });
  marks.appendChild(area);

  const line = svgEl("path", {
    d: smoothPath(joined),
    fill: "none",
    stroke: accent,
    "stroke-width": 2.9,
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
      "stroke-width": 1.5,
      "stroke-dasharray": "2.4 4",
      fill: "none",
      class: "trend-ghost-link"
    });
    ghost = svgEl("circle", {
      cx: gx,
      cy: gy,
      r: 4.4,
      fill: "none",
      stroke: p.ghost,
      "stroke-width": 1.6,
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
  /* Per-point provenance. A five-year series is not one source: the early
   * years predate the models, so on ACV, Attrition and NNAOV the FY23-FY24
   * points are supplemented from the source deck while FY25 onward are
   * certified. That seam is a fact about the DATA, so it renders in BOTH modes
   * and does not move when the toggle flips. What moves across the toggle is
   * the value of the unhaloed points — which is the whole argument in one
   * panel: the layer was holding the right-hand end of the line, and the
   * left-hand end was always somebody's spreadsheet.
   *
   * A halo OUTSIDE the dot rather than a hollow centre, because hollow is
   * already spoken for: a detached point is a real measurement on a different
   * basis, and overloading the same affordance with "different source" would
   * make two unrelated caveats indistinguishable. */
  const provenance = metrics.pointProvenance || [];
  const supplementedInk = tierMeta("yellow").color;
  const halos = [];
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
      r: detached ? 5.4 : 4.2,
      fill: detached ? "none" : accent,
      stroke: detached ? accent : "none",
      "stroke-width": detached ? 2.3 : 0,
      class: `trend-dot${partial ? " is-partial" : ""}`
    });
    padHit(dot, 14);
    if (provenance[pt.i] === "supplemented") {
      const halo = svgEl("circle", {
        cx: pt.x,
        cy: pt.y,
        r: (detached ? 5.4 : 4.2) + 3.1,
        fill: "none",
        stroke: supplementedInk,
        "stroke-width": 1.3,
        class: "trend-dot-halo"
      });
      marks.appendChild(halo);
      halos.push(halo);
    }
    if (detached) {
      const core = svgEl("circle", { cx: pt.x, cy: pt.y, r: 1.8, fill: accent, class: "trend-dot-core" });
      marks.appendChild(core);
      dotCores.push(core);
    }

    const yoy = (metrics.yoy || [])[pt.i];
    const cagr = (metrics.cagr || [])[pt.i];
    const bits = [`${periods[pt.i]}: ${(metrics.display || [])[pt.i] ?? pt.value}`];
    if (yoy) bits.push(`Y/Y ${yoy}`);
    if (provenance[pt.i] === "supplemented") {
      bits.push("Supplemented — this year is authored outside both models. A definition exists; nothing enforces it.");
    }
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
    "stroke-width": 1.1,
    fill: "none",
    class: "trend-dev-zero"
  });
  // Without a semantic layer nothing declares which way is good, so the rule
  // the bars diverge from stops being an asserted reference and is dashed the
  // way every other ungoverned reference on the board is.
  marks.appendChild(devZero);

  // 0.82 of the column pitch rather than 0.72: at the previous scale the bars
  // were about 4px wide on screen and the strip read as speckle.
  const cellW = Math.max(
    5,
    ((x(Math.max(1, series.length - 1)) - x(0)) / Math.max(1, periods.length)) * 0.82
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
        d: roundedRectPath(x0, DEV_ZERO - 4.2, cellW, 8.4, 1.8),
        fill: "none",
        stroke: p.axis,
        "stroke-width": 1.1,
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
      const h = Math.max(1.4, Math.min(devScale(magnitude), DEV_REACH));
      const bar = svgEl("path", {
        d: clamped
          ? notchedBarPath(x0, cellW, DEV_ZERO, h, dir)
          : roundedRectPath(x0, dir < 0 ? DEV_ZERO - h : DEV_ZERO, cellW, h, 1.4),
        // Sentiment from the measure's own polarity — the reason attrition's
        // falling figure reads as good news without a hand-coloured cell.
        fill: toneColor(toneOf(parsed, metrics.goodDirection || "up")),
        // A paint channel, so the build can drive these to element opacity 1
        // and settle() restores them to their authored translucency.
        "fill-opacity": 0.88,
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
    /* End-anchored on the plot's right edge rather than centred on the last
     * column. At a fixed 8px it is wider than the column is, so centring it
     * ran it off the box on the narrow cards; ending it where the plot ends
     * keeps it under the H1 column it describes and inside the frame. */
    partialNote = text(isFlow ? "not comparable" : "point in time", {
      x: W - PAD.right,
      y: H - PAD.bottom + NOTE_DY,
      "text-anchor": "end",
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
    dots, halos, dotCores, labels, partialNote, caption,
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
          td.style.color = toneColor(toneOf(numeric, goodDirection));
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
    stagger([...dots.slice(joinedCount), ...dotCores, ...halos], { step: 90, duration: 420, y: 0, scaleFrom: 0.2, signal });
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
