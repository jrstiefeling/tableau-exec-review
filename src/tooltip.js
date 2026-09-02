/* One shared tooltip, repositioned per target rather than one node per mark.
 *
 * Mouse and touch are handled as genuinely different inputs instead of being
 * collapsed into one: pointer devices hover, touch devices tap to latch and
 * tap away to dismiss. Conflating them is what produces tooltips that stick
 * open on phones and never quite dismiss. */

export function createTooltip(el) {
  let latched = null;

  function place(target) {
    const rect = target.getBoundingClientRect();
    el.setAttribute("aria-hidden", "false");
    el.classList.add("is-visible");

    // Measure after showing, so the flip decisions below use the real size.
    const bounds = el.getBoundingClientRect();
    const margin = 10;
    let left = rect.left + rect.width / 2 - bounds.width / 2;
    let top = rect.bottom + margin;

    left = Math.max(12, Math.min(left, window.innerWidth - bounds.width - 12));
    if (top + bounds.height > window.innerHeight - 12) {
      top = rect.top - bounds.height - margin;
    }

    el.style.left = `${left}px`;
    el.style.top = `${Math.max(12, top)}px`;
  }

  function show(target, content) {
    el.textContent = content;
    place(target);
  }

  function hide() {
    el.classList.remove("is-visible");
    el.setAttribute("aria-hidden", "true");
    latched = null;
  }

  function bind(node, content) {
    if (!content) return node;
    node.dataset.hasTip = "true";

    node.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch") return;
      show(node, content);
    });
    node.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "touch") return;
      hide();
    });
    node.addEventListener("focus", () => show(node, content));
    node.addEventListener("blur", () => hide());
    node.addEventListener("click", (e) => {
      if (e.pointerType && e.pointerType !== "touch") return;
      e.stopPropagation();
      if (latched === node) {
        hide();
        return;
      }
      latched = node;
      show(node, content);
    });

    return node;
  }

  document.addEventListener("click", (e) => {
    if (latched && !latched.contains(e.target)) hide();
  });
  window.addEventListener("scroll", hide, true);

  return { bind, hide, show };
}
