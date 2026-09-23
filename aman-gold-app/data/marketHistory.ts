/**
 * REAL daily reference prices: 24k gold, EGP per gram, Egypt.
 * Source: 150currency.com "Gold Price in Egypt" history table, retrieved 22 Sep 2026 via web search.
 * These are reference (mid-market) prices, not Aman prices; Aman's buy/sell prices are derived with the configurable spread.
 * Older history (before 22 Aug 2026) is SIMULATED in the pricing service (DEMO).
 */
export const REAL_DAILY_24K: [string, number][] = [
  ["2026-08-22", 7536.94], ["2026-08-23", 7536.94], ["2026-08-24", 7551.05], ["2026-08-25", 7539.52], ["2026-08-26", 7445.97],
  ["2026-08-27", 7447.45], ["2026-08-28", 7213.40], ["2026-08-29", 7214.21], ["2026-08-30", 7148.38], ["2026-08-31", 7262.58],
  ["2026-09-01", 7105.02], ["2026-09-02", 7199.34], ["2026-09-03", 7329.66], ["2026-09-04", 7248.77], ["2026-09-05", 7244.97],
  ["2026-09-06", 7248.48], ["2026-09-07", 7212.40], ["2026-09-08", 7195.04], ["2026-09-09", 7283.11], ["2026-09-10", 7181.11],
  ["2026-09-11", 7211.92], ["2026-09-12", 7180.20], ["2026-09-13", 7170.15], ["2026-09-14", 7150.56], ["2026-09-15", 7136.07],
  ["2026-09-16", 7329.27], ["2026-09-17", 7312.71], ["2026-09-18", 7352.25], ["2026-09-19", 7351.78], ["2026-09-20", 7368.16],
  ["2026-09-21", 7265.47],
];
export const MARKET_HISTORY_SOURCE = "150currency.com, retrieved 22 Sep 2026";
