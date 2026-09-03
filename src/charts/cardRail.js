/* Numbered narrative rows, each tagged to the measure it claims to move.
 *
 * A qualitative win is only reviewable if it points at a number. The tag chip
 * on each row is that pointer: hovering it lights the metric portlet the
 * claim rests on, so an unsupported claim is visible as a row with nothing to
 * light. Without the semantic layer the tags are what goes first, which is
 * why they render severed rather than simply absent in direct mode.
 *
 * Rows, not cards. This form used to be five stacked cards, each a bold title
 * followed by two or three lines of body copy, inside `overflow-y: auto`.
 * At every laptop height that meant one card visible and four behind a
 * scrollbar — the reviewer counted item 1 of 5 and was right. A scroll valve
 * is the worst possible answer here because it stops the composition ever
 * reporting that it does not fit, so nothing upstream is ever cut.
 *
 * So the length comes out of the face and goes behind two interactions that
 * this board already has:
 *
 *   hover or focus  -> the shared tooltip, carrying title and body in full;
 *   click, or Enter -> the inspector expand, where all five render as cards
 *                      at reading size.
 *
 * What stays on the face is one row per item: the numeral, the title on a
 * single line, and the tag. Five rows always fit, nothing scrolls, and the
 * numbered markers make a scan down the left edge that a wrapped title would
 * break — which is why the three titles that outrun the rail ellipsise rather
 * than wrapping. The full string is one hover away and one Enter away.
 *
 * The rail also stops being colourless. `tone` is authored — positive for
 * what worked, forward for what is next — and now tints the card surface
 * through the same --tone-color channel the attainment KPIs use, so the pair
 * reads as a pair before a word of it is read. */

import { tierMeta, palette, toneColor } from "../palette.js";
import { fadeIn, wait, veil } from "../anim.js";

/* Authored tone -> the palette entry that paints it. Resolved through
 * palette() rather than a literal so the wash drains in direct mode with
 * every other tint on the board. `forward` is not a sentiment — it is "this
 * has not happened yet" — so it takes the neutral entry rather than borrowing
 * green or red and asserting a verdict on a plan. */
function toneTint(tone, accent, isDirect, meta) {
  if (isDirect) return meta.color;
  const p = palette();
  if (tone === "positive") return toneColor("positive");
  if (tone === "risk" || tone === "negative") return toneColor("risk");
  if (tone === "forward") return accent;
  return p.neutral;
}

/* Strips the authored HTML entities and markup out of a title or body so it
 * can go into a tooltip, which takes textContent. The cards author `&amp;`
 * and the occasional <strong>, both of which would print literally. */
