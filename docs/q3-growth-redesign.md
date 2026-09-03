# Q3 Outlook — the growth reframe

A design exploration, not an implementation. Nothing outside this file and
`docs/mockups/q3-growth/` was written.

`docs/q3-redesign.md` is the record of the current build and is an input here.
It is not edited. Sections 1–8 of that document are its own exploration;
sections 9–10 are what shipped, and what shipped is what this document
proposes to replace above the fold.

Artefacts:

- `docs/mockups/q3-growth/build.mjs` — generates the mockups. Self-contained:
  it imports nothing from `src/`, and hand-copies the parts of `styles/*.css`
  the card idiom needs. The only shared asset it references is `fonts/`.
- `docs/mockups/q3-growth/g1-growth-by-motion.html`,
  `g2-level-and-direction.html`, `g3-divergence.html`, and
  `g3-divergence-direct.html` — the recommendation rendered degraded.
- `docs/mockups/q3-growth/shots/*.png` — each at 1024×580 and 1440×720.
- `docs/mockups/q3-growth/shot.sh` — headless-Chrome capture.

Every page shows the whole tab, because the hero cannot be judged without the
sufficiency panel and the deals rail beside it. All three carry the same
redesigned sufficiency panel and the same re-scaled deals rail, so the only
variable between them is the hero.

---

## 1. Why the current hero argues the wrong thing

`Q3 OUTLOOK AGAINST PLAN` puts gap-to-plan at the centre of the tab. Its
largest visual element is a hatched shortfall running from $105M to a derived
$120.7M; its readout column reads `87% of Product FinPlan · −$15.7M gap`; and
the deals rail beside it is scaled to that same gap, so the five open deals are
drawn as "80% of the shortfall". Three of the tab's four surfaces are
arguments about a target.

That is a well-built chart of the wrong subject, and one detail settles it:
**the tab's own authored headline never mentions plan.**

> `"headline": "Q3 tracks to $105M with attrition running 20% ahead of last year"`

Attrition running 20% ahead of last year is a year-over-year statement. The
headline has been a growth claim the whole time; the hero underneath it was
the redesign's addition, not the board's. The reframe does not overrule the
authored narrative — it catches up with it.

Two things make the change cheaper than it sounds, and both are recorded
elsewhere in the repo rather than asserted here.

**Plan was never sourceable.** `docs/semantic-layer.md` §3.2 and
`gaps.planAttainment` in `data/tableau-source-catalog.json` are explicit:
attainment exists only for Pipe Gen and Day-1 Open Pipe, there is no ACV,
NNAOV or attrition plan measure, and *"FinPlan" does not exist as an object in
either model*. The current build derived six further figures from that
percentage and recorded, correctly, that "exactness is not sourceability".
Demoting plan retires all six. §4 says exactly which entries move.

**Growth has better data behind it.** Y/Y is authored for every one of the
nine cells on this tab, in both the governed and the degraded blocks, and it is
the axis the Product and Segment tabs already share. A growth hero makes this
tab consistent with them instead of the exception.

### 1.1 What must not happen

The authored figures do not support a good-news tab, and this board has been
corrected for overclaiming before. Analytics ACV is −6% Y/Y. Attrition is +20%
Y/Y on a measure the board declares lower-is-better. NNAOV is −43%. A growth
hero that reads as a win would be the same failure in the opposite direction.

The honest version is that growth is the axis the business is managing to, and
that on that axis **the two motions are moving in opposite directions on all
three measures**: Embedded Agentic Analytics is +32% / −23% / +61% and the
Agentic Analytics Platform is −15% / +26% / −3%. Every alternative below is
built to make that separation the finding, and none of them can be read as
"we are fine".

### 1.2 What an exec should do differently

The decision this tab can support is **where the next increment of capacity
and pipeline goes**, and the answer is not symmetric:

- **Platform** is on the unfavourable side of zero on all three measures and
  is at or below its own historical benchmark on both coverage and velocity.
  It has neither growth nor the pipeline conditions to change that inside the
  quarter. Its worst single reading is attrition at +26% Y/Y — which is a
  retention question, not a pipeline one, and no amount of pipegen answers it.
- **Embedded** is on the favourable side of zero on all three and is the only
  motion above its coverage benchmark (3.2× against 2.8×). It is the one place
  on the tab where more pipeline has somewhere to go.

