/* One-shot authoring pass: writes `provenance` and `detectability` onto every
 * directMode block, and corrects `tier` where the re-derivation moved it.
 *
 * Kept in the tree rather than run from a scratch file because the derivation
 * is the reviewable artefact. Every call below cites the section of
 * docs/semantic-layer.md that grounds it, and the rule is one line:
 *
 *   provenance = the WEAKEST LOAD-BEARING input the portlet has.
 *
 * Load-bearing means the portlet's stated job needs it. A KPI card whose whole
 * purpose is "attained or missed against plan" needs the plan, so a plan that
 * exists in no model makes the card supplemented even though its hero measure
 * is certified. That is not a technicality — it is the most useful thing this
 * pass discovered about the board, and §5.4 line 343 says it plainly:
 * attainment exists ONLY for Pipe Gen and Day-1 Open Pipe.
 *
 *   node scripts/author-provenance.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";

/* id: [provenance, directTier, detectability, groundedIn] */
const CALLS = {
  /* ---------------------------------- exec ---------------------------------- */
  // Hero measure certified (NNAOV_Commit_clc, ACV_clc, Attrition_clc — §5.4)
  // but the plan is not: "There is no ACV, NNAOV or Attrition plan-attainment
  // measure and no 'FinPlan' object anywhere in either model" (§5.4).
  "kpi-nnaov":      ["supplemented", "red",    "silent",    "NNAOV_Commit_clc certified; plan basis in no model (§5.4)"],
  "kpi-acv":        ["supplemented", "red",    "silent",    "ACV_clc certified; plan basis in no model (§5.4)"],
  "kpi-attrition":  ["supplemented", "red",    "silent",    "Attrition_clc certified; plan basis in no model (§5.4)"],
  // The one card whose plan IS governed: "Attainment exists only for Pipe Gen
  // and Day-1 Open Pipe, by product and by source (§3.2)". Fully certified.
  "kpi-pipegen":    ["certified",    "red",    "catchable", "Pipe_Gen_clc + pipegen attainment both certified (§3.2, §5.4)"],
  // ACV_clc is certified; the Embedded/Agentic split is not: "No product-motion
  // dimension exists" (§5.4), "The Embedded/Agentic grouping does not exist".
  "mix-acv":        ["supplemented", "red",    "silent",    "ACV_clc certified; no product-motion dimension exists (§5.4, §5.6)"],
  // "no measure exists — confirmed by the model owner (§10.1)". User Hierarchy
  // table, weekly refresh. Pure supplemented: nothing to withdraw.
  "hc-ae":          ["supplemented", "yellow", "none",      "no AE capacity measure in either model (§5.4, §10.1)"],
  "going-well":     ["narrative",    "grey",   "none",      "measure: null — correct as authored (§5.4)"],
  "h2-focus":       ["narrative",    "grey",   "none",      "measure: null — correct as authored (§5.4)"],
  // ACV_clc at account grain, prior year via Close_Date_Relative_Year_clc='PY'
  // on ACV_HISTORICALS. The ⚠ in §5.4 is a query-construction rule — pick one
  // model, request the full result set — not a missing definition.
  "acv-account-fan":["certified",    "red",    "silent",    "ACV_clc at account × relative year; ⚠ is a usage rule (§5.4)"],

  /* ------------------------- analytics-performance -------------------------- */
  "perf-hierarchy": ["supplemented", "red",    "silent",    "ACV_clc certified; motion hierarchy is not a dimension (§5.4)"],
  // A decomposition of a certified ADDITIVE measure. §7.1: additivity is a
  // published, structural property of the catalogue. That is what guarantees
  // the lines sum to the net — and it is why an inferred decomposition that
  // does not close is a self-evident failure. Hence catchable.
  "perf-divergence":["supplemented", "red",    "catchable", "ACV_clc additive (§3.4, §7.1); motion parentage absent (§5.4)"],
  "perf-rules":     ["narrative",    "grey",   "none",      "presentation rules, no figure (§5.4)"],

  /* ------------------------- performance-by-segment ------------------------- */
  // The four segment columns are a DERIVED dimension — the model owner's own
  // expression, `IF OU = Public Sector then OU else segment end` (§10.2) —
  // which §9 calls "a definition that does not exist in it yet". A definition
  // with a person behind it and nothing enforcing it is exactly supplemented.
  "seg-matrix":     ["supplemented", "red",    "silent",    "derived segment dimension not in the model (§10.2, §9)"],
  "seg-spread":     ["supplemented", "red",    "catchable", "ACV_clc additive (§7.1); derived segment not in model (§10.2)"],
  "seg-rules":      ["narrative",    "grey",   "none",      "presentation rules, no figure (§5.4)"],

  /* ------------------------------- q3-outlook ------------------------------- */
  "outlook-matrix": ["supplemented", "red",    "silent",    "ACV/Attrition/NNAOV certified; no FinPlan object (§5.4)"],
  // Coverage_clc + Historical_Coverage_clc and Velocity_clc/Specialist_V_clc +
  // Historical_Velocity_clc are all ✅ in §5.4. The benchmark window is
  // governed too: "'Historical' = average of the same fiscal quarter across the
  // prior 2 fiscal years (PY + PY-1)" (§8). Fully certified.
  "outlook-benchmark":["certified",  "red",    "silent",    "Coverage_clc + Historical_* certified, window governed (§5.4, §8)"],
  // ACV_clc ranked, and SPEC states the ranking rule (§4 note on 'no limit
  // key'). But the gap it is laid along derives from the FinPlan attainment.
  "outlook-deals":  ["supplemented", "red",    "silent",    "ACV_clc + stated ranking rule; gap needs absent FinPlan (§5.4)"],

  /* ---------------------------------- trend --------------------------------- */
  "drivers":        ["narrative",    "grey",   "none",      "measure: null — correct as authored (§5.4)"],
  // The four panels with no measure at all (§5.4: "Four of its seven panels
  // have no measure"). Pure supplemented, so they do not move on the toggle.
  "trend-ae-capacity": ["supplemented", "yellow", "none",   "no AE capacity measure in either model (§5.4, §10.1)"],
  "trend-aov":      ["supplemented", "yellow", "none",      "AOV explicitly excluded from both models (§5.5, §10.1)"],
  "trend-revenue":  ["supplemented", "yellow", "none",      "no revenue equivalent — model owner confirmed (§5.4, §10.1)"],
  // ACV ÷ AE count: the numerator is certified and degrades, the denominator
  // never was. Weakest link in DIRECT is inferred, so red rather than amber.
  "trend-ae-productivity":["supplemented","red","silent",   "no productivity measure (§5.4); ACV numerator certified"],
  // The three panels that reach three of five points. Only three years exist —
  // CY=FY27, PY=FY26, PY-1=FY25 — and "an absolute date filter on Close_Date17
  // for FY23 or FY24 returns no rows" (§8). So FY23 and FY24 are supplemented
  // points inside an otherwise certified series: per-point provenance.
  "trend-acv":      ["supplemented", "red",    "silent",    "FY25-27 certified; FY23-24 have no rows (§5.4, §8, §10.3)"],
  "trend-attrition":["supplemented", "red",    "silent",    "FY25-27 certified; FY23-24 have no rows (§5.4, §8, §10.3)"],
  "trend-nnaov":    ["supplemented", "red",    "catchable", "FY25-27 certified; FY23-24 have no rows (§5.4, §8, §10.3)"],
  "trend-rules":    ["narrative",    "grey",   "none",      "presentation rules, no figure (§5.4)"]
};

