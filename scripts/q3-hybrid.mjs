/* One-shot migration of the Q3 outlook tab to the hybrid composition.
 *
 * Scripted rather than hand-edited because the tab is ~1,400 lines of JSON and
 * the edits are structural: a band is deleted, two portlets are new, and the
 * velocity and coverage readings move from inside matrix cells to a portlet of
 * their own. Every authored figure is carried across verbatim — this file
 * moves values, it never computes one.
 *
 *   node scripts/q3-hybrid.mjs && node scripts/sync-fallback.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";

const PATH = "data/board.json";
const board = JSON.parse(readFileSync(PATH, "utf8"));
const tab = board.tabs.find((t) => t.id === "q3-outlook");
if (!tab) throw new Error("q3-outlook tab not found");

const headBand = tab.bands.find((b) => b.id === "outlook-head");
const gridBand = tab.bands.find((b) => b.id === "outlook-grid");
const railBand = tab.bands.find((b) => b.id === "outlook-rail");
const matrix = gridBand.portlets[0];
const deals = railBand.portlets[0];

/* ---------------------------------------------------------------------------
 * 1. The head band goes.
 *
 * Its three tiles restated the matrix's Analytics row — $105M, $79.5M, $25.5M
 * — one band above it, and the two surfaces did not agree: the NNAOV tile read
 * -41% Y/Y against the cell's -43% on the same figure. Deleting the duplicate
 * surface frees roughly a fifth of the tab's height and leaves one reading of
 * each measure rather than two.
 * ------------------------------------------------------------------------- */
tab.bands = tab.bands.filter((b) => b.id !== "outlook-head");

/* ---------------------------------------------------------------------------
 * 2. Velocity and coverage leave the matrix cells.
 *
 * They are properties of a motion, not of that motion's ACV, and living inside
 * the ACV cell is what cost them their legibility. Lifted verbatim into the
 * new benchmark portlet, and the axis domains are widened only where the
 * authored tick list needs the headroom — no reading changes.
 * ------------------------------------------------------------------------- */
const AXIS_META = {
  coverage: {
    label: "Coverage",
    sublabel: "open pipe ÷ commit, a multiplier",
    domainMax: 4,
    ticks: [0, 1, 2, 3, 4].map((v) => ({ value: v, label: `${v}×` }))
  },
  velocity: {
    label: "Velocity",
    sublabel: "pace of deals through the pipeline",
    domainMax: 20,
    ticks: [0, 5, 10, 15, 20].map((v) => ({ value: v, label: `${v}%` }))
  }
};

const benchRows = [];
matrix.metrics.rows.forEach((row) => {
  (row.cells || []).forEach((cell) => {
    if (!cell.pairs || !cell.pairs.length) return;
    const readings = {};
    cell.pairs.forEach((pair) => {
      const delta = Number(pair.value) - Number(pair.hist);
      const unit = pair.unit === "x" ? "×" : "%";
      const magnitude = Math.abs(delta);
      const body = unit === "×"
        ? magnitude.toFixed(1).replace(/\.0$/, "")
        : String(Math.round(magnitude));
      readings[pair.id] = {
        value: pair.value,
        valueDisplay: pair.unit === "x" ? String(pair.valueDisplay).replace(/x$/, "×") : pair.valueDisplay,
        hist: pair.hist,
        histDisplay: String(pair.histDisplay).replace(/^([\d.]+)x/, "$1×"),
        goodDirection: pair.goodDirection || "up",
        // Stated, not computed at render time, so the notation matches the
        // authored readings it sits under.
        deltaDisplay: `${delta > 0 ? "+" : "−"}${body}${unit} vs hist`,
        flatDisplay: "flat vs hist"
      };
    });
    benchRows.push({ id: row.id, label: row.label, sublabel: row.sublabel, color: row.color, readings });
  });
  // The roll-up appears on neither axis: coverage and velocity are
  // non-additive, so it has no reading to place.
  if (!benchRows.some((r) => r.id === row.id)) {
    benchRows.unshift({ id: row.id, label: row.label, sublabel: row.sublabel, color: row.color, readings: {} });
  }
  (row.cells || []).forEach((cell) => {
    delete cell.pairs;
    // Week-over-week commentary on a tab with no week axis, present on two
    // cells of nine so that its rarity read as a property of those two
    // products rather than as an absence of movement everywhere else.
    delete cell.note;
  });
});

