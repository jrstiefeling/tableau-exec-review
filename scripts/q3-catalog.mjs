/* Records the consequence of gaps.planAttainment for the Q3 outlook tab's
 * redesign, in the same place and the same shape as the trend tab's three-year
 * ACV limit is recorded.
 *
 * The finding itself is not new — gaps.planAttainment already says there is no
 * FinPlan object in either model, so the three attainment percentages have no
 * governed denominator. What is new is what now stands on them. The redesign
 * derives a dollar plan and a dollar gap from those percentages and draws both,
 * and the deals rail lays five open opportunities along the same derived gap.
 * A limitation that used to end at one bullet track now propagates to the
 * hero of the tab and to the portlet beside it, and the runbook has to say so
 * or an agent wiring this up live would ship three bars and a composition with
 * nothing behind them.
 *
 *   node scripts/q3-catalog.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";

const PATH = "data/tableau-source-catalog.json";
const cat = JSON.parse(readFileSync(PATH, "utf8"));

/* ---- the gap entry gains what now depends on it ------------------------- */
const gap = cat.gaps.planAttainment;

gap.affectsEveryFinPlanAttainmentFigureOnTheQ3OutlookTab = ["outlook-matrix", "outlook-deals"];

gap.derivedQuantitiesThatInheritThisLimit = {
  _note: "ADDED AT THE Q3 REDESIGN. Everything below is arithmetically exact from two authored figures and unsourceable for exactly one reason: one of those two figures has no governed denominator. Exactness is not sourceability.",
  derivation: "plan = commit ÷ attainment; gap = plan − commit. Both are computed in the renderer from data/board.json's authored commit and authored attainment percentage, and both are labelled 'derived' wherever they are drawn.",
  figures: [
    "outlook-matrix Analytics derived plan $120.7M and derived gap −$15.7M, from $105M ÷ 87%",
    "outlook-matrix Platform derived plan $96.8M and derived gap −$21.3M, from $75.5M ÷ 78%",
    "outlook-matrix Embedded derived plan $23M and derived overrun +$6.5M, from $29.5M ÷ 128%",
    "outlook-deals the $15.7M gap the five deals are laid along, and the 80% share and $3.2M residual read off it — the same Analytics derivation, restated in that portlet's own metrics.gap.basis"
  ],
  consequence: "The plan bar, its target tick, the dashed shortfall, the gap readout and the deals composition's entire scale all rest on a percentage neither semantic model can produce. If the tab is wired live, every one of them has to come off with the attainment, not just the attainment.",
  whyItIsStillDrawn: "The tab already printed '87% of Product FinPlan' as authored data before the redesign, so the plan was on the page either way. Deriving a dollar gap from an authored attainment percentage is no less sourceable than the percentage itself — the limit is identical in both cases, and it is recorded here rather than allowed to pick the chart. See docs/q3-redesign.md.",
  renderRule: "Handled structurally, not with copy. metricMatrix's landscape branch drops the bullet entirely in direct mode and draws the dashed void track in its place, because a gap derived from a contested commit would be three different gaps rendered as one. dealRail falls back from the derived gap to the authored total as its scale, keeping the composition and losing the target."
};

/* ---- the two affected portlet entries ----------------------------------- */
const matrix = cat.portlets["outlook-matrix"];

