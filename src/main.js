/* Boot and wiring.
 *
 * The data layer is deliberately shallow: one authored file, and an identical
 * copy embedded in JS so the board can never render blank if that file is
 * missing or malformed. There is no live tier and no remote call — the app is
 * a mock snapshot by design, and everything it claims about provenance is
 * authored content rather than a lookup. */

import { createTooltip } from "./tooltip.js";
import { createInspector } from "./inspector.js";
import { createGraph } from "./graph.js";
import { TabController } from "./tabs.js";
import { flattenPortlets, MODES } from "./semantic.js";
import { FALLBACK_BOARD } from "./fallback.js";

const dom = {
  stage: document.getElementById("stage"),
  scrim: document.getElementById("stage-scrim"),
  graphLayer: document.getElementById("graph-layer"),
  nav: document.getElementById("tabnav"),
  indicator: document.getElementById("tabnav-indicator"),
  tooltip: document.getElementById("tooltip"),
  layerToggle: document.getElementById("layer-toggle"),
  graphToggle: document.getElementById("graph-toggle"),
  legendDot: document.querySelector(".trust-legend-dot"),
  legendText: document.getElementById("trust-legend-text"),
  topbarName: document.getElementById("topbar-name"),
  topbarEyebrow: document.getElementById("topbar-eyebrow"),
  notice: document.getElementById("notice"),
  noticeText: document.getElementById("notice-text"),
  noticeDismiss: document.getElementById("notice-dismiss"),
  statusPeriod: document.getElementById("status-period"),
  statusFreshness: document.getElementById("status-freshness"),
  statusScope: document.getElementById("status-scope"),
  docTitle: document.getElementById("doc-title")
};

const state = { mode: MODES.TRUSTED, board: null };
const highlighted = new Set();
let noticeTimer = 0;

const tooltip = createTooltip(dom.tooltip);

