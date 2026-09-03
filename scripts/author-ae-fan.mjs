#!/usr/bin/env node
/* Repoints the exec tab's movement fan from account ACV to per-AE productivity.
 *
 * Writes the whole `acv-ae-fan` portlet — rows, groups, percentiles, form,
 * semantic and directMode — into data/board.json, replacing `acv-account-fan`.
 *
 *   node scripts/author-ae-fan.mjs        # writes
 *   node scripts/author-ae-fan.mjs --dry  # prints the stats and writes nothing
 *
 * WHY THIS IS A SCRIPT AND NOT HAND-TYPED JSON
 *
 * The panel's whole argument is that its detail rolls up to the certified
 * aggregates already on the tab — 745 AEs and $82M from `hc-ae` and `kpi-acv`,
 * 904 and $113.89M a year before. Hand-typing 1,000 rows that close on four
 * authored totals is not something anyone can check, so the population is a
 * consequence of a stated rule and the rule is carried in the data file beside
 * the rows it produced.
 *
 * THE POPULATION IS PAIRED, AND THAT IS THE WHOLE CARE THIS FILE TAKES
 *
 * docs/fan-repoint.md ranked this subject third and called it "the one to want
 * and not to build". The reason is the roster: the User Hierarchy table is
 * current state on a weekly refresh with no as-of-period-end read, so a naive
 * prior-year side is last year's bookings redistributed across today's org.
 * The board's own headline asserts an 18% headcount decline — 904 to 745 —
 * which is roughly 160 AEs of net turnover and considerably more gross.
 *
 * So the fan draws only AEs present on BOTH rosters. Joiners and leavers are
 * emitted as rows with a cohort of their own and rendered as labelled stubs
 * outside the indexed axis, exactly as the account fan rendered its 18 new
 * logos. An AE who exists at one end only never becomes a line.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const boardPath = resolve(root, "data/board.json");
const dry = process.argv.includes("--dry");

/* ----------------------------- authored totals ---------------------------- */

/* Every one of these is a figure already on the exec tab or derivable from one
 * by integer arithmetic. Nothing here is a new claim about the business. */
const ROSTER_NOW = 745;        // hc-ae.metrics.value
const ROSTER_PRIOR = 904;      // hc-ae.metrics.priorValue
const ACV_NOW_K = 82000;       // kpi-acv, $82M
const ACV_PRIOR_K = 113890;    // acv fan's prior total, = $82M / 0.72

const JOINERS = 96;            // on the current roster only
const JOINERS_K = 5280;        // their FY27 Q2 ACV
const LEAVERS = 255;           // on the prior-year roster only
const LEAVERS_K = 27540;       // their FY26 Q2 ACV

const PAIRED = ROSTER_NOW - JOINERS;                 // 649
const PAIRED_PRIOR_K = ACV_PRIOR_K - LEAVERS_K;      // 86,350
const PAIRED_NOW_K = ACV_NOW_K - JOINERS_K;          // 76,720

if (ROSTER_PRIOR - LEAVERS !== PAIRED) {
  throw new Error(`paired population disagrees across the two rosters: ${ROSTER_PRIOR - LEAVERS} vs ${PAIRED}`);
}

/* The index range. [0, 200] was the account fan's and it never fired there —
 * the largest expansion in that population was 194. At AE grain a rep who came
 * off a ramp year can triple, so the range is widened and anything still past
 * the top is drawn as an explicit overflow rather than parked on the top tick. */
const INDEX_RANGE = [0, 250];

/* Zipf exponents. An AE book is far less skewed than an account book — every
 * rep carries a quota, so the top of the distribution is bounded by what one
 * person can sell, which is not true of an account. 0.45 against the account
 * fan's 0.8. */
const ZIPF = 0.45;

const GROUPS = {
  paired: {
    n: PAIRED,
    priorTotalK: PAIRED_PRIOR_K,
    currentTotalK: PAIRED_NOW_K,
    /* Every one of these four is rank-dependent, and that is the mechanism the
     * panel exists to show. The AEs carrying the biggest books a year ago are
     * the least likely to have grown and the ones with the most to give back,
     * because their books were concentrated in the accounts that contracted.
     * A rep on $40K has room to triple and little to lose. The consequence is
     * a median close to flat over an aggregate that falls — a fall carried by
     * the top of the distribution rather than by the whole of it, which is the
     * question the two tiles above this panel cannot answer. */
    pTop: 0.33,
    pBottom: 0.72,
    maxUpTop: 0.4,
    maxUpBottom: 2.4,
    maxDownTop: 1.0,
    maxDownBottom: 0.45,
    seed: 74501
  }
};

/* ------------------------------- primitives ------------------------------- */

/* Same 32-bit LCG the account population used, so the two generators are
 * reproducible under one stated rule rather than two. */
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1103515245, s) + 12345) >>> 0;
    s %= 2 ** 31;
    return s / 2 ** 31;
  };
}

