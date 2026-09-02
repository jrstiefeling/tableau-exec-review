/* PLACEHOLDER — the real growthSpread renderer replaces this file wholesale. */
import { fadeIn, veil } from "../anim.js";

export function mount(host, ctx) {
  const el = document.createElement("p");
  el.className = "chart-placeholder";
  el.textContent = "growthSpread pending";
  host.appendChild(el);
  const curtain = veil([el]);
  curtain.hide();
  return {
    build: async (signal) => { fadeIn(el, { signal }); },
    prime: curtain.hide,
    settle: curtain.settle
  };
}
