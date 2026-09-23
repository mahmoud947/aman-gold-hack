import { PRODUCT_CONFIG } from "../config/product";
import type { Transaction, WalletSummary } from "../types";
import { round2, round4 } from "../utils/format";

/** Centralized transaction and wallet math. Pure functions; no UI, no storage. */

export interface BuyQuote { investment: number; fee: number; total: number; grams: number; price: number; snapped: boolean }
export interface SellQuote { grams: number; gross: number; fee: number; net: number; price: number }

const feeOf = (amount: number) => round2((amount * PRODUCT_CONFIG.pricing.transactionFeePct) / 100);

const STEP = PRODUCT_CONFIG.limits.quantityStepGrams;
/** Gold is sold in fixed steps (0.1 g). Work in integer steps to avoid float drift. */
export const snapDown = (g: number) => Math.floor(g / STEP + 1e-9) * STEP;
export const isStep = (g: number) => Math.abs(g / STEP - Math.round(g / STEP)) < 1e-9;
const clean = (g: number) => Math.round(g * 1e4) / 1e4;
export const minPurchaseEgp = (buyPrice: number) => round2(PRODUCT_CONFIG.limits.minGrams * buyPrice);

/**
 * BUY by grams (must be a 0.1 g step) or by EGP (rounded DOWN to the nearest step; the remainder is not spent).
 * Investment = grams x buy price; fee (if any) is added on top.
 */
export function quoteBuy(input: { grams?: number; egp?: number }, buyPrice: number): BuyQuote {
  const requested = input.grams !== undefined ? input.grams : (input.egp ?? 0) / buyPrice;
  const grams = input.grams !== undefined ? clean(requested) : clean(snapDown(requested));
  const investment = round2(grams * buyPrice);
  const fee = feeOf(investment);
  return { investment, fee, total: round2(investment + fee), grams, price: buyPrice, snapped: input.egp !== undefined };
}

/** SELL: by grams or by EGP gross value. Fee (if any) is deducted from proceeds. */
export function quoteSell(input: { grams?: number; egp?: number }, sellPrice: number): SellQuote {
  const grams = input.grams !== undefined ? clean(input.grams) : clean(snapDown((input.egp ?? 0) / sellPrice));
  const gross = round2(grams * sellPrice);
  const fee = feeOf(gross);
  return { grams, gross, fee, net: round2(gross - fee), price: sellPrice };
}

export type TradeError =
  | "INSUFFICIENT_BALANCE" | "INSUFFICIENT_GOLD" | "BELOW_MIN" | "NOT_STEP" | "ABOVE_MAX" | "DAILY_LIMIT"
  | "KYC_INCOMPLETE" | "PROVIDER_UNAVAILABLE" | null;

export const ERROR_TEXT: Record<Exclude<TradeError, null>, string> = {
  INSUFFICIENT_BALANCE: "You don't have enough available balance.",
  INSUFFICIENT_GOLD: "You don't have enough gold to complete this sale.",
  BELOW_MIN: `The minimum is ${PRODUCT_CONFIG.limits.minGrams} g.`,
  NOT_STEP: `Gold is bought and sold in steps of ${PRODUCT_CONFIG.limits.quantityStepGrams} g.`,
  ABOVE_MAX: `The maximum investment per order is EGP ${PRODUCT_CONFIG.limits.maxInvestmentEgp.toLocaleString()}.`,
  DAILY_LIMIT: "This order exceeds your daily limit.",
  KYC_INCOMPLETE: "Please complete your information before investing.",
  PROVIDER_UNAVAILABLE: "Gold investment is temporarily unavailable.",
};

export function validateBuy(q: BuyQuote, cash: number, todayBuyEgp: number, kycOk: boolean, providerUp: boolean): TradeError {
  if (!kycOk) return "KYC_INCOMPLETE";
  if (!providerUp) return "PROVIDER_UNAVAILABLE";
  if (q.grams < PRODUCT_CONFIG.limits.minGrams - 1e-9) return "BELOW_MIN";
  if (!isStep(q.grams)) return "NOT_STEP";
  if (q.investment > PRODUCT_CONFIG.limits.maxInvestmentEgp) return "ABOVE_MAX";
  if (todayBuyEgp + q.total > PRODUCT_CONFIG.limits.dailyBuyLimitEgp) return "DAILY_LIMIT";
  if (q.total > cash) return "INSUFFICIENT_BALANCE";
  return null;
}
export function validateSell(q: SellQuote, heldGrams: number, providerUp: boolean): TradeError {
  if (!providerUp) return "PROVIDER_UNAVAILABLE";
  if (q.grams < PRODUCT_CONFIG.limits.minGrams - 1e-9) return "BELOW_MIN";
  if (!isStep(q.grams)) return "NOT_STEP";
  if (q.grams > heldGrams + 1e-9) return "INSUFFICIENT_GOLD";
  return null;
}

