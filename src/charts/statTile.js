/* A single figure with its movement — used where a metric has no plan to be
 * measured against and an attainment track would imply one that does not
 * exist.
 *
 * Where a prior value is authored, the tile also draws a unit grid: one square
 * per N of whatever is being counted, filled up to the current reading and
 * hollow for the difference. AE headcount is the only countable population on
 * this board — every other measure is dollars, which are continuous and
 * abstract — and a unit grid is the one form that makes that difference mean
 * something. "Down 159 heads year over year" stops being a phrase and becomes
 * eight empty squares sitting next to the full ones, so the proportion is
 * legible without a percentage and the arithmetic is visible rather than
 * asserted.
 *
 * The grid is conditional on `metrics.priorValue`, because this renderer is
 * shared. The three Q3 outlook tiles author no prior value, and a unit grid
 * over a dollar forecast would be counting something nobody counted. */

import { chartRoot, svgEl, group } from "../svg.js";
import { toneOf, toneColor, tierMeta } from "../palette.js";
import { countUp, fadeIn, stagger, wait, veil } from "../anim.js";

/* One square is twenty-five AEs, in two rows of eighteen. The unit and the
 * shape are both fit decisions: the tile is the 1fr column of the exec tab's
 * mix band — roughly 200-450px wide and, at four of the five breakpoints the
 * board is composed for, under 130px of body — so the grid has to be wide and
 * short, and 36 squares in 18 x 2 is the largest count that keeps a square
 * above 10px there. Below about 25 squares a unit chart stops reading as a
 * count and starts reading as decoration, at which point a bar is more honest.
 *
 * A grid at this unit cannot render 159 exactly, which is why the unit is
 * stated on the tile. Where the rounding lands is a choice: the total and the
 * change are each rounded from their own authored figure and the retained
 * count absorbs the remainder, so the two counts the grid invites a reader to
 * compare — how many squares there are, and how many are hollow — are both as
 * close to the authored number as the unit allows. */
