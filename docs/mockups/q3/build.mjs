/* Builds the three Q3-outlook redesign mockups as self-contained HTML.
 *
 * Nothing here imports from ../../../src. The CSS below is a hand-copy of the
 * parts of styles/base.css, styles/fonts.css, styles/tabs.css and
 * styles/portlets.css that the board's card idiom actually needs, so these
 * files cannot break — or be broken by — the running board. The only shared
 * asset referenced is ../../../fonts/*.woff2, which is a static directory.
 *
 * Every figure traces to data/board.json's `q3-outlook` tab. Derived values
 * are computed in DERIVED below, exactly, and are labelled as derived
 * wherever they are drawn.
 *
 *   node docs/mockups/q3/build.mjs
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

/* ========================================================================== */
/* Authored figures — verbatim from data/board.json, tab `q3-outlook`.        */
/* ========================================================================== */

const ROWS = [
  {
    id: "analytics",
    label: "Analytics",
    sub: null,
    level: 0,
    parent: null,
    color: "#1C6E8C",
    acv: {
      value: 105, display: "$105M", yoy: -6, yoyDisplay: "-6% Y/Y",
      plan: 87, planDisplay: "87% of Product FinPlan",
      alt: { label: "OU Roll-up", value: 100, display: "$100M", yoy: -10, yoyDisplay: "-10% Y/Y" }
    },
    attrition: {
      value: 79.5, display: "$79.5M", yoy: 20, yoyDisplay: "+20% Y/Y",
      alt: { label: "*OU Roll-up", value: 88.9, display: "$88.9M", yoy: 34, yoyDisplay: "34% Y/Y" }
    },
    nnaov: { value: 25.5, display: "$25.5M", yoy: -43, yoyDisplay: "-43% Y/Y" }
  },
  {
    id: "platform",
    label: "Agentic Analytics Platform",
    sub: "Cloud + Server",
    level: 1,
    parent: "analytics",
    color: "#2F5FA8",
    acv: {
      value: 75.5, display: "$75.5M", yoy: -15, yoyDisplay: "-15% Y/Y",
      plan: 78, planDisplay: "78% of Product FinPlan",
      pairs: [
        { id: "velocity", label: "Velocity", value: 15, valueDisplay: "15%", hist: 17, histDisplay: "17% hist", domainMax: 25, unit: "%", goodDirection: "up" },
        { id: "coverage", label: "Coverage", value: 2.6, valueDisplay: "2.6x", hist: 2.7, histDisplay: "2.7x hist", domainMax: 4, unit: "x", goodDirection: "up" }
      ]
    },
    attrition: { value: 73.5, display: "$73.5M", yoy: 26, yoyDisplay: "+26% Y/Y" },
    nnaov: { value: 8.5, display: "$8.5M", yoy: -3, yoyDisplay: "-3% Y/Y" }
  },
  {
    id: "embedded",
    label: "Embedded Agentic Analytics",
    sub: "Tableau Next + CRMA",
    level: 1,
    parent: "analytics",
    color: "#12806A",
    acv: {
      value: 29.5, display: "$29.5M", yoy: 32, yoyDisplay: "+32% Y/Y",
      plan: 128, planDisplay: "128% of Product FinPlan",
      pairs: [
        { id: "velocity", label: "Velocity", value: 16, valueDisplay: "16%", hist: 16, histDisplay: "16% hist", domainMax: 25, unit: "%", goodDirection: "up" },
        { id: "coverage", label: "Coverage", value: 3.2, valueDisplay: "3.2x", hist: 2.8, histDisplay: "2.8x hist", domainMax: 4, unit: "x", goodDirection: "up" }
      ]
    },
    attrition: { value: 6, display: "$6M", yoy: -23, yoyDisplay: "-23% Y/Y", note: "No change w/w" },
    nnaov: { value: 23.5, display: "$23.5M", yoy: 61, yoyDisplay: "+61% Y/Y", note: "No change w/w" }
  }
];

const COLUMNS = [
  { id: "acv", label: "ACV", goodDirection: "up" },
  { id: "attrition", label: "Attrition", goodDirection: "down" },
  { id: "nnaov", label: "NNAOV", goodDirection: "up" }
];

const DEALS = {
  unit: "$M",
  totalDisplay: "$12.5M across five deals",
  caption: "Ranked on one certified ACV definition",
  deals: [
    { id: "bofa", account: "Bank of America", value: 3, display: "$3M" },
    { id: "aetna", account: "Aetna", value: 3, display: "$3M" },
    { id: "schwab", account: "Charles Schwab", value: 2.3, display: "$2.3M" },
    { id: "usbank", account: "US Bank", value: 2.1, display: "$2.1M" },
    { id: "usgov", account: "US GOV", value: 2.1, display: "$2.1M" }
  ]
};

const AXIS_NOTE = "Y/Y — the same growth axis as the product and segment tabs";
const KICKER = "Q3 FY27 outlook";
const HEADLINE = "Q3 tracks to $105M with attrition running 20% ahead of last year";

/* ========================================================================== */
/* Derived arithmetic — exact, from the authored figures above.              */
/* ========================================================================== */

/* plan% is authored alongside the outlook, so the plan value and therefore the
 * gap are exactly derivable. Every one of these is labelled "derived" wherever
 * it is drawn, and none of them is presented as authored.
 *
 * The three derived plans do NOT roll up: 96.79 + 23.05 = 119.84 against the
 * Analytics row's own 120.69. Nothing below stacks them, for that reason.  */
function derivePlan(row) {
  const v = row.acv.value;
  const pct = row.acv.plan / 100;
  const plan = v / pct;
  return { value: v, plan, gap: plan - v };
}

const DERIVED = {
  analytics: derivePlan(ROWS[0]),   // plan 120.68966, gap 15.68966
  platform: derivePlan(ROWS[1]),    // plan  96.79487, gap 21.29487
  embedded: derivePlan(ROWS[2])     // plan  23.04688, gap -6.45313 (over)
};

const DEALS_TOTAL = DEALS.deals.reduce((a, d) => a + d.value, 0);          // 12.5
const GAP = DERIVED.analytics.gap;                                          // 15.68966
const DEALS_SHARE = DEALS_TOTAL / GAP;                                      // 0.79671
const GAP_RESIDUAL = GAP - DEALS_TOTAL;                                     // 3.18966

/* ========================================================================== */
/* Board primitives, copied rather than imported.                            */
/* ========================================================================== */

/* palette.js TRUSTED */
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

/* palette.js planTone */
function planTone(plan, goodDirection = "up") {
  if (plan == null) return "neutral";
  if (goodDirection === "down") return plan <= 100 ? "positive" : plan <= 110 ? "warn" : "risk";
  return plan >= 100 ? "positive" : plan >= 85 ? "warn" : "risk";
}

/* growth.js — the symlog Y/Y axis shared with the product and segment tabs */
const CORE = 10, DECADES = 2.2, CORE_FRACTION = 0.22;
function growthFraction(v) {
  if (v == null || Number.isNaN(Number(v))) return null;
  const value = Number(v);
  const b = (1 - CORE_FRACTION) / DECADES;
  const m = Math.abs(value);
  const f = m <= CORE ? (m / CORE) * CORE_FRACTION : CORE_FRACTION + b * Math.log10(m / CORE);
  return Math.sign(value) * Math.min(f, 1);
}
const DECADE_FRACTIONS = [growthFraction(100), growthFraction(1000)];

/* ========================================================================== */
/* Mark builders                                                             */
/* ========================================================================== */

/* Rank-2 growth stub: viewBox 132 x 18, zero at 66, half-width 54.
 * Identical construction to metricMatrix's `.mmx-stub`. */
