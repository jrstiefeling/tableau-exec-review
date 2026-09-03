#!/usr/bin/env python3
"""Apply the staged data edits to board.json and tableau-source-catalog.json.

Kept as a script rather than done by hand because both files are held by other
agents until they land, and a scripted edit shrinks the window in which this
one is holding them. Idempotent: re-running it produces the same file.

Run from the repo root:
    python3 docs/mockups/spread/staging/apply-data.py
    node scripts/sync-fallback.mjs
"""

import json
import pathlib
import sys
from collections import OrderedDict

ROOT = pathlib.Path(__file__).resolve().parents[4]
BOARD = ROOT / "data" / "board.json"
CATALOG = ROOT / "data" / "tableau-source-catalog.json"
STAGED = ROOT / "docs" / "mockups" / "spread" / "movements.json"


def load(path):
    return json.loads(path.read_text(), object_pairs_hook=OrderedDict)


def save(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def portlet_slot(board, pid):
    for tab in board["tabs"]:
        for band in tab.get("bands", []):
            for i, p in enumerate(band.get("portlets", [])):
                if p["id"] == pid:
                    return band["portlets"], i
    raise KeyError(pid)


def main():
    staged = load(STAGED)
    board = load(BOARD)

    # ---- 1. the two panels become groupMovement ---------------------------
    for pid in ("seg-spread", "perf-divergence"):
        block = OrderedDict(staged[pid])
        holder, i = portlet_slot(board, pid)
        # Preserve any key the other agents added that the staged block does
        # not speak to — layout hints, reveal ids and the like.
        merged = OrderedDict(holder[i])
        for k in ("kind", "label", "sublabel", "accent", "semantic", "directMode", "metrics"):
            merged[k] = block[k]
        holder[i] = merged
        print(f"  board.json  {pid} -> kind=groupMovement, {len(block['metrics']['rows'])} groups")

    # ---- 2. the matrix's column interval -----------------------------------
    # Already landed in 61be02c, with the explanation folded into the matrix's
    # own axisNote rather than a note key of its own. Deliberately not rewritten
    # here: this script is idempotent only if it stops touching what is done.
    if "interval" not in portlet_slot(board, "seg-matrix")[0][
            portlet_slot(board, "seg-matrix")[1]]["metrics"]:
        raise SystemExit("seg-matrix.metrics.interval missing — expected it from 61be02c")
    print("  board.json  seg-matrix -> interval already present, left alone")

    save(BOARD, board)

    # ---- 3. the catalog records where the prior year comes from -----------
    catalog = load(CATALOG)

    shared_prior = (
        "Prior-year dollars are the 'PY' rows of the SAME grouped pull, not a separate "
        "point-in-time snapshot and not a second query: Close_Date_Relative_Year_clc IN "
        "('CY','PY') is already in requiredFilters because the Y/Y needs it, so the "
        "prior-period ACV_clc rows are already in the result set. The panel that stood "
        "here discarded them and kept two rates; this one keeps the dollars and computes "
        "nothing from the rates. Same reasoning as "
        "portlets['acv-account-fan'].oneGroupedQueryNotTwoPulls."
    )

    seg = catalog["portlets"]["seg-spread"]
    seg["status"] = "sourceable"
    seg["presentationGrain"] = (
        "fiscal quarter x segment x APM_L218 at two periods — one decomposition row per "
        "segment, four product-line movements inside each"
    )
    seg["measures"] = OrderedDict([
        ("primary", "ACV_clc — differenced between the 'CY' and 'PY' rows of one grouped pull"),
    ])
    seg["priorYearSourcing"] = shared_prior
    seg["utteranceShape"] = (
        "Derived from the same grouped pull as seg-matrix, with Close_Date_Relative_Year_clc "
        "IN ('CY','PY') retained. No separate query: each product line's movement is the 'CY' "
        "ACV_clc less the 'PY' ACV_clc at the same segment and APM_L218."
    )
    seg["needs"] = [
        "rows[].parts[].value", "rows[].parts[].priorValue", "rows[].parts[].delta",
        "rows[].net",
    ]
    seg["whyThisIsBetterSourcedThanWhatItReplaces"] = (
        "The dispersion panel needed a client-side min and max over governed rates — legal, "
        "but a selection this board had to justify. This panel needs two dollar figures per "
        "line, both governed rows of the same pull, and does its one subtraction on a measure "
        "the model certifies as additive. Fewer client-side steps on a stronger guarantee."
    )
    seg["authoringRule"] = (
        "The 20 movements are AUTHORED in board.json, not computed at render time, per "
        "docs/visualization-research.md. A live implementation reads the 'PY' rows directly "
        "and does not reproduce the board's derivation."
    )
    for dead in ("rowCountUncertainty", "authoredTie"):
        seg.pop(dead, None)
    seg["cannotSource"] = [
        "the labels 'Tableau Cloud' / 'Tableau Server' / 'Tableau Next' as piece names — these are APM L2 values and must be enumerated live rather than assumed present in every segment",
        "an ESMB row, if the derivation's ESMB residual is rendered rather than folded — see portlets['seg-matrix'].cannotSource",
        "a group total the four pieces close on — the panel does not draw one, and the authored dollars would not support it",
    ]
    print("  catalog     seg-spread -> priorYearSourcing recorded, status sourceable")

    perf = catalog["portlets"]["perf-divergence"]
    perf["status"] = "partial"
    perf["presentationGrain"] = (
        "fiscal quarter x motion x APM_L218 at two periods — one decomposition row per motion, "
        "two product-line movements inside each"
    )
    perf["measures"] = OrderedDict([
        ("primary", "ACV_clc — differenced between the 'CY' and 'PY' rows of one grouped pull"),
    ])
    perf["priorYearSourcing"] = shared_prior
    perf["utteranceShape"] = (
        "Return ACV (ACV_clc) grouped by APM_L218 and by Close_Date_Relative_Year_clc for "
        "<scope filter>, filtered to Close_Date_Fiscal_Quarter_Datepart_clc = <resolved>, "
        "Is_QTD_ACV_1_clc = TRUE, and Close_Date_Relative_Year_clc IN ('CY','PY'). Exclude "
        "APM_L120 = 'Other'. Filter out null dimension values. Then difference each line's "
        "'CY' against its 'PY' and group by the motion mapping."
    )
    perf["needs"] = [
        "rows[].parts[].value", "rows[].parts[].priorValue", "rows[].parts[].delta",
        "rows[].net",
    ]
    perf["cannotSource"] = [
        "the motion grouping that defines 'inside each motion' — no motion dimension exists",
        "a motion total the pieces close on — the panel does not draw one",
    ]
    perf["wouldRequireToSourceFully"] = (
        "The same APM-L2-to-motion mapping. The movements themselves are sourceable once the "
        "grouping exists — and unlike the intervals they replace, they need no client-side "
        "selection at all."
    )
    perf.pop("clientSideDerivationIsAcceptableHere", None)
    perf["whyThisIsBetterSourcedThanWhatItReplaces"] = seg["whyThisIsBetterSourcedThanWhatItReplaces"]
    perf["authoringRule"] = seg["authoringRule"]
    print("  catalog     perf-divergence -> priorYearSourcing recorded")

    save(CATALOG, catalog)
    print("\napplied. now run: node scripts/sync-fallback.mjs")
    return 0


if __name__ == "__main__":
    sys.exit(main())
