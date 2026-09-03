# Analytics Business Review

A five-tab executive dashboard that argues for the Tableau semantic layer by showing you what the same board looks like without one.

Every number on it is illustrative mock data. Nothing here queries Tableau, Org62, or any MCP endpoint.

**Live:** https://jrstiefeling.github.io/tableau-exec-review/

## Running it

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step, no dependencies, no framework. Plain ES modules, hand-built SVG.

Opening `index.html` straight off the filesystem also works — `file://` blocks the `fetch` of `data/board.json`, so the app falls back to the copy embedded in `src/fallback.js` and shows a notice saying so.

## Deploying

GitHub Pages serves this repo as-is from `main` at the root — there is nothing to build, so a push is the deploy. Pages redeploys in about a minute.

```bash
git push
```

If you fork this or move it, enable Pages once with:

```bash
gh api -X POST repos/OWNER/REPO/pages -f "source[branch]=main" -f "source[path]=/"
```

`.nojekyll` is committed so Pages serves every file verbatim instead of running the contents through Jekyll.

## What it is

Five tabs, composed to fit one viewport each with nothing to scroll:

**Q2 Exec Summary** — four plan-attainment bullet tracks on one shared 0-110% domain, the Embedded-vs-Agentic ACV mix as a two-period alluvial, AE capacity as a unit grid, the Going Well / H2 Focus narrative rails, and the 278-account movement fan.

**Analytics Performance** — the product taxonomy at two levels, as a roll-up bar whose level-1 boundary sits exactly on a level-2 boundary, beside a growth spread and the rules the tab is drawn under.

**Performance by Segment** — twenty-eight cells of product line against segment, each carrying a Y/Y bar on the shared growth scale, a stake dot area-scaled to the ACV behind it, and its own rate as a numeral. There is no All Segments column: that reading is the product tab in full, and both tabs resolve to the same certified ACV measure, so a fifth column would restate rather than find.

**Q3 Outlook** — three measures against three lenses, with FinPlan attainment reusing the exec tab's bullet grammar and historical benchmarks as dumbbells, over the five largest committed deals.

**Five Year Trend** — seven small-multiple trajectories from FY23 to FY27 H1, each with a Y/Y deviation strip under it, the six named drivers behind them, and a card stating the rules every panel on the tab is drawn under.

Switching tabs rebuilds the board rather than revealing it. Each portlet gets its own start time and then runs its own build independently — axes sweep, lines stroke on, arcs fill, numerals roll — so the board assembles as a sequence of components arriving rather than one composition fading up. Coming back to a tab replays the whole choreography at roughly half duration, so it still reads as an entrance without making anyone sit through it twice.

## The argument

Three interactions, in the order they land best.

### 1. The trust dot — provenance is the back of the tile

Every portlet has a coloured dot in its top-right corner. Click it and the tile lifts out of the grid, expands, and flips over.

The reverse face is the certified definition, the semantic model, the grain, the lineage chain from raw sources to certified measure, the row-level scope, who certified it, and when it was last refreshed. Underneath that is a panel headed *Without the Knowledge Layer*, naming what specifically would be missing for this measure, what the effect would be, and what it would cost.

The point is placement. Provenance is not a footnote on another page — it is the reverse side of the thing you are already looking at.

### 2. The Knowledge Layer toggle — watch the board degrade

`See it without the Knowledge Layer`, or press <kbd>K</kbd>.

The board does not break. That is the honest and more uncomfortable version of the argument: losing the semantic layer does not produce an error, it produces a dashboard that still renders perfectly well and quietly stops telling you which way is good.

What changes:

- **NNAOV** stops being `$6M` and starts flickering between `$6.0M`, `$11.2M` and `$4.4M`, then settles on all three at once. Org62 offers a manually-maintained Type picklist, a `New_Logo__c` checkbox, and a first-close-date derivation, and they disagree. There is no arbiter.
- **ACV** does the same across four competing Amount columns — a $22M spread on the headline.
- **Attrition** collapses to `reconstruct`. Org62 holds current contract state, not the prior-period snapshot attrition is measured against.
- **The mix alluvial** stops being a split at all. Without a governed SKU-to-motion taxonomy there is no Embedded / Agentic grouping — only two undifferentiated columns of different widths. The insight is not wrong, it is absent.
- **Three of the four hero tracks lose their target.** A bullet graph without a denominator is not a shorter bar, it is no bar: the track goes dashed and empty and takes a ✕. PipeGen keeps its bar, because yellow means workable but ungoverned and flattening that into *gone* would erase the distinction. The good-direction arrows vanish from every card at once, which is the degradation stated in one stroke.
- **Narrative tags sever.** Every Going Well and H2 Focus card loses the link to the measure that could check it.
- **Colour drains** everywhere. Sentiment was a property of the certified measures; without them it has nowhere to come from.

