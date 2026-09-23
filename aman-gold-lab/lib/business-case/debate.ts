import type { Challenge, Inputs, Position } from "../types";
import { ceo } from "../agents/ceo";
import { cfo, cfoPosition } from "../agents/cfo";
import { cmo } from "../agents/cmo";
import { buildCtx, egp, num, pct, type AgentOut, type Ctx } from "../agents/context";
import { getRisks, risk } from "../agents/risk";
import { rnd } from "../agents/rnd";

export const AGENT_IDS = ["ceo", "cfo", "cmo", "rnd", "risk"] as const;
export type AgentId = (typeof AGENT_IDS)[number];
export const SHORT: Record<AgentId, string> = { ceo: "CEO", cfo: "CFO", cmo: "CMO", rnd: "R&D", risk: "Risk" };

type Lens = (c: Ctx) => [string, string]; // [contradiction, question]

const LENS: Record<AgentId, Partial<Record<AgentId, Lens>>> = {
  ceo: {
    cfo: (c) => [`Finance's pricing fix is cost-side, yet ${egp(c.p.fixedMonthly)}/month of run team is estimated, not measured.`, "What is the strategic value of one activated Gold user, so we know what subsidy per user is tolerable?"],
    cmo: (c) => [`A ${pct(c.p.adoption * 100, 0)} adoption of MAU conflicts with only ${pct(c.p.onboarding * 100, 0)} completing onboarding: is KYC the real bottleneck?`, "Which existing Aman product launch is the closest precedent for these conversion rates?"],
    rnd: () => ["Market data proves gold demand, not demand for gold through Aman.", "Which competitor has proven that a non-investing-app brand can win gold customers?"],
    risk: () => ["Blocking on all risks equally would kill an option worth testing; two are true blockers, the rest are build tasks.", "Which of the critical risks can be closed by a partner (mngm/Evolve) rather than by Aman?"],
  },
  cfo: {
    ceo: (c) => [`Strategic benefit is claimed while 36-month revenue is ${egp(c.r.h36.revenue)} against ${egp(c.r.h36.marketing + c.r.h36.fixed)} of spend.`, "What retention or cross-sell uplift, in EGP, justifies the loss? Show the number."],
    cmo: (c) => [`CAC of ${egp(c.p.cac)} vs first-buyer contribution of ${egp(c.p.firstInv * (c.r.unit.marginPct / 100))}: payback ${c.r.unit.paybackMonths === null ? "never" : c.r.unit.paybackMonths.toFixed(0) + " months"} at ${pct(c.p.repeat * 100, 0)} repeat, LTV/CAC ${c.r.unit.ltvCac === null ? "UNKNOWN" : c.r.unit.ltvCac.toFixed(2)}.`, "What is the measured cash CAC of a comparable in-app cross-sell?"],
    rnd: (c) => [`Pricing benchmark is a 1% flat fee; Aman assumes ${pct((c.p.spread + c.p.fee) * 100)} take and ${pct((c.p.pgw + c.p.topup + c.p.provider + c.p.custody) * 100)} variable cost, i.e. a cost base no competitor is known to match.`, "Is a zero funding cost real? Who bears the InstaPay and card costs?"],
    risk: () => ["Risk mitigations (insurance, reconciliation, two providers) are unpriced.", "What is the total cost of the mitigations needed for MVP?"],
  },
  cmo: {
    ceo: () => ["Strategic fit is asserted, while no customer research on gold intent exists.", "What evidence shows Aman users want to buy gold in Aman?"],
    cfo: (c) => [`CFO applies one blended CAC (${egp(c.p.cac)}) to every buyer; owned-channel segments may be far cheaper and paid ones dearer.`, "Should the model take CAC per marketing segment?"],
    rnd: () => ["Competitor list has no adoption or AUM figures, so 'contested market' has no size.", "What are Thndr Gold's users/AUM since June 2026 launch?"],
    risk: () => ["Risk register treats customers as passive; friction from KYC and disclosure is what hits conversion.", "What disclosures are legally required at buy-time, and how much do they cut conversion?"],
  },
  rnd: {
    ceo: () => ["'Revenue diversification' ignores that the only verified benchmark fee is 1%.", "What is Aman's differentiator that justifies price parity or a premium?"],
    cfo: (c) => [`Model excludes sell side (${c.inp.buySellRatio.type}), which understates both revenue and payment cost.`, "Please model sells; competitors earn on both sides."],
    cmo: () => ["No customer research supports the 'Start with EGP 1,000' proposition.", "What is the willingness-to-pay for gold vs Thndr's 0.001 g entry?"],
    risk: () => ["Risks are generic; the FRA statement (S1) is the only sourced regulatory fact.", "Which regulator letter/law article governs a distributor of bullion?"],
  },
  risk: {
    ceo: () => ["Strategic thesis skips who owns the gold and where it is held.", "Will the CEO accept brand exposure if redemption fails once?"],
    cfo: () => ["Financial model has no inventory/price-risk line and assumes 0% failure rate (UNKNOWN).", "Who bears gold price movement between quote and execution?"],
    cmo: () => ["Growth plan has no fraud controls: referral/incentives are classic abuse vectors.", "How will incentives be capped and monitored?"],
    rnd: () => ["Competitor custody claims (CBE-backed, insured) are marketing statements, not verified.", "Has anyone seen the actual custody/insurance certificates?"],
  },
};

