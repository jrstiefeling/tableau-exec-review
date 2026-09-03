/* Authoring pass two: the figures the degraded board shows.
 *
 * Every wrong figure on this board is COMPUTED here from the governed figure
 * it corresponds to, by a multiplier drawn from a documented failure mode.
 * Nothing is transcribed and nothing is invented — the script reads
 * data/board.json, applies the model in INPUTS below, and writes the result
 * back into each portlet's `directMode.metrics`, along with the arithmetic in
 * `shownFrom` so a reader can check it rather than take it.
 *
 * The reason it is a script and not a hand-authored block: the constraint is
 * that no governed figure changes and every degraded one derives from a
 * governed one. A script cannot violate that by accident. A human authoring
 * 200 numbers into JSON can, and did, twice.
 *
 *   node scripts/author-degraded.mjs && node scripts/sync-fallback.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";

/* ------------------------------- the model -------------------------------- */

/* Ten inputs, each grounded in docs/semantic-layer.md or in the source
 * catalogue's record of the real query contracts. Where a figure is a
 * modelled assumption rather than a documented one it says so, and the
 * portlet's `shownFrom` repeats that to the reader. */
const INPUTS = {
  /* §5.6. Amount, Tableau_Amount__c, Analytics_Amount__c and
   * AmountConverted__c all coexist on the raw opportunity and nothing in the
   * schema rules between them. A direct read picks one and lands light. */
  AMOUNT: 0.902,

  /* §5.4. `APM_L120 = 'Other'` is excluded by default whenever the level-1
   * breakout is visible — a business preference held in the model, not a
   * filter anyone writes. Retained, it inflates every figure it touches. */
  OTHER: 1.085,

  /* Three coexisting new-logo tests on the raw object: a hand-maintained Type
   * picklist, a New_Logo__c checkbox, and a first-close-date derivation. The
   * most permissive is the one an agent reaches for, because it is the one
   * that returns rows. */
  NEW_LOGO: 1.867,

  /* §3.1. Row grain is one row per metric per opportunity per user in the
   * reporting hierarchy, and the Forecasting model documents a 3x-10x
   * overcount for a query with no deduplication filter. Low end, being the
   * conservative choice. */
  FAN_OUT: 3,

  /* Attrition actuals land monthly and one month in arrears, with the
   * in-flight month covered by a separate unofficial measure. A direct read
   * finds two of the quarter's three months, or five of a half-year's six,
   * and reports the period as complete. Assumes a flat monthly distribution
   * within the period, which is a modelled input. */
  ARREARS_Q: 2 / 3,
  ARREARS_H: 5 / 6,

  /* The per-deal divergence between the four amount columns is up to 12%
   * (§5.6, and the source catalogue's note that they diverge on product mix
   * and currency rather than uniformly). A product line aggregates many
   * deals, so the divergence partly averages out: 6% at line grain. This is
   * the figure that makes a decomposition fail to close, because the
   * group-level aggregate and the line-level breakdown are two queries and
   * nothing in raw schema forces them onto the same column. */
  LINE_DIVERGENCE: 1.06,

  /* §8. `Historical_*` measures are the average of the same fiscal quarter
   * across PY and PY-1 — "Not last quarter. Not just last year." A direct
   * read reconstructs a benchmark over whatever window it chose, and the
   * nearest thing to hand is the immediately prior quarter. Modelled as a
   * 15% seasonal step between Q2 and the quarter before it. */
  SEASONAL: 0.85,

  /* §10.2. PubSec is an Operating Unit, not a segment; the fourth column is a
   * coalesce the model owner describes as a rule to apply rather than a field
   * to select. Without it, a PubSec account that also carries an Enterprise
   * segment value lands in Enterprise. Modelled at 13% of the PubSec base. */
  PUBSEC_MISCLASS: 0.13,

  /* §5.4. FCST has no Account ID, only `Account_Name129`; the consolidated
   * key is `Global_Combo_Name6`. Raw carries the name, so a re-parented
   * subsidiary reads as two keys. Modelled at 28 of 260 accounts. */
  KEY_SPLITS: 28,

  /* Name-matching product codes to motions, in the absence of any
   * SKU-to-motion dimension, moves this much of the Agentic book into
   * Embedded. Modelled. */
  MOTION_MIGRATION: 2
};

const { AMOUNT, OTHER, NEW_LOGO, FAN_OUT, ARREARS_Q, ARREARS_H,
        LINE_DIVERGENCE, SEASONAL, PUBSEC_MISCLASS, KEY_SPLITS,
        MOTION_MIGRATION } = INPUTS;

/* ------------------------------ formatting -------------------------------- */

/* Formatting has to be copied from the portlet, not chosen here.
 *
 * The whole claim is that a degraded figure is indistinguishable from a
 * governed one, and the fastest way to break that is to print it differently.
 * The three newest renderers set their negatives with a real minus (U+2212)
 * and the older ones with a hyphen; some panels show a tenth and some round to
 * the dollar. A board where every wrong number is the one with the typographic
 * minus in it has given the game away before anybody reads a value.
 *
 * So each portlet's conventions are READ OFF its governed metrics and applied
 * to its degraded ones. */
const r1 = (n) => Math.round(n * 10) / 10;

const conventionsOf = (portlet) => {
  const json = JSON.stringify(portlet.metrics);
  return {
    minus: json.includes("\u2212") ? "\u2212" : "-",
    decimals: /"[^"]*\$[0-9,]+\.[0-9]/.test(json) ? 1 : 0,
    plus: /"\+[$0-9]/.test(json)
  };
};

/* Portlet-wide conventions, for PROSE. `shownFrom` and `wouldYouNotice` quote
 * figures inside sentences, where there is no governed field to copy from, so
 * they fall back to whatever the portlet does most of the time. */
const fmt = (portlet) => {
  const c = conventionsOf(portlet);
  return {
    money: (n, { unit = "M" } = {}) => {
      const d = Math.abs(n) >= 100 ? 0 : c.decimals;
      const v = Math.abs(d ? Math.round(n * 10) / 10 : Math.round(n));
      return `${n < 0 ? c.minus : ""}$${d ? v.toFixed(1) : v.toLocaleString("en-US")}${unit}`;
    },
    pct: (n) => {
      const v = Math.round(n);
      return `${v > 0 && c.plus ? "+" : v < 0 ? c.minus : ""}${Math.abs(v)}%`;
    }
  };
};

/* `like(governedString, n)` — format n the way THIS FIELD is already
 * formatted.
 *
 * Portlet-level conventions are not fine-grained enough: mix-acv prints its
 * total as "$82M" and its prior total as "$113.9M" in the same block, so a
 * per-portlet decimal rule turns $89M into "$89.0M" and the degraded figure
 * becomes the one with the stray tenth on it. The only convention that cannot
 * drift from the panel is the panel's own string for the same field, so that
 * is what gets copied: decimals, minus glyph, leading plus, thousands
 * separator, unit suffix and the space before it. */
const like = (model, n, { signed = false } = {}) => {
  const src = String(model == null ? "" : model);
  const m = src.match(/^([^0-9]*?)([0-9][0-9,]*)(\.([0-9]+))?([^0-9]*)$/);
  if (!m) return src;
  const [, lead, intPart, , frac, tail] = m;
  const decimals = frac ? frac.length : 0;
  /* Group thousands when the model does, and also when the result needs it and
   * the model had no opportunity to say: no governed figure on this board runs
   * to four digits, so pipegen's fanned-out $2,367M has no convention to copy
   * and takes the ordinary one. */
  const grouped = intPart.includes(",") || Math.abs(n) >= 1000;
  const negative = /^[-\u2212]/.test(lead);
  const minus = negative ? lead[0] : (src.includes("\u2212") ? "\u2212" : "-");
  const plus = signed || lead.includes("+");
  const currency = lead.includes("$") ? "$" : "";
  const v = Math.abs(decimals ? Math.round(n * 10 ** decimals) / 10 ** decimals : Math.round(n));
  let body = v.toFixed(decimals);
  if (grouped) {
    const [i, f] = body.split(".");
    body = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (f ? `.${f}` : "");
  }
  const sign = n < 0 ? minus : (n > 0 && plus ? "+" : "");
  return `${sign}${currency}${body}${tail}`;
};