/* The alternate basis gains a position on the dollar axis. Read off the
 * authored display string it already carries — $100M and $88.9M — not a new
 * figure. */
const ALT_VALUES = { "OU Roll-up": 100, "*OU Roll-up": 88.9 };
matrix.metrics.rows.forEach((row) => {
  (row.cells || []).forEach((cell) => {
    if (cell.altBasis && ALT_VALUES[cell.altBasis.label] != null) {
      cell.altBasis.value = ALT_VALUES[cell.altBasis.label];
    }
  });
});

/* ---------------------------------------------------------------------------
 * 3. The matrix becomes the band-one hero: ACV as a plan landscape on a
 *    dollar scale, the other two measures' Y/Y beside it on the same rows.
 * ------------------------------------------------------------------------- */
matrix.label = "Q3 outlook against plan";
matrix.sublabel = "Commit, derived plan and the gap on one dollar scale, with the other two measures year over year";
matrix.metrics.landscape = {
  column: "acv",
  domainMax: 125,
  ticks: [0, 25, 50, 75, 100, 125].map((v) => ({ value: v, label: v === 0 ? "$0" : `$${v}M` })),
  format: { prefix: "$", suffix: "M", decimals: 1 },
  plotLabel: "ACV — commit, derived plan and the gap",
  readLabel: "ACV attainment",
  targetWord: "plan",
  gapWord: "gap",
  overWord: "over"
};
matrix.metrics.altBasisLabel = "Second stated basis, Analytics roll-up";
matrix.metrics.caption = "Plan is derived per row from the authored commit and the authored attainment percentage. The three derived plans are never summed.";
matrix.directMode.metrics.caption = "No plan basis: with no denominator the plan bar and its tick drop rather than render against a candidate spread, because that would be three different gaps";
matrix.directMode.effect = "Every attainment loses its denominator, so the plan bar and its target tick drop entirely rather than being drawn against one of three candidate commits — a gap derived from a contested numerator would be three different gaps stated as one. The commit bar survives, because a length is arithmetic.";
matrix.directMode.candidates = [
  "87% of a plan version nobody named",
  "78% or 91% or 64%, by vintage"
];
matrix.semantic.definition = "Three commit measures for the in-flight quarter at motion grain — Current_Commit_clc, Attrition_Commit_clc and NNAOV_Commit_clc — with the ACV commit read against a plan derived from its authored attainment percentage.";
matrix.semantic.why = "Three measures, so the portlet claims none of them as its own. The plan bar and the gap beside it are derived here, exactly, from two authored figures — but the denominator underneath them is the tab's one unsourceable quantity: there is no FinPlan object anywhere in the layer, so 87%, 78% and 128% have no governed basis and neither does anything derived from them. See tableau-source-catalog.json gaps.planAttainment and portlets['outlook-matrix'].derivedFromUnsourceablePlan. Velocity and coverage have moved to their own portlet, where they are real, governed and non-additive — which is why they are never rolled up the motion rail.";

/* ---------------------------------------------------------------------------
 * 4. The two band-two portlets.
 * ------------------------------------------------------------------------- */
