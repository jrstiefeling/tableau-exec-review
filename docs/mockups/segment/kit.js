/* Standalone mockup renderer for the segment-tab redesign.
 *
 * Self-contained by contract: this module imports nothing from ../../../src/
 * and is imported by nothing there. It transcribes the parts of the board it
 * needs — the symlog growth axis from src/charts/growth.js, the card idiom
 * from styles/portlets.css, the movement panel from src/charts/groupMovement.js
 * — so a mockup can be judged beside the running board without being able to
 * break it.
 *
 * FIGURE PROVENANCE, which is the rule this file exists under:
 *
 *   AUTHORED  — transcribed verbatim from data/board.json. Every display
 *               string is the authored string, character for character.
 *   DERIVED   — exact arithmetic over two or more authored figures, computed
 *               here rather than typed, and labelled `derived` wherever drawn.
 *
 * Nothing is estimated, smoothed, rounded up or invented. No figure is
 * presented as authored that is not.
 *
 * Two cross-portlet citations are made deliberately and are sanctioned by the
 * board's own copy. `seg-matrix.allSegmentsNote` says "The All Segments
 * reading of every row is the Analytics Performance tab, in full", and
 * `seg-rules` rule 4 says the same. So the four product-line all-segments
 * rates below are read from `perf-hierarchy` on that tab rather than summed
 * across the segment columns here — which is also the route-around for the
 * $1M cross-tab disagreement recorded in docs/spread-redesign.md §2.4.3.
 * Nothing in these mockups sums across segment columns.
 */

const NS = "http://www.w3.org/2000/svg";

/* ========================================================================== */
/* AUTHORED — transcribed from data/board.json                                */
/* ========================================================================== */

export const AUTHORED = {
  meta: {
    period: "Q2 FY27",
    freshness: "Jul 28, 2026 · 9:00 AM PT · SDM hourly over the ~8 AM PT extract"
  },

  /* tabs[2] — performance-by-segment */
  tab: {
    id: "performance-by-segment",
    kicker: "Q2 FY27 · Four segments",
    headline: "One segment growing, and Embedded growing in all four",
    accent: "#2F5FA8"
  },

  /* tabs[2].bands[0].portlets[0] — seg-matrix.metrics */
  segMatrix: {
    label: "ACV by product and segment",
    sublabel: "Seven product lines across four segments, Q2 FY27",
    accent: "#2F5FA8",
    stakeMax: 83,
    axisNote:
      "Y/Y — linear inside ±10%, one decade per gridline beyond it. Bracket: that segment's slowest to fastest product line.",
    segments: [
      { id: "entr", short: "ENTR", label: "Enterprise" },
      { id: "cmrcl", short: "CMRCL", label: "Commercial" },
      { id: "smb", short: "SMB", label: "Small & Medium Business" },
      { id: "pubsec", short: "PubSec", label: "Public Sector" }
    ],
    rows: [
      { id: "analytics-total", label: "Analytics Total", level: 0, color: "#1C6E8C",
        values: [39, 18, 12, 15], display: ["$39M", "$18M", "$12M", "$15M"],
        yoy: [-35, -31, -23, 14], yoyDisplay: ["-35%", "-31%", "-23%", "+14%"] },
      { id: "platform", label: "Agentic Analytics Platform", level: 1, color: "#2F5FA8",
        values: [26, 13, 10, 10], display: ["$26M", "$13M", "$10M", "$10M"],
        yoy: [-48, -41, -34, -12], yoyDisplay: ["-48%", "-41%", "-34%", "-12%"] },
      { id: "cloud", label: "Tableau Cloud", level: 2, color: "#2F5FA8",
        values: [16, 10, 8, 4], display: ["$16M", "$10M", "$8M", "$4M"],
        yoy: [-48, -42, -30, -16], yoyDisplay: ["-48%", "-42%", "-30%", "-16%"] },
      { id: "server", label: "Tableau Server", level: 2, color: "#6E8FC4",
        values: [10, 4, 2, 6], display: ["$10M", "$4M", "$2M", "$6M"],
        yoy: [-48, -38, -45, -8], yoyDisplay: ["-48%", "-38%", "-45%", "-8%"] },
      { id: "embedded", label: "Embedded Agentic Analytics", level: 1, color: "#12806A",
        values: [13, 4, 2, 5], display: ["$13M", "$4M", "$2M", "$5M"],
        yoy: [33, 43, 147, 78], yoyDisplay: ["+33%", "+43%", "+147%", "+78%"] },
      { id: "next", label: "Tableau Next", level: 2, color: "#12806A",
        values: [8, 3, 1, 2], display: ["$8M", "$3M", "$1M", "$2M"],
        yoy: [402, 236, 727, 1060], yoyDisplay: ["+402%", "+236%", "+727%", "+1060%"] },
      { id: "crma", label: "CRMA", level: 2, color: "#5EA394",
        values: [5, 2, 1, 3], display: ["$5M", "$2M", "$1M", "$3M"],
        yoy: [-37, -18, 33, 69], yoyDisplay: ["-37%", "-18%", "+33%", "+69%"] }
    ]
  },

  /* tabs[1].bands[0].portlets[0] — perf-hierarchy.metrics.rows, the authored
   * all-segments reading of the same four leaf lines. Cited, not recomputed. */
  allSegments: {
    source: "Analytics Performance tab · perf-hierarchy",
    rows: [
      { id: "cloud",  label: "Tableau Cloud",  display: "$38M", yoy: -41, yoyDisplay: "-41%",  color: "#2F5FA8" },
      { id: "server", label: "Tableau Server", display: "$21M", yoy: -39, yoyDisplay: "-39%",  color: "#6E8FC4" },
      { id: "next",   label: "Tableau Next",   display: "$13M", yoy: 414, yoyDisplay: "+414%", color: "#12806A" },
      { id: "crma",   label: "CRMA",           display: "$11M", yoy: -15, yoyDisplay: "-15%",  color: "#5EA394" }
    ]
  },

  /* tabs[2].bands[1].portlets[0] — seg-spread.metrics. The movement panel as
   * shipped, transcribed whole: 16 authored prior values and 16 authored
   * deltas, which is what makes the dollar test below a test on authored
   * figures rather than on back-solved ones. */
  movement: {
    label: "Within-segment movement",
    sublabel: "What moved each segment's dollars, Q2 FY26 to Q2 FY27",
    accent: "#6B4FBF",
    unit: "$M",
    domain: [-28, 8],
    axisTicks: [-25, -15, -5, 0, 5],
    lossKey: "dollars removed",
    gainKey: "dollars added",
    orderNote: "largest line nearest the rule",
    axisNote:
      "Change in ACV_clc, Q2 FY26 to Q2 FY27, on one linear dollar scale shared by all four segments. Prior period derived: ACV ÷ (1 + Y/Y).",
    caption:
      "Every segment gave up platform dollars. Tableau Next put $6.4M back into Enterprise — the largest gain on the panel.",
    rows: [
      { id: "entr-move", label: "ENTR", fullLabel: "Enterprise", net: -20.53, netDisplay: "−$20.5M",
        lossWing: 26.94, gainWing: 6.41, parts: [
          { id: "cloud",  short: "Cloud",  value: 16, priorValue: 30.77, delta: -14.77, deltaDisplay: "−$14.8M" },
          { id: "server", short: "Server", value: 10, priorValue: 19.23, delta:  -9.23, deltaDisplay: "−$9.2M"  },
          { id: "next",   short: "Next",   value:  8, priorValue:  1.59, delta:   6.41, deltaDisplay: "+$6.4M"  },
          { id: "crma",   short: "CRMA",   value:  5, priorValue:  7.94, delta:  -2.94, deltaDisplay: "−$2.9M"  }
        ] },
      { id: "cmrcl-move", label: "CMRCL", fullLabel: "Commercial", net: -8.02, netDisplay: "−$8.0M",
        lossWing: 10.13, gainWing: 2.11, parts: [
          { id: "cloud",  short: "Cloud",  value: 10, priorValue: 17.24, delta: -7.24, deltaDisplay: "−$7.2M" },
          { id: "server", short: "Server", value:  4, priorValue:  6.45, delta: -2.45, deltaDisplay: "−$2.5M" },
          { id: "next",   short: "Next",   value:  3, priorValue:  0.89, delta:  2.11, deltaDisplay: "+$2.1M" },
          { id: "crma",   short: "CRMA",   value:  2, priorValue:  2.44, delta: -0.44, deltaDisplay: "−$0.4M" }
        ] },
      { id: "smb-move", label: "SMB", fullLabel: "Small & Medium Business", net: -3.94, netDisplay: "−$3.9M",
        lossWing: 5.07, gainWing: 1.13, parts: [
          { id: "cloud",  short: "Cloud",  value: 8, priorValue: 11.43, delta: -3.43, deltaDisplay: "−$3.4M" },
          { id: "server", short: "Server", value: 2, priorValue:  3.64, delta: -1.64, deltaDisplay: "−$1.6M" },
          { id: "next",   short: "Next",   value: 1, priorValue:  0.12, delta:  0.88, deltaDisplay: "+$0.9M" },
          { id: "crma",   short: "CRMA",   value: 1, priorValue:  0.75, delta:  0.25, deltaDisplay: "+$0.2M" }
        ] },
      { id: "pubsec-move", label: "PubSec", fullLabel: "Public Sector", net: 1.77, netDisplay: "+$1.8M",
        lossWing: 1.28, gainWing: 3.05, parts: [
          { id: "cloud",  short: "Cloud",  value: 4, priorValue: 4.76, delta: -0.76, deltaDisplay: "−$0.8M" },
          { id: "server", short: "Server", value: 6, priorValue: 6.52, delta: -0.52, deltaDisplay: "−$0.5M" },
          { id: "next",   short: "Next",   value: 2, priorValue: 0.17, delta:  1.83, deltaDisplay: "+$1.8M" },
          { id: "crma",   short: "CRMA",   value: 3, priorValue: 1.78, delta:  1.22, deltaDisplay: "+$1.2M" }
        ] }
    ]
  }
};

