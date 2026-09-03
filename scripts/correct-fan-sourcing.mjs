#!/usr/bin/env node
/* Corrects the source catalog for the fan repoint.
 *
 * Both authority documents in this repo advertised `acv-account-fan` as
 * sourceable with a query-construction caveat — status "partial", a resolved
 * conformed-identity field, a worked utterance. The premise of the repoint is
 * that the account-level ACV data does not exist at all, so those entries
 * asserted something the board has since established to be false. Two files
 * saying "⚠ sourceable, mind the dedup filter" about a population nobody has
 * is the exact overclaim this board exists to criticise, one level up.
 *
 * This rewrites the catalog entry. docs/semantic-layer.md is edited by hand,
 * because its corrections are prose in four different sections.
 *
 *   node scripts/correct-fan-sourcing.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = resolve(root, "data/tableau-source-catalog.json");
const catalog = JSON.parse(await readFile(path, "utf8"));

if (!catalog.portlets["acv-account-fan"] && catalog.portlets["acv-ae-fan"]) {
  console.log("correct-fan-sourcing: already applied");
  process.exit(0);
}

const old = catalog.portlets["acv-account-fan"];
if (!old) throw new Error("no acv-account-fan entry in the catalog");

/* Rebuilt rather than patched. Almost every key on the old entry was about an
 * account identity that is no longer the subject, and leaving any of them in
 * place would leave a reader half a recipe for the wrong pull. */
