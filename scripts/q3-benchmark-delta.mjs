/* One-shot: turns the sufficiency panel from two absolute axes into two
 * signed-distance axes.
 *
 * The panel's narrative is "we are tracking", and the picture never said it.
 * Four dumbbells spread across two wide bands left most of the plot empty
 * while the actual finding — is this sufficient, yes or no — was never stated,
 * only implied by two positions the reader had to compare and judge. Four
 * numbers, each needing a mental subtraction, is three too many.
 *
 * So the subtraction is done once, in the data, and the chart draws its
 * result. Nothing here is a new figure: every delta is the difference of two
 * figures already authored on the same reading, and every short label is the
 * authored delta display with its trailing clause removed. */

import { readFile, writeFile } from "node:fs/promises";

const PATH = new URL("../data/board.json", import.meta.url);
const board = JSON.parse(await readFile(PATH, "utf8"));

const tab = board.tabs.find((t) => t.id === "q3-outlook");
const portlet = tab.bands.flatMap((b) => b.portlets).find((p) => p.id === "outlook-benchmark");
if (!portlet) throw new Error("outlook-benchmark not found");

const m = portlet.metrics;

/* --------------------------------- axes ---------------------------------- */

/* The domain is signed distance from the benchmark, and it is authored per
   axis rather than fitted to the data. A fitted domain would rescale itself
   between the governed and the direct reading, and the whole argument of the
   toggle is that the marks move — they cannot move if the ruler moves with
   them.

   Both domains are wide enough to hold the direct-mode readings, which run
   further from the benchmark than the governed ones do: coverage reaches
   +0.8× against a prior-quarter benchmark where it is -0.1× against the
   certified one. */
const AXES = {
  coverage: {
    deltaMax: 1,
    ticks: [
      { value: -1, label: "-1.0×" },
      { value: -0.5, label: "-0.5×" },
      { value: 0, label: "hist" },
      { value: 0.5, label: "+0.5×" },
      { value: 1, label: "+1.0×" }
    ]
  },
  velocity: {
    deltaMax: 4,
    ticks: [
      { value: -4, label: "-4%" },
      { value: -2, label: "-2%" },
      { value: 0, label: "hist" },
      { value: 2, label: "+2%" },
      { value: 4, label: "+4%" }
    ]
  }
};

m.axes.forEach((axis) => {
  const spec = AXES[axis.id];
  if (!spec) throw new Error(`no delta domain authored for axis ${axis.id}`);
  /* The absolute scale goes. The absolute value keeps its numeral — it is
     the thing a reader quotes — but a dot on a 0-to-4 track was spending most
     of the panel's width saying "somewhere in the middle", which is not a
     finding. */
  delete axis.domainMax;
  axis.deltaMax = spec.deltaMax;
  axis.ticks = spec.ticks;
});

/* The verdict, stated. Authored rather than hard-coded so the words stay
   reviewable — they are the panel's headline, and a renderer inventing them
   would be a renderer with an opinion. */
m.verdicts = { above: "above", below: "below", flat: "level" };

/* ------------------------------- readings -------------------------------- */

/* Every delta is `value - hist` on figures already on the reading, rounded to
   the precision the authored display already states. The short label is the
   authored delta display with its trailing "vs …" clause cut off — the clause
   is now the axis's own zero rule, so restating it on every mark is four
   copies of a fact the chart draws once. */
function decimals(display) {
  const match = String(display).match(/\.(\d+)/);
  return match ? match[1].length : 0;
}

function shorten(display) {
  return String(display).replace(/\s*vs\s.*$/, "");
}

let touched = 0;
function addDelta(reading, base) {
  const value = Number(reading.value ?? base.value);
  const hist = Number(reading.hist ?? base.hist);
  const display = reading.deltaDisplay ?? base.deltaDisplay;
  reading.delta = Number((value - hist).toFixed(decimals(display)));
  reading.deltaShort = shorten(display);
  touched += 1;
}

m.rows.forEach((row) => {
  Object.values(row.readings || {}).forEach((reading) => addDelta(reading, reading));
});

/* The direct overlay states a different benchmark, so it states a different
   delta — and that is the panel's whole contribution to the toggle. Three of
   the four readings cross the zero rule. */
Object.entries(portlet.directMode.metrics.rows).forEach(([index, overlay]) => {
  const base = m.rows[Number(index)];
  Object.entries(overlay.readings || {}).forEach(([axisId, reading]) => {
    addDelta(reading, base.readings[axisId]);
  });
});

/* -------------------------------- the foot -------------------------------- */

/* The void row was its own line under the plots, which gave a fact about one
   absent row the same weight as the two present ones. Demoted to a clause in
   the caption: still stated, still the non-additivity rule rendered rather
   than asserted, no longer a paragraph. */
delete m.voidNote;

m.caption =
  "Distance from the benchmark — the same fiscal quarter averaged across the prior two years. Coverage and velocity are non-additive, so the Analytics roll-up carries neither and is absent from both axes.";
portlet.directMode.metrics.caption =
  "Distance from the prior quarter, because no measure says which window a benchmark is over. Three of the four readings cross the rule.";
delete portlet.directMode.metrics.directCaption;
m.directCaption =
  "Distance from the prior quarter — no measure says which window a benchmark is over.";

portlet.sublabel = "Distance from each motion's historical benchmark, on one shared rule";

await writeFile(PATH, `${JSON.stringify(board, null, 2)}\n`);
console.log(`benchmark axes → delta mode · ${touched} readings given a signed distance`);