const PART_COLOR = { cloud: "#2F5FA8", server: "#6E8FC4", next: "#12806A", crma: "#5EA394" };
const PART_NAME  = { cloud: "Tableau Cloud", server: "Tableau Server", next: "Tableau Next", crma: "CRMA" };

/* ========================================================================== */
/* DERIVED — exact arithmetic over the authored figures above                  */
/* ========================================================================== */

/* The variance decomposition, computed here rather than typed, so the numbers
 * drawn cannot drift from the numbers checked. docs/mockups/segment/
 * verify-claim.py runs the same arithmetic against data/board.json directly
 * and prints the intermediate steps.
 *
 * The measure is `delta` — the authored change in ACV_clc per cell — and the
 * weight is `priorValue`, the authored prior-year dollars. Weighting by prior
 * dollars is the whole point: it is what stops a line that grew off $0.12M
 * from dominating a dispersion reading, which is the failure
 * docs/spread-redesign.md §1.1 records against the panel this replaces.
 */
export const DERIVED = (() => {
  const segs = AUTHORED.movement.rows.map((r) => r.label);
  const prods = AUTHORED.movement.rows[0].parts.map((p) => p.id);

  const prior = {}, move = {};
  AUTHORED.movement.rows.forEach((r) =>
    r.parts.forEach((p) => {
      prior[`${p.id}|${r.label}`] = p.priorValue;
      move[`${p.id}|${r.label}`] = p.delta;
    }));

  const cells = [];
  prods.forEach((p) => segs.forEach((s) => cells.push(`${p}|${s}`)));

  const sum = (f) => cells.reduce((a, c) => a + f(c), 0);
  const totalPrior = sum((c) => prior[c]);
  const totalMove = sum((c) => move[c]);
  const G = totalMove / totalPrior;
  const rate = Object.fromEntries(cells.map((c) => [c, move[c] / prior[c]]));

  const groupBy = (keys, pick) =>
    Object.fromEntries(keys.map((k) => {
      const cs = cells.filter((c) => pick(c) === k);
      const p = cs.reduce((a, c) => a + prior[c], 0);
      const m = cs.reduce((a, c) => a + move[c], 0);
      return [k, { prior: p, move: m, rate: m / p }];
    }));

  const head = (c) => c.split("|")[0];
  const tail = (c) => c.split("|")[1];
  const byProd = groupBy(prods, head);
  const bySeg = groupBy(segs, tail);

  /* Prior-dollar-weighted variance of the cell growth rate, and the share of
   * it each grouping accounts for on its own (a weighted one-way eta^2). */
  const V = sum((c) => prior[c] * (rate[c] - G) ** 2) / totalPrior;
  const vOf = (groups) =>
    Object.values(groups).reduce((a, g) => a + g.prior * (g.rate - G) ** 2, 0) / totalPrior;
  const Vp = vOf(byProd), Vs = vOf(bySeg);

  /* The same question asked in dollars, which is the version that survives
   * the board's own objection to rate dispersion. Predict every cell's
   * movement from one fact about it, then total the dollar error. */
  const err = (predict) => sum((c) => Math.abs(move[c] - prior[c] * predict(c)));
  const errNone = err(() => G);
  const errProd = err((c) => byProd[head(c)].rate);
  const errSeg = err((c) => bySeg[tail(c)].rate);
  const gross = sum((c) => Math.abs(move[c]));

  /* The platform sub-book — the $100.0M of prior dollars where the ACV
   * shortfall actually sits, and the one place the segment gradient is worth
   * real money. Reported so the recommendation does not overclaim. */
  const plat = ["cloud", "server"];
  const platCells = cells.filter((c) => plat.includes(head(c)));
  const psum = (f) => platCells.reduce((a, c) => a + f(c), 0);
  const platPrior = psum((c) => prior[c]), platMove = psum((c) => move[c]);
  const platG = platMove / platPrior;
  const platBySeg = Object.fromEntries(segs.map((s) => {
    const cs = platCells.filter((c) => tail(c) === s);
    const p = cs.reduce((a, c) => a + prior[c], 0);
    const m = cs.reduce((a, c) => a + move[c], 0);
    return [s, { prior: p, move: m, rate: m / p }];
  }));
  const platErrNone = psum((c) => Math.abs(move[c] - prior[c] * platG));
  const platErrSeg = psum((c) => Math.abs(move[c] - prior[c] * platBySeg[tail(c)].rate));

  return {
    segs, prods, prior, move, rate, byProd, bySeg,
    totalPrior, totalMove, overallRate: G,
    varTotal: V, etaProduct: Vp / V, etaSegment: Vs / V,
    gross, errNone, errProd, errSeg,
    gainProduct: errNone - errProd,
    gainSegment: errNone - errSeg,
    platPrior, platMove, platRate: platG, platBySeg,
    platExplainedBySegment: platErrNone - platErrSeg,
    platErrNone
  };
})();

