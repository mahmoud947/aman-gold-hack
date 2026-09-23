/**
 * Aman Gold - centralized product configuration.
 * EVERY value here is an MVP ASSUMPTION (configurable), not an Aman fact or a regulatory requirement.
 * UI components must read from here (via services), never hardcode business values.
 */
export const PRODUCT_CONFIG = {
  metal: "24k gold",
  currency: "EGP",
  unit: "gram",

  /** ASSUMPTION: revenue model. Default = business-case model (spread only, no fee). */
  pricing: {
    spreadPctPerSide: 0.5, // buy = mid * (1 + s), sell = mid * (1 - s)
    transactionFeePct: 0, // % of gross; 0 in the business-case model
  },

  /** ASSUMPTION: placeholders for limits, to be set by Risk/Compliance. */
  /** Provider sells fractional gold in 0.1 g steps (mngm, per PM), so 0.1 g is the minimum and the step for buy AND sell. */
  limits: {
    quantityStepGrams: 0.1,
    minGrams: 0.1,
    maxInvestmentEgp: 75000,
    dailyBuyLimitEgp: 150000,
    dailySellLimitEgp: 150000,
  },

  /** ASSUMPTION: firm-quote window. Provider quote terms are unknown. */
  quoteValiditySeconds: 30,

  /** ASSUMPTION: funding is the Aman prepaid card balance, topped up via InstaPay. No payment gateway. */
  payment: {
    method: "Aman Prepaid Card",
    maskedCard: "**** **** **** 4582",
    topUpRail: "InstaPay",
    gatewayCostPct: 0, // PM statement; to be confirmed
    settlement: "Instant debit from prepaid balance; provider settlement is out of scope for the prototype",
    quickGrams: [0.1, 0.5, 1, 2, 5],
    quickAmountsEgp: [1000, 2500, 5000, 10000],
  },

  /** ASSUMPTION: which KYC fields the gold product needs. Configurable checklist, NOT a legal requirement. */
  kycFields: ["Full name", "National ID", "Date of birth", "Address", "Nationality"] as const,

  /** ASSUMPTION: eligibility rules. */
  eligibility: { requiresMobileVerified: true, requiresKyc: true },

  /** Labels used across the prototype so nothing implies approval. */
  labels: {
    demo: "DEMO DATA",
    assumption: "Configurable assumption",
    notAdvice: "Prototype only. Prices are simulated. Not investment advice. Regulatory structure to be validated.",
  },
} as const;

export type ProductConfig = typeof PRODUCT_CONFIG;
