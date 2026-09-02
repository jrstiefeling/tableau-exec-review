/* The governance layer: how a portlet's authored content becomes either its
 * governed reading or its ungoverned one, and how portlets discover that they
 * are talking about the same measure as each other.
 *
 * Authors write the trusted content once and a directMode block describing
 * only what changes. Nothing in this app is authored twice. */

import { tierColor, tierMeta } from "./palette.js";

export const MODES = { TRUSTED: "trusted", DIRECT: "direct" };

/* Re-exported so callers can reach the governance vocabulary through this
   module without also importing the palette directly. */
export { tierMeta };

/* Deep-merges an override block over a base.
 *
 * Plain objects merge key by key. Arrays merge index-wise when the override is
 * a sparse object keyed by index ({"1": {...}} touches only element 1), and
 * replace outright when the override is itself an array. Everything else is a
 * scalar replacement. That combination is what lets a portlet override a
 * single card in a rail, or swap the whole card list, without the author
 * having to restate the parts that did not change. */
export function applyDirectOverrides(base, overrides) {
  if (overrides === undefined) return base;
  if (overrides === null) return null;

  if (Array.isArray(base)) {
    if (Array.isArray(overrides)) return overrides;
    if (typeof overrides === "object") {
      const next = base.slice();
      Object.entries(overrides).forEach(([key, value]) => {
        const index = Number(key);
        if (Number.isInteger(index) && index >= 0) {
          next[index] = applyDirectOverrides(base[index], value);
        }
      });
      return next;
    }
    return overrides;
  }

  const bothPlainObjects =
    base && typeof base === "object" && !Array.isArray(base) &&
    overrides && typeof overrides === "object" && !Array.isArray(overrides);

  if (bothPlainObjects) {
    const next = { ...base };
    Object.entries(overrides).forEach(([key, value]) => {
      next[key] = applyDirectOverrides(base[key], value);
    });
    return next;
  }

  return overrides;
}

/* The portlet as it should render in the current mode. Charts only ever see
 * the result of this, so no chart needs to know which mode it is in. */
export function effectivePortlet(portlet, mode) {
  if (mode !== MODES.DIRECT || !portlet.directMode) return portlet;
  return {
    ...portlet,
    metrics: applyDirectOverrides(portlet.metrics || {}, portlet.directMode.metrics || {})
  };
}

/* In direct mode a portlet's accent is replaced by its trust tier colour, so
 * the board reads as tiers rather than as a palette. Trusted mode keeps the
 * authored accent, which is what carries the per-portlet identity. */
export function resolveAccent(portlet, mode) {
  if (mode !== MODES.DIRECT || !portlet.directMode) return portlet.accent;
  return tierColor(portlet.directMode.tier);
}

export function tierOf(portlet, mode) {
  if (mode !== MODES.DIRECT) return "green";
  return (portlet.directMode && portlet.directMode.tier) || "yellow";
}

/* The single most concrete "what would be wrong right now" line for a
 * portlet, in the order that puts the most specific statement first. */
export function degradationLine(portlet) {
  const dm = portlet.directMode;
  if (!dm) return "No Knowledge Layer dependency in this portlet.";
  return dm.effect || dm.missing || dm.thesis || "Ungoverned in direct-only mode.";
}

/* ------------------------------ measure graph ----------------------------- */

/* Builds the model behind the knowledge-graph overlay.
 *
 * Two portlets are linked when they resolve to the same certified measure —
 * that is the claim the semantic layer actually makes, and the reason the
 * quarter figure on one tab and the five-year figure on another cannot
 * disagree. Derived measures additionally link to the measures they are
 * computed from, which is how AE Productivity reaches back to both ACV and
 * AE Capacity.
 *
 * Shared lineage sources make a weaker link: two portlets reading the same
 * upstream table are related, but that is a fact about plumbing rather than
 * an agreement about meaning, so they render thinner and unlabelled. */
export function buildMeasureGraph(portlets) {
  const byMeasure = new Map();
  const byLineage = new Map();

  portlets.forEach((portlet) => {
    const s = portlet.semantic || {};
    if (s.measure) {
      if (!byMeasure.has(s.measure)) byMeasure.set(s.measure, []);
      byMeasure.get(s.measure).push(portlet.id);
    }
    (s.lineage || []).forEach((source) => {
      if (!byLineage.has(source)) byLineage.set(source, []);
      byLineage.get(source).push(portlet.id);
    });
  });

  const edges = [];
  const seen = new Set();

  const addEdge = (a, b, kind, label) => {
    if (a === b) return;
    const key = [kind, ...[a, b].sort()].join("|");
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ from: a, to: b, kind, label });
  };

  byMeasure.forEach((ids, measure) => {
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        addEdge(ids[i], ids[j], "measure", measure);
      }
    }
  });

  portlets.forEach((portlet) => {
    const derived = (portlet.semantic || {}).derivedFrom || [];
    derived.forEach((measure) => {
      (byMeasure.get(measure) || []).forEach((otherId) => {
        addEdge(portlet.id, otherId, "derived", measure);
      });
    });
  });

  byLineage.forEach((ids, source) => {
    // A source every portlet touches says nothing useful about any pair of
    // them, so the near-universal ones are left out rather than drawn as a
    // hairball behind the board.
    if (ids.length > 4) return;
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        addEdge(ids[i], ids[j], "lineage", source);
      }
    }
  });

  return {
    edges,
    measures: byMeasure,
    lineage: byLineage
  };
}

/* In direct mode the measure edges are exactly what is gone: without a shared
 * certified definition there is nothing asserting that two portlets mean the
 * same thing. What survives is the plumbing — portlets that happen to read the
 * same table — which is why the graph collapses into islands rather than
 * disappearing outright. */
export function surviveDirectMode(edges) {
  return edges.filter((edge) => edge.kind === "lineage");
}

export function flattenPortlets(tabs) {
  const out = [];
  tabs.forEach((tab) => {
    (tab.bands || []).forEach((band) => {
      (band.portlets || []).forEach((portlet) => {
        out.push({ ...portlet, tabId: tab.id });
      });
    });
  });
  return out;
}

/* ------------------------------ strike markup ----------------------------- */

/* Wraps authored substrings in a strike tinted with their own tier colour, so
 * a struck phrase says why it is struck and not merely that it is. Applied
 * over already-authored HTML by literal replacement, so authors mark a claim
 * as invalidated by quoting it rather than by restructuring the sentence. */
export function applyStrikes(html, strikes) {
  if (!html || !strikes || !strikes.length) return html;
  return strikes.reduce((acc, strike) => {
    if (!strike || !strike.text) return acc;
    const tier = strike.tier || "red";
    return acc.split(strike.text).join(`<s class="strike strike-${tier}">${strike.text}</s>`);
  }, html);
}
