import type { AgentOut, Ctx } from "./context";
import { egp, num, pct } from "./context";

export function funnelRows(c: Ctx) {
  const { inp, r } = c;
  return [
    { stage: "Reach (MAU)", n: r.funnel.reach, conv: null as number | null, type: inp.mau.type },
    { stage: "Gold adoption (view / landing)", n: r.funnel.adopters, conv: c.p.adoption * 100, type: inp.adoption.type },
    { stage: "Onboarding completed (incl. KYC)", n: r.funnel.onboarded, conv: c.p.onboarding * 100, type: inp.onboarding.type },
    { stage: "First purchase", n: r.funnel.buyers, conv: c.p.firstPurchase * 100, type: inp.firstPurchase.type },
    { stage: "Repeat / active gold investor", n: r.funnel.repeaters, conv: c.p.repeat * 100, type: inp.repeat.type },
  ];
}

export const CHANNELS = [
  { ch: "Aman Super App (home banner, Gold tab)", reach: "Up to MAU", relevance: "High", scale: "High", cac: "UNKNOWN", note: "Owned; incremental cash cost ~0 but shared with other products." },
  { ch: "Push / CRM / SMS / Email", reach: "Opted-in MAU", relevance: "High", scale: "High", cac: "UNKNOWN", note: "SMS carries per-message cost; opt-in rates unknown." },
  { ch: "Consumer Finance cross-sell", reach: "65,000 customers (ACTUAL)", relevance: "Medium", scale: "Low", cac: "UNKNOWN", note: "Credit customers: affordability vs savings intent is unproven." },
  { ch: "Referral", reach: "Adopters", relevance: "Medium", scale: "Medium", cac: "UNKNOWN", note: "Incentive cost adds directly to CAC; must stay well below lifetime contribution." },
  { ch: "Paid / social / influencer", reach: "External", relevance: "Low-Medium", scale: "High", cac: "BENCHMARK USD 166 (US)", note: "Only channel with a benchmark; not comparable." },
  { ch: "Partnerships (mngm/Evolve, merchants)", reach: "UNKNOWN", relevance: "Medium", scale: "Medium", cac: "UNKNOWN", note: "Provider co-marketing not confirmed." },
  { ch: "Offline branches", reach: "UNKNOWN", relevance: "Low", scale: "Low", cac: "UNKNOWN", note: "Branch footprint not provided." },
];

export function cmo(c: Ctx): AgentOut {
  const { r, p, inp } = c;
  const rows = funnelRows(c);
  return {
    id: "cmo", name: "CMO / Growth Agent", demo: true,
    thesis: `The entered funnel yields ${num(r.funnel.buyers)} first buyers from ${num(p.pool)} MAU (${((r.funnel.buyers / p.pool) * 100).toFixed(2)}%). Every stage rate is an unvalidated assumption, and the confirmed CAC of ${egp(p.cac)} is per acquired customer and has not been tied to a gold buyer.`,
    sections: [
      { title: "Target Segments", items: ["Digitally active MAU (largest, evidence: ACTUAL count only).", `Consumer Finance customers: ${num(inp.cfCustomers.value ?? 0)} (ACTUAL); attractiveness unproven.`, "First-time investors and existing gold buyers: no Aman-side segment data (UNKNOWN).", "Card customers: 0 today; the prepaid card goes live in under a month (PM), and every gold buyer will need one."] },
      { title: "Customer Value Proposition", items: ["Buy gold from EGP 1,000 in a minute, inside the app you already use, with sell-back on demand (hypothesis).", "Why Aman and not Thndr/mngm? Not answered by evidence yet."] },
      { title: "Acquisition Funnel", items: rows.map((x) => `${x.stage}: ${num(x.n)}${x.conv !== null ? ` (${pct(x.conv, 1)} of previous, ${x.type})` : ""}`) },
      { title: "Acquisition Channels", items: CHANNELS.map((x) => `${x.ch}: relevance ${x.relevance}, scalability ${x.scale}, CAC ${x.cac}`) },
      { title: "Activation Strategy", items: ["Sub-EGP 1,000 first purchase, education card at Gold home, price alerts, recurring plan prompt after first buy.", `Incentive test: a EGP 50 first-buy bonus adds EGP 50 to CAC (${egp(p.cac)} to ${egp(p.cac + 50)}) against lifetime contribution per buyer of ${r.unit.ltv === null ? "UNKNOWN" : egp(r.unit.ltv)}; incentives are ${r.unit.ltv !== null && r.unit.ltv < p.cac + 50 ? "NOT" : "potentially"} financially viable at current LTV.`] },
      { title: "Retention Strategy", items: ["Hypothesis: recurring monthly plans drive retention (the model assumes repeat investors put in EGP 6,000/month; only 8% repeat).", "Weekly touchpoints: price alerts, portfolio value, milestone badges. Effect sizes UNKNOWN."] },
      { title: "Campaign Concepts", items: ["'Start with EGP 1,000': in-app Gold banner to MAU segment.", "'Save monthly in gold': recurring-plan campaign after first purchase.", "Consumer Finance repayment-milestone prompt (test only)."] },
      { title: "CAC Assumptions", items: [`Confirmed Aman CAC: ${egp(p.cac)} (${inp.cac.type}, ${inp.cac.confidence} confidence). The US fintech benchmark of USD ${inp.cacUsd.value} (about ${egp((inp.cacUsd.value ?? 0) * (inp.fx.value ?? 0))}) is kept for reference only.`, `Unresolved: is EGP ${Math.round(p.cac)} the cost per new Aman customer or per gold buyer? Existing users cost less to reach, but only a fraction of them buy, so cost per gold buyer can be much higher than that figure.`, `Marketing spend at this CAC over 36m: ${egp(r.h36.marketing)}; contribution over the same period ${egp(r.h36.contribution)}.`, "Segment CAC (by marketing segmentation) should be entered per segment once available."] },
      { title: "Growth Risks", items: ["All four funnel rates are PM assumptions with Low confidence.", "An adoption rate of 30% of MAU is aggressive for a new financial product with KYC friction.", "Cannibalisation of attention from other Super App products.", "Funding path adds funnel steps that the entered rates may not include: customer must hold an activated Aman prepaid card (going live in under a month per PM) and top it up via InstaPay before the first gold purchase."] },
    ],
    confidence: "Low",
    assumptions: ["Funnel conversion: ASSUMPTION.", "CAC: confirmed per acquired customer; cost per gold buyer UNKNOWN.", "Channel CACs: UNKNOWN."],
    sourcesUsed: ["Aman inputs", "S7"],
    position: "VALIDATE FURTHER",
    positionReason: "Growth cannot be judged until the funnel and a cross-sell CAC are measured; do not scale paid spend before cost per gold buyer is measured.",
    strength: "Owned channels reach the whole MAU base cheaply.",
    weak: "30% adoption of MAU and the funnel below it are untested.",
    missing: "Cross-sell CAC and conversion from any comparable Aman product launch.",
    config: {
      id: "cmo", name: "CMO / Growth Agent", role: "CMO / Chief Growth Officer of Aman",
      objective: "Determine whether customers can be acquired and activated at reasonable cost.",
      systemPrompt: "You are the CMO of Aman. Challenge 'why would someone invest through Aman?'. Build the funnel, channels, activation and retention. Do not claim a segment is attractive without evidence. Do not assume incentives are viable: compute their effect on CAC and contribution.",
      inputs: ["Funnel", "CAC", "Segments"], outputs: ["Funnel", "Channels", "Activation", "Retention", "Position"],
    },
  };
}
