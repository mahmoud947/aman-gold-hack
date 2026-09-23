import type { DataType, Inputs, Traced } from "../types";

export interface Params {
  pool: number; adoption: number; onboarding: number; firstPurchase: number; repeat: number;
  cac: number; firstInv: number; monthlyInv: number; spread: number; fee: number;
  pgw: number; provider: number; custody: number; churn: number; cohort: [number, number, number];
  failure: number; sellShare: number; fixedMonthly: number; mvpCost: number; volShock: number;
  topup: number; fullFixedMonthly: number; fullMvpCost: number; // full-loaded (opportunity) cost, not cash
}

export interface Horizon {
  months: number; buyers: number; activeInvestors: number; transactions: number; throughput: number;
  revenue: number; variableCost: number; contribution: number; marketing: number; fixed: number;
  net: number; // after MVP investment
}

export interface Result {
  funnel: { reach: number; adopters: number; onboarded: number; buyers: number; repeaters: number };
  h12: Horizon; h24: Horizon; h36: Horizon;
  monthly: { month: number; cumNet: number }[];
  unit: {
    marginPct: number; // net take rate per EGP transacted
    revenuePerBuyer36: number; variableCostPerBuyer36: number; contributionPerBuyer36: number;
    cac: number; ltv: number | null; ltvCac: number | null; paybackMonths: number | null; // null => never
  };
  breakEvenMonth: number | null;
}

export function paramsFromInputs(inp: Inputs): Params {
  const v = (k: string) => inp[k]?.value ?? 0;
  const sell = inp.buySellRatio.value;
  return {
    pool: v("mau"), adoption: v("adoption") / 100, onboarding: v("onboarding") / 100,
    firstPurchase: v("firstPurchase") / 100, repeat: v("repeat") / 100,
    cac: v("cac"), firstInv: v("firstInvestment"), monthlyInv: v("monthlyInvestment"),
    spread: v("spread") / 100, fee: v("fee") / 100, pgw: v("pgw") / 100, provider: v("providerCost") / 100,
    custody: v("custodyCost") / 100, churn: v("churn") / 100,
    cohort: [1, v("cohortY2") / 100, v("cohortY3") / 100],
    failure: v("failureRate") / 100,
    sellShare: sell && sell > 0 ? 1 / sell : 0, // UNKNOWN => sell side excluded
    topup: v("topupCost") / 100,
    fullFixedMonthly: v("opsTeamFte") * v("fteMonthCost"),
    fullMvpCost: (v("mvpFteMonths") + v("integrationFteMonths")) * v("fteMonthCost"),
    fixedMonthly: v("opsTeamFte") * v("fteMonthCost") * (v("cashShare") / 100),
    mvpCost: (v("mvpFteMonths") + v("integrationFteMonths")) * v("fteMonthCost") * (v("cashShare") / 100),
    volShock: 0,
  };
}

const empty = (months: number): Horizon => ({ months, buyers: 0, activeInvestors: 0, transactions: 0, throughput: 0, revenue: 0, variableCost: 0, contribution: 0, marketing: 0, fixed: 0, net: 0 });

