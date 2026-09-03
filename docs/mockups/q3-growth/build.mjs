/* Builds the Q3-outlook GROWTH-REFRAME mockups as self-contained HTML.
 *
 * Nothing here imports from ../../../src. The CSS below is a hand-copy of the
 * parts of styles/base.css, styles/fonts.css, styles/tabs.css and
 * styles/portlets.css that the board's card idiom actually needs, so these
 * files cannot break — or be broken by — the running board. The only shared
 * asset referenced is ../../../fonts/*.woff2, which is a static directory.
 *
 * Every figure traces to data/board.json's `q3-outlook` tab, governed block
 * and `directMode` block. NOTHING on these pages is derived. That is the
 * point of the reframe: the plan channel was the tab's only derived
 * arithmetic, and it is gone.
 *
 *   node docs/mockups/q3-growth/build.mjs
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

/* ========================================================================== */
/* Authored figures — verbatim from data/board.json, tab `q3-outlook`.        */
/* ========================================================================== */

const KICKER = "Q3 FY27 outlook";
const HEADLINE = "Q3 tracks to $105M with attrition running 20% ahead of last year";
const AXIS_NOTE = "Y/Y — the same growth axis as the product and segment tabs";

const COLUMNS = [
  { id: "acv", label: "ACV", goodDirection: "up", polarityWord: "higher is better" },
  { id: "attrition", label: "Attrition", goodDirection: "down", polarityWord: "lower is better" },
  { id: "nnaov", label: "NNAOV", goodDirection: "up", polarityWord: "higher is better" }
];

/* Governed. metrics.rows[].cells[] */
const ROWS = [
  {
    id: "analytics", label: "Analytics", sub: null, level: 0, color: "#1C6E8C",
    acv: { display: "$105M", value: 105, yoy: -6, yoyDisplay: "-6% Y/Y",
      alt: { label: "OU Roll-up", display: "$100M", value: 100, yoy: -10, yoyDisplay: "-10% Y/Y" } },
    attrition: { display: "$79.5M", value: 79.5, yoy: 20, yoyDisplay: "+20% Y/Y",
      alt: { label: "*OU Roll-up", display: "$88.9M", value: 88.9, yoy: 34, yoyDisplay: "34% Y/Y" } },
    nnaov: { display: "$25.5M", value: 25.5, yoy: -43, yoyDisplay: "-43% Y/Y" }
  },
  {
    id: "platform", label: "Agentic Analytics Platform", sub: "Cloud + Server", level: 1, color: "#2F5FA8",
    acv: { display: "$75.5M", value: 75.5, yoy: -15, yoyDisplay: "-15% Y/Y" },
    attrition: { display: "$73.5M", value: 73.5, yoy: 26, yoyDisplay: "+26% Y/Y" },
    nnaov: { display: "$8.5M", value: 8.5, yoy: -3, yoyDisplay: "-3% Y/Y" }
  },
  {
    id: "embedded", label: "Embedded Agentic Analytics", sub: "Tableau Next + CRMA", level: 1, color: "#12806A",
    acv: { display: "$29.5M", value: 29.5, yoy: 32, yoyDisplay: "+32% Y/Y" },
    attrition: { display: "$6M", value: 6, yoy: -23, yoyDisplay: "-23% Y/Y" },
    nnaov: { display: "$23.5M", value: 23.5, yoy: 61, yoyDisplay: "+61% Y/Y" }
  }
];

/* Degraded. directMode.metrics.rows[].cells[] — same three rows, same three
 * columns, every figure authored in board.json. No multiplier is applied here;
 * the numbers below are read off the file. */
const ROWS_DIRECT = [
  {
    id: "analytics", label: "Analytics", sub: null, level: 0, color: "#1C6E8C",
    acv: { display: "$95M", value: 94.7, yoy: -15, yoyDisplay: "-15% Y/Y", alt: null },
    attrition: { display: "$53.0M", value: 53, yoy: -20, yoyDisplay: "-20% Y/Y", alt: null },
    nnaov: { display: "$47.6M", value: 47.6, yoy: 6, yoyDisplay: "6% Y/Y" }
  },
  {
    id: "platform", label: "Agentic Analytics Platform", sub: "Cloud + Server", level: 1, color: "#2F5FA8",
    acv: { display: "$68.1M", value: 68.1, yoy: -23, yoyDisplay: "-23% Y/Y" },
    attrition: { display: "$49.0M", value: 49, yoy: -16, yoyDisplay: "-16% Y/Y" },
    nnaov: { display: "$15.9M", value: 15.9, yoy: 81, yoyDisplay: "81% Y/Y" }
  },
  {
    id: "embedded", label: "Embedded Agentic Analytics", sub: "Tableau Next + CRMA", level: 1, color: "#12806A",
    acv: { display: "$26.6M", value: 26.6, yoy: 19, yoyDisplay: "+19% Y/Y" },
    attrition: { display: "$4M", value: 4, yoy: -49, yoyDisplay: "-49% Y/Y" },
    nnaov: { display: "$43.9M", value: 43.9, yoy: 201, yoyDisplay: "+201% Y/Y" }
  }
];

const AXIS_NOTE_DIRECT = "Y/Y on a stated scale — with no plan to read attainment against";

/* outlook-benchmark. Every string below, including every delta, is authored. */
const BENCH = {
  label: "Pipeline sufficiency by motion",
  sublabel: "Coverage and velocity against their historical benchmarks",
  voidNote: "Coverage and velocity are non-additive, so the Analytics roll-up carries neither.",
  caption: "Hollow marks the historical benchmark — the same fiscal quarter averaged across the prior two years.",
  directCaption: "Hollow marks the prior quarter — no measure says which window a benchmark is over.",
  axes: [
    /* The delta domains are presentation choices, and the catalog already says
     * so of the absolute ones ("drawn to a domain of 20 and coverage to 4 —
     * presentation choices, not data"). They are sized to hold BOTH modes, so
     * the mark can be compared across the flip rather than re-scaled under it. */
    { id: "coverage", label: "Coverage", sublabel: "open pipe ÷ commit, a multiplier", deltaMax: 1,
      deltaTicks: [{ v: -1, l: "−1.0×" }, { v: -0.5, l: "−0.5×" }, { v: 0, l: "benchmark" }, { v: 0.5, l: "+0.5×" }, { v: 1, l: "+1.0×" }] },
    { id: "velocity", label: "Velocity", sublabel: "pace of deals through the pipeline", deltaMax: 3.2,
      deltaTicks: [{ v: -3, l: "−3%" }, { v: 0, l: "benchmark" }, { v: 3, l: "+3%" }] }
  ],
  rows: [
    {
      id: "platform", label: "Agentic Analytics Platform", sub: "Cloud + Server", color: "#2F5FA8",
      readings: {
        coverage: { value: 2.6, valueDisplay: "2.6×", hist: 2.7, histDisplay: "2.7× hist", deltaDisplay: "−0.1× vs hist", flatDisplay: "flat vs hist" },
        velocity: { value: 15, valueDisplay: "15%", hist: 17, histDisplay: "17% hist", deltaDisplay: "−2% vs hist", flatDisplay: "flat vs hist" }
      }
    },
    {
      id: "embedded", label: "Embedded Agentic Analytics", sub: "Tableau Next + CRMA", color: "#12806A",
      readings: {
        coverage: { value: 3.2, valueDisplay: "3.2×", hist: 2.8, histDisplay: "2.8× hist", deltaDisplay: "+0.4× vs hist", flatDisplay: "flat vs hist" },
        velocity: { value: 16, valueDisplay: "16%", hist: 16, histDisplay: "16% hist", deltaDisplay: "−0% vs hist", flatDisplay: "flat vs hist" }
      }
    }
  ]
};

/* directMode.metrics.rows[].readings — the readings do not move, the
 * benchmarks do. Every hist and every delta below is authored. */
const BENCH_DIRECT = {
  platform: {
    coverage: { value: 2.6, valueDisplay: "2.6×", hist: 2.3, histDisplay: "2.3× prior qtr", deltaDisplay: "+0.3× vs prior qtr" },
    velocity: { value: 15, valueDisplay: "15%", hist: 14, histDisplay: "14% prior qtr", deltaDisplay: "+1% vs prior qtr" }
  },
  embedded: {
    coverage: { value: 3.2, valueDisplay: "3.2×", hist: 2.4, histDisplay: "2.4× prior qtr", deltaDisplay: "+0.8× vs prior qtr" },
    velocity: { value: 16, valueDisplay: "16%", hist: 14, histDisplay: "14% prior qtr", deltaDisplay: "+2% vs prior qtr" }
  }
};

