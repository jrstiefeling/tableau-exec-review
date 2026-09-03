#!/usr/bin/env node
/* Replaces the exec tab's `mix-acv` with `acv-sources` — "Where does ACV come
 * from", six quarters of five sales motions as dollars and as share.
 *
 *   node scripts/author-acv-sources.mjs        # writes
 *   node scripts/author-acv-sources.mjs --dry  # prints the tables, writes nothing
 *
 * WHY THIS IS A SCRIPT
 *
 * The portlet's two panels have to agree: the composition strip's shares are
 * the line panel's dollars divided by the quarter total, and if they disagree
 * by even a point the portlet is drawing two different books and calling them
 * one. So the DOLLARS are authored and the SHARES are derived, never the other
 * way round, and every quarter's five motions are asserted to sum to the
 * quarter total before anything is written. A share panel authored by hand
 * beside a dollar panel authored by hand is two chances to be wrong.
 *
 * WHERE THE FIGURES COME FROM, AND WHERE THEY DO NOT
 *
 * The source is one slide, and the slide does not close. Its line panel labels
 * six values — 51.4, 69.6, 63.4, 102.5, then 40.5, 64.8 — and its stacked
 * panel labels four of five shares per quarter. Read the labelled line as the
 * quarter TOTAL (which is how the brief reads it) and the FY27 Q2 column
 * closes exactly on all three of the slide's own claims. Read it as Expansion:
 * Cloud & Server instead and FY27 Q2's claims break by a factor of two, while
 * FY26 Q2's shares start working. Both readings cannot be right, and the slide
 * offers no third.
 *
 * So: labelled line = total, per the brief. That fixes the six totals and, at
 * FY27 Q2, four of the five motions:
 *
 *   Expansion: Cloud & Server    58.0% of total   the slide's own claim
 *   New Customer: Cloud & Server $10.0M           the slide's own claim
 *   New Customer: CRMA & Next    $6.0M            the slide's own claim
 *   Cloud Migration              $4.5M            the slide's own claim
 *   Expansion: CRMA & Next       the residual     never labelled anywhere
 *
 * and "down 75% year over year" fixes a fifth figure a year earlier: Cloud
 * Migration at FY26 Q2 must be $18.0M, which is a value the slide prints. That
 * agreement between an explicit claim and an unrelated label is the strongest
 * evidence available that the total reading is the right one.
 *
 * Everything else — the four FY26 quarters and FY27 Q1, motion by motion — is
 * INFERRED. The slide's share labels for those quarters cannot be used,
 * because they contradict the $18.0M / $4.5M pair the 75% claim depends on:
 * 18.0 is 26% of 69.6 and the slide's FY26 Q2 column has no 26% band in it.
 * Given a choice between an explicit written claim and an unlabelled band in a
 * screenshot, the claim wins. The inferred quarters are shaped to the trends
 * the slide asserts in words — Cloud & Server expansion holding 58-63%, the
 * migration motion falling away, both new-customer motions growing — and
 * nothing else about them should be relied on. */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const boardPath = resolve(root, "data/board.json");
const dry = process.argv.includes("--dry");

/* ------------------------------- the vocabulary --------------------------- */

/* Stack order is bottom-to-top, which is the slide's legend read upwards, and
 * it is deliberate: the dominant motion sits on the baseline so its share is
 * measured from a straight edge rather than from a wobbling one. A 58% band
 * floating in the middle of a stack is not a band anybody can read. */
const MOTIONS = [
  { id: "exp-cs", label: "Expansion: Cloud & Server", short: "Exp C&S", color: "#4C6E9C" },
  { id: "exp-crma", label: "Expansion: CRMA & Next", short: "Exp CRMA", color: "#9DBBD8" },
  { id: "migration", label: "Cloud Migration", color: "#D8A93C", short: "Migration" },
  { id: "nc-cs", label: "New Customer: Cloud & Server", short: "NC C&S", color: "#8DC079" },
  { id: "nc-crma", label: "New Customer: CRMA & Next", short: "NC CRMA", color: "#2F7A55" }
];

