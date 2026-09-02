#!/usr/bin/env node
/* Regenerates src/fallback.js from data/board.json.
 *
 * The embedded copy is what keeps the board from rendering blank when the
 * JSON cannot be fetched — opened straight off the filesystem, or mid-edit
 * with a stray comma. Nothing watches for you, so run this after every edit
 * to the data file:
 *
 *   node scripts/sync-fallback.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "data/board.json");
const target = resolve(root, "src/fallback.js");

const raw = await readFile(source, "utf8");
const board = JSON.parse(raw);

if (!Array.isArray(board.tabs) || !board.tabs.length) {
  throw new Error("data/board.json has no tabs — refusing to write an empty fallback.");
}

const portlets = board.tabs.reduce(
  (sum, tab) => sum + (tab.bands || []).reduce((n, band) => n + (band.portlets || []).length, 0),
  0
);

const banner = `/* GENERATED FILE — do not edit by hand.
 *
 * Byte-for-byte copy of data/board.json, embedded so the board still renders
 * when that file cannot be fetched. Regenerate with:
 *
 *   node scripts/sync-fallback.mjs
 */\n\n`;

await writeFile(target, `${banner}export const FALLBACK_BOARD = ${JSON.stringify(board, null, 2)};\n`, "utf8");

console.log(`sync-fallback: wrote src/fallback.js (${board.tabs.length} tabs, ${portlets} portlets)`);
