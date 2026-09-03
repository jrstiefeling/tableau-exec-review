#!/usr/bin/env bash
# Screenshot the standalone mockups at the two verified viewports.
#
# Serve the repo root first:  python3 -m http.server 8777 --bind 127.0.0.1
# Then:                       bash docs/mockups/spread/shoot.sh
#
# Writes PNGs beside the HTML. Nothing here touches the running board.
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://127.0.0.1:8777/docs/mockups/spread"
OUT="$(cd "$(dirname "$0")" && pwd)"

shoot() {
  local page="$1" w="$2" h="$3"
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 \
    --window-size="${w},${h}" \
    --virtual-time-budget=5000 \
    --screenshot="${OUT}/${page}-${w}x${h}.png" \
    "${BASE}/${page}.html" >/dev/null 2>&1
  echo "  ${page}-${w}x${h}.png"
}

for alt in a b c; do
  for tab in segment product; do
    shoot "alt-${alt}-${tab}" 1024 580
    shoot "alt-${alt}-${tab}" 1440 720
  done
done
echo "done"
