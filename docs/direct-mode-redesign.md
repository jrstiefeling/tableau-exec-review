# Direct mode redesign — the semantic layer against the raw source

**Status:** specification and rendered mockups. Nothing in `src/`, `data/` or `styles/` has been
modified. Mockups are standalone in `docs/mockups/direct/` and import nothing from the app.

**Both open questions in the brief are now closed by the user.** Tokenomics is option (a), modeled
and labelled. Sources are one combined *direct to source* state, no picker, each of the 29
`directMode` blocks authored once. This document builds only those.

---

## 1. The argument, in two sentences

> A semantic layer is not a faster way to reach the warehouse; it is the place where the business's
> definitions live, so that "ACV for Q2" resolves to one measure, one date anchor and one set of
> mandatory filters rather than to whichever of four plausible amount columns an agent happened to
> sample. Query the sources directly and you still get an answer — a confident, well-formatted,
> plausible answer that costs roughly eleven times the tokens to produce and that nothing in the
> pipeline is able to tell you is wrong.

The second clause is the whole redesign. The current direct mode argues *absence*: it drains the
colour, strikes the provenance fields and shows candidate lists, which says **you would not be able
to answer this**. That is not the failure mode anyone is afraid of. The failure mode is a board that
looks exactly like this one and is wrong.

---

## 2. What is being reversed

| | Shipped direct mode | This proposal |
|---|---|---|
| Palette | Drains to `DRAINED` | **No drain.** Full governed palette, full contrast |
| Figures | Governed figures, with a `scramble` flicker over candidate sets | **Different figures.** One confidently wrong value per portlet |
| Numerals | Scrambling, i.e. visibly uncertain | Crisp and settled |
| Red tier | Struck through with an X | **No X.** An X contradicts a confident wrong number |
| What the viewer concludes | "The data isn't there" | "The data is there and I cannot tell that it's wrong" |
| Grey tier | "Reconstruct manually" | **"Neither path can answer this"** — the honesty tier |

The drain has to go. A greyed-out board is a board announcing its own unreliability, and no
hallucination has ever done that. Every pixel of the degraded state should be as confident as the
governed one; the argument is carried by *what the numbers say*, not by how they look.

---

## 3. The toggle

**`Governed` ⇄ `Direct to source`.**

The shipped word was `Direct`, which was ambiguous in exactly the way the user's complaint
identified — direct to *what*? `Direct to source` names the thing being read: Salesforce objects
and the lakehouse tables underneath the extract, with no semantic layer in between.

Same control object as today: a lit segment naming the current state, its tier dot, and a button
offering the other mode. Measured at 11.5px semibold, `Direct to source` is 96px, and the pill comes
to 232px total — it fits at 1024px because the Knowledge Graph button that used to sit beside it has
been removed (`docs/redesign.md` §3b). No new control is added anywhere.

Supporting copy, so the toggle does not have to carry the whole idea:

- Topbar eyebrow, direct only: `Analytics BU · Agent, no semantic layer`
- `title` / `aria-label` on the switch: *An agent querying Salesforce objects and the lakehouse
  directly. No certified measures, no mandatory filters, no business preferences.*

---

## 4. The hard problem: wrong answers look identical to right ones

This is the design question the brief flags, and it is genuinely a tension rather than a trick. If
the wrong board looks fine, the demo has no visible content. If the wrong board looks obviously
broken, the argument is false. Four moves resolve it.

### 4.1 The wrong numbers are computed, not invented

Every shown figure is the governed figure put through **one named, documented failure mode**, with
the arithmetic recorded in a mandatory `shownFrom` field. The board does not invent hallucinations;
it *derives* them from the 20 silent failure modes the layer documents
(`guardrails.silentFailureModeCount` in `data/tableau-source-catalog.json`).

Where the repository states a multiplier, it is used. Where it does not, the multiplier is declared
as a **model input** in the table below — the same discipline TM-1 applies to tokens, and the reason
`shownFrom` is not optional.

| Hazard | Multiplier | Source |
|---|---|---|
| Field ambiguity, four amount columns, the low candidate | ×0.902 | **Stated** — `kpi-acv.directMode.candidates` already ships `$74M` against `$82M` |
| Field ambiguity, the high candidate | ×1.867 | **Stated** — `$310M` against `$166M` on `trend-nnaov`, and `$11.2M` against `$6M` on `kpi-nnaov`. The board's two existing candidate sets already agree on this ratio |
| Hierarchy fan-out, no dedup filter | ×3 | **Stated** — the Forecasting model documents a 3×–10× overcount; the low end is used |
| Flow-as-stock, a balance annualised | ×2 | **Stated** — `trend-aov.directMode` already authors `$7188M` |
| Actuals one month in arrears, quarter read as complete | ×0.667 | **Model input** — two of three months present, flat monthly distribution |
| Business exclusion convention not applied (`APM_L120 = 'Other'` retained) | ×1.085 | **Model input** |
| Account identity not conformed to the consolidated key | +28 keys on 260 | **Model input** |

Two consequences worth noticing, because they are the argument rather than decoration:

- **A multiplicative error cancels in a rate.** `kpi-pipegen` fans out 3× and its Y/Y stays exactly
  `-8%`, because both years are multiplied. So the only wrong figure on the card is the level — the
  one an executive is least likely to re-derive, next to a growth rate that is completely correct.
- **`kpi-attrition` turns green.** Attrition is lower-is-better, so a quarter that is short a
  month's actuals reads as `69% of plan` instead of `104%`, `-41% Y/Y` instead of `-12%`, and the
  card washes from amber to positive. The worst-reading tile on the board becomes the best news in
  it, and every figure on it is individually plausible.

### 4.2 The per-tile signal is deliberately quiet

Each degraded portlet head carries a 14px `⚠` chip (`!` for a wrong figure, `=` where neither path
can answer). It is the size of a footnote mark, and that is a decision, not an oversight: a loud
badge on every tile would tell the viewer the board is untrustworthy, which is the conclusion the
mode is trying to make them *reach* rather than be told.

The loud signal lives in the topbar, where it belongs — always visible, high contrast, naming the
mode. **Mode-level signal loud, tile-level signal quiet.** The first says *the board is in this
state*; the second says *this tile is lying*, and only if you look.

### 4.3 The reveal is choreographed

Degradation is enacted rather than displayed. On switching to `Direct to source`:

| Stage | ms | What happens |
|---|---|---|
| 0 · roll | 0–380 | Every numeral rolls from its governed value to its shown value, `countUp(el, shown, { from: governed })`. Sentiment colours re-tone *during* the roll, so attrition turns green while its number is moving |
| 1 · settle | 380–620 | Shells settle, unchanged from today |
| 2 · sweep | 620–1040 | Left-to-right reveal, unchanged from today |
| 3 · marks | 1040–1420 | The `⚠` chips fade in on a 220ms stagger |

The beat between stage 2 and stage 3 is the point. For about a second the board reads as complete,
settled and correct. Then the marks arrive.