/* The two spreads, from authored marginal rates only — no cross-segment sum.
 * Product side: the four authored all-segments rates from perf-hierarchy.
 * Segment side: the four authored rates on seg-matrix's Analytics Total row. */
export const SPREADS = (() => {
  const prod = AUTHORED.allSegments.rows.map((r) => ({
    id: r.id, label: r.label, short: PART_NAME[r.id].replace("Tableau ", ""),
    yoy: r.yoy, yoyDisplay: r.yoyDisplay, acv: Number(r.display.replace(/[^0-9.]/g, "")),
    acvDisplay: r.display, color: r.color
  }));
  const total = AUTHORED.segMatrix.rows[0];
  const seg = AUTHORED.segMatrix.segments.map((s, i) => ({
    id: s.id, label: s.label, short: s.short,
    yoy: total.yoy[i], yoyDisplay: total.yoyDisplay[i],
    acv: total.values[i], acvDisplay: total.display[i], color: total.color
  }));
  const span = (xs) => Math.max(...xs.map((x) => x.yoy)) - Math.min(...xs.map((x) => x.yoy));
  return { prod, seg, prodSpan: span(prod), segSpan: span(seg) };
})();

/* ========================================================================== */
/* GROWTH AXIS — transcribed from src/charts/growth.js                        */
/* ========================================================================== */

const CORE = 10;
const DECADES = 2.2;
const CORE_FRACTION = 0.22;

export function growthFraction(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return null;
  const value = Number(v);
  const b = (1 - CORE_FRACTION) / DECADES;
  const m = Math.abs(value);
  const f = m <= CORE ? (m / CORE) * CORE_FRACTION : CORE_FRACTION + b * Math.log10(m / CORE);
  return Math.sign(value) * Math.min(f, 1);
}

/* ========================================================================== */
/* DOM HELPERS                                                                */
/* ========================================================================== */

function el(tag, attrs = {}, kids = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k === "style") n.setAttribute("style", v);
    else n.setAttribute(k, v);
  }
  kids.forEach((c) => c && n.appendChild(c));
  return n;
}
function s(tag, attrs = {}, kids = []) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    n.setAttribute(k, String(v));
  }
  kids.forEach((c) => c && n.appendChild(c));
  return n;
}
function svgRoot(w, h, cls, par) {
  const n = s("svg", { viewBox: `0 0 ${w} ${h}`, class: cls, focusable: "false" });
  if (par) n.setAttribute("preserveAspectRatio", par);
  return n;
}

const TONE = { pos: "var(--pos)", neg: "var(--neg)", warn: "var(--warn)", neutral: "#78808e" };
function toneKey(v, soft = 10) {
  if (v === 0) return "neutral";
  if (v > 0) return "pos";
  return Math.abs(v) < soft ? "warn" : "neg";
}
const fmtM1 = (v) => `${v < 0 ? "−" : "+"}$${Math.abs(v).toFixed(1)}M`;
const fmtMabs = (v) => `$${Math.abs(v).toFixed(1)}M`;

/* ========================================================================== */
/* CHROME                                                                     */
/* ========================================================================== */

const TABS = [
  { id: "exec", label: "Exec" },
  { id: "analytics-performance", label: "Product" },
  { id: "performance-by-segment", label: "Segment" },
  { id: "q3-outlook", label: "Q3 Outlook" },
  { id: "trend", label: "Five Year" }
];

const MARK = [
  ["corner", [[3.05, 4.2, 4.2, 1.9], [4.2, 3.05, 1.9, 4.2], [16.75, 4.2, 4.2, 1.9], [17.9, 3.05, 1.9, 4.2],
    [3.05, 17.9, 4.2, 1.9], [4.2, 16.75, 1.9, 4.2], [16.75, 17.9, 4.2, 1.9], [17.9, 16.75, 1.9, 4.2]]],
  ["side", [[0.15, 10.9, 5.5, 2.2], [1.8, 9.25, 2.2, 5.5], [18.35, 10.9, 5.5, 2.2], [20, 9.25, 2.2, 5.5]]],
  ["axis", [[9.25, 1.8, 5.5, 2.2], [10.9, 0.15, 2.2, 5.5], [9.25, 20, 5.5, 2.2], [10.9, 18.35, 2.2, 5.5]]],
  ["core", [[6.4, 10.15, 11.2, 3.7], [10.15, 6.4, 3.7, 11.2]]]
];

