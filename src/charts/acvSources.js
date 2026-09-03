/* Where does ACV come from: five sales motions, six quarters, two panels.
 *
 * The portlet's argument is a pair of facts that a single chart cannot hold at
 * once. One is about LEVEL — the book climbs to $102.5M by FY26 Q4 and the
 * migration motion falls from $18.0M to $4.5M. The other is about SHARE —
 * Cloud & Server expansion is still 58% of total, in a quarter whose total is
 * a third smaller than the one before it. Stack the dollars and you can read
 * the level but not the share; normalise the stack and you can read the share
 * but not the level. So there are two panels over one axis, and keeping them
 * separable is the whole design:
 *
 *   dollars per motion, as lines      level and trajectory
 *   the same motions, as a 100% strip  composition, free of level
 *
 * WHAT WAS GIVEN UP TO FIT
 *
 * The source is a full slide and the destination is 410 x 124 CSS pixels at
 * the board's 1024 floor. Four things went, and each one bought something:
 *
 *   the y axis and every gridline  -> five direct endpoint labels instead, at
 *                                     the FY27 Q2 end, which is the only
 *                                     column any claim is about
 *   the total as a sixth line      -> printed under each quarter tick, so the
 *                                     $51.4M -> $102.5M -> $64.8M sequence
 *                                     survives as numerals and the five lines
 *                                     get the whole 49-unit band instead of
 *                                     the lower 60% of it
 *   full-height composition bars   -> a 24-unit strip, about 24px at the 1024
 *                                     floor, enough for the dominant band to
 *                                     carry its own numeral and not enough for
 *                                     the other four
 *   per-quarter value labels       -> tooltips and the expanded card; six
 *                                     quarters by five motions is thirty
 *                                     numerals and the slide printed nine
 *
 * The one thing not given up is separability. Collapsing the two panels into a
 * single stacked dollar chart would have fitted comfortably and would have
 * cost the portlet its headline: a 58% band whose baseline moves with the
 * total is not a share anybody can read off a picture.
 *
 * WHY THE LINES BREAK AT THE YEAR BOUNDARY
 *
 * FY27 has two quarters because two have happened, and a two-column panel
 * beside a four-column one reads as a collapse if the eye is allowed to run
 * across the join. So the years are two segments with a ruled gap, the way the
 * slide frames them: the Q4-to-Q1 step is a fiscal boundary, not a trend, and
 * the like-for-like read is FY26 H1 against FY27 H1, which the expanded card
 * states. */

import { chartRoot, svgEl, group, linePath, linearScale } from "../svg.js";
import { palette, tierMeta } from "../palette.js";
import { fadeIn, strokeDraw, stagger, wait, veil, countUp } from "../anim.js";

/* preserveAspectRatio is "none", the same deal the movement fan takes, so a
 * user unit is a fixed fraction of the plot box on each axis independently and
 * a percentage-positioned DOM label lands exactly on the mark it names. The
 * viewBox aspect is authored at 4.6 against a box that is 4.5 at the 1024
 * floor, so the distortion is under two percent and no mark is a circle. */
const W = 460;
const H = 100;

/* Three horizontal bands. The middle one is never drawn into — it is the axis,
 * and the axis is DOM text, because 8px of type inside a viewBox scaled from
 * 0.85x to 1.4x across the board's breakpoints is 7px of type on one screen
 * and 11px on another. */
const LINES = { top: 3, bottom: 52 };
const AXIS = { top: 52, bottom: 72 };
const STRIP = { top: 73, bottom: 97 };

const X0 = 8;
const X1 = 350; // the lines end here; 350 -> 460 is the endpoint-label gutter
const YEAR_GAP = 16;

const BAR_FILL = 0.72; // strip bar width as a fraction of a column
const LABEL_H = 11.5; // one endpoint label, in user units — the dodge spacing

