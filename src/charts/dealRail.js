/* The top five open deals, against the thing they are for.
 *
 * Five deals spanning $3M to $2.1M is a 1.4x range, and two of the five are
 * tied at each end of it, so a length encoding of rank spends its one channel
 * rendering ties. That was the old rail: five near-identical bars, correct and
 * uninformative. The interesting question about five deals worth $12.5M is not
 * their order, it is what they do to the quarter.
 *
 * So the scale is the quarter's derived gap to plan, and the five deals are
 * laid end to end along it. The bar's fill is how much of the shortfall these
 * five would close if every one of them landed, and the space left at its end
 * is what would still have to be found. Ties stop being a defect: two $3M
 * deals are two identical segments, which is what they are.
 *
 * `metrics.gap` states the two authored figures the gap derives from — the
 * commit and its attainment percentage — rather than importing a number from
 * another portlet, so this renderer stays self-contained and the derivation
 * stays visible in the data file. Plan and gap are computed here, exactly, and
 * carry the board's derived tag wherever they are drawn.
 *
 * The comparison crosses a measure boundary and says so: the deals are open
 * pipe and the gap is derived from a commit. It is a comparison of size, not a
 * sum, and the caption states that rather than leaving it implied.
 *
 * Without a gap — in direct mode, where the attainment has no denominator and
 * so the gap would be three different gaps — the portlet falls back to the
 * ranked lollipop rail on a zero-based linear dollar scale. The deals survive;
 * what they are measured against does not.
 *
 * The bars are DOM, not SVG. `growFrom` animates DOM elements as readily as
 * marks, and keeping the bars in the DOM buys the one property this portlet
 * cannot afford to lose: every width is `calc(var(--deal-value) /
 * var(--deal-scale) * 100%)`, resolved once by the layout engine, so two deals
 * authored at the same value are the same number of pixels by construction
 * rather than by a rounding step that happens to agree.
 *
 * Colour is the accent, never sentiment. A deal size has no direction of good,
 * and tinting these by tone would invent one. */

import { chartRoot, svgEl } from "../svg.js";
import { palette, tierMeta, toneColor } from "../palette.js";
import { countUp, strokeDraw, fadeIn, growFrom, stagger, wait, veil } from "../anim.js";

/* Derived, exactly, from the two authored figures the gap block states. */
function deriveGap(gap) {
  if (!gap || !gap.basis) return null;
  const value = Number(gap.basis.value);
  const pct = Number(gap.basis.plan) / 100;
  if (!Number.isFinite(value) || !Number.isFinite(pct) || pct === 0) return null;
  const plan = value / pct;
  const size = plan - value;
  return size > 0 ? { plan, size } : null;
}