/* Y/Y recomputed against the SAME prior period. The prior does not move: it is
 * the current-period read the failure mode acts on, and holding the denominator
 * still is what makes the recomputation checkable. */
const yoyFrom = (cur, prior) => Math.round(((cur / prior) - 1) * 100);
/* Plan recomputed against the SAME plan base, derived from the governed pair.
 * No plan figure is invented; the base is whatever the governed value and its
 * governed attainment imply. */
const planFrom = (cur, govValue, govPlan) => Math.round(cur / (govValue / govPlan));

/* An array override REPLACES; an object keyed by index MERGES element by
 * element (see applyDirectOverrides). Almost everything here wants the merge —
 * a degraded segment needs its governed label, colour and polarity to survive,
 * and the first pass lost all three by emitting an array, which drew both
 * halves of the mix bar in the same green with no names on them. */
const sparse = (list) => Object.fromEntries(list.map((v, i) => [String(i), v]));

/* ------------------------------- the board -------------------------------- */

const PATH = "data/board.json";
const board = JSON.parse(readFileSync(PATH, "utf8"));
const byId = new Map();
board.tabs.forEach((t) => t.bands.forEach((b) => b.portlets.forEach((p) => byId.set(p.id, p))));

const get = (id) => {
  const p = byId.get(id);
  if (!p) throw new Error(`no portlet ${id}`);
  return p;
};
/* Merges authored keys into a directMode block, leaving the vocabulary keys
 * and the thesis prose that scripts/author-provenance.mjs and the original
 * authors put there. */
const author = (id, block) => Object.assign(get(id).directMode, block);

const touched = [];
const mark = (id) => touched.push(id);

/* ================================ exec ==================================== */

/* The four hero gauges. Each takes one hazard, chosen as the sharpest true
 * risk for that measure rather than by rotation. */

{ /* --- kpi-acv: field ambiguity ---------------------------------------- */
  const m = get("kpi-acv").metrics;
  const { money, pct } = fmt(get("kpi-acv"));
  const value = r1(m.value * AMOUNT);            // 82 -> 74
  const prior = m.value / (1 + m.yoy / 100);     // the same prior quarter
  author("kpi-acv", {
    hazard: "field-ambiguity",
    shownFrom: `Four amount columns coexist on the raw opportunity — Amount, `
      + `Tableau_Amount__c, Analytics_Amount__c, AmountConverted__c — and nothing in the `
      + `schema rules between them. The direct read picks one and lands light: `
      + `$${m.value}M × ${AMOUNT} = ${money(value)}. Y/Y recomputes against the same prior `
      + `quarter (${money(r1(prior))}): ${pct(yoyFrom(value, prior))} rather than ${pct(m.yoy)}. `
      + `Plan recomputes against the same plan base implied by the governed pair: `
      + `${planFrom(value, m.value, m.plan)}% rather than ${m.plan}%.`,
    wouldYouNotice: `No. A ten per cent miss on a measure already ${Math.abs(m.yoy)}% down reads as `
      + `the same bad quarter, and ${planFrom(value, m.value, m.plan)}% of plan is exactly as `
      + `believable as ${m.plan}%. Small enough to survive scrutiny, large enough to change the `
      + `decision. The tile beside it reads this same measure ${OTHER}× HIGH, and in governed mode `
      + `both read $${m.value}M — the cross-tab identity is a thing the layer holds, not a `
      + `coincidence.`,
    certifiedDelta: `${money(r1(value - m.value))} · ${pct(((value / m.value) - 1) * 100)}`,
    layerProvides: "One certified ACV measure, one date anchor, and a mandatory deduplication "
      + "filter — the definition lives in the layer rather than in the question.",
    layerDoesNotProvide: "No ACV target or attainment measure exists in either model; attainment "
      + "exists only for Pipe Gen and Day-1 Open Pipe. The governed plan track is supplemented too.",
    metrics: {
      value, display: like(m.display, value),
      yoy: yoyFrom(value, prior), yoyDisplay: like(m.yoyDisplay, yoyFrom(value, prior)),
      plan: planFrom(value, m.value, m.plan),
      planDisplay: like(m.planDisplay, planFrom(value, m.value, m.plan)),
      caption: "One of four amount columns, and nothing ruling between them"
    }
  });
  mark("kpi-acv");
}

{ /* --- kpi-attrition: partial period, and the best beat on the board ---- */
  const m = get("kpi-attrition").metrics;
  const { money, pct } = fmt(get("kpi-attrition"));
  const value = r1(m.value * ARREARS_Q);         // 75 -> 50
  const prior = m.value / (1 + m.yoy / 100);
  const plan = planFrom(value, m.value, m.plan); // 104 -> 69
  author("kpi-attrition", {
    hazard: "point-in-time",
    shownFrom: `Attrition actuals land monthly and one month in arrears, with the in-flight `
      + `month covered by a separate unofficial measure. A direct read finds two of the `
      + `quarter's three months and reports the quarter as complete: $${m.value}M × 2/3 = `
      + `${money(value)}. Against the same plan base that is ${plan}% rather than ${m.plan}%; `
      + `against the same prior year (${money(r1(prior))}), ${pct(yoyFrom(value, prior))} rather `
      + `than ${pct(m.yoy)}. The one-month lag is documented; the flat monthly distribution `
      + `inside the quarter is a modelled input.`,
    wouldYouNotice: `No, and worse — you would not want to. Lower is better on this measure, so `
      + `${plan}% of plan puts the card in the positive band and it washes GREEN. The governed `
      + `card is over plan on churn and reads as the miss it is. The degraded card reports the `
      + `best churn quarter in three years, in the same green as a win. Nobody audits good news.`,
    certifiedDelta: `${money(r1(value - m.value))} · ${m.plan}% → ${plan}% of plan`,
    layerProvides: "A named measure for landed actuals and a separate named measure for the "
      + "in-flight month, so a query can distinguish a complete period from a partial one.",
    layerDoesNotProvide: "The layer names the two measures; it does not stop a query summing them, "
      + "nor presenting a partial quarter as a whole one. It does not declare polarity either — "
      + "that lower is better here is a property of the board, not of the model.",
    metrics: {
      value, display: like(m.display, value),
      yoy: yoyFrom(value, prior), yoyDisplay: like(m.yoyDisplay, yoyFrom(value, prior)),
      plan, planDisplay: like(m.planDisplay, plan),
      caption: "Best churn quarter in three years, on two thirds of one"
    }
  });
  mark("kpi-attrition");
}

