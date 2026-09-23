"use client";
import type { Ctx } from "../lib/agents/context";
import { egp, months, num, pct } from "../lib/agents/context";
import { SCENARIO_DEFS, type Horizon, type Result, type ScenarioName } from "../lib/business-case/financial-model";
import type { Inputs } from "../lib/types";
import { Badge } from "./ui";

const HR = (h: Horizon) => [
  ["Cumulative buyers", num(h.buyers)], ["Active repeat investors", num(h.activeInvestors)], ["Transactions", num(h.transactions)],
  ["Gold throughput", egp(h.throughput)], ["Revenue", egp(h.revenue)], ["Variable costs", egp(h.variableCost)],
  ["Contribution", egp(h.contribution)], ["Marketing (CAC x buyers)", egp(h.marketing)], ["Run team", egp(h.fixed)], ["Net after MVP", egp(h.net)],
];

export function HorizonTable({ r }: { r: Result }) {
  const cols = [r.h12, r.h24, r.h36];
  return (
    <table>
      <thead><tr><th></th><th className="num">12 months</th><th className="num">24 months</th><th className="num">36 months</th></tr></thead>
      <tbody>
        {HR(r.h12).map((row, i) => (<tr key={i}><td>{row[0]}</td>{cols.map((h, j) => <td key={j} className={"num " + (row[1].startsWith("-") ? "bad" : "")}>{HR(h)[i][1]}</td>)}</tr>))}
        <tr><td>CAC</td><td className="num" colSpan={3}>{egp(r.unit.cac)}</td></tr>
        <tr><td>LTV</td><td className="num" colSpan={3}>{r.unit.ltv === null ? "UNKNOWN" : egp(r.unit.ltv)}</td></tr>
        <tr><td>LTV / CAC</td><td className="num" colSpan={3}>{r.unit.ltvCac === null ? "UNKNOWN" : r.unit.ltvCac.toFixed(3)}</td></tr>
        <tr><td>CAC payback</td><td className="num" colSpan={3}>{months(r.unit.paybackMonths)}</td></tr>
      </tbody>
    </table>
  );
}

const SLIDERS: { key: string; label: string; min: number; max: number; step: number; unit: string }[] = [
  { key: "adoption", label: "Adoption (% of MAU)", min: 1, max: 60, step: 1, unit: "%" },
  { key: "onboarding", label: "Onboarding completion", min: 1, max: 60, step: 1, unit: "%" },
  { key: "firstPurchase", label: "First-purchase conversion", min: 1, max: 60, step: 1, unit: "%" },
  { key: "repeat", label: "Repeat rate", min: 1, max: 60, step: 1, unit: "%" },
  { key: "firstInvestment", label: "First investment (EGP)", min: 100, max: 10000, step: 100, unit: "" },
  { key: "monthlyInvestment", label: "Monthly investment (EGP)", min: 500, max: 20000, step: 500, unit: "" },
  { key: "spread", label: "Spread (% per side)", min: 0.1, max: 3, step: 0.1, unit: "%" },
  { key: "fee", label: "Transaction fee (%)", min: 0, max: 3, step: 0.1, unit: "%" },
  { key: "pgw", label: "Payment gateway cost (%)", min: 0, max: 3, step: 0.05, unit: "%" },
  { key: "cac", label: "CAC (EGP per acquired customer)", min: 10, max: 1000, step: 10, unit: "" },
  { key: "topupCost", label: "Top-up cost (%)", min: 0, max: 2, step: 0.05, unit: "%" },
];

