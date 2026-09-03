# Redesign: composing for the screen the reader actually has

Status: plan, then implementation notes.

## 1. What is actually wrong

The board is not broken. It is composed for a viewport nobody is looking at.

Measured, at the size the reviewer's screenshots were taken:

| viewport | `.panel-bands` height | exec bands | worst overflow |
| --- | --- | --- | --- |
| 1024x580 | 448px | 98 / 134 / 96 / 93 | `.rail` hides 174px and 238px |
| 1280x620 | 488px | 108 / 148 / 105 / 102 | `.rules` hides 203-256px |
| 1440x720 | 582px | 128 / 175 / 125 / 122 | `.rules` hides 168px |

Every one of those numbers is a portlet asked to hold a fixed composition in
less room than the composition needs. The board was verified at 768 tall,
which is a browser window nobody has on a laptop once chrome is subtracted,
so the tuning was done one whole band's worth of height too generously.

The failure then compounds twice.

**It compounds through the aspect ratio.** Every chart is a fixed viewBox
scaled by `preserveAspectRatio: xMidYMid meet`, so a chart in a box whose
aspect does not match its viewBox loses the mismatch as letterboxing. The
trend panel is the extreme case: a 300x264 viewBox (1.14:1) in a box of about
200x75 (2.7:1) draws at 85x75 and throws away 57% of the width it was given.
That is the "40px faint wisp" — not a small chart, a chart drawn at 24% of the
area it was allocated.

**It compounds through the overflow valves.** Three portlet forms have
`overflow-y: auto` as their answer to running out of room: `.rail`, `.rules`
and `.drivers`. A scroll valve means the composition never reports that it
does not fit, so nothing upstream ever had to be cut. Going Well shows 1 card
of 5. H2 Focus shows 1 of 5 — the reviewer counted 4 because the fifth is two
scroll-heights down.

## 2. The design floor, restated

**Primary case: 580-600px of content height at 1024-1280 wide.** Verified at
1024x580, 1280x620, 1440x720 and 1920x1080, governed and degraded.

At 1024x580 the chrome costs 58 (topbar) + 27 (status) + 21 (panel head) + 18
(panel inset) + 8 (gap) = 132px. About 20px of that is recoverable from the
chrome itself (a 26px identity mark and 7px topbar padding are sized for a
desktop). So the budget to design against is:

> **~470px of band height at 1024x580.**

Three bands of ~150px, or two of ~230px. Not four of 105px, which is what the
exec tab is currently trying to do.

A new `@media (max-height: 700px)` tier carries the compression. The current
tightest tier is 860px tall, which never engages on the machine in question.

## 3. Where the height comes from

Three sources, in order of size.

**(a) The three rules cards, reclaimed.** "How these tabs read", "How this
matrix reads" and "How this tab reads" occupy a full portlet slot each on the
product, segment and five-year tabs, and each one internally scrolls — so they
are simultaneously the most intrusive and the least readable thing on their
tab. They move behind an **(i) affordance in the panel head**, as a flyover.
This is the reviewer's own suggestion and it is right: this is read-once
content. Reclaiming those slots is the main budget for the charts.

**(b) The exec tab loses a band.** Four bands do not fit in 470px at any
honest allocation. The narrative pair becomes a full-height rail on the right
of the lower two rows, which turns what was a 96px band into 320px of vertical
space and lets the account fan have the row it was sharing.

**(c) The five-year panel grid loses a row.** Seven panels in a 3x3 grid
(which is what 1024 wide currently resolves to) is nine cells for seven
panels at 155px each. Seven panels in 4x2, with ACV spanning two columns as
the hero, is 228px per row.

## 4. Tab by tab

### Exec — hero strip, main story, priorities rail

```
columns: 1fr | minmax(216px, 0.235fr)
rows:    0.82fr | 1.05fr | 1fr

+-----------------------------------------------+
| NNAOV | ACV | ATTRITION | PIPEGEN             |  hero, spans both columns
+---------------------------------+-------------+
| ACV by product motion  | AE HC  | GOING WELL  |
+---------------------------------+-------------+
| Account ACV movement (fan)      | H2 FOCUS    |
+---------------------------------+-------------+
```

- KPI cards go from 98px to ~127px tall. That headroom is spent entirely on
  the attainment track, which is the reviewer's defect 7: track viewBox 44 ->
  52 units tall, band 16 -> 20, bar 12 -> 15, the `plan` label from 8.5px to
  9.5px and never dropped, polarity arrows from 18 to 22 units. The numeral
  gives up two points to pay for it — a chart that cannot be read is worth
  less than the number it decorates.
- The fan gets ~750x150 instead of ~1230x100. It loses 39% of its width and
  gains 50% of its height, which is the right trade: the vertical axis is the
  index (the data), the horizontal is just the run.
- Going Well and H2 Focus are rebuilt as compact rows (section 5).

