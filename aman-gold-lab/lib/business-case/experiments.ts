import type { Ctx } from "../agents/context";
import { egp, pct } from "../agents/context";

export interface Experiment {
  n: number; name: string; hypothesis: string; metric: string; target: string; sample: string; duration: string;
  cost: string; success: string; failure: string; gate?: string;
}

// Sample sizes use n = z^2 p(1-p) / d^2 with z=1.96 and +/-3pp margin: ESTIMATE, adjust to power needs.
const sampleFor = (p: number) => Math.ceil((1.96 * 1.96 * p * (1 - p)) / (0.03 * 0.03));

export function experiments(c: Ctx): Experiment[] {
  const fte = c.inp.fteMonthCost.value ?? 0;
  const cash = (c.inp.cashShare.value ?? 0) / 100;
  const cost = (fteMonths: number) => `Cash ${egp(fteMonths * fte * cash)} (in-house team, PM); opportunity cost ${egp(fteMonths * fte)} (${fteMonths} FTE-months, ESTIMATE)`;
  const a = c.p.adoption, ob = c.p.onboarding, rp = c.p.repeat;
  return [
    { n: 1, name: "Customer demand (concept test)", hypothesis: "Aman MAU will engage with a Gold entry point in-app.", metric: "Tap-through / 'Interested' rate on Gold card among exposed MAU", target: `>= ${pct(a * 100, 1)} (current adoption assumption)`, sample: `${sampleFor(a).toLocaleString()} MAU exposed (ESTIMATE)`, duration: "2 weeks", cost: cost(0.5), success: `>= ${pct(a * 100, 1)}`, failure: `< ${pct((a / 2) * 100, 1)}` },
    { n: 2, name: "Willingness to invest (fake door)", hypothesis: "Interested users will state a first amount close to EGP " + (c.inp.firstInvestment.value ?? "") + ".", metric: "Share choosing an amount >= assumed first investment; median stated amount", target: `>= ${pct(ob * 100, 1)} of interested`, sample: `${sampleFor(ob).toLocaleString()} interested users`, duration: "2 weeks (overlaps #1)", cost: cost(0.5), success: `>= ${pct(ob * 100, 1)} and median >= assumption`, failure: `< ${pct((ob / 2) * 100, 1)}` },
    { n: 3, name: "Pricing (spread/fee)", hypothesis: "Purchase intent holds when the take rate rises toward market parity (1% per side).", metric: "Intent-to-buy drop-off across take rates (0.5%, 1.0%, 1.5% per side) shown on quotes", target: "Intent at 1.0% take rate >= 80% of intent at 0.5% (market parity with Thndr, S2)", sample: "3 cells x ~400 interested users (ESTIMATE)", duration: "2 weeks", cost: cost(0.5), success: "1.0% or higher retains >= 80% of intent (doubles LTV)", failure: "Intent collapses above 1% (parity with Thndr flat fee is a ceiling)", gate: "Prices shown as concept only; no real transactions." },
    { n: 4, name: "Activation (closed pilot)", hypothesis: "Users can get a prepaid card, top up, complete KYC and receive gold without failures.", metric: "Onboarding completion, KYC completion, payment + allocation success", target: `Onboarding >= ${pct(ob * 100, 1)}; end-to-end success >= 98%`, sample: "300-500 invited users (ESTIMATE)", duration: "4-6 weeks after gates", cost: cost(c.inp.mvpFteMonths.value ? (c.inp.mvpFteMonths.value + (c.inp.integrationFteMonths.value ?? 0)) / 2 : 6) + " (pilot-scope build, ~half of MVP)", success: "Targets met, zero unreconciled orders", failure: "Onboarding < half of target or any unreconciled order", gate: "Requires provider regulatory confirmation, provider contract (R1, R2) and a live prepaid card with InstaPay top-up (R15, R16)." },
    { n: 5, name: "Acquisition (measured CAC)", hypothesis: "Cost per gold buyer is at or below the blended EGP " + Math.round(c.p.cac) + " Aman CAC.", metric: "Cash CAC per GOLD first buyer (media + incentive + channel cost / first buyers), by marketing segment", target: c.r.unit.ltv && c.r.unit.ltv > 0 ? `<= LTV / 3 = ${egp(c.r.unit.ltv / 3)} (LTV ${egp(c.r.unit.ltv)}); entered CAC is ${egp(c.p.cac)}` : "Cannot be set: LTV is not positive until unit margin is positive", sample: "Pilot cohort of Experiment 4", duration: "4 weeks", cost: cost(0.5) + "; any incentive is counted in CAC", success: "CAC below the margin-supported ceiling", failure: `CAC per gold buyer above ${egp(c.p.cac * 2)} (2x entered CAC)`, gate: "Depends on Experiment 4." },
    { n: 6, name: "Repeat investment", hypothesis: "Buyers make a second purchase.", metric: "Share of first buyers who buy again within 30 days; median monthly amount", target: `>= ${pct(rp * 100, 1)} repeat and EGP ${(c.inp.monthlyInvestment.value ?? 0).toLocaleString()} monthly`, sample: "All pilot first-buyers", duration: "8 weeks", cost: cost(0.5), success: `>= ${pct(rp * 100, 1)} repeat`, failure: `< ${pct((rp / 2) * 100, 1)}`, gate: "Depends on Experiment 4." },
  ];
}
