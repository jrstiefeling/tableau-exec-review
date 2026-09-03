/* Hero KPI tile: plan attainment as a polarity-mirrored bullet track.
 *
 * Replaces the radial gauge. The reader's job on the hero band is to rank four
 * attainments — 15%, 70%, 79%, 104% — and find the outliers, and a ring makes
 * that four independent angle judgements with no shared reference. Four
 * aligned tracks on one fixed domain make it a scan: the four cards are equal
 * grid columns carrying the same viewBox and the same max-width, so x(100)
 * lands at the same offset in every card and the four plan ticks form one
 * continuous vertical line down the band.
 *
 * The domain is fixed at 0-110% for all four cards rather than data-driven.
 * `plan` is already a percent-of-plan, so the domain is unitless and genuinely
 * shared; nothing is being forced onto a common axis that does not belong on
 * one. What is deliberately never shared is the hero dollar figure — $6M,
 * $82M, $75M and $789M are four measures at four magnitudes, so they are
 * typographic and never graphical.
 *
 * Polarity is geometry here, not tint. Each reference mark on the card carries
 * a short arrow pointing whichever way its measure says is good: rightward
 * from the plan tick and the Y/Y zero on the three up-metrics, leftward from
 * both on attrition. A reader seeing only shapes — greyscale, a colour-blind
 * read, a photograph of a projector — still gets the direction right, and
 * three cards pointing one way beside one pointing the other is legible before
 * a word is read. Both arrows are kept: the Y/Y one is what distinguishes
 * attrition's good -12% from NNAOV's bad -75%, two identical leftward stubs
 * that hue alone would have to separate. */

import { chartRoot, svgEl, group, linearScale } from "../svg.js";
import { palette, toneOf, planTone, planBands, toneColor, tierMeta, PLAN_DOMAIN } from "../palette.js";
import { countUp, scramble, strokeDraw, dashDraw, fadeIn, stagger, wait, veil } from "../anim.js";

/* The track's own units, and the one place on this card where the reviewer's
 * "the attainment tracks are cramped" is actually fixed.
 *
 * The viewBox was 210x44 and the card is now 30% taller than it was, so the
 * whole track grows into the height the layout gave back: 44 -> 54 units, the
 * qualitative bands 16 -> 21, the delivered bar 12 -> 16, the over-plan cap
 * 24 -> 30. Because the SVG is width-driven (`width: 100%; height: auto`), a
 * taller viewBox is a taller mark on screen at the same card width — the
 * geometry all scales together and x(100) still lands at the same fraction of
 * the track on all four cards, which is the property the whole form rests on. */
const W = 210;
const H = 54;
const TRACK = { x: 8, w: 194 };
const CY = 23;
const BAR_H = 16;
const CAP_H = 30;
const BAND_H = 21;
/* The risk region spans 0-85% of plan, which is 77% of the track, so the
 * hatching has to be open enough not to read as a solid fill at 1024 while
 * still being unmistakably a texture rather than a tint. Widened with the
 * band, so the texture keeps the same density at the larger size. */
const RULE_STEP = 10.5;

const YW = 96;
const YH = 28;
const ZERO = 48;
const HALF = 44;

const DOMAIN_MAX = PLAN_DOMAIN[1];

/* A rail with an arrowhead, pointing whichever way the measure says is good.
 * One primitive, used at both reference marks on the card, so the grammar is
 * "every reference mark declares its good direction" — a rule the reader can
 * learn once from one card.
 *
 * `len` is the same on both polarities on purpose, and it has to be short
 * enough to fit the up-polarity side. On a 0-110 domain the plan tick sits at
 * 88% of the track, so there are about 25 units of room to its right and 176
 * to its left; an arrow sized for the left would run outside the viewBox on
 * three of the four cards and simply not draw. Equal length also keeps the
 * mark categorical — the reader compares two directions, and unequal lengths
 * would invite a magnitude reading that means nothing. */
export function goodArrow(originX, y, dir, len, head, halfH, stroke) {
  const g = group({ class: "attain-arrow", "data-dir": dir > 0 ? "up" : "down" });
  const tipX = originX + dir * len;
  const baseX = originX + dir * (len - head);
  g.appendChild(svgEl("path", {
    d: `M ${originX} ${y} H ${baseX}`,
    stroke,
    "stroke-opacity": 0.75,
    "stroke-width": 1
  }));
  g.appendChild(svgEl("path", {
    d: `M ${tipX} ${y} L ${baseX} ${y - halfH} L ${baseX} ${y + halfH} Z`,
    fill: stroke,
    "fill-opacity": 0.75
  }));
  return g;
}

