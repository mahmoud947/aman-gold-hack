// Generates the SQL seed for gold_price_history: real daily closes + synthetic half-hourly intraday ticks.
// Reuses the exact REAL_DAILY_24K reference data already sourced for the prototype.
const REAL_DAILY_24K = [
  ["2026-08-22", 7536.94], ["2026-08-23", 7536.94], ["2026-08-24", 7551.05], ["2026-08-25", 7539.52], ["2026-08-26", 7445.97],
  ["2026-08-27", 7447.45], ["2026-08-28", 7213.40], ["2026-08-29", 7214.21], ["2026-08-30", 7148.38], ["2026-08-31", 7262.58],
  ["2026-09-01", 7105.02], ["2026-09-02", 7199.34], ["2026-09-03", 7329.66], ["2026-09-04", 7248.77], ["2026-09-05", 7244.97],
  ["2026-09-06", 7248.48], ["2026-09-07", 7212.40], ["2026-09-08", 7195.04], ["2026-09-09", 7283.11], ["2026-09-10", 7181.11],
  ["2026-09-11", 7211.92], ["2026-09-12", 7180.20], ["2026-09-13", 7170.15], ["2026-09-14", 7150.56], ["2026-09-15", 7136.07],
  ["2026-09-16", 7329.27], ["2026-09-17", 7312.71], ["2026-09-18", 7352.25], ["2026-09-19", 7351.78], ["2026-09-20", 7368.16],
  ["2026-09-21", 7265.47],
];

function seeded(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const rows = []; // [ts_iso, price, granularity, source, note]
const NP = REAL_DAILY_24K.length;

for (let i = 0; i < NP; i++) {
  const [date, close] = REAL_DAILY_24K[i];
  // Real daily close, recorded at end of trading day (17:00 Cairo ~ 15:00 UTC, approximation).
  rows.push([`${date}T15:00:00Z`, close.toFixed(2), "day", "real", "Daily close, 150currency.com (retrieved 22 Sep 2026)"]);

  // Synthetic half-hourly intraday path for this day: 48 points from 00:00 to 23:30,
  // starting near the PREVIOUS day's close and random-walking to land on THIS day's close at 15:00 (the "close" tick),
  // then drifting slightly after-hours. Deterministic per-day seed so it's reproducible.
  const prevClose = i > 0 ? REAL_DAILY_24K[i - 1][1] : close;
  const rnd = seeded(20260822 + i * 97);
  const N = 48; // every 30 minutes
  const closeIdx = 30; // 15:00 UTC = tick #30 (00:00 + 30*30min)
  let price = prevClose;
  for (let t = 0; t < N; t++) {
    // Bridge linearly toward the day's close by tick #30, then hold near it with small noise after.
    const target = t <= closeIdx ? prevClose + ((close - prevClose) * t) / closeIdx : close;
    const pull = 0.35; // mean-reversion strength toward the bridge target
    const noise = (rnd() - 0.5) * 2 * (close * 0.0018); // ~0.18% tick noise, realistic for gold intraday
    price = price + (target - price) * pull + noise;
    const hh = String(Math.floor((t * 30) / 60)).padStart(2, "0");
    const mm = String((t * 30) % 60).padStart(2, "0");
    rows.push([`${date}T${hh}:${mm}:00Z`, price.toFixed(2), "half_hour", "simulated", null]);
  }
}

const esc = (s) => (s === null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const values = rows.map(([ts, price, g, src, note]) => `('${ts}', ${price}, '${g}', '${src}', ${esc(note)})`).join(",\n");
const sql = `insert into public.gold_price_history (ts, price_egp_per_gram, granularity, source, note) values\n${values}\non conflict (ts, granularity) do nothing;\n`;

require("fs").writeFileSync("seed-gold-history.sql", sql, "utf8");
console.log("rows:", rows.length, "| real days:", NP, "| synthetic ticks:", rows.length - NP);
console.log("sql bytes:", Buffer.byteLength(sql));