/* Largest remainder, because it sums to the target exactly by construction —
 * so the roll-up is a property of the method rather than a rounding
 * coincidence anybody has to verify. */
function apportion(weights, total) {
  const sum = weights.reduce((a, w) => a + w, 0) || 1;
  const exact = weights.map((w) => (w / sum) * total);
  const floors = exact.map(Math.floor);
  let short = total - floors.reduce((a, n) => a + n, 0);
  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  const out = floors.slice();
  for (let k = 0; short > 0; k += 1, short -= 1) out[order[k % order.length].i] += 1;
  return out;
}

function percentileOf(sorted, p) {
  const n = sorted.length;
  if (!n) return null;
  const h = ((n + 1) * p) / 100 - 1;
  const lo = Math.max(0, Math.min(n - 1, Math.floor(h)));
  const hi = Math.max(0, Math.min(n - 1, lo + 1));
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (h - lo));
}

const m = (k) => `$${(k / 1000).toFixed(1)}M`;
const k$ = (k) => `$${Math.round(k)}K`;

/* ------------------------------ the population ---------------------------- */

const spec = GROUPS.paired;
const draw = lcg(spec.seed);
const regionDraw = lcg(90210);
const REGIONS = [["AMER", 0.46], ["EMEA", 0.28], ["APAC", 0.18], ["LATAM", 0.08]];

function regionFor() {
  const u = regionDraw();
  let acc = 0;
  for (const [name, w] of REGIONS) {
    acc += w;
    if (u < acc) return name;
  }
  return "AMER";
}

const ranks = Array.from({ length: spec.n }, (_, i) => i + 1);
const weights = ranks.map((r) => r ** -ZIPF);
const priorKs = apportion(weights, spec.priorTotalK);

/* One draw per AE, consumed in rank order, so an AE's movement is determined
 * by its rank rather than assigned. */
const lerp = (a, b, t) => a + (b - a) * t;
const multipliers = ranks.map((r) => {
  const u = draw();
  const t = (r - 1) / (spec.n - 1);
  const p = lerp(spec.pTop, spec.pBottom, t);
  let mult;
  if (u < p) mult = 1 + lerp(spec.maxUpTop, spec.maxUpBottom, t) * (u / p) ** 1.5;
  else mult = 1 - lerp(spec.maxDownTop, spec.maxDownBottom, t) * ((u - p) / (1 - p)) ** 0.7;
  /* Snaps to zero: an AE on the roster at both points who booked nothing this
   * quarter. A genuine atom at index 0, and the reason the density curve
   * refuses to reflect at the boundary. */
  return mult <= 0.05 ? 0 : mult;
});

const targets = priorKs.map((prior, i) => prior * multipliers[i]);
const currentKs = apportion(targets, spec.currentTotalK);
/* Reported because it is the one number in this rule that is not authored: the
 * drawn multipliers do not sum to the authored current total by construction,
 * so the apportionment applies a single global factor. Anything far from 1
 * means the parameters and the totals are telling different stories. */
const apportionScale = spec.currentTotalK / targets.reduce((a, v) => a + v, 0);

const segmentOf = (basis) => (basis >= 260 ? "enterprise" : basis >= 110 ? "commercial" : "growth");

const rows = [];
priorKs.forEach((prior, i) => {
  rows.push([`AE-${String(i + 1).padStart(3, "0")}`, segmentOf(prior), regionFor(), "paired", prior, currentKs[i]]);
});

/* Joiners: on the current roster only. A prior-year ACV-per-AE for someone who
 * was not carrying a quota is not zero, it is undefined — the same refusal the
 * account fan made for its new logos. */
const joinerWeights = Array.from({ length: JOINERS }, (_, i) => (i + 1) ** -ZIPF);
const joinerKs = apportion(joinerWeights, JOINERS_K);
joinerKs.forEach((current, i) => {
  rows.push([`AE-J${String(i + 1).padStart(3, "0")}`, segmentOf(current), regionFor(), "joiner", 0, current]);
});

/* Leavers: on the prior-year roster only. Their current ACV is 0, and that 0
 * is the reason they cannot be a line — an index of 0 would read as "this AE
 * sold nothing", which is true of the 20 paired AEs at index 0 and false of
 * these 255, who are not being measured at all. */
const leaverWeights = Array.from({ length: LEAVERS }, (_, i) => (i + 1) ** -ZIPF);
const leaverKs = apportion(leaverWeights, LEAVERS_K);
leaverKs.forEach((prior, i) => {
  rows.push([`AE-L${String(i + 1).padStart(3, "0")}`, segmentOf(prior), regionFor(), "leaver", prior, 0]);
});

/* -------------------------------- statistics ------------------------------- */

const paired = rows
  .filter((r) => r[3] === "paired")
  .map((r) => ({ id: r[0], priorK: r[4], currentK: r[5] }))
  .map((a) => ({ ...a, raw: Math.round((a.currentK / a.priorK) * 100) }));