const QUARTERS = [
  { id: "fy26q1", year: "FY 2026", q: "Q1", total: 51.4 },
  { id: "fy26q2", year: "FY 2026", q: "Q2", total: 69.6 },
  { id: "fy26q3", year: "FY 2026", q: "Q3", total: 63.4 },
  { id: "fy26q4", year: "FY 2026", q: "Q4", total: 102.5 },
  { id: "fy27q1", year: "FY 2027", q: "Q1", total: 40.5 },
  { id: "fy27q2", year: "FY 2027", q: "Q2", total: 64.8 }
];

/* Dollars in $M, authored to $0.1M, in MOTIONS order. Every row is asserted
 * against its quarter total below — the assertion is the point of authoring
 * dollars rather than shares. */
const DOLLARS = {
  //          exp-cs  exp-crma  migration  nc-cs  nc-crma
  fy26q1: [32.4, 0.9, 10.3, 5.2, 2.6],
  fy26q2: [40.4, 2.2, 18.0, 6.0, 3.0],
  fy26q3: [37.4, 2.9, 14.2, 5.8, 3.1],
  fy26q4: [61.5, 5.1, 12.5, 15.4, 8.0],
  fy27q1: [25.5, 3.2, 5.6, 4.2, 2.0],
  fy27q2: [37.6, 6.7, 4.5, 10.0, 6.0]
};

/* Which figures are claims and which are inference, recorded per quarter so
 * the portlet can say so rather than leaving it in a commit message. */
const SOURCED = {
  fy26q2: ["migration"],
  fy26q4: ["total"],
  fy27q2: ["total", "exp-cs", "migration", "nc-cs", "nc-crma"]
};

/* -------------------------------- primitives ------------------------------ */

const r1 = (v) => Math.round(v * 10) / 10;
const m = (v) => `$${r1(v).toFixed(1)}M`;

/* Shares to one decimal by largest remainder, so each quarter sums to exactly
 * 100.0 and the strip cannot show a sliver of unexplained white. Straight
 * rounding leaves FY27 Q2 at 99.9. */
function sharesOf(values, total) {
  const exact = values.map((v) => (v / total) * 1000);
  const floors = exact.map(Math.floor);
  let short = 1000 - floors.reduce((a, n) => a + n, 0);
  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  const out = floors.slice();
  for (let k = 0; short > 0; k += 1, short -= 1) out[order[k % order.length].i] += 1;
  return out.map((n) => n / 10);
}

/* ------------------------------ the two panels ---------------------------- */

const quarters = QUARTERS.map((q) => {
  const values = DOLLARS[q.id];
  const sum = r1(values.reduce((a, v) => a + v, 0));
  if (sum !== r1(q.total)) {
    throw new Error(`${q.id}: motions sum to ${sum}, total is ${q.total} — the two panels would disagree`);
  }
  const shares = sharesOf(values, q.total);
  const shareSum = r1(shares.reduce((a, v) => a + v, 0));
  if (shareSum !== 100) throw new Error(`${q.id}: shares sum to ${shareSum}`);
  return {
    id: q.id,
    year: q.year,
    q: q.q,
    label: `${q.year.replace("FY ", "FY")} ${q.q}`,
    total: r1(q.total),
    totalDisplay: m(q.total),
    values: values.map(r1),
    displays: values.map(m),
    shares,
    shareDisplays: shares.map((s) => `${s.toFixed(1)}%`),
    sourced: SOURCED[q.id] || []
  };
});

const last = quarters[quarters.length - 1];
const priorYearSame = quarters[1]; // FY26 Q2, the same fiscal quarter a year before
const idx = (id) => MOTIONS.findIndex((x) => x.id === id);

/* The three claims, checked rather than asserted. If a figure is edited above
 * and a claim stops being true, the script refuses to write it. */
