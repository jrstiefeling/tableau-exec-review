/* Tab router and entrance choreographer.
 *
 * The sibling scrollytelling app revealed sections with an IntersectionObserver
 * and guarded each one so it only ever entered once. Nothing here scrolls, so
 * the trigger is a tab switch instead — and the guard is inverted: a tab
 * re-enters every time you come back to it, because the build is the point.
 * What stops that becoming tedious is the replay scale, which compresses the
 * whole choreography on a second visit so it still reads as an entrance
 * without making anyone sit through it again.
 *
 * Portlets are choreographed rather than animated together. Each one gets its
 * own start time and then runs its own internal build independently, so the
 * board assembles as a sequence of separate components arriving rather than
 * as one composition fading up. */

import { Portlet } from "./portlet.js";
import { setMotionScale } from "./anim.js";

const ENTRANCES = ["rise", "left", "right"];

export class TabController {
  constructor({ stage, nav, indicator, tabs, deps }) {
    this.stage = stage;
    this.nav = nav;
    this.indicator = indicator;
    this.tabs = tabs;
    this.deps = deps;

    this.panels = new Map();
    this.buttons = new Map();
    this.portlets = new Map();
    this.byTab = new Map();
    this.seen = new Set();
    this.activeId = null;
    this.enterTimers = [];
  }

  init() {
    this.nav.setAttribute("role", "tablist");

    this.tabs.forEach((tab, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tabnav-btn";
      button.id = `tab-${tab.id}`;
      button.dataset.tab = tab.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", "false");
      button.setAttribute("aria-controls", `panel-${tab.id}`);
      button.tabIndex = -1;

      const index_ = document.createElement("span");
      index_.className = "tabnav-index";
      index_.textContent = String(index + 1);
      const label = document.createElement("span");
      label.className = "tabnav-label";
      label.textContent = tab.label;
      button.appendChild(index_);
      button.appendChild(label);

      button.addEventListener("click", () => this.navigate(tab.id));
      this.nav.appendChild(button);
      this.buttons.set(tab.id, button);

      this.panels.set(tab.id, this.buildPanel(tab, index));
    });

    this.nav.addEventListener("keydown", (e) => this.onNavKeydown(e));
    window.addEventListener("hashchange", () => this.activate(this.idFromHash(), { push: false }));
    window.addEventListener("resize", () => this.positionIndicator());

    this.activate(this.idFromHash(), { push: false });
  }