/** Cash balance is derived from the ledger: base (opening cash + top-ups) - buys + sells. Never stored. */
export function computeCash(base: number, txs: Transaction[]): number {
  return round2(txs.filter((t) => t.status === "Completed").reduce((c, t) => (t.type === "BUY" ? c - t.net : c + t.net), base));
}

/**
 * Average-cost wallet replay (ledger is replayed in time order).
 * Unrealized P&L = grams held x current sell price - cost basis of the grams held, i.e. (sell price - average buy price) x grams.
 * Realized P&L = net proceeds - average cost of the gold sold.
 */
export function replay(txs: Transaction[]) {
  let grams = 0, cost = 0, realized = 0;
  const sells: Record<string, { realized: number; basis: number }> = {};
  const done = txs.filter((t) => t.status === "Completed").sort((a, b) => a.ts - b.ts);
  for (const t of done) {
    if (t.type === "BUY") { grams += t.grams; cost += t.net; } // fees are part of cost basis
    else {
      const sold = Math.min(t.grams, grams); // can never sell more than is held
      const avg = grams > 0 ? cost / grams : 0;
      const basisSold = avg * sold;
      const r = (t.net * sold) / (t.grams || 1) - basisSold;
      realized += r; sells[t.id] = { realized: r, basis: basisSold };
      cost -= basisSold; grams -= sold;
    }
  }
  if (grams < 1e-9) { grams = 0; cost = 0; }
  return { grams, cost, realized, sells };
}

export function computeWallet(txs: Transaction[], sellPrice: number): WalletSummary {
  const { grams, cost, realized } = replay(txs);
  const marketValue = grams * sellPrice;
  const unrealized = marketValue - cost;
  return {
    grams, costBasis: cost, avgBuyPrice: grams > 0 ? cost / grams : 0, marketValue,
    unrealizedPnl: unrealized, unrealizedPct: cost > 0 ? (unrealized / cost) * 100 : 0,
    realizedPnl: realized, totalPnl: realized + unrealized,
  };
}

/** Pure and deterministic: next id after the highest existing one (first new id after the seed is GOLD-000123). */
export const nextTxId = (existing: Transaction[]) => {
  const max = existing.reduce((m, t) => Math.max(m, Number(t.id.split("-")[1]) || 0), 122);
  return `GOLD-${String(max + 1).padStart(6, "0")}`;
};

export function buildBuy(q: BuyQuote, cash: number, goldGrams: number, existing: Transaction[], now = Date.now()): Transaction {
  return {
    id: nextTxId(existing), type: "BUY", ts: now, grams: q.grams, pricePerGram: q.price, gross: round2(q.grams * q.price), fee: q.fee, net: q.total,
    status: "Completed", paymentMethod: `${PRODUCT_CONFIG.payment.method} ${PRODUCT_CONFIG.payment.maskedCard.slice(-4)}`,
    cashBefore: cash, cashAfter: round2(cash - q.total), goldBefore: goldGrams, goldAfter: round4(goldGrams + q.grams),
  };
}
export function buildSell(q: SellQuote, cash: number, goldGrams: number, existing: Transaction[], now = Date.now()): Transaction {
  const w = computeWallet(existing, q.price);
  const realized = q.net - w.avgBuyPrice * q.grams;
  return {
    id: nextTxId(existing), type: "SELL", ts: now, grams: q.grams, pricePerGram: q.price, gross: q.gross, fee: q.fee, net: q.net,
    status: "Completed", paymentMethod: "Credited to Aman Prepaid Balance",
    cashBefore: cash, cashAfter: round2(cash + q.net), goldBefore: goldGrams, goldAfter: round4(goldGrams - q.grams), realizedPnl: round2(realized),
  };
}
