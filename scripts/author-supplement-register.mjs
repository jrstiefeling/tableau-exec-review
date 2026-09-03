/* One-shot: the supplemented register in data/tableau-source-catalog.json.
 *
 * The catalogue's job is to be the runbook for wiring this board to the real
 * models, and until now it has answered one question per portlet: can the
 * layer produce this? Three answers were possible — sourceable, partial,
 * unsourceable — and "partial" and "unsourceable" both meant "you have a
 * problem" without saying what to do about it.
 *
 * The board now says something more useful, because the user does: not
 * everything here has to come through the layer. A Google Sheet maintained by
 * an analyst is a legitimate way to get a number onto a board. So every gap
 * the catalogue records is really two facts — what the layer cannot produce,
 * and what will produce it instead — and the second one is the half a person
 * doing the wiring actually needs.
 *
 * Hence this register. For each portlet with something outside the layer, it
 * records the source KIND, what specifically comes from there, and the section
 * of docs/semantic-layer.md that establishes the gap. Nothing here is
 * invented: every citation is a section that exists and says what is claimed.
 *
 * It also drops three stale entries. The Q3 rebuild merged the plan landscape
 * into the Y/Y matrix, so outlook-acv, outlook-attrition and outlook-nnaov are
 * portlets the board no longer has.
 *
 *   node scripts/author-supplement-register.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

/* Source kinds, deliberately few. The distinction that matters operationally
 * is not which vendor but WHO STANDS BEHIND THE NUMBER and what refreshes it. */
const SHEET = "google-sheet";
const WAREHOUSE = "warehouse-table";
const DERIVED = "derived-in-board";