const PATH = "data/board.json";
const board = JSON.parse(readFileSync(PATH, "utf8"));

const seen = new Set();
const tally = { governed: {}, direct: {}, detect: {} };
const bump = (b, k) => { b[k] = (b[k] || 0) + 1; };
const GOVERNED = { certified: "green", supplemented: "yellow", narrative: "grey" };

board.tabs.forEach((tab) => tab.bands.forEach((band) => band.portlets.forEach((p) => {
  const call = CALLS[p.id];
  if (!call) throw new Error(`no provenance call authored for ${p.id}`);
  const [provenance, tier, detectability, groundedIn] = call;
  seen.add(p.id);

  p.directMode = p.directMode || {};
  // Order matters for the diff: the three vocabulary keys lead the block.
  p.directMode = {
    provenance,
    tier,
    detectability,
    groundedIn,
    ...Object.fromEntries(Object.entries(p.directMode)
      .filter(([k]) => !["provenance", "tier", "detectability", "groundedIn"].includes(k)))
  };

  bump(tally.governed, GOVERNED[provenance]);
  bump(tally.direct, tier);
  bump(tally.detect, detectability);
})));

const unused = Object.keys(CALLS).filter((k) => !seen.has(k));
if (unused.length) throw new Error(`authored calls for portlets that do not exist: ${unused}`);

writeFileSync(PATH, `${JSON.stringify(board, null, 2)}\n`);
console.log(`authored ${seen.size} blocks`);
console.log("governed tiers:", tally.governed);
console.log("direct tiers:  ", tally.direct);
console.log("detectability: ", tally.detect);
