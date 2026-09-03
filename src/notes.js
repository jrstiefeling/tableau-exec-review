/* The per-tab reading notes, behind an (i) in the panel head.
 *
 * These are the rules the tab applies to every mark on it — comparability,
 * scaling, polarity, the stated colour threshold. They used to be a portlet:
 * "How these tabs read", "How this matrix reads", "How this tab reads", one
 * full grid slot each on three tabs, and each one internally scrolled. So
 * they were simultaneously the most intrusive and the least readable thing on
 * their tab, and they were spending a slot on content you read once.
 *
 * Behind an affordance they cost nothing at rest and are legible when opened,
 * which is the right shape for read-once material — and the three slots they
 * were holding go to the charts, which is where the height had to come from.
 *
 * Why this is NOT the provenance dot
 * ----------------------------------
 * The two affordances differ in scope, and scope is exactly what an
 * affordance has to communicate.
 *
 *   The trust dot is per portlet. It answers "where did THIS NUMBER come
 *   from" — certified definition, semantic model, grain, row-level scope, and
 *   what this specific tile degrades to without any of it. It carries the
 *   tier colour, which is the board's whole argument, and it belongs on the
 *   card because it is about the card.
 *
 *   The (i) is per tab. It answers "how do I read THESE MARKS" — and the
 *   answer is identical for every portlet on the tab.
 *
 * Consolidating them would mean either repeating four tab-level rules on
 * twenty-nine provenance faces, or attaching them to one arbitrarily chosen
 * card. Both are worse than two affordances that are honestly two different
 * questions. They are also never adjacent and never look alike: the dot is a
 * filled tier-coloured ring in a portlet head, the (i) is an outlined glyph in
 * the panel head beside the headline.
 *
 * The rules content itself is unchanged — same renderer, same authored specs,
 * same diagrams, same veil list. What changed is where it lives. The build
 * runs on open under its own AbortController and the curtain is re-primed on
 * close, so the diagrams keep their draw-on and a rules panel opened mid-sweep
 * cannot leave a half-drawn mark behind. */

import { chartFor } from "./charts/index.js";
import { effectivePortlet, resolveAccent, tierOf, MODES } from "./semantic.js";

export class TabNotes {
  constructor({ tab, specs, deps }) {
    this.tab = tab;
    this.specs = specs;
    this.deps = deps;
    this.charts = [];
    this.controller = null;
    this.open = false;
  }

  /* Builds the trigger and the sheet into the panel head. The sheet is
   * absolutely positioned out of the head's flex flow and anchored to its
   * bottom edge, which means it lands under the headline at whatever height
   * the headline resolved to without anything being measured. */
  mount(panel, head) {
    const id = `notes-${this.tab.id}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "panel-info";
    button.id = `${id}-btn`;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", id);
    button.setAttribute("aria-label", `How to read this tab — ${this.tab.label}`);
    button.innerHTML = "<span class='panel-info-glyph' aria-hidden='true'>i</span>";
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });
    this.deps.tip(button, "How to read this tab — the rules applied to every mark on it (i)");
    head.appendChild(button);

    const sheet = document.createElement("div");
    sheet.className = "panel-notes";
    sheet.id = id;
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "false");
    sheet.setAttribute("aria-labelledby", `${id}-title`);
    sheet.hidden = true;

    const sheetHead = document.createElement("header");
    sheetHead.className = "panel-notes-head";
    const eyebrow = document.createElement("p");
    eyebrow.className = "panel-notes-eyebrow";
    eyebrow.textContent = "How to read this tab";
    const title = document.createElement("h3");
    title.className = "panel-notes-title";
    title.id = `${id}-title`;
    sheetHead.appendChild(eyebrow);
    sheetHead.appendChild(title);

    const close = document.createElement("button");
    close.type = "button";
    close.className = "panel-notes-close";
    close.setAttribute("aria-label", "Close reading notes");
    close.textContent = "×";
    close.addEventListener("click", (e) => {
      e.stopPropagation();
      this.set(false);
    });
    sheetHead.appendChild(close);

    const body = document.createElement("div");
    body.className = "panel-notes-body";

    sheet.appendChild(sheetHead);
    sheet.appendChild(body);
    // Clicks inside the sheet must not reach the document listener that
    // closes it.
    sheet.addEventListener("click", (e) => e.stopPropagation());
    head.appendChild(sheet);

    this.button = button;
    this.sheet = sheet;
    this.title = title;
    this.body = body;

    this.render();
    return button;
  }

  /* Re-derives the content from the effective data. Called on mount and on
   * every Knowledge Layer toggle, through the same path a portlet takes, so
   * the rules degrade in direct mode exactly as they did when they were a
   * portlet — the two trend diagrams collapse into the same picture, because
   * nothing declares one measure a flow and the other a stock. */
  render() {
    this.cancel();
    this.charts = [];
    this.body.innerHTML = "";
    this.title.textContent = this.specs.map((spec) => spec.label).join(" · ");

    const mode = this.deps.mode();
    const isDirect = mode === MODES.DIRECT;

    this.specs.forEach((spec) => {
      const group = document.createElement("section");
      group.className = "panel-notes-group";

      if (spec.sublabel) {
        const sub = document.createElement("p");
        sub.className = "panel-notes-sub";
        sub.textContent = spec.sublabel;
        group.appendChild(sub);
      }

      const host = document.createElement("div");
      host.className = "panel-notes-rules";
      group.appendChild(host);
      this.body.appendChild(group);

      const mountChart = chartFor(spec.kind);
      if (!mountChart) return;
      const chart = mountChart(host, {
        id: spec.id,
        label: spec.label,
        sublabel: spec.sublabel,
        accent: resolveAccent(spec, mode),
        metrics: (effectivePortlet(spec, mode).metrics) || {},
        portlet: spec,
        tab: this.tab,
        mode,
        isDirect,
        tier: tierOf(spec, mode),
        tip: this.deps.tip,
        highlight: this.deps.highlight,
        labelFor: this.deps.labelFor,
        note: this.deps.note,
        reveal: this.deps.reveal
      });
      if (chart) this.charts.push(chart);
    });

    // A re-render while the sheet is open has to leave it looking open, so the
    // freshly mounted (and freshly veiled) content is drawn straight away.
    if (this.open) this.build();
    else this.prime();
  }

  prime() {
    this.charts.forEach((chart) => chart.prime && chart.prime());
  }

  build() {
    this.cancel();
    this.controller = new AbortController();
    const { signal } = this.controller;
    this.charts.forEach(async (chart) => {
      await chart.build(signal);
      if (!signal.aborted && chart.settle) chart.settle();
    });
  }

  cancel() {
    if (this.controller) this.controller.abort();
    this.controller = null;
  }

  set(next) {
    if (next === this.open) return;
    this.open = next;
    this.sheet.hidden = !next;
    this.button.setAttribute("aria-expanded", String(next));
    this.button.classList.toggle("is-open", next);

    if (next) {
      // Layout has to be flushed before the diagrams draw: getTotalLength()
      // on a path inside a `hidden` subtree returns 0, and strokeDraw treats
      // that as "nothing to reveal" and jumps the mark to its final state.
      void this.sheet.getBoundingClientRect();
      this.build();
      this.sheet.classList.add("is-live");
      this.close_ = this.sheet.querySelector(".panel-notes-close");
      if (this.close_) this.close_.focus({ preventScroll: true });
    } else {
      this.cancel();
      this.sheet.classList.remove("is-live");
      this.prime();
      this.button.focus({ preventScroll: true });
    }
  }

  toggle() {
    this.set(!this.open);
  }

  isOpen() {
    return this.open;
  }
}
