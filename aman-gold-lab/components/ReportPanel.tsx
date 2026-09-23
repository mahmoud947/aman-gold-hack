"use client";
import { CHANNELS, funnelRows } from "../lib/agents/cmo";
import { egp, months, num, pct } from "../lib/agents/context";
import { getRisks } from "../lib/agents/risk";
import type { DebateOutput } from "../lib/business-case/debate";
import { consensus, decisionMatrix, reopenPath } from "../lib/business-case/decision";
import { experiments } from "../lib/business-case/experiments";
import { SCENARIO_DEFS, trace, type ScenarioName } from "../lib/business-case/financial-model";
import { COMPETITORS } from "../lib/research/competitors";
import { MARKET_FACTS } from "../lib/research/market";
import { SOURCES } from "../lib/research/sources";
import { Badge, Bullets, PosBadge } from "./ui";

export default function ReportPanel({ d }: { d: DebateOutput }) {
  const { ctx } = d;
  const { r, p, inp } = ctx;
  const c = consensus(d);
  const RISKS = getRisks(ctx);
  const ex = experiments(ctx);
  const mx = decisionMatrix(ctx);
  const tRev = trace("revenue", inp, r);
  const know = Object.values(inp).filter((i) => i.type === "ACTUAL" || i.type === "EXTERNAL FACT");
  const believe = Object.values(inp).filter((i) => i.type === "ASSUMPTION" || i.type === "ESTIMATE" || i.type === "BENCHMARK");
  const unk = Object.values(inp).filter((i) => i.value === null);
  const P = ({ n, t, children }: { n: number; t: string; children: React.ReactNode }) => (<div className="page"><div className="mut">Page {n} of 14</div><h2>{t}</h2>{children}</div>);
  return (
    <div>
      <div className="page" style={{ textAlign: "center" }}>
        <div className="mut">INTERNAL - TOP MANAGEMENT - DEMO AI AGENTS (rule-based) - based on inputs locked at generation time</div>
        <h1 style={{ fontSize: 28, marginTop: 20 }}>AMAN GOLD INVESTMENT</h1>
        <h2 style={{ border: 0 }}>Business Case &amp; MVP Proposal</h2>
        <p><PosBadge p={c.decision.position} /></p>
        <p className="mut">Generated {new Date().toLocaleDateString("en-GB")}. Every figure carries its data type; assumption-based figures are not facts.</p>
      </div>

      <P n={1} t="Executive Summary">
        <p><b>Opportunity.</b> Aman has no investment product today. Gold is an established store of value in Egypt (bars and coins 23.6 t in 2025, source S5) and digital gold is already offered by Thndr, mngm and Goldady. Aman could distribute a gold product to {num(inp.mau.value ?? 0)} MAU (ACTUAL).</p>
        <p><b>Customer problem.</b> Customers who want to save in gold face high entry sizes, storage and trust concerns; whether Aman customers feel this problem is not yet evidenced.</p>
        <p><b>Proposal.</b> A gold buy, hold, sell and track experience inside the Super App, supplied by a licensed provider (mngm/Evolve under discussion), gated by a validation plan.</p>
        <p><b>Potential gain.</b> Based on the current assumptions: {egp(r.h36.revenue)} 36-month revenue on {egp(r.h36.throughput)} throughput and {num(r.h36.buyers)} buyers <Badge t={tRev.type} />.</p>
        <p><b>Cost.</b> Incremental cash: MVP and integration {egp(p.mvpCost)}, run team {egp(p.fixedMonthly)}/month (in-house, per PM); the in-house effort has an opportunity cost of {egp(p.fullMvpCost)} plus {egp(p.fullFixedMonthly)}/month (ESTIMATE). Marketing at CAC {egp(p.cac)}: {egp(r.h36.marketing)} over 36 months.</p>
        <p><b>Recommendation: <PosBadge p={c.decision.position} /></b> {c.decision.reasoning[0]}</p>
        <p><b>Biggest risks.</b> {RISKS.filter((x) => x.critical).map((x) => x.risk).join("; ")}.</p>
        <p><b>Must be validated.</b> {c.validationRequired.join("; ")}.</p>
      </P>

      <P n={2} t="Strategic Rationale">
        <div className="grid g2">
          <div className="card"><h3>Customer</h3><Bullets items={[`${num(inp.superAppUsers.value ?? 0)} Super App users; ${num(inp.mau.value ?? 0)} MAU; ${num(inp.totalCustomers.value ?? 0)} active this year (ACTUAL)`, "Gold demand from Aman users: not evidenced"]} /></div>
          <div className="card"><h3>Market</h3><Bullets items={MARKET_FACTS.slice(0, 2).map((f) => f.text)} /></div>
          <div className="card"><h3>Aman</h3><Bullets items={["Owned distribution and payment rails", "No investment section today", "Consumer Finance base of " + num(inp.cfCustomers.value ?? 0)]} /></div>
          <div className="card"><h3>Opportunity</h3><Bullets items={["First investment product; engagement and cross-sell", "Aman's 0.5% spread is below the only verified competitor price (Thndr 1% flat, S2); whether that is a differentiator or a margin giveaway needs testing"]} /></div>
        </div>
      </P>

      <P n={3} t="Customer Problem">
        <Bullets items={["Current behaviour: buying gold through jewellers/bullion dealers or, for investors, FRA-regulated gold funds (3 funds, ~200k investors, S1) or digital platforms.", "Pain points (hypotheses, not validated): entry size, storage, trust in price, difficulty selling.", "Opportunity: small, instant, in-app gold with transparent price. Evidence from Aman customers: none yet (UNKNOWN)."]} />
      </P>

      <P n={4} t="Solution: Aman Gold">
        <table><thead><tr><th>Stage</th><th>Customer experience</th></tr></thead><tbody>
          <tr><td>Buy</td><td>Quote with visible spread, pay from wallet/card/bank, gold allocated in grams (24k)</td></tr>
          <tr><td>Hold</td><td>Balance in grams with live EGP value; provider-vaulted, insured (per provider)</td></tr>
          <tr><td>Sell</td><td>Instant sell-back quote at market minus spread; proceeds to wallet</td></tr>
          <tr><td>Track</td><td>Portfolio value, transaction history, price alerts, recurring plan</td></tr></tbody></table>
      </P>

      <P n={5} t="Customer Experience (MVP screens)">
        <div className="grid g6">
          {[["Onboarding", "Value explainer, KYC status, risk disclosure, ownership terms"], ["Gold Home", "Live buy/sell price, chart, balance, education card"], ["Buy", "Amount in EGP or grams, quote timer, spread disclosed, confirm"], ["Sell", "Grams or EGP, sell quote, proceeds and timing"], ["Portfolio", "Grams held, EGP value, average cost, P&L"], ["Transactions", "Orders, status (pending/settled/failed), receipts"]].map(([t, x]) => (
            <div className="card" key={t} style={{ minHeight: 120 }}><b>{t}</b><p className="mut">{x}</p></div>))}
        </div>
      </P>

      <P n={6} t="Market">
        <table><thead><tr><th>Finding</th><th>Type</th><th>Source</th></tr></thead><tbody>{MARKET_FACTS.map((f, i) => (<tr key={i}><td>{f.text}</td><td><Badge t={f.type} /></td><td>{f.source}</td></tr>))}</tbody></table>
        <h3>Competitors</h3>
        <Bullets items={COMPETITORS.map((x) => `${x.company}: min ${x.minInvestment}; fees ${x.fees}`)} />
        <p className="mut">Sources: {SOURCES.map((s) => s.id).join(", ")} (see Research tab).</p>
      </P>

      <P n={7} t="Business Model">
        <Bullets items={[`Buy price = market + ${pct(p.spread * 100)}; sell price = market - ${pct(p.spread * 100)}; fee ${pct(p.fee * 100)}.`, `Revenue per EGP transacted: ${pct((p.spread + p.fee) * 100)}. Variable cost: ${pct((p.pgw + p.topup + p.provider + p.custody) * 100)} (purchases debit the Aman prepaid card balance, so no gateway; InstaPay top-up, provider and custody all stated as zero cost by PM).`, `Margin per EGP transacted: ${pct(r.unit.marginPct)}.`, `In-house team: no incremental cash per PM. Opportunity cost shown separately (${inp.opsTeamFte.value} FTE x ${egp(inp.fteMonthCost.value)}/month, ESTIMATE).`]} />
        {r.unit.marginPct <= 0 ? <p className="alert">The current model loses money on every transaction. Growth increases losses.</p> : <p className="note">Unit margin is positive ({pct(r.unit.marginPct)}); lifetime contribution per buyer is {r.unit.ltv === null ? "UNKNOWN" : egp(r.unit.ltv)} against CAC of {egp(r.unit.cac)}. The zero funding cost depends on the prepaid card (going live in about a month per PM) and free InstaPay top-ups (unconfirmed).</p>}
      </P>

      <P n={8} t="Financial Opportunity">
        <table><thead><tr><th></th><th className="num">12m</th><th className="num">24m</th><th className="num">36m</th></tr></thead><tbody>
          {([["Buyers (cumulative)", (h: typeof r.h12) => num(h.buyers)], ["Gold throughput", (h: typeof r.h12) => egp(h.throughput)], ["Revenue", (h: typeof r.h12) => egp(h.revenue)], ["Contribution", (h: typeof r.h12) => egp(h.contribution)], ["Marketing", (h: typeof r.h12) => egp(h.marketing)], ["Run team", (h: typeof r.h12) => egp(h.fixed)], ["Net after MVP", (h: typeof r.h12) => egp(h.net)]] as [string, (h: typeof r.h12) => string][]).map(([l, f]) => (<tr key={l}><td>{l}</td><td className="num">{f(r.h12)}</td><td className="num">{f(r.h24)}</td><td className="num">{f(r.h36)}</td></tr>))}</tbody></table>
        <Bullets items={[`CAC ${egp(r.unit.cac)} (${inp.cac.type}); LTV ${r.unit.ltv === null ? "UNKNOWN" : egp(r.unit.ltv)}; LTV/CAC ${r.unit.ltvCac === null ? "UNKNOWN" : r.unit.ltvCac.toFixed(3)}; payback ${months(r.unit.paybackMonths)}.`, `Revenue trace: ${tRev.formula}`]} />
      </P>

      <P n={9} t="Scenarios">
        <table><thead><tr><th></th>{(Object.keys(SCENARIO_DEFS) as ScenarioName[]).map((k) => <th key={k}>{k}</th>)}</tr></thead><tbody>
          <tr><td>Assumptions</td>{(Object.keys(SCENARIO_DEFS) as ScenarioName[]).map((k) => <td key={k} className="mut">{SCENARIO_DEFS[k].desc}</td>)}</tr>
          <tr><td>Buyers 36m</td>{(Object.keys(SCENARIO_DEFS) as ScenarioName[]).map((k) => <td key={k}>{num(ctx.scen[k].h36.buyers)}</td>)}</tr>
          <tr><td>Revenue 36m</td>{(Object.keys(SCENARIO_DEFS) as ScenarioName[]).map((k) => <td key={k}>{egp(ctx.scen[k].h36.revenue)}</td>)}</tr>
          <tr><td>Contribution 36m</td>{(Object.keys(SCENARIO_DEFS) as ScenarioName[]).map((k) => <td key={k}>{egp(ctx.scen[k].h36.contribution)}</td>)}</tr>
          <tr><td>Net 36m</td>{(Object.keys(SCENARIO_DEFS) as ScenarioName[]).map((k) => <td key={k}>{egp(ctx.scen[k].h36.net)}</td>)}</tr></tbody></table>
        <p className="mut">Stress tests: {ctx.stress.filter((s) => !s.viable).length} of {ctx.stress.length} shocks are non-viable at 36 months (see Finance tab).</p>
      </P>

      <P n={10} t="Go-to-Market">
        <Bullets items={funnelRows(ctx).map((f) => `${f.stage}: ${num(f.n)}${f.conv === null ? "" : ` (${pct(f.conv, 1)}, ${f.type})`}`)} />
        <Bullets items={CHANNELS.slice(0, 5).map((x) => `${x.ch}: CAC ${x.cac}`)} />
        <p>Activation: education card, first-buy path, price alerts, recurring plan. No incentives until unit margin is positive. Retention hypothesis: recurring plans and price alerts (effect sizes UNKNOWN).</p>
      </P>

      <P n={11} t="Risks">
        <table><thead><tr><th>Risk</th><th>Severity</th><th>Mitigation</th><th>Owner</th></tr></thead><tbody>{RISKS.filter((x) => x.severity === "Critical" || x.severity === "High").map((x) => (<tr key={x.id}><td>{x.risk}</td><td className={x.critical ? "bad" : ""}>{x.severity}</td><td>{x.mitigation}</td><td>{x.owner}</td></tr>))}</tbody></table>
      </P>

      <P n={12} t="MVP">
        <div className="grid g2">
          <div className="card"><h3>Build now</h3><Bullets items={["Gold Home, Buy, Sell, Portfolio, Transactions", "Provider quote + order API integration (mngm/Evolve), order state machine, ledger, reconciliation", "KYC reuse from Super App, disclosures, limits", "Ops back-office for exceptions"]} /></div>
          <div className="card"><h3>Do not build</h3><Bullets items={["Physical delivery/redemption (v2)", "Recurring plans, gamification, referrals (after unit margin positive)", "Silver / other metals", "Paid media campaigns"]} /></div>
        </div>
        <Bullets items={[`Timeline: ~${inp.launchMonths.value} months to pilot (ESTIMATE), after legal and provider gates.`, `Investment: no incremental cash (in-house team, per PM). Opportunity cost: ${egp(p.fullMvpCost)} (${(inp.mvpFteMonths.value ?? 0) + (inp.integrationFteMonths.value ?? 0)} FTE-months, ESTIMATE) plus ${inp.opsTeamFte.value} FTE run team. Prepaid card build is outside this estimate.`, "Recommendation: start pre-build validation (Experiments 1-3, ~1.5 FTE-months). Commit the MVP build only after the gates on page 14 are met."]} />
      </P>

      <P n={13} t="Validation Plan">
        <table><thead><tr><th>#</th><th>Experiment</th><th>Metric</th><th>Target</th><th>Sample</th><th>Duration</th><th>Success</th><th>Failure</th></tr></thead><tbody>{ex.map((e) => (<tr key={e.n}><td>{e.n}</td><td>{e.name}</td><td>{e.metric}</td><td>{e.target}</td><td>{e.sample}</td><td>{e.duration}</td><td>{e.success}</td><td>{e.failure}</td></tr>))}</tbody></table>
      </P>

      <P n={14} t="Management Decision">
        <p><PosBadge p={c.decision.position} /> <span className="mut">{c.decision.gate}</span></p>
        <div className="grid g2">
          <div className="card"><h3>What we know (ACTUAL / EXTERNAL FACT)</h3><Bullets items={know.map((i) => `${i.label}: ${i.value} ${i.unit}`).concat(["FRA does not license direct gold trading (S1)", "Thndr charges 1% flat each side (S2)"])} /></div>
          <div className="card"><h3>What we believe (ASSUMPTION / ESTIMATE / BENCHMARK)</h3><Bullets items={believe.map((i) => `${i.label}: ${i.value} ${i.unit} [${i.type}]`)} /></div>
          <div className="card"><h3>What we do not know (UNKNOWN)</h3><Bullets items={unk.map((i) => i.label).concat(["Cross-sell CAC", "Aman licence path", "Customer demand inside Aman"])} /></div>
          <div className="card"><h3>What must be validated</h3><Bullets items={c.validationRequired} /></div>
          <div className="card"><h3>Investment required</h3><Bullets items={[`Incremental cash: ${egp(p.mvpCost)} MVP + ${egp(p.fixedMonthly)}/month run (PM: in-house team)`, `Opportunity cost (ESTIMATE): pre-build validation ~${egp(1.5 * (inp.fteMonthCost.value ?? 0))}; MVP + integration ${egp(p.fullMvpCost)}; run team ${egp(p.fullFixedMonthly)}/month`, "Marketing at CAC: " + egp(r.h36.marketing) + " over 36 months"]} /></div>
          <div className="card"><h3>Expected upside</h3><Bullets items={[`At current inputs: ${egp(r.h36.contribution)} contribution and ${egp(r.h36.net)} net over 36 months.`, `Aggressive scenario net: ${egp(ctx.scen.Aggressive.h36.net)}.`, "Strategic upside (engagement, cross-sell) is unquantified."]} /></div>
          <div className="card"><h3>Key risks</h3><Bullets items={c.failureDrivers} /></div>
          <div className="card"><h3>Proposed next step</h3><Bullets items={["Do not commit the MVP build yet.", "Run a 4-6 week pre-build validation: written provider/regulatory confirmation, prepaid card launch date, confirmation of free InstaPay top-up, Experiments 1-3.", ...reopenPath(ctx).slice(0, 2), "Return to management with measured funnel, CAC and a positive-margin pricing/funding structure."]} /></div>
        </div>
        <h3>Reasoning</h3>
        <Bullets items={c.decision.reasoning} />
        <h3>Where the executive team stands</h3>
        <table><thead><tr><th>Agent</th><th>Initial</th><th>Revised</th></tr></thead><tbody>{d.r7.map((x) => (<tr key={x.id}><td>{x.name}</td><td><PosBadge p={x.initial} /></td><td><PosBadge p={x.revised} /></td></tr>))}</tbody></table>
        <h3>Evidence by dimension</h3>
        <table><tbody>{mx.map((m) => (<tr key={m.dimension}><td>{m.dimension}</td><td>{m.evidence}</td></tr>))}</tbody></table>
      </P>
    </div>
  );
}
