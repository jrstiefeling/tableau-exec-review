# Visualization research and recommendations

A per-portlet review of the chart grammar on this board, against current practice in
newsroom graphics, the Tableau Public community, and the visualization literature.

Every recommendation here is constrained to what this app can actually build: hand-placed
SVG through `src/svg.js`, animated through `src/anim.js`, no charting library, no new
dependencies, and a portlet that is between a quarter and an eighth of a viewport.

**Nothing in this document has been implemented.** It is a specification for an
implementing agent. Where a recommendation needs a change to `data/board.json`, that is
called out explicitly as a prerequisite, because several of these forms would otherwise
have to derive numbers inside the renderer — and a board whose entire argument is that
derived numbers inherit their inputs' ambiguity should not quietly derive numbers inside a
chart function.

---

## Contents

- [How this was assessed](#how-this-was-assessed)
- [Findings in the data that changed the recommendations](#findings-in-the-data-that-changed-the-recommendations)
- [Tab 1 — Q2 Exec Summary](#tab-1--q2-exec-summary)
  - [1. The four KPI portlets — replace the radial gauge with a polarity-mirrored bullet graph](#1-the-four-kpi-portlets--replace-the-radial-gauge-with-a-polarity-mirrored-bullet-graph)
  - [2. The mix portlet — replace the 100% stacked bar with a two-period proportional alluvial](#2-the-mix-portlet--replace-the-100-stacked-bar-with-a-two-period-proportional-alluvial)
  - [3. The AE headcount stat tile — add a unit/waffle grid](#3-the-ae-headcount-stat-tile--add-a-unitwaffle-grid)
  - [4. The narrative card rails — keep as cards, add a coverage strip](#4-the-narrative-card-rails--keep-as-cards-add-a-coverage-strip)
- [Tab 2 — Five Year Trend](#tab-2--five-year-trend)
  - [5. The seven trend panels — keep the trajectory, add a Y/Y deviation strip](#5-the-seven-trend-panels--keep-the-trajectory-add-a-yy-deviation-strip)
  - [6. The run-rate ghost — a scenario fan instead of a single point](#6-the-run-rate-ghost--a-scenario-fan-instead-of-a-single-point)
  - [7. The driver rail — surface the claim load on both sides](#7-the-driver-rail--surface-the-claim-load-on-both-sides)
  - [8. The rules card — inline mini-diagrams for the two geometric rules](#8-the-rules-card--inline-mini-diagrams-for-the-two-geometric-rules)
  - [9. A new panel — connected scatter, AE Capacity × AE Productivity](#9-a-new-panel--connected-scatter-ae-capacity--ae-productivity)
- [On the flow-lines aesthetic](#on-the-flow-lines-aesthetic)
- [Priority ranking](#priority-ranking)
- [Considered and rejected](#considered-and-rejected)
- [Where the colour headroom actually is](#where-the-colour-headroom-actually-is)
- [References](#references)

---

## How this was assessed

Three filters, applied in order. A form had to pass all three.

**Does the data have the shape the form requires?** This is the filter that rejected most
of the exciting options. Beeswarms, ridgelines, hex-bins, chord diagrams and the
flow-lines aesthetic all describe *distributions* — many observations dispersing. This
board has no distributional data anywhere. Every measure is one authored aggregate per
period. Drawing a distribution here would mean inventing the spread, which is the same
class of error as offering a run-rate on a stock: a chart asserting a measurement that was
never taken.

**Does the form stay honest across the two boundaries this board exists to defend?** The
flow/stock distinction and the FY27 H1 half-period. Any form that interpolates, stacks, or
implies continuity across either is disqualified on this board specifically — not because
it is a bad form, but because this board's whole argument is that those boundaries are
properties of the measure and everything downstream must inherit them. Streamgraphs and
indexed overlays died here.

**Can it be built and animated in parts, at portlet scale, with the existing primitives?**
`strokeDraw`, `dashDraw`, `growFrom`, `sweepArc`, `countUp`, `scramble`, `fadeIn`,
`stagger`, `fadeTo`, `veil`. Every recommendation below decomposes into those. Where a form
is beautiful but does not survive a 300×240 viewBox, the practical downgrade is named.

### One implementation contract to know before adding any mark

`anim.js` carries a `veil(nodes)` helper, and `trendPanel.js` uses it through a local
`prime()` call at mount time. It exists because a chart is mounted at full opacity and then
each element is driven to zero when its turn in the build sequence arrives — so without a
veil, a panel whose sequence spans a second and a half paints itself, blinks out in pieces,
then draws itself back in.

**Every new mark recommended in this document must be added to its chart's veil list.** A
deviation strip, a bullet band, a waffle cell or an alluvial ribbon that is not veiled will
be visible from mount and then flash out when its beat arrives — the exact bug the veil was
added to fix. Concretely, in `trendPanel.js` that means extending the existing array:

```js
const curtain = veil([
  head, baseline, zeroTick, line, breakRule,
  ghostLink, ghost, ghostLabel,
  dots, dotCores, labels, partialNote, caption,
  devCells                                    // <- the §5 strip
]);
```

`veil` flattens nested arrays, is inert under `prefers-reduced-motion` in both directions,
and exposes `settle()` as a safety net that restores any node a build path skipped — so a
conditionally-built mark (the fan in §6, which only exists on flow panels) can be veiled
safely without risking invisible content if its beat never runs.

Related: use `fadeTo(node, 0.22, …)` rather than `fadeIn` for any fill meant to stay
translucent — the alluvial ribbons in §2 and the fan bands in §6 both want this, for the
same reason the trend area does. `fadeIn` drives to opacity 1 and would flood the mark.

The sibling app's `METHODOLOGY.md` §4.1 already spends eleven forms — bubbles, radial
rings, lollipop, heat grid, dumbbell, timeline, scale bullet, ladder, matrix, network,
roadmap. None of the recommendations below repeat one of those, with one deliberate
exception noted in §1: the bullet grammar reappears here because this board has the
target-plus-qualitative-bands data that `scaleBullet` was built for, and the four KPI tiles
are the textbook case for it in a way the sibling app's four anchor figures were not.

---

## Findings in the data that changed the recommendations

Three things surfaced while reading `data/board.json` that an implementing agent needs to
know, because two of them are prerequisites and one is a bug.

### The mix portlet's prior year is fully recoverable, and it reconciles exactly

The segment Y/Y percentages imply a prior-year split that lands on the prior-year total to
the penny:

| | FY26 Q2 (derived) | FY27 Q2 (authored) |
|---|---|---|
| Embedded | $15.58M | $24M |
| Agentic | $98.31M | $58M |
| Total | $113.89M | $82M |
| Embedded share | 13.7% | 29.3% |

`$82M ÷ 0.72 = $113.89M`, and `$15.58M + $98.31M = $113.89M`. The 13.7% also matches the
"up from 14% a year ago" already written into the portlet's `insight` string. The data is
internally consistent and the two-period form in §2 is therefore available — but the prior
values should be **authored into `board.json`, not derived in `mixBar.js`**. See §2.

### The AE headcount tile contradicts itself

`hc-ae.metrics` says `yoy: -21` and `caption: "Down 159 heads year over year"`. Those
cannot both be true:

- `745 ÷ 0.79 = 943` heads a year ago, which is a 198-head fall.
- Down 159 heads means 904 a year ago, which is −17.6% Y/Y.

904 is the FY26 value in `trend-ae-capacity.series`, so the caption is reconciling against
the five-year panel while the `yoy` field is not. Today this is invisible, because a
numeral and a percentage sitting beside each other do not invite the reader to do the
subtraction. **A unit chart makes the subtraction visible** — the reader will count the
ghosted cells. So §3 carries a prerequisite: reconcile these before building it, or author
an explicit `priorValue`.

That is worth stating as a general point, because it is an argument for the more literal
form rather than against it: choosing a grammar that renders the arithmetic makes
inconsistencies fall out of the picture, where an abstract form hides them.

### Two of the four KPIs have no narrative attached to them at all

Counting the `links` arrays across both card rails — nine links across nine cards:

| Portlet | Incoming narrative links |
|---|---|
| `mix-acv` | 4 |
| `kpi-pipegen` | 2 |
| `hc-ae` | 2 |
| `kpi-attrition` | 1 |
| `kpi-nnaov` | **0** |
| `kpi-acv` | **0** |

The two steepest declines on the board — NNAOV at −75% and ACV at −28% — are claimed by
neither a win nor an H2 commitment. That is exactly the kind of structural fact the board's
own thesis says it wants to expose ("an unsupported claim is visible as a card with nothing
to light"), but the current design can only reveal it one hover at a time, from the card
side, and never from the metric side. §4 addresses this.

The driver rail on tab 2 has the same asymmetry in the other direction: NNAOV is claimed by
four of the six drivers, while AOV, Capacity, Productivity and Revenue are claimed by one
each. Fourteen edges, very unevenly distributed. §7 addresses that.

---

## Tab 1 — Q2 Exec Summary

### 1. The four KPI portlets — replace the radial gauge with a polarity-mirrored bullet graph

**Current:** `src/charts/gauge.js`. A 360° ring encoding plan attainment, a second outer
arc for the over-100% case, a rolling numeral in the centre, and a centre-anchored CSS Y/Y
bar in the readout below.

**Recommended:** a horizontal bullet graph with qualitative bands, a target tick, and a
second diverging Y/Y track beneath it on the same width.

#### Why the data calls for it

This is the one place on the board where I think the current form is actively costing you,
and there are four separate reasons that stack.

**The comparison the tile is for is a four-way comparison, and angle is the wrong encoding
for it.** The four attainments are 15%, 70%, 104% and 79%. A reader's job on the hero band
is to rank those and find the outliers. Cleveland and McGill's ranking of elementary
perceptual tasks puts position-along-a-common-scale at the top and angle near the bottom;
Tableau's own blog makes exactly this argument against gauges, and it is why gauges are not
in Tableau's default chart list. Four rings force four independent angle judgements. Four
bullets on a shared 0–110% scale make the ranking pre-attentive.

**The 104% case is currently a special case, and on a bullet it stops being one.** The
gauge has to grow a second, thinner arc at `R + 9` to express over-plan, because a ring has
no natural region past a full turn — going round again would read as *fuller*, which for
attrition would read as *better*, which is backwards. A linear scale has a past-the-target
region for free. You just draw past the tick.

**The bands make a stated rule visible instead of merely stated.** `planTone()` in
`palette.js` already defines three qualitative regions, mirrored by polarity:

| `planGoodDirection` | risk | warn | positive |
|---|---|---|---|
| `up` (NNAOV, ACV, Pipegen) | < 85% | 85–100% | ≥ 100% |
| `down` (Attrition) | > 110% | 100–110% | ≤ 100% |

Those thresholds are authored rules, and the rules card on tab 2 explicitly claims "one
stated colour threshold rather than a per-cell judgement" as a thing the semantic layer
buys. On a ring they can only tint the arc. On a bullet they are drawn as literal
background regions — the threshold becomes geometry the reader can see, rather than a
colour they have to trust. That is the app's own argument, rendered.

**And this is the strongest one: polarity becomes a visible mirror rather than an invisible
colour rule.** For the three up-metrics, the good band sits to the *right* of the target
tick. For Attrition, the identical geometry flips — the good band sits to the *left*, and
the bar overshooting the tick runs into red. Same construction, mirrored by
`metrics.planGoodDirection`, which is a property of the certified measure. A viewer looking
across the hero band sees three tiles pointing one way and one pointing the other, and the
reason is legible without reading a word. The radial gauge cannot express this at all —
104% of a circle looks like 104% of a circle regardless of which way is good, and the
current design has to carry the whole burden on tint. This is the single most on-message
change available on the board.

#### The honest counter-argument

The ring is distinctive, and the numeral-inside-the-ring composition is a real piece of
this board's visual identity. Losing four rings from the hero band makes tab 1 quieter.
If that identity is judged load-bearing, the **practical downgrade** keeps the ring and
takes two of the four wins: draw the three qualitative bands as faint background arc
segments on the track, and add a target tick at the 100% position (12 o'clock, or wherever
100% falls once you stop mapping 100% to a full turn — map 0–110% to 0–330° instead, which
also kills the over-plan special case). You keep the identity, you get bands and a target,
and you still lose the four-way comparability. I would take the full change, but the
downgrade is real and not embarrassing.

#### Data fields

All already authored, no `board.json` change needed:

- `metrics.plan` (number) — bar length
- `metrics.planGoodDirection` — which side of the tick is good; drives the mirror
- `metrics.planDisplay` — the chip text
- `metrics.display` — the rolling numeral (unchanged)
- `metrics.yoy`, `metrics.yoyDisplay`, `metrics.goodDirection` — the second track
- `directMode.candidates` — still drives `scramble()` on the numeral
- Tier handling is unchanged: `ringIsVoid` becomes `barIsVoid`, and red/grey tiers in
  direct mode render the track with bands drained and no bar, which reads as "no defensible
  plan basis" more clearly than an empty ring does.

#### Animation-on

Five beats, all existing primitives, roughly 1.6s total:

1. Bands `stagger(bandNodes, { step: 70, duration: 320, y: 0 })` — the scale arrives first,
   empty, which is the honest order: you draw the ruler before the measurement.
2. Attainment bar `growFrom(bar, { axis: "x", origin: "left center", duration: 900 })`.
3. Target tick `strokeDraw(tickPath, { duration: 300, delay: 620 })` — a 1px vertical path,
   so it draws top-to-bottom and lands just as the bar is arriving at it. On Attrition the
   bar visibly crosses it, which is the moment worth having.
4. Numeral `countUp(value, display, { delay: 180, duration: 1080 })`, or `scramble()` in
   direct mode. Unchanged from today.
5. Y/Y track `growFrom(yoyFill, { axis: "x", origin: <"left"|"right"> center, delay: 900 })`
   growing outward from the zero rule in the direction of sign.

#### SVG construction sketch

```js
// gauge.js -> bullet.js. viewBox roughly 240 x 96, replacing 132 x 132.
const W = 240, H = 96;
const TRACK = { x: 10, y: 30, w: 200, h: 16 };   // attainment track
const YOY   = { x: 10, y: 60, w: 200, h: 7 };    // deviation track

// Scale runs 0 -> 110% so the over-plan case is on-scale rather than special.
const x = linearScale([0, 110], [TRACK.x, TRACK.x + TRACK.w]);

// --- qualitative bands, mirrored by polarity -------------------------------
// For "up":   [0,85) risk | [85,100) warn | [100,110] positive
// For "down": [0,100] positive | (100,110] warn | (110, ..] risk
const bands = bandsFor(metrics.planGoodDirection);   // -> [{from, to, tone}]
bands.forEach(b => marks.appendChild(svgEl("rect", {
  x: x(b.from), y: TRACK.y, width: x(b.to) - x(b.from), height: TRACK.h,
  fill: toneColor(b.tone), opacity: 0.13, class: "bullet-band"
})));

// --- the measure ------------------------------------------------------------
marks.appendChild(svgEl("path", {
  d: roundedRectPath(TRACK.x, TRACK.y + 4, x(capped) - TRACK.x, TRACK.h - 8, 3),
  fill: toneColor(planTone(metrics.plan, metrics.planGoodDirection)),
  class: "bullet-fill"
}));

// --- target tick, taller than the track so it reads as a reference ---------
marks.appendChild(svgEl("path", {
  d: `M ${x(100)} ${TRACK.y - 5} V ${TRACK.y + TRACK.h + 5}`,
  stroke: p.ink, "stroke-width": 2, class: "bullet-target"
}));

// --- Y/Y, diverging from a centre rule -------------------------------------
const zero = YOY.x + YOY.w / 2;
const mag  = Math.min(Math.abs(metrics.yoy), 100) / 100 * (YOY.w / 2);
marks.appendChild(svgEl("rect", {
  x: metrics.yoy < 0 ? zero - mag : zero, y: YOY.y,
  width: mag, height: YOY.h,
  fill: toneColor(toneOf(metrics.yoy, metrics.goodDirection)),
  class: "bullet-yoy"
}));
```

`roundedRectPath` and `linearScale` are already exported from `svg.js`; `toneColor`,
`toneOf` and `planTone` from `palette.js`. Nothing new is required.

**Fit:** the hero band is four columns of a `0.9fr` row — roughly 250–300px wide by
180–200px tall per tile. A 240×96 bullet occupies less than half the vertical space the
132×132 ring does, which leaves the numeral room to grow. Comfortable.

---

### 2. The mix portlet — replace the 100% stacked bar with a two-period proportional alluvial

**Current:** `src/charts/mixBar.js`. One horizontal 100% stacked bar, two segments, a
legend with per-segment Y/Y, and an `insight` paragraph.

**Recommended:** two vertical columns — FY26 Q2 and FY27 Q2 — whose **widths** are
proportional to their totals and whose **heights** are the 100% split, connected by two
filled ribbons linking corresponding segments.

#### Why the data calls for it

The portlet's own `insight` string is a two-period sentence:

> Embedded is now **29% of Q2 ACV**, up from 14% a year ago — but it is taking share of a
> base that shrank 28%. The mix is rotating faster than the total is falling.

The chart shows the 29%. The 14%, the 28% fall, and the word "rotating" are all carried by
prose sitting underneath it. That is the headroom: three of the four facts in the portlet's
thesis are not in the portlet's chart.

A two-period Marimekko-style pair puts all of them in one form, and — this is why it is
worth the complexity — the encodings are mutually honest, because area is dollars in both
columns:

- **The base shrinking 28%** is the right column being visibly narrower than the left.
- **The rotation** is the split boundary jumping from 14% up to 29%.
- **The divergence** is the two ribbons doing opposite things: Embedded's widens, Agentic's
  pinches hard.
- **The paradox the portlet is actually about** — growing share of a shrinking base — is
  the thing you cannot miss, because Embedded's ribbon widens while the column it lands in
  is narrower. Embedded's *absolute* area still grows (15.6 → 24), Agentic's collapses
  (98.3 → 58), and both are true at once and visible at once.

Marimekko's standard warning is that it should not be used for time series, because varying
width across time can imply growth or decline that isn't there. Here the width *is* the
decline, on the same measure, over exactly two comparable quarters, with the total labelled
on both columns. This is the narrow case where the caution does not apply — but it is worth
knowing the caution exists, and worth labelling both totals so the width is never doing
unlabelled work.

#### Prerequisite — author the prior period, do not derive it

The prior-year values are recoverable from the Y/Y percentages, and they reconcile exactly
(see [Findings](#the-mix-portlets-prior-year-is-fully-recoverable-and-it-reconciles-exactly)).
Do not let `mixBar.js` compute them. This board's central claim is that a derived number is
only as governed as its inputs and that deriving quietly is how boards come to disagree; a
renderer back-solving a prior year from a rounded percentage would be the app doing the
exact thing it criticises, and `+54%` is rounded, so the derivation is lossy.

Add to `mix-acv.metrics`:

```jsonc
"priorTotal": 114,
"priorTotalDisplay": "$114M",
"priorPeriodLabel": "FY26 Q2",
"segments": [
  { "id": "embedded", /* ...existing... */ "priorValue": 16, "priorDisplay": "$16M" },
  { "id": "agentic",  /* ...existing... */ "priorValue": 98, "priorDisplay": "$98M" }
]
```

Then run `node scripts/sync-fallback.mjs`, per the README.

Direct mode needs no new authoring — the existing `tier: "red"` case already collapses the
split entirely, and it should continue to: two undifferentiated columns of different widths,
no ribbons, no boundary. That actually renders the degradation *better* than today, because
the total still visibly falls while the split is simply absent, which is precisely the
`directMode.effect` text ("the split cannot be produced at all, so the mix-rotation insight
disappears rather than degrades").

#### Animation-on

The build order is the argument, so it should run in narrative order:

1. Left column `growFrom(leftCol, { axis: "y", origin: "bottom", duration: 640 })`, then
   its two segments fade in on a short stagger.
2. Right column grows the same way, `delay: 240`. The width difference is visible from the
   first frame of this beat, which is the "base shrank" moment.
3. Ribbons: build each as a closed path, `strokeDraw` a hairline outline of it
   (`duration: 700`), then `fadeTo(ribbon, 0.22, { delay: 420 })` for the fill — `fadeTo`
   rather than `fadeIn`, because a ribbon at opacity 1 would drown the columns it connects.
   Drawing the ribbon edge before filling it is the "component arriving" idiom the rest of
   the board uses, and it means the ribbon is literally drawn from left column to right
   column, in the direction of time.
4. `countUp` on both column totals, staggered.
5. Legend and insight fade in as they do today.

Total ≈ 2.3s, comparable to the current build.

#### SVG construction sketch

```js
const W = 320, H = 200;
const BASE = H - 34, TOP = 16;

// Width encodes the total; the two columns share a $-per-pixel scale.
const wScale = linearScale([0, metrics.priorTotal], [0, 96]);
const left  = { x: 24,  w: wScale(metrics.priorTotal) };   // 96px @ $114M
const right = { x: 210, w: wScale(metrics.total) };        // ~69px @ $82M

function column(col, valueOf) {
  let y = TOP;
  return segments.map(seg => {
    const h = (valueOf(seg) / total(col)) * (BASE - TOP);
    const rect = svgEl("rect", { x: col.x, y, width: col.w, height: h,
                                 fill: seg.color, class: "mix-seg" });
    const band = { y0: y, y1: y + h };
    y += h;
    return { rect, band, seg };
  });
}

const a = column(left,  s => s.priorValue);
const b = column(right, s => s.value);

// One ribbon per segment: left band's edges -> right band's edges, smoothed
// with a pair of cubics whose control points sit at the horizontal midpoint,
// which is the standard Sankey curve.
a.forEach((from, i) => {
  const to = b[i], mx = (left.x + left.w + right.x) / 2;
  marks.appendChild(svgEl("path", {
    d: [
      `M ${left.x + left.w} ${from.band.y0}`,
      `C ${mx} ${from.band.y0}, ${mx} ${to.band.y0}, ${right.x} ${to.band.y0}`,
      `L ${right.x} ${to.band.y1}`,
      `C ${mx} ${to.band.y1}, ${mx} ${from.band.y1}, ${left.x + left.w} ${from.band.y1}`,
      "Z"
    ].join(" "),
    fill: from.seg.color, opacity: 0, class: "mix-ribbon"
  }));
});
```

**Fit:** the mix portlet is the `2.05fr` column of the mix band — the widest single portlet
on tab 1. A 320×200 viewBox is well within it. This is the one portlet with room for a
genuinely composed chart, which is another reason to spend the ambition here.

---

### 3. The AE headcount stat tile — add a unit/waffle grid

**Current:** `src/charts/statTile.js`. A large numeral, a Y/Y delta chip, a centre-anchored
CSS bar, a caption and a footnote.

**Recommended:** keep all of that, and add a unit grid above it — one cell per 10 AEs,
where the current 745 are filled and the heads lost since last year are drawn as hollow
outlines in the same grid.

#### Why the data calls for it

745 is a **countable population**, and it is the only countable population on the board.
Every other measure is dollars, which are continuous and abstract; headcount is people, and
a unit chart is the one form that makes that difference mean something. The tile's caption
is already "Down 159 heads year over year" — a unit grid renders that sentence as sixteen
emptied cells rather than as a phrase, and the emptied cells are adjacent to the filled ones
so the proportion is right there without a percentage.

This is also the cheapest big win on the board. It is additive rather than a replacement,
it needs no new primitives, it does not touch the tile's existing readout, and unit charts
are having a genuine moment in current practice — ApexCharts shipped a whole unit-chart
family in 6.6 precisely because "the count is the message" is a common case that bars and
donuts both flatten.

#### Prerequisite — reconcile the Y/Y first

As set out in [Findings](#the-ae-headcount-tile-contradicts-itself), `yoy: -21` implies 943
heads a year ago and the caption implies 904. Pick one and author it explicitly:

```jsonc
"priorValue": 904,
"priorDisplay": "904",
"yoy": -17.6,
"yoyDisplay": "-18% Y/Y",
```

or keep `-21` and fix the caption to "Down 198 heads year over year". Either is fine; what
is not fine is shipping a chart that draws both. The grid will show the discrepancy the
moment anyone counts, and on a board about numbers that can be defended in the room, that
is the wrong thing to be caught by.

#### Animation-on

1. Filled cells `stagger(filled, { step: 12, maxTotal: 620, duration: 260, scaleFrom: 0.4 })`
   — reading order, left to right and top to bottom, so it reads as a roster being counted.
2. Then the loss: the trailing cells, already drawn filled, transition to hollow over
   ~420ms — `fill` to `none`, `stroke` to the accent at 0.45 opacity. A CSS transition on
   `fill`/`stroke` is enough; no new primitive.

That second beat is the whole point and it is worth giving it its own moment. The grid
fills up to last year's number, and then part of it drains. That is a much better rendering
of "−21% Y/Y" than a bar that is 21% of a track.

3. `countUp` on the numeral runs concurrently with beat 1, unchanged.

#### SVG construction sketch

```js
const PER_CELL = 10;
const total  = Math.round(metrics.priorValue / PER_CELL);   // 90 cells @ 904
const filled = Math.round(metrics.value      / PER_CELL);   // 75 cells @ 745
const COLS = 10, CELL = 12, GAP = 3;

for (let i = 0; i < total; i += 1) {
  const isLost = i >= filled;
  marks.appendChild(svgEl("rect", {
    x: (i % COLS) * (CELL + GAP),
    y: Math.floor(i / COLS) * (CELL + GAP),
    width: CELL, height: CELL, rx: 2,
    fill: isLost ? "none" : accent,
    stroke: isLost ? accent : "none",
    "stroke-width": isLost ? 1.2 : 0,
    opacity: isLost ? 0.45 : 1,
    class: `unit-cell${isLost ? " is-lost" : ""}`
  }));
}
```

**Fit:** 10 columns × 9 rows at 15px pitch is 150×135 user units. The stat tile is the
`1fr` column of the mix band, roughly 200px wide. It fits, but it is the tightest
recommendation here. **Practical downgrade:** raise to `PER_CELL = 25`, giving 36 cells in
a 6×6 block at ~100×100 — still clearly countable, half the footprint. Do not go below
about 25 cells or the form stops reading as a count and starts reading as decoration, at
which point a bar is more honest.

A note on the legend: the grid needs "1 square = 10 AEs" stated on the tile. A unit chart
whose unit is unstated is just a texture.

---

### 4. The narrative card rails — keep as cards, add a coverage strip

**Current:** `src/charts/cardRail.js`. Numbered cards, each with an inline tag chip per
linked metric; hovering a chip highlights that portlet, clicking reveals it.

**Recommendation: leave the cards alone.** This is prose, and every attempt to chart prose
produces decoration. The numbered-card rail with cross-linking chips is the right form, the
cards are the right length, and the inline chip placement is already a considered decision
(the code comment explains it is inline rather than on its own row so five cards fit a fixed
viewport). Changing it would be inventing work.

There is one genuinely quantitative thing here that is invisible at rest, and it is worth
surfacing: **the link topology**, per the [Findings](#two-of-the-four-kpis-have-no-narrative-attached-to-them-at-all).

#### The addition

A thin coverage strip — one row, about 22px tall — spanning the bottom of the narrative
band or sitting between the two rails. One mark per targetable portlet (eight of them), each
a small dot whose fill depth or radius encodes how many narrative claims point at it, with
**zero-link portlets drawn as hollow sockets**.

The finding it renders: NNAOV and ACV, the two worst numbers on the board, are hollow.
Nobody claimed a win against them and nobody committed to fixing them. That is a real
observation about the narrative, it is checkable, it comes straight out of the authored
data, and it is precisely the class of thing this board says it exists to make visible.

Today that fact is unreachable. You would have to hover all nine chips and remember which
portlets never lit.

#### Why not a full arc diagram

The obvious form is an arc diagram — cards along one axis, metrics along the other, curved
edges between. At full size it would be lovely. At portlet scale, nine edges crossing a
narrative band that is already carrying nine cards of text is spaghetti laid over prose, and
it would fight the cards for attention while being less legible than the chips already are.
**The dot strip is the practical downgrade and I would ship it instead of the arc diagram
even given more room**, because the interesting quantity here is *how many* claims point at
each metric, not *which* card each edge came from — and the chips already answer the second
question on hover.

#### Data fields

Nothing new to author. The strip is computed from the `links` arrays already present on
every card, cross-referenced against the portlet ids on the tab. It should be built from
`ctx.tab` rather than hardcoded, so adding a card in `board.json` updates the strip.

Direct mode: in `directMode` the rails go `tier: "grey"` and the chips render severed. The
strip should render **all eight sockets hollow** — because without the semantic layer no
claim maps to any measure, so the coverage is uniformly zero. That is a strong degradation
visual and it comes for free from the same code path.

#### Animation-on

`stagger(dots, { step: 60, duration: 320, scaleFrom: 0.3 })` after both rails finish, then a
short `countUp` on each dot's count label. The hollow sockets simply never fill, which
lands better if they animate in on the same stagger as everything else rather than being
held back — the reader watches the row populate and two of them stay empty.

#### Fit and honest caveat

Tab 1 is composed to exactly one viewport with nothing to scroll, and the narrative band is
`1.22fr` of three rows — the tallest band, but it is carrying nine cards. A 22px strip is
not free. This is why the recommendation lands in **priority (b)**: it is a genuine
insight, but it is gated on finding 22px on a tab that is already full, and the honest
answer may be that it belongs on a third view rather than squeezed into this one.

---

## Tab 2 — Five Year Trend

### 5. The seven trend panels — keep the trajectory, add a Y/Y deviation strip

**Current:** `src/charts/trendPanel.js`. Zero-baselined smoothed line and area, detached H1
point behind a dashed break rule for flows, run-rate ghost, joined H1 for stocks.

**The trajectory itself is right and should not change.** This is the best chart grammar on
the board. The flow/stock treatment — break rule, detached ring-with-core point, run-rate
ghost offered to flows and withheld from stocks — is a genuinely uncommon and genuinely
correct piece of design, and the panel's header comment explains it better than most
published chart documentation explains anything. Zero baselines are correct at this size for
the reason the code gives. The smoothing tension is deliberately held at 0.18 so the curve
never overshoots a real measurement. I would change none of it.

**Recommended addition:** a Y/Y deviation strip — five discrete cells beneath the
trajectory, one per period, coloured by `toneOf(yoy, goodDirection)`.

#### Why the data calls for it

**There is a whole authored series per panel that never appears on the panel face.** Every
trend portlet carries `metrics.yoy` as five values, and five of the seven also carry
`metrics.cagr`. Today those surface only in the tooltip and in the expanded detail table.
That is roughly 35 authored numbers on tab 2 that a viewer cannot see at rest.

**It makes the tab's stated colour rule visible.** The rules card claims:

> Movements inside ±10% render amber, beyond it red or green — one stated threshold rather
> than a per-cell judgement.

That threshold is implemented — it is the `softBand = 10` default in `toneOf()` — but on the
panel face today it is nearly unexercised, because the trajectory is drawn in the portlet's
accent colour, not in sentiment colour. The rules card states a rule the tab barely
demonstrates. Thirty-five threshold-coloured cells demonstrate it seven times over.

**It is the form that cannot lie across the flow/stock boundary.** This matters and it is
why I am recommending this over any of the alternatives. The cells are discrete and
per-period. They interpolate nothing, they span nothing, they imply no trajectory. The H1
cell is simply a cell — it does not need a break rule, because there is no continuity to
break. A deviation strip is structurally incapable of the error the whole tab is built to
avoid, which makes it the safest possible thing to add to these panels.

**It is where the polarity argument finally pays off in colour.** Attrition declares
`goodDirection: "down"`, and its Y/Y row is `["4%", "31%", "22%", "3%", "-8%"]`. On the
strip, that renders as four warm cells and then one green one at H1 — the only green cell in
that row, sitting in a tab where the other six metrics are running red. Nobody coloured it.
The measure declared lower-is-better and the cell inherited it. Reading across seven panels
at once, that single green cell is the most persuasive pixel on the board, and right now it
does not exist.

#### Data fields

All already authored:

- `metrics.yoy` — array of five strings like `"-13%"`, some `null` (Revenue's first, NNAOV's
  first `cagr`). Parse with `parseFloat`; render `null` as an empty outlined cell, not a
  zero-height one, so "not measured" is distinct from "no change".
- `metrics.goodDirection` — drives `toneOf()`.
- `tab.partialFrom` — the H1 cell should carry the same `is-partial` styling the period
  labels already use, so it is marked as half-period without being detached.

#### Animation-on

A fourth beat appended to the existing sequence, after the dots and before the ghost:

```js
await wait(360, signal);
stagger(strip, { step: 70, duration: 300, y: 0, scaleFrom: 0.3, signal });
```

Or, for the diverging-bar variant, `growFrom(cell, { axis: "y", origin: "center", ... })`
per cell on the same stagger, so each bar grows out of the zero rule in the direction of its
sign. That is the better motion — it makes the sign visible before the colour is read — and
it costs nothing extra.

#### SVG construction sketch

Two variants. **Cells** is the safe one; **diverging bars** is better if the height exists.

```js
// --- variant A: cells (needs ~14 user units of height) ---------------------
const STRIP_Y = H - PAD.bottom + 6;
const cellW = (x(series.length - 1) - x(0)) / series.length * 0.72;

periods.forEach((_, i) => {
  const raw = (metrics.yoy || [])[i];
  const v = raw == null ? null : parseFloat(raw);
  marks.appendChild(svgEl("rect", {
    x: x(i) - cellW / 2, y: STRIP_Y, width: cellW, height: 10, rx: 2,
    fill: v == null ? "none" : toneColor(toneOf(v, metrics.goodDirection)),
    stroke: v == null ? p.axis : "none",
    "stroke-dasharray": v == null ? "2 2" : null,
    opacity: v == null ? 1 : 0.85,
    class: `trend-dev${i >= partialFrom ? " is-partial" : ""}`
  }));
});

// --- variant B: diverging bars (needs ~26 user units) ----------------------
// A zero rule at STRIP_Y + 13, bars growing up for positive and down for
// negative, magnitude clamped at 40% so NNAOV's -74% does not set a scale
// that flattens every other panel's cells to invisibility.
const dev = linearScale([0, 40], [0, 12]);
const h = Math.min(dev(Math.abs(v)), 12);
```

Variant B needs the clamp. NNAOV's H1 Y/Y is −74% and AOV's is +4%; an unclamped shared
scale across panels would make six of the seven panels' strips read as flat. Clamp at ±40%
and mark clamped bars with a small notch, the same way the KPI delta bar already caps at
100%.

#### Fit — this is the real constraint

Trend panels are a 300×240 viewBox in a 4×2 grid, so each is roughly an eighth of a
viewport. `PAD.bottom` is 52, currently holding period labels at `+16` and the partial note
at `+30`. There is not 26 spare units in there.

Three options, in order of preference:

1. **Grow the viewBox to 300×264** and give the strip its own 24-unit band between the
   baseline and the period labels. The panels are `preserveAspectRatio: xMidYMid meet` in a
   flexible grid cell, so a taller viewBox letterboxes slightly rather than breaking. Best
   result, small layout risk — check the 3-column responsive breakpoint at 1180px.
2. **Variant A cells at 10 units**, tucked between the baseline and the period labels by
   moving the labels from `+16` to `+28`. Fits inside the existing `PAD.bottom` with no
   viewBox change. Slightly cramped, no layout risk.
3. **No strip — encode Y/Y as a ring around each existing dot.** Zero added height. Each
   trajectory point gets a 2px sentiment-coloured ring at radius `r + 2.5`. Loses magnitude
   entirely, keeps direction and threshold. This is the **practical downgrade** and it is
   perfectly respectable — it is the same information at lower precision, and it has the
   nice property of putting the colour directly on the measurement rather than beside it.

---

### 6. The run-rate ghost — a scenario fan instead of a single point

**Current:** on flow panels, a single dashed circle at `metrics.runRate` with a dashed
connector and a `×2 $300M` label.

**Recommended:** replace the single ghost point with a narrow three-band fan spanning the
plausible annualisations.

#### Why

This is the one place on the board where the fan grammar the user liked is genuinely earned,
and it is earned for the right reason rather than the aesthetic one.

`×2` is not a fact, it is an assumption — and specifically it is the assumption that H2
looks exactly like H1. For ACV that yields $300M; but H2 continuing the −23% Y/Y trend
yields something lower, and a seasonally-weighted H2 (Q4 is typically the strongest quarter
in enterprise software) yields something higher. The current ghost presents one of those
three as *the* run-rate, in a dashed circle that reads as precise.

A fan is the standard grammar for exactly this — the Bank of England introduced fan charts
in 1996 specifically to stop readers fixating on a central projection, and the FT Visual
Vocabulary lists the fan under change-over-time as "use to show the uncertainty in future
projections". Rendering the ghost as a band rather than a point says the true thing: this
is a range of defensible annualisations, and the width is the disagreement.

It also fits the board's argument tightly. The run-rate ghost exists because the *measure*
declares itself a flow and therefore annualisable. But annualisable does not mean
annualisable one way. A semantic layer that carries the flow/stock rule could equally carry
the annualisation basis — and a fan makes the absence of a single stated basis visible
instead of papering it with `×2`.

#### Prerequisite — author the scenarios

Do not compute these in the renderer, for the same reason as §2. Add to the flow panels'
metrics:

```jsonc
"runRate": 300,
"runRateDisplay": "$300 M",
"runRateBasis": "H1 × 2, flat",
"runRateRange": {
  "low": 268,  "lowBasis":  "H2 continues H1 Y/Y decline",
  "high": 322, "highBasis": "H2 seasonally weighted"
}
```

If those bounds cannot be defended, **do not build this** — a fan whose width is invented is
worse than a point, because it dresses a guess as a quantified range. That is a real risk
and it is why this sits in priority (b). The honest fallback is to keep the single ghost and
simply add the `runRateBasis` string to its tooltip, which costs nothing and fixes most of
the problem.

#### Animation-on and construction

The fan should arrive after the detached H1 point, in the ghost's existing slot in the build
sequence:

```js
// Replaces the single `ghost` circle. Two nested bands, drawn as closed paths
// from the H1 point out to the fan's right edge, so the fan visibly opens
// from the last real measurement.
const gx = x(series.length - 1), h1y = y(series[series.length - 1]);
const fx = gx + 26;

const band = (lo, hi) => [
  `M ${gx} ${h1y}`,
  `L ${fx} ${y(hi)}`, `L ${fx} ${y(lo)}`, "Z"
].join(" ");

const outer = svgEl("path", { d: band(range.low, range.high), fill: p.ghost,
                              opacity: 0, class: "trend-fan-outer" });
const centre = svgEl("path", { d: `M ${gx} ${h1y} L ${fx} ${y(metrics.runRate)}`,
                               stroke: p.ghost, "stroke-dasharray": "2 4",
                               fill: "none", class: "trend-fan-centre" });
```

Then `fadeTo(outer, 0.14, { duration: 420 })` for the band — it is a fill and must stay
translucent — and `dashDraw(centre, { duration: 380, delay: 160 })` for the median line,
which is the primitive the current ghost link already uses. The motion vocabulary is
otherwise unchanged, so the fan reads as the same kind of object the ghost was.

**Fit:** the fan needs ~26 user units to the right of the H1 point. `PAD.right` is 14 and
the x-scale already stops at `W - PAD.right - 20`, so there are about 20 units of margin.
Tight. **Practical downgrade:** draw the fan as a vertical range bar *at* the H1 x-position
rather than fanning rightward — a thin dashed capsule from `y(low)` to `y(high)` with a tick
at the median. Same information, no horizontal room needed, and it reads as an error bar,
which is a form no one needs taught.

---

### 7. The driver rail — surface the claim load on both sides

**Current:** `src/charts/driverRail.js`. A numbered list of six drivers, each with a count
chip, hover/focus lighting the metrics it claims.

**The interaction is good and should stay.** Hover-to-highlight with a latching tap
fallback, focus/blur parity, and a severed state in direct mode is careful work.

**Recommended addition:** make the bipartite structure visible at rest, on both sides.

#### Why the data calls for it

Fourteen edges, distributed very unevenly:

| Driver | Metrics claimed | | Metric | Drivers claiming it |
|---|---|---|---|---|
| Product Transitions | 3 | | **NNAOV** | **4** |
| Sales Capacity & Model | 2 | | ACV | 3 |
| Customer Confusion | 2 | | Attrition | 3 |
| Competitive Landscape | 3 | | AOV | 1 |
| Eroded Motions | 2 | | AE Capacity | 1 |
| Accounting treatment | 2 | | AE Productivity | 1 |
| | | | Revenue | 1 |

NNAOV — the steepest decline on the board, down 97% from FY23 on an H1 run-rate basis — is
claimed by four of the six drivers. Everything else is claimed by one or three.

That asymmetry is a finding. A metric explained by four separate causes is either genuinely
overdetermined or under-diagnosed, and either way it is the thing a reader should notice.
The driver rail's own code comment says the mapping exists so that "an over-broad claim is
visible as a driver that lights everything" — but that only works one driver at a time, on
hover, from the driver side. The metric side of the imbalance, which is where the
interesting number is, is not reachable at all.

#### The recommendation, and why not the arc diagram

The obvious form is a bipartite arc diagram: drivers down the left, metrics down the right,
curved edges between, edge density at NNAOV visible as a bundle.

**I am recommending against it at this scale.** The drivers band is `minmax(210px, 0.86fr)`
— a tall, narrow left column. Fourteen curved edges inside 210px of width will bundle into
an unreadable knot, and the rail also has to carry six lines of driver text. It is the right
form at poster scale and the wrong one here. Filed under
[beautiful but impractical](#considered-and-rejected).

**The practical form, which I would ship:**

1. **Claim-load stems on the driver side.** Each driver's existing `driver-count` chip gains
   a short horizontal stem whose length is the number of metrics claimed — a two-unit
   lollipop, essentially. Drivers claiming three read visibly heavier than drivers claiming
   two. Nearly free, since the count is already computed and rendered.
2. **A metric-load spine at the foot of the rail.** Seven small vertical bars, one per trend
   metric, height proportional to how many drivers claim it, labelled with the metric's
   short name. NNAOV's bar is four units tall against a field of ones. That is the finding,
   rendered, at rest, in about 40px of vertical space.
3. **Wire the spine to the existing highlight.** Hovering a spine bar calls
   `ctx.highlight([metricId], true)` — the same call the driver buttons already make. Now
   the rail reads in both directions: from cause to metric, and from metric to its causes.

#### Data fields

Nothing new. Both loads are derived from the `affects` arrays already authored on each
driver, inverted for the metric side. This is a safe derivation — it is a count of authored
edges, not a back-solved quantity, so it cannot drift from the data the way §2's prior-year
values could.

Direct mode: `severed` already zeroes the driver counts to `"—"`. The spine should render
as seven empty sockets, which matches the `directMode.effect` text exactly ("six plausible
causes floating beside seven metrics, with nothing connecting them").

#### Animation-on

The rail currently staggers its six items at 72ms. Append:

```js
await wait(180, signal);
stagger(spineBars, { step: 60, duration: 340, y: 6, signal });
```

and grow each bar from its baseline with `growFrom({ axis: "y", origin: "bottom" })` so the
spine assembles upward — the NNAOV bar visibly overshooting the rest is the moment.

---

### 8. The rules card — inline mini-diagrams for the two geometric rules

**Current:** `src/charts/rulesCard.js`. Four titled rules as text.

**Recommended:** keep all four rules as text, and give the two *geometric* ones a small
inline diagram — roughly 44×26 user units each, sitting beside the rule's title.

#### Why

Two of the four rules describe shapes:

- **Flow vs stock** — "H1 is plotted detached and offered a run-rate ghost… a stock joins
  the line and is never annualised." That is a statement about two different pictures, and
  the two pictures are exactly what the tab wants the reader to compare. Right now the
  reader has to hold the sentence in their head, find the ACV panel, find the AOV panel, and
  do the comparison across the grid. A 44×26 pair of thumbnails does it in place.
- **Zero baseline** — "A padded baseline makes each decline look steeper, and at this size
  nobody would notice it had been truncated." This is a claim about a visual distortion, and
  showing the same five points on a truncated axis beside a zero axis proves it in one
  glance. Explaining an optical argument in words when you have an SVG renderer available is
  leaving the argument on the table.

The other two rules — polarity and the colour threshold — are correctly text, because they
are about *rules*, not shapes. Though note that if §5 ships, the deviation strip becomes a
live demonstration of the colour-threshold rule, and the rules card could point at it.

This turns the rules card from a paragraph beside the tab into the **legend for the tab**,
which is what it is actually for. It is also cheap: four tiny paths, no new data, no
interaction, no layout risk.

#### Construction sketch

```js
// Flow vs stock: two 44x26 thumbnails, same five points, different H1 treatment.
function miniTrajectory({ detached }) {
  const pts = [[2,20],[12,16],[22,13],[32,9],[42,6]];
  const joined = detached ? pts.slice(0, 4) : pts;
  g.appendChild(svgEl("path", { d: linePath(toXY(joined)), fill: "none",
                                stroke: accent, "stroke-width": 1.4 }));
  if (detached) {
    g.appendChild(svgEl("path", { d: `M 37 2 V 24`, stroke: p.axis,
                                  "stroke-dasharray": "1 3" }));
    g.appendChild(svgEl("circle", { cx: 42, cy: 6, r: 2.2, fill: "none",
                                    stroke: accent, "stroke-width": 1.4 }));
  } else {
    g.appendChild(svgEl("circle", { cx: 42, cy: 6, r: 1.8, fill: accent }));
  }
}

// Zero baseline: same points, y-scaled from 0 vs from min(series).
```

`linePath` is already exported. Animate with `strokeDraw` on each mini-line at ~260ms as
part of the card's existing fade-in stagger, so the rules card builds like everything else.

---

### 9. A new panel — connected scatter, AE Capacity × AE Productivity

**Recommended:** a connected scatterplot with AE Capacity on x, AE Productivity on y, five
points tracing FY23 → FY27 H1.

#### Why the data calls for it

These two metrics are not independent — `trend-ae-productivity.semantic.derivedFrom` says
so explicitly: Productivity is ACV ÷ Capacity. The board states the relationship in a
provenance field and then draws the two series in separate panels where the relationship is
invisible.

Plotted against each other, the path does something neither line panel shows:

| | Capacity | Productivity |
|---|---|---|
| FY23 | 1,101 | $566K |
| FY24 | 953 | $638K |
| FY25 | 920 | $599K |
| FY26 | 904 | $549K |
| FY27 H1 | 745 | $200K ($400K annualised) |

Capacity falls monotonically throughout. Productivity **rises** from FY23 to FY24 while
capacity is falling hardest — the organisation got more productive as it shrank — and then
falls for three straight periods. The path is a hook, not a line. That is a genuinely
different story from "both went down", which is what the two separate panels currently
imply, and it bears directly on the "Sales Capacity & Model" driver.

The FT Visual Vocabulary lists connected scatter under change-over-time for exactly this
case: "a good way of showing changing data for two variables whenever there is a relatively
clear pattern of progression."

#### The honest constraint, and how to handle it

**The FY27 H1 point is a flow plotted against a stock.** Productivity is a flow (six months
of ACV per head); Capacity is a stock (745 heads at a moment). Joining the H1 point to the
path would assert it belongs on the same trajectory as the four full years, which is the
exact error this tab exists to prevent — and it would be a *worse* version of the error than
usual, because the mixed axis types make it harder to spot.

Handle it with the grammar the tab already has: draw the H1 point **detached**, as a
ring-with-core, with the connecting segment dashed rather than solid, and place the
run-rate-annualised point ($400K at 745 heads) as a ghost ring on the same x. That reuses
`trendPanel.js`'s exact vocabulary, so a reader who has understood one panel understands
this one for free.

#### Animation-on

1. Axes `strokeDraw`, both, 460ms — this panel needs two real axes rather than one baseline.
2. Path `strokeDraw(path, { duration: 1100 })` — and because the path doubles back, the
   stroke-on genuinely traces the story: out, up, over, and down. This is the most
   expressive `strokeDraw` on the board.
3. Points `stagger(dots, { step: 90, scaleFrom: 0.2 })` with period labels.
4. Detached H1 and its ghost, `dashDraw` then `fadeIn`, matching the trend panels.

#### Fit and priority

This is a **new portlet**, and the panels band is a full 4×2 grid holding seven trend panels
plus the rules card — there is no free cell. Adding it means either dropping something or
going to a 3×3 at this breakpoint, and the tab is composed to one viewport with nothing to
scroll.

So this is **priority (b), gated on layout**, and I want to be straight about that rather
than pretending the slot exists. The two candidates it could displace are both bad trades:
the rules card is thematically load-bearing, and every trend panel is a certified measure
the board is arguing about. The realistic paths are a 3×3 grid at wide breakpoints, or
making this the expanded/inspector view of the AE Productivity panel — which is actually
rather elegant, since the inspector already has room and the connected scatter is exactly
the kind of thing you want on a drill-down rather than at a glance.

---

## On the flow-lines aesthetic

The reference — flowing curved lines from a single origin, fanning out into a distribution,
with a marginal density curve on the right axis — is a real and current form. It shows up in
Guardian and Reuters graphics for cohort-outcome stories, it descends from origin-destination
flow-map design (curved, radially-arranged flow lines, small flows drawn over large ones),
and the marginal-density panel is the standard `jointplot` marginal from statistical
graphics. It is a good form and the instinct to want it is a good instinct.

**It does not fit this data, and I do not think it should be built.**

A fan of flow lines encodes a *population dispersing*. It needs many units, each with its
own path, so that the envelope of the paths is a distribution and the marginal curve is that
distribution's density. This board has no populations. Every value in `board.json` is a
single authored aggregate: one ACV per fiscal year, one attrition figure per period, one
headcount. There are no per-account, per-deal, or per-rep records anywhere in the dataset.

Building the form anyway would mean generating the spread — picking a variance, scattering
synthetic paths inside it, and drawing a density curve fitted to numbers nobody measured.
The board would then contain a chart asserting a distribution that does not exist, on a
board whose central argument is that a chart must not assert more than its measure supports.
It is the same failure as annualising a stock: the picture is beautiful and the operation is
invalid. The AOV panel's `directMode` calls this out in so many words — "the error looks
exactly like the correct operation on the row above."

**What would earn it.** One field. If the board ever carried ACV at account grain or
productivity at rep grain — 745 AEs, each with a productivity figure — then the fan is
precisely right, and it would be the best chart on the board:

- Each line is one AE's trajectory from a common FY23 origin, fanning out over five periods.
- The envelope shows the spread widening or collapsing.
- The **marginal density on the right axis is the real payoff**, because it would answer a
  question the current AE Productivity panel structurally cannot: is the $549K → $200K fall
  the whole distribution sliding down, or the top quartile leaving and the median holding?
  Those two stories have identical means and completely different remedies, and the mean is
  all the board can currently show.
- Colour headroom is large — lines tinted by tenure, segment, or start cohort, with the
  density curve carrying the aggregate.

So the honest recommendation is: **hold this form, and treat it as the argument for adding
one grain of detail to the dataset.** It is a better reason to extend `board.json` than any
of the other recommendations here, because it unlocks a class of question rather than a
prettier version of an existing answer.

**The one piece of the aesthetic available today** is §6 — the run-rate ghost as a fan. That
is genuinely a distribution over scenarios rather than over units, it is the Bank of England
grammar rather than the Guardian one, and it is small. But it is the same visual idea
(uncertainty rendered as a widening band rather than a point) applied where the data can
actually carry it, and it carries the same prerequisite: author the bounds, do not invent
them.

---

## Priority ranking

### (a) High impact, worth doing now

| # | Change | Portlet | Why it ranks here | Effort |
|---|---|---|---|---|
| 1 | **Y/Y deviation strip** | 7 trend panels | Surfaces ~35 already-authored numbers that are invisible at rest; makes the tab's stated ±10% threshold visible instead of merely claimed; structurally incapable of the flow/stock error. Biggest colour gain on the board. | Medium — the only real risk is 24 units of panel height |
| 2 | **Polarity-mirrored bullet graph** | 4 KPI tiles | Turns measure polarity into visible geometry rather than an invisible colour rule; kills the over-100% special case; makes four attainments comparable on one scale. The most on-thesis change available. | Medium — new renderer, no data change |
| 3 | **Two-period proportional alluvial** | Mix portlet | The portlet's own insight text is a two-period statement that the current one-period bar cannot make. Three facts in one honest form. | Medium-high — needs prior-period authoring first |
| 4 | **Unit/waffle grid** | AE headcount | Cheapest large win. Makes −159 heads countable rather than abstract; purely additive. | Low — but fix the Y/Y inconsistency first |
| 5 | **Rules-card mini-diagrams** | Rules card | Two of four rules are geometric claims currently made in prose. Turns the card into the tab's legend. Very cheap. | Low |

### (b) Worthwhile, secondary

| # | Change | Why it is not in (a) |
|---|---|---|
| 6 | **Driver claim-load stems + metric-load spine** | Real finding (NNAOV claimed by 4 of 6 drivers) but a smaller payoff than (a), and the rail is narrow |
| 7 | **Card-rail coverage strip** | Surfaces that NNAOV and ACV have zero narrative attached — a genuinely good catch — but tab 1 has no spare 22px and this may belong on a third view |
| 8 | **Connected scatter, Capacity × Productivity** | Best new *analysis* on the list, but there is no free grid cell. Strong candidate for the inspector/expanded view instead |
| 9 | **Run-rate ghost as a scenario fan** | Only ships if the scenario bounds can be honestly authored. If not, add `runRateBasis` to the tooltip and stop there |

Also in this tier, trivially: **add the incoming-link count chip to the card rails**, so they
match the driver rail, which already shows its `affects` count. One line, consistent
vocabulary.

### (c) Considered and rejected

See below — every rejection has a reason, and several are rejected specifically because they
would break the flow/stock or half-period boundary.

---

## Considered and rejected

**Rejected because the data has no distribution**

| Form | Why not |
|---|---|
| Flow lines / fan of trajectories | No population to fan. Full discussion [above](#on-the-flow-lines-aesthetic) — held, not dismissed |
| Beeswarm / jitter | Needs many observations per category; the board has one aggregate per period |
| Ridgeline / joyplot | Needs a distribution per group. Same problem |
| Hex-bin | Needs dense bivariate scatter. There are five points per metric |
| Chord diagram | Needs a square flow matrix. The driver→metric mapping is bipartite and tiny (14 edges) |
| Violin / box plots | No within-period spread exists to summarise |

**Rejected because they would break the boundaries the board exists to defend**

| Form | Why not |
|---|---|
| Streamgraph across FY23–FY27 | Stacking over time; would put a flow (ACV) and a stock (AOV) in one stack, which is the exact error the tab is built to prevent. Its wiggle baseline also breaks the stated zero-baseline rule |
| Indexed overlay (FY23 = 100) on trend panels | Puts an indexed scale and an absolute zero-baselined scale in one frame — a dual-scale chart, and quietly dishonest in the way the board argues against |
| Sankey across the five-year metrics | ACV → Attrition → AOV is not a conserved flow in this dataset; a Sankey would assert a conservation the data does not support |
| Bump chart of the seven metrics | Requires a meaningful shared rank; seven metrics in `#`, `$K` and `$M` have none |
| Sparklines on the tab-1 KPI tiles | Grain mismatch — the tiles are fiscal-quarter, the only history available is fiscal-year. Silently mixing grains is precisely what the board criticises |
| Area chart stacking Embedded + Agentic over five years | No five-year motion split is authored, and `mix-acv.directMode` says the taxonomy is what would be missing — inventing it here would undercut the argument |

**Rejected because the current form is already better**

| Form | Why not |
|---|---|
| Pie / donut for the mix | Strictly worse than the existing stacked bar for a two-way split. The current bar is right; §2 is an upgrade in a different direction (adding a period), not a fix |
| Treemap for the mix | A treemap of two rectangles is a stacked bar with extra steps |
| Charting the narrative rails | Prose is not a quantity. The numbered-card rail is correct; only the *link topology* is chartable, hence §4 |
| Replacing the trend trajectory | It is the best grammar on the board. Keep it |

**Rejected on encoding grounds**

| Form | Why not |
|---|---|
| Radar / small-multiple radar for the four KPIs | Angle encoding again, plus the 104% case breaks the polygon, plus the axis order is arbitrary and changes the shape — the same failure as the gauge, in a less familiar wrapper |
| Radial bar / Nightingale rose for the KPIs | Area encoding for a value that needs comparison; polar area is misread by 20–30% in the literature |
| Calendar heatmap | Needs a daily or weekly grain. Nothing on this board is finer than a fiscal quarter |
| Cycle plot | Needs a repeating seasonal cycle within the series. Annual data has none |
| Funnel | There is no staged conversion process in this data. Pipegen and ACV are not stages of one funnel here |

**Beautiful but impractical at portlet scale**

| Form | Practical downgrade |
|---|---|
| Bipartite arc diagram, drivers → metrics | 14 curved edges in a 210px column is a knot. → **Claim-load stems + metric-load spine** (§7) |
| Full arc diagram, narrative cards → metrics | 9 edges laid over 9 cards of prose. → **Dot coverage strip** (§4) |
| Horizon chart for the seven metrics | Genuinely good for many dense series in little vertical space, and the research supports it for large visual spans — but it needs a folding key the reader has to learn, and seven series at five points each is far too sparse to justify the training cost. Small multiples are the right call at n=5 |
| Full Marimekko across five years | Five variable-width columns at 300px would render FY27 H1 as a sliver, and width-over-time is the documented Marimekko misuse. → **Two-period only** (§2), where the width difference is the point and both totals are labelled |

---

## Where the colour headroom actually is

The ask was "colour and creativity", so this is worth stating directly. Ranked by how much
*meaningful* colour each change adds — colour that encodes something, not colour that
decorates:

1. **Deviation strips (§5)** — 35 new cells across tab 2, every one coloured by
   `toneOf(yoy, goodDirection)`. This is by far the largest addition of encoded colour
   available, and none of it is a choice: it all falls out of the measure's polarity and the
   one stated threshold. Attrition's single green H1 cell in a tab running red is the
   payoff.
2. **Bullet bands (§1)** — three tinted regions per tile instead of one arc colour, and the
   regions *mirror* for the down-metric. Twelve tinted bands across the hero band, arranged
   in a pattern that itself carries information.
3. **Alluvial ribbons (§2)** — two low-opacity ribbon fills spanning the portlet's full
   width, plus two columns, plus the width difference. The most visually substantial single
   portlet on the board.
4. **Unit grid (§3)** — 90 cells in a two-tone filled/ghosted encoding. Not many hues, but a
   lot of surface, and the tone difference is the entire message.
5. **Metric-load spine (§7)** and **coverage strip (§4)** — small, but they introduce a new
   encoding the board does not currently have anywhere: *count of claims*, which reads as
   density rather than as sentiment.

Worth noting what does **not** need more colour: the trend trajectories. They are already
accent-coloured per metric, and adding sentiment colour to the line itself would collide
with the deviation strip's sentiment colour and produce two colour systems arguing on one
panel. `palette.js`'s comment about keeping sentiment and trust orthogonal applies here too
— keep the trajectory in the measure's accent, and let the strip carry sentiment.

---

## References

Grouped by which recommendation they informed.

**Gauges vs bullet graphs (§1)**

- Stephen Few, *Bullet Graph Design Specification* — the original 2005 spec, including the
  qualitative-range and comparative-measure components used here.
  https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf
- Tableau, "Why bullet graphs pack more punch than gauge charts" — Tableau's own argument,
  including why gauges are not in the default chart list.
  https://www.tableau.com/blog/bullet-graphs-beat-gauge-charts
- Domo, "Bullet Graphs: Examples, Best Practices" — on density and the audience-familiarity
  trade-off, which is the basis of the honest counter-argument in §1.
  https://www.domo.com/learn/charts/bullet-graphs
- Cleveland & McGill's ranking of elementary perceptual tasks (position on a common scale
  above angle) is the underlying result; summarised in the Tableau piece above.

**Mix, part-to-whole and flow ribbons (§2)**

- Domo, "What Is a Marimekko Chart? Uses & Examples" — including the time-series caution
  that §2 addresses explicitly.
  https://www.domo.com/learn/charts/marimekko-chart
- Deckary, "Mekko Chart: What It Is, When to Use It" — on dual encoding of size and
  composition, and on when the width dimension is not doing work.
  https://deckary.com/mekko-chart
- ProPublica, "Untangling a Web of FEC Data" — the quadratic-Bézier construction for Sankey
  ribbons, which is the exact curve used in the §2 sketch.
  https://www.propublica.org/nerds/untangling-a-web-of-fec-data
- Umbrex, "Structural and Portfolio Charts for Market Mapping" — on Mekko area as
  "share × share" and when portfolio maps earn their complexity.
  https://umbrex.com/resources/the-busy-consultants-guide-to-quantitative-charts/structural-portfolio-and-composition-charts/

**Unit and waffle charts (§3)**

- ApexCharts 6.6 release notes, "The Unit Chart" — the clearest current statement of when a
  count should be drawn as countable marks rather than collapsed into a bar.
  https://apexcharts.com/blog/apexcharts-6-6-release/
- ApexCharts waffle-chart documentation — on grid budgets, largest-remainder rounding, and
  `unitValue` (1 mark = N units), which is the `PER_CELL` decision in §3.
  https://apexcharts.com/docs/chart-types/waffle-chart/

**Deviation, change-over-time and the general chart-selection frame (§5, §9)**

- Financial Times, *Visual Vocabulary* — the nine-category frame (deviation, change over
  time, magnitude, part-to-whole, flow…) used throughout this document; also the source for
  the connected-scatter and fan-chart guidance.
  https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md
  · PDF: https://billshander.com/dataviz/visual-vocabulary.pdf
- GIJN, "Document of the Day: Visual Vocabulary" — background on the FT frame and its
  Graphic-Continuum ancestry.
  https://gijn.org/resource/document-of-the-day-visual-vocabulary/
- Nightingale, "Beyond the Bar: Alternative Methods for Visualizing Two Points of Change" —
  dumbbell, slope and small-multiple options for exactly the Y/Y case in §5.
  https://nightingaledvs.com/beyond-the-bar-alternative-methods-for-visualizing-two-points-of-change/
- Tableau, "How to make dumbbell charts in Tableau" — the two-point gap grammar considered
  and set aside for §5 in favour of the five-period strip.
  https://www.tableau.com/blog/how-make-dumbbell-charts-tableau-60319

**Fan charts and projection uncertainty (§6)**

- Guy Abel, *fanplot: An R Package for Visualising Sequential Distributions*, R Journal —
  including the Bank of England fan-chart construction and the `anchor` idea (joining the
  fan to the last real observation), which is what §6's fan does at the H1 point.
  https://journal.r-project.org/articles/RJ-2015-002/RJ-2015-002.pdf
- fanplot package documentation — band construction and right-axis labelling.
  https://guyabel.github.io/fanplot/articles/fanplot.html
- The Bank of England's stated purpose for fan charts — "focus attention on the forecast
  distribution, rather than only on small changes to the central projection" — summarised at
  https://fanchart.readthedocs.io/en/latest/

**Small multiples, horizon charts and dense time series (rejections)**

- Heer, Kong & Agrawala, "Sizing the Horizon: The Effects of Chart Size and Layering on the
  Graphical Perception of Time Series Visualizations", CHI 2009.
  https://vis.berkeley.edu/papers/horizon/2009-TimeSeries-CHI.pdf
- Javed, McDonnel & Elmqvist, "Graphical Perception of Multiple Time Series", IEEE TVCG 2010
  — small multiples beat shared-space techniques for large visual spans, which supports
  keeping the seven-panel small-multiple layout as it is.
  https://doi.org/10.1109/TVCG.2010.162
- microcharts, horizon chart documentation — on folding requiring a key, which is the
  practical reason horizon was rejected here.
  https://microcharts.dev/docs/charts/horizon

**Flow lines, density and the aesthetic reference**

- Jenny et al., "Design and evaluation of line symbolizations for origin–destination flow
  maps" — curved flow lines, radial arrangement from a node, tapering, and drawing small
  flows over large ones.
  https://journals.sagepub.com/doi/full/10.1177/1473871616681375
- Jenny et al., "Design principles for origin-destination flow maps" (PDF).
  https://web.engr.oregonstate.edu/~zhange/images/FlowMapPaper.pdf
- Claus Wilke, *Fundamentals of Data Visualization*, ch. 7 — kernel density estimation and
  the bandwidth caution ("density plots can be misleading for data sets of only a few
  points"), which is the formal version of why §"On the flow-lines aesthetic" rejects the
  form for this data.
  https://clauswilke.com/dataviz/histograms-density-plots.html
- seaborn distributions tutorial — the `jointplot` marginal-density panel, which is the
  right-axis element in the reference image.
  https://seaborn.pydata.org/tutorial/distributions.html

**Current community practice (Tableau Public, Iron Viz, #DataFam)**

- Tableau Public, Viz of the Day — the running feed reviewed for current forms.
  https://public.tableau.com/app/discover/viz-of-the-day
- Tableau Public Discover — current featured work.
  https://public.tableau.com/app/discover
- "Iron Viz 2026: Read Between the Data" — finalists' techniques, notably network and
  lollipop grammars and single-sheet polygon construction.
  https://www.tableau.com/blog/iron-viz-2026-iron-viz-championship
- "Explore the 2026 Iron Viz Entries" — the full 122-entry qualifier field.
  https://www.tableau.com/blog/explore-2026-iron-viz-entries
- Dub Dub Data, "Iron Viz Feeder Decoded" — build techniques behind the finalist vizzes,
  including polygon-built backgrounds and dual-axis faint inner circles.
  https://www.dubdubdata.com/blog/iron-viz-feeder-decoded-design-analysis-storytelling-dub-dub
- Federico Roa Rubinstein, "Following the Swarm" — a current beeswarm on Tableau Public;
  reviewed and rejected for this board on data-shape grounds.
  https://public.tableau.com/app/profile/federico.roa.rubinstein/viz/FollowingtheSwarm/Dashboard1
- Yusra Imran, "UFO Sighting Patterns" (#VOTD) — a current radial/polar treatment of
  cyclical time; rejected here because this board has no cyclical grain.
  https://public.tableau.com/app/profile/yusra.imran/viz/UFOSightingPatterns/Dashboard
- NewDataLabs, "Sankey and Radial Chart Now Available for Testing in Tableau Public" — on
  Sankey being an operational rather than executive form, which matches the §"rejected"
  reasoning.
  https://newdatalabs.com/en/sankey-and-radial-chart-now-available-for-testing-in-tableau-public/
- Domo, "Nightingale Rose Chart: What It Is and When to Use It" — including the 20–30%
  area-misreading figure cited in the rejection table.
  https://www.domo.com/learn/charts/nightingale-rose-chart

**Waterfall / bridge decomposition (considered for the mix portlet)**

- Poesius, "Waterfall Charts for Consulting: Building Financial Bridges" — volume/price/mix
  decomposition and the MECE caution. Considered for §2 and set aside: a bridge needs
  authored driver components, and the board has only the two-segment split, so the bridge
  would have exactly two bars plus a start and an end — which is the alluvial's information
  in a less expressive form.
  https://poesius.com/blog/waterfall-charts-consulting-financial-bridges
- HiBob, "How to build a revenue bridge chart" — ARR bridge component vocabulary.
  https://www.hibob.com/financial-tools/revenue-bridge/

**Narrative and interaction technique**

- NYT Upshot, "You Draw It: What Got Better or Worse During Obama's Presidency" — the
  draw-your-guess-then-reveal mechanic. Not recommended here (an exec review is the wrong
  venue for a quiz), but it is the strongest current example of making a reader commit
  before a reveal, and it is worth knowing about for a future demo mode.
  https://www.nytimes.com/interactive/2017/01/15/us/politics/you-draw-obama-legacy.html
- FlowingData, "Draw the patterns of Obama's presidency".
  https://flowingdata.com/2017/01/17/draw-the-patterns-of-obamas-presidency/

**Internal**

- `../tableau-mcp-laulima/METHODOLOGY.md` §4.1 — the sibling app's 11 chart types and the
  reasoning for each. None of the recommendations above duplicate one of those, except the
  deliberate bullet-grammar overlap noted in §1.
- `src/charts/trendPanel.js` header comment — the flow/stock rationale, which is the
  constraint most of the tab-2 rejections above are enforcing.
- `src/palette.js` — `toneOf()`, `planTone()` and the sentiment/trust orthogonality note,
  which §1 and §5 both build on directly.