const claims = [
  {
    id: "expansion-led",
    text: `Expansion of installed customers is ${(
      ((last.values[idx("exp-cs")] + last.values[idx("exp-crma")]) / last.total) *
      100
    ).toFixed(0)}% of ACV, and Cloud & Server expansion alone is ${last.shares[idx("exp-cs")].toFixed(
      0
    )}% of total — the largest contributor in all six quarters.`,
    check: () =>
      last.shares[idx("exp-cs")] === 58 &&
      quarters.every((qq) => Math.max(...qq.values) === qq.values[idx("exp-cs")])
  },
  {
    id: "migration-slowing",
    text: `Cloud Migration is slowing significantly — ${m(last.values[idx("migration")])} against ${m(
      priorYearSame.values[idx("migration")]
    )} in the same quarter a year ago, down ${Math.abs(
      Math.round(
        (last.values[idx("migration")] / priorYearSame.values[idx("migration")] - 1) * 100
      )
    )}% year over year.`,
    check: () =>
      Math.round(
        (last.values[idx("migration")] / priorYearSame.values[idx("migration")] - 1) * 100
      ) === -75
  },
  {
    id: "new-customer-mix",
    text: `New-customer ACV is still driven largely by Cloud & Server — ${m(
      last.values[idx("nc-cs")]
    )} against ${m(last.values[idx("nc-crma")])} for CRMA & Next.`,
    check: () => last.values[idx("nc-cs")] === 10 && last.values[idx("nc-crma")] === 6
  }
];

claims.forEach((c) => {
  if (!c.check()) throw new Error(`claim "${c.id}" is no longer true of the authored figures`);
});

/* Year-over-year per motion, same fiscal quarter, computed rather than typed. */
const yoy = MOTIONS.map((mo, i) => {
  const now = last.values[i];
  const then = priorYearSame.values[i];
  const pct = Math.round((now / then - 1) * 100);
  return { id: mo.id, pct, display: `${pct > 0 ? "+" : ""}${pct}% Y/Y` };
});

const fy26 = quarters.filter((q) => q.year === "FY 2026");
const fy27 = quarters.filter((q) => q.year === "FY 2027");
const fy26Total = r1(fy26.reduce((a, q) => a + q.total, 0));
const fy26H1 = r1(fy26[0].total + fy26[1].total);
const fy27H1 = r1(fy27[0].total + fy27[1].total);

/* ---------------------------- the direct-mode read ------------------------ */

/* Two conventions the layer applies whether or not you ask, both inherited
 * from the portlet this replaces and both still exactly as true of a motion
 * series as they were of a two-column mix:
 *
 *   1. APM_L120 = 'Other' is excluded by default when the level-1 breakout is
 *      visible. Retained, every figure inflates by 8.5%.
 *   2. There is no SKU-to-motion dimension, so the five motions are recovered
 *      by name-matching product codes — and "Cloud" matches both the Cloud &
 *      Server expansion codes and the migration SKUs, so $3.0M lands in the
 *      wrong motion in every quarter.
 *
 * The second one is the interesting half, because of WHERE it lands. The total
 * is off by a stated 8.5% and every share still sums to 100, so the two checks
 * anyone runs both pass. What breaks is the portlet's sharpest claim: the
 * migration decline reads -65% rather than -75%, and "slowing significantly"
 * becomes "slowing". */
const OTHER_INFLATION = 1.085;
const MISMATCH = 3.0; // $M moved from exp-cs into migration by name-matching

const directQuarters = quarters.map((q) => {
  const values = q.values.map((v, i) => {
    let out = v * OTHER_INFLATION;
    if (MOTIONS[i].id === "exp-cs") out -= MISMATCH;
    if (MOTIONS[i].id === "migration") out += MISMATCH;
    return r1(out);
  });
  const sum = r1(values.reduce((a, v) => a + v, 0));
  const total = r1(q.total * OTHER_INFLATION);
  /* The 8.5% is authored to the integer and the motions to $0.1M, so the two
   * disagree by at most a dime. It is absorbed into the largest motion rather
   * than left to render as a gap, which is what a name-matched pull would do:
   * nothing in it knows there is a residual to show. */
  if (sum !== total) values[0] = r1(values[0] + (total - sum));
  const shares = sharesOf(values, total);
  return {
    id: q.id,
    total,
    totalDisplay: m(total),
    values,
    displays: values.map(m),
    shares,
    shareDisplays: shares.map((s) => `${s.toFixed(1)}%`)
  };
});

