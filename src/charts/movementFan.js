/* Every paired AE's productivity movement, drawn as one indexed fan.
 *
 * 649 quota-carrying AEs, each a line from a shared origin on the left to its
 * own position on an index axis at the right. The origin is an *index*, not a
 * dollar value: every AE leaves at 100, meaning "whatever this rep sold a year
 * ago", and lands at round(currentK / priorK * 100). That is the whole reason
 * the form is honest for this data. A parallel-coordinates or slope-graph
 * reading of the same 649 pairs would put a $900K book and a $12K book on one
 * shared left-hand scale and assert that one rep's baseline is comparable to
 * another's, which is exactly the claim this population cannot support.
 * Indexing refuses the claim and keeps the shape.
 *
 * What the shape says: the fall is a tail, not a slide. Line weight is priorK,
 * so the heavy lines are the AEs who carried the biggest books a year ago —
 * and they are the ones diving. The other nine tenths of the population comes
 * in flat in aggregate. That answer is the reason this subject was chosen: the
 * two tiles above assert an 18% smaller roster selling 28% less and cannot say
 * whether the productivity fall is broad or concentrated.
 *
 * THE POPULATION IS PAIRED, AND THAT IS THIS RENDERER'S FIRST JOB
 *
 * docs/fan-repoint.md ranked this subject third and called it "the one to want
 * and not to build", for one reason: the AE roster is a current-state table on
 * a weekly refresh with no as-of-period-end read. A naive prior-year side is
 * last year's bookings redistributed across today's org, and with 351 AEs of
 * gross turnover between the two points that chart measures reorganisations
 * rather than productivity.
 *
 * So this draws only rows whose cohort is `paired`. Joiners and leavers are
 * held out as labelled stubs in the left gutter — the same treatment the
 * account fan gave its 18 new logos, applied twice, in the two directions.
 * An AE who exists at one end only never becomes a line, and the refusal is a
 * visible mark rather than a footnote. A leaver in particular would land at
 * index 0, where index 0 already means something else and true: "this AE was
 * here and booked nothing".
 *
 * Two further operations are deliberately refused.
 *
 * Nothing is silently clamped. The account population never overflowed its
 * [0, 200] range — its largest expansion was 194 — so the clamp in this file
 * never fired. An AE coming off a ramp year can triple, so the range is now
 * [0, 250] and the AEs still past it are counted on an explicit overflow
 * marker at the top of the axis. A line drawn at the top tick as though it
 * landed there is the class of thing this board argues against.
 *
 * And the group below the reference is "Sold less", never churn, and never
 * attrition. The 255 leavers are not the attrition tile either: attrition is
 * measured against the prior-period contract book across the whole installed
 * base, and this is a bookings cohort at rep grain. The authored
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
import { countUp, strokeDraw, fadeIn, stagger, wait, veil } from "../anim.js";

const W = 1000;
const H = 200;
/* Barely any vertical padding: the band resolves to under 100px of plot even
 * at 1080 tall, so every user unit spent on margin is a real pixel taken off
 * the only axis the fan has. 9 units at the top is exactly the headroom the
 * overflow caret needs and no more. */
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
const INDEX_MAX = 250;

/* Four bundles per group, interleaved, so eight groups animate rather than
 * 649 paths. 649 concurrent transitions and 649 inline style writes is a real
 * frame-budget problem on a band this size, and a per-line reveal is not
 * legible anyway. Element opacity on a <g> multiplies through its children,
 * so bundling is both cheaper and correct. */
const BUNDLES_PER_GROUP = 4;

/* An AE book spans roughly a 60-fold range, so a linear width map spends the
 * whole scale on the top few reps and renders the rest as one indistinguishable
 * weight. sqrt is the sub-linear map used here rather than log: log flattens
 * the top of the distribution, and the top is the story — the heaviest decile
 * fell 41% while the other nine tenths were flat — so the map has to keep the
 * heaviest lines visibly heaviest. The band is narrower than the account
 * population's was and there are two and a half times as many lines, so the
 * top of the range comes down: 2.5px strokes at 649 lines is a wash of ink. */
const WEIGHT = { min: 0.3, max: 1.7 };