`anim.js` already supports `countUp` with a `from` option, so stage 0 needs no new primitive.

### 4.4 The audit pass — held, not toggled

Holding `D` strikes every shown figure and sets the certified one beside it with the delta.

It is a hold and not a toggle on purpose. A toggle invites the viewer to leave it on, at which point
the board becomes a reconciliation view — and this board reconciles nothing and offers no
resolution. The audit pass answers *which of these is wrong and by how much* for as long as the key
is down, and then the board goes back to looking correct. Release is the argument.

See `shots/audit-pass-1024.png`: the same four cards governed, direct, and audited.

---

## 5. Where the two axes surface

Three explanatory affordances, three scopes, no overlap. This reconciles the existing provenance
flip with the new (i) flyover from `docs/redesign.md` §3a.

| Affordance | Scope | Question it answers | Carries |
|---|---|---|---|
| **Trust dot → provenance flip** | One portlet | Where did *this figure* come from? | Correctness. In direct mode: the hazard, the arithmetic, the certified delta, and what the layer does *not* fix |
| **(i) flyover** | One tab | How do I read these marks? | The rules cards, plus **TM-1** as a fifth rule |
| **Tokenomics pill** | The whole conversation | What did this cost? | The two figures, always visible in the mode |

**Correctness is per-portlet; tokenomics is global.** Cost is a property of the conversation, not of
any one tile — 29 copies of one global fact would be noise, and the number would have to be
apportioned in a way the model does not support. So the pill is single and lives in the panel head.

**It sits in the panel head row, right-aligned, and costs zero band height.** This matters: the
design floor is 470px of band height at 1024×580 and nothing scrolls. A ribbon under the topbar
would have eaten a band. The panel headline is left-aligned and short, so the row already has the
horizontal room. Note also that the footer status bar was deleted (`docs/redesign.md` §3c), so there
is no persistent strip available and none is reintroduced.

Clicking the pill opens the (i) directly on the TM-1 section.

---

## 6. The vocabulary — three provenance states, and a fourth that is not one

The board is not a semantic-layer-only artifact. Some figures will be supplemented from a Google
Sheet, a direct Salesforce query or a Snowflake table, and **that is legitimate.** A sheet
maintained by a human analyst is a real way to get a number onto a board, and pretending otherwise
would be the overclaim this board exists to argue against. The enemy was never the direct
connection. The enemy is an agent *inferring a definition* from raw schema and presenting the result
at the same confidence as a certified measure.

That gives three provenance states a *figure* can occupy, plus grey, which is the absence of a
figure rather than a fourth kind of one.

| State | Hex | Label | Short | Means |
|---|---|---|---|---|
| certified | `#12806a` | Certified measure | `Certified` | A governed measure from one of the two SDMs, with its declared grain, mandatory filters and additivity classification |
| supplemented | `#92640a` | Supplemented source | `Supplemented` | A real, human-authored figure from outside the layer. A definition exists and a person stands behind it. **Nothing enforces the definition, nothing versions it, and nothing guarantees it aggregates or means the same thing next quarter** |
| inferred | `#c0483c` | Inferred by the agent | `Inferred` | An agent read raw schema and decided for itself what the measure means. Confident, plausible, unverifiable. Only ever reached in Direct to source |
| — | `#8d93a1` | Authored narrative | `Narrative` | No figure. Prose from the source deck. Cannot be numerically wrong |

Same four hex values the board already ships. No palette churn.

### 6.1 The rule that resolves mixed panels

**A portlet's state is the weakest load-bearing input it has, evaluated in the current mode.**

So a panel combining a certified measure with a supplemented dimension reads amber in governed mode
and red in direct — because inferred is weaker than supplemented. And a panel that is *purely*
supplemented reads amber in **both** modes, because there is no layer guarantee there to withdraw.

Trend panels additionally carry `pointProvenance`, a per-point state, because a five-year series
whose certified history reaches three years genuinely is two different things in one chart.

### 6.2 Two axes, one mark

Provenance is a property of the portlet. Detectability — *would you notice* — is a property of the
mode. Putting both on the trust dot overloaded it; putting them on two separate marks put three
affordances in a portlet head that fits two, and truncated the KPI titles at 1024.

So they merge: **the dot carries provenance as its colour and detectability as a glyph inside it.**

| Glyph | Means |
|---|---|
| `!` | Wrong, and nothing in the picture would tell you |
| `?` | Wrong by an amount a magnitude or shape check finds |
| *none* | The figure did not move, because it never went through the layer |

One mark, two readings, no width cost, and the regression fixed by deletion rather than by
accommodation. **Which dots have a glyph is which panels are lying**, readable at a glance.

### 6.3 What this does to the board

**Nine of twenty-nine panels change when you flip the toggle.** The other twenty were never
protected by the layer and never claimed to be. That is a sharper and far more credible finding than
"everything is broken", and it is only available because the middle tier exists.

| | Governed | Direct to source |
|---|---|---|
| Certified | 10 | 0 |
| Supplemented | 13 | 4 |
| Inferred | 0 | 19 |
| Narrative | 6 | 6 |

Detectability in direct mode: **17 silent, 2 catchable, 10 unmoved.**

**Grey survives, and it is distinct.** Its occupants dropped from nine to six, because everything
that was grey-as-"no measure anywhere" — headcount, revenue, AOV, capacity — is properly
*supplemented*, not absent. What is left in grey is the six cards that carry no figure at all: the
two exec rails, the three rules cards, and the driver rail. The distinction is real: a supplemented
figure *can* be wrong, and a narrative card cannot be numerically wrong. It also behaves
differently on the flip — supplemented sits still because it bypassed the layer, narrative sits
still because there is nothing to move, and narrative additionally *loses its measure tags*, which
is visible on the driver rail.

**Green now has ten occupants**, which fixes the dead rung. Previously it had none, and I flagged
that a vocabulary with no safe rung reads as rigged. That was a symptom of the missing middle tier,
exactly as diagnosed.

### 6.4 The two beats to protect

Both survive untouched, and both are on the Exec tab among the certified ten:

- **`kpi-attrition` turns green.** Lower-is-better, so a quarter short one month of arrears actuals
  reads 69% of plan instead of 104% and `-41% Y/Y` instead of `-12%`. The worst tile on the board
  becomes the best news in it.
- **`kpi-pipegen`'s fan-out cancels in the Y/Y.** ×3 on both years leaves the rate at exactly
  `-8%`. The only wrong figure on the card is the level — the one nobody re-derives.

A third beat arrives free from the new architecture: **`trend-nnaov`'s shape breaks.** Its three
certified points lift ×1.867 while its two supplemented points do not, so FY25 ends up *above*
FY23 and a monotonic five-year decline becomes a rise and then a fall. The supplemented years are
what make the inferred ones checkable — which is the middle tier earning its place in the argument.

---

## 7. TM-1 — the token model