{ /* --- kpi-pipegen: fan-out, and the one that cancels ------------------- */
  const m = get("kpi-pipegen").metrics;
  const { money, pct } = fmt(get("kpi-pipegen"));
  const value = Math.round(m.value * FAN_OUT);   // 789 -> 2367
  author("kpi-pipegen", {
    hazard: "fan-out",
    shownFrom: `The row grain is one row per metric per opportunity per user in the reporting `
      + `hierarchy, and the Forecasting model documents a 3×–10× overcount for a query with no `
      + `deduplication filter. At the low end: $${m.value}M × ${FAN_OUT} = ${money(value)}. `
      + `The Y/Y is UNCHANGED at ${pct(m.yoy)}, because a multiplier applied to both years `
      + `cancels in the rate. The plan track goes void: pipegen targets live in a CTE inside `
      + `the extract, not in the raw source, so there is no denominator to recompute against.`,
    wouldYouNotice: `Yes, on the level — ${money(value)} is out of range for this business unit and `
      + `a magnitude check finds it. No, on the rate. The figure that survives is the growth rate, `
      + `and the figure that fails is the one nobody re-derives. This is the clearest of the four `
      + `catchable tiles, and its job is to show that catchability is the exception: it is `
      + `catchable because the error is 200%, not because the board is watching.`,
    certifiedDelta: `×${FAN_OUT} · the depth of the hierarchy`,
    layerProvides: "A mandatory deduplication filter, and the only two governed target measures "
      + "on this board — pipegen attainment and Day-1 open pipe, by product and by source.",
    layerDoesNotProvide: null,
    metrics: {
      value, display: like(m.display, value),
      /* Y/Y untouched, and that is the point. */
      plan: null, planDisplay: "No target in source",
      caption: `Rate holds at ${pct(m.yoy)}; level is ${FAN_OUT}× the hierarchy`
    }
  });
  mark("kpi-pipegen");
}

{ /* --- kpi-nnaov: field ambiguity on the new-logo test ------------------ */
  const m = get("kpi-nnaov").metrics;
  const { money, pct } = fmt(get("kpi-nnaov"));
  const value = r1(m.value * NEW_LOGO);          // 6 -> 11.2
  const prior = m.value / (1 + m.yoy / 100);
  const plan = planFrom(value, m.value, m.plan);
  author("kpi-nnaov", {
    hazard: "field-ambiguity",
    shownFrom: `Three new-logo tests coexist on the raw object and nothing rules between them — a `
      + `hand-maintained Type picklist, a New_Logo__c checkbox, and a first-close-date `
      + `derivation. The direct read takes the most permissive: $${m.value}M × ${NEW_LOGO} = `
      + `${money(value)}. Plan recomputes against the same plan base: ${plan}% rather than `
      + `${m.plan}%. Y/Y against the same prior quarter (${money(r1(prior))}): `
      + `${pct(yoyFrom(value, prior))} rather than ${pct(m.yoy)}.`,
    wouldYouNotice: `No. It is still the worst attainment on the board and still a steep decline, `
      + `so every check anyone applies to it passes. It is simply ${Math.round(((value / m.value) - 1) * 100)}% `
      + `less bad than the truth, which on the one measure the business is trying to turn around `
      + `is the difference between "act now" and "watch it".`,
    certifiedDelta: `+${money(r1(value - m.value))} · +${pct(((value / m.value) - 1) * 100)}`,
    layerProvides: "A governed commit measure with a declared grain, so the net-new figure "
      + "resolves to one definition rather than three.",
    layerDoesNotProvide: "The layer holds this only as a commit, not as a booked actual, and "
      + "there is no target measure for it — the governed plan track is supplemented as well.",
    metrics: {
      value, display: like(m.display, value),
      yoy: yoyFrom(value, prior), yoyDisplay: like(m.yoyDisplay, yoyFrom(value, prior)),
      plan, planDisplay: like(m.planDisplay, plan),
      caption: "The most permissive of three new-logo tests"
    }
  });
  mark("kpi-nnaov");
}

{ /* --- mix-acv: two absent conventions, and the picture does not move --- */
  const m = get("mix-acv").metrics;
  const { money, pct } = fmt(get("mix-acv"));
  const total = Math.round(m.total * OTHER);                       // 82 -> 89
  const priorTotal = r1(m.priorTotal * OTHER);                     // 113.89 -> 123.6
  const emb = m.segments.find((s) => s.id === "embedded");
  const agn = m.segments.find((s) => s.id === "agentic");
  const embV = Math.round(emb.value * OTHER + MOTION_MIGRATION);   // 24 -> 28
  const agnV = Math.round(agn.value * OTHER - MOTION_MIGRATION);   // 58 -> 61
  const embP = r1(emb.priorValue * OTHER);
  const agnP = r1(agn.priorValue * OTHER);
  const share = Math.round((embV / total) * 100);
  const priorShare = Math.round((embP / priorTotal) * 100);
  author("mix-acv", {
    hazard: "exclusion-convention",
    shownFrom: `Two conventions the layer applies whether or not you ask are absent. First, `
      + `APM_L120 = 'Other' is excluded by default when the level-1 breakout is visible; `
      + `retained, it inflates every figure by 8.5% — $${m.total}M × ${OTHER} = ${money(total)}. `
      + `Second, there is no SKU-to-motion dimension in raw product codes, so the split is `
      + `recovered by name-matching, which moves $${MOTION_MIGRATION}M of Agentic codes into `
      + `Embedded. Embedded: $${emb.value}M × ${OTHER} + $${MOTION_MIGRATION}M = ${money(embV)}. `
      + `Agentic: $${agn.value}M × ${OTHER} − $${MOTION_MIGRATION}M = ${money(agnV)}. They still `
      + `sum to ${money(total)}, so the one check anyone runs passes. Share reads ${share}% `
      + `rather than ${Math.round((emb.value / m.total) * 100)}%.`,
    wouldYouNotice: `No, and this is the tile the whole design rests on. The ribbon, the column `
      + `widths, the direction of the story and the shape of the mark are identical to the `
      + `governed version. Only the numbers moved, and they moved in the flattering direction: `
      + `Embedded's share of the book reads two points better and the total reads seven million `
      + `dollars bigger.`,
    certifiedDelta: `+${money(total - m.total)} total · +${share - Math.round((emb.value / m.total) * 100)}pt share`,
    layerProvides: "One certified ACV measure, and the APM product hierarchy with its "
      + "default 'Other' exclusion held as a business preference in the model rather than in "
      + "each author's query.",
    layerDoesNotProvide: "No product-motion dimension exists. The Embedded-versus-Agentic "
      + "grouping is not governed in either model — the closest governed grouping is APM_L120 "
      + "family and APM_L218 sub-product, and Tableau Next and Tableau Server are both L2 "
      + "values, so even the governed grouping needs OR-matching across two levels.",
    metrics: {
      total, totalDisplay: like(m.totalDisplay, total),
      priorTotal, priorTotalDisplay: like(m.priorTotalDisplay, priorTotal),
      /* Sparse, so each segment keeps its governed label, detail, colour and
       * polarity: the degraded ribbon has to be the same ribbon. */
      segments: sparse([
        { value: embV, display: like(emb.display, embV),
          yoy: yoyFrom(embV, embP), yoyDisplay: like(emb.yoyDisplay, yoyFrom(embV, embP)),
          priorValue: embP, priorDisplay: like(emb.priorDisplay, embP) },
        { value: agnV, display: like(agn.display, agnV),
          yoy: yoyFrom(agnV, agnP), yoyDisplay: like(agn.yoyDisplay, yoyFrom(agnV, agnP)),
          priorValue: agnP, priorDisplay: like(agn.priorDisplay, agnP) }
      ]),
      insight: `<strong>${share}% of Q2 ACV, up from ${priorShare}%</strong> — Embedded's ribbon `
        + `widens into the narrower column. It grew ${like(emb.priorDisplay, embP)} to `
        + `${like(emb.display, embV)} while Agentic fell ${like(agn.priorDisplay, agnP)} to `
        + `${like(agn.display, agnV)}.`,
      caption: `${like(m.priorTotalDisplay, priorTotal)} → ${like(m.totalDisplay, total)} `
        + `· retaining a line the business excludes`
    }
  });
  mark("mix-acv");
}