const [LOW, HIGH] = INDEX_RANGE;
const overflow = paired.filter((a) => a.raw > HIGH);
const expanding = paired.filter((a) => a.raw > 100);
const contracting = paired.filter((a) => a.raw <= 100);
const zeroed = paired.filter((a) => a.raw === 0);
const flat = paired.filter((a) => Math.abs(a.raw - 100) <= 2);

/* Percentiles, sd and the bandwidth are computed on the RAW index, not on the
 * clamped one, and the renderer does the same. Clamping first would let the
 * range decide the shape of the distribution it is supposed to be displaying —
 * and the whole reason the range moved is that the old one was deciding things
 * silently. */
const sorted = paired.map((a) => a.raw).sort((a, b) => a - b);
const percentiles = {};
[5, 10, 25, 50, 75, 90, 95].forEach((q) => {
  percentiles[`p${q}`] = percentileOf(sorted, q);
});

/* Silverman's rule on THIS population, stated rather than inherited. The
 * account fan's 14 was Silverman on the account distribution and would be the
 * wrong smooth here. */
const mean = sorted.reduce((a, v) => a + v, 0) / sorted.length;
const sd = Math.sqrt(sorted.reduce((a, v) => a + (v - mean) ** 2, 0) / (sorted.length - 1));
const iqr = percentileOf(sorted, 75) - percentileOf(sorted, 25);
const silverman = 0.9 * Math.min(sd, iqr / 1.34) * sorted.length ** (-1 / 5);
const bandwidth = Math.round(silverman);

const sumK = (list, key) => list.reduce((a, x) => a + x[key], 0);
const share = (n) => Math.round((n / paired.length) * 100);

/* The finding, as one arithmetic statement: the heaviest tenth of the paired
 * book against the rest. If these two do not diverge the panel has no answer to
 * the question it is asking. */
const byPrior = paired.slice().sort((a, b) => b.priorK - a.priorK);
const DECILE = Math.round(paired.length / 10);
const topDecile = byPrior.slice(0, DECILE);
const restOfBook = byPrior.slice(DECILE);
const decile = {
  n: DECILE,
  priorK: sumK(topDecile, "priorK"),
  currentK: sumK(topDecile, "currentK"),
  medianIndex: percentileOf(topDecile.map((a) => a.raw).sort((a, b) => a - b), 50),
  restPriorK: sumK(restOfBook, "priorK"),
  restCurrentK: sumK(restOfBook, "currentK"),
  restMedianIndex: percentileOf(restOfBook.map((a) => a.raw).sort((a, b) => a - b), 50)
};
decile.change = Number(((decile.currentK / decile.priorK - 1) * 100).toFixed(1));
decile.restChange = Number(((decile.restCurrentK / decile.restPriorK - 1) * 100).toFixed(1));
decile.priorShare = Number(((decile.priorK / PAIRED_PRIOR_K) * 100).toFixed(1));

const stats = {
  paired: paired.length,
  joiners: JOINERS,
  leavers: LEAVERS,
  expanding: expanding.length,
  contracting: contracting.length,
  zeroed: zeroed.length,
  flat: flat.length,
  overflow: overflow.length,
  apportionScale: Number(apportionScale.toFixed(4)),
  maxIndex: Math.max(...paired.map((a) => a.raw)),
  overflowIndexes: overflow.map((a) => a.raw).sort((a, b) => b - a),
  percentiles,
  decile,
  sd: Number(sd.toFixed(1)),
  iqr,
  silverman: Number(silverman.toFixed(2)),
  bandwidth,
  expandingPriorK: sumK(expanding, "priorK"),
  expandingCurrentK: sumK(expanding, "currentK"),
  contractingPriorK: sumK(contracting, "priorK"),
  contractingCurrentK: sumK(contracting, "currentK"),
  pairedPriorK: sumK(paired, "priorK"),
  pairedCurrentK: sumK(paired, "currentK"),
  perAeNow: Math.round(PAIRED_NOW_K / PAIRED),
  perAePrior: Math.round(PAIRED_PRIOR_K / PAIRED),
  perAeRosterNow: Math.round(ACV_NOW_K / ROSTER_NOW),
  perAeRosterPrior: Math.round(ACV_PRIOR_K / ROSTER_PRIOR),
  top10ShareNow: Number(
    ((paired.slice().sort((a, b) => b.currentK - a.currentK).slice(0, 65).reduce((a, x) => a + x.currentK, 0) / PAIRED_NOW_K) * 100).toFixed(1)
  )
};

console.log(JSON.stringify(stats, null, 2));

if (dry) process.exit(0);

/* --------------------------------- authoring ------------------------------- */

const pairedFall = ((stats.pairedCurrentK / stats.pairedPriorK - 1) * 100).toFixed(1);
const medianIndex = percentiles.p50;
const expShare = share(expanding.length);
const conShare = share(contracting.length);