function growthStub(yoy, goodDirection, opts = {}) {
  const W = 132, H = 18, zero = 66, half = 54, midY = H / 2;
  const parts = [];
  parts.push(`<rect x="12" y="${midY - 0.5}" width="108" height="1" fill="${P.grid}"/>`);
  DECADE_FRACTIONS.forEach((f) => {
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
    const x0 = Math.min(zero, x), w = Math.abs(x - zero);
    parts.push(`<rect x="${x0.toFixed(2)}" y="${midY - 3.2}" width="${Math.max(w, 1).toFixed(2)}" height="6.4" rx="1.4" fill="${tone}"/>`);
  }
  if (opts.alt != null) {
    const af = growthFraction(opts.alt);
    if (af !== null) {
      const ax = zero + af * half;
      parts.push(`<path d="M ${ax.toFixed(2)} ${midY - 6} V ${midY + 6}" stroke="${P.ghost}" stroke-width="1.6" stroke-dasharray="2 2"/>`);
    }
  }
  return `<svg class="stub" viewBox="0 0 ${W} ${H}" aria-hidden="true">${parts.join("")}</svg>`;
}

/* The paired dumbbell, at the size new-tabs-spec §7.3 specifies for a cell.
 * The flat case (Embedded velocity, 16 against 16) is a case, not a failure:
 * filled dot inside a hollow ring, no stem. */
function dumbbell(pair, W = 148, H = 14) {
  const pad = 14, x = (v) => pad + (v / pair.domainMax) * (W - pad * 2);
  const dh = x(pair.hist), dc = x(pair.value), cy = H / 2;
  const better = pair.goodDirection === "down" ? pair.value < pair.hist : pair.value > pair.hist;
  const flat = pair.value === pair.hist;
  const tone = flat ? P.inkSoft : toneColor(better ? "positive" : "risk");
  const parts = [`<rect x="${pad}" y="${cy - 0.5}" width="${W - pad * 2}" height="1" fill="${P.grid}"/>`];
  if (!flat) {
    parts.push(`<path d="M ${Math.min(dh, dc).toFixed(2)} ${cy} H ${Math.max(dh, dc).toFixed(2)}" stroke="${tone}" stroke-width="2.2" stroke-linecap="round"/>`);
  }
  parts.push(`<circle cx="${dh.toFixed(2)}" cy="${cy}" r="3.4" fill="${P.surface}" stroke="${P.inkDim}" stroke-width="1.5"/>`);
  parts.push(`<circle cx="${dc.toFixed(2)}" cy="${cy}" r="${flat ? 2 : 3.8}" fill="${tone}"/>`);
  return `<svg class="dumb" viewBox="0 0 ${W} ${H}" aria-hidden="true">${parts.join("")}</svg>`;
}

/* The containment rail from metricMatrix: a spine with a tick at each row
 * centre. Stretched with preserveAspectRatio="none" and non-scaling strokes. */
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

const money = (n) => `$${n.toFixed(1).replace(/\.0$/, "")}M`;
const pct = (n) => `${(n * 100).toFixed(0)}%`;

/* ========================================================================== */
/* Chrome                                                                     */
/* ========================================================================== */

const TABLEAU_MARK = `<svg class="topbar-mark" viewBox="0 0 24 24" aria-hidden="true">
<g fill="#63a5b9"><rect x="3.05" y="4.2" width="4.2" height="1.9"/><rect x="4.2" y="3.05" width="1.9" height="4.2"/><rect x="16.75" y="4.2" width="4.2" height="1.9"/><rect x="17.9" y="3.05" width="1.9" height="4.2"/><rect x="3.05" y="17.9" width="4.2" height="1.9"/><rect x="4.2" y="16.75" width="1.9" height="4.2"/><rect x="16.75" y="17.9" width="4.2" height="1.9"/><rect x="17.9" y="16.75" width="1.9" height="4.2"/></g>
<g fill="#4e79a7"><rect x="0.15" y="10.9" width="5.5" height="2.2"/><rect x="1.8" y="9.25" width="2.2" height="5.5"/><rect x="18.35" y="10.9" width="5.5" height="2.2"/><rect x="20" y="9.25" width="2.2" height="5.5"/></g>
<g fill="#576eb2"><rect x="9.25" y="1.8" width="5.5" height="2.2"/><rect x="10.9" y="0.15" width="2.2" height="5.5"/><rect x="9.25" y="20" width="5.5" height="2.2"/><rect x="10.9" y="18.35" width="2.2" height="5.5"/></g>
<g fill="#e8762d"><rect x="6.4" y="10.15" width="11.2" height="3.7"/><rect x="10.15" y="6.4" width="3.7" height="11.2"/></g></svg>`;

const TABS = ["Exec", "Product", "Segment", "Q3 Outlook", "Five Year"];

function topbar() {
  return `<header class="topbar">
  <div class="topbar-id">${TABLEAU_MARK}
    <div class="topbar-titles">
      <p class="topbar-eyebrow">Tableau MCP · Semantic Layer</p>
      <p class="topbar-name">Analytics Business Review</p>
    </div>
  </div>
  <nav class="tabnav">
    <span class="tabnav-indicator"></span>
    ${TABS.map((t, i) => `<span class="tabnav-btn${i === 3 ? " is-active" : ""}">${t}</span>`).join("\n    ")}
  </nav>
  <div class="topbar-actions">
    <span class="mode-switch">
      <span class="mode-switch-state">Governed</span>
      <span class="trust-legend-dot"></span>
      <span class="mode-switch-btn">Direct</span>
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

/* A portlet card: the wash, the 3px accent edge, the head, the trust dot. */
function portlet({ label, sub, accent, tier = "red", body, cls = "" }) {
  return `<section class="portlet ${cls}" data-tier="${tier}" style="--accent:${accent}">
  <div class="pf">
    <div class="portlet-head">
      <div class="portlet-titles">
        <p class="portlet-label">${label}</p>
        ${sub ? `<p class="portlet-sublabel">${sub}</p>` : ""}
      </div>
      <div class="portlet-tools"><span class="portlet-expand"><span></span></span><span class="trust-dot"></span></div>
    </div>
    <div class="portlet-body">${body}</div>
  </div>
</section>`;
}

/* ========================================================================== */
/* Shared sub-compositions                                                    */
/* ========================================================================== */

/* The compact Y/Y matrix: rank 1 (value) and rank 2 (stub + chip) only.
 * Ranks 3 and 4 have left the cell — they are the hero elsewhere on the tab. */
function yoyMatrix({ withPlan = false } = {}) {
  const head = COLUMNS.map((c, ci) =>
    `<p class="mx-colhead" style="--c:${ci + 3}">${c.label}</p>`).join("");
  const body = ROWS.map((row, ri) => {
    const r = ri + 2;
    const cells = COLUMNS.map((c, ci) => {
      const cell = row[c.id];
      const tone = toneOf(cell.yoy, c.goodDirection);
      const alt = cell.alt;
      return `<div class="mx-cell${ri ? " has-rule" : ""}" style="--c:${ci + 3};--r:${r}">
        <p class="mx-value">${cell.display}</p>
        <div class="mx-stubrow">${growthStub(cell.yoy, c.goodDirection, { alt: alt ? alt.yoy : null })}<span class="mx-chip" style="color:${toneColor(tone)}">${cell.yoyDisplay}</span></div>
        ${withPlan && c.id === "acv" && cell.plan != null
          ? `<div class="mx-stubrow">${planBullet(cell.plan)}<span class="mx-planlab" style="color:${toneColor(planTone(cell.plan))}">${cell.plan}% of plan</span></div>`
          : alt ? `<p class="mx-alt">${alt.label} ${alt.display} · ${alt.yoyDisplay}</p>` : ""}
      </div>`;
    }).join("");
    return `<div class="mx-label${ri ? " has-rule" : ""}" data-level="${row.level}" style="--r:${r}">
      <p class="mx-rowname">${row.label}</p>
      ${row.sub ? `<p class="mx-rowsub">${row.sub}</p>` : ""}
    </div>${cells}`;
  }).join("");
  return `<div class="mx">
    <div class="mx-grid">${rail(3)}${head}${body}</div>
    <p class="mx-foot">${AXIS_NOTE}${withPlan ? " · attainment on the board's [0,120] plan domain" : " · dashed decade rules at ±100%; the linear core is ±10%"}</p>
  </div>`;
}

/* ========================================================================== */
/* ALTERNATIVE A — "Q3 against plan"                                          */
/* ========================================================================== */

const A_MAX = 125;   // $M — the shared dollar scale. 0/25/50/75/100/125.
const ax = (v) => (v / A_MAX) * 100;

function planLandscape() {
  const rows = ROWS.map((row, ri) => {
    const d = DERIVED[row.id];
    const over = d.gap < 0;
    const tone = planTone(row.acv.plan, "up");
    const tickX = ax(d.plan);
    const flip = tickX > 62;
    const pairs = row.acv.pairs;
    const alt = row.acv.alt;
    const r = ri + 1;
    return `<div class="pl-label pl-c${ri ? " has-rule" : ""}" data-level="${row.level}" style="--r:${r}">
        <p class="pl-name">${row.label}</p>
        ${row.sub ? `<p class="pl-sub">${row.sub}</p>` : ""}
      </div>
      <div class="pl-plot pl-c${ri ? " has-rule" : ""}" style="--r:${r}">
        <div class="pl-grid"></div>
        <div class="pl-bar" style="width:${ax(d.value).toFixed(2)}%;background:${row.color}"></div>
        <div class="pl-gap" data-over="${over}" style="left:${(over ? ax(d.plan) : ax(d.value)).toFixed(2)}%;width:${Math.abs(ax(d.gap)).toFixed(2)}%;--gap-tone:${toneColor(over ? "positive" : tone)}"></div>
        <div class="pl-tick" style="left:${tickX.toFixed(2)}%"></div>
        <span class="pl-ticklabel" data-flip="${flip}" style="left:${tickX.toFixed(2)}%">plan ${money(d.plan)}<em>derived</em></span>
      </div>
      <div class="pl-read pl-c${ri ? " has-rule" : ""}" style="--r:${r}">
        <p class="pl-value">${row.acv.display}</p>
        <p class="pl-plan" style="color:${toneColor(tone)}">${row.acv.plan}% of FinPlan</p>
        <p class="pl-gapline" style="color:${toneColor(over ? "positive" : tone)}">${over ? "+" : "−"}${money(Math.abs(d.gap))} ${over ? "over" : "gap"}<em>derived</em></p>
      </div>
      <div class="pl-side pl-c${ri ? " has-rule" : ""}" style="--r:${r}">
        ${pairs ? pairs.slice().reverse().map((pr) => `<div class="pl-pair"><span class="pl-pairlab">${pr.label}</span>${dumbbell(pr, 110, 13)}<span class="pl-pairval">${pr.valueDisplay}<em>${pr.histDisplay}</em></span></div>`).join("")
        : `<p class="pl-alt"><b>${alt.label}</b> ${alt.display} · ${alt.yoyDisplay}<br><span>a second stated basis, same measure</span></p>`}
      </div>`;
  }).join("");

  const ticks = [0, 25, 50, 75, 100, 125].map((t) =>
    `<span class="pl-axtick" style="left:${ax(t)}%">${t === 0 ? "$0" : `$${t}M`}</span>`).join("");

  return `<div class="pl">
    <div class="pl-head"><span></span><span></span><span class="pl-colhead">Commit, derived plan and the gap — one dollar scale</span><span class="pl-colhead">Attainment</span><span class="pl-colhead">Benchmarks · alternate basis</span></div>
    <div class="pl-rows">${rail(3)}${rows}</div>
    <div class="pl-axisrow"><span></span><span></span><div class="pl-axis">${ticks}</div><span></span><span></span></div>
    <p class="pl-cap">Plan is derived from the authored attainment percentage and the authored commit, and is stated per row. The three derived plans are never summed.</p>
  </div>`;
}

function dealsShareOfGap() {
  let acc = 0;
  const segs = DEALS.deals.map((d, i) => {
    const left = (acc / GAP) * 100;
    acc += d.value;
    return `<div class="dg-seg" style="left:${left.toFixed(2)}%;width:${((d.value / GAP) * 100).toFixed(2)}%;--d:${i}"><span>${d.display}</span></div>`;
  }).join("");
  return `<div class="dg">
    <div class="dg-headline">
      <p class="dg-total">$12.5M</p>
      <p class="dg-claim">${pct(DEALS_SHARE)} of the ${money(GAP)} gap to plan <em>derived</em></p>
    </div>
    <div class="dg-track">
      <div class="dg-fill">${segs}</div>
      <div class="dg-residual" style="left:${((DEALS_TOTAL / GAP) * 100).toFixed(2)}%"><span>${money(GAP_RESIDUAL)}</span></div>
      <div class="dg-end"></div>
    </div>
    <ol class="dg-list">${DEALS.deals.map((d, i) => `<li><span class="dg-rank" style="--d:${i}"></span><span class="dg-acct">${d.account}</span><span class="dg-val">${d.display}</span></li>`).join("")}</ol>
    <p class="dg-cap">Largest open opportunities by Open Pipe against the derived gap. Open pipe and commit are different measures — this compares size, not a sum.</p>
  </div>`;
}

const ALT_A = {
  file: "alt-a-gap-to-plan.html",
  title: "Q3 Outlook — Alternative A · Gap to plan",
  bands: `
${portlet({
    label: "Q3 against plan", sub: "Commit, derived plan and the gap on one dollar scale",
    accent: "#92640A", tier: "red", cls: "band-a1", body: planLandscape()
  })}
<div class="band-a2">
${portlet({
    label: "Year over year by motion", sub: "Three measures on the board's shared growth axis",
    accent: "#92640A", tier: "red", cls: "p-yoy", body: yoyMatrix()
  })}
${portlet({
    label: "Q3 top ACV deals", sub: "Five largest open opportunities, against the gap",
    accent: "#1C6E8C", tier: "yellow", cls: "p-deals", body: dealsShareOfGap()
  })}
</div>`
};

/* ========================================================================== */
/* ALTERNATIVE B — "Coverage sufficiency"                                     */
/* ========================================================================== */

/* Two shared benchmark axes at hero width. Both motions on each axis, so the
 * comparison is position-along-a-common-scale rather than four separate
 * paired readings. Analytics carries neither: coverage and velocity are
 * non-additive, so the roll-up row has nothing to draw — which is the rule
 * rendered rather than stated. */
function benchmarkAxis({ id, title, sub, domainMax, ticks, fmt }) {
  const rows = ROWS.filter((r) => r.acv.pairs).map((row) => {
    const pr = row.acv.pairs.find((p) => p.id === id);
    const flat = pr.value === pr.hist;
    const better = pr.value > pr.hist;
    const tone = flat ? P.inkSoft : toneColor(better ? "positive" : "risk");
    const hx = (pr.hist / domainMax) * 100;
    const cx = (pr.value / domainMax) * 100;
    const l = Math.min(hx, cx), w = Math.abs(cx - hx);
    const delta = pr.value - pr.hist;
    const deltaTxt = flat ? "flat vs hist" : `${delta > 0 ? "+" : "−"}${fmt(Math.abs(delta))} vs hist`;
    const planT = planTone(row.acv.plan, "up");
    return `<div class="ba-row">
      <div class="ba-lab"><p class="ba-name" style="color:${row.color}">${row.label}</p><p class="ba-sub">${row.sub}</p></div>
      <div class="ba-plot">
        <div class="ba-line"></div>
        ${flat ? "" : `<div class="ba-stem" style="left:${l}%;width:${w}%;background:${tone}"></div>`}
        <div class="ba-hist" style="left:${hx}%"></div>
        <div class="ba-cur" data-flat="${flat}" style="left:${cx}%;background:${tone};--tone:${tone}"></div>
        <span class="ba-histlab" data-flip="${hx > cx}" style="left:${hx}%">${pr.histDisplay}</span>
      </div>
      <div class="ba-read"><p class="ba-val" style="color:${tone}">${pr.valueDisplay}</p><p class="ba-delta">${deltaTxt}${id === "coverage" ? ` · <b style="color:${toneColor(planT)}">${row.acv.plan}% plan</b>` : ""}</p></div>
    </div>`;
  }).join("");
  const tickEls = ticks.map((t) => `<span class="ba-tick" style="left:${(t / domainMax) * 100}%">${fmt(t)}</span>`).join("");
  return `<div class="ba">
    <div class="ba-head"><p class="ba-title">${title}</p><p class="ba-subtitle">${sub}</p></div>
    ${rows}
    <div class="ba-axisrow"><span class="ba-lab"></span><div class="ba-axis">${tickEls}</div><span class="ba-read"></span></div>
  </div>`;
}

function sufficiency() {
  return `<div class="suf">
  ${benchmarkAxis({
    id: "coverage", title: "Coverage", sub: "Open pipe against commit — a multiplier",
    domainMax: 4, ticks: [0, 1, 2, 3, 4], fmt: (v) => `${v % 1 ? v.toFixed(1) : v}×"`.replace('"', "")
  })}
  ${benchmarkAxis({
    id: "velocity", title: "Velocity", sub: "Pace of deals through the pipeline",
    domainMax: 25, ticks: [0, 5, 10, 15, 20, 25], fmt: (v) => `${v % 1 ? v.toFixed(1) : v}%`
  })}
  <p class="suf-cap"><span class="suf-key"><span class="suf-key-hist"></span>hollow = historical benchmark, the average of the same fiscal quarter across the prior two years</span> · Coverage and velocity are non-additive, so the Analytics roll-up has neither.</p>
  </div>`;
}

/* A part-to-whole composition bar. Ties render as identical segments; the
 * finding is the composition, not the ranking. */
function dealsComposition() {
  let acc = 0;
  const segs = DEALS.deals.map((d, i) => {
    const left = (acc / DEALS_TOTAL) * 100;
    acc += d.value;
    return `<div class="dc-seg" style="left:${left.toFixed(2)}%;width:${((d.value / DEALS_TOTAL) * 100).toFixed(2)}%;--d:${i}"></div>`;
  }).join("");
  return `<div class="dc">
    <p class="dc-total">$12.5M</p>
    <p class="dc-sub">across five deals · ${pct(DEALS_SHARE)} of the ${money(GAP)} gap to plan <em>derived</em></p>
    <div class="dc-bar">${segs}</div>
    <ol class="dc-list">${DEALS.deals.map((d, i) => `<li><span class="dc-swatch" style="--d:${i}"></span><span class="dc-acct">${d.account}</span><span class="dc-val">${d.display}</span></li>`).join("")}</ol>
  </div>`;
}

const ALT_B = {
  file: "alt-b-coverage.html",
  title: "Q3 Outlook — Alternative B · Coverage sufficiency",
  bands: `
${portlet({
    label: "Pipeline sufficiency by motion", sub: "Coverage and velocity against their historical benchmarks",
    accent: "#92640A", tier: "red", cls: "band-b1", body: sufficiency()
  })}
<div class="band-b2">
${portlet({
    label: "Q3 outlook by product", sub: "Three measures against the same quarter last year",
    accent: "#92640A", tier: "red", cls: "p-yoy", body: yoyMatrix({ withPlan: false })
  })}
${portlet({
    label: "Q3 top ACV deals", sub: "Five largest open opportunities",
    accent: "#1C6E8C", tier: "yellow", cls: "p-dealsb", body: dealsComposition()
  })}
</div>`
};

/* attainment.js's bullet, at cell scale: bands, target tick at 100, and the
 * notched cap for the one authored value past the 120 domain end. */
function planBullet(plan) {
  const W = 148, H = 18, x0 = 6, x1 = 142;
  const x = (v) => x0 + (Math.min(v, 120) / 120) * (x1 - x0);
  const bands = [
    { from: 0, to: 85, tone: "risk" }, { from: 85, to: 100, tone: "warn" }, { from: 100, to: 120, tone: "positive" }
  ];
  const parts = bands.map((b) =>
    `<rect x="${x(b.from).toFixed(2)}" y="4" width="${(x(b.to) - x(b.from)).toFixed(2)}" height="12" fill="${toneColor(b.tone)}" opacity="0.13"/>`);
  const tone = toneColor(planTone(plan));
  const capped = plan > 120;
  if (capped) {
    const xe = x(120);
    parts.push(`<path d="M ${x0} 6 H ${xe - 4} l 3.2 1.5 l -3.2 1.5 l 3.2 1.5 l -3.2 1.5 V 12 Z" fill="${tone}"/>`);
  } else {
    parts.push(`<rect x="${x0}" y="6" width="${(x(plan) - x0).toFixed(2)}" height="6" rx="2" fill="${tone}"/>`);
    parts.push(`<path d="M ${x(plan).toFixed(2)} 9 H ${x(100).toFixed(2)}" stroke="${P.ghost}" stroke-width="1" stroke-dasharray="2 2"/>`);
  }
  parts.push(`<path d="M ${x(100).toFixed(2)} 1.5 V ${H - 1.5}" stroke="${P.ink}" stroke-width="1.6"/>`);
  return `<svg class="mx-bullet" viewBox="0 0 ${W} ${H}" aria-hidden="true">${parts.join("")}</svg>`;
}

/* ========================================================================== */
/* ALTERNATIVE C — "The five deals"                                           */
/* ========================================================================== */

const C_MAX = 18;  // $M — headroom past the derived gap so the line is not the edge

function dealLadder() {
  let acc = 0;
  const rows = DEALS.deals.map((d, i) => {
    const from = acc; acc += d.value;
    const cum = acc;
    return `<div class="dl-row">
      <span class="dl-rank">${i + 1}</span>
      <span class="dl-acct">${d.account}</span>
      <div class="dl-plot">
        <div class="dl-prior" style="width:${((from / C_MAX) * 100).toFixed(2)}%"></div>
        <div class="dl-seg" style="left:${((from / C_MAX) * 100).toFixed(2)}%;width:${((d.value / C_MAX) * 100).toFixed(2)}%;--d:${i}"><span>${d.display}</span></div>
      </div>
      <span class="dl-cum">${money(cum)}</span>
    </div>`;
  }).join("");
  const ticks = [0, 4, 8, 12, 16].map((t) => `<span class="dl-tick" style="left:${((t / C_MAX) * 100).toFixed(2)}%">$${t}M</span>`).join("");
  return `<div class="dl">
    <div class="dl-lede">
      <p class="dl-total">$12.5M</p>
      <p class="dl-claim">of a ${money(GAP)} gap to plan <em>derived</em> — winning all five leaves ${money(GAP_RESIDUAL)} to find</p>
    </div>
    <div class="dl-body">
      <div class="dl-gapline" style="left:calc(var(--dl-gutter) + 6px + (100% - var(--dl-gutter) - var(--dl-cum) - 12px) * ${(GAP / C_MAX).toFixed(4)})">
        <span class="dl-gaplab">gap to plan<br>${money(GAP)} <em>derived</em></span>
      </div>
      ${rows}
      <div class="dl-axisrow"><span></span><span></span><div class="dl-axis">${ticks}</div><span></span></div>
    </div>
    <p class="dl-cap">Cumulative. Each bar adds one deal to the one above it. Open pipe and commit are different measures — the comparison against the gap is of size, not a sum.</p>
  </div>`;
}

function planRail() {
  const rows = ROWS.map((row) => {
    const d = DERIVED[row.id];
    const over = d.gap < 0;
    const tone = planTone(row.acv.plan, "up");
    return `<div class="pr-row">
      <p class="pr-name" style="color:${row.color}">${row.label}</p>
      <div class="pr-plot">
        <div class="pr-bar" style="width:${ax(d.value).toFixed(2)}%;background:${row.color}"></div>
        <div class="pr-gap" data-over="${over}" style="left:${(over ? ax(d.plan) : ax(d.value)).toFixed(2)}%;width:${Math.abs(ax(d.gap)).toFixed(2)}%;--gap-tone:${toneColor(over ? "positive" : tone)}"></div>
        <div class="pr-tick" style="left:${ax(d.plan).toFixed(2)}%"></div>
      </div>
      <p class="pr-read"><b>${row.acv.display}</b><span style="color:${toneColor(tone)}">${row.acv.plan}%</span><em>${over ? "+" : "−"}${money(Math.abs(d.gap))}</em></p>
    </div>`;
  }).join("");
  return `<div class="pr">
    <div class="pr-ledger">
      <div><span>Commit</span><b>$105M</b></div>
      <div><span>Plan <em>derived</em></span><b>${money(DERIVED.analytics.plan)}</b></div>
      <div class="is-gap"><span>Gap <em>derived</em></span><b>${money(GAP)}</b></div>
    </div>
    <div class="pr-rows">${rail(3)}${rows}</div>
    <p class="pr-cap">Plan derived from the authored attainment percentage. The three derived plans are stated per row and are never summed.</p>
  </div>`;
}

function motionStrip() {
  const rows = ROWS.map((row, ri) => {
    const r = ri + 1;
    const cells = COLUMNS.map((c, ci) => {
      const cell = row[c.id];
      const tone = toneOf(cell.yoy, c.goodDirection);
      return `<div class="ms-cell${ri ? " has-rule" : ""}" style="--c:${ci + 3};--r:${r}"><p class="ms-value">${cell.display}</p>
        <div class="ms-stubrow">${growthStub(cell.yoy, c.goodDirection, { alt: cell.alt ? cell.alt.yoy : null })}<span class="ms-chip" style="color:${toneColor(tone)}">${cell.yoyDisplay}</span></div></div>`;
    }).join("");
    const pairs = row.acv.pairs;
    return `<div class="ms-label${ri ? " has-rule" : ""}" data-level="${row.level}" style="--r:${r}"><p class="ms-name">${row.label}</p>${row.sub ? `<p class="ms-sub">${row.sub}</p>` : ""}</div>
      ${cells}
      <div class="ms-pairs${ri ? " has-rule" : ""}" style="--r:${r}">${pairs ? pairs.slice().reverse().map((pr) => `<div class="ms-pair"><span class="ms-pairlab">${pr.label}</span>${dumbbell(pr, 110, 13)}<span class="ms-pairval">${pr.valueDisplay}<em>${pr.histDisplay}</em></span></div>`).join("") : `<p class="ms-void">coverage and velocity are non-additive — the roll-up has neither</p>`}</div>`;
  }).join("");
  return `<div class="ms">
    <div class="ms-head"><span></span><span></span>${COLUMNS.map((c, ci) => `<p class="ms-colhead" style="--c:${ci + 3}">${c.label}</p>`).join("")}<p class="ms-colhead" style="--c:6">Velocity · Coverage</p></div>
    <div class="ms-rows">${rail(3)}${rows}</div>
    <p class="ms-foot">${AXIS_NOTE}</p>
  </div>`;
}

const ALT_C = {
  file: "alt-c-deals.html",
  title: "Q3 Outlook — Alternative C · The five deals",
  bands: `
<div class="band-c1">
${portlet({
    label: "Q3 top ACV deals", sub: "Cumulative, against the derived gap to plan",
    accent: "#1C6E8C", tier: "yellow", cls: "p-ladder", body: dealLadder()
  })}
${portlet({
    label: "Q3 against plan", sub: "Commit and derived plan by motion",
    accent: "#92640A", tier: "red", cls: "p-planrail", body: planRail()
  })}
</div>
${portlet({
    label: "Q3 outlook by product", sub: "Three measures, with velocity and coverage",
    accent: "#92640A", tier: "red", cls: "band-c2", body: motionStrip()
  })}`
};

/* ========================================================================== */
/* HYBRID — A's gap-to-plan structure with B's benchmark axis promoted        */
/* ========================================================================== */

/* Band 1. A's plan landscape and the Y/Y matrix, merged onto one set of rows.
 *
 * The two were separate cards in A, and they are keyed on the same three
 * motions — which is the duplication criticism 1 objected to, one level down.
 * Merging them buys the ~90px that lets B's benchmark axis have a band of its
 * own, and it means each motion is read across once: how it stands against
 * plan, and what its other two measures did year over year.
 *
 * ACV appears only here, so the matrix loses its ACV column rather than
 * restating the dollar figure two cards apart.
 *
 * The Analytics row carries a hollow diamond at the OU Roll-up's $100M — the
 * alternate basis stated as a position on the same dollar axis rather than as
 * 8px grey text. Two marks, both stated, no arithmetic between them. */
const ALT_COLUMNS = COLUMNS.filter((c) => c.id !== "acv");

function planMatrixH() {
  const rows = ROWS.map((row, ri) => {
    const d = DERIVED[row.id];
    const over = d.gap < 0;
    const tone = planTone(row.acv.plan, "up");
    const yoyTone = toneOf(row.acv.yoy, "up");
    const tickX = ax(d.plan);
    const alt = row.acv.alt;
    const r = ri + 1;
    const cells = ALT_COLUMNS.map((c, ci) => {
      const cell = row[c.id];
      return `<div class="ph-cell ph-c${ri ? " has-rule" : ""}" style="--c:${ci + 5};--r:${r}">
        <p class="ph-cellval">${cell.display}</p>
        <div class="ph-stubrow">${growthStub(cell.yoy, c.goodDirection, { alt: cell.alt ? cell.alt.yoy : null })}<span class="ph-chip" style="color:${toneColor(toneOf(cell.yoy, c.goodDirection))}">${cell.yoyDisplay}</span></div>
      </div>`;
    }).join("");
    return `<div class="ph-label ph-c${ri ? " has-rule" : ""}" data-level="${row.level}" style="--r:${r}">
        <p class="ph-name">${row.label}</p>
        ${row.sub ? `<p class="ph-sub">${row.sub}</p>` : ""}
      </div>
      <div class="ph-plot ph-c${ri ? " has-rule" : ""}" style="--r:${r}">
        <div class="ph-grid"></div>
        <div class="ph-bar" style="width:${ax(d.value).toFixed(2)}%;background:${row.color}"></div>
        <div class="ph-gap" data-over="${over}" style="left:${(over ? ax(d.plan) : ax(d.value)).toFixed(2)}%;width:${Math.abs(ax(d.gap)).toFixed(2)}%;--gap-tone:${toneColor(over ? "positive" : tone)}"></div>
        <div class="ph-tick" style="left:${tickX.toFixed(2)}%"></div>
        <span class="ph-ticklabel" data-flip="${tickX > 62}" style="left:${tickX.toFixed(2)}%">plan ${money(d.plan)}<em>derived</em></span>
        ${alt ? `<svg class="ph-alt2" style="left:${ax(alt.value).toFixed(2)}%" viewBox="0 0 13 13" aria-hidden="true"><path d="M 6.5 1.4 L 11.6 6.5 L 6.5 11.6 L 1.4 6.5 Z" fill="${P.surface}" stroke="${P.inkDim}" stroke-width="1.6"/></svg>` : ""}
      </div>
      <div class="ph-read ph-c${ri ? " has-rule" : ""}" style="--r:${r}">
        <p class="ph-value">${row.acv.display}<span style="color:${toneColor(yoyTone)}">${row.acv.yoyDisplay}</span></p>
        <p class="ph-plan"><span style="color:${toneColor(tone)}">${row.acv.plan}% of FinPlan</span></p>
        <p class="ph-gapline" style="color:${toneColor(over ? "positive" : tone)}">${over ? "+" : "−"}${money(Math.abs(d.gap))} ${over ? "over" : "gap"}<em>derived</em></p>
      </div>${cells}`;
  }).join("");

  const ticks = [0, 25, 50, 75, 100, 125].map((t) =>
    `<span class="ph-axtick" style="left:${ax(t)}%">${t === 0 ? "$0" : `$${t}M`}</span>`).join("");

  /* The two alternate-basis strings, at a size somebody can read. Each is tied
   * to a mark: the diamond on the ACV axis, the ghost tick in the Attrition
   * stub. Stated, never differenced — the disagreement is the reader's. */
  const altLine = `<p class="ph-alt"><b>Second stated basis, Analytics roll-up</b>
    <span><i class="ph-alt-dia"></i>ACV <b>${ROWS[0].acv.alt.label} ${ROWS[0].acv.alt.display}</b> · ${ROWS[0].acv.alt.yoyDisplay}</span>
    <span><i class="ph-alt-tick"></i>Attrition <b>${ROWS[0].attrition.alt.label} ${ROWS[0].attrition.alt.display}</b> · ${ROWS[0].attrition.alt.yoyDisplay}</span>
    <em>Plan is derived per row from the authored attainment percentage; the three derived plans are never summed.</em></p>`;

  const heads = `<span></span><span></span>
    <span class="ph-colhead">ACV — commit, derived plan and the gap</span>
    <span class="ph-colhead">ACV attainment</span>
    ${ALT_COLUMNS.map((c, ci) => `<span class="ph-colhead" style="--c:${ci + 5}">${c.label} · Y/Y</span>`).join("")}`;

  return `<div class="ph">
    <div class="ph-head">${heads}</div>
    <div class="ph-rows">${rail(3)}${rows}</div>
    <div class="ph-axisrow"><span></span><span></span><div class="ph-axis">${ticks}</div><span class="ph-axnote">${AXIS_NOTE}</span></div>
    ${altLine}
  </div>`;
}

/* Band 2. B's benchmark axis, kept but laid side by side so two shared axes
 * fit one band. Same mark: hollow benchmark, filled current, toned stem;
 * flat collapses to one neutral dot. The Analytics roll-up appears on
 * neither axis because coverage and velocity are non-additive — the rule
 * rendered rather than stated. */
function benchmarkAxisCompact({ id, title, sub, domainMax, ticks, fmt }) {
  const rows = ROWS.filter((r) => r.acv.pairs).map((row) => {
    const pr = row.acv.pairs.find((p) => p.id === id);
    const flat = pr.value === pr.hist;
    const better = pr.value > pr.hist;
    const tone = flat ? P.inkSoft : toneColor(better ? "positive" : "risk");
    const hx = (pr.hist / domainMax) * 100;
    const cx = (pr.value / domainMax) * 100;
    const l = Math.min(hx, cx), w = Math.abs(cx - hx);
    const delta = pr.value - pr.hist;
    return `<p class="bx-name" style="color:${row.color}">${row.label}</p>
      <div class="bx-plot">
        <div class="bx-line"></div>
        ${flat ? "" : `<div class="bx-stem" style="left:${l}%;width:${w}%;background:${tone}"></div>`}
        <div class="bx-hist" style="left:${hx}%"></div>
        <div class="bx-cur" data-flat="${flat}" style="left:${cx}%;background:${tone}"></div>
        <span class="bx-histlab" style="left:${hx}%">${pr.histDisplay}</span>
      </div>
      <div class="bx-read">
        <p class="bx-val" style="color:${tone}">${pr.valueDisplay}</p>
        <p class="bx-delta">${flat ? "flat" : `${delta > 0 ? "+" : "−"}${fmt(Math.abs(delta))}`}</p>
      </div>`;
  }).join("");
  const tickEls = ticks.map((t) => `<span class="bx-tick" style="left:${(t / domainMax) * 100}%">${fmt(t)}</span>`).join("");
  /* One grid, not three: the tick axis is a cell in the same column as the
   * plots, so it cannot drift out of alignment with them. */
  return `<div class="bx">
    <div class="bx-head"><p class="bx-title">${title}</p><p class="bx-sub">${sub}</p></div>
    ${rows}
    <div class="bx-axis">${tickEls}</div>
  </div>`;
}

function benchmarkStrip() {
  return `<div class="bxs">
  <div class="bxs-pair">
  ${benchmarkAxisCompact({
    id: "coverage", title: "Coverage", sub: "open pipe ÷ commit, a multiplier",
    domainMax: 4, ticks: [0, 1, 2, 3, 4], fmt: (v) => `${v % 1 ? v.toFixed(1) : v}×`
  })}
  ${benchmarkAxisCompact({
    id: "velocity", title: "Velocity", sub: "pace of deals through the pipeline",
    domainMax: 20, ticks: [0, 5, 10, 15, 20], fmt: (v) => `${v % 1 ? v.toFixed(1) : v}%`
  })}
  </div>
  <p class="bxs-cap"><span class="bxs-key"></span>hollow = the historical benchmark, the same fiscal quarter averaged over the prior two years · both measures are non-additive, so the Analytics roll-up has neither</p>
  </div>`;
}

/* Band 3 right. A's deals-against-gap bar, trimmed to the shorter band. */
function dealsShareOfGapH() {
  let acc = 0;
  const segs = DEALS.deals.map((d, i) => {
    const left = (acc / GAP) * 100;
    acc += d.value;
    return `<div class="dg-seg" style="left:${left.toFixed(2)}%;width:${((d.value / GAP) * 100).toFixed(2)}%;--d:${i}"><span>${d.display}</span></div>`;
  }).join("");
  return `<div class="dg dg-h">
    <div class="dg-headline">
      <p class="dg-total">$12.5M</p>
      <p class="dg-claim">${pct(DEALS_SHARE)} of the ${money(GAP)} gap <em>derived</em></p>
    </div>
    <div class="dg-track">
      <div class="dg-fill">${segs}</div>
      <div class="dg-residual" style="left:${((DEALS_TOTAL / GAP) * 100).toFixed(2)}%"><span>${money(GAP_RESIDUAL)}</span></div>
      <div class="dg-end"></div>
    </div>
    <ol class="dg-list">${DEALS.deals.map((d, i) => `<li><span class="dg-rank" style="--d:${i}"></span><span class="dg-acct">${d.account}</span><span class="dg-val">${d.display}</span></li>`).join("")}</ol>
  </div>`;
}

const HYBRID = {
  file: "hybrid-gap-and-benchmark.html",
  title: "Q3 Outlook — Hybrid · gap to plan, with the benchmark axis promoted",
  bands: `
${portlet({
    label: "Q3 outlook against plan", sub: "Commit, derived plan and the gap on one dollar scale, with the other two measures year over year",
    accent: "#92640A", tier: "red", cls: "band-h1", body: planMatrixH()
  })}
<div class="band-h2">
${portlet({
    label: "Pipeline sufficiency by motion", sub: "Coverage and velocity against their historical benchmarks",
    accent: "#1C6E8C", tier: "green", cls: "p-bench", body: benchmarkStrip()
  })}
${portlet({
    label: "Q3 top ACV deals", sub: "Five largest open opportunities",
    accent: "#1C6E8C", tier: "yellow", cls: "p-deals", body: dealsShareOfGapH()
  })}
</div>`
};

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
body.direct-mode{
  --ink-hero:#43464e;--ink:#4a4d55;--ink-soft:#7b7f88;--ink-dim:#a0a4ac;
  --surface:#eceae6;--surface-raised:rgba(252,252,250,.82);--surface-solid:#f9f9f7;
  --line:rgba(23,24,28,.1);--line-strong:rgba(23,24,28,.16);
  --accent:#8b8f98;--tab-accent:#8b8f98;--pos:#8b8f89;--warn:#9a917c;--neg:#a3837c;
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
body.direct-mode::before{opacity:.3;filter:grayscale(1)}
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
.mode-switch-btn{padding:5px 12px;border-radius:999px;background:color-mix(in srgb,var(--ink) 5%,transparent);color:var(--ink-dim);font-size:11.5px;font-weight:500}
body.direct-mode .mode-switch{border-color:color-mix(in srgb,var(--tier-red) 45%,var(--line-strong))}
body.direct-mode .mode-switch-state{color:var(--tier-red)}
body.direct-mode .trust-legend-dot{background:var(--tier-red);box-shadow:0 0 0 3px color-mix(in srgb,var(--tier-red) 22%,transparent)}

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
.panel-bands{flex:1;min-height:0;display:grid;gap:var(--gap)}

/* ---- portlet card ---- */
.portlet{position:relative;min-width:0;min-height:0}
.pf{position:absolute;inset:0;display:flex;flex-direction:column;gap:8px;padding:clamp(9px,.95vw,14px);
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
.trust-dot::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--tier-color);
  box-shadow:0 0 0 2.5px color-mix(in srgb,var(--tier-color) 16%,transparent)}
.portlet[data-tier="green"]{--tier-color:var(--tier-green)}
.portlet[data-tier="yellow"]{--tier-color:var(--tier-yellow)}
.portlet[data-tier="red"]{--tier-color:var(--tier-red)}
.portlet[data-tier="grey"]{--tier-color:var(--tier-grey)}
.portlet[data-tier="red"] .trust-dot::after,.portlet[data-tier="grey"] .trust-dot::after{
  content:"\2715";position:absolute;inset:auto -5px -6px auto;width:11px;height:11px;display:grid;place-items:center;
  border-radius:50%;background:var(--tier-color);color:var(--on-tier);font-size:7.5px;font-weight:800;line-height:1}
.portlet-body{flex:1;min-height:0;display:flex;flex-direction:column}

/* ---- shared marks ---- */
.rail{grid-column:1;grid-row:var(--rail-rows,2/span 3);display:block;width:100%;height:100%;align-self:stretch}
.stub{display:block;width:100%;max-width:var(--mark,132px);height:auto}
.dumb{display:block;flex:none;width:var(--dumb-w,96px);height:auto}

/* ======================= ALTERNATIVE A ======================= */
.panel-bands.alt-a{grid-template-rows:minmax(0,1.02fr) minmax(0,1fr)}
.band-a2{display:grid;gap:var(--gap);grid-template-columns:minmax(0,1.4fr) minmax(292px,1fr)}
.pl{flex:1;min-height:0;display:flex;flex-direction:column;
  --tmpl:26px clamp(144px,14.2vw,186px) minmax(0,1fr) clamp(110px,10.9vw,140px) clamp(200px,20.4vw,268px)}
.pl-head,.pl-axisrow{display:grid;grid-template-columns:var(--tmpl);gap:clamp(6px,.8vw,12px);align-items:end}
.pl-head{margin-bottom:4px}
.pl-colhead{margin:0;font-size:clamp(8px,.62vw,9.5px);font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--ink-dim)}
.pl-rows{flex:1;min-height:0;display:grid;grid-template-columns:var(--tmpl);
  grid-template-rows:repeat(3,minmax(0,1fr));row-gap:0;column-gap:clamp(6px,.8vw,12px)}
.pl-rows>.rail{grid-column:1;grid-row:1/span 3}
.pl-c{grid-row:var(--r);min-width:0;align-self:stretch;display:flex;flex-direction:column;justify-content:center;
  padding:clamp(4px,.8vh,10px) 0}
.pl-c.has-rule{border-top:1px solid var(--line)}
.pl-label{grid-column:2;gap:1px}
.pl-label[data-level="0"] .pl-name{font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--accent);font-size:clamp(9.5px,.74vw,11px)}
.pl-name{margin:0;font-size:clamp(9.5px,.78vw,11.5px);font-weight:600;line-height:1.2;color:var(--ink)}
.pl-sub{margin:1px 0 0;font-size:clamp(8.5px,.62vw,9.5px);font-weight:500;color:var(--ink-dim);line-height:1.2}
.pl-plot{grid-column:3;position:relative;display:block!important;height:auto;padding:0}
.pl-plot::after{content:"";display:block;height:38px}
.pl-grid{position:absolute;left:0;right:0;top:14px;bottom:2px;background-image:repeating-linear-gradient(90deg,color-mix(in srgb,var(--ink) 9%,transparent) 0 1px,transparent 1px 20%)}
.pl-bar{position:absolute;left:0;top:16px;height:20px;border-radius:2px}
.pl-gap{position:absolute;top:16px;height:20px;
  background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--gap-tone) 40%,transparent) 0 2px,transparent 2px 5px);
  border-top:1px solid color-mix(in srgb,var(--gap-tone) 46%,transparent);
  border-bottom:1px solid color-mix(in srgb,var(--gap-tone) 46%,transparent)}
.pl-tick{position:absolute;top:12px;bottom:0;width:2px;background:var(--ink-hero);border-radius:1px}
.pl-ticklabel{position:absolute;top:0;margin-left:5px;font-size:8.5px;font-weight:700;
  color:var(--ink-soft);white-space:nowrap}
.pl-ticklabel[data-flip="true"]{margin-left:0;transform:translateX(-100%);padding-right:5px}
.pl-ticklabel em{font-style:normal;color:var(--ink-dim);font-weight:500;margin-left:4px;
  font-size:7.5px;letter-spacing:.07em;text-transform:uppercase}
.pl-read{grid-column:4}
.pl-value{margin:0;font-family:var(--font-display);font-size:clamp(17px,1.5vw,23px);font-weight:600;
  letter-spacing:-.03em;line-height:1.16;color:var(--ink-hero);white-space:nowrap}
.pl-plan{margin:1px 0 0;font-size:clamp(8.5px,.62vw,9.5px);font-weight:700;line-height:1.24;white-space:nowrap}
.pl-gapline{margin:0;font-size:clamp(8.5px,.62vw,9.5px);font-weight:700;line-height:1.28;white-space:nowrap}
.pl-gapline em{font-style:normal;color:var(--ink-dim);font-weight:500;font-size:7.5px;letter-spacing:.07em;text-transform:uppercase;margin-left:4px}
.pl-side{grid-column:5;gap:4px}
.pl-alt{margin:0;font-size:clamp(8.5px,.64vw,10px);font-weight:500;color:var(--ink-soft);line-height:1.36}
.pl-alt b{font-weight:700;color:var(--ink)}
.pl-alt span{color:var(--ink-dim);font-size:8px}
.pl-pair{display:flex;align-items:center;gap:6px;min-width:0}
.pl-pairlab{font-size:8px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-dim);width:38px;flex:none}
.pl-pair .dumb{--dumb-w:clamp(78px,8vw,108px)}
.pl-pairval{font-size:9.5px;font-weight:700;color:var(--ink);white-space:nowrap}
.pl-pairval em{font-style:normal;font-weight:500;color:var(--ink-dim);margin-left:4px;font-size:8.5px}
.pl-axisrow{margin-top:3px}
.pl-axis{grid-column:3;position:relative;height:12px}
.pl-axtick{position:absolute;transform:translateX(-50%);font-size:8.5px;font-weight:600;color:var(--ink-dim)}
.pl-axtick:first-child{transform:none}
.pl-axtick:last-child{transform:translateX(-100%)}
.pl-cap{margin:3px 0 0;font-size:clamp(8px,.62vw,9.5px);color:var(--ink-dim);line-height:1.3}

/* deals as share of gap */
.dg{flex:1;min-height:0;display:flex;flex-direction:column}
.dg-headline{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;flex:none}
.dg-total{margin:0;font-family:var(--font-display);font-size:clamp(20px,1.8vw,27px);font-weight:600;
  letter-spacing:-.03em;line-height:1.14;color:var(--ink-hero)}
.dg-claim{margin:0;font-size:clamp(8.5px,.68vw,10px);font-weight:700;color:var(--ink-soft);line-height:1.25;flex:1 1 130px}
.dg-claim em,.dc-sub em,.dl-claim em{font-style:normal;font-weight:500;color:var(--ink-dim);font-size:7.5px;
  letter-spacing:.07em;text-transform:uppercase;margin-left:4px}
.dg-track{position:relative;height:24px;margin-top:6px;border-radius:3px;
  background:color-mix(in srgb,var(--ink) 5%,transparent);
  outline:1px dashed color-mix(in srgb,var(--ink) 30%,transparent);outline-offset:0}
.dg-fill{position:absolute;inset:0}
.dg-seg{position:absolute;top:0;bottom:0;background:color-mix(in srgb,var(--accent) calc(94% - var(--d)*13%),#ffffff);
  border-right:1.5px solid var(--surface-solid);display:grid;place-items:center}
.dg-seg span{font-size:8px;font-weight:700;color:#fff;opacity:.92}
.dg-residual{position:absolute;top:0;bottom:0;right:0;display:grid;place-items:center}
.dg-residual span{font-size:8.5px;font-weight:700;color:var(--neg)}
.dg-end{position:absolute;top:-4px;bottom:-4px;right:-1px;width:2px;background:var(--ink-hero);border-radius:1px}
.dg-scale{display:flex;justify-content:space-between;margin-top:3px;font-size:8px;font-weight:600;color:var(--ink-dim);flex:none}
.dg-scale-end{color:var(--ink-soft);font-weight:700}
.dg-list{list-style:none;margin:6px 0 0;padding:0;flex:1;min-height:0;display:flex;flex-direction:column;justify-content:space-evenly;overflow:hidden}
.dg-list li{display:flex;align-items:center;gap:7px;font-size:clamp(9px,.72vw,10.5px)}
.dg-rank{width:9px;height:9px;border-radius:2px;flex:none;background:color-mix(in srgb,var(--accent) calc(94% - var(--d)*13%),#ffffff)}
.dg-acct{flex:1;min-width:0;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dg-val{font-weight:700;color:var(--ink-soft)}
.dg-cap{margin:4px 0 0;font-size:7.5px;color:var(--ink-dim);line-height:1.34;flex:none}
.dg-track{flex:none}

/* ---- the compact Y/Y matrix (A and B) ---- */
.mx{flex:1;min-height:0;display:flex;flex-direction:column;--mark:clamp(84px,8.6vw,124px)}
.mx-grid{flex:1;min-height:0;display:grid;
  grid-template-columns:22px clamp(138px,13.4vw,178px) repeat(3,minmax(0,1fr));
  grid-template-rows:auto repeat(3,minmax(0,1fr));column-gap:clamp(5px,.7vw,11px);row-gap:0}
.mx-grid>.rail{grid-column:1;grid-row:2/span 3}
.mx-colhead{grid-column:var(--c);grid-row:1;margin:0 0 3px;font-size:clamp(8px,.62vw,9.5px);font-weight:700;
  letter-spacing:.09em;text-transform:uppercase;color:var(--ink-dim);white-space:nowrap}
.mx-label{grid-column:2;grid-row:var(--r);min-width:0;display:flex;flex-direction:column;justify-content:center;gap:1px;padding:clamp(3px,.6vh,8px) 0}
.mx-label[data-level="1"]{padding-left:9px}
.mx-cell{grid-column:var(--c);grid-row:var(--r);min-width:0;display:flex;flex-direction:column;justify-content:center;
  gap:clamp(1px,.3vh,3px);padding:clamp(2px,.45vh,7px) 0}
.mx-cell.has-rule,.mx-label.has-rule{border-top:1px solid var(--line)}
.mx-rowname{margin:0;font-size:clamp(9.5px,.75vw,11px);line-height:1.22;color:var(--ink);font-weight:600}
.mx-label[data-level="0"] .mx-rowname{font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--accent)}
.mx-rowsub{margin:0;font-size:clamp(8.5px,.62vw,9.5px);line-height:1.2;font-weight:500;color:var(--ink-dim)}
.mx-value{margin:0;font-family:var(--font-display);font-size:clamp(14px,1.22vw,20px);font-weight:600;
  letter-spacing:-.025em;line-height:1.16;color:var(--ink-hero);white-space:nowrap}
.mx-stubrow{display:grid;grid-template-columns:minmax(0,var(--mark)) max-content;align-items:center;column-gap:clamp(3px,.4vw,6px)}
.mx-chip{font-size:clamp(8.5px,.7vw,10.5px);font-weight:700;line-height:1;white-space:nowrap}
.mx-planlab{font-size:clamp(8px,.6vw,9.5px);font-weight:700;line-height:1;white-space:nowrap}
.mx-bullet{display:block;width:100%;max-width:var(--mark);height:auto}
.mx-alt{margin:0;font-size:clamp(8px,.6vw,9px);font-weight:500;line-height:1.24;color:var(--ink-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mx-foot{margin:4px 0 0;font-size:clamp(8px,.6vw,9px);color:var(--ink-dim);line-height:1.3}

/* ======================= ALTERNATIVE B ======================= */
.panel-bands.alt-b{grid-template-rows:minmax(0,1.47fr) minmax(0,1fr)}
.band-b2{display:grid;gap:var(--gap);grid-template-columns:minmax(0,1.66fr) minmax(250px,1fr)}
.suf{flex:1;min-height:0;display:flex;flex-direction:column;gap:clamp(4px,.9vh,12px)}
.ba{display:flex;flex-direction:column;flex:1;min-height:0}
.ba,.ba-row,.ba-axisrow{--balab:clamp(132px,13vw,182px);--baread:clamp(122px,11.4vw,152px)}
.ba-head{margin-bottom:3px;display:flex;align-items:baseline;gap:8px}
.ba-title{margin:0;font-size:clamp(9px,.7vw,10.5px);font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
.ba-subtitle{margin:0;font-size:clamp(8.5px,.64vw,9.5px);color:var(--ink-dim)}
.ba-row{display:grid;grid-template-columns:var(--balab) minmax(0,1fr) var(--baread);align-items:center;
  gap:clamp(8px,1vw,16px);flex:1;min-height:0;padding:clamp(2px,.5vh,7px) 0}
.ba-lab{min-width:0}
.ba-name{margin:0;font-size:clamp(9.5px,.76vw,11.5px);font-weight:700;line-height:1.2}
.ba-sub{margin:1px 0 0;font-size:clamp(8.5px,.62vw,9.5px);font-weight:500;color:var(--ink-dim);line-height:1.2}
.ba-plot{position:relative;height:32px}
.ba-line{position:absolute;left:0;right:0;top:20px;height:2px;background:color-mix(in srgb,var(--ink) 8%,transparent);border-radius:1px}
.ba-stem{position:absolute;top:18.5px;height:5px;border-radius:3px}
.ba-hist{position:absolute;top:14px;width:15px;height:15px;margin-left:-7.5px;border-radius:50%;
  background:var(--surface-solid);border:1.8px solid var(--ink-dim)}
.ba-cur{position:absolute;top:12.5px;width:18px;height:18px;margin-left:-9px;border-radius:50%;box-shadow:0 0 0 2.5px var(--surface-solid)}
.ba-cur[data-flat="true"]{top:16.5px;width:10px;height:10px;margin-left:-5px;box-shadow:none}
.ba-histlab{position:absolute;top:0;transform:translateX(-50%);font-size:8px;font-weight:600;color:var(--ink-dim);white-space:nowrap}
.ba-read{min-width:0}
.ba-val{margin:0;font-family:var(--font-display);font-size:clamp(19px,1.75vw,27px);font-weight:600;letter-spacing:-.03em;line-height:1.14}
.ba-delta{margin:0;font-size:clamp(8.5px,.65vw,10px);font-weight:600;color:var(--ink-soft);line-height:1.25}
.ba-axisrow{display:grid;grid-template-columns:var(--balab) minmax(0,1fr) var(--baread);gap:clamp(8px,1vw,16px)}
.ba-axis{position:relative;height:11px;border-top:1px solid var(--line);padding-top:1px}
.ba-tick{position:absolute;transform:translateX(-50%);font-size:8.5px;font-weight:600;color:var(--ink-dim)}
.ba-axis .ba-tick:first-child{transform:none}
.ba-axis .ba-tick:last-child{transform:translateX(-100%)}
.suf-cap{margin:0;font-size:clamp(8px,.62vw,9.5px);color:var(--ink-dim);line-height:1.34}
.suf-key{display:inline-flex;align-items:center;gap:5px}
.suf-key-hist{width:10px;height:10px;border-radius:50%;background:var(--surface-solid);border:1.6px solid var(--ink-dim);display:inline-block}

/* deals composition */
.dc{flex:1;min-height:0;display:flex;flex-direction:column}
.dc-total{margin:0;font-family:var(--font-display);font-size:clamp(20px,1.85vw,29px);font-weight:600;letter-spacing:-.03em;line-height:1.1;color:var(--ink-hero)}
.dc-sub{margin:1px 0 0;font-size:clamp(8.5px,.66vw,10px);font-weight:600;color:var(--ink-soft);line-height:1.28}
.dc-bar{position:relative;height:clamp(14px,1.9vh,20px);margin-top:clamp(4px,.9vh,9px);border-radius:3px;overflow:hidden}
.dc-seg{position:absolute;top:0;bottom:0;background:color-mix(in srgb,var(--accent) calc(94% - var(--d)*13%),#ffffff);border-right:1.5px solid var(--surface-solid)}
.dc-list{list-style:none;margin:4px 0 0;padding:0;flex:1;min-height:0;display:grid;grid-template-rows:repeat(5,minmax(0,1fr));overflow:hidden}
.dc-list li{display:flex;align-items:center;gap:7px;font-size:clamp(8.5px,.7vw,10.5px);min-height:0}
.dc-swatch{width:9px;height:9px;border-radius:2px;flex:none;background:color-mix(in srgb,var(--accent) calc(94% - var(--d)*13%),#ffffff)}
.dc-acct{flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dc-val{font-weight:700;color:var(--ink-soft)}
.dc-cap{margin:4px 0 0;font-size:clamp(8px,.6vw,9px);color:var(--ink-dim)}

/* ======================= ALTERNATIVE C ======================= */
.panel-bands.alt-c{grid-template-rows:minmax(0,1.42fr) minmax(0,1fr)}
.band-c1{display:grid;gap:var(--gap);grid-template-columns:minmax(0,1.62fr) minmax(272px,1fr)}
.dl{flex:1;min-height:0;display:flex;flex-direction:column;--dl-gutter:clamp(150px,15vw,192px);--dl-cum:clamp(52px,5vw,66px)}
.dl-lede{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-bottom:4px}
.dl-total{margin:0;font-family:var(--font-display);font-size:clamp(24px,2.3vw,34px);font-weight:600;letter-spacing:-.03em;line-height:1.14;color:var(--ink-hero)}
.dl-claim{margin:0;font-size:clamp(9.5px,.76vw,11.5px);font-weight:700;color:var(--ink-soft);line-height:1.28;max-width:60ch}
.dl-body{position:relative;flex:1;min-height:0;display:flex;flex-direction:column}
.dl-row{flex:1;min-height:0;display:grid;grid-template-columns:20px calc(var(--dl-gutter) - 20px) minmax(0,1fr) var(--dl-cum);align-items:center;gap:6px}
.dl-rank{width:15px;height:15px;border-radius:4px;border:1px solid var(--line-strong);display:grid;place-items:center;font-size:8.5px;font-weight:700;color:var(--ink-dim)}
.dl-acct{font-size:clamp(9.5px,.78vw,11.5px);font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dl-plot{position:relative;height:20px}
.dl-prior{position:absolute;left:0;top:6px;height:8px;border-radius:2px;background:color-mix(in srgb,var(--accent) 15%,transparent)}
.dl-seg{position:absolute;top:0;height:20px;border-radius:2px;display:grid;place-items:center;
  background:color-mix(in srgb,var(--accent) calc(94% - var(--d)*11%),#ffffff)}
.dl-seg span{font-size:8.5px;font-weight:700;color:#fff;opacity:.94}
.dl-cum{font-family:var(--font-display);font-size:clamp(11px,.94vw,14px);font-weight:600;color:var(--ink);text-align:right;letter-spacing:-.02em}
.dl-gapline{position:absolute;top:0;bottom:15px;width:2px;background:var(--ink-hero);z-index:2}
.dl-gaplab{position:absolute;top:-1px;right:7px;text-align:right;font-size:8.5px;font-weight:700;line-height:1.25;
  color:var(--ink-hero);white-space:nowrap;background:color-mix(in srgb,var(--surface-solid) 85%,transparent);padding:1px 3px;border-radius:3px}
.dl-gaplab em{font-style:normal;font-weight:500;color:var(--ink-dim);font-size:7.5px;letter-spacing:.07em;text-transform:uppercase}
.dl-axisrow{flex:none;display:grid;grid-template-columns:20px calc(var(--dl-gutter) - 20px) minmax(0,1fr) var(--dl-cum);gap:6px}
.dl-axis{position:relative;height:12px;border-top:1px solid var(--line);padding-top:1px}
.dl-tick{position:absolute;transform:translateX(-50%);font-size:8.5px;font-weight:600;color:var(--ink-dim)}
.dl-axis .dl-tick:first-child{transform:none}
.dl-cap{margin:4px 0 0;font-size:clamp(8px,.62vw,9.5px);color:var(--ink-dim);line-height:1.32}

.pr{flex:1;min-height:0;display:flex;flex-direction:column}
.pr-ledger{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding-bottom:6px;border-bottom:1px solid var(--line)}
.pr-ledger>div{display:flex;flex-direction:column;gap:1px}
.pr-ledger span{font-size:7.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-dim)}
.pr-ledger span em{font-style:normal;font-weight:500;opacity:.8}
.pr-ledger b{font-family:var(--font-display);font-size:clamp(13px,1.14vw,17px);font-weight:600;letter-spacing:-.025em;color:var(--ink-hero);line-height:1.16}
.pr-ledger .is-gap b{color:var(--neg)}
.pr-rows{flex:1;min-height:0;display:grid;grid-template-columns:26px minmax(0,1fr);grid-template-rows:repeat(3,minmax(0,1fr))}
.pr-rows>.rail{grid-column:1;grid-row:1/span 3}
.pr-row{grid-column:2;display:flex;flex-direction:column;justify-content:center;gap:3px;padding:clamp(3px,.6vh,8px) 0}
.pr-row+.pr-row{border-top:1px solid var(--line)}
.pr-name{margin:0;font-size:clamp(9px,.72vw,10.5px);font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pr-plot{position:relative;height:14px;margin-right:9px}
.pr-bar{position:absolute;left:0;top:3px;height:8px;border-radius:2px}
.pr-gap{position:absolute;top:3px;height:8px;background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--gap-tone) 34%,transparent) 0 2px,transparent 2px 5px);
  border-top:1px solid color-mix(in srgb,var(--gap-tone) 40%,transparent);border-bottom:1px solid color-mix(in srgb,var(--gap-tone) 40%,transparent)}
.pr-tick{position:absolute;top:0;bottom:0;width:2px;background:var(--ink-hero);border-radius:1px}
.pr-read{margin:0;display:flex;align-items:baseline;gap:7px;font-size:9.5px}
.pr-read b{font-family:var(--font-display);font-size:clamp(12px,1.05vw,15px);font-weight:600;letter-spacing:-.025em;color:var(--ink-hero)}
.pr-read span{font-weight:700}
.pr-read em{font-style:normal;font-weight:600;color:var(--ink-soft);margin-left:auto}
.pr-cap{margin:4px 0 0;font-size:clamp(8px,.6vw,9px);color:var(--ink-dim);line-height:1.3}

.ms{flex:1;min-height:0;display:flex;flex-direction:column;--mark:clamp(84px,8.6vw,124px);
  --tmpl:26px clamp(126px,13vw,178px) repeat(3,minmax(0,1fr)) clamp(196px,20vw,262px)}
.ms-head{display:grid;grid-template-columns:var(--tmpl);gap:clamp(5px,.7vw,11px);margin-bottom:3px}
.ms-colhead{grid-column:var(--c);margin:0;font-size:clamp(8px,.62vw,9.5px);font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--ink-dim);white-space:nowrap}
.ms-rows{flex:1;min-height:0;display:grid;grid-template-columns:var(--tmpl);
  grid-template-rows:repeat(3,minmax(0,1fr));column-gap:clamp(5px,.7vw,11px);row-gap:0}
.ms-rows>.rail{grid-column:1;grid-row:1/span 3}
.ms-label,.ms-cell,.ms-pairs{grid-row:var(--r);min-width:0;padding:clamp(3px,.6vh,8px) 0;
  display:flex;flex-direction:column;justify-content:center}
.ms-label.has-rule,.ms-cell.has-rule,.ms-pairs.has-rule{border-top:1px solid var(--line)}
.ms-label{grid-column:2;gap:1px}
.ms-cell{gap:2px}
.ms-pairs{grid-column:6;gap:3px}
.ms-label[data-level="1"]{padding-left:9px}
.ms-name{margin:0;font-size:clamp(9.5px,.75vw,11px);font-weight:600;line-height:1.2;color:var(--ink)}
.ms-label[data-level="0"] .ms-name{font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--accent)}
.ms-sub{margin:1px 0 0;font-size:clamp(8.5px,.62vw,9.5px);font-weight:500;color:var(--ink-dim);line-height:1.2}
.ms-value{margin:0;font-family:var(--font-display);font-size:clamp(15px,1.32vw,21px);font-weight:600;letter-spacing:-.025em;line-height:1.16;color:var(--ink-hero);white-space:nowrap}
.ms-stubrow{display:grid;grid-template-columns:minmax(0,var(--mark)) max-content;align-items:center;column-gap:5px}
.ms-chip{font-size:clamp(8.5px,.7vw,10px);font-weight:700;line-height:1;white-space:nowrap}
.ms-pair{display:flex;align-items:center;gap:6px}
.ms-pairlab{font-size:8px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-dim);width:44px;flex:none}
.ms-pair .dumb{--dumb-w:clamp(78px,8vw,110px)}
.ms-pairval{font-size:9.5px;font-weight:700;color:var(--ink);white-space:nowrap}
.ms-pairval em{font-style:normal;font-weight:500;color:var(--ink-dim);margin-left:4px;font-size:8.5px}
.ms-void{margin:0;font-size:8.5px;font-weight:500;color:var(--ink-dim);line-height:1.28;letter-spacing:.02em}
.ms-foot{margin:3px 0 0;font-size:clamp(8px,.6vw,9px);color:var(--ink-dim)}

/* ======================= HYBRID ======================= */
/* Three bands: the plan landscape, the benchmark axes, then the matrix and
 * the deals. Ratios are fr off a minmax(0,…) grid so the content-height
 * floor holds rather than pushing a scrollbar. */
.panel-bands.alt-hybrid{grid-template-rows:minmax(0,1.42fr) minmax(0,1fr)}
.band-h2{display:grid;gap:var(--gap);grid-template-columns:minmax(0,1fr) minmax(268px,.42fr)}

/* band 1 — the plan landscape and the two remaining Y/Y columns, one grid */
.ph{flex:1;min-height:0;display:flex;flex-direction:column;
  --tmpl:24px clamp(142px,13.8vw,188px) minmax(0,1fr) clamp(126px,12.2vw,158px) repeat(2,clamp(126px,12.6vw,168px))}
.ph-head,.ph-axisrow{display:grid;grid-template-columns:var(--tmpl);gap:clamp(6px,.8vw,12px);align-items:end}
.ph-head{margin-bottom:3px}
.ph-colhead{grid-column:var(--c,auto);margin:0;font-size:clamp(8px,.62vw,9.5px);font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--ink-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ph-rows{flex:1;min-height:0;display:grid;grid-template-columns:var(--tmpl);
  grid-template-rows:repeat(3,minmax(0,1fr));row-gap:0;column-gap:clamp(6px,.8vw,12px)}
.ph-rows>.rail{grid-column:1;grid-row:1/span 3}
.ph-c{grid-row:var(--r);min-width:0;align-self:stretch;display:flex;flex-direction:column;justify-content:center;
  padding:clamp(3px,.65vh,9px) 0}
.ph-c.has-rule{border-top:1px solid var(--line)}
.ph-label{grid-column:2;gap:1px}
.ph-cell{grid-column:var(--c);gap:2px}
.ph-cellval{margin:0;font-family:var(--font-display);font-size:clamp(14px,1.24vw,20px);font-weight:600;
  letter-spacing:-.025em;line-height:1.16;color:var(--ink-hero);white-space:nowrap}
.ph-stubrow{display:grid;grid-template-columns:minmax(0,clamp(72px,7.4vw,104px)) max-content;align-items:center;column-gap:clamp(3px,.42vw,6px)}
.ph-chip{font-size:clamp(8.5px,.68vw,10px);font-weight:700;line-height:1;white-space:nowrap}
.ph-label[data-level="1"]{padding-left:9px}
.ph-label[data-level="0"] .ph-name{font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--accent);font-size:clamp(9.5px,.74vw,11px)}
.ph-name{margin:0;font-size:clamp(9.5px,.78vw,11.5px);font-weight:600;line-height:1.2;color:var(--ink)}
.ph-sub{margin:1px 0 0;font-size:clamp(8.5px,.62vw,9.5px);font-weight:500;color:var(--ink-dim);line-height:1.2}
.ph-plot{grid-column:3;position:relative;display:block!important;height:auto;padding:0}
.ph-plot::after{content:"";display:block;height:36px}
.ph-grid{position:absolute;left:0;right:0;top:14px;bottom:2px;
  background-image:repeating-linear-gradient(90deg,color-mix(in srgb,var(--ink) 9%,transparent) 0 1px,transparent 1px 20%)}
.ph-bar{position:absolute;left:0;top:16px;height:20px;border-radius:2px}
.ph-gap{position:absolute;top:16px;height:20px;
  background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--gap-tone) 32%,transparent) 0 2.5px,transparent 2.5px 6px);
  border-top:1px solid color-mix(in srgb,var(--gap-tone) 38%,transparent);
  border-bottom:1px solid color-mix(in srgb,var(--gap-tone) 38%,transparent)}
.ph-tick{position:absolute;top:12px;bottom:0;width:2px;background:var(--ink-hero);border-radius:1px}
.ph-ticklabel{position:absolute;top:0;margin-left:5px;font-size:8.5px;font-weight:700;
  color:var(--ink-hero);white-space:nowrap;line-height:1.1}
.ph-ticklabel[data-flip="true"]{margin-left:0;transform:translateX(-100%);padding-right:5px}
.ph-ticklabel em{font-style:normal;color:var(--ink-dim);font-weight:500;margin-left:4px;
  font-size:7.5px;letter-spacing:.07em;text-transform:uppercase}
.ph-alt2{position:absolute;top:19.5px;width:13px;height:13px;margin-left:-6.5px;display:block;overflow:visible}
.ph-read{grid-column:4;gap:1px}
.ph-value{margin:0;font-family:var(--font-display);font-size:clamp(16px,1.44vw,23px);font-weight:600;
  letter-spacing:-.03em;line-height:var(--lh-display-num);color:var(--ink-hero);white-space:nowrap}
.ph-value span{font-family:var(--font-body);font-size:clamp(8.5px,.64vw,10px);font-weight:700;letter-spacing:0;margin-left:5px}
.ph-plan{margin:0;font-size:clamp(8.5px,.64vw,10px);font-weight:700;line-height:1.24;white-space:nowrap}
.ph-gapline{margin:0;font-size:clamp(8.5px,.64vw,10px);font-weight:700;line-height:1.24;white-space:nowrap}
.ph-gapline em{font-style:normal;color:var(--ink-dim);font-weight:500;font-size:7.5px;letter-spacing:.07em;text-transform:uppercase;margin-left:4px}
.ph-axisrow{margin-top:2px}
.ph-axis{grid-column:3;position:relative;height:12px}
.ph-axtick{position:absolute;transform:translateX(-50%);font-size:8.5px;font-weight:600;color:var(--ink-dim)}
.ph-axtick:first-child{transform:none}
.ph-axtick:last-child{transform:translateX(-100%)}
.ph-axnote{grid-column:5/span 2;font-size:clamp(7.5px,.58vw,9px);color:var(--ink-dim);line-height:1.2;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* the alternate basis, at a size somebody can read, each tied to its mark */
.ph-alt{margin:5px 0 0;display:flex;align-items:center;flex-wrap:wrap;column-gap:clamp(9px,1.2vw,20px);row-gap:1px;
  padding-top:5px;border-top:1px solid var(--line);
  font-size:clamp(9px,.7vw,10.5px);color:var(--ink-soft);line-height:1.3}
.ph-alt>b{font-weight:700;color:var(--ink-dim);font-size:clamp(8px,.6vw,9px);letter-spacing:.08em;text-transform:uppercase}
.ph-alt>span{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.ph-alt span b{font-weight:700;color:var(--ink)}
.ph-alt-dia{width:9px;height:9px;flex:none;transform:rotate(45deg);border:1.6px solid var(--ink-dim);background:var(--surface)}
.ph-alt-tick{width:2px;height:11px;flex:none;background:repeating-linear-gradient(180deg,var(--line-strong) 0 2px,transparent 2px 4px)}
.ph-alt>em{font-style:normal;margin-left:auto;font-size:clamp(8px,.6vw,9px);color:var(--ink-dim)}

/* band 2 — the benchmark axes, side by side */
.bxs{flex:1;min-height:0;display:flex;flex-direction:column;gap:3px}
.bxs-pair{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2.2vw,38px)}
.bx{min-width:0;display:grid;align-items:center;
  grid-template-columns:clamp(84px,8.4vw,116px) minmax(0,1fr) clamp(46px,4.9vw,66px);
  grid-template-rows:auto minmax(0,1fr) minmax(0,1fr) auto;column-gap:clamp(5px,.7vw,11px)}
.bx-head{grid-column:1/-1;display:flex;align-items:baseline;gap:7px;min-width:0}
.bx-title{margin:0;font-size:clamp(8.5px,.66vw,10px);font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);white-space:nowrap}
.bx-sub{margin:0;font-size:clamp(8px,.6vw,9px);color:var(--ink-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bx-name{margin:0;grid-column:1;font-size:clamp(9px,.72vw,10.5px);font-weight:700;line-height:1.18}
.bx-plot{grid-column:2;position:relative;height:30px}
.bx-line{position:absolute;left:0;right:0;top:19px;height:2px;border-radius:1px;background:color-mix(in srgb,var(--ink) 8%,transparent)}
.bx-stem{position:absolute;top:17.5px;height:5px;border-radius:3px}
.bx-hist{position:absolute;top:13.5px;width:13px;height:13px;margin-left:-6.5px;border-radius:50%;
  background:var(--surface-solid);border:1.7px solid var(--ink-dim)}
.bx-cur{position:absolute;top:12px;width:16px;height:16px;margin-left:-8px;border-radius:50%;box-shadow:0 0 0 2.5px var(--surface-solid)}
.bx-cur[data-flat="true"]{top:15.5px;width:9px;height:9px;margin-left:-4.5px;box-shadow:none}
.bx-histlab{position:absolute;top:0;transform:translateX(-50%);font-size:8px;font-weight:600;color:var(--ink-dim);white-space:nowrap}
.bx-read{grid-column:3;min-width:0;text-align:right}
.bx-val{margin:0;font-family:var(--font-display);font-size:clamp(17px,1.6vw,25px);font-weight:600;letter-spacing:-.03em;line-height:1.12}
.bx-delta{margin:0;font-size:clamp(8px,.62vw,9.5px);font-weight:600;color:var(--ink-soft);line-height:1.2}
.bx-axis{grid-column:2;position:relative;height:11px;border-top:1px solid var(--line);padding-top:1px}
.bx-tick{position:absolute;transform:translateX(-50%);font-size:8px;font-weight:600;color:var(--ink-dim)}
.bx-axis .bx-tick:first-child{transform:none}
.bx-axis .bx-tick:last-child{transform:translateX(-100%)}
.bxs-cap{margin:0;flex:none;display:flex;align-items:center;gap:5px;font-size:clamp(8px,.62vw,9.5px);color:var(--ink-dim);line-height:1.3}
.bxs-key{width:10px;height:10px;flex:none;border-radius:50%;background:var(--surface-solid);border:1.7px solid var(--ink-dim)}

/* band 3 right — the deals bar, one row shorter than Alternative A's */
.dg-h .dg-total{font-size:clamp(19px,1.7vw,26px)}
.dg-h .dg-track{height:clamp(18px,2.6vh,24px);margin-top:5px}
.dg-h .dg-list{margin-top:4px;display:grid;grid-template-rows:repeat(5,minmax(0,1fr))}
.dg-h .dg-list li{min-height:0}
`;

/* ========================================================================== */

function page(alt, key) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${alt.title}</title>
<style>${CSS}</style>
</head>
<body>
<div class="app">
${topbar()}
<main class="stage">
  <div class="panel">
${panelHead()}
    <div class="panel-bands alt-${key}">${alt.bands}
    </div>
  </div>
</main>
</div>
</body>
</html>
`;
}

const OUT = [["a", ALT_A], ["b", ALT_B], ["c", ALT_C], ["hybrid", HYBRID]];
for (const [key, alt] of OUT) {
  writeFileSync(join(HERE, alt.file), page(alt, key), "utf8");
  console.log("wrote", alt.file);
}

/* The recommended alternative, rendered degraded, so the Governed/Direct
 * contract can be judged rather than described. */
writeFileSync(
  join(HERE, "alt-a-gap-to-plan-direct.html"),
  page(ALT_A, "a").replace('<body>', '<body class="direct-mode">'),
  "utf8"
);
console.log("wrote alt-a-gap-to-plan-direct.html");

writeFileSync(
  join(HERE, "hybrid-gap-and-benchmark-direct.html"),
  page(HYBRID, "hybrid").replace('<body>', '<body class="direct-mode">'),
  "utf8"
);
console.log("wrote hybrid-gap-and-benchmark-direct.html");

console.log("\nderived, exact:");
console.log("  analytics plan", DERIVED.analytics.plan, "gap", DERIVED.analytics.gap);
console.log("  platform  plan", DERIVED.platform.plan, "gap", DERIVED.platform.gap);
console.log("  embedded  plan", DERIVED.embedded.plan, "gap", DERIVED.embedded.gap);
console.log("  deals total", DEALS_TOTAL, "share of gap", DEALS_SHARE, "residual", GAP_RESIDUAL);
console.log("  child plans sum", DERIVED.platform.plan + DERIVED.embedded.plan, "vs analytics", DERIVED.analytics.plan);
console.log("  nnaov children sum", ROWS[1].nnaov.value + ROWS[2].nnaov.value, "vs analytics", ROWS[0].nnaov.value);