{ /* --- acv-account-fan: conformed identity ------------------------------ */
  const m = get("acv-account-fan").metrics;
  const { money, pct } = fmt(get("acv-account-fan"));
  /* No counts are authored here. The renderer re-derives the group counts and
   * the headline share from the lines as it draws them, because the re-basing
   * artifact moves individual accounts across the flat line and an authored
   * count would disagree with the picture beside it. What IS authored is the
   * roll-up, which carries the same 'Other' inflation as the tile above. */
  const govTotal = 82;
  const govPriorTotal = 113.89;
  const total = govTotal * OTHER;
  const priorTotal = govPriorTotal * OTHER;
  author("acv-account-fan", {
    hazard: "conformed-identity",
    shownFrom: `Raw carries an account name, not the consolidated combo key the layer resolves `
      + `to — the Forecasting model has no Account ID at all, only a name, and the other model `
      + `has the ID. So a re-parented subsidiary arrives as two keys: one full non-renewal `
      + `beside one phantom expansion. Modelled by moving accounts within ${KEY_SPLITS} index `
      + `points of the flat line out to the extremes, which is where a split baseline lands. `
      + `The expanded and contracted counts and the headline share are then re-derived from the `
      + `lines as drawn, so the caption cannot disagree with the picture. The roll-up carries `
      + `the same 8.5% 'Other' inflation as the tile above it: ${money(total)} against `
      + `${money(priorTotal)}.`,
    wouldYouNotice: `No. The fan still draws, the density curve keeps the same shape, and the `
      + `concentration story reads BETTER than the truth — more expanders, a shallower middle. `
      + `Nothing in a picture of shape reveals a population that has been redistributed, `
      + `because the shape is what the picture is about and the shape is fine.`,
    certifiedDelta: "same population, redistributed · the expanded share reads high",
    layerProvides: "A consolidated account key — Global_Combo_Name6 — and a prior-year read "
      + "through the relative-year dimension rather than through a separate snapshot, so both "
      + "sides of the comparison are the same population.",
    layerDoesNotProvide: "Nothing here overclaims: the caveat in the availability table is a "
      + "query-construction rule — pick one model, and ask for the full result set rather than "
      + "a top-N — not a missing definition.",
    metrics: {
      totalDisplay: like(m.totalDisplay, total),
      priorTotalDisplay: like(m.priorTotalDisplay, priorTotal),
      /* The headline, the group counts and the two label sub-lines are all
       * re-derived by the renderer from the drawn lines. Only the prose that
       * does NOT state a count is authored. */
      insight: "Accounts whose baseline was re-parented after the quarter closed land at the "
        + "extremes rather than near the flat line, so the base looks more polarised than it "
        + "is: more full expansions, more full non-renewals, and a shape that still reads as a "
        + "concentration story.",
      caption: "Renewable accounts keyed on name · re-parented baselines land at the extremes"
    }
  });
  mark("acv-account-fan");
}

/* ========================= analytics-performance ========================== */

{ /* --- perf-hierarchy: the roll-up closes, with a line that should not --- */
  const m = get("perf-hierarchy").metrics;
  const { money, pct } = fmt(get("perf-hierarchy"));
  const scale = (v) => Math.round(v * OTHER);
  /* Every level scales together, so every Y/Y is unchanged — both sides of
   * each rate carry the same inflation and it cancels. Which is the point:
   * the rates are all correct and the partition has an extra line in it. */
  const rows = sparse(m.rows.map((row) => {
    const value = scale(row.value);
    return { value, display: like(row.display, value) };
  }));
  const total = scale(m.rollup.total);
  author("perf-hierarchy", {
    hazard: "exclusion-convention",
    shownFrom: `The layer excludes APM_L120 = 'Other' by default whenever the level-1 breakout `
      + `is visible. Retained, every level inflates 8.5%: $${m.rollup.total}M × ${OTHER} = `
      + `${money(total)} at the top, and each child scales with it. Every level still sums `
      + `exactly to the level above, so an additivity check passes. The Y/Y figures do not move, `
      + `because both sides of each rate carry the same inflation and it cancels.`,
    wouldYouNotice: `No, because the check you would run is the one that passes. The roll-up `
      + `closes by construction whether or not 'Other' belongs in the partition, so additivity `
      + `confirms a hierarchy with an extra ${money(total - m.rollup.total)} in it. Every growth `
      + `rate on the panel is correct, which is the most convincing part of the lie.`,
    certifiedDelta: `+${money(total - m.rollup.total)} at every level · rates unchanged`,
    layerProvides: "A published additivity classification — the measure catalogue is physically "
      + "organised into additive and do-not-sum sections — and the 'Other' exclusion as a "
      + "business preference held in the model.",
    layerDoesNotProvide: "The motion hierarchy itself. There is no product-motion dimension in "
      + "either model; the three levels here are the deck's grouping, not the layer's.",
    metrics: {
      stakeMax: total,
      rollup: { total, totalDisplay: like(m.rollup.totalDisplay, total),
        note: "Three levels of one measure, and a fourth line the business does not recognise. "
          + "The partition still closes — that is the problem." },
      rows,
      caption: "The roll-up closes, and one of its lines should not exist"
    }
  });
  mark("perf-hierarchy");
}

/* The two dollar-movement panels. Both decompose a certified ADDITIVE measure,
 * and additivity is a published structural property of the catalogue (§7.1) —
 * which is exactly what guarantees the lines sum to the net.
 *
 * In direct mode the net and the lines are two queries. The group aggregate
 * uses the reporting column; the line-level breakdown uses another, running 6%
 * high. Nothing in raw schema forces them onto the same one. So the wings —
 * drawn from the parts — overshoot the net label by 6%, and the panel's own
 * detailNote puts the rounding tolerance at $0.1M. Six per cent of the
 * platform motion is $2.4M, twenty-four times that tolerance.
 *
 * This is why both panels are CATCHABLE, and they are the only two that earn
 * it structurally rather than by magnitude: a decomposition that does not
 * close is a self-evident failure, visible without knowing the right answer. */
const movementPanel = (id, grounding) => {
  const m = get(id).metrics;
  const { money } = fmt(get(id));
  /* This panel states its own precision — every figure shown to $0.1M — and
   * that stated tolerance is what makes its failure to close checkable, so it
   * prints the tenth even when it is zero. */
  const money1 = (n) => money(n, { decimals: 1 });
  const rows = sparse(m.rows.map((row) => ({
    parts: sparse(row.parts.map((q) => {
      const delta = r1(q.delta * LINE_DIVERGENCE);
      const value = r1(q.value * LINE_DIVERGENCE);
      /* Values print as the panel prints them; deltas and priors print the
       * tenth, matching the governed block field for field. */
      return { value, valueDisplay: like(q.valueDisplay, value),
               delta, deltaDisplay: like(q.deltaDisplay, delta),
               priorValue: r1(value - delta), priorDisplay: like(q.priorDisplay, r1(value - delta)) };
    })),
    lossWing: r1(row.lossWing * LINE_DIVERGENCE),
    gainWing: r1(row.gainWing * LINE_DIVERGENCE)
    /* `net` and `netDisplay` deliberately absent from the override: the group
     * aggregate is the governed figure and does not move. The gap between the
     * printed net and where the wings end IS the failure. */
  })));
  const worst = m.rows.reduce((a, row) =>
    Math.abs(row.net) > Math.abs(a.net) ? row : a, m.rows[0]);
  const gap = r1(Math.abs(worst.net) * (LINE_DIVERGENCE - 1));
  const smallest = m.rows.reduce((a, row) =>
    Math.abs(row.net) < Math.abs(a.net) ? row : a, m.rows[0]);
  author(id, {
    hazard: "decomposition-closure",
    shownFrom: `The group total and the line breakdown are two queries against four coexisting `
      + `amount columns, and nothing in raw schema forces them onto the same one. The `
      + `line-level read runs 6% high — half the up-to-12% per-deal divergence, because a `
      + `product line aggregates many deals and it partly averages out — while each net is the `
      + `governed group aggregate and does not move. So every wing overshoots its own net by `
      + `6%: ${worst.fullLabel || worst.label} draws to ${money1(worst.net * LINE_DIVERGENCE)} `
      + `against a printed net of ${worst.netDisplay}, a ${money(gap)} gap. ${grounding}`,
    wouldYouNotice: `Yes, and this is the one panel that gives itself away without anybody `
      + `knowing the right answer. The panel states its own tolerance: figures are shown to `
      + `$0.1M, so two rounded lines need not add to their rounded net by more than that. `
      + `${money1(gap)} is ${Math.round(gap / 0.1)}× the tolerance. Add the lines and they do not `
      + `make the net — and because the gap is a fixed 6%, it is invisible on the largest group `
      + `and glaring on the smallest: ${Math.round(Math.abs(gap / worst.net) * 100)}% of `
      + `${worst.fullLabel || worst.label}, but the same proportion of a much smaller number on `
      + `${smallest.fullLabel || smallest.label}, which is where the growth story lives.`,
    certifiedDelta: `lines +6% · nets unchanged · every decomposition fails to close`,
    layerProvides: "A published additivity classification. The catalogue is physically organised "
      + "into additive and do-not-sum sections, and this measure is in the additive one — which "
      + "is what licenses a decomposition to be taken at all.",
    layerDoesNotProvide: "The grouping the decomposition is taken within. That is the deck's, "
      + "not the layer's.",
    metrics: { rows,
      detailNote: m.detailNote.replace(
        "so two rounded lines need not add to their rounded net.",
        "so two rounded lines need not add to their rounded net by more than $0.1M. Every net "
        + "here misses by considerably more than that, because the lines and the net came from "
        + "different amount columns."),
      caption: `Every wing overshoots its own net by 6%. The decomposition does not close.` }
  });
  mark(id);
};
movementPanel("perf-divergence",
  "The motion parentage is name-matched from product codes, there being no SKU-to-motion "
  + "dimension in either model, so the two motions are the deck's grouping rather than the "
  + "layer's.");