Each portlet carries its own trust tier: **green** governed, **yellow** available but ungoverned, **red** contested or unavailable, **grey** reconstructable only by hand. Red and grey earn a hard ✕. Yellow never does — it means workable but ungoverned, and marking it the same as *gone* would flatten the distinction the tier system exists to draw.

### 3. Narrative tags — the claim a tile cannot make about itself

Every row on the Going Well and H2 Focus rails carries a mark pointing at the certified measure that could check it. Hover or focus the mark and that measure's portlet lights; click it and the portlet is revealed. A qualitative win with nothing to light is a qualitative win nobody can audit, and turning the Knowledge Layer off severs every one of them.

The same gesture runs the Five Year tab's driver rail: each of the six drivers lights exactly the panels it claims to explain, and the count on the row is derived from that mapping rather than authored beside it. One driver lights five of the seven panels; another lights one. The difference between those two rows is the difference between a cause and an excuse.

## The stock-versus-flow tell

The sharpest single argument on the board is on the Five Year Trend tab, and it is easy to miss.

Look at how FY27 H1 is plotted on a flow versus on a balance.

**ACV** is a *flow* — it accumulates across a period, so half a year is not comparable to a full one. Its H1 point is drawn detached, behind a break, with a dashed run-rate ghost showing what it annualises to.

**Open Pipe** is a *balance* — read at a point in time, so an H1 reading sits on exactly the same footing as any year-end reading. A balance joins the line normally and is never offered a run-rate, because doubling a balance is meaningless.

The layer draws that line by naming measures rather than by declaring a type: ACV carries a period-to-date flag because it accumulates, and the documentation exempts Open Pipe from period-to-date treatment in writing. So a balance the layer declares as a balance is not the same thing as one a chart author decided to treat as one.

A spreadsheet cannot tell those two rows apart. Both are five numbers in a line. Nothing in the raw data distinguishes them. The distinction lives in the measure, and it is the difference between a correct chart and a confidently wrong one built from the same correct numbers.

The **How this tab reads** card states this and three other rules the tab applies, and it is careful about which of them the layer supplies. Two are the layer's: an additivity classification on every measure, which is what makes a roll-up close by construction, and a period-to-date flag on the measures that accumulate, which is what refuses a half year against a full one. Two are the board's own — the zero baseline and the ±10% colour threshold — and polarity is explicitly the board's, because no measure in either model declares a direction of good. Turn off the Knowledge Layer and the card degrades to *rules live in each analyst's head*, which is the point of stating the split: the layer's half is inherited by every chart, export and agent reading the same measures, and the board's half has to be written down somewhere or it is lost.

## Demo talk track

Roughly five minutes.

1. **Open on the Exec Summary.** Let it build. "Every tile here is a certified measure, and every one of them knows what it means."
2. **Point at Attrition.** 104% of plan renders as a miss and −12% Y/Y renders as good news. "Nobody coloured that cell twice. Attrition is lower-is-better, this board says so once, and every mark on every tab inherits it — including the ones on tabs you haven't opened."
3. **Click the trust dot on NNAOV.** Walk the flip: definition, grain, lineage, row-level scope. "This is the back of the tile, not a governance page somebody has to go find."
4. **Press <kbd>3</kbd> for Performance by Segment.** Twenty-eight cells, one growth scale. "Tableau Next is up 1060% in PubSec and down at the bottom of the tab in dollars. Both facts are in one cell, because length is the rate and area is the stake."
5. **Press <kbd>5</kbd> for the Five Year Trend.** Let the seven panels build. Hover driver 6, then driver 4. "Accounting treatment lights one panel. Competitive landscape lights five. One of those is a cause and one is a shape of the whole year."
6. **Look at how FY27 H1 is plotted on ACV.** Detached, behind a break, with a dashed run-rate ghost — and read the flow-versus-balance rule in the (i) beside it. The tell above. This is the moment worth slowing down for.
7. **Open the (i) on that tab.** Read the additivity rule out loud. "Two of these four rules are the layer's and two are ours, and the card says which. That is the difference between governance and a house style."
8. **Press <kbd>K</kbd>.** Let the board rebuild in the drained palette. Sit in it. "Nothing broke. It still renders. It just stopped telling you anything you could defend in this room."
9. **Point at any narrative tag.** Every one is struck through. "Twenty-six claims, and not one of them has a number left to check it against."
10. **Press <kbd>K</kbd> to come back.**

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>1</kbd> … <kbd>5</kbd> | Jump to a tab |
| <kbd>←</kbd> <kbd>→</kbd> | Previous / next tab |
| <kbd>Home</kbd> <kbd>End</kbd> | First / last tab, from inside the tablist |
| <kbd>I</kbd> | How to read this tab |
| <kbd>K</kbd> | Knowledge Layer on / off |
| <kbd>Enter</kbd> | Expand the focused portlet |
| <kbd>Esc</kbd> | Close the expanded portlet, then the reading notes |