const REGISTER = {
  /* ---- portlets with no layer measure at all: the control group ---------- */
  "hc-ae": {
    scope: "whole portlet",
    kind: WAREHOUSE,
    source: "User Hierarchy table, weekly refresh",
    supplies: "Quota-carrying AE headcount, and the 904 prior-year baseline behind the -18%.",
    because: "§5.2 and §10.1 — no AE capacity measure exists in either model, confirmed by the "
      + "model owner, who names headcount and anything divided by headcount as a category.",
    cost: "Weekly refresh against a board labelled quarter-to-date, no enforced as-of date, and "
      + "no lineage. Nothing stops the roster being re-cut mid-quarter and the prior-year "
      + "comparison moving with it."
  },
  "trend-ae-capacity": {
    scope: "whole portlet",
    kind: WAREHOUSE,
    source: "User Hierarchy table, weekly refresh",
    supplies: "Five fiscal years of quota-carrying headcount.",
    because: "§5.2 and §10.1 — same missing measure as hc-ae.",
    cost: "Same as hc-ae, and additionally there is no guarantee the hierarchy was cut the same "
      + "way in FY23 as in FY27, which is exactly the comparison the panel draws."
  },
  "trend-aov": {
    scope: "whole portlet",
    kind: WAREHOUSE,
    source: "Snowflake order-book balance table",
    supplies: "Average order value as a balance at each fiscal year end.",
    because: "§10.2 — AOV is not merely absent but explicitly and deliberately excluded from "
      + "both models in writing. FCST instructs that if a user asks about AOV, the SDM cannot "
      + "answer. The model owner confirms it.",
    cost: "No period-to-date rule applies because the layer never sees it, so nothing stops a "
      + "consumer treating this balance as a flow and annualising the H1 reading. The board "
      + "declines to, but that is the board's discipline rather than an enforced one."
  },
  "trend-revenue": {
    scope: "whole portlet",
    kind: WAREHOUSE,
    source: "Finance system export",
    supplies: "Recognised revenue by fiscal year, and the FY27 accounting treatment change.",
    because: "§5.2 and §10.1 — no revenue equivalent in either model, confirmed unavailable by "
      + "the model owner. The documented accounting-treatment change the portlet wants to "
      + "retrieve has no counterpart in either model's businessPreferences.",
    cost: "Revenue recognition is restated, and an export carries no version. Two pulls a "
      + "quarter apart can disagree with each other and both be right."
  },

  /* ---- plan and target: the sharpest structural gap on the board --------- */
  "kpi-acv": {
    scope: "plan attainment track only",
    kind: SHEET,
    source: "Planning spreadsheet",
    supplies: "The 100% reference the bar is read against. The $82M itself is ACV_clc.",
    because: "§3.2 — target and attainment measures exist for Pipe Gen and Day-1 Open Pipe, by "
      + "product and by source, and for nothing else. §5.4 records that the FinPlan lineage "
      + "node three portlets name does not exist.",
    cost: "Re-versioned at every reforecast with no history, so a screenshot of 70% of plan "
      + "cannot be reproduced later. Rendered as a dashed amber tick on the card."
  },
  "kpi-attrition": {
    scope: "plan attainment track only",
    kind: SHEET,
    source: "Planning spreadsheet",
    supplies: "The 100% reference. The $75M is Attrition_clc.",
    because: "§3.2 — no attrition target measure exists.",
    cost: "As kpi-acv. Note the polarity too: that lower is better here is the board's "
      + "statement, not the model's — §12 corrected this document once for claiming the layer "
      + "declares measure polarity."
  },
  "kpi-nnaov": {
    scope: "hero measure AND plan track",
    kind: SHEET,
    source: "Planning spreadsheet, plus a definitional gap in the layer itself",
    supplies: "The 100% reference, and the presentation of a commit as a booked actual.",
    because: "§3.2 for the target, and §10.4 for the measure: NNAOV exists only as a commit. "
      + "NNAOV_Commit_clc is a forecast, not a booking, and the board presents it as a booked "
      + "quarter result with a Y/Y and a plan attainment.",
    cost: "The only portlet on the board whose HERO figure is misdescribed rather than merely "
      + "unenforced, which is why its dot is amber in governed mode where kpi-acv's is green."
  },
  "outlook-matrix": {
    scope: "merged plan column",
    kind: SHEET,
    source: "Planning spreadsheet",
    supplies: "The derived plan and the gap-to-plan bracket. The ACV and attrition cells are "
      + "certified.",
    because: "§3.2 — no ACV target measure. The plan landscape merged into this matrix by the "
      + "Q3 rebuild has no governed counterpart.",
    cost: "Half the panel is enforced and half is not, and they render in the same type."
  },
  "outlook-deals": {
    scope: "gap-to-plan axis",
    kind: SHEET,
    source: "Planning spreadsheet",
    supplies: "The axis the five deals are laid along. The deals and amounts are ACV_clc.",
    because: "§3.2 — the gap needs a target that does not exist.",
    cost: "The ranking is governed; the scale it is drawn on is not."
  },

  /* ---- dimensions that exist in the business but not in the model -------- */
  "mix-acv": {
    scope: "Embedded / Agentic partition",
    kind: DERIVED,
    source: "Board-side grouping over APM_L120 / APM_L218",
    supplies: "The two-motion parentage. The dollars and the leaf products are ACV_clc.",
    because: "§5.2 — 'Product motion' in the grain is not a real dimension; the real fields are "
      + "APM_L120 and APM_L218. §11 records that FCST lists twelve APM_L120 values and does not "
      + "use the labels this board groups by.",
    cost: "A real hierarchy underneath and an authored roll-up on top. Nothing stops the twelve "
      + "APM values being re-parented, and the panel would still add up."
  },
  "perf-hierarchy": {
    scope: "two-level motion taxonomy",
    kind: DERIVED,
    source: "Board-side grouping over APM_L120 / APM_L218",
    supplies: "The parent rows. Every leaf and every dollar is ACV_clc.",
    because: "§5.2, §11 — as mix-acv.",
    cost: "The roll-up closes by additivity, which the layer does guarantee (§7.1). What it does "
      + "not guarantee is that these are the right parents."
  },
  "perf-divergence": {
    scope: "motion parentage of the decomposition",
    kind: DERIVED,
    source: "Board-side grouping over APM_L120 / APM_L218",
    supplies: "Which leaves belong to which wing. The nets and the movements are ACV_clc.",
    because: "§5.2, §11 — as mix-acv. Additivity itself is governed (§3.4, §7.1), which is what "
      + "makes an inferred decomposition that does not close a self-evident failure.",
    cost: "The wings are authored; the arithmetic is not. That asymmetry is the panel's whole "
      + "value in direct mode."
  },
  "seg-matrix": {
    scope: "the four segment columns",
    kind: DERIVED,
    source: "The model owner's own expression: IF OU = Public Sector then OU else segment end",
    supplies: "The segment dimension every column is cut by.",
    because: "§10.2 — the owner supplied this expression, and §9 calls it a definition that does "
      + "not exist in the model yet. A definition with a person behind it and nothing enforcing "
      + "it is the textbook supplemented case.",
    cost: "Public Sector is carved out of an OU field by a rule that lives in a query rather "
      + "than in the model, so two people can write it differently and both be defensible."
  },
  "seg-spread": {
    scope: "the segment dimension of the decomposition",
    kind: DERIVED,
    source: "As seg-matrix",
    supplies: "Which accounts belong to which segment. The dollars are ACV_clc.",
    because: "§10.2, §9 — as seg-matrix.",
    cost: "As seg-matrix, and the decomposition inherits it: a mis-assigned account moves "
      + "dollars between wings without changing the net."
  },

  /* ---- history that predates the models --------------------------------- */
  "trend-acv": {
    scope: "FY23 and FY24 points",
    kind: SHEET,
    source: "The source deck the board was built from",
    supplies: "The first two of five points. FY25-FY27 H1 are ACV_clc.",
    because: "§10.3 and §7.3 — 'Correct, only 3 years of ACV data.' The relative-year window "
      + "CY/PY/PY-1 is the extent of the DATA, not a windowing choice, and an absolute date "
      + "filter on Close_Date17 for FY23 or FY24 returns no rows.",
    cost: "Two points that cannot be refreshed, re-derived or checked against anything. Marked "
      + "per point with a halo, in both modes, because the seam is a fact about the data."
  },
  "trend-attrition": {
    scope: "FY23 and FY24 points",
    kind: SHEET,
    source: "The source deck",
    supplies: "The first two of five points. FY25 onward is Attrition_clc.",
    because: "§10.3, §7.3 — as trend-acv.",
    cost: "As trend-acv."
  },
  "trend-nnaov": {
    scope: "FY23 and FY24 points, and the commit-versus-booking gap",
    kind: SHEET,
    source: "The source deck",
    supplies: "The first two of five points, and the framing of a commit as an actual.",
    because: "§10.3, §7.3 for the history; §10.4 for the measure.",
    cost: "Both gaps at once, which is why this is the panel whose shape visibly breaks in "
      + "direct mode."
  },
  "trend-ae-productivity": {
    scope: "the denominator, in every year",
    kind: WAREHOUSE,
    source: "User Hierarchy table, weekly refresh",
    supplies: "The AE count under the ratio. The ACV numerator is certified for FY25 onward.",
    because: "§5.2 and §10.1 — no productivity measure exists, and the model owner names "
      + "productivity specifically. §11 records the broader finding: anything divided by "
      + "headcount is reaching for the same missing denominator.",
    cost: "A certified numerator over an unenforced denominator is unenforced. The portlet's own "
      + "verify rule already says what to do when the ratio cannot be reproduced."
  }
};