Option (a), modeled and labelled. Every input is a count re-derivable from this repository.

### 7.1 Constants

| Constant | Value | How it was obtained |
|---|---|---|
| Characters per token | 4 | Stated assumption |
| Governed field catalogue | 2,100 tokens | **Measured.** `docs/semantic-layer.md` §3.1–3.3 is 8,309 characters |
| One governed utterance | ~50 tokens | **Measured.** `kpi-acv.utteranceShape` is 199 characters |
| One aggregated result row | 18 tokens | **Measured.** A grouped `{dimension, measure}` row is ~70 characters |
| One raw opportunity row | 104 tokens | **Measured.** A 16-field JSON opportunity record is 418 characters |
| Source tables under the extract | 16 | **Counted.** 15 input CTEs plus the flattened user hierarchy |
| Distinct documented fields | 214 | **Counted** across §3 — 140 Forecasting, 81 Specialist, 7 names appearing in both with different definitions |
| Silent failure modes | 20 | **Counted.** `guardrails.silentFailureModes` |
| Paired AEs / population rows | 649 / 1,000 | **Stated.** `acv-ae-fan`. Was 260 / 278 against `acv-account-fan`, whose subject is withdrawn |
| Hierarchy fan-out | 3×–10× | **Stated verbatim** in the Forecasting model. The low end is used |

### 7.2 Unit of comparison

**One board build: 29 portlets, cold start.** The board is what the viewer is looking at, and a
board-level unit amortises session discovery fairly on both sides rather than charging it to one
tile.

Portlet classes: 22 measure portlets, 1 population portlet (`acv-ae-fan`), 6 narrative and
rules portlets that issue no query. The population portlet's row count went up — 1,000 rather than
278 — when its subject moved from accounts to AEs, so the governed side of §7.3 carries more rows
for the same one round trip, which if anything sharpens the comparison.

### 7.3 Governed

| Step | Round trips | Tokens |
|---|---|---|
| Discovery, once per session — the calculated-measure and dimension catalogue dominates | 4 | 2,100 |
| 22 measure portlets × 2 utterances, answers of 1–2 rows | 44 | 3,000 |
| 1 population portlet, one grouped pull, 520 rows (260 accounts × 2 fiscal years) | 1 | 9,400 |
| 6 narrative and rules portlets, authored | 0 | 0 |
| **Total** | **49** | **14,500** |

### 7.4 Direct to source

| Step | Round trips | Tokens | Grounded in |
|---|---|---|---|
| DDL across 16 source tables, name and type only, ~220 column rows | 2 | 1,700 | `underlyingDataSourceCteValues` |
| Recover meaning: 50-row sample per measure family, 9 families | 9 | 46,800 | Nine measure families on the board; no field descriptions in raw DDL |
| Find the fiscal-year boundary — no fiscal field on the raw object | 1 | 5,200 | Fiscal year starts 1 February |
| Join and filter iteration, 3 attempts per family | 27 | 4,900 | 3× (120 out + 60 in) per family |
| Magnitude check at two grains per family, because nothing certifies the answer | 9 | 7,500 | `magnitudeSanityCheckBeforeRendering` |
| 22 final aggregates | 22 | 3,300 | |
| Population portlet at pre-dedup grain: 278 opportunities × 3 hierarchy levels = 834 rows | 1 | 86,700 | The stated 3× low end |
| **Total** | **71** | **156,100** |

### 7.5 The result

**~11× tokens. 71 round trips against 49.** Per portlet, ~5,400 against ~500.

Deliberately conservative in three specific ways, each of which a technical audience will look for:

1. The governed path is charged its **full cold-start discovery**. Amortised across a warm session
   the ratio is far larger, and that number is not used.
2. The direct path is credited with **aggregating in SQL** rather than dragging rows into context to
   sum them, which is what a competent agent does. This is the strongest available objection and the
   model concedes it up front.
3. The raw surface is assumed **exactly as wide as the curated model documents**. A raw Opportunity
   object is wider than a 140-field curated model; assuming parity understates the direct side.

**No latency claim in seconds.** No timing data exists in any source in this repository, so the only
speed claim is the round-trip count, and 71 : 49 is counted rather than modelled. This is a claim
dropped from the brief's original framing.

### 7.6 The supplemented path, and the asymmetry it creates

A supplemented source has a materially different token profile from either of the other two, and it
does not rank where the argument would like. Stating it, because a technical audience will spot it
if it is hidden.

**A Google Sheet has no discovery cost.** A human told you the tab name and what the columns mean,
so there is no catalogue to read, no schema to enumerate and no sampling pass to recover meaning.
There is one fixed pull of the whole sheet, and no verification round trips — not because the figure
is trustworthy, but because **there is nothing to verify it against.**

| Path | Round trips | Tokens | Per panel |
|---|---|---|---|
| Supplemented — one sheet, 5 years × 7 metrics, read whole | 1 | ~600 | **~150** over the four panels it feeds |
| Certified — 2 utterances, plus amortised catalogue | 2 | ~140 + share of 2,100 | **~500** |
| Inferred — sampling, iteration, verification | ~2.4 | — | **~5,400** |

So the ordering is: **supplemented is the cheapest path, at roughly a third of governed and a
thirty-sixth of inferred, and it is the path with no guarantees at all.**

This is worth saying out loud rather than burying, for two reasons. First, it is true, and a board
arguing for governance on cost grounds alone would be arguing badly — the cheapest way to get a
number onto a slide has always been to type it. Second, it is precisely why the correctness axis is
load-bearing and the tokenomics axis is supporting. Tokens tell you what the *inferred* path costs
you in compute. They tell you nothing about what the *supplemented* path costs you in six months,
when the sheet's owner has changed teams and the 69% proportion in it is undocumented.

The cost of a supplemented figure is not measured in tokens. It is in `supplementCost`, on the
provenance flip of every amber panel, in words.

### 7.7 The structural point, which survives any argument about the multiple

Governed cost scales with **the answer**: a request names a measure, its dimensions and its filters,
and a small aggregate returns. Five years instead of one changes the response by a few rows.

Direct cost scales with **the source**: two thirds of the direct total is a single portlet, because
that portlet's answer is row-level and the raw grain multiplies it by the depth of the org. Add a
table, a column or a hierarchy level and the direct figure moves. The governed figure does not.

The multiple is an illustration. The shape is the claim.

### 7.8 Where a reader encounters the model

1. **The pill**, always visible in the mode: `MODELED` · `~11× tokens` · `71 : 49 round trips` ·
   `TM-1 / NOT MEASURED`.
2. **`title` / `aria-label` on the pill**, one sentence: *TM-1 · Illustrative model, not a
   benchmark. Nothing here was measured. Derived from the query contracts in
   `data/tableau-source-catalog.json`.*
