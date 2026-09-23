import type { AgentOut, Ctx } from "./context";
import { pct } from "./context";

export interface Risk {
  id: string; risk: string; category: string; prob: "Low" | "Medium" | "High"; impact: "Low" | "Medium" | "High" | "Critical";
  severity: "Low" | "Medium" | "High" | "Critical"; mitigation: string; owner: string; status: string;
  critical: boolean; mitigable: string; cost: string; timeline: string; mvpBlocker: boolean;
}

const R = (id: string, risk: string, category: string, prob: Risk["prob"], impact: Risk["impact"], severity: Risk["severity"], mitigation: string, owner: string, mitigable: string, cost: string, timeline: string, mvpBlocker: boolean): Risk =>
  ({ id, risk, category, prob, impact, severity, mitigation, owner, status: "Open", critical: severity === "Critical", mitigable, cost, timeline, mvpBlocker });

const BASE: Risk[] = [
  R("R1", "No licence perimeter for direct retail gold trading (FRA covers fund certificates only); Aman's legal role undefined", "Regulatory", "High", "Critical", "Critical", "Legal opinion; structure as distributor of a licensed provider (mngm/Evolve) or use FRA-approved fund", "Legal / Compliance", "Partly - depends on regulator/provider", "UNKNOWN (external counsel)", "1-3 months", true),
  R("R2", "Legal ownership of gold and customer title records undefined (who owns, where held, how recorded)", "Compliance", "Medium", "Critical", "Critical", "Provider-held segregated allocation with customer sub-ledger and title terms; audit right", "Legal / Product", "Yes", "UNKNOWN", "1-2 months", true),
  R("R3", "Negative unit margin: spread+fee below gateway cost", "Market", "High", "Critical", "Critical", "Cheaper funding rails, repricing, or wallet-funded purchases", "CFO / Payments", "Yes - needs PGW renegotiation", "Commercial negotiation", "1-2 months", true),
  R("R4", "Payment succeeds but gold allocation fails (or reverse)", "Settlement", "Medium", "High", "High", "Two-phase order state machine, idempotent retries, auto-refund SLA, daily reconciliation", "Engineering", "Yes", "Included in MVP build", "In MVP", true),
  R("R5", "Provider unavailable / API outage / market closed", "Provider", "Medium", "High", "High", "Order queue with cut-off windows (Thndr uses 3 daily windows), clear customer messaging, secondary provider", "Product / Ops", "Yes", "Low", "In MVP", false),
  R("R6", "Price feed delayed or stale; rapid gold price move between quote and execution", "Market", "Medium", "High", "High", "Quote validity timer, slippage limits, back-to-back execution or price lock with provider", "Product / Provider", "Yes", "Provider terms", "In MVP", true),
  R("R7", "Reconciliation breaks between wallet ledger, provider ledger and vault statements", "Reconciliation", "Medium", "High", "High", "Automated T+0/T+1 three-way reconciliation, exception queue", "Finance Ops", "Yes", "Integration effort", "In MVP", false),
  R("R8", "Liquidation demand spike or market closure prevents sell", "Liquidity", "Low", "High", "Medium", "Provider buy-back commitment; sell-side cut-offs; disclosure", "Provider / Product", "Partly", "Provider terms", "Pre-launch", false),
  R("R9", "Fraud: account takeover, mule accounts, stolen-card funding, price-latency arbitrage", "Fraud", "Medium", "High", "High", "KYC tiering, limits (min/max UNKNOWN), velocity rules, cooling-off on withdrawals, quote expiry", "Risk / Fraud", "Yes", "Moderate", "In MVP", false),
  R("R10", "Disputes and chargebacks on gold purchases", "Operational", "Medium", "Medium", "Medium", "Dispute policy, evidence logs, provider dispute SLA", "Support / Ops", "Yes", "Low", "Pre-launch", false),
  R("R11", "Customer misunderstanding of ownership, price changes and spread", "Customer Experience", "High", "Medium", "High", "Plain-language disclosure of buy/sell prices and spread on every screen; education", "Product / Legal", "Yes", "Low", "In MVP", false),
  R("R12", "Brand/reputation damage if redemption or custody fails", "Reputation", "Low", "Critical", "High", "Insured vault, named custodian, proof-of-reserve reporting, pilot with limits", "CEO / Risk", "Partly", "Insurance cost UNKNOWN", "Pre-launch", false),
  R("R13", "Technology: integration complexity, security of ledger", "Technology", "Medium", "Medium", "Medium", "Penetration test, ledger design review", "CTO", "Yes", "In build", "In MVP", false),
  R("R14", "Provider concentration (single provider dependence, mngm/Evolve)", "Provider", "Medium", "High", "High", "Contract exit rights, data portability, second provider option", "Procurement", "Yes", "Legal cost", "Pre-launch", false),
];

