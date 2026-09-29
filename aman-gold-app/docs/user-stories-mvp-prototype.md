# User Stories — Aman Super App: Gold Investment MVP

**Status:** Draft | **Date:** 2026-09-24 | **Last updated:** 2026-09-27 (added E21 — eKYC signature) | **Source ticket:** "Aman Super App — Gold Investment MVP" brief
**Written retrospectively:** Mostly yes — 18 of 21 epics document work that is already built and verified
against the codebase; 3 epics (E18, E19, E20) are genuine gaps, written prospectively as `To do`. E21
was added after a follow-up request ("the onboarding needs an eKYC signature flow") and documents that
work retrospectively too — it was built and verified in-browser before this doc was updated.

## Discovery notes (fast pass — see below for why this is short)

**What's being asked:** turn the original MVP brief into a formal epic/story/acceptance-criteria
backlog. Because most of the described product already exists, this pass does two things at once:
documents what was built (status `Done`, each one spot-checked against the actual source file named
in its notes — not assumed), and surfaces what the brief asked for but genuinely isn't built.

**Scope boundary — one conflict worth naming explicitly:** the original brief's sections 20–26 and
37–38 (CEO/CFO/Marketing/R&D/Risk agents, the debate engine, the 3-pane Agent UI) describe the
**AI Business Case Debate Room**, which this pass **excludes on purpose** — that's a separate ticket
by the same name pattern, and it was built as its own project (`aman-gold-lab`), not inside this
customer prototype. Including it here would double-count work already tracked elsewhere.

**Real gaps found** (not previously tracked as backlog items anywhere):
- **E18 — Design system.** The app is visually consistent (one palette, Tailwind throughout) but
  that consistency isn't written down anywhere a new contributor could check against.
- **E19 — KPI / analytics framework.** Zero event tracking exists. The brief's KPI framework
  (§26) is entirely unbuilt — this is the largest real gap found in this pass.
- **E20 — Compliance checklist ownership.** The content exists as narrative text in one doc; it
  isn't a tracked artifact with an owner and a status per item.

**Not re-litigated here:** a financial model and a GTM plan were also named in the brief (§32), but
those were produced for the Business Case Lab project, which owns that scope — not a gap in this
project.

Story points are estimates (`pts est.`), never measurements. `Done` status below was checked against
a named source file, not assumed from memory of having built it.

---

## Epic E1 — Discover Gold from Home *(Done)*

### Story E1-S1 — Gold entry point on Home
**As an** Aman Super App user, **I want** to see a Gold tile with the live price on my Home screen,
**so that** I discover the product without hunting for it.
- Given I open Aman Home, when the page loads, then I see a Gold strip showing the current price per gram.
- Given I tap the Gold strip, when I am not yet onboarded, then I land on the Gold landing page; when I am onboarded, then I land directly on the Gold dashboard.
**Points:** 3 pts est. | **Status:** Done (`features/home/Home.tsx`)

### Story E1-S2 — Gold landing page explains the product
**As a** prospective Gold customer, **I want** to see price, chart, fees, and risk disclosure before
I commit to onboarding, **so that** I understand what I'm signing up for.
- Given I open the landing page, when it renders, then I see live buy/sell price, a price chart, benefits, fees, and a risk disclaimer.
- Given I tap Start Investing, when I am not onboarded, then onboarding begins.
**Points:** 3 pts est. | **Status:** Done (`features/gold/Landing.tsx`)

---

## Epic E2 — Onboarding: existing Aman customer *(Done)*

### Story E2-S1 — Account check reuses data on file
**As an** existing Aman customer, **I want** to not re-enter information Aman already has,
**so that** onboarding is fast.
- Given I have KYC data on file, when I reach the account check step, then my name, mobile, and KYC fields show as already on file.
- Given a field is missing, when I reach that step, then only the missing field is requested.
**Points:** 3 pts est. | **Status:** Done (`features/onboarding/Onboarding.tsx`)

