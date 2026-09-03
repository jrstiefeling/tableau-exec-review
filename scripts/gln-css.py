"""One-shot: swaps the metric-matrix stylesheet block for the growth-lanes one.

Three edits, all anchored on text rather than line numbers: the block itself,
its two short-screen tiers, and the two selector lists in the audit pass.
"""

from pathlib import Path

CSS = Path("styles/portlets.css")
src = CSS.read_text()

HEAD_OLD = """/* ------------------- outlook matrix and deal rail ------------------- */

/* Q3 Outlook — the metric matrix and the top-deal rail."""

HEAD_NEW = """/* -------------------- growth lanes and deal rail -------------------- */

/* Q3 Outlook — the growth lanes and the top-deal rail."""

start = src.index("/* ------------------------------ metric matrix ---")
end = src.index("/* ---------------------------- benchmark axes ---")

BLOCK = """/* ------------------------------ growth lanes ------------------------------ */

/* Three lanes, three subjects on each, and the axis turned per lane so that
   favourable is always to the right. The renderer's own header carries the
   argument for the form; these rules carry the two decisions it depends on.

   One: nothing centres itself with a transform. Every mark hangs off a
   zero-width pin at its own x and offsets itself with margins, because the
   animation primitives own `style.transform` for the length of a build — a
   mark that needed one for its geometry would sit half a mark off-centre
   until the build finished and then snap into place. The tick strip is the
   same rule at a different size: fixed-width labels with a negative margin,
   not translateX(-50%).

   Two: the label gutter and the tick strip share one width token. The strip
   is the ruler for marks in the column beside it, and a ruler that can drift
   out of alignment with what it measures is worse than no ruler. */

.gln {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(4px, 0.8vh, 10px);
  /* The one width both the lanes and their shared ruler are laid out on. */
  --gln-lab: clamp(92px, 10.5vw, 150px);
  --gln-gap: clamp(8px, 1vw, 16px);
  --gln-row: 62px;
}

/* -------------------------------- the key --------------------------------- */

/* Weight, read once, at the top. Each item carries the glyph of the mark that
   stands for it on the lanes below — a dot for a subject, a rule for the
   roll-up — so this is a legend for marks already on the page and not a
   fourth column repeated three times. */
.gln-key {
  flex: none;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: clamp(10px, 1.6vw, 28px);
  row-gap: 3px;
  padding-bottom: clamp(4px, 0.7vh, 9px);
  border-bottom: 1px solid var(--line);
}

.gln-keyitem {
  min-width: 0;
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  column-gap: 6px;
  align-items: center;
}

.gln-keyglyph {
  grid-column: 1;
  grid-row: 1 / span 2;
  justify-self: center;
  background: var(--row-tint, var(--accent));
}

.gln-keyglyph[data-kind="dot"] {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.gln-keyglyph[data-kind="rule"] {
  width: 3px;
  height: 14px;
  border-radius: 1.5px;
}

.gln-keyname {
  grid-column: 2;
  grid-row: 1;
  margin: 0;
  font-size: clamp(9px, 0.7vw, 10.5px);
  line-height: 1.2;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gln-keyitem[data-level="0"] .gln-keyname {
  font-size: clamp(8.5px, 0.63vw, 9.5px);
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--accent);
  transition: color 0.5s var(--ease);
}

.gln-keybar {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  margin: 3px 0 0;
  height: 6px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--ink-dim) 16%, transparent);
  overflow: hidden;
}

.gln-keybar i {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: block;
  border-radius: 3px;
  background: var(--row-tint, var(--accent));
}

/* Outside the bar, not inside it. Inside is where this was first, and the
   smallest of the three subjects is about a sixth of the largest — at 1024
   that bar is under thirty pixels and the numeral was clipped by its own
   mark. */
.gln-keyval {
  grid-column: 3;
  grid-row: 1 / span 2;
  align-self: center;
  font-size: clamp(11px, 0.95vw, 14px);
  font-weight: 700;
  line-height: 1.1;
  color: var(--ink);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.gln-keynote {
  grid-column: 1 / -1;
  margin: 2px 0 0;
  font-size: clamp(8px, 0.6vw, 9.5px);
  line-height: 1.28;
  color: var(--ink-dim);
}

/* ------------------------------- the lanes -------------------------------- */

.gln-lanes {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(3, minmax(var(--gln-row), 1fr));
  row-gap: 0;
}

.gln-lane {
  min-height: 0;
  display: grid;
  grid-template-columns: var(--gln-lab) minmax(0, 1fr);
  column-gap: var(--gln-gap);
  align-items: center;
  padding: clamp(2px, 0.5vh, 6px) 0;
}

.gln-lane + .gln-lane {
  border-top: 1px solid var(--line);
}

.gln-lanelab {
  min-width: 0;
}

.gln-lanename {
  margin: 0;
  font-size: clamp(9.5px, 0.8vw, 12px);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--ink);
}

/* The polarity, and on a mirrored lane the fact of the mirror. Stated on the
   lane it applies to, because a legend for a thing that is true of one lane
   out of three is a lookup no reader performs. */
.gln-lanepol {
  margin: 1px 0 0;
  font-size: clamp(8px, 0.6vw, 9.5px);
  line-height: 1.24;
  font-weight: 500;
  color: var(--ink-dim);
}

.gln-lane[data-mirrored="true"] .gln-lanepol {
  font-weight: 600;
  color: var(--ink-soft);
}

.gln-plotwrap {
  position: relative;
  min-width: 0;
  height: 100%;
  min-height: 52px;
}

/* The furniture only. It stretches, which is right for a rule and wrong for
   a dot, so the dots are not in here. */
.gln-plot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Two words, one at each end, and they are the mirror's entire user
   interface: on the mirrored lane "better" still sits right and the tick
   below it still reads negative, which is the reading the lane asks for and
   the point at which a reader either takes it or does not. Set just above
   the baseline so they do not print on it. */
.gln-end {
  position: absolute;
  bottom: calc(50% + 3px);
  font-size: clamp(7px, 0.55vw, 8.5px);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--ink-dim);
  opacity: 0.75;
  pointer-events: none;
}

.gln-end[data-side="worse"] { left: 0; }
.gln-end[data-side="better"] { right: 0; }

/* ------------------------------- the marks -------------------------------- */

/* A zero-width column at one position on a lane. Everything that belongs to
   that position hangs off this. */
.gln-pin {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
}

.gln-dot {
  position: absolute;
  top: 50%;
  left: 0;
  width: 11px;
  height: 11px;
  margin: -5.5px 0 0 -5.5px;
  border-radius: 50%;
  background: var(--row-tint, var(--accent));
  box-shadow: 0 0 0 2px var(--surface);
}

/* The roll-up is a reference, not a peer: a rule the children are read
   against rather than a third dot competing with them on the same lane. */
.gln-roll {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: -1.5px;
  width: 3px;
  border-radius: 1.5px;
  background: var(--row-tint, var(--ink));
}

.gln-ghost {
  position: absolute;
  top: 9px;
  bottom: 9px;
  left: -1px;
  width: 2px;
  background: repeating-linear-gradient(
    180deg,
    var(--line-strong) 0 2px,
    transparent 2px 4px
  );
}

/* The separation, drawn. Its length is the finding — how far apart the
   subjects have moved on this measure — so it is an interval rather than a
   gap the reader is left to measure between two dots. */
.gln-spread {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 3px;
  margin-top: -1.5px;
  border-radius: 1.5px;
  background: color-mix(in srgb, var(--ink-soft) 32%, transparent);
}

.gln-rolllab {
  position: absolute;
  top: 0;
  white-space: nowrap;
  font-size: clamp(8px, 0.6vw, 9.5px);
  line-height: 1.2;
  font-weight: 600;
  color: var(--ink-dim);
}

.gln-rolllab[data-side="l"] { right: 7px; }
.gln-rolllab[data-side="r"] { left: 7px; }

.gln-rolllab b {
  font-size: clamp(9.5px, 0.74vw, 11.5px);
  font-weight: 700;
  color: var(--mark-tint, var(--ink));
  font-variant-numeric: tabular-nums;
}

/* Sided by rank within the lane rather than against the roll-up: both
   children can land the same side of their parent, and in direct mode on one
   of these lanes both do. */
.gln-dotlab {
  position: absolute;
  top: calc(50% + 8px);
  display: flex;
  flex-direction: column;
  line-height: 1.16;
  white-space: nowrap;
}

.gln-dotlab[data-side="l"] { right: 8px; align-items: flex-end; }
.gln-dotlab[data-side="r"] { left: 8px; align-items: flex-start; }

.gln-dotlab b {
  font-size: clamp(10px, 0.82vw, 12.5px);
  font-weight: 700;
  color: var(--mark-tint, var(--ink));
  font-variant-numeric: tabular-nums;
}

.gln-dotlab em {
  font-style: normal;
  font-size: clamp(8px, 0.6vw, 9.5px);
  font-weight: 500;
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}

/* ------------------------------ the ruler --------------------------------- */

/* One strip for all three lanes, in the same grid column as the plots. Ticks
   are fixed-width and pulled back by half rather than translated, for the
   reason at the top of this block. */
.gln-striprow {
  flex: none;
  display: grid;
  grid-template-columns: var(--gln-lab) minmax(0, 1fr);
  column-gap: var(--gln-gap);
}

.gln-strip {
  position: relative;
  height: 12px;
}

.gln-tick {
  position: absolute;
  top: 0;
  width: 52px;
  margin-left: -26px;
  text-align: center;
  line-height: 1;
  font-size: 7.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ink-dim);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.gln-tick[data-kind="zero"] {
  font-weight: 700;
  color: var(--ink-soft);
}

.gln-tick[data-edge="start"] { left: 0 !important; margin-left: 0; text-align: left; }
.gln-tick[data-edge="end"] { left: auto !important; right: 0; margin-left: 0; text-align: right; }

/* --------------------- the alternate basis, named ------------------------- */

/* A second stated value for the same measure. It is a finding about measure
   identity, which is the argument the whole board is making, so it gets a
   strip and a readable size rather than 8px of grey inside a mark. Each entry
   carries the glyph of the tick that holds it on the lane above.

   The void state is why this is a strip and not a conditional: in direct mode
   there is no second basis to name, and a strip that vanishes is a strip
   nobody notices went. */
.gln-alt {
  flex: none;
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: clamp(8px, 1.1vw, 18px);
  row-gap: 2px;
  padding-top: 5px;
  border-top: 1px solid var(--line);
  font-size: clamp(8.5px, 0.66vw, 10px);
  line-height: 1.3;
  color: var(--ink-soft);
}

.gln-alt > b {
  font-size: clamp(7.5px, 0.58vw, 9px);
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ink-dim);
}

.gln-altitem {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.gln-altitem b {
  font-weight: 700;
  color: var(--ink);
}

.gln-altglyph {
  flex: none;
  display: block;
  width: 2px;
  height: 11px;
  background: repeating-linear-gradient(
    180deg,
    var(--line-strong) 0 2px,
    transparent 2px 4px
  );
}

.gln-altvoid {
  font-style: italic;
  color: var(--ink-dim);
}

.gln-alt > em {
  margin-left: auto;
  font-style: normal;
  font-size: clamp(8px, 0.6vw, 9.5px);
  color: var(--ink-dim);
}

"""