const dLast = directQuarters[directQuarters.length - 1];
const dPrior = directQuarters[1];
const dMigrationYoy = Math.round(
  (dLast.values[idx("migration")] / dPrior.values[idx("migration")] - 1) * 100
);

/* ---------------------------------- report -------------------------------- */

console.log("governed — dollars ($M), shares (%)");
quarters.forEach((q) => {
  console.log(
    `  ${q.label.padEnd(8)} ${q.totalDisplay.padStart(7)}  ` +
      q.values.map((v, i) => `${MOTIONS[i].short} ${v.toFixed(1)} (${q.shares[i].toFixed(1)}%)`).join("  ")
  );
});
console.log("\ndirect — dollars ($M), shares (%)");
directQuarters.forEach((q, k) => {
  console.log(
    `  ${quarters[k].label.padEnd(8)} ${q.totalDisplay.padStart(7)}  ` +
      q.values.map((v, i) => `${MOTIONS[i].short} ${v.toFixed(1)} (${q.shares[i].toFixed(1)}%)`).join("  ")
  );
});
console.log(`\nmigration Y/Y: governed -75% · direct ${dMigrationYoy}%`);
console.log(`exp-cs share at ${last.label}: governed ${last.shares[0]}% · direct ${dLast.shares[0]}%`);
console.log(`FY26 total ${m(fy26Total)} · FY26 H1 ${m(fy26H1)} · FY27 H1 ${m(fy27H1)}`);

if (dry) process.exit(0);

/* --------------------------------- authoring ------------------------------ */

const ACV_CERTIFIED = 82; // kpi-acv, the same quarter, $M
const ACV_CERTIFIED_PRIOR = 113.89;
const coverNow = ((last.total / ACV_CERTIFIED) * 100).toFixed(0);
const coverPrior = ((priorYearSame.total / ACV_CERTIFIED_PRIOR) * 100).toFixed(0);

