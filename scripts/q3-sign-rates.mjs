/* One-shot: every rate on the growth hero carries its sign.
 *
 * Three did not — one alternate basis under the layer, two direct-mode
 * overrides. On a tab whose entire reading is which way a subject moved, and
 * one of whose lanes is mirrored so that a negative rate sits on the FAVOURABLE
 * side, a bare "6% Y/Y" is the one string a reader cannot resolve from position
 * alone. The sign printed on the mark is the fixed point the mirror turns
 * around; it is the thing that does not move when the axis does.
 *
 * Display strings only. No value is touched. */

import { readFile, writeFile } from "node:fs/promises";

const PATH = new URL("../data/board.json", import.meta.url);
const board = JSON.parse(await readFile(PATH, "utf8"));

const tab = board.tabs.find((t) => t.id === "q3-outlook");
const hero = tab.bands.flatMap((b) => b.portlets).find((p) => p.id === "outlook-matrix");

let fixed = 0;
const walk = (node) => {
  if (!node || typeof node !== "object") return;
  if (typeof node.yoyDisplay === "string" && /^\d/.test(node.yoyDisplay) && Number(node.yoy) > 0) {
    node.yoyDisplay = `+${node.yoyDisplay}`;
    fixed += 1;
  }
  Object.values(node).forEach(walk);
};
walk(hero);

await writeFile(PATH, `${JSON.stringify(board, null, 2)}\n`);
console.log(`signed ${fixed} rate${fixed === 1 ? "" : "s"}`);
