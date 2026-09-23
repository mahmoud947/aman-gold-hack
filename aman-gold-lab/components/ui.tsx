"use client";
import type { DataType, Position, Traced } from "../lib/types";

export const typeClass = (t: DataType) => "b-" + t.split(" ")[0];
export const Badge = ({ t }: { t: DataType }) => <span className={`badge ${typeClass(t)}`}>{t}</span>;

const POS: Record<Position, string> = { PROCEED: "pos-PROCEED", "PROCEED WITH CONDITIONS": "pos-PWC", "VALIDATE FURTHER": "pos-VF", "DO NOT PROCEED": "pos-DNP" };
export const PosBadge = ({ p }: { p: Position }) => <span className={`badge b-pos ${POS[p]}`}>{p}</span>;

export const DemoTag = () => <span className="demo" title="Deterministic rule-based agent. No LLM or live research is running inside the agent.">DEMO AI AGENT</span>;

export function Tile({ label, value, type, note, onClick }: { label: string; value: string; type?: DataType | string; note?: string; onClick?: () => void }) {
  return (
    <div className="card tile" onClick={onClick} title={onClick ? "Click to trace this number" : undefined}>
      <div className="l">{label}</div>
      <div className="v">{value}</div>
      {type && (typeof type === "string" && !type.match(/^(ACTUAL|EXTERNAL FACT|BENCHMARK|ASSUMPTION|ESTIMATE|UNKNOWN)$/) ? <span className="badge b-UNKNOWN">{type}</span> : <Badge t={type as DataType} />)}
      {note && <div className="mut" style={{ fontSize: 11, marginTop: 2 }}>{note}</div>}
    </div>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
}

export function TraceModal({ t, title, onClose }: { t: Traced; title: string; onClose: () => void }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <div className="top"><h2>{title}</h2><button className="btn sec" onClick={onClose}>Close</button></div>
        <p><b>{t.value === null ? "Never" : Math.round(t.value * 100) / 100} </b>{t.unit} <Badge t={t.type} /></p>
        <p className="mut">Formula: {t.formula}</p>
        <table>
          <thead><tr><th>Input</th><th>Value</th><th>Type</th><th>Source</th></tr></thead>
          <tbody>{t.components.map((c, i) => (<tr key={i}><td>{c.label}</td><td>{c.value}</td><td><Badge t={c.type} /></td><td>{c.source}</td></tr>))}</tbody>
        </table>
        <p className="note">The result is labelled with the weakest data type of its components. An assumption-based number is never presented as a fact.</p>
      </div>
    </div>
  );
}