export default function FinancePanel({ ctx, inputs, set, locked, openTrace }: { ctx: Ctx; inputs: Inputs; set: (k: string, patch: Partial<Inputs[string]>) => void; locked: boolean; openTrace: (n: any) => void }) {
  const { r, p, be } = ctx;
  const maxTor = Math.max(...ctx.sens.map((s) => Math.max(Math.abs(s.lo), Math.abs(s.hi))), 1);
  return (
    <div className="grid">
      <div className="card">
        <h2>Interactive what-if <span className="mut" style={{ fontWeight: 400 }}>(recalculates instantly; edits become ASSUMPTION)</span></h2>
        {locked && <p className="alert">Locked. Unlock to change assumptions.</p>}
        {SLIDERS.map((s) => {
          const inp = inputs[s.key];
          return (
            <div className="slider" key={s.key}>
              <span>{s.label}</span>
              <input type="range" disabled={locked} min={s.min} max={s.max} step={s.step} value={inp.value ?? s.min}
                onChange={(e) => set(s.key, { value: Number(e.target.value), type: inp.type === "ASSUMPTION" || inp.type === "BENCHMARK" ? inp.type : "ASSUMPTION" })} />
              <b className="num">{inp.value}{s.unit}</b>
            </div>
          );
        })}
        <div className="grid g6" style={{ marginTop: 8 }}>
          {[["Buyers (36m)", num(r.h36.buyers)], ["Throughput", egp(r.h36.throughput)], ["Revenue", egp(r.h36.revenue)], ["Costs", egp(r.h36.variableCost + r.h36.marketing + r.h36.fixed)], ["Contribution", egp(r.h36.contribution)], ["Net (36m)", egp(r.h36.net)], ["LTV", r.unit.ltv === null ? "UNKNOWN" : egp(r.unit.ltv)], ["Payback", months(r.unit.paybackMonths)]].map(([l, v]) => (
            <div key={l} className="card"><div className="mut" style={{ fontSize: 11 }}>{l}</div><b className={String(v).startsWith("-") ? "bad" : ""}>{v}</b></div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Revenue and cost model</h2>
        <ul>
          <li>Buy price = market price + {pct(p.spread * 100)}; sell price = market price - {pct(p.spread * 100)}. Gold market price: <Badge t="UNKNOWN" /> (not needed for EGP-value model).</li>
          <li>Revenue = value transacted x (spread {pct(p.spread * 100)} + fee {pct(p.fee * 100)}).</li>
          <li>Variable cost = value x (gateway {pct(p.pgw * 100)} + top-up {pct(p.topup * 100)} + provider {pct(p.provider * 100)} + custody {pct(p.custody * 100)}).</li>
          <li><b className={r.unit.marginPct <= 0 ? "bad" : "good"}>Net margin per EGP transacted: {pct(r.unit.marginPct)}</b></li>
          <li>Team is in-house: incremental cash {egp(p.fixedMonthly)}/month run and {egp(p.mvpCost)} MVP. Opportunity cost (not in P&L): {egp(p.fullFixedMonthly)}/month and {egp(p.fullMvpCost)} (ESTIMATE).</li>
        </ul>
        <p className="mut">Click a number to trace: <button className="btn sec" onClick={() => openTrace("revenue")}>Revenue</button> <button className="btn sec" onClick={() => openTrace("throughput")}>Throughput</button> <button className="btn sec" onClick={() => openTrace("customers")}>Customers</button> <button className="btn sec" onClick={() => openTrace("contribution")}>Contribution</button> <button className="btn sec" onClick={() => openTrace("cac")}>CAC</button> <button className="btn sec" onClick={() => openTrace("payback")}>Payback</button> <button className="btn sec" onClick={() => openTrace("net")}>Net</button></p>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <h2>Base case: 12 / 24 / 36 months</h2>
        <HorizonTable r={r} />
        <p className="mut">Sell-side volume is excluded while buy/sell ratio is UNKNOWN. Frequency and holding period are UNKNOWN and not used.</p>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <h2>Scenarios (36 months)</h2>
        <table>
          <thead><tr><th></th>{(Object.keys(SCENARIO_DEFS) as ScenarioName[]).map((k) => <th key={k} className="num">{k}</th>)}</tr></thead>
          <tbody>
            <tr><td className="mut">Assumption changes</td>{(Object.keys(SCENARIO_DEFS) as ScenarioName[]).map((k) => <td key={k} className="mut" style={{ fontSize: 11 }}>{SCENARIO_DEFS[k].desc}</td>)}</tr>
            {([["Buyers", (x: Result) => num(x.h36.buyers)], ["Throughput", (x: Result) => egp(x.h36.throughput)], ["Revenue", (x: Result) => egp(x.h36.revenue)], ["Contribution", (x: Result) => egp(x.h36.contribution)], ["Marketing", (x: Result) => egp(x.h36.marketing)], ["Net (after MVP)", (x: Result) => egp(x.h36.net)], ["CAC", (x: Result) => egp(x.unit.cac)], ["LTV", (x: Result) => (x.unit.ltv === null ? "UNKNOWN" : egp(x.unit.ltv))], ["Payback", (x: Result) => months(x.unit.paybackMonths)]] as [string, (x: Result) => string][]).map(([l, f]) => (
              <tr key={l}><td>{l}</td>{(Object.keys(SCENARIO_DEFS) as ScenarioName[]).map((k) => <td key={k} className={"num " + (f(ctx.scen[k]).startsWith("-") ? "bad" : "")}>{f(ctx.scen[k])}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <h2>CFO stress test</h2>
        <table>
          <thead><tr><th>Shock</th><th className="num">36m net</th><th className="num">Delta vs base</th><th className="num">36m contribution</th><th>Viable?</th></tr></thead>
          <tbody>{ctx.stress.map((s) => (<tr key={s.name}><td>{s.name}</td><td className="num">{egp(s.result.h36.net)}</td><td className="num">{egp(s.deltaNet36)}</td><td className="num">{egp(s.result.h36.contribution)}</td><td className={s.viable ? "good" : "bad"}>{s.viable ? "Yes" : "No"}</td></tr>))}</tbody>
        </table>
        <p className="mut">Viable = positive 36-month net after CAC, run team and MVP. Volatility is modelled as a -20% volume shock (ESTIMATE); inventory price risk is not modelled.</p>
      </div>

      <div className="card">
        <h2>Sensitivity (36m net, -/+20% on each driver)</h2>
        {ctx.sens.map((s) => (
          <div key={s.label} style={{ display: "grid", gridTemplateColumns: "180px 1fr 190px", gap: 8, alignItems: "center", margin: "4px 0" }}>
            <span>{s.label}</span>
            <div className="bar"><i style={{ width: `${(s.swing / (2 * maxTor)) * 100}%`, background: "var(--acc)" }} /></div>
            <span className="mut num">{egp(s.lo)} / {egp(s.hi)}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Break-even</h2>
        <ul>
          <li>Break-even month: <b>{be.breakEvenMonth ?? "none within 36 months"}</b></li>
          <li>Minimum spread to cover variable cost: <b>{pct(be.minSpreadToCoverVariable + p.fee * 100)}</b> per side (today {pct((p.spread + p.fee) * 100)}).</li>
          <li>Spread for zero 36m net (benchmark CAC, ESTIMATED team/MVP): <b>{be.spreadForZeroNet36 ? pct(be.spreadForZeroNet36 * 100) : "no solution"}</b></li>
          <li>Adoption for zero 36m net: <b>{be.adoptionForZeroNet36 === null ? "not achievable (each extra buyer has LTV < CAC, or margin <= 0)" : pct(be.adoptionForZeroNet36 * 100)}</b></li>
          <li>Max CAC for LTV/CAC = 1: <b>{be.maxCacForLtvCac(1) === null ? "n/a" : egp(be.maxCacForLtvCac(1))}</b>; for 3x: <b>{be.maxCacForLtvCac(3) === null ? "n/a" : egp(be.maxCacForLtvCac(3))}</b> (entered {egp(p.cac)})</li>
          <li>Repeat rate for LTV/CAC = 1: <b>{be.repeatForLtvCac(1) === null ? "n/a" : pct(be.repeatForLtvCac(1)! * 100, 1)}</b>; for 3x: <b>{be.repeatForLtvCac(3) === null ? "n/a" : pct(be.repeatForLtvCac(3)! * 100, 1)}</b> (entered {pct(p.repeat * 100, 1)})</li>
        </ul>
      </div>
    </div>
  );
}
