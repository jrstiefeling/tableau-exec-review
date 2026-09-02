/* A single figure with its movement — used where a metric has no plan to be
 * measured against and a gauge ring would imply one that does not exist. */

import { toneOf, toneColor, tierMeta } from "../palette.js";
import { countUp, scramble, fadeIn, wait, veil } from "../anim.js";

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const meta = tierMeta(tier);
  const tint = isDirect ? meta.color : toneColor(toneOf(metrics.yoy, metrics.goodDirection || "up"));

  const wrap = document.createElement("div");
  wrap.className = "stat";

  const value = document.createElement("div");
  value.className = "stat-value";
  wrap.appendChild(value);

  const yoy = document.createElement("span");
  yoy.className = "delta";
  yoy.style.setProperty("--delta-tint", tint);
  yoy.textContent = metrics.yoyDisplay || "";
  wrap.appendChild(yoy);

  const bar = document.createElement("div");
  bar.className = "delta-bar";
  const barFill = document.createElement("span");
  barFill.className = "delta-bar-fill";
  const yoyValue = Number(metrics.yoy) || 0;
  barFill.dataset.dir = yoyValue < 0 ? "neg" : "pos";
  barFill.style.setProperty("--delta-tint", tint);
  barFill.style.setProperty("--delta-width", `${Math.min(Math.abs(yoyValue), 100)}%`);
  bar.appendChild(barFill);
  wrap.appendChild(bar);

  const caption = document.createElement("p");
  caption.className = "stat-caption";
  caption.textContent = metrics.caption || "";
  wrap.appendChild(caption);

  let footnote = null;
  if (metrics.footnote) {
    footnote = document.createElement("p");
    footnote.className = "stat-footnote";
    footnote.textContent = metrics.footnote;
    wrap.appendChild(footnote);
  }

  host.appendChild(wrap);

  const curtain = veil([value, yoy, bar, caption, footnote]);
  curtain.hide();

  async function build(signal) {
    const display = metrics.display || "";
    const candidates = isDirect ? (ctx.portlet.directMode || {}).candidates : null;

    fadeIn(value, { duration: 460, y: 10, signal });
    if (candidates && candidates.length > 1) {
      scramble(value, candidates, display, { delay: 140, signal });
    } else {
      countUp(value, display, { delay: 140, duration: 980, signal });
    }

    await wait(300, signal);
    fadeIn(yoy, { duration: 420, y: 6, signal });
    fadeIn(bar, { delay: 90, duration: 420, y: 4, signal });
    fadeIn(caption, { delay: 200, duration: 460, y: 6, signal });
    if (footnote) fadeIn(footnote, { delay: 320, duration: 460, y: 6, signal });

    await wait(480, signal);
    bar.classList.add("is-live");
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
