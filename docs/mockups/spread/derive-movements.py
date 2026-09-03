#!/usr/bin/env python3
"""Derive the 20 movement figures for the groupMovement panels, and check them.

Writes docs/mockups/spread/movements.json — a staging file, paste-ready for
data/board.json once the tree is free.

Every figure here is exact arithmetic over two authored figures in
data/board.json:

    prior = current / (1 + Y/Y)
    delta = current - prior

Nothing is estimated, smoothed or rounded up. The `value` fields carry two
decimals because that is where the arithmetic lands; the `*Display` strings
carry one, because a movement of $14.77M is not known to the cent — it
inherits the rounding of its inputs, which are authored to whole $M and whole
per cent. The panel prints the display strings and never the raw values.

Run:  python3 docs/mockups/spread/derive-movements.py
"""

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
BOARD = ROOT / "data" / "board.json"
OUT = pathlib.Path(__file__).resolve().parent / "movements.json"

LEAVES = ["cloud", "server", "next", "crma"]
SHORT = {"cloud": "Cloud", "server": "Server", "next": "Next", "crma": "CRMA"}

MINUS = "\u2212"          # U+2212 MINUS SIGN, as the board uses for negatives
MIDDOT = " \u00b7 "


def find(board, pid):
    for tab in board["tabs"]:
        for band in tab.get("bands", []):
            for p in band.get("portlets", []):
                if p["id"] == pid:
                    return p
    raise KeyError(pid)


def money(v, dp=1):
    """A signed dollar string in the board's glyphs: −$14.8M / +$6.4M."""
    sign = MINUS if v < 0 else "+"
    return f"{sign}${abs(v):.{dp}f}M"


def level(v, dp=1):
    return f"${v:.{dp}f}M"


def r2(v):
    return round(v + 0.0, 2)


def part(pid, label, current, yoy):
    prior = current / (1 + yoy / 100)
    delta = current - prior
    return {
        "id": pid,
        "label": label,
        "short": SHORT[pid],
        "value": current,
        "valueDisplay": f"${current}M",
        "yoy": yoy,
        "yoyDisplay": f"{'+' if yoy > 0 else MINUS}{abs(yoy)}%",
        "priorValue": r2(prior),
        "priorDisplay": level(prior),
        "delta": r2(delta),
        "deltaDisplay": money(delta),
    }


def group(gid, label, full, parts):
    net = sum(p["delta"] for p in parts)
    losses = sum(-p["delta"] for p in parts if p["delta"] < 0)
    gains = sum(p["delta"] for p in parts if p["delta"] > 0)
    return {
        "id": gid,
        "label": label,
        "fullLabel": full,
        "net": r2(net),
        "netDisplay": money(net),
        "lossWing": r2(losses),
        "gainWing": r2(gains),
        "parts": parts,
    }