export function round2(reports: Record<AgentId, AgentOut>, c: Ctx): Challenge[] {
  const out: Challenge[] = [];
  for (const from of AGENT_IDS) for (const to of AGENT_IDS) {
    if (from === to) continue;
    const [contradiction, question] = LENS[from][to]!(c);
    out.push({ from: SHORT[from], to: SHORT[to], strongest: reports[to].strength, weakest: reports[to].weak, missing: reports[to].missing, contradiction, question });
  }
  return out;
}

export interface Exchange { topic: string; by: string; challenge: string; response: string; status: "Resolved" | "Partly resolved" | "Open" }

export function round3(c: Ctx): Exchange[] {
  const { p, r, inp, be } = c;
  return [
    { topic: "Revenue assumptions", by: "CEO", challenge: `36m revenue is ${egp(r.h36.revenue)} on ${egp(r.h36.throughput)} throughput: is this a meaningful stream?`, response: `CFO: ${r.h36.net < 0 ? "no - immaterial against spend at current inputs" : "positive at current inputs"}; the model is transparent and traceable.`, status: "Resolved" },
    { topic: "Adoption", by: "CMO", challenge: `${pct(p.adoption * 100, 0)} of MAU engaging is untested.`, response: `CFO: adoption -50% moves 36m net by ${egp(c.stress[0].deltaNet36)}; unit margin is ${pct(r.unit.marginPct)} and LTV/CAC ${r.unit.ltvCac === null ? "UNKNOWN" : r.unit.ltvCac.toFixed(2)}, so ${r.unit.ltvCac !== null && r.unit.ltvCac >= 1 ? "volume adds value" : "volume adds loss"}.`, status: "Partly resolved" },
    { topic: "CAC", by: "CMO", challenge: `CAC of ${egp(p.cac)} is confirmed per acquired customer, not per gold buyer.`, response: `CFO: accepted as entered (${inp.cac.type}). Marketing over 36m is ${egp(r.h36.marketing)} against contribution of ${egp(r.h36.contribution)}; LTV/CAC is ${r.unit.ltvCac === null ? "UNKNOWN" : r.unit.ltvCac.toFixed(2)}. ${r.unit.ltvCac !== null && r.unit.ltvCac < 1 ? "CAC is now the binding constraint." : "CAC is not binding."}`, status: "Partly resolved" },
    { topic: "Transaction frequency", by: "R&D", challenge: `Frequency and holding period are ${inp.txnFreq.type}; repeat (8%) and monthly (EGP 6,000) drive all volume.`, response: "CFO: modelled from repeat rate x monthly investment; frequency input awaited from PM.", status: "Open" },
    { topic: "Average investment", by: "Risk", challenge: "Small tickets amplify fixed operational cost per transaction (support, reconciliation).", response: `CFO: investment -30% takes 36m contribution to ${egp(c.stress[1].result.h36.contribution)} (base ${egp(r.h36.contribution)}).`, status: "Partly resolved" },
    { topic: "Spread", by: "R&D", challenge: `Spread ${pct(p.spread * 100)} vs Thndr 1% flat: are we competitive?`, response: `CFO: we are cheaper than Thndr. Break-even spread at the entered CAC is ~${be.spreadForZeroNet36 ? pct(be.spreadForZeroNet36 * 100) : "n/a"}; market parity (1%) is ${be.spreadForZeroNet36 && be.spreadForZeroNet36 <= 0.01 ? "sufficient" : "not sufficient on its own"}.`, status: "Open" },
    { topic: "Fees", by: "CEO", challenge: "Why zero fee if gold is a premium convenience?", response: `CFO: fee is a lever equal to spread in the model; adding 0.5% fee would move unit margin from ${pct(r.unit.marginPct)} to ${pct(r.unit.marginPct + 0.5)}. Price test needed (Experiment 3).`, status: "Open" },
    { topic: "Costs", by: "Risk", challenge: "Provider, custody, InstaPay top-up and card-balance funding 'no cost' are PM statements, not contracts.", response: "CFO: marked ASSUMPTION; stress test adds 0.25% provider cost.", status: "Partly resolved" },
    { topic: "LTV", by: "CMO", challenge: "LTV depends on retention we cannot observe.", response: `CFO: LTV ${r.unit.ltv === null ? "UNKNOWN" : egp(r.unit.ltv)} with ESTIMATE churn ${inp.churn.value}%/mo; negative margin makes LTV negative for any churn.`, status: "Resolved" },
    { topic: "Payback", by: "CEO", challenge: "Can any scenario pay back?", response: `CFO: Base payback ${r.unit.paybackMonths === null ? "never" : r.unit.paybackMonths.toFixed(1) + " months"}. Only repricing/cost redesign changes this.`, status: "Resolved" },
  ];
}