Those are two different asks of two different teams. The gap-to-plan hero
supports neither, because it collapses both motions into one shortfall number
and then invites the meeting to talk about the number.

---

## 2. The constraint that shapes all three alternatives

**Growth on this tab can be drawn as the authored percentage and nothing
else.** This rules out the obvious idioms before any of them is sketched, and
it is worth stating plainly because it is the reason none of the three below is
a paired-bar or slope chart.

Y/Y is authored per cell as a whole-number percentage. Back-deriving a
prior-year dollar figure from it is **estimation, not exact arithmetic**:
Platform ACV at $75.5M and −15% puts last year somewhere in **$88.3M–$89.3M**,
because −15% is any value in [−15.5%, −14.5%). One authored decimal place would
have made this exact. There isn't one.

So, ruled out by the no-estimation rule:

- **this-year-against-last-year paired bars**, on any measure;
- **slope charts and connected pairs**, which need two dated positions;
- **growth contribution or decomposition**, which needs prior-year levels to
  weight against;
- **anything with a time axis** — and independently, `board.json` states
  freshness as Jul 28 2026 against a quarter that runs August–October, so the
  tab is standing at day zero and there is no quarter-to-date pace either. That
  finding is `docs/q3-redesign.md` §1's, under criticism 5, and it still holds.

What is left is the vocabulary all three alternatives use: **the authored Y/Y
percentage on the board's shared symlog axis, and the authored dollar commit
beside it.** `growth.js` (104 lines, linear core to ±10%, then 2.2 decades) is
mounted verbatim by every mockup here.

### 2.1 Three closure checks, run and reported

Not new figures — checks on the authored ones, run so the compositions below
can be justified rather than assumed:

| Partition | Children | Parent | |
|---|---|---|---|
| ACV | $75.5M + $29.5M = **$105M** | $105M | **closes exactly** |
| Attrition | $73.5M + $6M = **$79.5M** | $79.5M | **closes exactly** |
| NNAOV | $8.5M + $23.5M = **$32M** | $25.5M | **does not close** |
| Top five deals | 3 + 3 + 2.3 + 2.1 + 2.1 = **$12.5M** | authored `"$12.5M across five deals"` | **closes exactly** |

The brief's rule stands: no part-to-whole treatment on this tab, because NNAOV
would break it. Nothing below stacks, shares or tiles the matrix.

The ACV closure is used for one thing only, in G2 and G3: it licenses putting
the three ACV commits on **one shared dollar scale** as three positions, which
is a common-scale comparison and not a share of a whole. If the children had
not closed, three bars on one axis would have implied a sum that was not there.

The deals closure is what makes the deals rail's new scale legitimate. §5.

---

## 3. Three alternatives for the hero

Each differs in what it makes the point of the tab.

### G1 — "Growth by motion"

> **Thesis:** the point of the tab is the growth rates themselves, so the
> board's shared Y/Y axis stops being a 130-pixel stub inside a matrix cell
> and becomes the hero — nine authored readings on one axis, signs preserved,
> polarity carried by colour rather than by position.

Nine rows, grouped three-and-three-and-three by motion down the containment
rail the matrix already draws. One symlog axis spans the full hero width, with
the ±10% core rules and the ±100% and ±1000% decade rules all drawn and all
labelled — `docs/redesign.md` §11 cut those two labels below 860px tall
because the strip was 78px wide and three labels wanted 94px. At hero width
they fit, and the decades are the part of the axis a reader has to see to
interpret a −43% next to a −3%.

Signs are preserved, so attrition's +26% sits to the *right* of zero and is
coloured red. This is `toneOf()` doing exactly what it already does, and it is
the conservative choice: nothing about the axis is unusual, and the reader
does no work beyond reading colour.

The Y/Y reading sits in a fixed column rather than floating at the bar end.
Floating chips were the first draft; the alternate-basis ghost tick draws into
the same plot and landed underneath the chip on two rows of nine.

![G1 at 1024×580](mockups/q3-growth/shots/g1-growth-by-motion-1024x580.png)
![G1 at 1440×720](mockups/q3-growth/shots/g1-growth-by-motion-1440x720.png)