async function loadBoard() {
  try {
    const response = await fetch(`./data/board.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (!json || !Array.isArray(json.tabs) || !json.tabs.length) throw new Error("no tabs");
    return { board: json, fellBack: false };
  } catch {
    // Serving over file:// blocks the fetch, and a malformed edit should not
    // take the board down mid-demo. Either way the embedded copy renders.
    return { board: FALLBACK_BOARD, fellBack: true };
  }
}

function note(message, ms = 5200) {
  dom.noticeText.textContent = message;
  dom.notice.hidden = false;
  window.clearTimeout(noticeTimer);
  if (ms) noticeTimer = window.setTimeout(() => { dom.notice.hidden = true; }, ms);
}

function boot({ board, fellBack }) {
  state.board = board;
  const meta = board.meta || {};
  const allPortlets = flattenPortlets(board.tabs);
  const labelOf = new Map(allPortlets.map((p) => [p.id, p.label]));
  const tabLabels = new Map(board.tabs.map((t) => [t.id, t.label]));

  dom.topbarName.textContent = meta.board || "Business Review";
  dom.topbarEyebrow.textContent = `${meta.org || ""} · ${meta.dataModeLabel || "Mock snapshot"}`.replace(/^ · /, "");
  dom.docTitle.textContent = `${meta.board || "Business Review"} · ${meta.period || ""}`.trim();
  dom.statusPeriod.textContent = meta.period || "—";
  dom.statusFreshness.textContent = `Freshness ${meta.freshness || "—"}`;
  dom.statusScope.textContent = meta.scope || "—";

  const inspector = createInspector({
    stage: dom.stage,
    scrim: dom.scrim,
    onChange: () => graph.redraw()
  });

  const controller = new TabController({
    stage: dom.stage,
    nav: dom.nav,
    indicator: dom.indicator,
    tabs: board.tabs,
    deps: {
      mode: () => state.mode,
      inspector,
      tip: (node, text) => tooltip.bind(node, text),
      highlight,
      labelFor: (id) => labelOf.get(id),
      note,
      reveal,
      onTabChange: () => {
        clearHighlights();
        graph.redraw();
      }
    }
  });

  const graph = createGraph({
    svg: dom.graphLayer,
    stage: dom.stage,
    controller,
    allPortlets,
    mode: () => state.mode,
    tabLabel: (id) => tabLabels.get(id) || id,
    onJump: (tabId, portletId) => {
      controller.navigate(tabId);
      reveal(portletId, 520);
    }
  });

  controller.init();
  dom.scrim.addEventListener("click", () => inspector.close());

  /* ------------------------------- controls ------------------------------- */

  dom.layerToggle.addEventListener("click", () => {
    setMode(state.mode === MODES.DIRECT ? MODES.TRUSTED : MODES.DIRECT);
  });
  dom.graphToggle.addEventListener("click", () => {
    graph.toggle();
    dom.graphToggle.setAttribute("aria-pressed", String(graph.isOn()));
  });
  dom.noticeDismiss.addEventListener("click", () => { dom.notice.hidden = true; });

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

    if (e.key === "Escape") {
      if (inspector.isOpen()) inspector.close();
      else if (graph.isOn()) {
        graph.set(false);
        dom.graphToggle.setAttribute("aria-pressed", "false");
      }
      return;
    }
    if (e.key === "g" || e.key === "G") {
      graph.toggle();
      dom.graphToggle.setAttribute("aria-pressed", String(graph.isOn()));
      return;
    }
    if (e.key === "k" || e.key === "K") {
      setMode(state.mode === MODES.DIRECT ? MODES.TRUSTED : MODES.DIRECT);
      return;
    }
    if (/^[1-9]$/.test(e.key)) {
      const tab = board.tabs[Number(e.key) - 1];
      if (tab) controller.navigate(tab.id);
      return;
    }
    // The tablist handles arrows when focus is inside it; this is the same
    // shortcut for when it is not, without letting both fire at once.
    if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !dom.nav.contains(e.target)) {
      controller.step(e.key === "ArrowRight" ? 1 : -1);
    }
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    inspector.reposition();
    controller.positionIndicator();
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => graph.redraw(), 140);
  });

  /* -------------------------------- helpers ------------------------------- */

  function setMode(next) {
    state.mode = next;
    const direct = next === MODES.DIRECT;
    document.body.classList.toggle("direct-mode", direct);
    dom.layerToggle.setAttribute("aria-pressed", String(direct));
    dom.layerToggle.textContent = direct
      ? "Return to the governed view"
      : "See it without the Knowledge Layer";
    dom.legendDot.dataset.tier = direct ? "red" : "green";
    dom.legendText.textContent = direct
      ? "Direct read · no semantic layer"
      : "Governed · Tableau semantic layer";

    inspector.closeNow();
    // Rebuild from the effective data, then re-run the entrance — so the
    // board is visibly rebuilt in the new mode rather than silently swapped.
    controller.rerenderAll();
    controller.replayActive();
    graph.redraw();
  }

  function highlight(ids, on) {
    (ids || []).forEach((id) => {
      const portlet = controller.get(id);
      if (!portlet) return;
      portlet.setHighlight(on);
      if (on) highlighted.add(id);
      else highlighted.delete(id);
    });
    dom.stage.classList.toggle("is-highlighting", highlighted.size > 0);
  }

  function clearHighlights() {
    Array.from(highlighted).forEach((id) => {
      const portlet = controller.get(id);
      if (portlet) portlet.setHighlight(false);
    });
    highlighted.clear();
    dom.stage.classList.remove("is-highlighting");
  }

  function reveal(id, delay = 0) {
    const portlet = controller.get(id);
    if (!portlet) return;
    const tabId = allPortlets.find((p) => p.id === id)?.tabId;
    if (tabId && tabId !== controller.activeId) controller.navigate(tabId);
    window.setTimeout(() => {
      portlet.el.classList.remove("is-pulsing");
      void portlet.el.getBoundingClientRect();
      portlet.el.classList.add("is-pulsing");
      window.setTimeout(() => portlet.el.classList.remove("is-pulsing"), 1400);
    }, delay);
  }

  if (fellBack) {
    note("Showing the embedded copy of the board — data/board.json could not be read. Serve over HTTP to load the file itself.", 0);
  }
}

loadBoard().then(boot);