export function risk(c: Ctx): AgentOut {
  const RISKS = getRisks(c);
  const crit = RISKS.filter((r) => r.critical);
  return {
    id: "risk", name: "Product / Risk Challenger Agent", demo: true,
    thesis: `${crit.length} critical risk${crit.length === 1 ? " is" : "s are"} unresolved (${crit.map((r) => r.id).join(", ") || "none"}); ${RISKS.filter((r) => r.mvpBlocker).length} risks are gates that must close before any build. The regulatory stance rests on a provider statement that has not been confirmed in writing.`,
    sections: [
      { title: "Critical Risks", items: crit.map((r) => `${r.id} ${r.risk}`) },
      { title: "Hidden Risks", items: ["Price-latency arbitrage: customers exploit stale quotes between app price and provider price.", "Sell-side liquidity: sells are excluded from the model, but the promise 'sell anytime' is central to trust.", "In-house cost is not zero: ops/tech/marketing are borrowed from other roadmap items."] },
      { title: "Operational Dependencies", items: ["Provider (mngm/Evolve) API, quoting and settlement terms.", "Vault/custodian statements for reconciliation (EgyCash/CBE-licensed vault per S3/S2).", "Aman prepaid card programme (issuance, ledger, limits) and InstaPay top-up settlement.", "Card balance to provider settlement, including timing of cash movement to the provider."] },
      { title: "Regulatory Questions", items: ["Is Aman acting as agent, distributor or seller of gold? Which licence covers it?", "Does FRA/CBE view a mobile-wallet-funded gold product as a financial service requiring approval? (S1: direct gold outside FRA fund regime.)", "AML/KYC thresholds and reporting for gold purchases."] },
      { title: "Technical Dependencies", items: ["Real-time quote service with expiry, order state machine, ledger, reconciliation, notification service."] },
      { title: "Fraud Risks", items: RISKS.filter((r) => r.category === "Fraud").map((r) => r.risk) },
      { title: "Customer Risks", items: RISKS.filter((r) => ["Customer Experience", "Liquidity"].includes(r.category)).map((r) => r.risk) },
      { title: "Mitigations", items: RISKS.map((r) => `${r.id}: ${r.mitigation} (owner: ${r.owner})`) },
      { title: "Go/No-Go Conditions", items: ["GO for MVP build only if: (1) provider confirms in writing it is the regulated party and Aman's role; (2) provider contract defines title, quoting, buy-back and settlement; (3) prepaid card is live (or has a dated launch) and gold is a permitted use of card balance; (4) a path to LTV/CAC >= 1 agreed with Finance.", "NO-GO if any of the above cannot be obtained within the validation window."] },
    ],
    confidence: "Medium",
    assumptions: ["Probability/impact ratings are qualitative judgement, not data."],
    sourcesUsed: ["S1", "S2", "S3"],
    position: "VALIDATE FURTHER",
    positionReason: "Do not build until the provider confirms its regulatory role in writing, title/custody terms are agreed and the funding path (card + InstaPay) is confirmed; a closed pilot is acceptable only after those gates.",
    strength: "Identifies blockers that no financial model reveals.",
    weak: "Probability ratings are judgement calls without Aman data.",
    missing: "Legal opinion, provider contract, fraud loss data.",
    config: {
      id: "risk", name: "Product / Risk Challenger Agent", role: "Independent Product, Risk and Operations executive",
      objective: "Try to break the business case.",
      systemPrompt: "You are the most skeptical executive. Ask why gold, why Aman, why now. Examine ownership, custody, settlement, reconciliation, price feed, fraud, regulation. Produce a risk register with severity, owner, mitigation and MVP-blocker status.",
      inputs: ["All agent outputs", "Regulatory sources"], outputs: ["Risk register", "Go/No-Go conditions", "Position"],
    },
  };
}

