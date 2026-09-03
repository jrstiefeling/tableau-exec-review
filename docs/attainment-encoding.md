# Attainment encoding for the four quarter-to-date KPI cards

**Status:** settled design, ready to implement. Replaces `src/charts/gauge.js` with `src/charts/attainment.js`.
**Scope:** the four `kind: "gauge"` portlets in the `hero` band of tab 1 — `kpi-nnaov`, `kpi-acv`, `kpi-attrition`, `kpi-pipegen`.
**Requires no change to `data/board.json`.** One additive export in `src/palette.js` (§12) and a set of new CSS classes (§13).

This document goes deeper than [`visualization-research.md` §1](./visualization-research.md), which recommended a polarity-mirrored bullet graph. That recommendation stands and is adopted. Three things in it are refined or overruled, each flagged inline: the 100%-crossing treatment (§5), the polarity device (§6), and the animation approach to translucent fills (§8).

---

## 1. The recommendation

**A polarity-mirrored bullet track on a fixed 0–120% shared scale, with a solid overrun cap past the plan tick, a dashed shortfall trace short of it, and a good-direction arrow anchored at the tick.**

Five marks, in the order a reader should meet them:

| Mark | Encodes | Channel |
|---|---|---|
| **Track** — a 194-unit horizontal rule, 0% at the left, 120% at the right | the domain | position along a common scale |
| **Bands** — three tinted regions whose boundaries are `planTone`'s own thresholds, mirrored by polarity | the stated threshold rule | position + hue + texture |
| **Bar** — a butt-capped stroked line from 0% to `min(plan, 100)` | attainment delivered | length from a common origin |
| **Reach-to-plan** — *either* a dashed hairline from the bar's end to the tick (under) *or* a solid cap standing proud past it (over) | the relationship to plan | length + a categorical step |
| **Good-direction arrow** — a short rail and arrowhead at the tick, pointing the way the measure says is good | polarity | orientation |

Plus a subordinate Y/Y sub-track: a diverging stub on a ±100pp scale, one third the width of the attainment track, with its own mirrored arrow.

### Do the four cards share a scale?

**Yes — one fixed domain and identical pixel geometry, and this is load-bearing rather than incidental.**

- **Domain is fixed at `[0, 120]` for all four cards.** Not data-driven, not per-card. The `plan` field is already a percent-of-plan, so the domain is unitless and genuinely shared; nothing is being forced onto a common axis that does not belong there.
- **Pixel geometry is identical too.** The four cards are equal columns of `grid-template-columns: repeat(4, minmax(0, 1fr))`, the chart row carries the same `max-width` in each, and the SVG has the same `viewBox`. So `x(100)` lands at the same offset from every card's left padding edge. **The four plan ticks form one continuous vertical line down the hero band, and the four bar ends are comparable by a single horizontal scan.** That comparison — 15%, 70%, 79%, 104% ranked pre-attentively — is the entire win over four rings, and it is bought by alignment, not by merging the cards.
- **What is *not* shared: the hero dollar values.** $6M, $82M, $75M and $789M are four different measures at four different magnitudes. They are typographic, never graphical: no bar, no sparkline, no shared axis. Putting them on one scale would say they are commensurable, which they are not.
- **The Y/Y sub-track is shared too**, on a fixed ±100pp domain matching the cap the existing `.delta-bar` already uses.

Why `[0, 120]` rather than the `[0, 110]` in the research doc: `planTone`'s down-polarity risk threshold is `plan > 110`. On a `[0, 110]` domain that band has zero width, so the attrition card would show only two of its three bands and the polarity mirror would be visibly incomplete. 120 gives the down-polarity risk band 10pp (16.2 units, ~23px at full size) — enough to read as a region. The cost is stated in §15.

---

## 2. Why this form

**Angle is the wrong channel for the comparison the band exists to support.** Cleveland and McGill rank position-along-a-common-scale first among elementary perceptual tasks and angle near the bottom; area is worse still. The reader's job on the hero band is to rank four attainments and find the outliers. Four rings force four independent angle judgements with no shared reference. Four aligned bullet tracks make the ranking a scan.

**A radial arc has no region past a full turn.** The current `gauge.js` has to grow a second, thinner arc at `R + 9` to say "104%", because going round again would read as *fuller* — which, for a lower-is-better measure, would read as *better*, which is exactly backwards. A linear scale has a past-the-target region for free; you draw past the tick.

**The threshold rule becomes geometry instead of a colour to be trusted.** `planTone()` already defines three qualitative regions per polarity. On a ring those can only tint the arc. On a track they are drawn as literal regions with visible boundaries — and the tab-2 rules card explicitly claims "one stated threshold rather than a per-cell judgement" as something the semantic layer buys. This renders that claim rather than asserting it.

**Polarity becomes a visible mirror.** For the three up-metrics the good band sits right of the tick and the arrow points right. For attrition the identical construction flips: good band left, arrow left. A reader glancing across the hero band sees three cards pointing one way and one pointing the other, and can tell that something is different about attrition before reading a single word. The ring cannot express this at all — 104% of a circle looks like 104% of a circle regardless of which way is good, and the current design carries the whole burden on tint. This is the board's own central argument (a slide colours those cells by hand; a semantic layer knows the polarity), so the encoding should make the point, not merely avoid getting it wrong.

---

## 3. Rejected alternatives

