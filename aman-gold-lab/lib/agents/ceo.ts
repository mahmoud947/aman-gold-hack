import type { AgentOut, Ctx } from "./context";
import { egp, num } from "./context";

export function ceo(c: Ctx): AgentOut {
  const { inp, r } = c;
  const noInvest = inp.finServiceCustomers.value === 0;
  const evidenceWeak = ["adoption", "onboarding", "firstPurchase", "repeat"].every((k) => inp[k].type === "ASSUMPTION");
  return {
    id: "ceo", name: "CEO / Strategy Agent", demo: true,
    thesis: `Gold could give Aman its first investment product and a reason for ${num(inp.mau.value ?? 0)} MAU to return, but only if it earns its place economically rather than as a subsidised engagement feature.`,
    sections: [
      { title: "Strategic Problem", items: ["Aman has no investment section today, so savings intent (especially gold, Egypt's default store of value) is served elsewhere and Aman's engagement stops at payments and credit."] },
      { title: "Strategic Opportunity", items: [`Owned distribution: ${num(inp.superAppUsers.value ?? 0)} Super App users, ${num(inp.mau.value ?? 0)} MAU, ${num(inp.cfCustomers.value ?? 0)} Consumer Finance customers (ACTUAL).`, "Cross-sell path from payments and Consumer Finance into savings/investment.", "Egyptian gold demand is investment-led: bars and coins 23.6 t in 2025 (S5)."] },
      { title: "Customer Value", items: ["Small-ticket, sub-gram gold with instant buy/sell inside an app the customer already trusts. Evidence that Aman customers want this: none yet (UNKNOWN)."] },
      { title: "Strategic Fit", items: ["Payments: strong (funding rail). Consumer Finance: moderate (cash-flow-stretched borrowers are not natural gold buyers). Cards: prepaid card goes live in about a month (PM), so gold can ride on it. Super App: strong (engagement). Financial services: moderate (first investment product, regulatory perimeter is new)."] },
      { title: "Growth Potential", items: [`Funnel implies ~${num(r.funnel.buyers)} first-time buyers per launch cohort (${((r.funnel.buyers / (inp.mau.value || 1)) * 100).toFixed(2)}% of MAU); new-customer effect is unproven because these are existing users.`] },
      { title: "Revenue Diversification", items: [`36-month revenue at current inputs: ${egp(r.h36.revenue)}. Not yet a meaningful revenue stream.`] },
      { title: "Competitive Position", items: ["Gold strengthens Aman only if it is not the weakest gold offer in the market: Thndr already charges 1% flat each side (S2)."] },
      { title: "Strategic Risks", items: ["Brand-trust exposure if gold ownership or redemption fails.", noInvest ? "No existing investor base to learn from." : "", "Regulatory perimeter: direct gold is outside the FRA fund regime (S1)."].filter(Boolean) },
      { title: "Critical Assumptions", items: ["Existing users will convert into gold buyers at the entered funnel rates.", "Engagement value of Gold (MAU, wallet activity) is worth a subsidy - not quantified."] },
      { title: "Questions Management Must Answer", items: ["What is Aman's legal role: distributor of a licensed provider's product, or seller?", "What is the maximum acceptable loss to test whether gold lifts Super App retention?"] },
    ],
    confidence: evidenceWeak ? "Low" : "Medium",
    assumptions: ["Strategic fit assessed qualitatively; no scoring methodology configured.", "Funnel rates are ASSUMPTION."],
    sourcesUsed: ["Aman inputs (ACTUAL)", "S1", "S2", "S5"],
    position: "PROCEED WITH CONDITIONS",
    positionReason: "Strategic logic is sound (distribution, engagement, first investment product). Conditions: economics must be positive at market-competitive pricing and the regulatory structure must be defined before build.",
    strength: "Owned distribution to a large engaged base at near-zero media cost.",
    weak: "That strategic/engagement value exists without any Aman evidence of gold demand.",
    missing: "Retention/engagement uplift data for comparable investment features.",
    config: {
      id: "ceo", name: "CEO / Strategy Agent", role: "CEO / Chief Strategy Officer of Aman",
      objective: "Decide whether Gold Investment strategically fits Aman.",
      systemPrompt: "You are the CEO / CSO of Aman. Judge strategic fit, customer value, diversification, retention and brand trust. You are not here to make the product team happy. Never convert ASSUMPTION or ESTIMATE into fact. Output a position: PROCEED, PROCEED WITH CONDITIONS, VALIDATE FURTHER or DO NOT PROCEED.",
      inputs: ["Customer base", "Funnel assumptions", "Market facts"], outputs: ["Strategic thesis", "Risks", "Questions", "Position"],
    },
  };
}
