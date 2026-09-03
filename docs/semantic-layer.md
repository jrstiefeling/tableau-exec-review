# The real semantic layer, and what this board would have to do to sit on it

**Status:** findings document. Nothing here has been executed against a live system.
**Sources:** three PDFs, read in full, in `~/Downloads/DF data apps tableau/`:

| Short name used below | File | Owner | Last updated |
|---|---|---|---|
| **FCST** | `Sls_Forecasting_Metrics_Expanded — Semantic Context for Skill Writers.pdf` | Casey O'Donnell | July 1, 2026 |
| **SPEC** | `Sls_Specialist_Reporting — Semantic Context for Skill Writers.pdf` | Sydney Dollar | July 14, 2026 |
| **PULSE** | `Business Pulse — Tableau MCP Enhancement Plan for Claude.pdf` | — (generated, carries an AI-accuracy disclaimer) | Aug 2026 |

**Purpose.** `data/tableau-source-catalog.json` and every `semantic` block in `data/board.json` are currently authored demo content — plausible values invented to look right. This document establishes what the real layer actually contains so both can be rewritten from it without re-reading the PDFs.

**Scope discipline.** Where the PDFs state an identifier, it is quoted verbatim and marked *stated in source*. Where they do not, it is written `<TBD: ...>`. No LUID, apiName, workspace id, dashboard id or SDM id has been inferred, completed, or guessed. Two identifiers that *look* concrete are flagged as needing live re-verification anyway, for the reasons given in §2.6.

**A note on the source PDFs.** All three were exported from a canvas tool that rasterised inline code spans as vector outlines and truncated the right-hand column of every wide table. Field labels and apiNames are fully legible; several *description* strings are cut mid-word in the source itself. Where a description is truncated, this document says so rather than completing it.

