import type { Position } from "../types";
import type { AgentOut, Ctx } from "./context";
import { egp, months, num, pct } from "./context";

export function cfoPosition(c: Ctx): { position: Position; reason: string } {
  const { r, stress: st } = c;
  if (r.unit.marginPct <= 0)
    return { position: "DO NOT PROCEED", reason: `Unit margin is ${pct(r.unit.marginPct)} of every EGP transacted: spread + fee (${pct((c.p.spread + c.p.fee) * 100)}) is below variable cost (${pct((c.p.pgw + c.p.provider + c.p.custody) * 100)}). Every additional customer increases losses, so growth cannot fix it.` };
  if (r.h36.net < 0) return { position: "VALIDATE FURTHER", reason: `Unit margin is positive (${pct(r.unit.marginPct)}) but each acquired buyer returns ${r.unit.ltv === null ? "an UNKNOWN" : egp(r.unit.ltv)} of lifetime contribution against CAC ${egp(r.unit.cac)} (LTV/CAC ${r.unit.ltvCac === null ? "UNKNOWN" : r.unit.ltvCac.toFixed(2)}); 36-month net is ${egp(r.h36.net)}. The case turns on repeat behaviour and CAC per gold buyer, both unvalidated.` };
  const fails = st.filter((s) => !s.viable).length;
  if (fails >= 3) return { position: "PROCEED WITH CONDITIONS", reason: `Net positive at base, but ${fails} of ${st.length} stress tests turn it negative.` };
  return { position: "PROCEED", reason: "Positive net at base and robust under most stress tests." };
}

