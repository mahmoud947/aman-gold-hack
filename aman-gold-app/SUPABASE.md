# Supabase: gold price history

The prototype reads real Egypt 24k gold reference prices from a Supabase table instead of only a hardcoded array.

## Project
- Project: `aman-gold` (org: Toukhianz's Org), region `eu-central-1`, free tier ($0/month).
- Table: `public.gold_price_history` — `ts`, `price_egp_per_gram`, `granularity` (`day` | `half_hour`), `source` (`real` | `simulated`), `note`.
- RLS: enabled, public **read-only** policy for `anon`/`authenticated`. No insert/update/delete policy exists, so the client anon key can never write.

## Data
- **31 rows, `source = 'real'`, `granularity = 'day'`**: 22 Aug – 21 Sep 2026, sourced from 150currency.com (retrieved 22 Sep 2026). This is the same data previously hardcoded in `data/marketHistory.ts`.
- **562 rows, `source = 'simulated'`, `granularity = 'half_hour'`**: generated intraday ticks, seeded so each day bridges from the previous day's real close to that day's real close (deterministic, reproducible). Full 30-minute coverage for 22 Aug – 1 Sep; the most recent trading day (21 Sep) also has full coverage, used to shape the live "1D" chart.
- Nothing in the table is a live trading feed. `source` always tells you which rows are verified vs. generated — see `delivery-pack/gen-seed-sql.js` for the exact generation script.

## Wiring
- `services/supabase.ts` — anon client, `null` if env vars are missing.
- `services/history.ts` — fetches the table once on app load; local static-array fallback (identical real values) if the fetch fails or Supabase is unreachable. Never blocks rendering.
- `services/pricing.ts` — `1W`/`1M`/`3M`/`1Y` charts use the daily closes (DB or fallback); the `1D` chart is shaped by the real 21 Sep intraday ticks, rescaled to end at the live simulated price.
- `components/PriceChart.tsx` shows a small caption naming the actual data source (`Aman Gold price database` vs `local reference data`) so nobody mistakes DEMO data for verified data.

## Local setup
Copy `.env.local.example` to `.env.local` (not committed) with:
```
NEXT_PUBLIC_SUPABASE_URL=https://qrfzkatkcuipgqxfltwe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key, ask the project owner>
```
The anon key is public-by-design and RLS-restricted to read-only; it is still kept out of git as house style, not because it's a secret.