### Story E2-S2 — 7-step existing-customer onboarding completes
**As an** existing Aman customer, **I want** to finish onboarding in a handful of steps,
**so that** I reach the Gold dashboard quickly.
- Given I complete mobile verification, identity review, payment method selection, and agreements, when I finish, then I land on an empty Gold dashboard ready to buy.
**Points:** 5 pts est. | **Status:** Done

---

## Epic E3 — Onboarding: brand-new customer *(Done)*

### Story E3-S1 — Brand-new customer captures full identity
**As a** person with no Aman profile, **I want** to provide mobile, PIN, personal details, ID
(front/back), and a selfie, **so that** Aman can verify who I am before I invest.
- Given I am a brand-new customer, when I walk the 11-step flow, then each step's Continue button is disabled until that step's data is valid (mismatched PIN, incomplete ID capture, etc. all block progress).
- Given I complete all 11 steps, when I finish, then a masked profile and an Aman prepaid card are created.
**Points:** 8 pts est. | **Status:** Done (`features/onboarding/OnboardingNew.tsx`)

### Story E3-S2 — Prepaid card issued with an optional first top-up
**As a** brand-new customer, **I want** to get an Aman prepaid card and add money via InstaPay
during onboarding, **so that** I can buy gold right after I finish onboarding.
- Given I reach the card step, when I request a card, then a masked card is shown.
- Given I choose a top-up amount, when I finish onboarding, then my opening balance equals that top-up (or zero if I skipped it).
**Points:** 3 pts est. | **Status:** Done

---

## Epic E4 — Gold Home / Dashboard *(Done)*

### Story E4-S1 — Dashboard shows portfolio value and holdings at a glance
**As a** Gold customer, **I want** to see my portfolio value, grams held, and unrealized P&L the
moment I open Gold, **so that** I know where I stand without digging through screens.
- Given I have holdings, when I open the dashboard, then I see portfolio value, grams held, and unrealized P&L with a percentage.
- Given I have zero holdings, when I open the dashboard, then Sell is disabled and I'm invited to buy from the minimum (0.1g).
**Points:** 5 pts est. | **Status:** Done (`features/gold/Dashboard.tsx`)

---

## Epic E5 — Gold price chart *(Done)*

### Story E5-S1 — Price chart across five ranges
**As a** Gold customer, **I want** to switch between 1D/1W/1M/3M/1Y views of the gold price,
**so that** I can judge whether now is a good time to buy or sell.
- Given I select a range, when the chart redraws, then low/high and percentage change reflect that range.
- Given the 1W/1M/3M/1Y ranges are shown, when data loads, then real daily closes from the Aman Gold price database back the chart, falling back to local reference data if the database is unreachable, with a caption naming which source was used.
**Points:** 5 pts est. | **Status:** Done (`components/PriceChart.tsx`, `services/history.ts`)

---

## Epic E6 — Buy gold *(Done)*

### Story E6-S1 — Buy by grams in 0.1g steps
**As a** Gold customer, **I want** to buy a whole number of 0.1g steps, **so that** my order matches
what the provider can actually fulfil.
- Given I enter an amount that isn't a 0.1g multiple, when I try to proceed, then I see a step-size validation message.
- Given I enter a valid amount, when I review the order, then I see quantity, price, fee, total, and a 30-second price lock countdown.
**Points:** 5 pts est. | **Status:** Done (`features/trade/Trade.tsx`, `services/engine.ts`)

### Story E6-S2 — Buy by EGP rounds down to the nearest step
**As a** Gold customer, **I want** to enter an EGP amount and have it convert to a valid gram
quantity, **so that** I don't need to do the gram math myself.
- Given I enter an EGP amount, when it doesn't divide evenly into 0.1g steps, then the app rounds down and shows the leftover balance that stays uninvested.
**Points:** 3 pts est. | **Status:** Done

### Story E6-S3 — Order confirms with PIN and shows before/after balances
**As a** Gold customer, **I want** to confirm my order with a PIN and see exactly what changed,
**so that** I trust that the transaction did what it says.
- Given I enter a valid PIN, when the order processes, then I see a success screen with a transaction ID and cash/gold balances before and after.
- Given I tap PIN digits rapidly or more than 4 times, when the order submits, then exactly one transaction is created, never more.
**Points:** 5 pts est. | **Status:** Done — *regression-tested after a real duplicate-order bug found during development (see delivery-pack Defects sheet, DEF-01).*