export function cfo(c: Ctx): AgentOut {
  const { r, p, inp, be } = c;
  const pos = cfoPosition(c);
  const feeStack = (p.spread + p.fee) * 100;
  return {
    id: "cfo", name: "CFO / Finance Agent", demo: true,
    thesis: `At ${pct(p.spread * 100)} spread, ${pct(p.fee * 100)} fee and ${pct((p.pgw + p.topup + p.provider + p.custody) * 100)} variable cost, Aman ${r.unit.marginPct > 0 ? "earns" : "loses"} ${pct(Math.abs(r.unit.marginPct))} on each EGP transacted before acquisition or team cost. ${r.unit.ltvCac !== null && r.unit.ltvCac < 1 ? `Per-customer economics still fail: LTV ${egp(r.unit.ltv)} vs CAC ${egp(r.unit.cac)}.` : ""}`,
    sections: [
      { title: "Revenue Model", items: ["Revenue = gold value bought/sold x (spread % + fee %) x (1 - failure rate).", `Spread ${pct(p.spread * 100)} per side, fee ${pct(p.fee * 100)}. Sell-side volume is excluded while buy/sell ratio is UNKNOWN (understates revenue AND cost).`, `36-month revenue: ${egp(r.h36.revenue)} on ${egp(r.h36.throughput)} throughput.`] },
      { title: "Cost Model", items: [`Variable: payment gateway ${pct(p.pgw * 100)} (purchases debit the Aman prepaid card balance; no PGW), InstaPay top-up ${pct(p.topup * 100)}, provider ${pct(p.provider * 100)}, custody ${pct(p.custody * 100)}. All are PM statements (ASSUMPTION); provider/custody terms and InstaPay fees need written confirmation.`, `Acquisition: CAC ${egp(p.cac)} per acquired customer (${inp.cac.type}, PM-stated, varies by segment). Open question: is this the cost per Aman customer or per gold buyer? Gold buyers come from the funnel, so cost per gold buyer may be higher.`, `Team: in-house, incremental cash ${pct((inp.cashShare.value ?? 0))} of loaded cost (PM). Cash run cost ${egp(p.fixedMonthly)}/month; the opportunity cost of ${inp.opsTeamFte.value} FTE is ${egp(p.fullFixedMonthly)}/month (ESTIMATE) and is NOT in the P&L.`, `MVP + integration: cash ${egp(p.mvpCost)}; opportunity cost ${egp(p.fullMvpCost)} (${(inp.mvpFteMonths.value ?? 0) + (inp.integrationFteMonths.value ?? 0)} FTE-months, ESTIMATE). Cards: the prepaid card is not yet launched, so its build/issuance cost is outside this model.`] },
      { title: "Unit Economics", items: [`Revenue per buyer (36m): ${egp(r.unit.revenuePerBuyer36)}`, `Variable cost per buyer: ${egp(r.unit.variableCostPerBuyer36)}`, `Contribution per buyer: ${egp(r.unit.contributionPerBuyer36)}`, `CAC: ${egp(r.unit.cac)}`, `LTV: ${r.unit.ltv === null ? "UNKNOWN" : egp(r.unit.ltv)} (uses ESTIMATE churn ${inp.churn.value}%/mo; holding period UNKNOWN)`, `LTV/CAC: ${r.unit.ltvCac === null ? "UNKNOWN" : r.unit.ltvCac.toFixed(3)}`, `CAC payback: ${months(r.unit.paybackMonths)}`] },
      { title: "Pricing Recommendation", items: [`Take rate ${pct(feeStack)} per side vs variable cost ${pct((p.pgw + p.topup + p.provider + p.custody) * 100)}: unit margin ${pct(r.unit.marginPct)}. Competitor benchmark: Thndr flat 1% each side (S2), so a ${pct(feeStack)} take rate is below the only verified market price.`, be.spreadForZeroNet36 ? `Spread needed for 36-month break-even at the entered CAC: ~${pct(be.spreadForZeroNet36 * 100)}.` : "No spread level breaks even at these volumes.", `Value per buyer is limited by behaviour, not price: ${pct(p.repeat * 100, 0)} repeat and EGP ${num(p.monthlyInv)}/month yield LTV ${r.unit.ltv === null ? "UNKNOWN" : egp(r.unit.ltv)}. Raising spread to 1% (market parity) would double it; test in Experiment 3.`] },
      { title: "Scenario Analysis (36-month net)", items: (["Conservative", "Base", "Aggressive"] as const).map((k) => `${k}: net ${egp(c.scen[k].h36.net)}, contribution ${egp(c.scen[k].h36.contribution)}`).concat(r.unit.marginPct <= 0 ? ["Aggressive is worse than Base because scaling volume at negative unit margin scales losses."] : []) },
      { title: "Sensitivity Analysis", items: c.sens.slice(0, 5).map((s) => `${s.label}: ${egp(s.lo)} / ${egp(s.hi)} swing on 36m net for -/+20%`) },
      { title: "Break-even Analysis", items: [`Break-even month: ${be.breakEvenMonth ?? "none within 36 months"}.`, `Adoption for zero 36m net: ${be.adoptionForZeroNet36 === null ? "not achievable: each additional buyer has negative net value (LTV < CAC) or no solution" : pct(be.adoptionForZeroNet36 * 100)}.`, `Maximum CAC for LTV/CAC = 1: ${be.maxCacForLtvCac(1) === null ? "n/a" : egp(be.maxCacForLtvCac(1))}; for LTV/CAC = 3: ${be.maxCacForLtvCac(3) === null ? "n/a" : egp(be.maxCacForLtvCac(3))}.`, `Repeat rate needed for LTV/CAC = 1: ${be.repeatForLtvCac(1) === null ? "n/a" : pct(be.repeatForLtvCac(1)! * 100, 1)} (entered ${pct(p.repeat * 100, 1)}); for LTV/CAC = 3: ${be.repeatForLtvCac(3) === null ? "n/a" : pct(be.repeatForLtvCac(3)! * 100, 1)}.`] },
      { title: "Key Financial Risks", items: [r.unit.marginPct <= 0 ? "Unit margin negative at current pricing/cost." : `Thin unit margin (${pct(r.unit.marginPct)}): any hidden cost (InstaPay fees, provider fee, card cost) of 0.5% erases it.`, "Funding cost of zero rests on two unconfirmed PM statements (prepaid card path, free InstaPay top-up) and a card that does not exist yet.", "Gold price inventory risk not modelled: assumes back-to-back provider execution. If Aman holds inventory it bears price risk.", "Opportunity cost of in-house team is excluded from the P&L (cash view).", `${c.stress.filter((s) => !s.viable).length} of ${c.stress.length} stress tests are non-viable.`] },
    ],
    confidence: "Medium",
    assumptions: ["Funnel, investment sizes: ASSUMPTION.", "Churn, cohort decay, team cost, MVP cost: ESTIMATE.", "Sell-side, transaction frequency, holding period: UNKNOWN."],
    sourcesUsed: ["Aman inputs", "S2 (price benchmark)"],
    position: pos.position, positionReason: pos.reason,
    strength: "Arithmetic is transparent and fully traceable to inputs.",
    weak: "Cohort decay and churn are AI placeholders; CAC benchmark is not Aman-specific.",
    missing: "Actual gateway cost by funding method, provider pricing terms, real cross-sell CAC.",
    config: {
      id: "cfo", name: "CFO / Finance Agent", role: "CFO of Aman",
      objective: "Determine whether the economics work.",
      systemPrompt: "You are the CFO of Aman. Be skeptical. Compute revenue, cost, unit economics, scenarios, stress tests, break-even. If an input is UNKNOWN, mark it UNKNOWN; do not invent. Answer: how much do we make, cost, capital required, payback, downside.",
      inputs: ["Pricing", "Costs", "Funnel", "Behavior"], outputs: ["Revenue model", "Unit economics", "Scenarios", "Stress test", "Position"],
    },
  };
}
