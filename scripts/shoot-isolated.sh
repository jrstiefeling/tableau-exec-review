#!/bin/bash
# Shoot this agent's changes without picking up another agent's in-flight edits.
#
# Several agents work this tree at once, and a half-finished module three tabs
# away throws on mount, which aborts the whole board build and makes every
# screenshot of every tab useless. Reverting it is not an option — it is not
# ours. So: a worktree at HEAD, our own changed files copied over it, and the
# harness pointed at that. Their files stay at the last commit, which is the
# last state they were known to work in.
#
# Usage: scripts/shoot-isolated.sh <name> <w>x<h> [--direct] [--probe expr] ...
set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
TREE=/tmp/gln-iso
PORT=8767

# Only the files this agent has touched. Listed rather than derived from
# `git diff --name-only`, which would sweep in whatever else is uncommitted.
MINE=(
  data/board.json
  src/fallback.js
  src/charts/growthLanes.js
  src/charts/benchmarkAxis.js
  src/charts/dealRail.js
  src/charts/index.js
  styles/portlets.css
)

if [ ! -d "$TREE" ]; then
  git worktree add -q --detach "$TREE" HEAD
fi
git -C "$TREE" checkout -q --detach HEAD
git -C "$TREE" reset -q --hard HEAD

for f in "${MINE[@]}"; do
  [ -f "$ROOT/$f" ] && cp "$ROOT/$f" "$TREE/$f"
done
# metricMatrix.js was deleted in our commit; a worktree at an older HEAD would
# still carry it, and a stale module that nothing imports is harmless — but a
# stale one that index.js still imports is not, so mirror the deletion.
[ -f "$ROOT/src/charts/metricMatrix.js" ] || rm -f "$TREE/src/charts/metricMatrix.js"

# Detached from this shell's stdio on purpose. A background server that keeps
# the script's stdout open holds a pipeline downstream of it open too, and the
# whole invocation hangs after the screenshot has already been written.
if ! lsof -ti:$PORT >/dev/null 2>&1; then
  (cd "$TREE" && nohup python3 -m http.server $PORT >/tmp/serve-iso.log 2>&1 </dev/null &)
  sleep 1
fi

NAME="$1"; SIZE="$2"; shift 2
node scripts/shoot.mjs "http://localhost:$PORT/index.html#q3-outlook" "$SIZE" "$NAME" "$@"