**Where it is weak.** It is a very well-drawn table. Nine bars on one axis is
the most information per pixel of the three, and the least argument: the
reader assembles "Embedded is the only motion growing" from nine readings
rather than seeing it. It also spends its whole vertical budget on nine rows,
which is what forces the hero band up and squeezes the sufficiency panel.

### G2 — "Level and direction"

> **Thesis:** a growth rate is only actionable next to the money it applies
> to, so each motion is read as a pair — Embedded is +32% on $29.5M while
> Platform is −15% on $75.5M, which is why Analytics reads −6%.

The current hero's structure, with the plan channel replaced rather than
removed. Three motion rows. The ACV commit stays on the shared $0–$125M dollar
scale it is already drawn on — the plan tick, the hatched shortfall and the
attainment readout come off, and the space they were using becomes a growth
lane with its own zero rule, immediately to the right. The Analytics row keeps
the hollow diamond at the OU Roll-up's $100M on the dollar axis, exactly as
`docs/q3-redesign.md` §10.3 introduced it. Attrition and NNAOV keep the cell
treatment, value over stub.

Two lanes, two units, two zero points — but never two scales in one plot,
which was the trap. The dollar axis ends where the growth lane's own axis
begins, and each carries its own tick strip.

![G2 at 1024×580](mockups/q3-growth/shots/g2-level-and-direction-1024x580.png)
![G2 at 1440×720](mockups/q3-growth/shots/g2-level-and-direction-1440x720.png)

**Where it is weak.** It is the smallest possible change, and it looks it. The
growth lane is ~110–150px wide against a dollar plot at 1fr, so the tab's new
subject is drawn at a third of the size of its old one; a reader who was shown
the current tab and then this one would say the plan bars had been tidied up,
not that the tab now argues something different. It is the right answer if the
constraint is build cost and the wrong one if the constraint is the brief.

### G3 — "The divergence"  ·  recommended

> **Thesis:** the finding is that the two motions are separating, so each
> measure gets one axis oriented so that better is always to the right, and
> Embedded lands on the good side of zero three times while Platform lands on
> the bad side three times — the tab's argument becomes a shape rather than a
> table.

Three lanes, one per measure. On each lane:

- **a zero rule and the same symlog decades**, so the three lanes are directly
  comparable to each other and to the Product and Segment tabs;
- **the axis oriented by the authored `goodDirection`**. ACV and NNAOV are
  drawn conventionally. The attrition lane is mirrored, so Embedded's −23%
  plots to the right and Platform's +26% to the left. **The signs printed on
  the marks are unchanged** — only the direction of the axis moves, the lane
  says `lower is better · axis mirrored` under its name, and the strip at the
  foot repeats it. This is the board's own authored polarity rendered instead
  of stated;
- **the Analytics roll-up as a vertical reference rule, not a dot.** The
  roll-up is a reference for its children, not a third peer, and drawing it as
  a rule says so without a caption. It also removes the one unavoidable mark
  collision: on the attrition lane Platform (+26%) and Analytics (+20%) are
  4% of the half-width apart and would overlap as two circles;
- **the spread between the two children as a drawn interval.** The length of
  that grey stem *is* the divergence, and it is long on all three lanes;
- **the motion key across the top**, carrying the three ACV commits as three
  bars on one $0–$125M scale. This is where G2's point lives in G3: weight is
  read once, at the top, rather than repeated on every lane. It is licensed by
  §2.1's ACV closure and it is positions-on-a-common-scale, not a composition.

The NNAOV lane renders a finding the current build could only have annotated:
Analytics at −43% sits **outside the range of its own children** (−3% and
+61%). That is the NNAOV non-closure showing up as geometry. It is drawn
faithfully and not commented on, per the board's standing decision.

![G3 at 1024×580](mockups/q3-growth/shots/g3-divergence-1024x580.png)
![G3 at 1440×720](mockups/q3-growth/shots/g3-divergence-1440x720.png)

**Where it is weak, honestly.** The mirrored axis is the one thing on the tab
that needs a reading note, and a reader who misses it reads Platform's
attrition mark as a decline rather than a rise. Three labels per lane are
placed by rule rather than freely, and the rule has a case to get right —
in degraded mode both children land on the same side of the roll-up on the
NNAOV lane, which is the collision the placement rule exists for. And it shows
attrition and NNAOV *levels* as small labels beside their marks rather than in
a scannable column, which G1 does better.