---

## Epic E7 — Sell gold *(Done)*

### Story E7-S1 — Sell by grams or by EGP
**As a** Gold customer, **I want** to sell either a gram amount or an EGP value of my holdings,
**so that** I can express my sell order however is natural to me.
- Given I choose to sell by EGP, when I enter a value, then it converts to the nearest 0.1g step at the current sell price.
- Given I try to sell more than I hold, when I review the order, then I see an insufficient-gold message and cannot proceed.
**Points:** 5 pts est. | **Status:** Done (`features/trade/Trade.tsx`)

### Story E7-S2 — Sell proceeds credited to the prepaid balance
**As a** Gold customer, **I want** to see my proceeds land in my Aman balance immediately,
**so that** I know the money is available right away.
- Given a sell order completes, when I view the success screen, then it states the amount was credited to my Aman balance and shows realized P&L for that sale.
**Points:** 2 pts est. | **Status:** Done

---

## Epic E8 — Portfolio *(Done)*

### Story E8-S1 — Portfolio shows asset allocation
**As a** Gold customer, **I want** to see what share of my Aman balance is in gold versus cash,
**so that** I understand my overall exposure, not just my gold holdings.
- Given I open Portfolio, when it loads, then I see a Gold-vs-Cash allocation donut with percentages that sum to 100%.
**Points:** 3 pts est. | **Status:** Done (`features/portfolio/Portfolio.tsx`)

### Story E8-S2 — Cumulative realized P&L chart
**As a** Gold customer, **I want** to see my realized profit or loss accumulate over the last 30
days, **so that** I can see whether my trading has been net positive.
- Given I have at least one sale, when I view Portfolio, then the cumulative P&L chart's final point equals the sum of every day's realized P&L in the Daily P&L calendar for the same period.
**Points:** 5 pts est. | **Status:** Done — *a reconciliation bug (a daylight-saving date-arithmetic error, DEF-04) was found and fixed during development; see delivery-pack Defects sheet.*

---

## Epic E9 — Daily P&L calendar *(Done)*

### Story E9-S1 — Daily P&L calendar
**As a** Gold customer, **I want** to see which days I made or lost money, **so that** I can review
my trading pattern day by day.
- Given I open Daily P&L, when a month renders, then each day with a sale shows realized P&L in green (profit) or red (loss); days with no sale show 0.00.
- Given I sell gold today, when I return to this screen, then today's cell updates live to reflect that sale.
**Points:** 5 pts est. | **Status:** Done (`features/portfolio/DailyPnl.tsx`)

---

## Epic E10 — Transaction history and details *(Done)*

### Story E10-S1 — Transaction list
**As a** Gold customer, **I want** to see all my past buys and sells, newest first, **so that** I
can review my trading history.
- Given I open Activity, when the list renders, then each row shows type, quantity, price, gross amount, and status.
**Points:** 3 pts est. | **Status:** Done (`features/transactions/Transactions.tsx`)

### Story E10-S2 — Transaction detail shows before/after balances
**As a** Gold customer, **I want** to open any transaction and see exactly what it changed,
**so that** I can verify my cash and gold moved the way I expect.
- Given I open a transaction, when the detail view loads, then I see cash balance before/after and gold balance before/after, plus fee and net amount.
**Points:** 2 pts est. | **Status:** Done

---

## Epic E11 — Profile *(Done)*

### Story E11-S1 — Profile shows account and KYC status
**As a** Gold customer, **I want** to see my name, mobile, KYC status, and linked payment method,
**so that** I can confirm my account is set up correctly.
- Given I open Profile, when it loads, then I see KYC status (Complete/Incomplete), masked ID, linked card, and current prepaid balance.
**Points:** 2 pts est. | **Status:** Done (`features/profile/Profile.tsx`)

---