const metrics = {
  unit: "$M",
  total: last.total,
  totalDisplay: last.totalDisplay,
  periodLabel: last.label,
  priorPeriodLabel: priorYearSame.label,
  priorTotal: priorYearSame.total,
  priorTotalDisplay: priorYearSame.totalDisplay,
  headline: `${last.shares[idx("exp-cs")].toFixed(0)}%`,
  headlineNote: "Cloud & Server expansion, share of ACV",
  goodDirection: "up",
  motions: MOTIONS.map((mo, i) => ({
    ...mo,
    value: last.values[i],
    display: last.displays[i],
    share: last.shares[i],
    shareDisplay: last.shareDisplays[i],
    priorValue: priorYearSame.values[i],
    priorDisplay: priorYearSame.displays[i],
    yoy: yoy[i].pct,
    yoyDisplay: yoy[i].display,
    goodDirection: "up"
  })),
  quarters,
  claims: claims.map((c) => ({ id: c.id, text: c.text })),
  insight: `<strong>Cloud Migration is the motion that left</strong> — ${m(
    priorYearSame.values[idx("migration")]
  )} to ${m(last.values[idx("migration")])}, down 75% Y/Y. New-customer ACV is still Cloud & Server: ${m(
    last.values[idx("nc-cs")]
  )} against ${m(last.values[idx("nc-crma")])} for CRMA & Next.`,
  caption: `${fy26.length} quarters of FY26 · ${fy27.length} of FY27 · dollars above, share below, one axis`,
  form: {
    note: "Two panels, one quarterly axis. The top panel is dollars per motion as lines, so level and trajectory read directly. The bottom panel is the same six quarters as a 100% stacked strip, so share reads without being confounded by level. They are separate panels on purpose: collapsed into one stacked dollar chart the '58% of total' claim would have to be read off a band whose height is doing two jobs at once, and it could not be read at all.",
    dollarDomain: [0, 65],
    dollarDomainNote:
      "Linear, from zero, to just above the largest motion. Not to the largest TOTAL: the totals are printed on the axis instead of drawn as a sixth line, which buys back 40% of the plot height for the five lines that are the subject — the largest motion reaches the top of the band instead of three fifths of the way up it. The cost is that the total's shape is a numeral sequence rather than a curve, and it is stated here so the trade is visible rather than discovered.",
    sacrificed: [
      "The y axis and every gridline. Five endpoint labels carry the scale instead, each naming its motion and its FY27 Q2 dollars — the only column where a reader needs a number off the line panel, because it is the column all three claims are about.",
      "The total as a drawn line. It is printed under each quarter tick, which is where the axis already is, so the '$51.4M → $102.5M → $64.8M' sequence the slide labels is still legible in order.",
      "Full-height composition bars. The strip is 24 of the viewBox's 100 units — about 24px at the 1024 floor and 32px at 1440. That is enough for the dominant band to carry its own share numeral and for the other four to read as colour against the endpoint labels above, and it is not enough to label a 7% band in place.",
      "Per-quarter motion labelling. Every value is on a tooltip and in the expanded card; six quarters × five motions is thirty numerals and the slide only ever printed nine of them."
    ],
    yearSplit: {
      note: "FY26 and FY27 are drawn as two separate line segments with a ruled gap between them, not as one continuous six-point series. FY27 has two quarters because two have happened. The gap and the year labels are what stop the two-column FY27 panel reading as a collapse in level, and the lines are broken there because a Q4-to-Q1 step is a fiscal boundary rather than a trend — the slide draws it the same way, in two framed panels.",
      fy26Quarters: fy26.length,
      fy27Quarters: fy27.length,
      fy26Total: fy26Total,
      fy26TotalDisplay: m(fy26Total),
      h1Compare: `FY26 H1 ${m(fy26H1)} → FY27 H1 ${m(fy27H1)}, ${(
        (fy27H1 / fy26H1 - 1) *
        100
      ).toFixed(1)}% — the like-for-like read, and the only one the two panels support. FY27's ${m(
        fy27H1
      )} against FY26's full-year ${m(fy26Total)} is not a comparison.`
    },
    stackOrder:
      "Bottom-to-top as authored, dominant motion on the baseline. A 58% band floating in the middle of a stack is measured from a wobbling edge and cannot be read; on the baseline it is measured from a straight one.",
    shareLabelling: `Only Expansion: Cloud & Server carries a numeral in the strip, in all six quarters — ${quarters
      .map((q) => `${q.shares[0].toFixed(0)}%`)
      .join(" · ")}. That sequence IS the headline claim, and the other four bands are between 1.8% and 25.9%, which at this strip height is between 0.3px and 4.6px of type room.`
  },
  reconciliation: {
    note: "Both panels are computed from one authored dollar table. Shares are dollars divided by the quarter total, by largest remainder to one decimal, so every quarter sums to exactly 100.0 and the strip can never show a sliver of unexplained white.",
    checks: [
      ...quarters.map(
        (q) =>
          `${q.label}: ${q.values.map((v) => v.toFixed(1)).join(" + ")} = ${q.total.toFixed(
            1
          )} = ${q.totalDisplay}, and ${q.shares.map((s) => s.toFixed(1)).join(" + ")} = 100.0.`
      ),
      `Cloud Migration ${priorYearSame.label} ${m(priorYearSame.values[idx("migration")])} → ${
        last.label
      } ${m(last.values[idx("migration")])} = -75.0% exactly, which is the claim.`,
      `New-customer motions at ${last.label}: ${m(last.values[idx("nc-cs")])} and ${m(
        last.values[idx("nc-crma")]
      )}, the two figures the slide states.`,
      `Expansion motions at ${last.label}: ${m(last.values[idx("exp-cs")])} + ${m(
        last.values[idx("exp-crma")]
      )} = ${m(last.values[idx("exp-cs")] + last.values[idx("exp-crma")])}, ${(
        ((last.values[idx("exp-cs")] + last.values[idx("exp-crma")]) / last.total) *
        100
      ).toFixed(1)}% of total — "driven by expansion of existing customers", as one arithmetic statement.`
    ],
    doesNotReconcileTo: `kpi-acv, the tile three rows above, and this is the portlet's most useful failure. ${last.label} reads ${last.totalDisplay} here against a certified ${"$" + ACV_CERTIFIED + "M"} there — ${coverNow}% of it — and ${priorYearSame.label} reads ${priorYearSame.totalDisplay} against ${"$" + ACV_CERTIFIED_PRIOR + "M"}, ${coverPrior}%. The five motions are a hand-built taxonomy over a subset of the book, and their coverage of the certified total moved ${Math.abs(
      Number(coverNow) - Number(coverPrior)
    )} points between the two quarters the tile above compares, for reasons no source can explain, because no source defines the taxonomy. Rendered as authored and not annotated on the face: a reconciliation badge here would imply somebody had reconciled it.`
  },
  provenanceOfFigures: {
    note: "Which numbers came from the slide and which are inference. Recorded per figure because the slide's two panels do not agree with each other, so 'from the slide' is not one thing.",
    fromStatedClaims: [
      `${last.label} total ${last.totalDisplay}, and FY26 Q4 ${quarters[3].totalDisplay} — both stated as totals.`,
      `${last.label} Expansion: Cloud & Server at 58.0% of total.`,
      `${last.label} Cloud Migration ${m(last.values[idx("migration")])}, down 75% Y/Y — which fixes ${
        priorYearSame.label
      } at ${m(priorYearSame.values[idx("migration")])}, a value the slide independently prints.`,
      `${last.label} New Customer: Cloud & Server ${m(last.values[idx("nc-cs")])} and New Customer: CRMA & Next ${m(
        last.values[idx("nc-crma")]
      )}.`
    ],
    readFromTheChart: [
      "The four other quarter totals — 51.4, 69.6, 63.4 in FY26 and 40.5 in FY27 — are the values printed along the slide's line panel.",
      "The five motion names and their colours are the slide's legend, read upward."
    ],
    inferred: [
      `Every per-motion dollar figure in FY26 Q1-Q4 and FY27 Q1. The slide labels nine values across those five quarters and does not say which line each belongs to. They are shaped to the trends the slide asserts in words and nothing else about them should be relied on.`,
      `Expansion: CRMA & Next in all six quarters. It is the residual — the slide never labels it, in either panel, in any quarter. Its FY27 Q2 value of ${m(
        last.values[idx("exp-crma")]
      )} is what is left after the four claimed figures.`,
      "The per-quarter shares of the four non-dominant motions, since they are derived from inferred dollars."
    ],
    departsFromTheSlide: [
      `The slide's own stacked panel. Its FY26 Q2 column shows no band near 26%, and Cloud Migration at ${m(
        priorYearSame.values[idx("migration")]
      )} of ${priorYearSame.totalDisplay} is 25.9%. The slide's line panel and its share panel cannot both be right, and the 75% claim depends on the line panel, so the line panel wins and the FY26 share labels are not used.`,
      "The slide's per-quarter share numerals for FY26 generally. They are between three and ten points from the shares this portlet derives, because they belong to the reading in which the labelled line is Expansion: Cloud & Server rather than the total."
    ]
  }
};

