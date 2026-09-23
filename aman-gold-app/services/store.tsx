"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEMO_CUSTOMER, DEMO_OPENING_CASH, buildSeed } from "../data/seed";
import type { Customer, Quote, Transaction, TxType } from "../types";
import { buildBuy, buildSell, computeCash, computeWallet, validateBuy, validateSell, quoteBuy, quoteSell, type BuyQuote, type SellQuote } from "./engine";
import { getBuyPrice, getCurrentGoldPrice, getSellPrice, isProviderAvailable, marketControls } from "./pricing";
import { PRODUCT_CONFIG } from "../config/product";

const KEY = "aman-gold-app-v4";
/** new = existing Aman customer (data on file) who is new to Gold; existing = existing gold investor (Ahmed); brandNew = new customer with nothing on file. */
export type Mode = "new" | "existing" | "brandNew";

/**
 * The transaction LEDGER is the single source of truth.
 * Cash balance and gold balance are always DERIVED from it (opening cash + top-ups + sells - buys), never stored,
 * so they cannot drift from the transaction history.
 */
interface Persisted {
  mode: Mode; onboarded: boolean; openingCash: number; topUps: number; txs: Transaction[]; customer: Customer;
  kycMissing: boolean; failNext: boolean; volatility: boolean;
}

const fresh = (mode: Mode): Persisted => {
  if (mode === "existing") {
    const seed = buildSeed();
    return { mode, onboarded: true, openingCash: seed.openingCash, topUps: 0, txs: seed.txs, customer: { ...DEMO_CUSTOMER }, kycMissing: false, failNext: false, volatility: false };
  }
  if (mode === "brandNew") {
    return { mode, onboarded: false, openingCash: 0, topUps: 0, txs: [], customer: { name: "", mobile: "", nationalIdMasked: "", dob: "", address: null, nationality: "", accountStatus: "No Aman account yet" }, kycMissing: false, failNext: false, volatility: false };
  }
  return { mode, onboarded: false, openingCash: DEMO_OPENING_CASH, topUps: 0, txs: [], customer: { ...DEMO_CUSTOMER }, kycMissing: false, failNext: false, volatility: false };
};

interface Store extends Persisted {
  version: number;
  providerUp: boolean;
  cash: number;
  wallet: ReturnType<typeof computeWallet>;
  buyPrice: number; sellPrice: number;
  todayBuyEgp: number;
  kycOk: boolean;
  setMode: (m: Mode) => void;
  set: (patch: Partial<Persisted>) => void;
  completeOnboarding: () => void;
  completeKyc: () => void;
  makeQuote: (side: TxType) => Quote;
  executeBuy: (q: BuyQuote) => Promise<Transaction>;
  executeSell: (q: SellQuote) => Promise<Transaction>;
  topUp: (amount: number) => void;
  shock: (pct: number) => void;
  setProviderUp: (v: boolean) => void;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => { const s = useContext(Ctx); if (!s) throw new Error("StoreProvider missing"); return s; };

const kycOkOf = (p: Persisted) => !p.kycMissing && p.customer.address !== null;
const todayBuyOf = (p: Persisted) => {
  const d = new Date().toDateString();
  return p.txs.filter((t) => t.type === "BUY" && t.status === "Completed" && new Date(t.ts).toDateString() === d).reduce((a, t) => a + t.net, 0);
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Persisted>(() => fresh("new"));
  const [version, setVersion] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  // `master` is updated synchronously by apply(), so two rapid actions can never read stale state.
  const master = useRef<Persisted>(s);
  const busy = useRef(false);

  const apply = useCallback((fn: (p: Persisted) => Persisted) => {
    const next = fn(master.current);
    master.current = next;
    setS(next);
    return next;
  }, []);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) apply(() => JSON.parse(raw) as Persisted); } catch { /* ignore */ }
    setHydrated(true);
  }, [apply]);
  useEffect(() => { if (hydrated) try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } }, [s, hydrated]);
  useEffect(() => marketControls.subscribe(() => setVersion((v) => v + 1)), []);
  useEffect(() => { const id = setInterval(() => marketControls.tick(), 8000); return () => clearInterval(id); }, []);

  const sellPrice = getSellPrice();
  const buyPrice = getBuyPrice();
  const wallet = useMemo(() => computeWallet(s.txs, sellPrice), [s.txs, sellPrice]);
  const cash = useMemo(() => computeCash(s.openingCash + s.topUps, s.txs), [s.openingCash, s.topUps, s.txs]);

  const set = useCallback((patch: Partial<Persisted>) => { apply((p) => ({ ...p, ...patch })); }, [apply]);
  const setMode = useCallback((m: Mode) => { marketControls.reset(); busy.current = false; apply(() => fresh(m)); }, [apply]);
  const completeKyc = useCallback(() => { apply((p) => ({ ...p, kycMissing: false, customer: { ...p.customer, address: p.customer.address ?? "12 Example St, Nasr City, Cairo" } })); }, [apply]);
  const completeOnboarding = useCallback(() => { apply((p) => ({ ...p, onboarded: true })); }, [apply]);

  const makeQuote = useCallback((side: TxType): Quote => ({
    side, price: side === "BUY" ? getBuyPrice() : getSellPrice(), mid: getCurrentGoldPrice(),
    expiresAt: Date.now() + PRODUCT_CONFIG.quoteValiditySeconds * 1000,
  }), []);

  /**
   * Execute an order. One order at a time (busy lock), all checks re-run against the latest ledger at the
   * moment of commit, and exactly one transaction is appended.
   */
  const execute = useCallback(async (side: TxType, q: BuyQuote | SellQuote): Promise<Transaction> => {
    if (busy.current) throw new Error("BUSY");
    busy.current = true;
    try {
      await new Promise((r) => setTimeout(r, 1800));
      const p = master.current;
      if (p.failNext) { apply((x) => ({ ...x, failNext: false })); throw new Error("TX_FAILED"); }
      const cashNow = computeCash(p.openingCash + p.topUps, p.txs);
      const held = computeWallet(p.txs, getSellPrice()).grams;
      const err = side === "BUY"
        ? validateBuy(q as BuyQuote, cashNow, todayBuyOf(p), kycOkOf(p), isProviderAvailable())
        : validateSell(q as SellQuote, held, isProviderAvailable());
      if (err) throw new Error("TX_FAILED");
      const tx = side === "BUY" ? buildBuy(q as BuyQuote, cashNow, held, p.txs) : buildSell(q as SellQuote, cashNow, held, p.txs);
      apply((x) => ({ ...x, txs: [...x.txs, tx] }));
      return tx;
    } finally { busy.current = false; }
  }, [apply]);
  const executeBuy = useCallback((q: BuyQuote) => execute("BUY", q), [execute]);
  const executeSell = useCallback((q: SellQuote) => execute("SELL", q), [execute]);

  const topUp = useCallback((amount: number) => { apply((p) => ({ ...p, topUps: p.topUps + amount })); }, [apply]);
  const shock = useCallback((pct: number) => marketControls.shock(pct), []);
  const setProviderUp = useCallback((v: boolean) => marketControls.setAvailable(v), []);

  const value: Store = {
    ...s, version, providerUp: isProviderAvailable(), cash, wallet, buyPrice, sellPrice, todayBuyEgp: todayBuyOf(s), kycOk: kycOkOf(s),
    setMode, set, completeOnboarding, completeKyc, makeQuote, executeBuy, executeSell, topUp, shock, setProviderUp,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { quoteBuy, quoteSell };
