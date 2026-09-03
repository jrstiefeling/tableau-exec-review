/* Chart registry.
 *
 * A portlet's `kind` in data/board.json selects its renderer, so changing how
 * a metric is drawn is a one-word edit in the data file. Every renderer takes
 * the same shape — mount(host, ctx) returning { build, prime, settle } —
 * which is what lets the choreographer drive a dozen different chart forms
 * without knowing anything about any of them.
 *
 * growth.js is imported by three of these and is deliberately not registered:
 * it carries the shared symlog scale, not a renderer. */

/* mixBar went with mix-acv, the exec tab's Embedded-against-Agentic alluvial,
 * which acv-sources replaced with five motions over six quarters. It stayed
 * imported and registered here after its last caller went, and its 311 lines
 * of stylesheet stayed served: no board portlet has had kind "mixBar" since
 * 7911102. The design docs that discuss it still say "Current:
 * src/charts/mixBar.js" — they are a record of what was decided when it was
 * current, and are left alone. */

/* growthLanes replaced metricMatrix, which was deleted with it. The module had
 * exactly one caller — q3-outlook's hero — and the Segment tab's seg-matrix,
 * which older notes name as a second caller, renders through growthMatrix.
 *
 * seg-matrix has since moved off growthMatrix onto segmentSlope. growthMatrix
 * stays: perf-hierarchy on the Product tab is still a caller and still needs
 * the full seven-row matrix, so the Segment tab forked rather than retiring
 * it. */

import { mount as attainment } from "./attainment.js";
import { mount as acvSources } from "./acvSources.js";
import { mount as statTile } from "./statTile.js";
import { mount as cardRail } from "./cardRail.js";
import { mount as trendPanel } from "./trendPanel.js";
import { mount as driverRail } from "./driverRail.js";
import { mount as rulesCard } from "./rulesCard.js";
import { mount as movementFan } from "./movementFan.js";
import { mount as growthMatrix } from "./growthMatrix.js";
import { mount as segmentSlope } from "./segmentSlope.js";
import { mount as groupMovement } from "./groupMovement.js";
import { mount as growthLanes } from "./growthLanes.js";
import { mount as benchmarkAxis } from "./benchmarkAxis.js";
import { mount as dealRail } from "./dealRail.js";

export const CHARTS = {
  attainment,
  acvSources,
  statTile,
  cardRail,
  trendPanel,
  driverRail,
  rulesCard,
  movementFan,
  growthMatrix,
  segmentSlope,
  groupMovement,
  growthLanes,
  benchmarkAxis,
  dealRail
};

export function chartFor(kind) {
  return CHARTS[kind] || null;
}
