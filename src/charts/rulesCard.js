/* The rules this tab applies to every panel on it.
 *
 * Comparability, scaling, polarity and colour thresholds are usually
 * invisible decisions taken by whoever built the chart. Stating them as a
 * portlet makes the point that they are properties of the measures rather
 * than of this particular rendering — which is why they survive into every
 * other chart, export and agent that reads the same measures, and why they
 * are the first thing to disappear without a semantic layer. */

import { tierMeta } from "../palette.js";
import { fadeIn, wait } from "../anim.js";

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const meta = tierMeta(tier);

  const list = document.createElement("ul");
  list.className = "rules";
  const items = [];

  (metrics.rules || []).forEach((rule) => {
    const li = document.createElement("li");
    li.className = "rule";
    li.style.setProperty("--card-accent", isDirect ? meta.color : ctx.accent);

    const title = document.createElement("p");
    title.className = "rule-title";
    title.textContent = rule.title;

    const body = document.createElement("p");
    body.className = "rule-body";
    body.textContent = rule.body;

    li.appendChild(title);
    li.appendChild(body);
    list.appendChild(li);
    items.push(li);
  });

  host.appendChild(list);

  async function build(signal) {
    for (let i = 0; i < items.length; i += 1) {
      fadeIn(items[i], { duration: 420, y: 10, signal });
      const cancelled = await wait(88, signal);
      if (cancelled) return;
    }
  }

  return { build };
}
