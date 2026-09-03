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
import { TabNotes } from "./notes.js";
import { setMotionScale, reducedMotion } from "./anim.js";

const ENTRANCES = ["rise", "left", "right"];

/* Portlet kinds that are chrome rather than content: authored as portlets,
 * carrying their own semantic block like everything else, but read once and
 * therefore not worth a permanent grid slot. They are diverted into the panel
 * head's (i) flyover instead of being mounted into a band — see notes.js for
 * why that is a second affordance and not the provenance dot.
 *
 * Diverting rather than deleting matters: the specs stay in board.json exactly
 * as authored, semantic and directMode blocks included, and the only thing
 * that changes is where the renderer's output is parented. */
const FLYOVER_KINDS = new Set(["rulesCard"]);

/* shellStep/bandStep pace stage one; settle is the gap between the last shell
 * starting and the first chart drawing; sweep is how long the left-to-right
 * pass takes to cross the board. scale compresses every chart's internal
 * sequence so the whole thing lands inside the budget a presenter can talk
 * over — roughly 1.7s cold, under a second on return. */
/* marksHold is the pause between the board finishing and the provenance marks
 * landing (stage three). It is the longest deliberate stillness anywhere in
 * the build and the only one whose job is rhetorical rather than mechanical:
 * the viewer has to have time to accept the board before being told about it.
 * Longer on a first entrance than on a replay, because a replay follows a
 * toggle the viewer just pressed and is already watching for. */
const TIMING = {
  entry: { shellStep: 17, bandStep: 48, settle: 280, sweep: 290, scale: 0.53, marksHold: 900 },
  replay: { shellStep: 9, bandStep: 26, settle: 160, sweep: 170, scale: 0.38, marksHold: 720 }
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
    this.notes = new Map();
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
    const noteSpecs = [];
    let ordinal = 0;

    (tab.bands || []).forEach((bandSpec, bandIndex) => {
      // A band whose every portlet is chrome would otherwise be an empty grid
      // cell holding a row open, so it is never created.
      const content = (bandSpec.portlets || []).filter((spec) => !FLYOVER_KINDS.has(spec.kind));
      (bandSpec.portlets || []).forEach((spec) => {
        if (FLYOVER_KINDS.has(spec.kind)) noteSpecs.push(spec);
      });
      if (!content.length) return;

      const band = document.createElement("div");
      band.className = "band";
      band.dataset.band = bandSpec.id;
      band.dataset.layout = bandSpec.layout || "row";
      bands.appendChild(band);

      content.forEach((spec, i) => {
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

    // A tab can borrow another tab's notes by id. The product tab's rules card
    // says in its own subtitle that it governs the outlook tab too, so that
    // tab points at it rather than restating four rules a second time.
    (tab.notesRef || []).forEach((id) => {
      const spec = this.deps.specFor ? this.deps.specFor(id) : null;
      if (spec && !noteSpecs.some((s) => s.id === id)) noteSpecs.push(spec);
    });

    if (noteSpecs.length) {
      const notes = new TabNotes({ tab, specs: noteSpecs, deps: this.deps });
      notes.mount(panel, head);
      this.notes.set(tab.id, notes);
    }

    this.byTab.set(tab.id, list);
    this.stage.appendChild(panel);
    return panel;
  }

  /* The notes sheet for the tab on screen, or null. main.js reaches for this
   * to bind the `i` shortcut and to put the sheet on the Escape ladder. */
  activeNotes() {
    return this.notes.get(this.activeId) || null;
  }

  closeNotes() {
    this.notes.forEach((notes) => notes.set(false));
  }

  rerenderNotes() {
    this.notes.forEach((notes) => notes.render());
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
    this.closeNotes();
    this.clearTimers();

    /* The panel already carries --tab-accent; body needs it too, because the
     * paper wash is painted by body::before and cannot reach into a
     * descendant's custom property. This is what makes a tab switch change
     * the colour temperature of the page rather than only of the chrome. */
    const tab = this.tabs.find((t) => t.id === id);
    if (tab && tab.accent) document.body.style.setProperty("--tab-accent", tab.accent);

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

  /* Stage one lays the page out; stage two sweeps across it left to right;
   * stage three lands the provenance marks once the board is finished and has
   * been sitting still for a beat. Every tab runs this, so the exec board and
   * the trend board enter the same way even though nothing they contain is
   * alike — and the mode toggle runs it too, which is what makes the switch
   * visibly enacted rather than a silent content swap.
   *
   * Stage three exists because of what direct mode now looks like. The
   * degraded board is not drained any more; it renders at full confidence, so
   * the only thing distinguishing it is 27 small dots. Landing those dots with
   * everything else would have wasted them — they would arrive as part of the
   * furniture. Landing them a beat late turns them into an event, and the
   * event carries the argument: the board you just accepted is the board whose
   * numbers are wrong. */
  choreograph(id, { replay }) {
    const list = this.byTab.get(id) || [];
    if (!list.length) return;

    const sweep = (this.sweepId += 1);
    const still = reducedMotion();
    const t = replay ? TIMING.replay : TIMING.entry;
    // Under reduced motion the primitives each jump to their final value, but
    // every build path also paces itself with `wait()` between beats, so at a
    // scale of 1 the board still assembles over the full sweep — a card rail
    // took 600ms to seat six cards that had each already arrived. Collapsing
    // the scale collapses the pacing too, which is what "jump to final state"
    // has to mean for a composition rather than for one mark. The clamp in
    // setMotionScale floors this at 0.01, so the longest build path costs a
    // couple of dozen milliseconds instead of two and a half seconds.
    setMotionScale(still ? 0 : t.scale);

    // Before anything is on screen: veil every chart. On a return visit the
    // charts are still sitting there finished, and letting them show through
    // stage one would mean the board arrives complete and is then wiped.
    list.forEach((portlet) => {
      portlet.primeChart();
      // Under reduced motion the marks are never withheld: a viewer who has
      // asked for no animation is asking for the finished state, and the
      // finished state includes knowing where the figures came from.
      if (!still) portlet.primeMarks();
    });

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
    let lastBuild = 0;
    list.forEach((portlet, i) => {
      const across = (centres[i] - left) / span;
      const delay = still ? 0 : Math.round(opens + across * t.sweep);
      lastBuild = Math.max(lastBuild, delay);
      this.schedule(delay, sweep, () => portlet.build(0));
    });

    /* ---- stage three: the provenance marks land ---- */
    if (still) {
      list.forEach((portlet) => portlet.landMarks());
      return;
    }
    /* The hold is measured from the last chart to START drawing, plus that
     * chart's own build time, plus a pause. The pause is the point: it is long
     * enough that the board reads as finished and settled, and short enough
     * that nobody has looked away. Everything lands together rather than
     * sweeping again — a second sweep would read as more drawing, where a
     * simultaneous arrival reads as a verdict on a board that is already
     * complete. */
    const marks = Math.round(lastBuild + t.marksHold);
    this.schedule(marks, sweep, () => list.forEach((portlet) => portlet.landMarks()));
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