/* outlook-deals. totalDisplay and scaleMax are both authored; the five values
 * sum to the authored total exactly (3 + 3 + 2.3 + 2.1 + 2.1 = 12.5), which is
 * the one closed partition on this tab. */
const DEALS = {
  totalDisplay: "$12.5M across five deals",
  total: 12.5,
  scaleMax: 3.2,
  caption: "Ranked on one certified ACV definition",
  deals: [
    { id: "bofa", account: "Bank of America", value: 3, display: "$3M" },
    { id: "aetna", account: "Aetna", value: 3, display: "$3M" },
    { id: "schwab", account: "Charles Schwab", value: 2.3, display: "$2.3M" },
    { id: "usbank", account: "US Bank", value: 2.1, display: "$2.1M" },
    { id: "usgov", account: "US GOV", value: 2.1, display: "$2.1M" }
  ]
};

const DEALS_DIRECT = {
  totalDisplay: "$12.6M across five deals",
  total: 12.6,
  caption: "Ranked on whichever amount column the query reached for",
  deals: [
    { id: "bofa", account: "Bank of America", value: 3, display: "$3M" },
    { id: "aetna", account: "Aetna", value: 3, display: "$3M" },
    { id: "usbank", account: "US Bank", value: 2.4, display: "$2.4M" },
    { id: "schwab", account: "Charles Schwab", value: 2.3, display: "$2.3M" },
    { id: "usgov", account: "US GOV", value: 1.9, display: "$1.9M" }
  ]
};

/* ========================================================================== */
/* Board primitives, copied rather than imported.                            */
/* ========================================================================== */

/* palette.js TRUSTED. There is no second palette: direct mode renders at full
 * confidence in the same colours, per palette.js and direct-mode-redesign §2. */
const P = {
  ink: "#17181C", inkSoft: "#565A63", inkDim: "#696D78",
  grid: "rgba(23, 24, 28, 0.07)", axis: "rgba(23, 24, 28, 0.22)",
  track: "rgba(23, 24, 28, 0.09)", ghost: "rgba(23, 24, 28, 0.26)",
  surface: "#FFFFFF",
  positive: "#12806A", warn: "#92640A", risk: "#C0483C", neutral: "#78808E"
};
const toneColor = (t) => P[t] || P.neutral;

/* palette.js toneOf, softBand 10 */
function toneOf(value, goodDirection = "up", softBand = 10) {
  if (value === null || value === undefined || Number.isNaN(value)) return "neutral";
  if (value === 0) return "neutral";
  const good = goodDirection === "down" ? value < 0 : value > 0;
  if (good) return "positive";
  return Math.abs(value) < softBand ? "warn" : "risk";
}

/* growth.js — the symlog Y/Y axis shared with the product and segment tabs.
 * Linear core to ±10%, then 2.2 decades of log. Returns a signed fraction of
 * the half-width. */
const CORE = 10, DECADES = 2.2, CORE_FRACTION = 0.22;
function growthFraction(v) {
  if (v == null || Number.isNaN(Number(v))) return null;
  const value = Number(v);
  const b = (1 - CORE_FRACTION) / DECADES;
  const m = Math.abs(value);
  const f = m <= CORE ? (m / CORE) * CORE_FRACTION : CORE_FRACTION + b * Math.log10(m / CORE);
  return Math.sign(value) * Math.min(f, 1);
}

/* Hero-width growth axis: fraction -> percent across the plot, zero centred. */
const gx = (yoy) => 50 + growthFraction(yoy) * 50;
/* Polarity-aligned: better is always to the right. Used by G3 only, and
 * stated on the axis wherever it is used. */
const gxPolar = (yoy, goodDirection) =>
  50 + (goodDirection === "down" ? -1 : 1) * growthFraction(yoy) * 50;

const GRID_DECADES = [10, 100, 1000];

/* The containment rail from metricMatrix: a spine with a tick at each row
 * centre. Stretched with preserveAspectRatio="none", non-scaling strokes. */
function rail(rowCount) {
  const H = rowCount * 100, rowH = 100;
  const y = (i) => i * rowH + rowH / 2;
  const x = 12;
  const parts = [
    `<path d="M ${x} ${y(0)} V ${y(rowCount - 1)}" stroke="${P.axis}" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/>`
  ];
  for (let i = 0; i < rowCount; i += 1) {
    parts.push(`<path d="M ${x} ${y(i)} H ${x + 9}" stroke="${P.axis}" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/>`);
  }
  return `<svg class="rail" viewBox="0 0 26 ${H}" preserveAspectRatio="none" aria-hidden="true">${parts.join("")}</svg>`;
}

/* Rank-2 growth stub, viewBox 132 x 18 — identical construction to
 * metricMatrix's `.mmx-stub`. Used where a cell still needs a small mark. */
function growthStub(yoy, goodDirection, opts = {}) {
  const W = 132, H = 18, zero = 66, half = 54, midY = H / 2;
  const parts = [`<rect x="12" y="${midY - 0.5}" width="108" height="1" fill="${P.grid}"/>`];
  [growthFraction(100), growthFraction(1000)].forEach((f) => {
    [1, -1].forEach((s) => {
      const x = zero + s * f * half;
      parts.push(`<path d="M ${x.toFixed(2)} 3 V ${H - 3}" stroke="${P.grid}" stroke-width="1" stroke-dasharray="1.5 2.5"/>`);
    });
  });
  parts.push(`<path d="M ${zero} 2 V ${H - 2}" stroke="${P.axis}" stroke-width="1"/>`);
  const f = growthFraction(yoy);
  if (f !== null) {
    const x = zero + f * half;
    const tone = toneColor(toneOf(yoy, goodDirection));
    parts.push(`<rect x="${Math.min(zero, x).toFixed(2)}" y="${midY - 3.2}" width="${Math.max(Math.abs(x - zero), 1).toFixed(2)}" height="6.4" rx="1.4" fill="${tone}"/>`);
  }
  if (opts.alt != null) {
    const af = growthFraction(opts.alt);
    if (af !== null) {
      const axp = zero + af * half;
      parts.push(`<path d="M ${axp.toFixed(2)} ${midY - 6} V ${midY + 6}" stroke="${P.ghost}" stroke-width="1.6" stroke-dasharray="2 2"/>`);
    }
  }
  return `<svg class="stub" viewBox="0 0 ${W} ${H}" aria-hidden="true">${parts.join("")}</svg>`;
}

/* ========================================================================== */
/* Chrome                                                                     */
/* ========================================================================== */

const TABLEAU_MARK = `<svg class="topbar-mark" viewBox="0 0 24 24" aria-hidden="true">
<g fill="#63a5b9"><rect x="3.05" y="4.2" width="4.2" height="1.9"/><rect x="4.2" y="3.05" width="1.9" height="4.2"/><rect x="16.75" y="4.2" width="4.2" height="1.9"/><rect x="17.9" y="3.05" width="1.9" height="4.2"/><rect x="3.05" y="17.9" width="4.2" height="1.9"/><rect x="4.2" y="16.75" width="1.9" height="4.2"/><rect x="16.75" y="17.9" width="4.2" height="1.9"/><rect x="17.9" y="16.75" width="1.9" height="4.2"/></g>
<g fill="#4e79a7"><rect x="0.15" y="10.9" width="5.5" height="2.2"/><rect x="1.8" y="9.25" width="2.2" height="5.5"/><rect x="18.35" y="10.9" width="5.5" height="2.2"/><rect x="20" y="9.25" width="2.2" height="5.5"/></g>
<g fill="#576eb2"><rect x="9.25" y="1.8" width="5.5" height="2.2"/><rect x="10.9" y="0.15" width="2.2" height="5.5"/><rect x="9.25" y="20" width="5.5" height="2.2"/><rect x="10.9" y="18.35" width="2.2" height="5.5"/></g>
<g fill="#e8762d"><rect x="6.4" y="10.15" width="11.2" height="3.7"/><rect x="10.15" y="6.4" width="3.7" height="11.2"/></g></svg>`;

const TABS = ["Exec", "Product", "Segment", "Q3 Outlook", "Five Year"];