export function run(p: Params): Result {
  const funnelBuyers = p.pool * p.adoption * p.onboarding * p.firstPurchase;
  const funnel = {
    reach: p.pool, adopters: p.pool * p.adoption, onboarded: p.pool * p.adoption * p.onboarding,
    buyers: funnelBuyers, repeaters: funnelBuyers * p.repeat,
  };
  const takeRate = p.spread + p.fee;
  const costRate = p.pgw + p.topup + p.provider + p.custody;
  let active = 0, prevN = 0, buyersCum = 0, txCum = 0, thr = 0, rev = 0, vc = 0, mkt = 0, fix = 0;
  const monthly: { month: number; cumNet: number }[] = [];
  const hs: Record<number, Horizon> = {};
  let be: number | null = null;
  let cum = -p.mvpCost;
  for (let m = 1; m <= 36; m++) {
    const y = Math.floor((m - 1) / 12);
    const n = (funnelBuyers * p.cohort[y]) / 12;
    active = active * (1 - p.churn) + prevN * p.repeat;
    prevN = n;
    const buy = (n * p.firstInv + active * p.monthlyInv) * (1 + p.volShock);
    const gross = buy * (1 + p.sellShare);
    const ok = gross * (1 - p.failure);
    const r = ok * takeRate;
    const c = gross * costRate;
    const mk = n * p.cac;
    buyersCum += n; txCum += (n + active) * (1 + p.sellShare); thr += gross; rev += r; vc += c; mkt += mk; fix += p.fixedMonthly;
    cum += r - c - mk - p.fixedMonthly;
    monthly.push({ month: m, cumNet: cum });
    if (be === null && cum >= 0) be = m;
    if (m % 12 === 0) {
      hs[m] = { months: m, buyers: buyersCum, activeInvestors: active, transactions: txCum, throughput: thr, revenue: rev, variableCost: vc, contribution: rev - vc, marketing: mkt, fixed: fix, net: cum };
    }
  }
  const h36 = hs[36] ?? empty(36);
  const margin = takeRate - costRate; // per EGP of gross volume (failure ignored in unit view)
  const perBuyer = (x: number) => (h36.buyers > 0 ? x / h36.buyers : 0);
  // Analytic lifetime: first purchase + repeat share x monthly investment over 1/churn months
  const lifetimeVol = (p.firstInv + (p.churn > 0 ? (p.repeat * p.monthlyInv) / p.churn : 0)) * (1 + p.sellShare);
  const ltv = p.churn > 0 ? margin * lifetimeVol : null;
  const monthlyContribPerBuyer = margin * p.repeat * p.monthlyInv * (1 + p.sellShare);
  const firstContrib = margin * p.firstInv * (1 + p.sellShare);
  let payback: number | null = null;
  if (p.cac <= firstContrib) payback = 0;
  else if (monthlyContribPerBuyer > 0) payback = (p.cac - firstContrib) / monthlyContribPerBuyer;
  return {
    funnel, h12: hs[12] ?? empty(12), h24: hs[24] ?? empty(24), h36, monthly,
    unit: {
      marginPct: margin * 100,
      revenuePerBuyer36: perBuyer(h36.revenue), variableCostPerBuyer36: perBuyer(h36.variableCost),
      contributionPerBuyer36: perBuyer(h36.contribution), cac: p.cac, ltv,
      ltvCac: ltv !== null && p.cac > 0 ? ltv / p.cac : null, paybackMonths: payback,
    },
    breakEvenMonth: be,
  };
}

/* ---------- Scenarios ---------- */
export const SCENARIO_DEFS = {
  Conservative: { desc: "Adoption x0.5, investment x0.7, repeat x0.6, CAC x1.25, payment/top-up cost +0.10% floor", f: (p: Params): Params => ({ ...p, adoption: p.adoption * 0.5, firstInv: p.firstInv * 0.7, monthlyInv: p.monthlyInv * 0.7, repeat: p.repeat * 0.6, cac: p.cac * 1.25, pgw: p.pgw * 1.1 + 0.001 }) },
  Base: { desc: "Product Manager inputs as entered", f: (p: Params): Params => p },
  Aggressive: { desc: "Adoption x1.5, investment x1.5, repeat x1.5, CAC x0.7, payment cost x0.8 (negotiated)", f: (p: Params): Params => ({ ...p, adoption: p.adoption * 1.5, firstInv: p.firstInv * 1.5, monthlyInv: p.monthlyInv * 1.5, repeat: p.repeat * 1.5, cac: p.cac * 0.7, pgw: p.pgw * 0.8 }) },
} as const;
export type ScenarioName = keyof typeof SCENARIO_DEFS;

export function scenarios(p: Params) {
  return Object.fromEntries((Object.keys(SCENARIO_DEFS) as ScenarioName[]).map((k) => [k, run(SCENARIO_DEFS[k].f(p))])) as Record<ScenarioName, Result>;
}

