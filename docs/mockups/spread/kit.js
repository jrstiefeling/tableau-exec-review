/* Standalone mockup renderer for the within-spread redesign.
 *
 * Self-contained by contract: this module imports nothing from ../../../src/
 * and is imported by nothing there. It transcribes the parts of the board it
 * needs — the symlog growth axis from src/charts/growth.js, the matrix cell
 * geometry from src/charts/growthMatrix.js, and the card idiom from
 * styles/portlets.css — so a mockup can be judged beside the running board
 * without being able to break it.
 *
 * Every figure below is either transcribed verbatim from data/board.json or
 * derived from two of its figures by exact arithmetic. Derived values carry a
 * `derived: true` flag and are labelled as derived wherever they are drawn.
 * Nothing is estimated, rounded up, smoothed or invented. */

/* ========================================================================== */
/* AUTHORED — transcribed from data/board.json                                */
/* ========================================================================== */

export const AUTHORED = {
  meta: {
    period: "Q2 FY27",
    /* board.json meta.freshness / meta.scope, carried on the mockups so the
     * provenance line the board prints is not silently dropped. */
    freshness: "Jul 28, 2026 · 9:00 AM PT · SDM hourly over the ~8 AM PT extract"
  },

  /* tabs[2] — performance-by-segment */
  segTab: {
    id: "performance-by-segment",
    kicker: "Q2 FY27 · Four segments",
    headline: "One segment growing, and Embedded growing in all four",
    accent: "#6B4FBF"
  },
  /* tabs[1] — analytics-performance */
  perfTab: {
    id: "analytics-performance",
    kicker: "Q2 FY27 · All segments",
    headline: "A shrinking platform base and one line growing off almost nothing",
    accent: "#12806A"
  },

  /* seg-matrix.metrics — 28 authored cells, 7 rows x 4 segments */
  segMatrix: {
    label: "ACV by product and segment",
    sublabel: "Seven product lines across four segments, Q2 FY27",
    accent: "#2F5FA8",
    stakeMax: 83,
    axisNote: "Y/Y — linear inside ±10%, one decade per gridline beyond it",
    caption:
      "Bar length is Y/Y on a log scale past ±10%; dot area is the ACV behind it · the dollars are on hover, or expand for the full grid",
    segments: [
      { id: "entr", short: "ENTR", label: "Enterprise" },
      { id: "cmrcl", short: "CMRCL", label: "Commercial" },
      { id: "smb", short: "SMB", label: "Small & Medium Business" },
      { id: "pubsec", short: "PubSec", label: "Public Sector" }
    ],
    rows: [
      { id: "analytics-total", label: "Analytics Total", level: 0, parent: null, color: "#1C6E8C",
        values: [39, 18, 12, 15], display: ["$39M", "$18M", "$12M", "$15M"],
        yoy: [-35, -31, -23, 14], yoyDisplay: ["-35%", "-31%", "-23%", "+14%"] },
      { id: "platform", label: "Agentic Analytics Platform", level: 1, parent: "analytics-total", color: "#2F5FA8",
        values: [26, 13, 10, 10], display: ["$26M", "$13M", "$10M", "$10M"],
        yoy: [-48, -41, -34, -12], yoyDisplay: ["-48%", "-41%", "-34%", "-12%"] },
      { id: "cloud", label: "Tableau Cloud", level: 2, parent: "platform", color: "#2F5FA8",
        values: [16, 10, 8, 4], display: ["$16M", "$10M", "$8M", "$4M"],
        yoy: [-48, -42, -30, -16], yoyDisplay: ["-48%", "-42%", "-30%", "-16%"] },
      { id: "server", label: "Tableau Server", level: 2, parent: "platform", color: "#6E8FC4",
        values: [10, 4, 2, 6], display: ["$10M", "$4M", "$2M", "$6M"],
        yoy: [-48, -38, -45, -8], yoyDisplay: ["-48%", "-38%", "-45%", "-8%"] },
      { id: "embedded", label: "Embedded Agentic Analytics", level: 1, parent: "analytics-total", color: "#12806A",
        values: [13, 4, 2, 5], display: ["$13M", "$4M", "$2M", "$5M"],
        yoy: [33, 43, 147, 78], yoyDisplay: ["+33%", "+43%", "+147%", "+78%"] },
      { id: "next", label: "Tableau Next", level: 2, parent: "embedded", color: "#12806A",
        values: [8, 3, 1, 2], display: ["$8M", "$3M", "$1M", "$2M"],
        yoy: [402, 236, 727, 1060], yoyDisplay: ["+402%", "+236%", "+727%", "+1060%"] },
      { id: "crma", label: "CRMA", level: 2, parent: "embedded", color: "#5EA394",
        values: [5, 2, 1, 3], display: ["$5M", "$2M", "$1M", "$3M"],
        yoy: [-37, -18, 33, 69], yoyDisplay: ["-37%", "-18%", "+33%", "+69%"] }
    ]
  },

  /* perf-hierarchy.metrics — 7 authored product-line totals, one column */
  perfMatrix: {
    label: "ACV by product",
    sublabel: "Two-level product taxonomy, Q2 FY27",
    accent: "#1C6E8C",
    stakeMax: 83,
    axisNote: "Y/Y — linear inside ±10%, one decade per gridline beyond it",
    caption: "$83M across two motions and four product lines · exact figures on hover, or expand for the grid",
    rollup: { total: 83, totalDisplay: "$83M",
      levels: [["analytics-total"], ["platform", "embedded"], ["cloud", "server", "next", "crma"]] },
    segments: [{ id: "all", short: "All", label: "All Segments", reference: true }],
    rows: [
      { id: "analytics-total", label: "Analytics Total", level: 0, parent: null, value: 83, display: "$83M", yoy: -27, yoyDisplay: "-27%", color: "#1C6E8C" },
      { id: "platform", label: "Agentic Analytics Platform", level: 1, parent: "analytics-total", value: 59, display: "$59M", yoy: -40, yoyDisplay: "-40%", color: "#2F5FA8" },
      { id: "cloud", label: "Tableau Cloud", level: 2, parent: "platform", value: 38, display: "$38M", yoy: -41, yoyDisplay: "-41%", color: "#2F5FA8" },
      { id: "server", label: "Tableau Server", level: 2, parent: "platform", value: 21, display: "$21M", yoy: -39, yoyDisplay: "-39%", color: "#6E8FC4" },
      { id: "embedded", label: "Embedded Agentic Analytics", level: 1, parent: "analytics-total", value: 24, display: "$24M", yoy: 57, yoyDisplay: "+57%", color: "#12806A" },
      { id: "next", label: "Tableau Next", level: 2, parent: "embedded", value: 13, display: "$13M", yoy: 414, yoyDisplay: "+414%", color: "#12806A" },
      { id: "crma", label: "CRMA", level: 2, parent: "embedded", value: 11, display: "$11M", yoy: -15, yoyDisplay: "-15%", color: "#5EA394" }
    ]
  }
};