function topbar(activeTab) {
  const mark = svgRoot(24, 24, "topbar-mark");
  MARK.forEach(([cls, rects]) =>
    mark.appendChild(s("g", { class: `mark-${cls}` },
      rects.map(([x, y, w, h]) => s("rect", { x, y, width: w, height: h })))));
  return el("header", { class: "topbar" }, [
    el("div", { class: "topbar-id" }, [
      mark,
      el("div", { class: "topbar-titles" }, [
        el("p", { class: "topbar-eyebrow", text: "Tableau MCP · Semantic Layer" }),
        el("p", { class: "topbar-name", text: "Analytics Business Review" })
      ])
    ]),
    el("nav", { class: "tabnav" }, TABS.map((t) =>
      el("button", { class: `tabnav-btn${t.id === activeTab ? " is-active" : ""}`, text: t.label }))),
    el("div", { class: "topbar-actions" }, [
      el("span", { class: "mode-switch" }, [
        el("span", { class: "mode-switch-state", text: "Governed" }),
        el("span", { class: "trust-legend-dot" }),
        el("button", { class: "mode-switch-btn", text: "Direct" })
      ])
    ])
  ]);
}

function portlet(label, sublabel, accent, body, tier = "red") {
  return el("div", { class: "portlet", style: `--accent:${accent}` }, [
    el("div", { class: "portlet-face" }, [
      el("div", { class: "portlet-head" }, [
        el("div", { class: "portlet-titles" }, [
          el("p", { class: "portlet-label", text: label }),
          el("p", { class: "portlet-sublabel", text: sublabel })
        ]),
        el("div", { class: "portlet-tools" }, [
          el("span", { class: "portlet-expand", text: "⌄" }),
          el("span", { class: "trust-dot", "data-tier": tier })
        ])
      ]),
      el("div", { class: "portlet-body" }, [body])
    ])
  ]);
}

function foot(note, captionParts) {
  return el("div", { class: "foot" }, [
    el("p", { class: "axisnote", text: note }),
    el("p", { class: "caption derived" }, captionParts)
  ]);
}
function derivedCaption(text) {
  return [el("b", { text: "Derived · " }), el("span", { text })];
}

/* ========================================================================== */
/* THE MOVEMENT PANEL — transcribed from src/charts/groupMovement.js          */
/* ========================================================================== */

/* Unchanged in kind by all three alternatives. What each alternative changes
 * is the width the panel is given, which is a grid decision, so the panel is
 * drawn here exactly once and reused. */

const MV = { w: 300, pad: 6 };

function movementTrack(row, domain, wide) {
  const box = { w: MV.w, h: 30, pad: MV.pad };
  const span = domain[1] - domain[0];
  const x = (v) => box.pad + ((v - domain[0]) / span) * (box.w - 2 * box.pad);
  const zero = x(0);
  const svg = svgRoot(box.w, box.h, "movement-svg", "none");

  svg.appendChild(s("path", {
    d: `M ${zero} 0 V ${box.h}`, stroke: "rgba(23,24,28,0.45)", "stroke-width": 1.2,
    fill: "none", "vector-effect": "non-scaling-stroke"
  }));

  const losses = row.parts.filter((p) => p.delta < 0).sort((a, b) => a.delta - b.delta);
  const gains = row.parts.filter((p) => p.delta > 0).sort((a, b) => b.delta - a.delta);
  const tags = [];

  let cursor = 0;
  losses.forEach((p) => {
    const x1 = x(cursor), x0 = x(cursor + p.delta);
    svg.appendChild(s("rect", {
      x: x0, y: 0, width: Math.max(0.6, x1 - x0), height: box.h,
      fill: TONE.neg, "fill-opacity": 0.9, class: "movement-piece"
    }));
    tags.push({ p, mid: (x0 + x1) / 2, w: x1 - x0 });
    cursor += p.delta;
  });
  cursor = 0;
  gains.forEach((p) => {
    const x0 = x(cursor), x1 = x(cursor + p.delta);
    svg.appendChild(s("rect", {
      x: x0, y: 0, width: Math.max(0.6, x1 - x0), height: box.h,
      fill: TONE.pos, "fill-opacity": 0.9, class: "movement-piece"
    }));
    tags.push({ p, mid: (x0 + x1) / 2, w: x1 - x0 });
    cursor += p.delta;
  });

  const plot = el("div", { class: "movement-plot" }, [svg]);
  tags.forEach((t) => {
    const pctW = (t.w / box.w) * 100;
    /* Only a piece wide enough to hold a name gets one; the rest are on the
     * tooltip and in the expand, as they already are. */
    const text = pctW > (wide ? 9 : 13) ? t.p.short : null;
    if (!text) return;
    plot.appendChild(el("span", {
      class: "movement-tag", text, style: `--at-x:${((t.mid / box.w) * 100).toFixed(2)}%`
    }));
  });
  return plot;
}

function movementAxis(domain, ticks) {
  const span = domain[1] - domain[0];
  const x = (v) => MV.pad + ((v - domain[0]) / span) * (MV.w - 2 * MV.pad);
  const strip = el("div", { class: "movement-ticks" });
  ticks.forEach((t, i) => {
    const anchor = i === 0 ? "start" : i === ticks.length - 1 ? "end" : "mid";
    strip.appendChild(el("span", {
      class: "movement-tick", "data-anchor": anchor, "data-tick": t === 0 ? "zero" : "val",
      text: t === 0 ? "0" : `${t < 0 ? "−" : "+"}$${Math.abs(t)}M`,
      style: `--at-x:${((x(t) / MV.w) * 100).toFixed(2)}%`
    }));
  });
  return el("div", { class: "movement-axis" }, [el("div", { class: "movement-axis-rule" }), strip]);
}

export function movementBody(wide) {
  const M = AUTHORED.movement;
  const wrap = el("div", { class: "movement", "data-wide": wide ? "true" : "false" });
  const rows = el("div", { class: "movement-rows" });
  M.rows.forEach((r) => {
    const order = [...r.parts].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    rows.appendChild(el("div", { class: "movement-row" }, [
      el("div", { class: "movement-head" }, [
        el("span", { class: "movement-name", text: wide ? r.fullLabel : r.label }),
        el("span", {
          class: "movement-net", text: r.netDisplay,
          style: `color:${r.net < 0 ? "var(--neg)" : "var(--pos)"}`
        })
      ]),
      movementTrack(r, M.domain, wide),
      el("div", { class: "movement-parts" }, order.map((p) =>
        el("span", { class: "movement-part" }, [
          el("i", { text: p.short }),
          el("b", { text: p.deltaDisplay, style: `color:${p.delta < 0 ? "var(--neg)" : "var(--pos)"}` })
        ])))
    ]));
  });
  wrap.appendChild(rows);
  wrap.appendChild(movementAxis(M.domain, M.axisTicks));
  wrap.appendChild(el("div", { class: "key" }, [
    el("span", { class: "keyitem" }, [
      el("span", { class: "swatch", style: "background:var(--neg)" }), el("span", { text: M.lossKey })]),
    el("span", { class: "keyitem" }, [
      el("span", { class: "swatch", style: "background:var(--pos)" }), el("span", { text: M.gainKey })]),
    el("span", { class: "keynote", text: M.orderNote })
  ]));
  wrap.appendChild(el("div", { class: "movement-foot" }, [
    el("p", { class: "axisnote", text: M.axisNote }),
    el("p", { class: "caption", text: M.caption })
  ]));
  return wrap;
}

