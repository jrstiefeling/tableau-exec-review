#!/usr/bin/env bash
# Screenshot a page, and — when the url names a tab — assert that the tab which
# actually rendered is the tab that was asked for.
#
#   ./shoot.sh <out.png> <width> <height> [url-path]
#
# The assertion is not paranoia. The router falls back to the exec tab for any
# hash it does not recognise, silently and without erroring, so a wrong or
# mangled tab id screenshots a tab you never touched and passes. That happened
# twice on this repo: once to another agent verifying against invented short
# ids (#/perf, #/seg, #/q3, none of which exist), and once here, when this
# script's own cache-buster was appended after the fragment and turned
# `#performance-by-segment` into `#performance-by-segment?v=1756...`.
#
# The real ids are: exec, analytics-performance, performance-by-segment,
# q3-outlook, trend.
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
HOST="http://localhost:8899"
OUT="${1:?out.png}"
W="${2:-940}"
H="${3:-420}"
PATH_="${4:-/docs/mockups/spread/final/preview.html}"

# The cache-buster goes after any existing query and BEFORE the fragment, or it
# is swallowed into the value of the last parameter — or into the tab id.
FRAG=""
BASE="$PATH_"
case "$BASE" in *\#*) FRAG="#${BASE#*\#}"; BASE="${BASE%%\#*}";; esac
case "$BASE" in *\?*) SEP="&";; *) SEP="?";; esac
URL="${HOST}${BASE}${SEP}v=$(date +%s)-$$${FRAG}"

"$CHROME" --headless --disable-gpu \
  --force-device-scale-factor=2 \
  --window-size="${W},${H}" \
  --virtual-time-budget=4000 \
  --screenshot="$OUT" \
  "$URL" 2>&1 | grep -iE "^[0-9]+ bytes" || true

echo "  -> $OUT  ($(stat -f%z "$OUT") bytes, ${W}x${H})"

# Assert on the rendered tab, not on the url. tabs.js marks the live panel with
# .is-active, so the check is against what the router actually settled on.
WANT="${FRAG#\#}"
if [ -n "$WANT" ]; then
  GOT="$("$CHROME" --headless --disable-gpu --window-size="${W},${H}" \
    --virtual-time-budget=4000 --dump-dom "$URL" 2>/dev/null \
    | python3 -c "
import re, sys
h = sys.stdin.read()
m = re.findall(r'<section class=\"panel([^\"]*)\"[^>]*data-tab=\"([^\"]+)\"', h)
live = [tab for cls, tab in m if 'is-active' in cls]
print(live[0] if live else 'NONE')
")"
  if [ "$GOT" = "$WANT" ]; then
    echo "     tab asserted: $GOT"
  else
    echo "     !! TAB MISMATCH: asked for '$WANT', rendered '$GOT' — shot is of the wrong tab" >&2
    exit 3
  fi
fi