const LEAVES = ["cloud", "server", "next", "crma"];
const SHORT = { cloud: "Cloud", server: "Server", next: "Next", crma: "CRMA" };

/* ========================================================================== */
/* DERIVED — exact arithmetic over two authored figures, labelled as derived   */
/* ========================================================================== */

/* prior = current / (1 + Y/Y). Both inputs are authored per cell, so this is
 * exact arithmetic over authored values rather than an estimate — but it is
 * still derived, and the board's own rule (docs/visualization-research.md,
 * "author the prior period, do not derive it") says a shipped version must
 * read an authored priorValue rather than compute this at render time. The
 * mockups compute it so the form can be judged; the spec carries the
 * authoring prerequisite. */
export function derivePrior(current, yoyPercent) {
  return current / (1 + yoyPercent / 100);
}

export function movement(current, yoyPercent) {
  const prior = derivePrior(current, yoyPercent);
  return { current, prior, delta: current - prior, derived: true };
}

const fmtM = (v) => `${v < 0 ? "−" : "+"}$${Math.abs(v).toFixed(1)}M`;
const fmtLevel = (v) => `$${v.toFixed(1)}M`;

/* Per-segment leaf movements, from seg-matrix's authored values and rates. */
export function segmentContributions() {
  const rows = Object.fromEntries(AUTHORED.segMatrix.rows.map((r) => [r.id, r]));
  return AUTHORED.segMatrix.segments.map((seg, i) => ({
    id: seg.id,
    label: seg.short,
    full: seg.label,
    parts: LEAVES.map((id) => {
      const m = movement(rows[id].values[i], rows[id].yoy[i]);
      return { id, name: rows[id].label, short: SHORT[id], color: rows[id].color, ...m };
    })
  }));
}

/* Per-motion leaf movements, from perf-hierarchy's authored values and rates. */
export function motionContributions() {
  const rows = Object.fromEntries(AUTHORED.perfMatrix.rows.map((r) => [r.id, r]));
  const groups = [
    { id: "platform", label: "Agentic Analytics Platform", members: ["cloud", "server"] },
    { id: "embedded", label: "Embedded Agentic Analytics", members: ["next", "crma"] }
  ];
  return groups.map((g) => ({
    id: g.id,
    label: g.label,
    full: g.label,
    parts: g.members.map((id) => {
      const m = movement(rows[id].value, rows[id].yoy);
      return { id, name: rows[id].label, short: SHORT[id], color: rows[id].color, ...m };
    })
  }));
}

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
const growthX = (v, zeroX, half) => {
  const f = growthFraction(v);
  return f === null ? null : zeroX + f * half;
};
const DECADE_FRACTIONS = [growthFraction(100), growthFraction(1000)];
const GROWTH_TICKS = [
  { at: -1000, label: "−1000%" }, { at: -100, label: "−100%" }, { at: -10, label: "−10%" },
  { at: 0, label: "0" },
  { at: 10, label: "+10%" }, { at: 100, label: "+100%" }, { at: 1000, label: "+1000%" }
];