function plain(html) {
  const host = document.createElement("div");
  host.innerHTML = String(html || "");
  return host.textContent.replace(/\s+/g, " ").trim();
}

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const meta = tierMeta(tier);
  const severed = isDirect && tier === "grey";
  const accent = isDirect ? meta.color : ctx.accent;
  const tint = toneTint(metrics.tone, accent, isDirect, meta);

  const card = host.closest(".portlet");
  if (card) {
    card.style.setProperty("--tone-color", tint);
    card.dataset.surface = "tone";
  }

  const rail = document.createElement("ol");
  rail.className = "rail";
  if (metrics.tone) rail.dataset.tone = metrics.tone;

  const rowEls = [];

  (metrics.cards || []).forEach((entry) => {
    const li = document.createElement("li");
    li.className = "rail-row";
    li.style.setProperty("--card-accent", accent);

    const marker = document.createElement("span");
    marker.className = "rail-marker";
    marker.textContent = String(entry.n);
    li.appendChild(marker);

    const title = document.createElement("span");
    title.className = "rail-row-title";
    title.innerHTML = entry.title;
    li.appendChild(title);

    /* The row carries the whole item in its tooltip, not just the part that
     * did not fit. Reading half a claim from the face and half from a hover
     * would be worse than reading all of it from one place. */
    ctx.tip(li, `${plain(entry.title)} — ${plain(entry.body)}`);

    /* On the face the tag is a mark, not a name.
     *
     * The named chip was tried first and it lost the argument to arithmetic.
     * The rail is 240px wide and the row is one line, so a chip reading
     * "ACV BY PRODUCT MOTION" left about 70px for the title and printed
     * "Reposi…" — which trades the item, the thing the row exists to say, for
     * the label of a portlet the reader can see two columns to the left.
     *
     * So the chip keeps its behaviour and drops its text: hover or focus still
     * lights the measure, click still reveals it, `+N` still says how many
     * there are, severed still reads as severed. The name is on the chip's
     * accessible name, in its tooltip, and spelled out in full on the expanded
     * card. What the reader loses at a glance is which measure — and they can
     * get that by pointing at it, which is the same gesture that lights it. */
    const links = (entry.links || []).filter(Boolean);
    if (links.length) {
      const tags = document.createElement("span");
      tags.className = "rail-tags";
      tags.appendChild(buildTag(links[0], links.length, true));
      li.appendChild(tags);
    }

    rail.appendChild(li);
    rowEls.push(li);
  });

  host.appendChild(rail);
  host.appendChild(buildDetail());

  /* The tag chip, shared between the compact rows and the expanded cards.
   * `mark` renders it as a dot plus an optional count; otherwise it is the
   * measure's name in full, which is what the expanded card wants. */
  function buildTag(id, total, mark) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = mark ? "rail-tag is-mark" : "rail-tag";
    chip.dataset.target = id;
    if (severed) chip.dataset.severed = "true";
    const name = ctx.labelFor(id) || id;
    if (mark) {
      const dot = document.createElement("span");
      dot.className = "rail-tag-dot";
      chip.appendChild(dot);
      // "+2" rather than a second dot: a count says there is more where a
      // row of identical marks says nothing about how many.
      if (total > 1) {
        const more = document.createElement("span");
        more.className = "rail-tag-more";
        more.textContent = `+${total - 1}`;
        chip.appendChild(more);
      }
    } else {
      chip.textContent = total > 1 ? `${name} +${total - 1}` : name;
    }
    const label = severed
      ? `${name} — link to this measure is not available without the Knowledge Layer`
      : `Highlight ${name}${total > 1 ? ` and ${total - 1} more` : ""}`;
    chip.setAttribute("aria-label", label);
    // The mark has no visible name, so it says its own out loud on hover.
    // stopPropagation keeps it from being swallowed by the row's tooltip.
    if (mark) ctx.tip(chip, label);

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
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        ctx.reveal(id);
      });
    } else {
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        ctx.note("Without the Knowledge Layer this claim has no certified measure attached to check it against.");
      });
    }

    return chip;
  }

  /* The full read, revealed by the expand this board already has on every
   * portlet that carries detail. Every item's body, and every tag rather than
   * only the first — so nothing on the compact face is unreachable. */
  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    const list = document.createElement("ol");
    list.className = "rail-full";

    (metrics.cards || []).forEach((entry) => {
      const li = document.createElement("li");
      li.className = "rail-card";
      li.style.setProperty("--card-accent", accent);

      const marker = document.createElement("span");
      marker.className = "rail-marker";
      marker.textContent = String(entry.n);
      li.appendChild(marker);

      const body = document.createElement("div");
      body.className = "rail-body";

      const copy = document.createElement("p");
      copy.className = "rail-copy";
      copy.innerHTML = `<strong class="rail-title">${entry.title}</strong> ${entry.body}`;
      body.appendChild(copy);

      const links = (entry.links || []).filter(Boolean);
      if (links.length) {
        const tags = document.createElement("span");
        tags.className = "rail-tags";
        links.forEach((id) => tags.appendChild(buildTag(id, 1)));
        copy.appendChild(tags);
      }

      li.appendChild(body);
      list.appendChild(li);
    });

    detail.appendChild(list);
    return detail;
  }

  const curtain = veil([rowEls]);
  curtain.hide();

  async function build(signal) {
    // Rows arrive one at a time rather than as a block, so the rail reads as
    // a list being told rather than a paragraph being pasted. Faster per row
    // than the cards were: five rows is a shorter thing to say than five
    // paragraphs, and the sweep has the rest of the board to get to.
    for (let i = 0; i < rowEls.length; i += 1) {
      fadeIn(rowEls[i], { duration: 380, y: 8, x: -5, signal });
      const cancelled = await wait(i === 0 ? 90 : 68, signal);
      if (cancelled) return;
    }
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
