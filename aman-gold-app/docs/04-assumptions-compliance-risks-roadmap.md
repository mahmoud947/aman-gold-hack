# Assumptions, compliance checklist, risks and roadmap

## Assumptions (never to be treated as facts)
| ID | Assumption | Label |
|---|---|---|
| A1 | 24k gold, priced in EGP per gram | Decided |
| A2 | Provider (mngm/Evolve under discussion) carries regulatory responsibility and custody | TO VALIDATE, in writing |
| A3 | Price source is a third-party provider behind the pricing interface. Demo history uses REAL daily 24k Egypt prices for 22 Aug - 21 Sep 2026 (150currency.com, retrieved 22 Sep 2026; latest live reference ~EGP 7,223/g on 21 Sep, livepriceofgold.com); older history and intraday movement are simulated | ASSUMPTION / reference |
| A4 | All prices, balances, customer, card are simulated | DEMO DATA |
| A5 | Purchases debit the Aman prepaid balance, funded by InstaPay at no cost to Aman; card live in under a month | ASSUMPTION |
| A6 | Revenue is a configurable spread and/or fee; default 0.5% spread per side, no fee | ASSUMPTION |
| A7 | Provider and custody fees are zero | ASSUMPTION |
| A8 | Existing Aman data covers most KYC fields; required fields are a configurable checklist | ASSUMPTION |
| A9 | Minimum and step 0.1 g (provider sells fractional gold in 0.1 g steps, per PM); max EGP 75,000 per order, EGP 150,000 daily | Step: PM statement; limits: ASSUMPTION |
| A10 | Firm quote validity 30 seconds | ASSUMPTION |
| A11 | Average-cost accounting for P&L | ASSUMPTION |
| A12 | Authentication is a simulated PIN | Decided |
| A13 | No pooled model needed: provider (mngm) already sells fractional gold in 0.1 g steps, so customers hold real 0.1 g multiples (PM statement; confirm provider contract, custody and title terms) | TO VALIDATE |

## Compliance and regulatory checklist (all TO VALIDATE; not legal advice)
Regulatory classification, investment licensing (note: the FRA states it regulates gold *fund certificates*, not direct gold trading: source S1 in the Lab), gold ownership structure, custody, KYC/AML, customer disclosures, pricing transparency, tax implications, consumer protection, transaction limits, record keeping, data privacy, partner due diligence, prepaid-card rules for buying gold from balance.

## Risk register
| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| Provider's regulatory role not confirmed | High | Medium | Written confirmation and legal review before build |
| Title/custody model (pooled ledger) undefined | High | Medium | Provider contract: segregation, audit, buy-back |
| Payment succeeds, allocation fails (or reverse) | High | Medium | Order state machine, idempotency, auto-refund, daily reconciliation |
| Price latency / rapid moves | High | Medium | Firm quotes with expiry, slippage rules, volatility banner |
| Unit margin erased by any hidden cost (e.g., top-up fee) | High | Medium | Confirm InstaPay and provider fees in writing |
| Customer misunderstands spread | Medium | High | Spread and total shown on every order screen |
| Fraud (takeover, mule accounts, latency arbitrage) | High | Medium | KYC tiers, limits, velocity rules, quote expiry |
| Liquidity / market closure on sell | Medium | Low | Provider buy-back commitment, cut-off disclosure |
| Prepaid card slip delays gold launch | Medium | Medium | Track card go-live; gold pilot gated on it |

## Roadmap (not approved)
**MVP:** onboarding, buy, sell, portfolio, transactions, P&L.
**Phase 2:** recurring investment, price alerts, gold saving plans, educational content, advanced analytics, Arabic/RTL.
**Phase 3:** potential physical redemption, gold gifting, family accounts, investment plans, partner ecosystem, external cards.
