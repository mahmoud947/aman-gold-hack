export const egp = (n: number, dp = 0) =>
  `EGP ${n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
export const egp2 = (n: number) => egp(n, 2);
export const signedEgp = (n: number, dp = 0) => `${n >= 0 ? "+" : "-"}${egp(Math.abs(n), dp)}`;
export const grams = (n: number, dp = 4) => `${n.toFixed(dp)} g`;
export const pct = (n: number, dp = 2) => `${n >= 0 ? "+" : ""}${n.toFixed(dp)}%`;
export const dateStr = (ts: number) => new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
export const timeStr = (ts: number) => new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export const dateTime = (ts: number) => `${dateStr(ts)}, ${timeStr(ts)}`;
export const round2 = (n: number) => Math.round(n * 100) / 100;
export const round4 = (n: number) => Math.round(n * 10000) / 10000;
/** Grams with at least 2 and at most 4 decimals (drops trailing zeros): 0.50 g, 1.10 g, 0.1905 g. */
export const gramsTrim = (n: number) => `${n.toFixed(4).replace(/0+$/, "").replace(/\.(\d)$/, ".$10").replace(/\.$/, ".00")} g`;
