/* One growth scale for the product tab, the segment tab and the outlook tab.
 *
 * Y/Y across those three tabs runs from -48% to +1060%. Linear flattens
 * everything that is not Tableau Next; plain log cannot cross zero and cannot
 * express "flat". So: linear through the neutral band, logarithmic beyond it,
 * with a gridline at every decade so the compression is drawn rather than
 * assumed.
 *
 * CORE is 10 on purpose. It is the same value as the softBand default in
 * palette.js toneOf(), which is the trend tab's "one stated colour
 * threshold". The linear region of this axis is therefore exactly the board's
 * stated neutral band: inside it, length is proportional and the tone is
 * amber; outside it, length compresses and the tone commits. One threshold,
 * two channels, no second rule for anybody to remember.
 *
 * This module registers no renderer. It is imported by growthMatrix and
 * metricMatrix, and it deliberately does not live in svg.js
 * beside linearScale — three new tabs sharing one new file is a smaller
 * surface than editing a module every existing chart imports. */

export const CORE = 10;            // percent — the linear/log crossover
export const DECADES = 2.2;       // log10 span past the core -> saturates at 1585%
export const CORE_FRACTION = 0.22; // share of the half-width spent on the core

/* Signed position in [-1, 1]. Scale-free on purpose: every chart multiplies
 * by its own half-width, so which decade lands where as a proportion is
 * identical everywhere on the board even though the pixel lengths are not. */
export function growthFraction(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return null;
  const value = Number(v);
  const b = (1 - CORE_FRACTION) / DECADES;
  const m = Math.abs(value);
  const f = m <= CORE
    ? (m / CORE) * CORE_FRACTION
    : CORE_FRACTION + b * Math.log10(m / CORE);
  return Math.sign(value) * Math.min(f, 1);
}

/* True when a value saturated the axis, so the caller can draw the overflow
 * notch rather than a bar that silently stops at the edge. */
export function growthClipped(v) {
  const f = growthFraction(v);
  return f !== null && Math.abs(f) >= 1;
}

export function growthX(v, zeroX, halfWidth) {
  const f = growthFraction(v);
  return f === null ? null : zeroX + f * halfWidth;
}

/* Decade gridlines, as fractions of the half-width. Drawn in every cell —
 * a symlog axis without visible decade marks is a lie by omission. */
export const GROWTH_TICKS = [
  { at: 0, label: "0", kind: "zero" },
  { at: CORE, label: "±10%", kind: "core" },
  { at: 100, label: "±100%", kind: "decade" },
  { at: 1000, label: "±1000%", kind: "decade" }
];

/* The decade fractions, without the core and without zero — the two pairs of
 * dashed rules every cell draws. */
export const DECADE_FRACTIONS = GROWTH_TICKS
  .filter((t) => t.kind === "decade")
  .map((t) => growthFraction(t.at));

/* One column gets a wide cell; two or more get a compact one. Both are 200:44
 * in spirit — the fractions are identical, only the pixel budget differs. */
export function cellBox(columnCount) {
  return columnCount === 1
    ? { w: 420, h: 48, pad: 14 }
    : { w: 200, h: 44, pad: 14 };
}

export function cellAxis(box) {
  const zeroX = box.w / 2;
  return { zeroX, halfWidth: zeroX - box.pad, midY: box.h / 2 };
}

/* The overflow notch: a three-tooth zigzag right edge, so a clipped value
 * looks clipped rather than stopping neatly at the axis end. Not exercised by
 * any authored value — the axis saturates at 1585% and the maximum in the
 * data is +1060% — but specified so the form has no undefined state. */
export function notchPath(x, y, h, dir) {
  const t = h / 3;
  const tip = 3.2 * dir;
  return [
    `M ${x} ${y}`,
    `l ${tip} ${t / 2}`,
    `l ${-tip} ${t / 2}`,
    `l ${tip} ${t / 2}`,
    `l ${-tip} ${t / 2}`,
    `l ${tip} ${t / 2}`,
    `l ${-tip} ${t / 2}`
  ].join(" ");
}

/* Percentage offset of a rate along a cell's own width, for positioning a DOM
 * label over an SVG cell without measuring anything. */
export function ratePercent(v, box) {
  const ax = cellAxis(box);
  const x = growthX(v, ax.zeroX, ax.halfWidth);
  if (x === null) return 50;
  return (x / box.w) * 100;
}