3. **The (i) flyover**, rule 5 of 5, opened by clicking the pill: both tables in full with the
   measured provenance of every constant, the two "scales with" statements, and the not-claimed
   note. This is the *sentence* the brief asks for, in the same register a governed figure uses on
   its provenance flip. See `shots/tokenomics-flyover-1024x580.png`.
4. **This document**, for the full derivation.

---

## 8. How the illustrative labelling survives a screenshot

The requirement: an executive crops a slide out of this board and the caveat must come with the
number. Five mechanisms, and they are geometric rather than editorial.

1. **The stamp is a cell inside the pill's own border**, not a caption beneath it and not a tooltip.
   `MODELED` is the leftmost cell, filled amber, white text, on the same baseline as the figures.
   Cropping it means visibly cropping the pill's left edge.
2. **The far edge repeats it in words** — `TM-1 / NOT MEASURED`. The qualifier is at *both* ends, so
   a crop from either side takes a figure with it.
3. **The figures carry their own approximation mark.** Written `~11×`, never `11×`. A number lifted
   out entirely still reads as approximate.
4. **The round-trip figure is written as a ratio**, `71 : 49`, not as a single number. A ratio
   cannot be quoted as an absolute benchmark without the reader noticing it has two sides.
5. **No footnote anywhere.** There is no small print to crop off, because there is no small print —
   the qualifier is the largest-contrast element in the pill.

The pill is also the *only* place a token figure appears on the board. There is no second, unlabelled
copy of the number anywhere in the UI.

---

## 9. `directMode` schema

Additive. Every existing key keeps its meaning, and `metrics` keeps its name so `applyDirectOverrides`
in `src/semantic.js` needs no change.

```jsonc
{
  "directMode": {
    // WHERE THE FIGURE COMES FROM, per §6. The dot's colour.
    // certified | supplemented | narrative  (`inferred` is never authored —
    // it is what `certified` becomes when the mode flips)
    "provenance": "certified",

    // The tier reached in DIRECT mode, i.e. the dot's colour after the flip.
    // Derived from `provenance` by §6.1's weakest-link rule and authored
    // explicitly so it is reviewable. green | yellow | red | grey
    "tier": "red",

    // The glyph inside the dot. Direct mode only. silent | catchable | none
    "detectability": "silent",

    // ONE hazard — the sharpest and most true for this measure. Not a recital.
    // field-ambiguity | fan-out | grain | fiscal-window | exclusion-convention
    // | conformed-identity | rls-scope | point-in-time | flow-as-stock
    // | definition-drift | zero-rows | no-layer-measure | narrative
    "hazard": "field-ambiguity",

    // Material, not a control. There is no source picker; this only shades the
    // prose. salesforce | lakehouse | sheet | snowflake | deck | both
    "origin": "lakehouse",

    // The confidently wrong figures. Deep-merged over `metrics` exactly as
    // today. ABSENT on supplemented and narrative portlets — that absence is
    // what makes them the control group.
    "metrics": { "value": 74, "display": "$74M", "plan": 63, "yoyDisplay": "-35% Y/Y" },

    // Per-point state, trend panels only, where a five-year series and a
    // three-year certified history are genuinely two things in one chart.
    "pointProvenance": ["supplemented", "supplemented", "inferred", "inferred", "inferred"],

    // MANDATORY wherever `metrics` is present. The arithmetic, in one sentence,
    // stating whether the multiplier is repository-stated or a model input.
    "shownFrom": "...",
    "multiplier": 0.902,
    "multiplierSource": "stated",   // stated | model-input

    // SUPPLEMENTED PORTLETS ONLY, and mandatory there. These replace
    // `shownFrom` / `multiplier`, because nothing moved.
    "supplementedFrom": "FinPlan headcount extract, Google Sheet, weekly.",
    "supplementCost": "No as-of-period-end read exists, so closed quarters restate...",

    // One sentence, front-of-house. The answer to "and would anyone notice?"
    // On a supplemented portlet it says why nothing changed.
    "wouldYouNotice": "...",

    // The audit-pass overlay. Arithmetically consistent with `metrics`.
    "certifiedDelta": "-$8M · -9.8%",

    // What the layer ACTUALLY provides. Must be supported by
    // docs/semantic-layer.md. Null on a purely supplemented portlet — that is
    // the point of the tier.
    "layerProvides": "...",

    // The honesty field. Null only when there is genuinely nothing to concede.
    "layerDoesNotProvide": "...",

    // Unchanged from today.
    "candidates": ["$82M", "$96M", "$74M"],
    "missing": "...", "effect": "...",
    "thesisTag": "T1", "thesis": "...", "risk": "...", "trustCost": "..."
  }
}
```

All 29 blocks are authored in final shape in
[`docs/mockups/direct/direct-mode-blocks.json`](mockups/direct/direct-mode-blocks.json), so the
`board.json` merge is a paste rather than a composition. Seven are marked `_placeholder` or
`_verify` because the queued agents are still reshaping them — the five Q3 Outlook portlets, and
`seg-spread` / `perf-divergence`, whose `effect` and `caption` copy the spread agent owns.

### 9.0 The three shapes a block takes

Worth seeing side by side, because the difference is the architecture.

| | Certified → inferred | Supplemented | Narrative |
|---|---|---|---|
| `metrics` override | yes — the wrong figures | **absent** | tone only |
| `shownFrom` | mandatory | absent | absent |
| `supplementCost` | absent | **mandatory** | the tag-loss note |
| `layerProvides` | the guarantee withdrawn | `null` | the guarantee a tag would give |
| On the flip | figures roll, dot reddens, glyph appears | **nothing moves** | measure tags sever |

`candidates` survives but moves **off the front face** — see §11. It belongs on the provenance flip,
where a list of things that could have been meant is useful, and not on a numeral, where it
announces uncertainty the argument needs absent.

### 9.1 Exemplar — `kpi-acv` · field ambiguity

```jsonc
{
  "tier": "red",
  "hazard": "field-ambiguity",
  "origin": "lakehouse",
  "metrics": { "value": 74000000, "display": "$74M", "planAttainment": 0.63, "yoy": "-35%",
               "caption": "Splits $28M Embedded / $61M Agentic" },
  "shownFrom": "Four amount columns coexist on the raw opportunity and nothing in the schema rules between them. The direct read picks one and lands $8M light: $82M x 0.902 = $74M. Plan recomputes against the same plan base ($117.1M): 63% rather than 70%. Y/Y recomputes against the same prior quarter ($113.9M): -35% rather than -28%.",
  "multiplier": 0.902,
  "multiplierSource": "stated",
  "wouldYouNotice": "No. A 10% miss on a measure already 30% down reads as the same bad quarter, and 63% of plan is as believable as 70%.",
  "certifiedDelta": "-$8M · -9.8%",
  "layerProvides": "One certified ACV measure, one date anchor, and a mandatory dedup filter — the definition is in the layer, not in the question.",
  "layerDoesNotProvide": "No ACV target or attainment measure exists in either model. Attainment exists only for Pipe Gen and Day-1 Open Pipe, so the 70% governed plan track does not come from the layer either.",
  "candidates": ["$82M", "$96M", "$74M"],
  "thesisTag": "T1",
  "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
  "risk": "An $8M understatement is inside every plausibility check anyone will apply to it.",
  "trustCost": "A confident wrong number costs more trust than a flagged unknown."
}
```

