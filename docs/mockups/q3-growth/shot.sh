#!/bin/bash
# Renders each standalone mockup at both required viewports with headless Chrome.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p shots
FILES=${1:-"g1-growth-by-motion g2-level-and-direction g3-divergence g3-divergence-direct"}
for f in $FILES; do
  for size in 1024,580 1440,720; do
    w=${size%,*}; h=${size#*,}
    "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
      --window-size="$w,$h" --screenshot="shots/$f-${w}x${h}.png" \
      "file://$PWD/$f.html" 2>/dev/null
    echo "shots/$f-${w}x${h}.png"
  done
done