## Epic E12 — Centralized business configuration *(Done)*

### Story E12-S1 — No business value is hardcoded in a screen component
**As the** engineering team, **I want** to keep every price, fee, and limit in one config file,
**so that** a future pricing change is a one-line edit, not a UI hunt.
- Given a UI component needs a business value (spread, fee, minimum grams, quote validity, funding method), when I inspect its source, then it reads from `PRODUCT_CONFIG` rather than a literal.
**Points:** 3 pts est. | **Status:** Done (`config/product.ts`)

---

## Epic E13 — Gold price engine *(Done)*

### Story E13-S1 — Price engine behind a swappable interface
**As the** engineering team, **I want** to call `getCurrentGoldPrice` / `getHistoricalGoldPrices` /
`getBuyPrice` / `getSellPrice` without knowing whether the data is mocked or real, **so that** a
real provider can replace the mock later without touching the UI.
- Given the UI needs a price, when it calls the pricing service, then it never imports the mock provider directly.
- Given the Supabase gold-price-history table is reachable, when historical prices are requested, then real data is used; when it is not reachable, then a local static fallback is used silently, with no error shown to the customer.
**Points:** 5 pts est. | **Status:** Done (`services/pricing.ts`, `services/history.ts`, `services/supabase.ts`)

---

## Epic E14 — Transaction engine and ledger integrity *(Done)*

### Story E14-S1 — Cash and gold balances are always derived from the ledger
**As the** engineering team, **I want** to never store a cash or gold balance separately from the
transaction history, **so that** the balance can never drift out of sync with what actually happened.
- Given any sequence of buys and sells, when I independently recompute cash and gold from the transaction list, then it matches what the UI shows, exactly.
- Given two orders are submitted in rapid succession, when they process, then they are serialized (one at a time), never applied concurrently against stale state.
**Points:** 8 pts est. | **Status:** Done — *this is the fix for three real bugs found during development (duplicate orders, balance drift, oversold gold — DEF-01/02/03); see delivery-pack Defects sheet.*

---

## Epic E15 — Edge cases *(Done)*

### Story E15-S1 — Seven edge-case states are demonstrable
**As a** reviewer / QA, **I want** to trigger insufficient balance, insufficient gold,
price-changed, failed-transaction, provider-unavailable, KYC-incomplete, and volatility states on
demand, **so that** I can verify the app handles failure gracefully, not just the happy path.
- Given I use the Prototype controls panel, when I toggle any of the 7 states, then the corresponding screen shows the correct message and blocks the action it should block.
**Points:** 5 pts est. | **Status:** Done (`components/PhoneShell.tsx` controls + checks in `services/engine.ts`)

---

## Epic E16 — Realistic demo data *(Done)*

### Story E16-S1 — Seeded demo investor on real prices
**As a** reviewer / demo audience, **I want** to see a realistic account with a mix of winning and
losing trading days, **so that** the demo doesn't look suspiciously perfect or obviously fake.
- Given I select "Existing investor" in the controls, when the app loads, then I see 20 seeded transactions priced against real Egypt 24k gold closes, with at least one losing day and one winning day.
**Points:** 3 pts est. | **Status:** Done (`data/seed.ts`, `data/marketHistory.ts`)

---

## Epic E17 — Product documentation set *(Done)*

### Story E17-S1 — Core documentation set exists
**As a** future engineer / stakeholder, **I want** to read a PRD, business flow, architecture doc,
and assumptions/risk/roadmap without asking the original author, **so that** the project is
understandable without tribal knowledge.
- Given I open `docs/`, when I look for it, then I find `01-PRD.md`, `02-business-flow-and-journey.md`, `03-architecture-and-data-model.md`, and `04-assumptions-compliance-risks-roadmap.md`, each matching the current state of the code.
**Points:** 3 pts est. | **Status:** Done — *a financial model and a GTM plan were also named in the original brief, but those belong to the separate Business Case Lab project's scope, not this one.*

---

## Epic E18 — Reusable design system *(To do — real gap)*