### 9.2 Exemplar — `kpi-attrition` · point-in-time and the arrears lag

The most persuasive block on the board, because it is the one where the wrong answer is *good news*.

```jsonc
{
  "tier": "red",
  "hazard": "point-in-time",
  "origin": "salesforce",
  "metrics": { "value": 50000000, "display": "$50M", "planAttainment": 0.69, "yoy": "-41%",
               "caption": "Best churn quarter in three years" },
  "shownFrom": "Attrition actuals land monthly and one month in arrears, with the in-flight month covered by a separate unofficial measure. A direct read of the quarter finds two of its three months and reports the quarter as complete: $75M x 2/3 = $50M. Against the same plan base ($72.1M) that is 69% rather than 104%; against the same prior year ($85.2M) it is -41% rather than -12%. Multiplier is a model input: flat monthly distribution within the quarter. The one-month lag itself is stated.",
  "multiplier": 0.667,
  "multiplierSource": "model-input",
  "wouldYouNotice": "No, and worse — you would not want to. Lower is better here, so the card flips from amber to green and reports the best churn quarter in three years. Nobody audits good news.",
  "certifiedDelta": "-$25M · reads 35pt better than it is",
  "layerProvides": "A named measure for landed actuals and a separate one for the in-flight month, so a query can tell a complete period from a partial one.",
  "layerDoesNotProvide": "The layer names the two measures; it does not stop a query from summing them or from presenting a partial quarter as whole. And history depth for attrition is unconfirmed — three years is documented for ACV and assumed here.",
  "candidates": ["$75M", "$50M"],
  "thesisTag": "T3",
  "thesis": "A period is a business definition. Raw timestamps do not know when a month has finished landing.",
  "risk": "Declare the churn problem solved one quarter before the actuals arrive.",
  "trustCost": "The most expensive wrong answer is the one that agrees with what you hoped."
}
```

### 9.3 Exemplar — `trend-aov` · flow as stock, with the caveat

```jsonc
{
  "tier": "red",
  "hazard": "flow-as-stock",
  "origin": "both",
  "metrics": { "series": [2797, 3184, 3397, 3544, 7188],
               "display": ["$2797 M", "$3184 M", "$3397 M", "$3544 M", "$7188 M"],
               "headline": "$7188 M", "headlineNote": "FY27 — annualized",
               "caption": "A balance doubled — the same operation the ACV panel does correctly" },
  "shownFrom": "H1 order value is a book balance, not six months of flow. Annualised as though it were a flow it doubles: $3,594M x 2 = $7,188M. The multiplier is stated — this figure already ships in the current directMode block.",
  "multiplier": 2,
  "multiplierSource": "stated",
  "wouldYouNotice": "No, because the same gesture is correct two cells away. The ACV panel's H1 point IS annualised, legitimately, and draws an identical dashed run-rate ghost. One doubling is right and one is wrong and the outputs are indistinguishable.",
  "certifiedDelta": "+$3594M · x2 on a balance",
  "layerProvides": "For the measures it carries, an additivity classification and named period-to-date flags — the layer can state that a measure must not be summed across periods.",
  "layerDoesNotProvide": "AOV is excluded from both semantic models IN WRITING and the exclusion is confirmed by the model owner. The layer would not have refused this doubling, because it has no AOV measure to classify. This exemplar should be re-anchored onto Open Pipe, which the documentation exempts from period-to-date by name — see §12.",
  "candidates": ["$3594M", "$7188M"],
  "thesisTag": "T2",
  "thesis": "Whether a measure may be added across periods is a property of the measure, and it is declared in the layer or nowhere.",
  "risk": "Double a balance in a board footnote and the FY28 plan inherits it.",
  "trustCost": "The error looks exactly like the correct operation on the row above."
}
```

---

## 10. Hazard assignment across all 29 portlets

One hazard each — the sharpest and most true for that measure, per the user's direction. The
variety is what makes the tab-to-tab reading interesting, and it comes free from the measures.

| Portlet | Tab | Hazard | Tier |
|---|---|---|---|
| `kpi-nnaov` | Exec | field-ambiguity — three competing new-logo tests | red |
| `kpi-acv` | Exec | field-ambiguity — four amount columns | red |
| `kpi-attrition` | Exec | point-in-time — actuals one month in arrears | red |
| `kpi-pipegen` | Exec | fan-out — no dedup filter, 3× the hierarchy | **yellow** |
| `mix-acv` | Exec | exclusion-convention — `APM_L1 'Other'` retained, no motion taxonomy | red |
| `hc-ae` | Exec | no-source — no headcount measure in either model | grey |
| ~~`acv-account-fan`~~ | Exec | ~~conformed-identity — raw account name, not the consolidated key~~ | ~~red~~ |
| `acv-ae-fan` | Exec | point-in-time — a current roster with no as-of-period-end read | **yellow**, and **supplemented**: nothing moves |
| `going-well` | Exec | no-source — authored narrative, no measure | grey |
| `h2-focus` | Exec | no-source | grey |
| `perf-hierarchy` | Product | exclusion-convention — the `'Other'` bucket reappears as a product | red |
| `perf-divergence` | Product | grain — product rows compared at two different grains | red |
| `perf-rules` | Product | no-source | grey |
| `seg-matrix` | Segment | definition-drift — Public Sector is a derivation, not a column | red |
| `seg-spread` | Segment | rls-scope — a scoped result presented as global | red |
| `seg-rules` | Segment | no-source | grey |
| `outlook-acv` | Q3 Outlook | definition-drift — outlook ACV is not the exec tab's ACV | red |
| `outlook-attrition` | Q3 Outlook | point-in-time | red |
| `outlook-nnaov` | Q3 Outlook | definition-drift — a commit read as a booking | red |
| `outlook-matrix` | Q3 Outlook | zero-rows — the forecast-judgment literal, silently empty | **yellow** |
| `outlook-deals` | Q3 Outlook | zero-rows — stage filtered by equality | **yellow** |
| `drivers` | Five Year | no-source | grey |
| `trend-acv` | Five Year | field-ambiguity, over a three-year history limit | red |
| `trend-attrition` | Five Year | point-in-time — arrears lag | red |
| `trend-nnaov` | Five Year | field-ambiguity, ×1.867 | red |
| `trend-aov` | Five Year | flow-as-stock | red |
| `trend-revenue` | Five Year | no-source — no recognised-revenue measure | grey |

### 10.1 One hazard now has no exhibit: `conformed-identity`

`acv-account-fan` was the T2 conformed-identity beat, and the beat was *raw gives you two keys, the
layer gives you one*: a re-parented subsidiary arrives as one full non-renewal beside one phantom
expansion in an export, and resolves to a single `Global_Combo_Name6` through the layer.