movementPanel("seg-spread",
  "The four segments are a coalesce the model owner describes as a rule to apply rather than a "
  + "field to select, so each decomposition is taken over a population nothing versions.");

/* ========================= performance-by-segment ========================= */

{ /* --- seg-matrix: definition drift, and the total does not move -------- */
  const m = get("seg-matrix").metrics;
  const { money, pct } = fmt(get("seg-matrix"));
  const iEntr = m.segments.findIndex((x) => x.id === "entr");
  const iPub = m.segments.findIndex((x) => x.id === "pubsec");
  /* One rule, applied to every row: 13% of each row's PubSec dollars are
   * accounts that also carry an Enterprise segment value, and without the
   * coalesce they land in Enterprise. Nothing else moves, so every row total
   * is identical to the governed one — which is why the check passes. */
  const rows = m.rows.map((row) => {
    const values = row.values.slice();
    const shift = r1(values[iPub] * PUBSEC_MISCLASS);
    values[iPub] = r1(values[iPub] - shift);
    values[iEntr] = r1(values[iEntr] + shift);
    const yoy = row.yoy.map((g, i) => {
      if (i !== iPub && i !== iEntr) return g;
      const prior = row.values[i] / (1 + g / 100);
      return yoyFrom(values[i], prior);
    });
    return { values, display: values.map((v, i) => like(row.display[i], v)),
             yoy, yoyDisplay: yoy.map((v, i) => like(row.yoyDisplay[i], v)), _shift: shift };
  });
  const top = rows[0];
  const govTop = m.rows[0];
  const flipped = top.yoy[iPub] <= 0 && govTop.yoy[iPub] > 0;
  author("seg-matrix", {
    hazard: "definition-drift",
    shownFrom: `Public Sector is not a segment; it is an Operating Unit, and the fourth column `
      + `is a coalesce the model owner describes as a rule to apply rather than a field to `
      + `select. Without it, a PubSec account that also carries an Enterprise segment value `
      + `lands in Enterprise. Modelled at ${Math.round(PUBSEC_MISCLASS * 100)}% of each row's `
      + `PubSec dollars: at the top level ${money(top._shift)} moves, so PubSec reads `
      + `${top.display[iPub]} rather than ${govTop.display[iPub]} and Enterprise `
      + `${top.display[iEntr]} rather than ${govTop.display[iEntr]}. Y/Y recomputes against the `
      + `same priors: PubSec ${pct(top.yoy[iPub])} rather than ${govTop.yoyDisplay[iPub]}, `
      + `Enterprise ${pct(top.yoy[iEntr])} rather than ${govTop.yoyDisplay[iEntr]}. Every row `
      + `total is unchanged, because the dollars moved sideways.`,
    wouldYouNotice: `No, twice over. Every row total is identical, so the one check anyone runs `
      + `passes. And the effect${flipped ? " is to take the only growing column on the board to "
        + pct(top.yoy[iPub]) + ", which reads as bad news rather than as an error"
        : " lands on the only growing column on the board"}. Bad news gets believed.`,
    certifiedDelta: `${money(top._shift)} between two columns · every total unchanged`,
    layerProvides: "Segment10 as a governed dimension, resolved as of the period close.",
    layerDoesNotProvide: "The four-way split itself. PubSec is an Operating Unit, and the "
      + "derived dimension that coalesces it with Segment10 is the model owner's own expression "
      + "for a definition that does not exist in the model yet.",
    metrics: {
      rows: sparse(rows.map(({ values, display, yoy, yoyDisplay }) =>
        ({ values, display, yoy, yoyDisplay }))),
      axisNote: "Y/Y on a stated scale, over four columns assembled from three sources",
      caption: `Every total is unchanged. ${money(top._shift)} moved between two columns.`
    }
  });
  mark("seg-matrix");
}

/* =============================== q3-outlook =============================== */

{ /* --- outlook-matrix: the same three hazards as the exec cards --------- */
  const m = get("outlook-matrix").metrics;
  const { money, pct } = fmt(get("outlook-matrix"));
  /* Each column takes the hazard of its own measure, so the Q3 tab and the exec
   * tab agree with each other while both being wrong. Consistency of the lie
   * is itself the finding: two tabs reconciling is not evidence of either. */
  const HAZARD = { acv: AMOUNT, attrition: ARREARS_Q, nnaov: NEW_LOGO };
  const rows = sparse(m.rows.map((row) => ({
    cells: sparse(row.cells.map((cell) => {
      const k = cell.id.split("-").pop();
      const mult = HAZARD[k];
      const value = r1(cell.value * mult);
      const prior = cell.value / (1 + cell.yoy / 100);
      const out = { value, display: like(cell.display, value),
        yoy: yoyFrom(value, prior), yoyDisplay: like(cell.yoyDisplay, yoyFrom(value, prior)) };
      /* The plan channel goes, and only the plan channel. No FinPlan object
       * exists in either model, and a gap derived from a contested numerator
       * against one of three plan vintages would be three different gaps
       * stated as one. */
      if (cell.plan != null) { out.plan = null; out.planDisplay = "no plan basis"; }
      if (cell.altBasis) out.altBasis = null;
      return out;
    }))
  })));
  author("outlook-matrix", {
    hazard: "mixed",
    shownFrom: `Each column inherits the hazard of its own measure, at the same multipliers the `
      + `exec cards use: ACV × ${AMOUNT} for the four coexisting amount columns, attrition × 2/3 `
      + `for the month of arrears, NNAOV × ${NEW_LOGO} for the most permissive new-logo test. `
      + `Analytics ACV reads ${money(r1(105 * AMOUNT))} rather than $105M. The plan channel `
      + `drops entirely rather than rendering against a candidate: FinPlan lives in the planning `
      + `system at OU and product-family grain, is re-versioned at every reforecast, and reaches `
      + `neither model — the only governed targets are pipegen and Day-1 open pipe. The `
      + `alternative-basis figures go with it, there being nothing left to arbitrate between.`,
    wouldYouNotice: `No, and the way you would fail to notice is instructive: this tab now `
      + `AGREES with the exec tab, cell for cell, because both applied the same wrong `
      + `multiplier to the same measure. Two surfaces reconciling is the check most people run, `
      + `and it passes. What it demonstrates is that consistency is not correctness — the layer `
      + `is what makes cross-tab agreement mean something.`,
    certifiedDelta: "every cell moved · every plan track gone · the two tabs still agree",
    layerProvides: "Three certified measures with declared grains and date anchors, and the "
      + "additivity classification that lets the three rows tile each other.",
    layerDoesNotProvide: "Any plan basis for these three measures, and no FinPlan object of any "
      + "kind. Attainment exists only for pipegen and Day-1 open pipe.",
    metrics: { rows,
      axisNote: "Y/Y on a stated scale — with no plan to read attainment against",
      caption: "Every cell agrees with the exec tab. Both are wrong by the same multiplier." }
  });
  mark("outlook-matrix");
}

