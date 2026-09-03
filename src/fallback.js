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
                "caption": "Weakest attainment on the board"
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
                "tier": "red",
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
                  "display": "$6.0 / $11.2 / $4.4M",
                  "planDisplay": "plan basis undefined",
                  "yoyDisplay": "-75% Y/Y (unverifiable)",
                  "caption": "Three candidate definitions, no arbiter"
                }
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
                "caption": "Splits $24M Embedded / $58M Agentic"
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
                "tier": "red",
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
                  "display": "$82 / $96 / $74M",
                  "planDisplay": "plan basis undefined",
                  "yoyDisplay": "-28% Y/Y (unverifiable)",
                  "caption": "Four candidate Amount columns, no defined winner"
                }
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
                "caption": "Falling year over year, still over plan"
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
                "tier": "grey",
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
                  "display": "reconstruct",
                  "planDisplay": "no prior-period baseline",
                  "yoyDisplay": "-12% Y/Y (unreproducible)",
                  "caption": "No point-in-time contract book to measure against"
                }
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
                "caption": "Closest to plan of the four"
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
                "tier": "yellow",
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
                  "planDisplay": "79% of plan (rule undeclared)",
                  "caption": "Stage re-entry rule left to the query author"
                }
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
                "tier": "red",
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
                  "insight": "Without a governed SKU-to-motion taxonomy there is no Embedded / Agentic split to report — only an undifferentiated $82M.",
                  "caption": "No product-motion grouping available"
                }
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
                "tier": "yellow",
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
                "metrics": {
                  "priorDisplay": "no prior-year count to subtract from",
                  "caption": "As-of-today only — prior quarters restate"
                }
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
                "tier": "grey",
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
                "tier": "grey",
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
                  "doesNotReconcileTo": "kpi-attrition ($75M) and trend-attrition. Attrition is measured against the prior-period contract book across the whole installed base; this population is the Q2 bookings cohort. The 15 accounts that renewed nothing take $7.1M of prior ACV with them and that figure is not a subset of the attrition tile at any stated grain. Do not draw a graph edge between them, and do not label the contracting group 'churn'."
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
                "tier": "red",
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
                  "headline": "no reconciled population",
                  "headlineNote": "Rows exist; the roll-up guarantee does not",
                  "insight": "Without a conformed account identity and a point-in-time prior-year book there is no population to fan. An export can still produce a row per account, but the rows do not sum to the certified $82M and the movement on each line is partly an artifact of when the hierarchy was last edited.",
                  "caption": "Per-account detail available, roll-up to the certified total not"
                }
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
                "tier": "red",
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
                  "rollup": {
                    "total": 83,
                    "totalDisplay": "$83M",
                    "note": "No product taxonomy — one undifferentiated total, and no levels to tile it.",
                    "levels": [
                      [
                        "analytics-total"
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
                      "color": "#C0483C"
                    }
                  ],
                  "sockets": [
                    "platform",
                    "cloud",
                    "server",
                    "embedded",
                    "next",
                    "crma"
                  ],
                  "caption": "No product taxonomy — one undifferentiated $83M and six rows with nothing to draw"
                }
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
              "kind": "growthSpread",
              "label": "Within-motion spread",
              "sublabel": "Slowest to fastest line in each motion",
              "accent": "#12806A",
              "metrics": {
                "goodDirection": "up",
                "rows": [
                  {
                    "id": "platform-spread",
                    "label": "Agentic Analytics Platform",
                    "parentYoy": -40,
                    "parentYoyDisplay": "-40%",
                    "low": -41,
                    "lowDisplay": "-41%",
                    "lowLabel": "Tableau Cloud",
                    "high": -39,
                    "highDisplay": "-39%",
                    "highLabel": "Tableau Server",
                    "spreadDisplay": "2 points apart"
                  },
                  {
                    "id": "embedded-spread",
                    "label": "Embedded Agentic Analytics",
                    "parentYoy": 57,
                    "parentYoyDisplay": "+57%",
                    "low": -15,
                    "lowDisplay": "-15%",
                    "lowLabel": "CRMA",
                    "high": 414,
                    "highDisplay": "+414%",
                    "highLabel": "Tableau Next",
                    "spreadDisplay": "429 points apart"
                  }
                ],
                "axisNote": "Same growth axis as the panel beside it",
                "caption": "One motion moves together; the other does not"
              },
              "semantic": {
                "metricName": "Within-Motion Growth Dispersion",
                "definition": "The interval between the slowest and fastest ACV_clc Y/Y among the APM L2 lines inside one motion, at fiscal-quarter grain.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "ACV_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × motion, from the same APM_L218 pull as the panel beside it.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ACV_HISTORICALS",
                  "APM product hierarchy (L1/L2/L3)"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "Both ends are the same measure at the same grain, which is what makes the interval a comparison rather than two numbers set beside each other. Taking the min and max is a selection over governed values, so it is safe client-side — the rates themselves are not, because a Y/Y is non-additive and has to come from the layer rather than from dividing two fetched totals."
              },
              "directMode": {
                "tier": "red",
                "candidates": [
                  "four rates with nothing to group them"
                ],
                "missing": "The motion-to-line parentage — without it there is no inside-each-motion for a range to be taken within",
                "effect": "Four product-line growth rates survive and the two intervals do not, so the fact that one motion moves together and the other splits has nowhere to be seen",
                "thesisTag": "T4",
                "thesis": "Business vocabulary is an asset that has to live somewhere shared — otherwise every analysis rebuilds the same grouping by hand, slightly differently.",
                "risk": "Treat Embedded as one growing thing and fund both of its lines on the strength of one",
                "trustCost": "A grouping that only exists in the deck cannot be reviewed against next quarter's deck",
                "metrics": {
                  "caption": "No motion parentage — no interval to take"
                }
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
                    "title": "Roll-up is geometry",
                    "body": "Cloud and Server tile the Platform bar exactly, and the two motions tile the total exactly. The level-1 boundary recurs one level down because all three levels are one certified measure at three grains, so the partition closes by construction rather than by being checked afterwards."
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
                "definition": "The partition, channel, scaling and weighting rules the semantic layer applies to every product, segment and outlook mark on this board.",
                "sdm": "Analytics Revenue SDM",
                "measure": null,
                "grain": "Applies to all measures on the product, segment and outlook tabs",
                "lineage": [
                  "Semantic Model Definition"
                ],
                "rls": "Not scoped — rules apply to every viewer identically",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Jul 28, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Product Performance",
                "why": "These rules are properties of the measures rather than of the charts, so every chart, export and agent reading those measures inherits them. Nobody has to remember to apply them, and nobody can quietly not."
              },
              "directMode": {
                "tier": "grey",
                "candidates": [
                  "rules live in each analyst's head"
                ],
                "missing": "Any place for a partition rule, a scale or a weighting to live except the head of whoever built the chart",
                "effect": "Four rules that have to be remembered, re-explained and re-applied by every person and every agent that touches these numbers",
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
                "axisNote": "Y/Y — linear inside ±10%, one decade per gridline beyond it",
                "caption": "Bar length is Y/Y on a log scale past ±10%; dot area is the ACV behind it · the dollars are on hover, or expand for the full grid",
                "rateLabels": "all",
                "allSegmentsNote": "The All Segments reading of every row is the Analytics Performance tab, in full."
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
                "tier": "red",
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
                  "axisNote": "Y/Y on a stated scale — with no stated segment to read it by",
                  "caption": "Twenty-eight cells, three candidate segment sources, no arbiter"
                }
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
              "kind": "growthSpread",
              "label": "Within-segment spread",
              "sublabel": "Slowest to fastest product line in each segment",
              "accent": "#6B4FBF",
              "metrics": {
                "goodDirection": "up",
                "rows": [
                  {
                    "id": "all-spread",
                    "label": "All Segments",
                    "parentYoy": -27,
                    "parentYoyDisplay": "-27%",
                    "low": -41,
                    "lowDisplay": "-41%",
                    "lowLabel": "Tableau Cloud",
                    "high": 414,
                    "highDisplay": "+414%",
                    "highLabel": "Tableau Next",
                    "spreadDisplay": "455 points"
                  },
                  {
                    "id": "entr-spread",
                    "label": "ENTR",
                    "parentYoy": -35,
                    "parentYoyDisplay": "-35%",
                    "low": -48,
                    "lowDisplay": "-48%",
                    "lowLabel": "Cloud & Server",
                    "high": 402,
                    "highDisplay": "+402%",
                    "highLabel": "Tableau Next",
                    "spreadDisplay": "450 points"
                  },
                  {
                    "id": "cmrcl-spread",
                    "label": "CMRCL",
                    "parentYoy": -31,
                    "parentYoyDisplay": "-31%",
                    "low": -42,
                    "lowDisplay": "-42%",
                    "lowLabel": "Tableau Cloud",
                    "high": 236,
                    "highDisplay": "+236%",
                    "highLabel": "Tableau Next",
                    "spreadDisplay": "278 points"
                  },
                  {
                    "id": "smb-spread",
                    "label": "SMB",
                    "parentYoy": -23,
                    "parentYoyDisplay": "-23%",
                    "low": -45,
                    "lowDisplay": "-45%",
                    "lowLabel": "Tableau Server",
                    "high": 727,
                    "highDisplay": "+727%",
                    "highLabel": "Tableau Next",
                    "spreadDisplay": "772 points"
                  },
                  {
                    "id": "pubsec-spread",
                    "label": "PubSec",
                    "parentYoy": 14,
                    "parentYoyDisplay": "+14%",
                    "low": -16,
                    "lowDisplay": "-16%",
                    "lowLabel": "Tableau Cloud",
                    "high": 1060,
                    "highDisplay": "+1060%",
                    "highLabel": "Tableau Next",
                    "spreadDisplay": "1076 points"
                  }
                ],
                "axisNote": "Same growth axis as the matrix beside it",
                "caption": "Every segment holds a declining line and a growing one · the caret is the segment's own rate"
              },
              "semantic": {
                "metricName": "Within-Segment Growth Dispersion",
                "definition": "The interval between the slowest and fastest ACV_clc Y/Y among the product lines inside one segment, taken from the same grouped pull as the matrix beside it.",
                "sdm": "Sls_Forecasting_Metrics_Expanded — the segment derivation decides the model for both portlets",
                "measure": "ACV_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter × the derived segment.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "ACV_HISTORICALS",
                  "Segment10 + <TBD: OU field>"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "Each interval is one measure read at two product lines inside one segment, so its width is a fact about the segment rather than an artifact of two definitions. The endpoints are a selection over governed values; the rates behind them are non-additive and come from the layer, never from dividing two fetched totals."
              },
              "directMode": {
                "tier": "red",
                "candidates": [
                  "seven rates per segment, three candidate segments"
                ],
                "missing": "The certified segment dimension the interval is taken within, and the product parentage that says which lines belong in the range",
                "effect": "The intervals still draw and each one is taken over a different population, so a segment looks volatile or stable depending on which segment source the query author used",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Call one segment the volatile one when the volatility is in the segment assignment",
                "trustCost": "A range over an unstable population measures the population, not the range",
                "metrics": {
                  "caption": "Five intervals, five different populations"
                }
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
                    "title": "One measure, two grains",
                    "body": "Every cell is the same certified ACV measure, read at product line crossed with customer segment. The columns are a dimension of one measure rather than five measures that resemble each other, which is what makes reading across a row a comparison."
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
                    "body": "There is no All Segments column here. That reading is the product tab in full, at two levels of the taxonomy, and both tabs resolve to the same certified ACV measure — so the knowledge graph links them rather than this matrix restating them in a fifth column."
                  }
                ]
              },
              "semantic": {
                "metricName": "Matrix Reading Rules",
                "definition": "The grain, containment, disclosure and scaling rules applied to every cell of the segment matrix.",
                "sdm": "Analytics Revenue SDM",
                "measure": null,
                "grain": "Applies to every cell on this tab",
                "lineage": [
                  "Semantic Model Definition"
                ],
                "rls": "Not scoped — rules apply to every viewer identically",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Jul 28, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Segment Performance",
                "why": "A dense matrix is only readable if the reader can trust that every cell was made the same way. These rules are properties of the measure and its dimensions, so that trust is a property of the data rather than a promise made by the chart."
              },
              "directMode": {
                "tier": "grey",
                "candidates": [
                  "twenty-eight cells, no stated grain"
                ],
                "missing": "Any statement of the grain each cell was read at, or of which taxonomy the rows belong to",
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
          "id": "outlook-head",
          "layout": "outlook-head",
          "portlets": [
            {
              "id": "outlook-acv",
              "kind": "statTile",
              "label": "ACV",
              "sublabel": "Q3 outlook · annual contract value",
              "accent": "#1C6E8C",
              "metrics": {
                "value": 105,
                "display": "$105M",
                "unit": "$M",
                "yoy": -6,
                "yoyDisplay": "-6% Y/Y",
                "goodDirection": "up",
                "caption": "87% of Product FinPlan"
              },
              "semantic": {
                "metricName": "ACV Commit",
                "definition": "Current_Commit_clc — the governed ACV forecast commit for the in-flight quarter. There is no stage-probability model in this layer, so the closed-plus-weighted-pipeline composition this tile used to describe is not a measure that exists.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "Current_Commit_clc",
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
                "why": "This tile is a commit, so it is deliberately not the ACV measure the Q2 tile and the five-year row share — the knowledge graph draws no edge to them, and binding it to ACV_clc to make one appear would be exactly the loose measure-identity claim this board argues against. The 87% of Product FinPlan under it has no denominator here either: no FinPlan object exists in either model, and the only governed targets are pipegen and Day-1 open pipe."
              },
              "directMode": {
                "tier": "red",
                "candidates": [
                  "$105M",
                  "$121M",
                  "$94M"
                ],
                "missing": "A governed outlook basis — Org62 carries stage and a Probability field, but no statement of which weighting a quarter is being called on, on top of the four candidate Amount columns the closed portion already inherits",
                "effect": "The figure moves with whoever set the weighting, and the Y/Y compares this quarter's assumption against last quarter's actual without saying so",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Call the quarter on a weighting nobody agreed to and grade it against an actual",
                "trustCost": "A forecast with no stated basis is a number with an author",
                "metrics": {
                  "display": "$105 / $121 / $94M",
                  "yoyDisplay": "-6% Y/Y (basis undeclared)",
                  "caption": "Weighting undeclared — plan basis undefined"
                }
              }
            },
            {
              "id": "outlook-attrition",
              "kind": "statTile",
              "label": "Attrition",
              "sublabel": "Q3 outlook · churned annual contract value",
              "accent": "#92640A",
              "metrics": {
                "value": 79.5,
                "display": "$79.5M",
                "unit": "$M",
                "yoy": 20,
                "yoyDisplay": "+20% Y/Y",
                "goodDirection": "down",
                "caption": "Rising year over year on a lower-is-better measure"
              },
              "semantic": {
                "metricName": "Attrition Commit",
                "definition": "Attrition_Commit_clc — the current attrition forecast commit. Unlike the actual measure it carries no arrears lag, because it is a forecast rather than a month-end landing.",
                "sdm": "Sls_Forecasting_Metrics_Expanded",
                "measure": "Attrition_Commit_clc",
                "grain": "Row: metric × opportunity × user in the hierarchy. Presented: fiscal quarter on Close_Date17, after one dedup filter.",
                "lineage": [
                  "Org62 Opportunity",
                  "Tableau Extract (.tdsx)",
                  "Commits / ATTRITION_UNOFFICIAL"
                ],
                "rls": "The caller's entitled hierarchy, not a business unit — filter-driven here, so a wrong scope returns a plausible number, not an error.",
                "certifiedBy": "Casey O'Donnell, document owner — the SDM has no certifier property",
                "freshness": "Jul 28, 2026 · 9:00 AM PT — SDM checked hourly over a daily ~8 AM PT extract",
                "dashboard": "<TBD: no dashboard named in the source docs — resolve via list_dashboards>",
                "why": "This is the one tile where the commit measure is the right one: an outlook wants a forecast, which is what the exec and five-year NNAOV readings of a commit measure are not. Direction of good is the board's own — nothing in this layer declares one — so a rising churn figure reads as bad news because the tile says so.",
                "polarityNote": "On the source slide the sign of this movement is coloured by the deck author. Here it is stated once, on the measure's own tile, rather than per cell — which is as far as this layer supports the claim, because it publishes no direction of good."
              },
              "directMode": {
                "tier": "grey",
                "candidates": [
                  "requires manual reconstruction"
                ],
                "missing": "A point-in-time renewal book for the quarter being forecast — Org62 holds current contract state, not the book Q3 attrition will be measured against",
                "effect": "The quarter's churn exposure has to be rebuilt by hand from history objects, and nothing states whether the figure is a forecast or a landing — a commit read as an actual looks identical either way",
                "thesisTag": "T2",
                "thesis": "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
                "risk": "Forecast against a renewal book that has quietly changed since the forecast was built",
                "trustCost": "A trend nobody can reproduce is not a trend",
                "metrics": {
                  "display": "reconstruct",
                  "yoyDisplay": "+20% Y/Y (unreproducible)",
                  "caption": "No renewal-book snapshot to measure against"
                }
              }
            },
            {
              "id": "outlook-nnaov",
              "kind": "statTile",
              "label": "NNAOV",
              "sublabel": "Q3 outlook · net new annual order value",
              "accent": "#C0483C",
              "metrics": {
                "value": 25.5,
                "display": "$25.5M",
                "unit": "$M",
                "yoy": -41,
                "yoyDisplay": "-41% Y/Y",
                "goodDirection": "up",
                "caption": "Steepest decline of the three outlook measures"
              },
              "semantic": {
                "metricName": "NNAOV Commit",
                "definition": "NNAOV_Commit_clc — Net New ACV + Offset Value commit, read for the in-flight quarter. On an outlook tile a commit is the right measure, which is what the exec and five-year readings of the same field are not.",
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
                "why": "No first-purchase rule is documented on this measure — New_Logo_Eligible4 is a separate dimension flag — so the tile claims the forecast it can support and not the test it cannot. The Y/Y has to come from a grouped pull on Close_Date_Relative_Year_clc as well: no NNAOV Y/Y measure is documented, and dividing two fetched numbers is the path this board refuses."
              },
              "directMode": {
                "tier": "red",
                "candidates": [
                  "$25.5M",
                  "$38.1M",
                  "$17.4M"
                ],
                "missing": "A governed net-new-logo test that works on opportunities which have not closed yet — the first-purchase check needs an account history and a date to test it at, and an open deal supplies neither",
                "effect": "Three defensible forward net-new figures with no arbiter, on the measure that already has the weakest attainment on the board",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Build the new-logo motion's Q3 exit plan on a baseline that could be off by more than twofold",
                "trustCost": "A confident wrong number costs more trust than a flagged unknown",
                "metrics": {
                  "display": "$25.5 / $38.1 / $17.4M",
                  "yoyDisplay": "-41% Y/Y (unverifiable)",
                  "caption": "Three candidate forward definitions, no arbiter"
                }
              }
            }
          ]
        },
        {
          "id": "outlook-grid",
          "layout": "outlook-matrix",
          "portlets": [
            {
              "id": "outlook-matrix",
              "kind": "metricMatrix",
              "label": "Q3 outlook by product",
              "sublabel": "Three measures against plan, velocity and coverage",
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
                          "yoyDisplay": "-10% Y/Y"
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
                          "yoyDisplay": "34% Y/Y"
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
                        "planGoodDirection": "up",
                        "pairs": [
                          {
                            "id": "velocity",
                            "label": "Velocity",
                            "value": 15,
                            "valueDisplay": "15%",
                            "hist": 17,
                            "histDisplay": "17% hist",
                            "domainMax": 25,
                            "unit": "%",
                            "goodDirection": "up"
                          },
                          {
                            "id": "coverage",
                            "label": "Coverage",
                            "value": 2.6,
                            "valueDisplay": "2.6x",
                            "hist": 2.7,
                            "histDisplay": "2.7x hist",
                            "domainMax": 4,
                            "unit": "x",
                            "goodDirection": "up"
                          }
                        ]
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
                        "planGoodDirection": "up",
                        "pairs": [
                          {
                            "id": "velocity",
                            "label": "Velocity",
                            "value": 16,
                            "valueDisplay": "16%",
                            "hist": 16,
                            "histDisplay": "16% hist",
                            "domainMax": 25,
                            "unit": "%",
                            "goodDirection": "up"
                          },
                          {
                            "id": "coverage",
                            "label": "Coverage",
                            "value": 3.2,
                            "valueDisplay": "3.2x",
                            "hist": 2.8,
                            "histDisplay": "2.8x hist",
                            "domainMax": 4,
                            "unit": "x",
                            "goodDirection": "up"
                          }
                        ]
                      },
                      {
                        "id": "embedded-attrition",
                        "value": 6,
                        "display": "$6M",
                        "yoy": -23,
                        "yoyDisplay": "-23% Y/Y",
                        "note": "No change w/w"
                      },
                      {
                        "id": "embedded-nnaov",
                        "value": 23.5,
                        "display": "$23.5M",
                        "yoy": 61,
                        "yoyDisplay": "+61% Y/Y",
                        "note": "No change w/w"
                      }
                    ]
                  }
                ],
                "axisNote": "Y/Y — the same growth axis as the product and segment tabs",
                "caption": "Attainment is measured against Product FinPlan; velocity and coverage are stated against their historical benchmark"
              },
              "semantic": {
                "metricName": "Q3 Outlook by Product and Measure",
                "definition": "Three commit measures for the in-flight quarter at motion grain — Current_Commit_clc, Attrition_Commit_clc and NNAOV_Commit_clc — with velocity and coverage stated against their historical benchmark.",
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
                "why": "Three measures, so the portlet claims none of them as its own. Two of its claims need correcting against the layer: there is no FinPlan object anywhere in it, so 87%, 78% and 128% have no governed denominator; and 'hist' is not the same day of the prior quarter but the average of the same fiscal quarter across the prior two years, which needs the relative-year window to reach PY-1 or every historical figure returns null. Velocity and coverage are real, governed and non-additive — which is why they are never rolled up the motion rail."
              },
              "directMode": {
                "tier": "red",
                "candidates": [
                  "87% of a plan version nobody named",
                  "78% or 91% or 64%, by vintage"
                ],
                "missing": "FinPlan itself and the mapping into it — plan targets live in the planning system at OU and product-family grain, are re-versioned at every reforecast, and no version of them reaches the semantic layer either, where the only governed targets are pipegen and Day-1 open pipe",
                "effect": "Every attainment loses its denominator, so the plan tracks have no target and no bands. Velocity and Coverage lose their benchmarks too, because a historical figure here is a governed same-day-of-quarter comparison against the prior period, not the prior period's closing number",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Report 128% of plan against the original FinPlan and 96% against the current one in the same week",
                "trustCost": "An attainment with no stated denominator is a ratio with an opinion in it",
                "metrics": {
                  "axisNote": "Y/Y on a stated scale — with no plan to read attainment against",
                  "caption": "No plan basis and no benchmark date — the values render, the comparisons do not"
                }
              }
            }
          ]
        },
        {
          "id": "outlook-rail",
          "layout": "outlook-deals",
          "portlets": [
            {
              "id": "outlook-deals",
              "kind": "dealRail",
              "label": "Q3 Top ACV Deals",
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
                "caption": "Ranked on one certified ACV definition"
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
                "tier": "yellow",
                "candidates": [
                  "five accounts, five amounts, no stated order"
                ],
                "missing": "One amount definition applied across the five — Amount, Tableau_Amount__c, Analytics_Amount__c and AmountConverted__c all coexist on Opportunity, and the gap between third and fifth place is smaller than the gap between those columns",
                "effect": "The list survives and the order does not. Two of the five change places depending on which column the query author reached for, and nothing in the rail shows that the ranking is the fragile part",
                "thesisTag": "T1",
                "thesis": "Metric definitions live in the analysis layer, not in raw data — a CRM can host competing candidate fields but cannot rule between them.",
                "risk": "Brief an exec on a top five that reorders between two people's versions of the same slide",
                "trustCost": "Ungoverned but usable — the tier where errors are quiet rather than loud",
                "metrics": {
                  "totalDisplay": "five deals, no stated order",
                  "caption": "Ranked on an undefined amount column — the list survives, the order does not"
                }
              }
            }
          ]
        }
      ],
      "navLabel": "Q3 Outlook"
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
              "sublabel": "Hover a driver to light the metrics it explains",
              "accent": "#2F5FA8",
              "metrics": {
                "drivers": [
                  {
                    "n": 1,
                    "title": "Product Transitions",
                    "affects": [
                      "trend-acv",
                      "trend-nnaov",
                      "trend-aov"
                    ]
                  },
                  {
                    "n": 2,
                    "title": "Sales Capacity &amp; Model",
                    "affects": [
                      "trend-ae-capacity",
                      "trend-ae-productivity"
                    ]
                  },
                  {
                    "n": 3,
                    "title": "Customer Confusion",
                    "affects": [
                      "trend-nnaov",
                      "trend-attrition"
                    ]
                  },
                  {
                    "n": 4,
                    "title": "Rapidly Evolving Competitive Landscape",
                    "affects": [
                      "trend-nnaov",
                      "trend-attrition",
                      "trend-acv"
                    ]
                  },
                  {
                    "n": 5,
                    "title": "Eroded Tableau motions: Partner, New Logo, Success",
                    "affects": [
                      "trend-nnaov",
                      "trend-attrition"
                    ]
                  },
                  {
                    "n": 6,
                    "title": "Accounting treatment: 5pt headwind in FY27",
                    "affects": [
                      "trend-revenue",
                      "trend-acv"
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
                "why": "The driver-to-measure mapping is what turns a list of causes into something checkable — hovering a driver lights exactly the metrics it claims. Three of the six reach at least one metric this layer has no measure for, and the mapping is what makes that visible rather than a claim that quietly passes."
              },
              "directMode": {
                "tier": "grey",
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
                "footnote": "AMER PACE AE count represents 69% of total Apps team, proportional to the FinPlan breakout."
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
                "tier": "yellow",
                "candidates": [
                  "745 as of today"
                ],
                "missing": "Point-in-time headcount per fiscal period end — the roster is weekly and current-state, in the semantic layer as much as outside it",
                "effect": "Closed years restate themselves every time the roster refreshes, so the five-year line is a series of todays wearing five different labels",
                "thesisTag": "T2",
                "thesis": "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
                "risk": "Read a five-year capacity trend that changes every time it is run",
                "trustCost": "Ungoverned but usable — the tier where errors are quiet rather than loud"
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
                "caption": "H1 annualizes to $400 K, below every full year shown"
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
                "tier": "red",
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
                "trustCost": "Derived measures inherit and multiply every upstream ambiguity"
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
                "caption": "Decline steepening: -3% to -10% across four years"
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
                "tier": "red",
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
                "trustCost": "Every downstream number that divides by ACV inherits the ambiguity"
              }
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
                "caption": "First improvement in five years: -8% Y/Y at H1"
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
                "tier": "grey",
                "candidates": [
                  "requires manual reconstruction per year"
                ],
                "missing": "A point-in-time contract book for each of five prior periods",
                "effect": "Five years each rebuilt by hand, so the trend partly measures how the method changed — and the two earliest are outside the certified history entirely, so only the hand-built version has them",
                "thesisTag": "T2",
                "thesis": "Time-aware context has to be mediated by a semantic layer — a system of record holds the present, not the comparison.",
                "risk": "Celebrate a -8% improvement that is a methodology artifact",
                "trustCost": "A trend line nobody can reproduce is not a trend line"
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
                "headlineNote": "FY27 H1 — a book balance, not a half-year flow",
                "caption": "Still growing, but growth halved every two years"
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
                "tier": "red",
                "candidates": [
                  "$3594M",
                  "$7188M if H1 is doubled"
                ],
                "missing": "Any source at all — this metric is excluded from both semantic models in writing, so the hand-built read is the only read there is",
                "effect": "H1 gets doubled to $7,188M by anyone treating this row like the ACV row above it, and with no governed measure behind it nothing can refuse the doubling",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Double a balance and report a book twice its real size",
                "trustCost": "The error looks exactly like the correct operation on the row above"
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
                "caption": "Down 97% from FY23 on an H1 run-rate basis"
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
                "tier": "red",
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
                "trustCost": "A confident wrong number costs more trust than a flagged unknown"
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
                    "body": "A flow accumulates across a period, so FY27 H1 is plotted detached and offered a run-rate ghost. A stock is a balance read at a point in time, so its H1 reading joins the line and is never annualised.",
                    "diagram": "flowStock"
                  },
                  {
                    "title": "Zero baseline",
                    "body": "Every value axis starts at zero. A padded baseline makes each decline look steeper, and at this size nobody would notice it had been truncated.",
                    "diagram": "zeroBaseline"
                  },
                  {
                    "title": "Polarity",
                    "body": "Direction of good comes from the measure. Attrition declares lower-is-better, so its falling H1 figure reads as the only good news on the tab without anyone recolouring a cell."
                  },
                  {
                    "title": "Colour threshold",
                    "body": "Movements inside ±10% render amber, beyond it red or green — one stated threshold rather than a per-cell judgement."
                  }
                ]
              },
              "semantic": {
                "metricName": "Presentation Rules",
                "definition": "The comparability, scaling, polarity and threshold rules the semantic layer applies to every measure on this tab.",
                "sdm": "Analytics Revenue SDM",
                "measure": null,
                "grain": "Applies to all measures on this tab",
                "lineage": [
                  "Semantic Model Definition"
                ],
                "rls": "Not scoped — rules apply to every viewer identically",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Jul 28, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Five Year Trend",
                "why": "These rules are the semantic layer doing its job. They are properties of the measures, so every chart, export and agent reading those measures inherits them — nobody has to remember to apply them, and nobody can quietly not."
              },
              "directMode": {
                "tier": "grey",
                "candidates": [
                  "rules live in each analyst's head"
                ],
                "missing": "Any place for a rule to live except the head of whoever built the chart",
                "effect": "Four rules that have to be remembered, re-explained and re-applied by every person and every agent that touches these numbers",
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
                "caption": "First decline in five years, with a 5pt FY27 accounting headwind"
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
                "tier": "yellow",
                "candidates": [
                  "$1726M H1",
                  "no note of the 5pt treatment change"
                ],
                "missing": "The documented FY27 accounting treatment change attached to the measure — and the measure, which neither semantic model carries",
                "effect": "The -5% reads as pure business decline, with the 5pt treatment headwind invisible",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Attribute an accounting change to sales execution",
                "trustCost": "Ungoverned but usable — the tier where errors are quiet rather than loud"
              }
            }
          ]
        }
      ],
      "navLabel": "Five Year"
    }
  ]
};