matrix.presentationGrain = "fiscal quarter × product motion (3 rows), with ACV drawn as a commit-against-derived-plan landscape on a dollar scale and the other two measures as Y/Y stubs on the shared growth axis";
matrix.needs = [
  "columns[3]",
  "rows[3].cells[3]",
  "cells[].plan",
  "cells[].altBasis",
  "cells[].altBasis.value",
  "metrics.landscape"
];
matrix.derivedFromUnsourceablePlan = {
  _note: "ADDED AT THE Q3 REDESIGN. See gaps.planAttainment.derivedQuantitiesThatInheritThisLimit.",
  finding: "The band's hero is a bar against a derived plan. Plan and gap are exact arithmetic on the authored commit and the authored attainment percentage — and the attainment percentage is the one figure on this portlet with no governed denominator anywhere in either model, so the hero inherits that limit whole.",
  figures: [
    "Analytics: derived plan $120.7M, derived gap −$15.7M",
    "Platform: derived plan $96.8M, derived gap −$21.3M",
    "Embedded: derived plan $23M, derived overrun +$6.5M"
  ],
  neverSum: "The three derived plans do not reconcile: $96.8M + $23M = $119.8M against Analytics' own $120.7M. The renderer states plan per row and never adds them, and there is no bridge or waterfall on the tab for that reason. Do not add one when wiring this live.",
  wouldRequire: "The same thing the attainment itself would require — a FinPlan object or an ACV target-and-attainment measure pair on the pipegen pattern. Nothing further: given a governed attainment, the derivation above is exact."
};
matrix.cannotSource = [
  "EVERY FinPlan attainment figure on this portlet — 87% (Analytics), 78% (Platform), 128% (Embedded) — AND the derived plan and gap now drawn from each of them. There is no ACV plan measure and NO FinPlan OBJECT ANYWHERE in either model. The governed target vocabulary is PG_TARGETS, OP_TARGETS and PG_LANDING_QTR_TGT — pipegen and Day-1 open pipe only. The 128% cell is also the only authored value that exercises notchedCapPath(), so the one branch the spec asks to be verified is on an unsourceable figure.",
  "the three motion rows — no motion dimension exists",
  "polarity — goodDirection: 'down' on the Attrition column is a board decision"
];
matrix.movedOutAtTheRedesign = "Velocity and coverage are no longer read from this portlet. They are properties of a motion rather than of that motion's ACV, and they now bind to portlets['outlook-benchmark'] — where the 'hist' relabelling below applies instead.";

const deals = cat.portlets["outlook-deals"];
deals.presentationGrain = "fiscal quarter × opportunity, laid end to end along a derived gap rather than ranked against each other";
deals.derivedFromUnsourceablePlan = {
  _note: "ADDED AT THE Q3 REDESIGN. See gaps.planAttainment.derivedQuantitiesThatInheritThisLimit.",
  finding: "The rail's scale is no longer the largest deal, it is the Analytics gap to plan — $15.7M, derived from $105M ÷ 87%. The five amounts are governed and the axis they are laid on is not, so this portlet inherits the FinPlan limit through its scale even though every figure it prints is real.",
  restatedNotImported: "data/board.json restates the two authored inputs in this portlet's own metrics.gap.basis rather than reaching across to outlook-matrix, so the portlet stays self-contained. Both copies bind to the same source and must move together.",
  alsoDerived: [
    "the 80% share these five make of the gap",
    "the $3.2M residual at the end of the bar"
  ],
  renderRule: "dealRail falls back to the authored total as its scale when the gap cannot be derived — the composition survives, the target does not. Direct mode already takes that branch."
};