  idFromHash() {
    const raw = window.location.hash.replace(/^#\/?/, "");
    return this.panels.has(raw) ? raw : this.tabs[0].id;
  }

  buildPanel(tab, tabIndex) {
    const panel = document.createElement("section");
    panel.className = "panel";
    panel.id = `panel-${tab.id}`;
    panel.dataset.tab = tab.id;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", `tab-${tab.id}`);
    panel.style.setProperty("--tab-accent", tab.accent);

    const head = document.createElement("header");
    head.className = "panel-head";
    const kicker = document.createElement("p");
    kicker.className = "panel-kicker";
    kicker.textContent = tab.kicker || "";
    const headline = document.createElement("h2");
    headline.className = "panel-headline";
    headline.textContent = tab.headline || tab.label;
    head.appendChild(kicker);
    head.appendChild(headline);
    panel.appendChild(head);

    const bands = document.createElement("div");
    bands.className = "panel-bands";
    panel.appendChild(bands);

    const list = [];
    let ordinal = 0;

    (tab.bands || []).forEach((bandSpec, bandIndex) => {
      const band = document.createElement("div");
      band.className = "band";
      band.dataset.band = bandSpec.id;
      band.dataset.layout = bandSpec.layout || "row";
      bands.appendChild(band);

      (bandSpec.portlets || []).forEach((spec, i) => {
        const portlet = new Portlet(spec, {
          ...this.deps,
          tab
        });
        portlet.mount(band);
        // Entrance direction varies by position so a band of four tiles does
        // not arrive as four identical slides.
        portlet.el.dataset.entrance = ENTRANCES[(bandIndex + i) % ENTRANCES.length];
        portlet.bandIndex = bandIndex;
        portlet.ordinal = ordinal;
        ordinal += 1;
        this.portlets.set(spec.id, portlet);
        list.push(portlet);
      });
    });

    this.byTab.set(tab.id, list);
    this.stage.appendChild(panel);
    return panel;
  }

  navigate(id) {
    if (id === this.activeId) return;
    window.location.hash = `/${id}`;
    // hashchange drives the activation, so a link and a click take the same
    // path and the URL is always the source of truth for what is on screen.
  }

  activate(id, opts = {}) {
    if (!this.panels.has(id)) return;
    if (id === this.activeId) return;

    const previousId = this.activeId;
    this.activeId = id;

    if (opts.push !== false && window.location.hash !== `#/${id}`) {
      window.location.hash = `/${id}`;
    }

    this.deps.inspector.closeNow();
    this.clearTimers();

    this.buttons.forEach((button, tabId) => {
      const on = tabId === id;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-selected", on ? "true" : "false");
      button.tabIndex = on ? 0 : -1;
    });

    if (previousId) {
      const previous = this.panels.get(previousId);
      previous.classList.add("is-exiting");
      previous.classList.remove("is-live");
      (this.byTab.get(previousId) || []).forEach((portlet) => {
        portlet.cancel();
        portlet.el.classList.remove("is-entered", "is-live");
      });
      window.setTimeout(() => {
        previous.classList.remove("is-active", "is-exiting");
      }, 320);
    }

    const panel = this.panels.get(id);
    panel.classList.add("is-active");
    void panel.getBoundingClientRect();
    panel.classList.add("is-live");
    panel.classList.remove("is-exiting");

    this.positionIndicator();
    this.choreograph(id, { replay: this.seen.has(id) });
    this.seen.add(id);

    if (this.deps.onTabChange) this.deps.onTabChange(id);
  }

  /* Assigns each portlet its own start time, then leaves it alone. Bands are
   * offset from each other so the board reads top to bottom, and a small
   * deterministic jitter keeps a row of four from landing like a metronome. */
  choreograph(id, { replay }) {
    const scale = replay ? 0.55 : 1;
    setMotionScale(scale);

    const list = this.byTab.get(id) || [];
    const bandStep = replay ? 90 : 190;
    const itemStep = replay ? 48 : 104;

    list.forEach((portlet) => {
      const jitter = (portlet.ordinal * 37) % 60;
      const delay = Math.round(
        (portlet.bandIndex * bandStep + portlet.ordinal * itemStep + jitter) * (replay ? 0.6 : 1)
      );

      const timer = window.setTimeout(() => {
        portlet.el.classList.add("is-entered");
        // The shell lands first, then its contents draw — so each component
        // visibly builds itself rather than arriving finished.
        portlet.build(replay ? 80 : 150);
      }, delay);
      this.enterTimers.push(timer);
    });
  }

  /* Re-runs the current tab's choreography without a tab change. Used by the
   * Knowledge Layer toggle, so switching governance modes visibly rebuilds the
   * board instead of silently swapping its contents. */
  replayActive() {
    if (!this.activeId) return;
    this.clearTimers();
    (this.byTab.get(this.activeId) || []).forEach((portlet) => {
      portlet.cancel();
      portlet.el.classList.remove("is-entered");
    });
    void this.stage.getBoundingClientRect();
    this.choreograph(this.activeId, { replay: true });
  }

  rerenderAll() {
    this.portlets.forEach((portlet) => portlet.render());
  }

  clearTimers() {
    this.enterTimers.forEach((timer) => window.clearTimeout(timer));
    this.enterTimers = [];
  }

  positionIndicator() {
    const button = this.buttons.get(this.activeId);
    if (!button || !this.indicator) return;
    this.indicator.style.setProperty("--indicator-x", `${button.offsetLeft}px`);
    this.indicator.style.setProperty("--indicator-w", `${button.offsetWidth}px`);
  }

  onNavKeydown(e) {
    const order = this.tabs.map((t) => t.id);
    const index = order.indexOf(this.activeId);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = order[(index + (e.key === "ArrowRight" ? 1 : -1) + order.length) % order.length];
      this.navigate(next);
      this.buttons.get(next).focus();
    }
  }

  step(delta) {
    const order = this.tabs.map((t) => t.id);
    const index = order.indexOf(this.activeId);
    this.navigate(order[(index + delta + order.length) % order.length]);
  }

  activePortlets() {
    return this.byTab.get(this.activeId) || [];
  }

  get(id) {
    return this.portlets.get(id);
  }
}
