/* PLACEHOLDER — the real growthMatrix renderer replaces this file wholesale. */
import { fadeIn, veil } from "../anim.js";

export function mount(host, ctx) {
  const el = document.createElement("p");
  el.className = "chart-placeholder";
  el.textContent = "growthMatrix pending";
  host.appendChild(el);
  const curtain = veil([el]);
  curtain.hide();
  return {
    build: async (signal) => { fadeIn(el, { signal }); },
    prime: curtain.hide,
    settle: curtain.settle
  };
}
