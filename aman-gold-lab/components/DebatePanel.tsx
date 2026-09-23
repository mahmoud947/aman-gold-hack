"use client";
import { useState } from "react";
import { AGENT_IDS, SHORT, type DebateOutput } from "../lib/business-case/debate";
import { getRisks } from "../lib/agents/risk";
import { CHANNELS, funnelRows } from "../lib/agents/cmo";
import { num, pct } from "../lib/agents/context";
import { Badge, Bullets, DemoTag, PosBadge } from "./ui";

const stat = (s: string) => (s === "Resolved" ? "good" : s === "Open" ? "bad" : "");

function Exchanges({ rows }: { rows: DebateOutput["r3"] }) {
  return (
    <table>
      <thead><tr><th>Topic</th><th>Challenge</th><th>Response</th><th>Status</th></tr></thead>
      <tbody>{rows.map((x, i) => (<tr key={i}><td><b>{x.topic}</b></td><td><b>{x.by}:</b> {x.challenge}</td><td>{x.response}</td><td className={stat(x.status)}>{x.status}</td></tr>))}</tbody>
    </table>
  );
}

export default function DebatePanel({ d }: { d: DebateOutput }) {
  const [sel, setSel] = useState<string>("cfo");
  const a = d.reports[sel as keyof typeof d.reports];
  return (
    <div className="grid">
      <div className="note">All five agents below are <b>DEMO AI AGENTS</b>: deterministic rules over the entered numbers and the sourced research in the Research tab. No LLM is connected. Round 1 functions receive only the shared inputs, never another agent's output.</div>

      <div className="card">
        <h2>Round 1: Initial positions (independent)</h2>
        <div className="grid g2">
          {AGENT_IDS.map((id) => (
            <div key={id} className="card" style={{ cursor: "pointer" }} onClick={() => setSel(id)}>
              <b>{d.reports[id].name}</b> <DemoTag /><br />
              <PosBadge p={d.reports[id].position} /> <span className="mut">confidence {d.reports[id].confidence}</span>
              <p>{d.reports[id].thesis}</p>
              <p className="mut">{d.reports[id].positionReason}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Agent detail</h2>
        <div className="tabs" style={{ margin: "0 0 8px" }}>{AGENT_IDS.map((id) => <button key={id} className={sel === id ? "on" : ""} onClick={() => setSel(id)}>{SHORT[id]}</button>)}</div>
        <p><b>{a.name}</b> <DemoTag /> <PosBadge p={a.position} /></p>
        {a.sections.map((s) => (<div key={s.title}><h3>{s.title}</h3><Bullets items={s.items} /></div>))}
        {a.id === "cmo" && (
          <>
            <h3>Funnel</h3>
            <table><thead><tr><th>Stage</th><th className="num">Users</th><th className="num">Conversion</th><th>Type</th></tr></thead>
              <tbody>{funnelRows(d.ctx).map((f) => (<tr key={f.stage}><td>{f.stage}</td><td className="num">{num(f.n)}</td><td className="num">{f.conv === null ? "-" : pct(f.conv, 1)}</td><td><Badge t={f.type} /></td></tr>))}</tbody></table>
            <h3>Channels</h3>
            <table><thead><tr><th>Channel</th><th>Reach</th><th>Relevance</th><th>Scale</th><th>CAC</th><th>Note</th></tr></thead>
              <tbody>{CHANNELS.map((x) => (<tr key={x.ch}><td>{x.ch}</td><td>{x.reach}</td><td>{x.relevance}</td><td>{x.scale}</td><td>{x.cac}</td><td className="mut">{x.note}</td></tr>))}</tbody></table>
          </>
        )}
        {a.id === "risk" && (
          <>
            <h3>Risk register</h3>
            <div style={{ overflowX: "auto" }}><table><thead><tr><th>ID</th><th>Risk</th><th>Category</th><th>Prob.</th><th>Impact</th><th>Severity</th><th>Mitigation</th><th>Owner</th><th>Status</th></tr></thead>
              <tbody>{getRisks(d.ctx).map((r) => (<tr key={r.id}><td>{r.id}</td><td>{r.risk}</td><td>{r.category}</td><td>{r.prob}</td><td>{r.impact}</td><td className={r.severity === "Critical" ? "bad" : ""}><b>{r.severity}</b></td><td>{r.mitigation}</td><td>{r.owner}</td><td>{r.status}</td></tr>))}</tbody></table></div>
          </>
        )}
        <p className="mut">Assumptions: {a.assumptions.join(" | ")}</p>
        <p className="mut">Sources used: {a.sourcesUsed.join(", ")}</p>
        <details><summary className="mut">Agent configuration</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(a.config, null, 2)}</pre></details>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <h2>Round 2: Cross-examination</h2>
        <table>
          <thead><tr><th>From to To</th><th>Strongest argument</th><th>Weakest assumption</th><th>Missing evidence</th><th>Contradiction</th><th>Question</th></tr></thead>
          <tbody>{d.r2.map((c, i) => (<tr key={i}><td><b>{c.from}</b> to <b>{c.to}</b></td><td>{c.strongest}</td><td>{c.weakest}</td><td>{c.missing}</td><td>{c.contradiction}</td><td>{c.question}</td></tr>))}</tbody>
        </table>
      </div>

      <div className="card" style={{ overflowX: "auto" }}><h2>Round 3: Financial challenge (CFO publishes model)</h2><Exchanges rows={d.r3} /></div>
      <div className="card" style={{ overflowX: "auto" }}><h2>Round 4: Market challenge (R&D publishes findings)</h2><Exchanges rows={d.r4} /></div>
      <div className="card" style={{ overflowX: "auto" }}><h2>Round 5: Customer challenge (CMO publishes acquisition model)</h2><Exchanges rows={d.r5} /></div>

      <div className="card" style={{ overflowX: "auto" }}>
        <h2>Round 6: Risk challenge</h2>
        <table>
          <thead><tr><th>Risk</th><th>Mitigable?</th><th>Cost</th><th>Timeline</th><th>Owner</th><th>MVP can proceed?</th><th>Agent responses</th></tr></thead>
          <tbody>{d.r6.map((x) => (<tr key={x.risk.id}><td><b>{x.risk.id}</b> {x.risk.risk}</td><td>{x.canMitigate}</td><td>{x.cost}</td><td>{x.timeline}</td><td>{x.owner}</td><td className={x.mvpCanProceed.startsWith("No") ? "bad" : ""}>{x.mvpCanProceed}</td><td><Bullets items={x.responses} /></td></tr>))}</tbody>
        </table>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <h2>Round 7: Revised positions</h2>
        <table>
          <thead><tr><th>Agent</th><th>Initial</th><th>Evidence / debate</th><th>Revised</th><th>Reason</th></tr></thead>
          <tbody>{d.r7.map((x) => (<tr key={x.id}><td><b>{x.name}</b></td><td><PosBadge p={x.initial} /></td><td>{x.evidence}</td><td><PosBadge p={x.revised} /> {x.changed && <span className="mut">(changed)</span>}</td><td>{x.reason}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