export function round4(c: Ctx): Exchange[] {
  return [
    { topic: "Market size", by: "CFO", challenge: "Egypt gold demand is quoted in tonnes; what is the addressable digital EGP pool?", response: "R&D: bars and coins 23.6 t (2025, S5). EGP value needs gold price input: UNKNOWN. Digital share: UNKNOWN.", status: "Open" },
    { topic: "Customer demand", by: "CMO", challenge: "Any evidence Aman users want gold?", response: "R&D: no Aman-specific evidence; 200k investors in 3 FRA gold funds show category appetite (S1).", status: "Partly resolved" },
    { topic: "Competitor pricing", by: "CFO", challenge: "Only Thndr has a verified price.", response: "R&D: confirmed. Others' spreads must be mystery-shopped.", status: "Open" },
    { topic: "Competitor adoption", by: "CEO", challenge: "Who is winning?", response: "R&D: unknown; Thndr launched Jun 2026 and self-claims #1 investing app.", status: "Open" },
    { topic: "Differentiation", by: "Risk", challenge: "Why would customers choose Aman over Thndr or mngm?", response: "R&D: distribution and funding convenience are hypotheses, not evidence.", status: "Open" },
    { topic: "Market trends", by: "CFO", challenge: "Jewelry -18% but bars/coins -2%: growth?", response: "R&D: investment demand is stable, not growing; the thesis rests on channel shift, not market growth.", status: "Resolved" },
  ];
}

export function round5(c: Ctx): Exchange[] {
  const f = c.r.funnel;
  return [
    { topic: "CAC", by: "CFO", challenge: `CAC ${egp(c.p.cac)} is not measured per gold buyer, and the prepaid-card step (card issue + InstaPay top-up) is missing from the funnel.`, response: "CMO: agrees on both. Experiment 5 measures CAC per gold buyer; card activation must be added as a funnel stage.", status: "Open" },
    { topic: "Conversion", by: "R&D", challenge: `${num(f.adopters)} adopters to ${num(f.buyers)} buyers: any precedent?`, response: "CMO: none from Aman; PM estimates only (Low confidence).", status: "Open" },
    { topic: "Activation", by: "CFO", challenge: "First-buy incentives are not funded by contribution.", response: `CMO: agreed, contribution per buyer is ${egp(c.r.unit.contributionPerBuyer36)}. No incentive until unit margin is positive.`, status: "Resolved" },
    { topic: "Retention", by: "Risk", challenge: "Recurring plans encourage automatic debit disputes.", response: "CMO: add clear consent and pause controls.", status: "Partly resolved" },
    { topic: "Channel assumptions", by: "CEO", challenge: "Consumer Finance cross-sell may harm risk profile.", response: "CMO: exclude CF-delinquent customers; test on non-delinquent only.", status: "Partly resolved" },
    { topic: "Customer proposition", by: "R&D", challenge: "0.001 g minimum at Thndr vs our EGP 1,000 first buy.", response: "CMO: lower entry is a test variable; average first investment is ASSUMPTION.", status: "Open" },
  ];
}

