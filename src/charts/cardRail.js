/* Numbered narrative cards, each tagged to the measure it claims to move.
 *
 * A qualitative win is only reviewable if it points at a number. The tag chip
 * on each card is that pointer: hovering it lights the metric portlet the
 * claim rests on, so an unsupported claim is visible as a card with nothing
 * to light. Without the semantic layer the tags are what goes first, which is
 * why they render severed rather than simply absent in direct mode. */

import { tierMeta } from "../palette.js";
import { fadeIn, wait, veil } from "../anim.js";

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const meta = tierMeta(tier);
  const severed = isDirect && tier === "grey";

  const rail = document.createElement("ol");
  rail.className = "rail";
  if (metrics.tone) rail.dataset.tone = metrics.tone;

  const cardEls = [];

  (metrics.cards || []).forEach((card) => {
    const li = document.createElement("li");
    li.className = "rail-card";
    li.style.setProperty("--card-accent", isDirect ? meta.color : ctx.accent);

    const marker = document.createElement("span");
    marker.className = "rail-marker";
    marker.textContent = String(card.n);
    li.appendChild(marker);

    const body = document.createElement("div");
    body.className = "rail-body";

    const copy = document.createElement("p");
    copy.className = "rail-copy";
    copy.innerHTML = `<strong class="rail-title">${card.title}</strong> ${card.body}`;
    body.appendChild(copy);

    const links = (card.links || []).filter(Boolean);
    if (links.length) {
      // Inline with the copy rather than on their own row — five cards have to
      // fit a fixed viewport, and a tag line each is the difference between
      // fitting and scrolling.
      const tags = document.createElement("span");
      tags.className = "rail-tags";
      links.forEach((id) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "rail-tag";
        chip.dataset.target = id;
        if (severed) chip.dataset.severed = "true";
        chip.textContent = ctx.labelFor(id) || id;
        chip.setAttribute(
          "aria-label",
          severed
            ? `${ctx.labelFor(id) || id} — link to this measure is not available without the Knowledge Layer`
            : `Highlight ${ctx.labelFor(id) || id}`
        );

        if (!severed) {
          const on = () => ctx.highlight([id], true);
          const off = () => ctx.highlight([id], false);
          chip.addEventListener("pointerenter", (e) => {
            if (e.pointerType === "touch") return;
            on();
          });
          chip.addEventListener("pointerleave", (e) => {
            if (e.pointerType === "touch") return;
            off();
          });
          chip.addEventListener("focus", on);
          chip.addEventListener("blur", off);
          chip.addEventListener("click", () => ctx.reveal(id));
        } else {
          chip.addEventListener("click", () =>
            ctx.note("Without the Knowledge Layer this claim has no certified measure attached to check it against.")
          );
        }

        tags.appendChild(chip);
      });
      copy.appendChild(tags);
    }

    li.appendChild(body);
    rail.appendChild(li);
    cardEls.push(li);
  });

  host.appendChild(rail);

  const curtain = veil([cardEls]);
  curtain.hide();

  async function build(signal) {
    // Cards arrive one at a time rather than as a block, so the rail reads as
    // a list being told rather than a paragraph being pasted.
    for (let i = 0; i < cardEls.length; i += 1) {
      fadeIn(cardEls[i], { duration: 460, y: 14, x: -6, signal });
      const cancelled = await wait(i === 0 ? 120 : 96, signal);
      if (cancelled) return;
    }
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
