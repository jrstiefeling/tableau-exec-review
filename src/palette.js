/* Chart colours, resolved at render time rather than baked into CSS.
 *
 * The sibling scrollytelling app painted literal hex values as SVG
 * presentation attributes and then needed a parallel CSS repaint pass, keyed
 * on those exact hex strings, to make dark mode legible — two lists that had
 * to be kept in sync by hand. Here every chart asks palette() for its colours
 * as it draws, and the Knowledge Layer toggle rebuilds charts anyway, so the
 * drained palette arrives through the same path as the normal one. */

const TRUSTED = {
  ink: "#17181C",
  inkSoft: "#565A63",
  inkDim: "#696D78",
  grid: "rgba(23, 24, 28, 0.07)",
  axis: "rgba(23, 24, 28, 0.22)",
  track: "rgba(23, 24, 28, 0.09)",
  ghost: "rgba(23, 24, 28, 0.26)",
  surface: "#FFFFFF",
  positive: "#12806A",
  warn: "#92640A",
  risk: "#C0483C",
  neutral: "#78808E"
};

/* There is no second palette, and the absence is the argument.
 *
 * Direct mode used to drain: greyed ink, muted sentiment, dashed rails. That
 * made the case honestly but backwards, because it told the viewer which
 * figures to distrust. A real agent reading raw Salesforce or a lakehouse
 * does not hand back faded numbers. It hands back confident ones, in range,
 * formatted correctly, and wrong — and the board cannot know, because the
 * board is not what discovered the error.
 *
 * So the degraded board renders at FULL confidence, in the same colours, with
 * the same sentiment logic. What differs is the figures, computed from the
 * governed ones through a documented failure mode, with the arithmetic in
 * `shownFrom`. The only visible tell is a 15px dot in each portlet head.
 *
 * That is the whole point: a wrong answer looks exactly like a right one.
 * If you want to know which is which, you have to ask the layer. */

/* Provenance, carried by the trust dot. Four states — three a FIGURE can
 * occupy, plus narrative, which is the absence of a figure rather than a
 * fourth kind of one:
 *
 *   certified     a governed measure from one of the two SDMs, with its
 *                 declared grain, mandatory filters and additivity class
 *   supplemented  a real, human-authored figure from OUTSIDE the layer — a
 *                 Google Sheet, a direct query, a Snowflake table. A
 *                 definition exists and a person stands behind it. Nothing
 *                 enforces it, nothing versions it, and nothing guarantees it
 *                 aggregates or means the same thing next quarter
 *   inferred      an agent read raw schema and decided for itself what the
 *                 measure means. Confident, plausible, unverifiable. Only
 *                 ever reached in Direct to source
 *   narrative     no figure. Prose from the source deck. Cannot be
 *                 numerically wrong
 *
 * NOTHING carries an X any more. `inferred` least of all: a strike-through is
 * the visual opposite of confidence, and confidence is exactly what an
 * inferred figure has. The X was the drain in miniature. */
export const TIERS = {
  green: { color: "#12806A", label: "Certified measure", short: "Certified", x: false },
  yellow: { color: "#92640A", label: "Supplemented source", short: "Supplemented", x: false },
  red: { color: "#C0483C", label: "Inferred by the agent", short: "Inferred", x: false },
  grey: { color: "#8D93A1", label: "Authored narrative", short: "Narrative", x: false }
};

export function isDirect() {
  return document.body.classList.contains("direct-mode");
}

export function palette() {
  return TRUSTED;
}

export function tierMeta(tier) {
  return TIERS[tier] || TIERS.yellow;
}

export function tierColor(tier) {
  return tierMeta(tier).color;
}

/* Sentiment, kept orthogonal to trust. A number is good or bad because of
 * what it measures and which way is better — never because of how governed
 * it is. Charts apply sentiment first and trust second, so a contested value
 * reads as contested even when the underlying movement is favourable.
 *
 * The neutral band is a stated threshold rather than a per-cell colour
 * choice, which is exactly the part a deck cannot carry: on a slide, amber
 * is whatever the author picked that morning. */
export function toneOf(value, goodDirection = "up", opts = {}) {
  const { softBand = 10 } = opts;
  if (value === null || value === undefined || Number.isNaN(value)) return "neutral";
  if (value === 0) return "neutral";
  const good = goodDirection === "down" ? value < 0 : value > 0;
  if (good) return "positive";
  return Math.abs(value) < softBand ? "warn" : "risk";
}

/* The attainment thresholds, in one place. planTone() rules on them and
 * planBands() draws them, so a chart's band geometry and its colour cannot
 * drift apart the first time somebody tunes one of the numbers. */
const PLAN_THRESHOLDS = { up: { risk: 85, target: 100 }, down: { target: 100, warn: 110 } };

/* The domain the attainment track is drawn on. 110 rather than 120: the four
 * authored values are 15, 70, 79 and 104, so nothing sits above 110, and the
 * ten points of headroom a 120 domain would spend on the one band only
 * attrition uses cost real resolution at 1024 on the 15-vs-70-vs-79 read —
 * which is the comparison the shared scale exists to serve. The cost is that
 * down-polarity's risk band has zero width; polarity is carried by the
 * good-direction arrows rather than by the bands, so that is affordable. */
const DOMAIN_MAX = 110;

export const PLAN_DOMAIN = [0, DOMAIN_MAX];

/* Plan attainment carries its own polarity. For attrition, where the
 * certified measure declares lower-is-better, 104% of plan is over-plan
 * churn and reads as a miss — without anyone remembering to colour that
 * cell by hand. */
export function planTone(plan, goodDirection = "up") {
  if (plan === null || plan === undefined) return "neutral";
  const t = PLAN_THRESHOLDS;
  if (goodDirection === "down") {
    if (plan <= t.down.target) return "positive";
    return plan <= t.down.warn ? "warn" : "risk";
  }
  if (plan >= t.up.target) return "positive";
  return plan >= t.up.risk ? "warn" : "risk";
}

/* The three qualitative regions, mirrored by polarity. Same constants
 * planTone() rules on. Zero-width regions are returned rather than dropped,
 * so a caller can see that a band exists in the rule and has no room on this
 * domain — every caller skips them when drawing. */
export function planBands(goodDirection = "up") {
  const t = PLAN_THRESHOLDS;
  if (goodDirection === "down") {
    return [
      { from: 0, to: t.down.target, tone: "positive" },
      { from: t.down.target, to: Math.min(t.down.warn, DOMAIN_MAX), tone: "warn" },
      { from: Math.min(t.down.warn, DOMAIN_MAX), to: DOMAIN_MAX, tone: "risk" }
    ];
  }
  return [
    { from: 0, to: t.up.risk, tone: "risk" },
    { from: t.up.risk, to: t.up.target, tone: "warn" },
    { from: t.up.target, to: DOMAIN_MAX, tone: "positive" }
  ];
}

export function toneColor(tone) {
  const p = palette();
  return p[tone] || p.neutral;
}