/* The past-the-domain clamp: a filled cap whose right edge is a three-tooth
 * zigzag instead of a straight one, so a clipped value looks clipped. The
 * exec cards top out at 104% and never reach it; tab 4's 128% FinPlan cell
 * does. */
export function notchedCapPath(x0, x1, cy, h) {
  const top = cy - h / 2;
  const bottom = cy + h / 2;
  const t = h / 3;
  const tooth = 3.4;
  return [
    `M ${x0} ${top}`,
    `L ${x1 - tooth} ${top}`,
    `L ${x1} ${top + t / 2}`,
    `L ${x1 - tooth} ${top + t}`,
    `L ${x1} ${top + t * 1.5}`,
    `L ${x1 - tooth} ${top + t * 2}`,
    `L ${x1} ${top + t * 2.5}`,
    `L ${x1 - tooth} ${bottom}`,
    `L ${x0} ${bottom}`,
    "Z"
  ].join(" ");
}

function dirOf(good) {
  return good === "down" ? -1 : 1;
}

/* The bullet track on its own, at whatever size the caller has room for.
 * Exported because tab 4's outlook band carries the same grammar, and a second
 * copy of it there would be two target encodings on one board.
 *
 * The default is the plan-attainment case the exec hero cards use: a 0-110
 * percent domain with the target at 100 and the sentiment bands behind it. The
 * three options below generalise the *geometry* without touching that default,
 * because the outlook band needs the identical construction on a different
 * scale — commit in dollars, a target at the derived plan rather than at a
 * fixed 100, and no sentiment bands, since a dollar axis has no bands to
 * carry. What is reused is the part worth reusing: one continuous run from
 * zero to the target, solid where it was delivered and dashed where it was
 * not, the ink target tick standing proud of it, and the stepped cap past the
 * tick when the reading overshoots.
 *
 *   domainMax  the end of the scale               (default DOMAIN_MAX)
 *   target     where the reference tick stands    (default 100)
 *   value      what the bar measures to           (default `plan`)
 *   withBands  the sentiment bands behind it      (default true)
 *
 * `plan` still carries the tone in every case, so a dollar bar drawn at 87% of
 * plan is tinted by the same planTone() rule as a percent one. */
