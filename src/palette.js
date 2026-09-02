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

/* Direct-only mode drains rather than inverts. Losing colour is the point:
 * a board with no semantic layer still renders, it just stops telling you
 * which way is good. On paper that reads as newsprint — everything still
 * legible, nothing still meaningful. */
const DRAINED = {
  ink: "#4A4D55",
  inkSoft: "#7B7F88",
  inkDim: "#A0A4AC",
  grid: "rgba(23, 24, 28, 0.05)",
  axis: "rgba(23, 24, 28, 0.15)",
  track: "rgba(23, 24, 28, 0.07)",
  ghost: "rgba(23, 24, 28, 0.17)",
  surface: "#F9F9F7",
  positive: "#8B8F89",
  warn: "#9A917C",
  risk: "#A3837C",
  neutral: "#9A9EA6"
};

/* Trust tiers, shared with the sibling app's vocabulary:
 *   green  — governed, resolves to a certified semantic definition
 *   yellow — available but ungoverned; works, fails quietly
 *   red    — unavailable or wrong; competing values with no arbiter
 *   grey   — reconstructable only by hand, differently every time
 * Red and grey earn a hard X mark. Yellow never does: it means "workable,
 * just ungoverned", and marking it the same as "gone" would flatten the
 * distinction the whole tier system exists to draw. */
export const TIERS = {
  green: { color: "#12806A", label: "Governed", short: "Governed", x: false },
  yellow: { color: "#92640A", label: "Ungoverned but available", short: "Ungoverned", x: false },
  red: { color: "#C0483C", label: "Unavailable or contested", short: "Contested", x: true },
  grey: { color: "#8D93A1", label: "Requires manual reconstruction", short: "Reconstruct", x: true }
};

export function isDirect() {
  return document.body.classList.contains("direct-mode");
}

export function palette() {
  return isDirect() ? DRAINED : TRUSTED;
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

/* Plan attainment carries its own polarity. For attrition, where the
 * certified measure declares lower-is-better, 104% of plan is over-plan
 * churn and reads as a miss — without anyone remembering to colour that
 * cell by hand. */
export function planTone(plan, goodDirection = "up") {
  if (plan === null || plan === undefined) return "neutral";
  if (goodDirection === "down") {
    if (plan <= 100) return "positive";
    return plan <= 110 ? "warn" : "risk";
  }
  if (plan >= 100) return "positive";
  return plan >= 85 ? "warn" : "risk";
}

export function toneColor(tone) {
  const p = palette();
  return p[tone] || p.neutral;
}
