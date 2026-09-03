/* The six named drivers behind the five-year trajectory.
 *
 * On the slide these sit beside the table as an unconnected list. Here each
 * driver knows which measures it claims to explain, so hovering one lights
 * exactly those panels — which makes an over-broad claim visible as a driver
 * that lights everything, and an unsupported one as a driver that lights
 * nothing. Direct mode severs the mapping, leaving six plausible causes and
 * seven metrics with nothing connecting them. */

import { tierMeta } from "../palette.js";
import { fadeIn, wait, veil } from "../anim.js";

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const meta = tierMeta(tier);
  const severed = isDirect && tier === "grey";

  const list = document.createElement("ol");
  list.className = "drivers";
  const items = [];

  (metrics.drivers || []).forEach((driver) => {
    const li = document.createElement("li");
    li.className = "driver";
    li.style.setProperty("--card-accent", ctx.accent);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "driver-btn";
    if (severed) button.dataset.severed = "true";

    const marker = document.createElement("span");
    marker.className = "driver-marker";
    marker.textContent = String(driver.n);

    const title = document.createElement("span");
    title.className = "driver-title";
    title.innerHTML = driver.title;

    button.appendChild(marker);
    button.appendChild(title);

    /* The rail lights itself along with the panels it points at. Without its
     * own id in the set, `.stage.is-highlighting` dims every portlet that is
     * not a target — including the one the pointer is resting on — so the
     * gesture faded out the thing making it. */
    const targets = severed ? [] : [ctx.id, ...(driver.affects || [])];
    const count = document.createElement("span");
    count.className = "driver-count";
    count.textContent = severed ? "—" : String((driver.affects || []).length);
    count.setAttribute(
      "aria-label",
      severed
        ? "No measures mapped to this driver"
        : `${(driver.affects || []).length} measures explained by this driver`
    );
    button.appendChild(count);

    if (severed) {
      button.addEventListener("click", () =>
        ctx.note("Without the Knowledge Layer nothing maps this driver to the measures it claims to explain.")
      );
    } else {
      const on = () => {
        li.dataset.active = "true";
        ctx.highlight(targets, true);
      };
      const off = () => {
        delete li.dataset.active;
        ctx.highlight(targets, false);
      };
      button.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "touch") return;
        on();
      });
      button.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "touch") return;
        off();
      });
      button.addEventListener("focus", on);
      button.addEventListener("blur", off);
      // Touch has no hover, so a tap latches the highlight until it is tapped
      // again rather than flashing it for the length of the press.
      button.addEventListener("click", () => {
        const nowOn = li.dataset.active !== "true";
        ctx.highlight(targets, nowOn);
        if (nowOn) li.dataset.active = "true";
        else delete li.dataset.active;
      });
    }

    li.appendChild(button);
    list.appendChild(li);
    items.push(li);
  });

  host.appendChild(list);

  const curtain = veil([items]);
  curtain.hide();

  async function build(signal) {
    for (let i = 0; i < items.length; i += 1) {
      fadeIn(items[i], { duration: 420, y: 10, x: -8, signal });
      const cancelled = await wait(72, signal);
      if (cancelled) return;
    }
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