/* Four portlets are 'partial' for reasons that are NOT a missing source, and
 * saying so explicitly is what makes the register's completeness check mean
 * something. A blank here would be indistinguishable from an oversight. */
const NOT_A_SOURCE_GAP = {
  "acv-account-fan": "Nothing is supplemented. §5.2's warning on this portlet is a "
    + "query-construction rule, not a definitional gap: resolve the account hierarchy field to "
    + "one model rather than both (FCST has no Account ID, only Account_Name129; SPEC has "
    + "Account_ID106), and the utterance must request the full result set rather than a top-N. "
    + "ACV_clc at account x relative year answers the whole panel once those two rules are kept.",
  "perf-rules": "Authored narrative, not a query. §5.2 records that three of the four rules on "
    + "these cards are supportable from businessPreferences and that the fourth — measure "
    + "polarity — is not, which is why the card states direction of good as the board's decision "
    + "rather than the layer's. Nothing to supplement; the correction was to the claim.",
  "seg-rules": "Authored narrative, not a query. As perf-rules.",
  "trend-rules": "Authored narrative, not a query. As perf-rules."
};

const PATH = "data/tableau-source-catalog.json";
const cat = JSON.parse(readFileSync(PATH, "utf8"));

/* ---- drop the three portlets the Q3 rebuild removed ---------------------- */
const GONE = ["outlook-acv", "outlook-attrition", "outlook-nnaov"];
const dropped = GONE.filter((id) => id in cat.portlets);
dropped.forEach((id) => { delete cat.portlets[id]; });