/* ========================================================================== */
/* ALTERNATIVE A — THE DECISION                                               */
/* ========================================================================== */

/* Two spreads on one shared symlog axis, aligned so the segment band is drawn
 * inside the product band, then the same question settled on the certified
 * additive measure. Twelve marks, none of them a cell. */

const AX = { lo: -0.60, hi: 0.96 };            // fraction window: −100% to +1000%
const A_TICKS = [-100, -10, 0, 10, 100, 1000];
const axPos = (yoy) => (growthFraction(yoy) - AX.lo) / (AX.hi - AX.lo);

function decideLane(name, members, tone) {
  const box = { w: 300, h: 34 };
  const svg = svgRoot(box.w, box.h, null, "none");
  const midY = box.h * 0.52;
  const X = (yoy) => axPos(yoy) * box.w;

  /* The tinted ±10% core of the symlog axis and the decade rules, drawn once
   * per lane so the lane can be read without its neighbour's footnote. */
  svg.appendChild(s("rect", {
    x: X(-CORE), y: 0, width: X(CORE) - X(-CORE), height: box.h,
    fill: "var(--warn)", "fill-opacity": 0.07
  }));
  [-100, 100, 1000].forEach((t) => svg.appendChild(s("path", {
    d: `M ${X(t)} 0 V ${box.h}`, stroke: "rgba(23,24,28,0.22)", "stroke-opacity": 0.5,
    "stroke-width": 1, "stroke-dasharray": "1.5 3", fill: "none", "vector-effect": "non-scaling-stroke"
  })));
  svg.appendChild(s("path", {
    d: `M ${X(0)} 0 V ${box.h}`, stroke: "#17181C", "stroke-opacity": 0.5,
    "stroke-width": 1.2, fill: "none", "vector-effect": "non-scaling-stroke"
  }));

  /* The band. This is the mark: how much of one axis a grouping's four
   * members occupy. Drawn behind the dots, capped at both ends. */
  const xs = members.map((m) => X(m.yoy));
  const lo = Math.min(...xs), hi = Math.max(...xs);
  svg.appendChild(s("rect", {
    x: lo, y: midY - box.h * 0.20, width: Math.max(1, hi - lo), height: box.h * 0.40,
    rx: 2, fill: tone, "fill-opacity": 0.17
  }));
  [lo, hi].forEach((x) => svg.appendChild(s("path", {
    d: `M ${x} ${midY - box.h * 0.26} V ${midY + box.h * 0.26}`,
    stroke: tone, "stroke-width": 1.4, fill: "none", "vector-effect": "non-scaling-stroke"
  })));

  /* One dot per member, area proportional to its own authored ACV against the
   * matrix's authored stakeMax — so a rate standing on a small base reads as a
   * small mark rather than as an equal vote. */
  const RMAX = box.h * 0.30;
  members.forEach((m) => {
    const r = Math.max(2.0, RMAX * Math.sqrt(m.acv / AUTHORED.segMatrix.stakeMax));
    svg.appendChild(s("circle", {
      cx: X(m.yoy), cy: midY, r, fill: "#FFFFFF",
      stroke: TONE[toneKey(m.yoy)], "stroke-width": 1.7, "vector-effect": "non-scaling-stroke"
    }));
  });

  const plot = el("div", { class: "decide-plot" }, [svg]);
  /* Only the two ends are named in place. The middle two collide at 300px and
   * are on the mark's tooltip and in the expand table. */
  const ends = [members.reduce((a, b) => (a.yoy < b.yoy ? a : b)), members.reduce((a, b) => (a.yoy > b.yoy ? a : b))];
  ends.forEach((m, i) => plot.appendChild(el("span", {
    class: "decide-mark-label", text: `${m.short} ${m.yoyDisplay}`,
    style: `--at-x:${(axPos(m.yoy) * 100).toFixed(2)}%;--at-y:${i === 0 ? "1px" : "1px"};`
      + `--shift:${i === 0 ? "0%" : "-100%"};color:${TONE[toneKey(m.yoy)]}`
  })));

  return el("div", { class: "decide-lane" }, [
    el("div", { class: "decide-lane-head" }, [
      el("span", { class: "decide-lane-name", text: name, style: `color:${tone}` }),
      el("span", {
        class: "decide-lane-span",
        text: `${Math.round(hi - lo) === 0 ? "" : ""}${(members.reduce((a, b) => Math.max(a, b.yoy), -1e9)
          - members.reduce((a, b) => Math.min(a, b.yoy), 1e9))} pts apart`,
        style: `color:${tone}`
      })
    ]),
    plot
  ]);
}

function decideAxis() {
  const strip = el("div", { class: "decide-axis" });
  A_TICKS.forEach((t) => {
    const p = axPos(t) * 100;
    strip.appendChild(el("span", {
      class: "decide-tick",
      text: t === 0 ? "0" : `${t < 0 ? "−" : "+"}${Math.abs(t)}%`,
      style: `--at-x:${p.toFixed(2)}%;--shift:${p < 4 ? "0%" : p > 96 ? "-100%" : "-50%"}`
    }));
  });
  return strip;
}

function decideDollarBar(name, bold, explained, tone) {
  const box = { w: 200, h: 12 };
  const svg = svgRoot(box.w, box.h, null, "none");
  svg.appendChild(s("rect", { x: 0, y: 0, width: box.w, height: box.h, rx: 2, fill: "rgba(23,24,28,0.075)" }));
  svg.appendChild(s("rect", {
    x: 0, y: 0, width: (explained / DERIVED.gross) * box.w, height: box.h, rx: 2,
    fill: tone, "fill-opacity": 0.92
  }));
  return el("div", { class: "decide-bar" }, [
    el("span", { class: "decide-bar-name" }, bold
      ? [el("b", { text: name })]
      : [el("span", { text: name })]),
    el("div", { class: "decide-bar-plot" }, [svg]),
    el("span", { class: "decide-bar-value", text: fmtMabs(explained), style: `color:${tone}` })
  ]);
}