That exhibit needed the certified version to exist as its control, and it does not. The
account-level ACV pair cannot be produced at all, so the honest claim is no longer "the layer fixes
this" but **"neither path can answer it"** — a different and much weaker beat, and not one the
walkthrough can land in ten seconds in front of an audience.

Recorded here rather than left to be discovered mid-demo. Three consequences:

- **No panel on the board carries `conformed-identity` any more.** The hazard is still real, still
  documented in §3 and still the sharpest thing in the layer's account vocabulary. It has no
  exhibit. The walkthrough should either drop the beat or state it as an absence — *"the thing that
  would show you this is the thing we cannot draw"* — which is a legitimate move on this board but
  is a different sentence and has to be scripted as one.
- **The replacement is not a substitute for it.** `acv-ae-fan`'s hazard is `point-in-time`, and its
  degradation is that **nothing moves**: a roster with no as-of-period-end read is missing from a
  CRM export and from the semantic layer alike, so the panel is supplemented and joins the control
  group. That is a good beat and it is T2, but it argues the opposite half of the thesis — what the
  layer was *never* protecting, rather than what it protects.
- **The control group grows from four panels to five.** `hc-ae`, `trend-ae-capacity`, `trend-aov`,
  `trend-revenue` and now `acv-ae-fan`. The audit pass moves with it: holding D marks sixteen panels
  with a distance from a certified figure and five with the observation that no such figure exists.
  The counts are stated in `src/portlet.js` beside the branch that produces them.
| `trend-ae-capacity` | Five Year | no-source — no headcount measure, no as-of grain | grey |
| `trend-ae-productivity` | Five Year | grain — ambiguous numerator over an absent denominator | red |
| `trend-rules` | Five Year | no-source | grey |

**17 red, 3 yellow, 9 grey, 0 green.** The Salesforce hazards cluster on period, object joins and
identity; the lakehouse hazards on schema breadth and absent business convention. Both are present,
in one state, without a second control.

---

## 11. What gets deleted

Worth stating separately, because deletion is most of the risk.

- **The `DRAINED` palette and every `body.direct-mode` colour override.** Threaded through
  `resolveAccent` in `src/semantic.js` and an `isDirect` branch in each chart. This is the largest
  and most invasive change.
- **`scramble` on front faces.** A numeral flickering between candidates announces uncertainty,
  which is precisely the signal the new argument needs absent. `scramble` stays in `anim.js` and
  stays in use on the provenance flip, where `candidates` still belongs.
- **The X-out on the red tier.** Grey keeps it.
- **The `SEMANTIC_ONLY` strike-through on the front face.** Severed measure tags are correct on the
  provenance back and wrong on the front, for the same reason as `scramble`.

---

## 12. Claims dropped, because the real layer does not support them

Every guarantee attributed to the layer must be one the user's two models actually provide. These
did not survive that check.

Items 8 and 9 read as defeats in the first draft of this spec. They are not, and the third
provenance tier is what changes them: **a figure the layer does not carry is not a hole in the
board, it is a supplemented figure**, and marking it as such with its costs stated is a more
honest exhibit than either a fake clean win or a confession. Both are rewritten below. The rest
stand as dropped.

1. **Currency conversion.** *Dropped entirely.* No currency, conversion-rate or exchange-rate
   material exists anywhere in `docs/semantic-layer.md` or the catalogue. The brief listed it as a
   candidate axis; nothing supports it and it appears nowhere in the design.
2. **Test-account and internal-org exclusion lists.** *Dropped and replaced.* The layer does not
   document any such list. What it does document is three real business preferences applied whether
   asked or not — the `'Other'` product bucket, null dimension values, and a specialist coverage
   filter. The exclusion argument is made from those instead.
3. **Renewals versus new business as a governed convention.** *Dropped.* The opportunity type is an
   ordinary dimension available on both sides. The layer adds nothing here and the board does not
   pretend it does.
4. **"The layer scopes results to the caller."** *Weakened.* Enforcement is automatic on the
   Specialist model only. On Forecasting it is a filter you can forget, and the nastiest documented
   failure — a scoping flag that silently no-ops and returns everything for a user with no forecast
   record — lives *inside* the governed path. `seg-spread` says the weaker, true thing.
5. **A stock/flow property on measures.** *Rephrased.* There is no `periodType` field. What exists
   is an additivity classification and named period-to-date flags. Every claim is phrased as those.
6. **Plan attainment as a layer guarantee.** *Dropped.* Targets exist only for Pipe Gen and Day-1
   Open Pipe. The ACV, NNAOV and attrition plan tracks do not come from the layer, and
   `layerDoesNotProvide` says so on each.
7. **A certifier.** *Dropped.* Neither model has a certifier property. "Certified by" on the
   provenance face is a document owner, not a platform field.
8. **AOV as the flow-versus-stock exemplar.** *Relocated, and the panel rehabilitated.* AOV is
   excluded from both models in writing and confirmed absent by the owner, so the layer would not
   have prevented the doubling and cannot carry a claim about what it enforces. The exemplar
   re-anchors onto **Open Pipe**, which the documentation exempts from period-to-date *by name* —
   and Open Pipe lands on the Q3 Outlook tab, whose coverage hero the queued rebuild is
   constructing. `trend-aov` is then authored as a legitimate **supplemented** panel: a book
   balance from a Snowflake table, amber in both modes, figures unchanged, with the annualisation
   hazard stated in `supplementCost` as a live risk *in both modes* rather than as something the
   layer would catch. One coordination item follows — the `trend-rules` "Flow vs stock" card
   currently uses AOV as its example and needs the same re-anchor. The rule is correct; only its
   exemplar moves. That copy belongs to the legibility agent.
9. **The Five Year tab as a five-year comparison.** *Reframed, and it is now the most interesting
   tab on the board.* Only three years of ACV exist, and FY23/FY24 reach neither path. But those
   two points are not absent, they are **supplemented** — a Snowflake ACV history table — and
   saying so turns the tab from an embarrassment into a picture of what a real deployment looks
   like: four panels purely supplemented, three mixing a certified three-year history with two
   supplemented years. The mixing is where the argument gets its best new beat, because **the error
   lands on the seam.** `trend-acv`'s FY25 Y/Y doubles from −9% to −18% for no reason other than
   that it compares an inferred point against a supplemented one, and `trend-nnaov`'s shape breaks
   visibly against the two points that did not move. The supplemented years are what make the
   inferred ones checkable. That is the middle tier paying for itself.
10. **Latency in seconds.** *Dropped.* §7.5.

---

## 13. Implementation estimate

Roughly **four and a half working days**, of which about 40% is authoring prose rather than writing
code — and that 40% is now done, so **three days remain**. The third provenance tier added about
half a day net: the weakest-link resolution and the per-point trend state are new, but the
supplemented portlets need *no* `metrics` override at all, which is thirteen blocks of arithmetic
that never had to be computed.