---

## 4. What happens to plan

**It comes off the tab entirely.** Not demoted to a footnote, not kept as a
small readout — removed as a rendered channel, on all three alternatives.

### 4.1 What stops being drawn

Six derived figures, all of them exact and all of them resting on a percentage
neither semantic model can produce:

| Figure | Derivation |
|---|---|
| Analytics derived plan `$120.7M` and gap `−$15.7M` | $105M ÷ 87% |
| Platform derived plan `$96.8M` and gap `−$21.3M` | $75.5M ÷ 78% |
| Embedded derived plan `$23M` and overrun `+$6.5M` | $29.5M ÷ 128% |

…plus the three quantities `outlook-deals` reads off the first of them: the
`$15.7M` scale the composition bar is laid along, the `80%` share and the
`$3.2M` residual.

After the reframe **there is no derived figure anywhere on the Q3 tab.** The
mockup generator asserts this: it computes no quantity that is not authored,
and prints the closure checks in §2.1 rather than deriving anything from them.

### 4.2 What stays authored

`cells[].plan`, `planDisplay` and `planGoodDirection` stay in `board.json`.
They are authored data and the register of what the source deck claimed;
deleting authored figures to make a chart change is the wrong direction, and
`gaps.planAttainment.specificFiguresWithNoSource` should go on naming all three
because the gap register is a statement about the data, not about the layout.
What changes is that the Q3 renderer stops reading them.

### 4.3 `data/tableau-source-catalog.json`

Not this agent's edit to make — this is the spec for whoever implements.

- **`gaps.planAttainment.affectsEveryFinPlanAttainmentFigureOnTheQ3OutlookTab`**
  — `["outlook-matrix", "outlook-deals"]` becomes empty, with a note recording
  that the tab stopped rendering attainment at the growth reframe rather than
  that the gap was closed. The gap is not closed. It stopped being load-bearing.
- **`gaps.planAttainment.derivedQuantitiesThatInheritThisLimit`** — **retire it,
  do not delete it.** `figures` becomes `figuresRemoved`, holding the same four
  strings verbatim; `_note` gains the reframe and its date; `consequence` and
  `whyItIsStillDrawn` go to past tense; `renderRule` drops, because there is no
  longer a plan mark to have a degraded branch. Keeping the block is the point:
  it is the record of why the tab was built that way, and the evidence that the
  reframe *removed* a liability rather than quietly stopped mentioning one.
- **`portlets['outlook-matrix'].derivedFromUnsourceablePlan`** — removed, and
  replaced by a one-line note pointing at the retired gaps block. Its
  `neverSum` rule goes with it: with no plans to state there is nothing to
  refrain from summing. **The warning it was protecting still needs a home** —
  §2.1's closure table is where it should land, because "do not add a bridge"
  generalises to "NNAOV does not close, so do not tile these rows".
- **`portlets['outlook-matrix'].supplementedBy`** — removed. The merged plan
  column was the portlet's only supplemented input.
- **`portlets['outlook-deals'].derivedFromUnsourceablePlan`** and
  **`supplementedBy`** — both removed. §5.
- **`portlets['outlook-matrix'].presentationGrain`, `needs`, `cannotSource`** —
  `cells[].plan` and `metrics.landscape` come out of `needs`; the FinPlan
  bullet comes out of `cannotSource`, leaving the two entries that are still
  true (no motion dimension, and polarity as a board decision).

### 4.4 The consequence worth reporting

Applying §6.1 of `docs/direct-mode-redesign.md` — *a portlet's state is the
weakest load-bearing input it has* — `outlook-matrix`'s remaining inputs are
three certified commit measures, certified Y/Y via `Close_Date_Relative_Year_clc`,
and the OU Roll-up alternate basis, which the catalog itself calls "the
strongest authored element on the tab". **It moves from supplemented to
certified.** The tab goes from one fully certified portlet to two, and
`outlook-deals` loses its only supplemented input as well — whether it renders
green depends on the outstanding `ACV_clc` / `Open_Pipe_clc` measure correction
already recorded against it, which is not this brief's to resolve.

The board-level counts in `direct-mode-redesign.md` §6.3 (`Certified 10 /
Supplemented 13`) need re-running by whoever implements. I have not guessed at
the new numbers.

