export interface Competitor {
  company: string; product: string; market: string; minInvestment: string; buySell: string; spread: string;
  fees: string; recurring: string; wallet: string; redemption: string; custody: string; distribution: string;
  trust: string; target: string; model: string; sources: string[];
}
const NV = "Not verified";

export const COMPETITORS: Competitor[] = [
  { company: "Thndr (Thndr Asset Management)", product: "Thndr Gold (digital 24k gold)", market: "Egypt", minInvestment: "0.001 g", buySell: NV, spread: NV, fees: "Flat 1% on buy and on sell", recurring: NV, wallet: "Holdings shown in grams in-app", redemption: NV + " (physical redemption not confirmed)", custody: "EGYCASH (described as backed by CBE)", distribution: "Thndr app (stocks, funds, gold in one app)", trust: "FRA-licensed investing app (self-described #1 by active users)", target: "Retail investors already investing", model: "Percentage fee both sides; 3 executions per working day", sources: ["S2"] },
  { company: "mngm (Evolve Holding)", product: "Fractional and physical 24k gold and silver", market: "Egypt", minInvestment: "0.1 g multiples", buySell: "Live bid/ask at international benchmark", spread: NV, fees: NV, recurring: NV, wallet: "Digital vault balance", redemption: "Physical bars/delivery, delivery after accumulating 8 g", custody: "CBE-licensed insured vault", distribution: "mngm app/web; partners incl. NBE, Fawry, PayTabs", trust: "Evolve Holding-backed; LBMA/hallmark claims", target: "Retail and gifting", model: "Bid/ask spread (values not published in reviewed page)", sources: ["S3"] },
  { company: "Goldady", product: "Pooled digital gold ownership", market: "Egypt", minInvestment: "1 g", buySell: NV, spread: NV, fees: "Claims up to 70% lower making charges than retailers; vaulting fee calculator", recurring: NV, wallet: "Digital account", redemption: "Instant sell, home delivery of bars", custody: "EgyCash partnership, insured (self-claim)", distribution: "Web/app", trust: "Lists commercial registry, hallmark authority and IT licences", target: "Retail gold buyers", model: "Pool allocation; vaulting fees", sources: ["S4"] },
  { company: "Gold Era (Egypt)", product: "Gold buying app", market: "Egypt", minInvestment: "1 g (search-result snippet only)", buySell: NV, spread: NV, fees: NV, recurring: NV, wallet: NV, redemption: NV, custody: NV, distribution: NV, trust: NV, target: NV, model: NV, sources: [] },
  { company: "FRA-approved gold funds (incl. Evolve Azimut)", product: "Gold investment fund certificates", market: "Egypt", minInvestment: NV, buySell: "Fund NAV", spread: "n/a", fees: "Fund management fees not verified", recurring: NV, wallet: "n/a", redemption: "Cash redemption", custody: "Fund custodian", distribution: "Banks / brokers", trust: "FRA regulated: 3 funds, EGP 2.1bn, ~200k investors (May 2025)", target: "Retail investors via funds", model: "Management fee", sources: ["S1", "S9"] },
];

export const GAPS = {
  doWell: [
    "Thndr: very low minimum (0.001 g), gold inside an existing investing app, simple flat fee (S2).",
    "mngm: physical redemption, insured CBE-licensed vault and bank/payment partners (S3).",
    "Goldady: licence disclosure and vaulting cost transparency (S4).",
  ],
  complaints: ["Customer complaint data was NOT found in this research pass. Required: app-store reviews and social listening before any claim is made."],
  standard: ["Fractional purchase (sub-gram) and 24k focus", "Insured vault custody with a named partner (EgyCash / CBE-licensed)", "Physical redemption or delivery option"],
  underserved: ["No evidence yet of recurring gold saving plans or goal-based gold in Egypt (not verified - could not confirm competitors lack them).", "Gold funded directly from a wallet/credit line/instalment: not verified as available or desired."],
  differentiation: ["Distribution to ~360k MAU / 1M Super App users at near-zero media cost (Aman data, ACTUAL).", "Embedding gold in existing payments and Consumer Finance journeys (hypothesis, not evidence)."],
  caveat: "Competitor weaknesses are NOT treated as opportunities without evidence.",
};
