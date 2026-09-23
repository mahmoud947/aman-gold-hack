"use client";
import type { Confidence, DataType, Inputs } from "../lib/types";
import { Badge } from "./ui";

const TYPES: DataType[] = ["ACTUAL", "EXTERNAL FACT", "BENCHMARK", "ASSUMPTION", "ESTIMATE", "UNKNOWN"];
const CONF: Confidence[] = ["High", "Medium", "Low", "None"];

export default function InputsPanel({ inputs, set, locked }: { inputs: Inputs; set: (k: string, patch: Partial<Inputs[string]>) => void; locked: boolean }) {
  const groups = Array.from(new Set(Object.values(inputs).map((i) => i.group)));
  return (
    <div>
      <p className="note">Every input carries a value, unit, source, type and confidence. Blank value = UNKNOWN: the model excludes it (never invents it) and the agents flag it. Editing a value never upgrades its type; you choose the type explicitly.</p>
      {locked && <p className="alert">Inputs are locked for the Management Business Case. Unlock in the header to edit.</p>}
      {groups.map((g) => (
        <div className="card" key={g} style={{ marginTop: 10, overflowX: "auto" }}>
          <h2>{g}</h2>
          <table>
            <thead><tr><th>Input</th><th>Value</th><th>Unit</th><th>Type</th><th>Confidence</th><th>Source</th></tr></thead>
            <tbody>
              {Object.values(inputs).filter((i) => i.group === g).map((i) => (
                <tr key={i.key}>
                  <td>{i.label}</td>
                  <td>
                    <input className="n" type="number" disabled={locked} value={i.value ?? ""} placeholder="UNKNOWN"
                      onChange={(e) => {
                        const v = e.target.value === "" ? null : Number(e.target.value);
                        set(i.key, { value: v, type: v === null ? "UNKNOWN" : i.type === "UNKNOWN" ? "ASSUMPTION" : i.type });
                      }} />
                  </td>
                  <td className="mut">{i.unit}</td>
                  <td><select disabled={locked} value={i.type} onChange={(e) => set(i.key, { type: e.target.value as DataType })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select> <Badge t={i.type} /></td>
                  <td><select disabled={locked} value={i.confidence} onChange={(e) => set(i.key, { confidence: e.target.value as Confidence })}>{CONF.map((t) => <option key={t}>{t}</option>)}</select></td>
                  <td><input disabled={locked} style={{ width: 260 }} value={i.source} onChange={(e) => set(i.key, { source: e.target.value })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