/* ---------- Stress test ---------- */
export const STRESS: { name: string; f: (p: Params) => Params }[] = [
  { name: "Adoption -50%", f: (p) => ({ ...p, adoption: p.adoption * 0.5 }) },
  { name: "Average investment -30%", f: (p) => ({ ...p, firstInv: p.firstInv * 0.7, monthlyInv: p.monthlyInv * 0.7 }) },
  { name: "Transaction frequency -30% (repeat rate)", f: (p) => ({ ...p, repeat: p.repeat * 0.7 }) },
  { name: "Spread -50%", f: (p) => ({ ...p, spread: p.spread * 0.5 }) },
  { name: "CAC +50%", f: (p) => ({ ...p, cac: p.cac * 1.5 }) },
  { name: "Payment/top-up cost +25% (base is 0, so 0.25% of value used as a floor)", f: (p) => ({ ...p, pgw: p.pgw + p.topup > 0 ? p.pgw * 1.25 : 0.0025, topup: p.topup * 1.25 }) },
  { name: "Provider cost +25% (base is 0, so 0.25% of value used as a floor)", f: (p) => ({ ...p, provider: p.provider > 0 ? p.provider * 1.25 : 0.0025 }) },
  { name: "Gold price volatility (-20% volume, ESTIMATE shock)", f: (p) => ({ ...p, volShock: -0.2 }) },
  { name: "Transaction failure rate +5%", f: (p) => ({ ...p, failure: p.failure + 0.05 }) },
];
export function stress(p: Params) {
  const base = run(p);
  return STRESS.map((s) => {
    const r = run(s.f(p));
    return { name: s.name, result: r, deltaNet36: r.h36.net - base.h36.net, viable: r.h36.net > 0 };
  });
}

/* ---------- Sensitivity (tornado, +/-20% on 36m net) ---------- */
export const SENS_KEYS: { key: keyof Params; label: string }[] = [
  { key: "adoption", label: "Adoption" }, { key: "onboarding", label: "Onboarding completion" },
  { key: "firstPurchase", label: "First-purchase conversion" }, { key: "repeat", label: "Repeat rate" },
  { key: "monthlyInv", label: "Monthly investment" }, { key: "firstInv", label: "First investment" },
  { key: "spread", label: "Spread" }, { key: "cac", label: "CAC" }, { key: "pgw", label: "Payment cost" }, { key: "topup", label: "Top-up cost" },
  { key: "churn", label: "Monthly churn" }, { key: "fixedMonthly", label: "Run-team cost" },
];
export function sensitivity(p: Params) {
  const base = run(p).h36.net;
  return SENS_KEYS.map(({ key, label }) => {
    const lo = run({ ...p, [key]: (p[key] as number) * 0.8 }).h36.net;
    const hi = run({ ...p, [key]: (p[key] as number) * 1.2 }).h36.net;
    return { label, lo: lo - base, hi: hi - base, swing: Math.abs(hi - lo) };
  }).sort((a, b) => b.swing - a.swing);
}

/* ---------- Break-even (net is linear in each lever, so two evaluations solve it) ---------- */
function solve(p: Params, key: "spread" | "adoption" | "cac"): number | null {
  const f = (x: number) => run({ ...p, [key]: x }).h36.net;
  const x1 = (p[key] as number) || 0.001, x2 = x1 * 2;
  const y1 = f(x1), y2 = f(x2);
  const slope = (y2 - y1) / (x2 - x1);
  if (!isFinite(slope) || Math.abs(slope) < 1e-9) return null;
  if (slope < 0 && key !== "cac") return null;
  const x = x1 - y1 / slope;
  return x > 0 ? x : null;
}
export function breakEven(p: Params) {
  const r = run(p);
  const unitMargin = r.unit.marginPct;
  return {
    spreadForZeroNet36: solve(p, "spread"),
    adoptionForZeroNet36: unitMargin > 0 ? solve(p, "adoption") : null,
    unitMarginPct: unitMargin,
    // Repeat rate needed for LTV = k x CAC (LTV = margin x (1+sell) x (firstInv + repeat x monthlyInv / churn))
    repeatForLtvCac: (k: number) => {
      const m = (p.spread + p.fee - p.pgw - p.topup - p.provider - p.custody) * (1 + p.sellShare);
      if (m <= 0 || p.churn <= 0 || p.monthlyInv <= 0) return null;
      const rep = ((k * p.cac) / m - p.firstInv) * p.churn / p.monthlyInv;
      return rep > 0 ? rep : 0;
    },
    maxCacForLtvCac: (k: number) => (r.unit.ltv !== null && r.unit.ltv > 0 ? r.unit.ltv / k : null),
    minSpreadToCoverVariable: (p.pgw + p.topup + p.provider + p.custody - p.fee) * 100,
    breakEvenMonth: r.breakEvenMonth,
  };
}

