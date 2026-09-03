/* Every renewable account's ACV movement, drawn as one indexed fan.
 *
 * 260 accounts, each a line from a shared origin on the left to its own
 * position on an index axis at the right. The origin is an *index*, not a
 * dollar value: every account leaves at 100, meaning "whatever this account
 * was worth a year ago", and lands at round(currentK / priorK * 100). That is
 * the whole reason the form is honest for this data. A parallel-coordinates
 * or slope-graph reading of the same 260 pairs would put $9.8M and $85K on
 * one shared left-hand scale and assert that one account's baseline is
 * comparable to another's, which is exactly the claim this population cannot
 * support. Indexing refuses the claim and keeps the shape.
 *
 * What the shape says: a quarter of the base is above the reference and
 * three quarters below it, and the accounts above it are the heavy ones —
 * line weight is priorK, so the concentration is visible as ink rather than
 * asserted in a caption.
 *
 * Two operations are deliberately refused.
 *
 * The 18 new-logo rows have priorK = 0, so their index is undefined — not
 * zero, undefined. They are drawn as a labelled inflow stub in the left
 * gutter that stops short of the origin and never joins the axis. Dividing
 * by a zero baseline is the class of operation this board exists to refuse,
 * so the refusal is a visible, labelled mark rather than a footnote.
 *
 * And the group below the reference is "Contracted", never churn. Attrition
 * on this board is measured against the prior-period contract book across
 * the whole installed base; this is the Q2 bookings cohort. The two figures
 * are not subsets of each other at any stated grain, and the authored
 * reconciliation block says so in as many words.
 *
 * The marginal density at the right axis is computed from the rows, never
 * authored, so it cannot disagree with the lines it sits beside. Same for
 * the percentiles, which are computed and then checked against the authored
 * ones — the agreement is reported in the expand detail rather than assumed.
 *
 * preserveAspectRatio is "none". This portlet is full-width — about 1830 user
 * pixels at 1920 down to 960 at 1024 — over a band only ~100px tall, and no
 * fixed viewBox aspect survives that range: "meet" would letterbox a third of
 * the width away at the wide end. Every stroke carries a non-scaling stroke
 * so the hairlines stay hairlines under the non-uniform scale, no circles are
 * drawn, and every glyph of text is a DOM label positioned from the same
 * scale the marks use — which under "none" maps user units to the plot box
 * exactly, so a label cannot drift from the mark it names. */

import { chartRoot, svgEl, group, smoothPath, linearScale } from "../svg.js";
import { palette, toneColor, tierMeta } from "../palette.js";
import { countUp, scramble, strokeDraw, dashDraw, fadeIn, stagger, wait, veil } from "../anim.js";

const W = 1000;
const H = 200;
/* Barely any vertical padding: the band resolves to under 100px of plot even
 * at 1080 tall, so every user unit spent on margin is a real pixel taken off
 * the only axis the fan has. The largest expansion in the population is 194,
 * so the top of the range is nearly empty anyway. */
const PAD = { top: 9, bottom: 11 };

/* The left gutter carries the origin caption and the exclusion stub, so the
 * fan starts well inside the frame. The density sits outside the axis, in the
 * marginal-panel position, and the DOM label column sits outside that. */
const ORIGIN_X = 150;
const AXIS_X = 712;
const DENSITY = { x: 724, w: 118 };
const LABEL_X = 856;

const REFERENCE = 100;
const INDEX_MIN = 0;
const INDEX_MAX = 200;

/* Four bundles per group, interleaved, so eight groups animate rather than
 * 260 paths. 260 concurrent transitions and 260 inline style writes is a real
 * frame-budget problem on a band this size, and a per-line reveal is not
 * legible anyway. Element opacity on a <g> multiplies through its children,
 * so bundling is both cheaper and correct. */
const BUNDLES_PER_GROUP = 4;

/* priorK spans 85 to 9,834 — a 116-fold range — so a linear width map spends
 * the whole scale on the top ten accounts and renders the other 250 as one
 * indistinguishable weight. sqrt is the sub-linear map used here rather than
 * log: log flattens the top of the distribution, and the top is the story
 * (the ten largest accounts hold 37.7% of the certified $82M), so the map has
 * to keep the heaviest lines visibly heaviest. */
const WEIGHT = { min: 0.35, max: 2.5 };

/* Gaussian kernel, bandwidth 14. Silverman's rule on this population gives
 * 13.9 — 0.9 * min(sd 46.9, IQR/1.34 58.2) * n^(-1/5) — so 14 is that number
 * rounded rather than a number picked to make the curve look good.
 *
 * Deliberately no boundary reflection at 0. Reflection is the right treatment
 * for a distribution truncated at a boundary, but 0 here is a genuine atom:
 * 15 accounts renewed nothing at all. Mirroring them would double the density
 * at the bottom edge and put the curve's mode at total non-renewal, which is
 * false for 245 of the 260 lines beside it. */