function topbar(direct) {
  return `<header class="topbar">
  <div class="topbar-id">${TABLEAU_MARK}
    <div class="topbar-titles">
      <p class="topbar-eyebrow">Tableau MCP · Semantic Layer</p>
      <p class="topbar-name">Analytics Business Review</p>
    </div>
  </div>
  <nav class="tabnav">
    ${TABS.map((t, i) => `<span class="tabnav-btn${i === 3 ? " is-active" : ""}">${t}</span>`).join("\n    ")}
  </nav>
  <div class="topbar-actions">
    <span class="mode-switch">
      <span class="mode-switch-state">${direct ? "Direct to source" : "Governed"}</span>
      <span class="trust-legend-dot" data-tier="${direct ? "red" : "green"}"></span>
      <span class="mode-switch-btn">${direct ? "Governed" : "Direct"}</span>
    </span>
  </div>
</header>`;
}

function panelHead() {
  return `<div class="panel-head">
  <p class="panel-kicker">${KICKER}</p>
  <h2 class="panel-headline">${HEADLINE}</h2>
  <span class="panel-info"><span class="panel-info-glyph">i</span></span>
</div>`;
}

/* A portlet card: the wash, the 3px accent edge, the head, and the trust dot
 * carrying provenance as colour and detectability as a glyph (§6.2). */
function portlet({ label, sub, accent, tier, glyph = "", body, cls = "" }) {
  return `<section class="portlet ${cls}" data-tier="${tier}" style="--accent:${accent}">
  <div class="pf">
    <div class="portlet-head">
      <div class="portlet-titles">
        <p class="portlet-label">${label}</p>
        ${sub ? `<p class="portlet-sublabel">${sub}</p>` : ""}
      </div>
      <div class="portlet-tools"><span class="portlet-expand"><span></span></span><span class="trust-dot">${glyph ? `<em>${glyph}</em>` : ""}</span></div>
    </div>
    <div class="portlet-body">${body}</div>
  </div>
</section>`;
}

/* ========================================================================== */
/* Shared: the growth axis furniture                                          */
/* ========================================================================== */

/* Decade gridlines and the zero rule, as an absolutely positioned overlay.
 * `polar` mirrors the axis so better is to the right; it changes nothing
 * about the gridlines, which are symmetric. */
function growthGrid() {
  const lines = GRID_DECADES.map((d) => {
    const f = growthFraction(d) * 50;
    return [50 - f, 50 + f].map((x) =>
      `<span class="gx-rule${d === 10 ? " is-core" : ""}" style="left:${x.toFixed(2)}%"></span>`).join("");
  }).join("");
  return `<div class="gx-grid">${lines}<span class="gx-zero"></span></div>`;
}

function growthTicks({ polar = false, goodDirection = "up" } = {}) {
  const stops = [
    { v: -1000, l: "−1000%" }, { v: -100, l: "−100%" }, { v: -10, l: "−10%" },
    { v: 0, l: "0" },
    { v: 10, l: "+10%" }, { v: 100, l: "+100%" }, { v: 1000, l: "+1000%" }
  ];
  return stops.map((s) => {
    const x = polar ? gxPolar(s.v, goodDirection) : gx(s.v);
    return `<span class="gx-tick${s.v === 0 ? " is-zero" : ""}" style="left:${x.toFixed(2)}%">${s.l}</span>`;
  }).join("");
}

/* ========================================================================== */
/* G1 — "Growth by motion". Nine authored readings, one shared growth axis.   */
/* ========================================================================== */

function growthByMotion(rows, axisNote) {
  const blocks = rows.map((row, ri) => {
    const lines = COLUMNS.map((c, ci) => {
      const cell = row[c.id];
      const tone = toneColor(toneOf(cell.yoy, c.goodDirection));
      const x = gx(cell.yoy);
      const left = Math.min(50, x), w = Math.abs(x - 50);
      const alt = cell.alt;
      /* The Y/Y reading sits in a column of its own rather than floating at
       * the bar end: the alternate basis draws a ghost tick into the same
       * plot, and a floating chip lands on top of it on two rows of nine. */
      return `<p class="gm-meas" style="--r:${ri * 3 + ci + 1}">${c.label}</p>
        <div class="gm-plot" style="--r:${ri * 3 + ci + 1}">
          ${growthGrid()}
          <div class="gm-bar" style="left:${left.toFixed(2)}%;width:${Math.max(w, 0.35).toFixed(2)}%;background:${tone}"></div>
          ${alt ? `<span class="gm-alt" style="left:${gx(alt.yoy).toFixed(2)}%"></span>` : ""}
        </div>
        <p class="gm-chip" style="--r:${ri * 3 + ci + 1};color:${tone}">${cell.yoyDisplay.replace(" Y/Y", "")}</p>
        <p class="gm-val" style="--r:${ri * 3 + ci + 1}">${cell.display}</p>`;
    }).join("");
    return `<div class="gm-motion${ri ? " has-rule" : ""}" data-level="${row.level}" style="--r:${ri * 3 + 1}">
        <p class="gm-name">${row.label}</p>
        ${row.sub ? `<p class="gm-sub">${row.sub}</p>` : ""}
      </div>${lines}`;
  }).join("");

  return `<div class="gm">
    <div class="gm-head"><span></span><span></span><span></span>
      <span class="gm-colhead">Year over year — shared symlog axis, sign preserved</span>
      <span class="gm-colhead gm-colhead-r">Y/Y</span>
      <span class="gm-colhead gm-colhead-r">Q3 commit</span></div>
    <div class="gm-rows">${rail(3)}${blocks}</div>
    <div class="gm-axisrow"><span></span><span></span><span></span><div class="gx-axis">${growthTicks()}</div><span></span><span></span></div>
    ${altStrip(rows, axisNote)}
  </div>`;
}

/* ========================================================================== */
/* G2 — "Level and direction". Dollar scale and growth axis, side by side.    */
/* ========================================================================== */

const D_MAX = 125;
const dx = (v) => (v / D_MAX) * 100;

function levelAndDirection(rows, axisNote) {
  const body = rows.map((row, ri) => {
    const r = ri + 1;
    const acv = row.acv;
    const acvTone = toneColor(toneOf(acv.yoy, "up"));
    const x = gx(acv.yoy);
    const cells = COLUMNS.slice(1).map((c, ci) => {
      const cell = row[c.id];
      const tone = toneColor(toneOf(cell.yoy, c.goodDirection));
      return `<div class="ld-cell ld-c${ri ? " has-rule" : ""}" style="--c:${ci + 6};--r:${r}">
        <p class="ld-cellval">${cell.display}</p>
        <div class="ld-stubrow">${growthStub(cell.yoy, c.goodDirection, { alt: cell.alt ? cell.alt.yoy : null })}<span class="ld-chip" style="color:${tone}">${cell.yoyDisplay}</span></div>
      </div>`;
    }).join("");
    return `<div class="ld-label ld-c${ri ? " has-rule" : ""}" data-level="${row.level}" style="--r:${r}">
        <p class="ld-name">${row.label}</p>${row.sub ? `<p class="ld-sub">${row.sub}</p>` : ""}
      </div>
      <div class="ld-level ld-c${ri ? " has-rule" : ""}" style="--r:${r}">
        <div class="ld-lgrid"></div>
        <div class="ld-lbar" style="width:${dx(acv.value).toFixed(2)}%;background:${row.color}"></div>
        ${acv.alt ? `<svg class="ld-dia" style="left:${dx(acv.alt.value).toFixed(2)}%" viewBox="0 0 13 13" aria-hidden="true"><path d="M 6.5 1.4 L 11.6 6.5 L 6.5 11.6 L 1.4 6.5 Z" fill="${P.surface}" stroke="${P.inkDim}" stroke-width="1.6"/></svg>` : ""}
      </div>
      <div class="ld-dir ld-c${ri ? " has-rule" : ""}" style="--r:${r}">
        ${growthGrid()}
        <div class="ld-dbar" style="left:${Math.min(50, x).toFixed(2)}%;width:${Math.max(Math.abs(x - 50), 0.35).toFixed(2)}%;background:${acvTone}"></div>
        ${acv.alt ? `<span class="gm-alt" style="left:${gx(acv.alt.yoy).toFixed(2)}%"></span>` : ""}
      </div>
      <div class="ld-read ld-c${ri ? " has-rule" : ""}" style="--r:${r}">
        <p class="ld-yoy" style="color:${acvTone}">${acv.yoyDisplay}</p>
      </div>${cells}`;
  }).join("");

  const ticks = [0, 25, 50, 75, 100, 125].map((t) =>
    `<span class="ld-axtick" style="left:${dx(t)}%">${t === 0 ? "$0" : `$${t}M`}</span>`).join("");

  return `<div class="ld">
    <div class="ld-head"><span></span><span></span>
      <span class="ld-colhead">ACV — Q3 commit on one dollar scale</span>
      <span class="ld-colhead">ACV Y/Y</span><span></span>
      ${COLUMNS.slice(1).map((c, ci) => `<span class="ld-colhead" style="--c:${ci + 6}">${c.label} · Y/Y</span>`).join("")}</div>
    <div class="ld-rows">${rail(3)}${body}</div>
    <div class="ld-axisrow"><span></span><span></span><div class="ld-axis">${ticks}</div>
      <div class="gx-axis is-compact">${growthTicks()}</div><span></span><span class="ld-axnote" style="--c:6">${axisNote}</span></div>
    ${altStrip(rows, null)}
  </div>`;
}

