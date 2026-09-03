/* One-shot: re-bases the deals rail off the derived gap and onto its own total.
 *
 * The rail was laid along the quarter's gap to plan, and the gap to plan was
 * derived from an attainment percentage with no FinPlan object behind it. With
 * plan off the tab the scale has to go with it.
 *
 * The replacement is not a fallback dressed as a decision. The five authored
 * amounts sum to the authored total exactly — 3 + 3 + 2.3 + 2.1 + 2.1 = 12.5 —
 * which makes this the one closed partition anywhere on the tab and the only
 * composition on it that is entitled to tile. The board holds no other
 * authored quantity that five open deals could honestly be measured against:
 * open pipe is recoverable from coverage x commit, but coverage is authored to
 * one decimal, so Platform's open pipe is somewhere in a $7.6M-wide interval,
 * and drawing an interval that wide as a length would be an estimate. */

import { readFile, writeFile } from "node:fs/promises";

const PATH = new URL("../data/board.json", import.meta.url);
const board = JSON.parse(await readFile(PATH, "utf8"));

const tab = board.tabs.find((t) => t.id === "q3-outlook");
const portlet = tab.bands.flatMap((b) => b.portlets).find((p) => p.id === "outlook-deals");
if (!portlet) throw new Error("outlook-deals not found");

const m = portlet.metrics;
if (!m.gap) throw new Error("expected the derived gap block to still be here");

/* The closure check, run here rather than asserted in a comment. If the five
   amounts ever stop summing to the authored total, this composition stops
   being entitled to tile and the script should fail rather than draw. */
const summed = m.deals.reduce((a, d) => a + Number(d.value), 0);
const stated = Number(String(m.totalDisplay).match(/[\d.]+/)[0]);
if (Math.abs(summed - stated) > 1e-9) {
  throw new Error(`deals do not close: ${summed} summed vs ${stated} stated`);
}

delete m.gap;
delete m.gapCaption;

m.composition = {
  totalDisplay: "$12.5M",
  claim: "across five open opportunities",
  format: { prefix: "$", suffix: "M", decimals: 1 }
};

m.caption =
  "The five laid end to end on their own total — the amounts sum to it exactly, so equal deals draw equal lengths and the two ties draw as ties. Ranked on one certified ACV definition.";

portlet.directMode.metrics.composition = { totalDisplay: "$12.6M" };

/* What degrades here is the ordering, not the aggregate: the gap between third
   and fifth place is smaller than the gap between the four candidate amount
   columns. A total laid end to end is invariant to the order of its parts, so
   the bar says the same thing either way — which is the one honest thing left
   to say about five amounts nobody can rank. */
portlet.directMode.effect =
  "The list survives and the order does not. Two of the five change places depending on which column the query author reached for, and the total moves $0.1M with them. What the bar says is unchanged, because a total laid end to end is invariant to the order of its parts — the ranking beneath it is not.";
portlet.directMode.metrics.caption =
  "Ranked on whichever amount column the query reached for — the amounts survive, their order does not.";

await writeFile(PATH, `${JSON.stringify(board, null, 2)}\n`);
console.log(`deals rail re-based · ${summed} closes against ${m.composition.totalDisplay}`);