const cellBox = (n) => (n === 1 ? { w: 420, h: 48, pad: 14 } : { w: 200, h: 44, pad: 14 });
const cellAxis = (box) => ({ zeroX: box.w / 2, halfWidth: box.w / 2 - box.pad, midY: box.h / 2 });

/* ========================================================================== */
/* DOM helpers                                                                */
/* ========================================================================== */

const NS = "http://www.w3.org/2000/svg";
function el(tag, attrs = {}, kids = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k === "style") n.setAttribute("style", v);
    else if (k.startsWith("--")) n.style.setProperty(k, v);
    else if (k.startsWith("data") || k === "id") n.setAttribute(k, v);
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
function toneOf(v, soft = 10) {
  if (v === 0) return "neutral";
  if (v > 0) return "pos";
  return Math.abs(v) < soft ? "warn" : "neg";
}

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
    mark.appendChild(s("g", { class: `mark-${cls}` }, rects.map(([x, y, w, h]) => s("rect", { x, y, width: w, height: h })))));

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

function portlet(label, sublabel, accent, body, extraClass) {
  return el("div", { class: `portlet${extraClass ? ` ${extraClass}` : ""}`, style: `--accent:${accent}` }, [
    el("div", { class: "portlet-face" }, [
      el("div", { class: "portlet-head" }, [
        el("div", { class: "portlet-titles" }, [
          el("p", { class: "portlet-label", text: label }),
          el("p", { class: "portlet-sublabel", text: sublabel })
        ]),
        el("div", { class: "portlet-tools" }, [
          el("span", { class: "portlet-expand", text: "⌄" }),
          el("span", { class: "trust-dot" })
        ])
      ]),
      el("div", { class: "portlet-body" }, [body])
    ])
  ]);
}

/* ========================================================================== */
/* THE MATRIX — reproduced from src/charts/growthMatrix.js                    */
/* ========================================================================== */

function matrixCell(value, yoy, yoyDisplay, rowColor, stakeMax, colCount, label) {
  const box = cellBox(colCount);
  const ax = cellAxis(box);
  const BAR_H = box.h * 0.25;
  const RMAX = box.h * 0.2;
  const svg = svgRoot(box.w, box.h, "growth-cell-svg");

  svg.appendChild(s("rect", {
    x: ax.zeroX - CORE_FRACTION * ax.halfWidth, y: 0,
    width: 2 * CORE_FRACTION * ax.halfWidth, height: box.h,
    fill: "var(--warn)", "fill-opacity": 0.06
  }));
  DECADE_FRACTIONS.forEach((f) => [-1, 1].forEach((sign) =>
    svg.appendChild(s("path", {
      d: `M ${ax.zeroX + sign * f * ax.halfWidth} 2 V ${box.h - 2}`,
      stroke: "rgba(23,24,28,0.22)", "stroke-opacity": 0.5, "stroke-width": 1,
      "stroke-dasharray": "1.5 3", fill: "none"
    }))));
  svg.appendChild(s("path", {
    d: `M ${ax.zeroX} 0 V ${box.h}`, stroke: "#17181C", "stroke-opacity": 0.5, "stroke-width": 1.2, fill: "none"
  }));

  const tint = TONE[toneOf(yoy)];
  const gx = growthX(yoy, ax.zeroX, ax.halfWidth);
  const width = Math.max(0.8, Math.abs(gx - ax.zeroX));
  svg.appendChild(s("rect", {
    x: yoy < 0 ? ax.zeroX - width : ax.zeroX, y: ax.midY - BAR_H / 2,
    width, height: BAR_H, rx: 1.5, fill: tint, "fill-opacity": 0.9
  }));
  const r = Math.max(1.6, RMAX * Math.sqrt(Math.max(0, value) / stakeMax));
  svg.appendChild(s("circle", {
    cx: ax.zeroX, cy: ax.midY, r, fill: "#FFFFFF", stroke: rowColor, "stroke-width": 1.6
  }));

  const cell = el("div", { class: "growth-cell" }, [svg]);
  if (yoyDisplay) {
    const pct = (gx / box.w) * 100;
    cell.appendChild(el("span", {
      class: "growth-rate", text: yoyDisplay,
      "data-dir": yoy < 0 ? "neg" : "pos",
      style: `--rate-at:${pct.toFixed(2)}%;--rate-w:${(yoyDisplay.length + 2.4).toFixed(1)}ch;color:${tint}`
    }));
  }
  if (label) cell.setAttribute("aria-label", label);
  return cell;
}