export function bulletTrack(opts = {}) {
  const {
    plan,
    good = "up",
    isDirect = false,
    voidTint = null,
    width = 148,
    height = 22,
    pad = 6,
    label = null,
    withArrow = false,
    withRules = true,
    withBands = true,
    domainMax = DOMAIN_MAX,
    target = 100,
    value = null
  } = opts;

  const p = palette();
  const track = { x: pad, w: width - pad * 2 };
  const cy = height / 2;
  const bandH = Math.max(6, height * 0.5);
  const barH = Math.max(4, bandH * 0.72);
  const capH = Math.min(height - 2, bandH * 1.5);
  const x = linearScale([0, domainMax], [track.x, track.x + track.w]);
  // What the bar measures, in domain units. Defaults to `plan` so every
  // existing caller keeps drawing exactly what it drew before.
  const reading = value == null ? Number(plan) || 0 : Number(value);

  const svg = chartRoot(width, height, { label, class: "bullet-svg" });
  const marks = group();
  svg.appendChild(marks);

  const isVoid = Boolean(voidTint);
  const planPct = Number(plan) || 0;
  const tint = isDirect && voidTint
    ? voidTint
    : (isDirect ? p.inkSoft : toneColor(planTone(planPct, good)));

  const rail = svgEl("path", {
    d: `M ${track.x} ${cy} H ${track.x + track.w}`,
    stroke: p.track,
    "stroke-width": bandH,
    "stroke-linecap": "butt",
    class: "bullet-track"
  });
  if (isDirect) rail.setAttribute("stroke-dasharray", "4 7");
  marks.appendChild(rail);

  const bands = [];
  const rules = [];
  if (!isDirect && withBands) {
    planBands(good).forEach((b) => {
      // The down-polarity risk region has zero width on a 0-110 domain. It is
      // still in the rule; there is simply no room for it, so it is not drawn.
      if (b.to - b.from <= 0) return;
      const node = svgEl("rect", {
        x: x(b.from),
        y: cy - bandH / 2,
        width: x(b.to) - x(b.from),
        height: bandH,
        // fill-opacity is a paint channel independent of element opacity, so
        // the build can fade these to opacity 1 and settle() restores them to
        // their authored translucency rather than to full strength.
        fill: toneColor(b.tone),
        "fill-opacity": 0.13,
        class: `bullet-band is-${b.tone}`
      });
      marks.appendChild(node);
      bands.push(node);

      // The risk band is ruled as well as tinted, so the bad region survives
      // greyscale and a colour-blind read. Vertical hairlines rather than an
      // SVG <pattern>: no <defs> means no ids to keep unique across the
      // re-render the Knowledge Layer toggle triggers on every portlet.
      if (b.tone !== "risk" || !withRules) return;
      for (let xi = x(b.from) + RULE_STEP / 2; xi < x(b.to); xi += RULE_STEP) {
        const ruleNode = svgEl("path", {
          d: `M ${xi} ${cy - bandH / 2} V ${cy + bandH / 2}`,
          stroke: p.ink,
          "stroke-opacity": 0.16,
          "stroke-width": 0.8,
          class: "bullet-rule"
        });
        marks.appendChild(ruleNode);
        rules.push(ruleNode);
      }
    });
  }

  /* The bar is a stroked line rather than a rect: strokeDraw reveals it
   * left-to-right by dash offset with a correct terminal edge on every frame,
   * where growFrom's scaleX would squash it mid-flight. Butt caps, because a
   * round cap overshoots the true endpoint by half the stroke width — points
   * of attainment the metric did not earn. */
  const barEnd = Math.max(track.x + 1.5, x(Math.min(reading, target)));
  const bar = isVoid ? null : svgEl("path", {
    d: `M ${track.x} ${cy} H ${barEnd}`,
    stroke: tint,
    "stroke-width": barH,
    "stroke-linecap": "butt",
    class: "bullet-fill"
  });
  if (bar) marks.appendChild(bar);

  /* Reach to plan: exactly one of these two, and always one of them. Every
   * card draws a continuous run from 0% to the plan tick — solid where
   * attainment delivered it, dashed where it did not — and if there is more,
   * the same run continues past the tick as a proud cap. Over-plan is not a
   * second chart appended to the first. */
  let gap = null;
  let overrun = null;
  if (!isVoid && reading < target) {
    gap = svgEl("path", {
      d: `M ${barEnd} ${cy} H ${x(target)}`,
      stroke: isDirect ? p.ghost : p.ink,
      "stroke-opacity": isDirect ? 0.9 : 0.42,
      "stroke-width": 1,
      "stroke-dasharray": "2.5 3",
      class: "bullet-gap"
    });
    marks.appendChild(gap);
  }
  if (!isVoid && reading >= target) {
    const capEnd = x(Math.min(reading, domainMax));
    // Starts a little left of the tick so it covers the bar's terminal edge
    // and the two read as one run stepping up as it crosses, rather than as
    // two abutting marks. Height carries the crossing as a categorical fact;
    // length stays the honest magnitude channel. A 1pp overshoot and a 20pp
    // overshoot both produce the step, and only their lengths differ — which
    // is what makes over-attainment legible at any magnitude rather than only
    // when it is large.
    const capStart = x(target) - Math.max(1.5, width * 0.014);
    overrun = reading > domainMax
      ? svgEl("path", { d: notchedCapPath(capStart, capEnd, cy, capH), fill: tint, class: "bullet-overrun is-notched" })
      : svgEl("path", {
        d: `M ${capStart} ${cy} H ${capEnd}`,
        stroke: tint,
        "stroke-width": capH,
        "stroke-linecap": "butt",
        class: "bullet-overrun"
      });
    marks.appendChild(overrun);
  }

  // The tick is the darkest and thinnest mark on the card and stands proud of
  // the bands above and below, so it is unambiguously a reference rather than
  // a datum. It is ink, never a sentiment tone: the target is a fact.
  let tick = null;
  if (!isVoid) {
    tick = svgEl("path", {
      d: `M ${x(target)} ${cy - height * 0.34} V ${cy + height * 0.34}`,
      stroke: isDirect ? p.axis : p.ink,
      "stroke-width": 1.6,
      class: "bullet-tick"
    });
    if (isDirect) tick.setAttribute("stroke-dasharray", "3 3");
    marks.appendChild(tick);
  }

  let arrow = null;
  if (withArrow && !isDirect) {
    arrow = goodArrow(x(target), cy + height * 0.44, dirOf(good), width * 0.14, width * 0.028, 2.4, p.ink);
    marks.appendChild(arrow);
  }

  let voidMark = null;
  if (isVoid) {
    // Centred in the track, deliberately not at x(100): without a plan basis
    // there is no 100% position for it to occupy.
    voidMark = group({ class: "bullet-void" });
    const c = track.x + track.w / 2;
    const r = Math.min(4.5, height * 0.22);
    [[-1, -1], [-1, 1]].forEach(([sx, sy]) => voidMark.appendChild(svgEl("path", {
      d: `M ${c + sx * r} ${cy + sy * r} L ${c - sx * r} ${cy - sy * r}`,
      stroke: voidTint,
      "stroke-width": 1.8,
      "stroke-linecap": "round"
    })));
    marks.appendChild(voidMark);
  }

  return {
    svg,
    bands,
    rules,
    track: rail,
    bar,
    gap,
    overrun,
    tick,
    arrow,
    voidMark,
    x,
    planX: x(target),
    all: [rail, bands, rules, bar, gap, overrun, tick, arrow, voidMark]
  };
}