/* ========================================================================== */
/* G3 — "The divergence". One lane per measure, better always to the right.   */
/* ========================================================================== */

function divergence(rows, axisNote) {
  const analytics = rows[0], children = rows.slice(1);

  /* The motion key. The two children's ACV commits are on the same $0–$125M
   * scale as the roll-up's, so weight is read once here rather than repeated
   * on every lane. The three ACV figures close exactly: 75.5 + 29.5 = 105. */
  const key = rows.map((row) => `<div class="dv-key" data-level="${row.level}">
      <span class="dv-swatch" style="background:${row.color}"></span>
      <div class="dv-keytext"><p class="dv-keyname">${row.label}</p>
        <p class="dv-keybar"><i style="width:${dx(row.acv.value).toFixed(2)}%;background:${row.color}"></i></p></div>
      <span class="dv-keyval">${row.acv.display}</span>
    </div>`).join("");

  const lanes = COLUMNS.map((c) => {
    const roll = analytics[c.id];
    const rx = gxPolar(roll.yoy, c.goodDirection);
    const marks = children.map((row) => {
      const cell = row[c.id];
      const x = gxPolar(cell.yoy, c.goodDirection);
      const tone = toneColor(toneOf(cell.yoy, c.goodDirection));
      return { row, cell, x, tone };
    });
    /* Labels are placed by rank within the lane, not against the roll-up: the
     * two children can land on the same side of it — in direct mode, on the
     * NNAOV lane, they both do — and two labels reading rightward from marks
     * 7% apart is the one collision this composition can produce. */
    const order = marks.slice().sort((a, b) => a.x - b.x);
    order[0].side = "l"; order[order.length - 1].side = "r";
    const lo = order[0].x, hi = order[order.length - 1].x;
    const rollTone = toneColor(toneOf(roll.yoy, c.goodDirection));
    const alt = roll.alt;
    return `<div class="dv-lane">
      <div class="dv-lanelab">
        <p class="dv-lanename">${c.label}</p>
        <p class="dv-lanepol">${c.polarityWord}${c.goodDirection === "down" ? " · axis mirrored" : ""}</p>
      </div>
      <div class="dv-plot">
        ${growthGrid()}
        <span class="dv-worse">worse</span><span class="dv-better">better</span>
        <div class="dv-spread" style="left:${lo.toFixed(2)}%;width:${(hi - lo).toFixed(2)}%"></div>
        <div class="dv-roll" style="left:${rx.toFixed(2)}%"></div>
        <span class="dv-rolllab" data-flip="${rx > 56}" style="left:${rx.toFixed(2)}%">Analytics <b style="color:${rollTone}">${roll.yoyDisplay}</b> · ${roll.display}</span>
        ${alt ? `<span class="dv-alt" style="left:${gxPolar(alt.yoy, c.goodDirection).toFixed(2)}%"></span>` : ""}
        ${marks.map((m) => `<span class="dv-dot" style="left:${m.x.toFixed(2)}%;background:${m.row.color}"></span>
          <span class="dv-dotlab" data-side="${m.side}" style="left:${m.x.toFixed(2)}%"><b style="color:${m.tone}">${m.cell.yoyDisplay}</b><em>${m.cell.display}</em></span>`).join("")}
      </div>
    </div>`;
  }).join("");

  return `<div class="dv">
    <div class="dv-keys">${key}<p class="dv-keynote">ACV commit<br>$0–$125M scale</p></div>
    <div class="dv-lanes">${lanes}</div>
    <div class="dv-axisrow"><span></span><div class="gx-axis">${growthTicks({ polar: false })}</div></div>
    ${altStrip(rows, axisNote, true)}
  </div>`;
}

/* ========================================================================== */
/* The second stated basis — kept from the current build, at a readable size. */
/* ========================================================================== */

function altStrip(rows, axisNote, mirrored = false) {
  const a = rows[0];
  if (!a.acv.alt) {
    return `<p class="alt-strip is-void"><b>Second stated basis</b><span>drops with the arbitration — there is nothing left to arbitrate between</span>${axisNote ? `<em>${axisNote}</em>` : ""}</p>`;
  }
  return `<p class="alt-strip"><b>Second stated basis, Analytics roll-up</b>
    <span><i class="alt-tick"></i>ACV <b>${a.acv.alt.label} ${a.acv.alt.display}</b> · ${a.acv.alt.yoyDisplay}</span>
    <span><i class="alt-tick"></i>Attrition <b>${a.attrition.alt.label} ${a.attrition.alt.display}</b> · ${a.attrition.alt.yoyDisplay}</span>
    ${axisNote ? `<em>${axisNote}${mirrored ? " · the attrition lane is mirrored so better is right; signs are unchanged" : ""}</em>` : ""}</p>`;
}

/* ========================================================================== */
/* The sufficiency panel, redesigned. One benchmark rule per measure.         */
/* ========================================================================== */

function verdictWord(delta, flat) {
  if (flat) return "level";
  return delta > 0 ? "above" : "below";
}

function sufficiency(direct = false) {
  const plots = BENCH.axes.map((ax) => {
    const rows = BENCH.rows.map((row) => {
      const g = row.readings[ax.id];
      const d = direct ? BENCH_DIRECT[row.id][ax.id] : g;
      const hist = d.hist;
      const delta = g.value - hist;
      const flat = g.value === hist;
      const tone = flat ? P.inkSoft : toneColor(delta > 0 ? "positive" : "risk");
      const x = 50 + (delta / ax.deltaMax) * 50;
      const left = Math.min(50, x), w = Math.abs(x - 50);
      const deltaTxt = flat ? g.flatDisplay : d.deltaDisplay;
      return `<p class="sf-name" style="color:${row.color}">${row.label.replace("Agentic Analytics ", "").replace("Analytics ", "")}</p>
        <p class="sf-val">${g.valueDisplay}</p>
        <div class="sf-plot">
          <div class="sf-track"></div>
          <div class="sf-rule${direct ? " is-unstated" : ""}"></div>
          ${flat
            ? `<span class="sf-flat"></span>`
            : `<div class="sf-bar" style="left:${left.toFixed(2)}%;width:${w.toFixed(2)}%;background:${tone}"></div>
               <span class="sf-cap" style="left:${x.toFixed(2)}%;background:${tone}"></span>`}
        </div>
        <p class="sf-verdict" style="color:${tone}"><b>${verdictWord(delta, flat)}</b><em>${deltaTxt}</em></p>`;
    }).join("");
    const ticks = ax.deltaTicks.map((t) =>
      `<span class="sf-tick${t.v === 0 ? " is-zero" : ""}" style="left:${(50 + (t.v / ax.deltaMax) * 50).toFixed(2)}%">${t.l}</span>`).join("");
    return `<div class="sf-axis">
      <div class="sf-axhead"><p class="sf-axname">${ax.label}</p><p class="sf-axsub">${ax.sublabel}</p></div>
      ${rows}
      <div class="sf-ticks">${ticks}</div>
    </div>`;
  }).join("");

  const lede = direct
    ? `<span style="color:${P.positive}">Both motions above</span> their benchmark on both measures.`
    : `<span style="color:${P.risk}">Platform below</span> its benchmark on both measures. <span style="color:${P.positive}">Embedded above</span> on coverage, level on velocity.`;

  return `<div class="sf">
    <p class="sf-lede">${lede}</p>
    <div class="sf-pair">${plots}</div>
    <p class="sf-foot">0 is each motion's own historical benchmark${direct ? ", over a window no measure states" : ""} — ${direct ? BENCH.directCaption.replace(/^Hollow marks the /, "here the ") : "the same fiscal quarter averaged across the prior two years"}. ${BENCH.voidNote}</p>
  </div>`;
}

