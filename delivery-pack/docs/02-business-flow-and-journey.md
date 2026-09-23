# Business flow and customer journey

## Business flow (mermaid)
```mermaid
flowchart TD
  A[Aman Super App Home] --> B[Gold Investment entry]
  B --> C{Onboarded?}
  C -- No --> D[Eligibility check]
  D --> E[KYC / missing information]
  E --> F[Payment method: Aman prepaid balance]
  F --> G[Terms, fees, risk disclosure]
  G --> H[Gold dashboard]
  C -- Yes --> H
  H --> I{Buy or Sell}
  I --> J[Order validation]
  J --> K[Pricing: firm quote with expiry]
  K --> L[Payment: debit / credit prepaid balance]
  L --> M[Gold wallet update]
  M --> N[Transaction confirmation]
  N --> O[Portfolio update]
```

## Onboarding paths
```mermaid
flowchart TD
  A[Customer taps Gold] --> B{Aman profile with KYC data on file?}
  B -- Yes --> C[Account check: reuse data, ask only for missing fields]
  C --> C2[Mobile code] --> C3[Identity review] --> C4[Prepaid card selected] --> C5[Agreements] --> Z[Gold dashboard]
  B -- No --> D[Mobile number] --> E[Verification code] --> F[Create PIN] --> G[Personal details]
  G --> H[ID document: front and back] --> I[Selfie check] --> J[Issue Aman prepaid card + InstaPay top-up]
  J --> K[Agreements] --> Z
```
Prototype control "Customer scenario": (1) existing Aman customer, new to Gold; (2) brand-new customer, nothing on file; (3) existing investor (Ahmed, 20 transactions).
All identity checks are simulated; the list of required data is a configurable checklist, not a statement of legal requirements.

## Exception flows
| Exception | Trigger | Customer sees | System behaviour |
|---|---|---|---|
| Payment failed | Debit fails | "We couldn't complete your transaction." | No gold or cash moved |
| Price expired | Quote older than 30s or price moved 0.5%+ | "The gold price has changed. Please review the updated price." | New quote required |
| Insufficient balance | Total > prepaid balance | "You don't have enough available balance." + Top up via InstaPay | Order blocked |
| Insufficient gold | Sell > holdings | "You don't have enough gold to complete this sale." | Order blocked |
| KYC failure / incomplete | Required field missing | "Please complete your information before investing." | Trading blocked, onboarding link |
| Transaction failed | Provider or system error | "We couldn't complete your transaction." | Balances unchanged (prototype: toggle) |
| Provider unavailable | Partner down | "Gold investment is temporarily unavailable." | Trading disabled, holdings still visible |
| Market volatility | Rapid movement | "Gold prices are changing rapidly. Your final execution price may differ." | Banner on trade screens |

## Customer journey
| Stage | Customer thinks | Screen | Trust cue |
|---|---|---|---|
| Discover | "Gold on Aman?" | Home tile, Landing | Price, spread and risk shown upfront |
| Join | "Do I have to re-enter everything?" | Account check | Existing data reused |
| First buy | "What exactly will I pay?" | Amount, summary | Quantity, price, fee, total, lock timer |
| Confirm | "Did it work?" | Success | ID, before/after balances |
| Track | "Am I up or down?" | Dashboard, Portfolio | Realized vs unrealized P&L |
| Sell | "Where does my money go?" | Sell summary | "Credited to your Aman balance" |
