"use client";
import { COMPETITORS, GAPS } from "../lib/research/competitors";
import { MARKET_FACTS, OPPORTUNITIES, THREATS, TRENDS } from "../lib/research/market";
import { SOURCES } from "../lib/research/sources";
import { Badge, Bullets } from "./ui";

export default function ResearchPanel() {
  return (
    <div className="grid">
      <div className="note">Research was performed by live web search on 2026-09-20. Items marked <b>Not verified</b> were not found; nothing was estimated. Numbers in EGP for market size are not computed because the gold price input is UNKNOWN. AI text is never listed as a source.</div>
      <div className="card">
        <h2>Market facts</h2>
        <table><thead><tr><th>Finding</th><th>Type</th><th>Source</th><th>Confidence</th></tr></thead>
          <tbody>{MARKET_FACTS.map((f, i) => (<tr key={i}><td>{f.text}</td><td><Badge t={f.type} /></td><td>{f.source}</td><td>{f.confidence}</td></tr>))}</tbody></table>
        <div className="grid g2"><div><h3>Trends</h3><Bullets items={TRENDS} /></div><div><h3>Opportunities</h3><Bullets items={OPPORTUNITIES} /><h3>Threats</h3><Bullets items={THREATS} /></div></div>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <h2>Competitors</h2>
        <table>
          <thead><tr><th>Company</th><th>Product</th><th>Min investment</th><th>Fees</th><th>Spread</th><th>Custody</th><th>Redemption</th><th>Distribution</th><th>Trust</th><th>Model</th><th>Src</th></tr></thead>
          <tbody>{COMPETITORS.map((c) => (<tr key={c.company}><td><b>{c.company}</b></td><td>{c.product}</td><td>{c.minInvestment}</td><td>{c.fees}</td><td>{c.spread}</td><td>{c.custody}</td><td>{c.redemption}</td><td>{c.distribution}</td><td>{c.trust}</td><td>{c.model}</td><td>{c.sources.join(", ")}</td></tr>))}</tbody>
        </table>
        <div className="grid g2">
          <div><h3>What competitors do well</h3><Bullets items={GAPS.doWell} /><h3>Customer complaints</h3><Bullets items={GAPS.complaints} /></div>
          <div><h3>Becoming standard</h3><Bullets items={GAPS.standard} /><h3>Possibly underserved</h3><Bullets items={GAPS.underserved} /><h3>Possible differentiation</h3><Bullets items={GAPS.differentiation} /><p className="mut">{GAPS.caveat}</p></div>
        </div>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <h2>Sources</h2>
        <table><thead><tr><th>ID</th><th>Source</th><th>Date</th><th>Claim supported</th><th>Type</th><th>Confidence</th></tr></thead>
          <tbody>{SOURCES.map((s) => (<tr key={s.id}><td>{s.id}</td><td><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a>{s.note && <div className="mut">{s.note}</div>}</td><td>{s.date}</td><td>{s.claim}</td><td>{s.type}</td><td>{s.confidence}</td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