function containmentRail(rows) {
  const RAIL = { w: 34, rowUnits: 100, x0: 8, step: 11, tick: 7 };
  const h = rows.length * RAIL.rowUnits;
  const svg = svgRoot(RAIL.w, h, "growth-rail-svg", "none");
  const idx = Object.fromEntries(rows.map((r, i) => [r.id, i]));
  const parents = [...new Set(rows.filter((r) => r.parent).map((r) => r.parent))];
  parents.forEach((pid) => {
    const kids = rows.filter((r) => r.parent === pid).map((r) => idx[r.id]);
    const depth = rows[idx[pid]].level;
    const x = RAIL.x0 + depth * RAIL.step;
    const y0 = kids[0] * RAIL.rowUnits + RAIL.rowUnits / 2;
    const y1 = kids[kids.length - 1] * RAIL.rowUnits + RAIL.rowUnits / 2;
    svg.appendChild(s("path", {
      d: `M ${x} ${y0} V ${y1}`, stroke: "rgba(20,22,26,0.22)", "stroke-width": 1.4,
      fill: "none", "vector-effect": "non-scaling-stroke"
    }));
    kids.forEach((k) => svg.appendChild(s("path", {
      d: `M ${x} ${k * RAIL.rowUnits + RAIL.rowUnits / 2} h ${RAIL.tick}`,
      stroke: "rgba(20,22,26,0.22)", "stroke-width": 1.4, fill: "none", "vector-effect": "non-scaling-stroke"
    })));
  });
  return el("div", { class: "growth-rail" }, [svg]);
}

function axisStrip(colStart) {
  const box = cellBox(colStart === 4 ? 1 : 2);
  const ax = cellAxis(box);
  const ticks = el("div", { class: "growth-ticks", style: `--col:${colStart}` });
  GROWTH_TICKS.forEach((t) => {
    const x = growthX(t.at, ax.zeroX, ax.halfWidth);
    ticks.appendChild(el("span", { class: "growth-tick", text: t.label, style: `--at-x:${((x / box.w) * 100).toFixed(2)}%` }));
  });
  return el("div", { class: "growth-axis" }, [ticks]);
}

/* ---- Segment matrix (4 columns, 7 rows, 28 cells) ---- */

function segMatrixBody({ dispersion = false } = {}) {
  const M = AUTHORED.segMatrix;
  const cols = M.segments.length;
  const wrap = el("div", { class: "growth", style: `--cell-tracks:repeat(${cols}, minmax(0,1fr))` });

  const leafRatesFor = (c) => M.rows.filter((r) => LEAVES.includes(r.id)).map((r) => r.yoy[c]);

  const head = el("div", { class: "growth-head" });
  M.segments.forEach((seg, c) => {
    const cell = el("span", { class: "growth-colhead", style: `--col:${c + 3}` }, [
      el("span", { text: seg.short })
    ]);
    /* Alternative C states each column's interval in words in the column head,
     * where a heading is already being read, rather than spending a panel on
     * re-drawing two cells the grid below already carries. */
    if (dispersion) {
      const rates = leafRatesFor(c);
      cell.appendChild(el("span", {
        class: "growth-colspan",
        text: `${Math.min(...rates)}% to +${Math.max(...rates)}%`
      }));
    }
    head.appendChild(cell);
  });
  wrap.appendChild(head);

  const body = el("div", { class: "growth-body", style: `--row-tracks:repeat(${M.rows.length}, minmax(0,1fr))` });
  body.appendChild(containmentRail(M.rows));

  /* Alternative C: the within-segment dispersion, folded into the matrix as a
   * band behind each column running from that column's slowest leaf rate to
   * its fastest. Every cell in a column shares one axis geometry, so the band
   * is the same interval the dumbbell drew, at no extra slot. */
  /* The interval itself is two hairlines down the column at the slowest and
   * fastest leaf rate, over the faintest of washes. The dumbbell's whole
   * geometry, at the cost of two rules per column and no slot at all. */
  if (dispersion) {
    const box = cellBox(cols);
    const ax = cellAxis(box);
    M.segments.forEach((seg, c) => {
      const rates = leafRatesFor(c);
      const x0 = (growthX(Math.min(...rates), ax.zeroX, ax.halfWidth) / box.w) * 100;
      const x1 = (growthX(Math.max(...rates), ax.zeroX, ax.halfWidth) / box.w) * 100;
      /* A real grid item, not an absolutely positioned one. An abspos grid
       * child resolves `-1` to the container's padding edge rather than to the
       * track, which puts every column's bracket on the first column's axis. */
      body.appendChild(el("div", {
        class: "growth-dispwrap",
        style: `grid-column:${c + 3};grid-row:1 / ${M.rows.length + 1}`
      }, [
        el("div", { class: "growth-disp", style: `left:${x0.toFixed(2)}%;width:${(x1 - x0).toFixed(2)}%` })
      ]));
    });
  }

  M.rows.forEach((row, r) => {
    body.appendChild(el("span", {
      class: "growth-row-label", text: row.label,
      "data-level": String(row.level), style: `--row:${r + 1};--level:${row.level}`
    }));
    M.segments.forEach((seg, c) => {
      const cell = matrixCell(row.values[c], row.yoy[c], row.yoyDisplay[c], row.color, M.stakeMax, cols,
        `${seg.label} · ${row.label} · ${row.display[c]} · ${row.yoyDisplay[c]} Y/Y`);
      cell.setAttribute("style", `--col:${c + 3};--row:${r + 1}`);
      body.appendChild(cell);
    });
  });
  wrap.appendChild(body);
  wrap.appendChild(axisStrip(3));
  wrap.appendChild(el("p", { class: "growth-axisnote", text: M.axisNote }));
  wrap.appendChild(el("p", {
    class: "growth-caption",
    text: dispersion
      ? "Bar length is Y/Y on a log scale past ±10%; dot area is the ACV behind it · the shaded band spans each segment's slowest to fastest product line"
      : M.caption
  }));
  return wrap;
}