const BANDWIDTH = 14;
const DENSITY_STEP = 2;

/* The percentiles the density curve is checked against, and the seven the
 * data file authors. */
const PERCENTILES = [5, 10, 25, 50, 75, 90, 95];

/* Only lines that start within this much of the reference are eligible for
 * the direct-mode re-basing artifact, because a re-parenting event moves an
 * account's whole prior year — it turns a flat line into an extreme one, and
 * it cannot turn an already-extreme line into anything more visible. */
const REBASE_WINDOW = 12;
const REBASE_HIGH = 184;

/* FNV-1a over the row id, normalised to [0, 1). Every per-line choice that is
 * not a data value — the curvature of the bundle, which lines the direct-mode
 * export re-bases — is drawn from this rather than from Math.random(), because
 * the Knowledge Layer toggle re-renders every portlet and a fan that reshuffled
 * on every toggle would make the degradation unreadable. */
function hashId(id) {
  let h = 2166136261;
  const text = String(id);
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/* R type 6 — the (n+1)p plotting position — on the rounded index values.
 * This is the convention the authored percentiles were computed under: all
 * seven reproduce exactly under it and none of them does under type 7, so it
 * is stated here rather than guessed at each call. */
function percentileOf(sorted, p) {
  const n = sorted.length;
  if (!n) return null;
  const h = ((n + 1) * p) / 100 - 1;
  const lo = Math.max(0, Math.min(n - 1, Math.floor(h)));
  const hi = Math.max(0, Math.min(n - 1, lo + 1));
  return Math.round(sorted[lo] + (sorted[hi] - sorted[lo]) * (h - lo));
}

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const form = metrics.form || {};
  const dist = metrics.distribution || {};
  const excluded = metrics.excluded || {};
  const reconciliation = metrics.reconciliation || {};
  const generator = metrics.generator || {};

  const originIndex = form.originIndex ?? REFERENCE;
  const referenceIndex = form.referenceLine ?? REFERENCE;
  const [rangeLow, rangeHigh] = form.indexRange || [INDEX_MIN, INDEX_MAX];

  const groups = metrics.groups || [];
  const expandingGroup = groups.find((g) => g.id === "expanding") || {};
  const contractingGroup = groups.find((g) => g.id === "contracting") || {};

  /* Columnar rows, indexed by name. Hard-coding positions would make the
   * renderer silently wrong the first time a column is inserted. */
  const columns = metrics.columns || [];
  const col = (name) => columns.indexOf(name);
  const cId = col("id");
  const cMotion = col("motion");
  const cSegment = col("segment");
  const cRegion = col("region");
  const cPriorK = col("priorK");
  const cCurrentK = col("currentK");
  const rows = metrics.rows || [];

  /* Two index values per account, and the distinction matters. `certified` is
   * what the rows say and is what the authored percentiles are a claim about.
   * `drawn` is what a direct-mode CRM export would put on the page, which is
   * the same thing except where the re-basing artifact has moved it. */
  const accounts = rows
    .filter((row) => Number(row[cPriorK]) > 0)
    .map((row) => {
      const priorK = Number(row[cPriorK]);
      const currentK = Number(row[cCurrentK]);
      const certified = Math.min(
        rangeHigh,
        Math.max(rangeLow, Math.round((currentK / priorK) * 100))
      );
      const noise = hashId(row[cId]);
      let drawn = certified;
      if (isDirect && Math.abs(certified - referenceIndex) <= REBASE_WINDOW) {
        if (noise < 0.17) drawn = rangeLow;
        else if (noise < 0.34) drawn = REBASE_HIGH;
      }
      return {
        id: row[cId],
        motion: row[cMotion],
        segment: row[cSegment],
        region: row[cRegion],
        priorK,
        currentK,
        certified,
        drawn,
        noise
      };
    });

  const newLogos = rows.filter((row) => Number(row[cPriorK]) === 0);

  const certifiedSorted = accounts.map((a) => a.certified).sort((a, b) => a - b);
  const computed = {};
  PERCENTILES.forEach((q) => {
    computed[`p${q}`] = percentileOf(certifiedSorted, q);
  });
  const authored = dist.percentiles || {};
  const percentileMismatches = PERCENTILES
    .map((q) => `p${q}`)
    .filter((key) => authored[key] != null && authored[key] !== computed[key])
    .map((key) => `${key}: computed ${computed[key]}, authored ${authored[key]}`);

  const expanding = accounts.filter((a) => a.certified > referenceIndex);
  const contracting = accounts.filter((a) => a.certified <= referenceIndex);
  const zeroed = accounts.filter((a) => a.certified === rangeLow).length;

  /* ---- scales ---- */
  const y = linearScale([rangeLow, rangeHigh], [H - PAD.bottom, PAD.top]);
  const yRef = y(referenceIndex);
  const yOrigin = y(originIndex);
  const fanSpan = AXIS_X - ORIGIN_X;

  const weights = accounts.map((a) => Math.sqrt(a.priorK));
  const wMin = Math.min(...weights);
  const wMax = Math.max(...weights);
  const weightAt = (priorK) => {
    const t = (Math.sqrt(priorK) - wMin) / (wMax - wMin || 1);
    return { t, width: WEIGHT.min + t * (WEIGHT.max - WEIGHT.min) };
  };

  const pctX = (userX) => `${((userX / W) * 100).toFixed(3)}%`;
  const pctY = (userY) => `${((userY / H) * 100).toFixed(3)}%`;

  /* ---- shell ---- */
  const wrap = document.createElement("div");
  wrap.className = "fan";

  /* The hero numeral is a *pair* — the authored headline is "25% / 75%", the
   * two group shares — so countUp cannot drive it: it parses one numeral out
   * of a string. The two shares are counted independently and the slash is
   * static, which reads as the split arriving rather than as one number
   * rolling. In direct mode the headline is not a number at all; it is the
   * authored refusal, and it scrambles through the candidate roll-ups first. */
  const head = document.createElement("div");
  head.className = "fan-head";
  const headline = document.createElement("p");
  headline.className = "fan-headline";
  /* Split so the separator keeps the exact authored spacing rather than being
   * re-typeset: the element's text then reads back as the authored headline
   * byte for byte, which is the same contract countUp keeps for a single
   * numeral. */
  const headlineSplit = String(metrics.headline || "").match(/^([^/]*?)(\s*\/\s*)(.*)$/);
  const headlineParts = headlineSplit ? [headlineSplit[1], headlineSplit[3]] : [];
  const countedShares = !isDirect && headlineParts.length === 2 && headlineParts.every((part) => /\d/.test(part));
  const shareEls = [];
  if (countedShares) {
    headlineParts.forEach((part, i) => {
      if (i) {
        const slash = document.createElement("span");
        slash.className = "fan-slash";
        slash.textContent = headlineSplit[2];
        headline.appendChild(slash);
      }
      const share = document.createElement("span");
      share.className = "fan-share";
      share.dataset.group = i === 0 ? "expanding" : "contracting";
      // Tint set from palette() rather than from a CSS sentiment token, so the
      // numeral pair repaints through the same path the marks do.
      share.style.setProperty("--share-tint", toneColor(i === 0 ? "positive" : "risk"));
      headline.appendChild(share);
      shareEls.push({ el: share, display: part });
    });
  } else {
    headline.dataset.contested = "true";
  }
  head.appendChild(headline);

  const headnote = document.createElement("p");
  headnote.className = "fan-headnote";
  headnote.textContent = metrics.headlineNote || "";
  head.appendChild(headnote);

  /* The caption rides in the head rather than on its own row. The band is a
   * share of viewport height and resolves to about 100px of body at 1280x800,
   * so a second full-width text row would come straight out of the plot. */
  const caption = document.createElement("p");
  caption.className = "fan-caption";
  caption.textContent = metrics.caption || "";
  head.appendChild(caption);
  wrap.appendChild(head);

  /* ---- plot: the SVG and the DOM label overlay share one box ---- */
  const plot = document.createElement("div");
  plot.className = "fan-plot";

  const svg = chartRoot(W, H, {
    label: `${ctx.label} — ${accounts.length} renewable accounts, each indexed to 100 at its own prior-year value; ${expanding.length} above the reference and ${contracting.length} below it`,
    class: "fan-svg",
    preserveAspectRatio: "none"
  });
  const marks = group();
  svg.appendChild(marks);

  const hair = (attrs) => svgEl("path", { "vector-effect": "non-scaling-stroke", fill: "none", ...attrs });

  const toneFor = (isExpanding) => {
    if (isDirect) return p.inkSoft;
    return toneColor(isExpanding ? "positive" : "risk");
  };

  /* ---- the fan ----
   * Every line is a cubic from the shared origin to its own index on the
   * axis, flat at both ends, so the bundle leaves the origin as one stroke
   * and separates as it travels. The release parameter is jittered per line
   * from the row id: that is aesthetic texture and encodes nothing — the only
   * two positions on a line that carry a value are the shared origin and the
   * terminal y — but it stops 260 identical curves reading as a single
   * airbrushed wedge, and being deterministic it is stable across the
   * re-render the Knowledge Layer toggle triggers.
   *
   * Within a bundle the heaviest lines are appended first so the light ones
   * paint over them, which is the origin-destination flow-map convention:
   * small flows are drawn over large ones or they disappear under them. */
  function linePathFor(account) {
    const release = 0.34 + account.noise * 0.16;
    const yEnd = y(account.drawn);
    const c1 = ORIGIN_X + fanSpan * release;
    const c2 = AXIS_X - fanSpan * release;
    return `M ${ORIGIN_X} ${yOrigin} C ${c1} ${yOrigin}, ${c2} ${yEnd}, ${AXIS_X} ${yEnd}`;
  }

  function bundlesFor(list, isExpanding) {
    const ordered = [...list].sort(
      (a, b) => Math.abs(a.certified - referenceIndex) - Math.abs(b.certified - referenceIndex)
    );
    const size = Math.ceil(ordered.length / BUNDLES_PER_GROUP) || 1;
    const out = [];
    for (let i = 0; i < ordered.length; i += size) {
      const slice = ordered.slice(i, i + size).sort((a, b) => b.priorK - a.priorK);
      const g = group({
        class: "fan-bundle",
        "data-group": isExpanding ? "expanding" : "contracting"
      });
      slice.forEach((account) => {
        const { t, width } = weightAt(account.priorK);
        g.appendChild(hair({
          d: linePathFor(account),
          stroke: toneFor(isExpanding),
          "stroke-width": width.toFixed(2),
          // stroke-opacity is a paint channel independent of element opacity,
          // so the bundle can be veiled and faded to opacity 1 while each line
          // keeps the translucency that lets 260 of them overlap legibly.
          "stroke-opacity": (0.24 + t * 0.26).toFixed(3),
          "stroke-linecap": "butt"
        }));
      });
      out.push(g);
    }
    return out;
  }

  // Interleaved so both halves of the split bloom together rather than one
  // colour arriving after the other.
  const contractingBundles = bundlesFor(contracting, false);
  const expandingBundles = bundlesFor(expanding, true);
  const bundles = [];
  for (let i = 0; i < Math.max(contractingBundles.length, expandingBundles.length); i += 1) {
    if (contractingBundles[i]) bundles.push(contractingBundles[i]);
    if (expandingBundles[i]) bundles.push(expandingBundles[i]);
  }
  bundles.forEach((g) => marks.appendChild(g));

  /* ---- the reference ----
   * Runs the full width of the frame, through the density and up to the label
   * column, so "100% flat" at the right edge names a line the reader can
   * follow all the way back to the origin. Dashed in direct mode for the same
   * reason the attainment tick is: the reference still exists, but nothing
   * certifies that the prior-year book it is drawn from was read at the right
   * moment. */
  const reference = hair({
    d: `M ${ORIGIN_X} ${yRef} H ${LABEL_X - 10}`,
    stroke: isDirect ? p.axis : p.ink,
    "stroke-opacity": isDirect ? 0.9 : 0.5,
    "stroke-width": 1,
    class: "fan-reference"
  });
  if (isDirect) reference.setAttribute("stroke-dasharray", "3 4");
  marks.appendChild(reference);

  const axis = hair({
    d: `M ${AXIS_X} ${y(rangeHigh)} V ${y(rangeLow)}`,
    stroke: p.axis,
    "stroke-width": 1,
    class: "fan-axis"
  });
  marks.appendChild(axis);

  /* ---- marginal density ----
   * Computed from the rows, split at the reference so it carries the same
   * two-colour reading as the fan. The split is a free check on the whole
   * construction: the area below the reference comes out at 74.8% against the
   * authored 75% share, so the curve and the lines cannot be telling different
   * stories. */
  const drawnValues = accounts.map((a) => a.drawn);
  const samples = [];
  for (let v = rangeLow; v <= rangeHigh; v += DENSITY_STEP) {
    let sum = 0;
    for (let i = 0; i < drawnValues.length; i += 1) {
      const z = (v - drawnValues[i]) / BANDWIDTH;
      sum += Math.exp(-0.5 * z * z);
    }
    samples.push({
      index: v,
      density: sum / (drawnValues.length * BANDWIDTH * Math.sqrt(2 * Math.PI))
    });
  }
  const peakDensity = Math.max(...samples.map((s) => s.density)) || 1;
  const densityX = (d) => DENSITY.x + (d / peakDensity) * DENSITY.w;

  const massBelow = samples
    .filter((s) => s.index < referenceIndex)
    .reduce((a, s) => a + s.density, 0);
  const massTotal = samples.reduce((a, s) => a + s.density, 0) || 1;
  const modalIndex = samples.reduce((best, s) => (s.density > best.density ? s : best), samples[0]).index;

  function densityHalf(from, to) {
    const points = samples
      .filter((s) => s.index >= from && s.index <= to)
      .map((s) => ({ x: densityX(s.density), y: y(s.index) }));
    if (points.length < 2) return null;
    const last = points[points.length - 1];
    return `${smoothPath(points)} L ${DENSITY.x} ${last.y} L ${DENSITY.x} ${points[0].y} Z`;
  }

  function densityNode(from, to, isExpanding) {
    const d = densityHalf(from, to);
    if (!d) return null;
    const node = svgEl("path", {
      d,
      "vector-effect": "non-scaling-stroke",
      // fill-opacity, not element opacity, so the build fades the node to 1
      // and settle() restores it to its authored translucency rather than
      // flooding the marginal panel.
      fill: isDirect ? "none" : toneFor(isExpanding),
      "fill-opacity": isDirect ? 0 : 0.34,
      stroke: isDirect ? p.inkSoft : toneFor(isExpanding),
      "stroke-opacity": isDirect ? 0.85 : 0.8,
      "stroke-width": isDirect ? 1 : 1.1,
      class: `fan-density is-${isExpanding ? "expanding" : "contracting"}`
    });
    // Without a conformed identity the population the curve describes is not
    // the population on the tile above it, so the curve loses its fill and
    // keeps only a dashed outline: a shape with no claim to be a measurement.
    if (isDirect) node.setAttribute("stroke-dasharray", "3 3");
    return node;
  }

  const densityDown = densityNode(rangeLow, referenceIndex, false);
  const densityUp = densityNode(referenceIndex, rangeHigh, true);
  if (densityDown) marks.appendChild(densityDown);
  if (densityUp) marks.appendChild(densityUp);

  /* ---- percentile marks ----
   * Computed, checked against the authored seven, and drawn straddling the
   * axis so they read as reference marks on it. The median is longer and
   * darker because it is the one the caption and the concentration note both
   * refer to; the other four carry their value in a tooltip rather than a
   * label, because five stacked labels inside 100px of plot collide. */
  const pctTicks = group({ class: "fan-pcts" });
  const pctHits = [];
  [10, 25, 50, 75, 90].forEach((q) => {
    const value = computed[`p${q}`];
    if (value == null) return;
    const isMedian = q === 50;
    const ty = y(value);
    pctTicks.appendChild(hair({
      d: `M ${AXIS_X - (isMedian ? 18 : 9)} ${ty} H ${AXIS_X + 6}`,
      stroke: p.ink,
      "stroke-opacity": isMedian ? 0.7 : 0.32,
      "stroke-width": isMedian ? 1.6 : 1,
      class: `fan-pct${isMedian ? " is-median" : ""}`
    }));
    const hit = svgEl("rect", {
      x: AXIS_X - 20,
      y: ty - 5,
      width: 30,
      height: 10,
      fill: "transparent",
      class: "fan-pct-hit"
    });
    ctx.tip(
      hit,
      `p${q} = ${value}. ${q}% of the ${accounts.length} renewable accounts kept ${value}% or less of what they had a year ago.`
    );
    pctHits.push(hit);
  });
  marks.appendChild(pctTicks);

  /* ---- the origin ----
   * A short vertical tick rather than a dot: under a non-uniform scale a
   * circle renders as a flat ellipse, and the tick reads as what it is — the
   * one position on the chart that every line shares. */
  const originMark = hair({
    d: `M ${ORIGIN_X} ${yOrigin - 13} V ${yOrigin + 13}`,
    stroke: isDirect ? meta.color : p.ink,
    "stroke-opacity": 0.85,
    "stroke-width": 2,
    class: "fan-origin"
  });
  marks.appendChild(originMark);

  /* ---- the exclusion stub ----
   * The 18 new logos arrive with $6M and no prior baseline, so they are drawn
   * as an inflow that stops before the axis, with a dotted bar marking where
   * it stops. Never a line on the index: their index is undefined, and a
   * stub that touched the origin would imply it was 100. */
  const exclusion = group({ class: "fan-exclusion" });
  const stubY = y(12);
  const stubTint = isDirect ? p.inkDim : p.inkSoft;
  exclusion.appendChild(hair({
    d: `M 56 ${stubY} H 108`,
    stroke: stubTint,
    "stroke-opacity": isDirect ? 0.6 : 0.75,
    "stroke-width": 5,
    "stroke-linecap": "butt",
    "stroke-dasharray": isDirect ? "4 4" : null
  }));
  // A chevron rather than a filled triangle: under a non-uniform scale a
  // triangle's fill stretches with the box while two non-scaling strokes keep
  // their weight, and the stub only has to read as arriving.
  exclusion.appendChild(hair({
    d: `M 106 ${stubY - 8} L 118 ${stubY} L 106 ${stubY + 8}`,
    stroke: stubTint,
    "stroke-opacity": isDirect ? 0.6 : 0.85,
    "stroke-width": 1.6,
    "stroke-linejoin": "round"
  }));
  // And a dotted stop bar, because what the mark is for is the *not* joining.
  exclusion.appendChild(hair({
    d: `M 130 ${stubY - 11} V ${stubY + 11}`,
    stroke: stubTint,
    "stroke-opacity": 0.8,
    "stroke-width": 1.2,
    "stroke-dasharray": "1.5 2"
  }));
  marks.appendChild(exclusion);
  ctx.tip(exclusion, excluded.reason || "");

  /* ---- tooltip targets ----
   * Bands, not lines. 260 listeners would be wasteful and a 0.4px stroke is
   * not a hit target, so the two group bands carry the read and the reference
   * gets its own strip on top of them. */
  const bandHit = (from, to, className) => svgEl("rect", {
    x: ORIGIN_X,
    y: Math.min(y(from), y(to)),
    width: fanSpan,
    height: Math.abs(y(to) - y(from)),
    fill: "transparent",
    class: className
  });

  const upperHit = bandHit(referenceIndex, rangeHigh, "fan-band-hit");
  const lowerHit = bandHit(rangeLow, referenceIndex, "fan-band-hit");
  marks.appendChild(lowerHit);
  marks.appendChild(upperHit);
  ctx.tip(
    upperHit,
    isDirect
      ? `${expanding.length} of the drawn lines land above 100. Without a conformed account identity that is a count of rows, not a share of a population — some of these are re-parenting artifacts.`
      : `${expandingGroup.label || "Expanded"} · ${expandingGroup.count} accounts · ${expandingGroup.shareDisplay} of the renewable base · ${expandingGroup.detail || ""}`
  );
  ctx.tip(
    lowerHit,
    isDirect
      ? `${contracting.length} of the drawn lines land at or below 100. Some are real contractions and some are baselines that moved after the quarter closed, and nothing in the export separates them.`
      : `${contractingGroup.label || "Contracted"} · ${contractingGroup.count} accounts · ${contractingGroup.shareDisplay} of the renewable base · ${contractingGroup.detail || ""}`
  );

  const referenceHit = svgEl("rect", {
    x: ORIGIN_X,
    y: yRef - 5,
    width: LABEL_X - 10 - ORIGIN_X,
    height: 10,
    fill: "transparent",
    class: "fan-reference-hit"
  });
  marks.appendChild(referenceHit);
  ctx.tip(
    referenceHit,
    `Index 100 — the account's own prior-year value. Every line leaves the origin here, so the reference is a comparison of one definition against itself rather than a shared dollar baseline.`
  );

  const originHit = svgEl("rect", {
    x: ORIGIN_X - 9,
    y: yOrigin - 15,
    width: 18,
    height: 30,
    fill: "transparent",
    class: "fan-origin-hit"
  });
  marks.appendChild(originHit);
  ctx.tip(
    originHit,
    `Shared origin · index ${originIndex} · ${accounts.length} accounts · ${metrics.priorTotalDisplay || ""} of prior-year ACV. The origin is an index, not a dollar value, so no account's baseline is implied to be any other's.`
  );

  plot.appendChild(svg);

  /* ---- DOM labels ----
   * Every glyph is DOM. Text inside a viewBox scales with the container, and
   * this portlet is nearly twice as wide at 1920 as at 1024, so a label
   * authored legibly at one end would be unreadable at the other. Positions
   * are percentages computed from the same scale the marks use. */
  const labels = document.createElement("div");
  labels.className = "fan-labels";
  plot.appendChild(labels);

  function label(kind, lines, style) {
    const node = document.createElement("p");
    node.className = "fan-label";
    node.dataset.kind = kind;
    lines.forEach(([text, className]) => {
      if (!text) return;
      const span = document.createElement("span");
      span.className = className;
      span.textContent = text;
      node.appendChild(span);
    });
    Object.assign(node.style, style);
    labels.appendChild(node);
    return node;
  }

  /* Anchored by the edge each label sits against rather than centred with a
   * translate. A translated label keeps its layout box where it was, so a
   * label pushed visually inside the plot still reports as overflow on
   * .portlet-body — and this portlet is inside a face that hides overflow,
   * which would make the clip silent. */
  const originLabel = label(
    "origin",
    [
      [`Q2 FY26 = ${originIndex}`, "fan-label-lead"],
      [`${accounts.length} accounts · ${metrics.priorTotalDisplay || ""}`, "fan-label-sub"]
    ],
    { left: "0", width: pctX(ORIGIN_X - 12), bottom: pctY(H - yOrigin + 4) }
  );

  const exclusionLabel = label(
    "exclusion",
    [
      [
        isDirect
          ? `${excluded.count} rows · basis unverified`
          : `+${excluded.count} new logos · ${excluded.totalDisplay || ""}`,
        "fan-label-lead"
      ],
      [isDirect ? "cohort not conformed" : "no prior baseline · no index", "fan-label-sub"]
    ],
    { left: "0", width: pctX(142), bottom: pctY(H - stubY + 5) }
  );

  /* The two group labels name a half of the frame rather than one mark, so
   * they are anchored to the ends of the index range; the reference and the
   * median name a specific line and track it. Both come off the same scale. */
  const expandedLabel = label(
    "expanded",
    isDirect
      ? [["above 100", "fan-label-lead"]]
      : [
        [expandingGroup.label || "Expanded", "fan-label-lead"],
        [`${expandingGroup.count} · ${expandingGroup.shareDisplay}`, "fan-label-sub"]
      ],
    { left: pctX(LABEL_X), top: pctY(y(rangeHigh)) }
  );

  const referenceLabel = label(
    "reference",
    [[`${referenceIndex}% flat`, "fan-label-lead"]],
    { left: pctX(LABEL_X), top: pctY(yRef), transform: "translateY(-50%)" }
  );

  /* The median is annotated inside the plot, right up against its own tick,
   * rather than out in the label column. It is the one number on the axis the
   * caption and the concentration note both lean on, and the column has no
   * row for it: at index 57 it lands two thirds of the way down, which is
   * exactly where the bottom group label is anchored. Sitting on the marks
   * behind a paper chip is the older and better answer than dropping it. */
  const medianLabel = label(
    "median",
    [[`${computed.p50}% median`, "fan-label-lead"]],
    {
      right: pctX(W - AXIS_X + 22),
      top: pctY(y(computed.p50 ?? 57)),
      transform: "translateY(-50%)"
    }
  );

  const contractedLabel = label(
    "contracted",
    isDirect
      ? [["at or below 100", "fan-label-lead"]]
      : [
        [contractingGroup.label || "Contracted", "fan-label-lead"],
        [`${contractingGroup.count} · ${contractingGroup.shareDisplay}`, "fan-label-sub"]
      ],
    { left: pctX(LABEL_X), bottom: pctY(H - y(rangeLow)) }
  );
  if (!isDirect) {
    expandedLabel.style.setProperty("--label-tint", toneColor("positive"));
    contractedLabel.style.setProperty("--label-tint", toneColor("risk"));
  }

  wrap.appendChild(plot);
  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  /* Every animated node, including every conditional one. A mark left out of
   * this list is mounted at full opacity and driven to zero when its beat
   * arrives — visible for as long as the sequence takes to reach it, then
   * flashing out and drawing back in. The bundles are here rather than their
   * 260 children, and settle() restores anything a beat never reached, which
   * is what makes the direct-mode-only and governed-only marks safe. */
  const curtain = veil([
    svg, head,
    originMark, reference, exclusion,
    bundles,
    axis, densityDown, densityUp, pctTicks,
    originLabel, exclusionLabel, expandedLabel, referenceLabel, medianLabel, contractedLabel
  ]);
  curtain.hide();

  /* ---- expand detail ----
   * The reconciliation block is the portlet's whole argument, and it belongs
   * here rather than on the face: the face renders the numbers faithfully and
   * makes no claim about them, and a variance chip or a warning badge on a
   * population that closes exactly would be inventing a doubt. */
  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    const insight = document.createElement("p");
    insight.className = "fan-insight";
    insight.innerHTML = metrics.insight || "";
    detail.appendChild(insight);

    if ((reconciliation.checks || []).length) {
      detail.appendChild(subhead("Reconciliation"));
      detail.appendChild(note(reconciliation.note));
      const list = document.createElement("ul");
      list.className = "fan-checks";
      reconciliation.checks.forEach((check) => {
        const li = document.createElement("li");
        li.textContent = check;
        list.appendChild(li);
      });
      detail.appendChild(list);
    }
    if (reconciliation.doesNotReconcileTo) {
      detail.appendChild(subhead("Does not reconcile to"));
      detail.appendChild(note(reconciliation.doesNotReconcileTo));
    }

    detail.appendChild(subhead("Distribution, computed from the rows"));
    const table = document.createElement("table");
    table.className = "trend-table fan-table";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["", "Computed", "Authored"].forEach((text, i) => {
      const th = document.createElement("th");
      th.textContent = text;
      if (!i) th.className = "trend-table-rowlabel";
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    PERCENTILES.forEach((q) => {
      const key = `p${q}`;
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.className = "trend-table-rowlabel";
      th.textContent = key;
      const a = document.createElement("td");
      a.textContent = computed[key] ?? "—";
      const b = document.createElement("td");
      b.textContent = authored[key] ?? "—";
      tr.appendChild(th);
      tr.appendChild(a);
      tr.appendChild(b);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    detail.appendChild(table);

    detail.appendChild(note(
      percentileMismatches.length
        ? `Computed percentiles disagree with the authored block — ${percentileMismatches.join("; ")}. The curve is drawn from the computed values; the authored ones are the claim under review.`
        : `All ${PERCENTILES.length} computed percentiles reproduce the authored block exactly, on the (n+1)p plotting position over the rounded index values. The density curve is drawn from the same rows, so it cannot disagree with the lines beside it.`
    ));
    detail.appendChild(note(
      `Marginal density: Gaussian kernel, bandwidth ${BANDWIDTH} (Silverman's rule gives 13.9 on this population), no boundary reflection, sampled every ${DENSITY_STEP} index points. ${(
        (massBelow / massTotal) * 100
      ).toFixed(1)}% of the curve's area sits below the reference against an authored ${contractingGroup.shareDisplay} share. The modal bulge sits at index ${modalIndex}, not at the median of ${computed.p50} — the ${zeroed} full non-renewals pull the mode left of the median, which is a property of a right-skewed population rather than of the binning.`
    ));
    if (dist.concentrationNote) detail.appendChild(note(dist.concentrationNote));

    detail.appendChild(subhead("Excluded from the fan"));
    detail.appendChild(note(
      `${newLogos.length} rows, cohort ${excluded.cohort || "newLogo"}, ${excluded.totalDisplay || ""}. ${excluded.reason || ""}`
    ));

    detail.appendChild(subhead("Line weight and colour"));
    detail.appendChild(note(
      `Stroke width is sqrt(priorK) mapped to ${WEIGHT.min}–${WEIGHT.max}px across a ${Math.round(wMin ** 2)}–${Math.round(wMax ** 2)} $K range, so the concentration is carried by ink rather than by a caption. Colour is the group split, painted from the mode-aware palette rather than from an authored hex, so the Knowledge Layer toggle repaints through one path.`
    ));

    if (generator.note) {
      detail.appendChild(subhead("Provenance of the mock"));
      detail.appendChild(note(`${generator.note} ${generator.emissionOrder || ""}`));
    }

    if (isDirect) {
      detail.appendChild(subhead("What the export does to this picture"));
      detail.appendChild(note((ctx.portlet.directMode || {}).effect || ""));
    }

    return detail;
  }

  function subhead(text) {
    const node = document.createElement("p");
    node.className = "fan-subhead";
    node.textContent = text;
    return node;
  }

  function note(text) {
    const node = document.createElement("p");
    node.className = "trend-table-note";
    node.textContent = text || "";
    return node;
  }

  /* The interior builds left to right, the same direction as the page sweep
   * this portlet is nested inside — and here that is the story anyway. The
   * origin and the two marks that sit beside it come first, then the
   * reference draws rightward out of the origin, then the fan opens outward
   * from that reference, and the density and the right-axis labels land last
   * because they are what the fan resolves into. */
  async function build(signal) {
    fadeIn(svg, { duration: 380, y: 4, signal });
    fadeIn(head, { duration: 400, y: 6, signal });
    if (countedShares) {
      shareEls.forEach(({ el, display }, i) =>
        countUp(el, display, { delay: 80 + i * 120, duration: 900, signal })
      );
    } else {
      const candidates = isDirect ? (ctx.portlet.directMode || {}).candidates : null;
      scramble(headline, candidates || [], metrics.headline || "", { delay: 100, signal });
    }
    fadeIn(originMark, { delay: 120, duration: 340, y: 0, scaleFrom: 0.4, signal });
    fadeIn(originLabel, { delay: 200, duration: 360, y: 0, x: -6, signal });

    await wait(220, signal);
    // dashDraw where the dashes carry meaning, strokeDraw where they do not:
    // strokeDraw consumes the dash pattern as its own reveal mechanism.
    if (isDirect) dashDraw(reference, { duration: 520, signal });
    else strokeDraw(reference, { duration: 620, signal });
    fadeIn(exclusion, { delay: 140, duration: 380, y: 0, x: -8, signal });
    fadeIn(exclusionLabel, { delay: 240, duration: 380, y: 0, signal });

    await wait(320, signal);
    // Ordered outward from the reference within each group and interleaved
    // across the two, so the fan visibly opens off the line it is measured
    // against rather than filling in from one edge.
    stagger(bundles, { step: 74, maxTotal: 560, duration: 420, y: 0, signal });

    await wait(640, signal);
    strokeDraw(axis, { duration: 400, signal });
    fadeIn(pctTicks, { delay: 160, duration: 360, y: 0, x: -5, signal });

    await wait(300, signal);
    if (densityDown) {
      if (isDirect) dashDraw(densityDown, { duration: 480, signal });
      else fadeIn(densityDown, { duration: 520, y: 0, x: -8, signal });
    }
    if (densityUp) {
      if (isDirect) dashDraw(densityUp, { delay: 90, duration: 480, signal });
      else fadeIn(densityUp, { delay: 90, duration: 520, y: 0, x: -8, signal });
    }

    await wait(280, signal);
    stagger([expandedLabel, referenceLabel, medianLabel, contractedLabel], {
      step: 80,
      maxTotal: 300,
      duration: 380,
      y: 0,
      x: -6,
      signal
    });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