src = src[:start] + BLOCK + src[end:]
assert HEAD_OLD in src
src = src.replace(HEAD_OLD, HEAD_NEW)

# ---------------------------- the short screens -----------------------------

SHORT_860_OLD_START = src.index("""@media (max-height: 860px) {
  .mmx {""")
SHORT_860_OLD_END = src.index("""/* The laptop tier proper.""")

SHORT_860 = """@media (max-height: 860px) {
  .gln {
    gap: 4px;
    /* Height is the scarce dimension. A lane needs room for a roll-up label
       above the axis and a two-line subject label below it, and 54px is where
       those three stop having any air between them — below that the labels
       start touching rather than the type shrinking. */
    --gln-row: 54px;
  }

  .gln-key {
    padding-bottom: 4px;
  }

  .gln-keynote {
    margin-top: 1px;
  }

  .gln-lane {
    padding: 2px 0;
  }

  .gln-alt {
    padding-top: 4px;
    column-gap: clamp(8px, 1.1vw, 16px);
  }
}

"""

src = src[:SHORT_860_OLD_START] + SHORT_860 + src[SHORT_860_OLD_END:]

SHORT_700_OLD = """@media (max-height: 700px) {
  .mmx {
    gap: 2px;
    /* The last 6px, and the marks give it up rather than the type: 72px still
       resolves every bullet track to a length a reader can compare, and the
       alternative was a cell whose coverage line printed over the row rule
       under it. */
    --mmx-mark: clamp(72px, 11vh, 190px);
  }

  .mmx-grid {
    grid-template-rows: auto repeat(3, minmax(68px, 1fr)) auto;
  }

  .mmx[data-landscape="true"] .mmx-grid {
    grid-template-rows: auto repeat(3, minmax(46px, 1fr)) auto;
  }

  .mmx-foot {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: clamp(12px, 1.6vw, 26px);
    row-gap: 1px;
  }
"""

SHORT_700 = """@media (max-height: 700px) {
  .gln {
    gap: 3px;
    /* The last of it, and the lanes give it up rather than the type. Every
       figure the tab printed at 768 tall it still prints at 580. */
    --gln-row: 46px;
  }

  .gln-keynote {
    display: none;
  }

  .gln-dotlab {
    top: calc(50% + 7px);
  }
"""

assert SHORT_700_OLD in src
src = src.replace(SHORT_700_OLD, SHORT_700)

# ------------------------------ the audit pass ------------------------------

AUDIT_OLD = """    .mmx-value, .mmx-readnum, .mmx-readvalue, .mmx-readyoy, .mmx-chip,"""
AUDIT_NEW = """    .gln-keyval, .gln-rolllab b, .gln-dotlab b,"""
assert src.count(AUDIT_OLD) == 2
src = src.replace(AUDIT_OLD, AUDIT_NEW)

CSS.write_text(src)
print("portlets.css: metric matrix out, growth lanes in")
