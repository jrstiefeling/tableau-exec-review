/* The top five open deals, as a ranked lollipop rail on a zero-based linear
 * dollar scale.
 *
 * Linear, not the board's symlog growth scale, and the distinction is the
 * point of having two scales. These are five comparable magnitudes in one unit
 * across a 1.4x range, with no polarity and no rate — exactly the case linear
 * from zero was made for. The symlog scale exists to stop three orders of
 * magnitude collapsing into a nub, and that problem does not exist here;
 * applying it anyway would be applying a rule for its own sake. The rail
 * states which scale it is on, so the board gets to have two.
 *
 * The bars are DOM, not SVG. `growFrom` already animates DOM elements —
 * mixBar.js grows its `.mix-seg` spans the same way — and keeping the bars in
 * the DOM buys the one property this portlet cannot afford to lose: the width
 * is `calc(var(--deal-value) / <scaleMax> * 100%)`, resolved once by the
 * layout engine, so two deals authored at the same value are the same number
 * of pixels by construction rather than by a rounding step that happens to
 * agree. Bank of America and Aetna are both $3M and US Bank and US GOV are
 * both $2.1M; the order is authored and the equality is a fact.
 *
 * Colour is the accent, never sentiment. A deal size has no direction of good,
 * and tinting these by tone would invent one. */

import { chartRoot, svgEl } from "../svg.js";
import { palette, tierMeta } from "../palette.js";
import { countUp, strokeDraw, fadeIn, growFrom, stagger, wait, veil } from "../anim.js";

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const deals = metrics.deals || [];
  const scaleMax = Number(metrics.scaleMax) || 1;

  /* Yellow is workable but ungoverned, and it is the tier that never earns an
   * X. So nothing here goes missing: all five accounts and all five amounts
   * survive, and what stops being defensible is the *ordering*, because the
   * gap between third and fifth is smaller than the gap between the candidate
   * amount columns. The rank chips come off and the bar tips go dashed — the
   * list is intact and its sequence is no longer a claim. */
  const rankIsVoid = isDirect;
  const tint = isDirect ? meta.color : ctx.accent;

  const wrap = document.createElement("div");
  wrap.className = "deals";
  wrap.style.setProperty("--deal-tint", tint);
  if (rankIsVoid) wrap.dataset.void = "true";

  const rail = document.createElement("div");
  rail.className = "deals-rail";

  /* One baseline for all five tracks: the zero of the dollar scale, drawn as
   * the vertical rule the bars grow out of. It is the only SVG on the portlet,
   * because `strokeDraw` needs a path length to reveal along — the marks it
   * governs stay in the DOM. preserveAspectRatio is "none" so the rule
   * stretches to whatever height the five rows resolve to, with a non-scaling
   * stroke so it stays a hairline under that scale. */
  const baseSvg = chartRoot(4, 100, { class: "deals-base", preserveAspectRatio: "none" });
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

  wrap.appendChild(rail);

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
    table.appendChild(tbody);
    detail.appendChild(table);

    const note = document.createElement("p");
    note.className = "trend-table-note";
    note.textContent = isDirect
      ? `${metrics.totalDisplay || ""} · Bars run on a zero-based linear scale to ${metrics.unit || ""}${scaleMax}.`
      : `${metrics.totalDisplay || ""} · Bars run on a zero-based linear scale to ${metrics.unit || ""}${scaleMax}, so equal amounts draw equal lengths.`;
    detail.appendChild(note);

    return detail;
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
