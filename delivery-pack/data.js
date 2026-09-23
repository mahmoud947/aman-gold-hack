// Single source of truth for the delivery pack (workbook, Jira CSV, design canvas numbers).
// EVIDENCE RULES: timestamps come from file-system times on this machine; test results are only what was actually executed
// (scripted browser checks by Claude, not a human QA team). Anything not executed is marked "Not executed".

const P1 = "Sprint 1 (20-21 Sep 2026): Business Case Lab";
const P2 = "Sprint 2 (21-22 Sep 2026): Customer Prototype";

// ---------------- Timeline / effort ----------------
const timeline = [
  ["Business case: research + first build", "2026-09-20 21:34", "2026-09-20 22:17", "0h 43m", "Core Lab source written in bursts (types, research data, model, 5 agents, debate, report). 30 files, ~1,600 lines.", "File creation times"],
  ["Business case: PM changes applied (prepaid card, CAC 10, in-house)", "2026-09-21 17:01", "2026-09-21 17:02", "not measurable", "Model, agents, risks and decision logic re-wired after each PM update. File times only show the last edits (17:01-17:02); the start of these rounds cannot be read from the file system.", "File modified times"],
  ["Prototype: Phase 1 discovery (assumptions, conflicts, MVP scope)", "2026-09-21 ~22:00", "2026-09-21 22:39", "n/a", "Analysis + 4 decisions from PM. No code.", "Conversation"],
  ["Prototype: core code generation (config, services, 10 screens)", "2026-09-21 22:39", "2026-09-21 22:47", "0h 8m", "Foundations + all screens + first 3 docs created in one burst. ~1,850 lines total by the end of the project.", "File creation times"],
  ["Prototype: first verification + CR-01/02 (real price, 0.1 g step)", "2026-09-21 22:47", "2026-09-21 23:34", "0h 47m", "Scripted browser run of onboarding, buy, sell, edge cases; then price anchor and 0.1 g step changes.", "File modified times"],
  ["Waiting for PM feedback (screenshots)", "2026-09-21 23:34", "2026-09-22 01:59", "2h 25m", "No code changes. Idle from the build's point of view.", "File modified times"],
  ["Defect cycle: duplicate orders / balance drift (DEF-01..03) + palette (CR-03)", "2026-09-22 01:59", "2026-09-22 02:13", "0h 14m", "Reproduced (1 buy became 3), root-caused, store rewritten, re-tested; palette applied.", "File modified times"],
  ["CR-04/05/06/07 Portfolio + Daily P&L + real-price ledger", "2026-09-22 02:13", "2026-09-22 02:39", "0h 26m", "Calendar, cumulative chart, real Sept price data, DST defect found and fixed.", "File modified times"],
  ["CR-10 New-customer onboarding: code + scripted tests", "2026-09-22 03:12", "2026-09-22 03:14", "2 min 17 s", "Scenario control, 10-step OnboardingNew flow, gating, prepaid card + top-up; scripted browser walk of all 10 steps, first buy, profile and two regressions (11 test cases run).", "Command timestamps"],
  ["CR-10 docs, tickets, test cases, design frames and workbook", "2026-09-22 03:14", "2026-09-22 03:17", "2 min 43 s", "PRD and flow doc updated, story AG-21 + 5 tasks, QA-7, TC-060..073, CR-10, branch diagram + 8 canvas frames.", "Command timestamps"],
  ["CR-08/09 P&L card clarified then removed", "2026-09-22 02:39", "2026-09-22 02:50", "0h 11m", "Two small UI edits and re-verification.", "File modified times"],
];

const effort = [
  // phase, wall-clock (real), files, lines, human-equivalent ESTIMATE (not measured)
  ["Business Case Lab", "20 Sep 21:34 to 21 Sep 17:02 (19h 28m elapsed, mostly waiting for answers); initial code took 43 min, later update rounds are not separately measurable", 30, 1600, "ESTIMATE: 60-90 person-hours (finance model, 5 agents, research, report)"],
  ["Customer Prototype (incl. docs)", "21 Sep 22:39 to 22 Sep 02:50 (4h 11m elapsed; ~2h 25m of it waiting for PM)", 36, 1846, "ESTIMATE: 80-120 person-hours (design, 10+ screens, engine, QA)"],
  ["CR-10 New-customer onboarding (total)", "2026-09-22 03:17", 1, 156, "ESTIMATE: 12-20 person-hours for design, build, tests and documentation"],
  ["Debugging and fixing", "About 14 min for DEF-01..03 plus ~25 min inside the P&L work for the daylight-saving defect; ~40 min total", 0, 0, "ESTIMATE: 6-10 person-hours incl. reproduction and regression"],
];