const bench = {
  tab: "q3-outlook",
  status: "sourceable",
  _note: "NEW AT THE Q3 REDESIGN. Velocity and coverage moved out of portlets['outlook-matrix'] cells into a portlet of their own. This is the strongest portlet on the tab: both readings and both benchmarks are real, named, governed measures, and nothing on it is derived from the FinPlan attainment.",
  model: "Sls_Forecasting_Metrics_Expanded. Sls_Specialist_Reporting carries the same pair and CANNOT be mixed with Forecasting dollars.",
  measures: {
    coverage: "Coverage_clc, benchmarked against Historical_Coverage_clc",
    velocity: "Velocity_clc, benchmarked against Historical_Velocity_clc"
  },
  dimensions: [
    "APM_L120",
    "APM_L218",
    "Close_Date_Fiscal_Quarter_Datepart_clc",
    "Close_Date_Relative_Year_clc"
  ],
  rowGrain: "one row per metric per opportunity per user in the reporting hierarchy",
  presentationGrain: "fiscal quarter × product motion (2 rows), one shared axis per measure",
  dateAnchor: "Close_Date17",
  requiredFilters: [
    "exactly one dedup filter",
    "exclude APM_L120 = 'Other'",
    "filter NULL dimension values",
    "Close_Date_Relative_Year_clc IN ('CY','PY','PY-1') — MANDATORY here, because every measure on this portlet is either a Historical_* measure or paired with one, and the window returns NULL without PY-1"
  ],
  utteranceShape: "Return Coverage (Coverage_clc), Historical Coverage (Historical_Coverage_clc), Velocity (Velocity_clc) and Historical Velocity (Historical_Velocity_clc) grouped by APM_L218 for <scope filter>, filtered to Close_Date_Fiscal_Quarter_Datepart_clc = <resolved> and Close_Date_Relative_Year_clc IN ('CY','PY','PY-1'). Exclude APM_L120 = 'Other'. Filter out null dimension values. DO NOT SUM — every measure here is non-additive.",
  needs: ["axes[2]", "rows[].readings"],
  canSource: [
    "every reading and every benchmark on the portlet — four real governed measures",
    "the absence of an Analytics roll-up row. Both measures are non-additive, so the roll-up genuinely has no reading, and the portlet renders that absence rather than aggregating. Do not add a roll-up row when wiring this live."
  ],
  cannotSource: [
    "the two motion rows — no motion dimension exists; APM_L218 is the nearest real grain",
    "the 'hist' benchmark AS THE BOARD ORIGINALLY DESCRIBED IT. The old label said 'the same day of the prior quarter rather than the prior quarter's close.' The real Historical_* measures are the AVERAGE OF THE SAME FISCAL QUARTER ACROSS THE PRIOR TWO FISCAL YEARS (PY + PY-1). The redesign relabelled the portlet's caption to state the real window — 'the same fiscal quarter averaged across the prior two years' — so this correction is now applied rather than outstanding."
  ],
  displayRules: [
    "Coverage is a MULTIPLIER (2.6× = 2.6), not a percent",
    "Velocity renders as a percentage: multiply by 100, append %",
    "The velocity axis is drawn to a domain of 20 and coverage to 4 — presentation choices, not data"
  ],
  wouldRequireToSourceFully: "Only the APM-L2-to-motion mapping. Given that, this portlet is live-ready as authored.",
  lineage: [
    "Org62 Opportunity",
    "Tableau Extract (.tdsx)",
    "Historical Commits / PIPE_HISTORICALS",
    "APM product hierarchy (L1/L2/L3)",
    "Sls_Forecasting_Metrics_Expanded"
  ]
};

/* Inserted beside the portlet it was carved out of, not appended. */
const ordered = {};
Object.entries(cat.portlets).forEach(([key, value]) => {
  ordered[key] = value;
  if (key === "outlook-matrix") ordered["outlook-benchmark"] = bench;
});
cat.portlets = ordered;

/* The three deleted head tiles. Recorded as removed rather than dropped: an
 * agent reading this file for outlook-acv should find out where it went. */
["outlook-acv", "outlook-attrition", "outlook-nnaov"].forEach((id) => {
  const entry = cat.portlets[id];
  if (!entry) return;
  entry.status = "removed";
  entry.removedAtTheQ3Redesign = "This tile no longer exists. The three head tiles restated the matrix's Analytics row one band below them — $105M, $79.5M, $25.5M — and the two surfaces disagreed on NNAOV Y/Y (−41% on the tile, −43% in the cell, on the same $25.5M). The band was deleted. The measures survive in portlets['outlook-matrix'], which is now the tab's only reading of each. Everything below is retained because the binding notes still apply there.";
});

const summary = cat.portlets._sourceabilitySummary;
if (summary) {
  summary.q3RedesignNote = "The Q3 outlook tab was recomposed after this summary was written. outlook-acv, outlook-attrition and outlook-nnaov are removed; outlook-benchmark is new and is the tab's only fully sourceable portlet; and outlook-matrix and outlook-deals both now carry quantities derived from the unsourceable FinPlan attainment — see gaps.planAttainment.derivedQuantitiesThatInheritThisLimit.";
}

writeFileSync(PATH, `${JSON.stringify(cat, null, 2)}\n`, "utf8");
console.log("portlets:", Object.keys(cat.portlets).filter((k) => k.startsWith("outlook")).join(", "));
console.log("gap entry keys:", Object.keys(cat.gaps.planAttainment).join(", "));
