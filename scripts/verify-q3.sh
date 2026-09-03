#!/bin/bash
# The Q3 tab at three widths in all three states, plus three mid-sweep frames.
#
# scripts/verify.sh is the whole-board matrix; this is the same discipline
# narrowed to the tab under change, so it can be re-run cheaply after each fix.
# If another agent's in-flight module is throwing on mount — which aborts the
# board build and makes every frame of every tab useless — run the same names
# through scripts/shoot-isolated.sh instead.
set -e
cd "$(dirname "$0")/.."

lsof -ti:8765 >/dev/null 2>&1 || {
  (nohup python3 -m http.server 8765 >/tmp/serve.log 2>&1 </dev/null &)
  sleep 1
}

URL="index.html#q3-outlook"

for size in 1440x720 1280x620 1024x580; do
  echo "── $size ──────────────────────────────────────────"
  node scripts/shoot.mjs "$URL" "$size" "v-$size-governed"
  node scripts/shoot.mjs "$URL" "$size" "v-$size-direct" --direct
  # The audit pass is a held key, so it is reached by adding the class the key
  # adds. It only means anything in direct mode: in governed mode there is
  # nothing to audit and the pass says so rather than marking panels.
  node scripts/shoot.mjs "$URL" "$size" "v-$size-audit" --direct \
    --probe "(() => { document.body.classList.add('auditing'); return new Promise(r => setTimeout(() => r('auditing'), 400)); })()"
done

echo "── mid-sweep: nothing painted before its beat ──────"
for at in 700 1200 1800; do
  node scripts/shoot.mjs "$URL" 1024x580 "v-sweep-$at" --at "$at"
done

echo "── the other four tabs, unaffected? ───────────────"
for tab in exec analytics-performance performance-by-segment trend; do
  node scripts/shoot.mjs "index.html#$tab" 1024x580 "v-tab-$tab"
done
