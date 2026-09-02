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
    "generatedAt": "2026-09-01T09:00:00-07:00",
    "dataMode": "mock",
    "dataModeLabel": "Illustrative mock snapshot",
    "freshness": "Sep 1, 2026 · 9:00 AM PT",
    "scope": "Analytics BU · RLS-scoped to viewer hierarchy",
    "note": "Illustrative figures. Every portlet carries an authored semantic block and a directMode block so the same content can be read as governed or as ungoverned without authoring it twice.",
    "sdm": "Analytics Revenue SDM",
    "certifiedBy": "Analytics RevOps"
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
              "kind": "gauge",
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
                "metricName": "Net New Annual Order Value",
                "definition": "ACV booked on net-new-logo closed-won opportunities, excluding expansion and renewal, at fiscal-quarter grain.",
                "sdm": "Analytics Revenue SDM",
                "measure": "NNAOV (certified)",
                "grain": "Fiscal quarter × Business unit",
                "lineage": [
                  "Org62 Opportunity",
                  "Org62 Account",
                  "FinPlan FY27 Target"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Exec Review",
                "why": "Net-new is the one measure that cannot be reconstructed from opportunity records alone — it depends on a governed first-purchase test against account history."
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
              "kind": "gauge",
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
                "definition": "Annualized contract value on closed-won opportunities, normalized to a 12-month term, net of ramp and multi-year discounting.",
                "sdm": "Analytics Revenue SDM",
                "measure": "ACV (certified)",
                "grain": "Fiscal quarter × Business unit × Product motion",
                "lineage": [
                  "Org62 Opportunity",
                  "Product SKU Taxonomy",
                  "FinPlan FY27 Target"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Exec Review",
                "why": "This is the same certified ACV measure the Five Year Trend tab resolves against — which is why the two tabs reconcile rather than merely look similar."
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
              "kind": "gauge",
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
                "definition": "ACV lost to non-renewal and downsell in the period, measured against the prior-period contract book. Lower is better; the certified measure carries that polarity.",
                "sdm": "Analytics Revenue SDM",
                "measure": "Attrition ACV (certified)",
                "grain": "Fiscal quarter × Business unit",
                "lineage": [
                  "Org62 Contract",
                  "Revenue Recognition Ledger",
                  "FinPlan FY27 Target"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Exec Review",
                "why": "Polarity is part of the certified definition. Because the measure declares lower-is-better, 104% of plan renders as over-plan churn automatically — nobody has to remember to color that cell differently by hand.",
                "polarityNote": "Slide-level color coding is applied by the deck author. Here the direction of good comes from the measure itself, so -12% Y/Y reads positive and 104% of plan reads as a miss."
              },
              "directMode": {
                "tier": "grey",
                "candidates": [
                  "requires manual reconstruction"
                ],
                "missing": "A point-in-time contract book — Org62 stores current contract state, not the prior-period snapshot attrition is measured against",
                "effect": "Attrition has to be rebuilt by hand from history objects each quarter, and the polarity is whatever the deck author decides to color it",
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
              "kind": "gauge",
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
                "definition": "ACV of opportunities that entered a qualified stage during the period, counted at first qualification and never recounted on later stage moves.",
                "sdm": "Analytics Revenue SDM",
                "measure": "Pipeline Generation (certified)",
                "grain": "Fiscal quarter × Business unit × Source",
                "lineage": [
                  "Org62 Opportunity",
                  "Org62 Opportunity History",
                  "FinPlan FY27 Target"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Exec Review",
                "why": "The never-recount rule is the whole measure. Without it, an opportunity that moves backward and forward through qualification inflates pipegen every time it crosses the line."
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
                    "color": "#12806A"
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
                    "color": "#2F5FA8"
                  }
                ],
                "insight": "Embedded is now <strong>29% of Q2 ACV</strong>, up from 14% a year ago — but it is taking share of a base that shrank 28%. The mix is rotating faster than the total is falling.",
                "caption": "$82M total · Embedded share 29%"
              },
              "semantic": {
                "metricName": "ACV by Product Motion",
                "definition": "Certified ACV split by the product-motion grouping that maps every SKU to exactly one of Embedded or Agentic.",
                "sdm": "Analytics Revenue SDM",
                "measure": "ACV (certified)",
                "grain": "Fiscal quarter × Product motion",
                "lineage": [
                  "Org62 Opportunity",
                  "Product SKU Taxonomy"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Exec Review",
                "why": "The split adds to the same certified $82M as the ACV tile above because both resolve to one measure. The mix insight only exists because the SKU-to-motion mapping is governed rather than re-derived per deck."
              },
              "directMode": {
                "tier": "red",
                "candidates": [
                  "no product-motion grouping exists"
                ],
                "missing": "The SKU-to-motion taxonomy — Org62 stores product codes, not the Embedded / Agentic grouping the business reasons in",
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
                "definition": "Count of quota-carrying account executives active on the last day of the period, excluding open requisitions and leaves.",
                "sdm": "Analytics Revenue SDM",
                "measure": "AE Capacity (certified)",
                "grain": "Fiscal period end × Business unit",
                "lineage": [
                  "Workday Headcount",
                  "Org62 User"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Exec Review",
                "why": "Capacity is a stock measured at a point in time, not a flow accumulated across one. The semantic layer carries that distinction, which is what stops it being averaged or annualized downstream."
              },
              "directMode": {
                "tier": "yellow",
                "candidates": [
                  "745 as of today",
                  "no as-of-quarter-end value"
                ],
                "missing": "Point-in-time headcount — the join between Workday and Org62 users resolves as-of-today, not as-of-period-end",
                "effect": "Every historical quarter silently restates itself as people join and leave",
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
                "sdm": "Analytics Revenue SDM",
                "measure": null,
                "grain": "Fiscal quarter × Business unit",
                "lineage": [
                  "Exec Review Narrative",
                  "Org62 Opportunity"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics BU Chief of Staff",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Exec Review",
                "why": "Each claim carries a link to the certified measure it is supposed to move, so a qualitative win can be checked against a governed number instead of standing on its own."
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
                "sdm": "Analytics Revenue SDM",
                "measure": null,
                "grain": "Fiscal half × Business unit",
                "lineage": [
                  "Exec Review Narrative",
                  "FinPlan FY27 Target"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics BU Chief of Staff",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Exec Review",
                "why": "A commitment tagged to a governed measure can be reviewed next quarter against that same measure. An untagged commitment can only be reviewed against memory."
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
                "definition": "Certified ACV for the fiscal quarter at account grain, paired with the same measure for the same quarter a year earlier on a conformed account identity, so each account's movement is a comparison of one definition against itself.",
                "sdm": "Analytics Revenue SDM",
                "measure": "ACV (certified)",
                "grain": "Fiscal quarter × Account",
                "lineage": [
                  "Org62 Opportunity",
                  "Org62 Account",
                  "Account Hierarchy Conformance",
                  "Product SKU Taxonomy"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch, and account-grain rows are the most tightly scoped rows on the board",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Exec Review",
                "why": "This is the same certified ACV measure as the tile and the mix bar above it, one grain finer. That is the whole claim: 278 account rows sum to the certified $82M, the 18 net-new rows sum to the certified $6M, and the two motion groups sum to the certified $24M and $58M. Detail that reconciles to the total is what a semantic layer is for — the fan is only drawable because the roll-up is guaranteed rather than checked by hand afterwards."
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
                "definition": "Leadership-authored causes for the five-year trajectory, each mapped to the certified measures it is claimed to explain.",
                "sdm": "Analytics Revenue SDM",
                "measure": null,
                "grain": "Fiscal year × Business unit",
                "lineage": [
                  "Exec Review Narrative"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics BU Chief of Staff",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Five Year Trend",
                "why": "The driver-to-measure mapping is what turns a list of causes into something checkable. Hovering a driver lights exactly the metrics it claims, so an unsupported claim is visible as an empty highlight."
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
                "definition": "Count of quota-carrying account executives active on the last day of the fiscal period.",
                "sdm": "Analytics Revenue SDM",
                "measure": "AE Capacity (certified)",
                "grain": "Fiscal period end × Business unit",
                "lineage": [
                  "Workday Headcount",
                  "Org62 User",
                  "Fiscal Calendar"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Five Year Trend",
                "why": "Capacity is a stock, so the semantic layer refuses to annualize it. 745 heads at H1 is 745 heads — doubling it would be meaningless, and the measure knows that."
              },
              "directMode": {
                "tier": "yellow",
                "candidates": [
                  "745 as of today"
                ],
                "missing": "Point-in-time headcount per fiscal period end",
                "effect": "Closed years restate themselves as the Workday join resolves to today",
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
                "definition": "Certified ACV divided by certified AE Capacity for the same fiscal period and business unit.",
                "sdm": "Analytics Revenue SDM",
                "measure": "AE Productivity (derived)",
                "derivedFrom": [
                  "ACV (certified)",
                  "AE Capacity (certified)"
                ],
                "grain": "Fiscal year × Business unit",
                "lineage": [
                  "Org62 Opportunity",
                  "Workday Headcount",
                  "Fiscal Calendar"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Five Year Trend",
                "why": "A derived measure is only as governed as its inputs. Because both ACV and AE Capacity are certified at the same grain, this ratio reconciles with the ACV and Capacity panels rather than drifting from them."
              },
              "directMode": {
                "tier": "red",
                "candidates": [
                  "$200K",
                  "$268K",
                  "$181K"
                ],
                "missing": "Both inputs at a matching grain — an ambiguous ACV numerator divided by an as-of-today capacity denominator",
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
                "definition": "Annualized contract value on closed-won opportunities, normalized to a 12-month term, net of ramp and multi-year discounting.",
                "sdm": "Analytics Revenue SDM",
                "measure": "ACV (certified)",
                "grain": "Fiscal year × Business unit",
                "lineage": [
                  "Org62 Opportunity",
                  "Product SKU Taxonomy",
                  "Fiscal Calendar"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Five Year Trend",
                "why": "Same certified measure as the ACV tile on the Exec Summary tab, at a different grain. That is why the two tabs reconcile — turn on the knowledge graph to see the link."
              },
              "directMode": {
                "tier": "red",
                "candidates": [
                  "$496M",
                  "$580M",
                  "$447M"
                ],
                "missing": "A governed ACV formula — four competing Amount columns on Opportunity with no defined winner",
                "effect": "A five-year trajectory whose slope depends on which Amount column each year was built from",
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
                "definition": "ACV lost to non-renewal and downsell in the period, measured against the prior-period contract book. Lower is better; the certified measure carries that polarity.",
                "sdm": "Analytics Revenue SDM",
                "measure": "Attrition ACV (certified)",
                "grain": "Fiscal year × Business unit",
                "lineage": [
                  "Org62 Contract",
                  "Revenue Recognition Ledger",
                  "Fiscal Calendar"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Five Year Trend",
                "why": "Because the measure declares lower-is-better, the -8% at H1 renders as the only green reading on this panel automatically — the polarity is not a color choice made in the deck."
              },
              "directMode": {
                "tier": "grey",
                "candidates": [
                  "requires manual reconstruction per year"
                ],
                "missing": "A point-in-time contract book for each of five prior periods",
                "effect": "Five years each rebuilt by hand, so the trend partly measures how the method changed",
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
                "definition": "Total annualized value of the active order book at period end. A balance, not an accumulation.",
                "sdm": "Analytics Revenue SDM",
                "measure": "AOV (certified)",
                "grain": "Fiscal period end × Business unit",
                "lineage": [
                  "Revenue Recognition Ledger",
                  "Org62 Contract",
                  "Fiscal Calendar"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Five Year Trend",
                "why": "AOV is a stock. The measure declares that, so nothing downstream offers to annualize the H1 figure — the run-rate ghost that appears on flow panels is deliberately absent here."
              },
              "directMode": {
                "tier": "red",
                "candidates": [
                  "$3594M",
                  "$7188M if H1 is doubled"
                ],
                "missing": "The stock-versus-flow declaration — nothing stops a half-year book balance being annualized like a flow",
                "effect": "H1 gets doubled to $7,188M by anyone treating this row like the ACV row above it",
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
                "metricName": "Net New Annual Order Value",
                "definition": "Order value booked on net-new-logo accounts, excluding expansion and renewal, at fiscal-year grain.",
                "sdm": "Analytics Revenue SDM",
                "measure": "NNAOV (certified)",
                "grain": "Fiscal year × Business unit",
                "lineage": [
                  "Org62 Opportunity",
                  "Org62 Account",
                  "Fiscal Calendar"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Five Year Trend",
                "why": "Same certified measure as the NNAOV tile on the Exec Summary tab. The quarter figure and the five-year figure resolve against one definition, so the two tabs cannot disagree."
              },
              "directMode": {
                "tier": "red",
                "candidates": [
                  "$166M",
                  "$310M",
                  "$122M"
                ],
                "missing": "A governed net-new-logo test across five years of account history",
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
                    "body": "A flow accumulates across a period, so FY27 H1 is plotted detached and offered a run-rate ghost. A stock is a balance read at a point in time, so its H1 reading joins the line and is never annualised."
                  },
                  {
                    "title": "Zero baseline",
                    "body": "Every value axis starts at zero. A padded baseline makes each decline look steeper, and at this size nobody would notice it had been truncated."
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
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
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
                "definition": "Revenue recognized in the fiscal period per the revenue recognition ledger, mapped to the fiscal calendar.",
                "sdm": "Analytics Revenue SDM",
                "measure": "Revenue (certified)",
                "grain": "Fiscal year × Business unit",
                "lineage": [
                  "Revenue Recognition Ledger",
                  "Fiscal Calendar"
                ],
                "rls": "Analytics BU hierarchy — viewer sees only their branch",
                "certifiedBy": "Analytics RevOps",
                "freshness": "Sep 1, 2026 · 9:00 AM PT",
                "dashboard": "Analytics Five Year Trend",
                "why": "The FY27 accounting treatment change is carried in the measure as a documented 5pt headwind, so the -5% is read against a stated basis rather than compared naively to prior years."
              },
              "directMode": {
                "tier": "yellow",
                "candidates": [
                  "$1726M H1",
                  "no note of the 5pt treatment change"
                ],
                "missing": "The documented FY27 accounting treatment change attached to the measure",
                "effect": "The -5% reads as pure business decline, with the 5pt treatment headwind invisible",
                "thesisTag": "T3",
                "thesis": "Business rules that shape a measure are the measure — leaving them in query code means every author reimplements them slightly differently.",
                "risk": "Attribute an accounting change to sales execution",
                "trustCost": "Ungoverned but usable — the tier where errors are quiet rather than loud"
              }
            }
          ]
        }
      ]
    }
  ]
};