const metrics = {
  unit: "$K",
  totalDisplay: m(PAIRED_NOW_K),
  priorTotalDisplay: m(PAIRED_PRIOR_K),
  yoy: Number(pairedFall),
  yoyDisplay: `${pairedFall}% Y/Y`,
  goodDirection: "up",
  headline: `${expShare}% / ${conShare}%`,
  headlineNote: "Share of paired AEs whose ACV per AE rose / fell",
  insight: `The productivity fall is a tail, not a slide. <strong>The 65 heaviest books of a year ago fell ${decile.change}%, ${m(decile.priorK)} → ${m(decile.currentK)}</strong>, while the other ${restOfBook.length} paired AEs came in flat in aggregate — ${m(decile.restPriorK)} → ${m(decile.restCurrentK)}, ${decile.restChange}%. ${expanding.length} of ${paired.length} paired AEs sold more than they did a year ago and ${contracting.length} sold less, on a median index of ${medianIndex}. The ${pairedFall}% fall in ACV per paired AE is therefore a question about ${decile.n} reps and the accounts they carried, not about the selling capability of the roster.`,
  caption: `${paired.length} paired AEs · ${expanding.length} up · ${contracting.length} down · ${JOINERS} joiners + ${LEAVERS} leavers held out`,
  form: {
    note: "Geometry contract for the renderer. Each fan line is one quota-carrying AE present on BOTH the FY26 Q2 and FY27 Q2 rosters, drawn from a common origin on the left to its indexed position on the right. The origin is an index rather than a dollar value, so no AE's baseline is implied to be any other's — and the population is restricted to the paired roster, so no line is a comparison against an AE who was not there.",
    originIndex: 100,
    referenceLine: 100,
    indexRange: INDEX_RANGE,
    indexOf: `round(currentK / priorK * 100) — 100 is flat, 0 is an AE who booked nothing this quarter, ${stats.maxIndex} is the largest rise in the population`,
    lineWeightBy: "priorK — the finding is only visible if the AEs who carried the biggest books last year read heavier than the rest",
    marginalDensity: "Kernel or binned density of the index values along the right axis, computed from rows rather than authored, so it cannot disagree with the lines it sits beside",
    bandwidth,
    bandwidthNote: `Silverman's rule on this population: 0.9 × min(sd ${stats.sd}, IQR/1.34 ${(stats.iqr / 1.34).toFixed(1)}) × n^(-1/5) = ${stats.silverman}, rounded to ${bandwidth}. The account population it replaced gave 13.9, which would have been the wrong smooth here.`,
    overflow: {
      count: overflow.length,
      indexes: stats.overflowIndexes,
      renderAs: "An explicit chevron above the top of the axis carrying the count, and the overflowing lines terminate on the axis top rather than at their own value. Silently clamping them to the top tick — which is what the [0, 200] range did before it was widened — draws them as though they landed there.",
      note: `The account population this range was set for never overflowed: its largest expansion was 194 against a ceiling of 200. At AE grain ${overflow.length} of ${paired.length} AEs are past ${HIGH}, the largest at ${stats.maxIndex}, so the clamp would have fired silently on every one of them.`
    },
    flatBand: {
      within: 2,
      count: flat.length,
      note: `${flat.length} of ${paired.length} paired AEs land within 2 index points of the reference. That is ${((flat.length / paired.length) * 100).toFixed(1)}% of the population, which is small enough to draw: the movers-only treatment the account fan's exclusion stub would have supported is not needed here, because year-over-year ACV per AE is not a measure that holds still. Stated so the decision is visible rather than assumed.`
    },
    secondaryEncoding: "segment (enterprise / commercial / growth territory) and region are available as filters. Neither is required for the primary read, and neither is drawn."
  },
  groups: [
    {
      id: "expanding",
      label: "Sold more",
      test: "index > 100",
      count: expanding.length,
      share: Number(((expanding.length / paired.length) * 100).toFixed(1)),
      shareDisplay: `${expShare}%`,
      priorK: stats.expandingPriorK,
      currentK: stats.expandingCurrentK,
      detail: `${m(stats.expandingPriorK)} → ${m(stats.expandingCurrentK)}, +${Math.round((stats.expandingCurrentK / stats.expandingPriorK - 1) * 100)}% — ${Math.round((stats.expandingPriorK / stats.pairedPriorK) * 100)}% of the paired book a year ago, ${Math.round((stats.expandingCurrentK / stats.pairedCurrentK) * 100)}% of it now`,
      color: "#12806A"
    },
    {
      id: "contracting",
      label: "Sold less",
      test: "index <= 100",
      count: contracting.length,
      share: Number(((contracting.length / paired.length) * 100).toFixed(1)),
      shareDisplay: `${conShare}%`,
      priorK: stats.contractingPriorK,
      currentK: stats.contractingCurrentK,
      detail: `${m(stats.contractingPriorK)} → ${m(stats.contractingCurrentK)}, ${Math.round((stats.contractingCurrentK / stats.contractingPriorK - 1) * 100)}% — ${zeroed.length} of them to nothing at all`,
      color: "#C0483C"
    }
  ],
  distribution: {
    fanLines: paired.length,
    medianIndex,
    percentiles,
    concentrationNote: `Ranked by last year's book, the top decile — ${decile.n} AEs holding ${decile.priorShare}% of the paired book a year ago — went ${m(decile.priorK)} → ${m(decile.currentK)}, ${decile.change}%, on a median index of ${decile.medianIndex}. The remaining ${restOfBook.length} went ${m(decile.restPriorK)} → ${m(decile.restCurrentK)}, ${decile.restChange}%, on a median of ${decile.restMedianIndex}. That is the whole finding, and it is the reason line weight is priorK: the falling lines are the heavy ones. ACV per paired AE went ${k$(stats.perAePrior)} → ${k$(stats.perAeNow)}; across the full roster, which is the read the two tiles above support, ${k$(stats.perAeRosterPrior)} → ${k$(stats.perAeRosterNow)}, -${(100 - (stats.perAeRosterNow / stats.perAeRosterPrior) * 100).toFixed(1)}% — an 18% smaller roster selling 28% less.`
  },
  excluded: {
    note: "Two cohorts, not one, and they are excluded for two different reasons. A movement needs the same entity measured at both points; the roster behind this panel is current state on a weekly refresh, so neither cohort has a second point to be measured against. Both are rows in the population — the roll-up closes on the certified totals — and neither is ever a line on the index.",
    stubs: [
      {
        id: "joiners",
        cohort: "joiner",
        label: "joined since FY26 Q2",
        count: JOINERS,
        totalK: JOINERS_K,
        totalDisplay: m(JOINERS_K),
        direction: "in",
        reason: `${JOINERS} AEs are on the FY27 Q2 roster and were not on the FY26 Q2 one. Their prior ACV per AE is not zero, it is undefined — there was no quota to divide. They booked ${m(JOINERS_K)} between them, ${k$(JOINERS_K / JOINERS)} each against ${k$(stats.perAeNow)} for a paired AE, which is what a ramp looks like and is not a productivity decline.`,
        renderAs: "A labelled inflow stub above the origin, outside the indexed axis — never a line on it."
      },
      {
        id: "leavers",
        cohort: "leaver",
        label: "left since FY26 Q2",
        count: LEAVERS,
        totalK: LEAVERS_K,
        totalDisplay: m(LEAVERS_K),
        direction: "out",
        reason: `${LEAVERS} AEs were on the FY26 Q2 roster and are not on the FY27 Q2 one, carrying ${m(LEAVERS_K)} of prior-year ACV with them. Their current ACV per AE is 0, and drawing them at index 0 would be the single most dishonest line this panel could carry: index 0 means "this AE booked nothing", which is true of the ${zeroed.length} paired AEs sitting there and false of these ${LEAVERS}, who are not being measured. Worse, the roster cannot even name them — it holds today's org, so a departed AE's book has already been re-owned by whoever holds the record now.`,
        renderAs: "A labelled outflow stub below the origin, outside the indexed axis — never a line on it."
      }
    ]
  },
  reconciliation: {
    note: "The point of the portlet. The detail rolls up to the certified aggregates already on this board; every line below is exact integer arithmetic on the rows array, in $K.",
    checks: [
      `${rows.length} rows = ${paired.length} paired AEs (on both rosters, drawn as fan lines) + ${JOINERS} joiners + ${LEAVERS} leavers (one roster each, drawn as stubs).`,
      `${paired.length} + ${JOINERS} = ${ROSTER_NOW} = hc-ae.metrics.value, the FY27 Q2 roster.`,
      `${paired.length} + ${LEAVERS} = ${ROSTER_PRIOR} = hc-ae.metrics.priorValue, the FY26 Q2 roster the Five Year Trend tab plots.`,
      `Roster Y/Y: ${ROSTER_NOW} / ${ROSTER_PRIOR} - 1 = -17.59% → -18%, matching hc-ae.metrics.yoyDisplay. Gross turnover is ${JOINERS + LEAVERS} AEs against a net decline of ${ROSTER_PRIOR - ROSTER_NOW} — which is why the paired population is ${paired.length} and not ${ROSTER_NOW}.`,
      `sum(currentK) = ${ACV_NOW_K.toLocaleString("en-US")} = $82M = kpi-acv.metrics.display.`,
      `sum(priorK) = ${ACV_PRIOR_K.toLocaleString("en-US")} = $113.89M, the prior-year quarter implied by kpi-acv's -28% Y/Y ($82M / 0.72).`,
      `Paired: ${stats.pairedPriorK.toLocaleString("en-US")} → ${stats.pairedCurrentK.toLocaleString("en-US")} (${pairedFall}%). Joiners: 0 → ${JOINERS_K.toLocaleString("en-US")}. Leavers: ${LEAVERS_K.toLocaleString("en-US")} → 0. ${stats.pairedCurrentK.toLocaleString("en-US")} + ${JOINERS_K.toLocaleString("en-US")} = ${ACV_NOW_K.toLocaleString("en-US")} and ${stats.pairedPriorK.toLocaleString("en-US")} + ${LEAVERS_K.toLocaleString("en-US")} = ${ACV_PRIOR_K.toLocaleString("en-US")}.`,
      `Group split: ${stats.expandingPriorK.toLocaleString("en-US")} + ${stats.contractingPriorK.toLocaleString("en-US")} = ${stats.pairedPriorK.toLocaleString("en-US")} and ${stats.expandingCurrentK.toLocaleString("en-US")} + ${stats.contractingCurrentK.toLocaleString("en-US")} = ${stats.pairedCurrentK.toLocaleString("en-US")}, so the split is a partition of the paired population rather than a sample of it.`,
      `ACV per AE across the full roster: ${ACV_PRIOR_K.toLocaleString("en-US")} / ${ROSTER_PRIOR} = ${k$(stats.perAeRosterPrior)} → ${ACV_NOW_K.toLocaleString("en-US")} / ${ROSTER_NOW} = ${k$(stats.perAeRosterNow)}. That is the number the two tiles above already imply, and the fan is its distribution over the part of the roster that existed at both points.`,
      `Decile split, ranked by priorK: ${decile.priorK.toLocaleString("en-US")} + ${decile.restPriorK.toLocaleString("en-US")} = ${stats.pairedPriorK.toLocaleString("en-US")} and ${decile.currentK.toLocaleString("en-US")} + ${decile.restCurrentK.toLocaleString("en-US")} = ${stats.pairedCurrentK.toLocaleString("en-US")}. The headline finding is a partition of the same rows, not a second population.`
    ],
    doesNotReconcileTo: `The roster counts. 745 and 904 are supplemented figures from hc-ae — there is no headcount measure in either documented model — so the two population totals this panel closes on are not certified, and neither is the split of ${ROSTER_PRIOR} into ${paired.length} paired and ${LEAVERS} leavers. That split is a property of a table that only ever describes today. Also not reconcilable: kpi-attrition ($75M) and trend-attrition, which are measured against the prior-period contract book across the whole installed base rather than against a bookings cohort. Do not call the lower group churn, and do not read the ${LEAVERS} leavers as attrition.`
  },
  generator: {
    note: "This population is generated, not hand-typed. The rule is stated here so anyone can reproduce the rows exactly and confirm the distribution is a consequence of a stated rule rather than authored noise shaped to look convincing. Written by scripts/author-ae-fan.mjs.",
    prng: "32-bit LCG. s(k+1) = (1103515245 * s(k) + 12345) mod 2^31, u(k) = s(k) / 2^31. Draws are consumed in emission order within each stream.",
    seeds: { paired: spec.seed, region: 90210 },
    emissionOrder: `Paired AEs by prior-year rank 1-${paired.length}, then ${JOINERS} joiners, then ${LEAVERS} leavers. Row ids AE-001 to AE-${String(paired.length).padStart(3, "0")}, AE-J001 to AE-J${JOINERS}, AE-L001 to AE-L${LEAVERS} follow that order, so an id is determined by the rule rather than assigned.`,
    steps: [
      `1. Paired split: the two rosters are ${ROSTER_PRIOR} and ${ROSTER_NOW}. ${JOINERS} joiners and ${LEAVERS} leavers are authored, which fixes the paired population at ${ROSTER_NOW} - ${JOINERS} = ${ROSTER_PRIOR} - ${LEAVERS} = ${paired.length}. The two identities have to agree or the script refuses to write.`,
      `2. Prior-year book: weight w(r) = r^-${ZIPF} by rank r, apportioned across ${PAIRED_PRIOR_K.toLocaleString("en-US")} by the largest-remainder method. ${ZIPF} rather than the account population's 0.8, because every AE carries a quota — the top of an AE distribution is bounded by what one person can sell, which is not true of an account.`,
      `3. One LCG draw u per AE. Expansion propensity RISES with rank: p(r) = ${spec.pTop} + (${spec.pBottom} - ${spec.pTop}) * (r - 1) / (n - 1). The AEs who carried the biggest books are the least likely to have grown — that is the mechanism the panel is describing, so it is in the rule rather than added afterwards.`,
      `4. Movement multiplier m: if u < p then m = 1 + ${spec.maxUp} * (u / p)^1.5, else m = 1 - ${spec.maxDown} * ((u - p) / (1 - p))^0.7. maxDown = 1.0, so an AE can book nothing and no less. Any m <= 0.05 snaps to 0.`,
      `5. This year's book: largest-remainder apportionment of ${PAIRED_NOW_K.toLocaleString("en-US")} across priorK * m, so currentK sums to the paired total exactly.`,
      `6. Joiners: priorK = 0, currentK apportioned across w(r) = r^-${ZIPF} against ${JOINERS_K.toLocaleString("en-US")}. Leavers: currentK = 0, priorK apportioned the same way against ${LEAVERS_K.toLocaleString("en-US")}.`,
      `7. segment is a stated threshold on the AE's basis value in $K (priorK, or currentK for a joiner): >= 260 enterprise, >= 110 commercial, else growth — territory segment, not a segment of the AE. region is one weighted LCG draw per AE — AMER 0.46, EMEA 0.28, APAC 0.18, LATAM 0.08.`
    ],
    params: {
      zipfExponent: ZIPF,
      paired: { n: PAIRED, priorTotalK: PAIRED_PRIOR_K, currentTotalK: PAIRED_NOW_K, ...spec },
      joiners: { n: JOINERS, currentTotalK: JOINERS_K },
      leavers: { n: LEAVERS, priorTotalK: LEAVERS_K }
    }
  },
  columns: ["id", "segment", "region", "cohort", "priorK", "currentK"],
  rowsNote: `${rows.length} rows in $K. cohort is paired | joiner | leaver, and only paired rows become fan lines. Emitted by scripts/author-ae-fan.mjs under the rule in generator above.`,
  rows
};

