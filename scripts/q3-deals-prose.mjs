/* One-shot: the deals rail's provenance prose, following the rail off plan.
 *
 * Three of its fields still described the gap the rail was laid along, and the
 * rail has not been laid along a gap since the growth rebuild. These are the
 * strings the provenance flip shows, so a reader who opened the back face was
 * being told about a mark that is not on the front. */

import { readFile, writeFile } from "node:fs/promises";

const PATH = new URL("../data/board.json", import.meta.url);
const board = JSON.parse(await readFile(PATH, "utf8"));

const tab = board.tabs.find((t) => t.id === "q3-outlook");
const portlet = tab.bands.flatMap((b) => b.portlets).find((p) => p.id === "outlook-deals");
const dm = portlet.directMode;

dm.groundedIn = "ACV_clc + stated ranking rule; the ranking itself is not governed (§5.4)";

/* What the layer is actually holding up here is now narrower and easier to
   state, because the rail stopped depending on a quantity outside it. */
dm.layerDoesNotProvide =
  "Any guarantee about the ORDER. One amount definition is applied across the five under the layer and four coexist without it, and the distance between third and fifth place is smaller than the distance between those columns.";

dm.shownFrom =
  "The four candidate amount columns differ per deal rather than uniformly, because they diverge on product mix and currency — so the error does not cancel the way a single multiplier would. Modelled at up to 12% per deal: US Bank $2.1M → $2.4M and US GOV $2.1M → $1.9M, which lifts US Bank above Charles Schwab. Third and fifth place swap. The total moves $12.5M → $12.6M, inside any plausibility check. The composition is untouched by all of it — a total laid end to end is invariant to the order of its parts — so what degrades is the list beneath the bar and not the bar.";

await writeFile(PATH, `${JSON.stringify(board, null, 2)}\n`);
console.log("deals rail prose: off the gap");
