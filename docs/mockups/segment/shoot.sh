#!/usr/bin/env bash
# Renders the standalone segment mockups at the required viewports.
#
# The mockups are ES modules, so they need an origin — file:// fails CORS and
# renders an empty page. Serve the repo root first:
#   python3 -m http.server 8791 --bind 127.0.0.1
#
#   bash docs/mockups/segment/shoot.sh                 # all, 1024x580
#   bash docs/mockups/segment/shoot.sh alt-a-decide    # one file, 1024x580
#   bash docs/mockups/segment/shoot.sh alt-c-slope 1440 720
#
# Writes PNGs into ./shots. Nothing here touches the running board.
set -euo pipefail
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://127.0.0.1:8791/docs/mockups/segment"
mkdir -p shots

FILES=${1:-"alt-a-decide alt-b-multi alt-c-slope"}
W=${2:-1024}
H=${3:-580}

for f in $FILES; do
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 \
    --window-size="${W},${H}" \
    --virtual-time-budget=6000 \
    --screenshot="shots/${f}-${W}x${H}.png" \
    "${BASE}/${f}.html" >/dev/null 2>&1
  echo "shots/${f}-${W}x${H}.png"
done