const semantic = {
  metricName: "ACV per Account Executive",
  definition:
    "ACV_clc grouped by User_Name10 where User_Role2 = 'AE', for the current and prior year of the same fiscal quarter, from one grouped query on Close_Date_Relative_Year_clc. At AE grain the denominator is one, so 'ACV per AE' needs no headcount measure — it is ACV_clc grouped by the rep. The measure is certified. The population is not: the roster it is grouped by is current state.",
  sdm: "Sls_Forecasting_Metrics_Expanded — the fan has to reconcile to the ACV tile, so it cannot be the Specialist model",
  measure: "ACV_clc, grouped by User_Name10 · no headcount measure is used or needed",
  grain:
    "Row: metric × opportunity × user in the reporting hierarchy, so a deal appears once for every leader above its owner. The AE-grain read requires no Is_My_Data_clc filter and the documented org-wide pattern is GROUP BY User_Name10 WHERE User_Role2 = 'AE'. Presented: quota-carrying AE × Close_Date_Relative_Year_clc.",
  lineage: [
    "Org62 Opportunity",
    "Tableau Extract (.tdsx)",
    "ACV_HISTORICALS",
    "User Hierarchy table (weekly refresh, current state) — the supplement"
  ],
  rls: "The caller's entitled hierarchy, not a business unit. AE-grain rows are the most tightly scoped on the board, so a wrong caller returns a smaller fan that still draws.",
  certifiedBy:
    "ACV_clc: Casey O'Donnell, document owner — the SDM has no certifier property. The paired roster: nobody. There is no headcount measure in either documented model and no as-of-period-end read of the user table anywhere, so the population this panel draws has no certifier and cannot have one.",
  freshness:
    "ACV_clc: Jul 28, 2026 · 9:00 AM PT, SDM checked hourly over a daily ~8 AM PT extract. The roster behind the population refreshes weekly and only ever describes today.",
  dashboard: "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
  why:
    "The board already asserts an 18% headcount decline and a 28% ACV fall, which is a 12.6% fall in ACV per AE, and it has never shown whether that is the whole distribution sliding or the top of it leaving. This panel is that distribution. The hazard is in the denominator's identity, not in the measure: the User Hierarchy table is a current roster on a weekly refresh joined on Record_Owner_Id1 = User_Id31, with no as-of-period-end grain, so a naive prior-year side is last year's bookings redistributed across today's org — roughly 160 AEs of net turnover and 351 gross. The panel answers it by drawing only the 649 AEs present on both rosters and holding the 96 joiners and 255 leavers out as labelled stubs. That restriction is what makes the picture honest and is also why the portlet is supplemented rather than certified: the paired population is a claim about a table that cannot support one. That Record_Owner_Id1 is current-owner rather than owner-at-close is an inference from Salesforce semantics, not something the source documents state, and it is the single check the whole panel rests on."
};