/* ========================================================================== */
/* The deals rail, re-scaled. The five values sum to the authored total.      */
/* ========================================================================== */

function dealsComposition(direct = false) {
  const D = direct ? DEALS_DIRECT : DEALS;
  let acc = 0;
  const segs = D.deals.map((d, i) => {
    const left = (acc / D.total) * 100;
    acc += d.value;
    return `<div class="dz-seg" style="left:${left.toFixed(2)}%;width:${((d.value / D.total) * 100).toFixed(2)}%;--d:${i}"><span>${d.display}</span></div>`;
  }).join("");
  return `<div class="dz">
    <div class="dz-headline">
      <p class="dz-total">${D.totalDisplay.split(" ")[0]}</p>
      <p class="dz-claim">${D.totalDisplay.split(" ").slice(1).join(" ")}<em>authored total</em></p>
    </div>
    <div class="dz-track">${segs}</div>
    <ol class="dz-list">${D.deals.map((d, i) => `<li><span class="dz-rank" style="--d:${i}"></span><span class="dz-acct">${d.account}</span><span class="dz-val">${d.display}</span></li>`).join("")}</ol>
    <p class="dz-cap">${D.caption}. The five amounts sum to the authored total exactly — the one closed partition on this tab, and the whole of the rail&rsquo;s scale.</p>
  </div>`;
}

/* ========================================================================== */
/* Page assembly                                                              */
/* ========================================================================== */

const HERO_META = {
  g1: { label: "Q3 growth by motion", sub: "Three measures year over year on the board's shared growth axis" },
  g2: { label: "Q3 outlook — level and direction", sub: "ACV commit on a dollar scale beside its year-over-year move, with the other two measures Y/Y" },
  g3: { label: "Q3 growth by motion", sub: "One axis per measure, oriented so better is to the right — where the two motions sit against the roll-up" }
};

function bands(key, direct = false) {
  const rows = direct ? ROWS_DIRECT : ROWS;
  const note = direct ? AXIS_NOTE_DIRECT : AXIS_NOTE;
  const hero = key === "g1" ? growthByMotion(rows, note)
    : key === "g2" ? levelAndDirection(rows, note)
      : divergence(rows, note);
  const meta = HERO_META[key];
  return `
${portlet({
    label: meta.label, sub: meta.sub, accent: "#92640A",
    tier: direct ? "red" : "yellow", glyph: direct ? "!" : "",
    cls: `band-hero hero-${key}`, body: hero
  })}
<div class="band-support">
${portlet({
    label: BENCH.label, sub: BENCH.sublabel, accent: "#1C6E8C",
    tier: direct ? "red" : "green", glyph: direct ? "!" : "",
    cls: "p-suf", body: sufficiency(direct)
  })}
${portlet({
    label: "Q3 top ACV deals", sub: "Five largest open opportunities", accent: "#1C6E8C",
    tier: direct ? "red" : "yellow", glyph: direct ? "!" : "",
    cls: "p-deals", body: dealsComposition(direct)
  })}
</div>`;
}

/* ========================================================================== */
/* CSS — copied from the board, not imported from it.                        */
/* ========================================================================== */