---

## 5. The deals rail's new scale

The rail's scale is currently the derived $15.7M gap, so it cannot survive
plan. The replacement is **the authored total, `$12.5M`** — the five deals laid
end to end across the whole of it, list beneath.

This is not a fallback dressed as a decision. The five authored amounts sum to
the authored `totalDisplay` **exactly** (§2.1), which makes it the one closed
partition on the tab and the only composition on it that is honest. It is also
the branch `dealRail.js` already has: the portlet's authored
`metrics.gap.voidClaim` reads *"no derivable gap — the scale is the authored
total"*, and direct mode already takes it. The reframe promotes the degraded
path to the governed one and deletes the derived path above it.

Ties stop being a defect. Two $3M deals and two $2.1M deals render as two pairs
of identical segments, which is a truthful rendering of a fact the ranked
lollipop hides — the "top five" is really a two, a one and a two.

**One replacement scale was considered and rejected.** Coverage is authored as
"open pipe ÷ commit", so open pipe = coverage × commit, and laying the deals
against the motion's own open pipe would have been a governed comparison of
two certified measures. It fails the no-estimation rule: coverage is authored
to one decimal, so Platform's open pipe is somewhere in **$192.5M–$200.1M**.
An interval that wide is an estimate, and the rules forbid drawing one.

The honest conclusion is that **the board holds no authored quantity to
measure five open deals against**, and the rail should say so by not
pretending otherwise. Its aggregate is its own total and its content is the
ranking.

---

## 6. The sufficiency panel

One recommendation, not three. The diagnosis is narrow and the fix follows
from it.

### 6.1 Diagnosis

The panel is the only fully certified portlet on the tab — `Coverage_clc`,
`Historical_Coverage_clc`, `Velocity_clc` and `Historical_Velocity_clc` all
exist in the Forecasting model, and the two-year comparability window is
governed too. It reads badly for five reasons, in descending order of size.

**1. The domains are round numbers, and the data lives in a tenth of them.**
Coverage is drawn on 0–4×, and the four coverage-related positions — 2.6, 2.7,
2.8, 3.2 — occupy **65% to 80%** of that axis. Velocity is drawn on 0–20%, and
15, 16, 16, 17 occupy **75% to 85%**. So 85% and 90% of the plotted width
respectively carry no mark at all, and every mark is crowded into a band
narrower than the labels naming it. The catalog already concedes the point:
*"the velocity axis is drawn to a domain of 20 and coverage to 4 —
presentation choices, not data."*

**2. The axis spends its resolution where nothing is.** The quantities that
matter are −0.1×, +0.4×, −2% and flat. On a 0–4× domain, −0.1× is **2.5% of
the plot** — under 7px of separation between two circles at any width this
panel gets at 1024, where it shares band 2 with the deals rail. Embedded's
flat velocity is **0px**. The reader is asked to judge differences the chart
has rendered at the width of a hairline.

**3. There is no verdict.** "Is coverage sufficient?" is never answered. The
reader is given two positions per reading and asked to subtract — four
readings, four subtractions, to reach one judgement. As the brief puts it,
three too many.

**4. A third of the vertical space renders an absence.** The Analytics roll-up
occupies a full row on both axes to say that coverage and velocity are
non-additive and it therefore has nothing to draw. The rule is right and the
row is an expensive way to state it at 470px of band height.

**5. Sufficiency has no stated threshold.** 2.6× is only sufficient against
something. The only something on the page is each motion's own benchmark, and
the panel never says that at-or-above-benchmark is the test.

### 6.2 The fix

**Re-base the mark from absolute position to signed distance from the
benchmark, and state the verdict as type.**

- **The benchmark becomes the axis.** One vertical rule at zero per measure,
  shared by both motions, replacing four hollow benchmark rings. Each reading
  is a bar from that rule to its own delta. **Subtractions required: zero.**
  Which side of the rule a bar is on *is* the answer to the panel's question.
- **The absolute value keeps its numeral and loses its mark.** This is the
  swap that makes the panel work: today the mark carries absolute position
  (uninformative — everything is in the same tenth of the axis) and the
  numeral carries absolute value (redundant with the mark). After, the numeral
  carries the level and the mark carries the comparison. Nothing is lost.