const entry = {
  tab: "exec",
  status: "partial",
  statusWhy:
    "The MEASURE is fully sourceable and the POPULATION is not. ACV_clc grouped by User_Name10 where User_Role2 = 'AE' needs no headcount measure — at AE grain the denominator is one — and both years come from the 'PY' and 'CY' rows of one grouped query. What cannot be sourced is the set of AEs who were carrying a quota at the prior point: the User Hierarchy table is current state on a weekly refresh with no as-of-period-end read. The portlet is therefore supplemented, not certified, and the panel restricts itself to AEs present on both rosters and holds joiners and leavers out as labelled stubs.",
  replacedPortlet: {
    was: "acv-account-fan — per-account ACV movement, Q2 FY27 against Q2 FY26",
    why:
      "The account-level ACV data behind that panel does not exist. This file and docs/semantic-layer.md §4 both recorded it as ⚠ partial — sourceable with a query-construction caveat — which asserted a population nobody has. The entry is replaced rather than annotated so that no reader is left with a worked utterance for a pull that cannot be run.",
    whatSurvives:
      "Nothing about the account grain is retained here. The conformed-identity work — Global_Combo_Name6 versus Combo_Company_Name15, and which of the two is the consolidated parent — is still real, still unresolved, and still recorded under recommendations and documentAmbiguities. What it no longer has anywhere on this board is a portlet that depends on it. See directModeBeatWeakened."
  },
  model: "Sls_Forecasting_Metrics_Expanded",
  modelDecision:
    "Settled, and no longer open. The fan reconciles to kpi-acv's certified $82M, so it must be the Forecasting model. The Specialist model was only a live alternative while the subject was account identity — Account_ID106 was the reason to consider it — and at AE grain it buys nothing.",
  measures: { acv: "ACV_clc" },
  headcountIsNotNeededAndThatIsThePoint:
    "§10.1 confirms headcount, and anything divided by headcount, is unavailable — which is why hc-ae is supplemented. That does NOT block this portlet. At AE grain the denominator is one, so 'ACV per AE' is ACV_clc grouped by User_Name10. No headcount measure is queried, computed or implied. The roster is used as a POPULATION, not as a denominator.",
  dimensions: {
    ae: "User_Name10",
    aeRoleFilter: "User_Role2 = 'AE'",
    relativeYear: "Close_Date_Relative_Year_clc",
    segment:
      "Segment10 carries the AE's territory segment where it is populated. The board's enterprise / commercial / growth thresholds on this portlet are authored from the book value in $K and are NOT a governed dimension — same standing note as the panel it replaced, and the same fix: if a segment split is ever needed on the face it must come through the derived dimension seg-matrix uses.",
    region: "<TBD: no AE-level region dimension is established in the source docs — resolve via list_semantic_model_dimensions>"
  },
  rowGrain:
    "one row per metric per opportunity per user in the reporting hierarchy (Forecasting), so a deal appears once for every leader above its owner",
  presentationGrain: "quota-carrying AE x Close_Date_Relative_Year_clc",
  dateAnchor: "Close_Date17 / Opportunity_Close_Date_clc",
  requiredFilters: [
    "User_Role2 = 'AE'",
    "NO Is_My_Data_clc — the documented org-wide pattern at this grain is GROUP BY User_Name10 with no caller filter (§2.3)",
    "filter NULL dimension values",
    "do NOT add Is_Current_Quarter_clc — on a grouped two-year pull it double-counts",
    "add Is_QTD_ACV_1_clc = TRUE if the quarter is open, or the comparison is a partial quarter against a full one (§2.5)"
  ],
  utteranceShape:
    "Return ACV (ACV_clc) grouped by User_Name10 and by Close_Date_Relative_Year_clc for <scope filter>, filtered to User_Role2 = 'AE' and Close_Date_Fiscal_Quarter_Datepart_clc = <resolved> and Close_Date_Relative_Year_clc IN ('CY', 'PY'). Return ALL matching rows — do not limit the result set. Filter out null dimension values.",
  oneGroupedQueryNotTwoPulls:
    "The prior year is NOT a separate point-in-time snapshot; it is the 'PY' rows of the same measure. A single grouped query satisfies the panel's 'one formula' check by construction, which is the argument for doing it that way.",
  doNotLimitPhrasing:
    "Required. 'Return ALL matching rows — do not limit the result set' is a PHRASING requirement on the Tableau Next path, not a parameter. See connections.tableauCloudMcp.noLimitKeyClarification.",
  theRosterHazard: {
    what:
      "The prior-year side of this comparison is not 'what each AE sold last year'. It is last year's bookings grouped by whoever owns the record TODAY. The User Hierarchy table is a current roster on a weekly refresh with no as-of-period-end read (§4, §10.1), joined on Record_Owner_Id1 = User_Id31.",
    scale:
      "The board's own headline asserts an 18% headcount decline — 904 to 745 — which is 159 net and, as the panel authors it, 351 gross: 96 joiners and 255 leavers. Drawn naively the chart measures reorganisations rather than productivity, and it fails invisibly, because a clean 745-line fan of a population that never existed looks exactly like a clean 745-line fan.",
    theSingleCheckThatDecidesIt:
      "Whether Record_Owner_Id1 is owner-at-close or current owner. The source documents do not state it; current-owner is an inference from Salesforce semantics. If it is owner-at-close the hazard shrinks to the roster membership question alone. Resolve before any live pull.",
    whatTheBoardDoesAboutIt:
      "Restricts the drawn population to AEs present at BOTH points — 649 of them — and renders the 96 joiners and 255 leavers as two labelled stubs outside the indexed axis, in the two directions. No AE that exists at one end only is ever a line. The renderer enforces this on the cohort column rather than on priorK > 0, because a leaver's currentK of 0 is arithmetically indistinguishable from a paired AE who booked nothing."
  },
  cardinality:
    "745 is hc-ae's supplemented figure. The live count is COUNT(DISTINCT User_Name10) over the roster, which §5.2 permits with stated limits. Run of_Opportunities_clc for the chosen scope before authoring anything, as the cardinality check.",
  needs: ["aeIdentity", "aeRoleFlag", "priorQuarterAcvPerAe", "currentQuarterAcvPerAe", "asOfPeriodEndRoster"],
  cannotSource: [
    "asOfPeriodEndRoster — no as-of-period-end read of the user table exists in either model, which is what makes the paired population a supplement rather than a query",
    "owner-at-close attribution — a departed AE's prior-year book has already moved to whoever owns the record now, and nothing in the layer separates that from a genuine expansion by the inheriting rep",
    "the board's segment tiers (enterprise / commercial / growth) — 'growth' matches neither model's vocabulary. Unchanged from the portlet this replaced"
  ],
  rowVolume:
    "The mock population is 1,000 rows — 649 paired, 96 joiners, 255 leavers. A live pull at AE grain for one scope and two years should be the same order of magnitude. If the response is truncated, FAIL LOUDLY — a silently truncated fan still draws, and still looks right.",
  resortClientSide: "Required. SPEC is explicit that server-side ordering is not to be relied on.",
  joinerAndLeaverHandling:
    "Two cohorts, two reasons, two stubs. A joiner has no prior-year quota, so its prior ACV per AE is undefined rather than zero — the same refusal the account fan made for its new logos. A leaver has no current ACV, so its index would be 0, and 0 on this axis already means something else and true: 'this AE was here and booked nothing'. Both are returned and summed so the population rolls up to the certified totals; neither is ever drawn on the index.",
  theIndexRangeAndTheClamp:
    "The renderer clamped every index into [0, 200]. On the account population nothing overflowed — the largest expansion was 194 — so the clamp never fired and was never noticed. At AE grain 22 of 649 paired AEs index above 250, the largest at 295, so the range is widened to [0, 250] AND the residue is counted on an explicit caret above the axis top. A clamped line drawn at the top tick as though it landed there is the class of thing this board argues against.",
  directModeBeatWeakened:
    "The T2 'conformed-identity' beat — raw gives you two keys, the layer gives you one — used this slot's certified account fan as its control. With the account-level data absent, the honest claim is no longer 'the layer fixes this' but 'neither path can answer it', which is a different and much weaker beat. The hazard is still real and still documented; what the board no longer has is a panel that demonstrates it. This portlet's hazard is point-in-time instead, and its degradation is that NOTHING moves — the roster limit is absent from the semantic layer and from a CRM export alike, which is why the portlet is supplemented and joins the control group.",
  lineage: [
    "Org62 Opportunity",
    "Tableau Extract (.tdsx)",
    "ACV_HISTORICALS",
    "Sls_Forecasting_Metrics_Expanded",
    "User Hierarchy table (weekly refresh, current state) — the supplement"
  ],
  supplementedBy: {
    scope: "the paired population, and only the population",
    kind: "no-as-of-read",
    because:
      "ACV_clc at AE grain is certified and needs nothing added to it. What is supplemented is the answer to 'which AEs were carrying a quota in FY26 Q2', which no measure and no dimension in either documented model can return. Under §6.1's weakest-link rule the portlet's state is its weakest load-bearing input, and the population is load-bearing here in a way it is nowhere else on the board: the picture IS the population.",
    cost:
      "No as-of rule, so the prior roster restates every week and the paired population restates with it. No owner-at-close attribution. No lineage from the roster to the quarter it was taken in. Cardinality is the one checkable property."
  },
  verify: [
    "Roll-up: the sum of the per-AE 'CY' column must equal the certified quarter total from §8.1. If it does not, the fan is a second competing number and must not render.",
    "One formula: both years must be ACV_clc. True by construction if the pull was a single grouped query.",
    "Paired population: every drawn line must have a non-null 'PY' row AND a non-null 'CY' row for the SAME User_Name10. Assert this rather than inferring it from priorK > 0.",
    "Cardinality: COUNT(DISTINCT User_Name10) against hc-ae's 745, with the difference stated rather than absorbed.",
    "Range: assert that no index is silently clamped. Anything past the top of the range must be counted on the overflow marker."
  ]
};

/* Rebuilt in place so the portlet keeps its position in the file: the object's
 * key order is the tab reading order, and dropping the fan to the end would
 * make the catalog and the board disagree about where the panel sits. */
const rebuilt = {};
for (const [key, value] of Object.entries(catalog.portlets)) {
  if (key === "acv-account-fan") rebuilt["acv-ae-fan"] = entry;
  else rebuilt[key] = value;
}
catalog.portlets = rebuilt;
void old;

/* Every other mention of the id, across every section. A dangling id in a
 * cross-reference is worse than no cross-reference: it reads as a portlet that
 * exists. */
const text = JSON.stringify(catalog, null, 2)
  .replace(/acv-account-fan/g, "acv-ae-fan")
  .replace(
    /acv-ae-fan at 278 rows is the exposed case/g,
    "acv-ae-fan at 1,000 rows is the exposed case"
  );

await writeFile(path, `${text}\n`, "utf8");
console.log("correct-fan-sourcing: rewrote portlets['acv-ae-fan'] and every cross-reference");
