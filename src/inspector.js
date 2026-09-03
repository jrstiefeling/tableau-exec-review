/* Expands one portlet to fill the stage, optionally flipping it to its
 * provenance face, and puts it back afterwards.
 *
 * The portlet element itself moves — it is not cloned and it is not
 * re-rendered — so a chart mid-animation keeps animating and no state has to
 * be reconstructed on the way back. A ghost holds its place in the grid,
 * shallow-cloned so it inherits the same classes and therefore the same grid
 * placement rules, which is what stops the rest of the band reflowing while
 * one of its children is away.
 *
 * left/top/width/height are animated rather than transform, because a
 * non-uniform scale would stretch the type inside the card. One element
 * animating layout properties is affordable; a whole board of them would not
 * be. */

const OPEN_MS = 520;
const CLOSE_MS = 420;

export function createInspector({ stage, scrim }) {
  let active = null;

  function targetRect() {
    const bounds = stage.getBoundingClientRect();
    const width = Math.min(860, bounds.width - 48);
    const height = Math.min(720, bounds.height - 40);
    return {
      left: (bounds.width - width) / 2,
      top: (bounds.height - height) / 2,
      width,
      height
    };
  }

  function place(el, rect) {
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
  }

  function open(el, opts = {}) {
    if (active && active.el === el) {
      if (opts.flip !== undefined) setFlip(opts.flip);
      return;
    }
    if (active) closeNow();

    const rect = el.getBoundingClientRect();
    const bounds = stage.getBoundingClientRect();

    const ghost = el.cloneNode(false);
    ghost.classList.add("is-ghost");
    ghost.removeAttribute("id");
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.setAttribute("aria-hidden", "true");

    const parent = el.parentNode;
    const next = el.nextSibling;
    parent.insertBefore(ghost, el);

    stage.appendChild(el);
    el.classList.add("is-inspected");
    el.style.transition = "none";
    place(el, {
      left: rect.left - bounds.left,
      top: rect.top - bounds.top,
      width: rect.width,
      height: rect.height
    });
    void el.getBoundingClientRect();

    el.style.transition = "";
    place(el, targetRect());
    if (opts.flip) el.classList.add("is-flipped");

    stage.classList.add("is-inspecting");
    scrim.classList.add("is-visible");

    active = { el, ghost, parent, next };

    // Focus moves into the expanded card so Escape and Tab behave the way a
    // dialog should, rather than leaving focus behind in the collapsed grid.
    window.setTimeout(() => {
      if (active && active.el === el) {
        const focusable = el.querySelector(".portlet-close") || el;
        focusable.focus({ preventScroll: true });
      }
    }, OPEN_MS * 0.6);
  }

  function setFlip(on) {
    if (!active) return;
    active.el.classList.toggle("is-flipped", Boolean(on));
  }

  function toggleFlip() {
    if (!active) return;
    active.el.classList.toggle("is-flipped");
  }

  function restore(instant) {
    if (!active) return;
    const { el, ghost, parent, next } = active;
    const bounds = stage.getBoundingClientRect();
    const rect = ghost.getBoundingClientRect();

    el.classList.remove("is-flipped");

    const finish = () => {
      el.classList.remove("is-inspected");
      el.style.transition = "";
      el.style.left = "";
      el.style.top = "";
      el.style.width = "";
      el.style.height = "";
      if (ghost.parentNode) {
        parent.insertBefore(el, next && next.parentNode === parent ? next : ghost);
        ghost.remove();
      } else {
        parent.appendChild(el);
      }
    };

    if (instant) {
      finish();
    } else {
      place(el, {
        left: rect.left - bounds.left,
        top: rect.top - bounds.top,
        width: rect.width,
        height: rect.height
      });
      window.setTimeout(finish, CLOSE_MS);
    }

    stage.classList.remove("is-inspecting");
    scrim.classList.remove("is-visible");
    active = null;
  }

  function close() {
    restore(false);
  }

  function closeNow() {
    restore(true);
  }

  function reposition() {
    if (!active) return;
    place(active.el, targetRect());
  }

  return {
    open,
    close,
    closeNow,
    toggleFlip,
    setFlip,
    reposition,
    isOpen: () => Boolean(active),
    current: () => (active ? active.el : null)
  };
}
