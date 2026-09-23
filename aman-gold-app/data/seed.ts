import { PRODUCT_CONFIG } from "../config/product";
import { round2, round4 } from "../utils/format";
import type { Customer, Transaction } from "../types";

/** DEMO DATA. Fictional customer, masked card. Not real Aman data. */
export const DEMO_CUSTOMER: Customer = {
  name: "Ahmed Hassan", mobile: "+20 100 123 4567", nationalIdMasked: "2900******1234", dob: "14 Mar 1990",
  address: "12 Example St, Nasr City, Cairo", nationality: "Egyptian", accountStatus: "Active Aman account",
};

export const DEMO_CASH = 25000; // prepaid balance after the last seeded transaction (existing investor)
export const DEMO_OPENING_CASH = 25000; // prepaid balance for a new-to-Gold customer

/**
 * Existing-investor ledger, 24 Aug - 21 Sep 2026, priced on REAL daily 24k Egypt prices (data/marketHistory.ts).
 * BUY price = day price x (1 + 0.5% spread); SELL price = day price x (1 - 0.5% spread).
 * The sell days were chosen to give a realistic mix of winning and losing days; every number below is produced by the
 * same average-cost engine the app uses (realized P&L is never typed in). Quantities are 0.1 g multiples.
 */
const RAW: [("BUY" | "SELL"), number, number, string][] = [
  ["BUY", 1.0, 7588.81, "2026-08-24T11:20"], ["BUY", 2.0, 7249.47, "2026-08-28T13:05"], ["BUY", 3.0, 7184.12, "2026-08-30T10:42"],
  ["BUY", 3.0, 7140.55, "2026-09-01T12:15"], ["SELL", 1.0, 7293.01, "2026-09-03T14:30"], ["SELL", 0.5, 7212.53, "2026-09-04T11:10"],
  ["BUY", 1.0, 7281.19, "2026-09-05T16:25"], ["SELL", 1.0, 7159.06, "2026-09-08T10:05"], ["SELL", 1.5, 7246.69, "2026-09-09T15:40"],
  ["BUY", 1.0, 7217.02, "2026-09-10T12:50"], ["SELL", 0.5, 7175.86, "2026-09-11T13:35"], ["SELL", 0.5, 7144.30, "2026-09-12T11:55"],
  ["BUY", 2.0, 7186.31, "2026-09-14T09:45"], ["BUY", 1.0, 7171.75, "2026-09-15T14:15"], ["SELL", 1.5, 7292.62, "2026-09-16T10:30"],
  ["SELL", 1.0, 7276.15, "2026-09-17T15:20"], ["SELL", 1.0, 7315.49, "2026-09-18T12:00"], ["SELL", 0.5, 7315.02, "2026-09-19T13:10"],
  ["SELL", 0.5, 7331.32, "2026-09-20T11:45"], ["BUY", 1.0, 7301.80, "2026-09-21T16:05"],
];

export function buildSeed(): { txs: Transaction[]; openingCash: number } {
  const feePct = PRODUCT_CONFIG.pricing.transactionFeePct / 100;
  const deltas = RAW.map(([type, g, p]) => { const gross = round2(g * p); return type === "BUY" ? -gross : gross; });
  // Opening cash is derived backwards so the final prepaid balance equals DEMO_CASH.
  const openingCash = round2(DEMO_CASH - deltas.reduce((a, b) => a + b, 0));
  const out: Transaction[] = [];
  let cash = openingCash, gold = 0, cost = 0;
  RAW.forEach(([type, g, p, iso], i) => {
    const gross = round2(g * p);
    const fee = round2(gross * feePct);
    const t: Transaction = {
      id: `GOLD-${String(100 + i).padStart(6, "0")}`, type, ts: new Date(iso).getTime(), grams: g, pricePerGram: p, gross, fee,
      net: type === "BUY" ? round2(gross + fee) : round2(gross - fee), status: "Completed",
      paymentMethod: type === "BUY" ? `${PRODUCT_CONFIG.payment.method} ${PRODUCT_CONFIG.payment.maskedCard.slice(-4)}` : "Credited to Aman Prepaid Balance",
      cashBefore: cash, cashAfter: 0, goldBefore: round4(gold), goldAfter: 0,
    };
    if (type === "BUY") { cash -= t.net; gold += g; cost += t.net; }
    else { const avg = cost / gold; t.realizedPnl = round2(t.net - avg * g); cash += t.net; cost -= avg * g; gold -= g; }
    t.cashAfter = round2(cash); t.goldAfter = round4(gold);
    out.push(t);
  });
  return { txs: out, openingCash };
}