/* Gaussian kernel. The bandwidth is authored in `form.bandwidth` rather than
 * held here, because it is a property of the population and not of the form:
 * Silverman's rule on the paired AE distribution gives 15.8, and on the
 * account population this file used to draw it gave 13.9. A constant in the
 * renderer would have silently carried the old smooth onto the new data.
 *
 * Deliberately no boundary reflection at 0. Reflection is the right treatment
 * for a distribution truncated at a boundary, but 0 here is a genuine atom:
 * five AEs were on the roster at both points and booked nothing this quarter.
 * Mirroring them would double the density at the bottom edge and put weight at
 * total non-productivity that 644 of the 649 lines beside it contradict. */
const BANDWIDTH_FALLBACK = 16;
const DENSITY_STEP = 2;

/* The two stubs and the origin caption share the left gutter, and at 87px of
 * plot the three label stacks have to be placed rather than left to land. The
 * numbers are user units on H = 200; the labels are anchored to them and the
 * spacing was chosen so that at the 1024 floor the three two-line stacks
 * occupy 8-29%, 36-57% and 63-84% of the box. */
const STUB_Y = { in: 62, out: 172 };

/* The percentiles the density curve is checked against, and the seven the
 * data file authors. */
const PERCENTILES = [5, 10, 25, 50, 75, 90, 95];