const semantic = {
  metricName: "ACV by Sales Motion",
  definition:
    "ACV_clc grouped by fiscal quarter and by a five-value motion taxonomy — Expansion / New Customer crossed with Cloud & Server / CRMA & Next, plus Cloud Migration — that no model publishes. The measure is certified. The grouping is a business vocabulary that lives in slides.",
  sdm: "Sls_Forecasting_Metrics_Expanded",
  measure: "ACV_clc",
  grain:
    "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × motion, six quarters across two fiscal years.",
  lineage: [
    "Org62 Opportunity",
    "Tableau Extract (.tdsx)",
    "APM product hierarchy (L1/L2/L3)",
    "a motion taxonomy that exists only in the deck — the supplement"
  ],
  rls: "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible six-quarter series, not an error.",
  certifiedBy:
    "ACV_clc: Casey O'Donnell, document owner — the SDM has no certifier property. The motion taxonomy: nobody. No model publishes a motion dimension, so the five values this portlet is entirely composed of have no owner, no definition and no version.",
  freshness:
    "ACV_clc: Jul 28, 2026 · 9:00 AM PT, SDM checked hourly over a daily ~8 AM PT extract. The taxonomy: whenever the deck was last edited.",
  dashboard: "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
  why:
    "Expansion versus new customer, and Cloud & Server versus CRMA & Next, is the vocabulary the business actually reasons in — every claim on the source slide is phrased in it. Neither documented model has it. The closest governed grouping is APM_L120 family and APM_L218 sub-product, which splits products rather than motions and puts Tableau Next and Tableau Server side by side as L2 siblings. So this portlet's entire subject is a grouping assembled by hand, and the evidence is on its face: the same five motions cover 61% of the certified quarter total a year ago and 79% of it now. A taxonomy whose own coverage moves eighteen points between two quarters is not a taxonomy, it is a habit. That is the argument, and it arrives as a gap in the board itself."
};