/* ---- Product matrix (1 wide column, 7 rows, roll-up tile bar) ---- */

function rollupBar() {
  const M = AUTHORED.perfMatrix;
  const ROLL = { w: 420, h: 96, rowH: 20, rows: [6, 38, 70] };
  const byId = Object.fromEntries(M.rows.map((r) => [r.id, r]));
  const svg = svgRoot(ROLL.w, ROLL.h, "growth-rollup-svg", "none");
  const labels = [];
  M.rollup.levels.forEach((ids, li) => {
    let x = 0;
    ids.forEach((id) => {
      const row = byId[id];
      const w = (row.value / M.rollup.total) * ROLL.w;
      svg.appendChild(s("rect", {
        x: x + 0.5, y: ROLL.rows[li], width: Math.max(0, w - 1), height: ROLL.rowH,
        rx: 2, fill: row.color, "fill-opacity": li === 0 ? 0.95 : li === 1 ? 0.85 : 0.7
      }));
      labels.push({ text: row.display, x: x + w / 2, y: ROLL.rows[li] + ROLL.rowH / 2 });
      x += w;
    });
  });
  const plot = el("div", { class: "growth-rollup-plot" }, [svg]);
  labels.forEach((l) => plot.appendChild(el("span", {
    class: "growth-block-label", text: l.text,
    style: `--at-x:${((l.x / ROLL.w) * 100).toFixed(2)}%;--at-y:${((l.y / ROLL.h) * 100).toFixed(2)}%`
  })));
  return el("div", { class: "growth-rollup" }, [
    el("div", { class: "growth-rollup-head" }, [
      el("span", { class: "growth-rollup-total", text: M.rollup.totalDisplay }),
      el("span", { class: "growth-rollup-eyebrow", text: "Tiles at every level" })
    ]),
    plot
  ]);
}

function perfMatrixBody({ dispersion = false } = {}) {
  const M = AUTHORED.perfMatrix;
  const wrap = el("div", { class: "growth", style: "--cell-tracks:max-content minmax(0,1fr)" });
  wrap.appendChild(rollupBar());

  const body = el("div", { class: "growth-body", style: `--row-tracks:repeat(${M.rows.length}, minmax(0,1fr))` });
  body.appendChild(containmentRail(M.rows));

  const spans = {};
  if (dispersion) {
    const box = cellBox(1);
    const ax = cellAxis(box);
    [["platform", ["cloud", "server"]], ["embedded", ["next", "crma"]]].forEach(([gid, members]) => {
      const rates = members.map((id) => M.rows.find((r) => r.id === id).yoy);
      const lo = Math.min(...rates), hi = Math.max(...rates);
      const idxs = members.map((id) => M.rows.findIndex((r) => r.id === id) + 1);
      const x0 = (growthX(lo, ax.zeroX, ax.halfWidth) / box.w) * 100;
      const x1 = (growthX(hi, ax.zeroX, ax.halfWidth) / box.w) * 100;
      body.appendChild(el("div", {
        class: "growth-dispwrap",
        style: `grid-column:4;grid-row:${Math.min(...idxs)} / ${Math.max(...idxs) + 1}`
      }, [
        el("div", { class: "growth-disp", style: `left:${x0.toFixed(2)}%;width:${Math.max(0.5, x1 - x0).toFixed(2)}%` })
      ]));
      spans[gid] = `${lo}% to ${hi > 0 ? "+" : ""}${hi}%`;
    });
  }

  M.rows.forEach((row, r) => {
    const labelEl = el("span", {
      class: "growth-row-label", "data-level": String(row.level),
      style: `--row:${r + 1};--level:${row.level}`
    }, [el("span", { text: row.label })]);
    if (spans[row.id]) labelEl.appendChild(el("span", { class: "growth-rowspan", text: spans[row.id] }));
    body.appendChild(labelEl);
    body.appendChild(el("span", { class: "growth-row-value", text: row.display, style: `--row:${r + 1};grid-column:3` }));
    const cell = matrixCell(row.value, row.yoy, row.yoyDisplay, row.color, M.stakeMax, 1,
      `${row.label} · ${row.display} · ${row.yoyDisplay} Y/Y`);
    cell.setAttribute("style", `--col:4;--row:${r + 1}`);
    body.appendChild(cell);
  });
  wrap.appendChild(body);
  wrap.appendChild(axisStrip(4));
  wrap.appendChild(el("p", { class: "growth-axisnote", text: M.axisNote }));
  wrap.appendChild(el("p", {
    class: "growth-caption",
    text: dispersion
      ? "$83M across two motions and four product lines · the shaded band spans each motion's slowest to fastest line"
      : M.caption
  }));
  return wrap;
}