/* FNV-1a over the row id, normalised to [0, 1). The one per-line choice that
 * is not a data value — the curvature of a line within its bundle — is drawn
 * from this rather than from Math.random(), because the Knowledge Layer toggle
 * re-renders every portlet and a fan that reshuffled on every toggle would
 * make the two modes impossible to compare. */
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
  const { tier, isDirect } = ctx;
  let { metrics } = ctx;
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
  const bandwidth = form.bandwidth ?? BANDWIDTH_FALLBACK;

  /* The stubs, and the contract that makes the paired population safe.
   *
   * Each stub names the cohort it holds out, and a row whose cohort matches
   * any stub is never eligible to be a line. That is the opposite of the test
   * this file used to run — `priorK > 0`, which would have drawn all 255
   * leavers at index 0 — and the reason for the inversion is that a leaver's
   * currentK of 0 is arithmetically indistinguishable from a paired AE who
   * booked nothing. Only the cohort separates them, so only the cohort is
   * allowed to decide. */
  const stubs = excluded.stubs || [];
  const heldOut = new Set(stubs.map((s) => s.cohort).filter(Boolean));

  const groups = metrics.groups || [];
  /* Copied, not referenced: the direct-mode re-derivation below writes counts
   * onto these, and the spec object is shared with the provenance face and
   * with the next render of the other mode. */
  const expandingGroup = { ...(groups.find((g) => g.id === "expanding") || {}) };
  const contractingGroup = { ...(groups.find((g) => g.id === "contracting") || {}) };

  /* Columnar rows, indexed by name. Hard-coding positions would make the
   * renderer silently wrong the first time a column is inserted. */
  const columns = metrics.columns || [];
  const col = (name) => columns.indexOf(name);
  const cId = col("id");
  const cSegment = col("segment");
  const cRegion = col("region");
  const cCohort = col("cohort");
  const cPriorK = col("priorK");
  const cCurrentK = col("currentK");
  const rows = metrics.rows || [];

  /* Two index values per AE, and the distinction is the clamp fix. `raw` is
   * the arithmetic on the row and is what the percentile and density
   * computations use. `drawn` is where the line terminates, which for an AE
   * past the top of the range is the axis top — and `overflows` is what makes
   * that terminal legible instead of a silent lie. The old code kept only the
   * clamped value, so an AE at 295 and an AE at exactly 250 were the same
   * number by the time anything downstream saw them. */
  const paired = rows
    .filter((row) => !heldOut.has(row[cCohort]) && Number(row[cPriorK]) > 0)
    .map((row) => {
      const priorK = Number(row[cPriorK]);
      const currentK = Number(row[cCurrentK]);
      const raw = Math.round((currentK / priorK) * 100);
      return {
        id: row[cId],
        segment: row[cSegment],
        region: row[cRegion],
        priorK,
        currentK,
        raw,
        drawn: Math.min(rangeHigh, Math.max(rangeLow, raw)),
        overflows: raw > rangeHigh,
        underflows: raw < rangeLow,
        noise: hashId(row[cId])
      };
    });

  const overflowing = paired.filter((a) => a.overflows);

  /* Kept under its old name because the percentile block, the density curve
   * and the two group counts are all claims about the paired population as the
   * rows state it, before the range decides what can be drawn. */
  const rawSorted = paired.map((a) => a.raw).sort((a, b) => a - b);
  const computed = {};
  PERCENTILES.forEach((q) => {
    computed[`p${q}`] = percentileOf(rawSorted, q);
  });
  const authored = dist.percentiles || {};
  const percentileMismatches = PERCENTILES
    .map((q) => `p${q}`)
    .filter((key) => authored[key] != null && authored[key] !== computed[key])
    .map((key) => `${key}: computed ${computed[key]}, authored ${authored[key]}`);

  const expanding = paired.filter((a) => a.raw > referenceIndex);
  const contracting = paired.filter((a) => a.raw <= referenceIndex);

  /* Nothing is re-derived per mode any more, and the deletion is the honest
   * part of this repoint.
   *
   * The account fan moved individual lines in direct mode to model a
   * re-parented subsidiary arriving as two keys, and re-derived its counts
   * from the lines as drawn so the caption could not disagree with the
   * picture. That artifact belonged to the conformed-identity hazard, and the
   * conformed account key is exactly the thing that no longer applies: this
   * panel is keyed on a rep, and its hazard is a roster with no as-of read.
   * That limit is absent from a CRM export and from the semantic layer alike,
   * so the fan is identical in both modes and the portlet is supplemented.
   * Manufacturing a degradation here would be inventing a guarantee in order
   * to withdraw it. See directMode.wouldYouNotice. */
  const zeroed = paired.filter((a) => a.raw === rangeLow).length;
  const flatBand = form.flatBand || {};
  const flatWithin = flatBand.within ?? 2;
  const flat = paired.filter((a) => Math.abs(a.raw - referenceIndex) <= flatWithin).length;

  /* ---- scales ---- */
  const y = linearScale([rangeLow, rangeHigh], [H - PAD.bottom, PAD.top]);
  const yRef = y(referenceIndex);
  const yOrigin = y(originIndex);
  const fanSpan = AXIS_X - ORIGIN_X;

  const weights = paired.map((a) => Math.sqrt(a.priorK));
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
   * rolling. Both modes hand back a pair, so both count. */
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
  /* The shares count up in both modes. A direct read returns a share pair —
   * 31% / 69% over 288 keys rather than 25% / 75% over 260 — and returns it as
   * a pair of numbers, not as a phrase declining to be one. */
  const countedShares = headlineParts.length === 2 && headlineParts.every((part) => /\d/.test(part));
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
    label: `${ctx.label} — ${paired.length} quota-carrying AEs present on both rosters, each indexed to 100 at its own prior-year ACV; ${expanding.length} above the reference and ${contracting.length} below it. ${stubs.map((s) => `${s.count} ${s.id}`).join(" and ")} are held out of the axis.`,
    class: "fan-svg",
    preserveAspectRatio: "none"
  });
  const marks = group();
  svg.appendChild(marks);

  const hair = (attrs) => svgEl("path", { "vector-effect": "non-scaling-stroke", fill: "none", ...attrs });

  const toneFor = (isExpanding) => toneColor(isExpanding ? "positive" : "risk");

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
      (a, b) => Math.abs(a.raw - referenceIndex) - Math.abs(b.raw - referenceIndex)
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
   * column, so "index 100 · flat" at the right edge names a line the reader can
   * follow all the way back to the origin. Solid in both modes. The account
   * fan dashed it in direct mode, on the argument that the prior-year book it
   * was drawn from had not been read at the right moment; that argument is now
   * true in BOTH modes and so cannot be carried by a difference between them.
   * The whole picture is identical under the toggle, which is what a
   * supplemented panel is. */
  const reference = hair({
    d: `M ${ORIGIN_X} ${yRef} H ${LABEL_X - 10}`,
    stroke: p.ink,
    "stroke-opacity": 0.5,
    "stroke-width": 1,
    class: "fan-reference"
  });
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
  /* The RAW index, not the drawn one. Kernel-estimating the clamped values
   * piles all 22 overflowing AEs onto 250 and puts a wall at the top of the
   * curve — the same silent clamp this repoint set out to remove, reappearing
   * in the marginal panel. Estimated from the raw values the curve is simply
   * cut off by the axis, which is a boundary rather than a claim. */
  const drawnValues = paired.map((a) => a.raw);
  const samples = [];
  for (let v = rangeLow; v <= rangeHigh; v += DENSITY_STEP) {
    let sum = 0;
    for (let i = 0; i < drawnValues.length; i += 1) {
      const z = (v - drawnValues[i]) / bandwidth;
      sum += Math.exp(-0.5 * z * z);
    }
    samples.push({
      index: v,
      density: sum / (drawnValues.length * bandwidth * Math.sqrt(2 * Math.PI))
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
      fill: toneFor(isExpanding),
      "fill-opacity": 0.34,
      stroke: toneFor(isExpanding),
      "stroke-opacity": 0.8,
      "stroke-width": 1.1,
      class: `fan-density is-${isExpanding ? "expanding" : "contracting"}`
    });
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
      `p${q} = ${value}. ${q}% of the ${paired.length} paired AEs sold ${value}% or less of what they sold a year ago.`
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
    stroke: p.ink,
    "stroke-opacity": 0.85,
    "stroke-width": 2,
    class: "fan-origin"
  });
  marks.appendChild(originMark);

  /* ---- the exclusion stubs ----
   * Two of them, above and below the origin, and their direction is the
   * argument. The joiners arrive — 96 AEs with $5.3M and no prior quota, so
   * their prior-year ACV per AE is undefined rather than zero. The leavers
   * depart — 255 AEs with $27.5M of prior-year book and no current one.
   * Neither is ever a line on the index: a joiner's index does not exist, and
   * a leaver's would be 0, which is a position on this axis that already means
   * something else and true.
   *
   * Both stubs stop short of the origin behind a dotted bar, because what the
   * mark is for is the *not* joining. The inflow points right, into the fan;
   * the outflow points left, away from it. That is the only difference between
   * them and it is the whole read. */
  const stubTint = p.inkSoft;

  function stubMark(stub) {
    const node = group({ class: "fan-exclusion", "data-stub": stub.id || "" });
    const out = stub.direction === "out";
    // Anchored in user units rather than through the index scale: these marks
    // sit OUTSIDE the axis by construction, so putting them on it — even only
    // to position them — is the category error the stub exists to refuse.
    const my = out ? STUB_Y.out : STUB_Y.in;
    node.appendChild(hair({
      d: out ? `M 118 ${my} H 66` : `M 56 ${my} H 108`,
      stroke: stubTint,
      "stroke-opacity": 0.75,
      "stroke-width": 5,
      "stroke-linecap": "butt"
    }));
    /* A chevron rather than a filled triangle: under a non-uniform scale a
     * triangle's fill stretches with the box while two non-scaling strokes
     * keep their weight, and the stub only has to read as arriving or
     * leaving. */
    node.appendChild(hair({
      d: out
        ? `M 68 ${my - 8} L 56 ${my} L 68 ${my + 8}`
        : `M 106 ${my - 8} L 118 ${my} L 106 ${my + 8}`,
      stroke: stubTint,
      "stroke-opacity": 0.85,
      "stroke-width": 1.6,
      "stroke-linejoin": "round"
    }));
    // The dotted stop bar always sits on the axis side, whichever way the
    // arrow points: it marks the boundary the cohort is not allowed to cross.
    node.appendChild(hair({
      d: `M 130 ${my - 11} V ${my + 11}`,
      stroke: stubTint,
      "stroke-opacity": 0.8,
      "stroke-width": 1.2,
      "stroke-dasharray": "1.5 2"
    }));
    marks.appendChild(node);
    ctx.tip(node, `${stub.count} AEs ${stub.label || ""} · ${stub.totalDisplay || ""}. ${stub.reason || ""}`);
    return node;
  }

  const stubMarks = stubs.map(stubMark);

  /* ---- the overflow marker ----
   * The clamp fix, made visible. Lines past the top of the range terminate on
   * the axis top because there is nowhere else for them to go, and without
   * this mark that terminal is indistinguishable from an AE who landed exactly
   * at 250. A caret above the axis and a counted label say how many of the
   * terminals up there are not values. Drawn only when the population
   * overflows, so on a population that fits — which the account population
   * this file used to draw always did — there is no mark and no claim. */
  const overflowMark = overflowing.length
    ? group({ class: "fan-overflow" })
    : null;
  if (overflowMark) {
    const top = y(rangeHigh);
    overflowMark.appendChild(hair({
      d: `M ${AXIS_X - 8} ${top + 5} L ${AXIS_X} ${top - 3} L ${AXIS_X + 8} ${top + 5}`,
      stroke: p.ink,
      "stroke-opacity": 0.75,
      "stroke-width": 1.5,
      "stroke-linejoin": "round"
    }));
    overflowMark.appendChild(hair({
      d: `M ${AXIS_X - 8} ${top + 10} L ${AXIS_X} ${top + 2} L ${AXIS_X + 8} ${top + 10}`,
      stroke: p.ink,
      "stroke-opacity": 0.4,
      "stroke-width": 1.2,
      "stroke-linejoin": "round"
    }));
    marks.appendChild(overflowMark);
    ctx.tip(
      overflowMark,
      `${overflowing.length} of the ${paired.length} paired AEs land above ${rangeHigh} — the largest at ${Math.max(
        ...overflowing.map((a) => a.raw)
      )}. Their lines stop at the top of the axis because the axis stops there, not because that is where they landed. ${(form.overflow || {}).note || ""}`
    );
  }

  /* ---- tooltip targets ----
   * Bands, not lines. 649 listeners would be wasteful and a 0.4px stroke is
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
  /* One read per band in both modes. There is no direct-mode variant here any
   * more, because the fan itself has none: the roster limit that makes this
   * panel supplemented is the same limit on both sides of the toggle. */
  ctx.tip(
    upperHit,
    `${expandingGroup.label || "Sold more"} · ${expandingGroup.count} AEs · ${expandingGroup.shareDisplay} of the paired population · ${expandingGroup.detail || ""}`
  );
  ctx.tip(
    lowerHit,
    `${contractingGroup.label || "Sold less"} · ${contractingGroup.count} AEs · ${contractingGroup.shareDisplay} of the paired population · ${contractingGroup.detail || ""}`
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
    `Index 100 — the AE's own prior-year ACV. Every line leaves the origin here, so the reference is a comparison of one definition against itself rather than a shared dollar baseline.`
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
    `Shared origin · index ${originIndex} · ${paired.length} AEs on both rosters · ${metrics.priorTotalDisplay || ""} of prior-year ACV. The origin is an index, not a dollar value, so no rep's baseline is implied to be any other's — and it is a paired population, so no line is a comparison against an AE who was not here.`
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
      [`FY26 Q2 = ${originIndex}`, "fan-label-lead"],
      [`${paired.length} paired AEs · ${metrics.priorTotalDisplay || ""}`, "fan-label-sub"]
    ],
    { left: "0", width: pctX(ORIGIN_X - 12), bottom: pctY(H - yOrigin + 4) }
  );

  /* One label per stub, anchored above its own mark. The three stacks in this
   * gutter — inflow, origin, outflow — resolve to 8-29%, 36-57% and 63-84% of
   * the plot box at the 1024 floor, which is the tightest of the three review
   * sizes, so none of them can be drawn on another.
   *
   * 158 rather than 142: the box has to hold the longest string these labels
   * ever carry at the 1024 floor. They are nowrap with nothing to their right
   * to paint over, so they never actually clip — but a label whose declared
   * width is narrower than its text reports as overflow, and the note above
   * says the reason these are edge-anchored is so that overflow here always
   * means something. */
  const stubLabels = stubs.map((stub) => {
    const out = stub.direction === "out";
    const my = out ? STUB_Y.out : STUB_Y.in;
    return label(
      "exclusion",
      [
        [`${out ? "−" : "+"}${stub.count} ${stub.id} · ${stub.totalDisplay || ""}`, "fan-label-lead"],
        [out ? "FY26 roster only · no index" : "no prior quota · no index", "fan-label-sub"]
      ],
      { left: "0", width: pctX(158), bottom: pctY(H - my + 5) }
    );
  });

  /* The two group labels name a half of the frame rather than one mark, so
   * they are anchored to the ends of the index range; the reference and the
   * median name a specific line and track it. Both come off the same scale. */
  const expandedLabel = label(
    "expanded",
    [
      [expandingGroup.label || "Sold more", "fan-label-lead"],
      [`${expandingGroup.count} · ${expandingGroup.shareDisplay}`, "fan-label-sub"]
    ],
    { left: pctX(LABEL_X), top: pctY(y(rangeHigh)) }
  );

  /* The overflow count, on the marks rather than in the label column: the
   * column's top row is the upper group label, and the count belongs against
   * the caret it explains. Same paper chip as the median for the same reason.
   * Null when nothing overflows, and the veil list takes it either way. */
  const overflowLabel = overflowing.length
    ? label(
      "overflow",
      [[`${overflowing.length} above ${rangeHigh}`, "fan-label-lead"]],
      { right: pctX(W - AXIS_X + 22), top: pctY(y(rangeHigh)) }
    )
    : null;

  const referenceLabel = label(
    "reference",
    [[`index ${referenceIndex} · flat`, "fan-label-lead"]],
    { left: pctX(LABEL_X), top: pctY(yRef), transform: "translateY(-50%)" }
  );

  /* The median is annotated inside the plot, right up against its own tick,
   * rather than out in the label column. It is the one number on the axis the
   * caption and the concentration note both lean on, and the column has no
   * row for it: at index 91 it lands just under the reference, which is where
   * the reference label is anchored. Sitting on the marks behind a paper chip
   * is the older and better answer than dropping it. */
  const medianLabel = label(
    "median",
    [[`${computed.p50}% median`, "fan-label-lead"]],
    {
      right: pctX(W - AXIS_X + 22),
      top: pctY(y(computed.p50 ?? referenceIndex)),
      transform: "translateY(-50%)"
    }
  );

  const contractedLabel = label(
    "contracted",
    [
      [contractingGroup.label || "Sold less", "fan-label-lead"],
      [`${contractingGroup.count} · ${contractingGroup.shareDisplay}`, "fan-label-sub"]
    ],
    { left: pctX(LABEL_X), bottom: pctY(H - y(rangeLow)) }
  );
  expandedLabel.style.setProperty("--label-tint", toneColor("positive"));
  contractedLabel.style.setProperty("--label-tint", toneColor("risk"));

  wrap.appendChild(plot);
  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  /* Every animated node, including every conditional one. A mark left out of
   * this list is mounted at full opacity and driven to zero when its beat
   * arrives — visible for as long as the sequence takes to reach it, then
   * flashing out and drawing back in. The bundles are here rather than their
   * 649 children, and settle() restores anything a beat never reached, which
   * is what makes the conditional marks safe.
   *
   * The two stub marks, the two stub labels, the overflow caret and the
   * overflow count are all new here, and all six are in the list. veil()
   * flattens and drops falsy entries, so the overflow pair can be null on a
   * population that does not overflow without the list having to branch. */
  const curtain = veil([
    svg, head,
    originMark, reference, stubMarks, overflowMark,
    bundles,
    axis, densityDown, densityUp, pctTicks,
    originLabel, stubLabels, expandedLabel, referenceLabel, medianLabel, contractedLabel, overflowLabel
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
      `Marginal density: Gaussian kernel, bandwidth ${bandwidth}, read from form.bandwidth rather than held in the renderer. ${
        form.bandwidthNote || ""
      } No boundary reflection, sampled every ${DENSITY_STEP} index points. ${(
        (massBelow / massTotal) * 100
      ).toFixed(1)}% of the curve's area sits below the reference against an authored ${contractingGroup.shareDisplay} share. The modal bulge sits at index ${modalIndex} against a median of ${computed.p50}, and the ${zeroed} AEs who booked nothing pull the mode left of it — a property of a right-skewed population rather than of the binning.`
    ));
    if (dist.concentrationNote) detail.appendChild(note(dist.concentrationNote));

    detail.appendChild(subhead("The range, and what is past it"));
    detail.appendChild(note(
      overflowing.length
        ? `${overflowing.length} of the ${paired.length} paired AEs index above ${rangeHigh}, the largest at ${Math.max(
          ...overflowing.map((a) => a.raw)
        )}: ${overflowing
          .map((a) => a.raw)
          .sort((x, z) => z - x)
          .slice(0, 12)
          .join(", ")}${overflowing.length > 12 ? ", …" : ""}. Their lines terminate on the axis top and the caret above it carries the count, so a terminal up there is never read as a value. ${
          (form.overflow || {}).note || ""
        }`
        : `Nothing in this population indexes above ${rangeHigh}, so no overflow marker is drawn. The claim is made by its absence rather than by a mark saying zero.`
    ));
    detail.appendChild(note(
      `${flat} of ${paired.length} AEs land within ${flatWithin} index points of the reference — ${(
        (flat / paired.length) * 100
      ).toFixed(1)}% of the population. ${(form.flatBand || {}).note || ""}`
    ));

    detail.appendChild(subhead("Held out of the fan"));
    stubs.forEach((stub) => {
      const rowsIn = rows.filter((row) => row[cCohort] === stub.cohort).length;
      detail.appendChild(note(
        `${rowsIn} rows, cohort ${stub.cohort}, ${stub.totalDisplay || ""}. ${stub.reason || ""} ${stub.renderAs || ""}`
      ));
    });
    if (excluded.note) detail.appendChild(note(excluded.note));

    detail.appendChild(subhead("Line weight and colour"));
    detail.appendChild(note(
      `Stroke width is sqrt(priorK) mapped to ${WEIGHT.min}–${WEIGHT.max}px across a ${Math.round(wMin ** 2)}–${Math.round(wMax ** 2)} $K range, so the finding is carried by ink rather than by a caption: the heavy lines are the AEs who carried the biggest books a year ago, and they are the ones falling. Colour is the group split, painted from the mode-aware palette rather than from an authored hex, so the Knowledge Layer toggle repaints through one path.`
    ));

    if (generator.note) {
      detail.appendChild(subhead("Provenance of the mock"));
      detail.appendChild(note(`${generator.note} ${generator.emissionOrder || ""}`));
    }

    /* No "what the export does to this picture" section, because it does
     * nothing to it. The panel is supplemented: what limits it is a roster
     * with no as-of-period-end read, and that limit is absent from the
     * semantic layer and from a CRM export alike. The direct-mode read is on
     * the provenance face, where a portlet with no degraded figure belongs. */
    if (isDirect) {
      detail.appendChild(subhead("Why this panel does not move"));
      detail.appendChild(note((ctx.portlet.directMode || {}).wouldYouNotice || ""));
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
    /* One share pair, one beat, both modes. The figures are identical across
     * the toggle here, so there is nothing to branch on. */
    shareEls.forEach(({ el, display }, i) =>
      countUp(el, display, { delay: 80 + i * 120, duration: 900, signal })
    );
    fadeIn(originMark, { delay: 120, duration: 340, y: 0, scaleFrom: 0.4, signal });
    fadeIn(originLabel, { delay: 200, duration: 360, y: 0, x: -6, signal });

    await wait(220, signal);
    strokeDraw(reference, { duration: 620, signal });
    /* The inflow slides in from the left and the outflow slides out to the
     * left, each in the direction its arrow points, so the two stubs read as
     * the two different things they are before either label arrives. */
    stubMarks.forEach((node, i) => fadeIn(node, {
      delay: 140 + i * 90,
      duration: 380,
      y: 0,
      x: stubs[i] && stubs[i].direction === "out" ? 8 : -8,
      signal
    }));
    stagger(stubLabels, { delay: 240, step: 90, maxTotal: 180, duration: 380, y: 0, signal });

    await wait(320, signal);
    // Ordered outward from the reference within each group and interleaved
    // across the two, so the fan visibly opens off the line it is measured
    // against rather than filling in from one edge.
    stagger(bundles, { step: 74, maxTotal: 560, duration: 420, y: 0, signal });

    await wait(640, signal);
    strokeDraw(axis, { duration: 400, signal });
    fadeIn(pctTicks, { delay: 160, duration: 360, y: 0, x: -5, signal });
    /* The overflow caret lands with the axis rather than with the labels,
     * because it is a statement about the axis: it says where the axis stops.
     * Nudged down into place so the two chevrons read as arriving from below,
     * which is the direction the lines under them came from. */
    if (overflowMark) fadeIn(overflowMark, { delay: 220, duration: 360, y: 5, signal });

    await wait(300, signal);
    if (densityDown) fadeIn(densityDown, { duration: 520, y: 0, x: -8, signal });
    if (densityUp) fadeIn(densityUp, { delay: 90, duration: 520, y: 0, x: -8, signal });

    await wait(280, signal);
    stagger([expandedLabel, referenceLabel, medianLabel, contractedLabel, overflowLabel].filter(Boolean), {
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