### Story E18-S1 — Named, documented component library
**As a** designer / engineer, **I want** a component library with named tokens (not just Tailwind
utility classes) and documented usage, **so that** new screens stay visually consistent without
someone remembering the exact hex codes and spacing by heart.
- Given a new screen is built, when its author looks for guidance, then a `references/design-system.md` (or equivalent) exists naming every color token, type scale, spacing unit, and component, with do/don't examples.
- Given the design system exists, when compared to the current app, then every existing screen's colors and spacing are shown to already match it (a documentation pass, not a rebuild).
**Points:** ESTIMATE: unsized | **Status:** To do
**Notes:** The app is visually consistent today (single palette, Tailwind), but that consistency
isn't written down anywhere a new contributor could check against. Whether this is worth doing
before a real design team is involved is a PM call.

---

## Epic E19 — KPI / analytics framework *(To do — real gap, largest one found)*

### Story E19-S1 — Event tracking for the acquisition-to-transaction funnel
**As a** Product Manager, **I want** to see how many people view Gold, start onboarding, complete
it, make a first purchase, and repeat, **so that** I can tell whether the product is working, not
just whether it's built.
- **BLOCKED.** Acceptance criteria can't be written yet — they depend on which analytics platform Aman uses (or whether one exists at all for the Super App). This prototype has no event tracking of any kind today. Ask the PM/analytics owner before scoping this.
**Points:** ESTIMATE: unsized | **Status:** Blocked
**Notes:** Zero instrumentation exists anywhere in this codebase. The original brief's KPI
framework (its §26) names acquisition, activation, engagement, portfolio, transaction, financial,
and risk metrics — none of them are currently measurable.

---

## Epic E20 — Compliance checklist ownership *(To do — real gap)*

### Story E20-S1 — Compliance checklist becomes a tracked, owned artifact
**As** Compliance / Legal, **I want** a checklist with an owner and a status per item (regulatory
classification, custody, KYC/AML, disclosures, tax, data privacy, partner due diligence), **so
that** nothing on the list gets silently forgotten before a real launch.
- Given the current compliance content in `docs/04-assumptions-compliance-risks-roadmap.md`, when it's promoted to a tracked artifact, then each item has an owner, a status (TO VALIDATE / in progress / cleared), and a target date.
- This item explicitly requires a real Compliance/Legal stakeholder to own it — it is not something engineering or product can close out alone.
**Points:** 2 pts est. | **Status:** To do
**Notes:** The content exists narratively today; the gap is ownership and tracking, not the
initial research.

---

## Epic E21 — eKYC signature capture *(Done — added 2026-09-27)*

Closes a real gap: both onboarding flows previously only had a checkbox for "I agree to terms" —
no captured evidence of consent, despite the brand-new flow already doing ID capture and a selfie
liveness check (eKYC). See `BRD-ekyc-signature.md` for the full business requirements.

### Story E21-S1 — Reusable draw-to-sign component
**As the** engineering team, **I want** to capture a signature as a canvas the customer draws on
with finger or mouse, reusable across any flow that needs consent evidence, **so that** onboarding
and future consent flows don't each reinvent signature capture.
- Given a screen renders the signature pad, when the customer draws a stroke, then the pad reports a captured signature and shows a "Captured" status; when they tap Clear, then it reports null and reverts to "Required".
- Given the pad has no stroke yet, when the surrounding step is evaluated, then any Continue/Submit button gated on it stays disabled.
**Points:** 3 pts est. | **Status:** Done (`components/ui.tsx` — `SignaturePad`) — *client-side only, not persisted to the store, consistent with the other simulated-capture steps (ID photo, selfie).*

### Story E21-S2 — Brand-new customer signs to authorize their eKYC declaration
**As a** brand-new customer, **I want** to review a summary of what was captured (ID, selfie
match) and sign to confirm it's accurate, **so that** my onboarding produces real evidence of
consent, not just a captured photo nobody signed off on.
- Given I've captured my ID and selfie, when I reach the eKYC signature step, then I see a summary card (name, masked national ID, ID-captured status, selfie-match status) above the signature pad.
- Given the pad is empty, when I try to continue, then Continue is disabled; given I draw a signature, when I tap Continue, then I proceed to the prepaid-card step.
**Points:** 3 pts est. | **Status:** Done (`features/onboarding/OnboardingNew.tsx`, step 8 of 11) — *verified end-to-end in browser: disabled-until-signed gating, canvas stroke capture, and Clear all confirmed working.*

