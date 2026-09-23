# Aman Gold: Product Requirements (MVP prototype)

Status: prototype for internal review. All numbers are DEMO DATA or configurable ASSUMPTIONS (see `04-assumptions-compliance-risks-roadmap.md`). Not legal advice; regulatory structure is TO VALIDATE.

## 1. Problem
Aman customers have no investment product in the Super App. Customers who want to save in gold buy physical gold or use third-party apps, so Aman sees none of that activity. Whether Aman customers *want* gold in Aman is not yet evidenced (UNKNOWN).

## 2. Opportunity
Owned distribution (360K MAU, 1M Super App users: ACTUAL, PM-provided), an Aman prepaid card going live in under a month (ASSUMPTION), and a first investment product. The separate Business Case Lab (`aman-gold-lab`) holds the economics; current result: PROCEED WITH CONDITIONS, with small absolute revenue.

## 3. Objectives
1. Show a first-time investor can understand and complete a gold purchase.
2. Show every number the customer needs (price, spread, fee, quantity, total, P&L, status).
3. Show the business mechanics (spread revenue, ledger, wallet) with all logic centralized.
4. Give Product, Tech, Finance, Risk and Compliance something concrete to react to.

## 4. Scope
**In (MVP prototype):** discovery entry on Home; landing with price, chart, education, fees, risk; two onboarding paths (existing Aman customer: 7 steps reusing data on file; brand-new customer: 10 steps capturing everything); dashboard; buy; sell (by grams or EGP); portfolio with realized/unrealized P&L; transactions and details with before/after balances; profile; edge-case states; simulated PIN.
**Funding:** Aman prepaid card balance only, topped up via InstaPay (simulated).
**Out (roadmap only, not approved):** external cards, recurring plans, price alerts, saving plans, physical redemption, gifting, family accounts, advanced analytics, Arabic/RTL (planned next).

## 5. Personas (hypotheses, not validated)
- **First-time investor:** wants to start small and understand what they own.
- **Existing gold buyer:** compares price and spread against jewelers and other apps.
- **Digitally active Aman customer:** discovers Gold from Home and expects a native experience.

## 6. Functional requirements and acceptance criteria
| ID | Story | Acceptance criteria |
|---|---|---|
| F1 | As a customer I see Gold on Home | Gold tile and price strip visible; tap opens Landing (new) or Dashboard (onboarded) |
| F2 | I understand the product before joining | Landing shows price, chart, buy/sell price, education, benefits, fees, risk disclosure |
| F3 | I onboard without re-entering known data | Account check shows what is on file; only missing fields are requested |
| F4 | I pay from my prepaid balance | Payment step shows masked prepaid card and balance; external card is explained as out of MVP |
| F5 | I accept terms | Continue disabled until the checkbox is ticked |
| F6 | I see value, grams and P&L at a glance | Dashboard shows portfolio value, grams, unrealized P&L (EGP and %), buy and sell price |
| F7 | I explore price history | Chart ranges 1D/1W/1M/3M/1Y from the pricing service; shows current, high, low, % change |
| F8 | I buy gold | By grams (0.1 g steps, min 0.1 g) or by EGP (rounded down to a 0.1 g step); quantity and cost computed live; summary with price lock timer; PIN; processing; success with ID, before/after balances |
| F9 | I sell gold | By grams (0.1 g steps) or EGP; percentage chips; summary; PIN; proceeds credited to prepaid balance |
| F10 | I see realized and unrealized P&L | Portfolio shows both, plus total; formulas shown |
| F11 | I review history | List with type, quantity, price, gross, status, ID; detail shows fees, net, cash and gold before/after |
| F13 | I can join even if Aman has nothing on file | Brand-new customer flow: mobile, code, PIN, personal details, ID (both sides), selfie, Aman prepaid card + InstaPay top-up, agreements. All checks are demo validations; required data is a configurable checklist (to validate with Compliance) |
| F12 | Edge cases are handled | Insufficient balance (with InstaPay top-up), insufficient gold, price changed, failed transaction, provider unavailable, KYC incomplete, volatility banner |

## 7. Non-functional
Mobile-first (390px). Business logic outside UI components. Mock data behind interfaces (`MarketDataProvider`, store) so a backend can replace it. No real payments, KYC or provider calls.

## 8. KPIs
Acquisition: Gold visitors, onboarding starts, completion, KYC completion, card linked. Activation: first purchase, conversion, average first investment. Engagement: monthly active gold customers, purchase frequency, repeat purchase rate. Portfolio: gold AUM (grams and EGP), average balance. Transactions: buys, sells, value, success rate. Financial: revenue, revenue per customer, spread revenue, fee revenue, CAC (EGP 10, ACTUAL), contribution margin. Risk: failed transactions, payment failures, pricing errors, complaints, fraud cases.