export function decideBody() {
  const D = DERIVED;
  const wrap = el("div", { class: "decide" });

  wrap.appendChild(el("p", { class: "decide-q", text: "Which fact about a dollar predicts what happened to it?" }));

  wrap.appendChild(el("div", { class: "decide-spreads" }, [
    decideLane("By product line", SPREADS.prod, "#2F5FA8"),
    decideLane("By customer segment", SPREADS.seg, "#8A6D1F"),
    decideAxis()
  ]));

  wrap.appendChild(el("div", { class: "decide-dollars" }, [
    el("span", { class: "decide-dollars-title", text: `Of the ${fmtMabs(D.gross)} that moved, dollars predicted` }),
    decideDollarBar("Nothing", false, D.gross - D.errNone, "#78808e"),
    decideDollarBar("Segment", true, D.gross - D.errSeg, "#8A6D1F"),
    decideDollarBar("Product line", true, D.gross - D.errProd, "#2F5FA8")
  ]));

  wrap.appendChild(el("div", { class: "decide-verdict" }, [
    el("div", { class: "decide-verdict-cell" }, [
      el("span", { class: "decide-verdict-num", text: fmtMabs(D.gainProduct), style: "color:#2F5FA8" }),
      el("span", { class: "decide-verdict-lab", text: "bought by knowing the product" })
    ]),
    el("div", { class: "decide-verdict-cell" }, [
      el("span", { class: "decide-verdict-num", text: fmtMabs(D.gainSegment), style: "color:#8A6D1F" }),
      el("span", { class: "decide-verdict-lab", text: "bought by knowing the segment" })
    ])
  ]));

  wrap.appendChild(foot(
    "Y/Y — linear inside ±10%, one decade per gridline beyond it. Dot area is the ACV behind the rate. "
    + "Product-line rates are the authored all-segments reading on the Analytics Performance tab; segment rates are the Analytics Total row here.",
    derivedCaption(
      `Prior-dollar-weighted, product line accounts for ${(D.etaProduct * 100).toFixed(0)}% of the variation in `
      + `cell growth and segment for ${(D.etaSegment * 100).toFixed(0)}%. Inside the `
      + `${fmtMabs(D.platPrior)} platform book the segment gradient is still worth ${fmtMabs(D.platExplainedBySegment)}.`
    )
  ));
  return wrap;
}

/* ========================================================================== */
/* ALTERNATIVE B — SMALL MULTIPLES                                            */
/* ========================================================================== */

/* One row per leaf product line, its four segments as dots, all sixteen on
 * ONE axis that runs the full width of the card. That is the change from the
 * matrix: today each of the 28 cells carries its own miniature axis, so
 * reading across a row means comparing four separate ~50px rulers. */

function multiRow(prodRow, cells) {
  const box = { w: 400, h: 44 };
  const svg = svgRoot(box.w, box.h, null, "none");
  const midY = box.h * 0.5;
  const X = (yoy) => axPos(yoy) * box.w;

  svg.appendChild(s("rect", {
    x: X(-CORE), y: 0, width: X(CORE) - X(-CORE), height: box.h,
    fill: "var(--warn)", "fill-opacity": 0.07
  }));
  [-100, 100, 1000].forEach((t) => svg.appendChild(s("path", {
    d: `M ${X(t)} 0 V ${box.h}`, stroke: "rgba(23,24,28,0.22)", "stroke-opacity": 0.5,
    "stroke-width": 1, "stroke-dasharray": "1.5 3", fill: "none", "vector-effect": "non-scaling-stroke"
  })));
  svg.appendChild(s("path", {
    d: `M ${X(0)} 0 V ${box.h}`, stroke: "#17181C", "stroke-opacity": 0.5,
    "stroke-width": 1.2, fill: "none", "vector-effect": "non-scaling-stroke"
  })); 

  /* The cluster band: how much of the shared axis this one product line's four
   * segments occupy. Four short bands in four different places is the read. */
  const xs = cells.map((c) => X(c.yoy));
  const lo = Math.min(...xs), hi = Math.max(...xs);
  svg.appendChild(s("rect", {
    x: lo, y: midY - box.h * 0.17, width: Math.max(1.2, hi - lo), height: box.h * 0.34,
    rx: 2, fill: prodRow.color, "fill-opacity": 0.16
  }));
  [lo, hi].forEach((x) => svg.appendChild(s("path", {
    d: `M ${x} ${midY - box.h * 0.24} V ${midY + box.h * 0.24}`,
    stroke: prodRow.color, "stroke-width": 1.4, fill: "none", "vector-effect": "non-scaling-stroke"
  })));

  const plot = el("div", { class: "multi-plot" }, [svg]);

  /* The dots are HTML, not SVG. The plot stretches to the card width while the
   * viewBox stays 400 wide so the x mapping is shared across all four cards,
   * and anything drawn inside it stretches with it — an SVG circle comes out
   * an upright ellipse. Positioning the marks in percent keeps them round at
   * every width without giving up the shared axis. */
  cells.forEach((c) => {
    const d = Math.max(5, 2 * (box.h * 0.30) * Math.sqrt(c.value / AUTHORED.segMatrix.stakeMax));
    plot.appendChild(el("span", {
      class: "multi-dot",
      style: `--at-x:${(axPos(c.yoy) * 100).toFixed(2)}%;--d:${d.toFixed(1)}px;`
        + `border-color:${TONE[toneKey(c.yoy)]}`
    }));
  });

  /* Only the two ends of the cluster are labelled in place. Four labels on a
   * row this tight collide precisely where the row is most interesting — a
   * product line whose segments agree — so the middle two are on the mark's
   * tooltip and in the expand, as the 28 cells' figures already are. */
  const sorted = [...cells].sort((a, b) => a.yoy - b.yoy);
  const ends = sorted.length > 1 ? [sorted[0], sorted[sorted.length - 1]] : sorted;
  ends.forEach((c, i) => {
    const p = axPos(c.yoy) * 100;
    const shift = i === 0 ? "-100%" : "0%";
    const pad = i === 0 ? -1.5 : 1.5;
    plot.appendChild(el("span", {
      class: "multi-endlab",
      style: `--at-x:${(p + pad).toFixed(2)}%;--shift:${shift};color:${TONE[toneKey(c.yoy)]}`
    }, [
      el("i", { text: c.seg }),
      el("b", { text: c.yoyDisplay })
    ]));
  });

  return el("div", { class: "multi-cell", style: `--line-color:${prodRow.color}` }, [
    el("div", { class: "multi-head" }, [
      el("span", { class: "multi-name", text: prodRow.label }),
      el("span", { class: "multi-sub", text: `${prodRow.display} all segments` }),
      el("span", {
        class: "multi-rate", text: prodRow.yoyDisplay,
        style: `color:${TONE[toneKey(prodRow.yoy)]}`
      })
    ]),
    plot
  ]);
}