/* ========================================================================== */
/* ALTERNATIVE A — CONTRIBUTION                                               */
/* ========================================================================== */

/* One track per group. Losses stack leftward from the rule, gains rightward,
 * both in the same dollars, on one axis shared by every group in the panel.
 * The two wing lengths are the decomposition; their imbalance is the net.
 *
 * Deliberately NOT a closing bridge. A bridge asserts that the parts land on
 * the authored group total, and on this data they do not: CMRCL's authored
 * children do not sum to its authored parent, and back-solved priors leave a
 * residual of $0.06M–$0.60M elsewhere. A contribution chart makes no closure
 * claim, so it renders the same arithmetic without surfacing an inconsistency
 * the board has decided to carry silently. */

/* The plot stretches to whatever height its row is given —
 * `preserveAspectRatio="none"` with the one hairline held by
 * `vector-effect`. Aspect-locking it, as the dumbbell does, would letterbox a
 * four-row side column and crush a two-row strip; a stacked bar has no aspect
 * ratio worth preserving because every mark in it is an axis-aligned
 * rectangle whose meaning is its width. */
const PLOT = { w: 300, h: 40 };

function contribTrack(parts, domain) {
  const box = { w: PLOT.w, h: PLOT.h, pad: 8 };
  const span = domain.max - domain.min;
  const x = (v) => box.pad + ((v - domain.min) / span) * (box.w - 2 * box.pad);
  const zeroX = x(0);
  const svg = svgRoot(box.w, box.h, "contrib-svg", "none");
  const barH = box.h * 0.58;
  const y = box.h / 2 - barH / 2;

  const tags = [];
  const losses = parts.filter((p) => p.delta < 0).sort((a, b) => a.delta - b.delta);
  const gains = parts.filter((p) => p.delta > 0).sort((a, b) => b.delta - a.delta);

  let cursor = 0;
  losses.forEach((p, i) => {
    const x1 = x(cursor), x0 = x(cursor + p.delta);
    svg.appendChild(s("rect", {
      x: x0, y, width: Math.max(0.6, x1 - x0 - 0.8), height: barH, rx: 1.5,
      fill: "var(--neg)", "fill-opacity": 0.92 - i * 0.16
    }));
    tags.push({ mid: (x0 + x1) / 2, w: x1 - x0, p });
    cursor += p.delta;
  });
  cursor = 0;
  gains.forEach((p, i) => {
    const x0 = x(cursor), x1 = x(cursor + p.delta);
    svg.appendChild(s("rect", {
      x: x0 + 0.8, y, width: Math.max(0.6, x1 - x0 - 0.8), height: barH, rx: 1.5,
      fill: "var(--pos)", "fill-opacity": 0.92 - i * 0.16
    }));
    tags.push({ mid: (x0 + x1) / 2, w: x1 - x0, p });
    cursor += p.delta;
  });

  svg.appendChild(s("path", {
    d: `M ${zeroX} 0 V ${box.h}`, stroke: "#17181C", "stroke-opacity": 0.55,
    "stroke-width": 1.2, fill: "none", "vector-effect": "non-scaling-stroke"
  }));

  const plot = el("div", { class: "contrib-plot" }, [svg]);
  tags.forEach((t) => {
    /* A piece is labelled where it has the room. Below that the figure is on
     * the tooltip and in the expand table, never printed over its neighbour. */
    const pctW = (t.w / box.w) * 100;
    const text = pctW > 14 ? `${t.p.short} ${Math.abs(t.p.delta).toFixed(1)}` : pctW > 6.5 ? Math.abs(t.p.delta).toFixed(1) : null;
    if (!text) return;
    plot.appendChild(el("span", {
      class: "contrib-tag", text, style: `--at-x:${((t.mid / box.w) * 100).toFixed(2)}%`
    }));
  });
  return plot;
}

/* The dollar axis, once per panel under the last row. The current panel's
 * "same growth axis as the matrix beside it" note names an axis the panel
 * never draws; this one is drawn. */
function contribAxis(domain, ticks) {
  const box = { w: PLOT.w, pad: 8 };
  const span = domain.max - domain.min;
  const x = (v) => box.pad + ((v - domain.min) / span) * (box.w - 2 * box.pad);
  const strip = el("div", { class: "contrib-axis" });
  ticks.forEach((t) => strip.appendChild(el("span", {
    class: "contrib-tick", text: t === 0 ? "0" : `${t < 0 ? "−" : "+"}$${Math.abs(t)}M`,
    style: `--at-x:${((x(t) / box.w) * 100).toFixed(2)}%`
  })));
  return strip;
}