const directMode = {
  provenance: "supplemented",
  tier: "red",
  detectability: "silent",
  groundedIn: "ACV_clc certified; no motion dimension exists in either model (§5.4, §5.6)",
  candidates: ["no product-motion grouping exists at any level"],
  missing:
    "The motion taxonomy. Org62 stores product codes and the models publish a product hierarchy; neither publishes Expansion versus New Customer, and nothing anywhere publishes Cloud Migration as a motion. Also missing: the default APM_L120 = 'Other' exclusion the layer applies when a level-1 breakout is visible.",
  effect:
    "Both panels still draw, and that is the problem. A name-matched pull returns five motions and six quarters, the strip still sums to 100% in every quarter, and the shape of the story survives — expansion dominant, migration falling, new customer growing. What moves is the claim: the migration decline reads " +
    `${dMigrationYoy}% rather than -75%, and Cloud & Server expansion reads ${dLast.shares[0].toFixed(
      0
    )}% of total rather than 58%.`,
  thesisTag: "T4",
  thesis:
    "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
  risk:
    "Take 'slowing significantly' off the slide, rebuild it from the warehouse to check, get -65%, and conclude the deck was overstating a decline that is in fact steeper than the deck said",
  trustCost:
    "The most expensive shape of wrong on this board: not a missing panel but a complete one, whose two arithmetic checks both pass and whose headline claim has quietly changed size.",
  metrics: {
    total: dLast.total,
    totalDisplay: dLast.totalDisplay,
    priorTotal: dPrior.total,
    priorTotalDisplay: dPrior.totalDisplay,
    headline: `${dLast.shares[0].toFixed(0)}%`,
    /* Index-KEYED OBJECTS, not arrays. applyDirectOverrides replaces an array
     * wholesale and merges an index-keyed object element by element, and only
     * the second one is right here: a motion's label, short name and colour are
     * properties of the vocabulary, not of the mode. Handed an array this block
     * would have to restate all five of them, and the first time one was edited
     * in MOTIONS the direct board would quietly keep the old one. The alluvial
     * this replaces used the same shape for the same reason. */
    motions: Object.fromEntries(
      MOTIONS.map((mo, i) => [
        i,
        {
          value: dLast.values[i],
          display: dLast.displays[i],
          share: dLast.shares[i],
          shareDisplay: dLast.shareDisplays[i],
          priorValue: dPrior.values[i],
          priorDisplay: dPrior.displays[i],
          yoy: Math.round((dLast.values[i] / dPrior.values[i] - 1) * 100),
          yoyDisplay: `${dLast.values[i] > dPrior.values[i] ? "+" : ""}${Math.round(
            (dLast.values[i] / dPrior.values[i] - 1) * 100
          )}% Y/Y`
        }
      ])
    ),
    quarters: Object.fromEntries(
      directQuarters.map((q, k) => [
        k,
        {
          total: q.total,
          totalDisplay: q.totalDisplay,
          values: q.values,
          displays: q.displays,
          shares: q.shares,
          shareDisplays: q.shareDisplays,
          /* The provenance of a figure does not survive the pull that degrades
           * it. Nothing in a name-matched export is traceable to a claim on a
           * slide, so the direct read carries no sourced list at all. */
          sourced: []
        }
      ])
    ),
    insight: `<strong>Cloud Migration is the motion that left</strong> — ${dPrior.displays[idx(
      "migration"
    )]} to ${dLast.displays[idx("migration")]}, down ${Math.abs(
      dMigrationYoy
    )}% Y/Y. New-customer ACV is still Cloud & Server: ${dLast.displays[idx("nc-cs")]} against ${
      dLast.displays[idx("nc-crma")]
    } for CRMA & Next.`,
    caption: "4 quarters of FY26 · 2 of FY27 · dollars above, share below, one axis"
  },
  hazard: "exclusion-convention",
  shownFrom:
    `Two conventions the layer applies whether or not you ask. First, APM_L120 = 'Other' is excluded by default when the level-1 breakout is visible; retained, every figure inflates by 8.5% — ${last.totalDisplay} × 1.085 = ${dLast.totalDisplay}. Second, there is no SKU-to-motion dimension, so the motions are recovered by name-matching product codes, and 'Cloud' matches the Cloud & Server expansion codes and the migration SKUs alike: $3.0M lands in Cloud Migration instead of Expansion: Cloud & Server, in every quarter. ${last.label} migration: ${m(
      last.values[idx("migration")]
    )} × 1.085 + $3.0M = ${dLast.displays[idx("migration")]}. ${priorYearSame.label}: ${m(
      priorYearSame.values[idx("migration")]
    )} × 1.085 + $3.0M = ${dPrior.displays[idx("migration")]}. The strip still sums to 100.0% in all six quarters and the motions still sum to the total, so both checks pass.`,
  wouldYouNotice:
    `No. Six quarters, five lines, one strip, same shape, same story, same direction. The migration line still falls away and the expansion band is still the largest in every quarter — the two things a reader takes from this portlet in three seconds are both still there. What changed is the size of the one claim the slide put in bold: -${Math.abs(
      dMigrationYoy
    )}% instead of -75%. Nobody reads a decline of two thirds and a decline of three quarters as different findings, which is precisely why this is the expensive one.`,
  certifiedDelta: `+$5.5M total · migration reads ${dMigrationYoy}% not -75%`,
  layerProvides:
    "One certified ACV measure across both fiscal years from one grouped query on the same field, and the APM product hierarchy with its default 'Other' exclusion held as a business preference in the model rather than in each author's query. That is the numerator and the period alignment, and both are real.",
  layerDoesNotProvide:
    "The motions. There is no motion dimension at any level of either documented model — not Expansion versus New Customer, not Cloud Migration, not the Cloud & Server versus CRMA & Next split within either. The closest governed grouping is APM_L120 family and APM_L218 sub-product, and Tableau Next and Tableau Server are both L2 values, so even that needs OR-matching across two levels. Nothing in the layer certifies that these five motions partition the book, and the portlet's own arithmetic says they do not: they are 79% of the certified quarter and were 61% a year ago."
};

