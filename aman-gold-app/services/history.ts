import { REAL_DAILY_24K } from "../data/marketHistory";
import { supabase } from "./supabase";
import type { PricePoint } from "../types";

/**
 * Loads the real daily closes (and, for the most recent trading day, half-hourly intraday ticks) from the
 * `gold_price_history` table in Supabase (see delivery-pack/gen-seed-sql.js for how it was seeded: 22 Aug -
 * 21 Sep 2026, real closes from 150currency.com, intraday ticks are SIMULATED and labelled as such in the DB).
 *
 * This never blocks rendering: pricing.ts starts with the local static array (identical numbers) and swaps in
 * the DB-sourced arrays once the fetch resolves. If Supabase is unreachable (offline, missing .env.local), the
 * static fallback is used silently and the app behaves exactly as before this was wired up.
 */
let daily: PricePoint[] = REAL_DAILY_24K.map(([d, p]) => ({ t: new Date(d + "T15:00:00Z").getTime(), p }));
let intraday: PricePoint[] = [];
let source: "database" | "local fallback" = "local fallback";
let loaded = false;
const listeners = new Set<() => void>();

export function getDailyHistory(): PricePoint[] { return daily; }
export function getIntradayHistory(): PricePoint[] { return intraday; }
export function getHistorySource(): "database" | "local fallback" { return source; }
export function isHistoryLoaded(): boolean { return loaded; }
export function subscribeHistory(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); }

export async function loadHistoryFromDb(): Promise<void> {
  if (!supabase) { loaded = true; return; } // no env vars configured: keep the static fallback
  try {
    const { data, error } = await supabase
      .from("gold_price_history")
      .select("ts, price_egp_per_gram, granularity")
      .order("ts", { ascending: true });
    if (error || !data || data.length === 0) throw error ?? new Error("empty result");

    const day = data.filter((r) => r.granularity === "day").map((r) => ({ t: new Date(r.ts).getTime(), p: Number(r.price_egp_per_gram) }));
    const halfHour = data.filter((r) => r.granularity === "half_hour").map((r) => ({ t: new Date(r.ts).getTime(), p: Number(r.price_egp_per_gram) }));
    if (day.length > 0) daily = day;
    intraday = halfHour;
    source = "database";
  } catch {
    // Network error, RLS issue, or table not reachable: silently keep the local static fallback.
    source = "local fallback";
  } finally {
    loaded = true;
    listeners.forEach((l) => l());
  }
}