> ### ⚑ The model owner has since answered three of these findings, and her answers override this document
>
> The business analyst who owns these semantic models was asked about the findings below and replied. **Her answers rank above the PDFs and above everything in this document**, and they are recorded in full in [§10](#10-corrections-from-the-model-owner). In brief:
>
> 1. **AOV, Revenue, Headcount and headcount-derived metrics (participation, productivity) are not available in this SDM.** The five unsourceable portlets are settled, not provisional. §4.1's hedge about a third undocumented model is withdrawn.
> 2. **PubSec is the Operating Unit, not a segment.** The board's four-way segment split is a derived dimension: `IF OU = Public Sector then OU else segment end`. This **overturns** the blocker in §9.3.
> 3. **There are only three years of ACV data.** Confirmed and sharpened: three years is the extent of the *data*, not of the relative-year vocabulary. The consequence is that **the Five Year Trend tab cannot be sourced.**
>
> Two of the three overturned conclusions this document had assembled entirely from verbatim quotations. That is worth holding onto while reading the rest: every fact cited in §9.3 was a direct quote, and the conclusion drawn from them was still wrong.

---

## Contents

1. [What actually exists](#1-what-actually-exists)
2. [The query contract](#2-the-query-contract)
3. [Field catalogue](#3-field-catalogue)
4. [Board metric → real source](#4-board-metric--real-source)
5. [Corrections to the authored `semantic` blocks](#5-corrections-to-the-authored-semantic-blocks)
6. [Row-level security and scope](#6-row-level-security-and-scope)
7. [Grain hazards: additivity, partial periods, and the fiscal calendar](#7-grain-hazards-additivity-partial-periods-and-the-fiscal-calendar)
8. [Worked discovery-to-query sequences](#8-worked-discovery-to-query-sequences)
9. [Where the three documents disagree](#9-where-the-three-documents-disagree)
10. [Corrections from the model owner](#10-corrections-from-the-model-owner) — **authoritative; overrides §1–§9**

---

## 1. What actually exists

### 1.1 Two semantic data models, not one

The board assumes a single `"Analytics Revenue SDM"`. The real layer, as documented, is **two separate Tableau Next semantic data models with no relationship between them**, plus a set of Tableau *Cloud* published datasources reachable through a different MCP server entirely.

| | `Sls_Forecasting_Metrics_Expanded` | `Sls_Specialist_Reporting` |
|---|---|---|
| **apiName** *(stated)* | `Sls_Forecasting_Metrics_Expanded` | `Sls_Specialist_Reporting` |
| **SDM label** | `<TBD: not stated in FCST>` | `Specialist Reporting` *(stated)* |
| **SDM id** | `<TBD: not stated in FCST>` | `2SMed000001kPXVGA2` *(stated)* |
| **Dataspace** | `<TBD: not stated in FCST>` | `Sales` *(stated)* |
| **Covers** | Open pipeline, commit, ACV, pipegen, **attrition**, **renewals**, deal movement, day-over-day and week-over-week change | Specialist (non-core / SFR-attributed) pipeline, commit, ACV, pipegen, coverage, funded, velocity, gap-to-commit |
| **Population** | "the full commercial sales org" | Specialist-covered opportunities only |
| **Consumers** | Sales leaders L2–L9, AEs, RVPs, FLMs, Sales Ops, Slackbot skills | Specialist leaders L4–L10, specialist AEs, Sales Ops, Slackbot skills |
| **Structure** | Two SQL queries joined by a Tableau relationship: a **Core Metrics** table (union of 15 input CTEs) and a **User Hierarchy** table (flattened org hierarchy), joined on `Record_Owner_Id1 = User_Id31` | "Single data object, no relationships. Unrelated objects combine via `Union`" |
| **Row grain** | **one row per metric per opportunity per user in the reporting hierarchy** | **one row per opportunity-line record in the specialist forecast fact, per data source** (`Live` / `Snaps` / `Specialist Commit`) |
| **Refresh** | Hourly (SDM) over a daily ~8 AM PT extract | ~1 hour |
| **Mandatory filter** | exactly one dedup filter (§2.3) | `Is_Specialist_AE_Covered_Cleaned_clc = TRUE`, always |
| **Default timeframe** | current fiscal **quarter** | current fiscal **year** |
| **Explicitly excluded** | **AOV** | **AOV**, and all core-AE / standard opportunity reporting |

**The relationship between them is: none.** SPEC §2 states the model is a single data object with no relationships, and neither document describes a join to the other. They overlap in subject matter (both carry ACV, open pipe, pipegen, commit, coverage) but they are *different populations measured differently*: SPEC's fields "represent the specialist's attributed share of a deal, which can differ from core opportunity values." PULSE treats them as two tools in one kit and switches between them per card; it never joins them.

> **The single most consequential fact for this board:** the same word means two different numbers in the two models. `ACV_clc` (FCST) and `ACV_Closed_Won_clc` (SPEC) are not the same measure, are not reconcilable, and must never appear on the same tile.

### 1.2 What "SDM" refers to, and what it does not

Both PDFs are written for **Tableau Next**, where an SDM is queried by apiName through the Analytics Agent. PULSE additionally references a Tableau **Cloud** published-datasource LUID (`c4e2cc15`, for regional split) — a different server, different auth, different schema. See §2.6.

`Sls_Specialist_Reporting`'s underlying source is itself a Tableau Cloud published datasource: connection `externalConnection1`, described as *"Specialist Pipeline and Forecasting (RLS)"*, on Tableau site `salesforce` (`prod-uswest-c.online.tableau.com`), over source table `SSE_DM_TAB_DE_PRD.FACT_SALES_SPECIALIST_FORE…` *(truncated in source)*, data object `Specialist_RSSO`. So the Specialist SDM and the Cloud datasource of the same name are two faces of one thing, and a number pulled from each should agree. `Sls_Forecasting_Metrics_Expanded` gives no equivalent connection detail.

### 1.3 What the third document is

**PULSE is not a third model.** It is an enhancement plan for a Slackbot report, drawing on both SDMs. It is useful here for three things and should be trusted for nothing else:

1. It is the only source that describes **cross-SDM operating constraints** (President-tier hierarchy joins, RLS gating against the caller, fallback-to-Org62 thresholds).
2. It confirms the field names in both catalogues independently, and its closing line claims "All field names verified against live schema."
3. It carries its own disclaimer: *"This canvas was generated using AI, which can produce inaccurate or harmful responses."* Two of its claims contradict the primary docs — see §9.

---

## 2. The query contract

### 2.1 The tool surface, and what the PDFs actually say about it

SPEC §1, verbatim, is the tightest statement of the query mechanism anywhere in the three documents:

> "Tableau Next MCP exposes **one** query tool: `analyze_data` (natural language). It generates `SEMANTIC_VIEW(...)` SQL internally. **There is no field-level query API** — the patterns below are prompt scaffolding + expected SQL, not a callable schema."

This is load-bearing and the current catalog under-states it. Every "query shape" in `tableau-source-catalog.json` that reads like a structured field list is, on the Tableau Next path, **an utterance** — a natural-language sentence that names the exact apiNames, and whose result comes back as prose or a table that the caller must parse. The field names are not passed as parameters; they are named in a sentence so the agent generates the right SQL.

**Call parameters.** SPEC §1 and FCST §1 both give a two-row table headed "Every Analyze Data call must use these exact values":

| Parameter *(stated)* | Value *(stated)* |
|---|---|
| `targetEntityIdOrApiName` | `Sls_Specialist_Reporting` / `Sls_Forecasting_Metrics_Expanded` |
| `targetEntityType` | `sdm` |

"All calls pass the same target — only the `utterance` changes per insight."

> ⚠ **Three artifacts spell these parameters three different ways.** The PDFs say `targetEntityIdOrApiName` / `targetEntityType: 'sdm'`. The sibling app's catalog says `target_entity_name_or_id` / `target_entity_type: 'sdm'`. This repo's catalog says `target_entity_id` / `target_entity_type: 'semantic_model'`. At most one is right. Treat all three as `<TBD: read the parameter names off the running MCP server's own tool schema before the first call>` and do not copy any of them forward.

**Discovery tools.** SPEC §16 documents how the guide itself was generated, which is the most authoritative confirmation of the discovery surface in any of the three PDFs:

1. `list_semantic_models` (searchTerm "Specialist Reporting") → confirm apiName / id
2. `get_semantic_model(Sls_Specialist_Reporting)` → business preferences, last-modified
3. `list_semantic_model_data_objects` → native dimensions / measures (+ visibility)
4. `list_semantic_model_calculated_dimensions` / `list_semantic_model_calculated_measures` → calc fields (+ visibility, aggregation, expressions)
5. `analyze_data` with "list distinct values of …" → enumerations; capture the generated `SEMANTIC_VIEW(...)` SQL
6. Re-apply schema divergences and hand-maintained judgment

This corroborates the sibling app's documented 20-tool surface. **Discovery is mandatory before querying**, and specifically: *visibility* must be checked, because "Only **visible** measures are queryable/presentable" (SPEC §6) and several fields the board would want are hidden (§2.5).

### 2.2 Ordering: what must happen before a number is fetched

1. `list_semantic_models` / `search_assets` → resolve which of the two SDMs (or a third, undocumented one) answers the question. **Not interchangeable** — picking the wrong one silently answers a different question about a different population.
2. `get_semantic_model` → read `businessPreferences`. Both SDMs have baked-in rules that apply to every generated query whether or not you ask for them (§2.4). One of them (`'UP +'`) is *wrong as a filter value* and must not be copied out of the preferences into a query (§2.5).
3. `list_semantic_model_calculated_measures` / `..._calculated_dimensions` / `list_semantic_model_data_objects` → confirm the apiName **and its visibility and aggregationType** before naming it in an utterance.
4. Only then `analyze_data`.
5. **Re-sort and re-check client-side.** SPEC's High Risk Stale Deals pattern: *"After receiving results: re-sort the returned rows yourself … Do not rely on Tableau Next to sort — always re-sort in your own output."*

### 2.3 The mandatory filters — one per model, and they are different

**`Sls_Forecasting_Metrics_Expanded` — exactly one dedup filter, always.** FCST §4 is headed "CRITICAL: Data Deduplication — Read This First" and states: *"The underlying data has one row per deal per user in the reporting hierarchy. A single $500K opportunity appears for the owning AE, their FLM, the RVP above, and every leader up to the WW President. Without a deduplication filter, `SUM(Open_Pipe_clc)` will overcount by 3x–10x depending on org depth."*

| Scenario | Filter *(stated)* |
|---|---|
| User's own data | `Is_My_Data_clc = 1` |
| Named individual | `User_Name10 = 'Adam'` — **do NOT also add** `Is_My_Data_clc` |
| Logged-in user's directs | `GROUP BY Directs6` + `Is_My_Data_clc = 1` |
| Named leader's directs | `User_Name10 = 'Adam'` + `GROUP BY Directs6` |
| Org-wide "who" question | **No** `Is_My_Data_clc` — `GROUP BY User_Name10` |
| By AE / by rep | `GROUP BY User_Name10 WHERE User_Role2 = 'AE'` |
| By FLM / RVP | `GROUP BY User_Name10 WHERE User_Role2 = 'L9 Leader'` — no `Is_My_Data_clc` |

> `Is_My_Data_clc = 1` **"MUST NEVER be applied when querying an entire org unit or filtering to someone who is not the current user. Use `User_Name10` instead."** The two are mutually exclusive; never combine them.

**`Sls_Specialist_Reporting` — `Is_Specialist_AE_Covered_Cleaned_clc = TRUE`, always, no exceptions.** SPEC §4a: *"The dataset contains both specialist-covered and non-specialist opportunities; this filter removes irrelevant records entirely (it is **not** a hierarchy dedup). It stays even when querying a specific person by name … Verified against live behavior: the Analytics Agent applies it on every generated query."*

Separately, SPEC's row grain requires `COUNT(DISTINCT Opportunity_ID35)` for any deal count — *"never plain `COUNT`"* — because one opportunity recurs across `Live` / `Snaps` / `Specialist Commit` and across snapshots.

**This SDM has no `Is_My_Data` field.** SPEC §9: *"Scoping works differently than the core forecasting SDM: Row-Level Security is auto-enforced … Never try to filter by a 'my data' flag in this SDM — it doesn't exist."* Person scoping instead uses an OR across the denormalised hierarchy fields `Specialist_Level_04_User_Name` … `Specialist_Level_10_User_Name` plus `Specialist_User_Name`, because a person appears at whichever level matches their role.

### 2.4 Built-in business preferences that apply whether you ask or not

**`Sls_Forecasting_Metrics_Expanded`:**
- Filter NULL dimension values out of any result by default.
- **Always exclude `APM_L120 = 'Other'`** whenever APM L1 is visible in a chart or table.
- "True C&C" means `Create_Close_Sub_Type1 IN ('Manufactured', 'Organic')`; standard Create & Close is just `Is_Create_Close = TRUE`.

**`Sls_Specialist_Reporting`:**
- The always-on scope filter above.
- Open deals → `Is_Open_Pipe6 = TRUE` **AND** `Data_Source_Cleaned_clc = 'Live'`, applied explicitly even though some measures already embed the logic.
- Deal counts → `COUNT(DISTINCT Opportunity_ID35)`.
- Default timeframe = current fiscal **year**: *"Whenever a year timeframe is not specified, default to using the current fiscal year."* Only scope to a quarter when asked.
- Prefer the specialist / SFR-attributed field over the core version, always.

### 2.5 The full list of things that go wrong silently

Everything below fails *without an error*. This is the section the rewritten catalog's `guardrails` block should be built from.

| Violation | Silent failure |
|---|---|
| No dedup filter on FCST | Result **3x–10x too large**. FCST's own diagnostic: "Results 5–10x too large = missing dedup filter." |
| `Is_My_Data_clc` combined with `User_Name10` | Mutually exclusive; result is meaningless rather than empty. |
| `Is_My_Data_clc` used by someone with no forecast record | **The filter becomes a no-op and returns all data.** "This can cause unexpectedly large result sets" — dangerous precisely because it looks like success. |
| Missing `Is_Specialist_AE_Covered_Cleaned_clc` on SPEC | Numbers too high; non-specialist opportunities silently included. |
| `Is_Current_Quarter_clc = TRUE` on a plain current-period query | **Double-counts** — pulls prior-year rows into a single-period total. |
| Missing `Close_Date_Relative_Year_clc IN ('CY','PY','PY-1')` | Every `Historical_*` measure **returns null**, because they are pre-calculated 2-year averages that need PY-1 rows present. |
| Missing `Is_QTD_ACV_1_clc = TRUE` on a Y/Y ACV comparison | Partial current quarter compared against a full prior quarter — "making current year look artificially behind." |
| Pipe Gen anchored on close date | **Wrong quarter and wrong year.** "A deal created in Q1 that closes in Q3 = Q1 Pipe Gen but Q3 Open Pipe/ACV." |
| ACV or pipeline anchored on Stage 2 Flag Date | Same class of error, inverted. |
| Stage filtered by equality | **Zero rows.** Stage names carry variable descriptive suffixes (`02 - Discovery`, `02 - Scoping`); only the numeric prefix is stable. Use `CONTAINSIGNORECASE(Opportunity_Stage_Name4, '04')`. |
| MFJ filtered with the wrong string | **Zero rows, silently.** `UP -` has one space before the dash; `UP+` has none. `'UP-'` returns nothing. |
| MFJ filtered on `'UP +'` | **Zero rows.** That string appears in the SDM's own stored `businessPreferences` but is *"a guidance-mapping string, not the actual data value, so do not use it as a filter."* Copying it out of discovery output is the trap. |
| `SUM` applied to a ratio | Nonsense, no error. Coverage, funded %, velocity, Y/Y, CAGR and averages are **non-additive**. |
| Plain `COUNT` on SPEC rows | Overstates deals — one opportunity recurs across data sources and snapshots. |
| Attainment filtered as `< 80` | Attainment is stored as a **decimal 0.0–1.0+**. "Below 80%" is `< 0.8`. `< 80` matches everything. |
| `Open_Pipe_clc` used for dead/lost deals | **Dead deals are $0 in current Open Pipe.** Use `Yesterdays_Open_Pipe_clc` or `Last_Weeks_Open_Pipe_Amount_clc` to see what was lost. |
| Result presented as global | RLS is silent (§6). "Never call a number 'global.'" |
| Querying a hidden field | Not queryable. `SFR_Pipe_Gen_Amount_clc` (specialist pipegen), `Coverage_clc` in SPEC, and `SFR_ID` are all hidden — the doc names the working substitutes. |
| Relying on the server's sort | SPEC explicitly says not to. Re-sort client-side. |
| Treating close dates past 2030-01-01 as bad data | **"Close dates capped at 2030-01-01 — intentional, not an error."** |

### 2.6 Do the sibling app's Tableau Cloud constraints hold here?

The sibling catalog documents, for **Tableau Cloud MCP**: *"NEVER pass a workbook/view LUID — published-datasource LUIDs only,"* *"NEVER use `get-view-data` (times out),"* *"NO `limit` key,"* and *"Date filter mandatory on every ACV/closed-business query."*

**Those constraints belong to Tableau Cloud MCP and none of the three PDFs contradicts, confirms, or even mentions them.** They are simply about a different server. The Tableau Next path in these PDFs has no LUID at all — `analyze_data` targets an SDM apiName. Carry the Cloud constraints forward unchanged for any Cloud query; do not attach them to Tableau Next calls, where they have no meaning.

Two things the PDFs *do* add on the Cloud side:

- **PULSE names `c4e2cc15`** as holding regional split (`OvA Derived Region`, `OvA Derived Sub Region`, `Entitlement Region`, and an `APM L1` cross-tab). This matches the sibling catalog's `c4e2cc15-fe0e-4632-91ba-5fd9506257c7` — "Closed Business ACV (RLS)". The fragment is *stated in PULSE*, but it appears there only as an eight-character prefix, and both this repo's and the sibling's guardrails require live re-discovery of every LUID on every run. **Treat as `<TBD: published-datasource LUID for regional split — PULSE names the prefix `c4e2cc15`; re-resolve via `list-datasources` and confirm the full LUID before use>`.**
- **On "no limit key":** the *tool* has no limit parameter, but the generated SQL does. SPEC's ranking rule is `ORDER BY <metric> DESC NULLS LAST LIMIT 10` for top-N, expressed *in the utterance*. Conversely, for full-population pulls SPEC's Open Pipeline Misalignments pattern says: *"return a table of ALL matching rows (do not limit results — request the full result set)."* This is the mechanism the account-fan portlet (278 rows) would depend on, and it is a phrasing requirement, not a parameter.

### 2.7 Date anchors — which field for which metric

| Metric family | FCST field | SPEC field |
|---|---|---|
| ACV, Open Pipe, Attrition, NNAOV, Renewals, Coverage, Commit, Gap to Commit, Velocity, Funded | `Close_Date17` — via `Close_Date_Fiscal_Quarter_Datepart_clc` + `Close_Date_Relative_Year_clc` | `Opportunity_Close_Date_clc` — via `Close_Date_Relative_Year_clc` |
| **Pipe Gen only** | `Stage_2_Flag_Date14` — via `Stage_2_Flag_Date_Fiscal_Date_Part_clc` + `Stage_2_Flag_Date_Relative_Date_clc` | `Stage_2_Flag_Date15` |

*"Don't hand-roll date math — use the calculated date fields."* (SPEC §5.) FCST adds: *"Never use `DATE_TRUNC` for historical comparisons — use the pre-calculated relative year fields."*

---

## 3. Field catalogue

Only fields relevant to this board or its planned tabs are listed. Descriptions marked *(truncated)* are cut mid-sentence in the source PDF; the full text is not recoverable from the documents supplied.

### 3.1 `Sls_Forecasting_Metrics_Expanded` — core KPI measures

| Label | apiName | Note |
|---|---|---|
| Commit | `Current_Commit_clc` | ACV forecast commit *(description truncated: "…President level)")* |
| Current Coverage | `Coverage_clc` | Open Pipe ÷ Commit. **Multiplier**, not a percent |
| Historical Coverage | `Historical_Coverage_clc` | 2-year average coverage, same quarter |
| Current Funded % | `Funded_clc` | % of Open Pipe where MFJ = IN |
| Current Funded Amount | `Funded_Amount_clc` | Dollar value of Open Pipe where MFJ = IN |
| Historical Funded % | `Historical_Funded_clc` | 2-year average funded %, same quarter |
| Current Velocity | `Velocity_clc` | Current pace of deals through pipeline |
| Historical Velocity | `Historical_Velocity_clc` | 2-year average velocity, same quarter |
| Open Pipe | `Open_Pipe_clc` | Value of open (not yet closed) pipeline |
| **ACV** | **`ACV_clc`** | **Actual closed-won deal value** |
| Gap to Commit | `Gap_to_Commit_clc` | Difference between Open Pipe and Commit |
| **Attrition** | **`Attrition_clc`** | **Actual attrition (1 month lag)** |
| Attrition Commit | `Attrition_Commit_clc` | Current attrition forecast commit |
| **NNAOV Commit** | **`NNAOV_Commit_clc`** | **"Net New ACV + Offset Value commit"** — a *commit*, not a booked actual |
| **Pipe Gen** | **`Pipe_Gen_clc`** | Pipeline created (deals entering Stage 2) |
| Open Renewals: ATR | `Open_Available_to_Renew_clc` | Available to Renew (open) |
| Renewal Rate | `Renewal_Rate_clc` | Renewal rate metric |
| CY Pipe Gen | `CY_Pipegen_clc` | |
| PY Pipe Gen | `PY_Pipegen_clc` | |
| Open Pipe (PY) | `Open_Pipe_PY_clc` | Prior year open pipe snapshot |
| # of Opportunities | `of_Opportunities_clc` | |
| Average Deal Size | `Average_Deal_Size_clc` | |
| Plus One Roll Up | `Plus_One_Roll_Up_clc` | |
| Plus Two Roll Up | `Plus_Two_Roll_Up_clc` | |

**Snapshot measures** (point-in-time balances): `Yesterdays_Open_Pipe_clc`, `Yesterdays_ACV_Amount_clc`, `Yesterdays_ACV_Commit_clc`, `Yesterdays_Coverage_clc`, `Yesterdays_Funded_clc`, `Yesterdays_Velocity_clc`, `Yesterdays_Attrition_Forecast_clc`, `Yesterdays_Plus_One_Rollup_clc`, `Last_Weeks_Open_Pipe_Amount_clc`, `Last_Weeks_ACV_Amount_clc`, `Last_Weeks_ACV_Forecast_clc`, `Last_Weeks_Coverage_clc`, `Last_Weeks_Funded_clc`, `Last_Weeks_Velocity_clc`, `Last_Weeks_Attrition_Forecast_clc`.

**Change deltas**: `Since_Yesterday_Change_in_{Commit,Coverage,Funded,Open_Pipe,Velocity}_clc`, `Since_Yesterday_ACV_Change_clc`, `Since_Yesterday_Attrition_Commit_clc`, and the `Since_Last_Week_…` equivalents (`Since_Last_Week_ACV_Change_clc`, `Since_Last_Week_Change_in_Attrition_Commit_c…` *(truncated)*).

**Deal movement flags** (boolean, one set per window): `Since_Yesterday_Opportunity_Slipped_clc`, `…Opportunity_was_Compressed_c…`, `…Opportunity_was_Expanded_clc`, `…Opportunity_Was_Won_clc`, `…Opportunity_Was_Lost_Deaded_…`, `Since_Yesterday_Opportunity_Is_New_clc`, `Since_Yesterday_Manager_Forecast_Judgment_Ch…clc`, `Since_Yesterday_Forecast_Category_Changed_cl…`, `…Was_Pulled_Into_Quarter_clc`, `…Was_Pushed_Out_of_Quarter_clc`, plus month equivalents. `Since_Last_Week_…` mirrors all of them. *Several apiNames run past the right edge of the source table and are truncated; resolve any that a tab actually needs via `list_semantic_model_calculated_measures` rather than reconstructing them.*

### 3.2 `Sls_Forecasting_Metrics_Expanded` — targets and attainment

| Label | apiName |
|---|---|
| Target: Pipe Gen by Product | `Target_Pipe_Gen_by_Product_clc` *(default for attainment questions)* |
| Target: Pipe Gen by Source | `Target_Pipe_Gen_by_Source_clc` |
| Target: Day 1 Open Pipe by Product | `Target_Next_Quarters_Day_1_Pipe_by_Product_clc` |
| Target: Day 1 Open Pipe by Source | `Target_Next_Quarters_Day_1_Pipe_by_Source_clc` |
| Target: Pipe Gen Near Landing | `Target_Pipe_Gen_Near_Landing_clc` |
| % of Pipe Gen Near Landing | `of_Pipe_Gen_Landing_ThisNext_Quarter_Near_Landing_clc` |
| Attainment: Pipe Gen by Product | `Target_Attainment_Pipe_Gen_by_Product_clc` |
| Attainment: Pipe Gen by Source | `Target_Attainment_Pipe_Gen_by_Product_clc_1` — **note the apiName says "by_Product" with a `_1` suffix; the label says "by Source"** |
| Attainment: D1OP by Product | `Target_Attainment_Next_Quarters_Day_1_Pipe_by_Product_clc` |
| Attainment: D1OP by Source | `Target_Attainment_Next_Quarters_Day_1_Pipe_by_Source_clc` |

All attainment fields are decimals 0.0–1.0+. Display rule: multiply by 100, append `%`.

### 3.3 `Sls_Forecasting_Metrics_Expanded` — helper dimensions and key raw dimensions

Helper/filter: `Is_My_Data_clc`, `Is_ACVClosed_Won_clc`, `Is_Current_Open_Pipe_clc`, **`Is_QTD_ACV_1_clc`**, `AS_OF_YESTERDAY_Was_QTD_ACV_clc`, `AS_OF_LAST_WEEK_Was_QTD_ACV_clc`, `Was_Historical_Open_Pipe_clc`, `Pipe_Gen_Landing_Quarter_clc` (`'Same Quarter'` / `'Next Quarter'` / `'2 Quarters Out'` / `'3+ Quarters Out'`), `Opportunity_Deal_Band_clc`, `Close_Date_Fiscal_Quarter_Datepart_clc`, `Close_Date_Relative_Year_clc`, `Stage_2_Flag_Date_Fiscal_Date_Part_clc`, `Stage_2_Flag_Date_Relative_Date_clc`.

**Do not surface or filter on:** `Counts_Towards_Plus_One_Roll_Up_clc`, `Include_in_Plus_Two_Roll_Up_clc`, `Is_Non_Sales_User_clc`.

Identifiers and attributes: `Opportunity_Id34`, `Opportunity_Name15`, **`Account_Name129`** (no Account *ID* in this SDM), `Record_Owner_Id1`, `Opportunity_Source6` (`'Outbound'`/`'Inbound'`), `Opportunity_Type10` (`'New Business'`/`'Renewal'`…), `Create_Close_Sub_Type1`, **`New_Logo_Eligible4`**, **`Global_Combo_Name6`**, **`Combo_Company_Name15`**, `Is_Create_Close`, `Is_Partner_Attached`, `ECS_BCO_Covered4`.

Dates: `Close_Date17`, `Stage_2_Flag_Date14`, `Contract_Sign_Date_OCD1`, `Yesterday_s_Close_Date2`, `Last_Week_s_Close_Date1`, `Opportunity_Day_of_Last_Activity`, `Opportunity_Stage_Last_Updated_Date1`.

Deal attributes: `Stage_Name10`, `Manager_Forecast_Judgment`, `Forecast_Category10` *(a different system from MFJ — do not conflate)*, `SE_Judgment`, `SE_Score7`, `AE_Score7`, `Next_Steps10`, `Manager_Notes7`, `Metric_Name4`, `Metric_Value2`, **`Underlying_Data_Source1`**, plus yesterday/last-week snapshots of stage, MFJ and forecast category.

User & hierarchy: `User_Name10`, `User_Role2` (`'AE'`, `'L2 Leader'`, `'L9 Leader'`, `'Miguel Milano'`, `'Alexa Vignone'`), `User_Id31`, `User_Email3`, `User_Slack_Id`, `User_Is_Active1`, `Directs6`, `Directs_Id`, `Plus_Twos1`, `Plus_Twos_Id`.

Segmentation & territory: **`Segment10`** (ENTR, CMRCL, SMB, ESMB…), `Sub_Segment`, `Region38` (AMER, EMEA, APAC), `Subregion5`, **`OU_Operating_Unit`**, `Sector19`, `Sub_Sector12`, `Industry51`.

> **`OU_Operating_Unit` became load-bearing after §10.2.** It is the only Operating Unit field on this model, and the model owner's segment derivation tests an OU against `Public Sector`. FCST names the field and **documents no value set for it at all**, so whether it carries a Public-Sector value is unknown from these documents. The only Public-Sector-shaped OU value anywhere in the three PDFs is `OU_Group_clc`'s truncated `Pub Se…` — and that field is on the *other* model. See §10.2.

Product: **`APM_L120`** (`'Sales'`, `'Service'`, `'Sales Platform'`, `'Marketing'`, `'Commerce'`, `'Slack'`, **`'Analytics'`**, `'AI and Data'`, `'Integration'`, `'Informatica'`, `'Customer Success Plans'`, `'Other'`, null) and **`APM_L218`** (`'Tableau Next'`, `'Tableau Server'`). Rule: *"'Tableau Next' / 'Tableau Server' are APM L2 values — search both: `(APM_L120 = 'Tableau Next' OR APM_L218 = 'Tableau Next')`"*; *"'Analytics' / 'Analytics Cloud' = `APM_L120 = 'Analytics'`"*.

Renewals: `Renewal_Book_of_Business1`, `Renewal_Timing1`, `Renewal_Key_Risk_Category1`.

`Underlying_Data_Source1` values (the 15 input CTEs): `Commits`, `Historical Commits`, `TODAY_AND_DEAL_MGMT`, `PIPE_GEN`, `HISTORICAL_PIPE_GEN`, `PIPE_HISTORICALS`, **`ACV_HISTORICALS`**, **`ATTRITION_ACTUALS`**, **`ATTRITION_UNOFFICIAL`**, `WON_RENEWALS`, `ATR`, `PG_TARGETS`, `OP_TARGETS`, `PG_LANDING_QTR_TGT`. *(Fourteen listed; the doc says 15 CTEs.)*

### 3.4 `Sls_Specialist_Reporting` — measures, with the additivity classification

**Additive (row-level `SUM` is safe):** `ACV_Closed_Won_clc`, `ACV_Closed_Won_CY_clc`, `SFR_Open_Pipe_Amount_clc` *(primary open-pipe measure)*, `Open_Pipe_Amount_clc` *(core; prefer the SFR version)*, `Specialist_Commit_clc`, `Specialist_Funded_Amount_clc`, `Pipe_Gen_Amount_clc`, `Specialist_OP_CY_clc`.

**Non-additive — DO NOT SUM:** `ACV_PTD_YY_clc`, `Commit_YY_clc`, `Commit_2_Year_CAGR_clc`, `Open_Pipe_YY_clc`, `Open_Pipeline_2_Year_CAGR_clc`, `Historical_Coverage_clc`, `Historical_Funded_clc`, `Historical_Velocity_clc`, `Specialist_Coverage_clc`, `Specialist_Gap_to_Commit_clc`, `Specialist_V_clc`, `SFR_Funded_Percentage_clc`, `Velocity_clc` *(visible but discouraged — "defer to SPOX"; use `Specialist_V_clc`)*.

**Deal quality:** `Average_Deal_SIze_clc` — *the capital "I" typo is in the SDM and the apiName must match it exactly* — `Opportunity_Days_To_Close_clc`, `SFR_Opportunity_Amount_Delta_clc`, `Opportunity_Days_In_Current_Stage`, `Opportunity_Days_Since_Activity`.

**Boolean helpers:** `Is_Specialist_AE_Covered_Cleaned_clc`, `Is_Open_Pipe6`, `Is_Closed_Won_clc`, `Is_Stage_4_clc`, `Is_Create_Close_clc`, **`Is_QTD_ACV_clc`**, `Is_Current_Quarter_clc`, `Opportunity_Misaligned_clc`.

**Prefer SFR over core, always:**

| Concept | Use | Do NOT use |
|---|---|---|
| Open pipeline | `SFR_Open_Pipe_Amount_clc` | `Open_Pipe_Amount_clc` (core) |
| Coverage | `Specialist_Coverage_clc` | `Coverage_clc` (hidden) |
| MFJ | `SFR_Manager_Forecast_Judgement` | `Opportunity_Manager_Forecast_Judgement` |
| Pipe Gen | `Pipe_Gen_Amount_clc` (working) | `SFR_Pipe_Gen_Amount_clc` (hidden — "unhide to use") |

**Dimensions:** `Opportunity_ID35`, `Opportunity_Name16`, **`Account_ID106`**, **`Account_Name130`**, **`Global_Combo_Name7`**, `Industry52`, `Source6`; `Opportunity_Close_Date_clc`, `Stage_2_Flag_Date15`, `Close_Date_Relative_Year_clc`, `SFR_Last_Modified`, `Opportunity_Next_Steps_Last_Modified`; `Opportunity_Stage_Name4`, `SFR_Stage_Name`, **`Opportunity_Segmentation`** (`C&C`, `Day 1 Open Pipe`, `Pre-Books`, `Pulled Forward`), `C_C_Segmentation`, `SFR_Manager_Forecast_Judgement`, `Opportunity_Deal_Band_ACV_clc`, `Is_Partner_Attached1`, `Is_Pipe_Gen2`, `Lead_Sales_Partner_Role1`.

**Hierarchy:** `Specialist_User_Name` (finest grain), `Specialist_Level_04_User_Name` (default "leader" level) through `Specialist_Level_10_User_Name`.

**Segmentation & territory:** **`Derived_Macro_Segment`** (`CMRCL`, `ENTR`, `ESMB`, `PUBSEC`, plus null), `Derived_Micro_Segment`, `OU_Group_clc`, `OvA_Derived_Region`, `OvA_Derived_Sub_Region`.

`OU_Group_clc` values *(stated, verified live 2026-07-02)*: AMER PACE, AMER REG, SMB, AMER TMT, Next Platform, AMER CBS, LATAM, EMEA UKI, Pub Se… *(truncated)*, JP/KT, EMEA South, EMEA North, SASIA, ANZ, E… France *(truncated)*, EMEA Central, Other.

**Product:** `APM_L121`, `APM_L219`, `APM_L317`, `APM_Specialist_Cloud_Routing`.

**`Data_Source_Cleaned_clc`:** `Live` (use for open-pipe queries), `Snaps`, `Specialist Commit` (use for commit-source views).

**RLS plumbing — never surface:** `Is_SFR_User_Entitled_clc` (primary, marked visible but is plumbing), `Is_Entitled_User_clc` (legacy, hidden).

---

## 4. Board metric → real source

Legend: **✅ direct** — a certified measure exists. **⚠ partial** — something exists but at a different definition, population or grain. **❌ gap** — nothing in either documented SDM answers this.

| Board metric | Status | Real source | Model | Grain / anchor | Required filters |
|---|---|---|---|---|---|
| **ACV** (`kpi-acv`, `trend-acv`) | ✅ | `ACV_clc` | FCST | `Close_Date17` via `Close_Date_Fiscal_Quarter_Datepart_clc` + `Close_Date_Relative_Year_clc`; group by hierarchy scope | one dedup filter; add `Is_QTD_ACV_1_clc = TRUE` for any partial-period Y/Y |
| **Pipegen** (`kpi-pipegen`) | ✅ | `Pipe_Gen_clc` | FCST | **`Stage_2_Flag_Date14`** via `Stage_2_Flag_Date_Fiscal_Date_Part_clc` + `Stage_2_Flag_Date_Relative_Date_clc` | one dedup filter; remove `APM_L120 = 'Other'`; never a close-date filter |
| **Attrition** (`kpi-attrition`, `trend-attrition`) | ✅ | `Attrition_clc` (actual, 1-month lag) and `Attrition_Commit_clc` (forecast) | FCST | `Close_Date17`; CTEs `ATTRITION_ACTUALS` / `ATTRITION_UNOFFICIAL` | one dedup filter. **Actuals land monthly, within 5 business days of month-end, one month in arrears** |
| **NNAOV** (`kpi-nnaov`, `trend-nnaov`) | ⚠ | Only **`NNAOV_Commit_clc`** — "Net New ACV + Offset Value **commit**". `New_Logo_Eligible4` is a dimension flag, not a measure | FCST | `Close_Date17` | one dedup filter |
| **Embedded vs Agentic split** (`mix-acv`) | ❌ | No product-motion dimension exists. Closest governed grouping is `APM_L120` (family) / `APM_L218` (sub-product: `'Tableau Next'`, `'Tableau Server'`), and `APM_Specialist_Cloud_Routing` on the specialist side | FCST / SPEC | — | remove `APM_L120 = 'Other'` (SDM business preference) |
| **AE Capacity** (`hc-ae`, `trend-ae-capacity`) | ❌ **confirmed by owner** (§10.1) | No headcount measure — *"Headcount … not available in this SDM."* `User_Name10` + `User_Role2 = 'AE'` + `User_Is_Active1` in the User Hierarchy table is a *current* roster, refreshed **weekly**, with role changes lagging up to a week. No point-in-time / as-of-period-end read exists | FCST (hierarchy table) | — | — |
| **AE Productivity** (`trend-ae-productivity`) | ❌ **confirmed by owner** (§10.1) | No calculated measure. The owner names *productivity* specifically as a headcount-derived metric that is unavailable. Computing it would require client-side division of two separately-fetched numbers — which the board's own catalog forbids — and the denominator does not exist either | — | — | — |
| **Participation** *(not on the board)* | ❌ **confirmed by owner** (§10.1) | Named by the owner in the same breath as productivity, as another headcount-derived metric that is unavailable. Recorded because the shape of the finding is the **category** — headcount and anything divided by headcount — not the instances the board happens to render | — | — | — |
| **AOV** (`trend-aov`) | ❌ **confirmed by owner** (§10.1) | **Explicitly excluded from both models.** FCST's official description: *"This SDM does **NOT** contain data to answer AOV."* SPEC §3: *"AOV / core-AE questions are out of scope."* The owner confirms it directly | — | — | — |
| **Revenue** (`trend-revenue`) | ❌ **confirmed by owner** (§10.1) | No recognised-revenue measure — *"Revenue … not available in this SDM."* Both SDMs are bookings and forecast. `WON_RENEWALS` / `ATR` are adjacent but different concepts | — | — | — |
| **Plan attainment** (all four hero gauges) | ⚠ | Attainment exists **only for Pipe Gen and Day-1 Open Pipe**, by product and by source (§3.2). There is **no ACV, NNAOV or Attrition plan-attainment measure** and no "FinPlan" object anywhere in either model | FCST | — | decimal 0.0–1.0+ |
| **FinPlan** (as a lineage node) | ❌ | Does not exist. The governed target vocabulary is `PG_TARGETS`, `OP_TARGETS`, `PG_LANDING_QTR_TGT` | — | — | — |
| **Velocity** *(planned tab)* | ✅ | `Velocity_clc` + `Historical_Velocity_clc` (FCST); `Specialist_V_clc` + `Historical_Velocity_clc` (SPEC — `Velocity_clc` there is discouraged) | both | quarter, via close date | **non-additive**; display ×100 with `%` |
| **Coverage** *(planned tab)* | ✅ | `Coverage_clc` + `Historical_Coverage_clc` (FCST); `Specialist_Coverage_clc` + `Historical_Coverage_clc` (SPEC). Also `Gap_to_Commit_clc` / `Specialist_Gap_to_Commit_clc` | both | quarter, via close date | **non-additive**; a **multiplier** (2x = `2.0`), not a percent. "Lowest coverage" rankings must exclude null and negative coverage |
| ~~**Per-account ACV movement** (`acv-account-fan`)~~ | ❌ **the data does not exist** | **Corrected.** This row read ⚠ — sourceable with a query-construction caveat — and that was wrong in the way this document exists to catch: a confident availability claim attached to a population nobody has. The account-level ACV pair cannot be produced, so the caveat was never the problem. The portlet has been repointed; see the row below. The conformed-identity fields are still real and still worth resolving, and they no longer have a panel depending on them | — | — | — |
| **Per-AE productivity movement** (`acv-ae-fan`) | ⚠ **measure yes, population no** | `ACV_clc` grouped by **`User_Name10`** where `User_Role2 = 'AE'`. At AE grain the denominator is one, so this needs **no headcount measure** and §10.1's confirmation does not block it. Both years are the `'CY'` and `'PY'` rows of one grouped query on `Close_Date_Relative_Year_clc`. What is missing is the **as-of-period-end roster**: the User Hierarchy table is current state on a weekly refresh, joined on `Record_Owner_Id1 = User_Id31`, so the prior-year side is last year's bookings grouped by whoever owns the record today — 351 AEs of gross turnover between the two points. The board draws only the 649 AEs present on both rosters and holds joiners and leavers out as labelled stubs. **Supplemented, not certified** | FCST | quota-carrying AE × relative year | `User_Role2 = 'AE'`; **no** `Is_My_Data_clc` (§2.3); `Is_QTD_ACV_1_clc = TRUE` if the quarter is open (§2.5); full result set, not a top-N |
| **Segment breakout ENTR/CMRCL/SMB/PubSec** | ✅ **via a derived dimension** (§10.2) | **`IF OU = Public Sector then OU else segment end`** — the model owner's own expression. PubSec is an **Operating Unit**, not a segment, so the four columns are a *derived* dimension coalescing `<TBD: OU field apiName>` with **`Segment10`**. This supersedes §9.3's conclusion that the set was sourceable from neither model | **FCST only** — `Segment10` is the only segment field carrying `SMB`, and the derivation cannot create one | quarter × product × derived segment | one dedup filter; filter NULL dimension values; and decide explicitly where `ESMB` and a null-on-both-sides row land |
| **Five Year Trend tab, all seven metric panels** | ❌ **the tab cannot be sourced** (§10.3) | Only **three years of data exist** — *"Correct, only 3 years of ACV data."* The tab draws five periods. Four of its seven panels have no measure at all; the other three reach three of five points. The Y/Y channel reaches two of five and the two-year CAGR channel reaches one of five | FCST | fiscal year | `Close_Date_Relative_Year_clc IN ('CY','PY','PY-1')` is the whole available history, not a windowing choice |

### 4.1 The gaps, stated plainly

Four things the board displays have **no equivalent in either documented semantic model**, and no amount of careful querying will produce them. **All four are now confirmed by the model owner** (§10.1) rather than inferred from the field catalogues — which matters, because absence from a document is weaker evidence than absence from a model, and a careful reader is right to suspect an abridged catalogue.

- **AOV.** Not merely absent — *explicitly and deliberately* excluded, in writing, from both models. FCST goes so far as to instruct: *"if a user asks about AOV, tell them this SDM cannot answer that question."* The model owner confirms it. This is the sharpest finding in this document, because AOV is the board's marquee stock metric and the anchor of the entire flow-versus-stock argument on the Five Year Trend tab. That argument is sound and the layer supports it in principle (§7) — but it cannot be demonstrated with *this* row, from *these* models. **The hedge that a third, undocumented model might cover it is withdrawn:** the owner's answer rules that out, so the argument must be re-anchored on **Open Pipe**, a genuine balance in these models which SPEC explicitly exempts from period-to-date windowing (§7.2). That re-anchoring is no longer the better of two options; it is the only one.
- **Recognized Revenue.** Both models stop at bookings and forecast. Confirmed unavailable by the owner. Sourcing it means a system outside this semantic layer, not a further search inside it.
- **Headcount, and everything derived from it — AE Capacity, AE Productivity, and participation.** The owner states the category, not just the instances: *"Headcount, and Headcount-Derived metrics (participation, productivity) are not available in this SDM."* **Participation** is not on the board today; it is recorded here because the useful shape of the finding is that *anything divided by headcount* is unavailable, so a future tab reaching for coverage-per-head, quota-carrying counts or attainment-per-rep is reaching for the same missing denominator. The User Hierarchy table gives a *current* roster on a weekly refresh, so the board's `directMode` warning for these tiles — *"as-of-today only — prior quarters restate"* — turns out to be **literally true of the real semantic layer, not just of raw Org62**. That is worth knowing before the demo asserts otherwise.
- **Plan attainment on three of the four hero gauges.** Only pipegen has a governed target-and-attainment pair. ACV, NNAOV and Attrition attainment would each be a number divided by a plan that lives somewhere outside both models. *(Not addressed by the owner; still an inference from the catalogue.)*

And a fifth, which is not a missing measure but a missing *history*: **the Five Year Trend tab cannot be sourced at all.** Only three years of data exist. See §10.3 — it is the most consequential of the three answers.

And one near-gap: **NNAOV exists only as a commit.** `NNAOV_Commit_clc` is a forecast, not a booking. The board presents `$6M` as a booked quarter result with a Y/Y and a plan attainment. Reading a commit measure and rendering it as an actual is exactly the class of error the board exists to argue against.

### 4.2 What the real layer offers that is better than what the demo invented

Seven of these, and several are strong enough to be worth building a tab around.

1. **A named additivity classification.** SPEC's measure catalogue is physically organised into "Additive (row-level SUM is safe)" and two "Non-Additive (DO NOT SUM)" sections. The board asserts that comparability rules live in the measure; here is a real layer that *publishes that as a structural property of its catalogue*. This is stronger evidence than the invented `periodType` field.
2. **Period-to-date semantics as a named, queryable flag.** `Is_QTD_ACV_1_clc` / `Is_QTD_ACV_clc` and the derived measure `ACV_PTD_YY_clc` exist precisely so that a partial current period is not compared against a full prior one — with the failure mode written down. See §7.2; this is the single best real-world support for the board's central argument.
3. **A governed conformed-account identity.** `Global_Combo_Name` and `Combo_Company_Name15` are exactly the "conformed identity, not raw Org62 Account.Id" that `acv-account-fan` described as an invented lineage node called "Account Hierarchy Conformance". The real thing has a name, and it is better. **No panel depends on it any more** — that portlet has been repointed to per-AE productivity because the account-level ACV data does not exist — so this is now a correction to two authority documents rather than a fix to something the board draws.
4. **A complete renewals vocabulary.** `Open_Available_to_Renew_clc` (ATR), `Renewal_Rate_clc`, `Renewal_Book_of_Business1`, `Renewal_Timing1`, `Renewal_Key_Risk_Category1`, plus the `WON_RENEWALS` and `ATR` CTEs. The H2 Focus card "Scaled Proactive Customer Investment Motion" currently links to attrition and ACV because those are the only measures the board has. A renewal-risk-category breakdown would be a materially better answer, and it is governed.
5. **A governed deal-segmentation vocabulary.** `Opportunity_Segmentation` classifies every deal as `C&C` / `Day 1 Open Pipe` / `Pre-Books` / `Pulled Forward`; `Pipe_Gen_Landing_Quarter_clc` says whether generated pipe lands in `'Same Quarter'`, `'Next Quarter'`, `'2 Quarters Out'` or `'3+ Quarters Out'`. Both are exactly the kind of business vocabulary the board's thesis T4 claims a semantic layer should hold, and both are real.
6. **Explicit display conventions attached to the measures.** Coverage renders as a multiplier; funded %, Y/Y, CAGR and velocity render as percentages (×100, append `%`); attainment is stored as a decimal 0.0–1.0+ and filtered as `< 0.8`. This is the closest real analogue to the trend tab's "rules card", and it is more specific than what the board invented. The `[0, 120]` fixed attainment domain already settled in [`attainment-encoding.md`](./attainment-encoding.md) is directly compatible with the layer's "0.0–1.0+" overrun.
7. **The model owner reaching for a calculated dimension unprompted.** Asked why the board's four segment columns did not resolve to one dimension, she answered with a derivation rather than with a relabelling: `IF OU = Public Sector then OU else segment end` (§10.2). That is the board's thesis T4 — business vocabulary needs somewhere shared to live — stated by the person who owns the model, about a definition that does not exist in it yet. It is the strongest evidence in this document for the argument the board is making, precisely because nobody was arguing for it at the time.

One thing the layer does **not** offer, which the board claims: **polarity.** Neither PDF documents a direction-of-good property on any measure. `Attrition_clc` carries no lower-is-better declaration. See §5.3.

---

## 5. Corrections to the authored `semantic` blocks

### 5.1 Corrections that apply to every portlet

| Field | Currently authored | Should be |
|---|---|---|
| `sdm` | `"Analytics Revenue SDM"` | `"Sls_Forecasting_Metrics_Expanded"` for every portlet in §4 sourced to FCST. There is no single SDM behind this board, so `meta.sdm` should name the model per portlet rather than once at the top. |
| `certifiedBy` | `"Analytics RevOps"` | No certifier field is documented on either SDM. The nearest real facts are **document owner** — Casey O'Donnell (FCST), Sydney Dollar (SPEC) — and the support channels `#help-tableaunext-sales-customerzero` and `#specialist-sales-feedback-and-support`. Either use `<TBD: certifying team — not a documented SDM property; confirm via get_semantic_model>` or relabel the field as *document owner* and use the real names. |
| `freshness` | `"Sep 1, 2026 · 9:00 AM PT"` | A single timestamp misrepresents a four-stage chain. Real: **Salesforce opportunity data daily ~6 AM PT → snapshots daily ~7 AM PT → Tableau extract (.tdsx) daily ~8 AM PT → SDM checked hourly.** Commit snaps run multiple times daily. *"Intraday Salesforce changes made after ~6 AM PT will not appear until the next day's extract."* Both docs require an explicit "as of" on any published brief. |
| `rls` | `"Analytics BU hierarchy — viewer sees only their branch"` | Wrong subject. Scope is the **caller's entitled hierarchy**, not a business unit. See §6. |
| `lineage` | `["Org62 Opportunity", "Product SKU Taxonomy", "FinPlan FY27 Target"]` etc. | Two of those three do not exist. Real chain: `Org62 Opportunity` → `Tableau Extract (.tdsx)` → the named CTE in `Underlying_Data_Source1` → the SDM. Use the actual CTE name as the middle node — it is the most specific true statement available. |
| `dashboard` | `"Analytics Exec Review"` / `"Analytics Five Year Trend"` | `<TBD: resolve via list_dashboards / search_assets>` — no dashboard id or name appears in any of the three PDFs. |
| `grain` | `"Fiscal quarter × Business unit"` | No portlet's grain is stated correctly. The **physical row grain** is one row per metric per opportunity per user (FCST) or per opportunity-line per data source per snapshot (SPEC). The *presentation* grain is whatever the utterance groups by. State both, because the gap between them is what the dedup rule exists to close. |

### 5.2 Portlet by portlet

| Portlet | `measure` | `sdm` | `grain` | `lineage` | Other |
|---|---|---|---|---|---|
| `kpi-acv` | `"ACV (certified)"` → **`ACV_clc`** | `Sls_Forecasting_Metrics_Expanded` | row grain: metric × opportunity × user. Presentation: `Close_Date_Fiscal_Quarter_Datepart_clc` × hierarchy scope × `APM_L120` | `Org62 Opportunity` → `Tableau Extract (.tdsx)` → `ACV_HISTORICALS` / `TODAY_AND_DEAL_MGMT` | "Product motion" in the grain is not a real dimension — replace with `APM_L120` |
| `trend-acv` | same as `kpi-acv` — **the cross-tab identity claim holds**, both resolve to `ACV_clc` | same | Presentation: fiscal year | same | The knowledge-graph edge between the tabs is legitimate |
| `kpi-nnaov` / `trend-nnaov` | `"NNAOV (certified)"` → **`NNAOV_Commit_clc`**, and relabel: this is a **commit**, not a booked actual | `Sls_Forecasting_Metrics_Expanded` | quarter / fiscal year | `Org62 Opportunity` → extract → `Commits` | The `definition` claims "ACV booked on net-new-logo closed-won opportunities". No such measure exists. The nearest governed net-new *dimension* is `New_Logo_Eligible4` |
| `kpi-attrition` / `trend-attrition` | `"Attrition ACV (certified)"` → **`Attrition_clc`** | `Sls_Forecasting_Metrics_Expanded` | quarter / fiscal year via `Close_Date17` | `Org62 Opportunity` → extract → **`ATTRITION_ACTUALS`** (and `ATTRITION_UNOFFICIAL` for the in-flight month) | `lineage` currently says "Org62 Contract, Revenue Recognition Ledger" — neither exists in this layer. **Add the 1-month lag to the tile**, it is a real, documented, load-bearing caveat |
| `kpi-pipegen` | `"Pipeline Generation (certified)"` → **`Pipe_Gen_clc`** | `Sls_Forecasting_Metrics_Expanded` | **`Stage_2_Flag_Date14`**, never close date | `Org62 Opportunity` → extract → `PIPE_GEN` | The `definition`'s "counted at first qualification and never recounted on later stage moves" is **not stated anywhere in the real docs**. The documented rule is the *date anchor*, which is a different and more checkable claim. `"Source"` in the grain is real: `Opportunity_Source6`, and targets exist by source |
| `mix-acv` | `"ACV (certified)"` → `ACV_clc` split by **`APM_L120`** / `APM_L218` | `Sls_Forecasting_Metrics_Expanded` | quarter × `APM_L120` | `Org62 Opportunity` → extract → APM hierarchy | `lineage`'s "Product SKU Taxonomy" → the real name is the **APM product hierarchy (L1/L2/L3)**. The Embedded/Agentic grouping does not exist — see §5.4 |
| `hc-ae` / `trend-ae-capacity` | `"AE Capacity (certified)"` → **no measure exists — confirmed by the model owner (§10.1)** | — | — | `User Hierarchy table` (weekly refresh) | Set `measure: null` and render as unavailable, or state the derivation (`COUNT(DISTINCT User_Name10)` where `User_Role2 = 'AE'` and `User_Is_Active1`) *and* its limits: current-state only, weekly, no as-of-period-end |
| `trend-ae-productivity` | `"AE Productivity (derived)"` → **no calculated measure exists — confirmed by the model owner, who names productivity specifically (§10.1)** | — | — | — | The portlet's own `verify` rule already says what to do: *"If the ratio is not a governed calculated measure, do not compute it client-side … Fetch it as a measure or render it as unavailable."* Live, it is unavailable |
| `trend-aov` | `"AOV (certified)"` → **explicitly excluded from both SDMs, and confirmed unavailable by the model owner (§10.1)** | — | — | — | The former `<TBD: source model for the active order book>` is withdrawn — there is no third model in this layer to find. Re-anchor the stock exemplar on **Open Pipe**. See §4.1 |
| `trend-revenue` | `"Revenue (certified)"` → **no equivalent — confirmed unavailable by the model owner (§10.1)** | — | — | — | The "documented FY27 accounting treatment change" the portlet wants to retrieve from `get_semantic_model_metric` has no counterpart in either model's `businessPreferences` as documented |
| `acv-ae-fan` *(replaces `acv-account-fan`)* | `ACV_clc` grouped by `User_Name10`, `User_Role2 = 'AE'` | `Sls_Forecasting_Metrics_Expanded` | quota-carrying AE × relative year | `Org62 Opportunity` → extract → `ACV_HISTORICALS` → **User Hierarchy table (weekly, current state)** | The measure is certified and the population is not. `certifiedBy` names Casey O'Donnell for `ACV_clc` and **nobody** for the paired roster, which is the honest reading: no headcount measure and no as-of-period-end user table exists in either model, so "which AEs were carrying a quota in FY26 Q2" has no certifier and cannot have one. Whether `Record_Owner_Id1` is owner-at-close or current owner is an **inference, not a documented fact**, and it is the single check the panel rests on. The account-grain version of this row is withdrawn — see §4 |
| `trend-rules` | `"Presentation Rules"` | — | — | `Semantic Model Definition` → **`businessPreferences`** | The real container has a name: `businessPreferences`, readable via `get_semantic_model`. Three of the card's four rules are supportable (§7); **polarity is not** (§5.3) |
| `going-well`, `h2-focus`, `drivers` | `null` — correct as authored | — | — | — | Their `links` arrays should be validated against `list_semantic_model_metrics`, as the catalog already says. Card 3 of `h2-focus` would be better linked to the renewals vocabulary (§4.2) |

### 5.3 The one correction that costs the board something

`kpi-attrition.semantic.why` currently reads:

> "Polarity is part of the certified definition. Because the measure declares lower-is-better, 104% of plan renders as over-plan churn automatically."

**Neither PDF documents a polarity or direction-of-good property on any measure.** Both document display conventions (multiplier vs percent, decimal attainment, ×100 formatting) and additivity, in detail. Neither documents which way is good.

Three honest options, in descending order of preference:

1. **Move the claim to where it is supported.** Recast the rules card around *additivity* and *period-to-date comparability*, which are real, named and documented (§7). The argument survives intact and gets stronger evidence.
2. **Keep polarity as an explicitly aspirational claim,** clearly marked as what a semantic layer *should* carry rather than what this one does.
3. **Resolve it live.** `get_semantic_model_metric` returns `aggregationType` and `isCumulative`; whether it also returns anything polarity-like is `<TBD: inspect a live metric definition>`. If it does, the claim stands and should cite the real property name.

Option 1 is the recommendation. The board is an argument about rigour; a polarity claim that the source layer does not support is exactly the plausible-but-wrong metadata the board exists to criticise.

### 5.4 The Embedded / Agentic split needs a decision, not a lookup

`mix-acv` states that the split comes from "a governed SKU-to-motion dimension, not from a keyword match on product name." In the real layer there is no motion dimension. What exists is the APM hierarchy, where `'Tableau Next'` and `'Tableau Server'` are both **L2 values** — and FCST's own product rule shows they need OR-matching across L1 and L2 because the hierarchy is not clean:

> `(APM_L120 = 'Tableau Next' OR APM_L218 = 'Tableau Next')`

Note also that the board's authored detail lines invert against APM: `mix-acv` labels Embedded as *"TabNext & CRMA"* and Agentic as *"Tab Cloud & Server"*, while APM puts Tableau Next and Tableau Server side by side as L2 siblings and "CRMA" is a name variation the docs flag for retry as "CRM Analytics".

So the split is a **new mapping layered on APM L2**, not a lookup of an existing governed dimension. That is still a defensible thing to build — and building it is precisely the argument the board makes about business vocabulary needing somewhere shared to live. But the tile should say so rather than claim the mapping already exists. Also inherit the SDM's own business preference: **always remove `APM_L120 = 'Other'`.**

---

## 6. Row-level security and scope

### 6.1 Two different mechanisms

**`Sls_Specialist_Reporting`: automatic RLS.** *"RLS is enforced automatically; data is pre-scoped to the entitled user's hierarchy."* The enforcing field is `Is_SFR_User_Entitled_clc` (primary, specialist hierarchy) with `Is_Entitled_User_clc` as a hidden legacy path. **Never surface either.** The underlying published datasource is named *"Specialist Pipeline and Forecasting (RLS)"* — the row-level security is part of the datasource's identity.

**`Sls_Forecasting_Metrics_Expanded`: hierarchy-table scoping.** FCST does not describe automatic RLS. It describes a flattened User Hierarchy table joined on `Record_Owner_Id1 = User_Id31`, and an `Is_My_Data_clc` filter that *"scopes the data to the currently authenticated user and provides a rolled-up view of everything in their reporting hierarchy."* PULSE asserts *"Both SDMs enforce row-level security scoped to the caller."* Treat FCST's mechanism as `<TBD: confirm whether Sls_Forecasting_Metrics_Expanded enforces RLS independently of Is_My_Data_clc, or whether scoping is entirely filter-driven>` — the difference matters, because filter-driven scoping can be forgotten and RLS cannot.

### 6.2 What a query inherits

**The caller's entitlement, not the subject's.** This is the most operationally dangerous property in the whole layer, and PULSE states it best:

> "Both SDMs enforce row-level security scoped to the **caller** (whoever's Salesforce credentials are connected), not the subject. If Slackbot is running as John Stiefeling and John's entitled hierarchy doesn't include Alfano's org, the queries will return John's data **silently**. Verify by checking if returned pipe numbers are in the right magnitude."

Failure mode: **a plausible number for the wrong person.** Not an error, not an empty result. The only defence documented anywhere is a magnitude sanity-check, and PULSE gives a concrete threshold for its own case (*"under $10M for a President org"* → abandon and fall back). Any live board should carry an equivalent, portlet-specific expected-magnitude check and fail loudly rather than render.

The second failure mode is the inverse: **`Is_My_Data_clc` is a no-op for a user with no forecast record**, returning *everything* rather than nothing. An analyst or ops user — exactly the persona who would run a board like this — is the likeliest person to hit it.

### 6.3 What this means for a board presented as one business unit's view

**"Analytics Business Unit" is not a scope that exists in either model.** The available scoping dimensions are:

- the **user hierarchy** — `User_Name10`, `User_Role2`, `Directs6`, `Plus_Twos1` (FCST); `Specialist_Level_04_User_Name` … `_10_` (SPEC)
- `OU_Group_clc` / `OU_Operating_Unit` — the closest thing to a BU, with values including `Next Platform`, `AMER PACE`, `AMER TMT`, `SMB`
- `Segment10` / `Derived_Macro_Segment`, `Region38` / `OvA_Derived_Region`
- `APM_L120 = 'Analytics'` — a *product* scope, not an org scope

So a board scoped to "the Analytics business unit" resolves to one of: an APM product filter, an OU filter, or a named leader's hierarchy. **These are three different populations and they will not agree.** Whichever is chosen must be stated on the board, because the `rls` string is currently making a claim about branch-scoping that the layer does not implement.

Both documents require the same caveat on any published output: *"never present RLS-scoped results as global"* / *"always caveat scope; never call a number 'global.'"* The board's `meta.scope` string should say whose entitlement produced the numbers, and the provenance face should surface it — this is arguably a *better* provenance story than the invented one, because it is a real constraint with a real failure mode.

---

## 7. Grain hazards: additivity, partial periods, and the fiscal calendar

**The short answer: yes — substantially, and by name.** The layer does not use the words "stock" and "flow", but it encodes three of the four things the board's rules card claims, with named fields and documented failure modes. The fourth (polarity) it does not encode at all.

### 7.1 Additivity is a published, structural property

SPEC §6 splits its measure catalogue into three headed groups:

- **"Core KPI Measures — Additive (row-level SUM is safe)"**
- **"Historical / Y-o-Y / CAGR Measures — Non-Additive (DO NOT SUM)"**
- **"Coverage / Attainment / Ratio Measures — Non-Additive (DO NOT SUM)"**

reinforced in §12: *"Don't sum ratios — coverage, funded %, velocity, Y/Y, CAGR, averages are non-additive."* Both docs give `aggregationType` as a property returned by `list_semantic_model_calculated_measures` and `get_semantic_model_metric`, so this is discoverable live rather than only documented in prose.

### 7.2 Partial-period handling is a named flag, and it exists for exactly the board's reason

This is the finding worth the whole exercise.

| Real artifact | apiName | Model |
|---|---|---|
| "Is QTD ACV?" — *"Original close date within current fiscal QTD"* / *"TRUE if ACV is within QTD window. Use for YoY comparison"* | `Is_QTD_ACV_1_clc` (FCST) / `Is_QTD_ACV_clc` (SPEC) | both |
| "ACV PTD Y/Y" — *"ACV period-to-date, year-over-year"* | `ACV_PTD_YY_clc` | SPEC |
| Snapshotted versions of the QTD flag | `AS_OF_YESTERDAY_Was_QTD_ACV_clc`, `AS_OF_LAST_WEEK_Was_QTD_ACV_clc` | FCST |

FCST §5, verbatim:

> "**Without `Is_QTD_ACV_1_clc`, you compare a partial current quarter against a full prior quarter, making current year look artificially behind.**"

SPEC §5, verbatim, and this is the sentence that matters most:

> "ACV needs **PTD** for a fair same-end-day comparison; use `ACV_PTD_YY_clc`. **Open Pipe does not require PTD.**"

That last sentence *is* the stock-versus-flow distinction, expressed as a query rule rather than as a metadata property. ACV accumulates across a period, so a partial period must be windowed to be comparable. Open Pipe is a balance read at a point in time, so it needs no windowing. The real layer draws exactly the line the board draws between `trend-acv` and `trend-aov` — it just draws it by saying *which measures need period-to-date treatment* instead of by declaring a `periodType`.

**Consequences for the board:**

- The FY27 H1 detached-point treatment on flow panels is not a stylistic choice; it is the visual form of a rule the real layer enforces with a named flag and a documented failure mode. The board's central claim is **supported**.
- But the rule lives one level down from where the board puts it. There is **no `periodType` property on a measure**. It is expressed as (a) the presence or absence of a PTD flag and (b) prose. So the rules card should say *"the layer publishes period-to-date flags and an additivity classification, and refuses the comparison without them"* rather than *"the measure declares whether it is a stock or a flow."* The first is true, checkable, and nearly as strong.
- The `verifyPeriodType` guardrail in the catalog should be rewritten to: **before plotting any partial period, confirm whether the measure has a PTD flag; if it does, the measure is a flow and the flag is mandatory; if the docs explicitly exempt it (as with Open Pipe), it is a balance and must not be annualised.**

### 7.3 A fiscal calendar, explicitly

Salesforce fiscal year starts **February 1**, expressed as a `DATEADD('month', 11, <date>)` offset.

| Fiscal quarter | Calendar months |
|---|---|
| FQ1 | February, March, April |
| FQ2 | May, June, July |
| FQ3 | August, September, October |
| FQ4 | November, December, January |

Calculated date fields: `Close_Date_Fiscal_Quarter_Datepart_clc` (1–4), `Close_Date_Relative_Year_clc` (`'CY'` = FY27, `'PY'` = FY26, `'PY-1'` = FY25, `'Other'` = outside the window, typically excluded), and the Stage-2 equivalents. Fiscal-year truncation is `DATE_TRUNC('fiscal_year', Opportunity_Close_Date_clc) = DATE_TRUNC('fiscal_year', CURRENT_TIMESTAMP)`. Both docs say: **do not hand-roll date math.**

> ⚑ **The three-value relative-year window is the extent of the data, not of the vocabulary.** Confirmed by the model owner: *"Correct, only 3 years of ACV data."* This document previously left open how to reach fiscal years beyond `'PY-1'` and treated it as a documentation hole. It is not a hole — **there is nothing behind `'PY-1'` to reach.** An absolute date filter on `Close_Date17` for FY23 or FY24 returns no rows, so the standing advice against hand-rolled date math is now beside the point here rather than the obstacle. The consequence is that the **Five Year Trend tab cannot be sourced**: see §10.3.

> ⚠ **The board's period label is wrong on this calendar.** `data/board.json` is labelled `"Q2 FY27"` with `generatedAt: 2026-09-01`. On the real fiscal calendar, September 1 2026 sits inside **FY27 Q3**. A board labelled Q2 FY27 and generated on Sep 1 is either a closed-quarter retrospective (in which case the QTD flags are unnecessary and the "quarter to date" kicker is wrong) or mislabelled. Resolve before wiring live — and note that `Close_Date_Fiscal_Quarter_Datepart_clc` must be resolved at runtime, never hardcoded (§9.1).

### 7.4 "Historical" is a defined comparability window

FCST §8, verbatim:

> "'Historical' = **average of the same fiscal quarter across the prior 2 fiscal years (PY + PY-1)**. Not last quarter. Not just last year. Always requires `Close_Date_Relative_Year_clc IN ('CY', 'PY', 'PY-1')` to return non-null values."

Every `Historical_*` measure is that 2-year same-quarter average. It is not the board's "prior year" and must not be labelled as one. It is also the reason a missing `'PY-1'` produces nulls rather than an error.

### 7.5 Semi-additive behaviour, unnamed but present

The layer does not use the term, but the snapshot measures behave exactly as semi-additive balances: `Yesterdays_*`, `Last_Weeks_*`, `Open_Pipe_PY_clc`, `Was_Historical_Open_Pipe_clc`. The clearest tell is FCST's rule for dead deals:

> "'How much pipeline was deaded yesterday?' → `SUM(Yesterdays_Open_Pipe_clc)` — dead deals are **$0 in current Open Pipe**."

A balance that goes to zero the moment its underlying row terminates, requiring a prior snapshot to measure the loss, is a semi-additive measure with a snapshot escape hatch — and the layer ships both the hazard and the escape hatch, named.

---

## 8. Worked discovery-to-query sequences

Every `<TBD: ...>` below **must** be resolved by a live call in the run that uses it. None of them is knowable from the PDFs.

### 8.1 `kpi-acv` — booked ACV for the quarter, with a defensible Y/Y

The tile needs a value, a Y/Y, and a plan attainment. The first two are obtainable; the third is not (§4.1).

1. **Resolve the model.** `list_semantic_models(searchTerm: "forecasting")`. Confirm an entry whose apiName is `Sls_Forecasting_Metrics_Expanded`. Record its `id` — `<TBD: SDM id, not stated in FCST; SPEC states its own as 2SMed000001kPXVGA2 but FCST gives none>`.
2. **Read the preferences.** `get_semantic_model(<TBD: apiName or id from step 1>)`. Confirm the three business preferences in §2.4 and check `lastModifiedDate` against the doc's July 1 2026 vintage. **If `businessPreferences` contains the string `'UP +'`, do not carry it into any filter** (§2.5).
3. **Confirm the measure.** `list_semantic_model_calculated_measures`. Confirm `ACV_clc` exists, is **visible**, and note its `aggregationType`. Confirm `Is_QTD_ACV_1_clc`, `Close_Date_Fiscal_Quarter_Datepart_clc` and `Close_Date_Relative_Year_clc` exist via `list_semantic_model_calculated_dimensions`.
4. **Resolve the current quarter.** Do **not** hardcode `= 3`. FCST contradicts itself on this (§9.1). Either derive it from the fiscal calendar in §7.3 against the run date, or ask: `analyze_data(utterance: "What is the current value of Close_Date_Fiscal_Quarter_Datepart_clc?", ...)`. Record as `<TBD: current fiscal quarter datepart, resolved at run time>`.
5. **Resolve the scope.** Decide and record which of the three mutually-exclusive scopes in §6.3 the board means by "Analytics BU" — `<TBD: scope decision — one of APM_L120 = 'Analytics', an OU_Group value, or a named leader's hierarchy>` — and pick the matching dedup filter from §2.3. If a named leader, that is `User_Name10 = '<TBD: resolved full name>'` and **not** `Is_My_Data_clc`.
6. **Query the current value.**
   ```
   analyze_data(
     utterance: "Return total ACV (ACV_clc) for <scope filter from step 5>,
                 filtered to Close_Date_Fiscal_Quarter_Datepart_clc = <step 4>
                 and Close_Date_Relative_Year_clc = 'CY'.
                 Do not apply Is_Current_Quarter_clc.",
     targetEntityType: "sdm",
     targetEntityIdOrApiName: "<TBD: apiName from step 1>"
   )
   ```
   *(Parameter names per §2.1 — verify against the live tool schema.)*
7. **Query the Y/Y separately, with the QTD flag.** If the quarter is still open, a naive `'CY'` vs `'PY'` comparison is invalid:
   ```
   utterance: "Return ACV (ACV_clc) grouped by Close_Date_Relative_Year_clc for <scope>,
               filtered to Close_Date_Fiscal_Quarter_Datepart_clc = <step 4>,
               Is_QTD_ACV_1_clc = TRUE,
               and Close_Date_Relative_Year_clc IN ('CY', 'PY')."
   ```
8. **Sanity-check the magnitude before rendering** (§6.2). A number that is plausible but 3–10x too large means a missing dedup filter; a number plausible but far too small means RLS returned the caller's slice, not the subject's.
9. **Plan attainment: stop.** There is no ACV plan measure. Render the attainment track as unavailable rather than dividing by a number from outside the layer.

### 8.2 `mix-acv` — the Embedded / Agentic split

This sequence exists to show *where it fails*, which is more useful than a sequence that pretends it works.

1. Steps 1–5 of §8.1.
2. **Look for a motion dimension.** `list_semantic_model_dimensions` and `list_semantic_model_calculated_dimensions`. Search for anything resembling motion, deployment model, or an Embedded/Agentic grouping. **Expect nothing** — neither PDF documents one.
3. **Confirm the APM hierarchy instead.** Confirm `APM_L120` and `APM_L218` exist and are visible. Enumerate their live values: `analyze_data(utterance: "List the distinct values of APM_L120")`, then the same for `APM_L218`. FCST lists twelve L1 values and two L2 examples; confirm rather than assume.
4. **Pull the split at L2, not L1.** The Tableau products sit at L2 under `APM_L120 = 'Analytics'`:
   ```
   utterance: "Return ACV (ACV_clc) grouped by APM_L218 for <scope>,
               filtered to Close_Date_Fiscal_Quarter_Datepart_clc = <resolved>
               and Close_Date_Relative_Year_clc = 'CY'.
               Exclude APM_L120 = 'Other'. Filter out null dimension values."
   ```
   Remember the OR rule: a product may be identified at either level (`APM_L120 = 'Tableau Next' OR APM_L218 = 'Tableau Next'`), so verify at both before concluding a product is absent.
5. **Apply the motion mapping in the open.** Record the L2-value → Embedded/Agentic mapping as an explicit, versioned artifact in the repo, labelled as a mapping this board defines rather than one the layer provides. `<TBD: L2-to-motion mapping — a decision, not a lookup>`.
6. **Reconcile.** The L2 subtotals must sum to the same `ACV_clc` total returned in §8.1 step 6 for the same scope and period. If they do not, the difference is products excluded by the `'Other'` rule or the null filter, and it must be shown, not absorbed.

### 8.3 `acv-ae-fan` — per-AE productivity movement, Q2 FY27 against Q2 FY26

**This section replaces the per-account recipe that stood here.** That recipe was a worked pull for a population that does not exist, and leaving it in place would have been the most expensive kind of error this document can make: not a wrong caveat but a complete, confident, runnable procedure for a question the layer cannot answer. It is withdrawn rather than annotated. The §4 availability row is corrected to ❌ and the conformed-identity work it depended on is recorded under §5.2 as a document correction rather than a panel fix.

The replacement is a smaller pull with a sharper problem. **The measure is fully sourceable. The population is not.**

1. Steps 1–5 of §8.1. **The model is settled** — `Sls_Forecasting_Metrics_Expanded`, because the fan reconciles to `kpi-acv`. The Specialist alternative existed only while the subject was account identity.
2. **Do not look for a headcount measure.** §10.1 confirms headcount, and anything divided by headcount, is unavailable, and that is why `hc-ae` is supplemented. It does not block this portlet: at AE grain the denominator is one, so "ACV per AE" is `ACV_clc` grouped by the rep. The roster is used as a **population**, never as a denominator.
3. **Pull both years in one grouped query, using relative year.**
   ```
   utterance: "Return ACV (ACV_clc) grouped by User_Name10 and by
               Close_Date_Relative_Year_clc for <scope>,
               filtered to User_Role2 = 'AE'
               and Close_Date_Fiscal_Quarter_Datepart_clc = <resolved>
               and Close_Date_Relative_Year_clc IN ('CY', 'PY').
               Return ALL matching rows — do not limit the result set.
               Filter out null dimension values."
   ```
   The "do not limit" phrasing is required (§2.6). **No `Is_My_Data_clc`** — the documented org-wide pattern at this grain has no caller filter (§2.3). Do **not** add `Is_Current_Quarter_clc`; on a grouped two-year pull it double-counts (§2.5). Add `Is_QTD_ACV_1_clc = TRUE` if the quarter is open, or the comparison is a partial quarter against a full one.
4. **Re-sort client-side.** SPEC is explicit that server-side ordering is not to be relied on.
5. **Pair the population, and refuse to draw anything that is not paired.** This is the whole care the panel takes. The User Hierarchy table is a *current* roster on a weekly refresh with no as-of-period-end read (§4, §10.1), joined on `Record_Owner_Id1 = User_Id31`, so the `'PY'` rows are last year's bookings grouped by whoever owns the record **today**. The board's own headline asserts an 18% headcount decline — 904 to 745 — which the panel authors as 96 joiners and 255 leavers, 351 AEs of gross turnover. Drawn naively the chart measures reorganisations rather than productivity, and it fails invisibly: a clean 745-line fan of a population that never existed looks exactly like a clean 745-line fan.
   - **Assert the pairing on the join, not on the arithmetic.** A drawn line requires a non-null `'PY'` row **and** a non-null `'CY'` row for the same `User_Name10`. Testing `priorK > 0` is not the same test and is not safe: a leaver's current ACV is `0`, and `0` on this axis already means something else and true — *this AE was here and booked nothing*.
   - **Joiners and leavers are returned, summed and rendered as two labelled stubs** outside the indexed axis, in the two directions. Never lines on it.
6. **Run the checks.**
   - **Roll-up:** the per-AE `'CY'` column must sum to the certified quarter total from §8.1. If it does not, the fan is a second competing number and must not render.
   - **One formula:** both years must be `ACV_clc`. True by construction if step 3 was a single grouped query.
   - **Cardinality:** `COUNT(DISTINCT User_Name10)` against `hc-ae`'s 745, with the difference stated rather than absorbed. §5.2 permits the count with stated limits.
   - **Range:** assert that no index is silently clamped. The renderer's `[0, 200]` clamp never fired on the account population — its largest expansion was 194 — and fires on 22 of 649 paired AEs here, the largest at 295.
7. **Resolve the one question the panel rests on before any live pull:** whether `Record_Owner_Id1` is owner-at-close or current owner. The source documents do not state it. Current-owner is an inference from Salesforce semantics, and if it is wrong in the other direction the hazard shrinks to roster membership alone.
8. **Row volume.** The mock population is 1,000 rows — 649 paired, 96 joiners, 255 leavers. A live pull at AE grain for one scope and two years should be the same order of magnitude. If the response is truncated, **fail loudly**.

**Tier: supplemented, not certified.** Under §6.1's weakest-link rule a portlet's state is its weakest load-bearing input, and on this panel the population is load-bearing in a way it is nowhere else on the board — the picture *is* the population. `ACV_clc` at AE grain is certified; "which AEs were carrying a quota a year ago" has no certifier and cannot have one.

---

## 9. Where the three documents disagree

Recorded rather than blended, per the brief.

### 9.1 FCST contradicts itself on which quarter is current

- Header: *"Current Period: FY27 Q2"*
- §5 default-behaviour code block: `Close_Date_Fiscal_Quarter_Datepart_clc = 3`
- §5 label: *"Current quarter: `Close_Date_Fiscal_Quarter_Datepart_clc = 3` (FY27 Q3, August–October 2026)"*
- §11 worked query patterns: `Close_Date_Fiscal_Quarter_Datepart_clc = 2`, four times

The document is dated July 1 2026, which on its own fiscal calendar (FQ2 = May–July) is **Q2**, matching the header and the §11 patterns and contradicting §5. SPEC, dated July 14 2026, says *"Current Period: FY27 Q2 (May–July 2026)"* consistently. PULSE uses `= 3` throughout.

**Resolution: none of them. Resolve the quarter datepart at run time and never hardcode it.** The two documents agree on the *calendar* (FQ1 = Feb–Apr, etc.); they disagree only on which quarter was current when each was written, which is a staleness artifact, not a schema fact.

### 9.2 The two models disagree on which "open pipe", "coverage", "velocity" and "pipegen" you mean

Same words, different fields, different populations:

| Concept | FCST | SPEC |
|---|---|---|
| ACV | `ACV_clc` | `ACV_Closed_Won_clc` / `ACV_Closed_Won_CY_clc` |
| Open pipe | `Open_Pipe_clc` | `SFR_Open_Pipe_Amount_clc` (and `Open_Pipe_Amount_clc` as the discouraged core version) |
| Coverage | `Coverage_clc` | `Specialist_Coverage_clc` (`Coverage_clc` is **hidden** here) |
| Velocity | `Velocity_clc` | `Specialist_V_clc` (`Velocity_clc` is visible but **discouraged**) |
| Pipegen | `Pipe_Gen_clc` | `Pipe_Gen_Amount_clc` (`SFR_Pipe_Gen_Amount_clc` is **hidden**) |
| Commit | `Current_Commit_clc` | `Specialist_Commit_clc` |
| Opportunity ID | `Opportunity_Id34` | `Opportunity_ID35` |
| Scoping | `Is_My_Data_clc` / `User_Name10` | no `Is_My_Data` at all; automatic RLS + hierarchy-level OR |

`Coverage_clc` is the sharpest trap: it is the **correct** field in one model and a **hidden, wrong** field in the other. A field name carried between models silently changes meaning or silently returns nothing.

### 9.3 The two models disagree on the segment value set — *and this section's conclusion was wrong*

- FCST `Segment10`: **ENTR, CMRCL, SMB, ESMB**…
- SPEC `Derived_Macro_Segment`: **CMRCL, ENTR, ESMB, PUBSEC**, plus null — and SPEC §12 warns explicitly: *"Segment is `PUBSEC`, not `SMB` — verified values are CMRCL / ENTR / ESMB / PUBSEC."*

So `SMB` is a valid segment in one model and explicitly not a value in the other; `PUBSEC` is documented only in SPEC. Every one of those facts still holds. **The conclusion drawn from them — that the board's four-column set was sourceable from neither model and one column would have to be relabelled — is withdrawn.**

> ⚑ **Resolved by the model owner (§10.2): PubSec is the Operating Unit, not a segment.** *"Pubsec is the OU, so you'd just have to return `IF OU = Public Sector then OU else segment end`."* The board's four columns were never four values of one dimension. They are a **derived dimension** coalescing an OU field with a segment field, and the set is sourceable from `Sls_Forecasting_Metrics_Expanded` alone — subject to one unconfirmed identifier.
>
> **What this section did wrong is worth naming, because it looked rigorous.** It read the board's own column labels as a single vocabulary, then went looking for one governed dimension that held all four. Every fact it cited was a verbatim quote from a primary document. A blocker assembled from correct quotations is not thereby a correct blocker — the missing step was asking what each label *is*, not just where it lives.

Still owed, and **not** addressed by the owner's answer: neither model has any counterpart to the board's `"growth"` tier — the board uses `enterprise` / `commercial` / `growth` elsewhere, which matches neither vocabulary, and `acv-ae-fan`'s segment thresholds — inherited unchanged from the account fan it replaced, and now applied to an AE's book value rather than an account's — should be relabelled to one of the two real value sets. Also still open: **`ESMB`**, which `Segment10` carries and the board's four columns do not show.

### 9.4 PULSE asserts two things the primary docs do not

1. **The President-tier hierarchy join.** PULSE: *"Never filter on `Record_Owner_Id1` alone — returns empty for EVP/President level. Always join `Sales_KPIs1` with `Core_Team_Users1` on the `Directs6` field."* Neither `Sales_KPIs1` nor `Core_Team_Users1` appears anywhere in FCST's data-object or dimension catalogue, which describes the structure only as a Core Metrics table joined to a User Hierarchy table on `Record_Owner_Id1 = User_Id31`. These may be the real object apiNames behind FCST's prose description, or they may be PULSE's invention. **`<TBD: confirm the data-object apiNames via list_semantic_model_data_objects and the join via list_semantic_model_relationships before relying on the Directs6 join pattern.>`** Note that FCST separately documents `Directs6` as a *dimension to group by*, not as a join key.
2. **The APM L1 family list.** PULSE names six-to-eight families ("Sales, Service, Marketing, Analytics/Tableau, Slack, Agentforce/AI & Data, Commerce, Integration"). FCST's catalogue lists twelve `APM_L120` values plus null, including `'Informatica'` and `'Customer Success Plans'`, and does not use the labels "Tableau" or "Agentforce" at all. **Trust FCST; enumerate live.**

### 9.5 The MFJ value set was itself an unresolved conflict, resolved only in SPEC

SPEC §8 records: *"Resolved 2026-07-14. A prior open conflict is now settled by a live distinct-values query. The queryable up-good value is `UP+` with no space. The SDM's stored `businessPreferences` writes it as `'UP +'` (with a space) — that is a guidance-mapping string, not the actual data value, so do not use it as a filter. The `UP -` (space-dash) value is consistent across all sources."*

FCST §8 lists MFJ simply as `IN`, `UP+`, `UP-`, `OUT` with no spacing note. PULSE repeats SPEC's rule. **Treat the exact strings as live-verifiable rather than documented**, and re-run a distinct-values probe before filtering on them — this is the one place all three documents agree that the *documentation itself* was wrong for a period.

---

## 10. Corrections from the model owner

**Authority.** The business analyst who owns these semantic models was asked about the findings in §1–§9 and answered. **Her answers rank above the three PDFs and above every conclusion in this document.** Where §1–§9 hedged on something she has now settled, the hedge is removed and the answer is attributed to her. Where an answer opens a *new* question, it is recorded in §10.4 rather than guessed at.

**Attribution.** **`<TBD>`** — record which owner answered, Casey O'Donnell (`Sls_Forecasting_Metrics_Expanded`) or Sydney Dollar (`Sls_Specialist_Reporting`), and the date of the exchange, before either file is published or quoted. Not invented here.

**Why this ranks above the documents.** The PDFs are a snapshot of what was written down at a point in time. The owner is the person who decides what the models contain. Two of her three answers overturned conclusions this document had built entirely from verbatim quotations, which is the most useful thing about them.

### 10.1 AOV, Revenue and headcount are confirmed unavailable — and the category is wider than the board

> "AOV, Revenue, Headcount, and Headcount-Derived metrics (participation, productivity) are not available in this SDM."

This settles the five unsourceable portlets — `trend-aov`, `trend-revenue`, `hc-ae`, `trend-ae-capacity`, `trend-ae-productivity` — **definitively rather than provisionally.** They move from *inferred unsourceable, would need X* to *confirmed by the model owner*.

**What changes materially:** every one of the five previously carried a hedge of the form `<TBD: locate a model carrying X — run list_semantic_models and search_assets for …>`. Those searches are removed. There is no third, undocumented model inside this layer that covers them. **Anything sourcing AOV, revenue, or headcount would have to come from outside this semantic layer entirely** — a different system, not a better discovery call.

That is a stronger position for the board than the hedge was, not a weaker one. "We looked and found nothing" invites the reply that the catalogue was abridged. "The person who owns the model says it is not there" does not.

**She also names participation.** The board does not show participation and no portlet exists for it. It is recorded anyway, because the useful shape of the finding is the **category** — headcount, and anything divided by headcount — rather than the three instances the board happens to render. Any future tab reaching for rep participation, coverage-per-head, quota-carrying counts or attainment-per-rep is reaching for the same missing denominator and will fail the same way. **Do not add a participation tile against this layer.**

### 10.2 PubSec is the Operating Unit, and the four-way segment split is a derived dimension

> "Pubsec is the OU, so you'd just have to return `IF OU = Public Sector then OU else segment end`."

This **overturns** what §9.3 and the catalog recorded as a hard blocker: that the segment tab's four columns (ENTR, CMRCL, SMB, PubSec) were sourceable from neither model, because `Segment10` has `SMB` but no `PUBSEC` while `Derived_Macro_Segment` has `PUBSEC` but explicitly not `SMB`.

The answer is that **PubSec is not a segment peer at all.** It is an Operating Unit. The board's four-way split is a *derived dimension* that coalesces the two: return the OU when it is Public Sector, otherwise fall back to segment.

#### The derivation, as a documented calculated dimension

| | |
|---|---|
| **Expression** *(verbatim from the model owner — the source of truth)* | `IF OU = Public Sector then OU else segment end` |
| **Segment field apiName** | **`Segment10`** — *stated in source* (FCST). Values ENTR, CMRCL, SMB, ESMB. The `else segment` half, confirmed. |
| **OU field apiName** | **`<TBD>`** — *the one identifier this derivation still needs.* Two candidates are named across the three PDFs and **neither is confirmed to carry a Public-Sector value**: `OU_Operating_Unit` (FCST — named in the dimension catalogue, no value set documented anywhere) and `OU_Group_clc` (SPEC — value set stated as verified live 2026-07-02, one value truncated in the source as `Pub Se…`). Resolve via `list_semantic_model_dimensions` / `list_semantic_model_calculated_dimensions` plus a distinct-values probe, and confirm at discovery time **before** binding this dimension. |
| **The literal** | **`<TBD>`** — *the exact string to test the OU against.* The owner wrote `Public Sector`; `OU_Group_clc`'s documented list shows `Pub Se…`, truncated. These may or may not be the same string. Resolve with `analyze_data("list distinct values of <the OU field>")` and filter on what comes back — never on a string lifted from a document. |

The expression is written in prose, not in a validated calculated-dimension syntax, and it names its two inputs by business label rather than by apiName. **Bind the logic exactly as stated and do not paraphrase it;** resolve the apiNames and the literal separately. If an implementation ever diverges from that line, the line wins.

**On the literal specifically:** a plausible-looking string that is not the stored value returns **zero rows with no error** — which here means an empty PubSec column standing beside three columns that look entirely correct. This is the same trap as the `'UP +'` MFJ string in §2.5 and §9.5, and it is the one place all three documents agree the documentation itself was wrong for a period.

#### The one real risk, and it is a sharp one

**The near-hit and the `SMB` value are in different models, and the models cannot be joined.** The only segment field carrying `SMB` is `Segment10`, on FCST. The only OU field with a documented Public-Sector-shaped value is `OU_Group_clc`, on SPEC. So the derivation has to run on FCST — which means it depends on **`OU_Operating_Unit` carrying a Public Sector value, and FCST documents no value set for that field at all.**

If it does not, the four-column set is blocked again, and this time genuinely. **That single check is the highest-value discovery call on the segment tab.**

A side effect worth recording: the derivation **decides the model** for `seg-matrix`, which §8 and the catalog had left open. `Derived_Macro_Segment` has no `SMB` and coalescing an OU into it produces PubSec, not SMB. Only `Segment10` carries SMB, so the four-column set is sourceable from `Sls_Forecasting_Metrics_Expanded` and from nowhere else — and both halves of the coalesce must be read from that one model, since there is no relationship joining the two.

#### This belongs in the semantic layer, not client-side in each workbook or app

**A one-line rule that determines what "PubSec" means is exactly the kind of definition that, left out of the model, gets reimplemented slightly differently by every analyst who needs it.** One tests `'Public Sector'`, one tests `'Pub Sec'`, one forgets `ESMB`, one applies the coalesce and one filters instead — and four segment breakouts that all look right disagree, with no error anywhere and no way to tell from the output which one is the house number.

Put it in the model once and every consumer inherits the same answer. That includes the Analytics Agent, which generates `SEMANTIC_VIEW(...)` SQL from apiNames (§2.1) and **cannot infer a rule that lives in someone's workbook.** On the Tableau Next path there is no field-level query API to route around it: if the definition is not in the model, it is not in the answer.

**That is the board's own thesis — T4, that business vocabulary needs somewhere shared to live — arriving unprompted from the person who owns the model rather than from the board arguing for itself.** It is the strongest piece of evidence in this document for the case the board is making, and it should be said plainly on the tab: the rules card for `performance-by-segment` should carry the owner's expression as its rule, because a derived dimension whose definition lives in the client is a definition that has already started to drift.

**Until it is in the model,** the honest options are (a) add it to the SDM as a calculated dimension — the recommendation — or (b) compute it client-side *and* label the column set on the tab as a board-defined derivation with the expression shown, on the same pattern as the APM-L2-to-motion mapping in §5.4. What is not acceptable is rendering four columns as if a governed four-way segment dimension existed, which is what the board does today.

### 10.3 Three years of ACV — and therefore the Five Year Trend tab cannot be sourced

> "Correct, only 3 years of ACV data."

This confirms and sharpens §7.3: `Close_Date_Relative_Year_clc` reaches `'CY'`, `'PY'` and `'PY-1'` and no further. **Three years is the real limit.** It is not a documentation hole to be chased down; it is the actual extent of the data. There is nothing behind `'PY-1'` to reach, so an absolute date filter on `Close_Date17` for FY23 or FY24 returns no rows rather than returning hand-rolled-but-correct ones.

**The consequence is material: the Five Year Trend tab cannot be sourced.** It renders five periods — FY23, FY24, FY25, FY26, FY27 H1 — against three years of data. **All seven of its metric panels are affected,** on top of the four that already had no measure at all.

| Panel | What live data supports |
|---|---|
| `trend-acv` | **3 of 5 points**: FY25 (`'PY-1'`), FY26 (`'PY'`), FY27 (`'CY'`, partial, needs `Is_QTD_ACV_1_clc`). FY23 and FY24 do not exist. |
| `trend-attrition` | **3 of 5 points**, and the FY27 point is additionally short by up to a month of actuals — `Attrition_clc` lands monthly, one month in arrears, with `ATTRITION_UNOFFICIAL` covering the in-flight month. |
| `trend-nnaov` | **3 of 5 points, all of a *commit* measure.** Three years of forecasts, not of results (§4.1). |
| `trend-aov` | **0 points.** Explicitly excluded from both models; confirmed unavailable by the owner. |
| `trend-revenue` | **0 points.** No recognised-revenue measure; confirmed unavailable by the owner. |
| `trend-ae-capacity` | **0 points.** No headcount measure; confirmed unavailable by the owner. Had no as-of grain even for a single point. |
| `trend-ae-productivity` | **0 points.** No measure and no denominator; confirmed unavailable by the owner. |

**What the tab could honestly show against live data:** roughly **three years of the flow metrics that do exist** — ACV, attrition, and NNAOV-as-commit at FY25 / FY26 / FY27-to-date, with FY27 carrying the period-to-date flag and drawn as the detached partial point the tab already renders. Two of the five Y/Y points and one of the five CAGR points. That is a three-year trend of three metrics, not a five-year trend of seven.

It is still a real and defensible chart. Three governed years of one measure, with the partial period handled correctly, is precisely the discipline the tab exists to argue for — the detached FY27 point is the visual form of a rule the layer enforces with a named flag (§7.2). But it is not the tab as designed, and it cannot be relabelled into one: rendering five periods against three years of data means two points with no source, and a chart with two invented points is the exact failure this board was built to argue against.

#### The two-year CAGR series specifically

**Mark this one out.** A 2-year CAGR at year *Y* needs *Y* and *Y−2*. With only `'CY'`, `'PY'` and `'PY-1'` available, it is computable at **`'CY'` alone** — one of the five points the tab plots. At `'PY'` it needs `'PY-2'`; at `'PY-1'` it needs `'PY-3'`. **A 2-year CAGR at the earliest available year has no prior basis to compute from at all.** Rendering it as `0`, as flat, or as blank-but-plotted are three different ways of being wrong.

And that is *before* the separate question of whether a governed CAGR measure exists: neither documented catalogue lists an ACV or attrition CAGR (SPEC has only `Commit_2_Year_CAGR_clc` and `Open_Pipeline_2_Year_CAGR_clc`). **The CAGR channel is unavailable twice over** — no measure, and no basis for four of its five points even if there were one.

The Y/Y channel has the same arithmetic one year shallower: Y/Y at `'CY'` compares to `'PY'` and Y/Y at `'PY'` compares to `'PY-1'`, both fine, but Y/Y at `'PY-1'` needs `'PY-2'`. **The earliest available year can be plotted as a level but not as a rate** — 2 of 5 points.

#### What has to be decided before the tab goes live

Recorded in the catalog's `switchOverProcedure` as step 6, ahead of any query. One of:

1. **Re-cut the tab as a three-year trend** of the three flow metrics that exist, with FY27 as the period-to-date detached point. *The recommendation.*
2. **Hold the tab in mock** and label it as such.
3. **Source the missing years from outside this semantic layer** — a different project, not a query change.

### 10.4 New questions her answers raised

Recorded rather than guessed at. Five are new; two existing questions are sharpened; one is explicitly *not* answered.

1. **Which OU field carries a Public-Sector value, and what the exact literal is.** The one identifier the segment derivation still needs. See §10.2 — the near-hit is on the wrong model, and this is the check that decides whether the segment tab works.
2. **Whether a calculated dimension implementing the derivation already exists.** The owner describes what to *return* — "you'd just have to return …" — which reads as a rule to be applied rather than a field to be selected. Confirm via `list_semantic_model_calculated_dimensions`. If it does not exist, it should be added (§10.2).
3. **Whether the coalesce partitions cleanly, and where `ESMB` goes.** A Public Sector row presumably also carries a segment value, so returning the OU for it *removes* it from whichever of ENTR / CMRCL / SMB it would otherwise have landed in — are the other three columns therefore ex-PubSec by construction, and is that the intended reading? And `Segment10` carries `ESMB`, which is not one of the board's four columns, so the derivation returns `'ESMB'` for those rows and they land in a fifth bucket the tab does not render. Decide whether `ESMB` folds into SMB, renders as a fifth column, or is filtered — and state which. Likewise a row with a null OU *and* a null segment, since the coalesce falls through on both sides.
4. **Whether the OU field is time-aware.** Distinct from the still-open segment time-awareness question, and it **compounds** it: the derived column now inherits the as-of behaviour of *two* dimensions rather than one. If the OU field and the segment field are snapshotted differently, a single row can be Public Sector on one basis and CMRCL on the other, and the derived value depends on which. Nothing in the three documents addresses as-of behaviour on either field.
5. **Whether the three-year limit is ACV-specific or applies to every measure.** Her answer was scoped to ACV. `Close_Date_Relative_Year_clc` is shared across measures, but **history depth is a property of the underlying CTEs, not of the relative-year field** — attrition reads from `ATTRITION_ACTUALS` / `ATTRITION_UNOFFICIAL` and NNAOV-commit from `Commits`, which are different CTEs from `ACV_HISTORICALS`. So attrition and NNAOV could be shallower or deeper than three years. This document assumes three for all three trend panels and **flags the assumption** rather than presenting it as her answer. The same applies to `Open_Pipe_clc` and `PIPE_HISTORICALS`, which matters because the stock exemplar is being re-anchored there.

**Sharpened, not new:** whether any CAGR measure exists for ACV or attrition (§10.3 — even if one does, four of five points have no basis), and `OU_Group_clc`'s full value set, which is now doubly load-bearing because the one value that matters most to the segment tab is the one the source truncates.

**Explicitly not answered, and it stays open: whether either segment dimension is time-aware.** §5.2 and the board's `seg-matrix` claim segment is "a property of the account as of the period" and that the dimension is "certified and time-aware." Neither document says anything about snapshotting or as-of behaviour on `Segment10` or `Derived_Macro_Segment`, and **the PubSec answer does not speak to it.** Reading an answer about what the columns *mean* as an answer about when they are *measured* would be conflating two different questions. Do not make the claim until it is confirmed.

---

## Appendix: what a later agent should do with this

**Rewriting `data/tableau-source-catalog.json`:**
- **Start with §10.** The model owner's three answers override everything else in this document, and two of them change what the catalog says a tab can do. They are already applied to the current `data/tableau-source-catalog.json` — see its `provenance.modelOwnerCorrections`, `portlets['seg-matrix'].derivedSegmentDimension`, `gaps.fiveYearTrendTabCannotBeSourced` and `gaps.headcountAndHeadcountDerivedMetrics`.
- `connections.tableauNextMcp` — take the tool surface from the sibling app (unchanged, it is correct), and take the `targetEntityType: 'sdm'` shape and the "one query tool, natural language, no field-level API" statement from §2.1 here. Mark the parameter names `<TBD>`.
- `connections.tableauCloudMcp` — keep the sibling's constraints verbatim; they are about a different server and nothing in the PDFs touches them (§2.6).
- Add a `semanticModels` block with the two SDMs from §1.1, their mandatory filters, and their non-interchangeability.
- Rebuild `guardrails` from §2.5 — it is a longer and much more specific list than the current five entries, and every item has a named silent failure.
- Rewrite `verifyPeriodType` per §7.2.
- Per portlet, take the measure, model, anchor and required filters from §4, and mark the five gap portlets as unavailable rather than giving them a `queryShape` — attributing the unavailability to the model owner (§10.1) rather than to a failed search.
- Record the segment derivation from §10.2 as a documented calculated dimension with the owner's expression verbatim, and carry the OU field's `apiName` forward as the single `<TBD>` to confirm at discovery time.
- Do not author a five-point series for any `trend-*` portlet. Three years is the data (§10.3).

**Correcting `data/board.json`:** work §5.1 first (it touches every portlet identically), then §5.2 row by row, then decide §5.3 and §5.4 — those two are editorial calls, not lookups, and they change what the board argues. Run `node scripts/sync-fallback.mjs` afterwards.