/* --------------------------------- splice --------------------------------- */

const board = JSON.parse(await readFile(boardPath, "utf8"));
const exec = board.tabs.find((t) => t.id === "exec");
const band = exec.bands.find((b) =>
  (b.portlets || []).some((p) => p.id === "mix-acv" || p.id === "acv-sources")
);
if (!band) throw new Error("no band on the exec tab holds the mix portlet");
const at = band.portlets.findIndex((p) => p.id === "mix-acv" || p.id === "acv-sources");

band.portlets[at] = {
  id: "acv-sources",
  kind: "acvSources",
  label: "Where does ACV come from",
  sublabel: "Five sales motions, FY26 Q1 → FY27 Q2 · dollars above, share below",
  accent: "#2F5FA8",
  metrics,
  semantic,
  directMode
};

/* The narrative rails linked to mix-acv for its product-mix check. The
 * replacement answers a strictly larger question — same measure, five motions
 * rather than two, six quarters rather than two — so the links carry over
 * under the new id rather than being dropped. */
let relinked = 0;
for (const b of exec.bands) {
  for (const p of b.portlets || []) {
    if (p.kind !== "cardRail") continue;
    (p.metrics.cards || []).forEach((card) => {
      if (!(card.links || []).includes("mix-acv")) return;
      card.links = [...new Set(card.links.map((l) => (l === "mix-acv" ? "acv-sources" : l)))];
      relinked += 1;
    });
  }
}

await writeFile(boardPath, `${JSON.stringify(board, null, 2)}\n`, "utf8");
console.log(`\nauthor-acv-sources: wrote acv-sources into data/board.json (${relinked} rail links repointed)`);
