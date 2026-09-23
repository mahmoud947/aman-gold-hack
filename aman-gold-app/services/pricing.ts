import { PRODUCT_CONFIG } from "../config/product";
import { REAL_DAILY_24K } from "../data/marketHistory";
import type { MarketDataProvider, PricePoint, Range } from "../types";

/**
 * MOCK market data provider (DEMO). Simulated prices only.
 * To go live, implement MarketDataProvider against the selected gold/liquidity provider and
 * change `provider` below. The UI only calls the exported functions, never the mock directly.
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
    // 1D: simulated intraday path that ends at the current price (no intraday history source connected).
    const n = 48, step = 30 * 60_000, vol = 0.0011;
    const rnd = seeded(range.charCodeAt(0) * 97 + range.length);
    const now = Date.now();
    const pts: PricePoint[] = [{ t: now, p: this.mid }];
    let p = this.mid;
    for (let i = 1; i < n; i++) {
      p = p / (1 + 0.00005 + (rnd() - 0.5) * 2 * vol);
      pts.unshift({ t: now - i * step, p: Math.round(p * 100) / 100 });
    }
    return pts;
  }

  /** 1W / 1M use REAL daily reference prices (data/marketHistory.ts); older history is simulated backwards (DEMO). */
  private dailyHistory(range: Range): PricePoint[] {
    const need = { "1D": 1, "1W": 7, "1M": 31, "3M": 92, "1Y": 365 }[range];
    const pts: PricePoint[] = REAL_DAILY_24K.map(([d, p]) => ({ t: new Date(d + "T12:00:00").getTime(), p }));
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
export const marketControls = {
  tick: () => provider.tick(), shock: (p: number) => provider.shock(p),
  setAvailable: (v: boolean) => provider.setAvailable(v), subscribe: (l: () => void) => provider.subscribe(l), reset: () => provider.reset(),
};
