/* One-shot: per-point provenance on the seven Five Year panels.
 *
 * A five-year line is not one source, and this is the only place on the board
 * where that is visible mark by mark. `docs/semantic-layer.md` §10.3 and §7.3
 * settle it without needing a judgement call:
 *
 *   "Correct, only 3 years of ACV data."
 *   "The three-value relative-year window is the extent of the DATA, not of
 *    the vocabulary … An absolute date filter on Close_Date17 for FY23 or FY24
 *    returns no rows."
 *
 * So `CY / PY / PY-1` = FY27 / FY26 / FY25 is the whole of history. FY23 and
 * FY24 are not a windowing choice the board could widen — there is nothing
 * behind PY-1 to reach. Those two points can only ever have come from the
 * source deck, in every mode, under every toggle.
 *
 * The rule, applied per point rather than per panel: a point is SUPPLEMENTED
 * when it is authored outside both models, and it renders with a halo. The
 * three panels that have a measure carry a real seam at FY25. The four that
 * have no measure in either model (§10.3: "four of its seven panels have no
 * measure at all") are supplemented end to end — and those are exactly the
 * panels whose figures do not move when the toggle flips.
 *
 * Which produces the reading the tab has been missing: the fully-haloed panels
 * are the ones the layer was never holding, and on the partly-haloed ones the
 * halo marks precisely the points that survive the flip. The seam is where the
 * halos stop.
 */
import { readFileSync, writeFileSync } from "node:fs";

const S = "supplemented";
const C = "certified";
const I = "inferred";

/* [governed, direct] — five points, FY23 FY24 FY25 FY26 FY27H1.
 *
 * Direct mode has no certified point anywhere, by construction: the toggle
 * withdraws the layer, so what was certified becomes inferred. It does NOT
 * touch the supplemented points, because there is no guarantee there to
 * withdraw — the Sheet is still the Sheet. */
const PANELS = {
  /* Has a measure for the CY/PY/PY-1 window. ACV_clc, FCST. */
  "trend-acv": [[S, S, C, C, C], [S, S, I, I, I]],
  /* ATTRITION_ACTUALS reaches the same three years. */
  "trend-attrition": [[S, S, C, C, C], [S, S, I, I, I]],
  /* NNAOV_Commit_clc likewise. */
  "trend-nnaov": [[S, S, C, C, C], [S, S, I, I, I]],
  /* No measure in either model (§10.1, confirmed by the model owner). Nothing
   * to withdraw, so the line is identical in both modes. */
  "trend-revenue": [[S, S, S, S, S], [S, S, S, S, S]],
  /* Quota-carrying headcount is not in either model. It is a roster. */
  "trend-ae-capacity": [[S, S, S, S, S], [S, S, S, S, S]],
  /* AOV is excluded from both models in writing (§10.2). */
  "trend-aov": [[S, S, S, S, S], [S, S, S, S, S]],
  /* A certified numerator over a supplemented denominator is supplemented —
   * weakest link. In direct mode the numerator degrades under it, so the three
   * points that had a real ACV behind them go inferred and lose their halo.
   * The halos that remain are the two years that were never in the model. */
  "trend-ae-productivity": [[S, S, S, S, S], [S, S, I, I, I]]
};

const file = "data/board.json";
const board = JSON.parse(readFileSync(file, "utf8"));
const byId = new Map();
for (const tab of board.tabs) {
  for (const band of tab.bands || []) {
    for (const p of band.portlets || []) byId.set(p.id, p);
  }
}

let n = 0;
for (const [id, [governed, direct]] of Object.entries(PANELS)) {
  const p = byId.get(id);
  if (!p) throw new Error(`no portlet ${id}`);
  const len = (p.metrics.series || []).length;
  if (governed.length !== len) throw new Error(`${id}: ${governed.length} provenance vs ${len} points`);
  p.metrics.pointProvenance = governed;
  p.directMode = p.directMode || {};
  p.directMode.metrics = p.directMode.metrics || {};
  p.directMode.metrics.pointProvenance = direct;
  n += 1;
}

writeFileSync(file, `${JSON.stringify(board, null, 2)}\n`);
console.log(`point provenance authored on ${n} panels`);
