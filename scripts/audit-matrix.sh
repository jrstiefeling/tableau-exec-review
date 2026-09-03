#!/bin/bash
# The whole board, from scratch: five tabs x three widths x three states.
#
# scripts/verify.sh and scripts/verify-q3.sh are each narrowed to the tab that
# was under change at the time. This is the full grid, which is what a
# verification pass that trusts no prior sign-off needs. It does not stop on a
# failing frame — a layout finding is evidence, not a reason to abandon the
# sweep — but it counts routing failures separately and reports them at the
# end, because a frame of the wrong tab is not evidence at all.
cd "$(dirname "$0")/.."

lsof -ti:8765 >/dev/null 2>&1 || {
  (nohup python3 -m http.server 8765 >/tmp/serve.log 2>&1 </dev/null &)
  sleep 1
}

# Named tabs, or all five. Taking a tab list matters for the context budget:
# the sweep is run and read one tab at a time, and fixes are committed per tab
# rather than held to the end.
if [ "$#" -gt 0 ]; then
  TABS=("$@")
else
  TABS=(exec analytics-performance performance-by-segment q3-outlook trend)
fi
SIZES=(1440x720 1280x620 1024x580)
ROUTING=0

for tab in "${TABS[@]}"; do
  for size in "${SIZES[@]}"; do
    echo "══ $tab · $size ═══════════════════════════════════"
    node scripts/shoot.mjs "index.html#$tab" "$size" "m-$tab-$size-governed" \
      || ROUTING=$((ROUTING + 1))
    node scripts/shoot.mjs "index.html#$tab" "$size" "m-$tab-$size-direct" --direct \
      || ROUTING=$((ROUTING + 1))
    # The audit pass is a held key, so it is reached by adding the class the
    # key adds. It only means anything in direct mode.
    node scripts/shoot.mjs "index.html#$tab" "$size" "m-$tab-$size-audit" --direct \
      --probe "(() => { document.body.classList.add('auditing'); return new Promise(r => setTimeout(() => r('auditing'), 400)); })()" \
      || ROUTING=$((ROUTING + 1))
  done
done

echo
echo "══ routing failures: $ROUTING ═══════════════════════"
