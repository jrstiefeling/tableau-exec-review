/* Screenshot and console harness for verification.
 *
 * Drives headless Chrome over the CDP websocket rather than shelling out to
 * --screenshot, because three of the things that need verifying cannot be seen
 * from a one-shot capture: whether the entrance choreography has finished,
 * whether anything flashes mid-sweep, and whether the page logged an error on
 * the way. So this waits for the build to settle before it shoots, can shoot
 * deliberately early, and reports everything the console said.
 *
 *   node scripts/shoot.mjs <urlPath> <w>x<h> <name> [--direct] [--at ms]
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
  await send("Runtime.evaluate", {
    expression: `(() => {
      const btn = document.querySelector('[data-mode-btn], .mode-switch-btn, #mode-toggle');
      if (btn) { btn.click(); return 'clicked ' + btn.className; }
      return 'no button';
    })()`,
    awaitPromise: true, returnByValue: true
  }, sessionId).then((r) => console.log("  direct:", r.result.value));
}

await new Promise((r) => setTimeout(r, at == null ? 4200 : at));

/* Layout audit, run in the page: anything that scrolls inside its own box,
 * anything that overflows the stage, anything clipped. */
const audit = await send("Runtime.evaluate", {
  expression: `(() => {
    const out = { scrollers: [], overflow: [], clipped: [] };
    const stage = document.querySelector('.stage');
    const sb = stage ? stage.getBoundingClientRect() : null;
    // The provenance back face and the expand detail are laid out off-screen
    // by design, so they are not overflow.
    const hidden = (el) => el.closest('.portlet-back, .prov, .portlet-detail, .rules-flyover, [aria-hidden="true"]');
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
    const panel = document.querySelector('.panel.is-active .panel-bands');
    out.bands = panel ? Math.round(panel.getBoundingClientRect().height) : null;
    out.stage = sb ? Math.round(sb.height) : null;
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
console.log("  stage", a.stage, "bands", a.bands, "| scrollers", a.scrollers.length,
  "| stage-overflow", a.overflow.length, "| clipped", a.clipped.length, "| still-hidden", a.invisible.length);
a.invisible.forEach((s) => console.log("    HIDDEN", s));
a.scrollers.slice(0, 6).forEach((s) => console.log("    SCROLL", s));
a.overflow.slice(0, 8).forEach((s) => console.log("    OVER  ", s));
a.clipped.slice(0, 8).forEach((s) => console.log("    CLIP  ", s));
if (errors.length) {
  console.log(`  CONSOLE ERRORS: ${errors.length}`);
  errors.slice(0, 6).forEach((e) => console.log("   ", JSON.stringify(e.params).slice(0, 400)));
} else {
  console.log("  console clean");
}

ws.close();
done();
process.exit(0);