// ---------------- Sprint backlog (retrospective) ----------------
// [type, id, parent, summary, acceptance / detail, points(ESTIMATE), status, sprint, component]
const backlog = [
  ["Epic", "AG-E1", "", "Business Case Lab (internal decision tool)", "Multi-agent, evidence-based business case for Aman Gold", "", "Done", P1, "Business case"],
  ["Story", "AG-1", "AG-E1", "As a PM I enter inputs with value, unit, source, type and confidence", "Types ACTUAL/EXTERNAL FACT/BENCHMARK/ASSUMPTION/ESTIMATE/UNKNOWN; blank = UNKNOWN; never upgraded", 5, "Done", P1, "Lab"],
  ["Task", "AG-1.1", "AG-1", "Define data types and input schema", "types.ts", 1, "Done", P1, "Lab"],
  ["Task", "AG-1.2", "AG-1", "Load PM figures as inputs (customers, funnel, pricing, costs)", "assumptions.ts", 2, "Done", P1, "Lab"],
  ["Task", "AG-1.3", "AG-1", "Inputs panel UI (edit value, type, confidence, source)", "InputsPanel.tsx", 2, "Done", P1, "Lab"],
  ["Story", "AG-2", "AG-E1", "As CFO I see revenue, cost, unit economics, scenarios, stress tests, break-even", "Formulas traceable to inputs; UNKNOWN never invented", 8, "Done", P1, "Lab"],
  ["Task", "AG-2.1", "AG-2", "36-month monthly financial model", "financial-model.ts", 3, "Done", P1, "Lab"],
  ["Task", "AG-2.2", "AG-2", "Conservative / Base / Aggressive scenarios", "", 1, "Done", P1, "Lab"],
  ["Task", "AG-2.3", "AG-2", "9 stress tests + sensitivity tornado + break-even solver", "", 3, "Done", P1, "Lab"],
  ["Task", "AG-2.4", "AG-2", "Number traceability (click a KPI to see inputs and type)", "Weakest data type wins", 1, "Done", P1, "Lab"],
  ["Story", "AG-3", "AG-E1", "As R&D I have sourced market and competitor facts", "Every external claim has a source; unknown stays unknown", 5, "Done", P1, "Lab"],
  ["Task", "AG-3.1", "AG-3", "Web research (Egypt gold demand, FRA statement, Thndr/mngm/Goldady, CAC benchmark, FX)", "11 sources registered", 3, "Done", P1, "Research"],
  ["Task", "AG-3.2", "AG-3", "Competitor table, gap analysis, sources registry", "", 2, "Done", P1, "Research"],
  ["Story", "AG-4", "AG-E1", "As management I see five agents debate in 7 rounds and reach an evidence-based decision", "CEO/CFO/CMO/R&D/Risk; positions can change; decision is a gate, not an average", 13, "Done", P1, "Lab"],
  ["Task", "AG-4.1", "AG-4", "Five agent modules (deterministic, labelled DEMO AI AGENT)", "", 5, "Done", P1, "Lab"],
  ["Task", "AG-4.2", "AG-4", "Debate engine rounds 1-7, consensus, decision matrix, risk register", "", 5, "Done", P1, "Lab"],
  ["Task", "AG-4.3", "AG-4", "Validation plan (6 experiments) and 14-page management report", "", 3, "Done", P1, "Lab"],
  ["Story", "AG-5", "AG-E1", "As PM I re-run the case when assumptions change (prepaid card, CAC, in-house team)", "Agents and decision react; no stale text", 5, "Done", P1, "Lab"],
  ["Task", "AG-5.1", "AG-5", "Apply CR-BC-01..05 to inputs, model, risks, agents", "", 3, "Done", P1, "Lab"],
  ["Task", "AG-5.2", "AG-5", "Remove hardcoded text that went stale", "Fix for DEF-09", 2, "Done", P1, "Lab"],

  ["Epic", "AG-E2", "", "Product definition", "Discovery, decisions and documents", "", "Done", P2, "Product"],
  ["Story", "AG-6", "AG-E2", "As PM I get a Phase 1 discovery: assumptions, conflicts, MVP scope", "Conflicts C1-C9 listed; 4 decisions confirmed by PM", 3, "Done", P2, "Product"],
  ["Story", "AG-7", "AG-E2", "As a team we have a PRD, flows, architecture, assumptions/compliance/risk/roadmap", "docs/01-04 (.md)", 5, "Done", P2, "Product"],

  ["Epic", "AG-E3", "", "Design", "Customer experience and flow", "", "Done", P2, "Design"],
  ["Story", "AG-8", "AG-E3", "As a designer I have a clickable screen flow board", "Claude Design canvas (Figma file not created)", 3, "Done", P2, "Design"],
  ["Story", "AG-9", "AG-E3", "As a brand owner the prototype uses the Aman palette", "Gradient #04768D to #64C2D3 (CR-03)", 1, "Done", P2, "Design"],

  ["Epic", "AG-E4", "", "Aman Gold customer prototype", "Clickable mobile prototype, demo data", "", "Done", P2, "Prototype"],
  ["Story", "AG-10", "AG-E4", "Foundations: config, pricing service, engine, store, seed", "No business values in UI; ledger is the single source of truth", 8, "Done", P2, "Prototype"],
  ["Task", "AG-10.1", "AG-10", "product.ts config (spread, fee, limits, quote validity, funding)", "", 1, "Done", P2, "Prototype"],
  ["Task", "AG-10.2", "AG-10", "Pricing service (getCurrentGoldPrice, getHistoricalGoldPrices, buy/sell)", "Replaceable by provider API", 2, "Done", P2, "Prototype"],
  ["Task", "AG-10.3", "AG-10", "Transaction engine: quotes, validation, average-cost wallet, cash", "", 3, "Done", P2, "Prototype"],
  ["Task", "AG-10.4", "AG-10", "Atomic store with busy lock and derived balances", "Fix for DEF-01..03", 2, "Done", P2, "Prototype"],
  ["Story", "AG-11", "AG-E4", "Discover and onboard (Home entry, landing, 7-step onboarding)", "Account check reuses data; KYC checklist configurable", 8, "Done", P2, "Prototype"],
  ["Story", "AG-12", "AG-E4", "See portfolio value, holdings, price and chart (1D-1Y)", "Chart from pricing service; real daily prices 22 Aug-21 Sep 2026", 5, "Done", P2, "Prototype"],
  ["Story", "AG-13", "AG-E4", "Buy gold in 0.1 g steps (by grams or EGP) with price lock and PIN", "Success shows ID and before/after balances", 8, "Done", P2, "Prototype"],
  ["Story", "AG-14", "AG-E4", "Sell gold (by grams or EGP), proceeds to prepaid balance", "", 5, "Done", P2, "Prototype"],
  ["Story", "AG-15", "AG-E4", "Portfolio: allocation donut, today's realized P&L, unrealized P&L, cumulative P&L chart", "CR-04/06/09", 5, "Done", P2, "Prototype"],
  ["Story", "AG-16", "AG-E4", "Daily P&L calendar (realized only, today live)", "CR-04/07", 5, "Done", P2, "Prototype"],
  ["Story", "AG-17", "AG-E4", "Transactions list and detail with before/after cash and gold", "", 3, "Done", P2, "Prototype"],
  ["Story", "AG-18", "AG-E4", "Profile, documents, FAQ, support", "", 2, "Done", P2, "Prototype"],
  ["Story", "AG-19", "AG-E4", "Edge cases and prototype controls (7 states)", "Insufficient balance/gold, price changed, failed tx, provider down, KYC incomplete, volatility", 3, "Done", P2, "Prototype"],
  ["Story", "AG-21", "AG-E4", "New-customer onboarding: capture everything when nothing is on file", "10 steps: mobile, code, PIN, personal details, ID, selfie, prepaid card + InstaPay top-up, agreements, done. Demo validations only. Scenario control switches between customer types (CR-10)", 5, "Done", P2, "Prototype"],
  ["Task", "AG-21.1", "AG-21", "Scenario control: existing Aman customer / brand-new customer / existing investor", "store mode brandNew, PhoneShell controls", 1, "Done", P2, "Prototype"],
  ["Task", "AG-21.2", "AG-21", "OnboardingNew flow with step gating and 'fill demo data'", "OnboardingNew.tsx", 3, "Done", P2, "Prototype"],
  ["Task", "AG-21.3", "AG-21", "Prepaid card issue and first top-up; opening balance from the top-up", "Brand-new customer starts with EGP 0", 1, "Done", P2, "Prototype"],
  ["Task", "AG-21.4", "AG-21", "Design: branch diagram + 8 new-customer frames on the flow board", "Claude Design canvas", 2, "Done", P2, "Design"],
  ["Task", "AG-21.5", "AG-21", "Update PRD, flow doc, tickets, test cases and change log", "", 1, "Done", P2, "Product"],
  ["Story", "AG-20", "AG-E4", "Realistic demo ledger on real Egypt prices with win/loss days", "20 transactions, +EGP 307.89 realized in Sep (7 winning / 4 losing days)", 3, "Done", P2, "Prototype"],
];

