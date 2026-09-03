/* A portlet: one metric or one narrative block, plus the provenance behind it.
 *
 * Every portlet has two faces. The front is the number. The back is where the
 * number came from — the certified definition, the semantic model, the grain,
 * the lineage, the row-level scope, and what this specific tile degrades to
 * without any of it. That pairing is the whole argument of the board: the
 * provenance is not a footnote on a separate page, it is the reverse side of
 * the thing you are already looking at.
 *
 * Each portlet owns its own build lifecycle and its own AbortController, so
 * charts enter independently and a tab switch cancels them cleanly. */

import { chartFor } from "./charts/index.js";
import { effectivePortlet, resolveAccent, tierOf, detectOf, tierMeta, MODES } from "./semantic.js";

/* Fields that exist only because a semantic layer asserts them. In direct
 * mode these are struck rather than hidden — the point is that they were
 * being relied on, not that they were never there. */
const SEMANTIC_ONLY = new Set(["sdm", "measure", "grain", "rls", "certifiedBy", "freshness"]);

const PROVENANCE_FIELDS = [
  { key: "sdm", label: "Semantic model" },
  { key: "measure", label: "Certified measure" },
  { key: "grain", label: "Grain" },
  { key: "rls", label: "Row-level scope" },
  { key: "certifiedBy", label: "Certified by" },
  { key: "freshness", label: "Freshness" },
  { key: "dashboard", label: "Dashboard" }
];

/* The two vocabularies the trust dot compresses, spelled out for anyone who
 * cannot see a glyph or hover a tooltip. */
const DETECT_LABEL = {
  silent: ", and the figure shown is wrong with nothing in the picture to say so",
  catchable: ", and the figure shown is wrong by an amount a magnitude check would find"
};
const DETECT_TIP = {
  silent: " The figure on this tile moved, and nothing about how it renders says so.",
  catchable: " The figure on this tile moved by an amount its own shape gives away."
};

const BREAKDOWN_ROWS = [
  /* `shownFrom` leads: it is the arithmetic that turns the governed figure into
     the one on the tile, and it is the only row that lets a reader check the
     claim rather than take it. */
  { key: "shownFrom", label: "Shown from" },
  { key: "wouldYouNotice", label: "Would you notice" },
  { key: "missing", label: "Missing" },
  { key: "effect", label: "Effect" },
  { key: "thesis", label: "Thesis" },
  { key: "risk", label: "Risk" },
  { key: "trustCost", label: "Cost" }
];

export class Portlet {
  constructor(spec, deps) {
    this.spec = spec;
    this.deps = deps;
    this.el = null;
    this.body = null;
    this.back = null;
    this.chart = null;
    this.controller = null;
  }

  get id() {
    return this.spec.id;
  }