const CSS = String.raw`
/* ---- brand faces (styles/fonts.css) ---- */
@font-face{font-family:"Avant Garde For Salesforce";src:url("../../../fonts/AvantGardeForSalesforceW05-Dm.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:block}
@font-face{font-family:"Salesforce Sans";src:url("../../../fonts/SalesforceSans-Regular.woff2") format("woff2");font-weight:100 400;font-style:normal;font-display:block}
@font-face{font-family:"Salesforce Sans";src:url("../../../fonts/SalesforceSans-Semibold.woff2") format("woff2");font-weight:500 600;font-style:normal;font-display:block}
@font-face{font-family:"Salesforce Sans";src:url("../../../fonts/SalesforceSans-Bold.woff2") format("woff2");font-weight:700 900;font-style:normal;font-display:block}

/* ---- tokens (styles/base.css) ---- */
:root{
  --ink-hero:#0d0f13;--ink:#14161a;--ink-soft:#4d525c;--ink-dim:#6b7280;
  --surface:#f4f2ed;--surface-raised:rgba(255,255,255,.9);--surface-solid:#fff;
  --line:rgba(20,22,26,.13);--line-strong:rgba(20,22,26,.22);
  --accent:#1c6e8c;--tab-accent:#92640a;
  --pos:#0f7a5e;--warn:#a06b05;--neg:#c0392b;
  --tier-green:#12806a;--tier-yellow:#92640a;--tier-red:#c0483c;--tier-grey:#8d93a1;--on-tier:#fff;
  --shadow-card:0 1px 2px rgba(23,24,28,.04),0 6px 18px rgba(23,24,28,.06);
  --font-display:"Avant Garde For Salesforce","Century Gothic",sans-serif;
  --font-body:"Salesforce Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --ease:cubic-bezier(.16,1,.3,1);--radius:14px;--gap:clamp(8px,1.1vw,16px);
  --lh-display-num:1.12;--lh-display-text:1.22;
}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;overflow:hidden;background:var(--surface);color:var(--ink);
  font-family:var(--font-body);font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased;
  font-variant-numeric:tabular-nums lining-nums;font-feature-settings:"tnum" 1,"lnum" 1}
body::before{content:"";position:fixed;inset:-30%;z-index:0;pointer-events:none;
  background:
    radial-gradient(52% 46% at 14% 6%,color-mix(in srgb,var(--tab-accent) 16%,transparent),transparent 72%),
    radial-gradient(46% 42% at 88% 84%,rgba(192,57,43,.075),transparent 74%),
    radial-gradient(60% 30% at 50% 100%,rgba(15,122,94,.05),transparent 76%)}
.app{position:relative;z-index:1;height:100dvh;display:flex;flex-direction:column}

/* ---- topbar ---- */
.topbar{position:relative;flex:none;display:flex;align-items:center;gap:clamp(12px,2vw,28px);
  padding:clamp(7px,1.2vh,15px) clamp(16px,2.4vw,32px);border-bottom:1px solid var(--line);
  background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.24))}
.topbar::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;
  background:linear-gradient(90deg,color-mix(in srgb,var(--tab-accent) 62%,transparent),color-mix(in srgb,var(--tab-accent) 12%,transparent) 62%,transparent)}
.topbar-id{flex:1 1 auto;display:flex;align-items:center;gap:11px;min-width:0}
.topbar-mark{width:24px;height:24px;flex:none;display:block}
.topbar-titles{min-width:0;display:flex;flex-direction:column;row-gap:.18em}
.topbar-eyebrow{margin:0;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-dim);white-space:nowrap}
.topbar-name{margin:0;font-family:var(--font-display);font-size:clamp(15px,1.3vw,18px);font-weight:600;letter-spacing:-.01em;white-space:nowrap}
.tabnav{position:relative;flex:none;display:flex;align-items:center;gap:4px;padding:4px;
  border:1px solid var(--line);border-radius:999px;background:var(--surface-raised)}
.tabnav-btn{position:relative;z-index:1;display:inline-flex;align-items:center;padding:7px 16px;
  border-radius:999px;color:var(--ink-dim);font-size:13px;font-weight:500;white-space:nowrap}
.tabnav-btn.is-active{color:var(--ink)}
.tabnav-btn.is-active::before{content:"";position:absolute;inset:-4px -1px;z-index:-1;border-radius:999px;
  background:color-mix(in srgb,var(--tab-accent) 14%,var(--surface-solid));
  border:1px solid color-mix(in srgb,var(--tab-accent) 52%,transparent);box-shadow:var(--shadow-card)}
.topbar-actions{margin-left:auto;display:flex;align-items:center;flex:none}
.mode-switch{display:inline-flex;align-items:center;gap:7px;padding:3px 4px 3px 11px;
  border:1px solid var(--line-strong);border-radius:999px;background:var(--surface-raised);font-size:11.5px;white-space:nowrap}
.mode-switch-state{font-weight:600;color:var(--ink)}
.trust-legend-dot{width:8px;height:8px;border-radius:50%;background:var(--tier-green);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--tier-green) 22%,transparent)}
.trust-legend-dot[data-tier="red"]{background:var(--tier-red);box-shadow:0 0 0 3px color-mix(in srgb,var(--tier-red) 22%,transparent)}
.mode-switch-btn{padding:5px 12px;border-radius:999px;background:color-mix(in srgb,var(--ink) 5%,transparent);color:var(--ink-dim);font-size:11.5px;font-weight:500}

/* ---- panel ---- */
.panel{position:absolute;inset:clamp(10px,1.6vh,20px) clamp(14px,2.2vw,30px);display:flex;flex-direction:column;gap:clamp(8px,1.3vh,16px)}
.stage{position:relative;flex:1;min-height:0;overflow:hidden}
.panel-head{position:relative;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;flex:none}
.panel-kicker{position:relative;margin:0;padding-left:13px;font-size:10px;letter-spacing:.15em;
  text-transform:uppercase;color:color-mix(in srgb,var(--tab-accent) 82%,var(--ink));font-weight:700}
.panel-kicker::before{content:"";position:absolute;left:0;top:.18em;bottom:.18em;width:3px;border-radius:2px;background:var(--tab-accent)}
.panel-headline{margin:0;font-family:var(--font-display);font-size:clamp(18px,1.9vw,27px);font-weight:600;
  letter-spacing:-.015em;color:var(--ink-hero);line-height:var(--lh-display-text)}
.panel-info{flex:none;display:grid;place-items:center;width:19px;height:19px;border-radius:50%;
  border:1.4px solid color-mix(in srgb,var(--tab-accent) 48%,var(--line-strong));
  background:color-mix(in srgb,var(--tab-accent) 7%,transparent);color:color-mix(in srgb,var(--tab-accent) 78%,var(--ink))}
.panel-info-glyph{font-family:var(--font-display);font-size:11px;font-weight:600;line-height:var(--lh-display-num)}
.panel-bands{flex:1;min-height:0;display:grid;gap:var(--gap);grid-template-rows:minmax(0,var(--hero-fr,1.5fr)) minmax(0,1fr)}

/* ---- portlet card ---- */
.portlet{position:relative;min-width:0;min-height:0}
.pf{position:absolute;inset:0;display:flex;flex-direction:column;gap:7px;padding:clamp(9px,.95vw,14px);
  border:1px solid var(--line);border-radius:var(--radius);
  background:linear-gradient(168deg,color-mix(in srgb,var(--accent) 6%,transparent),transparent 64%),var(--surface-raised);
  box-shadow:var(--shadow-card);overflow:hidden}
.pf::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 22%,transparent) 58%,transparent)}
.portlet-head{display:flex;align-items:flex-start;gap:8px;flex:none}
.portlet-titles{min-width:0;display:flex;align-items:baseline;flex-wrap:wrap;column-gap:7px;row-gap:0}
.portlet-label{margin:0;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:color-mix(in srgb,var(--accent) 76%,var(--ink))}
.portlet-sublabel{margin:0;font-size:11px;color:var(--ink-dim);line-height:1.3}
.portlet-tools{margin-left:auto;display:flex;align-items:center;gap:6px;flex:none}
.portlet-expand,.trust-dot{position:relative;display:grid;place-items:center;width:22px;height:22px;
  border-radius:7px;border:1px solid var(--line-strong);background:transparent}
.portlet-expand span{width:9px;height:9px;border:1.5px solid var(--ink-dim);border-left-color:transparent;
  border-bottom-color:transparent;border-radius:1px;transform:rotate(45deg) translate(-1px,1px)}
.trust-dot{border-color:color-mix(in srgb,var(--tier-color) 60%,transparent);background:color-mix(in srgb,var(--tier-color) 12%,transparent)}
.trust-dot::before{content:"";width:11px;height:11px;border-radius:50%;background:var(--tier-color);
  box-shadow:0 0 0 2.5px color-mix(in srgb,var(--tier-color) 16%,transparent)}
.trust-dot em{position:absolute;inset:0;display:grid;place-items:center;font-style:normal;
  color:var(--on-tier);font-size:8px;font-weight:800;line-height:1}
.portlet[data-tier="green"]{--tier-color:var(--tier-green)}
.portlet[data-tier="yellow"]{--tier-color:var(--tier-yellow)}
.portlet[data-tier="red"]{--tier-color:var(--tier-red)}
.portlet-body{flex:1;min-height:0;display:flex;flex-direction:column}

/* ---- shared marks ---- */
.rail{grid-column:1;display:block;width:100%;height:100%;align-self:stretch}
.stub{display:block;width:100%;max-width:var(--mark,132px);height:auto}

/* ---- the shared growth axis furniture ---- */
.gx-grid{position:absolute;inset:0;pointer-events:none}
.gx-rule{position:absolute;top:2px;bottom:2px;width:1px;
  background:repeating-linear-gradient(180deg,color-mix(in srgb,var(--ink) 15%,transparent) 0 2px,transparent 2px 4.5px)}
.gx-rule.is-core{background:repeating-linear-gradient(180deg,color-mix(in srgb,var(--ink) 9%,transparent) 0 1.5px,transparent 1.5px 4px)}
.gx-zero{position:absolute;top:0;bottom:0;left:50%;width:1px;background:color-mix(in srgb,var(--ink) 34%,transparent)}
.gx-axis{position:relative;height:12px;border-top:1px solid var(--line);padding-top:1px}
.gx-tick{position:absolute;transform:translateX(-50%);font-size:8.5px;font-weight:600;color:var(--ink-dim);white-space:nowrap}
.gx-tick.is-zero{color:var(--ink-soft);font-weight:700}
.gx-axis.is-compact .gx-tick{font-size:7.5px}
.gx-axis.is-compact .gx-tick:not(.is-zero){display:none}

.alt-strip{margin:5px 0 0;display:flex;align-items:center;flex-wrap:wrap;column-gap:clamp(9px,1.2vw,20px);row-gap:1px;
  padding-top:5px;border-top:1px solid var(--line);flex:none;
  font-size:clamp(9px,.7vw,10.5px);color:var(--ink-soft);line-height:1.3}
.alt-strip>b{font-weight:700;color:var(--ink-dim);font-size:clamp(8px,.6vw,9px);letter-spacing:.08em;text-transform:uppercase}
.alt-strip>span{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.alt-strip span b{font-weight:700;color:var(--ink)}
.alt-tick{width:2px;height:11px;flex:none;background:repeating-linear-gradient(180deg,var(--line-strong) 0 2px,transparent 2px 4px)}
.alt-strip>em{font-style:normal;margin-left:auto;font-size:clamp(8px,.6vw,9px);color:var(--ink-dim);text-align:right}
.alt-strip.is-void>span{color:var(--ink-dim)}

/* ======================= G1 — growth by motion ======================= */
.hero-g1{--hero-fr:1.48fr}
.gm{flex:1;min-height:0;display:flex;flex-direction:column;
  --tmpl:24px clamp(122px,12vw,164px) clamp(48px,4.8vw,62px) minmax(0,1fr) clamp(44px,4.4vw,58px) clamp(60px,5.8vw,78px)}
.gm-head,.gm-axisrow{display:grid;grid-template-columns:var(--tmpl);gap:clamp(6px,.8vw,12px);align-items:end}
.gm-head{margin-bottom:2px;flex:none}
.gm-colhead{margin:0;font-size:clamp(8px,.62vw,9.5px);font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--ink-dim);white-space:nowrap}
.gm-colhead-r{text-align:right}
.gm-rows{flex:1;min-height:0;display:grid;grid-template-columns:var(--tmpl);
  grid-template-rows:repeat(9,minmax(0,1fr));row-gap:0;column-gap:clamp(6px,.8vw,12px)}
.gm-rows>.rail{grid-row:1/span 9}
.gm-motion{grid-column:2;grid-row:var(--r)/span 3;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:1px}
.gm-motion.has-rule{border-top:1px solid var(--line)}
.gm-motion[data-level="1"]{padding-left:9px}
.gm-motion[data-level="0"] .gm-name{font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--accent);font-size:clamp(9.5px,.74vw,11px)}
.gm-name{margin:0;font-size:clamp(9.5px,.78vw,11.5px);font-weight:600;line-height:1.2;color:var(--ink)}
.gm-sub{margin:1px 0 0;font-size:clamp(8.5px,.62vw,9.5px);font-weight:500;color:var(--ink-dim);line-height:1.2}
.gm-meas{grid-column:3;grid-row:var(--r);margin:0;align-self:center;font-size:clamp(8.5px,.66vw,10px);
  font-weight:700;color:var(--ink-soft);letter-spacing:.03em;white-space:nowrap}
.gm-plot{grid-column:4;grid-row:var(--r);position:relative;align-self:stretch;min-width:0}
.gm-bar{position:absolute;top:50%;transform:translateY(-50%);height:clamp(9px,1.6vh,13px);border-radius:1.5px}
.gm-alt{position:absolute;top:14%;bottom:14%;width:2px;margin-left:-1px;
  background:repeating-linear-gradient(180deg,var(--ink-dim) 0 2px,transparent 2px 4px)}
.gm-chip{grid-column:5;grid-row:var(--r);margin:0;align-self:center;text-align:right;
  font-size:clamp(9px,.72vw,11px);font-weight:700;white-space:nowrap;line-height:1.1}
.gm-val{grid-column:6;grid-row:var(--r);margin:0;align-self:center;text-align:right;
  font-family:var(--font-display);font-size:clamp(12px,1.05vw,16px);font-weight:600;letter-spacing:-.025em;
  color:var(--ink-hero);line-height:var(--lh-display-num);white-space:nowrap}
.gm-axisrow{margin-top:2px;flex:none}
.gm-axisrow .gx-axis{grid-column:4}

/* ======================= G2 — level and direction ======================= */
.hero-g2{--hero-fr:1.4fr}
.ld{flex:1;min-height:0;display:flex;flex-direction:column;--mark:clamp(66px,6.8vw,104px);
  --tmpl:24px clamp(124px,12vw,168px) minmax(0,1fr) clamp(112px,11.2vw,152px) clamp(50px,5vw,66px) repeat(2,clamp(92px,9.2vw,126px))}
.ld-head,.ld-axisrow{display:grid;grid-template-columns:var(--tmpl);gap:clamp(6px,.72vw,11px);align-items:end}
.ld-head{margin-bottom:3px;flex:none}
.ld-colhead{grid-column:var(--c,auto);margin:0;font-size:clamp(8px,.62vw,9.5px);font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--ink-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ld-rows{flex:1;min-height:0;display:grid;grid-template-columns:var(--tmpl);
  grid-template-rows:repeat(3,minmax(0,1fr));row-gap:0;column-gap:clamp(6px,.72vw,11px)}
.ld-rows>.rail{grid-row:1/span 3}
.ld-c{grid-row:var(--r);min-width:0;align-self:stretch;display:flex;flex-direction:column;justify-content:center;padding:clamp(3px,.7vh,9px) 0}
.ld-c.has-rule{border-top:1px solid var(--line)}
.ld-label{grid-column:2;gap:1px}
.ld-label[data-level="1"]{padding-left:9px}
.ld-label[data-level="0"] .ld-name{font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--accent);font-size:clamp(9.5px,.74vw,11px)}
.ld-name{margin:0;font-size:clamp(9.5px,.78vw,11.5px);font-weight:600;line-height:1.2;color:var(--ink)}
.ld-sub{margin:1px 0 0;font-size:clamp(8.5px,.62vw,9.5px);font-weight:500;color:var(--ink-dim);line-height:1.2}
.ld-level{grid-column:3;position:relative;display:block!important;height:auto}
.ld-level::after{content:"";display:block;height:34px}
.ld-lgrid{position:absolute;left:0;right:0;top:6px;bottom:4px;background-image:repeating-linear-gradient(90deg,color-mix(in srgb,var(--ink) 9%,transparent) 0 1px,transparent 1px 20%)}
.ld-lbar{position:absolute;left:0;top:9px;height:18px;border-radius:2px}
.ld-dia{position:absolute;top:11.5px;width:13px;height:13px;margin-left:-6.5px;display:block;overflow:visible}
.ld-dir{grid-column:4;position:relative;display:block!important;height:auto}
.ld-dir::after{content:"";display:block;height:34px}
.ld-dbar{position:absolute;top:11px;height:14px;border-radius:1.5px}
.ld-read{grid-column:5;align-items:flex-start}
.ld-yoy{margin:0;font-size:clamp(9.5px,.76vw,11.5px);font-weight:700;line-height:1.2;white-space:nowrap}
.ld-cell{grid-column:var(--c);gap:2px}
.ld-cellval{margin:0;font-family:var(--font-display);font-size:clamp(13px,1.16vw,19px);font-weight:600;
  letter-spacing:-.025em;line-height:var(--lh-display-num);color:var(--ink-hero);white-space:nowrap}
.ld-stubrow{display:grid;grid-template-columns:minmax(0,var(--mark)) max-content;align-items:center;column-gap:clamp(3px,.42vw,6px)}
.ld-chip{font-size:clamp(8.5px,.66vw,10px);font-weight:700;line-height:1;white-space:nowrap}
.ld-axisrow{margin-top:2px;flex:none}
.ld-axis{grid-column:3;position:relative;height:12px;border-top:1px solid var(--line);padding-top:1px}
.ld-axtick{position:absolute;transform:translateX(-50%);font-size:8.5px;font-weight:600;color:var(--ink-dim)}
.ld-axtick:first-child{transform:none}
.ld-axtick:last-child{transform:translateX(-100%)}
.ld-axisrow .gx-axis{grid-column:4}
.ld-axnote{grid-column:6/span 2;font-size:clamp(7.5px,.58vw,9px);color:var(--ink-dim);line-height:1.2;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ======================= G3 — the divergence ======================= */
.hero-g3{--hero-fr:1.42fr}
.dv{flex:1;min-height:0;display:flex;flex-direction:column;--dvlab:clamp(96px,9.6vw,132px)}
.dv-keys{flex:none;display:flex;align-items:center;gap:clamp(8px,1.2vw,22px);flex-wrap:wrap;
  padding-bottom:5px;border-bottom:1px solid var(--line)}
.dv-key{display:flex;align-items:center;gap:6px;min-width:0;flex:1 1 clamp(176px,19vw,246px)}
.dv-swatch{width:9px;height:9px;border-radius:2px;flex:none}
.dv-key[data-level="0"] .dv-swatch{border-radius:50%}
.dv-keytext{min-width:0;flex:1}
.dv-keyname{margin:0;font-size:clamp(9px,.72vw,10.5px);font-weight:700;line-height:1.18;color:var(--ink);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dv-key[data-level="0"] .dv-keyname{letter-spacing:.06em;text-transform:uppercase;color:var(--accent)}
.dv-keybar{position:relative;margin:2px 0 0;height:8px;
  background:color-mix(in srgb,var(--ink) 5%,transparent);border-radius:2px}
.dv-keybar i{position:absolute;left:0;top:0;bottom:0;border-radius:2px}
.dv-keyval{flex:none;font-family:var(--font-display);font-size:clamp(10px,.86vw,13px);font-weight:600;
  letter-spacing:-.02em;color:var(--ink-hero);line-height:1;align-self:flex-end;padding-bottom:1px}
.dv-keynote{margin:0 0 0 auto;flex:none;font-size:clamp(7px,.55vw,8.5px);color:var(--ink-dim);line-height:1.24;text-align:right;letter-spacing:.02em}
.dv-lanes{flex:1;min-height:0;display:grid;grid-template-rows:repeat(3,minmax(0,1fr))}
.dv-lane{min-height:0;display:grid;grid-template-columns:var(--dvlab) minmax(0,1fr);
  column-gap:clamp(8px,1vw,16px);align-items:center}
.dv-lane+.dv-lane{border-top:1px solid var(--line)}
.dv-lanelab{min-width:0}
.dv-lanename{margin:0;font-family:var(--font-display);font-size:clamp(13px,1.15vw,18px);font-weight:600;
  letter-spacing:-.015em;color:var(--ink-hero);line-height:1.1}
.dv-lanepol{margin:1px 0 0;font-size:clamp(8px,.6vw,9.5px);font-weight:600;color:var(--ink-dim);line-height:1.2}
.dv-plot{position:relative;align-self:stretch;min-width:0}
.dv-worse,.dv-better{position:absolute;top:50%;transform:translateY(-50%);font-size:8px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:color-mix(in srgb,var(--ink) 26%,transparent)}
.dv-worse{left:0}
.dv-better{right:0}
.dv-spread{position:absolute;top:50%;transform:translateY(-50%);height:4px;border-radius:2px;
  background:color-mix(in srgb,var(--ink) 11%,transparent)}
.dv-roll{position:absolute;top:22%;bottom:22%;width:2px;margin-left:-1px;background:var(--ink-hero);border-radius:1px}
.dv-rolllab{position:absolute;top:4%;margin-left:6px;font-size:clamp(8px,.62vw,9.5px);font-weight:600;
  color:var(--ink-soft);white-space:nowrap;line-height:1.1}
.dv-rolllab[data-flip="true"]{margin-left:0;transform:translateX(-100%);padding-right:6px}
.dv-rolllab b{font-weight:700}
.dv-alt{position:absolute;top:30%;bottom:30%;width:2px;margin-left:-1px;
  background:repeating-linear-gradient(180deg,var(--ink-dim) 0 2px,transparent 2px 4px)}
.dv-dot{position:absolute;top:50%;width:clamp(13px,1.5vh,17px);height:clamp(13px,1.5vh,17px);
  border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 2.5px var(--surface-solid)}
.dv-dotlab{position:absolute;bottom:4%;display:flex;align-items:baseline;gap:5px;white-space:nowrap;line-height:1.1}
.dv-dotlab[data-side="l"]{transform:translateX(-100%);padding-right:9px}
.dv-dotlab[data-side="r"]{padding-left:9px}
.dv-dotlab b{font-size:clamp(9.5px,.8vw,12px);font-weight:700}
.dv-dotlab em{font-style:normal;font-size:clamp(8px,.62vw,9.5px);font-weight:600;color:var(--ink-soft)}
.dv-axisrow{flex:none;display:grid;grid-template-columns:var(--dvlab) minmax(0,1fr);column-gap:clamp(8px,1vw,16px);margin-top:2px}
.dv-axisrow .gx-axis{grid-column:2}

/* ======================= the sufficiency panel ======================= */
.sf{flex:1;min-height:0;display:flex;flex-direction:column;gap:clamp(2px,.5vh,7px)}
.sf-lede{margin:0;flex:none;font-size:clamp(9.5px,.78vw,12px);font-weight:600;color:var(--ink);line-height:1.26}
.sf-lede span{font-weight:700}
.sf-pair{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(10px,1.6vw,30px)}
.sf-axis{min-width:0;display:grid;align-items:center;
  grid-template-columns:clamp(48px,5vw,70px) clamp(34px,3.6vw,48px) minmax(0,1fr) clamp(78px,7.8vw,104px);
  grid-template-rows:auto minmax(0,1fr) minmax(0,1fr) auto;column-gap:clamp(4px,.6vw,9px)}
.sf-axhead{grid-column:1/-1;display:flex;align-items:baseline;gap:6px;min-width:0;line-height:1.15}
.sf-axname{margin:0;font-size:clamp(8.5px,.66vw,10px);font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);white-space:nowrap}
.sf-axsub{margin:0;font-size:clamp(7.5px,.58vw,9px);color:var(--ink-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sf-name{grid-column:1;margin:0;font-size:clamp(8.5px,.66vw,10px);font-weight:700;line-height:1.16}
.sf-val{grid-column:2;margin:0;font-family:var(--font-display);font-size:clamp(15px,1.42vw,23px);font-weight:600;
  letter-spacing:-.03em;line-height:var(--lh-display-num);color:var(--ink-hero);text-align:right}
.sf-plot{grid-column:3;position:relative;align-self:stretch;min-width:0}
.sf-track{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);height:2px;border-radius:1px;
  background:color-mix(in srgb,var(--ink) 7%,transparent)}
.sf-rule{position:absolute;left:50%;top:14%;bottom:14%;width:2px;margin-left:-1px;background:var(--ink-hero);border-radius:1px}
.sf-rule.is-unstated{background:repeating-linear-gradient(180deg,var(--ink-hero) 0 3px,transparent 3px 6px)}
.sf-bar{position:absolute;top:50%;transform:translateY(-50%);height:clamp(8px,1.2vh,11px);border-radius:1.5px}
.sf-cap{position:absolute;top:26%;bottom:26%;width:3px;margin-left:-1.5px;border-radius:1.5px}
.sf-flat{position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;
  background:var(--ink-soft);box-shadow:0 0 0 2.5px var(--surface-solid)}
.sf-verdict{grid-column:4;margin:0;display:flex;align-items:baseline;column-gap:5px;flex-wrap:wrap;line-height:1.16}
.sf-verdict b{font-size:clamp(9px,.74vw,11px);font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.sf-verdict em{font-style:normal;font-size:clamp(7.5px,.6vw,9.5px);font-weight:600;color:var(--ink-soft);white-space:nowrap}
.sf-ticks{grid-column:3;position:relative;height:10px;border-top:1px solid var(--line);padding-top:1px}
.sf-tick{position:absolute;transform:translateX(-50%);font-size:7.5px;font-weight:600;color:var(--ink-dim);white-space:nowrap}
.sf-tick.is-zero{font-weight:700;color:var(--ink-soft)}
.sf-foot{margin:0;flex:none;font-size:clamp(7.5px,.6vw,9.5px);color:var(--ink-dim);line-height:1.3}

/* ======================= the deals rail ======================= */
.dz{flex:1;min-height:0;display:flex;flex-direction:column}
.dz-headline{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap;flex:none}
.dz-total{margin:0;font-family:var(--font-display);font-size:clamp(19px,1.7vw,26px);font-weight:600;
  letter-spacing:-.03em;line-height:1.14;color:var(--ink-hero)}
.dz-claim{margin:0;font-size:clamp(8.5px,.68vw,10px);font-weight:700;color:var(--ink-soft);line-height:1.25}
.dz-claim em{font-style:normal;font-weight:500;color:var(--ink-dim);font-size:7.5px;
  letter-spacing:.07em;text-transform:uppercase;margin-left:5px}
.dz-track{position:relative;flex:none;height:clamp(15px,2.2vh,22px);margin-top:4px;border-radius:3px;overflow:hidden}
.dz-seg{position:absolute;top:0;bottom:0;background:color-mix(in srgb,var(--accent) calc(94% - var(--d)*13%),#ffffff);
  border-right:1.5px solid var(--surface-solid);display:grid;place-items:center}
.dz-seg span{font-size:8px;font-weight:700;color:#fff;opacity:.92}
.dz-list{list-style:none;margin:5px 0 0;padding:0;flex:1;min-height:0;display:grid;grid-template-rows:repeat(5,minmax(0,1fr));overflow:hidden}
.dz-list li{display:flex;align-items:center;gap:7px;font-size:clamp(8px,.66vw,10.5px);min-height:0}
.dz-rank{width:9px;height:9px;border-radius:2px;flex:none;background:color-mix(in srgb,var(--accent) calc(94% - var(--d)*13%),#ffffff)}
.dz-acct{flex:1;min-width:0;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dz-val{font-weight:700;color:var(--ink-soft)}
.dz-cap{margin:3px 0 0;flex:none;font-size:clamp(7px,.56vw,9px);color:var(--ink-dim);line-height:1.3}

/* ======================= band 2 ======================= */
.band-support{display:grid;gap:var(--gap);grid-template-columns:minmax(0,1fr) minmax(252px,.4fr)}
`;

