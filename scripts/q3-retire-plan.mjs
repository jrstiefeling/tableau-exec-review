/* One-shot: retires the plan metadata now that the tab has stopped drawing it.
 *
 * Retired, not deleted. The limit is still real — there is still no FinPlan
 * object in either model, and the exec tab still prints three percentages that
 * depend on one — so the gap entry stays and keeps its evidence. What changes
 * is that the Q3 tab is no longer among the surfaces that inherit it, and the
 * block recording six derived figures now records that they came off, and
 * when, rather than how they were drawn.
 *
 * A catalog that quietly loses an entry loses the reason it was there. */

import { readFile, writeFile } from "node:fs/promises";

/* Takes a path so it can be pointed at a copy. Several agents work this tree
   at once and this file is contended; running the transform against a clean
   checkout of it is how this change gets staged on its own rather than on top
   of whatever else is uncommitted. */
const PATH = process.argv[2]
  ? new URL(process.argv[2], `file://${process.cwd()}/`)
  : new URL("../data/tableau-source-catalog.json", import.meta.url);
const catalog = JSON.parse(await readFile(PATH, "utf8"));

const gap = catalog.gaps.planAttainment;
const portlet = catalog.portlets["outlook-matrix"];

/* ------------------------------ the gap entry ----------------------------- */

gap.affectsEveryFinPlanAttainmentFigureOnTheQ3OutlookTab = [];
gap.q3OutlookNoLongerAffected =
  "The Q3 Outlook tab drew six figures off this limit and now draws none. Its hero was rebuilt onto year-over-year growth, which is authored for all nine of its cells in both modes, and the deals rail was re-based from the derived gap onto the five deals' own total. Neither portlet reads an attainment percentage in either mode. The exec tab's three cards are unaffected and still do.";

gap.specificFiguresWithNoSource = [
  "kpi-acv plan attainment",
  "kpi-nnaov plan attainment",
  "kpi-attrition plan attainment"
];
gap.figuresRetiredFromTheBoard = [
  "outlook-matrix Analytics ACV 87% of Product FinPlan — no longer drawn",
  "outlook-matrix Platform ACV 78% of Product FinPlan — no longer drawn",
  "outlook-matrix Embedded ACV 128% of Product FinPlan — no longer drawn"
];

const derived = gap.derivedQuantitiesThatInheritThisLimit;
derived._note =
  "RETIRED AT THE GROWTH REBUILD, kept for the record. Everything below was arithmetically exact from two authored figures and unsourceable for exactly one reason: one of those two figures had no governed denominator. Exactness is not sourceability — which is why the honest resolution was to stop drawing the derived quantities rather than to keep drawing them with a caveat attached.";
derived.status = "retired — no portlet computes any of these";
derived.consequence =
  "This is what the limit cost while it was being drawn: a plan bar, its target tick, a dashed shortfall, a gap readout and the deals composition's entire scale, all resting on a percentage neither semantic model can produce. The Q3 rebuild removed all five rather than qualifying them, so nothing on that tab has to come off if the board is wired live.";
derived.whyItIsStillDrawn = undefined;
derived.whyItIsNoLongerDrawn =
  "It was drawn because the tab already printed '87% of Product FinPlan' as authored data, and deriving a dollar gap from an authored percentage is no less sourceable than the percentage itself. That reasoning holds and was never the problem. What settled it was the subject: a hero whose largest mark is a shortfall against a target nobody can produce is a chart of the wrong thing, and the tab's own authored headline — 'Q3 tracks to $105M with attrition running 20% ahead of last year' — had been a growth claim the whole time.";
derived.renderRule =
  "No longer applicable — nothing renders these. Kept because the rule it states is general and the next portlet to derive a quantity from an ungoverned one will need it: handle it structurally, not with copy. A gap derived from a contested commit would be three different gaps rendered as one, so the mark comes off rather than being annotated.";
delete derived.whyItIsStillDrawn;

/* ------------------------------- the portlet ------------------------------ */

portlet.presentationGrain =
  "fiscal quarter × product motion (3 rows) × measure (3 lanes), each measure drawn as one signed growth axis with all three motions on it and the axis turned by the measure's authored good direction";
portlet.needs = [
  "columns[3] with goodDirection and polarityWord",
  "rows[3].cells[3]",
  "cells[].yoy",
  "cells[].altBasis",
  "metrics.key — the shared dollar scale the three levels are read on",
  "metrics.axisTicks"
];
portlet.measures.finPlanAttainment = undefined;
delete portlet.measures.finPlanAttainment;

portlet.cannotSource = [
  "the three motion rows — no motion dimension exists",
  "polarity — goodDirection: 'down' on the Attrition lane is a board decision, and on this chart it is load-bearing rather than decorative: it is what turns that lane's axis"
];
portlet.planAttainmentNoLongerDrawn =
  "This portlet drew every FinPlan attainment figure on the tab — 87%, 78%, 128% — and a derived plan and gap from each. All six came off at the growth rebuild. The limit that blocked them is unchanged and still recorded at gaps.planAttainment; what changed is that nothing here depends on it.";

/* The prior-year dollars are the one thing the new hero deliberately does not
   draw, and the reason is a rule rather than a gap, so it belongs here. */
portlet.whyNoPriorYearDollars =
  "The Y/Y rates are authored to the integer, so a prior-year amount reconstructed from a current amount and a rate is an interval, not a figure: Platform's $75.5M at -15% puts the prior year somewhere in $88.3M-$89.3M. The board does not draw estimates, so the hero states the rate and the current dollars and never the prior-year ones. A live wiring would query the 'PY' rows directly and would not have this problem — the limit is the mock data's precision, not the model's.";

await writeFile(PATH, `${JSON.stringify(catalog, null, 2)}\n`);
console.log("catalog: plan metadata retired");