const PER_CELL = 25;
const COLS = 18;
const CELL = 12;
const GAP = 3;

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const meta = tierMeta(tier);
  const tint = toneColor(toneOf(metrics.yoy, metrics.goodDirection || "up"));
  const accent = ctx.accent;

  const value = Number(metrics.value);
  const prior = Number(metrics.priorValue);
  const hasGrid = metrics.priorValue != null && Number.isFinite(value) && Number.isFinite(prior);

  const wrap = document.createElement("div");
  wrap.className = "stat";
  if (hasGrid) wrap.dataset.hasGrid = "true";

  const valueEl = document.createElement("div");
  valueEl.className = "stat-value";
  /* No candidate stack. A direct read does not offer three numbers and invite
   * you to choose — it picks one and reports it, and the tile shows the one it
   * picked at the size the governed numeral is set in. The candidates are still
   * authored, and they live on the provenance face where they belong: they are
   * an explanation of how the figure came to be wrong, not the figure. */
  wrap.appendChild(valueEl);

  const yoy = document.createElement("span");
  yoy.className = "delta";
  yoy.style.setProperty("--delta-tint", tint);
  yoy.textContent = metrics.yoyDisplay || "";

  /* On the grid tile the movement chip and the unit key share one row. They are
   * both metadata about the grid below them, they read as a pair, and a row of
   * this tile's height is worth about two lines of the footnote — which is the
   * one line on it that can afford to lose them. */
  let keyRow = null;
  if (hasGrid) {
    keyRow = document.createElement("div");
    keyRow.className = "stat-key";
    keyRow.appendChild(yoy);
    wrap.appendChild(keyRow);
  } else {
    wrap.appendChild(yoy);
  }

  /* The centre-anchored delta bar and the unit grid encode the same movement,
   * and the grid encodes it better — as a count of squares rather than as a
   * fraction of a 3px track. So the bar is drawn on the tiles that have no
   * grid, and stood down on the one that does, rather than stacking two
   * readings of one number on a tile with no room for either. */
  let bar = null;
  let barFill = null;
  if (!hasGrid) {
    bar = document.createElement("div");
    bar.className = "delta-bar";
    barFill = document.createElement("span");
    barFill.className = "delta-bar-fill";
    const yoyValue = Number(metrics.yoy) || 0;
    barFill.dataset.dir = yoyValue < 0 ? "neg" : "pos";
    barFill.style.setProperty("--delta-tint", tint);
    barFill.style.setProperty("--delta-width", `${Math.min(Math.abs(yoyValue), 100)}%`);
    bar.appendChild(barFill);
    wrap.appendChild(bar);
  }

  /* ---- unit grid ---- */
  let gridSvg = null;
  let unitEl = null;
  const filledCells = [];
  const lostCells = [];

  if (hasGrid) {
    /* The grid draws the same way in both modes. This tile is supplemented in
     * both — there is no AE capacity measure in either model, so the figure
     * comes from the weekly User Hierarchy extract either way — and it is one
     * of the four portlets that deliberately does not move on the toggle.
     * Those four are the control group: what changes is what the layer was
     * protecting, and this was never in it. */
    const changeKnown = true;
    const totalUnits = changeKnown ? Math.round(prior / PER_CELL) : Math.round(value / PER_CELL);
    const lostUnits = changeKnown
      ? Math.max(0, Math.min(totalUnits, Math.round(Math.abs(prior - value) / PER_CELL)))
      : 0;
    const keptUnits = Math.max(0, totalUnits - lostUnits);
    const rows = Math.max(1, Math.ceil(totalUnits / COLS));

    gridSvg = chartRoot(COLS * (CELL + GAP) - GAP, rows * (CELL + GAP) - GAP, {
      label: `${ctx.label} as a unit grid — one square is ${PER_CELL} ${metrics.unitNoun || "AEs"}, ${keptUnits} filled${
        lostUnits ? ` and ${lostUnits} hollow` : ""
      }`,
      class: "stat-waffle"
    });
    const marks = group();
    gridSvg.appendChild(marks);

    for (let i = 0; i < totalUnits; i += 1) {
      const lost = i >= keptUnits;
      const cell = svgEl("rect", {
        x: (i % COLS) * (CELL + GAP),
        y: Math.floor(i / COLS) * (CELL + GAP),
        width: CELL,
        height: CELL,
        rx: 2,
        // Retained squares are the measure's own accent and lost squares are
        // hollow and sentiment-coloured, so the difference survives greyscale
        // and a colour-blind read: it is a difference of fill, not of hue.
        fill: lost ? "none" : accent,
        "fill-opacity": lost ? 0 : 0.9,
        stroke: lost ? tint : "none",
        "stroke-width": lost ? 1.2 : 0,
        "stroke-opacity": lost ? 0.85 : 0,
        class: `stat-unit-cell${lost ? " is-lost" : ""}`
      });
      marks.appendChild(cell);
      (lost ? lostCells : filledCells).push(cell);
    }

    /* A unit chart whose unit is unstated is a texture, so the unit is stated
     * on the tile — in the DOM, because a legend sized in user units would be
     * 6px on the narrow breakpoint. */
    unitEl = document.createElement("span");
    unitEl.className = "stat-unit";
    unitEl.textContent = `1 square = ${PER_CELL} ${metrics.unitNoun || "AEs"} · ${
      changeKnown
        ? `hollow = lost since ${metrics.priorDisplay || prior}`
        : metrics.priorDisplay || "no prior-year count"
    }`;

    ctx.tip(
      gridSvg,
      changeKnown
        ? `${metrics.display || value} today against ${
            metrics.priorDisplay || prior
          } a year ago · one square is ${PER_CELL} ${
            metrics.unitNoun || "AEs"
          }, and the hollow squares are heads no longer in the count`
        : `${metrics.display || value} today · one square is ${PER_CELL} ${
            metrics.unitNoun || "AEs"
          } · ${metrics.priorDisplay || "no prior-year count"}, so the change cannot be drawn`
    );

    keyRow.appendChild(unitEl);
    wrap.appendChild(gridSvg);
  }

  const caption = document.createElement("p");
  caption.className = "stat-caption";
  caption.textContent = metrics.caption || "";
  wrap.appendChild(caption);

  let footnote = null;
  if (metrics.footnote) {
    footnote = document.createElement("p");
    footnote.className = "stat-footnote";
    footnote.textContent = metrics.footnote;
    wrap.appendChild(footnote);
  }

  host.appendChild(wrap);

  /* The grid is conditional twice over — on the prior value being authored at
   * all, and on the change being knowable — so every one of its nodes is in
   * the veil list and settle() is what restores them on a build that never
   * reached their beat. A cell left out of the list would be painted from
   * mount and flash out when the grid's beat arrived. */
  const curtain = veil([
    valueEl, yoy, bar, gridSvg, filledCells, lostCells, unitEl, caption, footnote
  ]);
  curtain.hide();

  async function build(signal) {
    const display = metrics.display || "";

    /* One arrival for both modes. Direct mode used to flicker this value
     * through `directMode.candidates` — the other readings an agent might have
     * picked — before settling. That was the drain wearing a different hat: a
     * number that visibly cannot make its mind up announces itself as
     * unreliable, and announcing unreliability is precisely the service no raw
     * source performs. The candidates are real and worth knowing, so they moved
     * to the provenance flip, where a reader who asks gets them and a reader
     * who does not is left to trust a figure that counts up as calmly as a
     * certified one. */
    fadeIn(valueEl, { duration: 460, y: 10, signal });
    countUp(valueEl, display, { delay: 140, duration: 980, signal });

    await wait(300, signal);
    fadeIn(yoy, { duration: 420, y: 6, signal });
    if (bar) fadeIn(bar, { delay: 90, duration: 420, y: 4, signal });

    /* The roster is counted first, in reading order, and then the empty seats
     * arrive as a block — so the grid fills and the loss lands on it, rather
     * than both tones appearing at once as a pattern. */
    if (gridSvg) {
      fadeIn(gridSvg, { delay: 60, duration: 300, y: 3, signal });
      stagger(filledCells, {
        step: 10, maxTotal: 460, delay: 100, duration: 240, y: 0, scaleFrom: 0.45, signal
      });
      await wait(560, signal);
      stagger(lostCells, {
        step: 40, maxTotal: 340, duration: 340, y: 0, scaleFrom: 0.3, signal
      });
      fadeIn(unitEl, { delay: 200, duration: 420, y: 4, signal });
      await wait(200, signal);
    }

    fadeIn(caption, { delay: bar ? 200 : 0, duration: 460, y: 6, signal });
    if (footnote) fadeIn(footnote, { delay: bar ? 320 : 120, duration: 460, y: 6, signal });

    await wait(480, signal);
    if (bar) bar.classList.add("is-live");
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
