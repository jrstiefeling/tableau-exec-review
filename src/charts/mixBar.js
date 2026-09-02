/* Product-motion mix: one stacked bar instead of two orphan tiles.
 *
 * On the source slide, Embedded and Agentic sit side by side as separate
 * figures, which hides the thing that matters — Embedded is taking share of a
 * base that is shrinking underneath it. Put against a common total, the
 * rotation becomes the visible fact rather than something the reader has to
 * work out by dividing in their head. */

import { palette, toneOf, toneColor, tierMeta } from "../palette.js";
import { countUp, fadeIn, growFrom, stagger, wait, veil } from "../anim.js";

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const segments = metrics.segments || [];
  const total = Number(metrics.total) || segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || 1;

  // Without a governed SKU-to-motion taxonomy there is no split to draw, so
  // the bar renders as a single undifferentiated block rather than as a
  // guessed one.
  const splitAvailable = !(isDirect && tier === "red");

  const wrap = document.createElement("div");
  wrap.className = "mix";

  const head = document.createElement("div");
  head.className = "mix-head";
  const totalEl = document.createElement("span");
  totalEl.className = "mix-total";
  const totalLabel = document.createElement("span");
  totalLabel.className = "mix-total-label";
  totalLabel.textContent = splitAvailable
    ? `total · Embedded ${Math.round(((segments[0]?.value || 0) / total) * 100)}% share`
    : "total · no motion split available";
  head.appendChild(totalEl);
  head.appendChild(totalLabel);
  wrap.appendChild(head);

  const bar = document.createElement("div");
  bar.className = "mix-bar";

  const segEls = [];
  if (splitAvailable) {
    segments.forEach((seg) => {
      const el = document.createElement("span");
      el.className = "mix-seg";
      el.dataset.segment = seg.id;
      el.style.setProperty("--seg-width", `${((Number(seg.value) || 0) / total) * 100}%`);
      el.style.setProperty("--seg-color", isDirect ? meta.color : seg.color || ctx.accent);
      el.setAttribute("role", "presentation");
      bar.appendChild(el);
      segEls.push(el);
    });
  } else {
    const el = document.createElement("span");
    el.className = "mix-seg is-undifferentiated";
    el.style.setProperty("--seg-width", "100%");
    el.style.setProperty("--seg-color", meta.color);
    bar.appendChild(el);
    segEls.push(el);
  }
  wrap.appendChild(bar);

  const legend = document.createElement("div");
  legend.className = "mix-legend";
  const legendEls = [];

  if (splitAvailable) {
    segments.forEach((seg) => {
      const tint = isDirect ? meta.color : seg.color || ctx.accent;
      const item = document.createElement("div");
      item.className = "mix-item";
      item.style.setProperty("--seg-color", tint);

      const label = document.createElement("p");
      label.className = "mix-item-label";
      label.textContent = seg.label;

      // Inline with the label rather than on a line of its own — the card has
      // a fixed height and the product detail is not worth a whole row of it.
      const detail = document.createElement("span");
      detail.className = "mix-item-detail";
      detail.textContent = seg.detail || "";

      const row = document.createElement("p");
      row.className = "mix-item-row";
      const val = document.createElement("span");
      val.className = "mix-item-value";
      val.textContent = seg.display;
      const yoy = document.createElement("span");
      yoy.className = "mix-item-yoy";
      yoy.style.setProperty(
        "--delta-tint",
        isDirect ? meta.color : toneColor(toneOf(seg.yoy, seg.goodDirection || "up"))
      );
      yoy.textContent = seg.yoyDisplay || "";
      row.appendChild(val);
      row.appendChild(yoy);

      if (seg.detail) label.appendChild(detail);
      item.appendChild(label);
      item.appendChild(row);
      legend.appendChild(item);
      legendEls.push(item);
    });
  }
  wrap.appendChild(legend);

  const insight = document.createElement("p");
  insight.className = "mix-insight";
  insight.innerHTML = metrics.insight || "";
  wrap.appendChild(insight);

  host.appendChild(wrap);

  const curtain = veil([head, segEls, legendEls, insight]);
  curtain.hide();

  async function build(signal) {
    fadeIn(head, { duration: 420, y: 6, signal });
    countUp(totalEl, metrics.totalDisplay || "", { delay: 60, duration: 900, signal });

    // Segments grow from the left edge in sequence so the bar assembles
    // rather than appearing pre-divided.
    segEls.forEach((el, i) =>
      growFrom(el, { axis: "x", origin: "left center", delay: 220 + i * 190, duration: 760, signal })
    );

    await wait(520, signal);
    stagger(legendEls, { step: 110, duration: 460, y: 10, signal });
    fadeIn(insight, { delay: 320, duration: 520, y: 8, signal });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
