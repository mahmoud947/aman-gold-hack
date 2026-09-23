import type { Transaction } from "../types";
import { replay } from "./engine";

/**
 * Daily REALIZED P&L, derived from the ledger (never stored).
 * Realized P&L is booked only when gold is sold: net proceeds - average cost of the gold sold. Days without a sale are 0.00.
 * Today's entry is live: it changes as soon as a sale is executed today.
 */
export interface DayPnl { key: string; ts: number; realized: number; soldBasis: number; grams: number; txIds: string[] }

export const dayKey = (ts: number) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const startOfDay = (ts: number) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
/** Calendar-safe (a day can be 23 or 25 hours long around daylight-saving changes). */
export const addDays = (ts: number, n: number) => { const d = new Date(ts); d.setDate(d.getDate() + n); return d.getTime(); };

export function computeDailyPnl(txs: Transaction[], now = Date.now()): DayPnl[] {
  const done = txs.filter((t) => t.status === "Completed").sort((a, b) => a.ts - b.ts);
  if (done.length === 0) return [];
  const full = replay(done);
  const first = startOfDay(done[0].ts), last = startOfDay(now);
  const out: DayPnl[] = [];
  for (let day = first; day <= last; day = addDays(day, 1)) {
    const key = dayKey(day);
    const todays = done.filter((t) => dayKey(t.ts) === key);
    let realized = 0, basis = 0;
    for (const t of todays) { const s = full.sells[t.id]; if (s) { realized += s.realized; basis += s.basis; } }
    const upTo = done.filter((t) => t.ts < addDays(day, 1));
    out.push({ key, ts: day, realized, soldBasis: basis, grams: replay(upTo).grams, txIds: todays.map((t) => t.id) });
  }
  return out;
}

/** Cumulative realized P&L over the last `n` days (ending today), built from the same daily values shown in the calendar. */
export function cumulativeRealized(days: DayPnl[], n = 30, now = Date.now()): { key: string; ts: number; daily: number; cum: number }[] {
  const byKey = new Map(days.map((d) => [d.key, d]));
  const out: { key: string; ts: number; daily: number; cum: number }[] = [];
  let cum = 0;
  for (let i = n - 1; i >= 0; i--) {
    const ts = addDays(startOfDay(now), -i);
    const daily = byKey.get(dayKey(ts))?.realized ?? 0;
    cum += daily;
    out.push({ key: dayKey(ts), ts, daily, cum });
  }
  return out;
}
