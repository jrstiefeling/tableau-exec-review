#!/bin/bash
# The verification matrix: every tab at every tier, both modes, plus a
# mid-sweep frame to confirm nothing is painted before its beat.
set -e
cd "$(dirname "$0")/.."

for size in 1440x720 1280x620 1024x580; do
  echo "── $size ─────────────────────────────────────────"
  node scripts/shoot.mjs "index.html#q3-outlook" "$size" "q3-$size"
  node scripts/shoot.mjs "index.html#q3-outlook" "$size" "q3-$size-direct" --direct
done

echo "── the other four tabs, unaffected? ─────────────"
for tab in exec analytics-performance performance-by-segment trend; do
  node scripts/shoot.mjs "index.html#$tab" 1024x580 "tab-$tab"
done

echo "── mid-sweep ────────────────────────────────────"
for at in 700 1100 1600; do
  node scripts/shoot.mjs "index.html#q3-outlook" 1024x580 "q3-sweep-$at" --at "$at"
done
