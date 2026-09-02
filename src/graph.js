/* The knowledge-graph overlay.
 *
 * A per-tile provenance panel can tell you that this number is governed. It
 * cannot tell you that this number and that other number are the same number.
 * That claim is what a semantic layer uniquely makes, and it is the one thing
 * no amount of per-portlet detail will surface — so it gets its own view.
 *
 * Turning the graph on draws a link between every pair of portlets that
 * resolve to the same certified measure. Where the counterpart lives on the
 * other tab, the link becomes a jump badge instead of a curve, because the
 * most persuasive edge on this board — Q2 ACV and the FY23-27 ACV row
 * resolving to one definition — spans the two tabs and would otherwise be
 * invisible.
 *
 * In direct mode the measure edges are exactly what is gone. What survives is
 * the plumbing: portlets that happen to read the same upstream table. So the
 * graph does not empty, it fragments — and the measure links render as broken
 * stubs that reach toward each other and stop, which is a more accurate
 * picture of the loss than simply removing them. */

import { buildMeasureGraph, surviveDirectMode, MODES } from "./semantic.js";

const NS = "http://www.w3.org/2000/svg";

export function createGraph({ svg, stage, controller, allPortlets, mode, tabLabel, onJump }) {
  const model = buildMeasureGraph(allPortlets);
  const tabOf = new Map(allPortlets.map((p) => [p.id, p.tabId]));
  const labelOf = new Map(allPortlets.map((p) => [p.id, p.label]));
  let on = false;
  let badges = [];

  function centreOf(el, bounds) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left - bounds.left + rect.width / 2,
      y: rect.top - bounds.top + rect.height / 2
    };
  }

  function el(tag, attrs) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      node.setAttribute(k, String(v));
    });
    return node;
  }

  function clearBadges() {
    badges.forEach((badge) => badge.remove());
    badges = [];
    controller.portlets.forEach((portlet) => portlet.setGraphState(null));
  }

  function redraw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    clearBadges();
    if (!on) return;

    const activeTab = controller.activeId;
    const bounds = stage.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);

    const isDirect = mode() === MODES.DIRECT;
    const measureEdges = model.edges.filter((e) => e.kind !== "lineage");
    const edges = isDirect
      ? surviveDirectMode(model.edges)
      : model.edges;

    const linked = new Set();

    edges.forEach((edge) => {
      const fromTab = tabOf.get(edge.from);
      const toTab = tabOf.get(edge.to);
      if (fromTab !== activeTab || toTab !== activeTab) return;

      const a = controller.get(edge.from);
      const b = controller.get(edge.to);
      if (!a || !b) return;

      drawCurve(centreOf(a.el, bounds), centreOf(b.el, bounds), edge, false);
      linked.add(edge.from);
      linked.add(edge.to);
    });

    // Broken measure links: drawn as two stubs with a gap, so the absence has
    // a shape rather than just being nothing on screen.
    if (isDirect) {
      measureEdges.forEach((edge) => {
        if (tabOf.get(edge.from) !== activeTab || tabOf.get(edge.to) !== activeTab) return;
        const a = controller.get(edge.from);
        const b = controller.get(edge.to);
        if (!a || !b) return;
        drawBroken(centreOf(a.el, bounds), centreOf(b.el, bounds));
      });
    }

    // Cross-tab counterparts become jump badges. Suppressed in direct mode:
    // with no shared definition there is nothing asserting the two are the
    // same measure, so offering to jump between them would be a lie.
    if (!isDirect) {
      const crossings = new Map();
      measureEdges.forEach((edge) => {
        const pairs = [
          [edge.from, edge.to],
          [edge.to, edge.from]
        ];
        pairs.forEach(([here, there]) => {
          if (tabOf.get(here) !== activeTab || tabOf.get(there) === activeTab) return;
          if (!crossings.has(here)) crossings.set(here, []);
          crossings.get(here).push({ target: there, label: edge.label });
        });
      });

      crossings.forEach((links, id) => {
        const portlet = controller.get(id);
        if (!portlet) return;
        addJumpBadge(portlet, links);
        linked.add(id);
      });
    }

    controller.activePortlets().forEach((portlet) => {
      portlet.setGraphState(linked.has(portlet.id) ? "linked" : "isolated");
    });
  }

  function drawCurve(a, b, edge) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    // Bow the curve perpendicular to the run so two links between the same
    // region of the board do not lie on top of each other.
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bow = Math.min(70, len * 0.18);
    const cx = mx + (-dy / len) * bow;
    const cy = my + (dx / len) * bow;

    const path = el("path", {
      d: `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`,
      class: `graph-edge graph-edge-${edge.kind}`,
      fill: "none"
    });
    svg.appendChild(path);

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    void path.getBoundingClientRect();
    path.style.transition = "stroke-dashoffset 620ms cubic-bezier(.16,1,.3,1)";
    path.style.strokeDashoffset = "0";

    if (edge.kind !== "lineage" && edge.label) {
      const labelX = cx * 0.5 + mx * 0.5;
      const labelY = cy * 0.5 + my * 0.5;
      const text = el("text", {
        x: labelX,
        y: labelY,
        class: "graph-edge-label",
        "text-anchor": "middle"
      });
      text.textContent = edge.kind === "derived" ? `derived from ${edge.label}` : edge.label;
      svg.appendChild(text);
    }
  }

  function drawBroken(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const stub = Math.min(58, len * 0.28);

    [
      [a, 1],
      [b, -1]
    ].forEach(([point, dir]) => {
      const path = el("path", {
        d: `M ${point.x} ${point.y} L ${point.x + ux * stub * dir} ${point.y + uy * stub * dir}`,
        class: "graph-edge graph-edge-broken",
        fill: "none"
      });
      svg.appendChild(path);
    });

    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const mark = el("text", {
      x: mid.x,
      y: mid.y + 4,
      class: "graph-edge-broken-mark",
      "text-anchor": "middle"
    });
    mark.textContent = "✕";
    svg.appendChild(mark);
  }

  function addJumpBadge(portlet, links) {
    const measure = links[0].label;
    const targetId = links[0].target;
    const targetTab = tabOf.get(targetId);

    const badge = document.createElement("button");
    badge.type = "button";
    badge.className = "graph-jump";
    badge.innerHTML = `<span class="graph-jump-arrow" aria-hidden="true"></span><span class="graph-jump-text">${labelOf.get(targetId)} · ${tabLabel(targetTab)}</span>`;
    badge.setAttribute(
      "aria-label",
      `${labelOf.get(targetId)} on ${tabLabel(targetTab)} resolves to the same certified measure, ${measure}. Jump to it.`
    );
    badge.title = `Same certified measure: ${measure}`;
    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      onJump(targetTab, targetId);
    });

    portlet.el.appendChild(badge);
    badges.push(badge);
  }

  function setOn(next) {
    on = next;
    svg.classList.toggle("is-visible", on);
    stage.classList.toggle("is-graphing", on);
    redraw();
  }

  return {
    toggle: () => setOn(!on),
    set: setOn,
    isOn: () => on,
    redraw,
    model
  };
}
