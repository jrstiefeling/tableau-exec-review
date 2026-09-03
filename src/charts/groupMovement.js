/* What moved a group's dollars, decomposed by the lines inside it.
 *
 * This replaces the growth-dispersion panel that stood here, and the swap is
 * a change of measure rather than of mark. That panel drew the interval
 * between the slowest and fastest Y/Y inside a group and printed its width in
 * percentage points. Its own provenance face cited the layer's rule that a
 * Y/Y is non-additive — and then printed the arithmetic difference of two
 * Y/Y figures as the largest numeral on the card. Two rates off different
 * bases do not subtract: a line growing +1060% off $0.17M and a line at −16%
 * off $4.8M are 1076 points apart chiefly because the first base was small,
 * so ranking four segments by that width ranked them by how small Tableau
 * Next was a year ago in each. It ranked them in exactly that order.
 *
 * Dollars subtract. The measure here is the change in ACV_clc between the
 * prior period and this one, which is the certified additive measure the
 * layer guarantees aggregates across grains — so a line's movement is
 * commensurable with every other line's, and the pieces of a wing can be laid
 * end to end because their lengths mean the same thing.
 *
 * Two wings off a centre rule, not a waterfall. A waterfall would have to
 * close on an authored group total, and it does not: the leaves land $0.06M
 * to $0.60M off the authored total row, CMRCL's dollars do not close at any
 * level, and the two tabs disagree by $1M on three rows. So the panel draws
 * only the lines it names, labels its net as the net of those lines, and
 * publishes no bridge and no cross-group sum — the inconsistencies render
 * faithfully and silently, and there is nothing here that could surface one.
 *
 * Fill is sentiment and side of the rule is sign, so the panel needs no hue
 * legend and drains with the palette in direct mode. Within a wing the
 * largest mover sits nearest the rule and the pieces run outward, which is
 * the one convention the reader has to be told; the key tells them, in the
 * panel, where they are.
 *
 * Both placements run this one renderer. The segment side column stacks four
 * groups over a shared axis; the product strip turns the same rows into a row
 * of two, from CSS on the band alone — the same turn the panel it replaced
 * made, and for the same reason. */

import { chartRoot, svgEl, group, linearScale } from "../svg.js";
import { palette, toneOf, toneColor, tierMeta } from "../palette.js";
import { strokeDraw, fadeIn, growFrom, stagger, wait, veil } from "../anim.js";

/* The row box, in user units. Width is arbitrary — the SVG stretches to its
 * column with preserveAspectRatio="none" and every glyph of text is DOM, so
 * nothing in here scales with the container. 300 is round enough that the
 * tick offsets below print as short percentages. */
/* barH is most of h deliberately. The remainder is the centre rule's overhang
 * above and below the bar, which is what makes it read as the origin the
 * pieces are measured from rather than as a join between them — and no more
 * than that, because the box is stretched to --bar-h and every unit of
 * padding here is a unit of empty card there. */
const BOX = { w: 300, h: 22, barTop: 2, barH: 18 };

/* A piece narrower than this cannot hold "Server" at 9.5px, so it labels on
 * hover and in the expand instead of overprinting itself. Measured against
 * the narrowest plot either placement produces (~226px in the segment
 * column), which is the case that has to hold. */
const LABEL_MIN_PCT = 13;

/* One sweep, four beats, left to right — the rule before the marks it
 * measures from, then the wings outward from it. The per-row step nests the
 * panel's own cascade inside the page sweep rather than fighting it. */
const TEMPO = { row: 96, rule: 300, loss: 560, gain: 520, piece: 70 };

