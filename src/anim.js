/* Draw-on animation primitives.
 *
 * Charts here build themselves rather than appearing finished: axes sweep,
 * lines stroke on, arcs fill, numerals roll. Every primitive takes an
 * AbortSignal so a tab switch mid-build cancels cleanly instead of writing
 * into detached DOM, and every primitive honours prefers-reduced-motion by
 * jumping straight to the final state.
 *
 * All durations pass through motionScale(), which the choreographer drops
 * below 1 when replaying a tab the viewer has already seen — the entrance
 * still reads as an entrance, it just does not make them wait through it
 * a second time. */

const EASE = "cubic-bezier(.16, 1, .3, 1)";
const EASE_SOFT = "cubic-bezier(.4, 0, .2, 1)";

let scale = 1;

export function setMotionScale(next) {
  scale = Math.max(0.01, next);
}

export function motionScale() {
  return scale;
}

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function d(ms) {
  return Math.round(ms * scale);
}

function aborted(signal) {
  return Boolean(signal && signal.aborted);
}

/* A cancellable delay. Everything scheduled through this resolves early and
 * silently when the signal aborts, so callers can `await` a sequence without
 * having to guard every step themselves. */
export function wait(ms, signal) {
  const delay = d(ms);
  if (delay <= 0 || aborted(signal)) return Promise.resolve(aborted(signal));
  return new Promise((resolve) => {
    let timer = 0;
    const onAbort = () => {
      clearTimeout(timer);
      resolve(true);
    };
    timer = setTimeout(() => {
      if (signal) signal.removeEventListener("abort", onAbort);
      resolve(false);
    }, delay);
    if (signal) signal.addEventListener("abort", onAbort, { once: true });
  });
}

/* --------------------------------- veils --------------------------------- */

/* Hides everything a chart is going to reveal, from the moment it is built.
 *
 * Without this a chart is mounted at full opacity and then each element is
 * slammed to zero when its turn in the build sequence arrives — so a panel
 * whose sequence spans a second and a half is painted, then blinks out in
 * pieces, then draws itself in. That was the blinking: not one dropped frame
 * but every element visible for as long as it took the sequence to reach it.
 *
 * settle() is the safety net. If a build path skips a node — a conditional
 * marker, an aborted sequence that resumed — the node is restored rather than
 * left invisible, so veiling can never cost content.
 *
 * Under reduced motion this is inert in both directions: nothing is hidden,
 * because nothing is going to be animated back. */
export function veil(nodes) {
  const list = nodes.flat(Infinity).filter(Boolean);
  return {
    nodes: list,
    hide() {
      if (reducedMotion()) return;
      // A curtain drops, it does not fade. Assigning opacity alone is not
      // enough: a node revealed by fadeTo or dashDraw can still be carrying
      // that primitive's opacity transition, and then hiding it *animates* it
      // down over 500-700ms. Because the panel is fading in over 420ms at the
      // same time, the mark is painted, visibly fades out, and is drawn again
      // — the blinking this function exists to prevent, reintroduced through
      // the back door on every return visit.
      list.forEach((node) => {
        node.style.transition = "none";
        node.style.opacity = "0";
      });
      // Commit the hidden state while the override is still in force, then
      // drop it so stylesheet transitions (hover and the like) still apply
      // and the reveal primitives set their own.
      if (list.length) void list[0].getBoundingClientRect();
      list.forEach((node) => {
        node.style.transition = "";
      });
    },
    settle() {
      list.forEach((node) => {
        node.style.transition = "none";
        node.style.opacity = "1";
      });
      if (list.length) void list[0].getBoundingClientRect();
      list.forEach((node) => {
        node.style.transition = "";
      });
    }
  };
}

/* ------------------------------- numerals -------------------------------- */

/* Splits an authored display string into the pieces needed to interpolate it.
 * Parsing the authored string rather than reformatting from scratch means the
 * final frame is byte-identical to what the JSON says — the animation can
 * never leave a KPI reading "$82.0M" when the data file says "$82M". */
export function numeralParts(display) {
  const match = String(display).match(/^([^\d\-+]*)([-+]?[\d,]+(?:\.\d+)?)(.*)$/s);
  if (!match) return null;
  const [, prefix, raw, suffix] = match;
  const plain = raw.replace(/,/g, "");
  const dot = plain.indexOf(".");
  return {
    prefix,
    suffix,
    value: Number(plain),
    decimals: dot === -1 ? 0 : plain.length - dot - 1,
    grouped: raw.includes(",")
  };
}