/* ---- attach the register ------------------------------------------------- */
let attached = 0;
for (const [id, entry] of Object.entries(REGISTER)) {
  if (!cat.portlets[id]) throw new Error(`register names a portlet the catalogue does not have: ${id}`);
  cat.portlets[id].supplementedBy = entry;
  attached += 1;
}

let annotated = 0;
for (const [id, why] of Object.entries(NOT_A_SOURCE_GAP)) {
  if (!cat.portlets[id]) throw new Error(`no catalogue entry for ${id}`);
  cat.portlets[id].supplementedBy = { scope: "nothing", kind: "not-a-source-gap", because: why };
  annotated += 1;
}

/* Every portlet the catalogue could not fully source should now say what will
 * source it instead. Anything left over is a hole in this register rather than
 * a hole in the board, and it should fail loudly. */
const unexplained = Object.entries(cat.portlets)
  .filter(([id, p]) => id !== "_note" && id !== "_sourceabilitySummary"
    && (p.status === "partial" || p.status === "unsourceable") && !p.supplementedBy)
  .map(([id]) => id);

cat.portlets._note = "One entry per portlet across all five tabs. 27 total. Status values: "
  + "'sourceable' (a certified measure exists and the whole tile can be produced), 'partial' "
  + "(something exists but at a different definition, population or grain, or part of the tile "
  + "cannot be produced), 'unsourceable' (nothing in either documented model answers this), "
  + "'narrative' (authored content, not a query). Every identifier the documents do not state is "
  + "a <TBD: ...>. No apiName below is invented. "
  + "Where a portlet is 'partial' or 'unsourceable', `supplementedBy` records what supplies the "
  + "missing part instead — the source kind, what specifically comes from there, the section of "
  + "docs/semantic-layer.md that establishes the gap, and what the substitution costs. That "
  + "field is the operational half of the finding: the board is not a semantic-layer-only "
  + "artefact and was never going to be, so a gap is only half a fact until it says what fills "
  + "it. Source kinds: 'google-sheet' (a person maintains it, re-versioned without history), "
  + "'warehouse-table' (a system maintains it, refreshed on its own schedule, no enforced "
  + "as-of date), 'derived-in-board' (a real governed field with an authored grouping over it), "
  + "'not-a-source-gap' (the portlet is 'partial' for a reason that is not a missing source — a "
  + "query-construction rule to keep, or authored narrative — and nothing supplements it).";

const counts = {};
Object.entries(cat.portlets).forEach(([id, p]) => {
  if (id.startsWith("_")) return;
  counts[p.status] = (counts[p.status] || 0) + 1;
});
const kinds = {};
Object.values(REGISTER).forEach((e) => { kinds[e.kind] = (kinds[e.kind] || 0) + 1; });

cat.portlets._sourceabilitySummary = {
  total: Object.keys(cat.portlets).filter((k) => !k.startsWith("_")).length,
  byStatus: counts,
  supplemented: {
    portletsWithSomethingOutsideTheLayer: attached,
    wholePortlet: Object.entries(REGISTER)
      .filter(([, e]) => e.scope === "whole portlet").map(([id]) => id),
    byKind: kinds,
    note: "Four portlets are supplemented end to end and have no certified counterpart at all; "
      + "the rest are certified measures with one channel, dimension or period outside the "
      + "layer. The four are the control group on the direct-to-source toggle: their figures do "
      + "not move, because there is no guarantee to withdraw."
  }
};

writeFileSync(PATH, `${JSON.stringify(cat, null, 2)}\n`);
console.log(`dropped ${dropped.length} stale entries: ${dropped.join(", ") || "none"}`);
console.log(`supplementedBy attached to ${attached} portlets, ${annotated} marked not-a-source-gap`);
console.log("by status:", counts);
console.log("by source kind:", kinds);
if (unexplained.length) {
  console.log(`\nNOT YET EXPLAINED (${unexplained.length}): ${unexplained.join(", ")}`);
}