/* ---------- Traceability ---------- */
const RANK: DataType[] = ["ACTUAL", "EXTERNAL FACT", "BENCHMARK", "ASSUMPTION", "ESTIMATE", "UNKNOWN"];
export const weakest = (ts: DataType[]): DataType => ts.reduce((a, b) => (RANK.indexOf(b) > RANK.indexOf(a) ? b : a), "ACTUAL" as DataType);

export type TraceName = "revenue" | "throughput" | "customers" | "contribution" | "cac" | "payback" | "net";

export function trace(name: TraceName, inp: Inputs, r: Result): Traced {
  const c = (k: string) => ({ label: inp[k].label, value: inp[k].value === null ? "UNKNOWN" : `${inp[k].value} ${inp[k].unit}`, type: inp[k].type, source: inp[k].source });
  const funnel = ["mau", "adoption", "onboarding", "firstPurchase"].map(c);
  const vol = ["firstInvestment", "monthlyInvestment", "repeat", "churn", "buySellRatio"].map(c);
  const price = ["spread", "fee"].map(c);
  const cost = ["pgw", "topupCost", "providerCost", "custodyCost"].map(c);
  const mk = (value: number | null, unit: string, formula: string, comps: ReturnType<typeof c>[]): Traced => ({
    value, unit, formula, components: comps,
    type: weakest(comps.filter((x) => x.value !== "UNKNOWN").map((x) => x.type)),
  });
  switch (name) {
    case "customers": return mk(r.h36.buyers, "buyers (36m cumulative)", "MAU x adoption x onboarding x first-purchase x yearly cohort factor (100% / Y2 / Y3)", [...funnel, c("cohortY2"), c("cohortY3")]);
    case "throughput": return mk(r.h36.throughput, "EGP (36m)", "SUM(new buyers x first investment + active repeat investors x monthly investment) x (1 + sell share). Sell side excluded while buy/sell ratio is UNKNOWN.", [...funnel, ...vol]);
    case "revenue": return mk(r.h36.revenue, "EGP (36m)", "Throughput x (spread + fee) x (1 - failure rate)", [...funnel, ...vol, ...price, c("failureRate")]);
    case "contribution": return mk(r.h36.contribution, "EGP (36m)", "Revenue - throughput x (PGW + provider + custody)", [...funnel, ...vol, ...price, ...cost]);
    case "cac": return mk(r.unit.cac, "EGP", "CAC as entered (EGP per acquired customer)", [c("cac")]);
    case "payback": return mk(r.unit.paybackMonths, "months", "(CAC - first-purchase contribution) / monthly contribution per acquired buyer. Never if unit margin <= 0", [c("cac"), ...vol, ...price, ...cost]);
    case "net": return mk(r.h36.net, "EGP (36m)", "Contribution - marketing (CAC x new buyers) - incremental-cash run team - incremental-cash MVP & integration cost", [...funnel, ...vol, ...price, ...cost, c("cac"), c("opsTeamFte"), c("fteMonthCost"), c("cashShare"), c("mvpFteMonths"), c("integrationFteMonths")]);
  }
}