| Work | Est. | Notes |
|---|---|---|
| Author 29 `directMode` blocks with `shownFrom` arithmetic | 1.5 d | **Done** — `docs/mockups/direct/direct-mode-blocks.json`, 7 placeholders pending the queue |
| Remove the drain: `DRAINED`, `resolveAccent`, every chart's `isDirect` colour branch | 4 h | **The risky one.** Deletion across ~8 files. Its own commit, its own verification |
| Tier vocabulary remap in `src/palette.js` | 1 h | Labels and the `x` flag; hex values unchanged |
| `provenance` → `tier` weakest-link resolution in `src/semantic.js` | 1.5 h | §6.1. The one piece of new logic; the `metrics` key name is preserved so `applyDirectOverrides` is untouched |
| Supplemented path: no `metrics` override, `supplementCost` on the provenance back | 2 h | 13 portlets, 4 of them unchanged in both modes |
| `pointProvenance` on the three mixed trend panels | 2 h | Per-point pip state in `trendPanel.js` |
| Toggle rename and topbar fit at 1024 | 0.5 h | |
| Detectability glyph *inside* the trust dot, plus veil registration | 2 h | Replaces the separate chip. Keeps the portlet head at two affordances |
| `data/tableau-source-catalog.json` supplemented register | 1 h | §14. Part of the live-wiring runbook now |
| The tokenomics pill and its responsive behaviour | 2 h | |
| TM-1 in the (i) flyover | 2 h | Content is written; this is markup |
| Stage-0 roll choreography, `countUp` with `from` | 3 h | No new primitive needed |
| Retire `scramble` and `SEMANTIC_ONLY` from front faces | 1 h | Deletion |
| Provenance back: new `BREAKDOWN_ROWS` entries | 1.5 h | |
| Audit pass on hold-`D` | 3 h | The only genuinely new interaction |
| Responsive pass at 1024 / 1280 / 1440, screenshot regression | 4 h | |

**Sequence:** vocabulary, toggle and drain-removal first, because they unblock everything visual.
Then the chip and the pill. Then choreography. The audit pass last — it is new interaction and the
only item that can be cut without leaving a hole.

**Shared files another agent must own,** since nothing here was modified: `data/board.json`,
`src/palette.js`, `src/semantic.js`, `src/portlet.js`, `src/main.js`, `src/charts/*.js`,
`styles/base.css`, `styles/portlets.css`, and whichever module owns the (i) flyover.

---

## 14. Mockups

In `docs/mockups/direct/`. Four standalone documents, no imports from `src/`, brand faces read from
`fonts/`, tokens and geometry duplicated in `_shared.css` rather than imported — a mockup that reads
the live stylesheets stops being a proposal and becomes a preview of whatever was last committed.

Each document carries both states and switches on the URL hash — `#governed`, `#direct`, `#audit`,
defaulting to direct. Reading state before anything is generated matters, because parts of these
files are script-built and a class swapped in after load leaves them stranded in the other state.
The A/B is therefore one hash apart and the geometry cannot drift between two screenshots.

| File | Renders |
|---|---|
| `exec-direct.html` | Exec Summary — governed, direct, audit |
| `trend-direct.html` | Five Year Trend — governed, direct, audit |
| `tokenomics.html` | TM-1 in the (i) flyover |
| `audit-pass.html` | The same four KPI cards governed, direct and audited, side by side |
| `shoot.mjs` | The screenshot harness. Serve the repo root on `:8791`, then `node docs/mockups/direct/shoot.mjs` |
| `direct-mode-blocks.json` | **All 29 `directMode` blocks, final shape.** The `board.json` merge is a paste |
| `source-catalog-supplemented.json` | Staged patch for `data/tableau-source-catalog.json` §14 |

23 screenshots in `shots/`, named `<tab>-<state>-<size>.png`: every tab in every mode at
1024×580, 1280×620 and 1440×720, plus the audit strip at two widths. **Every board view is
verified non-scrolling at all three sizes in all three modes** — the harness asserts it and
reports any overflow. `audit-pass.html` is an explanatory strip rather than a board view and is
taller by design.

Two traps the harness had to learn, recorded because they cost an hour each:

1. **A hash-only change is a same-document navigation.** Going from `#governed` to `#direct`
   scrolls and does not re-run the script, so three screenshots came back identical. The harness
   changes a query string as well.
2. **`.audit` was both an element marker and the body state class**, so `.audit { display: none }`
   matched `<body>` and blanked the entire document. The body class is `auditing`; the marker
   stays `.audit`. A comment in `_shared.css` now says so.

### What the mockups deliberately show

- **`exec-governed` beside `exec-direct` at 1024×580 is the deliverable.** Two boards, the same
  confidence, four different figures on the hero strip, and one card that changed colour in the
  wrong direction.
- **`mix-acv` is the argument in one card.** A 29% share becomes 31% and the total gains $7M,
  which at this size is one pixel of geometry. The ribbon, the widths and the story are identical.
  Only the numbers moved.
- **`hc-ae` is the control group, and it is on the exec tab on purpose.** Its dot is amber in both
  modes, it grows no glyph, its 745 does not move, and in the audit pass it is the one card with
  nothing struck. A viewer who notices that one card did not react has understood the whole
  vocabulary.
- **`trend-direct` is the honest exhibit.** Three panels red with `!`, one red with `?`, three
  amber and unmoved. The four supplemented points on `trend-acv` and `trend-attrition` wear amber
  rings and stay exactly where they were, which is what makes the movement of the certified points
  legible at all.
- **`trend-nnaov`'s shape breaks.** Its three certified points lift ×1.867 while its two
  supplemented points do not, so FY25 ends up above FY23 and a monotonic decline becomes a rise
  and then a fall. This is the only figure on the board caught by its own picture, and the middle
  tier is what catches it.
- **`trend-audit` is the best single frame in the set.** Three panels strike; Revenue, AE Capacity
  and AOV do not, because they were never wrong. The panels that stay quiet in the audit pass are
  exactly the panels the semantic layer never touched.

---

## 15. Sequencing — what is done, what is blocked, and on what

This spec is last in a queue of four. Three other agents own `data/board.json`, `src/`, `styles/`
and `index.html`, and **nothing here has touched a shared file.**

### Queue state at time of writing

| # | Agent | State |
|---|---|---|
| 1 | Legibility and removals — rules copy, Five Year axis, exec rail titles, Tableau logo, driver→metric mapping, KG overlay and footer status bar deleted | **Landed** — `bb37dd9`, `7bd07e9` |
| 2 | Q3 Outlook rebuild — `benchmarkAxis.js`, the head band deleted, ~210 lines out of the matrix | **In flight** — uncommitted `board.json`, `metricMatrix.js`, `dealRail.js`, new `benchmarkAxis.js` |
| 3 | Dollar-movement panel replacing the spread chart, plus the matrix column bracket | **Not started** — spec only |

