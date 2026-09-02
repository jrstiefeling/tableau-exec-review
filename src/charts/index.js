/* Chart registry.
 *
 * A portlet's `kind` in data/board.json selects its renderer, so changing how
 * a metric is drawn is a one-word edit in the data file. Every renderer takes
 * the same shape — mount(host, ctx) returning { build(signal) } — which is
 * what lets the choreographer drive sixteen different charts without knowing
 * anything about any of them. */

import { mount as gauge } from "./gauge.js";
import { mount as mixBar } from "./mixBar.js";
import { mount as statTile } from "./statTile.js";
import { mount as cardRail } from "./cardRail.js";
import { mount as trendPanel } from "./trendPanel.js";
import { mount as driverRail } from "./driverRail.js";
import { mount as rulesCard } from "./rulesCard.js";

export const CHARTS = { gauge, mixBar, statTile, cardRail, trendPanel, driverRail, rulesCard };

export function chartFor(kind) {
  return CHARTS[kind] || null;
}
