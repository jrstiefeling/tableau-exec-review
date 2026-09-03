/* Adds one factual clause to the Q3 hero's key note.
 *
 * WHY
 *
 * The Q3 hero argues Platform against Embedded and Embedded is favourable on
 * all three measures (+32% / -23% / +61%). The Segment rebuild then
 * established, from the same board's data, that Embedded is a bucket holding
 * Tableau Next at +414% and CRMA at -15% — 429 points apart at All Segments —
 * and that averaging them destroys the signal so thoroughly that motion is the
 * WEAKEST of the three groupings: of the $56.1M that moved, product line
 * explains $16.4M, segment $4.6M, and motion only $3.5M. That is seg-matrix's
 * own verdictNote, not a new derivation.
 *
 * So "put more pipeline into Embedded" — which is what the sufficiency panel's
 * 3.2x against a 2.8x benchmark invites — could land on the declining half of
 * the bucket. Q3's authored data is at motion grain only, so this tab cannot
 * decompose it, and it should not try. But a demo audience that has just come
 * off the Segment tab has been shown the split, and the board's whole argument
 * is that a figure should carry what it does and does not support.
 *
 * WHERE
 *
 * The portlet's sublabel, which is the one line of prose on this chart that
 * renders at all three widths.
 *
 * Two better-looking homes were tried and rejected by measurement:
 *
 *  - metrics.caption. growthLanes only draws it inside buildDetail(), so it
 *    lives on the flip side, and a caveat nobody turns the tile over to read
 *    is not a caveat.
 *  - metrics.key.label, which renders on the front as .gln-keynote and
 *    already carries exactly this kind of clause ("Positions, not a
 *    composition — Attrition's children do not sum to their parent"). It is
 *    display:none at 1280 and at 1024 — it exists only at 1440. A caveat that
 *    disappears at the two narrower widths is worse than none, because it
 *    reads as present to whoever checked it at 1440.
 *
 * WHAT THIS IS NOT
 *
 * Not a new panel, not a reconciliation note, and not a decomposition. It adds
 * no figure that is not already displayed on this board — 429 points is
 * seg-matrix's authored verdictNote — and it changes no figure at all. It also
 * adds no DOM node: the sublabel already exists and is drawn by the portlet
 * shell in stage one, not by the chart, so the chart's veil list needs no
 * change.
 */

import { readFileSync, writeFileSync } from "node:fs";

const PATH = "data/board.json";
const board = JSON.parse(readFileSync(PATH, "utf8"));

const portlet = board.tabs
  .find((t) => t.id === "q3-outlook").bands
  .flatMap((b) => b.portlets)
  .find((p) => p.id === "outlook-matrix");

const CLAUSE = " \u00b7 each motion is a bucket: Embedded's two product lines "
  + "sit 429 points apart, on the segment tab";

/* The keyNote carried this for one commit before measurement showed it is
 * display:none below 1440. Undo that if it is still there. */
const key = portlet.metrics.key;
const stale = " A motion is a bucket, not a line: Embedded's two product lines "
  + "sit 429 points apart at Q2, on the segment tab.";
if (key.label.endsWith(stale)) key.label = key.label.slice(0, -stale.length);

if (portlet.sublabel.includes("each motion is a bucket")) {
  console.log("already present, nothing to do");
} else {
  portlet.sublabel += CLAUSE;
  writeFileSync(PATH, `${JSON.stringify(board, null, 2)}\n`);
  console.log("sublabel is now:\n ", portlet.sublabel);
  console.log("\nkey.label is back to:\n ", key.label);
}