{ /* --- outlook-benchmark: the ratio survives, the comparison does not --- */
  const m = get("outlook-benchmark").metrics;
  const { money, pct } = fmt(get("outlook-benchmark"));
  const rows = sparse(m.rows.map((row) => {
    const readings = {};
    Object.entries(row.readings || {}).forEach(([k, v]) => {
      /* The reading itself does not move. Coverage is open pipe over commit and
       * velocity is a pace — both ratios, and a multiplier applied to the raw
       * amounts cancels in a ratio exactly as it does in pipegen's Y/Y. */
      const hist = k === "coverage" ? r1(v.hist * SEASONAL) : Math.round(v.hist * SEASONAL);
      const d = r1(v.value - hist);
      /* Both strings copy the governed field and then say "prior qtr" instead
       * of "hist", because that is the honest label for what a direct read
       * actually returned — and because the panel's own caption has to stop
       * claiming a two-year window it no longer has. */
      readings[k] = {
        hist,
        histDisplay: like(v.histDisplay, hist).replace(" hist", " prior qtr"),
        deltaDisplay: like(v.deltaDisplay, d, { signed: true }).replace(" vs hist", " vs prior qtr")
      };
    });
    return { readings };
  }));
  author("outlook-benchmark", {
    hazard: "unstated-window",
    shownFrom: `The readings do not move: coverage is open pipe over commit and velocity is a `
      + `pace, and a multiplier applied to the raw amounts cancels in a ratio, exactly as it `
      + `does in pipegen's Y/Y. What moves is the benchmark. The governed Historical_* measures `
      + `are the average of the same fiscal quarter across the prior two fiscal years, and the `
      + `documents are emphatic that this is "not last quarter, not just last year". A direct `
      + `read has no such measure and reconstructs the nearest thing to hand, the immediately `
      + `prior quarter, modelled as a 15% seasonal step: platform coverage's benchmark reads `
      + `${r1(2.7 * SEASONAL)}× rather than 2.7×. The mark keeps its ring and the ring moves.`,
    wouldYouNotice: `No, and the consequence is a sign flip on the only question the panel is `
      + `asked. Platform coverage against the governed benchmark is ${pct(-3.7)} — flat, `
      + `sufficient-but-not-improving. Against a prior-quarter benchmark it reads clearly above, `
      + `so a pipeline that is merely holding station reads as one that is building. Both `
      + `numbers are 2.6 against something beginning with 2.`,
    certifiedDelta: "readings unchanged · every benchmark moved · two of three comparisons flip sign",
    layerProvides: "Coverage_clc and Historical_Coverage_clc, Specialist_V_clc and "
      + "Historical_Velocity_clc — the reading and its comparison as a matched pair, with the "
      + "window declared as part of the measure rather than chosen per query.",
    layerDoesNotProvide: "Nothing withheld here. This is the most fully governed portlet on the "
      + "board, which is why it is the clearest demonstration: what raw source loses is not the "
      + "number but the thing the number is compared against.",
    metrics: { rows,
      caption: "Hollow marks the prior quarter — no measure says which window a benchmark is over." }
  });
  mark("outlook-benchmark");
}

{ /* --- outlook-deals: the list survives, the order does not ------------- */
  const m = get("outlook-deals").metrics;
  const { money, pct } = fmt(get("outlook-deals"));
  /* Per-deal divergence, not a uniform multiplier: the four amount columns
   * differ per deal on product mix and currency, so the error does not cancel
   * the way a single multiplier would. Modelled at up to 12% per deal, applied
   * as a fixed per-deal offset so the reorder is reproducible. */
  const SWING = { bofa: 1.0, aetna: 1.0, schwab: 1.0, usbank: 1.12, usgov: 0.9 };
  /* A full array rather than a sparse merge, and deliberately: this is the one
   * panel where the ORDER is the wrong thing, so an index-wise merge would put
   * US Bank's amount under Charles Schwab's name. Every field the renderer
   * reads is supplied. */
  const deals = m.deals.map((d) => {
    const value = r1(d.value * SWING[d.id]);
    return { id: d.id, account: d.account, value, display: like(d.display, value) };
  }).sort((a, b) => b.value - a.value);
  const total = r1(deals.reduce((s, d) => s + d.value, 0));
  author("outlook-deals", {
    hazard: "field-ambiguity",
    shownFrom: `The four candidate amount columns differ per deal rather than uniformly, because `
      + `they diverge on product mix and currency — so the error does not cancel the way a `
      + `single multiplier would. Modelled at up to 12% per deal: US Bank $2.1M → `
      + `${money(2.1 * 1.12)} and US GOV $2.1M → ${money(2.1 * 0.9)}, which lifts US Bank above `
      + `Charles Schwab. Third and fifth place swap. The total moves $12.5M → ${money(total)}, `
      + `inside any plausibility check. The gap they were laid along goes too, being derived `
      + `from an attainment with no denominator, so the rail falls back to the authored total `
      + `as its scale.`,
    wouldYouNotice: `No. The total is within one per cent, all five accounts are present, and `
      + `the rail gives no indication that the ordering is the fragile part. An executive `
      + `briefed on this top five is briefed on a different top five from the one the certified `
      + `measure produces, and the two briefings are indistinguishable.`,
    certifiedDelta: `+${money(r1(total - 12.5))} total · two of five reorder`,
    layerProvides: "One certified ACV measure applied across all five, and a stated ranking "
      + "rule — order by the metric, nulls last, limited in the utterance.",
    layerDoesNotProvide: "The gap the rail is laid along. It derives from the plan attainment, "
      + "and no plan basis for ACV exists in either model.",
    metrics: { deals, totalDisplay: like(m.totalDisplay, total),
      caption: "Ranked on whichever amount column the query reached for" }
  });
  mark("outlook-deals");
}

/* ================================= trend ================================== */

/* Only three years of data exist — CY is FY27, PY is FY26, PY-1 is FY25 — and
 * §8 is explicit that an absolute date filter on FY23 or FY24 returns no rows.
 * So the first two points of every series are SUPPLEMENTED in both modes and do
 * not move, and the last three are certified in governed mode and inferred in
 * direct. The error lands entirely on the seam, which is the most interesting
 * thing about this tab: mixed sourcing does not degrade evenly. */
const SUPPLEMENTED_YEARS = 2;

/* Y/Y on these panels is NOT uniformly point-over-point, and getting that
 * wrong is the easiest way to invent a figure here.
 *
 * Points 1 to 3 compare against the point before them, which is on the panel:
 * 608/623 is the authored −2%, 551/608 the authored −9%. Point 4 does not —
 * FY27 H1's authored −23% against FY26's $496M would be −70%, because the
 * comparison is H1 against the PRIOR H1, which is not drawn. So the prior H1 is
 * recovered from the authored pair, `series[4] / (1 + yoy[4])`, and never
 * invented.
 *
 * Which then decides whether the rate moves at all:
 *   points 1-3  recomputed from the direct series. A pair of inferred points
 *               shares a multiplier and the rate is unchanged; the pair that
 *               straddles the seam does not, and that is where the error goes.
 *   point 4     unchanged when its prior H1 is inferred too, because the
 *               multiplier cancels. It moves only where the failure mode is
 *               specific to the in-flight period, which is attrition's arrears
 *               and nothing else. */
