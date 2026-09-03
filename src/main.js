/* Boot and wiring.
 *
 * The data layer is deliberately shallow: one authored file, and an identical
 * copy embedded in JS so the board can never render blank if that file is
 * missing or malformed. There is no live tier and no remote call — the app is
 * a mock snapshot by design, and everything it claims about provenance is
 * authored content rather than a lookup. */

import { createTooltip } from "./tooltip.js";
import { createInspector } from "./inspector.js";
import { TabController } from "./tabs.js";
import { flattenPortlets, MODES } from "./semantic.js";
import { FALLBACK_BOARD } from "./fallback.js";

const dom = {
  stage: document.getElementById("stage"),
  scrim: document.getElementById("stage-scrim"),
  nav: document.getElementById("tabnav"),
  indicator: document.getElementById("tabnav-indicator"),
  tooltip: document.getElementById("tooltip"),
  layerToggle: document.getElementById("layer-toggle"),
  legend: document.getElementById("trust-legend"),
  auditHint: document.getElementById("audit-hint"),
  legendDot: document.querySelector(".trust-legend-dot"),
  legendText: document.getElementById("trust-legend-text"),
  topbarName: document.getElementById("topbar-name"),
  topbarEyebrow: document.getElementById("topbar-eyebrow"),
  notice: document.getElementById("notice"),
  noticeText: document.getElementById("notice-text"),
  noticeDismiss: document.getElementById("notice-dismiss"),
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

  dom.topbarName.textContent = meta.board || "Business Review";
  dom.topbarEyebrow.textContent = `${meta.org || ""} · ${meta.dataModeLabel || "Mock snapshot"}`.replace(/^ · /, "");
  /* `meta.period` still reaches the reader, through the document title and
   * every tab's kicker. `meta.freshness`, `meta.scope` and `meta.generatedAt`
   * no longer render anywhere board-wide, and that is the point of them:
   * both vary by measure, so they belong on the provenance face of the tile
   * whose measure they describe, which is where all 26 corrected portlets
   * carry their own. The board-level strings stay authored in board.json
   * because every per-portlet freshness string is derived from them. */
  dom.docTitle.textContent = `${meta.board || "Business Review"} · ${meta.period || ""}`.trim();

  const inspector = createInspector({
    stage: dom.stage,
    scrim: dom.scrim
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
      // Lets a tab borrow another tab's reading notes by portlet id, without
      // the rules being authored twice.
      specFor: (id) => allPortlets.find((p) => p.id === id) || null,
      note,
      reveal,
      onTabChange: () => clearHighlights()
    }
  });

  controller.init();
  dom.scrim.addEventListener("click", () => inspector.close());
  // Clicking anywhere off the reading-notes sheet closes it. The sheet itself
  // stops propagation, and so does its trigger, so this only ever sees clicks
  // that genuinely landed elsewhere.
  document.addEventListener("click", () => controller.closeNotes());

  /* ------------------------------- controls ------------------------------- */

  dom.layerToggle.addEventListener("click", () => {
    setMode(state.mode === MODES.DIRECT ? MODES.TRUSTED : MODES.DIRECT);
  });
  dom.noticeDismiss.addEventListener("click", () => { dom.notice.hidden = true; });

  /* Not scoped to the keydown target: a viewer who holds D and then clicks
   * something has moved focus, and the board must not stay stuck in the audit
   * pass because the keyup landed on a different element. window-level keyup
   * and a blur guard between them make the release unconditional. */
  document.addEventListener("keyup", (e) => {
    if (e.key === "d" || e.key === "D") document.body.classList.remove("auditing");
  });
  window.addEventListener("blur", () => document.body.classList.remove("auditing"));

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

    /* One Escape ladder, innermost first: the expanded portlet, then the
     * reading-notes sheet. */
    if (e.key === "Escape") {
      if (inspector.isOpen()) inspector.close();
      else if (controller.activeNotes() && controller.activeNotes().isOpen()) {
        controller.closeNotes();
      }
      return;
    }
    /* The audit pass. HELD, not toggled, and the distinction is the whole
     * design of it.
     *
     * A toggle invites the viewer to leave it on, and a board with the audit
     * left on is a reconciliation view — it would sit there showing certified
     * beside inferred, inviting someone to pick. This board reconciles nothing
     * and offers no resolution; the layer is not a correction applied after
     * the fact, it is where the definition lived in the first place. So the
     * pass answers "which of these moved, and by how much" for exactly as long
     * as the key is down, and then the board goes back to looking correct.
     *
     * The release is the argument. */
    if (e.key === "d" || e.key === "D") {
      if (e.repeat) return;
      if (state.mode !== MODES.DIRECT) {
        note("Nothing to audit — the board is already reading the governed measures.", 2600);
        return;
      }
      document.body.classList.add("auditing");
      return;
    }
    if (e.key === "i" || e.key === "I") {
      const notes = controller.activeNotes();
      if (notes) notes.toggle();
      else note("This tab states no reading rules of its own.", 3200);
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

  window.addEventListener("resize", () => {
    inspector.reposition();
    controller.positionIndicator();
  });

  /* -------------------------------- helpers ------------------------------- */

  function setMode(next) {
    state.mode = next;
    const direct = next === MODES.DIRECT;
    document.body.classList.toggle("direct-mode", direct);
    /* The switch reads as one object: the segment naming the current state is
     * lit and carries the tier dot, and the button offers the other state.
     * The full sentence each label used to carry moves to the title, where it
     * is available without spending 450px of topbar on it every frame. */
    dom.layerToggle.setAttribute("aria-pressed", String(direct));
    /* "Direct to source" rather than "Direct read".
     *
     * The old label named the ACT — reading directly — which is not the thing
     * in dispute; every board reads something directly. What is in dispute is
     * WHAT is read, and "to source" is the whole argument in two words: an
     * agent pointed at raw Salesforce objects and lakehouse tables instead of
     * at a layer where the business's definitions live. It also stops the
     * toggle implying that the governed side is somehow indirect or cached,
     * which "Direct read" did by contrast and which is false — governed is a
     * direct read too, of a different thing.
     *
     * It costs 30px more than "Direct read" and the topbar carries it at the
     * 1024 floor, verified. */
    dom.layerToggle.textContent = direct ? "Governed" : "Direct to source";
    dom.layerToggle.title = direct
      ? "Return to the governed view — Tableau semantic layer (K)"
      : "Read the same board straight from Salesforce and the lakehouse, with no semantic layer (K)";
    dom.legendDot.dataset.tier = direct ? "red" : "green";
    dom.legendText.textContent = direct ? "Direct to source" : "Governed";
    dom.legend.dataset.mode = direct ? "direct" : "governed";
    dom.legend.title = direct
      ? "Direct to source — raw Salesforce and lakehouse, no semantic layer. Hold D to audit the figures against the certified ones."
      : "Governed — Tableau semantic layer";
    /* The audit pass is a held key and therefore undiscoverable, so direct mode
     * says so once, quietly, beside the switch that got you here. It is absent
     * in governed mode because there is nothing there to audit. */
    dom.auditHint.hidden = !direct;
    controller.setTokenPill(direct);

    inspector.closeNow();
    // Rebuild from the effective data, then re-run the entrance — so the
    // board is visibly rebuilt in the new mode rather than silently swapped.
    // The reading notes go through the same path: their two diagrams collapse
    // into the same picture in direct mode, which is the degradation stated as
    // geometry, and it has to happen on the toggle rather than on next open.
    controller.rerenderAll();
    controller.rerenderNotes();
    controller.replayActive();
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
