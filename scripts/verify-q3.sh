#!/bin/bash
# The Q3 tab at three widths in all three states.
#
# Runs through shoot-isolated.sh rather than scripts/verify.sh because the tree
# currently carries another agent's half-finished module, which throws on mount
# and aborts the whole board build. See that script for the reasoning.
set -e
cd "$(dirname "$0")/.."

for size in 1440x720 1280x620 1024x580; do
  echo "── $size ──────────────────────────────────────────"
  scripts/shoot-isolated.sh "v-$size-governed" "$size"
  scripts/shoot-isolated.sh "v-$size-direct" "$size" --direct
  # The audit pass is a held key, so it is reached by adding the class the key
  # adds. Holding it only means something in direct mode: in governed mode
  # there is nothing to audit and the pass says so rather than marking panels.
  scripts/shoot-isolated.sh "v-$size-audit" "$size" --direct \
    --probe "(() => { document.body.classList.add('auditing'); return new Promise(r => setTimeout(() => r('auditing'), 400)); })()"
done

echo "── mid-sweep, nothing painted before its beat ──────"
for at in 700 1200 1800; do
  scripts/shoot-isolated.sh "v-sweep-$at" 1024x580 --at "$at"
done