  mount(parent) {
    const el = document.createElement("article");
    el.className = "portlet";
    el.dataset.portlet = this.spec.id;
    el.dataset.kind = this.spec.kind;
    el.tabIndex = 0;
    el.setAttribute("aria-label", `${this.spec.label} — ${this.spec.sublabel || ""}`.trim());

    const shell = document.createElement("div");
    shell.className = "portlet-shell";

    const front = document.createElement("div");
    front.className = "portlet-face portlet-front";
    front.appendChild(this.buildHead());

    const body = document.createElement("div");
    body.className = "portlet-body";
    front.appendChild(body);

    /* The audit overlay, built once and empty until it has something to say.
     * Absolutely positioned so that holding D costs no reflow: 27 portlets
     * reflowing on a keydown would make the pass feel like a page change,
     * where it has to feel like a light being shone on a page that is already
     * there. */
    const audit = document.createElement("p");
    audit.className = "portlet-audit";
    audit.setAttribute("aria-live", "polite");
    front.appendChild(audit);

    const back = document.createElement("div");
    back.className = "portlet-face portlet-back";

    shell.appendChild(front);
    shell.appendChild(back);
    el.appendChild(shell);

    const close = document.createElement("button");
    close.type = "button";
    close.className = "portlet-close";
    close.setAttribute("aria-label", "Close expanded portlet");
    close.textContent = "×";
    close.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deps.inspector.close();
    });
    el.appendChild(close);

    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (e.target !== el) return;
      e.preventDefault();
      this.expand();
    });

    this.el = el;
    this.body = body;
    this.back = back;
    this.auditEl = audit;
    parent.appendChild(el);
    this.render();
    return el;
  }

  buildHead() {
    const head = document.createElement("header");
    head.className = "portlet-head";

    const titles = document.createElement("div");
    titles.className = "portlet-titles";
    const label = document.createElement("p");
    label.className = "portlet-label";
    label.textContent = this.spec.label;
    titles.appendChild(label);
    if (this.spec.sublabel) {
      const sub = document.createElement("p");
      sub.className = "portlet-sublabel";
      sub.textContent = this.spec.sublabel;
      titles.appendChild(sub);
    }
    head.appendChild(titles);

    const tools = document.createElement("div");
    tools.className = "portlet-tools";

    const expand = document.createElement("button");
    expand.type = "button";
    expand.className = "portlet-expand";
    expand.setAttribute("aria-label", `Expand ${this.spec.label} to exact values`);
    expand.innerHTML = "<span aria-hidden='true'></span>";
    expand.addEventListener("click", (e) => {
      e.stopPropagation();
      this.expand();
    });
    tools.appendChild(expand);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "trust-dot";
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      this.inspectProvenance();
    });
    tools.appendChild(dot);

    head.appendChild(tools);
    this.trustDot = dot;
    return head;
  }

  /* Holds the provenance mark at its GOVERNED reading.
   *
   * This is the hinge of the whole reveal. The degraded board renders at full
   * confidence — same palette, same sentiment, same typography — so for the
   * first second and a half after the toggle there is nothing on screen to say
   * anything has changed except the figures themselves, which nobody has
   * memorised. The board looks fine. It IS the board, in the shape an
   * executive would accept without a second look.
   *
   * Then the marks land, and they land as a CHANGE rather than as a state: a
   * dot that was green goes red, and the four that were amber stay amber. What
   * the eye reads is not "these are the untrustworthy panels" but "these are
   * the panels that just moved" — and the ones that did not move are the ones
   * that never went through the layer. The control group identifies itself by
   * sitting still.
   *
   * Doing this by withholding the mark rather than by animating the figures is
   * also the only honest option. A screenshot taken at any point in the sweep
   * shows real provenance or none, never a wrong one. */
  primeMarks() {
    if (!this.marks) return;
    this.el.classList.add("marks-pending");
    this.el.dataset.tier = this.marks.from;
    this.el.dataset.detect = "none";
    this.el.style.setProperty("--tier-color", tierMeta(this.marks.from).color);
    this.trustDot.dataset.tier = this.marks.from;
    this.trustDot.dataset.detect = "none";
  }

  landMarks() {
    if (!this.marks) return;
    this.el.classList.remove("marks-pending");
    const moved = this.marks.from !== this.marks.tier || this.marks.detect !== "none";
    this.el.dataset.tier = this.marks.tier;
    this.el.dataset.detect = this.marks.detect;
    this.el.style.setProperty("--tier-color", tierMeta(this.marks.tier).color);
    this.trustDot.dataset.tier = this.marks.tier;
    this.trustDot.dataset.detect = this.marks.detect;
    /* Only the dots that actually change get the flare. A pulse on all 27
       would be decoration; a pulse on the 17 that moved is information, and it
       makes the four that hold still legible as a deliberate group rather than
       as portlets the sweep happened to miss. */
    if (moved) {
      this.trustDot.classList.remove("is-landing");
      void this.trustDot.offsetWidth;
      this.trustDot.classList.add("is-landing");
    }
  }

  /* Re-derives everything that depends on mode. Called on mount and again on
   * every Knowledge Layer toggle, so a portlet's chart, colours and
   * provenance are genuinely rebuilt from the effective data rather than
   * filtered over the trusted render. */
  render() {
    this.cancel();

    const mode = this.deps.mode();
    const isDirect = mode === MODES.DIRECT;
    const tier = tierOf(this.spec, mode);
    const detect = detectOf(this.spec, mode);
    const accent = resolveAccent(this.spec, mode);
    const effective = effectivePortlet(this.spec, mode);
    const meta = tierMeta(tier);

    /* Stage three of the choreography needs two readings of the same portlet:
       where the figure comes from with the layer in place, and where it comes
       from without. Both are computed here, on the render that already knows
       the mode, and the sweep in tabs.js decides when the second one lands. */
    this.marks = {
      from: tierOf(this.spec, MODES.TRUSTED),
      tier,
      detect
    };
    this.el.dataset.tier = tier;
    /* Detectability rides on the same element as the tier, because it is
       rendered INSIDE the tier dot rather than beside it. An earlier draft gave
       each portlet a separate warning chip, which put three affordances in a
       head that has room for two and truncated the KPI titles to "Churned
       annua…" at 1024. Provenance and detectability are two readings of one
       fact, so they share one mark. */
    this.el.dataset.detect = detect;
    this.el.style.setProperty("--accent", accent);
    this.el.style.setProperty("--tier-color", meta.color);
    /* Cleared before the chart mounts, not after. A chart whose surface is
       tinted by its own sentiment writes --tone-color and data-surface on this
       element (the attainment cards do, and the two narrative rails); every
       other chart must not inherit whatever the last render left behind, and a
       mode toggle re-renders all of them. */
    this.el.style.removeProperty("--tone-color");
    delete this.el.dataset.surface;

    this.trustDot.dataset.tier = tier;
    this.trustDot.dataset.detect = detect;
    /* Screen readers get the sentence the glyph is a shorthand for. A bare "!"
       is not a label. */
    this.trustDot.setAttribute(
      "aria-label",
      `${this.spec.label} provenance — ${meta.label}${DETECT_LABEL[detect] || ""}`
    );
    this.deps.tip(
      this.trustDot,
      isDirect
        ? `${meta.label}.${DETECT_TIP[detect] || ""} ${(this.spec.directMode || {}).missing || ""} Open for the full read.`
        : `Governed · ${(this.spec.semantic || {}).measure || "narrative"} · ${(this.spec.semantic || {}).freshness || ""}. Open for definition, grain, lineage and row-level scope.`
    );

    /* The audit line: the certified figure, and the distance from it.
     *
     * Present only where a figure actually moved. Sixteen panels state a
     * distance; the five supplemented panels with no certified counterpart
     * state instead that no such number exists (the branch below); the six
     * narrative ones have nothing to say either way and holding D leaves them
     * completely untouched.
     *
     * That last group is the most useful thing the pass does. A viewer holding
     * the key sees six panels sitting there unmarked and learns, without being
     * told, that the layer was never what was holding those six up.
     *
     * This comment used to say eleven were left unmarked, which stopped being
     * true the moment the "absent" branch below was added: those five are
     * marked, in amber, and being marked is the whole point of them. */
    const dmAudit = this.spec.directMode || {};
    /* Only a SCALAR hero can be quoted here. On the Five Year panels `display`
       is the five-point series, and joining it produced an audit line reading
       "certified $623 M,$608 M,$551 M,$496 M,$150 M" across two lines and over
       the axis. Those panels fall back to the delta alone, which already says
       how many of the five points moved. */
    const heroDisplay = (this.spec.metrics || {}).display;
    const governedHero = typeof heroDisplay === "string" ? heroDisplay : null;
    const moved = detect !== "none";
    delete this.el.dataset.audit;
    this.auditEl.textContent = "";
    if (isDirect && moved && dmAudit.certifiedDelta) {
      this.auditEl.textContent = governedHero
        ? `certified ${governedHero} · ${dmAudit.certifiedDelta}`
        : `off certified by ${dmAudit.certifiedDelta}`;
      this.el.dataset.audit = "on";
    } else if (isDirect && dmAudit.provenance === "supplemented") {
      /* Not "unchanged", which is what this said first and which is not quite
       * true. These five panels did not hold steady against a certified
       * figure — there is no certified figure for them to have held steady
       * against. AE capacity, AOV and revenue have no measure in either model
       * (§10.1, confirmed by the model owner), and the AE productivity fan has
       * a certified measure over a population nothing can certify, so the audit
       * pass has nothing to lay beside any of them — and saying so is more use
       * than a green tick.
       *
       * It also completes the pass's argument. Holding D marks sixteen panels
       * with a distance from a certified number and five with the observation
       * that no such number exists — which is the difference between "the layer
       * was protecting this and now it is not" and "the layer was never here".
       *
       * Sixteen and five rather than seventeen and four since the exec fan was
       * repointed off account ACV: the account-level data does not exist, so the
       * panel that was one of the board's five certified portlets is now one of
       * its supplemented ones. */
      this.auditEl.textContent = "no certified figure exists to compare";
      this.el.dataset.audit = "absent";
    }

    /* A re-render mid-sweep must not undo the priming. rerenderAll() runs on
       every mode toggle and lands before the sweep is scheduled, so without
       this the marks would be written once at their final value and stage
       three would have nothing left to reveal. */
    if (this.el.classList.contains("marks-pending")) this.primeMarks();

    this.body.innerHTML = "";
    const mountChart = chartFor(this.spec.kind);
    if (mountChart) {
      this.chart = mountChart(this.body, {
        id: this.spec.id,
        label: this.spec.label,
        sublabel: this.spec.sublabel,
        accent,
        metrics: effective.metrics || {},
        portlet: this.spec,
        tab: this.deps.tab,
        mode,
        isDirect,
        tier,
        tip: this.deps.tip,
        highlight: this.deps.highlight,
        labelFor: this.deps.labelFor,
        note: this.deps.note,
        reveal: this.deps.reveal
      });
    }

    this.el.dataset.hasDetail = this.body.querySelector(".portlet-detail") ? "true" : "false";
    this.renderProvenance(tier, isDirect);
  }

  renderProvenance(tier, isDirect) {
    const s = this.spec.semantic || {};
    const dm = this.spec.directMode;
    const back = this.back;
    back.innerHTML = "";

    const head = document.createElement("header");
    head.className = "prov-head";
    const eyebrow = document.createElement("p");
    eyebrow.className = "prov-eyebrow";
    eyebrow.textContent = isDirect ? "Direct to source · no semantic layer" : "Semantic provenance";
    const title = document.createElement("h3");
    title.className = "prov-title";
    title.textContent = s.metricName || this.spec.label;
    head.appendChild(eyebrow);
    head.appendChild(title);
    back.appendChild(head);

    if (s.definition) {
      const def = document.createElement("p");
      def.className = "prov-definition";
      def.textContent = s.definition;
      if (isDirect) def.dataset.struck = "true";
      back.appendChild(def);
    }

    const grid = document.createElement("dl");
    grid.className = "prov-grid";
    PROVENANCE_FIELDS.forEach(({ key, label }) => {
      const value = s[key];
      if (!value) return;
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      // In direct mode the semantic-layer assertions are struck rather than
      // removed, so you can see what was being leaned on.
      if (isDirect && SEMANTIC_ONLY.has(key)) {
        const s2 = document.createElement("s");
        s2.className = `strike strike-${tier}`;
        s2.textContent = value;
        dd.appendChild(s2);
      } else {
        dd.textContent = value;
      }
      grid.appendChild(dt);
      grid.appendChild(dd);
    });
    back.appendChild(grid);

    if ((s.lineage || []).length) back.appendChild(this.buildLineage(s, isDirect, tier));

    if (s.why && !isDirect) {
      const why = document.createElement("p");
      why.className = "prov-why";
      why.textContent = s.why;
      back.appendChild(why);
    }
    if (s.polarityNote && !isDirect) {
      const note = document.createElement("p");
      note.className = "prov-note";
      note.textContent = s.polarityNote;
      back.appendChild(note);
    }

    if (dm) back.appendChild(this.buildBreakdown(dm, tier));
  }

  /* The lineage chain: raw sources on the left, the certified measure on the
   * right, an arrow between them. Direct mode keeps the sources — those are
   * real tables and they do not go anywhere — and breaks the arrow, because
   * what disappears is the assertion that those tables add up to this
   * measure, not the tables themselves. */
  buildLineage(s, isDirect, tier) {
    const wrap = document.createElement("div");
    wrap.className = "prov-lineage";

    const caption = document.createElement("p");
    caption.className = "prov-subhead";
    caption.textContent = "Lineage";
    wrap.appendChild(caption);

    const chain = document.createElement("div");
    chain.className = "lineage";

    (s.lineage || []).forEach((source, i) => {
      if (i) chain.appendChild(node("span", "lineage-join", "+"));
      chain.appendChild(node("span", "lineage-node", source));
    });

    const arrow = document.createElement("span");
    arrow.className = "lineage-arrow";
    if (isDirect) arrow.dataset.broken = "true";
    arrow.setAttribute("aria-label", isDirect ? "resolves to — link broken" : "resolves to");
    chain.appendChild(arrow);

    const target = document.createElement("span");
    target.className = "lineage-node is-measure";
    if (isDirect) {
      target.dataset.tier = tier;
      target.textContent = s.measure ? "no certified measure" : "no certified definition";
    } else {
      target.textContent = s.measure || "narrative, tagged to measures";
    }
    chain.appendChild(target);

    wrap.appendChild(chain);

    if ((s.derivedFrom || []).length) {
      const derived = document.createElement("p");
      derived.className = "prov-derived";
      derived.textContent = `Derived from ${s.derivedFrom.join(" ÷ ")}`;
      wrap.appendChild(derived);
    }

    return wrap;

    function node(tag, className, textContent) {
      const el = document.createElement(tag);
      el.className = className;
      el.textContent = textContent;
      return el;
    }
  }

  /* This card is always the counterfactual, whichever mode you are reading it
   * in — so it is tinted and badged with the tier the metric would fall to
   * without the semantic layer, not the tier it currently enjoys. Tinting it
   * green while it explains what breaks would have the colour arguing against
   * the words. */
  buildBreakdown(dm, tier) {
    const degradedTier = dm.tier || tier;
    const degradedMeta = tierMeta(degradedTier);

    const card = document.createElement("section");
    card.className = "prov-breakdown";
    card.dataset.tier = degradedTier;
    card.style.setProperty("--tier-color", degradedMeta.color);

    const head = document.createElement("div");
    head.className = "pb-head";
    const badge = document.createElement("span");
    badge.className = "pb-badge";
    badge.textContent = degradedMeta.short;
    const heading = document.createElement("p");
    heading.className = "pb-heading";
    heading.textContent = "Read straight from source";
    head.appendChild(badge);
    head.appendChild(heading);
    card.appendChild(head);

    if ((dm.candidates || []).length) {
      const candidates = document.createElement("div");
      candidates.className = "pb-candidates";
      dm.candidates.forEach((value) => {
        const chip = document.createElement("span");
        chip.className = "pb-candidate";
        chip.textContent = value;
        candidates.appendChild(chip);
      });
      card.appendChild(candidates);
    }

    BREAKDOWN_ROWS.forEach(({ key, label }) => {
      const value = dm[key];
      if (!value) return;
      const row = document.createElement("div");
      row.className = `pb-row pb-row-${key}`;
      const tag = document.createElement("span");
      tag.className = "pb-tag";
      tag.textContent = key === "thesis" ? dm.thesisTag || "Thesis" : label;
      const body = document.createElement("span");
      body.className = "pb-text";
      body.textContent = value;
      row.appendChild(tag);
      row.appendChild(body);
      card.appendChild(row);
    });

    return card;
  }

  /* --------------------------------- state -------------------------------- */

  expand() {
    this.deps.inspector.open(this.el, { flip: false });
  }

  inspectProvenance() {
    const alreadyOpen = this.deps.inspector.current() === this.el;
    if (alreadyOpen) {
      this.deps.inspector.toggleFlip();
      return;
    }
    this.deps.inspector.open(this.el, { flip: true });
  }

  /* Hides everything the chart is about to draw. The choreographer calls this
   * across the whole tab before stage 1 begins, so the shells arrive as empty
   * frames rather than as finished charts waiting to be wiped and redrawn. */
  primeChart() {
    if (this.chart && this.chart.prime) this.chart.prime();
  }

  build(delay = 0) {
    this.cancel();
    this.controller = new AbortController();
    const { signal } = this.controller;
    this.el.classList.add("is-live");
    this.primeChart();

    const run = async () => {
      if (signal.aborted || !this.chart) return;
      const chart = this.chart;
      await chart.build(signal);
      // Whatever the sequence did not reach — a conditional marker, a branch
      // this metric skips — is restored rather than left veiled.
      if (!signal.aborted && chart.settle) chart.settle();
    };

    if (delay > 0) {
      const timer = window.setTimeout(run, delay);
      signal.addEventListener("abort", () => window.clearTimeout(timer), { once: true });
    } else {
      run();
    }
  }

  cancel() {
    if (this.controller) this.controller.abort();
    this.controller = null;
  }

  setHighlight(on) {
    this.el.classList.toggle("is-highlit", Boolean(on));
  }

  destroy() {
    this.cancel();
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }
}
