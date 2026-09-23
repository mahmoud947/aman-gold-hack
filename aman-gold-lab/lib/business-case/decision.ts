import type { Evidence, Position } from "../types";
import type { Ctx } from "../agents/context";
import { egp, pct } from "../agents/context";
import { getRisks } from "../agents/risk";
import type { DebateOutput } from "./debate";

export interface DecisionResult { position: Position; reasoning: string[]; gate: string }

/** Evidence-based gate. Not an average of agent positions. */
export function decide(c: Ctx): DecisionResult {
  const reasoning: string[] = [];
  const blockers = getRisks(c).filter((r) => r.critical && r.mvpBlocker);
  const unknownCritical = c.unknowns.length;
  let position: Position;
  let gate: string;
  if (c.r.unit.marginPct <= 0) {
    position = "DO NOT PROCEED";
    gate = "Unit-economics gate failed";
    reasoning.push(`Based on the current assumptions, every EGP transacted earns ${pct(c.r.unit.marginPct)} after variable cost (take rate ${pct((c.p.spread + c.p.fee) * 100)} vs variable cost ${pct((c.p.pgw + c.p.provider + c.p.custody) * 100)}). Volume growth increases losses.`);
    reasoning.push("The recommendation applies to the business as currently priced and funded. It is not a verdict on Gold as a category: a cost-side redesign or repricing would reopen the case (see Path to Re-open).");
  } else if (c.r.h36.net < 0) {
    position = "VALIDATE FURTHER";
    gate = "Payback gate not met";
    reasoning.push(`Unit margin is positive (${pct(c.r.unit.marginPct)}), but 36-month net is ${egp(c.r.h36.net)}: lifetime contribution per buyer is ${c.r.unit.ltv === null ? "UNKNOWN" : egp(c.r.unit.ltv)} against CAC of ${egp(c.r.unit.cac)} (LTV/CAC ${c.r.unit.ltvCac === null ? "UNKNOWN" : c.r.unit.ltvCac.toFixed(2)}, payback ${c.r.unit.paybackMonths === null ? "never" : c.r.unit.paybackMonths.toFixed(0) + " months"}).`);
    reasoning.push("Based on the current assumptions the model is directionally viable on unit margin but not yet on acquisition economics; the outcome depends on repeat behaviour and cost per gold buyer, neither of which has been measured.");
  } else if (blockers.length || unknownCritical > 0) {
    position = "PROCEED WITH CONDITIONS";
    gate = "Economics positive; blockers open";
    reasoning.push(`Economics are positive at current inputs; ${unknownCritical} inputs are still UNKNOWN and the regulatory, card and funding-path confirmations are pending.`);
  } else {
    position = "PROCEED";
    gate = "All gates passed";
    reasoning.push("Economics positive and no open blockers.");
  }
  if (blockers.length) reasoning.push(`${blockers.length} critical risk${blockers.length === 1 ? " is a" : "s are"} launch blocker${blockers.length === 1 ? "" : "s"}: ${blockers.map((b) => b.id + " " + b.category).join(", ")}.`);
  if (c.r.h36.net >= 0 && c.r.h36.revenue < 1e6) reasoning.push(`Scale check: 36-month revenue is only ${egp(c.r.h36.revenue)} and net ${egp(c.r.h36.net)}. The financial case is positive but immaterial; any go decision rests on strategic value (engagement, cross-sell), which is not quantified.`);
  reasoning.push(`${c.assumptionKeys.length} of ${Object.keys(c.inp).length} inputs are ASSUMPTION/ESTIMATE and ${c.unknowns.length} are UNKNOWN.`);
  return { position, reasoning, gate };
}

export function reopenPath(c: Ctx) {
  const be = c.be, p = c.p;
  const out: string[] = [];
  if (c.r.unit.marginPct <= 0) out.push(`Lower variable cost below the ${pct((p.spread + p.fee) * 100)} take rate, or raise the take rate above ${pct((p.pgw + p.topup + p.provider + p.custody) * 100)} per side.`);
  const r1 = be.repeatForLtvCac(1), r3 = be.repeatForLtvCac(3), m1 = be.maxCacForLtvCac(1), m3 = be.maxCacForLtvCac(3);
  if (c.r.unit.ltvCac !== null && c.r.unit.ltvCac < 3) {
    out.push(`Change behaviour or cost: LTV/CAC reaches 1 if CAC falls to ${m1 === null ? "n/a" : egp(m1)} (3x at ${m3 === null ? "n/a" : egp(m3)}), or if repeat rate reaches ${r1 === null ? "n/a" : pct(r1 * 100, 1)} (3x at ${r3 === null ? "n/a" : pct(r3 * 100, 1)}) versus ${pct(p.repeat * 100, 1)} assumed.`);
    out.push(`Or raise take rate: spread at market parity (1% per side, S2) doubles LTV; break-even spread at the entered CAC is ~${be.spreadForZeroNet36 ? pct(be.spreadForZeroNet36 * 100) : "n/a"}.`);
  }
  out.push("Measure cost per GOLD BUYER (not per new customer) and repeat behaviour in a pilot before committing.");
  out.push("Confirm in writing: provider regulatory role, free InstaPay top-up and card-balance funding, and the prepaid card launch date.");
  return out;
}