const trendYoY = (m, series, pct, { priorH1Multiplier = null } = {}) =>
  series.map((v, i) => {
    if (i === 0) return pct(parseFloat(m.yoy[0]));
    if (i < series.length - 1) return pct(yoyFrom(v, series[i - 1]));
    if (priorH1Multiplier === null) return pct(parseFloat(m.yoy[i]));
    const priorH1 = m.series[i] / (1 + parseFloat(m.yoy[i]) / 100);
    return pct(yoyFrom(v, priorH1 * priorH1Multiplier));
  });

/* Governed panels print $623 M and $11 M — no tenths. A degraded point that
 * arrived at 20.5 must print the same way the panel prints everything else, or
 * the formatting becomes the tell. */
const trendDisplay = (m, series) => {
  const unit = (m.display[0].match(/[A-Z]$/) || ["M"])[0];
  const decimals = m.display.some((d) => d.includes(".")) ? 1 : 0;
  return series.map((v, i) => i < SUPPLEMENTED_YEARS
    ? m.display[i]
    : `$${v.toFixed(decimals)} ${unit}`);
};

const trendPanel = (id, mult, opts = {}) => {
  const m = get(id).metrics;
  const { pct } = fmt(get(id));
  const series = m.series.map((v, i) => i < SUPPLEMENTED_YEARS ? v : r1(v * mult));
  const display = trendDisplay(m, series);
  const out = {
    series, display,
    yoy: trendYoY(m, series, pct, opts),
    pointProvenance: series.map((_, i) => i < SUPPLEMENTED_YEARS ? "supplemented" : "inferred")
  };
  /* The headline is the last COMPLETE year, which is the panel's own choice —
   * read off the governed metrics rather than re-decided here. */
  if (m.headline) out.headline = display[m.display.indexOf(m.headline)] || display[3];
  if (m.runRate != null) {
    const unit = (m.display[0].match(/[A-Z]$/) || ["M"])[0];
    out.runRate = Math.round(m.runRate * mult);
    out.runRateDisplay = `$${out.runRate} ${unit}`;
  }
  return { m, out, series };
};

{ /* --- trend-acv: the seam ---------------------------------------------- */
  const { m, out } = trendPanel("trend-acv", AMOUNT);
  author("trend-acv", {
    hazard: "field-ambiguity",
    shownFrom: `The layer holds three years of ACV and no more, confirmed by the model owner, so `
      + `FY23 and FY24 are supplemented in BOTH modes and do not move. The three certified years `
      + `inherit the four-column ambiguity at × ${AMOUNT}: ${m.display[2]} → ${out.display[2]}, `
      + `${m.display[3]} → ${out.display[3]}, ${m.display[4]} → ${out.display[4]}. FY26's Y/Y is `
      + `unchanged at ${m.yoy[3]}, because both of its points moved together. FY25's goes from `
      + `${m.yoy[2]} to ${out.yoy[2]}, because it compares an inferred point against a `
      + `supplemented one. Mixing the two tiers puts the entire error on the boundary year.`,
    wouldYouNotice: `No. On a series already declining, one steeper year reads as the story `
      + `rather than as an artefact — and it is the year the eye goes to, because it is where `
      + `the decline appears to accelerate. The acceleration is the seam between two sourcing `
      + `tiers, and it is the only place on the whole board where you can see mixed sourcing `
      + `doing damage.`,
    certifiedDelta: "three of five points moved · the error concentrates on the boundary year",
    layerProvides: "One certified ACV measure that resolves identically here and on the exec "
      + "tab, and a governed relative-year dimension for the three years it holds.",
    layerDoesNotProvide: "Two of these five years. Only three exist — an absolute date filter "
      + "for FY23 or FY24 returns no rows — so the first two points are supplemented in "
      + "governed mode too, and the panel says so in both.",
    metrics: { ...out, caption: "The error lands on the seam, where inferred years meet supplemented ones" }
  });
  mark("trend-acv");
}

{ /* --- trend-attrition: one point, and it is the one that matters ------- */
  const m = get("trend-attrition").metrics;
  const { money, pct } = fmt(get("trend-attrition"));
  /* Only the in-flight point carries the arrears hazard. The four closed years
   * do not take a multiplier: a direct reconstruction of them from history
   * objects lands differently on every run, which is a variance rather than a
   * bias, and no single multiplier would be honest about it.
   *
   * And this is the one panel whose last rate genuinely moves. Its prior H1 is
   * a CLOSED half-year with complete actuals, so it does not inherit the
   * arrears factor — the multiplier does not cancel, and the comparison is
   * five months against six. */
  const series = m.series.map((v, i) => i === 4 ? r1(v * ARREARS_H) : v);
  const display = trendDisplay(m, series).map((d, i) =>
    i < 4 ? m.display[i] : d);
  const yoy = trendYoY(m, series, pct, { priorH1Multiplier: 1 });
  const priorH1 = r1(m.series[4] / (1 + parseFloat(m.yoy[4]) / 100));
  author("trend-attrition", {
    hazard: "point-in-time",
    shownFrom: `Only the in-flight point carries the arrears hazard: actuals land a month `
      + `behind, so a direct read of FY27 H1 finds five of six months and reports the half-year `
      + `as complete. ${m.display[4]} × 5/6 = ${display[4]}. Its comparison is the prior H1, `
      + `recovered from the authored pair at $${priorH1}M — a closed half-year, so it does not `
      + `inherit the arrears factor and the multiplier does not cancel: the rate goes from `
      + `${m.yoy[4]} to ${yoy[4]}. The four closed years do not move, because reconstructing `
      + `them from history objects lands differently on every run, which is a variance rather `
      + `than a bias. FY23 and FY24 are supplemented in both modes.`,
    wouldYouNotice: `No. Four of five points are identical to the governed panel, so the series `
      + `looks verified — and a series that mostly matches is more persuasive than one that `
      + `matches entirely, because it looks as though it has been checked. The fifth point is `
      + `the first improvement in five years, and it is the only one that moved.`,
    certifiedDelta: `one of five points moved · ${m.yoy[4]} becomes ${yoy[4]}`,
    layerProvides: "A named measure for landed actuals and a separate one for the in-flight "
      + "month, so a query can tell a complete period from a partial one.",
    layerDoesNotProvide: "Two of these five years, and any bar on summing the two attrition "
      + "measures together.",
    metrics: { series, display, yoy,
      pointProvenance: ["supplemented", "supplemented", "inferred", "inferred", "inferred"],
      runRate: Math.round(m.runRate * ARREARS_H),
      runRateDisplay: `$${Math.round(m.runRate * ARREARS_H)} M`,
      caption: "One point moved, and it is the one the panel is about" }
  });
  mark("trend-attrition");
}

