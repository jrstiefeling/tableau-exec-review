/* One-shot: repoints q3-outlook's hero from the plan matrix onto growth lanes.
 *
 * Kept as a script rather than a hand-edit because board.json is one object of
 * a few thousand lines and a hand-edit of a nested cell list is a diff nobody
 * can review. Run once, committed for the record, and safe to re-run: every
 * step asserts the shape it expects before it touches it. */

import { readFile, writeFile } from "node:fs/promises";

const PATH = new URL("../data/board.json", import.meta.url);
const board = JSON.parse(await readFile(PATH, "utf8"));

const tab = board.tabs.find((t) => t.id === "q3-outlook");
const portlet = tab.bands.flatMap((b) => b.portlets).find((p) => p.id === "outlook-matrix");
if (!portlet) throw new Error("outlook-matrix not found");

const m = portlet.metrics;

/* ------------------------------- the head -------------------------------- */

portlet.kind = "growthLanes";
portlet.label = "Q3 growth by motion";
portlet.sublabel =
  "Year over year for three measures, each lane turned so favourable is to the right";

/* ------------------------------ the lanes -------------------------------- */

const POLARITY = {
  acv: { polarityWord: "higher is better" },
  attrition: { polarityWord: "lower is better", mirrorNote: "axis mirrored" },
  nnaov: { polarityWord: "higher is better" }
};

m.columns.forEach((column) => {
  Object.assign(column, POLARITY[column.id]);
});

m.subjectWord = "motion";
m.rollup = "analytics";

/* ------------------------------ plan, out -------------------------------- */

/* The tab's one unsourceable quantity and everything derived from it. There
   is no FinPlan object in either model, so 87%, 78% and 128% had no governed
   basis — and a chart that renders a figure with no basis is asserting one. */
let stripped = 0;
m.rows.forEach((row) => {
  row.cells.forEach((cell) => {
    ["plan", "planDisplay", "planGoodDirection"].forEach((key) => {
      if (key in cell) { delete cell[key]; stripped += 1; }
    });
  });
});

Object.values(portlet.directMode.metrics.rows).forEach((row) => {
  Object.values(row.cells).forEach((cell) => {
    ["plan", "planDisplay", "planGoodDirection"].forEach((key) => {
      if (key in cell) { delete cell[key]; stripped += 1; }
    });
  });
});

delete m.landscape;

/* --------------------------- the weight key ------------------------------ */

/* The dollar scale the landscape used, kept: it is the one authored scale on
   this portlet, the three levels are the reason a rate is worth reading, and
   dropping it would leave three rates with no sense of how much book each
   applies to. What goes is the plan bar drawn on it, not the scale. */
m.key = {
  columnId: "acv",
  domainMax: 125,
  tipLabel: "Q3 ACV commit",
  label: "Q3 ACV commit, on one $0–$125M scale. Positions, not a composition — Attrition's children do not sum to their parent."
};

/* ------------------------------ the ruler -------------------------------- */

/* The shared symlog ticks, signed. GROWTH_TICKS states them as ± pairs
   because every other chart on the board draws a symmetric cell; a lane is
   one continuous axis, so both sides are named. */
m.axisTicks = [
  { value: -1000, label: "-1000%" },
  { value: -100, label: "-100%" },
  { value: -10, label: "-10%" },
  { value: 0, label: "0" },
  { value: 10, label: "+10%" },
  { value: 100, label: "+100%" },
  { value: 1000, label: "+1000%" }
];

m.endLabels = { worse: "worse", better: "better" };

m.axisNote = "Same symlog growth axis as the product and segment tabs";
m.altBasisLabel = "Second stated basis, Analytics roll-up";
m.caption =
  "Every figure is authored. No prior-year dollars are shown: the Y/Y rates are stated to the integer, so a prior-year amount reconstructed from one would be an estimate, and this board does not estimate. Attrition's lane is mirrored so that favourable is to the right on all three; the signs printed on the marks are unchanged.";

/* --------------------------- the degraded read --------------------------- */

const dm = portlet.directMode;
dm.metrics.axisNote = "Same symlog growth axis — every rate inferred";
dm.metrics.altBasisVoidNote =
  "no second basis survives — both readings are inferred, so there is nothing left to arbitrate between";
dm.metrics.caption =
  "Every rate agrees with the exec tab. Both are wrong by the same multiplier.";

m.altBasisVoidNote = null;

/* Certified in the governed reading. The portlet's amber was the derived plan
   column, and the derived plan column is gone: what is left is three certified
   commit measures and their authored Y/Y rates. */
dm.provenance = "certified";
dm.groundedIn = "ACV, Attrition and NNAOV commits, all certified (§3.2)";
dm.candidates = [
  "attrition improving 20% or worsening 20%, by date anchor",
  "NNAOV growing 6% or falling 43%, by new-logo test"
];
dm.missing =
  "The date anchor on the attrition commit and the new-logo test underneath NNAOV — the two business rules that decide which direction each of those measures is moving";
dm.effect =
  "Four of the nine rates change sign, and two whole lanes invert: attrition goes from two motions worsening to all three improving, and NNAOV from a decline to growth. The chart draws the inverted lanes with exactly the confidence it draws the governed ones, because a mirrored axis is only as honest as the polarity underneath it.";
dm.risk =
  "Tell the board attrition improved across every motion in the quarter it worsened in two of three";
dm.trustCost = "A polarity you cannot source is a direction you cannot state";
dm.certifiedDelta = "every rate moved · four of nine change sign";
dm.shownFrom =
  "Each measure inherits the hazard of its own definition, at the same multipliers the exec cards use: ACV × 0.902 for the four coexisting amount columns, attrition × 2/3 for the month of arrears, NNAOV × 1.867 for the most permissive new-logo test. Analytics ACV reads $94.7M rather than $105M. The alternative-basis ghosts go entirely, there being nothing left to arbitrate between once both readings are inferred.";
dm.wouldYouNotice =
  "No, and the way you would fail to notice is instructive: this tab now AGREES with the exec tab, rate for rate, because both applied the same wrong multiplier to the same measure. Two surfaces reconciling is the check most people run, and it passes. What it demonstrates is that consistency is not correctness — and here the inconsistency it hides is a change of direction, not of magnitude.";
dm.layerProvides =
  "Three certified measures with declared grains and date anchors, and the authored polarity that says which way each of them is good.";
dm.layerDoesNotProvide =
  "Any second reading to check a rate against, and any statement of which basis a Y/Y was struck on.";

/* ------------------------------ the lineage ------------------------------ */

portlet.semantic.metricName = "Q3 Growth by Product and Measure";
portlet.semantic.definition =
  "Three commit measures for the in-flight quarter at motion grain — Current_Commit_clc, Attrition_Commit_clc and NNAOV_Commit_clc — each with its authored year-over-year rate and its authored good direction.";
portlet.semantic.why =
  "Three measures, so the portlet claims none of them as its own. Every figure on it is authored and certified: the plan column that used to sit here was derived from an attainment percentage with no FinPlan object anywhere in the layer, and it has been removed rather than qualified. See tableau-source-catalog.json gaps.planAttainment. Velocity and coverage have moved to their own portlet, where they are real, governed and non-additive — which is why they are never rolled up the motion rail.";

await writeFile(PATH, `${JSON.stringify(board, null, 2)}\n`);
console.log(`rewired outlook-matrix → growthLanes · ${stripped} plan keys stripped`);
