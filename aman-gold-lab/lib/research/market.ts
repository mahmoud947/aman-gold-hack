import type { DataType } from "../types";

export interface Fact { text: string; type: DataType; source: string; confidence: "High" | "Medium" | "Low" }

export const MARKET_FACTS: Fact[] = [
  { text: "Egypt gold demand 2025: 45.1 tonnes (-10% y/y). Jewelry 21.5 t (-18%); bars and coins 23.6 t (-2%).", type: "EXTERNAL FACT", source: "S5 (secondary report of World Gold Council data; verify against S6)", confidence: "Medium" },
  { text: "Q4 2025 Egypt demand 12.6 t, highest quarter since Q2 2024, +4% y/y and +27% q/q.", type: "EXTERNAL FACT", source: "S5", confidence: "Medium" },
  { text: "Bars and coins (~23.6 t) are the relevant investment-demand segment; gold in EGP is not computed because the gold price input is UNKNOWN.", type: "UNKNOWN", source: "Requires gold price feed", confidence: "Low" },
  { text: "FRA-approved gold funds: 3 funds, ~EGP 2.1bn, ~200k investors (May 2025). Indicates existing appetite for regulated gold exposure.", type: "EXTERNAL FACT", source: "S1", confidence: "High" },
  { text: "FRA does not license direct gold trading with the public; it falls under the Commercial Law (1999) and Precious Metals & Gemstones Law (1976).", type: "EXTERNAL FACT", source: "S1", confidence: "High" },
  { text: "Digital gold is now a competitive category: Thndr Gold (Jun 2026), mngm, Goldady and Gold Era operate in Egypt.", type: "EXTERNAL FACT", source: "S2, S3, S4", confidence: "Medium" },
  { text: "Competitor price point found: Thndr charges a flat 1% each side. Other competitors' spreads are not published in the pages reviewed.", type: "BENCHMARK", source: "S2", confidence: "Medium" },
  { text: "Fintech CAC benchmark (consumer investing and trading): USD 166, US-centric, paid acquisition.", type: "BENCHMARK", source: "S7", confidence: "Low" },
  { text: "MENA: <3% of population actively invests in financial assets; cash >80% of Egyptian retail spending (unverified snippet).", type: "BENCHMARK", source: "S11", confidence: "Low" },
];

export const TRENDS = [
  "Investment-led gold demand (bars and coins) held up in 2025 while jewelry fell 18% (S5): consistent with gold as a store of value, not proof that demand will move to digital channels.",
  "Super-app style distribution is already being used (Thndr bundles stocks, funds and gold) (S2).",
  "Regulated wrapper (fund) and unregulated direct-holding models coexist; the FRA has cautioned against implied endorsement of direct gold (S1).",
];

export const THREATS = [
  "Incumbents with lower acquisition friction (existing investors on Thndr).",
  "Price transparency: a 1% flat fee (S2) caps what Aman can charge without a clear differentiator.",
  "Regulatory clarity: no license for direct retail gold trading; Aman's legal role (distributor vs seller) is undefined.",
];

export const OPPORTUNITIES = [
  "Owned distribution to 360k MAU and 1M Super App users at near-zero media cost (Aman data).",
  "Gold funded from Aman's own payment rails may reduce funding cost (hypothesis: gateway 1% is the largest cost line).",
  "Recurring saving plans and goal-based gold (competitor availability not verified).",
];