export function mount(host, ctx) {
  const { metrics, tier, isDirect } = ctx;
  const p = palette();
  const meta = tierMeta(tier);

  const rows = metrics.rows || [];
  const good = metrics.goodDirection || "up";
  const domain = metrics.domain || [-1, 1];
  const ticks = metrics.axisTicks || [0];
  const degraded = isDirect && (tier === "red" || tier === "grey");

  const x = linearScale(domain, [0, BOX.w]);
  const zeroX = x(0);
  const pct = (units) => (units / BOX.w) * 100;

  const wrap = document.createElement("div");
  wrap.className = "movement";
  wrap.dataset.tier = tier;
  if (degraded) wrap.dataset.degraded = "true";

  /* ------------------------------- the rows ------------------------------- */

  const rowNodes = rows.map((row, index) => buildRow(row, index));

  const rowsEl = document.createElement("div");
  rowsEl.className = "movement-rows";
  rowNodes.forEach((r) => rowsEl.appendChild(r.el));
  wrap.appendChild(rowsEl);

  const axisNodes = buildAxis();
  const keyNodes = buildKey();

  const foot = document.createElement("div");
  foot.className = "movement-foot";

  const axisNoteEl = document.createElement("p");
  axisNoteEl.className = "movement-axisnote";
  axisNoteEl.textContent = metrics.axisNote || "";
  foot.appendChild(axisNoteEl);

  const captionEl = document.createElement("p");
  captionEl.className = "movement-caption";
  captionEl.textContent = metrics.caption || "";
  foot.appendChild(captionEl);

  wrap.appendChild(foot);
  wrap.appendChild(buildDetail());
  host.appendChild(wrap);

  /* Builds one group: its name and net over a two-wing bar on the shared
   * scale. The pieces are ordered largest-first outward from the rule, which
   * is why the reduce below walks each wing from the rule rather than from
   * the domain edge — a piece's offset is the sum of everything inside it. */
  function buildRow(row, index) {
    const el = document.createElement("div");
    el.className = "movement-row";
    el.dataset.row = String(index);

    const head = document.createElement("div");
    head.className = "movement-head";

    const name = document.createElement("div");
    name.className = "movement-name";
    // Not struck. A strike says "do not read this", which is the one service
    // no raw source performs — the inferred grouping arrives named, plausible
    // and unqualified, and the panel renders it that way.
    name.textContent = row.label;
    ctx.tip(name, degraded
      ? `${row.fullLabel} — grouping unresolved, so the lines below it are a selection rather than a partition`
      : `${row.fullLabel} · net ${row.netDisplay} across the ${row.parts.length} lines shown`);
    head.appendChild(name);

    const net = document.createElement("div");
    net.className = "movement-net";
    // Sentiment is painted from the palette rather than keyed in CSS, which is
    // how every chart here does it and what lets the direct-mode drain arrive
    // through the same path as the normal palette.
    net.style.color = toneColor(toneOf(row.net, good, { softBand: 0 }));
    net.textContent = degraded ? "—" : row.netDisplay;
    ctx.tip(net, `Net of the ${row.parts.length} lines drawn here, ${row.fullLabel}. Not a group total: the panel decomposes the lines it names and claims nothing beyond them.`);
    head.appendChild(net);

    el.appendChild(head);

    const plot = document.createElement("div");
    plot.className = "movement-plot";

    const svg = chartRoot(BOX.w, BOX.h, {
      preserveAspectRatio: "none",
      class: "movement-svg",
      label: `${row.fullLabel}: net ${row.netDisplay} across ${row.parts.length} product lines`
    });

    const marks = group();
    svg.appendChild(marks);

    /* The centre rule. Full height and drawn first: it is the origin every
     * piece is measured from, and both wings grow out of it.
     *
     * Inked at inkDim rather than at the axis tint every other rule on the
     * board uses. Those sit under marks in open space; this one is covered by
     * its own bar along all but 4px of its length, and 4px of a 0.22-alpha
     * hairline is not a mark. What is left has to carry zero. */
    const rule = svgEl("line", {
      x1: zeroX, y1: 0, x2: zeroX, y2: BOX.h,
      stroke: p.inkDim,
      "stroke-width": 1,
      "vector-effect": "non-scaling-stroke",
      class: "movement-rule"
    });
    marks.appendChild(rule);

    const losses = row.parts.filter((q) => q.delta < 0)
      .sort((a, b) => a.delta - b.delta);
    const gains = row.parts.filter((q) => q.delta > 0)
      .sort((a, b) => b.delta - a.delta);

    const pieces = [];
    const tags = [];

    const wing = (list, dir) => {
      let cursor = 0;
      list.forEach((q, i) => {
        const span = Math.abs(x(Math.abs(q.delta)) - zeroX);
        if (span <= 0) return;
        // A hairline of surface between pieces, so a wing reads as several
        // lines end to end rather than as one bar. Taken off the outer edge,
        // never off the inner one — a gap at the rule would read as a value.
        const gap = i === list.length - 1 ? 0 : 1;
        const drawn = Math.max(0.5, span - gap);
        const x0 = dir < 0 ? zeroX - cursor - drawn : zeroX + cursor;

        const tone = toneOf(q.delta, good, { softBand: 0 });
        const rect = svgEl("rect", {
          x: x0, y: BOX.barTop, width: drawn, height: BOX.barH,
          fill: toneColor(tone),
          // A gentle step outward from the rule, enough to separate adjacent
          // pieces alongside the hairline between them without the outermost
          // one reading as a different, fainter category.
          "fill-opacity": 1 - i * 0.11,
          class: "movement-piece",
          "data-tone": tone
        });
        marks.appendChild(rect);
        pieces.push(rect);

        ctx.tip(rect, degraded
          ? `${q.label} — ${q.deltaDisplay} against a grouping nothing certifies`
          : `${q.label} · ${q.priorDisplay} to ${q.valueDisplay}, ${q.deltaDisplay} (${q.yoyDisplay})`);

        // Named in place where the piece can hold the name, and in the expand
        // where it cannot. Positioned as a percentage of the plot, which is
        // the same fraction of the viewBox under preserveAspectRatio="none".
        // Built in both modes. The degraded path differs in the colour of a
        // mark, never in which marks exist — which keeps it one branch to
        // re-author when direct mode is rewritten, rather than a set of
        // suppressions to find and undo.
        const widthPct = pct(drawn);
        if (widthPct >= LABEL_MIN_PCT) {
          const tag = document.createElement("span");
          tag.className = "movement-tag";
          tag.dataset.tone = tone;
          tag.textContent = q.short;
          tag.style.setProperty("--at-x", `${pct(x0 + drawn / 2).toFixed(2)}%`);
          tags.push(tag);
        }
        cursor += span;
      });
    };

    wing(losses, -1);
    wing(gains, 1);

    plot.appendChild(svg);
    tags.forEach((t) => plot.appendChild(t));
    el.appendChild(plot);

    /* Every piece named with its figure, under the bar.
     *
     * On a scale shared across four segments, three of the four rows are
     * small — Enterprise's losing wing is twenty-one times PubSec's — and
     * that is the honest result and the whole argument for using dollars.
     * It does mean the marks in those rows carry the cross-segment
     * comparison and not much else, so the within-segment decomposition is
     * written out: the bar answers "how much, against the other segments"
     * and the line answers "which lines, exactly".
     *
     * Ordered by size of movement rather than in drawn order. Drawn order
     * runs outward from the rule in both directions at once, which as a
     * reading order is ascending and then descending; a list wants the
     * biggest mover first. The tags on the bar carry the drawn order. */
    const parts = document.createElement("div");
    parts.className = "movement-parts";
    const partNodes = row.parts
      .slice()
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .map((q) => {
        const item = document.createElement("span");
        item.className = "movement-part";
        const nm = document.createElement("i");
        nm.textContent = q.short;
        const val = document.createElement("b");
        val.textContent = q.deltaDisplay;
        val.style.color = toneColor(toneOf(q.delta, good, { softBand: 0 }));
        item.appendChild(nm);
        item.appendChild(val);
        parts.appendChild(item);
        return item;
      });
    el.appendChild(parts);

    return { el, name, net, rule, pieces, tags, partNodes, lossCount: losses.length };
  }

  /* One axis for the panel, under the last row. Shared, because the panel's
   * first job is the comparison between groups: Enterprise removed five times
   * what SMB did, and that only reads if both are drawn on one scale. */
  function buildAxis() {
    const strip = document.createElement("div");
    strip.className = "movement-axis";

    /* The rule is its own element rather than a border on the tick strip,
     * because it has to be veiled and the ticks have to be veiled separately.
     * veil() works on opacity, and opacity on a parent multiplies through its
     * children — so a rule drawn as the tick strip's border-top either flashes
     * at mount along with nothing else, or takes the ticks down with it and
     * they can never be revealed on their own beat. */
    const rule = document.createElement("div");
    rule.className = "movement-axis-rule";
    rule.style.background = p.axis;
    strip.appendChild(rule);

    const line = document.createElement("div");
    line.className = "movement-ticks";

    const nodes = ticks.map((t) => {
      const node = document.createElement("span");
      node.className = "movement-tick";
      node.dataset.tick = t === 0 ? "zero" : (t < 0 ? "neg" : "pos");
      node.textContent = t === 0
        ? "0"
        : `${t < 0 ? "\u2212" : "+"}$${Math.abs(t)}${metrics.unit === "$M" ? "M" : ""}`;
      node.style.setProperty("--at-x", `${pct(x(t)).toFixed(2)}%`);
      // The end labels anchor to their own edge rather than centring on it, so
      // the strip cannot run out of the column it belongs to.
      const f = x(t) / BOX.w;
      node.dataset.anchor = f <= 0.08 ? "start" : (f >= 0.9 ? "end" : "mid");
      line.appendChild(node);
      return node;
    });

    strip.appendChild(line);
    wrap.appendChild(strip);
    return { ticks: nodes, rule, strip };
  }

  /* The two things a reader has to be told, told here rather than in a
   * neighbouring portlet's axis note or in a footer below the fold: which
   * side is which, and what fixes the order of the pieces. */
  function buildKey() {
    const key = document.createElement("div");
    key.className = "movement-key";

    const items = [
      { tone: "risk", text: metrics.lossKey || "dollars removed" },
      { tone: "positive", text: metrics.gainKey || "dollars added" }
    ];
    const nodes = items.map((item) => {
      const chip = document.createElement("span");
      chip.className = "movement-keyitem";
      const swatch = document.createElement("i");
      swatch.className = "movement-swatch";
      swatch.style.background = toneColor(item.tone);
      chip.appendChild(swatch);
      chip.appendChild(document.createTextNode(item.text));
      key.appendChild(chip);
      return chip;
    });

    const order = document.createElement("span");
    order.className = "movement-keynote";
    order.textContent = metrics.orderNote || "largest line nearest the rule";
    key.appendChild(order);
    nodes.push(order);

    wrap.appendChild(key);
    return nodes;
  }

  /* Every exact figure one click away, through the control the portlet head
   * already provides. Four columns rather than three: the prior period is the
   * derived one, and putting it beside the two authored levels is what lets a
   * reader check the subtraction instead of taking the movement on trust. */
  function buildDetail() {
    const detail = document.createElement("div");
    detail.className = "portlet-detail";

    const table = document.createElement("table");
    table.className = "detail-table";

    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    ["Product line", metrics.priorPeriodLabel || "Prior", "Current", "Y/Y", "Movement"]
      .forEach((h, i) => {
        const th = document.createElement("th");
        th.textContent = h;
        if (i) th.dataset.num = "true";
        hr.appendChild(th);
      });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const gr = document.createElement("tr");
      gr.dataset.group = "true";
      const gh = document.createElement("th");
      gh.colSpan = 4;
      gh.textContent = row.fullLabel;
      gr.appendChild(gh);
      const gn = document.createElement("td");
      gn.dataset.num = "true";
      gn.style.color = toneColor(toneOf(row.net, good, { softBand: 0 }));
      gn.textContent = `${row.netDisplay} net`;
      gr.appendChild(gn);
      tbody.appendChild(gr);

      row.parts.forEach((q) => {
        const tr = document.createElement("tr");
        [q.label, q.priorDisplay, q.valueDisplay, q.yoyDisplay, q.deltaDisplay]
          .forEach((v, i) => {
            const cell = document.createElement(i ? "td" : "th");
            cell.textContent = v;
            if (i) cell.dataset.num = "true";
            if (i === 4) cell.style.color = toneColor(toneOf(q.delta, good, { softBand: 0 }));
            tr.appendChild(cell);
          });
        tbody.appendChild(tr);
      });
    });
    table.appendChild(tbody);
    detail.appendChild(table);

    if (metrics.detailNote) {
      const note = document.createElement("p");
      note.className = "detail-note";
      note.textContent = metrics.detailNote;
      detail.appendChild(note);
    }
    return detail;
  }

  /* --------------------------------- veil ---------------------------------- */

  /* Everything this panel reveals, hidden from the moment it is built. Every
   * mark goes in: the pieces, the centre rule, the head, the tags, the ticks
   * and the key. A mark left off this list is painted at mount, blinks out
   * when its beat arrives and draws itself in again — which has been the
   * regression on this board three times, and is always a missing entry here
   * rather than a broken sequence. */
  const curtain = veil([
    rowNodes.map((r) => [r.name, r.net, r.rule, r.pieces, r.tags, r.partNodes]),
    axisNodes.rule,
    axisNodes.ticks,
    keyNodes,
    axisNoteEl,
    captionEl
  ]);
  curtain.hide();

  async function build(signal) {
    /* 1 — the origin, before anything measured from it. */
    rowNodes.forEach((r, i) => {
      strokeDraw(r.rule, { duration: TEMPO.rule, delay: i * TEMPO.row, signal });
      fadeIn(r.name, { duration: 300, y: 3, delay: i * TEMPO.row, signal });
    });

    /* 2 — the dollars that left, outward from the rule. Origin is the right
     * edge because a loss piece extends leftward: growing it from its own
     * right edge is growing it away from the rule it starts at. */
    await wait(200, signal);
    rowNodes.forEach((r, i) => {
      r.pieces.slice(0, r.lossCount).forEach((piece, j) => {
        growFrom(piece, {
          axis: "x",
          origin: "right center",
          duration: TEMPO.loss,
          delay: i * TEMPO.row + j * TEMPO.piece,
          signal
        });
      });
    });

    /* 3 — and the dollars that arrived. Second, and out of the same rule, so
     * the reader sees the loss and then the part of it that came back. */
    await wait(300, signal);
    rowNodes.forEach((r, i) => {
      r.pieces.slice(r.lossCount).forEach((piece, j) => {
        growFrom(piece, {
          axis: "x",
          origin: "left center",
          duration: TEMPO.gain,
          delay: i * TEMPO.row + j * TEMPO.piece,
          signal
        });
      });
    });

    /* 4 — the names, the nets, the figures and the ruler. */
    await wait(260, signal);
    stagger(rowNodes.flatMap((r) => r.tags), { step: 26, maxTotal: 420, duration: 300, y: 0, signal });
    stagger(rowNodes.map((r) => r.net), { step: 70, duration: 320, y: 0, signal });
    stagger(rowNodes.flatMap((r) => r.partNodes), {
      step: 18, maxTotal: 400, duration: 300, y: 0, delay: 90, signal
    });
    fadeIn(axisNodes.rule, { duration: 320, y: 0, delay: 60, signal });
    stagger(axisNodes.ticks, { step: 40, duration: 300, y: 0, delay: 120, signal });
    stagger(keyNodes, { step: 60, duration: 320, y: 0, delay: 200, signal });

    fadeIn(axisNoteEl, { delay: 260, duration: 420, y: 4, signal });
    fadeIn(captionEl, { delay: 320, duration: 460, y: 6, signal });
  }

  return { build, prime: curtain.hide, settle: curtain.settle };
}