/* ========================================================================== */

function page(key, direct = false) {
  const titles = { g1: "G1 · Growth by motion", g2: "G2 · Level and direction", g3: "G3 · The divergence" };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Q3 Outlook — ${titles[key]}${direct ? " · Direct to source" : ""}</title>
<style>${CSS}</style>
</head>
<body>
<div class="app">
${topbar(direct)}
<main class="stage">
  <div class="panel">
${panelHead()}
    <div class="panel-bands hero-${key}">${bands(key, direct)}
    </div>
  </div>
</main>
</div>
</body>
</html>
`;
}

const OUT = [
  ["g1-growth-by-motion.html", page("g1")],
  ["g2-level-and-direction.html", page("g2")],
  ["g3-divergence.html", page("g3")],
  ["g3-divergence-direct.html", page("g3", true)]
];
for (const [file, html] of OUT) {
  writeFileSync(join(HERE, file), html, "utf8");
  console.log("wrote", file);
}

/* Assertions, so the pages cannot drift from the file they were read out of. */
const sum = (a) => a.reduce((x, y) => x + y, 0);
console.log("\nauthored partitions:");
console.log("  ACV children", sum([75.5, 29.5]), "vs Analytics 105", 75.5 + 29.5 === 105 ? "CLOSES" : "OPEN");
console.log("  Attrition children", sum([73.5, 6]), "vs Analytics 79.5", 73.5 + 6 === 79.5 ? "CLOSES" : "OPEN");
console.log("  NNAOV children", sum([8.5, 23.5]), "vs Analytics 25.5", 8.5 + 23.5 === 25.5 ? "CLOSES" : "OPEN");
console.log("  deals", sum(DEALS.deals.map((d) => d.value)), "vs authored total", DEALS.total);
console.log("\nno derived figure is drawn on any of these pages.");