function contribBody(groups, { domain, ticks, note, caption }) {
  const wrap = el("div", { class: "contrib" });
  const rows = el("div", { class: "contrib-rows" });
  groups.forEach((g) => {
    const net = g.parts.reduce((a, p) => a + p.delta, 0);
    rows.appendChild(el("div", { class: "contrib-row" }, [
      el("div", { class: "contrib-head" }, [
        el("span", { class: "contrib-name", text: g.label }),
        el("span", { class: "contrib-net", text: fmtM(net), style: `color:${net < 0 ? "var(--neg)" : "var(--pos)"}` })
      ]),
      contribTrack(g.parts, domain),
      /* One axis per row. Stacked, CSS keeps only the last — the rows share a
       * vertical line so one ruler locates them all. Turned into a row on the
       * Product tab, each strip gets its own, because they no longer do. */
      contribAxis(domain, ticks)
    ]));
  });
  wrap.appendChild(rows);
  wrap.appendChild(el("div", { class: "contrib-key" }, [
    el("span", { class: "contrib-key-item" }, [
      el("span", { class: "contrib-key-swatch", style: "background:var(--neg)" }),
      el("span", { text: "removed" })
    ]),
    el("span", { class: "contrib-key-item" }, [
      el("span", { class: "contrib-key-swatch", style: "background:var(--pos)" }),
      el("span", { text: "added" })
    ]),
    el("span", { class: "contrib-key-item", text: "largest line nearest the rule" })
  ]));
  wrap.appendChild(el("div", { class: "contrib-foot" }, [
    el("p", { class: "spread-axisnote", text: note }),
    el("p", { class: "spread-caption derived-note" }, [
      el("b", { text: "Derived · " }),
      el("span", { text: caption })
    ])
  ]));
  return wrap;
}

/* ========================================================================== */
/* ALTERNATIVE B — TWO-PERIOD LEVELS                                          */
/* ========================================================================== */

/* Last year's dollars to this year's, per product line, on one dollar axis.
 * The mark starts where the line started, so "growing off almost nothing"
 * is drawn as a mark that begins on the origin rather than asserted in a
 * caption. */

const LV = { w: 300, h: 22, pad: 6, tail: 62 };

function levelsRow(part, domain) {
  /* `tail` is a reserved gutter on the right for the current-year figure, so
   * a mark and its own numeral never occupy the same pixels however narrow
   * the column gets. The plot is stretched, the numeral is DOM. */
  const box = { w: LV.w, h: LV.h, pad: LV.pad };
  const usable = box.w - box.pad - LV.tail;
  const x = (v) => box.pad + (v / domain) * (usable - box.pad);
  const svg = svgRoot(box.w, box.h, "levels-svg", "none");
  const midY = box.h / 2;
  const up = part.delta > 0;
  const tone = up ? "var(--pos)" : "var(--neg)";

  [0.25, 0.5, 0.75, 1].forEach((f) => svg.appendChild(s("path", {
    d: `M ${x(domain * f)} 0 V ${box.h}`, stroke: "rgba(23,24,28,0.22)",
    "stroke-opacity": 0.4, "stroke-width": 1, "stroke-dasharray": "1.5 3",
    fill: "none", "vector-effect": "non-scaling-stroke"
  })));
  svg.appendChild(s("path", {
    d: `M ${box.pad} ${midY} V ${midY}`, stroke: "none"
  }));

  const x0 = x(part.prior), x1 = x(part.current);
  svg.appendChild(s("rect", {
    x: Math.min(x0, x1), y: midY - box.h * 0.16, width: Math.max(0.8, Math.abs(x1 - x0)),
    height: box.h * 0.32, fill: tone, "fill-opacity": 0.28
  }));
  svg.appendChild(s("circle", { cx: x0, cy: midY, r: box.h * 0.17, fill: "#FFFFFF", stroke: tone, "stroke-width": 1.4, "vector-effect": "non-scaling-stroke" }));
  svg.appendChild(s("circle", { cx: x1, cy: midY, r: box.h * 0.21, fill: tone }));

  const plot = el("div", { class: "levels-plot" }, [svg]);
  plot.appendChild(el("span", {
    class: "levels-tag", text: fmtLevel(part.current),
    style: `--at-x:${(((box.w - LV.tail / 2) / box.w) * 100).toFixed(2)}%;color:${tone}`
  }));
  return plot;
}

function levelsAxis(domain, ticks) {
  const usable = LV.w - LV.pad - LV.tail;
  const strip = el("div", { class: "levels-axis" });
  ticks.forEach((t) => strip.appendChild(el("span", {
    class: "levels-tick", text: t === 0 ? "0" : `$${t}M`,
    style: `--at-x:${(((LV.pad + (t / domain) * (usable - LV.pad)) / LV.w) * 100).toFixed(2)}%`
  })));
  return el("div", { class: "levels-line levels-axis-line" }, [el("span"), strip]);
}