function fmt(n, format = {}) {
  const decimals = format.decimals == null ? 1 : format.decimals;
  const body = Math.abs(n).toFixed(decimals).replace(/\.0+$/, "");
  return `${format.prefix || ""}${body}${format.suffix || ""}`;
}

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const deals = metrics.deals || [];
  const scaleMax = Number(metrics.scaleMax) || 1;

  /* The gap is the scale when there is one. In direct mode there is not: the
   * attainment has no denominator a direct read can reach, and the commit it
   * would be derived from is itself one of three candidates, so the gap would
   * be three different gaps. Rather than pick one of them silently, the scale
   * falls back to the authored total.
   *
   * The composition survives that, and survives this portlet's own direct-mode
   * finding as well. What goes ungoverned here is the *ordering* — the gap
   * between third and fifth place is smaller than the gap between the four
   * candidate amount columns — and a total laid end to end is invariant to the
   * order of its parts. The bar says the same thing whichever sequence the
   * segments are in, which is the one honest thing left to say about five
   * amounts nobody can rank. */
  const gapSpec = metrics.gap;
  const gapMode = Boolean(gapSpec && gapSpec.basis);
  const gap = isDirect ? null : deriveGap(gapSpec);
  const gapFormat = (gapSpec && gapSpec.format) || {};
  // Exact arithmetic on the authored amounts, which is also the check that the
  // authored total is the sum it claims to be.
  const dealsTotal = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
  const scale = gap ? gap.size : dealsTotal;
  const residual = gap ? gap.size - dealsTotal : 0;

  /* The rank chips stay on. Nothing here goes missing and nothing here
   * hesitates: all five accounts, all five amounts, numbered one to five in
   * the order the query returned them. Two of the five are in the wrong place,
   * because the gap between third and fifth is smaller than the gap between
   * the four candidate amount columns — and a numbered list is exactly as
   * confident when it is misordered as when it is not.
   *
   * The gap-to-plan the rail is laid along is a different matter and does go:
   * it derives from an attainment with no denominator in raw source. */
  const rankIsVoid = false;
  const tint = ctx.accent;

  const wrap = document.createElement("div");
  wrap.className = "deals";
  wrap.style.setProperty("--deal-tint", tint);
  if (rankIsVoid) wrap.dataset.void = "true";
  wrap.dataset.mode = gapMode ? "gap" : "rank";

  if (gapMode) return mountGap();

  /* The rail holds far more height than five rows need, so the rows sit as one
   * centred block inside a taller well. The block is its own element rather
   * than a centred flex child so the baseline can span the rows it is the zero
   * of, and stop there instead of ruling through the empty half of the well. */
  const well = document.createElement("div");
  well.className = "deals-well";

  const rail = document.createElement("div");
  rail.className = "deals-rail";

  /* One baseline for all five tracks: the zero of the dollar scale, drawn as
   * the vertical rule the bars grow out of. It is the only SVG on the portlet,
   * because `strokeDraw` needs a path length to reveal along — the marks it
   * governs stay in the DOM. preserveAspectRatio is "none" so the rule
   * stretches to whatever height the five rows resolve to, with a non-scaling
   * stroke so it stays a hairline under that scale. */
  const baseSvg = chartRoot(2, 100, { class: "deals-base", preserveAspectRatio: "none" });
  baseSvg.setAttribute("aria-hidden", "true");
  baseSvg.removeAttribute("role");
  const baseline = svgEl("path", {
    d: "M 1 0 V 100",
    stroke: p.axis,
    "stroke-width": 1,
    fill: "none",
    "vector-effect": "non-scaling-stroke",
    class: "deals-baseline"
  });
  baseSvg.appendChild(baseline);
  rail.appendChild(baseSvg);

  const rowNodes = deals.map((deal, i) => {
    const row = document.createElement("div");
    row.className = "deal-row";

    const head = document.createElement("div");
    head.className = "deal-head";

    let rank = null;
    if (!rankIsVoid) {
      rank = document.createElement("span");
      rank.className = "deal-rank";
      rank.textContent = String(i + 1);
      head.appendChild(rank);
    }

    const name = document.createElement("span");
    name.className = "deal-name";
    name.textContent = deal.account || "";
    head.appendChild(name);

    const value = document.createElement("span");
    value.className = "deal-value";
    head.appendChild(value);
    row.appendChild(head);

    // The width is authored arithmetic handed to the layout engine, not a
    // number this renderer computes — which is what makes the two ties exact.
    // Both the fill and the tip dot read the same pair of custom properties
    // off the track, so the dot cannot drift from the end of its own bar.
    const track = document.createElement("div");
    track.className = "deal-track";
    track.style.setProperty("--deal-value", String(Number(deal.value) || 0));
    track.style.setProperty("--deal-scale", String(scaleMax));

    const fill = document.createElement("span");
    fill.className = "deal-fill";
    track.appendChild(fill);

    // A sibling of the fill rather than a child of it: growFrom collapses the
    // bar with scaleX, and a dot nested inside would be squashed along with it
    // for the length of the beat.
    const dot = document.createElement("span");
    dot.className = "deal-dot";
    track.appendChild(dot);

    row.appendChild(track);
    rail.appendChild(row);

    ctx.tip(
      row,
      isDirect
        ? `${deal.account} · ${deal.display} — the amount survives; which of the four candidate amount columns it was read from does not, and the gap to the next deal is smaller than the gap between those columns.`
        : `${deal.account} · ${deal.display} · rank ${i + 1} of five, on one certified ACV definition`
    );

    return { row, rank, name, value, fill, dot, display: deal.display || "" };
  });

  well.appendChild(rail);
  wrap.appendChild(well);

  const foot = document.createElement("div");
  foot.className = "deals-foot";

  // Authored, never summed here. A rail that adds its own rows up would be
  // computing a total the data does not state.
  const totalEl = document.createElement("p");
  totalEl.className = "deals-total";
  totalEl.textContent = metrics.totalDisplay || "";
  if (isDirect) totalEl.dataset.void = "true";
  foot.appendChild(totalEl);

  const caption = document.createElement("p");
  caption.className = "deals-caption";
  caption.textContent = metrics.caption || "";
  foot.appendChild(caption);
  wrap.appendChild(foot);

  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    const table = document.createElement("table");
    table.className = "trend-table";
    const tbody = document.createElement("tbody");

    deals.forEach((deal, i) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.className = "trend-table-rowlabel";
      th.textContent = rankIsVoid ? deal.account : `${i + 1} · ${deal.account}`;
      const td = document.createElement("td");
      td.textContent = deal.display || "—";
      tr.appendChild(th);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });

    if (gap) {
      [
        ["Plan (derived)", `${fmt(gap.plan, gapFormat)} = ${fmt(Number(gapSpec.basis.value), gapFormat)} ÷ ${gapSpec.basis.plan}%`],
        [`${gapSpec.label || "Gap to plan"} (derived)`, fmt(gap.size, gapFormat)],
        ["These five against it (derived)", `${fmt(dealsTotal, gapFormat)}, ${Math.round((dealsTotal / gap.size) * 100)}%`],
        ["Still to find (derived)", fmt(residual, gapFormat)]
      ].forEach(([label, value]) => {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        th.className = "trend-table-rowlabel";
        th.textContent = label;
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(th);
        tr.appendChild(td);
        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    detail.appendChild(table);

    const note = document.createElement("p");
    note.className = "trend-table-note";
    note.textContent = gapMode
      ? `${metrics.totalDisplay || ""} · Segments run on ${gap ? `the derived ${gapSpec.label || "gap"}` : "the authored total"}, so equal amounts draw equal lengths.${gap ? " The deals are open pipe and the gap is derived from a commit — a comparison of size, not a sum." : ""}`
      : isDirect
        ? `${metrics.totalDisplay || ""} · Bars run on a zero-based linear scale to ${metrics.unit || ""}${scaleMax}.`
        : `${metrics.totalDisplay || ""} · Bars run on a zero-based linear scale to ${metrics.unit || ""}${scaleMax}, so equal amounts draw equal lengths.`;
    detail.appendChild(note);

    return detail;
  }

  /* --------------------------- the gap composition -------------------------- */

  function mountGap() {
    const head = document.createElement("div");
    head.className = "deals-gaphead";

    // The authored total on its own. `totalDisplay` is a sentence — "$12.5M
    // across five deals" — which is right under a ranked list and wrong as the
    // band's one numeral, and the five deals are enumerated directly below in
    // any case.
    const totalDisplay = gapSpec.totalDisplay || metrics.totalDisplay || "";
    const totalEl = document.createElement("p");
    totalEl.className = "deals-gaptotal";
    head.appendChild(totalEl);

    /* The one claim the portlet exists to make, and every figure in it is
     * either authored or derived here from authored ones. */
    const claim = document.createElement("p");
    claim.className = "deals-gapclaim";
    if (gap) {
      claim.append(`${Math.round((dealsTotal / gap.size) * 100)}% of the ${fmt(gap.size, gapFormat)} ${gapSpec.label || "gap to plan"}`);
      const derivedTag = document.createElement("em");
      derivedTag.textContent = "derived";
      claim.appendChild(derivedTag);
    } else {
      claim.textContent = gapSpec.voidClaim || "no derivable gap to lay these against";
      claim.dataset.void = "true";
    }
    head.appendChild(claim);
    wrap.appendChild(head);

    /* The track is the gap. Every segment's width and offset is authored
     * arithmetic handed to the layout engine rather than a number this
     * renderer rounds, which is what keeps the two ties exact. */
    const track = document.createElement("div");
    track.className = "deals-gaptrack";
    track.style.setProperty("--deal-scale", String(scale));
    if (!gap) track.dataset.void = "true";

    let acc = 0;
    const segNodes = deals.map((deal, i) => {
      const seg = document.createElement("span");
      seg.className = "deals-seg";
      seg.style.setProperty("--seg-from", String(acc));
      seg.style.setProperty("--deal-value", String(Number(deal.value) || 0));
      seg.style.setProperty("--seg-index", String(i));
      acc += Number(deal.value) || 0;

      const segLabel = document.createElement("span");
      segLabel.className = "deals-seglabel";
      segLabel.textContent = deal.display || "";
      seg.appendChild(segLabel);

      track.appendChild(seg);
      ctx.tip(seg, `${deal.account} · ${deal.display} · rank ${i + 1} of five, on one certified ACV definition`);
      return seg;
    });

    /* What would still have to be found. Space, not a sixth segment: it is the
     * absence of a deal, and drawing it as one would put a deal nobody has on
     * the same footing as five that exist. Without a gap there is no space —
     * the bar is the total and ends where the total does. */
    let residualEl = null;
    if (gap) {
      residualEl = document.createElement("span");
      residualEl.className = "deals-residual";
      residualEl.style.setProperty("--seg-from", String(dealsTotal));
      residualEl.textContent = `${fmt(residual, gapFormat)}${gapSpec.residualWord ? ` ${gapSpec.residualWord}` : ""}`;
      residualEl.style.setProperty("--residual-tint", toneColor("risk"));
      track.appendChild(residualEl);
      ctx.tip(residualEl, `${fmt(gap.size, gapFormat)} derived gap less ${fmt(dealsTotal, gapFormat)} across these five leaves ${fmt(residual, gapFormat)}`);
    }

    const end = document.createElement("span");
    end.className = "deals-gapend";
    track.appendChild(end);
    wrap.appendChild(track);

    /* The five, as a legend for the segments they are. Same swatch tint by
     * index, so a row and its segment are the same object read twice. */
    const list = document.createElement("ol");
    list.className = "deals-list";
    const rowNodes = deals.map((deal, i) => {
      const li = document.createElement("li");

      const swatch = document.createElement("span");
      swatch.className = "deals-swatch";
      swatch.style.setProperty("--seg-index", String(i));
      li.appendChild(swatch);

      const name = document.createElement("span");
      name.className = "deals-name";
      name.textContent = deal.account || "";
      li.appendChild(name);

      const value = document.createElement("span");
      value.className = "deals-value";
      li.appendChild(value);

      list.appendChild(li);
      ctx.tip(li, `${deal.account} · ${deal.display} · rank ${i + 1} of five, on one certified ACV definition`);
      return { li, swatch, name, value, display: deal.display || "" };
    });
    wrap.appendChild(list);

    const caption = document.createElement("p");
    caption.className = "deals-caption";
    caption.textContent = metrics.gapCaption || metrics.caption || "";
    wrap.appendChild(caption);

    wrap.appendChild(buildDetail());
    host.appendChild(wrap);

    const curtain = veil([
      totalEl, claim, segNodes, residualEl, end,
      // Every conditional node is in the list, the residual included: it
      // exists in one mode only, and settle() is what stops a mode's own
      // marks being left invisible.
      rowNodes.map((n) => [n.swatch, n.name, n.value]), caption
    ]);
    curtain.hide();

    async function build(signal) {
      /* 1 — the scale's own end, before anything is measured against it, and
       * the total that is about to be laid along it. */
      fadeIn(end, { duration: 320, y: 0, signal });
      fadeIn(totalEl, { duration: 400, y: 6, signal });
      countUp(totalEl, totalDisplay, { delay: 90, duration: 820, signal });

      /* 2 — the deals, in rank order, each starting where the last ended, so
       * the bar reads as accumulation against the gap rather than as five
       * independent lengths. */
      await wait(260, signal);
      segNodes.forEach((seg, i) =>
        growFrom(seg, { axis: "x", origin: "left center", delay: i * 130, duration: 480, signal }));

      /* 3 — the residual, once there is a fill for it to be the remainder of,
       * and the claim that names it. */
      await wait(760, signal);
      if (residualEl) fadeIn(residualEl, { duration: 420, y: 0, x: 8, signal });
      fadeIn(claim, { delay: 120, duration: 400, y: 4, signal });

      /* 4 — the legend, then the caption. */
      await wait(200, signal);
      rowNodes.forEach((n, i) => {
        fadeIn(n.swatch, { delay: i * 70, duration: 280, y: 0, scaleFrom: 0.5, signal });
        fadeIn(n.name, { delay: i * 70, duration: 300, y: 3, signal });
        fadeIn(n.value, { delay: i * 70 + 60, duration: 300, y: 0, x: -5, signal });
        countUp(n.value, n.display, { delay: i * 70 + 60, duration: 560, signal });
      });
      fadeIn(caption, { delay: 320, duration: 420, y: 5, signal });
    }

    return { build, prime: curtain.hide, settle: curtain.settle };
  }

  /* Every animated node, the rank chips included — they exist in one mode only
   * and settle() is what stops a mode's own marks being left invisible. */
  const curtain = veil([
    baseSvg, baseline,
    rowNodes.map((n) => [n.rank, n.name, n.value, n.fill, n.dot]),
    totalEl, caption
  ]);
  curtain.hide();

  async function build(signal) {
    /* 1 — the scale's own zero, before anything is measured against it. */
    strokeDraw(baseline, { duration: 380, signal });
    fadeIn(baseSvg, { duration: 240, y: 0, signal });
    stagger(rowNodes.map((n) => n.name), { step: 70, duration: 320, y: 4, signal });
    if (!rankIsVoid) {
      stagger(rowNodes.map((n) => n.rank), { step: 70, duration: 300, y: 0, scaleFrom: 0.6, signal });
    }

    /* 2 — the bars, top to bottom. A ranked list should assemble in rank
     * order, and the two ties arrive at the same length. */
    await wait(220, signal);
    rowNodes.forEach((n, i) =>
      growFrom(n.fill, { axis: "x", origin: "left center", delay: i * 110, duration: 560, signal })
    );

    /* 3 — the tips. */
    await wait(560, signal);
    stagger(rowNodes.map((n) => n.dot), { step: 100, duration: 280, y: 0, scaleFrom: 0.3, signal });

    /* 4 — the amounts, then the authored footer. */
    await wait(180, signal);
    rowNodes.forEach((n, i) => {
      fadeIn(n.value, { delay: i * 90, duration: 300, y: 0, x: -5, signal });
      countUp(n.value, n.display, { delay: i * 90, duration: 620, signal });
    });
    fadeIn(totalEl, { delay: 240, duration: 400, y: 5, signal });
    fadeIn(caption, { delay: 340, duration: 420, y: 5, signal });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