Tabs are a proper ARIA tablist with roving tabindex. Portlets are focusable, the expanded card takes focus and returns it, and `prefers-reduced-motion` is honoured in JS as well as CSS — every animation primitive jumps straight to its final state rather than merely running faster.

## Data

`data/board.json` is the single source of truth. Everything — copy, values, semantic blocks, degradation blocks, colours, chart types — lives there. No content is hardcoded in JS.

Each portlet authors its governed content once, plus a `directMode` block describing only what changes when the semantic layer is removed. Nothing is authored twice; `applyDirectOverrides` merges the two at render time.

```jsonc
{
  "id": "kpi-acv",
  "kind": "attainment",            // selects the renderer from src/charts/
  "metrics": { "display": "$82M", "yoy": -28, "plan": 70,
               "goodDirection": "up" },
  "semantic": { "measure": "ACV (certified)", "grain": "...",
                "lineage": [...], "rls": "...", "freshness": "..." },
  "directMode": { "tier": "red", "candidates": ["$82M", "$96M", "$74M"],
                  "missing": "...", "effect": "...", "thesis": "...",
                  "metrics": { "display": "$82 / $96 / $74M" } }
}
```

Changing how a metric is drawn is a one-word edit to `kind`.

**After editing `data/board.json`, regenerate the embedded fallback:**

```bash
node scripts/sync-fallback.mjs
```

`src/fallback.js` is a generated byte-for-byte copy that keeps the board from rendering blank when the JSON cannot be fetched. Nothing watches for you.

`data/tableau-source-catalog.json` is a forward-looking runbook describing the query shapes an agent *would* use if this board were ever pointed at live Tableau data. Nothing in `src/` reads it, nothing in it has been executed, and every LUID, SDM apiName, workspace id and dashboard id in it is a `<TBD: ...>` placeholder on purpose.

## Structure

```
index.html
data/
  board.json                     all content and values
  tableau-source-catalog.json    forward-looking live-query runbook
src/
  main.js          boot, controls, keyboard, mode switching
  tabs.js          tab router and the entrance choreographer
  portlet.js       portlet lifecycle, trust dot, provenance face
  semantic.js      direct-mode merge, trust tiers, portlet flattening
  inspector.js     expand-and-flip, with a ghost holding the grid place
  notes.js         the per-tab (i) sheet and the rules it carries
  anim.js          strokeDraw, dashDraw, countUp, scramble, growFrom, veil
  palette.js       mode-aware colours, sentiment, good-direction, plan bands
  svg.js           SVG construction, scales, path builders
  tooltip.js       one shared tooltip
  charts/          attainment, mixBar, statTile, cardRail, trendPanel,
                   driverRail, rulesCard, movementFan, growthMatrix,
                   groupMovement, metricMatrix, dealRail
                   growth.js — the shared symlog scale, not a renderer
  fallback.js      GENERATED — do not edit
styles/
  base.css         tokens, both theme states, page chrome
  tabs.css         tab nav, panel lifecycle, per-tab grids
  portlets.css     portlet shell, provenance face, all chart styles
scripts/
  sync-fallback.mjs
```

Every chart takes the same shape — `mount(host, ctx)` returning `{ build(signal), prime, settle }` — which is what lets the choreographer drive twenty-nine portlets across twelve chart forms without knowing anything about any of them, and lets a tab switch cancel a build mid-animation without writing into detached DOM. `prime` and `settle` are the veil contract: a chart hides everything it will reveal before stage one, and `settle` restores any mark whose beat never ran, so a conditional mark cannot be left invisible and an unveiled one cannot flash.

## Not in scope

There is no live data tier. The fetch chain is `data/board.json` → embedded fallback, and there is no third option. There is no Demo/Real toggle; the app has one dataset. The `semantic` blocks are authored illustrative content, not the results of lookups — they are the demo's claims about what a semantic layer provides, not a report on a real one.