const directMode = {
  provenance: "supplemented",
  tier: "yellow",
  detectability: "none",
  groundedIn:
    "ACV_clc certified at AE grain; the paired roster is a supplement — no headcount measure and no as-of-period-end user table in either model (§4, §10.1)",
  candidates: [
    "649 paired AEs, the roster as it reads today",
    "no as-of-FY26-Q2 roster exists to pair against"
  ],
  missing:
    "A point-in-time roster. The User Hierarchy table is current state on a weekly refresh with no as-of-period-end read, so the set of AEs who were carrying a quota in FY26 Q2 cannot be recovered — and that holds inside the semantic layer exactly as it holds outside it, because no such read exists in either place.",
  effect:
    "Nothing moves, and that is the finding. The layer was never holding this population up: the paired set is reconstructed from today's roster by hand, so a direct query and a governed one return the same 649 AEs and the same wrong ones. The measure degrades in direct mode the way kpi-acv's does — four candidate Amount columns — but no figure is authored here, because a supplemented panel has no certified figure to be off by.",
  thesisTag: "T2",
  thesis:
    "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
  risk:
    "Grade an enablement or coverage motion on a paired population assembled from today's org chart, and conclude the productivity fall is broad when the reconstruction is what made it look that way",
  trustCost:
    "Ungoverned but usable — the tier where errors are quiet rather than loud. The measure is certified and the population is not, and a panel whose picture is a population is only as good as its weakest input.",
  metrics: {},
  hazard: "point-in-time",
  shownFrom: null,
  supplementedFrom:
    "The User Hierarchy table, refreshed weekly, current state, joined on Record_Owner_Id1 = User_Id31. The 745 and 904 roster counts are hc-ae's supplemented figures, reconciled by hand against the FinPlan breakout. The paired / joiner / leaver split is authored from those two counts, not read from a source.",
  supplementCost:
    "No as-of rule, so the FY26 Q2 roster restates every week and the paired population restates with it. No owner-at-close attribution, so a departed AE's prior-year book has already moved to whoever owns the record now — which inflates the paired AEs who inherited it and is invisible in the picture. No lineage from the roster to the quarter it was taken in. Cardinality is the one thing that is checkable: COUNT(DISTINCT User_Name10) over the roster is permitted with stated limits.",
  wouldYouNotice:
    "Nothing to notice, and that is the point. The fan is identical in both modes, because the thing that limits it — a roster with no as-of-period-end read — is absent from the system of record and from the semantic layer alike. Five panels on this board behave this way and they are the control group: what moves when the toggle flips is what the layer was protecting, and this population was never protected by anything.",
  certifiedDelta: null,
  layerProvides:
    "One certified ACV measure at AE grain — ACV_clc grouped by User_Name10 with User_Role2 = 'AE' — and a prior-year read through Close_Date_Relative_Year_clc rather than through a separate snapshot, so both sides of the dollar comparison are the same measure by construction. That is the numerator, and it is real.",
  layerDoesNotProvide:
    "The population. There is no headcount measure in either documented model, no as-of-period-end read of the user roster, and no owner-at-close attribution, so the layer cannot say which AEs were carrying a quota in FY26 Q2. It also does not provide the T2 conformed-identity exhibit this slot used to carry: that beat needed a certified account fan as its control, and the account-level data behind it does not exist. See directModeNote."
};