function multiAxis() {
  const strip = el("div", { class: "multi-axis" });
  A_TICKS.forEach((t) => {
    const p = axPos(t) * 100;
    strip.appendChild(el("span", {
      class: "multi-tick", text: t === 0 ? "0" : `${t < 0 ? "−" : "+"}${Math.abs(t)}%`,
      style: `--at-x:${p.toFixed(2)}%;--shift:${p < 4 ? "0%" : p > 96 ? "-100%" : "-50%"}`
    }));
  });
  return strip;
}

export function multiBody() {
  const M = AUTHORED.segMatrix;
  const byId = Object.fromEntries(M.rows.map((r) => [r.id, r]));
  const wrap = el("div", { class: "multi" });
  const grid = el("div", { class: "multi-grid" });

  /* Ordered by the authored all-segments rate, worst first, so the reading
   * order down the card is the ranking. */
  AUTHORED.allSegments.rows.forEach((p) => {
    const row = byId[p.id];
    const cells = M.segments.map((seg, i) => ({
      seg: seg.short, value: row.values[i], display: row.display[i],
      yoy: row.yoy[i], yoyDisplay: row.yoyDisplay[i]
    }));
    grid.appendChild(multiRow(p, cells));
  });

  wrap.appendChild(grid);
  wrap.appendChild(multiAxis());
  wrap.appendChild(el("div", { class: "key" }, [
    el("span", { class: "keynote", text: "One axis across all four cards · dot area is the ACV behind the rate" }),
    el("span", { class: "keyitem", text: `${SPREADS.prodSpan} points between the cards · ${SPREADS.segSpan} points across the segments` })
  ]));
  wrap.appendChild(foot(
    "Y/Y — linear inside ±10%, one decade per gridline beyond it. The three roll-up rows are dropped: "
    + "they are the sum of the four drawn here and the Analytics Performance tab carries them in full.",
    derivedCaption(
      `Prior-dollar-weighted, product line accounts for ${(DERIVED.etaProduct * 100).toFixed(0)}% of the variation `
      + `in cell growth and segment for ${(DERIVED.etaSegment * 100).toFixed(0)}%.`
    )
  ));
  return wrap;
}

/* ========================================================================== */
/* ALTERNATIVE C — THE SLOPE                                                  */
/* ========================================================================== */

/* One line per product line across the four segments. Vertical position is
 * the same symlog Y/Y the matrix uses; the four lines never converge and all
 * four tilt the same way. Near-parallel is the finding, so the lines are the
 * marks and there are four of them. */

const SL = { w: 520, h: 300, padL: 34, padR: 128, padT: 12, padB: 10 };
const SL_YTICKS = [-100, -10, 0, 10, 100, 1000];