{ /* --- trend-nnaov: the shape breaks ------------------------------------ */
  const { m, out } = trendPanel("trend-nnaov", NEW_LOGO);
  author("trend-nnaov", {
    hazard: "field-ambiguity",
    shownFrom: `The three years the layer covers inherit the permissive new-logo test at `
      + `× ${NEW_LOGO} — ${m.display[2]} → ${out.display[2]}, ${m.display[3]} → `
      + `${out.display[3]}, ${m.display[4]} → ${out.display[4]} — while FY23 and FY24 are `
      + `supplemented and do not move. The result is that FY25 (${out.display[2]}) now sits `
      + `ABOVE FY23 (${m.display[0]}), so a monotonic five-year decline becomes a rise and then `
      + `a fall, and FY25's Y/Y flips sign from ${m.yoy[2]} to ${out.yoy[2]}.`,
    wouldYouNotice: `Yes, and not from any figure — every value is individually plausible. From `
      + `the SHAPE. A five-year decline that turns upward in the middle is visibly wrong against `
      + `the two points either side of it, and those two are the supplemented ones that did not `
      + `move. The panel is caught by its own control group.`,
    certifiedDelta: "three of five points moved · the trend reverses direction mid-series",
    layerProvides: "A governed commit measure with a declared grain and one new-logo definition "
      + "rather than three.",
    layerDoesNotProvide: "Two of these five years, and the polarity that says a rise here is "
      + "good news — neither model declares direction-of-good on any measure.",
    metrics: { ...out, caption: "FY25 now sits above FY23 — the shape broke at the seam" }
  });
  mark("trend-nnaov");
}

{ /* --- trend-ae-productivity: a ratio hides its numerator's error ------- */
  const { m, out } = trendPanel("trend-ae-productivity", AMOUNT);
  author("trend-ae-productivity", {
    hazard: "grain",
    shownFrom: `The numerator inherits the ACV field ambiguity on the three years the layer `
      + `covers: ${m.display[2]} → ${out.display[2]}, ${m.display[3]} → ${out.display[3]}, `
      + `${m.display[4]} → ${out.display[4]}, and the H1 run-rate follows. FY23 and FY24 do not `
      + `move, their numerator having been supplemented already. The denominator does not move `
      + `in either mode — there is no governed headcount to withdraw.`,
    wouldYouNotice: `No. Every point still declines, the H1 run-rate is still below every full `
      + `year shown, and the caption still reads true. A ratio hides an error in its numerator `
      + `better than the numerator does, because the reader is checking a trend and the trend is `
      + `intact.`,
    certifiedDelta: "three of five points moved · every conclusion unchanged",
    layerProvides: "The numerator, as a certified measure, for three of the five years.",
    layerDoesNotProvide: "The denominator, and therefore the measure. No AE capacity or "
      + "productivity measure exists in either model — the model owner names productivity "
      + "specifically. Both are supplemented from the User Hierarchy table.",
    metrics: { ...out, caption: "An inferred numerator over a denominator no layer has" }
  });
  mark("trend-ae-productivity");
}

/* The four panels with no measure at all keep their governed figures in both
 * modes, and that is the whole point of them: they are the control group. What
 * they gain in direct mode is a statement of what supplementing costs. */
const supplementedPanel = (id, from, cost, notMoved) => {
  author(id, {
    hazard: "none",
    shownFrom: null,
    /* Emptied rather than left alone. These blocks carried degraded copy from
     * an earlier design — hc-ae's caption still said "no prior-year count to
     * subtract from" — and a panel in the control group has to render byte for
     * byte the same in both modes or it is not a control. An empty object
     * merges to no change; null would wipe the metrics entirely. */
    metrics: {},
    supplementedFrom: from,
    supplementCost: cost,
    wouldYouNotice: `Nothing to notice. ${notMoved} This panel does not move when the toggle `
      + `flips, because it never went through the layer and there is no guarantee to withdraw. `
      + `Four panels on this board behave this way, and they are the control group: what moved `
      + `is what the layer was protecting.`,
    /* Deliberately null, not "unchanged".
     *
     * The audit pass lays a certified figure beside each moved one. These four
     * have no certified figure for it to lay — AE capacity, AOV and revenue
     * have no measure in either model at all (§10.1, confirmed by the model
     * owner) — so "unchanged" would imply a comparison that was made and came
     * back equal. Nothing was compared. The portlet renders the honest version
     * instead: "no certified figure exists to compare", in amber rather than
     * green, which is the difference between "the layer was protecting this
     * and now it is not" and "the layer was never here." */
    certifiedDelta: null,
    layerProvides: null,
    layerDoesNotProvide: null
  });
  mark(id);
};
supplementedPanel("hc-ae",
  "The User Hierarchy table, refreshed weekly, reconciled by hand against the FinPlan breakout.",
  "No additivity guarantee, so a sum across two branches of the hierarchy may double-count a "
  + "shared AE. No enforced as-of rule, so the count restates when a territory changes. No "
  + "lineage, so nothing connects the figure to the quarter it was taken in.",
  "The figure is the same in both modes.");
supplementedPanel("trend-ae-capacity",
  "The same weekly User Hierarchy extract as the exec tile, held as a five-year series in a "
  + "maintained sheet.",
  "No enforced date anchor across the five points, so a year that was counted as-of a different "
  + "week is not comparable with the others, and nothing says which weeks they were.",
  "All five points are the same in both modes.");
supplementedPanel("trend-aov",
  "A Snowflake balance on the active order book, queried directly. AOV is not merely absent from "
  + "the two models — it is excluded from both in writing, and the Forecasting model instructs "
  + "the agent to say so if asked.",
  "No additivity classification, which matters more here than anywhere: this is a stock, not a "
  + "flow, and nothing enforces that it is never summed across periods. No versioning of the "
  + "definition, so what counts as an active order this quarter may differ next quarter.",
  "All five points are the same in both modes, and legitimately so — a direct Snowflake read is "
  + "a real way to get a real number onto a board.");
supplementedPanel("trend-revenue",
  "A finance-maintained sheet, downstream of the accounting treatment change documented for FY27.",
  "No lineage to the treatment change, so the FY27 discontinuity is visible in the series and "
  + "unexplained by it. No enforced grain, so nothing prevents a revenue figure being compared "
  + "with an ACV figure as though they were the same kind of thing.",
  "All five points are the same in both modes.");

/* The narrative portlets carry no figure, so there is nothing to compute. They
 * keep whatever their authors wrote. Listed rather than skipped so the count
 * at the end is a real check. */
["going-well", "h2-focus", "perf-rules", "seg-rules", "drivers", "trend-rules"].forEach(mark);

/* ------------------------------- write out -------------------------------- */

const missing = [...byId.keys()].filter((id) => !touched.includes(id));
if (missing.length) throw new Error(`no degraded authoring for: ${missing.join(", ")}`);

/* The audit line has a box, and the box is about 215px wide inside a KPI card
 * at the 1024 floor — two lines of roughly 42 characters.
 *
 * Some of these were authored as prose, because the interesting thing about a
 * moved figure is usually not its delta but what the delta does to the
 * reading. Attrition does not merely fall $25M; it reads 35 points better than
 * it is and lands on the good side of plan rather than the bad. True, and
 * three lines long, and it spilled out of the card and over the chart below.
 *
 * So the badge keeps the arithmetic and the provenance flip keeps the
 * argument: every clause trimmed here already exists in `wouldYouNotice`, one
 * click away on the same portlet, with room for a paragraph. Trimming whole
 * segments rather than characters means a delta is never cut mid-number. */
const BADGE_CHARS = 44;
let trimmed = 0;
byId.forEach((p) => {
  const dm = p.directMode;
  if (!dm || !dm.certifiedDelta) return;
  const parts = String(dm.certifiedDelta).split(" · ");
  let out = parts[0];
  for (const part of parts.slice(1)) {
    if (`${out} · ${part}`.length > BADGE_CHARS) break;
    out = `${out} · ${part}`;
  }
  if (out !== dm.certifiedDelta) trimmed += 1;
  dm.certifiedDelta = out;
});
console.log(`audit lines: ${trimmed} trimmed to <= ${BADGE_CHARS} chars`);

writeFileSync(PATH, `${JSON.stringify(board, null, 2)}\n`);
console.log(`authored ${touched.length} portlets`);
console.log("model inputs:", Object.entries(INPUTS)
  .map(([k, v]) => `${k}=${typeof v === "number" ? r1(v * 1000) / 1000 : v}`).join("  "));
