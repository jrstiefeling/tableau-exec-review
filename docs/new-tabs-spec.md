# Three new tabs — build specification

The board goes from two tabs to five. This document specifies the three new ones so an
implementing agent can build them without making a further design decision.

| # | Tab | id | Status |
|---|---|---|---|
| 1 | Q2 Exec Summary | `exec` | exists, unchanged |
| 2 | **Analytics Performance** | `performance` | **new — this document** |
| 3 | **Performance by Segment** | `segments` | **new — this document** |
| 4 | **Q3 Outlook** | `outlook` | **new — this document** |
| 5 | Five Year Trend | `trend` | exists, unchanged, moves to last |

Constraints inherited from the app and honoured throughout: hand-placed SVG through
`src/svg.js`, animated through `src/anim.js`, no charting library, no dependencies, one
viewport per tab with nothing to scroll, every portlet carrying a `semantic` block and a
`directMode` block, and every chart honouring the `mount(host, ctx) -> { build, prime, settle }`
contract and the veil discipline in `src/portlet.js`.

---

## Contents

- [0. Read this first — the four load-bearing decisions](#0-read-this-first--the-four-load-bearing-decisions)
- [0.1 Implementation warning — three authored gaps, render them verbatim](#01-implementation-warning--three-authored-gaps-render-them-verbatim)
- [1. The growth scale, solved once](#1-the-growth-scale-solved-once)
- [2. The shared cell grammar](#2-the-shared-cell-grammar)
- [3. Hierarchy legibility — tiling versus rails](#3-hierarchy-legibility--tiling-versus-rails)
- [4. New renderers and where the code goes](#4-new-renderers-and-where-the-code-goes)
- [5. Tab 2 — Analytics Performance](#5-tab-2--analytics-performance)
- [6. Tab 3 — Performance by Segment](#6-tab-3--performance-by-segment)
- [7. Tab 4 — Q3 Outlook](#7-tab-4--q3-outlook)
- [8. Composition, breakpoints and the 1024×768 case](#8-composition-breakpoints-and-the-1024768-case)
- [9. Tab navigation at five tabs](#9-tab-navigation-at-five-tabs)
- [10. Build beats and the two-stage contract](#10-build-beats-and-the-two-stage-contract)
- [11. Forms considered and rejected](#11-forms-considered-and-rejected)
- [12. Paste-ready `board.json`](#12-paste-ready-boardjson)
- [13. Sequencing, file ownership and follow-ups](#13-sequencing-file-ownership-and-follow-ups)

---

## 0. Read this first — the four load-bearing decisions

Everything else in this document follows from these four.

**One. Dollars and growth are separate encoding channels and are never combined into an
area.** The three new tabs each carry an exact ACV figure and a rounded Y/Y rate per node.
The ACV figures roll up exactly; the rates do not roll up at all, and cannot be made to.
So every mark on these tabs states the stake and the rate as two marks that share a pivot,
never as one mark whose area is stake × rate. This is what kills marimekko, mosaic and
height-encodes-growth variants for this data — see [§11](#11-forms-considered-and-rejected).

**Two. Prior-year dollars are not recoverable and must not be authored.** Every
form that shows *change* in dollars — waterfall, bridge, variance decomposition, slope
graph, two-period alluvial — needs a prior-year value per node. Back-solving from the
rounded Y/Y does not close:

| Node | FY27 Q2 | Y/Y | implied FY26 Q2 |
|---|---|---|---|
| Analytics Total | 83 | −27% | 113.70 |
| Agentic Analytics Platform | 59 | −40% | 98.33 |
| — Tableau Cloud | 38 | −41% | 64.41 |
| — Tableau Server | 21 | −39% | 34.43 |
| Embedded Agentic Analytics | 24 | +57% | 15.29 |
| — Tableau Next | 13 | +414% | 2.53 |
| — CRMA | 11 | −15% | 12.94 |

Platform's children imply 98.84 against a parent of 98.33; Embedded's imply 15.47 against
15.29; the two motions imply 113.62 against a total of 113.70. **A derived prior year puts a
roll-up violation on a board whose entire argument is roll-up integrity.** Do not author
these values, do not compute them in a renderer, and do not build any form that needs them.
The current-quarter partition closes exactly (38+21 = 59, 13+11 = 24, 59+24 = 83), so the
part-to-whole story is available and the change-in-dollars story is not.

**Three. Tiling geometry is confined to tab 2.** A partition that tiles asserts arithmetic
closure. It closes on tab 2's All-Segments hierarchy and it does not close everywhere on
tabs 3 and 4 (see [§0.1](#01-implementation-warning--three-authored-gaps-render-them-verbatim)).
Tabs 3 and 4 therefore carry hierarchy as a **containment rail** — a structural claim about
the taxonomy — and never as a stack. This is both the correct encoding and the reason no
rounding artifact ever reaches the screen.

**Four. Marks live in SVG; every glyph of text lives in the DOM.** Each matrix is a CSS
grid of DOM cells, and each cell holds a small SVG carrying only its marks, with its own
fixed `viewBox`. Text inside a `viewBox` scales with the container, and these portlets range
from roughly 1150px wide at 1920 down to 640px at 1024 — a 1.8× span that would take a
label authored legibly at one end to about 6px at the other. `docs/attainment-encoding.md` §7
makes the same call for the same reason; this document follows it. The per-cell `viewBox` also
buys alignment for free: identical `viewBox` in identical grid columns means the growth axis
and its decade gridlines line up down every column without a measurement pass.

---

## 0.1 Implementation warning — three authored gaps, render them verbatim

**This section is for implementers only. Nothing in it may reach the screen.**

The source slides contain three internal inconsistencies. The user has decided they are
rendered faithfully as authored:

1. Analytics Total ACV is **$83M** on the segment slide and **$82M** on the existing
   `kpi-acv` / `mix-acv` / `acv-account-fan` portlets on the Exec Summary.
2. The Q3 header line states NNAOV **−41% Y/Y**; the Q3 Analytics NNAOV cell states **−43% Y/Y**.
3. Q3 NNAOV children sum to **$32M** ($8.5M + $23.5M) against a stated Analytics total of **$25.5M**.

Additionally, and this is the one with a geometric consequence: on tab 3 the four segment
columns do not always sum to the All Segments column ($39M + $18M + $12M + $15M = $84M
against $83M; Server sums to $22M against $21M; Tableau Next to $14M against $13M), and the
CMRCL column's own hierarchy does not close internally. ENTR, SMB, PubSec and All Segments
all close.

**Required behaviour:**

- Author every figure exactly as transcribed in [§12](#12-paste-ready-boardjson). Do not
  round, reconcile, average or adjust.
- **Do not** build a reconciliation callout, a warning badge, a variance chip, a tooltip
  note, a console warning, or any mark or copy that flags, annotates or draws attention to
  any of the above.
- **Do not** author a `reconciliation` block on any tab-3 or tab-4 portlet, even though
  `acv-account-fan` has one. That block is a feature on a portlet whose figures close;
  writing one here would be writing the callout.
- **Do not** use tiling or stacking geometry on tabs 3 or 4, and do not author a `total`
  field on those portlets that a renderer could divide by or sum toward. The containment-rail
  encoding specified in [§3](#3-hierarchy-legibility--tiling-versus-rails) never computes a
  residual, so it cannot surface one.
- Do not mention any of this in portlet copy, `semantic.why`, `directMode`, captions or
  `rulesCard` bodies. Draft copy in [§12](#12-paste-ready-boardjson) is written to be silent
  on it; keep it that way.

---

## 1. The growth scale, solved once

Y/Y across the three new tabs spans **−48% to +1060%** — a range of three orders of
magnitude in the positive tail with the bulk of the data packed into ±50%. A linear scale
makes every cell except Tableau Next a flat nub. Naive log cannot cross zero. The answer:

### 1.1 A symmetric log scale with a linear core at ±10%

```js
/* src/charts/growth.js
 *
 * One growth scale for the product tab, the segment tab and the outlook tab.
 *
 * Y/Y on this board runs from -48% to +1060%. Linear flattens everything that
 * is not Tableau Next; plain log cannot cross zero and cannot express "flat".
 * So: linear through the neutral band, logarithmic beyond it, with a gridline
 * at every decade so the compression is drawn rather than assumed.
 *
 * CORE is 10 on purpose. It is the same value as the softBand default in
 * palette.js toneOf(), which is the tab-2 rules card's "one stated colour
 * threshold". The linear region of this axis is therefore exactly the board's
 * stated neutral band: inside it, length is proportional and the tone is amber;
 * outside it, length compresses and the tone commits. One threshold, two
 * channels, no second rule for anybody to remember. */

export const CORE = 10;          // percent — the linear/log crossover
export const DECADES = 2.2;      // log10 span past the core -> saturates at 1585%
export const CORE_FRACTION = 0.22; // share of the half-width spent on the core

/* Signed position in [-1, 1]. Scale-free on purpose: every chart multiplies by
 * its own half-width, so the shape of the axis — which decade lands where as a
 * proportion — is identical everywhere on the board even though the pixel
 * lengths are not. */
export function growthFraction(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return null;
  const value = Number(v);
  const b = (1 - CORE_FRACTION) / DECADES;
  const m = Math.abs(value);
  const f = m <= CORE
    ? (m / CORE) * CORE_FRACTION
    : CORE_FRACTION + b * Math.log10(m / CORE);
  return Math.sign(value) * Math.min(f, 1);
}

/* True when a value saturated the axis, so the caller can draw the overflow
 * notch rather than a bar that silently stops at the edge. */
export function growthClipped(v) {
  const f = growthFraction(v);
  return f !== null && Math.abs(f) >= 1;
}

export function growthX(v, zeroX, halfWidth) {
  const f = growthFraction(v);
  return f === null ? null : zeroX + f * halfWidth;
}

/* Decade gridlines, as fractions of the half-width. Drawn in every cell. */
export const GROWTH_TICKS = [
  { at: 0,    label: "0",       kind: "zero" },
  { at: 10,   label: "±10%",    kind: "core" },
  { at: 100,  label: "±100%",   kind: "decade" },
  { at: 1000, label: "±1000%",  kind: "decade" }
];
```

Properties, all required and all satisfied: continuous at `|v| = CORE` (both branches give
`CORE_FRACTION`), strictly monotone, sign-symmetric, `f(0) = 0`, and saturating at 1585% —
comfortably past the +1060% maximum in the data, so nothing in the authored set is clipped
and the notch exists only as a guard against a future edit.

### 1.2 Where the values actually land

Fractions of half-width, and the two pixel budgets used on this board:

| Y/Y | fraction | tab 2 lane, HW = 196 | tab 3 cell, HW = 86 |
|---|---|---|---|
| −48% | −0.4615 | −90.5 | −39.7 |
| −41% | −0.4373 | −85.7 | −37.6 |
| −27% | −0.3729 | −73.1 | −32.1 |
| −15% | −0.2824 | −55.3 | −24.3 |
| −8% | −0.1760 | −34.5 | −15.1 |
| −3% | −0.0660 | −12.9 | −5.7 |
| +14% | +0.2718 | +53.3 | +23.4 |
| +32% | +0.3991 | +78.2 | +34.3 |
| +57% | +0.4880 | +95.6 | +42.0 |
| +147% | +0.6339 | +124.2 | +54.5 |
| +236% | +0.7068 | +138.5 | +60.8 |
| +414% | +0.7933 | +155.5 | +68.2 |
| +727% | +0.8800 | +172.5 | +75.7 |
| +1060% | +0.9381 | +183.9 | +80.7 |

Decade gridline fractions: `±10% → ±0.2200`, `±100% → ±0.5745`, `±1000% → ±0.9291`.

**Does it meet the brief's test?** +1060% is 48% longer than +147% and 33% longer than +236%
in the tightest budget on the board — clearly, pre-attentively different, not "both are a
lot". In the dense region −8% and −48% differ by a factor of 2.6 in length, which linear
would have rendered as 0.7px and 4px. And the two values the brief singles out as most at
risk of collapsing together, +147% and +1060%, are separated by the **±1000% gridline** as
well as by 26 units of length — the reader does not have to judge the ratio, the axis tells
them which side of a decade each one is on.

### 1.3 Non-negotiables when drawing it

1. **The decade gridlines are drawn in every cell**, faint, full cell height, at the three
   fractions above, plus the zero rule. They are the legend. A symlog axis without visible
   decade marks is a lie by omission, and this board does not get to ship one.
2. **The core band is tinted**, once, at `fill-opacity: 0.06` in `p.warn` across
   `±0.22 × HW`, and labelled `±10%` on the axis strip. It is the same region as `toneOf`'s
   amber band, and showing them as one thing is most of why this scale is defensible here.
3. **Tick labels are rendered once per portlet**, in a DOM axis strip under the leftmost
   column, not repeated in 35 cells.
4. **Every mark carries its exact rate as text** at the bar tip. The scale is for comparison;
   the numeral is for precision. Neither substitutes for the other.
5. **`null` renders as a dashed hollow square at the zero rule**, never as a zero-length bar.
   "Not measured" and "no change" are different facts and the board does not get to conflate
   them. (No authored cell in [§12](#12-paste-ready-boardjson) is null; the branch exists so a
   future edit cannot quietly lie.)
6. **One scale for three tabs.** `growthFraction` is imported, never reimplemented, so +32%
   is the same proportion of its axis on tab 2, tab 3 and tab 4. This is the board's own
   thesis applied to its own rendering: the rule lives in one place and everything downstream
   inherits it.

---

## 2. The shared cell grammar

Tabs 2, 3 and 4 all draw the same mark. Learn it once, read it everywhere.

```
                    stake dot                     growth bar          rate label
                        │                              │                   │
   ┊          ┊         ▼            ┊                 ▼                   ▼
   ┊          ┊    ╭────●────────────┊─────────────────────────────╮   +414%
   ┊          ┊    ╰─────────────────┊─────────────────────────────╯
   ┊          ┊                      ┊
 −1000%     −100%      −10%          0        +10%         +100%      +1000%
   ┊          ┊         ┊(core)      ┊       (core)┊          ┊           ┊
```

| Channel | Encodes | Mark |
|---|---|---|
| **Length from zero** | Y/Y, on `growthFraction` | rect, `height = 0.25 × cellH`, `rx: 1.5` |
| **Direction** | sign | left of the zero rule or right of it |
| **Hue** | sentiment, from `toneOf(yoy, goodDirection)` | bar fill at `fill-opacity: 0.9` |
| **Dot area** | ACV behind the rate | circle at the zero rule, `r = max(1.6, RMAX × √(value / stakeMax))` |
| **Text** | the exact rate | DOM label at the bar tip |

**Why the dot rather than bar thickness.** A dot at the pivot is area-proportional, which is
the correct perceptual mapping for a magnitude symbol, and it puts the stake exactly where
the reader's eye already is: the point the bar grows from. Encoding the stake as bar
thickness instead would produce a rectangle whose area is dollars × rate — a quantity that
means nothing and that a reader will nonetheless try to compare across cells. The dot cannot
be misread that way because nobody sums circles.

**Why √.** Area, not radius, carries the value: `r ∝ √value` makes a $52M dot exactly four
times the area of a $13M one. `RMAX` is `0.2 × cellH`.

**The floor, stated honestly.** `r` is floored at 1.6 user units. On tab 3 that floor binds
below roughly $3M, so the SMB Tableau Next ($1M) and SMB CRMA ($1M) dots are at the floor
rather than area-true. Below the floor a dot stops reading as a dot. The exact figure is one
hover and one click away for every cell, and the row's All Segments column always renders
area-true, so the reader has an unfloored reference in the same row.

**Small base versus large base, rendered.** This is the grammar's whole job. Tableau Next at
+414% on $13M is a long bar on a small dot. The Platform at −40% on $59M is a short bar on a
large dot. Both facts are simultaneously visible and neither is allowed to stand in for the
other — which is precisely what the source slide's parenthetical percentages cannot do.

### 2.1 The per-cell `viewBox`

```js
// src/charts/growth.js (continued)

/* One column gets a wide cell; two or more get a compact one. Both are 200:44
 * in spirit — the fractions are identical, only the pixel budget differs. */
export function cellBox(columnCount) {
  return columnCount === 1
    ? { w: 420, h: 48, pad: 14 }
    : { w: 200, h: 44, pad: 14 };
}

export function cellAxis(box) {
  const zeroX = box.w / 2;
  return { zeroX, halfWidth: zeroX - box.pad, midY: box.h / 2 };
}
```

`preserveAspectRatio="xMidYMid meet"` on every cell SVG. Circles stay circular, rows are
uniform height so nothing varies between them, and the decade gridlines land on identical
fractions in every cell — so they read as continuous vertical rules down the matrix even
though each is drawn inside its own SVG.

---

## 3. Hierarchy legibility — tiling versus rails

Both tab 2 and tab 3 carry the same seven-node, two-level hierarchy. Indentation alone is
not an encoding — it is a typographic hint. Two devices replace it, and which one applies is
determined by whether the arithmetic closes.

### 3.1 Tab 2 — the roll-up bar (tiling)

Where children sum to their parent exactly, **draw it**. Three stacked partition rows on one
shared dollar scale:

```
row 0   ├──────────────────────── $83M Analytics Total ────────────────────────┤
        │                                                                      │
row 1   ├──────────── $59M Agentic Platform ────────────┤── $24M Embedded ─────┤
        │                                               │                      │
row 2   ├──── $38M Cloud ────┤── $21M Server ───┤─ $13M Next ─┤── $11M CRMA ───┤
        ↑                                       ↑                              ↑
     extent tie                          carry-down tie                 extent tie
```

The roll-up is visible as three things at once, none of them typographic:

1. **The rows are the same total width.** Row 2's marks tile row 1's, which tile row 0's,
   with no gap and no overflow.
2. **The Platform│Embedded boundary at $59M recurs in row 2**, between Server and Next, and a
   hairline tie drops through the gutter connecting them. That vertical line *is* the roll-up.
3. **The boundaries at $38M and $72M have no tie**, because they are new information at
   level 2 with nothing above to carry down. The absence is as informative as the presence.

And the build animates the claim: row 0 arrives as one quantity, then the level-1 boundary
appears, then the tie visibly *descends* into level 2 as level 2's blocks grow. The reader
watches the partition inherit rather than being told it does.

### 3.2 Tabs 3 and 4 — the containment rail (no tiling)

Where the arithmetic does not close everywhere, tiling would put a residual on screen. So
hierarchy is a **bracket rail in the row-label gutter**: a vertical spine per parent spanning
its children's rows, with a short horizontal tick into each child row and into the parent
row. It is the standard tree bracket, it is a claim about the taxonomy (Cloud is inside the
Platform) rather than about arithmetic (Cloud plus Server equals the Platform), and it never
computes a residual, so it cannot surface one.

```
  Analytics Total          ─┐
  ├ Agentic Platform      ─┤──┐
  │ ├ Tableau Cloud       ───┤│
  │ └ Tableau Server      ───┤│
  ├ Embedded Agentic      ─┤──┘
    ├ Tableau Next        ───┤
    └ CRMA                ───┤
```

Rail geometry, one narrow SVG overlaying the label column:

```js
// viewBox "0 0 34 <rows.length * 100>", preserveAspectRatio="none",
// vector-effect="non-scaling-stroke" on every path so hairlines stay 1px
// under the non-uniform scale.
const rowY  = (r) => r * 100 + 50;
const railX = (level) => 8 + level * 11;     // level 0 -> 8, level 1 -> 19

// spine: from the parent's row down to its last child's row
`M ${railX(p.level)} ${rowY(p.index)} V ${rowY(lastChildIndex)}`
// tick into each child, and into the parent
`M ${railX(p.level)} ${rowY(childIndex)} H ${railX(p.level) + 7}`
```

Row labels indent by `level`: `padding-left: calc(2px + var(--level) * 13px)`, level 0 at
`11px/700` uppercase in the accent, level 1 at `11px/600` in `--ink`, level 2 at
`10.5px/500` in `--ink-soft`. The type hierarchy reinforces the rail; the rail does the work.

Also on tabs 3 and 4, the **stake dot carries the roll-up perceptually without asserting it**:
a parent's dot is visibly about the area of its two children's dots combined, because area is
proportional to dollars. Nothing claims exactness, and nothing needs to.

---

## 4. New renderers and where the code goes

Four new renderers and one shared helper module. Two existing renderers are reused unchanged.

| File | Kind | Used by |
|---|---|---|
| `src/charts/growth.js` | — (shared helpers, **not** registered in `CHARTS`) | the three below |
| `src/charts/growthMatrix.js` | `growthMatrix` | tab 2 `perf-hierarchy`, tab 3 `seg-matrix` |
| `src/charts/growthSpread.js` | `growthSpread` | tab 2 `perf-divergence`, tab 3 `seg-spread` |
| `src/charts/metricMatrix.js` | `metricMatrix` | tab 4 `outlook-matrix` |
| `src/charts/dealRail.js` | `dealRail` | tab 4 `outlook-deals` |
| `src/charts/rulesCard.js` | `rulesCard` | **reused** — tab 2 `perf-rules`, tab 3 `seg-rules` |
| `src/charts/statTile.js` | `statTile` | **reused** — tab 4's three header tiles |

`growthMatrix` serves both tab 2 and tab 3 from one file: it renders `metrics.segments.length`
columns, and draws the roll-up bar of [§3.1](#31-tab-2--the-roll-up-bar-tiling) only when
`metrics.rollup` is authored. Tab 2 authors one segment column plus a `rollup` block; tab 3
authors five segment columns and no `rollup`. That is the codebase's stated philosophy —
"changing how a metric is drawn is a one-word edit to `kind`" — applied to two tabs that are
the same grammar at two widths.

`growth.js` deliberately does **not** live in `src/svg.js` alongside `linearScale`. Three new
tabs sharing one new file is a smaller surface than editing a module every existing chart
imports, and it keeps the scale next to the only charts that use it.

Registration in `src/charts/index.js`:

```js
import { mount as growthMatrix } from "./growthMatrix.js";
import { mount as growthSpread } from "./growthSpread.js";
import { mount as metricMatrix } from "./metricMatrix.js";
import { mount as dealRail } from "./dealRail.js";

export const CHARTS = {
  gauge, mixBar, statTile, cardRail, trendPanel, driverRail, rulesCard,
  growthMatrix, growthSpread, metricMatrix, dealRail
};
```

> **Merge note.** `data/board.json` already authors `kind: "movementFan"` on
> `acv-account-fan`, and `CHARTS` does not yet contain it — another agent is landing that
> renderer. Add the four entries above **without** removing or reordering anything, and
> expect `movementFan` to appear in the same object.

---

## 5. Tab 2 — Analytics Performance

**Tab header.** `kicker: "Q2 FY27 · All segments"`,
`headline: "A shrinking platform base and one line growing off almost nothing"`,
`accent: "#1C6E8C"` (the certified-ACV accent, matching `kpi-acv` and `trend-acv`).

### 5.1 Band layout

```
┌───────────────────────────────────────────────────────┬──────────────────────┐
│                                                       │  perf-divergence     │
│  perf-hierarchy                                       │  (growthSpread)      │
│  roll-up bar + growth lane                            │                      │
│  2.35fr                                               ├──────────────────────┤
│                                                       │  perf-rules          │
│                                                       │  (rulesCard)         │
└───────────────────────────────────────────────────────┴──────────────────────┘
```

Two bands as two columns, mirroring the `trend` tab's shape so the board keeps one layout
vocabulary:

```css
/* styles/tabs.css */
.panel[data-tab="performance"] .panel-bands {
  grid-template-columns: minmax(0, 2.35fr) minmax(232px, 1fr);
  grid-template-rows: minmax(0, 1fr);
}
.band[data-layout="perf-main"] { grid-template-rows: minmax(0, 1fr); }
.band[data-layout="perf-side"] { grid-template-rows: minmax(0, 1.05fr) minmax(0, 1fr); }
```

At 1920 the main portlet is ~1080 × ~600. At 1024 it is ~560 × ~430. At 1024×768 it is
~560 × ~380 — the single-band-row layout means the whole reclaimed height goes to the
hierarchy, which is the one portlet on this tab that wants it.

### 5.2 `perf-hierarchy` — the roll-up bar and growth lane

**Recommended form:** a horizontal three-level roll-up bar (a partition/icicle laid on its
side) stacked above a seven-row diverging growth lane on the symmetric-log scale, with a
containment rail and indented labels in the gutter.

**Why this form.** The data is a two-level part-to-whole hierarchy in which children sum to
parents exactly, paired with growth rates that span three orders of magnitude and do not sum
to anything. Those are two different shapes and they need two panels, sharing a horizontal
axis direction but not a scale:

- The partition is the only form that renders "children tile their parent" as geometry rather
  than as a claim, and roll-up integrity is the semantic layer's whole value proposition. A
  reader can see the $59M boundary recur one level down. Nothing else on the board makes that
  visible.
- The growth lane is the only place the −40%-against-+414% comparison can be honest, because
  it puts both on one axis with visible decades and pins each to its stake.
- Stacking them vertically means neither implies a scale for the other. If the lane were
  aligned to the partition's dollar bands, its bar thicknesses would be forced to encode
  dollars a second time, which is exactly the area confusion [§0](#0-read-this-first--the-four-load-bearing-decisions)
  rules out — and the four leaf bands (145, 80, 50, 42 user units at portlet scale) would have
  to be clipped to a legible bar height anyway, at which point the alignment buys nothing.

**Rejected for this portlet:** treemap (a two-rectangle split is a stacked bar with extra
steps, and nesting to seven cells at this size makes Tableau Next unlabellable), sunburst
(angle for a ranking judgement, and the board already argues against angle in
`docs/attainment-encoding.md` §2), waterfall (needs prior-year dollars — see
[§0](#0-read-this-first--the-four-load-bearing-decisions)), marimekko (area = stake × rate).

#### Geometry — the roll-up bar

One SVG, `viewBox="0 0 420 96"`, `preserveAspectRatio="none"`,
`vector-effect="non-scaling-stroke"` on all ties. It is a grid item in the same column as the
lane cells, so horizontal alignment with the growth column is free.

```js
const ROLL = { w: 420, h: 96, rowH: 20, rows: [6, 38, 70] };
const xOf = (dollars) => (dollars / metrics.rollup.total) * ROLL.w;   // total = 83
```

| Level | Node | x | width |
|---|---|---|---|
| 0 | Analytics Total | 0 | 420.00 |
| 1 | Agentic Analytics Platform | 0 | 298.55 |
| 1 | Embedded Agentic Analytics | 298.55 | 121.45 |
| 2 | Tableau Cloud | 0 | 192.29 |
| 2 | Tableau Server | 192.29 | 106.27 |
| 2 | Tableau Next | 298.55 | 65.78 |
| 2 | CRMA | 364.34 | 55.66 |

Ties, drawn as hairlines in the two 12-unit gutters between rows:

| Tie | `d` | Says |
|---|---|---|
| left extent | `M 0 26 V 38` and `M 0 58 V 70` | every level starts at the same place |
| right extent | `M 420 26 V 38` and `M 420 58 V 70` | every level ends at the same place |
| carry-down | `M 298.55 58 V 70` | the level-1 boundary is also a level-2 boundary |

No tie at `x = 192.29` or `x = 364.34`. Those boundaries are introduced at level 2.

Block fills come from each node's authored `color`, at `fill-opacity: 0.86`, `rx: 2`, with a
`stroke: var(--surface-solid)` hairline at `stroke-width: 1` so adjacent blocks read as
distinct without a gap that would break the tiling. Each block ≥ 46 units wide carries a DOM
label overlay (`$38M`); narrower blocks label on hover only. CRMA at 55.66 and Tableau Next at
65.78 both clear the threshold.

#### Geometry — the growth lane

A CSS grid, one column of cells (`columnCount = 1`, so `cellBox(1)` → 420 × 48, `zeroX = 210`,
`halfWidth = 196`):

```
grid-template-columns: [rail] 34px [label] minmax(112px, auto) [value] 56px [cell] minmax(0, 1fr);
grid-auto-rows: minmax(34px, 1fr);
```

Seven rows in slide order: Analytics Total, Agentic Analytics Platform, Tableau Cloud,
Tableau Server, Embedded Agentic Analytics, Tableau Next, CRMA. Per row: containment rail
(one SVG spanning all seven rows in the `rail` column), indented label, right-aligned ACV
display, and the cell SVG.

Per-cell marks, in draw order:

```js
const box  = cellBox(1);                       // { w: 420, h: 48, pad: 14 }
const ax   = cellAxis(box);                    // { zeroX: 210, halfWidth: 196, midY: 24 }
const BAR_H  = box.h * 0.25;                   // 12
const RMAX   = box.h * 0.2;                    // 9.6

// 1. core band  — ±10%, the stated neutral region
svgEl("rect", { x: ax.zeroX - 0.22 * ax.halfWidth, y: 0,
                width: 0.44 * ax.halfWidth, height: box.h,
                fill: p.warn, "fill-opacity": 0.06, class: "growth-core" });

// 2. decade gridlines at ±0.5745 and ±0.9291 of the half-width
[0.5745, 0.9291].forEach((f) => [-1, 1].forEach((s) => {
  svgEl("path", { d: `M ${ax.zeroX + s * f * ax.halfWidth} 2 V ${box.h - 2}`,
                  stroke: p.axis, "stroke-opacity": 0.5, "stroke-width": 1,
                  "stroke-dasharray": "1.5 3", class: "growth-decade" });
}));

// 3. zero rule — ink, the darkest and thinnest mark in the cell
svgEl("path", { d: `M ${ax.zeroX} 0 V ${box.h}`, stroke: p.ink,
                "stroke-opacity": 0.5, "stroke-width": 1.2, class: "growth-zero" });

// 4. growth bar
const gx = growthX(row.yoy, ax.zeroX, ax.halfWidth);
svgEl("rect", { x: Math.min(ax.zeroX, gx), y: ax.midY - BAR_H / 2,
                width: Math.abs(gx - ax.zeroX), height: BAR_H, rx: 1.5,
                fill: isDirect ? meta.color : toneColor(toneOf(row.yoy, good)),
                "fill-opacity": 0.9, class: "growth-bar" });

// 5. stake dot — hollow, so the bar reads through it
svgEl("circle", { cx: ax.zeroX, cy: ax.midY,
                  r: Math.max(1.6, RMAX * Math.sqrt(row.value / metrics.stakeMax)),
                  fill: p.surface, stroke: isDirect ? meta.color : row.color,
                  "stroke-width": 1.6, class: "growth-stake" });

// 6. overflow notch, only when growthClipped(row.yoy)
```

The rate label is a DOM span absolutely positioned inside the cell at
`left: calc(50% + <fraction> * 50% - 7%)`, `11px/700`, tinted `toneColor(toneOf(...))`,
anchored away from zero. It is DOM because it is text.

**Axis strip.** One DOM row beneath the lane, `10px/600` in `--ink-dim`, with
`−1000% · −100% · −10% · 0 · +10% · +100% · +1000%` positioned at the same fractions, and the
caption `Y/Y — linear inside ±10%, one decade per gridline beyond it`. This is the legend and
it is not optional.

**Progressive disclosure.** A `.portlet-detail` div holding one `class="trend-table"` table:
row label, ACV, Y/Y. Revealed by the existing expand control, which the portlet head already
provides and `portlet.js` already wires (`data-has-detail` is set from
`this.body.querySelector(".portlet-detail")`). No new interaction.

**Field bindings.** `metrics.rollup.{total, totalDisplay, levels[]}`, `metrics.segments` (one
entry), `metrics.stakeMax`, `metrics.rows[].{id, label, level, parent, value, display, yoy,
yoyDisplay, goodDirection, color}`, `metrics.caption`, `metrics.axisNote`.

#### Degraded-mode variant

`tier: red`. Without the product taxonomy there is no hierarchy to draw:

- The roll-up bar renders **level 0 only** — one undifferentiated block, no boundaries, no
  ties, `stroke-dasharray: "4 7"` on its outline, in the tier colour.
- The lane renders **one row** (Analytics Total). The six child rows render as **hollow
  sockets**: a dashed 7×7 outlined square at the zero rule, no bar, no stake dot, label
  struck with `<s class="strike strike-red">`.
- The containment rail renders **severed** — spines drawn to the gutter midpoint and stopped,
  with a `✕` in the gap, reusing the `lineage-arrow[data-broken]` vocabulary already in
  `portlet.js`.

Driven entirely by the existing merge semantics: `directMode.metrics.rows` is authored as a
one-element array, which `applyDirectOverrides` replaces outright, and
`directMode.metrics.rollup.levels` likewise. The renderer needs one branch
(`isDirect && tier === "red"`) for the sockets — the same shape `mixBar.js` already uses for
`splitAvailable`.

### 5.3 `perf-divergence` — within-line dispersion

**Recommended form:** two dumbbells (paired dots joined by a stem) on the same symmetric-log
growth axis, one per motion, spanning that motion's slowest to fastest product line, with a
caret at the motion's own rate.

**Why.** The user's stated reading is that Embedded's two children diverge sharply
(+414% against −15%) while the Platform's move together (−41%, −39%). A dumbbell encodes
exactly that: the mark *is* the spread. Platform's is a 2-point stub; Embedded's crosses the
zero rule and runs most of the axis. Side by side, in the same units, the contrast is the
whole portlet and it needs no sentence. A dumbbell also cannot be misread as a magnitude,
which a grouped bar pair can.

**Rejected:** slope graph (needs prior-year values), box plot (two observations is not a
distribution), grouped bars (states the two rates and not the gap, which is the finding).

**Geometry.** `viewBox="0 0 300 44"` per row, `preserveAspectRatio="xMidYMid meet"`,
`zeroX = 150`, `halfWidth = 136`. Per row: core band, decade gridlines and zero rule as in
[§5.2](#52-perf-hierarchy--the-roll-up-bar-and-growth-lane); a stem
`M growthX(low) 22 H growthX(high)` at `stroke-width: 2.2` in `p.inkSoft` at 0.55 opacity; a
hollow dot at `low` (`r: 4`, `fill: p.surface`, `stroke: toneColor(toneOf(low, good))`,
`stroke-width: 2`); a filled dot at `high` (`r: 4.4`, `fill: toneColor(toneOf(high, good))`);
and a 5-unit hollow caret (`M x 8 L x+3.4 3 L x-3.4 3 Z`) at the parent's own rate in
`p.ghost`. End labels are DOM, `10px/600`, above each dot.

**Degraded mode.** `tier: red`. The motion-to-line parentage is what defines "inside each
motion", so the two rows collapse to one severed row: the stem renders as two stubs reaching
toward each other and stopping, with `✕` in the gap. Same vocabulary as the graph overlay's
broken measure edges.

### 5.4 `perf-rules` — how these tabs read

`kind: "rulesCard"`, reused verbatim. Four rules, full text in
[§12](#12-paste-ready-boardjson). It states the roll-up-is-geometry rule, the
separate-channels rule, the symlog scale and the stake dot — so the grammar the three new
tabs share is declared once, in the same idiom as the trend tab's "How this tab reads" card.
Nothing new to build.

---

## 6. Tab 3 — Performance by Segment

**Tab header.** `kicker: "Q2 FY27 · Four segments"`,
`headline: "One segment growing, and Embedded growing in all four"`, `accent: "#2F5FA8"`.

### 6.1 Band layout

```
┌──────────────────────────────────────────────────────┬───────────────────────┐
│                                                      │  seg-spread           │
│  seg-matrix                                          │  (growthSpread)       │
│  7 rows × 5 segments                                 │  5 rows               │
│  2.6fr                                               ├───────────────────────┤
│                                                      │  seg-rules            │
│                                                      │  (rulesCard)          │
└──────────────────────────────────────────────────────┴───────────────────────┘
```

```css
.panel[data-tab="segments"] .panel-bands {
  grid-template-columns: minmax(0, 2.6fr) minmax(224px, 1fr);
  grid-template-rows: minmax(0, 1fr);
}
.band[data-layout="seg-main"] { grid-template-rows: minmax(0, 1fr); }
.band[data-layout="seg-side"] { grid-template-rows: minmax(0, 1.25fr) minmax(0, 1fr); }
```

Deliberately the same two-column shape as tab 2, so tabs 2 and 3 read as one argument at two
grains rather than two unrelated compositions.

### 6.2 `seg-matrix` — the stake-weighted growth matrix

**Recommended form:** a 7 × 5 matrix of the [§2](#2-the-shared-cell-grammar) cell — a heatmap
matrix with an embedded mark in every cell rather than colour alone — with the containment
rail carrying the hierarchy, decade gridlines running down every column, and the 70 exact
figures behind the existing expand control.

**Why this form, and how it keeps 70 numbers legible.** Seven rows by five columns with two
figures per cell is 70 numbers, and a plain table would render all 70 and communicate none of
them. The answer is not to remove numbers, it is to give each number the right job:

1. **Y/Y gets the comparison channel.** 35 diverging bars on one symlog axis, all sharing
   decade gridlines, so the reader ranks any two cells by length without reading a digit.
   Reading across a row answers "does this move everywhere?" — Embedded's row is five bars all
   pointing right. Reading down a column answers "what is happening in this segment?" — the
   PubSec column is the only one whose top bar points right.
2. **ACV gets the magnitude channel.** 35 stake dots, area-proportional, at the pivot. The
   reader sees where the money is without a second grid of numbers.
3. **Colour gets sentiment only.** `toneOf(yoy, "up")`, one stated threshold, inherited.
4. **The exact figures get text, on demand.** Every cell carries a tooltip via `ctx.tip`
   (`ENTR · Tableau Cloud · $16M · −48% Y/Y`), and the expand control reveals two
   `trend-table` tables — one of ACV, one of Y/Y, each 7 rows × 5 columns. Two tables rather
   than one eleven-column table because eleven columns in an 860px inspector is 78px per
   column and unreadable, and because separating the exact channel makes the same point the
   chart does.

That is the whole trade: nothing in a cell needs to be read to use the matrix, and nothing is
lost, because the board already has a click-to-expand disclosure pattern and this reuses it
rather than inventing a second one. `portlet.js` wires the expand control from the presence of
a `.portlet-detail` node; `inspector.js` moves the live element so a mid-build chart keeps
animating; `portlets.css` already reveals `.portlet-detail` on
`.portlet.is-inspected:not(.is-flipped)`. Zero new interaction, zero new CSS.

**Rejected:** a numbers-in-cells heatmap (colour cannot rank +147% against +1060%, and 70
numerals at 9px is a table that has been coloured in), treemap-per-segment (five treemaps
compares areas across five frames, which is the one thing treemaps are worst at), small
multiple line charts per cell (two periods is not a trajectory, and the prior-year dollars do
not exist), one bar chart per segment stacked to $83M (tiling, forbidden by
[§0.1](#01-implementation-warning--three-authored-gaps-render-them-verbatim)).

**Geometry.** CSS grid:

```
grid-template-columns: [rail] 34px [label] minmax(104px, 132px) repeat(5, minmax(0, 1fr));
grid-template-rows: [head] 22px repeat(7, minmax(30px, 1fr)) [axis] 26px;
column-gap: 8px;
```

`columnCount = 5`, so `cellBox(5)` → 200 × 44, `zeroX = 100`, `halfWidth = 86`,
`BAR_H = 11`, `RMAX = 8.8`, `stakeMax = 83`. Marks exactly as
[§5.2](#52-perf-hierarchy--the-roll-up-bar-and-growth-lane), one SVG per cell.

**Column headers** are DOM, `10px/700` uppercase in `--ink-dim`, centred; the All Segments
header is tinted in the tab accent because it is the reference column, not a fifth peer.

**The rate label problem at five columns.** 35 rate labels at 9.5px inside 5 columns of
~150px will collide with bars and each other. Resolution: rate labels render **only in the
All Segments column** at rest; the other four columns show the mark alone and surface the
figure on hover and in the expand table. This is the one place precision is deferred rather
than merely relocated, and it is the right call — the four segment columns exist to be
compared to each other and to the reference column, which is a length judgement, and 28
numerals would fight the marks that are doing that work. State it in the caption:
`Exact figures on hover, or expand for the full grid.`

**Axis strip** in the `axis` row, spanning the five column tracks, with tick labels under the
All Segments column only. The decade gridlines run down all five columns, so they read as
continuous rules and locate every cell without repeating the labels.

**Field bindings.** `metrics.segments[].{id, label, short, reference}`, `metrics.stakeMax`,
`metrics.rows[].{id, label, level, parent, color, goodDirection, values[], display[], yoy[],
yoyDisplay[]}` — parallel arrays indexed against `segments`, exactly the convention
`trendPanel` uses for `periods` / `series` / `display` / `yoy`.

**Degraded-mode variant.** `tier: red`. All 35 cells still render — that is the point, and it
is the most uncomfortable version of the argument. What changes:

- Column headers struck with `<s class="strike strike-red">`, because there is no certified
  segment dimension for them to name.
- The containment rail renders **severed**, spines stopping mid-gutter with `✕`.
- Stake dots go **dashed** (`stroke-dasharray: "2 2.5"`), because ACV has four candidate
  Amount columns and the stake is as contested as the rate.
- Bars keep their lengths and lose their sentiment: fill becomes `meta.color`, so the matrix
  is still a matrix and has stopped saying which way is good.

No new authoring beyond `directMode.metrics` overrides for caption and axis note. The
board's existing `isDirect` conventions carry the rest.

### 6.3 `seg-spread` — within-segment dispersion

`kind: "growthSpread"`, the same renderer as
[§5.3](#53-perf-divergence--within-line-dispersion), five rows instead of two: the interval
from each segment's slowest product line to its fastest.

| Row | low | high | span |
|---|---|---|---|
| All Segments | Tableau Cloud −41% | Tableau Next +414% | reference |
| ENTR | Tableau Cloud / Server −48% | Tableau Next +402% | wide |
| CMRCL | Tableau Cloud −42% | Tableau Next +236% | narrowest |
| SMB | Tableau Server −45% | Tableau Next +727% | widest below PubSec |
| PubSec | Tableau Cloud −16% | Tableau Next +1060% | the full axis |

This is where the user's third stated reading lives: SMB's Platform at −34% against its
Tableau Next at +727% is the most extreme swing on the slide, and here it is a single mark
whose length is that swing. PubSec's row reaches the ±1000% gridline, which is also the
clearest demonstration on the board that the axis is logarithmic and labelled.

Where two lines tie at the low end (ENTR: Cloud and Server both −48%), the low label is
authored as `Cloud & Server` — the tie is authored, not resolved.

### 6.4 `seg-rules` — how this matrix reads

`kind: "rulesCard"`, reused. Four rules covering the shared measure, containment-as-rail,
progressive disclosure, and one-scale-across-three-tabs. Full text in
[§12](#12-paste-ready-boardjson).

Two `rulesCard` portlets across tabs 2 and 3 is deliberate, not duplication: tab 2's card
declares the grammar (roll-up, channels, scale, stake) and tab 3's declares how the densest
tab on the board discloses precision. The trend tab already establishes the idiom, so a
reader arriving on either new tab finds the rules in the place the board has taught them to
look.

---

## 7. Tab 4 — Q3 Outlook

**Tab header.** `kicker: "Q3 FY27 outlook"`,
`headline: "Q3 tracks to $105M with attrition running 20% ahead of last year"`,
`accent: "#92640A"`.

### 7.1 Band layout

Three bands, laid out as the source slide is: a header strip and a matrix in the left column,
and a full-height deals rail on the right. Same two-column-with-a-spanning-rail idea as the
trend tab, one row deeper.

```
┌───────────────────────────────────────────────────────┬──────────────────────┐
│ outlook-acv    │ outlook-attrition │ outlook-nnaov    │                      │
│ (statTile)     │ (statTile)        │ (statTile)       │  outlook-deals       │
├───────────────────────────────────────────────────────┤  (dealRail)          │
│                                                       │                      │
│  outlook-matrix        3 rows × 3 metrics             │  spans both rows     │
│  (metricMatrix)                                       │                      │
└───────────────────────────────────────────────────────┴──────────────────────┘
```

```css
.panel[data-tab="outlook"] .panel-bands {
  grid-template-columns: minmax(0, 1fr) minmax(176px, 0.235fr);
  grid-template-rows: minmax(0, 0.34fr) minmax(0, 1fr);
}
.band[data-layout="outlook-head"] {
  grid-column: 1; grid-row: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.band[data-layout="outlook-matrix"] { grid-column: 1; grid-row: 2; }
.band[data-layout="outlook-deals"]  { grid-column: 2; grid-row: 1 / -1; }
```

### 7.2 The three header tiles

`kind: "statTile"`, reused unchanged, three times: ACV `$105M / −6% Y/Y`, Attrition
`$79.5M / +20% Y/Y` with `goodDirection: "down"`, NNAOV `$25.5M / −41% Y/Y`.

`statTile` exists precisely for "a metric with no plan to be measured against", it already
carries a polarity-tinted delta chip and a centre-anchored delta bar, and it already handles
`scramble` over `directMode.candidates`. Nothing to build.

These three tiles are also where tab 4's **knowledge-graph edges live**, because each carries
exactly one `semantic.measure` (`ACV (certified)`, `Attrition ACV (certified)`,
`NNAOV (certified)`) — the same certified measures as `kpi-acv`, `kpi-attrition`, `kpi-nnaov`
on the exec tab and `trend-acv`, `trend-attrition`, `trend-nnaov` on the trend tab. Turn the
graph on and the Q3 outlook, the Q2 actual and the five-year row link as one definition across
three tabs. That is the strongest edge the five-tab board can draw and it comes free from
authoring the measure names correctly.

### 7.3 `outlook-matrix` — the multi-value cell matrix

**Recommended form:** a 3 × 3 matrix of composed metric cells — each a bullet-style row
carrying a hero numeral, a diverging Y/Y stub on the shared growth scale, a FinPlan
attainment bullet, and paired-dot dumbbells for Velocity and Coverage — with the containment
rail from [§3.2](#32-tabs-3-and-4--the-containment-rail-no-tiling) on the rows.

**Why.** Tab 4's cells are not one number each; the ACV cells carry up to six facts. The
grammar that handles "a value, a comparison, a target and a benchmark in one row" is the
bullet, and `docs/attainment-encoding.md` has already specified that grammar for this board in
detail. This portlet reuses it at cell scale rather than inventing a second target encoding.
The two-value-per-cell shapes — Velocity 15% against 17% historical, Coverage 2.6× against
2.7× — are paired comparisons, and a paired comparison deserves a mark. Parenthetical text
asks the reader to do the subtraction; a dumbbell shows them the gap and its direction.

**Rejected:** small-multiple bars per cell (nine bars in three unrelated units — dollars,
percent-of-plan, multiples — with no shared scale), radar per row (three arbitrary axes, and
the axis order changes the shape), a nine-cell heatmap (colour cannot carry six facts), one
row of nine KPI tiles (loses the row/column structure that is the slide's whole organisation).

#### Cell anatomy and visual hierarchy

Five ranks. Each is subordinate to the one above it by size *and* by kind of channel, so the
ordering survives a squint.

| Rank | Fact | Treatment | Why here |
|---|---|---|---|
| 1 | the value | DOM, `clamp(17px, 1.5vw, 23px)`, serif display, `--ink`, `countUp` | the answer to "what is Q3 tracking to". No graphical encoding: three measures at three magnitudes are not commensurable and any shared scale would assert something false. |
| 2 | Y/Y | DOM chip `11px/700` tinted `toneOf(yoy, goodDirection)`, plus a diverging stub on the shared growth axis, `viewBox="0 0 132 18"`, `zeroX = 66`, `halfWidth = 54` | the answer to "which way". On the same scale as tabs 2 and 3, so +32% here is the same proportion of its axis as +32% there. |
| 3 | FinPlan attainment | a micro bullet, `viewBox="0 0 148 22"`, domain `[0, 120]`, `planBands()` regions, ink target tick at 100, `planTone` fill, plus `9.5px/600` label | the answer to "is that a problem". Geometry, per `docs/attainment-encoding.md` §5. ACV cells only. |
| 4 | Velocity, Coverage | two dumbbells, `viewBox="0 0 148 14"` each: hollow dot = historical, filled dot = current, stem tinted by the direction of change | paired comparisons. A mark, not a parenthesis. ACV cells only. |
| 5 | week-over-week note | DOM `9px/500` in `--ink-dim`, bottom-right | authored footnote. Present on two cells only, and its rarity is informative. |

Attrition and NNAOV cells carry ranks 1, 2 and 5 only, so they are visibly lighter than the
ACV column — which correctly says fewer facts are known about them. Do not pad them.

#### The FinPlan bullet, reusing the established grammar

`docs/attainment-encoding.md` specifies the attainment bullet for the exec tab's KPI cards:
domain `[0, 120]`, `planBands(good)` exported from `palette.js` and derived from the same
`PLAN_THRESHOLDS` constants `planTone()` reads, an ink target tick standing proud of the
bands, a dashed reach-to-plan trace below 100%, an overrun cap above it, and
`notchedCapPath()` past 120. **Import and reuse all of it.** Three consequences here:

- **87%** (Analytics) and **78%** (Platform) draw a bar to `x(87)` / `x(78)` with a dashed
  reach-to-plan trace to the tick — 78% sits inside the ruled risk band, 87% in warn.
- **128%** (Embedded) exceeds the 120 domain end, so it takes `notchedCapPath()` — the one
  authored value on the board that exercises that branch. Verify it renders.
- All three are `planGoodDirection: "up"`, so the bands are not mirrored on this tab. The
  mirror is still correct code; nothing on tab 4 triggers it.

If `attainment.js` and its `planBands` / `PLAN_THRESHOLDS` prerequisite have not landed yet,
`metricMatrix` must not fork a second copy of the thresholds. Land that doc's §12 prerequisite
first, or gate the bullet behind `metrics.rows[].cells[].plan != null` and ship the rest.

#### The paired dumbbell

```js
// viewBox "0 0 148 14", two stacked, one for Velocity and one for Coverage.
const px = linearScale([0, pair.domainMax], [16, 132]);   // 25 for %, 4 for ×
const dh = px(pair.hist), dc = px(pair.value);
const better = pair.goodDirection === "down" ? dc < dh : dc > dh;

// stem — direction of change, ink when flat
svgEl("path", { d: `M ${Math.min(dh, dc)} 7 H ${Math.max(dh, dc)}`,
                stroke: dh === dc ? p.ghost : toneColor(better ? "positive" : "risk"),
                "stroke-width": 2, "stroke-linecap": "round", class: "pair-stem" });
// historical — hollow, because it is the benchmark and not the reading
svgEl("circle", { cx: dh, cy: 7, r: 3.4, fill: p.surface,
                  stroke: p.inkDim, "stroke-width": 1.5, class: "pair-hist" });
// current — filled
svgEl("circle", { cx: dc, cy: 7, r: 3.8,
                  fill: dh === dc ? p.inkSoft : toneColor(better ? "positive" : "risk"),
                  class: "pair-now" });
```

**The flat case is a case.** Embedded's Velocity is 16% against a 16% historical benchmark.
The two dots coincide, so the mark is drawn as a filled dot inside a hollow ring with no stem
and the label reads `16% · flat on history`. "Equal" is a real finding on a benchmark
comparison and must not render as a rendering failure. Coverage on that row is 3.2× against
2.8× and does have a stem.

Labels are DOM: `Velocity 15%` in `--ink`, `17% hist` in `--ink-dim`, in the source slide's
own vocabulary.

#### The OU roll-up alternate basis

Two Analytics cells carry a second stated basis: ACV `OU Roll-up: $100M, −10% Y/Y` and
Attrition `*OU Roll-up: $88.9M, 34% Y/Y`, asterisk included and authored verbatim.

Render as a **ghost mark**, reusing the run-rate-ghost vocabulary from `trendPanel.js`: a
dashed hollow tick on the *same* Y/Y stub axis at `growthX(altBasis.yoy)`, in `p.ghost`, with
the value as a `9.5px/500` DOM secondary numeral prefixed by the authored label. It is a
second stated basis for the same measure, drawn the way the board already draws a second
stated basis. It is not a discrepancy marker and must carry no badge, no colour and no
comparison arrow — the two ticks sit on one axis and the reader can see them.

#### Geometry summary

```
grid-template-columns: [rail] 30px [label] minmax(128px, 168px) repeat(3, minmax(0, 1fr));
grid-template-rows: [head] 24px repeat(3, minmax(96px, 1fr));
column-gap: 10px; row-gap: 8px;
```

Rows: Analytics (level 0), Agentic Analytics Platform (level 1, sublabel `Cloud + Server`),
Embedded Agentic Analytics (level 1, sublabel `Tableau Next + CRMA`). Containment rail spans
the three rows in the `rail` column. Columns: ACV, Attrition (`goodDirection: "down"`), NNAOV.

**Field bindings.** `metrics.columns[].{id, label, goodDirection}`,
`metrics.rows[].{id, label, sublabel, level, parent, cells[]}`, and per cell
`{ display, value, yoy, yoyDisplay, plan, planDisplay, planGoodDirection, altBasis: {label,
display, yoy, yoyDisplay}, pairs: [{label, value, valueDisplay, hist, histDisplay, domainMax,
unit, goodDirection}], note }`. Every field optional except `display` and `yoy`, and an absent
field renders as absent — never as zero and never as a placeholder.

#### Degraded-mode variant

`tier: red`, and it is the most legible degradation on the board because three separate things
break in three visibly different ways:

- **The bullets lose their denominator.** No target tick, no bands: an empty dashed track and
  the label `no plan basis`. `attainment.js` already has this branch (`barIsVoid` for red and
  grey tiers); reuse it rather than adding one.
- **The dumbbells lose their benchmark.** The historical dot renders as a dashed ring at the
  axis origin with a `✕` between it and the current dot — the severed-link vocabulary again.
  `hist` is a governed same-day-of-quarter comparison against the prior period, not last
  year's closing number, so without the semantic layer there is nothing for the hollow dot to
  be.
- **The numerals stop settling.** `scramble` over `directMode.candidates`, exactly as
  `gauge.js` and `statTile.js` do, because a Q3 outlook figure is closed-won plus weighted
  in-quarter pipeline and the weighting is the contested part.

The Y/Y stubs keep their lengths and lose their tone, so the matrix still renders and has
stopped telling anyone which way is good.

### 7.4 `outlook-deals` — the top-deal rail

**Recommended form:** five ranked rows, each a lollipop on a shared zero-based linear
dollar scale, in authored order.

**Why linear here and not symlog.** These are five comparable magnitudes in one unit spanning
$2.1M to $3M — a 1.4× range with no polarity and no rate. Linear from zero is correct, and
using the growth scale would be applying a rule where its problem does not exist. The board
gets to have two scales as long as each is the right one and each is stated.

**Two ties are authored** — Bank of America and Aetna both at $3M, US Bank and US GOV both at
$2.1M. Tied rows must render at **identical length**. No jitter, no epsilon, no tiebreak
reordering: the order is authored and the equality is a fact.

**Geometry.** Pure DOM, no SVG — the rail is five bars and `growFrom` animates DOM elements
already (`mixBar.js` uses it on `.mix-seg` spans). Each row: account name `11px/600`, value
`11px/700` tabular right-aligned, and a track holding a fill at
`width: calc(var(--deal-value) / 3.2 * 100%)` with a 3.4px dot at the tip. Accent colour, not
sentiment — a deal size has no direction of good. Footer chip: `$12.5M across five deals`,
authored, not summed in the renderer.

**Degraded mode.** `tier: yellow` — workable but ungoverned, and the tier that never earns a
`✕`. The five accounts survive; the ranking does not, because $2.3M and $2.1M are inside the
spread between four candidate Amount columns. Render: the rank chips removed, the bar tips
`stroke-dasharray`-capped, and the authored note in place of the footer. This is a genuinely
different degradation from every other portlet on the board — the content is intact and the
*ordering* is what became indefensible.

---

## 8. Composition, breakpoints and the 1024×768 case

Nothing scrolls on any of the three tabs at any supported size.

### 8.1 Height budget at 1024 × 768

Measured against the existing `@media (max-height: 860px)` reclaim in `styles/tabs.css`, which
already tightens the topbar, status bar, panel inset and gaps:

| Consumer | px |
|---|---|
| topbar | 46 |
| panel inset (top + bottom) | 18 |
| panel head (kicker + headline at the reduced clamp) | 34 |
| panel gap | 8 |
| status bar | 26 |
| **available to bands** | **~636** |

Tabs 2 and 3 are a single band row, so all ~636px goes to one grid row. Tab 4 splits it
`0.34fr / 1fr` → header band ~154px, matrix band ~456px, deals rail ~618px full height.

Per-portlet minimums, and where the slack is:

| Portlet | needs | has at 768 | note |
|---|---|---|---|
| `perf-hierarchy` | 96 (roll-up) + 7 × 34 (lane) + 26 (axis) + 44 (head/caption) = **404** | ~620 | comfortable |
| `seg-matrix` | 22 (head) + 7 × 30 (rows) + 26 (axis) + 44 = **302** | ~620 | comfortable |
| `outlook-matrix` | 24 (head) + 3 × 96 (rows) + 40 = **352** | ~456 | comfortable |
| `outlook-*` statTile | 108 | ~154 | comfortable |
| `outlook-deals` | 5 × 44 + 52 = **272** | ~618 | very comfortable |
| `perf-rules` / `seg-rules` | 4 rules × 46 + 34 = **218** | ~280 / ~250 | tightest on the board |
| `growthSpread` | rows × 44 + 30 | 5 × 44 + 30 = 250 vs ~340 | comfortable |

The binding constraint is the `rulesCard` in the side column, and it is the same constraint
the trend tab's rules card already lives with. If it clips at 768, the honest fix is three
rules rather than four, not smaller type. Drop rule 4 from each card first — the
one-scale-across-three-tabs rule is the most redundant with the axis strip, which states it
graphically in every portlet.

### 8.2 Width

At 1920 → 1024 the two-column tabs hold their proportions and everything shrinks
proportionally. Two width-specific additions:

```css
/* The matrix's five segment columns stop being readable before the layout
   breaks. Below this the two narrowest lose their rate labels first — they
   already have none at rest, so this only affects the hover targets, which
   grow instead. */
@media (max-width: 1180px) {
  .band[data-layout="seg-main"] { --growth-cell-min: 88px; }
  .band[data-layout="perf-side"],
  .band[data-layout="seg-side"] { grid-template-rows: minmax(0, 1.4fr) minmax(0, 1fr); }
}

/* Below 900 the existing rule already collapses every panel to one column with
   grid-auto-rows and lets the stage scroll, on the stated grounds that nothing
   composes to one viewport honestly at that width. The three new tabs inherit
   it by adding their band layouts to the existing selector list. */
@media (max-width: 900px) {
  .panel[data-tab="performance"] .panel-bands,
  .panel[data-tab="segments"] .panel-bands,
  .panel[data-tab="outlook"] .panel-bands {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    grid-auto-rows: minmax(200px, auto);
    overflow-y: auto;
    padding-right: 4px;
  }
  .band[data-layout="perf-main"], .band[data-layout="perf-side"],
  .band[data-layout="seg-main"], .band[data-layout="seg-side"],
  .band[data-layout="outlook-head"], .band[data-layout="outlook-matrix"],
  .band[data-layout="outlook-deals"] {
    grid-column: auto; grid-row: auto;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    grid-auto-rows: minmax(190px, auto);
  }
}
```

The `seg-matrix` at 900px wide with five columns is the one place the composition genuinely
stops working, and the collapse above turns it into a stack of rows rather than crushing it.
That matches the existing stated policy for this breakpoint rather than inventing a new one.

---

## 9. Tab navigation at five tabs

### 9.1 What already works

`TabController.init()` iterates `this.tabs`, so five buttons, five panels, five index chips
and five `aria-controls` pairings come free. `positionIndicator()` reads `offsetLeft` and
`offsetWidth` off the active button, so the animated indicator is width-agnostic.
`onNavKeydown` cycles `ArrowRight`/`ArrowLeft` modulo `order.length`. `main.js` already
matches `/^[1-9]$/` and indexes `board.tabs`, so `1`–`5` work the moment the tabs exist.
Roving tabindex, `aria-selected` and the ARIA tablist are all n-agnostic. **No JavaScript
change is required for the tabs to function.**

### 9.2 What breaks — width at 1024

The topbar runs brand, tabnav, trust legend and two buttons on one row. Five tabs is the
problem:

| Label | chars |
|---|---|
| Q2 Exec Summary | 15 |
| Analytics Performance | 21 |
| Performance by Segment | 22 |
| Q3 Outlook | 10 |
| Five Year Trend | 15 |

83 characters at 13px/500 Inter is ~550px of glyphs, plus five buttons' padding (32px each),
five index chips (17px + 8px gap each), and four 4px gaps — about **850px of tabnav**. Add the
brand block (~230px) and the actions cluster (~330px at the existing `max-width: 1200px`
reductions) and the topbar wants ~1410px. At 1024 it overflows badly; the existing
`max-width: 1200px` block only recovers ~150px by dropping the legend, hint and eyebrow.

### 9.3 Recommended fix — wrap the tabnav one breakpoint earlier

The stylesheet already has the right rule; it is just at the wrong width. `@media (max-width: 900px)`
sets `.tabnav { order: 3; width: 100% }` and `.tabnav-btn { flex: 1 }`, giving the tabs their
own full-width row with the buttons sharing it evenly. **Raise that block's breakpoint to
1120px for the tabnav rules only**, leaving the rest of the 900px block where it is:

```css
/* Five tabs is ~850px of pills. Past this the topbar cannot hold the brand,
   the tabs and the actions on one row, and a truncated tab label reads as a
   bug. The tabs take a row of their own and share it evenly — which also
   makes the five index chips line up as a keyboard legend. */
@media (max-width: 1120px) {
  .topbar { flex-wrap: wrap; row-gap: 8px; }
  .tabnav { order: 3; width: 100%; }
  .tabnav-btn { flex: 1; justify-content: center; }
}
```

The wrapped row costs ~38px of height. The existing `@media (max-height: 860px)` reclaim gives
back ~30px of chrome, so the net cost at 1024×768 is ~8px against the ~636px band budget —
inside the slack measured in [§8.1](#81-height-budget-at-1024--768) for every portlet except
the `rulesCard`, which is why [§8.1](#81-height-budget-at-1024--768) names dropping its fourth
rule as the first concession.

`positionIndicator()` needs no change: it is called from `activate()` after the class flip and
from the `resize` listener, and reading `offsetLeft` forces the layout it depends on. Verify
once that the indicator lands correctly on the frame the topbar wraps — if it lags, the
one-line fix is calling `positionIndicator()` from a `ResizeObserver` on `this.nav` rather
than from `window.resize`.

### 9.4 The alternative, and why it is second choice

Shorten the authored labels — `Exec Summary`, `Performance`, `By Segment`, `Q3 Outlook`,
`Five Year Trend` (58 characters, ~670px of tabnav) — and add a `@media (max-width: 1120px)`
block hiding `.tabnav-index` and tightening `.tabnav-btn` to `6px 10px / 12px`, saving a
further ~185px. That reaches ~485px and keeps one row. It is cheaper in height and it costs
two things: `Performance` and `By Segment` stop naming what they contain, and the index chips
that make `1`–`5` discoverable disappear at exactly the width where a projector audience is
most likely to be watching someone use them. I would take the wrap. Both are one CSS block;
if height at 768 turns out tighter in practice than the budget above, switch.

### 9.5 Small additions worth making

- **`Home` / `End`** in `onNavKeydown` to jump to the first and last tab. At two tabs this was
  pointless; at five it is the expected tablist behaviour and it is four lines.
- **The statusbar hint** in `index.html` reads `1–2 or ← → to switch`. It needs to read
  `1–5`. One string, in a file this document does not own — see
  [§13](#13-sequencing-file-ownership-and-follow-ups).
- **`README.md`** describes "Two tabs", lists `1 2` in the keyboard table, and its structure
  and talk-track sections both assume two tabs. Same ownership note.
- **The knowledge-graph overlay** links portlets resolving to the same certified measure, and
  cross-tab counterparts render as jump badges. Authoring `ACV (certified)` on tab 2, tab 3
  and tab 4 grows that cluster from four portlets to eight, so each ACV portlet gains several
  cross-tab badges. `graph.js` already collapses cross-tab edges to badges and already drops
  lineage sources touched by more than four portlets, so this should hold — but check the
  badge density on `kpi-acv` with the graph on, and if it crowds, collapse the badges per
  *tab* rather than per counterpart. Flagged, not specified: `graph.js` is out of scope here.

---

## 10. Build beats and the two-stage contract

### 10.1 The contract, restated

`TabController.choreograph()` calls `portlet.primeChart()` on every portlet on the tab
*before* stage one, then adds `is-entered` to each shell on a band-and-index stagger, then —
after `settle` — calls `portlet.build(0)` on each portlet at a delay proportional to its
horizontal centre across the whole panel. So:

1. **Every animated node must be in a `veil([...])` list, and `prime` must be `curtain.hide`.**
   A chart is mounted at full opacity; anything not veiled is visible from mount and flashes
   out when its beat arrives. This is the exact bug the veil was added to fix.
2. **`settle` must be `curtain.settle`**, so a conditional mark whose beat never runs — the
   overflow notch, the flat-dumbbell branch, a degraded-mode socket — is restored rather than
   left invisible.
3. **`build` must `await` through its beats and pass `signal` to every primitive**, so a tab
   switch mid-build cancels rather than writing into detached DOM.
4. **Use `fadeTo(node, α, …)` and not `fadeIn` for any fill meant to stay translucent** — the
   core band at 0.06 and the decade gridlines at 0.5 stroke-opacity both want this, for the
   same reason `trendPanel.js` handles its area outside the veil.
5. **A wide portlet's interior must build left-to-right.** The page sweep gives each portlet
   one slot based on its centre; a wide portlet that builds right-to-left or centre-out fights
   the sweep it is nested inside. Every beat sequence below runs in `+x`.

Note that `fill-opacity` is a paint attribute and element `opacity` is not, so a band authored
with `fill-opacity: 0.06` can be safely veiled and faded to element opacity 1 — the same
technique `docs/attainment-encoding.md` §8 uses for its bands. Prefer that over `fadeTo` where
the translucency is a paint value.

### 10.2 `growthMatrix` with a roll-up (tab 2) — eight beats, ~3.0s raw

| # | Beat | Primitive |
|---|---|---|
| 1 | the total arrives as one quantity | `growFrom(l0, { axis: "x", origin: "left center", duration: 620 })` |
| 2 | the two motions partition it | `await wait(240)`; `growFrom` each level-1 block from its own left edge, `delay: i * 120` |
| 3 | **the boundary descends** | `await wait(300)`; `strokeDraw(carryTie, { duration: 280 })` top-to-bottom, concurrent with `growFrom` on the four level-2 blocks, `delay: i * 90` |
| 4 | the figure closes | `strokeDraw` the four extent ties, `duration: 220`; then `stagger(blockLabels, { step: 70, duration: 300, y: 0 })` |
| 5 | the tree assembles | `await wait(260)`; `strokeDraw` each rail spine `duration: 240`, then `stagger(rowLabels, { step: 44, duration: 300, y: 3 })` |
| 6 | the ruler before the measurement | `strokeDraw` the seven zero rules `duration: 420`; `fadeIn` the core bands and decade gridlines `delay: 120`; `stagger` the axis-strip tick labels |
| 7 | the stakes land on the pivot | `await wait(200)`; `stagger(stakeDots, { step: 54, duration: 300, scaleFrom: 0.2, y: 0, maxTotal: 380 })` |
| 8 | the rates grow out of zero | `await wait(180)`; per row `growFrom(bar, { axis: "x", origin: yoy < 0 ? "right center" : "left center", duration: 620, delay: i * 70 })`; then `stagger(rateLabels, { step: 60, duration: 320, y: 0 })`; `fadeIn(caption, { delay: 160 })` |

Beat 3 is the portlet. Beat 8's per-sign `transformOrigin` is why sign is legible before
colour is read — every bar grows *outward from zero in its own direction*, so the reader sees
which way before they see how far or what hue.

`veil([ rollupBlocks, blockLabels, carryTie, extentTies, railSpines, railTicks, rowLabels, valueLabels, coreBands, decadeLines, zeroRules, stakeDots, bars, rateLabels, axisStrip, caption, sockets ])`
— note `sockets` is in the list even though it only exists in degraded mode, which is exactly
what `veil`'s `settle()` safety net is for.

### 10.3 `growthMatrix` at five columns (tab 3) — five beats, ~2.4s raw

Beats 1–4 do not apply. The critical instruction is **column-major order**:

| # | Beat | Primitive |
|---|---|---|
| 1 | the tree | `strokeDraw` rail spines `240`; `stagger(rowLabels, { step: 40, duration: 300, y: 3 })` |
| 2 | the rulers, left to right | `strokeDraw` each column's 7 zero rules together, column `c` at `delay: c * 90`, `duration: 380` |
| 3 | the grid | `fadeIn` core bands and decade gridlines, `delay: 140 + c * 90`; `stagger(columnHeaders, { step: 70 })`; axis strip |
| 4 | the stakes | `await wait(220)`; `stagger(stakeDots, { step: 26, duration: 280, scaleFrom: 0.2, maxTotal: 520 })` in column-major order |
| 5 | the rates | `await wait(160)`; per cell `growFrom(bar, { axis: "x", origin: <by sign>, duration: 540, delay: c * 130 + r * 48 })`; then the All-Segments rate labels; `fadeIn(caption)` |

`c * 130 + r * 48` is the whole point: the interior sweeps left to right, nesting inside the
page sweep, with a soft top-to-bottom cascade inside each column. Set `maxTotal` explicitly on
the 35-item `stagger` — the default 620 would compress the per-item step to 18ms and the
cascade would read as a single flash.

### 10.4 `growthSpread` — four beats, ~1.5s raw

1. Axis: `strokeDraw` zero rules `380`, `fadeIn` core bands and decade gridlines `delay: 120`.
2. `await wait(200)`; `stagger(lowDots, { step: 80, duration: 300, scaleFrom: 0.3 })` — the
   declining end first, which is also the left end, so it reads in `+x`.
3. `strokeDraw(stem, { duration: 480, delay: i * 90 })` drawn **from low toward high**, so the
   spread opens left to right. Embedded's stem visibly crosses the zero rule; the Platform's
   barely moves. That contrast is the portlet and it happens in this beat.
4. `stagger(highDots, { step: 80, duration: 320, scaleFrom: 0.3 })`, then parent carets
   `dashDraw` `300`, then end labels `stagger`.

### 10.5 `metricMatrix` — six beats, ~2.6s raw, column-major

1. `strokeDraw` rail spines `240`; `stagger(rowLabels + sublabels, { step: 50, y: 3 })`;
   `stagger(columnHeaders, { step: 70 })`.
2. Per column `c`, at `delay: c * 200`: `fadeIn(valueEl, { duration: 420, y: 8 })` and
   `countUp(valueEl, display, { delay: 120, duration: 900 })`, or `scramble` when
   `directMode.candidates.length > 1`.
3. Y/Y: `strokeDraw` the stub's zero rule `260`, then `growFrom(stub, { axis: "x", origin: <by sign>, duration: 460 })`, then the chip `fadeIn`.
4. Alternate basis: `dashDraw(ghostTick, { duration: 340 })` and `fadeIn` its numeral — after
   the primary tick, so the ghost reads as a second reading of the same axis and not as a
   competing first one.
5. FinPlan bullet, per `docs/attainment-encoding.md` §8: bands `stagger` first (the ruler),
   then the target tick `strokeDraw` **top-to-bottom**, then the bar `strokeDraw` left-to-right,
   then the reach-to-plan trace with `dashDraw` (never `strokeDraw` — the dashes carry meaning
   and `strokeDraw` would consume the dash pattern as its reveal mechanism) or the overrun cap.
   The 128% cell visibly crosses its tick and steps up. That is the moment on this tab.
6. Dumbbells: hollow historical dot `fadeIn` `scaleFrom: 0.4`, then
   `strokeDraw(stem, { duration: 360 })` **from historical toward current**, then the filled
   current dot. So the mark draws as "here is where we were, here is the move, here is where we
   are". Flat rows skip beat 6's stem entirely — `settle()` covers the skipped node. Then note
   chips `fadeIn`.

### 10.6 `dealRail` — four beats, ~1.6s raw

1. `strokeDraw` the baseline `380`.
2. `growFrom(fill, { axis: "x", origin: "left center", duration: 560, delay: i * 110 })`
   top-to-bottom — a ranked list should assemble in rank order.
3. `stagger(tipDots, { step: 100, duration: 280, scaleFrom: 0.3 })`.
4. `countUp` each value, `delay: i * 90`; `fadeIn` the footer chip `delay: 240`.

The two ties land at identical lengths on the same frame, which is worth watching for once —
if they differ by a pixel, a rounding step has crept into the width calculation.

### 10.7 Reduced motion

Every primitive already jumps to its final state under `prefers-reduced-motion`, and `veil` is
inert in both directions. Nothing in the beats above needs a second code path. Verify by
toggling the OS setting rather than by reading the code: the specific failure mode to look for
is a conditional mark that never ran its beat and never got settled.

---

## 11. Forms considered and rejected

`docs/visualization-research.md` rejected a long list of forms for the existing two tabs, on
three filters: does the data have the shape the form needs, does the form stay honest across
the flow/stock and half-period boundaries, and can it be built and animated at portlet scale
with the existing primitives. Those filters apply here and this section adds a fourth, which
does most of the work on these three tabs: **does the form require a quantity that does not
exist or does not close?**

### Rejected because they need prior-year dollars

| Form | Why not |
|---|---|
| **Waterfall / variance decomposition** of the total's decline into its children | The most tempting form on this list, and the one I most wanted to recommend. A bridge from FY26 Q2 to FY27 Q2 with a bar per product line would be the best possible rendering of "a shrinking base with one growing line". It needs a prior-year value per node, and back-solving from the rounded Y/Y does not close at any level — see [§0](#0-read-this-first--the-four-load-bearing-decisions). Authoring the derived values would put a roll-up violation on a board whose thesis is roll-up integrity, and `docs/visualization-research.md` §2 already established the standing rule that a renderer must not back-solve a prior period from a rounded percentage. |
| **Two-period proportional alluvial** (the form that doc recommends for `mix-acv`) | Same blocker. It works on `mix-acv` because that portlet's prior year is recoverable *and* reconciles to the penny; here it is neither. |
| **Slope graph** FY26 Q2 → FY27 Q2 per line | Same blocker, plus seven lines crossing in a portlet-sized frame. |
| **Dumbbell on dollars** (prior vs current per line) | Same blocker. The dumbbell survives on *rates*, which is [§5.3](#53-perf-divergence--within-line-dispersion). |
| **Indexed overlay** (FY26 Q2 = 100) | Same blocker, and `docs/visualization-research.md` already rejects indexed overlays beside absolute scales as quietly dishonest. |

### Rejected because they combine stake and rate into one area

| Form | Why not |
|---|---|
| **Marimekko / mosaic**, width = ACV and height = Y/Y | The area is dollars × growth, which is not a quantity. Worse, a mosaic invites a reader to compare and sum cell areas, and these areas neither compare nor sum. Also negative rates have no height. |
| **Treemap tinted by growth** | The tiling is honest on tab 2 and the colour is not: hue cannot rank −48% against +1060%, which is the comparison the whole board is about. A treemap would render the roll-up correctly and then hide the finding. |
| **Bubble scatter**, x = ACV and y = Y/Y, area = ACV | Area duplicates the x-position, and seven bubbles spanning $1M to $83M and −48% to +1060% is four points in one corner and three on the axes. |
| **Nightingale rose / radial bar** | Area encoding for a value that needs ranking, plus `docs/visualization-research.md` cites the 20–30% area-misreading figure. Angle is already rejected on this board. |

### Rejected because they would put a rounding artifact on screen

| Form | Why not |
|---|---|
| **Stacked bar per segment** summing to the All Segments total | Tiling asserts closure. The segment columns do not always close, and a visible overflow bar would be exactly the reconciliation UI [§0.1](#01-implementation-warning--three-authored-gaps-render-them-verbatim) forbids. |
| **Nested treemap per segment column** | Same. Nesting is tiling. |
| **Stacked NNAOV column on tab 4** | Same, and this is the sharpest case: the Q3 NNAOV children would visibly overflow their parent. |
| **A roll-up icicle on tab 4** | The ACV and Attrition rows would tile and the NNAOV row would not, so the geometry would work on two thirds of the matrix and break on the rest — which reads as a bug and points at exactly the thing that must not be pointed at. |

### Rejected on encoding grounds

| Form | Why not |
|---|---|
| **Grouped or diverging bars on a shared linear scale** | The naive baseline, and the reason [§1](#1-the-growth-scale-solved-once) exists: at a domain of +1060%, −8% is 0.7px and every cell except Tableau Next is a nub. |
| **Signed square-root scale** | Better than linear and worse than symlog for this distribution. `√1060 = 32.6` against `√8 = 2.8`, so the ±50% region where the bulk of the data lives gets about a fifth of the half-width. Symlog gives that region 46% of the half-width and still separates the three positive outliers. Signed-sqrt also has no natural tick vocabulary — there is nothing to label — where symlog has decades. |
| **Clipping at ±100% with an overflow indicator** | Renders four cells as identical clipped bars carrying an identical glyph, which is precisely reading "+1060% as merely a lot". Rejected as a primary; kept as a guard for values past 1585%, which none of the authored data reaches. |
| **Growth as a separate colour-only channel** | The brief lists this as an option. Colour can carry sign and a threshold — which is what `toneOf` already does — and cannot carry three orders of magnitude. It is the right *secondary* channel and it is used as one. |
| **Heatmap with numbers in cells** | 70 numerals at 9px is a coloured-in table. It renders every number and communicates none. |
| **Sparklines or micro-trajectories per cell** | Two periods is not a trajectory, and the prior-year dollars do not exist. |
| **Waffle / unit chart** for ACV | `$83M` is not a countable population. `docs/visualization-research.md` §3 recommends the unit grid for AE headcount precisely because headcount is the only countable population on the board; dollars are continuous and a waffle of them is decoration. |
| **Bullet rows for tab 2 or tab 3** | The bullet grammar needs a target, and no plan is authored at product-line or segment grain. It is exactly right on tab 4, where FinPlan attainment is authored, and it is used there. |
| **Radar per outlook row** | Three axes in three incommensurable units, and the axis order changes the shape. |
| **Sankey from motion to segment** | Not a conserved flow, and a Sankey would assert a conservation the data does not support — the same rejection `docs/visualization-research.md` makes for the five-year metrics. |
| **Bipartite arc diagram** for the hierarchy | Fourteen edges in a narrow column is a knot, and the containment rail carries the same information at rest. The same practical downgrade that doc reaches for the driver rail. |

---

## 12. Paste-ready `board.json`

Insert the three tab objects **between** the existing `exec` object and the existing `trend`
object in `board.json`'s `tabs` array, so the order becomes
`exec, performance, segments, outlook, trend`. Change nothing inside `exec` or `trend`.

Then, per the README:

```bash
node scripts/sync-fallback.mjs
```

`src/fallback.js` is a generated byte-for-byte copy and nothing watches for you. A board.json
edit without the regen leaves `file://` users on a three-tab board.

### 12.1 Tab 2 — `performance`

```json
{
  "id": "performance",
  "label": "Analytics Performance",
  "kicker": "Q2 FY27 · All segments",
  "headline": "A shrinking platform base and one line growing off almost nothing",
  "accent": "#1C6E8C",
  "bands": [
    {
      "id": "perf-main",
      "layout": "perf-main",
      "portlets": [
        {
          "id": "perf-hierarchy",
          "kind": "growthMatrix",
          "label": "ACV by product",
          "sublabel": "Two-level product taxonomy, Q2 FY27",
          "accent": "#1C6E8C",
          "metrics": {
            "unit": "$M",
            "stakeMax": 83,
            "goodDirection": "up",
            "segments": [
              { "id": "all", "label": "All Segments", "short": "All", "reference": true }
            ],
            "rollup": {
              "total": 83,
              "totalDisplay": "$83M",
              "note": "Three levels of one certified measure. Each level tiles the level above it, so the boundaries are the roll-up rather than a check on it.",
              "levels": [
                ["analytics-total"],
                ["platform", "embedded"],
                ["cloud", "server", "next", "crma"]
              ]
            },
            "rows": [
              {
                "id": "analytics-total",
                "label": "Analytics Total",
                "level": 0,
                "parent": null,
                "value": 83,
                "display": "$83M",
                "yoy": -27,
                "yoyDisplay": "-27%",
                "goodDirection": "up",
                "color": "#1C6E8C"
              },
              {
                "id": "platform",
                "label": "Agentic Analytics Platform",
                "level": 1,
                "parent": "analytics-total",
                "value": 59,
                "display": "$59M",
                "yoy": -40,
                "yoyDisplay": "-40%",
                "goodDirection": "up",
                "color": "#2F5FA8"
              },
              {
                "id": "cloud",
                "label": "Tableau Cloud",
                "level": 2,
                "parent": "platform",
                "value": 38,
                "display": "$38M",
                "yoy": -41,
                "yoyDisplay": "-41%",
                "goodDirection": "up",
                "color": "#2F5FA8"
              },
              {
                "id": "server",
                "label": "Tableau Server",
                "level": 2,
                "parent": "platform",
                "value": 21,
                "display": "$21M",
                "yoy": -39,
                "yoyDisplay": "-39%",
                "goodDirection": "up",
                "color": "#6E8FC4"
              },
              {
                "id": "embedded",
                "label": "Embedded Agentic Analytics",
                "level": 1,
                "parent": "analytics-total",
                "value": 24,
                "display": "$24M",
                "yoy": 57,
                "yoyDisplay": "+57%",
                "goodDirection": "up",
                "color": "#12806A"
              },
              {
                "id": "next",
                "label": "Tableau Next",
                "level": 2,
                "parent": "embedded",
                "value": 13,
                "display": "$13M",
                "yoy": 414,
                "yoyDisplay": "+414%",
                "goodDirection": "up",
                "color": "#12806A"
              },
              {
                "id": "crma",
                "label": "CRMA",
                "level": 2,
                "parent": "embedded",
                "value": 11,
                "display": "$11M",
                "yoy": -15,
                "yoyDisplay": "-15%",
                "goodDirection": "up",
                "color": "#5EA394"
              }
            ],
            "axisNote": "Y/Y — linear inside ±10%, one decade per gridline beyond it",
            "caption": "$83M across two motions and four product lines · exact figures on hover, or expand for the grid"
          },
          "semantic": {
            "metricName": "Annual Contract Value by Product",
            "definition": "Certified ACV split by the two-level product taxonomy that maps every SKU to exactly one product motion and every motion to exactly one product line, at fiscal-quarter grain.",
            "sdm": "Analytics Revenue SDM",
            "measure": "ACV (certified)",
            "grain": "Fiscal quarter × Business unit × Product motion × Product line",
            "lineage": ["Org62 Opportunity", "Org62 OpportunityLineItem", "Product SKU Taxonomy", "Product Hierarchy"],
            "rls": "Analytics BU hierarchy — viewer sees only their branch",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Product Performance",
            "why": "The roll-up is the portlet. Cloud and Server tile the Platform bar and the two motions tile the total because all three levels are one certified measure read at three grains — not three queries that happen to agree. The partition closes by construction, which is why it can be drawn rather than checked."
          },
          "directMode": {
            "tier": "red",
            "candidates": ["one undifferentiated $83M", "two levels that do not tile"],
            "missing": "The two-level product taxonomy — Org62 stores a product code on OpportunityLineItem, not the SKU-to-motion mapping or the motion-to-line parentage the business reasons in",
            "effect": "The partition cannot be drawn at all. Level 1 and level 2 are not wrong without the taxonomy, they are absent, and the tab collapses to the one figure the exec summary already carries",
            "thesisTag": "T4",
            "thesis": "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
            "risk": "Plan H2 against a $24M Embedded line that no two queries reproduce the same way",
            "trustCost": "A hierarchy that is rebuilt per deck is a hierarchy nobody can be held to",
            "metrics": {
              "rollup": {
                "total": 83,
                "totalDisplay": "$83M",
                "note": "No product taxonomy — one undifferentiated total, and no levels to tile it.",
                "levels": [["analytics-total"]]
              },
              "rows": [
                {
                  "id": "analytics-total",
                  "label": "Analytics Total",
                  "level": 0,
                  "parent": null,
                  "value": 83,
                  "display": "$83M",
                  "yoy": -27,
                  "yoyDisplay": "-27%",
                  "goodDirection": "up",
                  "color": "#C0483C"
                }
              ],
              "sockets": ["platform", "cloud", "server", "embedded", "next", "crma"],
              "caption": "No product taxonomy — one undifferentiated $83M and six rows with nothing to draw"
            }
          }
        }
      ]
    },
    {
      "id": "perf-side",
      "layout": "perf-side",
      "portlets": [
        {
          "id": "perf-divergence",
          "kind": "growthSpread",
          "label": "Within-motion spread",
          "sublabel": "Slowest to fastest line in each motion",
          "accent": "#12806A",
          "metrics": {
            "goodDirection": "up",
            "rows": [
              {
                "id": "platform-spread",
                "label": "Agentic Analytics Platform",
                "parentYoy": -40,
                "parentYoyDisplay": "-40%",
                "low": -41,
                "lowDisplay": "-41%",
                "lowLabel": "Tableau Cloud",
                "high": -39,
                "highDisplay": "-39%",
                "highLabel": "Tableau Server",
                "spreadDisplay": "2 points apart"
              },
              {
                "id": "embedded-spread",
                "label": "Embedded Agentic Analytics",
                "parentYoy": 57,
                "parentYoyDisplay": "+57%",
                "low": -15,
                "lowDisplay": "-15%",
                "lowLabel": "CRMA",
                "high": 414,
                "highDisplay": "+414%",
                "highLabel": "Tableau Next",
                "spreadDisplay": "429 points apart"
              }
            ],
            "axisNote": "Same growth axis as the panel beside it",
            "caption": "One motion moves together; the other does not"
          },
          "semantic": {
            "metricName": "Within-Motion Growth Dispersion",
            "definition": "The interval between the slowest and fastest certified Y/Y growth among the product lines inside one product motion, at fiscal-quarter grain.",
            "sdm": "Analytics Revenue SDM",
            "measure": "ACV (certified)",
            "grain": "Fiscal quarter × Product motion",
            "lineage": ["Org62 Opportunity", "Product SKU Taxonomy", "Product Hierarchy"],
            "rls": "Analytics BU hierarchy — viewer sees only their branch",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Product Performance",
            "why": "Both ends of each interval are the same certified measure at the same grain, which is what makes the interval a comparison rather than two numbers set beside each other. A motion average would report the same two motions as broadly similar."
          },
          "directMode": {
            "tier": "red",
            "candidates": ["four rates with nothing to group them"],
            "missing": "The motion-to-line parentage — without it there is no inside-each-motion for a range to be taken within",
            "effect": "Four product-line growth rates survive and the two intervals do not, so the fact that one motion moves together and the other splits has nowhere to be seen",
            "thesisTag": "T4",
            "thesis": "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
            "risk": "Treat Embedded as one growing thing and fund both of its lines on the strength of one",
            "trustCost": "A grouping that only exists in the deck cannot be reviewed against next quarter's deck",
            "metrics": {
              "caption": "No motion parentage — no interval to take"
            }
          }
        },
        {
          "id": "perf-rules",
          "kind": "rulesCard",
          "label": "How these tabs read",
          "sublabel": "Rules applied to every mark on the product, segment and outlook tabs",
          "accent": "#63708C",
          "metrics": {
            "rules": [
              {
                "title": "Roll-up is geometry",
                "body": "Cloud and Server tile the Platform bar exactly, and the two motions tile the total exactly. The level-1 boundary recurs one level down because all three levels are one certified measure at three grains, so the partition closes by construction rather than by being checked afterwards."
              },
              {
                "title": "Stake and rate are separate channels",
                "body": "Dollars are one length and growth is another on its own axis. They are never multiplied into an area, because a rate and a stake are not commensurable and an area combining them would invite a reader to add up quantities that do not add."
              },
              {
                "title": "One growth scale, stated",
                "body": "Growth is linear inside ±10% — the same neutral band the colour threshold uses — and logarithmic beyond it, with a gridline at every decade. The compression is drawn rather than assumed, and it is the same function on all three tabs, so a given rate is the same proportion of its axis wherever it appears."
              },
              {
                "title": "The stake is the dot",
                "body": "Every growth mark pivots on a dot whose area is the ACV behind it. So +414% on $13M reads as a long bar on a small dot and -40% on $59M as a short bar on a large one. Both are true, and neither is allowed to stand in for the other."
              }
            ]
          },
          "semantic": {
            "metricName": "Presentation Rules",
            "definition": "The partition, channel, scaling and weighting rules the semantic layer applies to every product, segment and outlook mark on this board.",
            "sdm": "Analytics Revenue SDM",
            "measure": null,
            "grain": "Applies to all measures on the product, segment and outlook tabs",
            "lineage": ["Semantic Model Definition"],
            "rls": "Not scoped — rules apply to every viewer identically",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Product Performance",
            "why": "These rules are properties of the measures rather than of the charts, so every chart, export and agent reading those measures inherits them. Nobody has to remember to apply them, and nobody can quietly not."
          },
          "directMode": {
            "tier": "grey",
            "candidates": ["rules live in each analyst's head"],
            "missing": "Any place for a partition rule, a scale or a weighting to live except the head of whoever built the chart",
            "effect": "Four rules that have to be remembered, re-explained and re-applied by every person and every agent that touches these numbers",
            "thesisTag": "T3",
            "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
            "risk": "Two analysts draw the same hierarchy on two different scales and both defend it",
            "trustCost": "Consistency becomes a matter of diligence rather than a property of the data"
          }
        }
      ]
    }
  ]
}
```

### 12.2 Tab 3 — `segments`

Row arrays are indexed against `metrics.segments`, in the order
`all, entr, cmrcl, smb, pubsec` — the same parallel-array convention `trendPanel` uses for
`periods` / `series` / `display` / `yoy`.

```json
{
  "id": "segments",
  "label": "Performance by Segment",
  "kicker": "Q2 FY27 · Four segments",
  "headline": "One segment growing, and Embedded growing in all four",
  "accent": "#2F5FA8",
  "bands": [
    {
      "id": "seg-main",
      "layout": "seg-main",
      "portlets": [
        {
          "id": "seg-matrix",
          "kind": "growthMatrix",
          "label": "ACV by product and segment",
          "sublabel": "Seven product lines across four segments, Q2 FY27",
          "accent": "#2F5FA8",
          "metrics": {
            "unit": "$M",
            "stakeMax": 83,
            "goodDirection": "up",
            "segments": [
              { "id": "all", "label": "All Segments", "short": "All", "reference": true },
              { "id": "entr", "label": "Enterprise", "short": "ENTR" },
              { "id": "cmrcl", "label": "Commercial", "short": "CMRCL" },
              { "id": "smb", "label": "Small & Medium Business", "short": "SMB" },
              { "id": "pubsec", "label": "Public Sector", "short": "PubSec" }
            ],
            "rows": [
              {
                "id": "analytics-total",
                "label": "Analytics Total",
                "level": 0,
                "parent": null,
                "color": "#1C6E8C",
                "goodDirection": "up",
                "values": [83, 39, 18, 12, 15],
                "display": ["$83M", "$39M", "$18M", "$12M", "$15M"],
                "yoy": [-27, -35, -31, -23, 14],
                "yoyDisplay": ["-27%", "-35%", "-31%", "-23%", "+14%"]
              },
              {
                "id": "platform",
                "label": "Agentic Analytics Platform",
                "level": 1,
                "parent": "analytics-total",
                "color": "#2F5FA8",
                "goodDirection": "up",
                "values": [59, 26, 13, 10, 10],
                "display": ["$59M", "$26M", "$13M", "$10M", "$10M"],
                "yoy": [-40, -48, -41, -34, -12],
                "yoyDisplay": ["-40%", "-48%", "-41%", "-34%", "-12%"]
              },
              {
                "id": "cloud",
                "label": "Tableau Cloud",
                "level": 2,
                "parent": "platform",
                "color": "#2F5FA8",
                "goodDirection": "up",
                "values": [38, 16, 10, 8, 4],
                "display": ["$38M", "$16M", "$10M", "$8M", "$4M"],
                "yoy": [-41, -48, -42, -30, -16],
                "yoyDisplay": ["-41%", "-48%", "-42%", "-30%", "-16%"]
              },
              {
                "id": "server",
                "label": "Tableau Server",
                "level": 2,
                "parent": "platform",
                "color": "#6E8FC4",
                "goodDirection": "up",
                "values": [21, 10, 4, 2, 6],
                "display": ["$21M", "$10M", "$4M", "$2M", "$6M"],
                "yoy": [-39, -48, -38, -45, -8],
                "yoyDisplay": ["-39%", "-48%", "-38%", "-45%", "-8%"]
              },
              {
                "id": "embedded",
                "label": "Embedded Agentic Analytics",
                "level": 1,
                "parent": "analytics-total",
                "color": "#12806A",
                "goodDirection": "up",
                "values": [24, 13, 4, 2, 5],
                "display": ["$24M", "$13M", "$4M", "$2M", "$5M"],
                "yoy": [57, 33, 43, 147, 78],
                "yoyDisplay": ["+57%", "+33%", "+43%", "+147%", "+78%"]
              },
              {
                "id": "next",
                "label": "Tableau Next",
                "level": 2,
                "parent": "embedded",
                "color": "#12806A",
                "goodDirection": "up",
                "values": [13, 8, 3, 1, 2],
                "display": ["$13M", "$8M", "$3M", "$1M", "$2M"],
                "yoy": [414, 402, 236, 727, 1060],
                "yoyDisplay": ["+414%", "+402%", "+236%", "+727%", "+1060%"]
              },
              {
                "id": "crma",
                "label": "CRMA",
                "level": 2,
                "parent": "embedded",
                "color": "#5EA394",
                "goodDirection": "up",
                "values": [11, 5, 2, 1, 3],
                "display": ["$11M", "$5M", "$2M", "$1M", "$3M"],
                "yoy": [-15, -37, -18, 33, 69],
                "yoyDisplay": ["-15%", "-37%", "-18%", "+33%", "+69%"]
              }
            ],
            "axisNote": "Y/Y — linear inside ±10%, one decade per gridline beyond it",
            "caption": "Bar length is Y/Y on a log scale past ±10%; dot area is the ACV behind it · exact figures on hover, or expand for the full grid"
          },
          "semantic": {
            "metricName": "Annual Contract Value by Product and Segment",
            "definition": "Certified ACV at product-line grain crossed with the certified customer-segment dimension, where every account resolves to exactly one segment as of the period close.",
            "sdm": "Analytics Revenue SDM",
            "measure": "ACV (certified)",
            "grain": "Fiscal quarter × Product line × Customer segment",
            "lineage": ["Org62 Opportunity", "Org62 Account", "Product SKU Taxonomy", "Customer Segment Dimension", "Account Hierarchy Conformance"],
            "rls": "Analytics BU hierarchy — viewer sees only their branch, and the segment dimension does not widen it",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Segment Performance",
            "why": "Segment is a property of the account as of the period, not of the opportunity owner's territory. Because the segment dimension is certified and time-aware, a row read this quarter and the same row read next quarter are the same row — which is the only thing that makes a five-column comparison worth making."
          },
          "directMode": {
            "tier": "red",
            "candidates": ["Account.Type", "a hand-maintained Segment__c", "the owner's territory role"],
            "missing": "A certified customer-segment dimension with an as-of rule — Org62 offers Account.Type, a manually-maintained Segment__c and the opportunity owner's territory role, and accounts move between them mid-year with no statement of which reading the quarter was closed on",
            "effect": "All thirty-five cells still render. They just stop being one breakout: each column is whichever segment source the query author reached for, and an account that moved up-market in April is counted in two different segments across two readings of the same quarter",
            "thesisTag": "T1",
            "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
            "risk": "Move coverage into PubSec on a growth reading that is partly accounts being reclassified into it",
            "trustCost": "A breakout whose bins move is a breakout that cannot be reviewed",
            "metrics": {
              "axisNote": "Y/Y on a stated scale — with no stated segment to read it by",
              "caption": "Thirty-five cells, three candidate segment sources, no arbiter"
            }
          }
        }
      ]
    },
    {
      "id": "seg-side",
      "layout": "seg-side",
      "portlets": [
        {
          "id": "seg-spread",
          "kind": "growthSpread",
          "label": "Within-segment spread",
          "sublabel": "Slowest to fastest product line in each segment",
          "accent": "#6B4FBF",
          "metrics": {
            "goodDirection": "up",
            "rows": [
              {
                "id": "all-spread",
                "label": "All Segments",
                "parentYoy": -27,
                "parentYoyDisplay": "-27%",
                "low": -41,
                "lowDisplay": "-41%",
                "lowLabel": "Tableau Cloud",
                "high": 414,
                "highDisplay": "+414%",
                "highLabel": "Tableau Next",
                "spreadDisplay": "455 points"
              },
              {
                "id": "entr-spread",
                "label": "ENTR",
                "parentYoy": -35,
                "parentYoyDisplay": "-35%",
                "low": -48,
                "lowDisplay": "-48%",
                "lowLabel": "Cloud & Server",
                "high": 402,
                "highDisplay": "+402%",
                "highLabel": "Tableau Next",
                "spreadDisplay": "450 points"
              },
              {
                "id": "cmrcl-spread",
                "label": "CMRCL",
                "parentYoy": -31,
                "parentYoyDisplay": "-31%",
                "low": -42,
                "lowDisplay": "-42%",
                "lowLabel": "Tableau Cloud",
                "high": 236,
                "highDisplay": "+236%",
                "highLabel": "Tableau Next",
                "spreadDisplay": "278 points"
              },
              {
                "id": "smb-spread",
                "label": "SMB",
                "parentYoy": -23,
                "parentYoyDisplay": "-23%",
                "low": -45,
                "lowDisplay": "-45%",
                "lowLabel": "Tableau Server",
                "high": 727,
                "highDisplay": "+727%",
                "highLabel": "Tableau Next",
                "spreadDisplay": "772 points"
              },
              {
                "id": "pubsec-spread",
                "label": "PubSec",
                "parentYoy": 14,
                "parentYoyDisplay": "+14%",
                "low": -16,
                "lowDisplay": "-16%",
                "lowLabel": "Tableau Cloud",
                "high": 1060,
                "highDisplay": "+1060%",
                "highLabel": "Tableau Next",
                "spreadDisplay": "1076 points"
              }
            ],
            "axisNote": "Same growth axis as the matrix beside it",
            "caption": "Every segment holds a declining line and a growing one · the caret is the segment's own rate"
          },
          "semantic": {
            "metricName": "Within-Segment Growth Dispersion",
            "definition": "The interval between the slowest and fastest certified Y/Y growth among the product lines inside one customer segment, at fiscal-quarter grain.",
            "sdm": "Analytics Revenue SDM",
            "measure": "ACV (certified)",
            "grain": "Fiscal quarter × Customer segment",
            "lineage": ["Org62 Opportunity", "Org62 Account", "Product SKU Taxonomy", "Customer Segment Dimension"],
            "rls": "Analytics BU hierarchy — viewer sees only their branch",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Segment Performance",
            "why": "Each interval is one certified measure read at two product lines inside one segment, so the width of the interval is a fact about the segment rather than an artifact of two different definitions being compared. A segment-level average would report every segment as broadly declining."
          },
          "directMode": {
            "tier": "red",
            "candidates": ["seven rates per segment, three candidate segments"],
            "missing": "The certified segment dimension the interval is taken within, and the product parentage that says which lines belong in the range",
            "effect": "The intervals still draw and each one is taken over a different population, so a segment looks volatile or stable depending on which segment source the query author used",
            "thesisTag": "T1",
            "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
            "risk": "Call one segment the volatile one when the volatility is in the segment assignment",
            "trustCost": "A range over an unstable population measures the population, not the range",
            "metrics": {
              "caption": "Five intervals, five different populations"
            }
          }
        },
        {
          "id": "seg-rules",
          "kind": "rulesCard",
          "label": "How this matrix reads",
          "sublabel": "Seventy figures, thirty-five marks",
          "accent": "#63708C",
          "metrics": {
            "rules": [
              {
                "title": "One measure, two grains",
                "body": "Every cell is the same certified ACV measure, read at product line crossed with customer segment. The columns are a dimension of one measure rather than five measures that resemble each other, which is what makes reading across a row a comparison."
              },
              {
                "title": "Hierarchy is a rail, not a stack",
                "body": "The rails in the label gutter state which product lines sit inside which motion. Containment is a structural fact about the taxonomy, so it is drawn structurally rather than inferred by adding cells up."
              },
              {
                "title": "Precision is one click away",
                "body": "Thirty-five cells carry two figures each. The marks carry the comparison, the tooltip carries the cell, and the expand control reveals the full grid as two tables — the same disclosure the trend panels use, rather than a second thing to learn."
              },
              {
                "title": "One scale across three tabs",
                "body": "The growth axis here is the same function as on the product tab and the outlook tab, so a given rate is the same proportion of its axis wherever it appears and the three tabs can be read against each other."
              }
            ]
          },
          "semantic": {
            "metricName": "Matrix Reading Rules",
            "definition": "The grain, containment, disclosure and scaling rules applied to every cell of the segment matrix.",
            "sdm": "Analytics Revenue SDM",
            "measure": null,
            "grain": "Applies to every cell on this tab",
            "lineage": ["Semantic Model Definition"],
            "rls": "Not scoped — rules apply to every viewer identically",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Segment Performance",
            "why": "A dense matrix is only readable if the reader can trust that every cell was made the same way. These rules are properties of the measure and its dimensions, so that trust is a property of the data rather than a promise made by the chart."
          },
          "directMode": {
            "tier": "grey",
            "candidates": ["thirty-five cells, no stated grain"],
            "missing": "Any statement of the grain each cell was read at, or of which taxonomy the rows belong to",
            "effect": "A matrix that can still be read cell by cell and can no longer be read across, because nothing asserts that two cells in a row were made the same way",
            "thesisTag": "T3",
            "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
            "risk": "Compare two cells that were built from two different definitions and call the difference a finding",
            "trustCost": "Consistency becomes a matter of diligence rather than a property of the data"
          }
        }
      ]
    }
  ]
}
```

### 12.3 Tab 4 — `outlook`

```json
{
  "id": "outlook",
  "label": "Q3 Outlook",
  "kicker": "Q3 FY27 outlook",
  "headline": "Q3 tracks to $105M with attrition running 20% ahead of last year",
  "accent": "#92640A",
  "bands": [
    {
      "id": "outlook-head",
      "layout": "outlook-head",
      "portlets": [
        {
          "id": "outlook-acv",
          "kind": "statTile",
          "label": "ACV",
          "sublabel": "Q3 outlook · annual contract value",
          "accent": "#1C6E8C",
          "metrics": {
            "value": 105,
            "display": "$105M",
            "unit": "$M",
            "yoy": -6,
            "yoyDisplay": "-6% Y/Y",
            "goodDirection": "up",
            "caption": "87% of Product FinPlan"
          },
          "semantic": {
            "metricName": "Annual Contract Value",
            "definition": "Annualized contract value expected to close in the fiscal quarter: closed-won to date plus in-quarter pipeline weighted by the certified stage-probability model, normalized to a 12-month term.",
            "sdm": "Analytics Revenue SDM",
            "measure": "ACV (certified)",
            "grain": "Fiscal quarter × Business unit",
            "lineage": ["Org62 Opportunity", "Product SKU Taxonomy", "Stage Probability Model", "FinPlan FY27 Target"],
            "rls": "Analytics BU hierarchy — viewer sees only their branch",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Q3 Outlook",
            "why": "This is the same certified ACV measure as the Q2 tile and the five-year row, with one addition the measure carries explicitly: a stated weighting for the part of the quarter that has not closed. Turn on the knowledge graph to see the three of them resolve to one definition."
          },
          "directMode": {
            "tier": "red",
            "candidates": ["$105M", "$121M", "$94M"],
            "missing": "A governed outlook basis — Org62 carries stage and a Probability field, but no statement of which weighting a quarter is being called on, on top of the four candidate Amount columns the closed portion already inherits",
            "effect": "The figure moves with whoever set the weighting, and the Y/Y compares this quarter's assumption against last quarter's actual without saying so",
            "thesisTag": "T3",
            "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
            "risk": "Call the quarter on a weighting nobody agreed to and grade it against an actual",
            "trustCost": "A forecast with no stated basis is a number with an author",
            "metrics": {
              "display": "$105 / $121 / $94M",
              "yoyDisplay": "-6% Y/Y (basis undeclared)",
              "caption": "Weighting undeclared — plan basis undefined"
            }
          }
        },
        {
          "id": "outlook-attrition",
          "kind": "statTile",
          "label": "Attrition",
          "sublabel": "Q3 outlook · churned annual contract value",
          "accent": "#92640A",
          "metrics": {
            "value": 79.5,
            "display": "$79.5M",
            "unit": "$M",
            "yoy": 20,
            "yoyDisplay": "+20% Y/Y",
            "goodDirection": "down",
            "caption": "Rising year over year on a lower-is-better measure"
          },
          "semantic": {
            "metricName": "Attrition ACV",
            "definition": "ACV expected to be lost to non-renewal and downsell in the fiscal quarter, measured against the prior-period contract book. Lower is better; the certified measure carries that polarity.",
            "sdm": "Analytics Revenue SDM",
            "measure": "Attrition ACV (certified)",
            "grain": "Fiscal quarter × Business unit",
            "lineage": ["Org62 Contract", "Revenue Recognition Ledger", "Renewal Book Snapshot", "FinPlan FY27 Target"],
            "rls": "Analytics BU hierarchy — viewer sees only their branch",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Q3 Outlook",
            "why": "Polarity is part of the certified definition, so +20% Y/Y renders as bad news without anyone remembering that rising churn is not growth. The same measure carries the Q2 tile and the five-year row.",
            "polarityNote": "On the source slide the sign of this movement is coloured by the deck author. Here the direction of good comes from the measure, so a rise reads as a rise in something the business is trying to reduce."
          },
          "directMode": {
            "tier": "grey",
            "candidates": ["requires manual reconstruction"],
            "missing": "A point-in-time renewal book for the quarter being forecast — Org62 holds current contract state, not the book Q3 attrition will be measured against",
            "effect": "The quarter's churn exposure has to be rebuilt by hand from history objects, and the polarity is whatever the deck author decides to colour it",
            "thesisTag": "T2",
            "thesis": "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
            "risk": "Forecast against a renewal book that has quietly changed since the forecast was built",
            "trustCost": "A trend nobody can reproduce is not a trend",
            "metrics": {
              "display": "reconstruct",
              "yoyDisplay": "+20% Y/Y (unreproducible)",
              "caption": "No renewal-book snapshot to measure against"
            }
          }
        },
        {
          "id": "outlook-nnaov",
          "kind": "statTile",
          "label": "NNAOV",
          "sublabel": "Q3 outlook · net new annual order value",
          "accent": "#C0483C",
          "metrics": {
            "value": 25.5,
            "display": "$25.5M",
            "unit": "$M",
            "yoy": -41,
            "yoyDisplay": "-41% Y/Y",
            "goodDirection": "up",
            "caption": "Steepest decline of the three outlook measures"
          },
          "semantic": {
            "metricName": "Net New Annual Order Value",
            "definition": "Order value expected to close in the fiscal quarter on net-new-logo accounts, excluding expansion and renewal, tested against account history at the certified first-purchase definition.",
            "sdm": "Analytics Revenue SDM",
            "measure": "NNAOV (certified)",
            "grain": "Fiscal quarter × Business unit",
            "lineage": ["Org62 Opportunity", "Org62 Account", "Stage Probability Model", "FinPlan FY27 Target"],
            "rls": "Analytics BU hierarchy — viewer sees only their branch",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Q3 Outlook",
            "why": "The first-purchase test is harder forward than backward: an open opportunity has no close date to test against, so the measure carries an explicit rule for which account history a still-open deal is tested on. That rule is the measure."
          },
          "directMode": {
            "tier": "red",
            "candidates": ["$25.5M", "$38.1M", "$17.4M"],
            "missing": "A governed net-new-logo test that works on opportunities which have not closed yet — the first-purchase check needs an account history and a date to test it at, and an open deal supplies neither",
            "effect": "Three defensible forward net-new figures with no arbiter, on the measure that already has the weakest attainment on the board",
            "thesisTag": "T1",
            "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
            "risk": "Build the new-logo motion's Q3 exit plan on a baseline that could be off by more than twofold",
            "trustCost": "A confident wrong number costs more trust than a flagged unknown",
            "metrics": {
              "display": "$25.5 / $38.1 / $17.4M",
              "yoyDisplay": "-41% Y/Y (unverifiable)",
              "caption": "Three candidate forward definitions, no arbiter"
            }
          }
        }
      ]
    },
    {
      "id": "outlook-matrix",
      "layout": "outlook-matrix",
      "portlets": [
        {
          "id": "outlook-matrix",
          "kind": "metricMatrix",
          "label": "Q3 outlook by product",
          "sublabel": "Three measures against plan, velocity and coverage",
          "accent": "#92640A",
          "metrics": {
            "columns": [
              { "id": "acv", "label": "ACV", "goodDirection": "up" },
              { "id": "attrition", "label": "Attrition", "goodDirection": "down" },
              { "id": "nnaov", "label": "NNAOV", "goodDirection": "up" }
            ],
            "rows": [
              {
                "id": "analytics",
                "label": "Analytics",
                "sublabel": null,
                "level": 0,
                "parent": null,
                "color": "#1C6E8C",
                "cells": [
                  {
                    "id": "analytics-acv",
                    "value": 105,
                    "display": "$105M",
                    "yoy": -6,
                    "yoyDisplay": "-6% Y/Y",
                    "plan": 87,
                    "planDisplay": "87% of Product FinPlan",
                    "planGoodDirection": "up",
                    "altBasis": {
                      "label": "OU Roll-up",
                      "display": "$100M",
                      "yoy": -10,
                      "yoyDisplay": "-10% Y/Y"
                    }
                  },
                  {
                    "id": "analytics-attrition",
                    "value": 79.5,
                    "display": "$79.5M",
                    "yoy": 20,
                    "yoyDisplay": "+20% Y/Y",
                    "altBasis": {
                      "label": "*OU Roll-up",
                      "display": "$88.9M",
                      "yoy": 34,
                      "yoyDisplay": "34% Y/Y"
                    }
                  },
                  {
                    "id": "analytics-nnaov",
                    "value": 25.5,
                    "display": "$25.5M",
                    "yoy": -43,
                    "yoyDisplay": "-43% Y/Y"
                  }
                ]
              },
              {
                "id": "platform",
                "label": "Agentic Analytics Platform",
                "sublabel": "Cloud + Server",
                "level": 1,
                "parent": "analytics",
                "color": "#2F5FA8",
                "cells": [
                  {
                    "id": "platform-acv",
                    "value": 75.5,
                    "display": "$75.5M",
                    "yoy": -15,
                    "yoyDisplay": "-15% Y/Y",
                    "plan": 78,
                    "planDisplay": "78% of Product FinPlan",
                    "planGoodDirection": "up",
                    "pairs": [
                      {
                        "id": "velocity",
                        "label": "Velocity",
                        "value": 15,
                        "valueDisplay": "15%",
                        "hist": 17,
                        "histDisplay": "17% hist",
                        "domainMax": 25,
                        "unit": "%",
                        "goodDirection": "up"
                      },
                      {
                        "id": "coverage",
                        "label": "Coverage",
                        "value": 2.6,
                        "valueDisplay": "2.6x",
                        "hist": 2.7,
                        "histDisplay": "2.7x hist",
                        "domainMax": 4,
                        "unit": "x",
                        "goodDirection": "up"
                      }
                    ]
                  },
                  {
                    "id": "platform-attrition",
                    "value": 73.5,
                    "display": "$73.5M",
                    "yoy": 26,
                    "yoyDisplay": "+26% Y/Y"
                  },
                  {
                    "id": "platform-nnaov",
                    "value": 8.5,
                    "display": "$8.5M",
                    "yoy": -3,
                    "yoyDisplay": "-3% Y/Y"
                  }
                ]
              },
              {
                "id": "embedded",
                "label": "Embedded Agentic Analytics",
                "sublabel": "Tableau Next + CRMA",
                "level": 1,
                "parent": "analytics",
                "color": "#12806A",
                "cells": [
                  {
                    "id": "embedded-acv",
                    "value": 29.5,
                    "display": "$29.5M",
                    "yoy": 32,
                    "yoyDisplay": "+32% Y/Y",
                    "plan": 128,
                    "planDisplay": "128% of Product FinPlan",
                    "planGoodDirection": "up",
                    "pairs": [
                      {
                        "id": "velocity",
                        "label": "Velocity",
                        "value": 16,
                        "valueDisplay": "16%",
                        "hist": 16,
                        "histDisplay": "16% hist",
                        "domainMax": 25,
                        "unit": "%",
                        "goodDirection": "up"
                      },
                      {
                        "id": "coverage",
                        "label": "Coverage",
                        "value": 3.2,
                        "valueDisplay": "3.2x",
                        "hist": 2.8,
                        "histDisplay": "2.8x hist",
                        "domainMax": 4,
                        "unit": "x",
                        "goodDirection": "up"
                      }
                    ]
                  },
                  {
                    "id": "embedded-attrition",
                    "value": 6,
                    "display": "$6M",
                    "yoy": -23,
                    "yoyDisplay": "-23% Y/Y",
                    "note": "No change w/w"
                  },
                  {
                    "id": "embedded-nnaov",
                    "value": 23.5,
                    "display": "$23.5M",
                    "yoy": 61,
                    "yoyDisplay": "+61% Y/Y",
                    "note": "No change w/w"
                  }
                ]
              }
            ],
            "axisNote": "Y/Y — the same growth axis as the product and segment tabs",
            "caption": "Attainment is measured against Product FinPlan; velocity and coverage are stated against their historical benchmark"
          },
          "semantic": {
            "metricName": "Q3 Outlook by Product and Measure",
            "definition": "Certified ACV, Attrition ACV and NNAOV for the in-flight fiscal quarter at product-motion grain, each stated against its Product FinPlan target and, where authored, its pipeline velocity and coverage on the governed prior-period benchmark.",
            "sdm": "Analytics Revenue SDM",
            "measure": null,
            "grain": "Fiscal quarter × Business unit × Product motion",
            "lineage": ["Org62 Opportunity", "Org62 Contract", "Product SKU Taxonomy", "Stage Probability Model", "FinPlan FY27 Target"],
            "rls": "Analytics BU hierarchy — viewer sees only their branch",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Q3 Outlook",
            "why": "This portlet draws three certified measures, so it claims none of them as its own — the three tiles above it each carry one measure and hold the links to the Q2 and five-year readings of the same definitions. A portlet claiming one measure while drawing three would be the board making exactly the loose claim it argues against. What the matrix adds is the plan basis: every attainment percentage names the FinPlan version it is graded on, and every historical benchmark is the same day of the prior quarter rather than the prior quarter's close."
          },
          "directMode": {
            "tier": "red",
            "candidates": ["87% of a plan version nobody named", "78% or 91% or 64%, by vintage"],
            "missing": "FinPlan itself and the mapping into it — plan targets live in the planning system at OU and product-family grain, are re-versioned at every reforecast, and nothing in a CRM export states which version a quarter is graded against or how a product family maps onto the product taxonomy",
            "effect": "Every attainment loses its denominator, so the plan tracks have no target and no bands. Velocity and Coverage lose their benchmarks too, because a historical figure here is a governed same-day-of-quarter comparison against the prior period, not the prior period's closing number",
            "thesisTag": "T3",
            "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
            "risk": "Report 128% of plan against the original FinPlan and 96% against the current one in the same week",
            "trustCost": "An attainment with no stated denominator is a ratio with an opinion in it",
            "metrics": {
              "axisNote": "Y/Y on a stated scale — with no plan to read attainment against",
              "caption": "No plan basis and no benchmark date — the values render, the comparisons do not"
            }
          }
        }
      ]
    },
    {
      "id": "outlook-deals",
      "layout": "outlook-deals",
      "portlets": [
        {
          "id": "outlook-deals",
          "kind": "dealRail",
          "label": "Q3 Top ACV Deals",
          "sublabel": "Five largest open opportunities",
          "accent": "#1C6E8C",
          "metrics": {
            "unit": "$M",
            "scaleMax": 3.2,
            "totalDisplay": "$12.5M across five deals",
            "deals": [
              { "id": "bofa", "account": "Bank of America", "value": 3, "display": "$3M" },
              { "id": "aetna", "account": "Aetna", "value": 3, "display": "$3M" },
              { "id": "schwab", "account": "Charles Schwab", "value": 2.3, "display": "$2.3M" },
              { "id": "usbank", "account": "US Bank", "value": 2.1, "display": "$2.1M" },
              { "id": "usgov", "account": "US GOV", "value": 2.1, "display": "$2.1M" }
            ],
            "caption": "Ranked on one certified ACV definition"
          },
          "semantic": {
            "metricName": "Top Open ACV Deals",
            "definition": "The five largest open opportunities by certified ACV expected to close in the fiscal quarter, ranked on one amount definition and scoped to the viewer's branch.",
            "sdm": "Analytics Revenue SDM",
            "measure": "ACV (certified)",
            "grain": "Fiscal quarter × Opportunity",
            "lineage": ["Org62 Opportunity", "Org62 Account", "Product SKU Taxonomy"],
            "rls": "Analytics BU hierarchy — viewer sees only their branch, and opportunity-grain rows are the most tightly scoped rows on the board",
            "certifiedBy": "Analytics RevOps",
            "freshness": "Sep 1, 2026 · 9:00 AM PT",
            "dashboard": "Analytics Q3 Outlook",
            "why": "The ranking is the content, and a ranking is only stable if every row is measured with one formula. Two of these five are within $0.2M of each other, which is inside the spread between the candidate amount columns — so the order means something here only because the definition is settled."
          },
          "directMode": {
            "tier": "yellow",
            "candidates": ["five accounts, five amounts, no stated order"],
            "missing": "One amount definition applied across the five — Amount, Tableau_Amount__c, Analytics_Amount__c and AmountConverted__c all coexist on Opportunity, and the gap between third and fifth place is smaller than the gap between those columns",
            "effect": "The list survives and the order does not. Two of the five change places depending on which column the query author reached for, and nothing in the rail shows that the ranking is the fragile part",
            "thesisTag": "T1",
            "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
            "risk": "Brief an exec on a top five that reorders between two people's versions of the same slide",
            "trustCost": "Ungoverned but usable — the tier where errors are quiet rather than loud",
            "metrics": {
              "totalDisplay": "five deals, no stated order",
              "caption": "Ranked on an undefined amount column — the list survives, the order does not"
            }
          }
        }
      ]
    }
  ]
}
```

### 12.4 Authoring notes for whoever merges this

- **Signed percentage strings.** `yoyDisplay` carries an explicit `+` on positive values,
  which differs from `trendPanel`'s arrays (`["-3%", "13%", …]`). Deliberate: on a diverging
  axis the sign is the first thing read, and a bare `13%` beside a `-3%` makes the reader
  infer it. Keep the `+`.
- **Two portlets share an id with their band** (`outlook-matrix`, `outlook-deals`). Band ids
  and portlet ids live in different maps, so this is legal, but rename the bands to
  `outlook-grid` and `outlook-rail` if it reads confusingly in a diff.
- **`metrics.value` is authored on every cell** even where only `display` is drawn, because
  the stake dot needs the number and a renderer parsing `"$79.5M"` back into 79.5 is exactly
  the kind of quiet derivation this board argues against.
- **`stakeMax` is authored, not computed.** It happens to equal the largest authored value
  today; authoring it means a future edit cannot silently rescale every dot on the tab.
- **No `reconciliation` block on tabs 3 or 4.** See
  [§0.1](#01-implementation-warning--three-authored-gaps-render-them-verbatim).

---

## 13. Sequencing, file ownership and follow-ups

### 13.1 Files this document expects to be written

| File | Owner | Action |
|---|---|---|
| `data/board.json` | **another agent is adding per-account grain** | append the three tab objects from [§12](#12-paste-ready-boardjson) between `exec` and `trend`; touch nothing else |
| `src/fallback.js` | generated | `node scripts/sync-fallback.mjs` after the board.json merge |
| `src/charts/growth.js` | new, unowned | create |
| `src/charts/growthMatrix.js` | new, unowned | create |
| `src/charts/growthSpread.js` | new, unowned | create |
| `src/charts/metricMatrix.js` | new, unowned | create |
| `src/charts/dealRail.js` | new, unowned | create |
| `src/charts/index.js` | unowned | add four `CHARTS` entries, additively — expect `movementFan` to arrive in the same object |
| `styles/tabs.css` | **another agent is reworking animation choreography** | add the three `.panel[data-tab=…]` grids from §5.1/§6.1/§7.1, the two responsive blocks from [§8.2](#82-width), and the `max-width: 1120px` tabnav block from [§9.3](#93-recommended-fix--wrap-the-tabnav-one-breakpoint-earlier) |
| `styles/portlets.css` | **same agent** | chart styles for the four new kinds; the two `rulesCard` and three `statTile` portlets need none |
| `src/tabs.js` | **same agent** | optional `Home`/`End` in `onNavKeydown` ([§9.5](#95-small-additions-worth-making)); nothing else required |
| `src/palette.js` | see `docs/attainment-encoding.md` §12 | that document's `PLAN_THRESHOLDS` / `planBands` prerequisite must land before tab 4's FinPlan bullets |
| `index.html` | unowned | statusbar hint `1–2` → `1–5` |
| `README.md` | unowned | "Two tabs" → five; keyboard table `1 2` → `1–5`; structure and talk-track sections |

### 13.2 Build order

1. `src/charts/growth.js` alone, and verify `growthFraction` against the table in
   [§1.2](#12-where-the-values-actually-land) before anything renders. Every mark on three
   tabs depends on it.
2. `data/board.json` + `sync-fallback.mjs`. The tabs will appear in the nav and render empty
   panels, which is a useful checkpoint on its own: it confirms `TabController` needs no
   change for five tabs.
3. `styles/tabs.css` grids, and the `1120px` tabnav block. Check 1024×768 now, before any
   chart exists, against the budget in [§8.1](#81-height-budget-at-1024--768).
4. `growthMatrix` at five columns (tab 3) first, not tab 2 — it is the same renderer without
   the roll-up branch, so it isolates the cell grammar from the icicle.
5. `growthMatrix`'s `rollup` branch (tab 2).
6. `growthSpread`, which reuses the axis helpers and nothing else.
7. `dealRail` — pure DOM, the cheapest of the four, and worth landing early as a confidence
   check on the tab-4 layout.
8. `metricMatrix` last, because it depends on `attainment.js` and its `palette.js`
   prerequisite from the other document.

### 13.3 Checks worth making by hand

- **The roll-up tie.** On tab 2, confirm the vertical hairline at `x = 298.55` lands exactly
  on the Server│Next boundary in level 2. If it is off by a fraction, the dollar scale is being
  applied twice with different rounding, and the one claim this portlet exists to make is the
  thing that visibly fails.
- **The decade gridlines across five columns.** They should read as five sets of continuous
  vertical rules. If any column's rules sit at a different x, the per-cell `viewBox` is not
  identical or a column track is not equal-width.
- **The 128% FinPlan cell.** It is the only authored value past the bullet's 120 domain end and
  the only exercise of `notchedCapPath()` on the board.
- **The flat velocity dumbbell.** Embedded's 16% against 16% must render as a dot in a ring
  with no stem and read as "flat", not as a mark that failed to draw.
- **The two deal ties.** Identical lengths, on the same frame.
- **Reduced motion.** Toggle it at the OS level and check every conditional mark: the overflow
  notch, the flat dumbbell, the degraded-mode sockets and the severed rails are all nodes whose
  beat may never run, and `settle()` is the only thing standing between them and invisibility.
- **Digits 1–5 and `←`/`→` cycling through five tabs**, with the graph overlay on, and with the
  Knowledge Layer off, since `replayActive()` re-runs the whole choreography in the drained
  palette.

### 13.4 The tradeoff I would most want overruled

**Tab 3 shows a rate label at rest in one column out of five.** The four segment columns carry
the mark, the tooltip and the expand table, and no numeral. I chose that because 28 numerals at
9.5px inside 150px columns would collide with the bars doing the comparison work, and because
the board already has a disclosure pattern that puts every figure one click away. But it means
a presenter cannot read a segment figure off the screen mid-sentence — they have to hover, and
hovering during a demo on a projector is awkward.

The alternative is four columns instead of five: drop the All Segments column from the matrix
(it is already the reference row on tab 2 and the reference row of `seg-spread`), which buys
~30px per column and lets every cell carry a numeral. The cost is that the matrix stops
containing its own reference, and reading "is ENTR worse than the whole?" becomes a cross-tab
comparison rather than a sideways glance.

I would keep five columns and the disclosure. If this board is going to be *presented* more
often than it is going to be *read*, overrule me and take four columns with numerals in
every cell.