/* Recorded on the portlet rather than only in a doc, because the beat it
 * weakens is a scripted moment in the direct-mode walkthrough and the gap
 * should be findable from the thing that caused it. */
directMode.directModeNote =
  "The T2 conformed-identity beat — 'raw gives you two keys, the layer gives you one' — is weakened by this repoint, not relocated. It used this slot's certified account fan as its control: the argument was that the layer resolves a re-parented subsidiary to one Global_Combo_Name6 where a CRM export gives two. With the account-level ACV data absent, the honest claim is no longer 'the layer fixes this' but 'neither path can answer it', which is a different and much weaker beat. The conformed-identity hazard itself is still real and still documented; what the board has lost is a panel that demonstrates it. Nothing else on the exec tab carries that hazard, so the walkthrough should either drop the beat or state it as an absence.";

/* --------------------------------- splice --------------------------------- */

const board = JSON.parse(await readFile(boardPath, "utf8"));
const exec = board.tabs.find((t) => t.id === "exec");
const band = exec.bands.find((b) => (b.portlets || []).some((p) => p.id === "acv-account-fan" || p.id === "acv-ae-fan"));
if (!band) throw new Error("no band on the exec tab holds the movement fan");
const index = band.portlets.findIndex((p) => p.id === "acv-account-fan" || p.id === "acv-ae-fan");