/** Risk register that reacts to current inputs (regulatory stance, prepaid-card status, unit economics). */
export function getRisks(c: Pick<Ctx, "inp" | "r">): Risk[] {
  const out = BASE.map((x) => ({ ...x }));
  const by = (id: string) => out.find((x) => x.id === id)!;
  const sev = (x: Risk, s: Risk["severity"]) => { x.severity = s; x.critical = s === "Critical"; };
  if (c.inp.providerRegulatory.value === 1) {
    const r1 = by("R1");
    r1.risk = "Regulatory perimeter: PM states the provider carries all licensing, but the FRA (Financial Regulatory Authority) says direct retail gold is outside its fund regime (S1); the regulated party and Aman's role are not confirmed in writing";
    r1.mitigation = "Written confirmation from provider (licence, regulated party, Aman as distributor/agent) plus legal review of the Aman prepaid-card-to-gold flow";
    r1.status = "PM-stated, unconfirmed"; r1.prob = "Medium"; sev(r1, "High");
    sev(by("R2"), "High"); by("R2").status = "Provider contract required";
  }
  const r3 = by("R3");
  const m = c.r.unit.marginPct, lc = c.r.unit.ltvCac;
  if (m <= 0) { r3.risk = `Negative unit margin (${pct(m)} per EGP transacted)`; sev(r3, "Critical"); }
  else {
    r3.risk = `Acquisition economics: LTV/CAC is ${lc === null ? "UNKNOWN" : lc.toFixed(2)} (CAC ${c.r.unit.cac.toFixed(0)} EGP vs lifetime contribution ${c.r.unit.ltv === null ? "UNKNOWN" : c.r.unit.ltv.toFixed(0)} EGP)`;
    r3.category = "Market"; r3.mitigation = "Lower CAC via owned channels, raise repeat rate and monthly amount, or raise spread/fee; validate with Experiments 3, 5, 6";
    sev(r3, lc !== null && lc < 1 ? "Critical" : lc !== null && lc < 3 ? "High" : "Medium");
    r3.mvpBlocker = lc !== null && lc < 1;
  }
  const noCard = (c.inp.cardCustomers.value ?? 0) === 0;
  const r15: Risk = { id: "R15", risk: noCard ? "Zero-cost purchase path depends on the Aman prepaid card, which is not launched yet (0 card customers); issuance, activation and CBE prepaid-card rules apply, and customers must get a card and top up before buying gold" : "Prepaid-card funding path: activation, limits and prepaid-card rules", category: "Regulatory", prob: noCard ? "High" : "Medium", impact: "Critical", severity: noCard ? "Critical" : "High", mitigation: "Confirm card launch date and gold purchase is a permitted use of card balance; fold card activation into the funnel and CAC", owner: "Cards / Payments / Legal", status: "Open", critical: noCard, mitigable: "Yes - depends on card programme timeline", cost: "UNKNOWN", timeline: "UNKNOWN (card programme)", mvpBlocker: noCard };
  const r16: Risk = { id: "R16", risk: "InstaPay top-up: per-transaction/daily limits, fees to Aman as receiver, reconciliation and failed/late top-ups (PM states no cost)", category: "Settlement", prob: "Medium", impact: "Medium", severity: "Medium", mitigation: "Confirm InstaPay fee schedule and limits in writing; add top-up reconciliation", owner: "Payments / Finance Ops", status: "PM-stated, unconfirmed", critical: false, mitigable: "Yes", cost: "Low", timeline: "Pre-launch", mvpBlocker: false };
  const launch = c.inp.cardLaunchMonths.value;
  const launchSoon = launch !== null && launch <= (c.inp.launchMonths.value ?? 99);
  if (noCard && launchSoon) {
    r15.risk = `Zero-cost purchase path depends on the Aman prepaid card, which PM states goes live in about ${launch} month(s), before the gold pilot could launch; customers still need to get a card and top up before buying gold, and prepaid-card rules must permit buying gold from the balance`;
    r15.severity = "High"; r15.critical = false; r15.mvpBlocker = false; r15.prob = "Medium"; r15.status = "Planned launch (PM)"; r15.timeline = `~${launch} month(s)`; r15.cost = "Card programme cost sits outside this model";
  }
  return [...out, r15, r16];
}