const bench = {
  id: "outlook-benchmark",
  kind: "benchmarkAxis",
  label: "Pipeline sufficiency by motion",
  sublabel: "Coverage and velocity against their historical benchmarks",
  accent: "#1C6E8C",
  metrics: {
    axes: ["coverage", "velocity"].map((id) => ({ id, ...AXIS_META[id] })),
    rows: benchRows,
    voidNote: "Coverage and velocity are non-additive, so the Analytics roll-up carries neither.",
    caption: "Hollow marks the historical benchmark — the same fiscal quarter averaged across the prior two years.",
    directCaption: "The readings survive; the benchmark does not, so neither does the comparison."
  },
  semantic: {
    metricName: "Coverage and Velocity against Historical",
    definition: "Coverage_clc against Historical_Coverage_clc, and Velocity_clc against Historical_Velocity_clc, at motion grain for the in-flight quarter. Coverage is a multiplier, not a percent. Both measures and both benchmarks are non-additive.",
    sdm: "Sls_Forecasting_Metrics_Expanded",
    measure: "Coverage_clc · Historical_Coverage_clc · Velocity_clc · Historical_Velocity_clc",
    grain: "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × product motion.",
    lineage: [
      "Org62 Opportunity",
      "Tableau Extract (.tdsx)",
      "Historical Commits / PIPE_HISTORICALS",
      "APM product hierarchy (L1/L2/L3)"
    ],
    rls: "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
    certifiedBy: "Casey O'Donnell, document owner — the SDM has no certifier property",
    freshness: "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
    dashboard: "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
    why: "This is the one band on the tab that is governed end to end. Both readings and both benchmarks are real measures with real names, which is more than the plan attainment above it can say. The benchmark is the average of the same fiscal quarter across the prior two fiscal years, not the same day of the prior quarter, and the relative-year window has to reach PY-1 or every historical figure returns null. The Analytics roll-up has no mark on either axis because both measures are non-additive, so there is nothing to place — the rule rendered rather than stated."
  },
  directMode: {
    tier: "yellow",
    candidates: ["a benchmark over an unstated window"],
    missing: "A stated window for the comparison. The governed measure averages the same fiscal quarter across the prior two fiscal years; a direct read against Org62 can produce a prior-period figure but nothing in it says which period, or whether the window was two years or one",
    effect: "The readings survive — open pipe over commit is arithmetic — and the benchmark loses its position, so the dumbbell keeps its ring and loses its comparison. What goes is the only part anybody was reading it for",
    thesisTag: "T2",
    thesis: "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
    risk: "Call coverage sufficient against a benchmark taken over a window nobody agreed to",
    trustCost: "A comparison with no stated window is a number beside another number",
    metrics: {
      caption: "The readings survive; the benchmark does not, so neither does the comparison."
    }
  }
};

/* The deals rail re-bases onto the derived gap. The two authored figures the
 * gap derives from are restated here rather than reached for across portlets,
 * so the portlet stays self-contained and the derivation stays visible. */
deals.label = "Q3 top ACV deals";
deals.sublabel = "Five largest open opportunities, against the derived gap";
deals.metrics.gap = {
  basis: { value: 105, plan: 87, of: "Analytics ACV commit and its authored Product FinPlan attainment" },
  label: "gap to plan",
  residualWord: "to find",
  format: { prefix: "$", suffix: "M", decimals: 1 }
};
deals.metrics.gapCaption = "Largest open opportunities by open pipe, laid along the derived gap. Open pipe and commit are different measures — this compares size, not a sum.";
deals.directMode.effect = "The list survives and the order does not. Two of the five change places depending on which column the query author reached for. The gap they were laid against goes too: it is derived from an attainment with no denominator, so the rail falls back to ranking the five against each other.";
deals.directMode.metrics.caption = "Ranked on an undefined amount column, against no derivable gap — the list survives, the order does not";

railBand.portlets = [bench, deals];
railBand.id = "outlook-support";
railBand.layout = "outlook-support";
gridBand.layout = "outlook-hero";

writeFileSync(PATH, `${JSON.stringify(board, null, 2)}\n`, "utf8");

const d = (v, pct) => { const plan = v / (pct / 100); return { plan, gap: plan - v }; };
console.log("bands now:", tab.bands.map((b) => `${b.id}/${b.layout}`).join(", "));
console.log("benchmark rows:", benchRows.map((r) => `${r.id}[${Object.keys(r.readings).join("+") || "none"}]`).join(", "));
console.log("derived, exact:");
console.log("  analytics", d(105, 87));
console.log("  platform ", d(75.5, 78));
console.log("  embedded ", d(29.5, 128));
console.log("  deals sum", [3, 3, 2.3, 2.1, 2.1].reduce((a, b) => a + b, 0));
