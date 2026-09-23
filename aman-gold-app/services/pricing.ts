import { PRODUCT_CONFIG } from "../config/product";
import { getDailyHistory, getHistorySource, getIntradayHistory } from "./history";
import type { MarketDataProvider, PricePoint, Range } from "../types";

/**
 * MOCK market data provider (DEMO). Simulated prices only.
 * To go live, implement MarketDataProvider against the selected gold/liquidity provider and
 * change `provider` below. The UI only calls the exported functions, never the mock directly.
 *
 * Real daily closes (and, for the most recent day, real-anchored intraday ticks) come from the Supabase
 * `gold_price_history` table via services/history.ts, with a local static-array fallback if the DB is
 * unreachable — see that file for details. Everything is still DEMO/simulated beyond that seeded window.
 */
// Reference price: ~EGP 7,223 per gram of 24k gold in Egypt, 21 Sep 2026, 23:27 Cairo (livepriceofgold.com via web search).
// Other Egyptian sites showed 7,217-7,290 the same day. Used only as a starting example; all later movement is simulated.
const ANCHOR_MID = 7223;
const spreadFactor = () => PRODUCT_CONFIG.pricing.spreadPctPerSide / 100;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

class MockProvider implements MarketDataProvider {
  private mid = ANCHOR_MID;
  private available = true;
  private listeners = new Set<() => void>();

  getCurrentGoldPrice() { return this.mid; }
  getBuyPrice() { return round(this.mid * (1 + spreadFactor())); }
  getSellPrice() { return round(this.mid * (1 - spreadFactor())); }
  isAvailable() { return this.available; }

  getHistoricalGoldPrices(range: Range): PricePoint[] {
    if (range !== "1D") return this.dailyHistory(range);
    return this.intradayHistory();
  }

  /**
   * 1D: prefer the real-anchored half-hourly ticks for the most recent seeded trading day (from the DB, see
   * services/history.ts), rescaled to end at the current live price so the chart is continuous. Falls back to
   * a fully simulated intraday path if no DB intraday data has loaded (or none exists for that day).
   */
  private intradayHistory(): PricePoint[] {
    const real = getIntradayHistory();
    const now = Date.now();
    if (real.length > 0) {
      const lastReal = real[real.length - 1].p;
      const scale = this.mid / lastReal;
      return [...real.map((pt) => ({ t: pt.t, p: Math.round(pt.p * scale * 100) / 100 })), { t: now, p: this.mid }];
    }
    // No DB intraday available: simulated path ending at the current price.
    const n = 48, step = 30 * 60_000, vol = 0.0011;
    const rnd = seeded(97);
    const pts: PricePoint[] = [{ t: now, p: this.mid }];
    let p = this.mid;
    for (let i = 1; i < n; i++) {
      p = p / (1 + 0.00005 + (rnd() - 0.5) * 2 * vol);
      pts.unshift({ t: now - i * step, p: Math.round(p * 100) / 100 });
    }
    return pts;
  }

  /** 1W / 1M / 3M / 1Y: real daily closes (DB or local fallback, see services/history.ts); older history is simulated backwards (DEMO). */
  private dailyHistory(range: Range): PricePoint[] {
    const need = { "1D": 1, "1W": 7, "1M": 31, "3M": 92, "1Y": 365 }[range];
    const pts: PricePoint[] = [...getDailyHistory()];
    const rnd = seeded(4242);
    let p = pts[0].p, t = pts[0].t;
    while (pts.length < need) {
      p = p / (1 + 0.0007 + (rnd() - 0.5) * 2 * 0.0065);
      t -= 86_400_000;
      pts.unshift({ t, p: Math.round(p * 100) / 100 });
    }
    const out = pts.slice(-need);
    out.push({ t: Date.now(), p: this.mid });
    return out;
  }

  /** Simulated live tick (small mean-reverting move). */
  tick() {
    const drift = (ANCHOR_MID - this.mid) * 0.02;
    this.mid = Math.round((this.mid * (1 + (Math.random() - 0.5) * 0.0006) + drift) * 100) / 100;
    this.listeners.forEach((l) => l());
  }
  shock(pctMove: number) { this.mid = Math.round(this.mid * (1 + pctMove / 100) * 100) / 100; this.listeners.forEach((l) => l()); }
  setAvailable(v: boolean) { this.available = v; this.listeners.forEach((l) => l()); }
  subscribe(l: () => void) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
  reset() { this.mid = ANCHOR_MID; this.available = true; this.listeners.forEach((l) => l()); }
}

const round = (n: number) => Math.round(n * 100) / 100;
const provider = new MockProvider();

// ---- Public API consumed by the UI (swap `provider` for a real implementation later) ----
export const getCurrentGoldPrice = () => provider.getCurrentGoldPrice();
export const getHistoricalGoldPrices = (r: Range) => provider.getHistoricalGoldPrices(r);
export const getBuyPrice = () => provider.getBuyPrice();
export const getSellPrice = () => provider.getSellPrice();
export const isProviderAvailable = () => provider.isAvailable();
export const dataSource = () => getHistorySource();
export const marketControls = {
  tick: () => provider.tick(), shock: (p: number) => provider.shock(p),
  setAvailable: (v: boolean) => provider.setAvailable(v), subscribe: (l: () => void) => provider.subscribe(l), reset: () => provider.reset(),
};
