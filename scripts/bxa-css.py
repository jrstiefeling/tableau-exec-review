"""One-shot: the benchmark axes' stylesheet, from absolute to signed distance."""

from pathlib import Path

CSS = Path("styles/portlets.css")
src = CSS.read_text()


def swap(old, new, count=1):
    global src
    assert src.count(old) == count, (src.count(old), old[:60])
    src = src.replace(old, new)


swap(
    """/* Several subjects on one axis per measure, so each subject is read against
   its own benchmark and against the others at the same time. The axes sit side
   by side rather than stacked: two stacked axes need roughly twice the height
   this band can afford, and the readings are short enough to halve the width
   without crowding the plot. */""",
    """/* Signed distance from a benchmark, several subjects to an axis. The axes sit
   side by side rather than stacked: two stacked axes need roughly twice the
   height this band can afford, and the readings are short enough to halve the
   width without crowding the plot.

   The column widths are the one negotiation in here. The readout now carries
   three short lines — the absolute reading, the verdict, and the benchmark it
   is a verdict against — where it carried two, and the width for the third
   comes out of the plot rather than out of the row label: the labels here run
   to "Embedded Agentic Analytics", and a gutter narrow enough to break that
   over three lines costs more height than the plot's last fifteen pixels are
   worth. */""",
)

swap(
    """  grid-template-columns:
    clamp(86px, 8.6vw, 124px)
    minmax(0, 1fr)
    clamp(48px, 5vw, 70px);""",
    """  grid-template-columns:
    clamp(86px, 8.4vw, 120px)
    minmax(0, 1fr)
    clamp(68px, 6.8vw, 96px);""",
)

swap(
    """/* Above the dot rather than below it, so the last row's labels never collide
   with the tick strip underneath them. */
.bxa-histlab {
  position: absolute;
  top: 0;
  left: var(--hist-x);
  transform: translateX(-50%);
  font-size: 8px;
  font-weight: 600;
  line-height: 1;
  color: var(--ink-dim);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

.bxa-histlab[data-edge="start"] { left: 0; transform: none; }
.bxa-histlab[data-edge="end"] { left: auto; right: 0; transform: none; }

""",
    "",
)

swap(
    """/* Wraps rather than clips. The governed form is short — "−0.1× vs hist" — but
   the severed one is a phrase, and the readout column is sized for the numeral
   above it rather than for the longest thing that can appear beneath it. */
.bxa-delta {
  margin: 0;
  font-size: clamp(8px, 0.62vw, 9.5px);
  font-weight: 600;
  line-height: 1.2;
  color: var(--ink-soft);
}""",
    """/* The finding, in words, tinted the same as the mark that draws it. Three
   channels saying one thing — position, colour and the word — because the
   reader who does not know which way is good on a coverage multiplier is
   exactly the reader this panel is for.

   Wraps rather than clips: the word and the amount are two flex items so a
   narrow column drops the amount to its own line instead of truncating it. */
.bxa-verdict {
  margin: 1px 0 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: baseline;
  column-gap: 4px;
  font-size: clamp(8px, 0.62vw, 9.5px);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  color: var(--ink-soft);
}

.bxa-verdict b {
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--val-tint, var(--ink-soft));
}

/* The benchmark, once per row and small. It is context for the verdict above
   it, not a second figure to be differenced — the differencing is done. */
.bxa-base {
  margin: 0;
  font-size: clamp(7.5px, 0.57vw, 9px);
  font-weight: 500;
  line-height: 1.2;
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}""",
)

# The absolute reading is no longer tinted by sentiment: the verdict beside it
# carries that, and a numeral that is only ever quoted should not be red.
swap(
    """  color: var(--val-tint, var(--ink));
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transition: color 0.5s var(--ease);
}""",
    """  color: var(--ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}""",
)

swap(
    """.bxa-tick[data-edge="start"] { left: 0; transform: none; }""",
    """.bxa-tick[data-kind="zero"] {
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.bxa-tick[data-edge="start"] { left: 0; transform: none; }""",
)

# The key was a hollow dot standing for a per-row benchmark. There is one
# benchmark now and it is a rule, so the key is a rule.
swap(
    """.bxa-key {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.7px solid var(--ink-dim);
  background: var(--surface-solid, #fff);
}""",
    """.bxa-key {
  flex: none;
  width: 2px;
  height: 12px;
  border-radius: 1px;
  background: var(--ink-soft);
}""",
)

CSS.write_text(src)
print("portlets.css: benchmark axes → delta mode")