function attainmentLabel(ctx, planPct, good, isVoid) {
  if (isVoid) return `${ctx.label} — no plan basis without the semantic layer`;
  return `${ctx.label} — ${planPct}% of plan against a 100% target; ${
    good === "down" ? "lower is better" : "higher is better"
  }`;
}

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const good = metrics.planGoodDirection || metrics.goodDirection || "up";
  const yoyGood = metrics.goodDirection || "up";
  const dir = dirOf(good);
  const planPct = Number(metrics.plan) || 0;

  // Red and grey tiers have no defensible plan basis, so there is no target to
  // draw and therefore no attainment. The numeric `plan` field survives the
  // direct-mode merge on all four cards, so this is driven by tier — exactly
  // as the ring was — rather than by testing whether `plan` is present.
  // Yellow keeps its bar: workable but ungoverned is the distinction the tier
  // system exists to draw, and flattening it here would erase it.
  const barIsVoid = isDirect && (tier === "red" || tier === "grey");
  const planTint = isDirect ? meta.color : toneColor(planTone(planPct, good));

  const wrap = document.createElement("div");
  wrap.className = "attain";
  wrap.style.setProperty("--attain-tint", barIsVoid ? p.inkDim : planTint);

  /* The card surface takes the verdict.
   *
   * These four are the only portlets on the board whose whole job is a
   * judgement — attained or missed against a certified plan — so they are the
   * only ones that earn a sentiment-tinted surface rather than an accent-tinted
   * one. Three washed red beside one washed green is the quarter, readable
   * from across a room and before any figure resolves.
   *
   * Written onto the portlet element rather than the chart's own wrapper
   * because the surface being tinted is .portlet-front, which is this node's
   * ancestor — custom properties inherit down, so a value set here would never
   * reach it. The colour comes from planTone() through toneColor(), which
   * reads the drained palette in direct mode, so the wash disappears with
   * every other tint on the board rather than needing its own branch. */
  const card = host.closest(".portlet");
  if (card) {
    card.style.setProperty("--tone-color", barIsVoid ? p.inkDim : planTint);
    card.dataset.surface = "tone";
  }

  /* ---- hero numeral: the answer to "what happened" ---- */
  const hero = document.createElement("div");
  hero.className = "attain-hero";
  const valueEl = document.createElement("div");
  valueEl.className = "attain-value";
  if (isDirect) valueEl.dataset.contested = "true";
  hero.appendChild(valueEl);
  wrap.appendChild(hero);

  /* ---- the track: the answer to "is that a problem" ---- */
  const row = document.createElement("div");
  row.className = "attain-row";

  const x = linearScale([0, DOMAIN_MAX], [TRACK.x, TRACK.x + TRACK.w]);
  const svg = chartRoot(W, H, {
    label: attainmentLabel(ctx, planPct, good, barIsVoid),
    class: "attain-svg"
  });
  const marks = group();
  svg.appendChild(marks);

  const track = svgEl("path", {
    d: `M ${TRACK.x} ${CY} H ${TRACK.x + TRACK.w}`,
    stroke: p.track,
    "stroke-width": BAND_H,
    "stroke-linecap": "butt",
    class: "attain-track"
  });
  if (isDirect) track.setAttribute("stroke-dasharray", "4 7");
  marks.appendChild(track);

  /* Qualitative bands, mirrored by polarity. planBands() comes from the same
   * constants planTone() rules on, so the geometry and the colour cannot
   * drift apart. On the three up-metrics the ruled risk zone fills the left
   * approach to plan; on attrition it has no room at all and the positive
   * band runs all the way to the tick. That asymmetry of texture across the
   * hero band is the polarity, visible peripherally. */
  const bandNodes = [];
  const ruleNodes = [];
  if (!isDirect) {
    planBands(good).forEach((b) => {
      if (b.to - b.from <= 0) return;
      const node = svgEl("rect", {
        x: x(b.from),
        y: CY - BAND_H / 2,
        width: x(b.to) - x(b.from),
        height: BAND_H,
        fill: toneColor(b.tone),
        "fill-opacity": 0.13,
        class: `attain-band is-${b.tone}`
      });
      marks.appendChild(node);
      bandNodes.push(node);

      if (b.tone !== "risk") return;
      for (let xi = x(b.from) + 4; xi < x(b.to); xi += RULE_STEP) {
        const ruleNode = svgEl("path", {
          d: `M ${xi} ${CY - BAND_H / 2} V ${CY + BAND_H / 2}`,
          stroke: p.ink,
          "stroke-opacity": 0.16,
          "stroke-width": 0.8,
          class: "attain-rule"
        });
        marks.appendChild(ruleNode);
        ruleNodes.push(ruleNode);
      }
    });
  }

  // Guarded to a minimum length: strokeDraw calls getTotalLength() and falls
  // through on 0, which for a butt-capped line renders nothing at all.
  /* Not created rather than created transparent: settle() writes
   * style.opacity = "1" on every node it restores, which would override an
   * opacity attribute and put a bar back on a card that has no denominator
   * for one. A mark that must never appear must never exist. */
  const barEnd = Math.max(TRACK.x + 1.5, x(Math.min(planPct, 100)));
  const bar = barIsVoid ? null : svgEl("path", {
    d: `M ${TRACK.x} ${CY} H ${barEnd}`,
    stroke: planTint,
    "stroke-width": BAR_H,
    "stroke-linecap": "butt",
    class: "attain-bar"
  });
  if (bar) marks.appendChild(bar);

  let gapTrace = null;
  let overrun = null;
  if (!barIsVoid && planPct < 100) {
    // The gap to plan becomes a drawn, measurable object rather than empty
    // space. On NNAOV it is 5.7 times the length of the bar itself, and the
    // eye reads that ratio without being asked to.
    gapTrace = svgEl("path", {
      d: `M ${barEnd} ${CY} H ${x(100)}`,
      stroke: isDirect ? p.ghost : p.ink,
      "stroke-opacity": isDirect ? 0.9 : 0.42,
      "stroke-width": 1,
      "stroke-dasharray": "2.5 3",
      class: "attain-gap"
    });
    marks.appendChild(gapTrace);
  }
  if (!barIsVoid && planPct >= 100) {
    const capEnd = x(Math.min(planPct, DOMAIN_MAX));
    overrun = planPct > DOMAIN_MAX
      ? svgEl("path", { d: notchedCapPath(x(100) - 3, capEnd, CY, CAP_H), fill: planTint, class: "attain-overrun is-notched" })
      : svgEl("path", {
        d: `M ${x(100) - 3} ${CY} H ${capEnd}`,
        stroke: planTint,
        "stroke-width": CAP_H,
        "stroke-linecap": "butt",
        class: "attain-overrun"
      });
    marks.appendChild(overrun);
  }

  let tick = null;
  let tickHit = null;
  if (!barIsVoid) {
    // 2 units wide rather than 1.6: the tick is the reference the four cards
    // are read against and it was the thinnest mark on a card the reviewer
    // could not read at laptop size.
    tick = svgEl("path", {
      d: `M ${x(100)} 5 V 41`,
      stroke: isDirect ? p.axis : p.ink,
      "stroke-width": 2,
      class: "attain-tick"
    });
    if (isDirect) tick.setAttribute("stroke-dasharray", "3.5 3.5");
    marks.appendChild(tick);

    // padHit() refuses a mark that already carries a real stroke, so the tick
    // gets a transparent rect over it as its hit target instead.
    tickHit = svgEl("rect", {
      x: x(100) - 6,
      y: 5,
      width: 12,
      height: 36,
      fill: "transparent",
      class: "attain-tick-hit"
    });
    marks.appendChild(tickHit);
    ctx.tip(
      tickHit,
      isDirect
        ? "A target exists here, but nothing certifies which version of the plan it is or which direction is good."
        : `Plan target · 100% · ${good === "down" ? "lower is better" : "higher is better"} (certified)`
    );
  }

  /* Polarity as orientation. Only drawn when a semantic layer is asserting it:
   * the absence of every arrow in direct mode is the degradation, and it is
   * meant to be noticed. */
  let planArrow = null;
  if (!isDirect) {
    // 22 units: the tick is at 184.4 of a 210 viewBox, so this is the longest
    // arrow that fits on the up side without being clipped, and the down side
    // takes the same length. It was 18 and the head was 5.5 units, which at
    // 1024 rendered as about 3px of arrowhead — a polarity signal nobody
    // could see is not a polarity signal.
    planArrow = goodArrow(x(100), 48, dir, 22, 7, 3.6, p.ink);
    marks.appendChild(planArrow);
  }

  let voidMark = null;
  if (barIsVoid) {
    voidMark = group({ class: "attain-void" });
    const c = TRACK.x + TRACK.w / 2;
    const r = 4.5;
    [[-1, -1], [-1, 1]].forEach(([sx, sy]) => voidMark.appendChild(svgEl("path", {
      d: `M ${c + sx * r} ${CY + sy * r} L ${c - sx * r} ${CY - sy * r}`,
      stroke: meta.color,
      "stroke-width": 1.8,
      "stroke-linecap": "round"
    })));
    marks.appendChild(voidMark);
  }

  row.appendChild(svg);

  // The mark carries the comparison; the numeral carries the precision. The
  // gutter is fixed-width and right-aligned, so the four numerals form a
  // readable column down the hero band and reinforce the shared alignment.
  const pctEl = document.createElement("span");
  pctEl.className = "attain-pct";
  // Short, and in the register of an absence. Whatever the direct-mode block
  // authored for `planDisplay` — "plan basis undefined", "no point-in-time
  // contract book" — is a sentence, and the face has room for two words; the
  // sentence itself is the Plan basis row of the expand table.
  pctEl.textContent = barIsVoid ? "no basis" : `${Math.round(planPct)}%`;
  if (barIsVoid) pctEl.dataset.void = "true";
  row.appendChild(pctEl);

  /* ---- axis furniture: geometry survives tight breakpoints, labels do not ----
   * The axis strip is a grid item in the same column as the track rather than
   * a sibling below the whole card, so its width is the track's width by
   * construction and the `plan` label sits under the tick at every breakpoint
   * with nothing measured. */
  const axis = document.createElement("div");
  axis.className = "attain-axis";
  const axisZeroEl = document.createElement("span");
  axisZeroEl.className = "attain-axis-zero";
  axisZeroEl.textContent = "0";
  const axisPlanEl = document.createElement("span");
  axisPlanEl.className = "attain-axis-plan";
  axisPlanEl.textContent = barIsVoid ? "no target" : "plan";
  if (barIsVoid) axisPlanEl.dataset.void = "true";
  axis.appendChild(axisZeroEl);
  axis.appendChild(axisPlanEl);
  row.appendChild(axis);
  wrap.appendChild(row);

  // Set from JS so the label can never drift from the tick it names.
  wrap.style.setProperty("--plan-x", `${((x(100) / W) * 100).toFixed(2)}%`);
  wrap.style.setProperty("--zero-x", `${((TRACK.x / W) * 100).toFixed(2)}%`);

  /* ---- Y/Y sub-track: the answer to "and which way is it moving" ----
   * Its own SVG rather than a second band inside the first, so it can be
   * max-width clamped independently and dropped by media query without
   * leaving reserved empty space inside a fixed viewBox. It is kept
   * subordinate by extent, not only by size: a third of the attainment
   * track's width, and physically incapable of reading as the primary bar. */
  const yoyRow = document.createElement("div");
  yoyRow.className = "attain-yoy";

  const yoyValue = Number(metrics.yoy) || 0;
  const yoyTint = isDirect ? meta.color : toneColor(toneOf(yoyValue, yoyGood));
  const mag = (Math.min(Math.abs(yoyValue), 100) / 100) * HALF;

  const yoySvg = chartRoot(YW, YH, {
    label: `${ctx.label} — ${metrics.yoyDisplay || "no year-on-year movement authored"}`,
    class: "attain-yoy-svg"
  });
  const yoyMarks = group();
  yoySvg.appendChild(yoyMarks);

  const yoyZero = svgEl("path", {
    d: `M ${ZERO} 3 V 17`,
    stroke: p.axis,
    "stroke-width": 1.1,
    class: "attain-yoy-zero"
  });
  yoyMarks.appendChild(yoyZero);

  // The path starts at zero and runs toward the sign, so strokeDraw grows it
  // outward in the correct direction with no origin bookkeeping.
  const yoyStub = svgEl("path", {
    d: `M ${ZERO} 10 H ${ZERO + Math.sign(yoyValue || 1) * Math.max(mag, 0.8)}`,
    stroke: yoyTint,
    "stroke-width": 8,
    "stroke-linecap": "butt",
    class: "attain-yoy-bar"
  });
  yoyMarks.appendChild(yoyStub);

  /* The polarity trap this closes: attrition's -12% is good and NNAOV's -75%
   * is bad, and both stubs point left because both numbers are negative. The
   * stub encodes the signed change and must keep doing so. The mirrored arrow
   * underneath is what says which of those two leftward stubs is the good
   * one. */
  let yoyArrow = null;
  if (!isDirect) {
    yoyArrow = goodArrow(ZERO, 22.5, dirOf(yoyGood), 15, 5, 3, p.ink);
    yoyMarks.appendChild(yoyArrow);
  }

  yoyRow.appendChild(yoySvg);
  const yoyLabelEl = document.createElement("span");
  yoyLabelEl.className = "attain-yoy-label";
  yoyLabelEl.style.setProperty("--delta-tint", yoyTint);
  yoyLabelEl.textContent = metrics.yoyDisplay || "";
  yoyRow.appendChild(yoyLabelEl);
  wrap.appendChild(yoyRow);

  /* The caption is the only flexible row on the card, so vertical pressure at
   * tight breakpoints lands on the one element that can lose a line without
   * losing meaning rather than crushing the chart. */
  const captionEl = document.createElement("p");
  captionEl.className = "attain-caption";
  captionEl.textContent = metrics.caption || "";
  wrap.appendChild(captionEl);

  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";
    const table = document.createElement("table");
    table.className = "trend-table";
    const tbody = document.createElement("tbody");

    const add = (label, value) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.className = "trend-table-rowlabel";
      th.textContent = label;
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(th);
      tr.appendChild(td);
      tbody.appendChild(tr);
    };

    add(metrics.unit || "value", metrics.display || "—");
    add("Attainment", barIsVoid ? "no plan basis" : `${planPct.toFixed(1)}% of plan`);
    // The caption is the card's flexible row and is dropped below 860px tall,
    // so the table is where it has to remain reachable.
    if (metrics.caption) add("Reading", metrics.caption);
    add("Plan basis", metrics.planDisplay || "—");
    add("Y/Y", metrics.yoyDisplay || "—");
    add(
      "Polarity",
      good === "down"
        ? "Lower is better — carried by the certified measure"
        : "Higher is better — carried by the certified measure"
    );
    planBands(good).forEach((b) => {
      if (b.to - b.from <= 0) return;
      add(`${b.tone} band`, `${b.from}% to ${b.to}% of plan`);
    });
    table.appendChild(tbody);
    detail.appendChild(table);

    const note = document.createElement("p");
    note.className = "trend-table-note";
    note.textContent = `Track domain 0 to ${DOMAIN_MAX}% of plan, identical on all four cards, so the plan ticks align and the four attainments are one horizontal scan.`;
    detail.appendChild(note);
    return detail;
  }

  /* Every mark is in the veil list. A mark that is not veiled is mounted at
   * full opacity and driven to zero when its beat arrives — visible for as
   * long as the sequence takes to reach it, then flashing out and drawing back
   * in. Both SVG roots and their children are veiled; opacity multiplies, so
   * that is safe. settle() restores anything a beat never reached, which is
   * what makes the conditional marks here — exactly one of gap/overrun, and
   * the arrows and void mark that exist in one mode each — safe to veil. */
  const curtain = veil([
    svg, track, bandNodes, ruleNodes, bar, gapTrace, overrun, tick, planArrow, voidMark,
    yoySvg, yoyZero, yoyStub, yoyArrow,
    valueEl, pctEl, axisZeroEl, axisPlanEl, yoyLabelEl, captionEl
  ]);
  curtain.hide();

  async function build(signal) {
    const display = metrics.display || "";
    const candidates = isDirect ? (ctx.portlet.directMode || {}).candidates : null;

    // The hero is not made to wait for the chart — it is the hero.
    fadeIn(svg, { duration: 400, y: 5, signal });
    fadeIn(valueEl, { duration: 400, y: 10, signal });
    if (candidates && candidates.length > 1) {
      scramble(valueEl, candidates, display, { delay: 100, signal });
    } else {
      countUp(valueEl, display, { delay: 60, duration: 1020, signal });
    }

    // The scale arrives empty first: you draw the ruler before the
    // measurement.
    await wait(150, signal);
    stagger([...bandNodes, ...ruleNodes], { step: 55, maxTotal: 300, duration: 300, y: 0, signal });

    await wait(180, signal);
    if (tick) strokeDraw(tick, { duration: 300, signal });

    // Each arrow enters travelling in the good direction, so the motion
    // states the polarity as well as the shape does.
    await wait(100, signal);
    if (planArrow) fadeIn(planArrow, { duration: 300, y: 0, x: -5 * dir, signal });
    if (yoyArrow) fadeIn(yoyArrow, { delay: 60, duration: 300, y: 0, x: -4 * dirOf(yoyGood), signal });
    fadeIn(axisZeroEl, { duration: 300, y: 0, signal });
    fadeIn(axisPlanEl, { delay: 60, duration: 300, y: 0, signal });

    await wait(90, signal);
    if (bar) strokeDraw(bar, { duration: 720, signal });

    // The bar is arriving at the tick as its reach-to-plan mark fires. On
    // attrition it visibly crosses and steps up; that is the moment worth
    // having.
    await wait(680, signal);
    // dashDraw, not strokeDraw: the dashes carry meaning here — this length
    // was not delivered — and strokeDraw would consume the dash pattern as
    // its own reveal mechanism.
    if (gapTrace) dashDraw(gapTrace, { duration: 420, signal });
    // The notched cap is a filled path with no stroke, and strokeDraw reveals
    // by dash offset — so it grows where it is a line and fades where it is a
    // shape. Not exercised by the four exec cards, which top out at 104%.
    if (overrun) {
      if (overrun.classList.contains("is-notched")) fadeIn(overrun, { duration: 380, x: -8, y: 0, signal });
      else strokeDraw(overrun, { duration: 380, signal });
    }
    if (voidMark) {
      Array.from(voidMark.children).forEach((path, i) =>
        strokeDraw(path, { delay: 60 + i * 120, duration: 300, signal })
      );
      fadeIn(voidMark, { duration: 200, y: 0, signal });
    }
    fadeIn(pctEl, { delay: 60, duration: 320, y: 0, x: -6, signal });

    await wait(200, signal);
    fadeIn(yoySvg, { duration: 320, y: 4, signal });
    strokeDraw(yoyStub, { delay: 60, duration: 420, signal });
    fadeIn(yoyZero, { duration: 260, y: 0, signal });
    fadeIn(yoyLabelEl, { delay: 140, duration: 360, y: 4, signal });

    await wait(220, signal);
    fadeIn(captionEl, { duration: 420, y: 6, signal });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