### Story E21-S3 — Existing customer signs to authorize adding Gold Investment
**As an** existing Aman customer new to Gold, **I want** to sign to authorize enrolling in the
Gold product, since my core identity KYC is already on file, **so that** Aman has consent
evidence for this specific product, without repeating identity verification I've already done.
- Given I check "I have read and agree to the terms", when the checkbox is ticked, then a signature pad appears labeled for authorizing Gold Investment.
- Given the signature pad is empty, when I try to tap Start Investing, then it's disabled; given I sign, when I tap Start Investing, then onboarding completes.
**Points:** 2 pts est. | **Status:** Done (`features/onboarding/Onboarding.tsx`, `OnboardingExisting`) — *lighter than E21-S2 since identity eKYC is not repeated for existing customers.*

---

## Backlog summary

| ID | Title | Epic status | Points (est.) | Story status |
|---|---|---|---|---|
| E1-S1 | Gold entry point on Home | Done | 3 | Done |
| E1-S2 | Gold landing page explains the product | Done | 3 | Done |
| E2-S1 | Account check reuses data on file | Done | 3 | Done |
| E2-S2 | 7-step existing-customer onboarding completes | Done | 5 | Done |
| E3-S1 | Brand-new customer captures full identity | Done | 8 | Done |
| E3-S2 | Prepaid card issued with optional first top-up | Done | 3 | Done |
| E4-S1 | Dashboard shows portfolio value and holdings | Done | 5 | Done |
| E5-S1 | Price chart across five ranges | Done | 5 | Done |
| E6-S1 | Buy by grams in 0.1g steps | Done | 5 | Done |
| E6-S2 | Buy by EGP rounds down to the nearest step | Done | 3 | Done |
| E6-S3 | Order confirms with PIN, before/after balances | Done | 5 | Done |
| E7-S1 | Sell by grams or by EGP | Done | 5 | Done |
| E7-S2 | Sell proceeds credited to prepaid balance | Done | 2 | Done |
| E8-S1 | Portfolio shows asset allocation | Done | 3 | Done |
| E8-S2 | Cumulative realized P&L chart | Done | 5 | Done |
| E9-S1 | Daily P&L calendar | Done | 5 | Done |
| E10-S1 | Transaction list | Done | 3 | Done |
| E10-S2 | Transaction detail before/after balances | Done | 2 | Done |
| E11-S1 | Profile shows account and KYC status | Done | 2 | Done |
| E12-S1 | No business value hardcoded in a screen | Done | 3 | Done |
| E13-S1 | Price engine behind a swappable interface | Done | 5 | Done |
| E14-S1 | Cash/gold always derived from the ledger | Done | 8 | Done |
| E15-S1 | Seven edge-case states are demonstrable | Done | 5 | Done |
| E16-S1 | Seeded demo investor on real prices | Done | 3 | Done |
| E17-S1 | Core documentation set exists | Done | 3 | Done |
| **E18-S1** | **Named, documented component library** | **To do** | unsized | **To do** |
| **E19-S1** | **Event tracking for the funnel** | **To do** | unsized | **Blocked** |
| **E20-S1** | **Compliance checklist ownership** | **To do** | 2 | **To do** |
| E21-S1 | Reusable draw-to-sign component | Done | 3 | Done |
| E21-S2 | Brand-new customer signs their eKYC declaration | Done | 3 | Done |
| E21-S3 | Existing customer signs to authorize Gold Investment | Done | 2 | Done |

**Totals:** 31 stories — 28 Done (verified against source, 110 estimated points already delivered),
2 To do (design system, unsized; compliance ownership, 2 pts est.), 1 Blocked (analytics — needs a
business decision first).