function levelsBody(groups, { domain, ticks, note, caption }) {
  const wrap = el("div", { class: "levels" });
  const gs = el("div", { class: "levels-groups" });
  groups.forEach((g) => {
    const box = el("div", { class: "levels-group" }, [el("span", { class: "levels-gname", text: g.label })]);
    g.parts.forEach((p) => box.appendChild(el("div", { class: "levels-line" }, [
      el("span", { class: "levels-lname", text: p.short }),
      levelsRow(p, domain)
    ])));
    /* Stacked, every group sits on one ruler and only the last prints it.
     * Turned into a row on the Product tab, each group needs its own. */
    box.appendChild(levelsAxis(domain, ticks));
    gs.appendChild(box);
  });
  wrap.appendChild(gs);
  wrap.appendChild(el("p", { class: "spread-axisnote", text: note }));
  wrap.appendChild(el("p", { class: "spread-caption derived-note" }, [
    el("b", { text: "Derived · " }), el("span", { text: caption })
  ]));
  return wrap;
}

/* ========================================================================== */
/* PANEL ASSEMBLY                                                             */
/* ========================================================================== */

const SEG_DOMAIN = { min: -28, max: 8 };
const PERF_DOMAIN = { min: -42, max: 12 };

function panelHead(tab) {
  return el("div", { class: "panel-head" }, [
    el("p", { class: "panel-kicker", text: tab.kicker }),
    el("h2", { class: "panel-headline", text: tab.headline }),
    el("span", { class: "panel-info", text: "i" })
  ]);
}

export function render(alt, which) {
  const tab = which === "segment" ? AUTHORED.segTab : AUTHORED.perfTab;

  const panel = el("div", {
    class: "panel", "data-tab": tab.id,
    "data-full": alt === "c" ? "true" : "false",
    style: `--tab-accent:${tab.accent}`
  }, [panelHead(tab)]);

  const bands = el("div", { class: "panel-bands" });

  if (which === "segment") {
    const M = AUTHORED.segMatrix;
    bands.appendChild(el("div", { class: "band", "data-layout": "seg-main" }, [
      portlet(M.label, M.sublabel, M.accent, segMatrixBody({ dispersion: alt === "c" }))
    ]));
    if (alt !== "c") {
      bands.appendChild(el("div", { class: "band", "data-layout": "seg-side" }, [sidePanel(alt)]));
    }
  } else {
    const M = AUTHORED.perfMatrix;
    bands.appendChild(el("div", { class: "band", "data-layout": "perf-main" }, [
      portlet(M.label, M.sublabel, M.accent, perfMatrixBody({ dispersion: alt === "c" }))
    ]));
    if (alt !== "c") {
      bands.appendChild(el("div", { class: "band", "data-layout": "perf-side" }, [stripPanel(alt)]));
    }
  }

  panel.appendChild(bands);
  document.body.appendChild(el("div", { class: "app" }, [
    topbar(tab.id),
    el("main", { class: "stage" }, [panel])
  ]));
}

function sidePanel(alt) {
  if (alt === "a") {
    return portlet(
      "Within-segment movement",
      "What moved each segment's dollars, Q2 FY27",
      "#6B4FBF",
      contribBody(segmentContributions(), {
        domain: SEG_DOMAIN,
        ticks: [-25, -15, -5, 0, 5],
        note: "One dollar axis across all four segments",
        caption: "Last year recovered from the authored Y/Y · PubSec is the only segment whose gains outweigh its losses"
      })
    );
  }
  return portlet(
    "Within-segment levels",
    "Last year to this year, per line, Q2 FY27",
    "#6B4FBF",
    levelsBody(segmentContributions(), {
      domain: 32,
      ticks: [0, 8, 16, 24, 32],
      note: "Hollow is last year, filled is this year · one dollar axis across all four",
      caption: "Last year recovered from the authored Y/Y · Tableau Next starts on the origin in every segment"
    })
  );
}

function stripPanel(alt) {
  if (alt === "a") {
    return portlet(
      "Within-motion movement",
      "What moved each motion's dollars, Q2 FY27",
      "#12806A",
      contribBody(motionContributions(), {
        domain: PERF_DOMAIN,
        ticks: [-40, -30, -20, -10, 0, 10],
        note: "One dollar axis across both motions · losses left of the rule, gains right",
        caption: "Last year recovered from the authored Y/Y · Cloud removes twice what Server does, on rates two points apart"
      })
    );
  }
  return portlet(
    "Within-motion levels",
    "Last year to this year, per product line, Q2 FY27",
    "#12806A",
    levelsBody(motionContributions(), {
      domain: 68,
      ticks: [0, 17, 34, 51, 68],
      note: "One dollar axis across both motions · hollow is last year, filled is this year",
      caption: "Last year recovered from the authored Y/Y · Tableau Next's mark begins at $2.5M and Cloud's at $64.4M"
    })
  );
}
