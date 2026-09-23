import { COMPETITORS, GAPS } from "../research/competitors";
import { MARKET_FACTS, OPPORTUNITIES, THREATS, TRENDS } from "../research/market";
import type { AgentOut, Ctx } from "./context";
import { pct } from "./context";

export function rnd(c: Ctx): AgentOut {
  const takePct = (c.p.spread + c.p.fee) * 100;
  return {
    id: "rnd", name: "R&D / Market Intelligence Agent", demo: true,
    thesis: "Gold demand in Egypt is real and investment-led, and digital gold is already contested; the only verified price benchmark (Thndr, 1% flat each side) is double Aman's 0.5% spread, so there is pricing headroom to test but no evidence customers would pay it.",
    sections: [
      { title: "Market Overview", items: MARKET_FACTS.slice(0, 4).map((f) => `[${f.type}] ${f.text} (${f.source})`) },
      { title: "Market Trends", items: TRENDS },
      { title: "Customer Trends", items: ["Retail appetite for regulated gold exposure exists: ~200k investors in 3 FRA gold funds (S1).", "Digital gold customer behaviour data (frequency, ticket size, retention) NOT found; Aman inputs are unbenchmarked."] },
      { title: "Competitor Landscape", items: COMPETITORS.map((x) => `${x.company}: ${x.product}; min ${x.minInvestment}; fees ${x.fees}`) },
      { title: "Competitor Business Models", items: COMPETITORS.map((x) => `${x.company}: ${x.model}`) },
      { title: "Pricing Benchmarks", items: [`Thndr: flat 1% each side (S2). Aman: spread ${pct(c.p.spread * 100)} + fee ${pct(c.p.fee * 100)} = ${pct(takePct)} per side.`, "mngm, Goldady, Gold Era: spread/fees not published in pages reviewed: UNKNOWN, must be mystery-shopped."] },
      { title: "Product Feature Benchmarks", items: GAPS.standard },
      { title: "Market Gaps", items: GAPS.underserved.concat([GAPS.caveat]) },
      { title: "Opportunities", items: OPPORTUNITIES },
      { title: "Threats", items: THREATS },
      { title: "Research Limits", items: ["Web research only; no paid databases. Egypt market size in EGP not computed (gold price UNKNOWN). Competitor adoption/AUM not found except Thndr's self-claims. Complaint data not collected."] },
    ],
    confidence: "Medium",
    assumptions: ["Competitor fee data only verified for Thndr."],
    sourcesUsed: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S9", "S10", "S11"],
    position: "PROCEED WITH CONDITIONS",
    positionReason: "Market demand exists and a distribution-led entrant is plausible. Conditions: price/positioning must beat a 1% flat-fee incumbent without losing money; complete competitor mystery-shopping.",
    strength: "Verified regulatory and competitor facts with sources.",
    weak: "Competitor adoption, AUM and spreads are not verified.",
    missing: "Digital-gold customer behaviour benchmarks; competitor complaints; provider price sheet.",
    config: {
      id: "rnd", name: "R&D / Market Intelligence Agent", role: "Head of Market Intelligence and Product Research",
      objective: "Establish whether this is an actual market opportunity, with sources.",
      systemPrompt: "You are Head of Market Intelligence. Research Egypt/MENA digital gold, demand, competitors, pricing. Every external claim needs a source. Never fabricate. Treat competitor weaknesses as opportunities only with evidence.",
      inputs: ["Web research", "Sources registry"], outputs: ["Market overview", "Competitors", "Pricing", "Gaps", "Position"],
    },
  };
}