/* Push a set of desired label positions apart until none overlaps, then hold
 * the whole set inside the band. One pass down and one pass up: with five
 * labels and a band 4.5 label-heights tall the set is nearly always saturated,
 * so this converges immediately and the order is never disturbed — which
 * matters, because the labels are ranked by value and a swap would be a lie. */
function dodge(desired, minGap, lo, hi) {
  const out = desired.slice();
  for (let i = 1; i < out.length; i += 1) {
    if (out[i] - out[i - 1] < minGap) out[i] = out[i - 1] + minGap;
  }
  if (out[out.length - 1] > hi) {
    out[out.length - 1] = hi;
    for (let i = out.length - 2; i >= 0; i -= 1) {
      if (out[i + 1] - out[i] < minGap) out[i] = out[i + 1] - minGap;
    }
  }
  if (out[0] < lo) {
    out[0] = lo;
    for (let i = 1; i < out.length; i += 1) {
      if (out[i] - out[i - 1] < minGap) out[i] = out[i - 1] + minGap;
    }
  }
  return out;
}

export function mount(host, ctx) {
  const { metrics, tier } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const motions = metrics.motions || [];
  const quarters = metrics.quarters || [];
  const form = metrics.form || {};
  const [, domainMax] = form.dollarDomain || [0, 65];

  const wrap = document.createElement("div");
  wrap.className = "acvs";

  /* ---- geometry ----
   * Six columns of equal width with one gap at the fiscal boundary, so the
   * axis is genuinely shared: a quarter occupies the same width in FY27 as it
   * does in FY26, and the strip bar sits under the line point it belongs to. */
  const years = [];
  quarters.forEach((q) => {
    const found = years.find((y) => y.name === q.year);
    if (found) found.n += 1;
    else years.push({ name: q.year, n: 1 });
  });
  const colw = (X1 - X0 - YEAR_GAP * (years.length - 1)) / quarters.length;

  let cursor = X0;
  let seen = 0;
  const cols = [];
  const yearSpans = [];
  years.forEach((y) => {
    yearSpans.push({ name: y.name, x0: cursor, x1: cursor + colw * y.n });
    for (let i = 0; i < y.n; i += 1) {
      cols.push({ q: quarters[seen + i], cx: cursor + colw * (i + 0.5), year: y.name });
    }
    cursor += colw * y.n + YEAR_GAP;
    seen += y.n;
  });

  const yDollars = linearScale([0, domainMax], [LINES.bottom, LINES.top]);

  const svg = chartRoot(W, H, {
    preserveAspectRatio: "none",
    class: "acvs-svg",
    label: `ACV by sales motion, ${quarters[0] ? quarters[0].label : ""} to ${
      quarters[quarters.length - 1] ? quarters[quarters.length - 1].label : ""
    } — dollars per motion above, 100% composition below, one quarterly axis`
  });
  const marks = group();
  svg.appendChild(marks);

  /* ---- the axis rule and the fiscal divider ----
   * The rule is the dollar panel's zero and the strip's shared tick line at
   * once, which is what makes the two panels one chart rather than two stacked
   * ones. The divider runs through both bands for the same reason. */
  const baseline = svgEl("path", {
    d: `M ${X0 - 3} ${LINES.bottom} H ${X1 + 3}`,
    stroke: p.axis,
    "stroke-width": 0.9,
    fill: "none",
    class: "acvs-baseline"
  });
  marks.appendChild(baseline);

  const dividers = [];
  for (let i = 0; i < yearSpans.length - 1; i += 1) {
    const x = yearSpans[i].x1 + YEAR_GAP / 2;
    const rule = svgEl("path", {
      d: `M ${x} ${LINES.top} V ${STRIP.bottom}`,
      stroke: p.ghost,
      "stroke-width": 0.7,
      "stroke-dasharray": "2.5 3",
      fill: "none",
      class: "acvs-divider"
    });
    marks.appendChild(rule);
    dividers.push(rule);
  }

  /* ---- panel one: dollars per motion ----
   * One path per motion per fiscal year. Two paths rather than one is the
   * whole point: a single six-point polyline would draw the Q4-to-Q1 step as
   * a trend line and the FY27 panel as a cliff. */
  const lineGroup = group({ class: "acvs-lines" });
  marks.appendChild(lineGroup);
  const linePaths = [];
  const endDots = [];

  motions.forEach((motion, mi) => {
    const g = group({ class: "acvs-motion", "data-motion": motion.id });
    lineGroup.appendChild(g);
    yearSpans.forEach((span) => {
      const pts = cols
        .filter((c) => c.year === span.name)
        .map((c) => ({ x: c.cx, y: yDollars(c.q.values[mi]) }));
      if (pts.length < 1) return;
      const path = svgEl("path", {
        d: pts.length > 1 ? linePath(pts) : `M ${pts[0].x - 4} ${pts[0].y} H ${pts[0].x + 4}`,
        fill: "none",
        stroke: motion.color,
        "stroke-width": 1.5,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        class: "acvs-line"
      });
      g.appendChild(path);
      linePaths.push(path);
    });

    /* A square rather than a disc. preserveAspectRatio "none" scales the two
     * axes independently, so a circle here would render as an ellipse whose
     * eccentricity changes with the breakpoint. */
    const lastCol = cols[cols.length - 1];
    const y = yDollars(lastCol.q.values[mi]);
    const dot = svgEl("rect", {
      x: lastCol.cx - 1.6,
      y: y - 1.6,
      width: 3.2,
      height: 3.2,
      fill: motion.color,
      class: "acvs-end-dot"
    });
    g.appendChild(dot);
    endDots.push(dot);

    /* One tooltip per motion carrying all six quarters, so the thirty values
     * the face cannot print are one hover away and the low four lines — which
     * are a 6-unit bundle at the bottom of the band — are still readable
     * individually. */
    ctx.tip(
      g,
      `${motion.label} · ${quarters
        .map((q) => `${q.q} ${q.values[mi].toFixed(1)}`)
        .join(" · ")} ($M) · ${motion.yoyDisplay || ""}`
    );
  });

  /* ---- panel two: the 100% composition strip ----
   * Bars are contiguous within a column — a gap between bands would take share
   * out of a whole that has to sum to 100 — with a hairline in the paper
   * colour between them, which is the same convention the alluvial used. */
  const stripGroup = group({ class: "acvs-strip" });
  marks.appendChild(stripGroup);
  const stripBars = [];
  const stripH = STRIP.bottom - STRIP.top;
  const barW = colw * BAR_FILL;

  cols.forEach((col) => {
    const g = group({ class: "acvs-bar", "data-quarter": col.q.id });
    stripGroup.appendChild(g);
    let y = STRIP.bottom;
    motions.forEach((motion, mi) => {
      const h = (col.q.shares[mi] / 100) * stripH;
      const rect = svgEl("rect", {
        x: col.cx - barW / 2,
        y: y - h,
        width: barW,
        height: Math.max(0.5, h),
        fill: motion.color,
        class: "acvs-band",
        "data-motion": motion.id
      });
      g.appendChild(rect);
      stripBars.push(rect);
      ctx.tip(
        rect,
        `${col.q.label} · ${motion.label} · ${col.q.shareDisplays[mi]} of ${col.q.totalDisplay} · ${col.q.displays[mi]}`
      );
      y -= h;
    });
  });

  host.appendChild(wrap);

  /* ---- the plot box and its label layer ---- */
  const canvas = document.createElement("div");
  canvas.className = "acvs-canvas";
  const plot = document.createElement("div");
  plot.className = "acvs-plot";
  plot.appendChild(svg);
  const labels = document.createElement("div");
  labels.className = "acvs-labels";
  plot.appendChild(labels);
  canvas.appendChild(plot);
  wrap.appendChild(canvas);

  const pctX = (x) => `${((x / W) * 100).toFixed(3)}%`;
  const pctY = (y) => `${((y / H) * 100).toFixed(3)}%`;

  function label(kind, x, y, lines, opts = {}) {
    const el = document.createElement("p");
    el.className = "acvs-label";
    el.dataset.kind = kind;
    el.style.left = pctX(x);
    el.style.top = pctY(y);
    if (opts.right) el.style.setProperty("--acvs-anchor", "100%");
    lines.forEach(([txt, cls]) => {
      const span = document.createElement("span");
      span.className = cls;
      span.textContent = txt;
      el.appendChild(span);
    });
    labels.appendChild(el);
    return el;
  }

  /* ---- the fiscal year labels ----
   * At the top of the dollar band, flush with the left edge of the year they
   * name, which is where the slide puts them and is the mark that stops FY27's
   * two columns reading as a fall. */
  const yearLabels = yearSpans.map((span) => {
    const el = label("year", span.x0, LINES.top, [[span.name, "acvs-label-year"]]);
    const qs = cols.filter((c) => c.year === span.name);
    ctx.tip(
      el,
      `${span.name} · ${qs.length} quarter${qs.length === 1 ? "" : "s"} drawn · ${qs
        .map((c) => `${c.q.q} ${c.q.totalDisplay}`)
        .join(" · ")}${
        qs.length < 4 ? " · fewer quarters because fewer have happened, not because the book fell" : ""
      }`
    );
    return el;
  });

  /* ---- the shared axis: quarter, and the total that is not drawn ---- */
  const axisLabels = [];
  const axisTotals = [];
  cols.forEach((col) => {
    const el = label("axis", col.cx, AXIS.top + 1, [
      [col.q.q, "acvs-label-q"],
      ["", "acvs-label-total"]
    ]);
    axisLabels.push(el);
    axisTotals.push({ el: el.querySelector(".acvs-label-total"), display: col.q.totalDisplay });
    ctx.tip(
      el,
      `${col.q.label} · ${col.q.totalDisplay} across five motions · ${motions
        .map((mo, mi) => `${mo.short} ${col.q.shareDisplays[mi]}`)
        .join(" · ")}`
    );
  });

  /* ---- the endpoint labels ----
   * These are the y axis. Ranked by FY27 Q2 dollars, dodged apart, each joined
   * to its own line end by a leader — so the gutter is a key, a scale and a
   * current ranking at once, in the 24% of the width a real axis would have
   * spent on six tick numerals nobody reads. */
  const ranked = motions
    .map((motion, mi) => ({ motion, mi, value: cols[cols.length - 1].q.values[mi] }))
    .sort((a, b) => b.value - a.value);
  const wanted = ranked.map((r) => yDollars(r.value));
  const placed = dodge(wanted, LABEL_H, LINES.top + LABEL_H / 2, LINES.bottom);

  const endLabels = [];
  const leaders = [];
  ranked.forEach((r, k) => {
    const y0 = yDollars(r.value);
    const y1 = placed[k];
    const el = label("end", X1 + 6, y1 - LABEL_H / 2 + 1.5, [
      [`${r.motion.short} ${r.motion.display}`, "acvs-label-end"]
    ]);
    el.style.setProperty("--acvs-tint", r.motion.color);
    endLabels.push(el);
    ctx.tip(
      el,
      `${r.motion.label} · ${cols[cols.length - 1].q.label} ${r.motion.display}, ${
        r.motion.shareDisplay
      } of total · ${cols[1] ? `${cols[1].q.label} ${r.motion.priorDisplay} · ` : ""}${
        r.motion.yoyDisplay || ""
      }`
    );

    const leader = svgEl("path", {
      d: linePath([
        { x: cols[cols.length - 1].cx + 2, y: y0 },
        { x: X1 - 2, y: y0 },
        { x: X1 + 3, y: y1 }
      ]),
      fill: "none",
      stroke: r.motion.color,
      "stroke-opacity": 0.5,
      "stroke-width": 0.7,
      class: "acvs-leader"
    });
    marks.appendChild(leader);
    leaders.push(leader);
  });

  /* ---- the one numeral in the strip ----
   * Only the dominant motion, in all six quarters. That sequence is the
   * headline claim — "still the largest contributor at 58% of total" — and it
   * is the one band tall enough to hold type at this strip height. The other
   * four are between 1.8% and 25.9%, which is 0.3 to 4.6 pixels. */
  const shareLabels = cols.map((col) => {
    const share = col.q.shares[0];
    const h = (share / 100) * stripH;
    const el = label("share", col.cx, STRIP.bottom - h / 2, [
      [`${share.toFixed(0)}%`, "acvs-label-share"]
    ]);
    ctx.tip(
      el,
      `${col.q.label} · ${motions[0] ? motions[0].label : ""} · ${col.q.shareDisplays[0]} of ${
        col.q.totalDisplay
      } · ${col.q.displays[0]}`
    );
    return el;
  });

  /* ---- the insight ----
   * Two of the three claims. The third — Cloud & Server expansion at 58% of
   * total — is the portlet's sublabel and the six numerals in the strip, so
   * repeating it here would spend the one flexible row on the one claim the
   * picture already makes. Line-clamped with min-height 0, so vertical
   * pressure at a tight breakpoint lands on the element that can lose a line
   * without losing a fact. */
  const insight = document.createElement("p");
  insight.className = "acvs-insight";
  insight.innerHTML = metrics.insight || "";
  wrap.appendChild(insight);

  const detail = buildDetail();
  if (detail) wrap.appendChild(detail);

  /* Every mark and every label, including the conditional leaders and the
   * strip's thirty bands. settle() restores whichever set a build never
   * reached, so a tab switch mid-sweep cannot leave a band invisible. */
  const curtain = veil([
    baseline,
    dividers,
    linePaths,
    endDots,
    leaders,
    stripBars,
    yearLabels,
    axisLabels,
    endLabels,
    shareLabels,
    insight
  ]);
  curtain.hide();

  async function build(signal) {
    /* Left to right, in the direction of time, and level before share: the
     * dollar panel is the one the reader has to trust before a normalised
     * strip means anything. */
    strokeDraw(baseline, { duration: 460, signal });
    stagger(yearLabels, { step: 120, delay: 120, duration: 360, y: 4, signal });
    dividers.forEach((rule, i) => fadeIn(rule, { delay: 200 + i * 90, duration: 340, signal }));

    await wait(220, signal);
    linePaths.forEach((path, i) => strokeDraw(path, { delay: i * 60, duration: 620, signal }));

    await wait(360, signal);
    stagger(axisLabels, { step: 70, duration: 300, y: 4, signal });
    axisTotals.forEach((t, i) =>
      countUp(t.el, t.display, { delay: 120 + i * 70, duration: 560, signal })
    );

    await wait(320, signal);
    endDots.forEach((dot, i) => fadeIn(dot, { delay: i * 70, duration: 260, signal }));
    leaders.forEach((l, i) => strokeDraw(l, { delay: 60 + i * 70, duration: 380, signal }));
    stagger(endLabels, { step: 80, delay: 140, duration: 380, y: 0, signal });

    await wait(340, signal);
    /* The strip arrives column by column rather than band by band, so the
     * thing that lands is a composition rather than five separate series —
     * and the dominant band's numeral arrives with its own column. */
    cols.forEach((col, i) => {
      const bands = stripBars.slice(i * motions.length, (i + 1) * motions.length);
      stagger(bands, { step: 40, delay: i * 90, duration: 300, y: 0, signal });
      fadeIn(shareLabels[i], { delay: i * 90 + 160, duration: 300, y: 0, signal });
    });

    await wait(520, signal);
    fadeIn(insight, { delay: 60, duration: 460, y: 8, signal });
  }

  /* ------------------------------ expanded card ----------------------------- */

  function buildDetail() {
    const prov = metrics.provenanceOfFigures;
    const rec = metrics.reconciliation;
    if (!prov && !rec && !metrics.claims) return null;

    const el = document.createElement("div");
    el.className = "portlet-detail";

    if (metrics.claims && metrics.claims.length) {
      el.appendChild(subhead("What this portlet claims"));
      el.appendChild(list(metrics.claims.map((c) => c.text)));
    }

    /* The thirty numerals the face gave up, laid out once. This is where the
     * "per-quarter value labelling" sacrifice is paid back. */
    el.appendChild(subhead("Dollars and share, by quarter"));
    const table = document.createElement("table");
    table.className = "acvs-table";
    const thead = document.createElement("thead");
    thead.appendChild(row(["", ...cols.map((c) => c.q.q)], "th"));
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    motions.forEach((motion, mi) => {
      const tr = row([
        motion.short,
        ...cols.map((c) => `${c.q.values[mi].toFixed(1)} · ${c.q.shares[mi].toFixed(0)}%`)
      ]);
      tr.style.setProperty("--acvs-tint", motion.color);
      tbody.appendChild(tr);
    });
    tbody.appendChild(row(["Total", ...cols.map((c) => c.q.total.toFixed(1))]));
    table.appendChild(tbody);
    el.appendChild(table);
    el.appendChild(
      note(
        `$M and share of quarter. ${
          (form.yearSplit || {}).h1Compare || ""
        }`
      )
    );

    if (form.sacrificed) {
      el.appendChild(subhead("What was given up to fit, and what it bought"));
      el.appendChild(list(form.sacrificed));
    }

    if (prov) {
      el.appendChild(subhead("Which figures are the slide's, and which are inference"));
      el.appendChild(note(prov.note));
      if (prov.fromStatedClaims) el.appendChild(list(prov.fromStatedClaims, "Stated on the slide"));
      if (prov.readFromTheChart) el.appendChild(list(prov.readFromTheChart, "Read off the chart"));
      if (prov.inferred) el.appendChild(list(prov.inferred, "Inferred"));
      if (prov.departsFromTheSlide) {
        el.appendChild(list(prov.departsFromTheSlide, "Where this departs from the slide"));
      }
    }

    if (rec) {
      el.appendChild(subhead("What it does not reconcile to"));
      el.appendChild(note(rec.doesNotReconcileTo));
    }

    return el;
  }

  function subhead(txt) {
    const el = document.createElement("p");
    el.className = "acvs-subhead";
    el.textContent = txt;
    return el;
  }

  function note(txt) {
    const el = document.createElement("p");
    el.className = "trend-table-note";
    el.textContent = txt || "";
    return el;
  }

  function list(items, lead) {
    const frag = document.createElement("div");
    if (lead) {
      const l = document.createElement("p");
      l.className = "acvs-list-lead";
      l.textContent = lead;
      frag.appendChild(l);
    }
    const ul = document.createElement("ul");
    ul.className = "acvs-list";
    items.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
    frag.appendChild(ul);
    return frag;
  }

  function row(cells, cellTag = "td") {
    const tr = document.createElement("tr");
    cells.forEach((c, i) => {
      const cell = document.createElement(i === 0 && cellTag === "td" ? "th" : cellTag);
      cell.textContent = c;
      tr.appendChild(cell);
    });
    return tr;
  }

  /* meta is read so a red-tier mount cannot be silently identical to a green
   * one: the strip's hairlines take the tier colour at low opacity, which is
   * the same cue every other panel's furniture takes. */
  plot.style.setProperty("--acvs-tier", meta.color);

  return { build, prime: curtain.hide, settle: curtain.settle };
}