### Analytics Performance (Product) — the matrix is the hero

Rules card gone. Two columns instead of two columns plus a stacked side rail:
`minmax(0, 2.55fr) | minmax(228px, 1fr)`, with the within-motion spread taking
the full height of the side column instead of 55% of it. The matrix — seven
product lines, a roll-up bar and an axis strip — is unambiguously the hero and
gets the width and the deeper ink to say so.

### Performance by Segment — same shape, five-row spread

Rules card gone; `seg-spread` takes the full side column. Five spread rows in
470px instead of 210px, so the "1076 points apart" readings stop being 12px
tall.

### Q3 Outlook — fix the collision, unclip the head tiles

- Defect 6, the text collision bottom-left of the matrix: `.mmx-grid` has
  three `minmax(84px, 1fr)` rows plus an `auto` axis row inside a flex item
  that is shorter than their sum, so the absolutely-positioned axis ticks
  paint over `.mmx-foot`. The grid becomes `min-height: 0` with its own
  overflow contained, the row floor drops at short heights, and the foot is
  `flex: none` below it rather than in the same crush.
- The three header stat tiles clip their caption ("87% of Product FinPlan").
  The head row gains height from the tightened chrome and the caption clamps
  to a whole line rather than a partial one.

### Five Year — the tab that has to change most

Rules card gone. Panel grid becomes 4x2 at every width down to 1024, with
**ACV as a double-width hero**:

```
row 1: [ ACV, span 2 ] [ Attrition ] [ Revenue ]
row 2: [ AE Capacity ] [ AE Productivity ] [ AOV ] [ NNAOV ]
```

Placement is explicit per portlet id, not auto-flow, so the reading order is
the argument rather than an accident of the JSON.

What this does to the chart, measured per panel at 1024x580:

| | before | after |
| --- | --- | --- |
| cell | 244 x 155 | 190 x 228 |
| svg box | 200 x 75 | 168 x 172 |
| drawn chart | 85 x 75 | 168 x 172 |
| area | 6,375px² | 28,900px² |

A 4.5x increase, most of it from the letterboxing going away rather than from
the extra pixels. On top of that:

- The hero panel takes a wider viewBox (`span: 2` in its spec) so it does not
  letterbox in a 2.1:1 cell.
- `PAD.bottom` 76 -> 62, so the plot gets 14 units back.
- The Y/Y deviation strip: band height 22 -> 26 units, reach 10 -> 12, cell
  width factor 0.72 -> 0.82. This is the strip the reviewer could not see.
- Line stroke 2.4 -> 2.8, dots 3.6 -> 4.2, tick labels 9px -> 10px.
- The area fill becomes a real gradient rather than a flat 10% wash.
- The headline numeral drops from `clamp(17px, 1.6vw, 24px)` to
  `clamp(15px, 1.3vw, 21px)`. The tab's purpose is trend; the numeral is the
  caption on the trend, not the other way round.

## 5. Going Well and H2 Focus

The rule is: **every item visible, no internal scrollbar, detail behind an
interaction.**

Each card becomes one row: numbered marker, title at 11.5px semibold on a
single line, and the measure tag chip that already exists. Five rows always
fit. The body copy — which is where the length is — moves to two places that
already exist in this codebase rather than to anything new:

- **hover / focus** puts title and body in the shared tooltip;
- **click, or Enter on the portlet** opens the existing inspector expand,
  where all five cards render in full at reading size.

Titles that outrun a 216px rail (there are three) ellipsise rather than wrap,
because a wrapped row breaks the scan down the numbered markers, and the full
string is one hover away.

The two rails also stop being colourless. `going-well` is authored
`tone: positive` and `h2-focus` `tone: forward`; those tones now tint the card
surface, so the pair reads as "what worked / what is next" before a word is
read.

## 6. The (i) flyover, and why it is not the provenance dot

**Two distinct affordances, deliberately.** They differ in scope, and scope is
the thing an affordance has to communicate:

- The **trust dot** is per portlet. It answers "where did *this number* come
  from" — certified definition, semantic model, grain, row-level scope, and
  what this specific tile degrades to. It carries the tier colour, which is
  the board's whole argument, and it has to stay on the card because it is
  about the card.
- The **(i)** is per tab. It answers "how do I read *these marks*" —
  comparability, scaling, polarity, the colour threshold. It applies to every
  portlet on the tab equally.

Consolidating them would mean either repeating four tab-level rules on every
card's reverse face, or attaching them to one arbitrarily chosen card. Both are
worse than two affordances that are honestly two different questions. They are
also visually distinct and never adjacent: the dot is a filled tier-coloured
ring in the portlet head, the (i) is an outlined glyph in the panel head next
to the headline.

