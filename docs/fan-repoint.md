# Repointing the movement fan

**Status: RESOLVED — candidate 3 was chosen and is built.** This document is kept as the reasoning, not as the current state of the board. `acv-account-fan` is now `acv-ae-fan`: per-AE productivity movement, restricted to the 649 AEs present on both the FY26 Q2 and FY27 Q2 rosters, with the 96 joiners and 255 leavers held out as labelled stubs, tiered **supplemented**, and the `[0, 200]` index range widened to `[0, 250]` with an explicit overflow marker for the 22 AEs past it.

Three things below are now wrong and are left in place because the reasoning that produced them is the point:
- **The ranking.** Candidate 3 was ranked third and called "the one to want and not to build". The user chose it deliberately, accepting the supplemented tier as the price of the only genuinely interesting story available. §4's hazard analysis was not overruled — it is what the paired-population restriction implements.
- **Every certified count.** They were written before the repoint. The true counts are now **three certified portlets of nine on the exec tab** and **five of 27 board-wide**. Note that the exec tab had **four**, not five, before this change — §5's "four of the nine" was right and the figure of five was always the board-wide total.
- **The T2 conformed-identity beat.** §5 flagged that this panel was its certified control. It is now weakened rather than relocated, and that is recorded in `direct-mode-redesign.md` §10.1 and on the portlet's own `directMode.directModeNote`.
**Trigger:** the account-level data behind `acv-account-fan` does not exist. The form is worth keeping; the subject has to change.
**Authorities:** [`semantic-layer.md`](./semantic-layer.md) (§3 field catalogue, §2.5 silent failures, §7.2 period-to-date, §10 model-owner corrections), `data/tableau-source-catalog.json`, `data/board.json`, [`visualization-research.md`](./visualization-research.md).

---

## 0. One check decides most of this

"We don't have the account data" has three possible causes, and they eliminate different candidates. Establish which before reading the ranking as final.

| Diagnosis | What actually failed | What it kills |
|---|---|---|
| **(a) No usable account grain** | `Global_Combo_Name6` / `Combo_Company_Name15` is not visible, not queryable, or does not resolve to a consolidated parent | Every account-grain candidate, whatever the measure |
| **(b) No account-grain history** | Account identity works, but `ACV_HISTORICALS` does not carry it at `'PY'` | Only the year-over-year account candidates. Account-grain *snapshot* pairs survive |
| **(c) Full-population pulls are refused** | The agent will not return ~278 ungrouped rows regardless of phrasing | **The form itself.** Not the subject — the fan |

(c) is the one to test first, because it is cheap and it is fatal. `semantic-layer.md` §2.6 says the "return ALL matching rows, do not limit the result set" phrasing is the mechanism, and that it is a phrasing requirement rather than a parameter. If that phrasing does not actually produce a full result set against the live agent, no repoint saves the portlet and the honest move is deletion.

The user's phrasing — *account-level data* — points at (a). The ranking below assumes (a) and therefore ranks **opportunity-grain and user-grain candidates above account-grain ones**. If it turns out to be (b), candidate 2 leapfrogs candidate 1.

---

## 1. The test each candidate has to pass

Restated so the ranking is checkable rather than a matter of taste. The fan earns a full-width band only when all five hold.

1. **Hundreds of entities.** Eight lines is a slope chart.
2. **A paired measurement** — the same entity, the same measure, two comparable points.
3. **A stable population**, with an explicit treatment for whatever enters or leaves.
4. **Heterogeneity the aggregate conceals.** If everything moves together, print the number.
5. **Commensurable units, or an index that makes them so.**

And one criterion this board applies that the form does not: it must say something no other panel says. Two panels have already been deleted for restating their neighbours.

---

## 2. Ranked candidates

### 1. Open Pipe movement per open opportunity, last week → today ★ recommended

| | |
|---|---|
| **Measures** | `Last_Weeks_Open_Pipe_Amount_clc` → `Open_Pipe_clc` |
| **Entity** | `Opportunity_Id34`, labelled with `Opportunity_Name15` |
| **Model** | `Sls_Forecasting_Metrics_Expanded` |
| **Anchor** | `Close_Date17` via `Close_Date_Fiscal_Quarter_Datepart_clc` + `Close_Date_Relative_Year_clc = 'CY'` |