export function slopeBody() {
  const M = AUTHORED.segMatrix;
  const byId = Object.fromEntries(M.rows.map((r) => [r.id, r]));
  const segs = M.segments;

  const svg = svgRoot(SL.w, SL.h, null, "none");
  const plotW = SL.w - SL.padL - SL.padR;
  const plotH = SL.h - SL.padT - SL.padB;
  const X = (i) => SL.padL + (segs.length === 1 ? plotW / 2 : (i / (segs.length - 1)) * plotW);
  const Y = (yoy) => SL.padT + (1 - axPos(yoy)) * plotH;

  /* The tinted ±10% core, horizontal here because the axis turned. */
  svg.appendChild(s("rect", {
    x: SL.padL, y: Y(CORE), width: plotW + SL.padR * 0.72, height: Y(-CORE) - Y(CORE),
    fill: "var(--warn)", "fill-opacity": 0.07
  }));
  [-100, 100, 1000].forEach((t) => svg.appendChild(s("path", {
    d: `M ${SL.padL} ${Y(t)} H ${SL.padL + plotW + SL.padR * 0.72}`,
    stroke: "rgba(23,24,28,0.22)", "stroke-opacity": 0.5, "stroke-width": 1,
    "stroke-dasharray": "1.5 3", fill: "none", "vector-effect": "non-scaling-stroke"
  })));
  svg.appendChild(s("path", {
    d: `M ${SL.padL} ${Y(0)} H ${SL.padL + plotW + SL.padR * 0.72}`,
    stroke: "#17181C", "stroke-opacity": 0.42, "stroke-width": 1.2, fill: "none",
    "vector-effect": "non-scaling-stroke"
  }));
  /* One faint upright per segment, so a reader can drop from a vertex to its
   * column head without following a line across. */
  segs.forEach((_, i) => svg.appendChild(s("path", {
    d: `M ${X(i)} ${SL.padT} V ${SL.padT + plotH}`,
    stroke: "rgba(23,24,28,0.09)", "stroke-width": 1, fill: "none", "vector-effect": "non-scaling-stroke"
  })));

  const lines = AUTHORED.allSegments.rows.map((p) => {
    const row = byId[p.id];
    return {
      id: p.id, label: p.label, short: p.label.replace("Tableau ", ""),
      color: p.color, allDisplay: p.yoyDisplay, allYoy: p.yoy, acv: p.display,
      pts: segs.map((seg, i) => ({
        seg: seg.short, x: X(i), y: Y(row.yoy[i]),
        yoy: row.yoy[i], yoyDisplay: row.yoyDisplay[i], value: row.values[i]
      }))
    };
  });

  lines.forEach((L) => {
    svg.appendChild(s("path", {
      d: L.pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" "),
      stroke: L.color, "stroke-width": 2.6, fill: "none", "stroke-linejoin": "round",
      "stroke-linecap": "round", "vector-effect": "non-scaling-stroke"
    }));
    /* The run-out to the label gutter, so the name is attached to the line
     * rather than floating beside it. */
    const last = L.pts[L.pts.length - 1];
    svg.appendChild(s("path", {
      d: `M ${last.x} ${last.y} H ${SL.padL + plotW + SL.padR * 0.16}`,
      stroke: L.color, "stroke-width": 1, "stroke-opacity": 0.45, fill: "none",
      "vector-effect": "non-scaling-stroke"
    }));
  });

  lines.forEach((L) => L.pts.forEach((p) => {
    const r = Math.max(2.4, 9 * Math.sqrt(p.value / AUTHORED.segMatrix.stakeMax));
    svg.appendChild(s("circle", {
      cx: p.x, cy: p.y, r, fill: "#FFFFFF", stroke: L.color, "stroke-width": 2,
      "vector-effect": "non-scaling-stroke"
    }));
  }));

  const plot = el("div", { class: "slope-plot" }, [svg]);

  SL_YTICKS.forEach((t) => plot.appendChild(el("span", {
    class: "slope-ytick", text: t === 0 ? "0" : `${t < 0 ? "−" : "+"}${Math.abs(t)}%`,
    style: `--at-y:${((Y(t) / SL.h) * 100).toFixed(2)}%`
  })));

  /* Each line named once, in the gutter, with the authored all-segments rate
   * it resolves to on the Product tab. */
  lines.forEach((L) => {
    const last = L.pts[L.pts.length - 1];
    const lab = el("span", {
      class: "slope-lab",
      style: `--at-x:${(((SL.padL + plotW + SL.padR * 0.20) / SL.w) * 100).toFixed(2)}%;`
        + `--at-y:${((last.y / SL.h) * 100).toFixed(2)}%;--shift:0;color:${L.color}`
    }, [
      el("span", { text: L.short }),
      el("i", { text: ` ${L.allDisplay} all seg` })
    ]);
    plot.appendChild(lab);
  });

  /* The first and last vertex of every line carry their rate, because those
   * are the two the eye lands on; the middle two are on the vertex tooltip
   * and in the expand. */
  lines.forEach((L) => [L.pts[0]].forEach((p) => plot.appendChild(el("span", {
    class: "slope-lab", text: p.yoyDisplay,
    style: `--at-x:${(((SL.padL - 4) / SL.w) * 100).toFixed(2)}%;`
      + `--at-y:${((p.y / SL.h) * 100).toFixed(2)}%;--shift:-100%;color:${L.color}`
  }))));

  const xaxis = el("div", { class: "slope-xaxis" });
  segs.forEach((seg, i) => xaxis.appendChild(el("span", {
    class: "slope-xtick", text: seg.short, style: `--at-x:${((X(i) / SL.w) * 100).toFixed(2)}%`
  })));

  const wrap = el("div", { class: "slope" }, [plot, xaxis]);

  /* The verdict pair is in dollars, not in points of Y/Y. The picture above is
   * a rate picture and its vertical span — 455 points — is mostly Tableau
   * Next's small base talking, which is the objection docs/spread-redesign.md
   * raised against rate dispersion. So the number the panel commits to is the
   * one taken on the certified additive measure: of the gross movement, how
   * much dollar error each fact removes. The point spans stay, in the note,
   * where they describe the picture rather than carry the claim. */
  wrap.appendChild(el("div", { class: "slope-verdict" }, [
    el("div", { class: "slope-verdict-cell" }, [
      el("span", { class: "slope-verdict-num", text: fmtMabs(DERIVED.gainProduct), style: "color:#2F5FA8" }),
      el("span", { class: "slope-verdict-lab", text: "explained by knowing the product line" })
    ]),
    el("div", { class: "slope-verdict-cell" }, [
      el("span", { class: "slope-verdict-num", text: fmtMabs(DERIVED.gainSegment), style: "color:#8A6D1F" }),
      el("span", { class: "slope-verdict-lab", text: "explained by knowing the segment" })
    ]),
    el("p", { class: "slope-verdict-note derived" }, [
      el("b", { text: "Derived · " }),
      el("span", {
        text: `of the ${fmtMabs(DERIVED.gross)} that moved in ACV_clc. The lines span `
          + `${SPREADS.prodSpan} points and each segment only ${SPREADS.segSpan}, but rate spans track base size, `
          + `so the dollars above are the claim. Every line rises toward PubSec.`
      })
    ])
  ]));

  wrap.appendChild(foot(
    "Y/Y — linear inside ±10%, one decade per gridline beyond it. Dot area is the ACV behind the rate. "
    + "Four leaf lines: the three roll-up rows are the sum of these and are carried in full on the Analytics Performance tab.",
    derivedCaption(
      "Vertical distance between lines is the product effect; the common upward tilt is the segment effect. "
      + "The lines do not cross except where Cloud and Server touch."
    )
  ));
  return wrap;
}

/* ========================================================================== */
/* PANEL ASSEMBLY                                                             */
/* ========================================================================== */

const HERO = {
  a: () => portlet(AUTHORED.movement.label, "What moved each segment's dollars, Q2 FY26 to Q2 FY27",
    AUTHORED.movement.accent, movementBody(true)),
  b: () => portlet("ACV by product and segment", "Four product lines across four segments, on one axis, Q2 FY27",
    AUTHORED.segMatrix.accent, multiBody()),
  c: () => portlet("How each product line moves across segments", "Four product lines, four segments, one growth axis, Q2 FY27",
    AUTHORED.segMatrix.accent, slopeBody())
};

const SIDE = {
  a: () => portlet("Product or segment?", "What the four segments and the four product lines each explain",
    "#8A6D1F", decideBody()),
  b: () => portlet(AUTHORED.movement.label, AUTHORED.movement.sublabel,
    AUTHORED.movement.accent, movementBody(false)),
  c: () => portlet(AUTHORED.movement.label, AUTHORED.movement.sublabel,
    AUTHORED.movement.accent, movementBody(false))
};

const HEADLINE = {
  a: "Two product lines took the dollars out, in every segment",
  b: "Four product lines, four different stories — and one story per segment",
  c: "The lines never cross: product sets the level, segment only tilts it"
};

export function render(alt) {
  const tab = AUTHORED.tab;
  const panel = el("div", {
    class: "panel", "data-tab": tab.id, "data-grid": alt,
    style: `--tab-accent:${tab.accent}`
  }, [
    el("div", { class: "panel-head" }, [
      el("p", { class: "panel-kicker", text: tab.kicker }),
      el("h2", { class: "panel-headline", text: HEADLINE[alt] }),
      el("span", { class: "panel-info", text: "i" })
    ])
  ]);

  panel.appendChild(el("div", { class: "panel-bands" }, [
    el("div", { class: "band", "data-layout": "seg-main" }, [HERO[alt]()]),
    el("div", { class: "band", "data-layout": "seg-side" }, [SIDE[alt]()])
  ]));

  document.body.appendChild(el("div", { class: "app" }, [
    topbar(tab.id),
    el("main", { class: "stage" }, [panel])
  ]));
}