Implementation keeps the three `rulesCard` portlet specs in `board.json`
**exactly as authored** — including the `semantic` and `directMode` blocks that
were just corrected. `TabController` diverts portlets of that kind out of the
band and into the tab's notes popover instead of mounting them in the grid.
They are also kept out of `this.portlets` and `byTab`, which means:

- they are not in the entrance sweep (they are not on screen at entrance);
- `graph.js` already guards every lookup with `if (!a || !b) return`, so the
  knowledge graph degrades to ignoring them rather than throwing.

The popover builds its content on open with its own `AbortController` and
re-primes (veils) on close, so the rules diagrams keep their draw-on and the
veil contract is not weakened: **every mark the rules card draws stays in its
existing veil list.**

## 7. Colour

The direction stays light editorial. What changes is that colour starts
carrying the argument instead of decorating it.

- **Per-tab identity.** `--tab-accent` is already set on every panel by
  `tabs.js` and used by nothing. It now drives the kicker, the headline rule,
  the tab indicator and a soft per-panel wash, so moving between tabs changes
  the colour temperature of the room. Five distinct accents, one per tab.
- **Tinted card surfaces.** `.portlet-front` gets a 168° gradient from 5% of
  its own accent to card white. Present, not loud.
- **Sentiment on the surface where the card is a verdict.** The four KPI cards
  take a wash in their own plan tone, set from `toneColor()` so it drains in
  direct mode with everything else. Three washed red and one washed green is
  the quarter, legible across a room.
- **Deeper ink for hierarchy.** `--ink` #17181c -> #14161a, `--ink-soft`
  #565a63 -> #4d525c. Headlines and hero numerals get the deep end; captions
  and axis furniture get the light end. The current board gives almost
  everything the same weight.
- **Stronger sentiment saturation** and matching wash tokens:
  `--pos` #12806a -> #0f7a5e, `--neg` #c0483c -> #c0392b, `--warn` #92640a ->
  #a06b05, each with a `-wash` and a `-lift` companion.
- **Gradient area fills** in the trend panels, via a `<linearGradient>` with a
  monotonically-uniqued id (there is no `<defs>` convention in this codebase
  because of id collisions across the re-render the Knowledge Layer toggle
  triggers; a module counter closes that).

Trust tiers do not change and do not drain. In direct mode the only colour
left on the board is still the colour saying the number cannot be trusted.

## 8. Typography

Faces are fixed: Avant Garde For Salesforce Demi for display, Salesforce Sans
for body. The line-height floors in `styles/fonts.css` (1.014 for currency
numerals, 1.152 for descender prose, published as `--lh-display-num: 1.12` and
`--lh-display-text: 1.22`) are properties of the outlines and are respected —
the two literal `line-height: 1.14` values on `.attain-value` and
`.stat-value` are replaced by the token so there is one place to re-measure.

Sizes rebalance toward the roles that are currently unreadable on a laptop:

| role | before | after |
| --- | --- | --- |
| `.attain-pct` | 11.5-14px | 13-16px |
| `.attain-axis` | 8.5px | 9.5px |
| `.rail-copy` | 11.5px | 12px |
| rules body (in flyover) | 10.5px | 12.5px |
| `.trend-tick` | 9px | 10px |
| `.trend-partial-note` | 7.5px | 8.5px |
| `.mmx-axis-tick` | 7.5px | 8.5px |
| `.stat-footnote` | 9.5px | 10px |
| `.trend-headline` | 17-24px | 15-21px (pays for the chart) |

## 9. What is cut to fit 580px

Stated plainly, because the premise is that nothing scrolls:

1. **Card body copy on the two exec narrative rails.** Behind hover and expand.
2. **The three rules cards' place on the page.** Behind the (i).
3. **The attainment caption** stays dropped below 700px tall (it already
   dropped below 960); it remains a row of the expand table.
4. **The AE headcount footnote** clamps to one line with an ellipsis at 700px
   and below, with the full string on hover. It is the one sentence on the
   board that is metadata about a denominator rather than a reading.
5. **The 3x3 fallback for the five-year grid** is removed. 4x2 is the layout at
   every width down to 1024, and below 900 the board already collapses to a
   single scrolling column by existing design.

Nothing else. No figure changes, no reconciliation UI, no new commentary.

## 10. Preserved, and verified as preserved

- Two-stage entrance: shells settle, then one left-to-right sweep by
  horizontal position. The exec tab's new rail is measured by `centreWithin`
  like everything else, so it joins the sweep at its true horizontal position.
- Veil contract: every new mark joins its chart's veil list. `veil().hide()`
  is not undone anywhere.
- Per-portlet provenance flip; global Knowledge Layer toggle with degraded
  rendering; knowledge-graph overlay with cross-tab jump badges; keyboard
  navigation across all five tabs; `prefers-reduced-motion` jumping to final
  state; click-to-expand detail.
- `node scripts/sync-fallback.mjs` after every `board.json` edit.