**Sourceable: yes, and it is the best-sourced option on the list.** Both sides of the pair are named, governed measures on one model — no cross-model join, no derived dimension, no `<TBD>` identifier beyond the ones every portlet on this board already carries. The layer ships the pair *as a pair*: it also publishes `Since_Last_Week_Change_in_Open_Pipe_clc`, the certified delta between exactly these two measures, which means the fan's central arithmetic can be checked against a governed number rather than asserted.

Mandatory filters: exactly one dedup filter per §2.3, chosen from the scope decision that is still open board-wide (`<TBD: one of APM_L120 = 'Analytics'`, an OU value, or a named leader's hierarchy`>`). Do **not** add `Is_Current_Quarter_clc` — §2.5 lists it as a double-counter on this shape. Do **not** apply period-to-date: SPEC §5 exempts Open Pipe from PTD by name, which is precisely why this is an honest two-point read of a balance and ACV would not have been.

Query shape, as an utterance (there is no field-level API — §2.1):

> Return `Open_Pipe_clc` and `Last_Weeks_Open_Pipe_Amount_clc` grouped by `Opportunity_Id34` and `Opportunity_Name15`, for `<scope>`, filtered to `Close_Date_Fiscal_Quarter_Datepart_clc = <resolved at run time>` and `Close_Date_Relative_Year_clc = 'CY'`. Also return the `Since_Last_Week_…` movement flags for new, expanded, compressed, won, lost/deaded and pushed-out. Return ALL matching rows — do not limit the result set. Filter out null dimension values.

The `Since_Last_Week_…` apiNames run past the right edge of the source table and are truncated in the PDFs; resolve them with `list_semantic_model_calculated_measures` rather than reconstructing them.

**Cardinality: clears the bar, and it is checkable before any build work.** `of_Opportunities_clc` is a governed measure that returns the count directly, so this is one call rather than an assumption. Structurally it must clear: opportunity grain is strictly finer than account grain for the same scope, so whatever the account fan would have drawn, this draws more.

**Population: the most stable pairing available.** Over one week, almost every open opportunity is present at both points, and everything that is not is flagged by a governed boolean — `Since_Last_Week_Opportunity_Is_New_clc` for entrants, `…Was_Won_clc`, `…Was_Lost_Deaded_…`, `…Was_Pushed_Out_of_Quarter_clc` for exits. The current portlet infers its new-logo cohort from `priorK = 0`; this one reads it off a certified flag. That is strictly better provenance for the same treatment.

Exits do not need special handling at all, and this is the elegant part: §2.5 states that **dead deals are $0 in current Open Pipe** and names the snapshot measures as the way to see what was lost. So a deaded deal lands at index 0 by construction — the layer *predicts* the atom at the bottom of the axis, the same way 15 non-renewals produce one today.

**What the reader learns that nothing else on the board says.** The board carries commit, coverage, gap-to-commit and velocity as aggregates on the Q3 Outlook tab, and `outlook-deals` shows the five largest open opportunities. Nothing anywhere shows whether the week's movement in the pipe is broad drift or three deals moving. That is the question an exec asks about a forecast and the board currently cannot answer it. No panel is restated.

**What could go wrong.**
- **A week is a short window, and the distribution will pile up on the reference line.** This is the real weakness. Most deals do not move in a week, so the fan risks being a dense bar at 100 with thin tails — the opposite of the current chart, whose median sits at 57. Treatment in §4.
- The widest certified snapshot pair *is* one week. `Yesterdays_*` and `Last_Weeks_*` are the only snapshot measures in the catalogue; there is no month-ago or quarter-open balance. The movement *flags* have month equivalents, the *measures* do not. If a week is judged too short, this candidate has no longer version.
- `Last_Weeks_Open_Pipe_Amount_clc` visibility is unconfirmed. Only visible measures are queryable (§2.5). One discovery call.
- RLS returns the caller's slice silently (§6.2). At opportunity grain this is the most tightly scoped pull on the board, so a wrong caller produces a smaller fan that still draws correctly. The magnitude sanity-check is mandatory, not optional.

---

### 2. Open Pipe movement per conformed account, current vs prior year

| | |
|---|---|
| **Measures** | `Open_Pipe_PY_clc` → `Open_Pipe_clc` |
| **Entity** | `Global_Combo_Name6` (or `Combo_Company_Name15` — which is the parent is still `<TBD>`) |
| **Model** | `Sls_Forecasting_Metrics_Expanded` |

**Sourceable: probably not, for the same reason the current subject is not.** Both measures exist and are named. What it needs on top of them is account identity at usable grain — the thing that just failed. Under diagnosis (b) this is the best option on the list and should be ranked first; under (a) it is dead.

It is the closest drop-in the layer offers: same entity, same year-over-year timescale, same "renewable base" reading, and Open Pipe is a balance so the PTD problem that complicates ACV does not arise. Cardinality and population behave exactly as the current portlet assumed.

Two caveats beyond the account question. `Open_Pipe_PY_clc` is described only as "prior year open pipe snapshot" — *as of when* is not documented, and a snapshot taken at a different point in the prior quarter is not a comparable point. And §10.4 item 5 records that the three-year history limit was confirmed for ACV only; `PIPE_HISTORICALS` depth is unconfirmed. Both are discovery calls, not design work.

---

### 3. ACV movement per AE, current vs prior year (per-AE productivity)

| | |
|---|---|
| **Measure** | `ACV_clc`, both sides |
| **Entity** | `User_Name10`, filtered `User_Role2 = 'AE'` |
| **Model** | `Sls_Forecasting_Metrics_Expanded` |

**Sourceable: the measure is, and the headcount gap does not block it — but the population does.**

Worth being precise, because the obvious objection is wrong. §10.1 confirms headcount and everything divided by headcount is unavailable, and `hc-ae` is supplemented for exactly that reason. That does **not** block this candidate: at AE grain the denominator is one, so "ACV per AE" is just `ACV_clc` grouped by `User_Name10`. No headcount measure is needed. The org-wide pattern in §2.3 is explicit — `GROUP BY User_Name10 WHERE User_Role2 = 'AE'`, and **no** `Is_My_Data_clc`. Add `Is_QTD_ACV_1_clc = TRUE` if the quarter is open, or the comparison is a partial quarter against a full one (§2.5).

**Cardinality: 745, which is close to ideal.** Note that 745 is the slide's figure and is authored as supplemented on `hc-ae`; the live count is `COUNT(DISTINCT User_Name10)` over the roster, which §5.2 permits with stated limits.

**Population: this is what sinks it.** The User Hierarchy table is a *current* roster on a weekly refresh with no as-of-period-end read (§4, §10.1), joined on `Record_Owner_Id1 = User_Id31`. So the prior-year side is not "what each AE sold last year" — it is last year's bookings redistributed across today's org. An AE who left takes their book with them or hands it to whoever owns the record now, and the board's own headline asserts an 18% headcount decline, which is roughly 160 AEs of turnover between the two points. Criterion 3 fails outright, and it fails invisibly: the fan draws a clean 745-line population that never existed.

*(That `Record_Owner_Id1` is current-owner rather than owner-at-close is an inference from Salesforce semantics, not something the PDFs state. It is the single check that decides this candidate.)*

**What it would teach.** Genuinely a lot, and more than any other candidate: the board asserts a productivity fall and cannot show whether it is the whole distribution sliding or the top quartile leaving. `visualization-research.md` already names this as the one thing that would earn the form. The problem is not the question, it is that the layer cannot answer it honestly at two points in time.

**Honest fallback.** Ship it labelled as restated under the current org — a real and common view, but the label has to be as load-bearing as the chart, and the portlet stops being certified.

---

### 4. Pipe Gen movement per AE or per account, current vs prior year

| | |
|---|---|
| **Measures** | `PY_Pipegen_clc` → `CY_Pipegen_clc` |
| **Entity** | `User_Name10` (AE) or `Global_Combo_Name6` |
| **Anchor** | **`Stage_2_Flag_Date14`**, never close date |

**Sourceable: the pair is unusually clean, the grain is not.** The layer ships CY and PY as two separate named measures of the same concept, which is a paired read by construction. Inherit the business preference to exclude `APM_L120 = 'Other'`, and note §2.5's sharpest anchoring trap: pipegen on a close-date filter returns the wrong quarter *and* the wrong year, silently.

Ranked below 3 because it inherits whichever grain problem applies — the current roster at AE grain, the account question at account grain — and pipegen is arguably the measure most distorted by restating under today's org, since it is credited to the person who created the pipe. It would also sit awkwardly beside `kpi-pipegen` on the same tab.

---

### 5. Coverage movement per operating unit or sales team, current vs historical benchmark

| | |
|---|---|
| **Measures** | `Coverage_clc` vs `Historical_Coverage_clc` |
| **Entity** | `OU_Operating_Unit`, or `User_Name10` where `User_Role2 = 'L9 Leader'` |

**Sourceable: fully — it is the only completely certified pair on the board. It fails on cardinality and on duplication.**

`OU_Group_clc` has 17 documented values; L9 leaders are order-of-dozens. Both are slope charts, not fans. Pushing to AE grain reaches the hundreds but coverage is a ratio of two small numbers per rep, so it is noisy, frequently null and sometimes negative — and §4's own guidance is that coverage rankings must exclude null and negative values, which means the population you can draw is not the population you queried.

Two further problems. `Historical_Coverage_clc` is the same fiscal quarter averaged across the prior *two* years (§7.4) — it is a benchmark, not a prior point, so a line connecting them is not a movement. And `outlook-benchmark` on the Q3 Outlook tab already plots exactly this pair. This is the duplication the board has twice deleted panels for.

Mandatory if built anyway: `Close_Date_Relative_Year_clc IN ('CY','PY','PY-1')`, or every `Historical_*` measure returns null (§2.5). Never `SUM` it.

---

### 6. Velocity per opportunity against its historical benchmark

**Reject.** `Velocity_clc` is a pace measure and `Historical_Velocity_clc` is a two-year same-quarter average at aggregate grain, so there is no paired measurement of the same entity at two points — criterion 2 fails at the definition. Same duplication problem as 5: `outlook-benchmark` already carries both. In SPEC, `Velocity_clc` is visible but explicitly discouraged in favour of `Specialist_V_clc`, on a much smaller population.

---

### Two notes on candidates that were asked about

**"Day-1 Open Pipe against today" is not sourceable at entity grain, and this is a correction rather than a ranking.** §3.2 and the catalog agree: Day-1 Open Pipe exists as `Target_Next_Quarters_Day_1_Pipe_by_Product_clc` / `_by_Source_clc` and their two attainment measures — **targets, at product or source grain**. The only per-opportunity Day-1 artifact anywhere is `Opportunity_Segmentation = 'Day 1 Open Pipe'` on the Specialist model, which is a *label* on a deal, not a balance measured on day one. There is no opportunity-level or account-level Day-1 Open Pipe actual to pair against today's. The governed measure and its target are real; what is not real is a per-entity reading of it.

**"Opportunity-level forecast drift" is candidate 1.** There is no "amount at quarter open" measure. The sourceable version of that idea is the week-over-week snapshot pair, which is why it sits at the top rather than as a separate line.

**Renewals at account grain — ATR against renewed** (`Open_Available_to_Renew_clc`, `Renewal_Rate_clc`, the `WON_RENEWALS` and `ATR` CTEs) is the closest thing to the *original subject* the layer holds, and §4.2 flags the renewals vocabulary as one of the layer's genuine strengths. It is not ranked because it needs account grain — the thing that failed — and because the grain of the renewals fields is not documented at all. Worth one discovery call if diagnosis (b) turns out to be the case.

---

## 3. Recommendation

**Repoint the fan to Open Pipe movement per open opportunity, last week to today.**

The reasoning is that it depends on neither of the two things that just broke. It needs no account identity and no year-old history — only two snapshot measures of the same balance, on one model, in one grouped query. Every other candidate needs at least one of the two, or fails cardinality.

Three things make it better than a merely adequate substitute:

- **The entry and exit treatment gets stronger, not weaker.** The current portlet infers its new-logo cohort from a zero baseline. This one reads entrants and exits off certified booleans, and the layer's documented hazard — dead deals are $0 in current Open Pipe — predicts the atom at index 0 rather than leaving it to be explained.
- **The arithmetic is independently checkable.** `Since_Last_Week_Change_in_Open_Pipe_clc` is a governed measure equal to the difference the fan draws. No other panel on this board can check its own central claim against a certified number.
- **It is the honest form of the stock argument.** SPEC exempts Open Pipe from period-to-date *by name*, which is why a two-point comparison of it needs no windowing. §12 of the direct-mode work has already re-anchored the board's stock exemplar onto Open Pipe for the same reason. This puts the fan on the same footing.

**Runner-up: candidate 2**, Open Pipe per conformed account year over year — and it becomes the recommendation outright if the failure turns out to be (b) rather than (a). It keeps the account entity and the annual timescale, so it is a smaller change to the board's story, and it is a pure data swap against the renderer.

**Candidate 3, per-AE productivity, is the one to want and not to build.** It answers the most valuable question on the board. It cannot answer it with a population that existed at both points.

---

## 4. Does the form change?

Mostly no, which is the point of picking this subject. Five decisions:

**Keep the index at 100.** Open opportunities span the same wide range accounts do, so a shared dollar origin would assert that a $9M deal's baseline is comparable to an $85K deal's — the claim the index exists to refuse. The origin caption changes from "whatever this account was worth a year ago" to "whatever this deal was worth last week"; the geometry does not.

**Deal with the pile-up on the reference line.** This is the one real form problem. Over a week most deals do not move, so the population concentrates at 100 rather than dispersing. Treat it the way the portlet already treats its excluded cohort: draw only the deals that moved, and render the unchanged count as a second labelled stub outside the axis. The renderer already has the vocabulary for this — the new-logo inflow stub is the same object — so it is an addition to an existing pattern, not a new one. Alternatively expose it as the headline: *"N of M open deals moved this week"* is a real exec number and the fan then shows what the movement looked like.

**Fix the silent clamp.** `movementFan.js` currently clamps every index into `[0, 200]` with `Math.min(rangeHigh, Math.max(rangeLow, …))`. On the account population nothing overflowed. On a weekly deal population a deal can more than double, and a clamped line is drawn at the top of the axis as though it landed there. Either widen the range or draw an explicit overflow marker — silently clamping is exactly the class of thing this board argues against.

**Keep the right-edge density and the median marker.** Both still carry the payload, and the median is arguably more informative here: a median at or near 100 says the typical deal held while the tails did the work, which is the finding. The Gaussian bandwidth is currently 14, derived from Silverman's rule on the account distribution; recompute it from the live population and state the number. That is a constant, not a rewrite. Keep the refusal to reflect at the zero boundary — the atom at 0 is genuine here too, and for a documented reason.

**Upgrade the colour from derived to certified.** Today the split is computed in the renderer as `index > 100` / `<= 100`. The governed booleans (`…was_Expanded_clc`, `…was_Compressed_clc`, `…Was_Lost_Deaded_…`, `…Was_Pushed_Out_of_Quarter_clc`) give the same partition from the layer rather than from arithmetic on the chart's own axis. This is a small renderer change — the group split is currently hardcoded against the reference index, not read from the `test` strings in `metrics.groups` — and it is the change that most strengthens the provenance claim.

No log scale, no absolute units, no new renderer.

**One editorial decision, separate from the form.** Open Pipe's home on this board is the Q3 Outlook tab, where the fan's right-edge sum would be the coverage hero's own numerator. That is an appealing pairing. It also costs the exec tab its most distinctive chart and one of its four certified panels. Recommendation: keep it on exec, make the subject explicit in the sublabel, and let the reconciliation run cross-tab — a certified measure appearing at two grains on two tabs is the same knowledge-graph edge `kpi-acv` and `trend-acv` already carry, and it is a feature.

---

## 5. Provenance tier

**Certified**, and it survives the weakest-link rule.

Every load-bearing input is a governed measure or dimension on one model: `Open_Pipe_clc`, `Last_Weeks_Open_Pipe_Amount_clc`, `Opportunity_Id34`, the `Since_Last_Week_…` flags, and `Since_Last_Week_Change_in_Open_Pipe_clc` as the check. Nothing is supplemented, nothing is derived in the board, no `<TBD>` beyond the scope decision every certified portlet on this board already shares. Under §6.1's rule — a portlet's state is the weakest load-bearing input it has — that is certified in governed mode and inferred in direct.

The direct-mode exhibit survives too, and arguably improves. The current hazard is `conformed-identity` (T2), which depends on the account key. The replacement hazard is cleaner: a CRM export reads today's Amount on every open opportunity and has **no last-week balance at all** — the snapshot does not exist outside the layer, so an agent asked for "what moved this week" would reconstruct it from `LastModifiedDate` or from a stage change and produce a plausible, unverifiable population. Dead deals are the sharpest version: they are $0 today, so a direct query cannot see that anything was lost. The board's whole argument about time-aware context being something a system of record cannot supply lands harder on a measure whose prior value only exists as a governed snapshot.

Net effect on the exec tab: it keeps four certified portlets out of nine (five out of 27 board-wide) rather than dropping to three. If candidate 3 were chosen instead, the prior-year side would be a current-state roster and the portlet would be **supplemented** at best.

---

## 6. What happens to the current portlet

**Repoint it.** The renderer is 911 lines of considered work and the slot is the board's most distinctive band; deleting it to solve a data problem that a different subject solves is a bad trade. Marking it *supplemented* is available in principle but not honest here — the supplemented tier requires a real figure from a real source with a person standing behind it, and the premise is that the account-level data does not exist anywhere, not that it lives in a sheet. Supplemented is for `hc-ae`, where a slide figure genuinely exists. It is not a place to put a number nobody has.

Fallback if the repoint cannot be sourced in time: hold it in mock and label it as such, on the precedent §10.3 sets for the Five Year Trend tab. Do not ship it certified.

### A separate correctness issue, regardless of which subject is chosen

`acv-account-fan` was authored `provenance: "certified"` — one of six certified portlets on the whole board and four of the nine on the exec tab. Its `semantic` block claims `ACV_clc` at conformed-account grain from `Global_Combo_Name6`, and its `directMode.layerDoesNotProvide` says in as many words: *"Nothing here overclaims."*

If the account-level data does not exist, all three of those statements are wrong, and they are wrong in the specific way this board exists to criticise — a confident provenance claim attached to a figure the layer cannot produce. That has to be corrected whether or not the fan is repointed, and it is worth noting that `semantic-layer.md` §4 and the source catalog both currently record this portlet as **⚠ partial / sourceable with a query-construction caveat**. Whatever established that the data is missing should be written back into both files, because right now two authority documents assert something the user has just discovered to be false.

There is a knock-on worth flagging. The portlet's direct-mode exhibit is the T2 conformed-identity beat: *raw gives you two keys, the layer gives you one*. That exhibit needs the certified version to exist as its control. If the layer cannot draw the account fan at all, the beat is not "the layer fixes this" but "neither path can answer it", which is a different and much weaker claim. Repointing to candidate 1 restores a real control; leaving the current subject in place does not.

---

## 7. Build cost against `movementFan.js`

The renderer reads `metrics.rows` as columnar data indexed by `metrics.columns`, plus `groups`, `excluded`, `distribution.percentiles` and the `form` block. Anything expressible in that contract is authoring, not engineering.

| Option | Cost | What it actually is |
|---|---|---|
| **2** — Open Pipe per account, Y/Y | ~2–4 h | **Pure data swap.** Same entity, same timescale, same geometry. Rows, labels, recomputed percentiles and bandwidth |
| **3** — ACV per AE, Y/Y | ~2–4 h | **Pure data swap**, and the best form fit of any candidate: new hires map onto the new-logo stub exactly, AEs who sold nothing land at 0. Its cost is in credibility, not code |
| **1** — Open Pipe per opportunity, WoW ★ | **~0.5–1 day** | **Data swap plus three small renderer edits.** A second stub for unchanged deals (mirrors the existing exclusion stub, ~2 h); group assignment read from the certified flags rather than computed against the reference index, which is currently hardcoded (~1–2 h); clamp/overflow handling (~1 h). No new renderer, no new geometry |
| **4** — Pipe Gen per AE or account | ~2–4 h | Data swap. Costs are in the anchoring rules, not the code |
| **5** — Coverage per OU or team | ~1 day, and do not | **Re-scale.** Indexing current against benchmark to 100 is natural, but with 17 lines the density curve, the bandwidth and the weight map all become meaningless and would need removing — which is most of what makes the portlet worth its band |

Add, for any option, the provenance correction in §6 and a re-run of `scripts/sync-fallback.mjs`.

---

## 8. Open questions to resolve before building

1. **Which diagnosis in §0 is correct.** Decides the whole ranking.
2. **Does the "return ALL matching rows" phrasing actually work** against the live agent, at this row volume. If not, the form is dead regardless of subject.
3. **`of_Opportunities_clc` for the chosen scope** — the cardinality check, one call, before any authoring.
4. **Is `Last_Weeks_Open_Pipe_Amount_clc` visible?** Only visible measures are queryable.
5. **The truncated `Since_Last_Week_…` apiNames**, via `list_semantic_model_calculated_measures`. Do not reconstruct them from the PDFs.
6. **Is `Record_Owner_Id1` owner-at-close or current owner?** Decides candidate 3, and it is the only thing standing between this board and the best chart it could carry.
7. **`Open_Pipe_PY_clc`'s snapshot basis and `PIPE_HISTORICALS`' history depth** — needed only if diagnosis (b), but they decide the runner-up.
