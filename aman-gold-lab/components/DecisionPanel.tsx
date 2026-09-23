"use client";
import { consensus, decisionMatrix, reopenPath } from "../lib/business-case/decision";
import { experiments } from "../lib/business-case/experiments";
import type { DebateOutput } from "../lib/business-case/debate";
import { Bullets, PosBadge } from "./ui";

export default function DecisionPanel({ d }: { d: DebateOutput }) {
  const c = consensus(d);
  const m = decisionMatrix(d.ctx);
  const ex = experiments(d.ctx);
  const evCls: Record<string, string> = { "Strong Evidence": "good", "Moderate Evidence": "", "Weak Evidence": "bad", Unknown: "mut" };
  return (
    <div className="grid">
      <div className="card">
        <h2>Decision <PosBadge p={c.decision.position} /></h2>
        <p className="mut">Gate: {c.decision.gate}. This is an evidence gate, not an average of agent positions.</p>
        <Bullets items={c.decision.reasoning} />
        <h3>{c.decision.position === "DO NOT PROCEED" || c.decision.position === "VALIDATE FURTHER" ? "Path to re-open the case" : "Conditions to proceed"}</h3>
        <Bullets items={reopenPath(d.ctx)} />
      </div>
      <div className="grid g2">
        <div className="card"><h2>Agreements</h2><Bullets items={c.agreements} /></div>
        <div className="card"><h2>Disagreements</h2><Bullets items={c.disagreements} /></div>
        <div className="card"><h2>Critical uncertainties</h2><Bullets items={c.uncertainties} /></div>
        <div className="card"><h2>Validation required</h2><Bullets items={c.validationRequired} /></div>
        <div className="card"><h2>Value drivers</h2><Bullets items={c.valueDrivers} /></div>
        <div className="card"><h2>Failure drivers</h2><Bullets items={c.failureDrivers} /></div>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <h2>Decision matrix (evidence classification, no scores)</h2>
        <table><thead><tr><th>Dimension</th><th>Evidence</th><th>Basis</th></tr></thead>
          <tbody>{m.map((r) => (<tr key={r.dimension}><td><b>{r.dimension}</b></td><td className={evCls[r.evidence]}><b>{r.evidence}</b></td><td>{r.basis}</td></tr>))}</tbody></table>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <h2>MVP validation plan</h2>
        <table>
          <thead><tr><th>#</th><th>Experiment</th><th>Hypothesis</th><th>Metric</th><th>Target</th><th>Sample</th><th>Duration</th><th>Est. cost</th><th>Success</th><th>Failure</th></tr></thead>
          <tbody>{ex.map((e) => (<tr key={e.n}><td>{e.n}</td><td><b>{e.name}</b>{e.gate && <div className="mut">Gate: {e.gate}</div>}</td><td>{e.hypothesis}</td><td>{e.metric}</td><td>{e.target}</td><td>{e.sample}</td><td>{e.duration}</td><td>{e.cost}</td><td className="good">{e.success}</td><td className="bad">{e.failure}</td></tr>))}</tbody>
        </table>
        <p className="mut">Sample sizes use z=1.96, +/-3pp margin (ESTIMATE). Costs are FTE-month estimates using the loaded FTE cost input (ESTIMATE); replace with HR data.</p>
      </div>
    </div>
  );
}