// ---------------- QA backlog (NEW for the testing team) ----------------
const qa = [
  ["Epic", "QA-E1", "", "Aman Gold prototype: quality assurance", "Independent QA of the prototype and the business-case lab", "", "To do", "Sprint 3 (proposed)", "QA"],
  ["Story", "QA-1", "QA-E1", "As QA I execute all 'Not executed' test cases and record results", "All TC rows with result 'Not executed' run by a human on Chrome desktop", 5, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-1.1", "QA-1", "Run edge-case toggles: provider unavailable, KYC incomplete, fail next transaction, volatility banner", "TC-035..038", 2, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-1.2", "QA-1", "Run top-up via InstaPay sheet and quote-expiry (wait 30 s) flows", "TC-031b, TC-034", 1, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-1.3", "QA-1", "Run transaction detail, profile/FAQ, hide-balance, bars view, reload persistence", "TC-049..054", 2, "To do", "Sprint 3 (proposed)", "QA"],
  ["Story", "QA-2", "QA-E1", "As QA I verify ledger integrity under stress", "No duplicate IDs, cash and gold always equal a recomputation from the ledger", 5, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-2.1", "QA-2", "Rapid-tap and double-click tests on every confirm and PIN control", "Regression for DEF-01", 2, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-2.2", "QA-2", "Randomized buy/sell sequences (100+) compared with an independent calculator", "Average cost, realized, unrealized, cash", 3, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-2.3", "QA-2", "Boundary tests: 0.1 g, 0.0 g, max order, daily limit, sell everything", "", 2, "To do", "Sprint 3 (proposed)", "QA"],
  ["Story", "QA-3", "QA-E1", "As QA I validate P&L calendar and charts", "Calendar, cumulative chart and portfolio agree at all times, incl. month and daylight-saving boundaries", 3, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-3.1", "QA-3", "Test months boundaries (Oct 2025 to Sep 2026) and daylight-saving change dates", "Regression for DEF-04", 2, "To do", "Sprint 3 (proposed)", "QA"],
  ["Story", "QA-4", "QA-E1", "As QA I check UI on phone sizes, browsers and accessibility", "iPhone 390 px, Android 360 px, Chrome/Safari/Edge, keyboard and contrast", 5, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-4.1", "QA-4", "Visual comparison with Aman Home and the palette", "", 2, "To do", "Sprint 3 (proposed)", "QA"],
  ["Story", "QA-5", "QA-E1", "As QA I verify data accuracy and labelling", "Real daily prices match source; DEMO labels present; no assumption shown as fact", 3, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-5.1", "QA-5", "Cross-check 31 daily prices against the source table and a second site", "", 1, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-5.2", "QA-5", "Check every business-case number can be traced to an input and type", "Traceability modal", 2, "To do", "Sprint 3 (proposed)", "QA"],
  ["Story", "QA-7", "QA-E1", "As QA I verify new-customer onboarding validations and recovery", "Every field validation, back navigation and refresh behaviour, plus scenario switching", 5, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-7.1", "QA-7", "Field validation edge cases: short mobile, 13-digit ID, wrong DOB format, short address, mismatched PIN", "TC-071", 2, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-7.2", "QA-7", "Back navigation keeps typed values; refresh mid-flow behaviour agreed with Product", "TC-072", 2, "To do", "Sprint 3 (proposed)", "QA"],
  ["Task", "QA-7.3", "QA-7", "Skip top-up, then attempt a buy (insufficient balance path)", "TC-073", 1, "To do", "Sprint 3 (proposed)", "QA"],
  ["Story", "QA-6", "QA-E1", "As QA I test the Business Case Lab what-if sliders and report generation", "Sliders recompute; 14-page report locks inputs", 3, "To do", "Sprint 3 (proposed)", "QA"],
];

// ---------------- Test cases ----------------
// result: Pass | Fail -> Fixed | Not executed
const M = "Scripted browser check (Claude), DOM text assertions";
const tc = [
  // Business Case Lab
  ["TC-001", "Lab", "Default inputs load with value, unit, source, type", "Open Lab", "Read Inputs tab", "39 inputs each with type and confidence", "Inputs rendered with types", "Pass", M, "", ""],
  ["TC-002", "Lab", "Funnel math (30% x 20% x 10% of 360K MAU)", "Default inputs", "Run model", "2,160 first buyers", "2,160 buyers", "Pass", "Node run of the model", "", ""],
  ["TC-003", "Lab", "Negative unit margin when gateway 1% and spread 0.5%", "Original inputs", "Read unit economics", "-0.50% per EGP", "-0.50%", "Pass", "Node run + UI", "", ""],
  ["TC-004", "Lab", "Aggressive scenario loses more than Base at negative margin", "Original inputs", "Compare scenarios", "Aggressive net < Base net", "-42.7M vs -40.9M", "Pass", "Node run", "", ""],
  ["TC-005", "Lab", "Model after PM changes (gateway 0, CAC 10)", "Updated inputs", "Read dashboard and decision", "Margin +0.5%, LTV/CAC 6.5, payback ~2 months, PROCEED WITH CONDITIONS", "+0.50%, 6.5, 2.1 months, PROCEED WITH CONDITIONS", "Pass", M, "", "CR-BC-01/03"],
  ["TC-006", "Lab", "Stress tests after PM changes", "Updated inputs", "Read stress table", "Viability shown per shock", "9 of 9 viable, tiny absolute values", "Pass", M, "", ""],
  ["TC-007", "Lab", "UNKNOWN inputs are excluded, not invented", "Buy/sell ratio blank", "Run model", "Sell side excluded and flagged", "Excluded and listed as UNKNOWN", "Pass", M, "", ""],
  ["TC-008", "Lab", "Click a KPI to trace it (modal)", "Open Lab", "Click Revenue tile", "Modal with inputs and weakest type", "Tile type label seen; modal not opened", "Not executed", "-", "", ""],
  ["TC-009", "Lab", "Generate Management Business Case", "Open Lab", "Click generate", "12 steps, inputs locked, 14 pages", "15 page blocks incl. cover; last page = decision", "Pass", M, "", ""],
  ["TC-010", "Lab", "No console errors on load and tab switching", "Open Lab", "Switch all tabs", "No errors", "No errors", "Pass", "Browser console read", "", ""],
  ["TC-011", "Lab", "Seven debate rounds render", "Open Agents tab", "Count round sections", "Rounds 1-7 present", "All rounds and 6 tables present", "Pass", M, "", ""],
  ["TC-012", "Lab", "Agents revise positions in round 7", "Updated inputs", "Read round 7", "At least one agent changes", "CEO changed to VALIDATE FURTHER (original inputs)", "Pass", M, "", ""],
  ["TC-013", "Lab", "What-if sliders recompute all outputs", "Open Financial tab", "Move sliders", "Outputs update instantly", "Not exercised", "Not executed", "-", "", ""],
  ["TC-014", "Lab", "Revenue type label is correct", "Default inputs", "Read dashboard type", "Weakest input type (ESTIMATE)", "Showed UNKNOWN", "Fail -> Fixed", M, "DEF-08", ""],
  ["TC-015", "Lab", "Agent text follows input changes", "Change inputs", "Read agent text", "No stale numbers or claims", "Stale hardcoded text found in several places", "Fail -> Fixed", M, "DEF-09", ""],
  // Prototype: discovery and onboarding
  ["TC-020", "Prototype", "Home shows Gold strip and tile with price", "Open app", "Read Home", "Gold strip, tile, price per gram", "Present, price EGP 7,224", "Pass", M, "", ""],
  ["TC-021", "Prototype", "Landing shows price, chart, buy/sell, fees, risk", "New customer", "Open Gold tile", "All blocks visible", "All present", "Pass", M, "", ""],
  ["TC-022", "Prototype", "Onboarding 7 steps to Done", "New customer", "Walk all steps, any 4-digit OTP, tick agreement", "Reaches dashboard", "Reached dashboard, empty state", "Pass", M, "", ""],
  ["TC-023", "Prototype", "Empty dashboard for new customer", "After onboarding", "Read dashboard", "EGP 0, 0.0 g, Sell disabled", "As expected", "Pass", M, "", ""],
  // Buy / sell
  ["TC-024", "Prototype", "Buy by EGP rounds down to 0.1 g step", "Buy screen", "Enter EGP 2,000", "0.2 g for EGP 1,451.82, remainder shown", "0.2 g, EGP 548.18 stays in balance", "Pass", M, "", "CR-02"],
  ["TC-025", "Prototype", "Buy by grams: 0.25 g invalid, 0.5 g valid", "Buy screen", "Enter 0.25 then use chip 0.5", "Step error; then summary", "Error shown; summary shown", "Pass", M, "", "CR-02"],
  ["TC-026", "Prototype", "Below minimum blocked", "Buy screen", "EGP 500 by EGP", "'The minimum is 0.1 g.'", "Message shown", "Pass", M, "", "CR-02"],
  ["TC-027", "Prototype", "Order summary content", "Buy 0.5 g", "Review order", "Qty, price, investment, fee 0, total, method, 30 s lock", "All shown", "Pass", M, "", ""],
  ["TC-028", "Prototype", "PIN, processing, success with ID", "Order summary", "Confirm, enter 1234", "Success with transaction ID", "GOLD-000124 shown", "Pass", M, "", ""],
  ["TC-029", "Prototype", "Success shows before/after gold and cash", "After buy", "Read success", "Balances consistent", "Consistent", "Pass", M, "", ""],
  ["TC-030", "Prototype", "Sell by grams/EGP with percent chips and 'credited to balance'", "Holding gold", "Sell 50% / 100%", "Summary and success show proceeds credited", "As expected", "Pass", M, "", ""],
  ["TC-031a", "Prototype", "Insufficient balance message", "Existing investor", "Buy 30,000 EGP", "'You don't have enough available balance.' + top-up link", "Message and link shown", "Pass", M, "", ""],
  ["TC-031b", "Prototype", "InstaPay top-up sheet adds balance", "After TC-031a", "Tap top-up and choose amount", "Balance increases", "Sheet not executed", "Not executed", "-", "", ""],
  ["TC-032", "Prototype", "Insufficient gold message", "Existing investor", "Sell 50 g", "'You don't have enough gold to complete this sale.'", "Message shown", "Pass", M, "", ""],
  ["TC-033", "Prototype", "Price changed when price moves during quote", "Open summary", "Click +3% then Confirm", "'The gold price has changed...' sheet", "Sheet shown", "Pass", M, "", ""],
  ["TC-034", "Prototype", "Quote expires after 30 s", "Open summary", "Wait 30 s", "Price changed sheet", "Countdown seen, expiry not waited", "Not executed", "-", "", ""],
  ["TC-035", "Prototype", "Provider unavailable disables trading", "Control on", "Open Gold", "Banner + Buy/Sell disabled", "Not executed", "Not executed", "-", "", ""],
  ["TC-036", "Prototype", "KYC incomplete blocks investing", "Control on", "Try buy", "'Please complete your information...'", "Not executed", "Not executed", "-", "", ""],
  ["TC-037", "Prototype", "Failed transaction screen, balances unchanged", "Control on", "Complete a buy", "'We couldn't complete your transaction'", "Not executed", "Not executed", "-", "", ""],
  ["TC-038", "Prototype", "Volatility banner", "Control on", "Open trade", "Rapid-change warning", "Not executed", "Not executed", "-", "", ""],
  // Integrity
  ["TC-039", "Prototype", "One order creates exactly one transaction", "Existing investor", "Buy 0.5 g and tap 5-7 PIN keys", "1 new transaction", "Before fix: 3 transactions and +1.5 g. After fix: 1 in each of 3 orders", "Fail -> Fixed", "Scripted reproduction, then re-run", "DEF-01", ""],
  ["TC-040", "Prototype", "Cash and gold reconcile to the ledger", "After trades", "Recompute independently", "Match", "6.9 g, EGP 36,456.30, average EGP 6,535.91 all match", "Pass", "Independent recomputation in browser", "DEF-02", ""],
  ["TC-041", "Prototype", "Buy, partial sell, re-buy keeps P&L valid", "Existing investor", "Run sequence", "Average cost and P&L consistent", "Consistent; unrealized = (sell - avg) x grams", "Pass", "Independent recomputation", "DEF-03", ""],
  ["TC-042", "Prototype", "Unrealized P&L formula", "Holding 6.9 g", "Compare UI with formula", "(7,185.71 - 6,535.91) x 6.9 = 4,483.6", "UI +4,484", "Pass", "Independent recomputation", "", ""],
  // P&L
  ["TC-043", "Prototype", "Calendar month total equals sum of sells", "Existing investor", "Read September", "= sum of sell realized P&L", "+307.89 vs 307.91 (rounding)", "Pass", M, "", ""],
  ["TC-044", "Prototype", "Daily totals reconcile to portfolio total", "First P&L design", "Sum months vs total", "Equal", "Short by EGP 50 (a daylight-saving day was mishandled)", "Fail -> Fixed", "Scripted comparison", "DEF-04", "CR-04"],
  ["TC-045", "Prototype", "Today's cell is live", "Existing investor", "Sell 2.7 g today", "Today's row and cell show the sale", "-127.09 in row and cell; month +180.80; cumulative +180.80", "Pass", M, "", "CR-07"],
  ["TC-046", "Prototype", "Cumulative chart ends at calendar total", "Existing investor", "Compare", "+307.89", "+307.89", "Pass", M, "", "CR-06"],
  ["TC-047", "Prototype", "Chart ranges use real daily prices", "Dashboard", "Read 1W and 1M low/high", "1W 7,136-7,368; 1M 7,105-7,551", "Matches source table", "Pass", M, "", "CR-05"],
  ["TC-048", "Prototype", "Palette applied", "Any screen", "Read computed styles", "#04768D to #64C2D3; button #04768D", "As expected", "Pass", "Computed style read", "", "CR-03"],
  ["TC-049", "Prototype", "Transactions list newest first; detail shows before/after", "Existing investor", "Open Activity, then a row", "List and detail correct", "List seen; detail not opened", "Not executed", "-", "", ""],
  ["TC-050", "Prototype", "Profile, documents, FAQ", "Any", "Open Profile sheets", "Content shows", "Not exercised", "Not executed", "-", "", ""],
  ["TC-051", "Prototype", "Hide balances (eye) masks values", "Portfolio", "Tap eye", "Values masked", "Not exercised", "Not executed", "-", "", ""],
  ["TC-052", "Prototype", "Daily P&L Bars view and day detail sheet", "Daily P&L", "Switch view, tap a day", "Bars and sheet show", "Not exercised", "Not executed", "-", "", ""],
  ["TC-053", "Prototype", "Month navigation back to first trade month", "Daily P&L", "Tap previous until disabled", "Ends at Oct 2025", "Reached Oct 2025", "Pass", M, "", ""],
  ["TC-054", "Prototype", "State persists after reload", "After trades", "Reload page", "Ledger retained", "Not verified", "Not executed", "-", "", ""],
  ["TC-055", "Prototype", "Phone-size layout and other browsers", "-", "Test 360-390 px, Safari, Edge", "Layout intact", "Only desktop Chrome pane used", "Not executed", "-", "", ""],
  ["TC-056", "Prototype", "Accessibility: keyboard and contrast", "-", "Tab through flows", "Usable and readable", "Not tested", "Not executed", "-", "", ""],
  ["TC-057", "Prototype", "Chart preview for invalid quantity", "Buy 0.25 g", "Read preview", "No misleading rounded quantity", "Showed '0.3 g' before fix", "Fail -> Fixed", M, "DEF-10", ""],
  ["TC-058", "Prototype", "Calendar cell precision", "Daily P&L", "Read Sept 16", "+115.59", "Showed +116 before fix", "Fail -> Fixed", M, "DEF-13", ""],
  ["TC-060", "Prototype", "Scenario control starts a brand-new customer with nothing on file", "Any state", "Choose 'Brand-new customer'", "Empty profile; landing then new-customer onboarding", "New-customer flow shown ('New to Aman?'), no data on file", "Pass", M, "", "CR-10"],
  ["TC-061", "Prototype", "New-customer steps are gated until valid", "Brand-new customer", "Walk 10 steps, checking the button at each", "Continue disabled until the step is valid", "Correctly disabled/enabled at every step", "Pass", M, "", "CR-10"],
  ["TC-062", "Prototype", "PIN mismatch is blocked with a message", "Step 4", "Enter 1234 and 9999", "'PINs do not match.'; continue disabled", "Message shown; disabled", "Pass", M, "", "CR-10"],
  ["TC-063", "Prototype", "Personal details validation and demo-fill", "Step 5", "Empty, then 'Fill demo data'", "Disabled when empty; enabled when valid", "As expected", "Pass", M, "", "CR-10"],
  ["TC-064", "Prototype", "ID needs both sides; selfie required", "Steps 6-7", "Capture one side, then both; take selfie", "Continue only after all captures", "As expected", "Pass", M, "", "CR-10"],
  ["TC-065", "Prototype", "Prepaid card issue and InstaPay top-up", "Step 8", "Issue card, choose 10K", "Card shown; balance EGP 10,000", "Balance EGP 10,000", "Pass", M, "", "CR-10"],
  ["TC-066", "Prototype", "Completion summary and dashboard", "Steps 9-10", "Accept terms, View Gold", "Masked ID, balance; dashboard greets by name", "'Hi, Sara', ID 2900******4567, EGP 0 gold", "Pass", M, "", "CR-10"],
  ["TC-067", "Prototype", "First buy from the new customer's balance", "After onboarding", "Buy 0.5 g", "Cash 10,000 to 6,370.31", "EGP 10,000.00 to 6,370.31; gold 0.0 to 0.5 g", "Pass", M, "", "CR-10"],
  ["TC-068", "Prototype", "Profile shows the captured data", "After onboarding", "Open Profile", "Name, mobile, KYC Complete, card, balance", "All shown correctly", "Pass", M, "", "CR-10"],
  ["TC-069", "Prototype", "Regression: existing-customer onboarding", "Existing Aman customer scenario", "Start onboarding", "Account check with data on file", "Account check shown with Ahmed's data", "Pass", M, "", "CR-10"],
  ["TC-070", "Prototype", "Regression: existing investor scenario", "Existing investor scenario", "Open Gold", "20 transactions, 5.5 g", "20 transactions, 5.5 g, EGP 39,528", "Pass", M, "", "CR-10"],
  ["TC-071", "Prototype", "Field validation edge cases", "Step 2, 5", "Short mobile, 13-digit ID, bad DOB, short address", "Each blocked with the right hint", "Only happy path and PIN mismatch exercised", "Not executed", "-", "", "CR-10"],
  ["TC-072", "Prototype", "Back keeps values; refresh mid-flow", "Any step", "Go back; reload", "Values kept / defined behaviour", "Not exercised", "Not executed", "-", "", "CR-10"],
  ["TC-073", "Prototype", "Skip top-up then try to buy", "Zero balance", "Buy any amount", "Insufficient balance with top-up link", "Not exercised", "Not executed", "-", "", "CR-10"],
  ["TC-059", "Prototype", "Prototype opens on the right URL", "Fresh machine", "Open app", "Prototype, not Connector Directory", "User opened port 3000 (wrong app)", "Fail -> Fixed", "User report", "DEF-06", ""],
];

// ---------------- Defects ----------------
// [id, severity, found by, summary, root cause, fix, verified]
const defects = [
  ["DEF-01", "High", "PM (screenshots 3-4) and Claude reproduction", "One order created several transactions; gold balance did not match history", "PIN pad accepted taps after the 4th digit and each tap re-submitted the order", "Ignore taps after 4th digit; one order at a time (busy lock); checks re-run at commit", "Yes (TC-039)"],
  ["DEF-02", "High", "PM (screenshot 2)", "Available balance far above starting cash after one losing trade", "Cash stored separately from the ledger and updated from stale values", "Cash and gold are derived from the ledger, never stored; atomic state updates", "Yes (TC-040)"],
  ["DEF-03", "High", "PM (screenshot 1)", "Average buy price EGP 18,276 and -60% unrealized P&L", "Duplicate sells oversold gold; cost basis stopped shrinking", "Wallet cannot sell more than held; P&L replay clamps", "Yes (TC-041, 042)"],
  ["DEF-04", "Medium", "Claude (reconciliation check)", "Daily P&L totals EGP 50 short of portfolio total", "Fixed 24-hour day steps broke at Egypt's daylight-saving change", "Calendar-safe date arithmetic (later design uses realized-only)", "Yes (TC-044)"],
  ["DEF-05", "Low", "PM", "P&L card mixed periods and looked contradictory to Today's Realized", "Card showed all-time realized next to today's value without labels", "Periods labelled, then card removed (CR-08/09)", "Yes"],
  ["DEF-06", "Low", "PM", "Prototype link opened the Connector Directory", "Two local apps: port 3000 (other) vs 3200 (prototype)", "Correct URL communicated; one-click launcher added", "Yes"],
  ["DEF-07", "Low", "Claude", "Blank page when the dev server stopped", "Local dev server process ended", "Restarted; launcher .bat provided", "Yes"],
  ["DEF-08", "Low", "Claude", "Lab revenue tile labelled UNKNOWN", "Failure-rate input typed UNKNOWN with value 0", "Typed ASSUMPTION (0%)", "Yes (TC-014)"],
  ["DEF-09", "Medium", "Claude", "Agent text quoted old numbers after inputs changed", "Hardcoded phrases in agents, debate and decision", "Replaced with values computed from inputs", "Yes (TC-015)"],
  ["DEF-10", "Low", "Claude", "Invalid 0.25 g showed rounded '0.3 g' preview", "Preview formatted a value that failed validation", "Hide preview on step error", "Yes (TC-057)"],
  ["DEF-11", "Low", "Claude", "Gram formats inconsistent (0.50 g vs 1.1000 g)", "Different decimals per screen", "Shared gramsTrim formatter", "Yes"],
  ["DEF-12", "Medium", "PM", "Demo gold price (~5,526) far from the real Egypt price (~7,223)", "Invented anchor price", "Real 24k Egypt prices used", "Yes (TC-047)"],
  ["DEF-13", "Low", "Claude", "Calendar cell rounded values over 100 (+116 vs +115.59)", "Compact formatter dropped decimals", "Two decimals up to 999.99", "Yes (TC-058)"],
];

// ---------------- Change requests ----------------
// [id, raised, requester, title, detail, impact, status]
const crs = [
  ["DEC-1", "2026-09-21", "PM", "Funding = Aman prepaid card balance topped up via InstaPay", "Phase 1 decision", "Removes gateway cost; external cards out of MVP", "Implemented"],
  ["DEC-2", "2026-09-21", "PM", "Pricing = spread only, 0.5% per side", "Phase 1 decision", "Matches business case", "Implemented"],
  ["DEC-3", "2026-09-21", "PM", "English first, Arabic RTL later", "Phase 1 decision", "Bilingual strings deferred", "Implemented"],
  ["DEC-4", "2026-09-21", "PM", "Customer prototype only; business case presented separately", "Phase 1 decision", "Lab stays a separate app", "Implemented"],
  ["CR-BC-01", "2026-09-21", "PM", "Purchases via prepaid balance, no gateway; InstaPay top-up free", "Zero gateway and top-up cost", "Unit margin -0.5% to +0.5%; decision DO NOT PROCEED to VALIDATE FURTHER", "Implemented"],
  ["CR-BC-02", "2026-09-21", "PM", "Provider handles regulation; no outside certificates", "Regulatory risk from critical to high, written confirmation gate", "Risk register and decision reworked", "Implemented"],
  ["CR-BC-03", "2026-09-21", "PM", "CAC 250 EGP, then confirmed 10 EGP", "Replaced US benchmark", "LTV/CAC 0.26 to 6.5; decision to PROCEED WITH CONDITIONS", "Implemented"],
  ["CR-BC-04", "2026-09-21", "PM", "MVP and run team in-house, no additional cash cost", "Cash share 0%; opportunity cost shown separately", "Investment lines changed", "Implemented"],
  ["CR-BC-05", "2026-09-21", "PM", "Prepaid card live in under a month", "Card risk from critical to high, not a blocker", "Risk and decision text", "Implemented"],
  ["CR-01", "2026-09-21", "PM", "Use today's real gold price in Egypt as the example", "Anchor ~EGP 7,223/g (24k)", "Price service, seed, copy", "Implemented"],
  ["CR-02", "2026-09-21", "PM", "Minimum and step 0.1 g; no pooled model (mngm sells fractional)", "Quantities in 0.1 g steps for buy and sell", "Engine, validation, UI, docs", "Implemented"],
  ["CR-03", "2026-09-22", "PM", "Use Aman colour codes (#04768D to #64C2D3)", "Palette and gradient", "CSS tokens, hero cards", "Implemented"],
  ["CR-04", "2026-09-22", "PM", "Portfolio P&L section like the reference; click opens daily calendar", "Balance card, today's row, allocation donut, calendar", "New DailyPnl screen, portfolio redesign", "Implemented"],
  ["CR-05", "2026-09-22", "PM", "Replace demo customer data with real Sept prices and win/loss days", "20 transactions on 24 Aug-21 Sep prices", "Seed, price history", "Implemented"],
  ["CR-06", "2026-09-22", "PM", "Remove invested vs current; add cumulative P&L chart matching the calendar", "30-day cumulative realized chart", "Portfolio, chart component", "Implemented"],
  ["CR-07", "2026-09-22", "PM", "Calendar shows realized only, no tabs; today's cell is dynamic", "Realized-only daily P&L", "pnl service, DailyPnl screen", "Implemented"],
  ["CR-10", "2026-09-22", "PM", "Add a new-customer onboarding flow (nothing on file) and a prototype control to switch between new and existing customers", "Full capture: mobile, code, PIN, details, ID, selfie, prepaid card and top-up, agreements. Control gets 3 scenarios", "Onboarding, store, controls, design canvas, tickets, tests", "Implemented"],
  ["CR-08", "2026-09-22", "PM", "P&L card should be a daily snapshot / clarified", "Periods labelled today / month / since first trade", "Portfolio card", "Superseded by CR-09"],
  ["CR-09", "2026-09-22", "PM", "Remove the Profit and loss card to keep it simple", "Card removed; details card trimmed", "Portfolio", "Implemented"],
];

// ---------------- Pipeline (for the design canvas) ----------------
const counts = {
  tc: tc.length,
  pass: tc.filter((t) => t[7] === "Pass").length,
  fixed: tc.filter((t) => t[7] === "Fail -> Fixed").length,
  notExec: tc.filter((t) => t[7] === "Not executed").length,
  defects: defects.length,
  crs: crs.length,
  stories: backlog.filter((b) => b[0] === "Story").length,
  tasks: backlog.filter((b) => b[0] === "Task").length,
  epics: backlog.filter((b) => b[0] === "Epic").length,
  qaStories: qa.filter((b) => b[0] === "Story").length,
  qaTasks: qa.filter((b) => b[0] === "Task").length,
  points: backlog.reduce((a, b) => a + (typeof b[5] === "number" && b[0] !== "Task" ? b[5] : 0), 0),
};

module.exports = { P1, P2, timeline, effort, backlog, qa, tc, defects, crs, counts };