- **A verdict word per reading**, at display weight, tone-coloured, with the
  authored delta string beside it: `BELOW · −0.1× vs hist`, `ABOVE · +0.4× vs
  hist`, `LEVEL · flat vs hist`. Every one of those delta strings is authored
  in `board.json` — `deltaDisplay` and `flatDisplay` — so the verdict word is
  a rendering of the sign of an authored figure and nothing is computed.
- **A one-line lede** above the plots stating the panel's finding: *"Platform
  below its benchmark on both measures. Embedded above on coverage, level on
  velocity."* Four signs, one sentence.
- **The void row becomes a clause.** The authored `voidNote` moves verbatim
  into the panel foot and the Analytics row comes out of the grid. The two rows
  that have data get about 50% more height each. This trades the current
  build's "rule rendered rather than stated" for "rule stated in eight words",
  and at this band height that is the right trade — an empty row is a third of
  the panel spent on nothing.
- **Domains sized to hold both modes.** Coverage on ±1.0× and velocity on
  ±3.2%, chosen so the *degraded* deltas (+0.8× is the largest) fit on the same
  scale as the governed ones. The mark can then be compared across the toggle
  instead of being silently re-scaled under it — which matters a great deal in
  §7.2. Platform's −0.1× is small on this domain, and that is correct: it is a
  small miss, and the verdict word says which side it is on.

Absolute coverage against a benchmark of zero is not lost, because the level
is the largest numeral in the row. What is lost is the ability to compare
Platform's 2.6× to Embedded's 3.2× *by position*, which the current panel
offers and which was the strongest thing about it. That comparison is now
typographic: `2.6×` above `3.2×`, same column, same face, same size. It is a
real cost and it buys the four comparisons the panel is actually for.

---

## 7. Recommendation

**G3, the divergence.** In the order that decided it:

**1. It states a finding; the other two present readings.** The brief asks
what an exec should do differently. G3's answer is visible before any number
is read: green on the right three times, blue on the left three times, with a
long grey interval between them on every lane. That is §1.2's argument as a
shape — the two motions need different asks — and it is the only one of the
three where the reader does not have to assemble it.

**2. It is the only one that renders the roll-up's relationship to its
children**, including where that relationship breaks. Analytics NNAOV at −43%
falling outside the −3%…+61% range of its own children is the non-closure
made visible without a word of reconciliation. G1 and G2 both print the same
three numbers and neither shows that they do not fit together.

**3. It carries weight without a part-to-whole.** The motion key puts the
three ACV commits on one dollar scale once, at the top, licensed by the exact
closure in §2.1. G2 spends a whole column per row on the same information; G1
does not carry it at all.

**4. It has the most room.** Three lanes rather than nine rows, so the hero
band sits at 1.42fr instead of G1's 1.48fr and the sufficiency panel gets its
height back. At 1024×580 every one of the three compositions fits, but G1 is
the one that has to fight for it.

**5. Its degraded state is the strongest demonstration on the tab.** §7.2.

**G1 is the fallback**, and it is a good one. If the mirrored attrition axis is
judged too much of a reading burden — a defensible call, and the one thing in
G3 I would want tested on a real reader before shipping — G1 is the same data
on the same axis with nothing unusual asked of anyone, and it is a better
scannable reference than G3 is. It is the right choice if this tab is going to
be read closely by analysts rather than glanced at by an exec.

**G2 is the one I would not ship**, for the reason its own section gives: it
is the current tab with the plan channel swapped out, and it looks like a
tidy-up rather than a reframe. It is documented here because it is the honest
minimum, and because if build cost is the binding constraint it is the answer.

### 7.1 What the reader is not told

No reconciliation, on any of the three. The OU Roll-up second basis is stated
on the growth axis as a ghost tick and named in the strip at the foot, exactly
as `docs/q3-redesign.md` §10.3 established. The 5% disagreement on ACV and the
11.8% on attrition are not printed, not differenced and not explained. Both
bases are rendered and the reader sees two numbers.

The growth axis is the better home for that strip than the dollar axis was:
both alternate readings have an authored Y/Y, whereas only ACV's had an
authored dollar value, so the ghost tick now works on both lanes rather than
one lane and a footnote.

### 7.2 Degraded mode — and why the reframe improves it