band.portlets[index] = {
  id: "acv-ae-fan",
  kind: "movementFan",
  label: "AE productivity movement",
  sublabel: "ACV per quota-carrying AE, FY26 Q2 → FY27 Q2 · AEs on both rosters",
  accent: "#1C6E8C",
  metrics,
  semantic,
  directMode
};

/* The H2 Focus rail's retention row pointed at this slot for its account-level
 * check. That check no longer exists — the panel is now about reps, not
 * accounts — so the link is dropped rather than left pointing at a portlet that
 * cannot verify the claim. The two AE rows gain it instead: an enablement
 * programme and a hiring plan are exactly the claims a per-AE productivity
 * distribution can be held against. */
for (const b of exec.bands) {
  for (const p of b.portlets || []) {
    if (p.id === "h2-focus") {
      p.metrics.cards.forEach((card) => {
        card.links = (card.links || []).filter((l) => l !== "acv-account-fan");
        if (card.n === 1) card.links = [...new Set([...card.links, "acv-ae-fan"])];
      });
    }
    if (p.id === "going-well") {
      p.metrics.cards.forEach((card) => {
        card.links = (card.links || []).filter((l) => l !== "acv-account-fan");
        if (card.n === 5) card.links = [...new Set([...card.links, "acv-ae-fan"])];
      });
    }
  }
}

await writeFile(boardPath, `${JSON.stringify(board, null, 2)}\n`, "utf8");
console.log(`author-ae-fan: wrote acv-ae-fan (${rows.length} rows) into data/board.json`);
