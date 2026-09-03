/* GENERATED FILE — do not edit by hand.
 *
 * Byte-for-byte copy of data/board.json, embedded so the board still renders
 * when that file cannot be fetched. Regenerate with:
 *
 *   node scripts/sync-fallback.mjs
 */

export const FALLBACK_BOARD = {
  "meta": {
    "board": "Analytics Business Review",
    "period": "Q2 FY27",
    "org": "Analytics Business Unit",
    "generatedAt": "2026-07-28T09:00:00-07:00",
    "dataMode": "mock",
    "dataModeLabel": "Illustrative mock snapshot",
    "freshness": "Jul 28, 2026 · 9:00 AM PT · SDM hourly over the ~8 AM PT extract",
    "scope": "Analytics BU · the caller's hierarchy, not a scope either model has",
    "note": "Illustrative figures. Every portlet carries an authored semantic block and a directMode block so the same content can be read as governed or as ungoverned without authoring it twice. The semantic blocks are written against docs/semantic-layer.md, with <TBD: ...> wherever the source documents do not state an identifier.",
    "sdm": "Two unrelated models — Sls_Forecasting_Metrics_Expanded and Sls_Specialist_Reporting, named per portlet",
    "certifiedBy": "Document owners Casey O'Donnell and Sydney Dollar — neither SDM has a certifier property"
  },
  "tabs": [
    {
      "id": "exec",
      "label": "Q2 Exec Summary",
      "kicker": "Quarter to date",
      "headline": "Q2 FY27 lands short of plan on every growth measure",
      "accent": "#1C6E8C",
      "bands": [
        {
          "id": "hero",
          "layout": "hero",
          "portlets": [
            {
              "id": "kpi-nnaov",
              "kind": "attainment",
              "label": "NNAOV",
              "sublabel": "Net new annual order value",
              "accent": "#C0483C",
              "metrics": {
                "value": 6,
                "display": "$6M",
                "unit": "$M",
                "yoy": -75,
                "yoyDisplay": "-75% Y/Y",
                "plan": 15,
                "planDisplay": "15% of plan",
                "goodDirection": "up",
                "planGoodDirection": "up",
                "caption": "Weakest attainment on the board",
                "planProvenance": "supplemented"
              },
              "semantic": {
                "metricName": "NNAOV Commit",
                "definition": "NNAOV_Commit_clc — Net New ACV + Offset Value commit. A forecast, not a booking. No booked net-new actual exists in either model, so this tile renders a commit as a quarter result.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "NNAOV_Commit_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter on Close_Date17, after one dedup filter.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "Commits"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The measure is a commit and the tile reads it as a booking — the class of error this board exists to argue against, found in the board. The nearest governed net-new concept, New_Logo_Eligible4, is a dimension flag rather than a measure, and no NNAOV target exists at all, so 15% of plan has no denominator in this layer."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "NNAOV_Commit_clc is a commit rendered as a booking (§10.4)",
                "candidates": [
                  "$6.0M",
                  "$11.2M",
                  "$4.4M"
                ],
                "missing": "A governed net-new-logo test — Org62 offers a manually-maintained Type picklist, a New_Logo__c checkbox, and a first-close-date derivation that disagree",
                "effect": "Three defensible NNAOV values with no arbiter, so the -75% Y/Y read cannot be defended in the room",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Present a headline decline that is off by up to 87% and call it settled",
                "trustCost": "A confident wrong number costs more trust than a flagged unknown",
                "metrics": {
                  "value": 11.2,
                  "display": "$11M",
                  "yoy": -53,
                  "yoyDisplay": "-53% Y/Y",
                  "plan": 28,
                  "planDisplay": "28% of plan",
                  "caption": "The most permissive of three new-logo tests"
                },
                "hazard": "field-ambiguity",
                "shownFrom": "Three new-logo tests coexist on the raw object and nothing rules between them — a hand-maintained Type picklist, a New_Logo__c checkbox, and a first-close-date derivation. The direct read takes the most permissive: $6M × 1.867 = $11M. Plan recomputes against the same plan base: 28% rather than 15%. Y/Y against the same prior quarter ($24M): -53% rather than -75%.",
                "wouldYouNotice": "No. It is still the worst attainment on the board and still a steep decline, so every check anyone applies to it passes. It is simply 87% less bad than the truth, which on the one measure the business is trying to turn around is the difference between \"act now\" and \"watch it\".",
                "certifiedDelta": "+$5M · +87%",
                "layerProvides": "A governed commit measure with a declared grain, so the net-new figure resolves to one definition rather than three.",
                "layerDoesNotProvide": "The layer holds this only as a commit, not as a booked actual, and there is no target measure for it — the governed plan track is supplemented as well."
              }
            },
            {
              "id": "kpi-acv",
              "kind": "attainment",
              "label": "ACV",
              "sublabel": "Annual contract value booked",
              "accent": "#1C6E8C",
              "metrics": {
                "value": 82,
                "display": "$82M",
                "unit": "$M",
                "yoy": -28,
                "yoyDisplay": "-28% Y/Y",
                "plan": 70,
                "planDisplay": "70% of plan",
                "goodDirection": "up",
                "planGoodDirection": "up",
                "caption": "Splits $24M Embedded / $58M Agentic",
                "planProvenance": "supplemented"
              },
              "semantic": {
                "metricName": "Annual Contract Value",
                "definition": "ACV_clc — actual closed-won deal value, anchored on Close_Date17 and read through the calculated fiscal-quarter and relative-year fields rather than hand-rolled date math.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "ACV_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × APM_L120, after one dedup filter.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ACV_HISTORICALS / TODAY_AND_DEAL_MGMT"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The same ACV_clc the Five Year Trend tab resolves against, which is why the two tabs reconcile rather than merely agree. The row grain is the thing to know: one row per metric per opportunity per user, so a $500K deal is counted again for every leader above its owner and the tile reads 3x to 10x high without the dedup filter. 70% of plan is the part with no source — attainment exists here only for pipegen and Day-1 open pipe."
              },
              "directMode": {
                "provenance": "certified",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "ACV_clc (§5.2); plan tick amber, no ACV target (§3.2)",
                "candidates": [
                  "$82M",
                  "$96M",
                  "$74M"
                ],
                "missing": "A governed ACV formula — Amount, Tableau_Amount__c, Analytics_Amount__c, and AmountConverted__c all coexist on Opportunity with no defined winner",
                "effect": "The $82M headline moves by $22M depending on which Amount column the query author reaches for",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Two teams present two different ACV numbers for the same quarter in the same week",
                "trustCost": "Every downstream number that divides by ACV inherits the ambiguity",
                "metrics": {
                  "value": 74,
                  "display": "$74M",
                  "yoy": -35,
                  "yoyDisplay": "-35% Y/Y",
                  "plan": 63,
                  "planDisplay": "63% of plan",
                  "caption": "One of four amount columns, and nothing ruling between them"
                },
                "hazard": "field-ambiguity",
                "shownFrom": "Four amount columns coexist on the raw opportunity — Amount, Tableau_Amount__c, Analytics_Amount__c, AmountConverted__c — and nothing in the schema rules between them. The direct read picks one and lands light: $82M × 0.902 = $74M. Y/Y recomputes against the same prior quarter ($114M): -35% rather than -28%. Plan recomputes against the same plan base implied by the governed pair: 63% rather than 70%.",
                "wouldYouNotice": "No. A ten per cent miss on a measure already 28% down reads as the same bad quarter, and 63% of plan is exactly as believable as 70%. Small enough to survive scrutiny, large enough to change the decision. The tile beside it reads this same measure 1.085× HIGH, and in governed mode both read $82M — the cross-tab identity is a thing the layer holds, not a coincidence.",
                "certifiedDelta": "-$8M · -10%",
                "layerProvides": "One certified ACV measure, one date anchor, and a mandatory deduplication filter — the definition lives in the layer rather than in the question.",
                "layerDoesNotProvide": "No ACV target or attainment measure exists in either model; attainment exists only for Pipe Gen and Day-1 Open Pipe. The governed plan track is supplemented too."
              }
            },
            {
              "id": "kpi-attrition",
              "kind": "attainment",
              "label": "Attrition",
              "sublabel": "Churned annual contract value",
              "accent": "#92640A",
              "metrics": {
                "value": 75,
                "display": "$75M",
                "unit": "$M",
                "yoy": -12,
                "yoyDisplay": "-12% Y/Y",
                "plan": 104,
                "planDisplay": "104% of plan",
                "goodDirection": "down",
                "planGoodDirection": "down",
                "caption": "Falling year over year, still over plan",
                "planProvenance": "supplemented"
              },
              "semantic": {
                "metricName": "Attrition ACV",
                "definition": "Attrition_clc — actual attrition, anchored on close date. Actuals land monthly, within five business days of month-end and one month in arrears, so the current quarter is always short by up to a month.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "Attrition_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter on Close_Date17, after one dedup filter.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ATTRITION_ACTUALS / ATTRITION_UNOFFICIAL"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — and a month behind on this measure: actuals arrive within five business days of month-end, with ATTRITION_UNOFFICIAL covering the in-flight month",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "Direction of good is this board's, not the layer's — no measure here declares one, so lower-is-better is stated on the tile rather than inherited from the definition. What the layer does carry is the arrears lag, which is the caveat this number cannot be read without. What it does not carry is an attrition target, so 104% of plan has no governed denominator.",
                "polarityNote": "The source slide colours this by hand, cell by cell. The board states the direction once instead — which is the honest version of the claim, because the layer publishes an additivity classification and period-to-date flags and nothing at all about which way is good."
              },
              "directMode": {
                "provenance": "certified",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "Attrition_clc (§5.2); plan tick amber, no target (§3.2)",
                "candidates": [
                  "requires manual reconstruction"
                ],
                "missing": "A point-in-time contract book — Org62 stores current contract state, not the prior-period snapshot attrition is measured against",
                "effect": "Attrition has to be rebuilt by hand from history objects each quarter, and the one-month arrears lag goes unstated — so a month that has not landed yet reads as an improvement",
                "thesisTag": "T2",
                "thesis": "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
                "risk": "Rebuild the number differently each quarter and read a trend that is really a methodology change",
                "trustCost": "A trend line nobody can reproduce is not a trend line",
                "metrics": {
                  "value": 50,
                  "display": "$50M",
                  "yoy": -41,
                  "yoyDisplay": "-41% Y/Y",
                  "plan": 69,
                  "planDisplay": "69% of plan",
                  "caption": "Best churn quarter in three years, on two thirds of one"
                },
                "hazard": "point-in-time",
                "shownFrom": "Attrition actuals land monthly and one month in arrears, with the in-flight month covered by a separate unofficial measure. A direct read finds two of the quarter's three months and reports the quarter as complete: $75M × 2/3 = $50M. Against the same plan base that is 69% rather than 104%; against the same prior year ($85M), -41% rather than -12%. The one-month lag is documented; the flat monthly distribution inside the quarter is a modelled input.",
                "wouldYouNotice": "No, and worse — you would not want to. Lower is better on this measure, so 69% of plan puts the card in the positive band and it washes GREEN. The governed card is over plan on churn and reads as the miss it is. The degraded card reports the best churn quarter in three years, in the same green as a win. Nobody audits good news.",
                "certifiedDelta": "-$25M · 104% → 69% of plan",
                "layerProvides": "A named measure for landed actuals and a separate named measure for the in-flight month, so a query can distinguish a complete period from a partial one.",
                "layerDoesNotProvide": "The layer names the two measures; it does not stop a query summing them, nor presenting a partial quarter as a whole one. It does not declare polarity either — that lower is better here is a property of the board, not of the model."
              }
            },
            {
              "id": "kpi-pipegen",
              "kind": "attainment",
              "label": "Pipegen",
              "sublabel": "Pipeline generated in period",
              "accent": "#6B4FBF",
              "metrics": {
                "value": 789,
                "display": "$789M",
                "unit": "$M",
                "yoy": -8,
                "yoyDisplay": "-8% Y/Y",
                "plan": 79,
                "planDisplay": "79% of plan",
                "goodDirection": "up",
                "planGoodDirection": "up",
                "caption": "Closest to plan of the four",
                "planProvenance": "certified"
              },
              "semantic": {
                "metricName": "Pipeline Generation",
                "definition": "Pipe_Gen_clc — pipeline created, counted on Stage_2_Flag_Date14 and never on close date. A deal created in Q1 that closes in Q3 is Q1 pipegen and Q3 open pipe.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "Pipe_Gen_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter on Stage_2_Flag_Date14 × Opportunity_Source6, after one dedup filter.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "PIPE_GEN / PG_TARGETS"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The date anchor is the whole measure, and unlike a never-recount rule it is checkable: anchored on close date instead, pipegen lands in the wrong quarter and the wrong year with no error anywhere. This is also the only tile on the board with a governed target and attainment pair — Target_Pipe_Gen_by_Product_clc — so 79% of plan is the one percentage here whose denominator exists in the layer."
              },
              "directMode": {
                "provenance": "certified",
                "tier": "red",
                "detectability": "catchable",
                "groundedIn": "Pipe_Gen_clc + pipegen attainment both certified (§3.2, §5.4)",
                "candidates": [
                  "$789M",
                  "$0.9B+ if stage re-entries recount"
                ],
                "missing": "The never-recount-on-re-entry rule — Org62 has CreatedDate and stage history, but no governed statement of which crossing counts",
                "effect": "Workable, but the number silently inflates whenever an opportunity bounces back through qualification",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Report pipeline coverage that is inflated by re-entries and plan against it",
                "trustCost": "Ungoverned but usable — the tier where errors are quiet rather than loud",
                "metrics": {
                  "value": 2367,
                  "display": "$2,367M",
                  "plan": null,
                  "planDisplay": "No target in source",
                  "caption": "Rate holds at -8%; level is 3× the hierarchy"
                },
                "hazard": "fan-out",
                "shownFrom": "The row grain is one row per metric per opportunity per user in the reporting hierarchy, and the Forecasting model documents a 3×–10× overcount for a query with no deduplication filter. At the low end: $789M × 3 = $2,367M. The Y/Y is UNCHANGED at -8%, because a multiplier applied to both years cancels in the rate. The plan track goes void: pipegen targets live in a CTE inside the extract, not in the raw source, so there is no denominator to recompute against.",
                "wouldYouNotice": "Yes, on the level — $2,367M is out of range for this business unit and a magnitude check finds it. No, on the rate. The figure that survives is the growth rate, and the figure that fails is the one nobody re-derives. This is the clearest of the four catchable tiles, and its job is to show that catchability is the exception: it is catchable because the error is 200%, not because the board is watching.",
                "certifiedDelta": "×3 · the depth of the hierarchy",
                "layerProvides": "A mandatory deduplication filter, and the only two governed target measures on this board — pipegen attainment and Day-1 open pipe, by product and by source.",
                "layerDoesNotProvide": null
              }
            }
          ]
        },
        {
          "id": "mix",
          "layout": "mix",
          "portlets": [
            {
              "id": "mix-acv",
              "kind": "mixBar",
              "label": "ACV by product motion",
              "sublabel": "Embedded is growing into a shrinking base",
              "accent": "#12806A",
              "metrics": {
                "total": 82,
                "totalDisplay": "$82M",
                "unit": "$M",
                "segments": [
                  {
                    "id": "embedded",
                    "label": "Embedded Analytics",
                    "detail": "TabNext & CRMA",
                    "value": 24,
                    "display": "$24M",
                    "yoy": 54,
                    "yoyDisplay": "+54% Y/Y",
                    "goodDirection": "up",
                    "color": "#12806A",
                    "priorValue": 15.58,
                    "priorDisplay": "$15.6M"
                  },
                  {
                    "id": "agentic",
                    "label": "Agentic Analytics",
                    "detail": "Tab Cloud & Server",
                    "value": 58,
                    "display": "$58M",
                    "yoy": -41,
                    "yoyDisplay": "-41% Y/Y",
                    "goodDirection": "up",
                    "color": "#2F5FA8",
                    "priorValue": 98.31,
                    "priorDisplay": "$98.3M"
                  }
                ],
                "insight": "<strong>29% of Q2 ACV, up from 14%</strong> — Embedded's ribbon widens into the narrower column. It grew $15.6M to $24M while Agentic fell $98.3M to $58M.",
                "caption": "FY26 Q2 $113.9M → FY27 Q2 $82M · column width is the total",
                "priorTotal": 113.89,
                "priorTotalDisplay": "$113.9M",
                "priorPeriodLabel": "FY26 Q2",
                "periodLabel": "FY27 Q2"
              },
              "semantic": {
                "metricName": "ACV by Product Motion",
                "definition": "ACV_clc grouped by APM_L218 and folded into Embedded and Agentic by a mapping this board defines. No motion dimension exists in either model: Tableau Next and Tableau Server are L2 siblings, not children of two motions.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "ACV_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × APM_L218, excluding APM_L120 = 'Other'.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "APM product hierarchy (L1/L2/L3)"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The split adds to the same certified $82M as the tile above because both resolve to one measure. The grouping is the part that does not exist yet — the layer publishes APM L1/L2, not Embedded versus Agentic — so this mapping is one the board defines and has to version. That is the argument the board is making, arriving as a gap in the board itself."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "ACV_clc certified; no product-motion dimension exists (§5.4, §5.6)",
                "candidates": [
                  "no product-motion grouping exists"
                ],
                "missing": "The SKU-to-motion taxonomy — Org62 stores product codes, not the Embedded / Agentic grouping the business reasons in, and no semantic model publishes one either",
                "effect": "The split cannot be produced at all, so the mix-rotation insight disappears rather than degrades",
                "thesisTag": "T4",
                "thesis": "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
                "risk": "Miss that Embedded nearly doubled its share while the base fell",
                "trustCost": "The insight is not wrong, it is absent — the most expensive failure mode",
                "metrics": {
                  "total": 89,
                  "totalDisplay": "$89M",
                  "priorTotal": 123.6,
                  "priorTotalDisplay": "$123.6M",
                  "segments": {
                    "0": {
                      "value": 28,
                      "display": "$28M",
                      "yoy": 66,
                      "yoyDisplay": "+66% Y/Y",
                      "priorValue": 16.9,
                      "priorDisplay": "$16.9M"
                    },
                    "1": {
                      "value": 61,
                      "display": "$61M",
                      "yoy": -43,
                      "yoyDisplay": "-43% Y/Y",
                      "priorValue": 106.7,
                      "priorDisplay": "$106.7M"
                    }
                  },
                  "insight": "<strong>31% of Q2 ACV, up from 14%</strong> — Embedded's ribbon widens into the narrower column. It grew $16.9M to $28M while Agentic fell $106.7M to $61M.",
                  "caption": "$123.6M → $89M · retaining a line the business excludes"
                },
                "hazard": "exclusion-convention",
                "shownFrom": "Two conventions the layer applies whether or not you ask are absent. First, APM_L120 = 'Other' is excluded by default when the level-1 breakout is visible; retained, it inflates every figure by 8.5% — $82M × 1.085 = $89.0M. Second, there is no SKU-to-motion dimension in raw product codes, so the split is recovered by name-matching, which moves $2M of Agentic codes into Embedded. Embedded: $24M × 1.085 + $2M = $28.0M. Agentic: $58M × 1.085 − $2M = $61.0M. They still sum to $89.0M, so the one check anyone runs passes. Share reads 31% rather than 29%.",
                "wouldYouNotice": "No, and this is the tile the whole design rests on. The ribbon, the column widths, the direction of the story and the shape of the mark are identical to the governed version. Only the numbers moved, and they moved in the flattering direction: Embedded's share of the book reads two points better and the total reads seven million dollars bigger.",
                "certifiedDelta": "+$7.0M total · +2pt share",
                "layerProvides": "One certified ACV measure, and the APM product hierarchy with its default 'Other' exclusion held as a business preference in the model rather than in each author's query.",
                "layerDoesNotProvide": "No product-motion dimension exists. The Embedded-versus-Agentic grouping is not governed in either model — the closest governed grouping is APM_L120 family and APM_L218 sub-product, and Tableau Next and Tableau Server are both L2 values, so even the governed grouping needs OR-matching across two levels."
              }
            },
            {
              "id": "hc-ae",
              "kind": "statTile",
              "label": "Account Executive HC",
              "sublabel": "Selling capacity",
              "accent": "#4E93AE",
              "metrics": {
                "value": 745,
                "display": "745",
                "unit": "#",
                "priorValue": 904,
                "priorDisplay": "904",
                "priorNote": "904 is the FY26 close the Five Year Trend tab plots, so the tile and the trend panel state the same Y/Y rather than two different ones.",
                "yoy": -17.6,
                "yoyDisplay": "-18% Y/Y",
                "goodDirection": "up",
                "caption": "Down 159 heads year over year",
                "footnote": "AMER PACE AE count represents 69% of total Apps team, proportional to the FinPlan breakout."
              },
              "semantic": {
                "metricName": "AE Capacity",
                "definition": "Count of quota-carrying AEs active at period end. No headcount measure exists in either documented model — the owner confirms headcount, and anything divided by headcount, is absent. The 745 is the slide's figure, rendered as authored.",
                "sdm": "None — absent from both documented models",
                "measure": "No headcount measure — roster only",
                "grain": "The nearest read is the User Hierarchy roster: current state, refreshed weekly, role changes lagging up to a week. There is no as-of-period-end grain.",
                "lineage": [
                  "User Hierarchy table (weekly refresh)"
                ],
                "rls": "n/a — no measure to scope",
                "certifiedBy": "Nobody — there is no measure to certify",
                "freshness": "The roster behind it refreshes weekly and only ever describes today · board generated Jul 28, 2026",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "COUNT(DISTINCT User_Name10) where User_Role2 = 'AE' and User_Is_Active1 would return a number, and it would be today's number wearing a period label. That is the whole finding: the roster has no as-of grain, so a headcount for a closed quarter cannot be read from this layer at any price."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "yellow",
                "detectability": "none",
                "groundedIn": "no AE capacity measure in either model (§5.4, §10.1)",
                "candidates": [
                  "745 as of today",
                  "no as-of-quarter-end value"
                ],
                "missing": "Point-in-time headcount — the only roster available is a current-state user table, refreshed weekly, with no as-of-period-end read anywhere",
                "effect": "Every historical quarter silently restates itself as people join and leave — and that holds inside the semantic layer as much as outside it, because no as-of-period-end headcount exists in either place",
                "thesisTag": "T2",
                "thesis": "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
                "risk": "Compare this quarter's capacity against a prior quarter that has quietly changed since it closed",
                "trustCost": "Ungoverned but usable — the tier where errors are quiet rather than loud",
                "metrics": {},
                "hazard": "none",
                "shownFrom": null,
                "supplementedFrom": "The User Hierarchy table, refreshed weekly, reconciled by hand against the FinPlan breakout.",
                "supplementCost": "No additivity guarantee, so a sum across two branches of the hierarchy may double-count a shared AE. No enforced as-of rule, so the count restates when a territory changes. No lineage, so nothing connects the figure to the quarter it was taken in.",
                "wouldYouNotice": "Nothing to notice. The figure is the same in both modes. This panel does not move when the toggle flips, because it never went through the layer and there is no guarantee to withdraw. Four panels on this board behave this way, and they are the control group: what moved is what the layer was protecting.",
                "certifiedDelta": null,
                "layerProvides": null,
                "layerDoesNotProvide": null
              }
            }
          ]
        },
        {
          "id": "narrative",
          "layout": "narrative",
          "portlets": [
            {
              "id": "going-well",
              "kind": "cardRail",
              "label": "Going Well",
              "sublabel": "Q2 FY27",
              "accent": "#12806A",
              "metrics": {
                "tone": "positive",
                "cards": [
                  {
                    "n": 1,
                    "title": "Repositioned Tableau",
                    "body": "as an Agentic Analytics Platform at Tableau Conference, driving strong excitement across the #DataFam community and customer base (NPS up significantly).",
                    "links": [
                      "mix-acv"
                    ]
                  },
                  {
                    "n": 2,
                    "title": "Launched Tableau Customer Pitch",
                    "body": "and market message that is resonating and unlocking enterprise opportunities, as demonstrated on the EMEA roadshow in June.",
                    "links": [
                      "kpi-pipegen"
                    ]
                  },
                  {
                    "n": 3,
                    "title": "Revised product strategy",
                    "body": "in May and drove rapid innovation build cycles around Knowledge Graph, Tableau AI Studio, and Proactive Intelligence.",
                    "links": [
                      "mix-acv"
                    ]
                  },
                  {
                    "n": 4,
                    "title": "Customer Zero",
                    "body": "launched Tableau Next in Slackbot for Sales.",
                    "links": [
                      "mix-acv"
                    ]
                  },
                  {
                    "n": 5,
                    "title": "Leadership Hiring",
                    "body": "Chief Success Officer, Chief Marketing Officer, Global Solutions &amp; AI Readiness Leader, Head of Market Strategy; and alignment for CRO and GTM market for H2.",
                    "links": [
                      "hc-ae"
                    ]
                  }
                ]
              },
              "semantic": {
                "metricName": "Q2 Wins Narrative",
                "definition": "Qualitative wins authored by the BU leadership team, each tagged to the certified measure it is claimed to move.",
                "sdm": "None — authored narrative",
                "measure": null,
                "grain": "Fiscal quarter × board scope",
                "lineage": [
                  "Exec Review Narrative"
                ],
                "rls": "Not scoped — the cards are authored; the measures they link to carry their own scope",
                "certifiedBy": "Analytics BU Chief of Staff, narrative owner",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "Each claim carries a link to the measure it is supposed to move, so a qualitative win can be checked against a governed number instead of standing on its own — and where the measure turns out not to exist, the tag is what makes that visible rather than the claim quietly passing."
              },
              "directMode": {
                "provenance": "narrative",
                "tier": "grey",
                "detectability": "none",
                "groundedIn": "measure: null — correct as authored (§5.4)",
                "candidates": [
                  "claims with no measure attached"
                ],
                "missing": "The tag from each narrative claim to the certified measure it moves",
                "effect": "Five wins that read well and cannot be checked against anything",
                "thesisTag": "T4",
                "thesis": "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
                "risk": "Carry a win forward for three quarters after the number behind it turned",
                "trustCost": "Narrative that outlives its evidence",
                "metrics": {
                  "tone": "muted"
                }
              }
            },
            {
              "id": "h2-focus",
              "kind": "cardRail",
              "label": "H2 Focus",
              "sublabel": "FY27",
              "accent": "#1C6E8C",
              "metrics": {
                "tone": "forward",
                "cards": [
                  {
                    "n": 1,
                    "title": "Immersive AE + SE Enablement",
                    "body": "Deliver an elite, full-scale enablement program focusing on deep technical value, discovery, sales motions, LOB use cases, and customer success stories.",
                    "links": [
                      "hc-ae"
                    ]
                  },
                  {
                    "n": 2,
                    "title": "Laulima &amp; Dreamforce Readiness",
                    "body": "Deliver a refreshed market message, strategy, and integrated campaign including live vibe-coded app demos and sessions showcasing key customer innovations.",
                    "links": [
                      "kpi-pipegen"
                    ]
                  },
                  {
                    "n": 3,
                    "title": "Scaled Proactive Customer Investment Motion",
                    "railTitle": "Proactive Customer Investment",
                    "body": "Operationalize a fully programmatic retention and value-recovery framework across FDEs, Professional Services, AWS, and Partners.",
                    "links": [
                      "kpi-attrition",
                      "kpi-acv",
                      "acv-account-fan"
                    ]
                  },
                  {
                    "n": 4,
                    "title": "Restart the New Logo Motion",
                    "body": "Rebuild partner-sourced and direct acquisition behind one governed first-purchase definition. <strong>Q2 NNAOV closed at $6M, 15% of plan</strong> — the weakest attainment on the board.",
                    "links": [
                      "kpi-nnaov"
                    ]
                  },
                  {
                    "n": 5,
                    "title": "Continued rapid product innovation",
                    "railTitle": "Continued product innovation",
                    "body": "across Generative Data Apps, Tableau Studio, Knowledge Graph, Teams integration, Project Beacon, Command Center, and Private Connect for GCP and Azure.",
                    "links": [
                      "mix-acv"
                    ]
                  }
                ]
              },
              "semantic": {
                "metricName": "H2 Focus Commitments",
                "definition": "Forward commitments for H2 FY27, each tagged to the certified measure it is intended to move.",
                "sdm": "None — authored narrative",
                "measure": null,
                "grain": "Fiscal half × board scope",
                "lineage": [
                  "Exec Review Narrative"
                ],
                "rls": "Not scoped — the cards are authored; the measures they link to carry their own scope",
                "certifiedBy": "Analytics BU Chief of Staff, narrative owner",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "A commitment tagged to a governed measure can be reviewed next quarter against that same measure; an untagged one can only be reviewed against memory. Card 3 is tagged to attrition and ACV because those are the measures the board has — the layer carries a whole renewals vocabulary, Renewal_Key_Risk_Category1 and Open_Available_to_Renew_clc among them, which would grade it better."
              },
              "directMode": {
                "provenance": "narrative",
                "tier": "grey",
                "detectability": "none",
                "groundedIn": "measure: null — correct as authored (§5.4)",
                "candidates": [
                  "commitments with no measure attached"
                ],
                "missing": "The tag from each commitment to the certified measure that will judge it",
                "effect": "H2 commitments become unfalsifiable — there is no agreed number to review them against in January",
                "thesisTag": "T4",
                "thesis": "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
                "risk": "Review H2 against whichever number is most flattering at the time",
                "trustCost": "Commitments that cannot be graded",
                "metrics": {
                  "tone": "muted"
                }
              }
            }
          ]
        },
        {
          "id": "distribution",
          "layout": "distribution",
          "portlets": [
            {
              "id": "acv-account-fan",
              "kind": "movementFan",
              "label": "Account ACV movement",
              "sublabel": "Every renewable account, Q2 FY26 → Q2 FY27",
              "accent": "#1C6E8C",
              "metrics": {
                "unit": "$K",
                "totalDisplay": "$82M",
                "priorTotalDisplay": "$113.89M",
                "yoy": -28,
                "yoyDisplay": "-28% Y/Y",
                "goodDirection": "up",
                "headline": "25% / 75%",
                "headlineNote": "Share of renewable accounts that expanded / contracted",
                "insight": "A quarter of the base expanded and now holds half of it. <strong>66 of 260 renewable accounts grew</strong> — they carried 26% of last year's ACV and carry 50% of this year's — while the other 194 fell 55% and 15 renewed nothing at all. The $82M is not a smaller version of last year's book, it is a more concentrated one.",
                "caption": "260 renewable accounts · 66 expanded · 194 contracted · 15 renewed nothing",
                "form": {
                  "note": "Geometry contract for the renderer. Each fan line is one account, drawn from a common origin on the left to its indexed position on the right, so the shared origin is an index rather than a dollar value and no account's baseline is implied to be any other's.",
                  "originIndex": 100,
                  "referenceLine": 100,
                  "indexRange": [
                    0,
                    200
                  ],
                  "indexOf": "round(currentK / priorK * 100) — 100 is flat, 0 is a full non-renewal, 194 is the largest expansion in the population",
                  "lineWeightBy": "priorK — the concentration story is only visible if the big accounts read heavier than the small ones",
                  "marginalDensity": "Kernel or binned density of the index values along the right axis, computed from rows rather than authored, so it cannot disagree with the lines it sits beside",
                  "secondaryEncoding": "motion (embedded / agentic) is available as a line tint; segment and region are available as filters. None of them is required for the primary read."
                },
                "groups": [
                  {
                    "id": "expanding",
                    "label": "Expanded",
                    "test": "index > 100",
                    "count": 66,
                    "share": 25.4,
                    "shareDisplay": "25%",
                    "priorK": 30000,
                    "currentK": 38247,
                    "detail": "$30.0M → $38.2M, +27% — 26% of the prior base, 50% of the retained base",
                    "color": "#12806A"
                  },
                  {
                    "id": "contracting",
                    "label": "Contracted",
                    "test": "index <= 100",
                    "count": 194,
                    "share": 74.6,
                    "shareDisplay": "75%",
                    "priorK": 83890,
                    "currentK": 37753,
                    "detail": "$83.9M → $37.8M, -55% — 15 of them to zero, taking $7.1M with them",
                    "color": "#C0483C"
                  }
                ],
                "distribution": {
                  "fanLines": 260,
                  "medianIndex": 57,
                  "percentiles": {
                    "p5": 0,
                    "p10": 10,
                    "p25": 24,
                    "p50": 57,
                    "p75": 102,
                    "p90": 130,
                    "p95": 149
                  },
                  "concentrationNote": "The ten largest accounts hold 37.7% of the certified $82M. The median account kept 57% of what it had a year ago."
                },
                "excluded": {
                  "cohort": "newLogo",
                  "count": 18,
                  "totalK": 6000,
                  "totalDisplay": "$6M",
                  "reason": "New-logo accounts have priorK = 0, so an indexed movement from their own baseline is undefined — not zero, undefined. They are authored in rows so the population rolls up to the certified $82M, and they are excluded from the fan geometry because dividing by a zero baseline is exactly the class of operation this board exists to refuse. Their total is the NNAOV tile: $6M.",
                  "renderAs": "A labelled inflow stub at the origin, outside the indexed axis — never a line on it."
                },
                "reconciliation": {
                  "note": "The point of the portlet. The detail rolls up to the certified aggregates already on this board; every line below is exact integer arithmetic on the rows array, in $K.",
                  "checks": [
                    "278 rows = 260 renewable base accounts (priorK > 0, drawn as fan lines) + 18 new logos (priorK = 0, excluded from the fan).",
                    "sum(currentK) = 82,000 = $82M = kpi-acv.metrics.display and mix-acv.metrics.totalDisplay.",
                    "sum(priorK) = 113,890 = $113.89M, which is the prior-year quarter implied by kpi-acv's -28% Y/Y ($82M / 0.72) and by the mix portlet's segment Y/Y figures.",
                    "Y/Y: 82,000 / 113,890 - 1 = -28.001% → -28%, matching kpi-acv.metrics.yoy.",
                    "Renewable base: 113,890 → 76,000 (-33.3%). New logos: 0 → 6,000. 76,000 + 6,000 = 82,000.",
                    "sum(currentK where cohort = newLogo) = 6,000 = $6M = kpi-nnaov.metrics.display. The net-new tile is exactly the slice this fan cannot draw.",
                    "Embedded: 15,580 → 24,000 = +54.04% → +54%, matching mix-acv segment 'embedded'. Of the 24,000, 20,000 is retained-base and 4,000 is new logo.",
                    "Agentic: 98,310 → 58,000 = -41.00% → -41%, matching mix-acv segment 'agentic'. Of the 58,000, 56,000 is retained-base and 2,000 is new logo.",
                    "Motion totals: 15,580 + 98,310 = 113,890 and 24,000 + 58,000 = 82,000. Both grains close on the same certified figures.",
                    "Group split: 30,000 + 83,890 = 113,890 and 38,247 + 37,753 = 76,000, so the expanded / contracted split is a partition of the renewable base rather than a sample of it."
                  ],
                  "doesNotReconcileTo": "kpi-attrition ($75M) and trend-attrition. Attrition is measured against the prior-period contract book across the whole installed base; this population is the Q2 bookings cohort. The 15 accounts that renewed nothing take $7.1M of prior ACV with them and that figure is not a subset of the attrition tile at any stated grain. Do not present the two as the same measure, and do not label the contracting group 'churn'."
                },
                "generator": {
                  "note": "This population is generated, not hand-typed. The rule is stated here so anyone can reproduce the 278 rows exactly and confirm the distribution is a consequence of a stated rule rather than authored noise shaped to look convincing.",
                  "prng": "32-bit LCG. s(k+1) = (1103515245 * s(k) + 12345) mod 2^31, u(k) = s(k) / 2^31. Draws are consumed in emission order within each stream.",
                  "seeds": {
                    "agenticBase": 62027,
                    "embeddedBase": 24058,
                    "region": 90210
                  },
                  "emissionOrder": "Agentic base ranks 1-200, then Embedded base ranks 1-60, then 6 Agentic new logos, then 12 Embedded new logos. Row ids A-001 to A-278 follow that order, so an id is determined by the rule rather than assigned.",
                  "steps": [
                    "1. Prior-year book: weight w(r) = r^-0.8 by rank r within each motion group, apportioned across the group's authored prior total by the largest-remainder method. Largest remainder is used because it sums to the target exactly by construction, so the roll-up is not a rounding coincidence.",
                    "2. One LCG draw u per account. Expansion propensity falls linearly with rank: p(r) = pTop - (pTop - pBottom) * (r - 1) / (n - 1). The largest accounts are the most likely to expand — that is the concentration mechanism the board is describing, so it is in the rule rather than added afterwards.",
                    "3. Movement multiplier m: if u < p then m = 1 + maxUp * (u / p)^1.5 (expansion), else m = 1 - maxDown * ((u - p) / (1 - p))^0.7 (contraction). maxDown = 1.0 in both groups, so an account can lose its whole book and no more. Any m <= 0.05 snaps to 0 — the account renewed nothing.",
                    "4. This year's book: largest-remainder apportionment of the group's authored current total across priorK * m, so currentK sums to the group total exactly.",
                    "5. New logos: priorK = 0, currentK apportioned across w(r) = r^-0.8 by largest remainder against the $6M NNAOV figure.",
                    "6. segment is a stated threshold on the account's basis value (priorK, or currentK for a new logo): >= 1200 enterprise, >= 350 commercial, else growth. region is one weighted LCG draw per account — AMER 0.46, EMEA 0.28, APAC 0.18, LATAM 0.08."
                  ],
                  "params": {
                    "zipfExponent": 0.8,
                    "agenticBase": {
                      "n": 200,
                      "priorTotalK": 98310,
                      "currentTotalK": 56000,
                      "pTop": 0.2,
                      "pBottom": 0.08,
                      "maxUp": 0.4,
                      "maxDown": 1
                    },
                    "embeddedBase": {
                      "n": 60,
                      "priorTotalK": 15580,
                      "currentTotalK": 20000,
                      "pTop": 0.96,
                      "pBottom": 0.54,
                      "maxUp": 0.95,
                      "maxDown": 1
                    },
                    "newLogos": {
                      "agentic": {
                        "n": 6,
                        "currentTotalK": 2000
                      },
                      "embedded": {
                        "n": 12,
                        "currentTotalK": 4000
                      }
                    }
                  },
                  "calibration": "pTop, pBottom and maxUp were chosen so the un-normalised book — sum(priorK * m) — lands within 0.1% of each group's authored current total (Agentic +0.01%, Embedded -0.06%). Step 4 therefore absorbs rounding only, which is what lets each account's authored movement be read as its rule-generated movement rather than a rescaled one.",
                  "noNames": "Accounts carry an id, segment and region and nothing else. No account names are authored: a per-account label would imply a customer list this mock dataset does not have, and the fan encodes movement, not identity."
                },
                "columns": [
                  "id",
                  "motion",
                  "segment",
                  "region",
                  "cohort",
                  "priorK",
                  "currentK"
                ],
                "rowsNote": "Columnar on purpose — one line per account keeps 278 rows reviewable in a diff, and it makes the point that this is a table that rolls up rather than a set of authored highlights. priorK and currentK are integer $K.",
                "rows": [
                  [
                    "A-001",
                    "agentic",
                    "enterprise",
                    "EMEA",
                    "base",
                    9834,
                    5322
                  ],
                  [
                    "A-002",
                    "agentic",
                    "enterprise",
                    "APAC",
                    "base",
                    5648,
                    6713
                  ],
                  [
                    "A-003",
                    "agentic",
                    "enterprise",
                    "AMER",
                    "base",
                    4084,
                    3031
                  ],
                  [
                    "A-004",
                    "agentic",
                    "enterprise",
                    "APAC",
                    "base",
                    3244,
                    1903
                  ],
                  [
                    "A-005",
                    "agentic",
                    "enterprise",
                    "AMER",
                    "base",
                    2714,
                    3078
                  ],
                  [
                    "A-006",
                    "agentic",
                    "enterprise",
                    "EMEA",
                    "base",
                    2345,
                    2038
                  ],
                  [
                    "A-007",
                    "agentic",
                    "enterprise",
                    "LATAM",
                    "base",
                    2073,
                    1768
                  ],
                  [
                    "A-008",
                    "agentic",
                    "enterprise",
                    "APAC",
                    "base",
                    1863,
                    207
                  ],
                  [
                    "A-009",
                    "agentic",
                    "enterprise",
                    "AMER",
                    "base",
                    1696,
                    839
                  ],
                  [
                    "A-010",
                    "agentic",
                    "enterprise",
                    "AMER",
                    "base",
                    1559,
                    0
                  ],
                  [
                    "A-011",
                    "agentic",
                    "enterprise",
                    "APAC",
                    "base",
                    1444,
                    0
                  ],
                  [
                    "A-012",
                    "agentic",
                    "enterprise",
                    "APAC",
                    "base",
                    1347,
                    109
                  ],
                  [
                    "A-013",
                    "agentic",
                    "enterprise",
                    "EMEA",
                    "base",
                    1264,
                    846
                  ],
                  [
                    "A-014",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    1191,
                    1015
                  ],
                  [
                    "A-015",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    1127,
                    1149
                  ],
                  [
                    "A-016",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    1070,
                    0
                  ],
                  [
                    "A-017",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    1019,
                    0
                  ],
                  [
                    "A-018",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    974,
                    388
                  ],
                  [
                    "A-019",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    933,
                    689
                  ],
                  [
                    "A-020",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    895,
                    140
                  ],
                  [
                    "A-021",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    861,
                    547
                  ],
                  [
                    "A-022",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    829,
                    69
                  ],
                  [
                    "A-023",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    800,
                    899
                  ],
                  [
                    "A-024",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    774,
                    176
                  ],
                  [
                    "A-025",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    749,
                    223
                  ],
                  [
                    "A-026",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    726,
                    318
                  ],
                  [
                    "A-027",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    704,
                    661
                  ],
                  [
                    "A-028",
                    "agentic",
                    "commercial",
                    "LATAM",
                    "base",
                    684,
                    758
                  ],
                  [
                    "A-029",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    665,
                    184
                  ],
                  [
                    "A-030",
                    "agentic",
                    "commercial",
                    "LATAM",
                    "base",
                    647,
                    391
                  ],
                  [
                    "A-031",
                    "agentic",
                    "commercial",
                    "APAC",
                    "base",
                    630,
                    359
                  ],
                  [
                    "A-032",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    615,
                    330
                  ],
                  [
                    "A-033",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    600,
                    656
                  ],
                  [
                    "A-034",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    586,
                    712
                  ],
                  [
                    "A-035",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    572,
                    193
                  ],
                  [
                    "A-036",
                    "agentic",
                    "commercial",
                    "APAC",
                    "base",
                    559,
                    575
                  ],
                  [
                    "A-037",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    547,
                    56
                  ],
                  [
                    "A-038",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    536,
                    149
                  ],
                  [
                    "A-039",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    525,
                    84
                  ],
                  [
                    "A-040",
                    "agentic",
                    "commercial",
                    "APAC",
                    "base",
                    514,
                    164
                  ],
                  [
                    "A-041",
                    "agentic",
                    "commercial",
                    "APAC",
                    "base",
                    504,
                    59
                  ],
                  [
                    "A-042",
                    "agentic",
                    "commercial",
                    "APAC",
                    "base",
                    494,
                    221
                  ],
                  [
                    "A-043",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    485,
                    176
                  ],
                  [
                    "A-044",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    476,
                    98
                  ],
                  [
                    "A-045",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    468,
                    295
                  ],
                  [
                    "A-046",
                    "agentic",
                    "commercial",
                    "LATAM",
                    "base",
                    460,
                    280
                  ],
                  [
                    "A-047",
                    "agentic",
                    "commercial",
                    "APAC",
                    "base",
                    452,
                    301
                  ],
                  [
                    "A-048",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    444,
                    321
                  ],
                  [
                    "A-049",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    437,
                    489
                  ],
                  [
                    "A-050",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    430,
                    353
                  ],
                  [
                    "A-051",
                    "agentic",
                    "commercial",
                    "LATAM",
                    "base",
                    423,
                    289
                  ],
                  [
                    "A-052",
                    "agentic",
                    "commercial",
                    "LATAM",
                    "base",
                    417,
                    373
                  ],
                  [
                    "A-053",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    411,
                    126
                  ],
                  [
                    "A-054",
                    "agentic",
                    "commercial",
                    "APAC",
                    "base",
                    404,
                    227
                  ],
                  [
                    "A-055",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    399,
                    279
                  ],
                  [
                    "A-056",
                    "agentic",
                    "commercial",
                    "APAC",
                    "base",
                    393,
                    53
                  ],
                  [
                    "A-057",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    387,
                    234
                  ],
                  [
                    "A-058",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    382,
                    492
                  ],
                  [
                    "A-059",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    377,
                    48
                  ],
                  [
                    "A-060",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    372,
                    427
                  ],
                  [
                    "A-061",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    367,
                    39
                  ],
                  [
                    "A-062",
                    "agentic",
                    "commercial",
                    "APAC",
                    "base",
                    362,
                    103
                  ],
                  [
                    "A-063",
                    "agentic",
                    "commercial",
                    "AMER",
                    "base",
                    357,
                    141
                  ],
                  [
                    "A-064",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "base",
                    353,
                    436
                  ],
                  [
                    "A-065",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    349,
                    23
                  ],
                  [
                    "A-066",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    344,
                    156
                  ],
                  [
                    "A-067",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    340,
                    349
                  ],
                  [
                    "A-068",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    336,
                    40
                  ],
                  [
                    "A-069",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    332,
                    79
                  ],
                  [
                    "A-070",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    329,
                    177
                  ],
                  [
                    "A-071",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    325,
                    432
                  ],
                  [
                    "A-072",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    321,
                    306
                  ],
                  [
                    "A-073",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    318,
                    196
                  ],
                  [
                    "A-074",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    314,
                    326
                  ],
                  [
                    "A-075",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    311,
                    32
                  ],
                  [
                    "A-076",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    308,
                    167
                  ],
                  [
                    "A-077",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    304,
                    41
                  ],
                  [
                    "A-078",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    301,
                    75
                  ],
                  [
                    "A-079",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    298,
                    219
                  ],
                  [
                    "A-080",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    295,
                    0
                  ],
                  [
                    "A-081",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    292,
                    129
                  ],
                  [
                    "A-082",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    290,
                    153
                  ],
                  [
                    "A-083",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    287,
                    189
                  ],
                  [
                    "A-084",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    284,
                    59
                  ],
                  [
                    "A-085",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    281,
                    149
                  ],
                  [
                    "A-086",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    279,
                    133
                  ],
                  [
                    "A-087",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    276,
                    20
                  ],
                  [
                    "A-088",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    274,
                    20
                  ],
                  [
                    "A-089",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    271,
                    352
                  ],
                  [
                    "A-090",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    269,
                    198
                  ],
                  [
                    "A-091",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    266,
                    184
                  ],
                  [
                    "A-092",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    264,
                    158
                  ],
                  [
                    "A-093",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    262,
                    141
                  ],
                  [
                    "A-094",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    260,
                    51
                  ],
                  [
                    "A-095",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    257,
                    146
                  ],
                  [
                    "A-096",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    255,
                    170
                  ],
                  [
                    "A-097",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    253,
                    236
                  ],
                  [
                    "A-098",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    251,
                    161
                  ],
                  [
                    "A-099",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    249,
                    208
                  ],
                  [
                    "A-100",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    247,
                    52
                  ],
                  [
                    "A-101",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    245,
                    31
                  ],
                  [
                    "A-102",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    243,
                    87
                  ],
                  [
                    "A-103",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    241,
                    59
                  ],
                  [
                    "A-104",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    239,
                    63
                  ],
                  [
                    "A-105",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    238,
                    109
                  ],
                  [
                    "A-106",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    236,
                    220
                  ],
                  [
                    "A-107",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    234,
                    45
                  ],
                  [
                    "A-108",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    232,
                    96
                  ],
                  [
                    "A-109",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    231,
                    62
                  ],
                  [
                    "A-110",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    229,
                    31
                  ],
                  [
                    "A-111",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    227,
                    0
                  ],
                  [
                    "A-112",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    226,
                    15
                  ],
                  [
                    "A-113",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    224,
                    25
                  ],
                  [
                    "A-114",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    222,
                    183
                  ],
                  [
                    "A-115",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    221,
                    143
                  ],
                  [
                    "A-116",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    219,
                    58
                  ],
                  [
                    "A-117",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    218,
                    277
                  ],
                  [
                    "A-118",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    216,
                    0
                  ],
                  [
                    "A-119",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    215,
                    111
                  ],
                  [
                    "A-120",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    214,
                    137
                  ],
                  [
                    "A-121",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    212,
                    150
                  ],
                  [
                    "A-122",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    211,
                    268
                  ],
                  [
                    "A-123",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    209,
                    129
                  ],
                  [
                    "A-124",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    208,
                    103
                  ],
                  [
                    "A-125",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    207,
                    0
                  ],
                  [
                    "A-126",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    205,
                    89
                  ],
                  [
                    "A-127",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    204,
                    67
                  ],
                  [
                    "A-128",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    203,
                    64
                  ],
                  [
                    "A-129",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    201,
                    38
                  ],
                  [
                    "A-130",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    200,
                    70
                  ],
                  [
                    "A-131",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    199,
                    92
                  ],
                  [
                    "A-132",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    198,
                    143
                  ],
                  [
                    "A-133",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    197,
                    33
                  ],
                  [
                    "A-134",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    195,
                    40
                  ],
                  [
                    "A-135",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    194,
                    173
                  ],
                  [
                    "A-136",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    193,
                    46
                  ],
                  [
                    "A-137",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    192,
                    74
                  ],
                  [
                    "A-138",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    191,
                    81
                  ],
                  [
                    "A-139",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    190,
                    19
                  ],
                  [
                    "A-140",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    189,
                    93
                  ],
                  [
                    "A-141",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    188,
                    155
                  ],
                  [
                    "A-142",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    187,
                    24
                  ],
                  [
                    "A-143",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    186,
                    41
                  ],
                  [
                    "A-144",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    185,
                    113
                  ],
                  [
                    "A-145",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    184,
                    78
                  ],
                  [
                    "A-146",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    183,
                    78
                  ],
                  [
                    "A-147",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    182,
                    11
                  ],
                  [
                    "A-148",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    181,
                    13
                  ],
                  [
                    "A-149",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    180,
                    102
                  ],
                  [
                    "A-150",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    179,
                    165
                  ],
                  [
                    "A-151",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    178,
                    72
                  ],
                  [
                    "A-152",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    177,
                    45
                  ],
                  [
                    "A-153",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    176,
                    238
                  ],
                  [
                    "A-154",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    175,
                    42
                  ],
                  [
                    "A-155",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    174,
                    101
                  ],
                  [
                    "A-156",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    173,
                    69
                  ],
                  [
                    "A-157",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    172,
                    94
                  ],
                  [
                    "A-158",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    171,
                    128
                  ],
                  [
                    "A-159",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    170,
                    181
                  ],
                  [
                    "A-160",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    170,
                    24
                  ],
                  [
                    "A-161",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    169,
                    59
                  ],
                  [
                    "A-162",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    168,
                    119
                  ],
                  [
                    "A-163",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    167,
                    32
                  ],
                  [
                    "A-164",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    166,
                    47
                  ],
                  [
                    "A-165",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    165,
                    74
                  ],
                  [
                    "A-166",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    165,
                    0
                  ],
                  [
                    "A-167",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    164,
                    140
                  ],
                  [
                    "A-168",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    163,
                    0
                  ],
                  [
                    "A-169",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    162,
                    37
                  ],
                  [
                    "A-170",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    162,
                    38
                  ],
                  [
                    "A-171",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    161,
                    93
                  ],
                  [
                    "A-172",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    160,
                    114
                  ],
                  [
                    "A-173",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    159,
                    0
                  ],
                  [
                    "A-174",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    159,
                    106
                  ],
                  [
                    "A-175",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    158,
                    19
                  ],
                  [
                    "A-176",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    157,
                    50
                  ],
                  [
                    "A-177",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    156,
                    35
                  ],
                  [
                    "A-178",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    156,
                    97
                  ],
                  [
                    "A-179",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    155,
                    95
                  ],
                  [
                    "A-180",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    154,
                    175
                  ],
                  [
                    "A-181",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    154,
                    90
                  ],
                  [
                    "A-182",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    153,
                    19
                  ],
                  [
                    "A-183",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    152,
                    0
                  ],
                  [
                    "A-184",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    152,
                    20
                  ],
                  [
                    "A-185",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    151,
                    40
                  ],
                  [
                    "A-186",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    150,
                    119
                  ],
                  [
                    "A-187",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    150,
                    91
                  ],
                  [
                    "A-188",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    149,
                    55
                  ],
                  [
                    "A-189",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    148,
                    163
                  ],
                  [
                    "A-190",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    148,
                    35
                  ],
                  [
                    "A-191",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    147,
                    59
                  ],
                  [
                    "A-192",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    147,
                    12
                  ],
                  [
                    "A-193",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    146,
                    97
                  ],
                  [
                    "A-194",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    145,
                    100
                  ],
                  [
                    "A-195",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    145,
                    55
                  ],
                  [
                    "A-196",
                    "agentic",
                    "growth",
                    "APAC",
                    "base",
                    144,
                    0
                  ],
                  [
                    "A-197",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    144,
                    120
                  ],
                  [
                    "A-198",
                    "agentic",
                    "growth",
                    "AMER",
                    "base",
                    143,
                    23
                  ],
                  [
                    "A-199",
                    "agentic",
                    "growth",
                    "EMEA",
                    "base",
                    142,
                    58
                  ],
                  [
                    "A-200",
                    "agentic",
                    "growth",
                    "LATAM",
                    "base",
                    142,
                    90
                  ],
                  [
                    "A-201",
                    "embedded",
                    "enterprise",
                    "AMER",
                    "base",
                    2251,
                    3175
                  ],
                  [
                    "A-202",
                    "embedded",
                    "enterprise",
                    "APAC",
                    "base",
                    1293,
                    2504
                  ],
                  [
                    "A-203",
                    "embedded",
                    "commercial",
                    "AMER",
                    "base",
                    935,
                    1407
                  ],
                  [
                    "A-204",
                    "embedded",
                    "commercial",
                    "APAC",
                    "base",
                    743,
                    864
                  ],
                  [
                    "A-205",
                    "embedded",
                    "commercial",
                    "AMER",
                    "base",
                    621,
                    856
                  ],
                  [
                    "A-206",
                    "embedded",
                    "commercial",
                    "APAC",
                    "base",
                    537,
                    683
                  ],
                  [
                    "A-207",
                    "embedded",
                    "commercial",
                    "EMEA",
                    "base",
                    475,
                    593
                  ],
                  [
                    "A-208",
                    "embedded",
                    "commercial",
                    "AMER",
                    "base",
                    427,
                    759
                  ],
                  [
                    "A-209",
                    "embedded",
                    "commercial",
                    "APAC",
                    "base",
                    388,
                    444
                  ],
                  [
                    "A-210",
                    "embedded",
                    "commercial",
                    "AMER",
                    "base",
                    357,
                    689
                  ],
                  [
                    "A-211",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    331,
                    568
                  ],
                  [
                    "A-212",
                    "embedded",
                    "growth",
                    "LATAM",
                    "base",
                    308,
                    310
                  ],
                  [
                    "A-213",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    289,
                    366
                  ],
                  [
                    "A-214",
                    "embedded",
                    "growth",
                    "APAC",
                    "base",
                    273,
                    417
                  ],
                  [
                    "A-215",
                    "embedded",
                    "growth",
                    "APAC",
                    "base",
                    258,
                    270
                  ],
                  [
                    "A-216",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    245,
                    178
                  ],
                  [
                    "A-217",
                    "embedded",
                    "growth",
                    "LATAM",
                    "base",
                    233,
                    0
                  ],
                  [
                    "A-218",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    223,
                    326
                  ],
                  [
                    "A-219",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    214,
                    237
                  ],
                  [
                    "A-220",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    205,
                    237
                  ],
                  [
                    "A-221",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    197,
                    203
                  ],
                  [
                    "A-222",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    190,
                    202
                  ],
                  [
                    "A-223",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    183,
                    220
                  ],
                  [
                    "A-224",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    177,
                    180
                  ],
                  [
                    "A-225",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    171,
                    251
                  ],
                  [
                    "A-226",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    166,
                    108
                  ],
                  [
                    "A-227",
                    "embedded",
                    "growth",
                    "APAC",
                    "base",
                    161,
                    161
                  ],
                  [
                    "A-228",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    157,
                    24
                  ],
                  [
                    "A-229",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    152,
                    293
                  ],
                  [
                    "A-230",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    148,
                    269
                  ],
                  [
                    "A-231",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    144,
                    133
                  ],
                  [
                    "A-232",
                    "embedded",
                    "growth",
                    "APAC",
                    "base",
                    141,
                    148
                  ],
                  [
                    "A-233",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    137,
                    222
                  ],
                  [
                    "A-234",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    134,
                    149
                  ],
                  [
                    "A-235",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    131,
                    58
                  ],
                  [
                    "A-236",
                    "embedded",
                    "growth",
                    "APAC",
                    "base",
                    128,
                    180
                  ],
                  [
                    "A-237",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    125,
                    33
                  ],
                  [
                    "A-238",
                    "embedded",
                    "growth",
                    "APAC",
                    "base",
                    123,
                    173
                  ],
                  [
                    "A-239",
                    "embedded",
                    "growth",
                    "LATAM",
                    "base",
                    120,
                    6
                  ],
                  [
                    "A-240",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    118,
                    171
                  ],
                  [
                    "A-241",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    115,
                    27
                  ],
                  [
                    "A-242",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    113,
                    166
                  ],
                  [
                    "A-243",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    111,
                    40
                  ],
                  [
                    "A-244",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    109,
                    171
                  ],
                  [
                    "A-245",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    107,
                    121
                  ],
                  [
                    "A-246",
                    "embedded",
                    "growth",
                    "APAC",
                    "base",
                    105,
                    135
                  ],
                  [
                    "A-247",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    103,
                    142
                  ],
                  [
                    "A-248",
                    "embedded",
                    "growth",
                    "LATAM",
                    "base",
                    102,
                    106
                  ],
                  [
                    "A-249",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    100,
                    33
                  ],
                  [
                    "A-250",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    99,
                    157
                  ],
                  [
                    "A-251",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    97,
                    163
                  ],
                  [
                    "A-252",
                    "embedded",
                    "growth",
                    "EMEA",
                    "base",
                    95,
                    133
                  ],
                  [
                    "A-253",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    94,
                    0
                  ],
                  [
                    "A-254",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    93,
                    16
                  ],
                  [
                    "A-255",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    91,
                    136
                  ],
                  [
                    "A-256",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    90,
                    114
                  ],
                  [
                    "A-257",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    89,
                    29
                  ],
                  [
                    "A-258",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    87,
                    89
                  ],
                  [
                    "A-259",
                    "embedded",
                    "growth",
                    "AMER",
                    "base",
                    86,
                    103
                  ],
                  [
                    "A-260",
                    "embedded",
                    "growth",
                    "APAC",
                    "base",
                    85,
                    52
                  ],
                  [
                    "A-261",
                    "agentic",
                    "commercial",
                    "LATAM",
                    "newLogo",
                    0,
                    706
                  ],
                  [
                    "A-262",
                    "agentic",
                    "commercial",
                    "EMEA",
                    "newLogo",
                    0,
                    405
                  ],
                  [
                    "A-263",
                    "agentic",
                    "growth",
                    "AMER",
                    "newLogo",
                    0,
                    293
                  ],
                  [
                    "A-264",
                    "agentic",
                    "growth",
                    "AMER",
                    "newLogo",
                    0,
                    233
                  ],
                  [
                    "A-265",
                    "agentic",
                    "growth",
                    "AMER",
                    "newLogo",
                    0,
                    195
                  ],
                  [
                    "A-266",
                    "agentic",
                    "growth",
                    "AMER",
                    "newLogo",
                    0,
                    168
                  ],
                  [
                    "A-267",
                    "embedded",
                    "commercial",
                    "EMEA",
                    "newLogo",
                    0,
                    1039
                  ],
                  [
                    "A-268",
                    "embedded",
                    "commercial",
                    "LATAM",
                    "newLogo",
                    0,
                    597
                  ],
                  [
                    "A-269",
                    "embedded",
                    "commercial",
                    "AMER",
                    "newLogo",
                    0,
                    431
                  ],
                  [
                    "A-270",
                    "embedded",
                    "growth",
                    "EMEA",
                    "newLogo",
                    0,
                    343
                  ],
                  [
                    "A-271",
                    "embedded",
                    "growth",
                    "APAC",
                    "newLogo",
                    0,
                    287
                  ],
                  [
                    "A-272",
                    "embedded",
                    "growth",
                    "AMER",
                    "newLogo",
                    0,
                    248
                  ],
                  [
                    "A-273",
                    "embedded",
                    "growth",
                    "EMEA",
                    "newLogo",
                    0,
                    219
                  ],
                  [
                    "A-274",
                    "embedded",
                    "growth",
                    "AMER",
                    "newLogo",
                    0,
                    197
                  ],
                  [
                    "A-275",
                    "embedded",
                    "growth",
                    "AMER",
                    "newLogo",
                    0,
                    179
                  ],
                  [
                    "A-276",
                    "embedded",
                    "growth",
                    "APAC",
                    "newLogo",
                    0,
                    165
                  ],
                  [
                    "A-277",
                    "embedded",
                    "growth",
                    "AMER",
                    "newLogo",
                    0,
                    153
                  ],
                  [
                    "A-278",
                    "embedded",
                    "growth",
                    "APAC",
                    "newLogo",
                    0,
                    142
                  ]
                ]
              },
              "semantic": {
                "metricName": "Annual Contract Value",
                "definition": "ACV_clc at conformed-account grain for the current and prior year of the same fiscal quarter, from one grouped query on Close_Date_Relative_Year_clc — so both years are the same measure by construction rather than by agreement.",
                "sdm": "Sls_Forecasting_Metrics_Expanded — the fan has to reconcile to the ACV tile, so it cannot be the Specialist model",
                "measure": "ACV_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. The dedup filter is what collapses it to one row per account. Presented: conformed account × Close_Date_Relative_Year_clc.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ACV_HISTORICALS",
                  "Global_Combo_Name6 / Combo_Company_Name15"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — and account-grain rows are the most tightly scoped on the board, so a wrong caller returns a smaller fan that still draws.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The same ACV_clc as the tile and the mix bar above, one grain finer, with both years pulled in one grouped query rather than two — which is what makes the one-formula check true by construction instead of by inspection. Global_Combo_Name6 and Combo_Company_Name15 are the real conformed identity this portlet used to invent a name for. Which of the two is the parent is still an open question, and it decides the portlet: the wrong one reproduces the re-parented-subsidiary failure the fan exists to demonstrate."
              },
              "directMode": {
                "provenance": "certified",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "ACV_clc at account × relative year; ⚠ is a usage rule (§5.4)",
                "candidates": [
                  "278 rows that sum to $82M",
                  "the same export summing to $74M, $96M or $103M"
                ],
                "missing": "Three things at once, and the fan needs all three: one ACV formula applied identically to 278 accounts rather than four candidate Amount columns picked per query; a point-in-time account book for Q2 FY26 rather than today's account state; and a conformed account identity across the year, so a re-parented subsidiary or a merged pair is one line rather than two lines and a phantom churn.",
                "effect": "A CRM export still produces 278 rows, and they still render as a fan. What they no longer do is add up to the number on the tile above them — and because the fan shows shape rather than a total, nothing in the picture reveals the gap. The rows are also silently re-based: an account re-parented in March moves its whole prior year, so a line that should be flat reads as a full non-renewal beside a phantom expansion.",
                "thesisTag": "T2",
                "thesis": "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
                "risk": "Grade the H2 retention motion on a population whose baseline moved after the quarter closed, and target the wrong accounts because the biggest apparent contractions are re-parenting artifacts",
                "trustCost": "Detail that does not roll up to the certified total is worse than no detail — it is a second, more granular-looking number to argue with",
                "metrics": {
                  "totalDisplay": "$89M",
                  "priorTotalDisplay": "$123.57M",
                  "insight": "Accounts whose baseline was re-parented after the quarter closed land at the extremes rather than near the flat line, so the base looks more polarised than it is: more full expansions, more full non-renewals, and a shape that still reads as a concentration story.",
                  "caption": "Renewable accounts keyed on name · re-parented baselines land at the extremes"
                },
                "hazard": "conformed-identity",
                "shownFrom": "Raw carries an account name, not the consolidated combo key the layer resolves to — the Forecasting model has no Account ID at all, only a name, and the other model has the ID. So a re-parented subsidiary arrives as two keys: one full non-renewal beside one phantom expansion. Modelled by moving accounts within 28 index points of the flat line out to the extremes, which is where a split baseline lands. The expanded and contracted counts and the headline share are then re-derived from the lines as drawn, so the caption cannot disagree with the picture. The roll-up carries the same 8.5% 'Other' inflation as the tile above it: $89.0M against $124M.",
                "wouldYouNotice": "No. The fan still draws, the density curve keeps the same shape, and the concentration story reads BETTER than the truth — more expanders, a shallower middle. Nothing in a picture of shape reveals a population that has been redistributed, because the shape is what the picture is about and the shape is fine.",
                "certifiedDelta": "same population, redistributed",
                "layerProvides": "A consolidated account key — Global_Combo_Name6 — and a prior-year read through the relative-year dimension rather than through a separate snapshot, so both sides of the comparison are the same population.",
                "layerDoesNotProvide": "Nothing here overclaims: the caveat in the availability table is a query-construction rule — pick one model, and ask for the full result set rather than a top-N — not a missing definition."
              }
            }
          ]
        }
      ],
      "navLabel": "Exec"
    },
    {
      "id": "analytics-performance",
      "label": "Analytics Performance",
      "kicker": "Q2 FY27 · All segments",
      "headline": "A shrinking platform base and one line growing off almost nothing",
      "accent": "#1C6E8C",
      "bands": [
        {
          "id": "perf-main",
          "layout": "perf-main",
          "portlets": [
            {
              "id": "perf-hierarchy",
              "kind": "growthMatrix",
              "label": "ACV by product",
              "sublabel": "Two-level product taxonomy, Q2 FY27",
              "accent": "#1C6E8C",
              "metrics": {
                "unit": "$M",
                "stakeMax": 83,
                "goodDirection": "up",
                "segments": [
                  {
                    "id": "all",
                    "label": "All Segments",
                    "short": "All",
                    "reference": true
                  }
                ],
                "rollup": {
                  "total": 83,
                  "totalDisplay": "$83M",
                  "note": "Three levels of one certified measure. Each level tiles the level above it, so the boundaries are the roll-up rather than a check on it.",
                  "levels": [
                    [
                      "analytics-total"
                    ],
                    [
                      "platform",
                      "embedded"
                    ],
                    [
                      "cloud",
                      "server",
                      "next",
                      "crma"
                    ]
                  ]
                },
                "rows": [
                  {
                    "id": "analytics-total",
                    "label": "Analytics Total",
                    "level": 0,
                    "parent": null,
                    "value": 83,
                    "display": "$83M",
                    "yoy": -27,
                    "yoyDisplay": "-27%",
                    "goodDirection": "up",
                    "color": "#1C6E8C"
                  },
                  {
                    "id": "platform",
                    "label": "Agentic Analytics Platform",
                    "level": 1,
                    "parent": "analytics-total",
                    "value": 59,
                    "display": "$59M",
                    "yoy": -40,
                    "yoyDisplay": "-40%",
                    "goodDirection": "up",
                    "color": "#2F5FA8"
                  },
                  {
                    "id": "cloud",
                    "label": "Tableau Cloud",
                    "level": 2,
                    "parent": "platform",
                    "value": 38,
                    "display": "$38M",
                    "yoy": -41,
                    "yoyDisplay": "-41%",
                    "goodDirection": "up",
                    "color": "#2F5FA8"
                  },
                  {
                    "id": "server",
                    "label": "Tableau Server",
                    "level": 2,
                    "parent": "platform",
                    "value": 21,
                    "display": "$21M",
                    "yoy": -39,
                    "yoyDisplay": "-39%",
                    "goodDirection": "up",
                    "color": "#6E8FC4"
                  },
                  {
                    "id": "embedded",
                    "label": "Embedded Agentic Analytics",
                    "level": 1,
                    "parent": "analytics-total",
                    "value": 24,
                    "display": "$24M",
                    "yoy": 57,
                    "yoyDisplay": "+57%",
                    "goodDirection": "up",
                    "color": "#12806A"
                  },
                  {
                    "id": "next",
                    "label": "Tableau Next",
                    "level": 2,
                    "parent": "embedded",
                    "value": 13,
                    "display": "$13M",
                    "yoy": 414,
                    "yoyDisplay": "+414%",
                    "goodDirection": "up",
                    "color": "#12806A"
                  },
                  {
                    "id": "crma",
                    "label": "CRMA",
                    "level": 2,
                    "parent": "embedded",
                    "value": 11,
                    "display": "$11M",
                    "yoy": -15,
                    "yoyDisplay": "-15%",
                    "goodDirection": "up",
                    "color": "#5EA394"
                  }
                ],
                "axisNote": "Y/Y — linear inside ±10%, one decade per gridline beyond it",
                "caption": "$83M across two motions and four product lines · exact figures on hover, or expand for the grid"
              },
              "semantic": {
                "metricName": "Annual Contract Value by Product",
                "definition": "ACV_clc read at three grains — total, motion, and APM L2 product line. The layer publishes APM L1/L2/L3; the two motion nodes between them are the board's own mapping.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "ACV_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × APM_L120 × APM_L218, excluding APM_L120 = 'Other'.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ACV_HISTORICALS / TODAY_AND_DEAL_MGMT",
                  "APM product hierarchy (L1/L2/L3)"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The roll-up is the portlet and it is the part the layer guarantees: ACV_clc is additive, so three grains of one measure tile exactly rather than three queries happening to agree. The Y/Y channel is the part that is not additive and is never rolled up — that is the catalogue's own split, published as headed sections rather than inferred. What is not governed here is the level-1 boundary."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "ACV_clc certified; motion hierarchy is not a dimension (§5.4)",
                "candidates": [
                  "one undifferentiated $83M",
                  "two levels that do not tile"
                ],
                "missing": "The two-level product taxonomy — Org62 stores a product code on OpportunityLineItem, not the SKU-to-motion mapping or the motion-to-line parentage the business reasons in",
                "effect": "The partition cannot be drawn at all. Level 1 and level 2 are not wrong without the taxonomy, they are absent, and the tab collapses to the one figure the exec summary already carries",
                "thesisTag": "T4",
                "thesis": "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
                "risk": "Plan H2 against a $24M Embedded line that no two queries reproduce the same way",
                "trustCost": "A hierarchy that is rebuilt per deck is a hierarchy nobody can be held to",
                "metrics": {
                  "stakeMax": 90,
                  "rollup": {
                    "total": 90,
                    "totalDisplay": "$90M",
                    "note": "Three levels of one measure, and a fourth line the business does not recognise. The partition still closes — that is the problem."
                  },
                  "rows": {
                    "0": {
                      "value": 90,
                      "display": "$90M"
                    },
                    "1": {
                      "value": 64,
                      "display": "$64M"
                    },
                    "2": {
                      "value": 41,
                      "display": "$41M"
                    },
                    "3": {
                      "value": 23,
                      "display": "$23M"
                    },
                    "4": {
                      "value": 26,
                      "display": "$26M"
                    },
                    "5": {
                      "value": 14,
                      "display": "$14M"
                    },
                    "6": {
                      "value": 12,
                      "display": "$12M"
                    }
                  },
                  "caption": "The roll-up closes, and one of its lines should not exist"
                },
                "hazard": "exclusion-convention",
                "shownFrom": "The layer excludes APM_L120 = 'Other' by default whenever the level-1 breakout is visible. Retained, every level inflates 8.5%: $83M × 1.085 = $90M at the top, and each child scales with it. Every level still sums exactly to the level above, so an additivity check passes. The Y/Y figures do not move, because both sides of each rate carry the same inflation and it cancels.",
                "wouldYouNotice": "No, because the check you would run is the one that passes. The roll-up closes by construction whether or not 'Other' belongs in the partition, so additivity confirms a hierarchy with an extra $7M in it. Every growth rate on the panel is correct, which is the most convincing part of the lie.",
                "certifiedDelta": "+$7M at every level · rates unchanged",
                "layerProvides": "A published additivity classification — the measure catalogue is physically organised into additive and do-not-sum sections — and the 'Other' exclusion as a business preference held in the model.",
                "layerDoesNotProvide": "The motion hierarchy itself. There is no product-motion dimension in either model; the three levels here are the deck's grouping, not the layer's."
              }
            }
          ]
        },
        {
          "id": "perf-side",
          "layout": "perf-side",
          "portlets": [
            {
              "id": "perf-divergence",
              "kind": "groupMovement",
              "label": "Within-motion movement",
              "sublabel": "What moved each motion's dollars, Q2 FY26 to Q2 FY27",
              "accent": "#12806A",
              "metrics": {
                "unit": "$M",
                "goodDirection": "up",
                "priorPeriodLabel": "Q2 FY26",
                "domain": [
                  -42,
                  12
                ],
                "axisTicks": [
                  -40,
                  -30,
                  -20,
                  -10,
                  0,
                  10
                ],
                "lossKey": "dollars removed",
                "gainKey": "dollars added",
                "orderNote": "largest line nearest the rule",
                "axisNote": "One linear dollar scale, both motions. Prior period derived: ACV ÷ (1 + Y/Y).",
                "caption": "The platform gave up $39.8M. Tableau Next added $10.5M — the largest gain anywhere on this board, off a $2.5M base.",
                "detailNote": "Prior period derived from the authored current-quarter dollars and Y/Y. Each net is the net of the lines shown, not a motion total. Every figure is shown to $0.1M and each net is rounded from the exact sum, so two rounded lines need not add to their rounded net.",
                "rows": [
                  {
                    "id": "platform-move",
                    "label": "Agentic Analytics Platform",
                    "fullLabel": "Agentic Analytics Platform",
                    "net": -39.84,
                    "netDisplay": "−$39.8M",
                    "lossWing": 39.84,
                    "gainWing": 0,
                    "parts": [
                      {
                        "id": "cloud",
                        "label": "Tableau Cloud",
                        "short": "Cloud",
                        "value": 38,
                        "valueDisplay": "$38M",
                        "yoy": -41,
                        "yoyDisplay": "−41%",
                        "priorValue": 64.41,
                        "priorDisplay": "$64.4M",
                        "delta": -26.41,
                        "deltaDisplay": "−$26.4M"
                      },
                      {
                        "id": "server",
                        "label": "Tableau Server",
                        "short": "Server",
                        "value": 21,
                        "valueDisplay": "$21M",
                        "yoy": -39,
                        "yoyDisplay": "−39%",
                        "priorValue": 34.43,
                        "priorDisplay": "$34.4M",
                        "delta": -13.43,
                        "deltaDisplay": "−$13.4M"
                      }
                    ]
                  },
                  {
                    "id": "embedded-move",
                    "label": "Embedded Agentic Analytics",
                    "fullLabel": "Embedded Agentic Analytics",
                    "net": 8.53,
                    "netDisplay": "+$8.5M",
                    "lossWing": 1.94,
                    "gainWing": 10.47,
                    "parts": [
                      {
                        "id": "next",
                        "label": "Tableau Next",
                        "short": "Next",
                        "value": 13,
                        "valueDisplay": "$13M",
                        "yoy": 414,
                        "yoyDisplay": "+414%",
                        "priorValue": 2.53,
                        "priorDisplay": "$2.5M",
                        "delta": 10.47,
                        "deltaDisplay": "+$10.5M"
                      },
                      {
                        "id": "crma",
                        "label": "CRMA",
                        "short": "CRMA",
                        "value": 11,
                        "valueDisplay": "$11M",
                        "yoy": -15,
                        "yoyDisplay": "−15%",
                        "priorValue": 12.94,
                        "priorDisplay": "$12.9M",
                        "delta": -1.94,
                        "deltaDisplay": "−$1.9M"
                      }
                    ]
                  }
                ]
              },
              "semantic": {
                "measure": "ACV_clc",
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "A dollar movement is one measure differenced at two periods, which is why the pieces of a wing can be laid end to end: ACV_clc is certified additive across the APM product hierarchy, and that guarantee is what makes a decomposition legal rather than a coincidence that holds this quarter. The panel that stood here did the opposite — it cited this model's own rule that a Y/Y is non-additive, and then printed the arithmetic difference of two Y/Y figures as its largest numeral, two rates off bases three orders of magnitude apart. This panel subtracts dollars and never rates. It also claims nothing it cannot close: the net is the net of the lines drawn rather than a group total, which is why there is no bridge and no cross-group sum on it.",
                "metricName": "Within-Motion ACV Movement",
                "definition": "The change in ACV_clc between Q2 FY26 and Q2 FY27 for each APM L2 line inside one motion, drawn as two wings off a common zero. Prior-period dollars come from the 'PY' rows of the same grouped pull as the panel above it, not from a separate point-in-time snapshot.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × motion, from the same APM_L218 pull as the panel above it, at two periods of the same measure.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ACV_HISTORICALS",
                  "Close_Date_Relative_Year_clc — 'CY' and 'PY'",
                  "APM product hierarchy (L1/L2/L3)"
                ]
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "catchable",
                "groundedIn": "ACV_clc additive (§3.4, §7.1); motion parentage absent (§5.4)",
                "candidates": [
                  "four movements with nothing to group them"
                ],
                "missing": "The motion-to-line parentage — without it there is no inside-each-motion for a decomposition to be taken within",
                "effect": "Four line movements survive and the two decompositions do not, so the fact that one motion's dollars all left and the other's mostly arrived has nowhere to be seen",
                "thesisTag": "T4",
                "thesis": "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
                "risk": "Treat Embedded as one growing thing and fund both of its lines on the strength of one",
                "trustCost": "A grouping that only exists in the deck cannot be reviewed against next quarter's deck",
                "metrics": {
                  "rows": {
                    "0": {
                      "parts": {
                        "0": {
                          "value": 40.3,
                          "valueDisplay": "$40M",
                          "delta": -28,
                          "deltaDisplay": "−$28.0M",
                          "priorValue": 68.3,
                          "priorDisplay": "$68.3M"
                        },
                        "1": {
                          "value": 22.3,
                          "valueDisplay": "$22M",
                          "delta": -14.2,
                          "deltaDisplay": "−$14.2M",
                          "priorValue": 36.5,
                          "priorDisplay": "$36.5M"
                        }
                      },
                      "lossWing": 42.2,
                      "gainWing": 0
                    },
                    "1": {
                      "parts": {
                        "0": {
                          "value": 13.8,
                          "valueDisplay": "$14M",
                          "delta": 11.1,
                          "deltaDisplay": "+$11.1M",
                          "priorValue": 2.7,
                          "priorDisplay": "$2.7M"
                        },
                        "1": {
                          "value": 11.7,
                          "valueDisplay": "$12M",
                          "delta": -2.1,
                          "deltaDisplay": "−$2.1M",
                          "priorValue": 13.8,
                          "priorDisplay": "$13.8M"
                        }
                      },
                      "lossWing": 2.1,
                      "gainWing": 11.1
                    }
                  },
                  "detailNote": "Prior period derived from the authored current-quarter dollars and Y/Y. Each net is the net of the lines shown, not a motion total. Every figure is shown to $0.1M and each net is rounded from the exact sum, so two rounded lines need not add to their rounded net by more than $0.1M. Every net here misses by considerably more than that, because the lines and the net came from different amount columns.",
                  "caption": "Every wing overshoots its own net by 6%. The decomposition does not close."
                },
                "hazard": "decomposition-closure",
                "shownFrom": "The group total and the line breakdown are two queries against four coexisting amount columns, and nothing in raw schema forces them onto the same one. The line-level read runs 6% high — half the up-to-12% per-deal divergence, because a product line aggregates many deals and it partly averages out — while each net is the governed group aggregate and does not move. So every wing overshoots its own net by 6%: Agentic Analytics Platform draws to −$42.2M against a printed net of −$39.8M, a $2.4M gap. The motion parentage is name-matched from product codes, there being no SKU-to-motion dimension in either model, so the two motions are the deck's grouping rather than the layer's.",
                "wouldYouNotice": "Yes, and this is the one panel that gives itself away without anybody knowing the right answer. The panel states its own tolerance: figures are shown to $0.1M, so two rounded lines need not add to their rounded net by more than that. $2.4M is 24× the tolerance. Add the lines and they do not make the net — and because the gap is a fixed 6%, it is invisible on the largest group and glaring on the smallest: 6% of Agentic Analytics Platform, but the same proportion of a much smaller number on Embedded Agentic Analytics, which is where the growth story lives.",
                "certifiedDelta": "lines +6% · nets unchanged",
                "layerProvides": "A published additivity classification. The catalogue is physically organised into additive and do-not-sum sections, and this measure is in the additive one — which is what licenses a decomposition to be taken at all.",
                "layerDoesNotProvide": "The grouping the decomposition is taken within. That is the deck's, not the layer's."
              }
            },
            {
              "id": "perf-rules",
              "kind": "rulesCard",
              "label": "How these tabs read",
              "sublabel": "Rules applied to every mark on the product, segment and outlook tabs",
              "accent": "#63708C",
              "metrics": {
                "rules": [
                  {
                    "title": "The roll-up closes by additivity",
                    "body": "Cloud and Server tile the Platform bar exactly, and the two motions tile the total exactly. All three levels are one certified measure read at three grains, and the layer classifies that measure as additive — a row-level sum is safe — so the partition closes by construction rather than by being reconciled afterwards. The ratios on this tab are classified the other way and are never summed."
                  },
                  {
                    "title": "Stake and rate are separate channels",
                    "body": "Dollars are one length and growth is another on its own axis. They are never multiplied into an area, because a rate and a stake are not commensurable and an area combining them would invite a reader to add up quantities that do not add."
                  },
                  {
                    "title": "One growth scale, stated",
                    "body": "Growth is linear inside ±10% — the same neutral band the colour threshold uses — and logarithmic beyond it, with a gridline at every decade. The compression is drawn rather than assumed, and it is the same function on all three tabs, so a given rate is the same proportion of its axis wherever it appears."
                  },
                  {
                    "title": "The stake is the dot",
                    "body": "Every growth mark pivots on a dot whose area is the ACV behind it. So +414% on $13M reads as a long bar on a small dot and -40% on $59M as a short bar on a large one. Both are true, and neither is allowed to stand in for the other."
                  }
                ]
              },
              "semantic": {
                "metricName": "Presentation Rules",
                "definition": "The partition, channel, scaling and weighting rules applied to every product, segment and outlook mark on this board. The first is a property of the measure — the layer publishes an additivity classification, so a roll-up either closes or is refused. The other three are this board's own encoding decisions, stated rather than left implicit.",
                "sdm": "Sls_Forecasting_Metrics_Expanded — the model behind every measure these three tabs read",
                "measure": null,
                "grain": "Applies to all measures on the product, segment and outlook tabs. Additivity is readable per measure off aggregationType via list_semantic_model_calculated_measures.",
                "lineage": [
                  "Semantic Model Definition",
                  "businessPreferences"
                ],
                "rls": "Not scoped — rules apply to every viewer identically",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "Additivity is the one rule here the layer actually supplies, and it is the one that carries the most weight: because the measure is classified additive, the three levels of the taxonomy tile each other by construction rather than because somebody checked. The layer classifies coverage, velocity, Y/Y and every other ratio the other way, so the same catalogue that lets the roll-up close is what forbids summing the rates beside it. Scale, channel and weighting are the board's, and are named as the board's."
              },
              "directMode": {
                "provenance": "narrative",
                "tier": "grey",
                "detectability": "none",
                "groundedIn": "presentation rules, no figure (§5.4)",
                "candidates": [
                  "rules live in each analyst's head"
                ],
                "missing": "Any place for an additivity classification, a scale or a weighting to live except the head of whoever built the chart",
                "effect": "Four rules that have to be remembered, re-explained and re-applied by every person and every agent that touches these numbers — starting with which of them may be added up and which may not",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Two analysts draw the same hierarchy on two different scales and both defend it",
                "trustCost": "Consistency becomes a matter of diligence rather than a property of the data"
              }
            }
          ]
        }
      ],
      "navLabel": "Product"
    },
    {
      "id": "performance-by-segment",
      "label": "Performance by Segment",
      "kicker": "Q2 FY27 · Four segments",
      "headline": "One segment growing, and Embedded growing in all four",
      "accent": "#2F5FA8",
      "bands": [
        {
          "id": "seg-main",
          "layout": "seg-main",
          "portlets": [
            {
              "id": "seg-matrix",
              "kind": "growthMatrix",
              "label": "ACV by product and segment",
              "sublabel": "Seven product lines across four segments, Q2 FY27",
              "accent": "#2F5FA8",
              "metrics": {
                "unit": "$M",
                "stakeMax": 83,
                "goodDirection": "up",
                "segments": [
                  {
                    "id": "entr",
                    "label": "Enterprise",
                    "short": "ENTR"
                  },
                  {
                    "id": "cmrcl",
                    "label": "Commercial",
                    "short": "CMRCL"
                  },
                  {
                    "id": "smb",
                    "label": "Small & Medium Business",
                    "short": "SMB"
                  },
                  {
                    "id": "pubsec",
                    "label": "Public Sector",
                    "short": "PubSec"
                  }
                ],
                "rows": [
                  {
                    "id": "analytics-total",
                    "label": "Analytics Total",
                    "level": 0,
                    "parent": null,
                    "color": "#1C6E8C",
                    "goodDirection": "up",
                    "values": [
                      39,
                      18,
                      12,
                      15
                    ],
                    "display": [
                      "$39M",
                      "$18M",
                      "$12M",
                      "$15M"
                    ],
                    "yoy": [
                      -35,
                      -31,
                      -23,
                      14
                    ],
                    "yoyDisplay": [
                      "-35%",
                      "-31%",
                      "-23%",
                      "+14%"
                    ]
                  },
                  {
                    "id": "platform",
                    "label": "Agentic Analytics Platform",
                    "level": 1,
                    "parent": "analytics-total",
                    "color": "#2F5FA8",
                    "goodDirection": "up",
                    "values": [
                      26,
                      13,
                      10,
                      10
                    ],
                    "display": [
                      "$26M",
                      "$13M",
                      "$10M",
                      "$10M"
                    ],
                    "yoy": [
                      -48,
                      -41,
                      -34,
                      -12
                    ],
                    "yoyDisplay": [
                      "-48%",
                      "-41%",
                      "-34%",
                      "-12%"
                    ]
                  },
                  {
                    "id": "cloud",
                    "label": "Tableau Cloud",
                    "level": 2,
                    "parent": "platform",
                    "color": "#2F5FA8",
                    "goodDirection": "up",
                    "values": [
                      16,
                      10,
                      8,
                      4
                    ],
                    "display": [
                      "$16M",
                      "$10M",
                      "$8M",
                      "$4M"
                    ],
                    "yoy": [
                      -48,
                      -42,
                      -30,
                      -16
                    ],
                    "yoyDisplay": [
                      "-48%",
                      "-42%",
                      "-30%",
                      "-16%"
                    ]
                  },
                  {
                    "id": "server",
                    "label": "Tableau Server",
                    "level": 2,
                    "parent": "platform",
                    "color": "#6E8FC4",
                    "goodDirection": "up",
                    "values": [
                      10,
                      4,
                      2,
                      6
                    ],
                    "display": [
                      "$10M",
                      "$4M",
                      "$2M",
                      "$6M"
                    ],
                    "yoy": [
                      -48,
                      -38,
                      -45,
                      -8
                    ],
                    "yoyDisplay": [
                      "-48%",
                      "-38%",
                      "-45%",
                      "-8%"
                    ]
                  },
                  {
                    "id": "embedded",
                    "label": "Embedded Agentic Analytics",
                    "level": 1,
                    "parent": "analytics-total",
                    "color": "#12806A",
                    "goodDirection": "up",
                    "values": [
                      13,
                      4,
                      2,
                      5
                    ],
                    "display": [
                      "$13M",
                      "$4M",
                      "$2M",
                      "$5M"
                    ],
                    "yoy": [
                      33,
                      43,
                      147,
                      78
                    ],
                    "yoyDisplay": [
                      "+33%",
                      "+43%",
                      "+147%",
                      "+78%"
                    ]
                  },
                  {
                    "id": "next",
                    "label": "Tableau Next",
                    "level": 2,
                    "parent": "embedded",
                    "color": "#12806A",
                    "goodDirection": "up",
                    "values": [
                      8,
                      3,
                      1,
                      2
                    ],
                    "display": [
                      "$8M",
                      "$3M",
                      "$1M",
                      "$2M"
                    ],
                    "yoy": [
                      402,
                      236,
                      727,
                      1060
                    ],
                    "yoyDisplay": [
                      "+402%",
                      "+236%",
                      "+727%",
                      "+1060%"
                    ]
                  },
                  {
                    "id": "crma",
                    "label": "CRMA",
                    "level": 2,
                    "parent": "embedded",
                    "color": "#5EA394",
                    "goodDirection": "up",
                    "values": [
                      5,
                      2,
                      1,
                      3
                    ],
                    "display": [
                      "$5M",
                      "$2M",
                      "$1M",
                      "$3M"
                    ],
                    "yoy": [
                      -37,
                      -18,
                      33,
                      69
                    ],
                    "yoyDisplay": [
                      "-37%",
                      "-18%",
                      "+33%",
                      "+69%"
                    ]
                  }
                ],
                "axisNote": "Y/Y — linear inside ±10%, one decade per gridline beyond it. Bracket: that segment's slowest to fastest product line.",
                "caption": "Bar length is Y/Y on a log scale past ±10%; dot area is the ACV behind it · the dollars are on hover, or expand for the full grid",
                "rateLabels": "all",
                "allSegmentsNote": "The All Segments reading of every row is the Analytics Performance tab, in full.",
                "interval": {
                  "leafLevel": 2,
                  "tipLabel": "product lines"
                }
              },
              "semantic": {
                "metricName": "ACV by Product and Derived Segment",
                "definition": "ACV_clc at APM L2 grain crossed with a derived segment dimension. PubSec is an Operating Unit rather than a segment peer, so the four columns are the model owner's own expression: IF OU = Public Sector then OU else segment end. Segment10 also carries ESMB, which these four columns do not show.",
                "sdm": "Sls_Forecasting_Metrics_Expanded — Segment10 is the only segment field carrying SMB, so the derivation can run nowhere else",
                "measure": "ACV_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × APM_L218 × the derived segment, from Segment10 and <TBD: the OU field's apiName>.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ACV_HISTORICALS",
                  "Segment10 + <TBD: OU field>"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — and the derived segment does not widen it. Filter-driven here, so a wrong scope returns a plausible matrix, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "PubSec is an Operating Unit, not a fourth segment, so these columns are a derived dimension rather than four values of a native one — IF OU = Public Sector then OU else segment end, in the model owner's own words. That one line belongs in the model: left in the client, one analyst tests 'Public Sector', another 'Pub Sec', another forgets ESMB, and four breakouts that all look right disagree with no error anywhere. The OU field's apiName is still unconfirmed, and confirming it is the highest-value discovery call on this board."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "derived segment dimension not in the model (§10.2, §9)",
                "candidates": [
                  "Account.Type",
                  "a hand-maintained Segment__c",
                  "the owner's territory role"
                ],
                "missing": "A certified customer-segment dimension with an as-of rule — Org62 offers Account.Type, a manually-maintained Segment__c and the owner's territory role, and PubSec is not a segment at all but an Operating Unit, so the fourth column is a derivation somebody has to write down once",
                "effect": "All thirty-five cells still render. They just stop being one breakout: each column is whichever segment source the query author reached for, and an account that moved up-market in April is counted in two different segments across two readings of the same quarter",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Move coverage into PubSec on a growth reading that is partly accounts being reclassified into it",
                "trustCost": "A breakout whose bins move is a breakout that cannot be reviewed",
                "metrics": {
                  "rows": {
                    "0": {
                      "values": [
                        41,
                        18,
                        12,
                        13
                      ],
                      "display": [
                        "$41M",
                        "$18M",
                        "$12M",
                        "$13M"
                      ],
                      "yoy": [
                        -32,
                        -31,
                        -23,
                        -1
                      ],
                      "yoyDisplay": [
                        "-32%",
                        "-31%",
                        "-23%",
                        "-1%"
                      ]
                    },
                    "1": {
                      "values": [
                        27.3,
                        13,
                        10,
                        8.7
                      ],
                      "display": [
                        "$27M",
                        "$13M",
                        "$10M",
                        "$9M"
                      ],
                      "yoy": [
                        -45,
                        -41,
                        -34,
                        -23
                      ],
                      "yoyDisplay": [
                        "-45%",
                        "-41%",
                        "-34%",
                        "-23%"
                      ]
                    },
                    "2": {
                      "values": [
                        16.5,
                        10,
                        8,
                        3.5
                      ],
                      "display": [
                        "$17M",
                        "$10M",
                        "$8M",
                        "$4M"
                      ],
                      "yoy": [
                        -46,
                        -42,
                        -30,
                        -26
                      ],
                      "yoyDisplay": [
                        "-46%",
                        "-42%",
                        "-30%",
                        "-26%"
                      ]
                    },
                    "3": {
                      "values": [
                        10.8,
                        4,
                        2,
                        5.2
                      ],
                      "display": [
                        "$11M",
                        "$4M",
                        "$2M",
                        "$5M"
                      ],
                      "yoy": [
                        -44,
                        -38,
                        -45,
                        -20
                      ],
                      "yoyDisplay": [
                        "-44%",
                        "-38%",
                        "-45%",
                        "-20%"
                      ]
                    },
                    "4": {
                      "values": [
                        13.7,
                        4,
                        2,
                        4.3
                      ],
                      "display": [
                        "$14M",
                        "$4M",
                        "$2M",
                        "$4M"
                      ],
                      "yoy": [
                        40,
                        43,
                        147,
                        53
                      ],
                      "yoyDisplay": [
                        "+40%",
                        "+43%",
                        "+147%",
                        "+53%"
                      ]
                    },
                    "5": {
                      "values": [
                        8.3,
                        3,
                        1,
                        1.7
                      ],
                      "display": [
                        "$8M",
                        "$3M",
                        "$1M",
                        "$2M"
                      ],
                      "yoy": [
                        421,
                        236,
                        727,
                        886
                      ],
                      "yoyDisplay": [
                        "+421%",
                        "+236%",
                        "+727%",
                        "+886%"
                      ]
                    },
                    "6": {
                      "values": [
                        5.4,
                        2,
                        1,
                        2.6
                      ],
                      "display": [
                        "$5M",
                        "$2M",
                        "$1M",
                        "$3M"
                      ],
                      "yoy": [
                        -32,
                        -18,
                        33,
                        46
                      ],
                      "yoyDisplay": [
                        "-32%",
                        "-18%",
                        "+33%",
                        "+46%"
                      ]
                    }
                  },
                  "axisNote": "Y/Y on a stated scale, over four columns assembled from three sources",
                  "caption": "Every total is unchanged. $2M moved between two columns."
                },
                "hazard": "definition-drift",
                "shownFrom": "Public Sector is not a segment; it is an Operating Unit, and the fourth column is a coalesce the model owner describes as a rule to apply rather than a field to select. Without it, a PubSec account that also carries an Enterprise segment value lands in Enterprise. Modelled at 13% of each row's PubSec dollars: at the top level $2M moves, so PubSec reads $13M rather than $15M and Enterprise $41M rather than $39M. Y/Y recomputes against the same priors: PubSec -1% rather than +14%, Enterprise -32% rather than -35%. Every row total is unchanged, because the dollars moved sideways.",
                "wouldYouNotice": "No, twice over. Every row total is identical, so the one check anyone runs passes. And the effect is to take the only growing column on the board to -1%, which reads as bad news rather than as an error. Bad news gets believed.",
                "certifiedDelta": "$2M between two columns",
                "layerProvides": "Segment10 as a governed dimension, resolved as of the period close.",
                "layerDoesNotProvide": "The four-way split itself. PubSec is an Operating Unit, and the derived dimension that coalesces it with Segment10 is the model owner's own expression for a definition that does not exist in the model yet."
              }
            }
          ]
        },
        {
          "id": "seg-side",
          "layout": "seg-side",
          "portlets": [
            {
              "id": "seg-spread",
              "kind": "groupMovement",
              "label": "Within-segment movement",
              "sublabel": "What moved each segment's dollars, Q2 FY26 to Q2 FY27",
              "accent": "#6B4FBF",
              "metrics": {
                "unit": "$M",
                "goodDirection": "up",
                "priorPeriodLabel": "Q2 FY26",
                "domain": [
                  -28,
                  8
                ],
                "axisTicks": [
                  -25,
                  -15,
                  -5,
                  0,
                  5
                ],
                "lossKey": "dollars removed",
                "gainKey": "dollars added",
                "orderNote": "largest line nearest the rule",
                "axisNote": "Change in ACV_clc, Q2 FY26 to Q2 FY27, on one linear dollar scale shared by all four segments. Prior period derived: ACV ÷ (1 + Y/Y).",
                "caption": "Every segment gave up platform dollars. Tableau Next put $6.4M back into Enterprise — the largest gain on the panel.",
                "detailNote": "Prior period derived from the authored current-quarter dollars and Y/Y. Each net is the net of the four lines shown, not a segment total. Every figure is shown to $0.1M and each net is rounded from the exact sum, so two rounded lines need not add to their rounded net.",
                "rows": [
                  {
                    "id": "entr-move",
                    "label": "ENTR",
                    "fullLabel": "Enterprise",
                    "net": -20.53,
                    "netDisplay": "−$20.5M",
                    "lossWing": 26.94,
                    "gainWing": 6.41,
                    "parts": [
                      {
                        "id": "cloud",
                        "label": "Tableau Cloud",
                        "short": "Cloud",
                        "value": 16,
                        "valueDisplay": "$16M",
                        "yoy": -48,
                        "yoyDisplay": "−48%",
                        "priorValue": 30.77,
                        "priorDisplay": "$30.8M",
                        "delta": -14.77,
                        "deltaDisplay": "−$14.8M"
                      },
                      {
                        "id": "server",
                        "label": "Tableau Server",
                        "short": "Server",
                        "value": 10,
                        "valueDisplay": "$10M",
                        "yoy": -48,
                        "yoyDisplay": "−48%",
                        "priorValue": 19.23,
                        "priorDisplay": "$19.2M",
                        "delta": -9.23,
                        "deltaDisplay": "−$9.2M"
                      },
                      {
                        "id": "next",
                        "label": "Tableau Next",
                        "short": "Next",
                        "value": 8,
                        "valueDisplay": "$8M",
                        "yoy": 402,
                        "yoyDisplay": "+402%",
                        "priorValue": 1.59,
                        "priorDisplay": "$1.6M",
                        "delta": 6.41,
                        "deltaDisplay": "+$6.4M"
                      },
                      {
                        "id": "crma",
                        "label": "CRMA",
                        "short": "CRMA",
                        "value": 5,
                        "valueDisplay": "$5M",
                        "yoy": -37,
                        "yoyDisplay": "−37%",
                        "priorValue": 7.94,
                        "priorDisplay": "$7.9M",
                        "delta": -2.94,
                        "deltaDisplay": "−$2.9M"
                      }
                    ]
                  },
                  {
                    "id": "cmrcl-move",
                    "label": "CMRCL",
                    "fullLabel": "Commercial",
                    "net": -8.02,
                    "netDisplay": "−$8.0M",
                    "lossWing": 10.13,
                    "gainWing": 2.11,
                    "parts": [
                      {
                        "id": "cloud",
                        "label": "Tableau Cloud",
                        "short": "Cloud",
                        "value": 10,
                        "valueDisplay": "$10M",
                        "yoy": -42,
                        "yoyDisplay": "−42%",
                        "priorValue": 17.24,
                        "priorDisplay": "$17.2M",
                        "delta": -7.24,
                        "deltaDisplay": "−$7.2M"
                      },
                      {
                        "id": "server",
                        "label": "Tableau Server",
                        "short": "Server",
                        "value": 4,
                        "valueDisplay": "$4M",
                        "yoy": -38,
                        "yoyDisplay": "−38%",
                        "priorValue": 6.45,
                        "priorDisplay": "$6.5M",
                        "delta": -2.45,
                        "deltaDisplay": "−$2.5M"
                      },
                      {
                        "id": "next",
                        "label": "Tableau Next",
                        "short": "Next",
                        "value": 3,
                        "valueDisplay": "$3M",
                        "yoy": 236,
                        "yoyDisplay": "+236%",
                        "priorValue": 0.89,
                        "priorDisplay": "$0.9M",
                        "delta": 2.11,
                        "deltaDisplay": "+$2.1M"
                      },
                      {
                        "id": "crma",
                        "label": "CRMA",
                        "short": "CRMA",
                        "value": 2,
                        "valueDisplay": "$2M",
                        "yoy": -18,
                        "yoyDisplay": "−18%",
                        "priorValue": 2.44,
                        "priorDisplay": "$2.4M",
                        "delta": -0.44,
                        "deltaDisplay": "−$0.4M"
                      }
                    ]
                  },
                  {
                    "id": "smb-move",
                    "label": "SMB",
                    "fullLabel": "Small & Medium Business",
                    "net": -3.94,
                    "netDisplay": "−$3.9M",
                    "lossWing": 5.07,
                    "gainWing": 1.13,
                    "parts": [
                      {
                        "id": "cloud",
                        "label": "Tableau Cloud",
                        "short": "Cloud",
                        "value": 8,
                        "valueDisplay": "$8M",
                        "yoy": -30,
                        "yoyDisplay": "−30%",
                        "priorValue": 11.43,
                        "priorDisplay": "$11.4M",
                        "delta": -3.43,
                        "deltaDisplay": "−$3.4M"
                      },
                      {
                        "id": "server",
                        "label": "Tableau Server",
                        "short": "Server",
                        "value": 2,
                        "valueDisplay": "$2M",
                        "yoy": -45,
                        "yoyDisplay": "−45%",
                        "priorValue": 3.64,
                        "priorDisplay": "$3.6M",
                        "delta": -1.64,
                        "deltaDisplay": "−$1.6M"
                      },
                      {
                        "id": "next",
                        "label": "Tableau Next",
                        "short": "Next",
                        "value": 1,
                        "valueDisplay": "$1M",
                        "yoy": 727,
                        "yoyDisplay": "+727%",
                        "priorValue": 0.12,
                        "priorDisplay": "$0.1M",
                        "delta": 0.88,
                        "deltaDisplay": "+$0.9M"
                      },
                      {
                        "id": "crma",
                        "label": "CRMA",
                        "short": "CRMA",
                        "value": 1,
                        "valueDisplay": "$1M",
                        "yoy": 33,
                        "yoyDisplay": "+33%",
                        "priorValue": 0.75,
                        "priorDisplay": "$0.8M",
                        "delta": 0.25,
                        "deltaDisplay": "+$0.2M"
                      }
                    ]
                  },
                  {
                    "id": "pubsec-move",
                    "label": "PubSec",
                    "fullLabel": "Public Sector",
                    "net": 1.77,
                    "netDisplay": "+$1.8M",
                    "lossWing": 1.28,
                    "gainWing": 3.05,
                    "parts": [
                      {
                        "id": "cloud",
                        "label": "Tableau Cloud",
                        "short": "Cloud",
                        "value": 4,
                        "valueDisplay": "$4M",
                        "yoy": -16,
                        "yoyDisplay": "−16%",
                        "priorValue": 4.76,
                        "priorDisplay": "$4.8M",
                        "delta": -0.76,
                        "deltaDisplay": "−$0.8M"
                      },
                      {
                        "id": "server",
                        "label": "Tableau Server",
                        "short": "Server",
                        "value": 6,
                        "valueDisplay": "$6M",
                        "yoy": -8,
                        "yoyDisplay": "−8%",
                        "priorValue": 6.52,
                        "priorDisplay": "$6.5M",
                        "delta": -0.52,
                        "deltaDisplay": "−$0.5M"
                      },
                      {
                        "id": "next",
                        "label": "Tableau Next",
                        "short": "Next",
                        "value": 2,
                        "valueDisplay": "$2M",
                        "yoy": 1060,
                        "yoyDisplay": "+1060%",
                        "priorValue": 0.17,
                        "priorDisplay": "$0.2M",
                        "delta": 1.83,
                        "deltaDisplay": "+$1.8M"
                      },
                      {
                        "id": "crma",
                        "label": "CRMA",
                        "short": "CRMA",
                        "value": 3,
                        "valueDisplay": "$3M",
                        "yoy": 69,
                        "yoyDisplay": "+69%",
                        "priorValue": 1.78,
                        "priorDisplay": "$1.8M",
                        "delta": 1.22,
                        "deltaDisplay": "+$1.2M"
                      }
                    ]
                  }
                ]
              },
              "semantic": {
                "measure": "ACV_clc",
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "A dollar movement is one measure differenced at two periods, which is why the pieces of a wing can be laid end to end: ACV_clc is certified additive across the APM product hierarchy inside one segment, and that guarantee is what makes a decomposition legal rather than a coincidence that holds this quarter. The panel that stood here did the opposite — it cited this model's own rule that a Y/Y is non-additive, and then printed the arithmetic difference of two Y/Y figures as its largest numeral, two rates off bases three orders of magnitude apart. This panel subtracts dollars and never rates. It also claims nothing it cannot close: the net is the net of the lines drawn rather than a group total, which is why there is no bridge and no cross-group sum on it.",
                "metricName": "Within-Segment ACV Movement",
                "definition": "The change in ACV_clc between Q2 FY26 and Q2 FY27 for each product line inside one segment, drawn as two wings off a common zero. Prior-period dollars come from the 'PY' rows of the same grouped pull as the matrix beside it, not from a separate point-in-time snapshot.",
                "sdm": "Sls_Forecasting_Metrics_Expanded — the segment derivation decides the model for both portlets",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × APM_L218 × the derived segment, at two periods of the same measure.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ACV_HISTORICALS",
                  "Close_Date_Relative_Year_clc — 'CY' and 'PY'",
                  "Segment10 + <TBD: OU field>"
                ]
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "catchable",
                "groundedIn": "ACV_clc additive (§7.1); derived segment not in model (§10.2)",
                "candidates": [
                  "sixteen movements, three candidate segments"
                ],
                "missing": "The certified segment dimension the decomposition is taken within, and the as-of rule that says which segment a reclassified account moved in",
                "effect": "The wings still draw and each is taken over a different population, so an account that moved up-market in April is a loss in one segment and a gain in another across two readings of the same quarter",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Fund a recovery in the segment that only recovered because accounts were reclassified into it",
                "trustCost": "A decomposition over an unstable population decomposes the population",
                "metrics": {
                  "rows": {
                    "0": {
                      "parts": {
                        "0": {
                          "value": 17,
                          "valueDisplay": "$17M",
                          "delta": -15.7,
                          "deltaDisplay": "−$15.7M",
                          "priorValue": 32.7,
                          "priorDisplay": "$32.7M"
                        },
                        "1": {
                          "value": 10.6,
                          "valueDisplay": "$11M",
                          "delta": -9.8,
                          "deltaDisplay": "−$9.8M",
                          "priorValue": 20.4,
                          "priorDisplay": "$20.4M"
                        },
                        "2": {
                          "value": 8.5,
                          "valueDisplay": "$9M",
                          "delta": 6.8,
                          "deltaDisplay": "+$6.8M",
                          "priorValue": 1.7,
                          "priorDisplay": "$1.7M"
                        },
                        "3": {
                          "value": 5.3,
                          "valueDisplay": "$5M",
                          "delta": -3.1,
                          "deltaDisplay": "−$3.1M",
                          "priorValue": 8.4,
                          "priorDisplay": "$8.4M"
                        }
                      },
                      "lossWing": 28.6,
                      "gainWing": 6.8
                    },
                    "1": {
                      "parts": {
                        "0": {
                          "value": 10.6,
                          "valueDisplay": "$11M",
                          "delta": -7.7,
                          "deltaDisplay": "−$7.7M",
                          "priorValue": 18.3,
                          "priorDisplay": "$18.3M"
                        },
                        "1": {
                          "value": 4.2,
                          "valueDisplay": "$4M",
                          "delta": -2.6,
                          "deltaDisplay": "−$2.6M",
                          "priorValue": 6.8,
                          "priorDisplay": "$6.8M"
                        },
                        "2": {
                          "value": 3.2,
                          "valueDisplay": "$3M",
                          "delta": 2.2,
                          "deltaDisplay": "+$2.2M",
                          "priorValue": 1,
                          "priorDisplay": "$1.0M"
                        },
                        "3": {
                          "value": 2.1,
                          "valueDisplay": "$2M",
                          "delta": -0.5,
                          "deltaDisplay": "−$0.5M",
                          "priorValue": 2.6,
                          "priorDisplay": "$2.6M"
                        }
                      },
                      "lossWing": 10.7,
                      "gainWing": 2.2
                    },
                    "2": {
                      "parts": {
                        "0": {
                          "value": 8.5,
                          "valueDisplay": "$9M",
                          "delta": -3.6,
                          "deltaDisplay": "−$3.6M",
                          "priorValue": 12.1,
                          "priorDisplay": "$12.1M"
                        },
                        "1": {
                          "value": 2.1,
                          "valueDisplay": "$2M",
                          "delta": -1.7,
                          "deltaDisplay": "−$1.7M",
                          "priorValue": 3.8,
                          "priorDisplay": "$3.8M"
                        },
                        "2": {
                          "value": 1.1,
                          "valueDisplay": "$1M",
                          "delta": 0.9,
                          "deltaDisplay": "+$0.9M",
                          "priorValue": 0.2,
                          "priorDisplay": "$0.2M"
                        },
                        "3": {
                          "value": 1.1,
                          "valueDisplay": "$1M",
                          "delta": 0.3,
                          "deltaDisplay": "+$0.3M",
                          "priorValue": 0.8,
                          "priorDisplay": "$0.8M"
                        }
                      },
                      "lossWing": 5.4,
                      "gainWing": 1.2
                    },
                    "3": {
                      "parts": {
                        "0": {
                          "value": 4.2,
                          "valueDisplay": "$4M",
                          "delta": -0.8,
                          "deltaDisplay": "−$0.8M",
                          "priorValue": 5,
                          "priorDisplay": "$5.0M"
                        },
                        "1": {
                          "value": 6.4,
                          "valueDisplay": "$6M",
                          "delta": -0.6,
                          "deltaDisplay": "−$0.6M",
                          "priorValue": 7,
                          "priorDisplay": "$7.0M"
                        },
                        "2": {
                          "value": 2.1,
                          "valueDisplay": "$2M",
                          "delta": 1.9,
                          "deltaDisplay": "+$1.9M",
                          "priorValue": 0.2,
                          "priorDisplay": "$0.2M"
                        },
                        "3": {
                          "value": 3.2,
                          "valueDisplay": "$3M",
                          "delta": 1.3,
                          "deltaDisplay": "+$1.3M",
                          "priorValue": 1.9,
                          "priorDisplay": "$1.9M"
                        }
                      },
                      "lossWing": 1.4,
                      "gainWing": 3.2
                    }
                  },
                  "detailNote": "Prior period derived from the authored current-quarter dollars and Y/Y. Each net is the net of the four lines shown, not a segment total. Every figure is shown to $0.1M and each net is rounded from the exact sum, so two rounded lines need not add to their rounded net by more than $0.1M. Every net here misses by considerably more than that, because the lines and the net came from different amount columns.",
                  "caption": "Every wing overshoots its own net by 6%. The decomposition does not close."
                },
                "hazard": "decomposition-closure",
                "shownFrom": "The group total and the line breakdown are two queries against four coexisting amount columns, and nothing in raw schema forces them onto the same one. The line-level read runs 6% high — half the up-to-12% per-deal divergence, because a product line aggregates many deals and it partly averages out — while each net is the governed group aggregate and does not move. So every wing overshoots its own net by 6%: Enterprise draws to −$21.8M against a printed net of −$20.5M, a $1.2M gap. The four segments are a coalesce the model owner describes as a rule to apply rather than a field to select, so each decomposition is taken over a population nothing versions.",
                "wouldYouNotice": "Yes, and this is the one panel that gives itself away without anybody knowing the right answer. The panel states its own tolerance: figures are shown to $0.1M, so two rounded lines need not add to their rounded net by more than that. $1.2M is 12× the tolerance. Add the lines and they do not make the net — and because the gap is a fixed 6%, it is invisible on the largest group and glaring on the smallest: 6% of Enterprise, but the same proportion of a much smaller number on Public Sector, which is where the growth story lives.",
                "certifiedDelta": "lines +6% · nets unchanged",
                "layerProvides": "A published additivity classification. The catalogue is physically organised into additive and do-not-sum sections, and this measure is in the additive one — which is what licenses a decomposition to be taken at all.",
                "layerDoesNotProvide": "The grouping the decomposition is taken within. That is the deck's, not the layer's."
              }
            },
            {
              "id": "seg-rules",
              "kind": "rulesCard",
              "label": "How this matrix reads",
              "sublabel": "Fifty-six figures, twenty-eight marks",
              "accent": "#63708C",
              "metrics": {
                "rules": [
                  {
                    "title": "One measure, and one derived dimension",
                    "body": "Every cell is the same certified ACV measure, read at product line crossed with segment — which is what makes reading across a row a comparison. But the four columns are not four values of one dimension. Three are segments and Public Sector is an Operating Unit, so the split is a derived dimension the model owner writes as IF OU = Public Sector then OU else segment end. Until that expression lives in the model it is a derivation this board defines, and a definition living in the client has already started to drift."
                  },
                  {
                    "title": "Hierarchy is a rail, not a stack",
                    "body": "The rails in the label gutter state which product lines sit inside which motion. Containment is a structural fact about the taxonomy, so it is drawn structurally rather than inferred by adding cells up."
                  },
                  {
                    "title": "The comparison is the mark",
                    "body": "Every cell carries its own rate as a numeral, so a figure can be read off the screen mid-sentence. The dollars behind it stay on the dot, on the tooltip and in the expand table, because a second numeral per cell would fight the bar doing the comparison."
                  },
                  {
                    "title": "The whole is one tab away",
                    "body": "There is no All Segments column here. That reading is the product tab in full, at two levels of the taxonomy, and both tabs resolve to the same certified ACV measure — which is what makes a fifth column a restatement rather than a finding."
                  }
                ]
              },
              "semantic": {
                "metricName": "Matrix Reading Rules",
                "definition": "The grain, containment, disclosure and scaling rules applied to every cell of the segment matrix — including the one rule that is not the layer's yet: the four columns are a derived dimension coalescing an Operating Unit with a segment, not four values of one field.",
                "sdm": "Sls_Forecasting_Metrics_Expanded — the only model carrying SMB on Segment10, which is what forces the derivation onto this model and no other",
                "measure": null,
                "grain": "Applies to every cell on this tab: quarter × product line × the derived segment dimension.",
                "lineage": [
                  "Semantic Model Definition",
                  "Segment10 + <TBD: OU field apiName>"
                ],
                "rls": "Not scoped — rules apply to every viewer identically",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "A dense matrix is only readable if every cell was made the same way, and every cell here is one certified ACV measure at one grain. The columns are the exception worth stating: PubSec is an Operating Unit rather than a segment peer, so the four-way split is a one-line derivation. Left out of the model, that line gets rewritten slightly differently by every analyst who needs it — one tests 'Public Sector', one tests 'Pub Sec', one forgets ESMB — and four breakouts that all look right disagree with no error anywhere. Put it in the model once and every consumer inherits the same answer, including the agent generating the SQL, which cannot infer a rule that lives in a workbook."
              },
              "directMode": {
                "provenance": "narrative",
                "tier": "grey",
                "detectability": "none",
                "groundedIn": "presentation rules, no figure (§5.4)",
                "candidates": [
                  "twenty-eight cells, no stated grain"
                ],
                "missing": "Any statement of the grain each cell was read at, of which taxonomy the rows belong to, or of how the four columns were derived",
                "effect": "A matrix that can still be read cell by cell and can no longer be read across, because nothing asserts that two cells in a row were made the same way",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Compare two cells that were built from two different definitions and call the difference a finding",
                "trustCost": "Consistency becomes a matter of diligence rather than a property of the data"
              }
            }
          ]
        }
      ],
      "navLabel": "Segment"
    },
    {
      "id": "q3-outlook",
      "label": "Q3 Outlook",
      "kicker": "Q3 FY27 outlook",
      "headline": "Q3 tracks to $105M with attrition running 20% ahead of last year",
      "accent": "#92640A",
      "bands": [
        {
          "id": "outlook-grid",
          "layout": "outlook-hero",
          "portlets": [
            {
              "id": "outlook-matrix",
              "kind": "metricMatrix",
              "label": "Q3 outlook against plan",
              "sublabel": "Commit, derived plan and the gap on one dollar scale, with the other two measures year over year",
              "accent": "#92640A",
              "metrics": {
                "columns": [
                  {
                    "id": "acv",
                    "label": "ACV",
                    "goodDirection": "up"
                  },
                  {
                    "id": "attrition",
                    "label": "Attrition",
                    "goodDirection": "down"
                  },
                  {
                    "id": "nnaov",
                    "label": "NNAOV",
                    "goodDirection": "up"
                  }
                ],
                "rows": [
                  {
                    "id": "analytics",
                    "label": "Analytics",
                    "sublabel": null,
                    "level": 0,
                    "parent": null,
                    "color": "#1C6E8C",
                    "cells": [
                      {
                        "id": "analytics-acv",
                        "value": 105,
                        "display": "$105M",
                        "yoy": -6,
                        "yoyDisplay": "-6% Y/Y",
                        "plan": 87,
                        "planDisplay": "87% of Product FinPlan",
                        "planGoodDirection": "up",
                        "altBasis": {
                          "label": "OU Roll-up",
                          "display": "$100M",
                          "yoy": -10,
                          "yoyDisplay": "-10% Y/Y",
                          "value": 100
                        }
                      },
                      {
                        "id": "analytics-attrition",
                        "value": 79.5,
                        "display": "$79.5M",
                        "yoy": 20,
                        "yoyDisplay": "+20% Y/Y",
                        "altBasis": {
                          "label": "*OU Roll-up",
                          "display": "$88.9M",
                          "yoy": 34,
                          "yoyDisplay": "34% Y/Y",
                          "value": 88.9
                        }
                      },
                      {
                        "id": "analytics-nnaov",
                        "value": 25.5,
                        "display": "$25.5M",
                        "yoy": -43,
                        "yoyDisplay": "-43% Y/Y"
                      }
                    ]
                  },
                  {
                    "id": "platform",
                    "label": "Agentic Analytics Platform",
                    "sublabel": "Cloud + Server",
                    "level": 1,
                    "parent": "analytics",
                    "color": "#2F5FA8",
                    "cells": [
                      {
                        "id": "platform-acv",
                        "value": 75.5,
                        "display": "$75.5M",
                        "yoy": -15,
                        "yoyDisplay": "-15% Y/Y",
                        "plan": 78,
                        "planDisplay": "78% of Product FinPlan",
                        "planGoodDirection": "up"
                      },
                      {
                        "id": "platform-attrition",
                        "value": 73.5,
                        "display": "$73.5M",
                        "yoy": 26,
                        "yoyDisplay": "+26% Y/Y"
                      },
                      {
                        "id": "platform-nnaov",
                        "value": 8.5,
                        "display": "$8.5M",
                        "yoy": -3,
                        "yoyDisplay": "-3% Y/Y"
                      }
                    ]
                  },
                  {
                    "id": "embedded",
                    "label": "Embedded Agentic Analytics",
                    "sublabel": "Tableau Next + CRMA",
                    "level": 1,
                    "parent": "analytics",
                    "color": "#12806A",
                    "cells": [
                      {
                        "id": "embedded-acv",
                        "value": 29.5,
                        "display": "$29.5M",
                        "yoy": 32,
                        "yoyDisplay": "+32% Y/Y",
                        "plan": 128,
                        "planDisplay": "128% of Product FinPlan",
                        "planGoodDirection": "up"
                      },
                      {
                        "id": "embedded-attrition",
                        "value": 6,
                        "display": "$6M",
                        "yoy": -23,
                        "yoyDisplay": "-23% Y/Y"
                      },
                      {
                        "id": "embedded-nnaov",
                        "value": 23.5,
                        "display": "$23.5M",
                        "yoy": 61,
                        "yoyDisplay": "+61% Y/Y"
                      }
                    ]
                  }
                ],
                "axisNote": "Y/Y — the same growth axis as the product and segment tabs",
                "caption": "Plan is derived per row from the authored commit and the authored attainment percentage. The three derived plans are never summed.",
                "landscape": {
                  "column": "acv",
                  "domainMax": 125,
                  "ticks": [
                    {
                      "value": 0,
                      "label": "$0"
                    },
                    {
                      "value": 25,
                      "label": "$25M"
                    },
                    {
                      "value": 50,
                      "label": "$50M"
                    },
                    {
                      "value": 75,
                      "label": "$75M"
                    },
                    {
                      "value": 100,
                      "label": "$100M"
                    },
                    {
                      "value": 125,
                      "label": "$125M"
                    }
                  ],
                  "format": {
                    "prefix": "$",
                    "suffix": "M",
                    "decimals": 1
                  },
                  "plotLabel": "ACV — commit, derived plan and the gap",
                  "readLabel": "ACV attainment",
                  "targetWord": "plan",
                  "gapWord": "gap",
                  "overWord": "over"
                },
                "altBasisLabel": "Second stated basis, Analytics roll-up"
              },
              "semantic": {
                "metricName": "Q3 Outlook by Product and Measure",
                "definition": "Three commit measures for the in-flight quarter at motion grain — Current_Commit_clc, Attrition_Commit_clc and NNAOV_Commit_clc — with the ACV commit read against a plan derived from its authored attainment percentage.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": null,
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × product motion × measure.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "Commits / Historical Commits / PIPE_HISTORICALS",
                  "APM product hierarchy (L1/L2/L3)"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "Three measures, so the portlet claims none of them as its own. The plan bar and the gap beside it are derived here, exactly, from two authored figures — but the denominator underneath them is the tab's one unsourceable quantity: there is no FinPlan object anywhere in the layer, so 87%, 78% and 128% have no governed basis and neither does anything derived from them. See tableau-source-catalog.json gaps.planAttainment and portlets['outlook-matrix'].derivedFromUnsourceablePlan. Velocity and coverage have moved to their own portlet, where they are real, governed and non-additive — which is why they are never rolled up the motion rail."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "ACV/Attrition certified; merged plan column has no target (§3.2)",
                "candidates": [
                  "87% of a plan version nobody named",
                  "78% or 91% or 64%, by vintage"
                ],
                "missing": "FinPlan itself and the mapping into it — plan targets live in the planning system at OU and product-family grain, are re-versioned at every reforecast, and no version of them reaches the semantic layer either, where the only governed targets are pipegen and Day-1 open pipe",
                "effect": "Every attainment loses its denominator, so the plan bar and its target tick drop entirely rather than being drawn against one of three candidate commits — a gap derived from a contested numerator would be three different gaps stated as one. The commit bar survives, because a length is arithmetic.",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Report 128% of plan against the original FinPlan and 96% against the current one in the same week",
                "trustCost": "An attainment with no stated denominator is a ratio with an opinion in it",
                "metrics": {
                  "rows": {
                    "0": {
                      "cells": {
                        "0": {
                          "value": 94.7,
                          "display": "$95M",
                          "yoy": -15,
                          "yoyDisplay": "-15% Y/Y",
                          "plan": null,
                          "planDisplay": "no plan basis",
                          "altBasis": null
                        },
                        "1": {
                          "value": 53,
                          "display": "$53.0M",
                          "yoy": -20,
                          "yoyDisplay": "-20% Y/Y",
                          "altBasis": null
                        },
                        "2": {
                          "value": 47.6,
                          "display": "$47.6M",
                          "yoy": 6,
                          "yoyDisplay": "6% Y/Y"
                        }
                      }
                    },
                    "1": {
                      "cells": {
                        "0": {
                          "value": 68.1,
                          "display": "$68.1M",
                          "yoy": -23,
                          "yoyDisplay": "-23% Y/Y",
                          "plan": null,
                          "planDisplay": "no plan basis"
                        },
                        "1": {
                          "value": 49,
                          "display": "$49.0M",
                          "yoy": -16,
                          "yoyDisplay": "-16% Y/Y"
                        },
                        "2": {
                          "value": 15.9,
                          "display": "$15.9M",
                          "yoy": 81,
                          "yoyDisplay": "81% Y/Y"
                        }
                      }
                    },
                    "2": {
                      "cells": {
                        "0": {
                          "value": 26.6,
                          "display": "$26.6M",
                          "yoy": 19,
                          "yoyDisplay": "+19% Y/Y",
                          "plan": null,
                          "planDisplay": "no plan basis"
                        },
                        "1": {
                          "value": 4,
                          "display": "$4M",
                          "yoy": -49,
                          "yoyDisplay": "-49% Y/Y"
                        },
                        "2": {
                          "value": 43.9,
                          "display": "$43.9M",
                          "yoy": 201,
                          "yoyDisplay": "+201% Y/Y"
                        }
                      }
                    }
                  },
                  "axisNote": "Y/Y on a stated scale — with no plan to read attainment against",
                  "caption": "Every cell agrees with the exec tab. Both are wrong by the same multiplier."
                },
                "hazard": "mixed",
                "shownFrom": "Each column inherits the hazard of its own measure, at the same multipliers the exec cards use: ACV × 0.902 for the four coexisting amount columns, attrition × 2/3 for the month of arrears, NNAOV × 1.867 for the most permissive new-logo test. Analytics ACV reads $94.7M rather than $105M. The plan channel drops entirely rather than rendering against a candidate: FinPlan lives in the planning system at OU and product-family grain, is re-versioned at every reforecast, and reaches neither model — the only governed targets are pipegen and Day-1 open pipe. The alternative-basis figures go with it, there being nothing left to arbitrate between.",
                "wouldYouNotice": "No, and the way you would fail to notice is instructive: this tab now AGREES with the exec tab, cell for cell, because both applied the same wrong multiplier to the same measure. Two surfaces reconciling is the check most people run, and it passes. What it demonstrates is that consistency is not correctness — the layer is what makes cross-tab agreement mean something.",
                "certifiedDelta": "every cell moved · every plan track gone",
                "layerProvides": "Three certified measures with declared grains and date anchors, and the additivity classification that lets the three rows tile each other.",
                "layerDoesNotProvide": "Any plan basis for these three measures, and no FinPlan object of any kind. Attainment exists only for pipegen and Day-1 open pipe."
              }
            }
          ]
        },
        {
          "id": "outlook-support",
          "layout": "outlook-support",
          "portlets": [
            {
              "id": "outlook-benchmark",
              "kind": "benchmarkAxis",
              "label": "Pipeline sufficiency by motion",
              "sublabel": "Coverage and velocity against their historical benchmarks",
              "accent": "#1C6E8C",
              "metrics": {
                "axes": [
                  {
                    "id": "coverage",
                    "label": "Coverage",
                    "sublabel": "open pipe ÷ commit, a multiplier",
                    "domainMax": 4,
                    "ticks": [
                      {
                        "value": 0,
                        "label": "0×"
                      },
                      {
                        "value": 1,
                        "label": "1×"
                      },
                      {
                        "value": 2,
                        "label": "2×"
                      },
                      {
                        "value": 3,
                        "label": "3×"
                      },
                      {
                        "value": 4,
                        "label": "4×"
                      }
                    ]
                  },
                  {
                    "id": "velocity",
                    "label": "Velocity",
                    "sublabel": "pace of deals through the pipeline",
                    "domainMax": 20,
                    "ticks": [
                      {
                        "value": 0,
                        "label": "0%"
                      },
                      {
                        "value": 5,
                        "label": "5%"
                      },
                      {
                        "value": 10,
                        "label": "10%"
                      },
                      {
                        "value": 15,
                        "label": "15%"
                      },
                      {
                        "value": 20,
                        "label": "20%"
                      }
                    ]
                  }
                ],
                "rows": [
                  {
                    "id": "analytics",
                    "label": "Analytics",
                    "sublabel": null,
                    "color": "#1C6E8C",
                    "readings": {}
                  },
                  {
                    "id": "platform",
                    "label": "Agentic Analytics Platform",
                    "sublabel": "Cloud + Server",
                    "color": "#2F5FA8",
                    "readings": {
                      "velocity": {
                        "value": 15,
                        "valueDisplay": "15%",
                        "hist": 17,
                        "histDisplay": "17% hist",
                        "goodDirection": "up",
                        "deltaDisplay": "−2% vs hist",
                        "flatDisplay": "flat vs hist"
                      },
                      "coverage": {
                        "value": 2.6,
                        "valueDisplay": "2.6×",
                        "hist": 2.7,
                        "histDisplay": "2.7× hist",
                        "goodDirection": "up",
                        "deltaDisplay": "−0.1× vs hist",
                        "flatDisplay": "flat vs hist"
                      }
                    }
                  },
                  {
                    "id": "embedded",
                    "label": "Embedded Agentic Analytics",
                    "sublabel": "Tableau Next + CRMA",
                    "color": "#12806A",
                    "readings": {
                      "velocity": {
                        "value": 16,
                        "valueDisplay": "16%",
                        "hist": 16,
                        "histDisplay": "16% hist",
                        "goodDirection": "up",
                        "deltaDisplay": "−0% vs hist",
                        "flatDisplay": "flat vs hist"
                      },
                      "coverage": {
                        "value": 3.2,
                        "valueDisplay": "3.2×",
                        "hist": 2.8,
                        "histDisplay": "2.8× hist",
                        "goodDirection": "up",
                        "deltaDisplay": "+0.4× vs hist",
                        "flatDisplay": "flat vs hist"
                      }
                    }
                  }
                ],
                "voidNote": "Coverage and velocity are non-additive, so the Analytics roll-up carries neither.",
                "caption": "Hollow marks the historical benchmark — the same fiscal quarter averaged across the prior two years.",
                "directCaption": "The readings survive; the benchmark does not, so neither does the comparison."
              },
              "semantic": {
                "metricName": "Coverage and Velocity against Historical",
                "definition": "Coverage_clc against Historical_Coverage_clc, and Velocity_clc against Historical_Velocity_clc, at motion grain for the in-flight quarter. Coverage is a multiplier, not a percent. Both measures and both benchmarks are non-additive.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "Coverage_clc · Historical_Coverage_clc · Velocity_clc · Historical_Velocity_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × product motion.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "Historical Commits / PIPE_HISTORICALS",
                  "APM product hierarchy (L1/L2/L3)"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "This is the one band on the tab that is governed end to end. Both readings and both benchmarks are real measures with real names, which is more than the plan attainment above it can say. The benchmark is the average of the same fiscal quarter across the prior two fiscal years, not the same day of the prior quarter, and the relative-year window has to reach PY-1 or every historical figure returns null. The Analytics roll-up has no mark on either axis because both measures are non-additive, so there is nothing to place — the rule rendered rather than stated."
              },
              "directMode": {
                "provenance": "certified",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "Coverage_clc + Historical_* certified, window governed (§5.4, §8)",
                "candidates": [
                  "a benchmark over an unstated window"
                ],
                "missing": "A stated window for the comparison. The governed measure averages the same fiscal quarter across the prior two fiscal years; a direct read against Org62 can produce a prior-period figure but nothing in it says which period, or whether the window was two years or one",
                "effect": "The readings survive — open pipe over commit is arithmetic — and the benchmark loses its position, so the dumbbell keeps its ring and loses its comparison. What goes is the only part anybody was reading it for",
                "thesisTag": "T2",
                "thesis": "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
                "risk": "Call coverage sufficient against a benchmark taken over a window nobody agreed to",
                "trustCost": "A comparison with no stated window is a number beside another number",
                "metrics": {
                  "rows": {
                    "0": {
                      "readings": {}
                    },
                    "1": {
                      "readings": {
                        "velocity": {
                          "hist": 14,
                          "histDisplay": "14% prior qtr",
                          "deltaDisplay": "+1% vs prior qtr"
                        },
                        "coverage": {
                          "hist": 2.3,
                          "histDisplay": "2.3× prior qtr",
                          "deltaDisplay": "+0.3× vs prior qtr"
                        }
                      }
                    },
                    "2": {
                      "readings": {
                        "velocity": {
                          "hist": 14,
                          "histDisplay": "14% prior qtr",
                          "deltaDisplay": "+2% vs prior qtr"
                        },
                        "coverage": {
                          "hist": 2.4,
                          "histDisplay": "2.4× prior qtr",
                          "deltaDisplay": "+0.8× vs prior qtr"
                        }
                      }
                    }
                  },
                  "caption": "Hollow marks the prior quarter — no measure says which window a benchmark is over."
                },
                "hazard": "unstated-window",
                "shownFrom": "The readings do not move: coverage is open pipe over commit and velocity is a pace, and a multiplier applied to the raw amounts cancels in a ratio, exactly as it does in pipegen's Y/Y. What moves is the benchmark. The governed Historical_* measures are the average of the same fiscal quarter across the prior two fiscal years, and the documents are emphatic that this is \"not last quarter, not just last year\". A direct read has no such measure and reconstructs the nearest thing to hand, the immediately prior quarter, modelled as a 15% seasonal step: platform coverage's benchmark reads 2.3× rather than 2.7×. The mark keeps its ring and the ring moves.",
                "wouldYouNotice": "No, and the consequence is a sign flip on the only question the panel is asked. Platform coverage against the governed benchmark is −4% — flat, sufficient-but-not-improving. Against a prior-quarter benchmark it reads clearly above, so a pipeline that is merely holding station reads as one that is building. Both numbers are 2.6 against something beginning with 2.",
                "certifiedDelta": "readings unchanged · every benchmark moved",
                "layerProvides": "Coverage_clc and Historical_Coverage_clc, Specialist_V_clc and Historical_Velocity_clc — the reading and its comparison as a matched pair, with the window declared as part of the measure rather than chosen per query.",
                "layerDoesNotProvide": "Nothing withheld here. This is the most fully governed portlet on the board, which is why it is the clearest demonstration: what raw source loses is not the number but the thing the number is compared against."
              }
            },
            {
              "id": "outlook-deals",
              "kind": "dealRail",
              "label": "Q3 top ACV deals",
              "sublabel": "Five largest open opportunities",
              "accent": "#1C6E8C",
              "metrics": {
                "unit": "$M",
                "scaleMax": 3.2,
                "totalDisplay": "$12.5M across five deals",
                "deals": [
                  {
                    "id": "bofa",
                    "account": "Bank of America",
                    "value": 3,
                    "display": "$3M"
                  },
                  {
                    "id": "aetna",
                    "account": "Aetna",
                    "value": 3,
                    "display": "$3M"
                  },
                  {
                    "id": "schwab",
                    "account": "Charles Schwab",
                    "value": 2.3,
                    "display": "$2.3M"
                  },
                  {
                    "id": "usbank",
                    "account": "US Bank",
                    "value": 2.1,
                    "display": "$2.1M"
                  },
                  {
                    "id": "usgov",
                    "account": "US GOV",
                    "value": 2.1,
                    "display": "$2.1M"
                  }
                ],
                "caption": "Ranked on one certified ACV definition",
                "gap": {
                  "basis": {
                    "value": 105,
                    "plan": 87,
                    "of": "Analytics ACV commit and its authored Product FinPlan attainment"
                  },
                  "label": "gap to plan",
                  "residualWord": "",
                  "format": {
                    "prefix": "$",
                    "suffix": "M",
                    "decimals": 1
                  },
                  "totalDisplay": "$12.5M",
                  "voidClaim": "no derivable gap — the scale is the authored total"
                },
                "gapCaption": "Open pipe laid along a gap derived from commit — a comparison of size, not a sum."
              },
              "semantic": {
                "metricName": "Top Open Deals by Open Pipe",
                "definition": "The five largest open opportunities by Open_Pipe_clc. ACV_clc is closed-won value and reads $0 on an open deal, so ranking this rail on ACV would return the wrong rail with no error.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "Open_Pipe_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. The dedup filter collapses it to one row per opportunity. Presented: fiscal quarter × opportunity.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "TODAY_AND_DEAL_MGMT"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — and opportunity-grain rows are the most tightly scoped on the board, so a wrong caller returns five plausible deals belonging to someone else.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The ranking is the content, so it turns on the right measure and on re-sorting the rows rather than trusting the order they arrive in. Open Pipe carries its own hazard too: it is $0 the moment a deal is deaded, so a deal that dies between two readings drops off this rail instead of showing as a loss, and Yesterdays_Open_Pipe_clc is what shows what left."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "ACV_clc + stated ranking rule; gap needs absent FinPlan (§5.4)",
                "candidates": [
                  "five accounts, five amounts, no stated order"
                ],
                "missing": "One amount definition applied across the five — Amount, Tableau_Amount__c, Analytics_Amount__c and AmountConverted__c all coexist on Opportunity, and the gap between third and fifth place is smaller than the gap between those columns",
                "effect": "The list survives and the order does not. Two of the five change places depending on which column the query author reached for. The gap they were laid along goes too — it is derived from an attainment with no denominator — so the bar falls back to the authored total as its scale: the same five amounts end to end, against nothing.",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Brief an exec on a top five that reorders between two people's versions of the same slide",
                "trustCost": "Ungoverned but usable — the tier where errors are quiet rather than loud",
                "metrics": {
                  "deals": [
                    {
                      "id": "bofa",
                      "account": "Bank of America",
                      "value": 3,
                      "display": "$3M"
                    },
                    {
                      "id": "aetna",
                      "account": "Aetna",
                      "value": 3,
                      "display": "$3M"
                    },
                    {
                      "id": "usbank",
                      "account": "US Bank",
                      "value": 2.4,
                      "display": "$2.4M"
                    },
                    {
                      "id": "schwab",
                      "account": "Charles Schwab",
                      "value": 2.3,
                      "display": "$2.3M"
                    },
                    {
                      "id": "usgov",
                      "account": "US GOV",
                      "value": 1.9,
                      "display": "$1.9M"
                    }
                  ],
                  "totalDisplay": "$12.6M across five deals",
                  "caption": "Ranked on whichever amount column the query reached for"
                },
                "hazard": "field-ambiguity",
                "shownFrom": "The four candidate amount columns differ per deal rather than uniformly, because they diverge on product mix and currency — so the error does not cancel the way a single multiplier would. Modelled at up to 12% per deal: US Bank $2.1M → $2.4M and US GOV $2.1M → $1.9M, which lifts US Bank above Charles Schwab. Third and fifth place swap. The total moves $12.5M → $12.6M, inside any plausibility check. The gap they were laid along goes too, being derived from an attainment with no denominator, so the rail falls back to the authored total as its scale.",
                "wouldYouNotice": "No. The total is within one per cent, all five accounts are present, and the rail gives no indication that the ordering is the fragile part. An executive briefed on this top five is briefed on a different top five from the one the certified measure produces, and the two briefings are indistinguishable.",
                "certifiedDelta": "+$0.1M total · two of five reorder",
                "layerProvides": "One certified ACV measure applied across all five, and a stated ranking rule — order by the metric, nulls last, limited in the utterance.",
                "layerDoesNotProvide": "The gap the rail is laid along. It derives from the plan attainment, and no plan basis for ACV exists in either model."
              }
            }
          ]
        }
      ],
      "navLabel": "Q3 Outlook",
      "notesRef": [
        "perf-rules"
      ]
    },
    {
      "id": "trend",
      "label": "Five Year Trend",
      "kicker": "FY23 → FY27 H1",
      "headline": "A five-year erosion with six named drivers",
      "accent": "#2F5FA8",
      "periods": [
        "FY23",
        "FY24",
        "FY25",
        "FY26",
        "FY27 H1"
      ],
      "partialFrom": 4,
      "partialNote": "FY27 H1 is a half year. Full-year columns and the H1 column are not directly comparable, so H1 is plotted detached from the trajectory rather than joined to it.",
      "bands": [
        {
          "id": "drivers",
          "layout": "drivers",
          "portlets": [
            {
              "id": "drivers",
              "kind": "driverRail",
              "label": "What is driving it",
              "sublabel": "Hover or focus a driver to light the metrics it explains",
              "accent": "#2F5FA8",
              "metrics": {
                "drivers": [
                  {
                    "n": 1,
                    "title": "Product Transitions",
                    "affects": [
                      "trend-acv",
                      "trend-attrition",
                      "trend-nnaov",
                      "trend-aov",
                      "trend-revenue"
                    ]
                  },
                  {
                    "n": 2,
                    "title": "Sales Capacity &amp; Model",
                    "affects": [
                      "trend-ae-capacity",
                      "trend-ae-productivity",
                      "trend-acv"
                    ]
                  },
                  {
                    "n": 3,
                    "title": "Customer Confusion",
                    "affects": [
                      "trend-acv",
                      "trend-attrition",
                      "trend-nnaov",
                      "trend-aov",
                      "trend-revenue"
                    ]
                  },
                  {
                    "n": 4,
                    "title": "Rapidly Evolving Competitive Landscape",
                    "affects": [
                      "trend-acv",
                      "trend-attrition",
                      "trend-nnaov",
                      "trend-aov",
                      "trend-revenue"
                    ]
                  },
                  {
                    "n": 5,
                    "title": "Eroded Tableau motions: Partner, New Logo, Success",
                    "affects": [
                      "trend-acv",
                      "trend-attrition",
                      "trend-nnaov",
                      "trend-aov",
                      "trend-revenue"
                    ]
                  },
                  {
                    "n": 6,
                    "title": "Accounting treatment: 5pt headwind in FY27",
                    "affects": [
                      "trend-revenue"
                    ]
                  }
                ]
              },
              "semantic": {
                "metricName": "Trend Drivers",
                "definition": "Leadership-authored causes for the five-year trajectory, each mapped to the measures it is claimed to explain.",
                "sdm": "None — authored narrative",
                "measure": null,
                "grain": "Fiscal year × board scope",
                "lineage": [
                  "Exec Review Narrative"
                ],
                "rls": "Not scoped — the drivers are authored; the panels they light carry their own scope",
                "certifiedBy": "Analytics BU Chief of Staff, narrative owner",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The driver-to-measure mapping is what turns a list of causes into something checkable — hovering or focusing a driver lights exactly the metrics it claims, so an over-broad claim is visible as a driver that lights the whole tab and a narrow one as a driver that lights a single panel. As authored, four of the six reach the same five metrics: that is the leadership read and it renders as given rather than being tidied into something more discriminating. Every one of the six reaches at least one metric this layer has no measure for, and the mapping is what makes that visible rather than a claim that quietly passes."
              },
              "directMode": {
                "provenance": "narrative",
                "tier": "grey",
                "detectability": "none",
                "groundedIn": "measure: null — correct as authored (§5.4)",
                "candidates": [
                  "six causes, no mapping"
                ],
                "missing": "The mapping from each driver to the measures it explains",
                "effect": "Six plausible causes floating beside seven metrics, with nothing connecting them",
                "thesisTag": "T4",
                "thesis": "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
                "risk": "Attribute the decline to the driver that is easiest to fix",
                "trustCost": "Causes that cannot be tested against the numbers beside them"
              }
            }
          ]
        },
        {
          "id": "panels",
          "layout": "panels",
          "portlets": [
            {
              "id": "trend-ae-capacity",
              "kind": "trendPanel",
              "label": "AE Capacity",
              "sublabel": "Quota-carrying heads",
              "accent": "#4E93AE",
              "metrics": {
                "unit": "#",
                "periodType": "stock",
                "series": [
                  1101,
                  953,
                  920,
                  904,
                  745
                ],
                "display": [
                  "1,101",
                  "953",
                  "920",
                  "904",
                  "745"
                ],
                "yoy": [
                  "0%",
                  "-13%",
                  "-3%",
                  "-2%",
                  "-18%"
                ],
                "cagr": null,
                "goodDirection": "up",
                "headline": "745",
                "headlineNote": "FY27 H1 — a point-in-time count",
                "caption": "Down 356 heads since FY23",
                "footnote": "AMER PACE AE count represents 69% of total Apps team, proportional to the FinPlan breakout.",
                "pointProvenance": [
                  "supplemented",
                  "supplemented",
                  "supplemented",
                  "supplemented",
                  "supplemented"
                ]
              },
              "semantic": {
                "metricName": "AE Capacity",
                "definition": "Count of quota-carrying AEs at fiscal period end. No headcount measure exists in either documented model, and the roster it would be built from is current state on a weekly refresh. The five figures here are the slide's, rendered as authored.",
                "sdm": "None — absent from both documented models",
                "measure": "No headcount measure",
                "grain": "None available — the roster is current state, refreshed weekly, with role changes lagging up to a week",
                "lineage": [
                  "User Hierarchy table (weekly refresh)"
                ],
                "rls": "n/a — no measure to scope",
                "certifiedBy": "Nobody — there is no measure to certify",
                "freshness": "The roster behind it refreshes weekly and only ever describes today · board generated Jul 28, 2026",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The caveat under this panel turns out to be literally true of the semantic layer and not only of a CRM export: the roster is as-of-today, so a closed year read again next week is a different number. A five-year capacity line needs five as-of-period-end reads, and this layer holds none."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "yellow",
                "detectability": "none",
                "groundedIn": "no AE capacity measure in either model (§5.4, §10.1)",
                "candidates": [
                  "745 as of today"
                ],
                "missing": "Point-in-time headcount per fiscal period end — the roster is weekly and current-state, in the semantic layer as much as outside it",
                "effect": "Closed years restate themselves every time the roster refreshes, so the five-year line is a series of todays wearing five different labels",
                "thesisTag": "T2",
                "thesis": "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
                "risk": "Read a five-year capacity trend that changes every time it is run",
                "trustCost": "Ungoverned but usable — the tier where errors are quiet rather than loud",
                "hazard": "none",
                "shownFrom": null,
                "metrics": {
                  "pointProvenance": [
                    "supplemented",
                    "supplemented",
                    "supplemented",
                    "supplemented",
                    "supplemented"
                  ]
                },
                "supplementedFrom": "The same weekly User Hierarchy extract as the exec tile, held as a five-year series in a maintained sheet.",
                "supplementCost": "No enforced date anchor across the five points, so a year that was counted as-of a different week is not comparable with the others, and nothing says which weeks they were.",
                "wouldYouNotice": "Nothing to notice. All five points are the same in both modes. This panel does not move when the toggle flips, because it never went through the layer and there is no guarantee to withdraw. Four panels on this board behave this way, and they are the control group: what moved is what the layer was protecting.",
                "certifiedDelta": null,
                "layerProvides": null,
                "layerDoesNotProvide": null
              }
            },
            {
              "id": "trend-ae-productivity",
              "kind": "trendPanel",
              "label": "AE Productivity",
              "sublabel": "ACV per quota-carrying AE",
              "accent": "#6B4FBF",
              "metrics": {
                "unit": "$K",
                "periodType": "flow",
                "series": [
                  566,
                  638,
                  599,
                  549,
                  200
                ],
                "display": [
                  "$566 K",
                  "$638 K",
                  "$599 K",
                  "$549 K",
                  "$200 K"
                ],
                "yoy": [
                  "-3%",
                  "13%",
                  "-6%",
                  "-8%",
                  "-6%"
                ],
                "cagr": null,
                "runRate": 400,
                "runRateDisplay": "$400 K",
                "goodDirection": "up",
                "headline": "$549 K",
                "headlineNote": "FY26 — last full year",
                "caption": "H1 annualizes to $400 K, below every full year shown",
                "pointProvenance": [
                  "supplemented",
                  "supplemented",
                  "supplemented",
                  "supplemented",
                  "supplemented"
                ]
              },
              "semantic": {
                "metricName": "AE Productivity",
                "definition": "ACV per quota-carrying AE. No productivity measure exists and neither does the denominator — the model owner names productivity specifically. Computing it from two separately fetched numbers is the ungoverned path this panel exists to warn about.",
                "sdm": "None — the numerator exists, the denominator does not",
                "measure": "No productivity measure, no denominator",
                "grain": "Would be fiscal year × board scope. Neither input is available at that grain.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ACV_HISTORICALS — numerator only"
                ],
                "rls": "n/a — no measure to scope",
                "certifiedBy": "Nobody — there is no measure to certify",
                "freshness": "Not refreshed — the figures on this panel are the slide's · board generated Jul 28, 2026",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "A derived measure is only as governed as its inputs, and one of these two does not exist in any form. The panel's own rule already gives the answer: if the ratio is not a governed calculated measure, do not compute it client-side. Against this layer it renders as unavailable, and the panel is right about why.",
                "derivedFrom": [
                  "ACV_clc",
                  "No headcount measure"
                ]
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "no productivity measure (§5.4); ACV numerator certified",
                "candidates": [
                  "$200K",
                  "$268K",
                  "$181K"
                ],
                "missing": "Both inputs at a matching grain — an ambiguous ACV numerator divided by an as-of-today capacity denominator that has no governed version to fall back to",
                "effect": "Ambiguity compounds: two ungoverned inputs produce a ratio with a wider spread than either",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Set quota capacity models on a productivity figure with a 48% spread",
                "trustCost": "Derived measures inherit and multiply every upstream ambiguity",
                "hazard": "grain",
                "shownFrom": "The numerator inherits the ACV field ambiguity on the three years the layer covers: $599 K → $540 K, $549 K → $495 K, $200 K → $180 K, and the H1 run-rate follows. FY23 and FY24 do not move, their numerator having been supplemented already. The denominator does not move in either mode — there is no governed headcount to withdraw.",
                "wouldYouNotice": "No. Every point still declines, the H1 run-rate is still below every full year shown, and the caption still reads true. A ratio hides an error in its numerator better than the numerator does, because the reader is checking a trend and the trend is intact.",
                "certifiedDelta": "three of five points moved",
                "layerProvides": "The numerator, as a certified measure, for three of the five years.",
                "layerDoesNotProvide": "The denominator, and therefore the measure. No AE capacity or productivity measure exists in either model — the model owner names productivity specifically. Both are supplemented from the User Hierarchy table.",
                "metrics": {
                  "series": [
                    566,
                    638,
                    540.3,
                    495.2,
                    180.4
                  ],
                  "display": [
                    "$566 K",
                    "$638 K",
                    "$540 K",
                    "$495 K",
                    "$180 K"
                  ],
                  "yoy": [
                    "-3%",
                    "13%",
                    "-15%",
                    "-8%",
                    "-6%"
                  ],
                  "pointProvenance": [
                    "supplemented",
                    "supplemented",
                    "inferred",
                    "inferred",
                    "inferred"
                  ],
                  "headline": "$495 K",
                  "runRate": 361,
                  "runRateDisplay": "$361 K",
                  "caption": "An inferred numerator over a denominator no layer has"
                }
              }
            },
            {
              "id": "trend-acv",
              "kind": "trendPanel",
              "label": "ACV",
              "sublabel": "Annual contract value booked",
              "accent": "#1C6E8C",
              "metrics": {
                "unit": "$M",
                "periodType": "flow",
                "series": [
                  623,
                  608,
                  551,
                  496,
                  150
                ],
                "display": [
                  "$623 M",
                  "$608 M",
                  "$551 M",
                  "$496 M",
                  "$150 M"
                ],
                "yoy": [
                  "-3%",
                  "-2%",
                  "-9%",
                  "-10%",
                  "-23%"
                ],
                "cagr": [
                  "4%",
                  "-3%",
                  "-6%",
                  "-10%",
                  "-15%"
                ],
                "runRate": 300,
                "runRateDisplay": "$300 M",
                "goodDirection": "up",
                "headline": "$496 M",
                "headlineNote": "FY26 — last full year",
                "caption": "Decline steepening: -3% to -10% across four years",
                "pointProvenance": [
                  "supplemented",
                  "supplemented",
                  "certified",
                  "certified",
                  "certified"
                ]
              },
              "semantic": {
                "metricName": "Annual Contract Value",
                "definition": "ACV_clc by fiscal year, through Close_Date_Relative_Year_clc. That field reaches CY, PY and PY-1 — FY27, FY26 and FY25 — which is the extent of the data rather than a windowing choice.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "ACV_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal year via Close_Date_Relative_Year_clc, after one dedup filter.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ACV_HISTORICALS"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The same ACV_clc as the tile on the Exec Summary tab at a coarser grain, which is a real edge and the reason the two tabs reconcile. Two of the five points are not: only three years of ACV exist, confirmed by the model owner, so FY23 and FY24 have no source and cannot be given one. The FY27 point is where the layer is most specific — a partial period needs Is_QTD_ACV_1_clc to be read against a full one, which is exactly what the detached point draws."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "FY25-27 certified; FY23-24 have no rows (§5.4, §8, §10.3)",
                "candidates": [
                  "$496M",
                  "$580M",
                  "$447M"
                ],
                "missing": "A governed ACV formula — four competing Amount columns on Opportunity with no defined winner",
                "effect": "A five-year trajectory whose slope depends on which Amount column each year was built from — and the two earliest years exist only on this path, because the certified history reaches three",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Read a decline that is partly a change in query authorship",
                "trustCost": "Every downstream number that divides by ACV inherits the ambiguity",
                "hazard": "field-ambiguity",
                "shownFrom": "The layer holds three years of ACV and no more, confirmed by the model owner, so FY23 and FY24 are supplemented in BOTH modes and do not move. The three certified years inherit the four-column ambiguity at × 0.902: $551 M → $497 M, $496 M → $447 M, $150 M → $135 M. FY26's Y/Y is unchanged at -10%, because both of its points moved together. FY25's goes from -9% to -18%, because it compares an inferred point against a supplemented one. Mixing the two tiers puts the entire error on the boundary year.",
                "wouldYouNotice": "No. On a series already declining, one steeper year reads as the story rather than as an artefact — and it is the year the eye goes to, because it is where the decline appears to accelerate. The acceleration is the seam between two sourcing tiers, and it is the only place on the whole board where you can see mixed sourcing doing damage.",
                "certifiedDelta": "three of five points moved",
                "layerProvides": "One certified ACV measure that resolves identically here and on the exec tab, and a governed relative-year dimension for the three years it holds.",
                "layerDoesNotProvide": "Two of these five years. Only three exist — an absolute date filter for FY23 or FY24 returns no rows — so the first two points are supplemented in governed mode too, and the panel says so in both.",
                "metrics": {
                  "series": [
                    623,
                    608,
                    497,
                    447.4,
                    135.3
                  ],
                  "display": [
                    "$623 M",
                    "$608 M",
                    "$497 M",
                    "$447 M",
                    "$135 M"
                  ],
                  "yoy": [
                    "-3%",
                    "-2%",
                    "-18%",
                    "-10%",
                    "-23%"
                  ],
                  "pointProvenance": [
                    "supplemented",
                    "supplemented",
                    "inferred",
                    "inferred",
                    "inferred"
                  ],
                  "headline": "$447 M",
                  "runRate": 271,
                  "runRateDisplay": "$271 M",
                  "caption": "The error lands on the seam, where inferred years meet supplemented ones"
                }
              },
              "span": 2
            },
            {
              "id": "trend-attrition",
              "kind": "trendPanel",
              "label": "Attrition",
              "sublabel": "Churned annual contract value",
              "accent": "#92640A",
              "metrics": {
                "unit": "$M",
                "periodType": "flow",
                "series": [
                  200,
                  262,
                  320,
                  331,
                  139
                ],
                "display": [
                  "$200 M",
                  "$262 M",
                  "$320 M",
                  "$331 M",
                  "$139 M"
                ],
                "yoy": [
                  "4%",
                  "31%",
                  "22%",
                  "3%",
                  "-8%"
                ],
                "cagr": [
                  "n/a",
                  "17%",
                  "27%",
                  "12%",
                  "-3%"
                ],
                "runRate": 278,
                "runRateDisplay": "$278 M",
                "goodDirection": "down",
                "headline": "$331 M",
                "headlineNote": "FY26 — last full year",
                "caption": "First improvement in five years: -8% Y/Y at H1",
                "pointProvenance": [
                  "supplemented",
                  "supplemented",
                  "certified",
                  "certified",
                  "certified"
                ]
              },
              "semantic": {
                "metricName": "Attrition ACV",
                "definition": "Attrition_clc by fiscal year. Actuals land monthly and one month in arrears, so the current year's point is always short by up to a month, with ATTRITION_UNOFFICIAL covering the in-flight one.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "Attrition_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal year via Close_Date_Relative_Year_clc, after one dedup filter.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ATTRITION_ACTUALS / ATTRITION_UNOFFICIAL"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — and a month behind on this measure: actuals arrive within five business days of month-end",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "Direction of good is stated by this board, not by the measure — nothing in this layer declares one. What the layer does state is depth and lag: three years of history at the outside, and actuals a month in arrears, so the FY27 reading is both partial and behind. Whether attrition reaches three years is itself unconfirmed — the owner's answer was about ACV, and attrition reads from a different CTE."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "silent",
                "groundedIn": "FY25-27 certified; FY23-24 have no rows (§5.4, §8, §10.3)",
                "candidates": [
                  "requires manual reconstruction per year"
                ],
                "missing": "A point-in-time contract book for each of five prior periods",
                "effect": "Five years each rebuilt by hand, so the trend partly measures how the method changed — and the two earliest are outside the certified history entirely, so only the hand-built version has them",
                "thesisTag": "T2",
                "thesis": "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
                "risk": "Celebrate a -8% improvement that is a methodology artifact",
                "trustCost": "A trend line nobody can reproduce is not a trend line",
                "hazard": "point-in-time",
                "shownFrom": "Only the in-flight point carries the arrears hazard: actuals land a month behind, so a direct read of FY27 H1 finds five of six months and reports the half-year as complete. $139 M × 5/6 = $116 M. Its comparison is the prior H1, recovered from the authored pair at $151.1M — a closed half-year, so it does not inherit the arrears factor and the multiplier does not cancel: the rate goes from -8% to -23%. The four closed years do not move, because reconstructing them from history objects lands differently on every run, which is a variance rather than a bias. FY23 and FY24 are supplemented in both modes.",
                "wouldYouNotice": "No. Four of five points are identical to the governed panel, so the series looks verified — and a series that mostly matches is more persuasive than one that matches entirely, because it looks as though it has been checked. The fifth point is the first improvement in five years, and it is the only one that moved.",
                "certifiedDelta": "one of five points moved · -8% becomes -23%",
                "layerProvides": "A named measure for landed actuals and a separate one for the in-flight month, so a query can tell a complete period from a partial one.",
                "layerDoesNotProvide": "Two of these five years, and any bar on summing the two attrition measures together.",
                "metrics": {
                  "series": [
                    200,
                    262,
                    320,
                    331,
                    115.8
                  ],
                  "display": [
                    "$200 M",
                    "$262 M",
                    "$320 M",
                    "$331 M",
                    "$116 M"
                  ],
                  "yoy": [
                    "4%",
                    "31%",
                    "22%",
                    "3%",
                    "-23%"
                  ],
                  "pointProvenance": [
                    "supplemented",
                    "supplemented",
                    "inferred",
                    "inferred",
                    "inferred"
                  ],
                  "runRate": 232,
                  "runRateDisplay": "$232 M",
                  "caption": "One point moved, and it is the one the panel is about"
                }
              }
            },
            {
              "id": "trend-aov",
              "kind": "trendPanel",
              "label": "AOV",
              "sublabel": "Annual order value book",
              "accent": "#12806A",
              "metrics": {
                "unit": "$M",
                "periodType": "stock",
                "series": [
                  2797,
                  3184,
                  3397,
                  3544,
                  3594
                ],
                "display": [
                  "$2797 M",
                  "$3184 M",
                  "$3397 M",
                  "$3544 M",
                  "$3594 M"
                ],
                "yoy": [
                  "16%",
                  "14%",
                  "7%",
                  "4%",
                  "4%"
                ],
                "cagr": [
                  "20%",
                  "15%",
                  "10%",
                  "5%",
                  "4%"
                ],
                "goodDirection": "up",
                "headline": "$3594 M",
                "headlineNote": "FY27 H1 — a balance, not a flow",
                "caption": "Still growing, but growth halved every two years",
                "pointProvenance": [
                  "supplemented",
                  "supplemented",
                  "supplemented",
                  "supplemented",
                  "supplemented"
                ]
              },
              "semantic": {
                "metricName": "Annual Order Value",
                "definition": "Total annualised value of the active order book at period end. No measure for it exists: AOV is excluded in writing from both models, and Forecasting instructs skill writers to tell users the question cannot be answered there. The five figures are the slide's, rendered as authored.",
                "sdm": "None — excluded in writing from both documented models",
                "measure": "No AOV measure in either model",
                "grain": "Would be period end × board scope. There is no measure to carry it.",
                "lineage": [
                  "No source in this layer"
                ],
                "rls": "n/a — no measure to scope",
                "certifiedBy": "Nobody — there is no measure to certify",
                "freshness": "Not refreshed — the figures on this panel are the slide's · board generated Jul 28, 2026",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "AOV cannot be sourced here at all: it is excluded from both models in writing, Forecasting tells skill writers to say so, and the model owner confirms it. The nearest real balance in this layer is Open_Pipe_clc, which the Specialist doc exempts from period-to-date treatment by name — a stock the layer will actually answer for, where this one is not."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "yellow",
                "detectability": "none",
                "groundedIn": "AOV explicitly excluded from both models (§5.5, §10.1)",
                "candidates": [
                  "$3594M",
                  "$7188M if H1 is doubled"
                ],
                "missing": "Any source at all — this metric is excluded from both semantic models in writing, so the hand-built read is the only read there is",
                "effect": "H1 gets doubled to $7,188M by anyone treating this row like the ACV row above it, and with no governed measure behind it nothing can refuse the doubling",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Double a balance and report a book twice its real size",
                "trustCost": "The error looks exactly like the correct operation on the row above",
                "hazard": "none",
                "shownFrom": null,
                "metrics": {
                  "pointProvenance": [
                    "supplemented",
                    "supplemented",
                    "supplemented",
                    "supplemented",
                    "supplemented"
                  ]
                },
                "supplementedFrom": "A Snowflake balance on the active order book, queried directly. AOV is not merely absent from the two models — it is excluded from both in writing, and the Forecasting model instructs the agent to say so if asked.",
                "supplementCost": "No additivity classification, which matters more here than anywhere: this is a stock, not a flow, and nothing enforces that it is never summed across periods. No versioning of the definition, so what counts as an active order this quarter may differ next quarter.",
                "wouldYouNotice": "Nothing to notice. All five points are the same in both modes, and legitimately so — a direct Snowflake read is a real way to get a real number onto a board. This panel does not move when the toggle flips, because it never went through the layer and there is no guarantee to withdraw. Four panels on this board behave this way, and they are the control group: what moved is what the layer was protecting.",
                "certifiedDelta": null,
                "layerProvides": null,
                "layerDoesNotProvide": null
              }
            },
            {
              "id": "trend-nnaov",
              "kind": "trendPanel",
              "label": "NNAOV",
              "sublabel": "Net new annual order value",
              "accent": "#C0483C",
              "metrics": {
                "unit": "$M",
                "periodType": "flow",
                "series": [
                  423,
                  345,
                  231,
                  166,
                  11
                ],
                "display": [
                  "$423 M",
                  "$345 M",
                  "$231 M",
                  "$166 M",
                  "$11 M"
                ],
                "yoy": [
                  "-6%",
                  "-18%",
                  "-33%",
                  "-28%",
                  "-74%"
                ],
                "cagr": [
                  null,
                  "-13%",
                  "-26%",
                  "-31%",
                  "-85%"
                ],
                "runRate": 22,
                "runRateDisplay": "$22 M",
                "goodDirection": "up",
                "headline": "$166 M",
                "headlineNote": "FY26 — last full year",
                "caption": "Down 97% from FY23 on an H1 run-rate basis",
                "pointProvenance": [
                  "supplemented",
                  "supplemented",
                  "certified",
                  "certified",
                  "certified"
                ]
              },
              "semantic": {
                "metricName": "NNAOV Commit",
                "definition": "NNAOV_Commit_clc by fiscal year — a series of forecasts, not of results. No booked net-new actual exists in either model.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "NNAOV_Commit_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal year via Close_Date_Relative_Year_clc, after one dedup filter.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "Commits"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The same field as the NNAOV tile on the Exec Summary tab, so the two tabs cannot disagree — they are consistently mislabelled together, because both render a commit as a booking. Two of the five points have no source either way: three years of history is the outside limit here too."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "red",
                "detectability": "catchable",
                "groundedIn": "FY25-27 certified; FY23-24 have no rows (§5.4, §8, §10.3)",
                "candidates": [
                  "$166M",
                  "$310M",
                  "$122M"
                ],
                "missing": "A governed net-new-logo test across five years of account history — the layer holds three years and a commit measure, not five years and a booking",
                "effect": "The steepest decline on the board becomes the least defensible number on the board",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Build the FY28 new-logo plan on a baseline that could be off by 2.5x",
                "trustCost": "A confident wrong number costs more trust than a flagged unknown",
                "hazard": "field-ambiguity",
                "shownFrom": "The three years the layer covers inherit the permissive new-logo test at × 1.867 — $231 M → $431 M, $166 M → $310 M, $11 M → $21 M — while FY23 and FY24 are supplemented and do not move. The result is that FY25 ($431 M) now sits ABOVE FY23 ($423 M), so a monotonic five-year decline becomes a rise and then a fall, and FY25's Y/Y flips sign from -33% to 25%.",
                "wouldYouNotice": "Yes, and not from any figure — every value is individually plausible. From the SHAPE. A five-year decline that turns upward in the middle is visibly wrong against the two points either side of it, and those two are the supplemented ones that did not move. The panel is caught by its own control group.",
                "certifiedDelta": "three of five points moved",
                "layerProvides": "A governed commit measure with a declared grain and one new-logo definition rather than three.",
                "layerDoesNotProvide": "Two of these five years, and the polarity that says a rise here is good news — neither model declares direction-of-good on any measure.",
                "metrics": {
                  "series": [
                    423,
                    345,
                    431.3,
                    309.9,
                    20.5
                  ],
                  "display": [
                    "$423 M",
                    "$345 M",
                    "$431 M",
                    "$310 M",
                    "$21 M"
                  ],
                  "yoy": [
                    "-6%",
                    "-18%",
                    "25%",
                    "-28%",
                    "-74%"
                  ],
                  "pointProvenance": [
                    "supplemented",
                    "supplemented",
                    "inferred",
                    "inferred",
                    "inferred"
                  ],
                  "headline": "$310 M",
                  "runRate": 41,
                  "runRateDisplay": "$41 M",
                  "caption": "FY25 now sits above FY23 — the shape broke at the seam"
                }
              }
            },
            {
              "id": "trend-rules",
              "kind": "rulesCard",
              "label": "How this tab reads",
              "sublabel": "Rules applied to every panel",
              "accent": "#63708C",
              "metrics": {
                "rules": [
                  {
                    "title": "Flow vs stock",
                    "body": "A flow accumulates across a period, so FY27 H1 is plotted detached and offered a run-rate ghost. A balance is read at a point in time, so its H1 reading joins the line and is never annualised. The layer draws that line by naming measures rather than by declaring a type: ACV carries a period-to-date flag because it accumulates, and Open Pipe is exempted from period-to-date treatment in writing — a balance the layer declares as one, not one this tab decided to treat as one.",
                    "diagram": "flowStock"
                  },
                  {
                    "title": "Zero baseline",
                    "body": "Every value axis starts at zero. A padded baseline makes each decline look steeper, and at this size nobody would notice it had been truncated.",
                    "diagram": "zeroBaseline"
                  },
                  {
                    "title": "Additivity and period to date",
                    "body": "Direction of good is a decision this board makes and states — no measure in this layer declares one, so attrition reading as lower-is-better is the tab's doing rather than the definition's. What the layer does guarantee is additivity, that a measure sums correctly across grains, and a period-to-date flag on the measures that accumulate. Without that flag a half year is compared against a full one, which is the comparison this tab exists to refuse."
                  },
                  {
                    "title": "Colour threshold",
                    "body": "Movements inside ±10% render amber, beyond it red or green — one stated threshold rather than a per-cell judgement."
                  }
                ]
              },
              "semantic": {
                "metricName": "Presentation Rules",
                "definition": "The comparability, scaling and threshold rules applied to every panel on this tab. Two of the four are properties the layer publishes — an additivity classification on every measure, and a period-to-date flag on the measures that accumulate. Two are this board's own presentation decisions, stated here rather than left in the chart.",
                "sdm": "Sls_Forecasting_Metrics_Expanded — the model behind every panel on this tab that has a measure at all",
                "measure": null,
                "grain": "Applies to all measures on this tab. The layer's half is readable off the model: businessPreferences via get_semantic_model, aggregationType via list_semantic_model_calculated_measures.",
                "lineage": [
                  "Semantic Model Definition",
                  "businessPreferences"
                ],
                "rls": "Not scoped — rules apply to every viewer identically",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "Saying which of these rules is the layer's and which is the board's is the point of the card. Additivity and the period-to-date flag are real, named and discoverable, and a chart, an export or an agent reading the same measures inherits them without being told. Polarity is not: neither model carries a direction of good on any measure, so this tab states it rather than inheriting it. A rules card claiming the layer supplied it would be exactly the plausible-but-unsupported metadata this board exists to argue against."
              },
              "directMode": {
                "provenance": "narrative",
                "tier": "grey",
                "detectability": "none",
                "groundedIn": "presentation rules, no figure (§5.4)",
                "candidates": [
                  "rules live in each analyst's head"
                ],
                "missing": "Any place for an additivity classification or a period-to-date flag to live except the head of whoever built the chart",
                "effect": "Four rules that have to be remembered, re-explained and re-applied by every person and every agent that touches these numbers — and a half year quietly compared against a full one the first time anyone forgets",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Two analysts produce two defensible versions of the same tab",
                "trustCost": "Consistency becomes a matter of diligence rather than a property of the data"
              }
            },
            {
              "id": "trend-revenue",
              "kind": "trendPanel",
              "label": "Revenue",
              "sublabel": "Recognized revenue",
              "accent": "#2F5FA8",
              "metrics": {
                "unit": "$M",
                "periodType": "flow",
                "series": [
                  2670,
                  3100,
                  3421,
                  3659,
                  1726
                ],
                "display": [
                  "$2670 M",
                  "$3100 M",
                  "$3421 M",
                  "$3659 M",
                  "$1726 M"
                ],
                "yoy": [
                  null,
                  "16%",
                  "10%",
                  "7%",
                  "-5%"
                ],
                "cagr": null,
                "runRate": 3452,
                "runRateDisplay": "$3452 M",
                "goodDirection": "up",
                "headline": "$3659 M",
                "headlineNote": "FY26 — last full year",
                "caption": "First decline in five years, with a 5pt FY27 accounting headwind",
                "pointProvenance": [
                  "supplemented",
                  "supplemented",
                  "supplemented",
                  "supplemented",
                  "supplemented"
                ]
              },
              "semantic": {
                "metricName": "Recognized Revenue",
                "definition": "Revenue recognised in the fiscal period. Both models stop at bookings and forecast, and no recognised-revenue measure exists in either — confirmed by the model owner. WON_RENEWALS and ATR are adjacent concepts, not this one.",
                "sdm": "None — both models stop at bookings and forecast",
                "measure": "No revenue measure in either model",
                "grain": "Would be fiscal year × board scope. There is no measure to carry it.",
                "lineage": [
                  "No source in this layer"
                ],
                "rls": "n/a — no measure to scope",
                "certifiedBy": "Nobody — there is no measure to certify",
                "freshness": "Not refreshed — the figures on this panel are the slide's · board generated Jul 28, 2026",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "The 5pt FY27 treatment headwind is a real fact about the business and not a fact this layer holds — no such note exists in either model's businessPreferences, which is where a documented treatment change would live. Sourcing revenue means a different system, not a better discovery call."
              },
              "directMode": {
                "provenance": "supplemented",
                "tier": "yellow",
                "detectability": "none",
                "groundedIn": "no revenue equivalent — model owner confirmed (§5.4, §10.1)",
                "candidates": [
                  "$1726M H1",
                  "no note of the 5pt treatment change"
                ],
                "missing": "The documented FY27 accounting treatment change attached to the measure — and the measure, which neither semantic model carries",
                "effect": "The -5% reads as pure business decline, with the 5pt treatment headwind invisible",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Attribute an accounting change to sales execution",
                "trustCost": "Ungoverned but usable — the tier where errors are quiet rather than loud",
                "hazard": "none",
                "shownFrom": null,
                "metrics": {
                  "pointProvenance": [
                    "supplemented",
                    "supplemented",
                    "supplemented",
                    "supplemented",
                    "supplemented"
                  ]
                },
                "supplementedFrom": "A finance-maintained sheet, downstream of the accounting treatment change documented for FY27.",
                "supplementCost": "No lineage to the treatment change, so the FY27 discontinuity is visible in the series and unexplained by it. No enforced grain, so nothing prevents a revenue figure being compared with an ACV figure as though they were the same kind of thing.",
                "wouldYouNotice": "Nothing to notice. All five points are the same in both modes. This panel does not move when the toggle flips, because it never went through the layer and there is no guarantee to withdraw. Four panels on this board behave this way, and they are the control group: what moved is what the layer was protecting.",
                "certifiedDelta": null,
                "layerProvides": null,
                "layerDoesNotProvide": null
              }
            }
          ]
        }
      ],
      "navLabel": "Five Year"
    }
  ]
};