The current build's degraded rule for the hero is that **the plan bars and the
gap rule drop entirely**, because a gap derived from a contested commit would
be three different gaps drawn as one. That reasoning is right and the outcome
is bad: an absence is the loudest tell a chart can produce, and it contradicts
the board's own thesis, stated in `src/palette.js` — *"a wrong answer looks
exactly like a right one. If you want to know which is which, you have to ask
the layer."* A hero that visibly loses a channel is a hero that announces the
problem.

**The growth hero has nothing to drop.** `board.json` already authors a full
degraded set of Y/Y for all nine cells, and four of the nine change sign:

| Cell | Governed | Direct to source |
|---|---|---|
| Analytics attrition | +20% Y/Y | **−20% Y/Y** |
| Platform attrition | +26% Y/Y | **−16% Y/Y** |
| Analytics NNAOV | −43% Y/Y | **+6% Y/Y** |
| Platform NNAOV | −3% Y/Y | **+81% Y/Y** |

On G3, two of the three lanes invert. Governed, the attrition lane puts
Platform and Analytics on the unfavourable side and Embedded alone on the
favourable one; in direct, all three sit on the favourable side. The NNAOV
lane does exactly the same. The tab's whole argument — Platform left,
Embedded right, three times — dissolves into "everything is fine except
Platform's ACV", and **the chart looks exactly as confident as it did a
moment earlier**. Same colours, same marks, same
composition, per `palette.js`: direct mode does not drain.

The one absence that remains is authored: the alternate-basis strip goes,
because `outlook-matrix`'s `shownFrom` says *"the alternative-basis figures go
with it, there being nothing left to arbitrate between."* The strip renders its
own void state rather than vanishing.

The sufficiency panel in delta form is the sharper half of this. Its authored
`wouldYouNotice` is already the right finding — *"a sign flip on the only
question the panel is asked… a pipeline that is merely holding station reads
as one that is building"* — and the current absolute-position rendering buries
it, because 2.6-against-2.3 and 2.6-against-2.7 look nearly identical on a
0–4× axis. In delta form **all four marks end up above the rule where three of
the four were at or below it**, the verdict words go from
`BELOW / BELOW / ABOVE / LEVEL` to four `ABOVE`s, and the lede
inverts from "Platform below on both" to "Both motions above on both". The
benchmark rule goes dashed and takes the authored `2.3× prior qtr` /
`14% prior qtr` labels, which is the only structural change the panel makes on
the flip. Because the delta domains were sized in §6.2 to hold both modes, the
marks move rather than the axis re-scaling under them.

The deals rail's degraded behaviour is unchanged and is now entirely authored:
two of five reorder, the total moves $12.5M → $12.6M, and there is no longer a
derived scale to lose.

![G3 degraded at 1024×580](mockups/q3-growth/shots/g3-divergence-direct-1024x580.png)
![G3 degraded at 1440×720](mockups/q3-growth/shots/g3-divergence-direct-1440x720.png)

---

## 8. Implementation estimate

Against the modules as they stand today: `metricMatrix.js` 890 lines,
`benchmarkAxis.js` 428, `dealRail.js` 473, `attainment.js` 861, `growth.js` 104.

**`metricMatrix.js` — deleted, on G3.** It has exactly one caller,
`q3-outlook/outlook-matrix`; the Product and Segment tabs mount
`growthMatrix.js`, which is a different module. G3 does not draw a matrix, so
the 890 lines go rather than being edited. That is the single largest fact in
this estimate and it should be checked before it is relied on. *On G1* the
module is restructured rather than replaced — the containment rail, row
scaffolding and alternate-basis strip survive, the landscape column and the
cell grid are replaced by nine plot rows: roughly −480, +190. *On G2* it is a
light edit: drop the target tick, the hatched gap and the attainment readout
from the landscape branch, add a growth lane column, about −90 / +70.

**`growthLanes.js` — new, ~210 lines, G3 only.** N lanes over a shared symlog
axis; per lane a polarity flag, a roll-up reference rule, N child dots with
rank-ordered label placement, and a drawn spread interval; plus the motion key
with its own dollar scale. Nothing in it knows about Q3: lanes carry their own
domain, polarity and labels, so any measure set with a `goodDirection` can
mount it. It imports `growth.js` unchanged.