function renderNumeral(parts, value) {
  let body = Math.abs(value).toFixed(parts.decimals);
  if (parts.grouped) {
    const [int, frac] = body.split(".");
    body = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (frac ? `.${frac}` : "");
  }
  const sign = value < 0 ? "-" : "";
  return `${parts.prefix}${sign}${body}${parts.suffix}`;
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/* Rolls a numeral up to its authored display string. Counts from zero (or
 * from `from`) so a KPI lands on its value rather than blinking into it. */
export function countUp(el, display, opts = {}) {
  const { duration = 1000, delay = 0, signal } = opts;
  const parts = numeralParts(display);

  if (!parts || reducedMotion()) {
    el.textContent = display;
    return Promise.resolve();
  }

  const from = opts.from ?? 0;
  const to = parts.value;
  el.textContent = renderNumeral(parts, from);

  return wait(delay, signal).then((cancelled) => {
    if (cancelled || aborted(signal)) {
      el.textContent = display;
      return;
    }
    return new Promise((resolve) => {
      const total = d(duration);
      const start = performance.now();
      let frame = 0;

      const onAbort = () => {
        cancelAnimationFrame(frame);
        el.textContent = display;
        resolve();
      };
      if (signal) signal.addEventListener("abort", onAbort, { once: true });

      const step = (now) => {
        const t = Math.min(1, (now - start) / total);
        el.textContent = renderNumeral(parts, from + (to - from) * easeOutExpo(t));
        if (t < 1) {
          frame = requestAnimationFrame(step);
          return;
        }
        // Land on the authored string exactly, not on a reformatted number.
        el.textContent = display;
        if (signal) signal.removeEventListener("abort", onAbort);
        resolve();
      };
      frame = requestAnimationFrame(step);
    });
  });
}

/* Cycles a value through its competing candidates before settling.
 *
 * This is the direct-mode counterpart to countUp. A governed metric rolls up
 * to one number; an ungoverned one flickers between the several defensible
 * answers nobody has ruled between, and lands on all of them at once. The
 * motion is the argument — a static list of three values reads as a footnote,
 * where watching the headline refuse to settle reads as a problem. */
export function scramble(el, candidates, final, opts = {}) {
  const { cycles = 7, interval = 110, delay = 0, signal } = opts;
  const pool = (candidates && candidates.length ? candidates : [final]).filter(Boolean);

  if (reducedMotion() || pool.length < 2) {
    el.textContent = final;
    return Promise.resolve();
  }

  return wait(delay, signal).then((cancelled) => {
    if (cancelled || aborted(signal)) {
      el.textContent = final;
      return;
    }
    return new Promise((resolve) => {
      let i = 0;
      let timer = 0;
      const finish = () => {
        clearTimeout(timer);
        el.textContent = final;
        resolve();
      };
      if (signal) signal.addEventListener("abort", finish, { once: true });

      const tick = () => {
        if (aborted(signal)) return finish();
        if (i >= cycles) {
          if (signal) signal.removeEventListener("abort", finish);
          return finish();
        }
        el.textContent = pool[i % pool.length];
        i += 1;
        // Decelerating cycle, so it reads as searching for an answer and
        // failing to find one rather than as a fixed-rate blink.
        timer = setTimeout(tick, d(interval + i * 26));
      };
      tick();
    });
  });
}

/* --------------------------------- paths --------------------------------- */

/* Strokes a path on from its start point using dash-offset. Returns a promise
 * that settles when the draw finishes so charts can sequence axis -> line ->
 * points without hand-tuning overlapping timeouts. */
export function strokeDraw(node, opts = {}) {
  const { duration = 800, delay = 0, easing = EASE, signal } = opts;
  let length = 0;
  try {
    length = node.getTotalLength();
  } catch {
    length = 0;
  }

  if (!length || reducedMotion()) {
    node.style.strokeDasharray = "";
    node.style.strokeDashoffset = "";
    node.style.opacity = "1";
    return wait(reducedMotion() ? 0 : delay, signal).then(() => {});
  }

  node.style.transition = "none";
  node.style.strokeDasharray = `${length}`;
  node.style.strokeDashoffset = `${length}`;
  node.style.opacity = "1";
  // Flush the starting state so the transition below has something to run from.
  void node.getBoundingClientRect();

  const total = d(duration);
  node.style.transition = `stroke-dashoffset ${total}ms ${easing}`;
  node.style.strokeDashoffset = "0";

  return wait(delay + duration, signal).then(() => {
    if (aborted(signal)) return;
    // Clearing the dash lets any authored dasharray (partial-period markers)
    // take over once the draw is done.
    node.style.transition = "";
    node.style.strokeDasharray = "";
    node.style.strokeDashoffset = "";
  });
}

/* A path drawn on with its dash pattern preserved — used wherever the dashes
 * carry meaning (partial periods, run-rate ghosts, broken lineage links) and
 * so cannot be borrowed as the reveal mechanism. */
export function dashDraw(node, opts = {}) {
  const { duration = 600, delay = 0, signal } = opts;
  if (reducedMotion()) {
    node.style.opacity = "1";
    return Promise.resolve();
  }
  node.style.transition = "none";
  node.style.opacity = "0";
  void node.getBoundingClientRect();
  node.style.transition = `opacity ${d(duration)}ms ${EASE_SOFT} ${d(delay)}ms`;
  node.style.opacity = "1";
  return wait(delay + duration, signal).then(() => {
    if (aborted(signal)) return;
    node.style.transition = "";
  });
}

/* --------------------------------- shapes -------------------------------- */

/* Scales a shape up from one edge — bars from their baseline, mix segments
 * from their leading edge. Relies on transform-box: fill-box, set globally on
 * .anim-grow in the stylesheet so SVG transforms use the shape's own box. */
export function growFrom(node, opts = {}) {
  const { axis = "y", origin = "bottom", duration = 700, delay = 0, easing = EASE, signal } = opts;
  node.classList.add("anim-grow");
  node.style.transformOrigin = origin;

  if (reducedMotion()) {
    node.style.transform = "";
    node.style.opacity = "1";
    return Promise.resolve();
  }

  const collapsed = axis === "x" ? "scaleX(0.001)" : "scaleY(0.001)";
  node.style.transition = "none";
  node.style.transform = collapsed;
  node.style.opacity = "1";
  void node.getBoundingClientRect();
  node.style.transition = `transform ${d(duration)}ms ${easing} ${d(delay)}ms`;
  node.style.transform = "scale(1)";

  return wait(delay + duration, signal).then(() => {});
}

/* Sweeps a ring arc around to its target fraction. Gauges use this for
 * plan attainment: the arc is drawn at full length and revealed by offset,
 * so the sweep traces the ring rather than growing radially. */
export function sweepArc(node, opts = {}) {
  return strokeDraw(node, { duration: 1100, easing: EASE, ...opts });
}

/* ---------------------------------- fades -------------------------------- */

export function fadeIn(node, opts = {}) {
  const { duration = 520, delay = 0, y = 8, x = 0, scaleFrom = 1, easing = EASE, signal } = opts;

  if (reducedMotion()) {
    node.style.opacity = "1";
    node.style.transform = "";
    return Promise.resolve();
  }

  node.style.transition = "none";
  node.style.opacity = "0";
  node.style.transform = `translate(${x}px, ${y}px) scale(${scaleFrom})`;
  void node.getBoundingClientRect();
  node.style.transition = `opacity ${d(duration)}ms ${easing} ${d(delay)}ms, transform ${d(duration)}ms ${easing} ${d(delay)}ms`;
  node.style.opacity = "1";
  node.style.transform = "translate(0, 0) scale(1)";

  return wait(delay + duration, signal).then(() => {
    if (aborted(signal)) return;
    node.style.transition = "";
    node.style.transform = "";
  });
}

/* Fades to a partial opacity. For fills that are meant to stay translucent —
 * a trend area behind its line — where reaching 1 would drown the mark. */
export function fadeTo(node, to, opts = {}) {
  const { duration = 520, delay = 0, easing = EASE_SOFT, signal } = opts;

  if (reducedMotion()) {
    node.style.opacity = String(to);
    return Promise.resolve();
  }

  node.style.transition = "none";
  node.style.opacity = "0";
  void node.getBoundingClientRect();
  node.style.transition = `opacity ${d(duration)}ms ${easing} ${d(delay)}ms`;
  node.style.opacity = String(to);

  return wait(delay + duration, signal).then(() => {
    if (aborted(signal)) return;
    // Leave no transition on the node. Anything still carrying one when the
    // next veil comes round gets faded out instead of hidden.
    node.style.transition = "";
  });
}

/* Fades a set of nodes in on a cascade. The per-item step is capped in total
 * so a long list still finishes promptly instead of trickling in. */
export function stagger(nodes, opts = {}) {
  const { step = 60, maxTotal = 620, delay = 0, ...rest } = opts;
  const list = Array.from(nodes);
  if (!list.length) return Promise.resolve();
  const perItem = list.length > 1 ? Math.min(step, maxTotal / (list.length - 1)) : 0;
  return Promise.all(list.map((node, i) => fadeIn(node, { ...rest, delay: delay + i * perItem })));
}