So the shared-file work stays parked. What has been done instead is the authoring, which is 40% of
the estimate and collides with nobody.

### Done and ready to merge

- **All 29 `directMode` blocks**, in final shape, in `direct-mode-blocks.json`. Every `shownFrom`
  arithmetic computed and cross-checked; the exec `mix-acv` and Product
  `perf-hierarchy` figures all carry the same 8.5% `'Other'` inflation so the tabs agree with each
  other.
- **The supplemented register** for `data/tableau-source-catalog.json`, staged in
  `source-catalog-supplemented.json`.
- **The three-tier vocabulary**, the merged dot, and the KPI head regression — all built and
  screenshotted.

### Seven blocks are placeholders, and which they are

| Portlet | Blocked on | Note |
|---|---|---|
| `outlook-acv`, `outlook-attrition`, `outlook-nnaov` | Agent 2 | The duplicate head band is being deleted, which removes these three statTiles. Provisional classifications recorded in case any survives |
| `outlook-matrix` | Agent 2 | Two encodings instead of three. **Also where the flow-versus-stock exemplar relocates** — Open Pipe is the measure the docs exempt from period-to-date by name, and agent 2's coverage hero is where Open Pipe lands |
| `outlook-deals` | Agent 2 | Authored in full; the rail survives with a whole to be part of. Verify the metrics keys after the rebuild |
| `seg-spread`, `perf-divergence` | Agent 3 | Replaced by contribution panels. **Agent 3's own estimate includes re-authoring these two blocks' `effect` and `caption` copy** — do not author competing text. Re-derive the arithmetic against their twenty authored dollar movements |

### Build order once the tree is clean

Sequenced so there is always a working board.

1. **Vocabulary and toggle.** `palette.js` labels, the `provenance` → `tier` weakest-link
   resolution in `semantic.js`, the rename. Nothing visual breaks if this lands alone.
2. **Remove the drain — its own commit, its own verification.** `DRAINED`, `resolveAccent`, and
   the `isDirect` colour branch in roughly eight chart files, threaded through shared code. This is
   the riskiest item in the whole spec and it must not be folded into a larger commit.
3. **Paste the 29 blocks** into `board.json`, then `node scripts/sync-fallback.mjs`.
4. **The merged dot glyph** plus veil registration.
5. **The supplemented path** — no `metrics` override, `supplementCost` on the provenance back,
   `pointProvenance` on the three mixed trend panels.
6. **The tokenomics pill and TM-1 in the (i) flyover.** Coordinate the flyover copy with agent 1,
   who owns the rules text.
7. **Choreography** — stage-0 roll, `countUp` with `from`, retire `scramble` from front faces.
8. **The audit pass, last.** New interaction, and the only item that can be cut without leaving a
   hole.

### One coordination item, owned by agent 1

The `trend-rules` "Flow vs stock" card anchors its example on AOV. AOV is excluded from both
semantic models in writing, so it cannot carry a claim about what the layer enforces. **Re-anchor
the example on Open Pipe**, which the documentation exempts from period-to-date by name. The rule
itself is correct; only its exemplar moves. Flagged rather than edited, because that copy is not
this spec's to write.

---

## 15. As built

This document is the spec, written before the build and against a board that has since changed
underneath it. It is kept because §7 is the derivation TM-1's pill points at and because §12 is the
record of what the layer does and does not support. Where the build diverged, it diverged for a
reason found by building, and this section is that list rather than an edit to the sections above.

**TM-1 is a pill on the kicker row, not a fifth card in the (i) flyover.** §5 put it in the
flyover. Two of the five tabs have no flyover at all, and on the three that do, the four per-tab
reading rules already end 27px short of the stage floor at 1024 — a fifth card rendered 154px below
the visible area. The sheet deliberately does not scroll; a previous pass moved this content into
it precisely to stop it scrolling. The topbar was tried too and truncated the board title. The
qualifier requirement is unchanged and met: `TM-1 MODELED` is a sibling of the figure inside one
border.

**The figures are recomposed.** 27 portlets rather than 29, after the Q3 rebuild merged three head
tiles into the Y/Y matrix. Governed 41 round trips and 14,300 tokens; direct 69 and 155,800. 10.9×,
which still rounds to the ~11× claimed in §7.5, so the claim is unchanged. Per portlet ~150
supplemented, ~530 governed, ~5,800 inferred.

**Provenance was re-derived once during the build, and the first derivation was wrong.** It applied
weakest-load-bearing-input literally and demoted every exec KPI card to supplemented, because §3.2
grants target measures to Pipe Gen and Day-1 Open Pipe and to nothing else. True, and it produced a
*governed* board that was sixteen-27ths amber, which misrepresents the layer about as badly as an
all-green board would. The rule as built adds a clause: where a single mark carries the weakness and
the panel still does its job without it, the mark carries the weakness and the dot reports the hero
measure. So the plan tick renders as a dashed amber reference and `kpi-acv` is green — $74M really
is `ACV_clc`; only the 63% of plan is not. `kpi-nnaov` stays amber for a different reason (§10.4:
it is a commit rendered as a booking, and no per-mark fix reaches a misdescribed hero figure).

**Supplemented marks are drawn with a break in them, not just in amber.** The supplemented ink and
the palette's warn tone are the same value, `#92640A`, so on Attrition at 104% of plan an amber plan
tick sat invisible against an amber bar. The tick is dashed and a supplemented trend point carries a
halo. Colour alone cannot carry provenance anywhere a sentiment tone is in play.

**Per-point provenance on the Five Year panels, in both modes.** Not in the spec. §10.3 and §7.3
settle that only three years of data exist and that FY23–FY24 return no rows under any filter, so
those points are supplemented under every toggle. Haloing them in both modes makes the seam a fact
about the data rather than an artefact of the mode — and the reading it produces is the best thing
on the tab: the fully-haloed panels are the ones that do not move, and on the rest the halos stop
exactly where the figures start changing.

**The scramble is gone.** §4 kept it as the direct-mode counterpart to `countUp`. It is the drained
palette in another costume: a figure that flickers through its competing candidates before settling
is a figure declaring itself unreliable, and declaring unreliability is the one service no raw
source performs. The candidates were already rendered as chips on the provenance flip, so nothing
was lost but the tell. `anim.js` loses the primitive.

**The audit pass has a second state the spec did not anticipate.** §4.4 lays a certified figure
beside each shown one. Four portlets have no certified figure for it to lay, so they say so — "no
certified figure exists to compare", in amber — rather than reporting "unchanged", which would
imply a comparison that was made and came back equal. Nothing was compared.

**Two overclaims deleted from `attainment.js`**, in the §12 spirit: the plan tooltip described every
target as "(certified)", and the void string described FinPlan as a real planning system at OU and
product-family grain. §3.2 grants targets to two metrics; §5.4 records that FinPlan does not exist.
