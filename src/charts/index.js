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

import { mount as attainment } from "./attainment.js";
import { mount as mixBar } from "./mixBar.js";
import { mount as statTile } from "./statTile.js";
import { mount as cardRail } from "./cardRail.js";
import { mount as trendPanel } from "./trendPanel.js";
import { mount as driverRail } from "./driverRail.js";
import { mount as rulesCard } from "./rulesCard.js";
import { mount as movementFan } from "./movementFan.js";
import { mount as growthMatrix } from "./growthMatrix.js";
import { mount as growthSpread } from "./growthSpread.js";
import { mount as metricMatrix } from "./metricMatrix.js";
import { mount as benchmarkAxis } from "./benchmarkAxis.js";
import { mount as dealRail } from "./dealRail.js";

export const CHARTS = {
  attainment,
  mixBar,
  statTile,
  cardRail,
  trendPanel,
  driverRail,
  rulesCard,
  movementFan,
  growthMatrix,
  growthSpread,
  metricMatrix,
  benchmarkAxis,
  dealRail
};

export function chartFor(kind) {
  return CHARTS[kind] || null;
}