| Form | Why not |
|---|---|
| **Radial gauge (current)** | Angle for magnitude; no natural region past 100%; four rings are four independent judgements with no shared reference. This is the defect the user named and it is real. |
| **Banded ring with a target tick** (the research doc's "practical downgrade": keep the ring, add band arcs, map 0–110% to 0–330°) | Keeps angle as the magnitude channel, which is the actual problem. It buys bands and a target and still forfeits four-way comparability. Overruled — but it is the fallback if the ring is judged load-bearing to the board's visual identity. |
| **Dot-plus-target lollipop** | A dot encodes position but not extent, so "delivered 15% of plan" loses its sense of accumulation — and accumulation is what a quarter-to-date figure is. At the sizes here the dot and the tick collide for any value near 100%. |
| **Deviation-from-target bar anchored at the 100% line, signed** | Violates the board's own stated zero-baseline rule (tab-2 rules card: "Every value axis starts at zero"). It also answers only "how far off" and discards "how much was delivered", when the exec question is both. Worst, on one deviation axis NNAOV's −85pp dwarfs attrition's +4pp, making the miss that the polarity argument depends on visually negligible. **Its good half is adopted anyway:** the shortfall trace in §5 is a deviation mark, drawn as secondary hairline rather than as the primary bar. |
| **Slope / arrow from prior-year attainment to current** | Rejected on data grounds, not design grounds. `metrics.yoy` is the Y/Y of the *value*; recovering prior-year *attainment* needs the prior-year *plan*, which is nowhere in `board.json`. Back-solving it would be the app doing precisely what it criticises. Available only if a `priorPlan` field is authored, and that is a data-agent decision. |
| **Vertical thermometer with an overflow segment** | The overflow segment is right and is adopted as the overrun cap in §5. The vertical orientation is wrong: the card is roughly 4:1 wide, so a vertical track has about a quarter of the resolution a horizontal one has for the same pixels. |
| **Small-multiple single panel, all four rows on one shared 0–120% axis** | The comparison it buys is real and is captured instead by fixed-domain-plus-aligned-geometry (§1). What it costs is not recoverable: collapsing four portlets into one destroys four trust dots, four provenance flip faces, four `kind` bindings in `board.json`, and four nodes in `buildMeasureGraph` — including the `kpi-acv` ↔ `trend-acv` cross-tab measure edge, which the README calls the most persuasive edge on the board. Not worth it. |
| **Reversing the axis for the lower-is-better metric** so longer always means better | Tempting and wrong. It makes three cards read left-to-right and one right-to-left with no visible sign that it happened — a covert axis flip is exactly the kind of invisible rule this board exists to criticise. Polarity goes in the arrow and the band mirror, never in the axis direction. |
| **Sparkline of quarterly attainment history** | Grain mismatch. The tiles are fiscal-quarter; the only history authored anywhere is fiscal-year. |

---

## 4. Coordinate system and construction

Two sibling SVGs rather than one. This is deliberate: it lets the Y/Y sub-track be independently `max-width`-clamped so it can never grow to compete with the attainment track, and it lets the sub-track be dropped by CSS at tight breakpoints without leaving reserved empty space inside a fixed `viewBox` (which is what a single SVG would do, since CSS cannot rewrite a `viewBox`).

### 4.1 Attainment SVG — `viewBox="0 0 210 44"`

```js
const W = 210, H = 44;
const TRACK = { x: 8, w: 194 };                      // 8 .. 202
const CY = 19;                                        // bar centreline
const x = linearScale([0, 120], [TRACK.x, TRACK.x + TRACK.w]);   // 1.6167 units per pp
```

| Element | y range | Notes |
|---|---|---|
| Plan tick | 4 → 34 | tallest mark; the reference stands proud of everything it references |
| Overrun cap | 7 → 31 | stroke-width 24, butt caps |
| Bands | 11 → 27 | three `rect`s, height 16 |
| Bar | 13 → 25 | stroke-width 12, butt caps |
| Shortfall trace | 19 | hairline, on the bar's centreline |
| Good-direction rail + arrowhead | 36 → 42 | rail at y 39 |

Scale reference for the authored values:

| % of plan | `x()` | which card |
|---|---|---|
| 0 | 8.00 | track origin |
| 15 | 32.25 | NNAOV |
| 70 | 121.17 | ACV |
| 79 | 135.72 | Pipegen |
| 85 | 145.42 | up-polarity risk/warn boundary |
| 100 | **169.67** | the plan tick, identical on all four cards |
| 104 | 176.13 | Attrition |
| 110 | 185.83 | down-polarity warn/risk boundary |
| 120 | 202.00 | track end |

### 4.2 Construction sketch

```js
// src/charts/attainment.js
import { chartRoot, svgEl, text, group, linearScale } from "../svg.js";
import { palette, toneOf, planTone, planBands, toneColor, tierMeta } from "../palette.js";
import { countUp, scramble, strokeDraw, dashDraw, fadeIn, stagger, wait, veil } from "../anim.js";

const W = 210, H = 44;
const TRACK = { x: 8, w: 194 };
const CY = 19;
const BAR_H = 12, CAP_H = 24, BAND_H = 16;

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const x = linearScale([0, 120], [TRACK.x, TRACK.x + TRACK.w]);
  const good = metrics.planGoodDirection || metrics.goodDirection || "up";
  const dir = good === "down" ? -1 : 1;              // +1 = good is rightward
  const planPct = Number(metrics.plan) || 0;
  const planTint = isDirect ? meta.color : toneColor(planTone(planPct, good));

  // Red and grey have no defensible plan basis, so there is no target to draw
  // and therefore no attainment. The track renders empty rather than showing a
  // number the data cannot support. Yellow keeps its bar — see §9.
  const barIsVoid = isDirect && (tier === "red" || tier === "grey");

  const svg = chartRoot(W, H, {
    label: attainmentLabel(ctx, planPct, good, barIsVoid),
    class: "attain-svg"
  });
  const marks = group();
  svg.appendChild(marks);

  /* ---- track ---- */
  const track = svgEl("path", {
    d: `M ${TRACK.x} ${CY} H ${TRACK.x + TRACK.w}`,
    stroke: p.track, "stroke-width": BAND_H, "stroke-linecap": "butt",
    class: "attain-track"
  });
  if (isDirect) track.setAttribute("stroke-dasharray", "4 7");
  marks.appendChild(track);

  /* ---- qualitative bands, mirrored by polarity ----
   * planBands() is exported from palette.js and derived from the same
   * constants planTone() uses, so the geometry and the colour cannot drift.
   *   up:   [0,85) risk | [85,100) warn | [100,120] positive
   *   down: [0,100] positive | (100,110] warn | (110,120] risk
   * fill-opacity is a paint attribute, not element opacity, so the build can
   * safely fadeIn these to opacity 1 (see §8). */
  const bandNodes = [];
  const ruleNodes = [];
  if (!isDirect) {
    planBands(good).forEach((b) => {
      const node = svgEl("rect", {
        x: x(b.from), y: CY - BAND_H / 2, width: x(b.to) - x(b.from), height: BAND_H,
        fill: toneColor(b.tone), "fill-opacity": 0.13, class: `attain-band is-${b.tone}`
      });
      marks.appendChild(node);
      bandNodes.push(node);

      // The risk band is ruled as well as tinted, so the bad region survives
      // greyscale and a colour-blind read. Vertical hairlines, no <defs> and
      // no clipPath, so there are no ids to keep unique across re-renders.
      if (b.tone !== "risk") return;
      for (let xi = x(b.from) + 3.5; xi < x(b.to); xi += 7) {
        const rule = svgEl("path", {
          d: `M ${xi} ${CY - BAND_H / 2} V ${CY + BAND_H / 2}`,
          stroke: p.ink, "stroke-opacity": 0.16, "stroke-width": 0.8,
          class: "attain-rule"
        });
        marks.appendChild(rule);
        ruleNodes.push(rule);
      }
    });
  }

  /* ---- the bar ----
   * A stroked line, not a rect. strokeDraw reveals it left-to-right by dash
   * offset with a correct terminal edge on every frame, where growFrom's
   * scaleX would squash the corner radii mid-flight. butt caps, because a
   * round cap would overshoot the true endpoint by half the stroke width —
   * 6 units, or 3.7pp of attainment the metric did not earn. */
  const barEnd = Math.max(TRACK.x + 1.5, x(Math.min(planPct, 100)));
  const bar = svgEl("path", {
    d: `M ${TRACK.x} ${CY} H ${barEnd}`,
    stroke: planTint, "stroke-width": BAR_H, "stroke-linecap": "butt",
    class: "attain-bar", opacity: barIsVoid ? 0 : 1
  });
  marks.appendChild(bar);

  /* ---- reach to plan: exactly one of these two, always one of them ---- */
  let gapTrace = null, overrun = null;
  if (!barIsVoid && planPct < 100) {
    gapTrace = svgEl("path", {
      d: `M ${barEnd} ${CY} H ${x(100)}`,
      stroke: p.ink, "stroke-opacity": 0.42, "stroke-width": 1,
      "stroke-dasharray": "2.5 3", class: "attain-gap"
    });
    marks.appendChild(gapTrace);
  }
  if (!barIsVoid && planPct >= 100) {
    // Starts 3 units left of the tick so it covers the bar's terminal edge and
    // the two read as one continuous run rather than two abutting marks.
    const capEnd = x(Math.min(planPct, 120));
    overrun = svgEl("path", {
      d: `M ${x(100) - 3} ${CY} H ${capEnd}`,
      stroke: planTint, "stroke-width": CAP_H, "stroke-linecap": "butt",
      class: "attain-overrun"
    });
    marks.appendChild(overrun);
    if (planPct > 120) overrun.setAttribute("d", notchedCapPath(x(100) - 3, capEnd));
  }

  /* ---- plan tick ---- */
  let tick = null;
  if (!barIsVoid) {
    tick = svgEl("path", {
      d: `M ${x(100)} 4 V 34`,
      stroke: isDirect ? p.axis : p.ink, "stroke-width": 1.6,
      class: "attain-tick"
    });
    if (isDirect) tick.setAttribute("stroke-dasharray", "3 3");
    marks.appendChild(tick);
  }

  /* ---- good-direction arrow: polarity as orientation ----
   * Only drawn when a semantic layer is asserting the polarity. Its absence in
   * direct mode is the degradation, and it is meant to be noticed. */
  let planArrow = null;
  if (!isDirect) {
    planArrow = goodArrow(x(100), 39, dir, 30, 6, 3, p.ink);
    marks.appendChild(planArrow);
  }

  /* ---- void mark: red and grey earn a hard X, per TIERS[].x ---- */
  let voidMark = null;
  if (barIsVoid) {
    // Centred in the track, deliberately NOT at x(100): without a plan basis
    // there is no 100% position for it to occupy.
    voidMark = group({ class: "attain-void" });
    const c = TRACK.x + TRACK.w / 2, r = 4.5;
    [[-1, -1], [-1, 1]].forEach(([sx, sy]) => voidMark.appendChild(svgEl("path", {
      d: `M ${c + sx * r} ${CY + sy * r} L ${c - sx * r} ${CY - sy * r}`,
      stroke: meta.color, "stroke-width": 1.8, "stroke-linecap": "round"
    })));
    marks.appendChild(voidMark);
  }
  // ... Y/Y SVG (§4.3), DOM rows (§7), veil + build (§8)
}

/* A rail with an arrowhead, pointing whichever way the measure says is good.
 * One primitive, used at both reference marks on the card. */
function goodArrow(originX, y, dir, len, head, halfH, stroke) {
  const g = group({ class: "attain-arrow", "data-dir": dir > 0 ? "up" : "down" });
  const tipX = originX + dir * len;
  const baseX = originX + dir * (len - head);
  g.appendChild(svgEl("path", {
    d: `M ${originX} ${y} H ${baseX}`,
    stroke, "stroke-opacity": 0.75, "stroke-width": 1
  }));
  g.appendChild(svgEl("path", {
    d: `M ${tipX} ${y} L ${baseX} ${y - halfH} L ${baseX} ${y + halfH} Z`,
    fill: stroke, "fill-opacity": 0.75
  }));
  return g;
}
```

`notchedCapPath(x0, x1)` handles the above-120% clamp: a filled path whose right edge is a three-tooth zigzag instead of a straight edge, so a clipped value looks clipped. Not exercised by the current data (max is 104%) but specified so the form has no undefined state.

### 4.3 Y/Y sub-track SVG — `viewBox="0 0 96 24"`

```js
const YW = 96, YH = 24;
const ZERO = 48;                 // centre rule
const HALF = 44;                 // ±100pp maps to ±44 units
const yoy = Number(metrics.yoy) || 0;
const mag = (Math.min(Math.abs(yoy), 100) / 100) * HALF;
const yoyTint = isDirect ? meta.color : toneColor(toneOf(yoy, metrics.goodDirection || "up"));

// zero rule
svgEl("path", { d: `M ${ZERO} 3 V 15`, stroke: p.axis, "stroke-width": 0.9 });

// the stub. Path starts at ZERO and runs toward the sign, so strokeDraw grows
// it outward from zero in the correct direction with no extra bookkeeping.
const yoyStub = svgEl("path", {
  d: `M ${ZERO} 9 H ${ZERO + Math.sign(yoy || 1) * mag}`,
  stroke: yoyTint, "stroke-width": 6, "stroke-linecap": "butt", class: "attain-yoy-bar"
});

// same arrow primitive, smaller, same polarity source. Absent in direct mode.
const yoyArrow = goodArrow(ZERO, 19.5, dirOf(metrics.goodDirection), 13, 4, 2.5, p.ink);
```

Rendered stub widths: NNAOV −75 → 33.0 units; ACV −28 → 12.3; Attrition −12 → 5.3; Pipegen −8 → 3.5. Small Y/Y values render as slivers by design — the numeral beside the stub carries the precision, and the ±100pp domain is kept fixed so the four are comparable and so it matches the cap the existing `.delta-bar` already applies.

**Note the polarity trap this closes.** Attrition's −12% is *good* and NNAOV's −75% is *bad*, and both stubs point left, because both numbers are negative. The stub encodes the signed change and must keep doing so. The mirrored arrow underneath is what tells the reader which of those two leftward stubs is the good one. Three cards' Y/Y arrows point right; attrition's points left, matching its plan arrow. Both reference marks on the attrition card point the same, opposite, way.

---

## 5. The 100% contract: over- and under-attainment

The structural claim, and the answer to "over-attainment must not be a special case":

> **Every card draws a continuous run from 0% to the plan tick.** Solid where attainment delivered it, dashed where it did not. If there is more, the same run continues past the tick as a proud cap. Over-plan is not a second chart appended to the first — it is one run crossing a reference it was always heading for.

**The plan tick.** A 30-unit vertical path at `x(100)`, `stroke-width: 1.6`, in `p.ink` — the darkest and thinnest mark on the card. It stands 7 units proud of the bands above and below, so it is unambiguously a reference rather than a datum. It is ink, never a sentiment tone: the target is a fact, not an opinion. It draws top-to-bottom via `strokeDraw` on beat 3, before the bar, because you draw the ruler before the measurement.

**Under 100%.** The bar stops at `x(plan)`, and a dashed hairline runs from there to the tick along the bar's centreline. The gap to plan becomes a drawn, measurable object rather than empty space. Uses `dashDraw`, not `strokeDraw` — the dashes carry meaning (this length was not delivered), and `strokeDraw` would consume the dash pattern as its own reveal mechanism, which the codebase's stated contract forbids.

**At or over 100%.** No dashed trace at all — the bar reached the tick honestly. Instead the run continues as the **overrun cap**: the same tone, `stroke-width: 24` against the bar's 12, so it stands 6 units proud above and below and breaks the band silhouette. The cap starts 3 units left of the tick so it covers the bar's terminal edge and the two read as one mark stepping up as it crosses.

**Why the step matters, and this is where I refine the research doc.** On a shared domain, attrition's 4pp overshoot is 6.5 units — about 9px at full card size, 5px at 1024. Length alone cannot carry a crossing that small, so the research doc's "you just draw past the tick" would produce a nearly invisible event. The step does the work instead: **length stays the honest magnitude channel, and the height change announces the crossing as a categorical fact.** A 1pp overshoot and a 20pp overshoot both produce the step; only their lengths differ. That is the correct division of labour, and it is what makes over-attainment structurally legible at any magnitude rather than legible only when large.

### 15% versus 104%, concretely

| | `kpi-nnaov` at 15% | `kpi-attrition` at 104% |
|---|---|---|
| Bar | 24.3 units — a stub, entirely inside the ruled risk band | the full 161.7 units to the tick |
| Reach to plan | 137.4 units of dashed trace, **5.6× the length of the bar itself** | none; the bar got there |
| Past the tick | nothing | a solid cap 9.5 units wide standing 6 proud each side, breaking the band silhouette |
| Band the terminal mark sits in | risk (ruled) | warn — because polarity is `down`, 100–110 is the warn region, not the positive one |
| Arrow | points right, away from the bar | points **left**, away from the cap |
| One-glance read | almost nothing delivered against a very long shortfall | past plan, on the wrong side of the arrow |

The dashed-to-bar length ratio is what makes NNAOV land. It is not "a short bar" — it is a short bar beside a shortfall five and a half times longer, and the eye reads the ratio without being asked to.

---

## 6. Polarity

`metrics.planGoodDirection` is `"down"` for `kpi-attrition` and `"up"` for the other three. It is a property of the certified measure. Three devices carry it, in descending order of how much work they do:

**1. Orientation — the good-direction arrow. This is the primary device and it is pure geometry.** A short rail and filled arrowhead anchored at each reference mark, pointing the way the measure says is good: rightward from the plan tick and rightward from the Y/Y zero for the three up-metrics, leftward from both for attrition. No hue, no fill, no legend, no text. A reader who sees only shapes — greyscale print, a colour-blind read, a photo of a projector — sees three cards pointing one way and one pointing the other, and gets the direction right. The same `goodArrow()` primitive is used at both reference marks, so the grammar is "every reference mark on this card declares its good direction," which is a rule the reader can learn once from one card.

**This is a refinement of the research doc, which put polarity in the mirrored bands.** Bands at `fill-opacity: 0.13` are a hue channel; they cannot satisfy "a viewer who reads only the shape still gets the direction right." So the bands stay, but they are demoted to reinforcement and the arrow is promoted to primary.

**2. Texture — the ruled risk band.** The risk region is tinted *and* ruled with vertical hairlines at 7-unit intervals. This survives greyscale, and it makes the mirror visible in the bands themselves: for the three up-metrics the ruling fills the left approach to plan (0–85%), while on attrition it is a sliver at the far right (110–120%). That asymmetry of texture-weight across the hero band *is* the polarity, and it is visible peripherally. Only the unfilled part of the ruled zone shows, since the bar is opaque and drawn over it — so the texture reads as "how much danger zone you are still standing in," which is a bonus rather than a coincidence.

Implemented as a loop of vertical hairlines rather than an SVG `<pattern>`, deliberately: no `<defs>`, no pattern ids to keep unique across the re-render that the Knowledge Layer toggle triggers on every portlet. If the vertical ruling reads as minor axis ticks in review, switch to 45° hairlines with a `clipPath` keyed on `ctx.id` — but try the simple version first.

**3. Hue — the band tints.** `planBands(good)` returns the mirrored regions and `toneColor()` tints them. Last, and the only one of the three that drains away in the drained palette, which is the correct ordering of robustness.

**What the mirror looks like across the band.** Three cards with a ruled zone on the left, a positive band on the right, and an arrow pointing right. One card with a positive band filling everything up to the tick, a warn band and a ruled sliver beyond it, and an arrow pointing left. Attrition's bar is the longest of the four *and* it is the only one whose terminal mark sits on the far side of its own arrow. Both facts are true and both are visible, which is exactly the thing a hand-coloured slide cell cannot do.

---

## 7. The three numbers: hierarchy and layout

| Rank | Number | Treatment | Why |
|---|---|---|---|
| **Hero** | `metrics.display` — the dollar value | serif display type, `clamp(25px, 2.7vw, 40px)`, rolled up by `countUp` (or `scramble` when `directMode.candidates.length > 1`). Unchanged from today. | It is the answer to "what happened". No graphical encoding at all — four different measures at four different magnitudes are not commensurable, so putting them on any shared scale would assert something false. |
| **Secondary** | `metrics.plan` — percent of plan | the whole SVG geometry, plus a numeral in a fixed right-hand gutter of the chart row, `13.5px/700`, tinted `planTone`. | It is the answer to "is that a problem". The mark carries the comparison; the numeral carries precision. The gutter is fixed-width and right-aligned, so the four numerals form a readable column down the hero band and reinforce the alignment the shared scale buys. |
| **Tertiary** | `metrics.yoy` | a diverging stub in its own SVG, `max-width: 112px` — one third the attainment track's width — plus an `11px/700` label. | It answers "and which way is it moving", which is context, not the point of the card. Kept subordinate by *extent*, not just by size: it is physically incapable of reading as the primary bar because it is a third as wide and its own SVG is `max-width`-clamped so it can never grow. |

### DOM structure

All text lives in the DOM, none in the SVG. This is a deliberate departure from `gauge.js`, which puts its centre numerals inside the `viewBox`. Text inside a `viewBox` scales with the container, so on a card that ranges from ~177px to ~300px of chart width an axis label authored at a readable size at one end is illegible or oversized at the other. `gauge.js` gets away with it only because its ring container is clamped to `clamp(68px, 6.6vw, 100px)`, a narrow 1.5× range. A full-width chart has no such luxury. DOM text means every label is a normal CSS `clamp()` in real pixels and behaves like the rest of the app's type.

```
.attain                          flex column, gap clamp(4px, 0.7vh, 9px), flex: 1, min-height: 0
├─ .attain-hero                  flex: none — baseline row
│  └─ .attain-value              hero numeral; countUp / scramble target
├─ .attain-row                   flex: none — flex row, align-items: center, gap 10px,
│  │                             max-width clamp(200px, 22vw, 300px)
│  ├─ svg.attain-svg             flex: 1, min-width: 0
│  └─ .attain-pct                flex: none, width 4.6ch, text-align right — "15%"
├─ .attain-axis                  flex: none — position relative, height 11px, same max-width
│  ├─ .attain-axis-zero          left 0 — "0"
│  └─ .attain-axis-plan          left var(--plan-x), translateX(-50%) — "PLAN"
├─ .attain-yoy                   flex: none — flex row, gap 8px, same max-width
│  ├─ svg.attain-yoy-svg         max-width 112px
│  └─ .attain-yoy-label          "-75% Y/Y"
├─ p.attain-caption              flex: 1 1 auto, min-height 0, -webkit-line-clamp 2
└─ .portlet-detail               hidden until inspected — see below
```

`--plan-x` is set from JS so the label cannot drift from the tick: `wrap.style.setProperty("--plan-x", `${(x(100) / W * 100).toFixed(2)}%`)` → `80.79%`. Same for `--zero-x` → `3.81%`.

**Everything is `flex: none` except the caption**, which is `flex: 1 1 auto; min-height: 0` with a line clamp. That makes the caption the single expendable element, so vertical overflow at tight breakpoints lands on the one row that can lose a line without losing meaning, rather than crushing the chart. See §10.

**`.portlet-detail`** (already a codebase convention — always in the DOM, revealed only when the portlet is expanded and there is room to read it) carries what the geometry approximates: exact attainment to one decimal, the plan basis, the three band boundaries as authored numbers, and the polarity in words — *"Lower is better — carried by the certified measure"* for attrition, *"Higher is better"* otherwise. This is where a reader who wants the numbers behind the arrow finds them.

---

## 8. Build beats and the veil contract

Read `src/portlet.js` (`primeChart`, `build`) and `src/tabs.js` (`choreograph`) before touching this. The contract, as it currently stands:

1. The choreographer calls `portlet.primeChart()` → `chart.prime()` across every portlet on the tab **before stage one begins**, so shells arrive as empty frames rather than as finished charts about to be wiped.
2. `chart.build(signal)` runs when the left-to-right sweep reaches this card's horizontal centre.
3. `chart.settle()` runs afterwards as a safety net, restoring any node the build path skipped.
4. `setMotionScale()` has already been called with `0.53` (cold) or `0.38` (replay); every duration below passes through it automatically.

**Every mark must be in the veil list.** A mark that is not veiled is mounted at full opacity and then driven to zero when its beat arrives — visible for as long as the sequence takes to reach it, then flashing out and drawing back in. That is the exact bug `veil()` exists to fix, and it is the single most likely way to get this implementation wrong.

```js
const curtain = veil([
  svg, track, bandNodes, ruleNodes, bar, gapTrace, overrun, tick, planArrow, voidMark,
  yoySvg, yoyZero, yoyStub, yoyArrow,
  valueEl, pctEl, axisZeroEl, axisPlanEl, yoyLabelEl, captionEl
]);
curtain.hide();
// ...
return { build, prime: curtain.hide, settle: curtain.settle };
```

`veil` flattens nested arrays, so `bandNodes` and `ruleNodes` can be passed as arrays. It tolerates `null` (`gapTrace`, `overrun`, `tick`, `planArrow` and `voidMark` are each conditional and exactly one of the gap/overrun pair exists), and `settle()` restores anything a beat never reached. Both SVG roots *and* their children are veiled — the same belt-and-braces `gauge.js` already uses; opacity multiplies, so it is safe.

### The beats

Nine beats, ~2.04s at scale 1 → ~1.08s cold, ~780ms on replay.

| # | t (ms) | What | Primitive |
|---|---|---|---|
| 1 | 0 | **The ruler and the hero, together.** Attainment SVG root and the hero numeral. The hero is not made to wait for the chart — it is the hero. | `fadeIn(svg, { duration: 400, y: 5 })`; `fadeIn(valueEl, { duration: 400, y: 10 })`; `countUp(valueEl, display, { delay: 60, duration: 1020 })` — or `scramble(valueEl, candidates, display, { delay: 100 })` when `candidates.length > 1` |
| 2 | 150 | **Bands and ruling.** The scale arrives empty first: you draw the ruler before the measurement. | `stagger([...bandNodes, ...ruleNodes], { step: 55, maxTotal: 300, duration: 300, y: 0 })` |
| 3 | 330 | **Plan tick**, drawn top-to-bottom as a vertical path. The reference lands before the thing it references. | `strokeDraw(tick, { duration: 300 })` |
| 4 | 430 | **Good-direction arrows** at both reference marks, plus the axis labels. Each arrow enters *travelling in* the good direction, so the motion states the polarity as well as the shape does. | `fadeIn(planArrow, { duration: 300, y: 0, x: -5 * dir })`; `fadeIn(yoyArrow, { delay: 60, duration: 300, y: 0, x: -4 * dir })`; `fadeIn` on the two axis labels |
| 5 | 520 | **The bar.** Reveals left-to-right by dash offset, so its terminal edge is correct on every frame. Ends t≈1240. | `strokeDraw(bar, { duration: 720 })` |
| 6 | 1200 | **Reach to plan** — exactly one of these fires, and the bar is arriving at the tick as it does. On attrition the bar visibly crosses and steps up; that is the moment worth having. Plus the attainment numeral. | under: `dashDraw(gapTrace, { duration: 420 })` · over: `strokeDraw(overrun, { duration: 380 })` · `fadeIn(pctEl, { delay: 60, duration: 320, y: 0, x: -6 })` |
| 7 | 1400 | **Y/Y sub-track.** The stub's path starts at zero and runs toward the sign, so `strokeDraw` grows it outward in the right direction with no origin bookkeeping. | `fadeIn(yoySvg, { duration: 320, y: 4 })`; `strokeDraw(yoyStub, { delay: 60, duration: 420 })`; `fadeIn(yoyLabelEl, { delay: 140, duration: 360, y: 4 })` |
| 8 | 1620 | **Caption.** | `fadeIn(captionEl, { duration: 420, y: 6 })` |
| 9 | — | Direct mode only: the **void ✕** replaces beats 5 and 6 entirely. | `strokeDraw` on each of the two crossing paths, `{ delay: 520, duration: 300 }` and `{ delay: 640, duration: 300 }` |

Sequence with `await wait(...)` between phases, following `gauge.js`'s existing shape, and thread `signal` into every call.

### Three implementation notes on the primitives

**Use `fadeIn`, not `fadeTo`, for the bands — this overrules the research doc's advice.** Its §1 "related" note says translucent fills should use `fadeTo(node, 0.13, …)` because `fadeIn` drives element opacity to 1 and would flood the mark. That is correct for the trend area, which has no other opacity channel. It is unnecessary here, because the bands carry their translucency in `fill-opacity`, a *paint* channel independent of element `opacity`. Baking it into the paint and animating element opacity to 1 is strictly better: it lets the bands ride `stagger()` (which wraps `fadeIn`) instead of needing a hand-rolled loop, and it means `curtain.settle()` restores them to their correct translucency rather than to 1. Same applies to `stroke-opacity` on the ruling and the shortfall trace.

**No `growFrom`, no `sweepArc`.** The bar, the overrun cap and the Y/Y stub are all stroked lines revealed by `strokeDraw`, which avoids `growFrom`'s `scaleX` distortion of rounded corners and needs no `transform-box: fill-box`. `sweepArc` was used only by `gauge.js` and becomes dead once it is replaced — **leave the export in `anim.js` anyway.** It costs nothing, and the banded-ring fallback in §3 would need it.

**Guard zero-length paths.** `strokeDraw` calls `getTotalLength()` and falls through to its immediate branch on 0, which for a butt-capped line renders nothing at all. Hence `barEnd = Math.max(TRACK.x + 1.5, x(min(plan, 100)))` — every card always has at least a visible stub.

---

## 9. Degraded mode

The Knowledge Layer toggle re-renders every portlet (`Portlet.render()` → `chartFor(kind)`) with `isDirect` and a `tier`. For these cards, two distinct things come from the semantic layer and both go: **the plan target** (there is nothing to draw a tick against) and **the measure polarity** (there is no way to know which direction is good). The degradation must be visibly poorer and must still render.

Tiers come from `board.json` and are already authored: `kpi-nnaov` red, `kpi-acv` red, `kpi-attrition` grey, `kpi-pipegen` yellow. Note that the numeric `plan` field survives the direct-mode merge on all four (only `planDisplay` is overridden), so **`barIsVoid` must be driven by tier, exactly as `gauge.js` drives `ringIsVoid` today** — not by testing whether `plan` is present.

### Red and grey — NNAOV, ACV, Attrition

No defensible plan basis, so there is no attainment to draw.

| Element | Direct mode |
|---|---|
| Track | present, `stroke-dasharray: "4 7"`, drained `p.track` |
| Bands, ruling | **absent** — the thresholds are semantic-layer rules |
| Bar | **absent** (`opacity: 0`) |
| Plan tick | **absent** — the position of 100% is itself an assertion |
| Gap trace / overrun | **absent** |
| Void mark | a ✕ centred in the track at `TRACK.x + TRACK.w / 2`, tinted `tierMeta(tier).color`. Deliberately *not* at `x(100)`: with no plan basis there is no 100% position for it to occupy. Honours the tier contract — `TIERS.red.x` and `TIERS.grey.x` are both `true` |
| Good-direction arrows | **both absent** |
| `.attain-pct` | the authored `directMode.metrics.planDisplay` — "plan basis undefined", "no prior-period baseline" — in `p.inkDim`, not a tone |
| `.attain-axis-plan` | "no target" |
| Y/Y stub | **kept.** A Y/Y is arithmetic and survives without governance. Tinted `meta.color`, arrow absent |
| Hero numeral | `scramble` across `directMode.candidates` where there is more than one, unchanged from today |

### Yellow — Pipegen

The distinction the tier system exists to draw: workable, just ungoverned. `plan: 79` survives and `directMode.metrics.planDisplay` is `"79% of plan (rule undeclared)"`, so the bar *is* drawn — this card must not look the same as the other three.

| Element | Direct mode |
|---|---|
| Track | solid, drained |
| Bands, ruling | **absent** |
| Bar | **drawn**, tinted `meta.color` (the yellow tier colour), not a sentiment tone |
| Plan tick | **drawn**, but `p.axis` instead of `p.ink` and `stroke-dasharray: "3 3"` — a target exists, it is just not certified |
| Gap trace | drawn in `p.ghost` |
| Good-direction arrow | **absent** |

Pipegen degrades to *"here is a bar against a soft target, and nothing tells you which way is good."*

### The point of it

Across the hero band, flipping the toggle makes **all four good-direction arrows disappear at once** — so the one card that was pointing the other way stops pointing at all. Three tracks go empty and dashed with a ✕ where their targets were; one keeps a bar against a dashed target with no direction attached. Nothing errors, nothing is blank, and the board has stopped telling you which way is good. That is worth a line in the README talk track at step 7.

---

## 10. Fit, breakpoints, and minimum size

### Measured budget

Derived from `styles/tabs.css` (`.panel` inset `clamp(14px, 2.2vw, 30px)`, `--gap`), `styles/portlets.css` (`.portlet-face` padding `clamp(10px, 1.1vw, 16px)`, gap 8px), and the exec grid rows `0.9fr / 0.88fr / 1.22fr` (`0.85 / 0.8 / 1.45` under `max-height: 860px`).

| Viewport | Card column | **Body width** | **Body height** |
|---|---|---|---|
| 1920 × 1080 | ~447px | ~415px | ~187px |
| 1440 × 900 | ~333px | ~305px | ~135px |
| 1280 × 800 | ~296px | ~272px | ~118px |
| 1024 × 768 | ~238px | ~215px | **~103px** |
| 1024 × 768, knowledge graph on | ~238px | ~215px | **~63px** |

Height is the binding constraint, not width — which is why `gauge.js` is a horizontal flex (ring beside readout) rather than a stack. Moving to a full-width track forces a vertical stack, so the rows have to be budgeted.

### Row budget

| Row | 1920 | 1024 |
|---|---|---|
| `.attain-hero` | 44 | 30 |
| `.attain-row` (chart, `max-width: clamp(200px, 22vw, 300px)`) | 63 | 45 |
| `.attain-axis` | 12 | *hidden* |
| `.attain-yoy` | 28 | 24 |
| `.attain-caption` | 32 (2 lines) | 15 (1 line) |
| gaps | ~36 | ~24 |
| **total** | **~215** vs 187 available | **~138** vs 103 available |

Both overflow if every row is fixed, which is why the caption is the only flexible element and is line-clamped. With the caption absorbing the difference: 183 at 1920, and at 1024 the axis row is hidden by media query and the caption drops to one line → ~99px. Fits.

### Breakpoint plan

| Breakpoint | Change |
|---|---|
| ≥ 1400px | full form, all rows, caption 2 lines |
| `max-width: 1200px` **or** `max-height: 860px` | hide `.attain-axis` — the plan tick stays, only its text label goes. Geometry survives, furniture does not. Caption clamps to 1 line |
| `.stage.is-graphing` | the existing `.portlet-front { padding-bottom: 40px }` steals 40px. Hide `.attain-yoy` and `.attain-caption`; keep the hero row and the chart row. **Pre-existing condition, not introduced here** — the current 68px ring already overflows a 63px body in this state |
| `max-width: 900px` | the hero band goes to `repeat(2, …)` with `grid-auto-rows: minmax(168px, auto)`, so cards get *wider* (~440px body). The chart hits its 300px `max-width` and everything fits comfortably. Restore the axis row and the 2-line caption here |

Counter-intuitively, **the tight case is the 1024–1180px four-column range, not the sub-900px stack.**

### Minimum size at which the form reads

Chart width, since the SVG scales as one unit:

| Chart width | 1 unit | State |
|---|---|---|
| **300px** (max) | 1.43px | full form. Bar 17px thick, tick 2.3px, overrun step 8.6px proud, attrition's 4pp cap 9.3px wide, ruling 10px apart |
| **215px** (1024, four-column) | 1.02px | full form holds. Bar 12px, tick 1.6px, overrun step 6px proud, cap 6.6px wide, ruling 7px apart |
| **165px — the floor** | 0.79px | bar 9.4px, overrun step 4.7px proud, cap 5.1px wide, ruling 5.5px apart. The step and the ruling are both at the edge of separating |
| **below 165px** | — | drop the risk-band ruling (bands stay tinted) and make the shortfall trace a solid hairline rather than dashed — 2.5-unit dashes stop resolving |
| **below 130px** | — | drop `.attain-yoy` entirely. A 3.5-unit stub (Pipegen) is under 3px and reads as a dot |

### What will not survive

- **The risk-band ruling below ~165px of chart width.** 7-unit spacing collapses into flat grey. Drop it rather than tightening it; the band tint and the arrow both still work.
- **The Y/Y arrowhead below ~90px of sub-track width.** 2.5 units of half-height is under 2px. The `max-width: 112px` protects this in every specified breakpoint, but do not lower that value.
- **`.attain-axis` at 1024.** Already handled by media query; noted because the `PLAN` label is the most tempting thing to keep and the least necessary.
- **Two-line captions anywhere under 1280px.** Line-clamp to 1.
- **Knowledge-graph mode at 768px tall.** ~63px of body cannot hold this form, or the current one. Hiding the Y/Y and caption rows gets it to ~75px, which still clips ~12px. Flagged as an existing constraint that this change neither fixes nor worsens; the real fix is reducing `padding-bottom` in graph mode, which is `styles/portlets.css` and out of scope here.

---

## 11. Field bindings

Every field is already authored. **No `data/board.json` change is required**, and therefore no `node scripts/sync-fallback.mjs` run.

| Binding | Path | Used for |
|---|---|---|
| Hero numeral | `metrics.display` | `countUp` target; `"$6M"`, `"$82M"`, `"$75M"`, `"$789M"` |
| Contested numeral | `directMode.candidates` | `scramble` pool when `length > 1`; direct mode only |
| Attainment | `metrics.plan` | bar length, overrun, band placement. `15 · 70 · 104 · 79` |
| Attainment label | `metrics.planDisplay` | `.attain-pct`. Overridden per-tier in direct mode |
| **Polarity** | `metrics.planGoodDirection` → falls back to `metrics.goodDirection` → `"up"` | band mirror, plan arrow direction, `planTone()`. `"down"` on `kpi-attrition` only |
| Y/Y magnitude | `metrics.yoy` | stub length and sign. `-75 · -28 · -12 · -8` |
| Y/Y label | `metrics.yoyDisplay` | `.attain-yoy-label` |
| Y/Y polarity | `metrics.goodDirection` | `toneOf()` and the Y/Y arrow direction |
| Caption | `metrics.caption` | `.attain-caption` |
| Tier | `ctx.tier` (from `tierOf(spec, mode)`) | `barIsVoid`, void ✕, all direct-mode tinting |
| Accent | `ctx.accent` | unused by the marks — sentiment and trust own the colour here. Left to the portlet chrome |
| Detail rows | `metrics.plan`, `metrics.planGoodDirection`, `planBands()` | `.portlet-detail` exact values |

Not used, and worth stating so nobody reaches for them: `metrics.value` and `metrics.unit` (the authored `display` string is the source of truth for the numeral — `numeralParts` parses it so the final frame is byte-identical to the JSON), and `semantic.polarityNote` (already rendered on the provenance face by `portlet.js`; do not duplicate it on the front).

---

## 12. Prerequisite: one additive export in `src/palette.js`

The band boundaries in the chart and the thresholds in `planTone()` must come from one source or they will drift the first time somebody tunes one. Extract the constants and derive both.

```js
const PLAN_THRESHOLDS = { up: { risk: 85, target: 100 }, down: { target: 100, warn: 110 } };
const DOMAIN_MAX = 120;

/* The three qualitative regions, mirrored by polarity. Same constants
 * planTone() rules on, so the geometry and the colour cannot disagree. */
export function planBands(goodDirection = "up") {
  const t = PLAN_THRESHOLDS;
  if (goodDirection === "down") {
    return [
      { from: 0, to: t.down.target, tone: "positive" },
      { from: t.down.target, to: t.down.warn, tone: "warn" },
      { from: t.down.warn, to: DOMAIN_MAX, tone: "risk" }
    ];
  }
  return [
    { from: 0, to: t.up.risk, tone: "risk" },
    { from: t.up.risk, to: t.up.target, tone: "warn" },
    { from: t.up.target, to: DOMAIN_MAX, tone: "positive" }
  ];
}

export const PLAN_DOMAIN = [0, DOMAIN_MAX];
```

Then rewrite `planTone()` to read `PLAN_THRESHOLDS` instead of its current literals. Behaviour is unchanged — this is a refactor, not a change in output. Verify: `planTone(15,"up") === "risk"`, `planTone(70,"up") === "risk"`, `planTone(79,"up") === "risk"`, `planTone(104,"down") === "warn"`.

`src/palette.js` is not being edited by either of the other two agents currently in this repo. `src/svg.js` needs nothing new — `linearScale`, `svgEl`, `chartRoot`, `group` and `text` are all already exported.

### Registration

`src/charts/index.js` — add `import { mount as attainment } from "./attainment.js"` and register it. Then one of:

- keep `kind: "gauge"` in `board.json` and point the `gauge` key at the new module (**preferred** — `board.json` is owned by another agent right now), or
- register as `attainment` and change four `kind` values in `board.json` (coordinate first).

Either way, delete `src/charts/gauge.js` only after the four cards render, and leave `sweepArc` exported from `anim.js`.

---

## 13. CSS hooks needed

**`styles/portlets.css` is being edited by another agent right now — coordinate before writing.** These are additive and replace the `.gauge-*` block; `.delta-bar`, `.delta-bar-fill` and `.delta-plan::before` become unused once the four cards migrate.

| Class | Purpose |
|---|---|
| `.attain` | flex column, `gap: clamp(4px, 0.7vh, 9px)`, `flex: 1`, `min-height: 0` |
| `.attain-hero` | flex row, `align-items: baseline`, `gap: 8px`, `flex: none` |
| `.attain-value` | display serif, `clamp(25px, 2.7vw, 40px)`, `font-variant-numeric: tabular-nums`. Carry over `[data-contested="true"]` from `.gauge-value` |
| `.attain-row` | flex row, `align-items: center`, `gap: 10px`, `max-width: clamp(200px, 22vw, 300px)`, `flex: none` |
| `.attain-svg` | `flex: 1`, `min-width: 0`, `display: block`, `width: 100%`, `height: auto` |
| `.attain-pct` | `flex: none`, `width: 4.6ch`, `text-align: right`, `13.5px/700`, `tabular-nums`, `color: var(--attain-tint)` |
| `.attain-axis` | `position: relative`, `height: 11px`, same `max-width`, `9.5px/600`, uppercase, `letter-spacing: .06em`, `color: var(--ink-dim)` |
| `.attain-axis-zero` / `.attain-axis-plan` | absolutely positioned at `var(--zero-x)` / `var(--plan-x)`; the latter `transform: translateX(-50%)` |
| `.attain-yoy` | flex row, `gap: 8px`, same `max-width`, `flex: none` |
| `.attain-yoy-svg` | `max-width: 112px`, `width: 100%`, `height: auto` |
| `.attain-yoy-label` | `11px/700`, `tabular-nums`, `color: var(--delta-tint)` — reuses the existing `--delta-tint` convention |
| `.attain-caption` | inherit `.gauge-caption`'s rules; add `flex: 1 1 auto`, `min-height: 0`, `-webkit-line-clamp: 2` |

`--attain-tint` is set from JS on the wrapper, matching how `gauge.js` sets `--delta-tint`. Marks themselves are painted from `palette()` at render time, per the module's stated contract — no hex values in CSS.

Media queries per §10. All SVG marks carry classes (`.attain-track`, `.attain-band`, `.attain-rule`, `.attain-bar`, `.attain-gap`, `.attain-overrun`, `.attain-tick`, `.attain-arrow`, `.attain-void`, `.attain-yoy-bar`) so they are addressable, but none *needs* CSS — geometry and paint are set as attributes.

---

## 14. Accessibility

- `chartRoot`'s `aria-label` on the attainment SVG: `` `${label} — ${plan}% of plan against a 100% target; ${good === "down" ? "lower is better" : "higher is better"}` ``, and in void state `` `${label} — no plan basis without the semantic layer` ``. The polarity is stated in words for anyone who cannot see the arrow.
- Y/Y SVG gets its own label: `` `${label} — ${yoyDisplay}` ``. Both are `role="img"` via `chartRoot`.
- Optional tooltip on the plan tick via `ctx.tip`: *"Plan target · 100% · lower is better (certified)"*. The tick is 1.6 units wide, and `padHit()` will refuse it because it already carries a real stroke — add a transparent `<rect>` 10 units wide over the tick region as the hit target instead.
- Reduced motion needs nothing extra: every primitive already jumps to its final state and `veil` is inert in both directions.
- Contrast: bands at `fill-opacity: 0.13` are decorative reinforcement only. Every mark that carries meaning — bar, tick, arrow, cap — is drawn at full opacity in `p.ink` or a tone.

---

## 15. Tradeoffs worth a second opinion

**The fixed `[0, 120]` domain spends 17% of every track on headroom only attrition uses.** All four bars are ~17% shorter than a `[0, 105]` domain would make them, and at 1024 that costs real pixels on the differences between 15%, 70% and 79% — the comparison the shared scale exists to serve. I chose 120 because `planTone`'s down-polarity risk threshold is `> 110`, and on a shorter domain attrition's risk band has zero or near-zero width, so the polarity mirror would be visibly incomplete on the one card that needs it most. If you would rather have the resolution than the third band, `[0, 110]` is defensible; the attrition card then shows two bands and its risk region becomes an edge condition rather than a region. **This is the decision I would most want overruled if you disagree with my weighting.**

**Two good-direction arrows per card may be one too many.** The grammar is consistent — every reference mark declares its polarity — but that is eight arrowheads across the hero band. If it reads as clutter in review, drop the Y/Y one and keep the plan one; the polarity argument survives, at the cost of leaving attrition's *good* −12% and NNAOV's *bad* −75% as two identical leftward stubs distinguished only by hue.

**Moving all text out of the SVG costs the numeral-inside-the-mark composition.** `gauge.js`'s big centred percentage inside the ring is a genuine piece of this board's visual identity, and a right-gutter numeral beside a track is quieter. I traded it for type that stays legible from 1024 to 1920, which I think is the right trade for a board shown on projectors — but it is a real loss and the research doc's "losing four rings makes tab 1 quieter" caution applies to the type as much as to the geometry.

**The overrun step is a second channel doing categorical work.** Height normally encodes nothing on a bullet graph, and using it to mean "crossed the target" is a small invention rather than a citation. I am confident it is right — 4pp of overshoot cannot be carried by length at these sizes — but it is the one part of this design that a strict Few reading would object to.
