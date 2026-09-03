/* Repoint tab 3's seg-matrix from the 7x4 growth matrix onto the slope form.
 *
 * Idempotent: run it twice and the second run is a no-op. Every figure it
 * writes is either already authored somewhere on this board or is exact
 * arithmetic over authored dollars, labelled derived where it renders.
 *
 *   node scripts/author-segment-slope.mjs
 *   node scripts/sync-fallback.mjs
 *
 * The All Segments block copied onto each row is the *authored* reading from
 * analytics-performance/perf-hierarchy. It is deliberately copied rather than
 * recomputed from these four columns: the two differ slightly, and that
 * difference is one of the three inconsistencies this tab renders faithfully
 * and silently. Recomputing it here would silently reconcile it. */

import { readFileSync, writeFileSync } from "node:fs";

const PATH = "data/board.json";
const board = JSON.parse(readFileSync(PATH, "utf8"));

const tab = board.tabs.find((t) => t.id === "performance-by-segment");
const perf = board.tabs.find((t) => t.id === "analytics-performance");
const seg = tab.bands.flatMap((b) => b.portlets).find((p) => p.id === "seg-matrix");
const hierarchy = perf.bands.flatMap((b) => b.portlets).find((p) => p.id === "perf-hierarchy");

/* ---------------------------------------------------------------- the form */

seg.kind = "segmentSlope";
seg.label = "ACV growth by product line across segments";
seg.sublabel = "Four product lines, four segments, one growth axis, Q2 FY27";

/* -------------------------------------------- the All Segments cross-check */

const byId = Object.fromEntries(hierarchy.metrics.rows.map((r) => [r.id, r]));
let copied = 0;
seg.metrics.rows.forEach((row) => {
  const src = byId[row.id];
  if (!src) throw new Error(`no perf-hierarchy row to copy for ${row.id}`);
  /* perf-hierarchy is the single-column lane, so its rows carry scalars where
   * seg-matrix's carry one entry per segment. */
  row.allSegments = {
    value: src.value,
    display: src.display,
    yoy: src.yoy,
    yoyDisplay: src.yoyDisplay,
    source: "analytics-performance/perf-hierarchy"
  };
  copied += 1;
});

/* ------------------------------------------------------------- the verdict */

/* Exact arithmetic over seg-spread's twenty authored dollar movements. Held
 * here as literals so the renderer never computes a figure, and cross-checked
 * against the authored parts below so a future edit to the movements cannot
 * leave these silently stale. */
const spread = tab.bands.flatMap((b) => b.portlets).find((p) => p.id === "seg-spread");
const parts = spread.metrics.rows.flatMap((r) => r.parts);
const moveOf = (ids) => parts
  .filter((p) => ids.includes(p.id))
  .reduce((a, p) => a + p.delta, 0);

const platformMove = moveOf(["cloud", "server"]);
const nextMove = moveOf(["next"]);
const round1 = (v) => Math.round(v * 10) / 10;

if (round1(platformMove) !== -40.0) throw new Error(`platform movement moved: ${platformMove}`);
if (round1(nextMove) !== 11.2) throw new Error(`Next movement moved: ${nextMove}`);

seg.metrics.verdict = [
  { value: "−$40.0M", label: "given up by Platform, in all four segments", tone: "risk" },
  { value: "+$11.2M", label: "added by Tableau Next, in all four segments", tone: "positive" }
];

seg.metrics.verdictNote =
  "Platform's two lines are 2 points apart at All Segments; Embedded's are 429. "
  + "Of the $56.1M that moved, knowing a dollar's product line explains $16.4M, its segment "
  + "$4.6M, and its motion only $3.5M — so the platform block is the finding, not the "
  + "two-motion split. Inside that $100.0M block the segment tilt is still worth $8.4M.";

/* ---------------------------------------------------------------- the copy */

tab.headline = "Platform fell as one block — the segment only tilts it";

seg.metrics.axisNote =
  "Y/Y — linear inside ±10%, one decade per gridline beyond it. Dot area is the ACV behind "
  + "the rate. Four leaf product lines; the three roll-up rows are their sums and are carried "
  + "in full on the Analytics Performance tab, whose All Segments reading the motion spans use.";

seg.metrics.caption =
  "Cloud and Server are the same line now. Every segment gave up platform dollars and every "
  + "line rises toward PubSec — the tilt is real, and it is small beside the drop.";

seg.metrics.detailNote =
  "The three roll-up rows appear here and not in the plot; they are the sums of the four leaf "
  + "lines. All Segments is the authored reading on the Analytics Performance tab, not a "
  + "recomputation of these four columns — the two differ slightly.";

/* ----------------------------------------------------------- direct mode */

/* The old string opened "All thirty-five cells still render", which the form
 * no longer has. The rewrite keeps the same claim — the failure is silent and
 * the totals still tie — and adds the thing the slope form makes visible:
 * the All Segments reading never touches the derived segment dimension, so it
 * is the one column the hazard cannot move. */
seg.directMode.effect =
  "All sixteen marks still render and the two motion groups still separate. What moves is "
  + "which line a dollar sits on: each column is whichever segment source the query author "
  + "reached for, so an account that moved up-market in April is counted in two different "
  + "segments across two readings of the same quarter. The All Segments reading is the one "
  + "thing the hazard cannot touch, because it never reads the derived dimension at all — "
  + "which is why the platform block still reads as a block while the four columns underneath "
  + "it are quietly reallocated.";

seg.directMode.metrics.axisNote =
  "Y/Y on a stated scale, over four columns assembled from three sources";
seg.directMode.metrics.caption =
  "Every total is unchanged. $2M moved between two columns.";

writeFileSync(PATH, `${JSON.stringify(board, null, 2)}\n`);
console.log(`seg-matrix -> ${seg.kind}; All Segments copied onto ${copied} rows`);
console.log(`platform ${round1(platformMove)}M, Next +${round1(nextMove)}M — verdict cross-checked`);