export function consensus(d: DebateOutput) {
  const c = d.ctx;
  const dec = decide(c);
  return {
    agreements: [
      "Egyptian gold demand is investment-led and digital gold is already a contested category (S1, S2, S5).",
      "All funnel and behaviour inputs are assumptions; none are validated by Aman data.",
      "No incentive or paid growth should be funded until unit margin is positive.",
      "Regulatory position, gold title/custody and the prepaid-card dependency must be confirmed in writing before build.",
    ],
    disagreements: [
      `Strategic value: CEO sees engagement upside; CFO requires it quantified in EGP (current position ${d.reports.cfo.position}).`,
      `CAC: EGP ${Math.round(c.p.cac)} is confirmed per acquired customer, but cost per GOLD buyer depends on the funnel and is unmeasured; CFO notes the result flips if it is much higher (max CAC for LTV/CAC = 1 is ${c.be.maxCacForLtvCac(1) === null ? "n/a" : egp(c.be.maxCacForLtvCac(1))}).`,"Regulatory: PM says the provider handles everything; Risk requires written confirmation because the FRA (Financial Regulatory Authority) says direct gold is outside its fund regime (S1).",
      "Is the case a pricing problem (R&D: test 1% parity) or a behaviour problem (CFO: LTV is driven by repeat rate and monthly amount)?",
      `Risk vs CEO: whether an MVP may start before legal clarity (Risk: no).`,
    ],
    uncertainties: c.unknowns.map((u) => `${u}: UNKNOWN`).concat(["Real cross-sell CAC", "Sell-side volume and price risk", "Customer demand for gold inside Aman", "Aman's licence perimeter", "Competitor adoption and spreads (only Thndr price verified)"]),
    validationRequired: ["Provider confirmation of regulated party and Aman's role, plus legal review", "Provider term sheet (mngm/Evolve): title, quote, buy-back, settlement, fees", "Written confirmation that InstaPay top-up and card-balance purchases carry no cost to Aman, and the prepaid card launch date", "Demand, pricing, activation, CAC and repeat experiments (see Validation Plan)"],
    valueDrivers: c.sens.slice(0, 5).map((s) => `${s.label} (36m net swing ${egp(s.swing)} for +/-20%)`),
    failureDrivers: [`Unit margin ${pct(c.r.unit.marginPct)} and LTV/CAC ${c.r.unit.ltvCac === null ? "UNKNOWN" : c.r.unit.ltvCac.toFixed(2)}`, "Prepaid card go-live and zero-cost funding path unconfirmed", "Regulatory confirmation and title of gold unresolved", "Funnel rates below assumptions", "Provider dependency and quote latency", "1% flat-fee benchmark (S2) caps repricing"],
    decision: dec,
  };
}

export interface MatrixRow { dimension: string; evidence: Evidence; basis: string }

export function decisionMatrix(c: Ctx): MatrixRow[] {
  const allAssump = ["adoption", "onboarding", "firstPurchase", "repeat"].every((k) => c.inp[k].type === "ASSUMPTION");
  return [
    { dimension: "Strategic Fit", evidence: "Moderate Evidence", basis: "Owned distribution (ACTUAL); engagement value not quantified." },
    { dimension: "Customer Demand", evidence: allAssump ? "Weak Evidence" : "Moderate Evidence", basis: "Funnel rates are ASSUMPTION; category appetite from FRA funds (S1)." },
    { dimension: "Market Opportunity", evidence: "Moderate Evidence", basis: "Egypt bars and coins 23.6 t (S5); EGP size UNKNOWN." },
    { dimension: "Revenue Potential", evidence: "Weak Evidence", basis: `36m revenue ${egp(c.r.h36.revenue)} built on assumptions.` },
    { dimension: "Unit Economics", evidence: c.r.unit.marginPct <= 0 ? "Moderate Evidence" : "Weak Evidence", basis: c.r.unit.marginPct <= 0 ? "Negative margin follows arithmetically from cost and PM pricing." : `Positive margin (${pct(c.r.unit.marginPct)}) rests on unconfirmed zero funding cost; LTV/CAC ${c.r.unit.ltvCac === null ? "UNKNOWN" : c.r.unit.ltvCac.toFixed(2)}.` },
    { dimension: "Customer Acquisition", evidence: "Weak Evidence", basis: `CAC is PM-stated (~EGP ${Math.round(c.p.cac)}, blended); cost per gold buyer UNKNOWN.` },
    { dimension: "Operational Complexity", evidence: "Weak Evidence", basis: "Reconciliation, disputes, redemption need provider terms." },
    { dimension: "Technology Complexity", evidence: "Weak Evidence", basis: "Integration effort is an ESTIMATE." },
    { dimension: "Regulatory Complexity", evidence: "Weak Evidence", basis: "FRA position (S1) is sourced, but the PM claim that the provider handles all regulation is unconfirmed; prepaid-card rules not assessed." },
    { dimension: "Risk", evidence: "Moderate Evidence", basis: `${getRisks(c).filter((r) => r.critical).length} critical risks identified; ratings are judgement.` },
    { dimension: "Time to Market", evidence: "Weak Evidence", basis: `${c.inp.launchMonths.value} months is an ESTIMATE.` },
    { dimension: "Investment Required", evidence: "Weak Evidence", basis: `Cash ${egp(c.p.mvpCost)} (PM: in-house, no additional cost); opportunity cost ${egp(c.p.fullMvpCost)} is an ESTIMATE.` },
  ];
}
