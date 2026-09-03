/* Screenshot and console harness for verification.
 *
 * Drives headless Chrome over the CDP websocket rather than shelling out to
 * --screenshot, because three of the things that need verifying cannot be seen
 * from a one-shot capture: whether the entrance choreography has finished,
 * whether anything flashes mid-sweep, and whether the page logged an error on
 * the way. So this waits for the build to settle before it shoots, can shoot
 * deliberately early, and reports everything the console said.
 *
 *   node scripts/shoot.mjs <urlPath> <w>x<h> <name> [--direct] [--at ms] [--probe expr]
 *
 * --probe runs an expression in the settled page and prints the result. It
 * lives here rather than in a scratch script on purpose: this harness is the
 * only thing in the tree that asserts the rendered tab matches the requested
 * one, and a probe that measures the wrong tab is worse than no probe. Two
 * agents have already been fooled by silent tab fallback.
 */

import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// A fresh port and profile per run: Chrome holds a lock on the profile
// directory for a moment after exit, and a second run inside that window
// silently attaches to nothing.
const PORT = 9400 + (process.pid % 400);
const PROFILE = `/tmp/chrome-shoot-${process.pid}`;
const [urlPath, size, name, ...rest] = process.argv.slice(2);
const [width, height] = size.split("x").map(Number);
const direct = rest.includes("--direct");
const atIndex = rest.indexOf("--at");
const at = atIndex >= 0 ? Number(rest[atIndex + 1]) : null;
const probeIndex = rest.indexOf("--probe");
const probe = probeIndex >= 0 ? rest[probeIndex + 1] : null;

/* The tab the caller ASKED for, taken from the fragment.
 *
 * This used to be a comment claiming the harness asserted the rendered tab
 * against the requested one. It did not — it only ever reported on whichever
 * panel happened to be active, which is precisely how a cache-buster appended
 * AFTER the fragment ("index.html#q3-outlook?v=123") made every frame the exec
 * tab while the log looked correct. idFromHash() in tabs.js falls back to
 * tabs[0] on any unrecognised fragment, silently, so a malformed URL is
 * indistinguishable from a deliberate exec shot unless something checks.
 *
 * A query string after the fragment is a caller error, not a cache-buster, so
 * it is rejected here rather than quietly normalised: normalising it would
 * still leave the caller believing a thing that is not true. */
const frag = urlPath.includes("#") ? urlPath.slice(urlPath.indexOf("#") + 1) : "";
const wantTab = frag.replace(/^\/?/, "");
if (/[?&]/.test(wantTab)) {
  console.error(`FATAL: query string inside the URL fragment ("${wantTab}").`);
  console.error("  A cache-buster belongs before the '#', not after it. As written this");
  console.error("  fragment matches no tab and the board would silently render the exec tab.");
  process.exit(2);
}

mkdirSync("shots", { recursive: true });

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--force-device-scale-factor=2",
  `--window-size=${width},${height}`,
  `--user-data-dir=${PROFILE}`,
  "about:blank"
], { stdio: "ignore" });

const done = () => {
  try { chrome.kill(); } catch { /* already gone */ }
  try { rmSync(PROFILE, { recursive: true, force: true }); } catch { /* best effort */ }
};
process.on("exit", done);

async function version() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      return (await res.json()).webSocketDebuggerUrl;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  throw new Error("chrome did not come up");
}

const ws = new WebSocket(await version());
await new Promise((r) => ws.addEventListener("open", r, { once: true }));

let seq = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
    return;
  }
  events.push(msg);
});