export function round6(c: Ctx) {
  return getRisks(c).filter((r) => r.critical || r.severity === "High").slice(0, 8).map((r) => ({
    risk: r, canMitigate: r.mitigable, cost: r.cost, timeline: r.timeline, owner: r.owner,
    mvpCanProceed: r.mvpBlocker ? "No - resolve first" : "Yes, with control in place",
    responses: [
      `CEO: ${r.critical ? "escalate to leadership; sponsor decision" : "acceptable if owner assigned"}`,
      `CFO: ${r.category === "Market" ? "this is the economics gate" : "cost must be priced into MVP budget"}`,
      `CMO: ${r.category === "Customer Experience" ? "must be in customer flow before launch" : "no growth activity before closed"}`,
      `R&D: ${r.category === "Regulatory" ? "S1 supports the concern" : "no market evidence either way"}`,
    ],
  }));
}

export interface Revision { id: AgentId; name: string; initial: Position; evidence: string; revised: Position; changed: boolean; reason: string }

export function round7(reports: Record<AgentId, AgentOut>, c: Ctx): Revision[] {
  const cf = cfoPosition(c);
  const neg = c.r.unit.marginPct <= 0 || (c.r.unit.ltvCac !== null && c.r.unit.ltvCac < 1);
  const rev = (id: AgentId, evidence: string, revised: Position, reason: string): Revision => ({ id, name: reports[id].name, initial: reports[id].position, evidence, revised, changed: revised !== reports[id].position, reason });
  return [
    rev("ceo", `CFO showed LTV/CAC of ${c.r.unit.ltvCac === null ? "UNKNOWN" : c.r.unit.ltvCac.toFixed(2)} at the entered behaviour; CMO/R&D found no demand evidence; Risk flagged the card dependency and the unconfirmed regulatory stance.`, neg ? "VALIDATE FURTHER" : "PROCEED WITH CONDITIONS", neg ? "Customers acquired at this CAC do not repay it at the entered behaviour, and engagement value is unmeasured. Will sponsor a bounded validation, not a build." : "Conditions unchanged."),
    rev("cfo", "R&D confirmed the only verified market price is 1% flat (headroom above 0.5%); CMO conceded CAC per gold buyer is unmeasured.", cf.position, cf.reason),
    rev("cmo", `CFO showed LTV/CAC of ${c.r.unit.ltvCac === null ? "UNKNOWN" : c.r.unit.ltvCac.toFixed(2)}, which limits incentive budgets; R&D found no conversion precedent.`, "VALIDATE FURTHER", "Run controlled in-app tests for real CAC and conversion; no paid spend."),
    rev("rnd", "CFO showed unit margin is thin and LTV/CAC below 1 at current behaviour.", neg ? "VALIDATE FURTHER" : "PROCEED WITH CONDITIONS", neg ? "Market exists and there is pricing headroom versus Thndr, but per-customer economics fail at the entered behaviour; pricing and behaviour must be tested." : "Unchanged."),
    rev("risk", `Debate did not resolve the provider's regulatory confirmation, title of gold or the card funding path; LTV/CAC is ${c.r.unit.ltvCac === null ? "UNKNOWN" : c.r.unit.ltvCac.toFixed(2)}.`, "VALIDATE FURTHER", "Maintains gates: provider regulatory confirmation, provider contract, card and InstaPay funding path confirmed."),
  ];
}

export interface DebateOutput {
  ctx: Ctx; reports: Record<AgentId, AgentOut>; r2: Challenge[]; r3: Exchange[]; r4: Exchange[]; r5: Exchange[];
  r6: ReturnType<typeof round6>; r7: Revision[];
}

export function runDebate(inp: Inputs): DebateOutput {
  const ctx = buildCtx(inp);
  // Round 1: each agent sees only the shared inputs/model, never another agent's output.
  const reports = { ceo: ceo(ctx), cfo: cfo(ctx), cmo: cmo(ctx), rnd: rnd(ctx), risk: risk(ctx) } as Record<AgentId, AgentOut>;
  return { ctx, reports, r2: round2(reports, ctx), r3: round3(ctx), r4: round4(ctx), r5: round5(ctx), r6: round6(ctx), r7: round7(reports, ctx) };
}
