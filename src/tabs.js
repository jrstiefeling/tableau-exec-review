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
 * The entrance runs in two stages, and the split is what keeps it from reading
 * as scattered popping. Stage one is structural: every portlet shell fades and
 * settles on a quick stagger, so the page establishes itself as a complete
 * layout of empty frames before anything is drawn inside them. Stage two is
 * the content, and it is ordered by horizontal position across the entire
 * board — not by band, not by DOM order — so the charts draw themselves in as
 * one continuous sweep travelling left to right, crossing band boundaries on
 * the way. Each chart's own internal staging (axis, line, points, labels) then
 * nests inside its slot in that sweep rather than competing with it.
 *
 * The sweep only ever knows where a chart is and when its turn comes. What a
 * chart does with its turn is entirely the chart's business, so chart forms
 * can be swapped without touching anything here. */

import { Portlet } from "./portlet.js";
import { setMotionScale, reducedMotion } from "./anim.js";

const ENTRANCES = ["rise", "left", "right"];

/* shellStep/bandStep pace stage one; settle is the gap between the last shell
 * starting and the first chart drawing; sweep is how long the left-to-right
 * pass takes to cross the board. scale compresses every chart's internal
 * sequence so the whole thing lands inside the budget a presenter can talk
 * over — roughly 1.7s cold, under a second on return. */
const TIMING = {
  entry: { shellStep: 17, bandStep: 48, settle: 280, sweep: 290, scale: 0.53 },
  replay: { shellStep: 9, bandStep: 26, settle: 160, sweep: 170, scale: 0.38 }
};

/* Horizontal centre of an element measured against the panel, accumulated up
 * the offsetParent chain so it holds however the bands are positioned. Uses
 * offset geometry rather than getBoundingClientRect deliberately: the shells
 * are mid-entrance and carry a translate, and a measured rect would fold that
 * displacement into the ordering. */
function centreWithin(el, root) {
  let x = el.offsetWidth / 2;
  let node = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    node = node.offsetParent;
  }
  return x;
}

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
    // Every scheduled step carries the id of the sweep that queued it, so a
    // superseded sweep cannot act even if one of its timers fires in the same
    // tick it was cancelled in.
    this.sweepId = 0;
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
      /* The switch takes the short label and the accessible name takes the
       * full one, so a screen reader hears "Performance by Segment" where the
       * eye reads "Segment" and has the panel headline underneath it. */
      const label = document.createElement("span");
      label.className = "tabnav-label";
      label.textContent = tab.navLabel || tab.label;
      button.appendChild(index_);
      button.appendChild(label);
      if (tab.navLabel && tab.navLabel !== tab.label) {
        button.setAttribute("aria-label", tab.label);
        button.title = tab.label;
      }

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
      // Retiring the outgoing panel is deferred until its exit transition has
      // run, which means the viewer can be back on it before this lands. If
      // they are, leave it alone — otherwise a quick there-and-back takes the
      // board off screen and nothing brings it back.
      window.setTimeout(() => {
        if (this.activeId === previousId) return;
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

  /* Stage one lays the page out; stage two sweeps across it left to right.
   * Both tabs run this, so the exec board and the trend board enter the same
   * way even though nothing they contain is alike. */
  choreograph(id, { replay }) {
    const list = this.byTab.get(id) || [];
    if (!list.length) return;

    const sweep = (this.sweepId += 1);
    const still = reducedMotion();
    const t = replay ? TIMING.replay : TIMING.entry;
    setMotionScale(still ? 1 : t.scale);

    // Before anything is on screen: veil every chart. On a return visit the
    // charts are still sitting there finished, and letting them show through
    // stage one would mean the board arrives complete and is then wiped.
    list.forEach((portlet) => portlet.primeChart());

    // All geometry read in one pass, before a single style is written, so the
    // sweep costs one layout rather than one per portlet.
    const panel = this.panels.get(id);
    const centres = list.map((portlet) => centreWithin(portlet.el, panel));
    const left = Math.min(...centres);
    const span = Math.max(1, Math.max(...centres) - left);

    /* ---- stage one: the sections arrive ---- */
    let lastShell = 0;
    list.forEach((portlet, i) => {
      const delay = still ? 0 : portlet.bandIndex * t.bandStep + i * t.shellStep;
      lastShell = Math.max(lastShell, delay);
      this.schedule(delay, sweep, () => portlet.el.classList.add("is-entered"));
    });

    /* ---- stage two: the visualisations draw in ---- */
    const opens = still ? 0 : lastShell + t.settle;
    list.forEach((portlet, i) => {
      const across = (centres[i] - left) / span;
      const delay = still ? 0 : Math.round(opens + across * t.sweep);
      this.schedule(delay, sweep, () => portlet.build(0));
    });
  }

  /* Queues one step of a sweep, discarding it if a later sweep has started. */
  schedule(delay, sweep, run) {
    if (delay <= 0) {
      run();
      return;
    }
    const timer = window.setTimeout(() => {
      if (sweep === this.sweepId) run();
    }, delay);
    this.enterTimers.push(timer);
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

  /* Cancels the in-flight sweep. Bumping the id as well as clearing the timers
   * is what makes a fast tab switch safe: anything already queued is orphaned
   * rather than left to land on a tab that has moved on. */
  clearTimers() {
    this.enterTimers.forEach((timer) => window.clearTimeout(timer));
    this.enterTimers = [];
    this.sweepId += 1;
  }

  positionIndicator() {
    const button = this.buttons.get(this.activeId);
    if (!button || !this.indicator) return;
    this.indicator.style.setProperty("--indicator-x", `${button.offsetLeft}px`);
    this.indicator.style.setProperty("--indicator-w", `${button.offsetWidth}px`);
  }

  /* Roving tabindex: exactly one tab is reachable by Tab, and the arrows move
   * between them once focus is inside. Home and End matter more at five tabs
   * than they did at two — four arrow presses to cross the board is the point
   * at which a jump to either end stops being a nicety. */
  onNavKeydown(e) {
    const order = this.tabs.map((t) => t.id);
    const index = order.indexOf(this.activeId);
    let next = null;

    if (e.key === "ArrowRight") next = order[(index + 1) % order.length];
    else if (e.key === "ArrowLeft") next = order[(index - 1 + order.length) % order.length];
    else if (e.key === "Home") next = order[0];
    else if (e.key === "End") next = order[order.length - 1];
    if (next === null) return;

    e.preventDefault();
    this.navigate(next);
    // Focus follows the roving tabindex activate() has just moved, so the
    // arrow keys keep working from the tab they landed on.
    this.buttons.get(next).focus();
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