**`benchmarkAxis.js` — modified, ~+95 / −45.** A `mode: "delta"` on the axis
spec. The domain becomes symmetric around zero and is authored per axis; the
hollow benchmark ring collapses into the zero rule; the filled dot becomes a
bar from the rule to the delta with a cap; the flat case becomes a neutral dot
sitting *on* the rule rather than beside another circle; rows with empty
`readings` are filtered out and `voidNote` moves to the caption slot; the
readout gains the verdict word, derived from the sign of the authored delta.
The absolute mode stays for any future caller. No new module.

**`dealRail.js` — modified, ~−80 / +15.** The `metrics.gap` composition branch
survives and becomes the default: it re-bases on the authored total, which is
the fallback it already implements. What comes out is the `gap.basis` plumbing,
the derived share-of-gap head, the residual segment and `gapCaption`.

**`attainment.js` — untouched.** Its `domainMax` / `target` / `withBands` /
`gapWeight` generalisation loses its Q3 caller but keeps its defaults and its
four exec-tab callers. Not dead code. The axis-strip end-anchoring fix
(`7bd07e9`) also keeps its exec-tab callers; it stops protecting the Q3 hero
because there is no longer a Q3 hero mounting a bullet.

**`growth.js`, `rulesCard.js`, `portlet.js`, `semantic.js`, `inspector.js` —
untouched.** The provenance flip and the (i) affordance are portlet-level, so
any new renderer inherits them by living inside a portlet shell. The Q3 tab
goes on borrowing the Product tab's rules flyover; no competing copy is
authored here.

**Net for the recommendation:** one new module at ~210 lines, one 890-line
deletion, ~+50 net across the two support portlets. The tab gets substantially
smaller, and it stops carrying any derived arithmetic at all.

**Choreography.** Every new mark joins its chart's veil list — this is the
regression the codebase has shipped three times. `growthLanes` must veil the
lane axes, the decade rules, the zero rules, the roll-up rules and their
labels, the spread intervals, the dots and their labels, the motion key bars
and the alternate-basis strip. `benchmarkAxis`'s delta mode must veil the zero
rule and the verdict words, which are new nodes its current list does not
name. Each renderer exposes the same left-to-right ordered node list the sweep
already walks, so stage one is unaffected and the `src/anim.js` veil contract
holds. `scripts/verify.sh`'s mid-sweep frames at 700ms, 1100ms and 1600ms are
the check.

---

## 9. Constraint compliance

- **One viewport, nothing scrolls.** All four pages were captured at exactly
  1024×580 and 1440×720 and instrumented in the page: document `scrollHeight`
  equals `clientHeight` at both sizes on all four (1024×493 and 1440×633 of
  stage), zero clipped text nodes, and no element in the hand-copied CSS
  carries an `overflow: auto` or `overflow: scroll` valve — which is the
  failure `docs/redesign.md` §1 diagnosed, a composition that never reports
  that it does not fit. Band ratios are `fr` off a `minmax(0, …)` grid — 1.48fr
  for G1, 1.40fr for G2, 1.42fr for G3 — so the ~580px content-height floor
  in `docs/redesign.md` §2 holds by construction rather than by tuning.
- **No derived figure, anywhere.** Every number on every page traces to
  `data/board.json`. The generator computes no quantity that is not authored;
  its only arithmetic is the four closure checks in §2.1, which it prints to
  stdout rather than drawing.
- **No reconciliation UI or commentary.** §7.1.
- **No build step, no dependencies, no charting library.** Hand-built SVG and
  positioned divs. `build.mjs` is a generator for these mockup files, not a
  build step for the board.
- **Direct mode**, per `docs/direct-mode-redesign.md`: three tiers, no drain,
  the dot carrying provenance as colour and detectability as a glyph. All three
  Q3 portlets are authored `silent`, so all three carry `!` in the degraded
  page. Every figure on it is read out of the `directMode` blocks.
- **Brand faces fixed.** Avant Garde For Salesforce Demi for display,
  Salesforce Sans for body, with the `--lh-display-num: 1.12` and
  `--lh-display-text: 1.22` floors from `styles/fonts.css` used as tokens.
- **Nothing is designed around** the removed knowledge-graph overlay or the
  removed footer status bar. The mockups omit both.