def main():
    board = json.loads(BOARD.read_text())
    seg = find(board, "seg-matrix")["metrics"]
    perf = find(board, "perf-hierarchy")["metrics"]
    segrows = {r["id"]: r for r in seg["rows"]}
    perfrows = {r["id"]: r for r in perf["rows"]}

    # ---- Segment tab: four segments x four leaf lines = 16 movements -------
    # "All Segments" is deliberately absent. Summing the four segment columns
    # gives $84M against perf-hierarchy's authored $83M, so a cross-segment
    # row would have to publish one of the two. The all-segments read is the
    # Product tab, from its own authored figures.
    seg_groups = []
    for i, s in enumerate(seg["segments"]):
        parts = [
            part(pid, segrows[pid]["label"], segrows[pid]["values"][i], segrows[pid]["yoy"][i])
            for pid in LEAVES
        ]
        seg_groups.append(group(f"{s['id']}-move", s["short"], s["label"], parts))

    # ---- Product tab: two motions x two leaf lines = 4 movements ----------
    motions = [
        ("platform", "Agentic Analytics Platform", ["cloud", "server"]),
        ("embedded", "Embedded Agentic Analytics", ["next", "crma"]),
    ]
    perf_groups = []
    for gid, label, members in motions:
        parts = [part(pid, perfrows[pid]["label"], perfrows[pid]["value"], perfrows[pid]["yoy"])
                 for pid in members]
        perf_groups.append(group(f"{gid}-move", label, label, parts))

    # ------------------------------- checks --------------------------------
    checks = []

    def check(name, ok, detail):
        checks.append({"check": name, "pass": bool(ok), "detail": detail})
        if not ok:
            print(f"FAIL  {name}: {detail}", file=sys.stderr)

    n = sum(len(g["parts"]) for g in seg_groups) + sum(len(g["parts"]) for g in perf_groups)
    check("twenty movements authored", n == 20, f"{n} parts")

    # Every delta is exactly value - priorValue at the stored precision.
    worst = 0.0
    for g in seg_groups + perf_groups:
        for p in g["parts"]:
            worst = max(worst, abs((p["value"] - p["priorValue"]) - p["delta"]))
    check("delta == value - priorValue", worst < 5e-3, f"max residual {worst:.4f}")

    # Every net is exactly the sum of its own parts — the panel never claims
    # the parts land on an authored group total.
    worst = 0.0
    for g in seg_groups + perf_groups:
        worst = max(worst, abs(sum(p["delta"] for p in g["parts"]) - g["net"]))
    check("net == sum(parts)", worst < 5e-3, f"max residual {worst:.4f}")

    # Domains must cover every wing on their own panel.
    seg_domain = [-28, 8]
    perf_domain = [-42, 12]
    for label, groups, dom in (("segment", seg_groups, seg_domain), ("product", perf_groups, perf_domain)):
        lo = max(g["lossWing"] for g in groups)
        hi = max(g["gainWing"] for g in groups)
        check(f"{label} domain covers its wings", -dom[0] >= lo and dom[1] >= hi,
              f"max loss wing {lo:.2f}, max gain wing {hi:.2f}, domain {dom}")

    # The three known inconsistencies, recorded as checked-and-routed-around
    # rather than annotated on the page.
    cmrcl = 1
    tot = segrows["analytics-total"]["values"][cmrcl]
    kids = segrows["platform"]["values"][cmrcl] + segrows["embedded"]["values"][cmrcl]
    check("routed: CMRCL does not close (no bridge drawn)", tot != kids,
          f"authored total {tot} vs children {kids} — panel draws parts only, never a closing total")

    entr_leafsum = sum(p["delta"] for p in seg_groups[0]["parts"])
    entr_totdelta = (segrows["analytics-total"]["values"][0]
                     - segrows["analytics-total"]["values"][0] / (1 + segrows["analytics-total"]["yoy"][0] / 100))
    check("routed: leaf residual against the authored total row",
          abs(entr_leafsum - entr_totdelta) > 0.01,
          f"ENTR leaves {entr_leafsum:.2f} vs total row {entr_totdelta:.2f} — the panel's net is labelled as the net of the four lines shown")

    segsum = sum(segrows["analytics-total"]["values"])
    check("routed: no cross-segment sum is published",
          segsum != perfrows["analytics-total"]["value"],
          f"segment columns sum to {segsum} vs the Product tab's authored {perfrows['analytics-total']['value']} — no All Segments row exists on the segment panel")

    # Tableau Next must not read as negligible: it is the largest positive
    # movement on the board, and the panel has to say so.
    all_deltas = [(p["short"], p["delta"]) for g in perf_groups for p in g["parts"]]
    biggest_up = max(all_deltas, key=lambda kv: kv[1])
    check("Tableau Next is the largest positive movement", biggest_up[0] == "Next",
          f"{biggest_up[0]} {biggest_up[1]:+.2f}M")

    # ------------------------- the provenance faces ------------------------
    # Conventions taken from the 26 blocks corrected in b6f20fb: the model is
    # named, `<TBD: ...>` marks what the source docs do not settle, and `why`
    # argues the one thing the layer is doing that a raw read could not.
    def semantic(scope, extra):
        base = {
            "measure": "ACV_clc",
            "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
            "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
            "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
            "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
            "why": (
                "A dollar movement is one measure differenced at two periods, which is why the pieces of a wing "
                f"can be laid end to end: ACV_clc is certified additive across the {scope}, and that guarantee is "
                "what makes a decomposition legal rather than a coincidence that holds this quarter. "
                "The panel that stood here did the opposite — it cited this model's own rule that a Y/Y is "
                "non-additive, and then printed the arithmetic difference of two Y/Y figures as its largest "
                "numeral, two rates off bases three orders of magnitude apart. This panel subtracts dollars and "
                "never rates. It also claims nothing it cannot close: the net is the net of the lines drawn "
                "rather than a group total, which is why there is no bridge and no cross-group sum on it."
            ),
        }
        base.update(extra)
        return base

    seg_semantic = semantic("APM product hierarchy inside one segment", {
        "metricName": "Within-Segment ACV Movement",
        "definition": (
            "The change in ACV_clc between Q2 FY26 and Q2 FY27 for each product line inside one segment, "
            "drawn as two wings off a common zero. Prior-period dollars come from the 'PY' rows of the same "
            "grouped pull as the matrix beside it, not from a separate point-in-time snapshot."
        ),
        "sdm": "Sls_Forecasting_Metrics_Expanded — the segment derivation decides the model for both portlets",
        "grain": (
            "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × APM_L218 × the "
            "derived segment, at two periods of the same measure."
        ),
        "lineage": [
            "Org62 Opportunity",
            "Tableau Extract (.tdsx)",
            "ACV_HISTORICALS",
            "Close_Date_Relative_Year_clc — 'CY' and 'PY'",
            "Segment10 + <TBD: OU field>",
        ],
    })

    perf_semantic = semantic("APM product hierarchy", {
        "metricName": "Within-Motion ACV Movement",
        "definition": (
            "The change in ACV_clc between Q2 FY26 and Q2 FY27 for each APM L2 line inside one motion, drawn "
            "as two wings off a common zero. Prior-period dollars come from the 'PY' rows of the same grouped "
            "pull as the panel above it, not from a separate point-in-time snapshot."
        ),
        "sdm": "Sls_Forecasting_Metrics_Expanded",
        "grain": (
            "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × motion, from the "
            "same APM_L218 pull as the panel above it, at two periods of the same measure."
        ),
        "lineage": [
            "Org62 Opportunity",
            "Tableau Extract (.tdsx)",
            "ACV_HISTORICALS",
            "Close_Date_Relative_Year_clc — 'CY' and 'PY'",
            "APM product hierarchy (L1/L2/L3)",
        ],
    })

    payload = {
        "_README": (
            "Staging file for the groupMovement panels — paste-ready. Replace the "
            "seg-spread and perf-divergence portlets in data/board.json with the "
            "two blocks below (dropping the leading underscore keys), then run "
            "node scripts/sync-fallback.mjs. Regenerate with "
            "python3 docs/mockups/spread/derive-movements.py"
        ),
        "_derivation": {
            "rule": "prior = current / (1 + Y/Y); delta = current - prior",
            "inputs": "seg-matrix.metrics.rows[].values/.yoy and perf-hierarchy.metrics.rows[].value/.yoy, both authored",
            "exactness": "Exact arithmetic over authored figures. The result inherits the rounding of its inputs, which are authored to whole $M and whole per cent; value fields carry two decimals, display strings one.",
            "authoring": "These are authored into board.json rather than computed in the renderer, per docs/visualization-research.md 'author the prior period, do not derive it'.",
            "liveSource": "Prior year is the 'PY' rows of the same grouped pull — Close_Date_Relative_Year_clc = 'PY' on ACV_HISTORICALS, Sls_Forecasting_Metrics_Expanded. Not a separate point-in-time snapshot.",
        },
        "_checks": checks,
        "seg-spread": {
            "id": "seg-spread",
            "kind": "groupMovement",
            "label": "Within-segment movement",
            "sublabel": "What moved each segment's dollars, Q2 FY26 to Q2 FY27",
            "accent": "#6B4FBF",
            "semantic": seg_semantic,
            "directMode": {
                "tier": "red",
                "candidates": ["sixteen movements, three candidate segments"],
                "missing": "The certified segment dimension the decomposition is taken within, and the as-of rule that says which segment a reclassified account moved in",
                "effect": "The wings still draw and each is taken over a different population, so an account that moved up-market in April is a loss in one segment and a gain in another across two readings of the same quarter",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Fund a recovery in the segment that only recovered because accounts were reclassified into it",
                "trustCost": "A decomposition over an unstable population decomposes the population",
                "metrics": {
                    "caption": "Four decompositions, four different populations",
                },
            },
            "metrics": {
                "unit": "$M",
                "goodDirection": "up",
                "priorPeriodLabel": "Q2 FY26",
                "domain": seg_domain,
                "axisTicks": [-25, -15, -5, 0, 5],
                "lossKey": "dollars removed",
                "gainKey": "dollars added",
                "orderNote": "largest line nearest the rule",
                "axisNote": "Change in ACV_clc, Q2 FY26 to Q2 FY27, on one linear dollar scale shared by all four segments. Prior period derived: ACV \u00f7 (1 + Y/Y).",
                "caption": "Every segment gave up platform dollars. Tableau Next put $6.4M back into Enterprise — the largest gain on the panel.",
                "detailNote": "Prior period derived from the authored current-quarter dollars and Y/Y. Each net is the net of the four lines shown, not a segment total.",
                "rows": seg_groups,
            },
        },
        "perf-divergence": {
            "id": "perf-divergence",
            "kind": "groupMovement",
            "label": "Within-motion movement",
            "sublabel": "What moved each motion's dollars, Q2 FY26 to Q2 FY27",
            "accent": "#12806A",
            "semantic": perf_semantic,
            "directMode": {
                "tier": "red",
                "candidates": ["four movements with nothing to group them"],
                "missing": "The motion-to-line parentage — without it there is no inside-each-motion for a decomposition to be taken within",
                "effect": "Four line movements survive and the two decompositions do not, so the fact that one motion's dollars all left and the other's mostly arrived has nowhere to be seen",
                "thesisTag": "T4",
                "thesis": "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
                "risk": "Treat Embedded as one growing thing and fund both of its lines on the strength of one",
                "trustCost": "A grouping that only exists in the deck cannot be reviewed against next quarter's deck",
                "metrics": {
                    "caption": "No motion parentage — no decomposition to take",
                },
            },
            "metrics": {
                "unit": "$M",
                "goodDirection": "up",
                "priorPeriodLabel": "Q2 FY26",
                "domain": perf_domain,
                "axisTicks": [-40, -30, -20, -10, 0, 10],
                "lossKey": "dollars removed",
                "gainKey": "dollars added",
                "orderNote": "largest line nearest the rule",
                "axisNote": "One linear dollar scale, both motions. Prior period derived: ACV \u00f7 (1 + Y/Y).",
                "caption": "The platform gave up $39.8M. Tableau Next added $10.5M — the largest gain anywhere on this board, off a $2.5M base.",
                "detailNote": "Prior period derived from the authored current-quarter dollars and Y/Y. Each net is the net of the lines shown, not a motion total.",
                "rows": perf_groups,
            },
        },
    }

    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")

    failed = [c for c in checks if not c["pass"]]
    print(f"wrote {OUT.relative_to(ROOT)}  —  {n} movements, {len(checks)} checks, {len(failed)} failed")
    for c in checks:
        print(f"  {'ok  ' if c['pass'] else 'FAIL'} {c['check']}: {c['detail']}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