function send(method, params = {}, sessionId) {
  seq += 1;
  const id = seq;
  ws.send(JSON.stringify({ id, method, params, sessionId }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

const { targetInfos } = await send("Target.getTargets");
const page = targetInfos.find((t) => t.type === "page");
const { sessionId } = await send("Target.attachToTarget", { targetId: page.targetId, flatten: true });

await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Log.enable", {}, sessionId);
await send("Emulation.setDeviceMetricsOverride", {
  width, height, deviceScaleFactor: 2, mobile: false
}, sessionId);

// A full URL passes through, so the same audit can be run against the deployed
// board rather than only against the local server.
const url = /^https?:\/\//.test(urlPath) ? urlPath : `http://localhost:8765/${urlPath}`;
await send("Page.navigate", { url }, sessionId);
await new Promise((r) => setTimeout(r, 1400));

if (direct) {
  /* Wait for the app to have BOOTED, then click, then confirm it took.
   *
   * The old version clicked once, 1400ms after navigate, and reported success
   * if it found a button. #layer-toggle is static markup in index.html, but
   * its click listener is attached by main.js only after board.json has been
   * fetched and the board built — so a click in that window lands on a real
   * button, does nothing at all, and reports 'clicked mode-switch-btn'. The
   * frame then comes back governed while the log says direct. Reproduced
   * directly: an exec sweep where every portlet had no audit attribute
   * because the toggle had never actually fired.
   *
   * So: poll for a mounted portlet, click, poll for direct-mode, and retry
   * the click a couple of times before giving up. The assertion further down
   * is the backstop; this is what stops it firing in the first place. */
  const r = await send("Runtime.evaluate", {
    expression: `(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const booted = async () => {
        for (let i = 0; i < 60; i += 1) {
          if (document.querySelector('.panel.is-active .portlet')) return true;
          await sleep(100);
        }
        return false;
      };
      if (!await booted()) return 'never booted';
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        const btn = document.getElementById('layer-toggle')
          || document.querySelector('.mode-switch-btn');
        if (!btn) return 'no button';
        btn.click();
        for (let i = 0; i < 20; i += 1) {
          if (document.body.classList.contains('direct-mode')) {
            return 'direct after ' + attempt + ' click(s)';
          }
          await sleep(50);
        }
      }
      return 'CLICKED BUT STILL GOVERNED';
    })()`,
    awaitPromise: true, returnByValue: true
  }, sessionId);
  console.log("  direct:", r.result.value);
}

await new Promise((r) => setTimeout(r, at == null ? 4200 : at));

/* The probe runs BEFORE the layout audit, and the order is load-bearing.
 *
 * It used to run after. Every audit-pass frame in every sweep reaches the
 * audit pass by way of a probe that adds body.auditing — so with the audit
 * measured first, all fifteen audit-state frames were measured in the plain
 * direct state, and the audit pass itself has never been mechanically checked
 * by this harness at all. Its footnote overlay sits at opacity 0 until the
 * class lands, so it was skipped as invisible every time.
 *
 * Anything a probe opens — the rules flyover, an expanded portlet, the audit
 * pass — is now part of what gets measured, which is the whole point of being
 * able to open it. */
if (probe) {
  const r = await send("Runtime.evaluate", {
    /* awaitPromise, so a probe can open something and wait for it to settle
     * before the shot is taken. Returning a promise from the expression is the
     * only way to put a delay between a probe's side effect and the capture,
     * and several things worth photographing — the rules flyover, an expanded
     * portlet — animate in. */
    expression: `(async () => { try { return JSON.stringify(await (${probe})); } catch (e) { return 'PROBE ERROR: ' + e.message; } })()`,
    awaitPromise: true,
    returnByValue: true
  }, sessionId);
  console.log("  probe:", r.result.value);
}

/* Layout audit, run in the page: anything that scrolls inside its own box,
 * anything that overflows the stage, anything clipped. */
const audit = await send("Runtime.evaluate", {
  expression: `(() => {
    const out = { scrollers: [], overflow: [], clipped: [] };
    const stage = document.querySelector('.stage');
    const sb = stage ? stage.getBoundingClientRect() : null;
    /* The provenance back face and the expand detail are laid out off-screen
     * by design, so they are not overflow.
     *
     * .rules-flyover named a class that does not exist any more: the reading
     * notes moved into the panel head as .panel-notes, whose sheet carries the
     * hidden attribute when closed. So its four veiled <li class="rule">
     * elements were being reported as marks stuck invisible ON PAGE on every
     * tab that states rules — four false positives per frame, which is exactly
     * the noise that hides a real one. [hidden] covers the sheet whether or
     * not it keeps that class name. */
    const hidden = (el) => el.closest('.portlet-back, .prov, .portlet-detail, .panel-notes, [hidden], [aria-hidden="true"]');
    document.querySelectorAll('.panel.is-active *').forEach((el) => {
      if (hidden(el)) return;
      if (el.scrollHeight - el.clientHeight > 1 && el.clientHeight > 0) {
        const s = getComputedStyle(el);
        if (s.overflowY !== 'visible' && s.overflowY !== 'hidden') {
          out.scrollers.push(el.className + ' ' + el.scrollHeight + '/' + el.clientHeight);
        }
      }
      const r = el.getBoundingClientRect();
      if (sb && r.height > 0 && (r.bottom > sb.bottom + 1.5 || r.right > sb.right + 1.5 || r.top < sb.top - 1.5)) {
        out.overflow.push((el.className || el.tagName) + ' ' + JSON.stringify({
          t: Math.round(r.top), b: Math.round(r.bottom), r: Math.round(r.right)
        }));
      }
      if (el.children.length === 0 && el.textContent.trim() && el.scrollWidth - el.clientWidth > 1) {
        out.clipped.push((el.className || el.tagName) + ' :: ' + el.textContent.trim().slice(0, 40));
      }
    });

    /* Text-on-text collisions.
     *
     * Nothing was checking for these, and they are neither overflow nor
     * clipping: an absolutely-positioned overlay sitting across a line of
     * flowed prose leaves every box inside its parent and every scrollHeight
     * equal to its clientHeight. The audit pass's footnote is exactly this
     * shape, and so is anything else that earns a z-index.
     *
     * Only leaf text boxes are compared, and only pairs where neither is an
     * ancestor of the other — a parent overlapping its own child is layout,
     * not collision. An overlap has to eat more than a third of the shorter
     * box's height to count, which is what separates a bisected line from
     * adjacent lines whose boxes touch at the descenders. */
    out.collide = [];
    /* Per-LINE boxes, taken from Ranges over text nodes rather than from
     * elements. An element-based check misses the case that matters here: a
     * caption reading "<strong>Cloud Migration…</strong> – $22.5M to $7.9M…"
     * puts its prose in a bare text node with no element of its own, so the
     * <p> is not a leaf and the text is invisible to any querySelectorAll.
     * Range.getClientRects() also returns one rect PER RENDERED LINE, which
     * is exactly the granularity a bisected line has to be caught at. */
    const lines = [];
    const walk = document.createTreeWalker(
      document.querySelector('.panel.is-active') || document.body,
      NodeFilter.SHOW_TEXT
    );
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (!n.nodeValue.trim()) continue;
      const owner = n.parentElement;
      if (!owner || hidden(owner)) continue;
      const s = getComputedStyle(owner);
      if (s.visibility === 'hidden' || s.opacity === '0') continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      Array.from(range.getClientRects()).forEach((r) => {
        if (r.width > 2 && r.height > 2) {
          const port = owner.closest('.portlet');
          lines.push({
            r,
            owner,
            where: (port ? port.dataset.portlet + '/' : '')
              + (owner.getAttribute('class') || owner.tagName),
            text: n.nodeValue.trim().slice(0, 26)
          });
        }
      });
    }
    for (let i = 0; i < lines.length; i += 1) {
      for (let j = i + 1; j < lines.length; j += 1) {
        const A = lines[i]; const B = lines[j];
        if (A.owner === B.owner) continue;
        if (A.owner.contains(B.owner) || B.owner.contains(A.owner)) continue;
        const ox = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
        const oy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
        if (ox <= 1 || oy <= 1) continue;
        // A third of the shorter line's height: enough to separate a line
        // painted THROUGH another from two lines whose descenders touch.
        if (oy < Math.min(A.r.height, B.r.height) / 3) continue;
        out.collide.push(Math.round(ox) + 'x' + Math.round(oy) + 'px  ['
          + A.where + '] "' + A.text + '"  OVER  [' + B.where + '] "' + B.text + '"');
      }
    }

    /* Painted-box clipping, asked of the descendants rather than of a clone.
     *
     * The scroller check above deliberately skips overflow:hidden, because a
     * hidden box is not a scroller — but hidden is the ONE place content is
     * lost with no scrollbar to betray it, so nothing was checking it. And it
     * must not be checked by cloning the node at height:auto onto body: the
     * clone leaves .panel/.band and loses --bar-h, the tab grid and every band
     * override, which once produced a confident report of six frames clipped
     * by up to 407px against screenshots that were clean.
     *
     * So: for every clipping box in the live tree, ask its leaf descendants
     * where their painted boxes actually are, and compare against the
     * clipper's own padding box in the same coordinate space. Nothing is
     * cloned, moved or restyled. */
    out.paintClip = [];
    /* A mark that paints nothing cannot be clipped in any sense a viewer
     * could notice. trendPanel's .trend-dev-hit is a transparent rect
     * deliberately oversized by 2px a side to make a 1-unit bar hoverable, so
     * it hangs outside its plot by design and was the only thing this check
     * found on the Five Year tab — 14px of nothing, at the 1024 floor, in
     * governed mode, which is exactly where a real clip would matter most. */
    /* No backslashes anywhere in here. This whole expression is a template
     * literal on the Node side, so an escape written for the page's regex
     * engine is consumed before it ever gets sent: a fill test written as
     * /^rgba(.*,\\s*0)$/ arrived as /^rgba(.*,s*0)$/ and silently matched
     * nothing. Alpha is read by string surgery instead. */
    const paints = (n) => {
      if (n.textContent.trim()) return true;
      const s = getComputedStyle(n);
      const none = (v) => {
        if (!v || v === 'none' || v === 'transparent') return true;
        return v.split(' ').join('').endsWith(',0)');
      };
      return !(none(s.fill) && none(s.stroke));
    };
    const leaves = (root) => Array.from(root.querySelectorAll('*')).filter((n) =>
      n.children.length === 0 && (n.textContent.trim() || n.tagName === 'rect'
        || n.tagName === 'circle' || n.tagName === 'path' || n.tagName === 'line')
      && paints(n));
    document.querySelectorAll('.panel.is-active *').forEach((box) => {
      if (hidden(box)) return;
      const s = getComputedStyle(box);
      const clips = (p) => p === 'hidden' || p === 'clip';
      if (!clips(s.overflowY) && !clips(s.overflowX)) return;
      const br = box.getBoundingClientRect();
      if (br.height <= 0 || br.width <= 0) return;
      let worst = 0; let who = '';
      leaves(box).forEach((leaf) => {
        if (hidden(leaf)) return;
        const lr = leaf.getBoundingClientRect();
        if (lr.height <= 0 && lr.width <= 0) return;
        // Only the axes that actually clip can lose paint.
        const over = Math.max(
          clips(s.overflowY) ? lr.bottom - br.bottom : 0,
          clips(s.overflowY) ? br.top - lr.top : 0,
          clips(s.overflowX) ? lr.right - br.right : 0,
          clips(s.overflowX) ? br.left - lr.left : 0
        );
        if (over > worst) {
          worst = over;
          who = (leaf.getAttribute('class') || leaf.tagName) + ' :: '
            + leaf.textContent.trim().slice(0, 30);
        }
      });
      // 1.5px covers subpixel rounding and deliberate hairline bleed.
      if (worst > 1.5) {
        out.paintClip.push((box.getAttribute('class') || box.tagName)
          + ' clips ' + Math.round(worst) + 'px of ' + who);
      }
    });
    const panel = document.querySelector('.panel.is-active .panel-bands');
    out.bands = panel ? Math.round(panel.getBoundingClientRect().height) : null;
    out.stage = sb ? Math.round(sb.height) : null;
    /* What actually rendered, so the caller's request can be checked against
     * it. Both are reported: the panel is what was photographed, the nav
     * button is what the rail claims is selected, and a board that disagrees
     * with itself is its own defect. out.active counts panels holding the
     * is-active class — rapid tab switching must leave exactly one. */
    const live = document.querySelectorAll('.panel.is-active');
    out.tab = live.length ? (live[live.length - 1].dataset.tab || null) : null;
    out.active = live.length;
    out.activeTabs = Array.from(live).map((p) => p.dataset.tab);
    const navOn = document.querySelector('.tabnav-btn.is-active');
    out.navTab = navOn ? (navOn.dataset.tab || null) : null;
    out.hash = location.hash;
    /* Which MODE actually rendered. --direct clicks a button, and a click that
     * lands before main.js has booted does nothing at all — which silently
     * turns a direct frame into a governed one. Same class of failure as the
     * tab fallback, and just as invisible in a log, so it is asserted the same
     * way. Observed once: an exec sweep where every portlet came back with no
     * audit attribute because the toggle had never been pressed. */
    out.direct = document.body.classList.contains('direct-mode');
    out.auditing = document.body.classList.contains('auditing');
    out.invisible = Array.from(document.querySelectorAll('.panel.is-active *'))
      .filter((el) => el.style.opacity === '0')
      .map((el) => (el.getAttribute('class') || el.tagName) + (hidden(el) ? ' [offscreen]' : ' [ON PAGE]'));
    return JSON.stringify(out);
  })()`,
  returnByValue: true
}, sessionId);

const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
writeFileSync(`shots/${name}.png`, Buffer.from(data, "base64"));

const errors = events.filter((e) =>
  (e.method === "Runtime.consoleAPICalled" && e.params.type === "error")
  || e.method === "Runtime.exceptionThrown"
  || (e.method === "Log.entryAdded" && e.params.entry.level === "error"));

console.log(`shots/${name}.png`);
const a = JSON.parse(audit.result.value);

/* The assertion the header has always promised. Loud, and non-zero exit, so a
 * mis-routed frame cannot be mistaken for a passing one in a sweep's log. */
let routing = 0;
if (wantTab && a.tab !== wantTab) {
  console.log(`  TAB MISMATCH: asked for "${wantTab}", rendered "${a.tab}" (hash ${a.hash})`);
  routing += 1;
}
if (a.tab !== a.navTab) {
  console.log(`  NAV DISAGREES: panel "${a.tab}" but rail marks "${a.navTab}" active`);
  routing += 1;
}
if (a.active !== 1) {
  console.log(`  ACTIVE PANELS: ${a.active} (${a.activeTabs.join(", ")}) — expected exactly 1`);
  routing += 1;
}
if (direct && !a.direct) {
  console.log("  MODE MISMATCH: --direct was asked for, but the board rendered governed");
  routing += 1;
}
if (!direct && a.direct) {
  console.log("  MODE MISMATCH: governed was asked for, but the board rendered direct");
  routing += 1;
}
if (!routing) console.log(`  tab ok: ${a.tab} · ${a.direct ? "direct" : "governed"}${a.auditing ? " · auditing" : ""}`);

console.log("  stage", a.stage, "bands", a.bands, "| scrollers", a.scrollers.length,
  "| stage-overflow", a.overflow.length, "| clipped", a.clipped.length,
  "| paint-clip", (a.paintClip || []).length, "| collide", (a.collide || []).length,
  "| still-hidden", a.invisible.length);
(a.collide || []).forEach((s) => console.log("    COLLIDE", s));
a.invisible.forEach((s) => console.log("    HIDDEN", s));
a.scrollers.slice(0, 6).forEach((s) => console.log("    SCROLL", s));
a.overflow.slice(0, 8).forEach((s) => console.log("    OVER  ", s));
a.clipped.slice(0, 8).forEach((s) => console.log("    CLIP  ", s));
(a.paintClip || []).slice(0, 8).forEach((s) => console.log("    PAINT ", s));
if (errors.length) {
  console.log(`  CONSOLE ERRORS: ${errors.length}`);
  errors.slice(0, 6).forEach((e) => console.log("   ", JSON.stringify(e.params).slice(0, 400)));
} else {
  console.log("  console clean");
}

ws.close();
done();
/* Routing failures exit non-zero. Layout findings do not: they are reported
 * for judgement, whereas a frame of the wrong tab is not evidence at all. */
process.exit(routing ? 3 : 0);
