"use client";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_INPUTS } from "../lib/business-case/assumptions";
import { runDebate } from "../lib/business-case/debate";
import { decide } from "../lib/business-case/decision";
import { experiments } from "../lib/business-case/experiments";
import { trace, type TraceName } from "../lib/business-case/financial-model";
import { egp, months, num } from "../lib/agents/context";
import { getRisks } from "../lib/agents/risk";
import type { Inputs } from "../lib/types";
import DebatePanel from "./DebatePanel";
import DecisionPanel from "./DecisionPanel";
import FinancePanel from "./FinancePanel";
import InputsPanel from "./InputsPanel";
import ReportPanel from "./ReportPanel";
import ResearchPanel from "./ResearchPanel";
import { DemoTag, PosBadge, Tile, TraceModal } from "./ui";

const KEY = "aman-gold-lab-inputs-v1";
const TABS = ["Inputs", "Financial Model", "Agents & Debate", "Consensus & Validation", "Research & Sources", "Management Business Case"] as const;
const STEPS = ["Lock current assumptions", "Run CEO", "Run CFO", "Run CMO", "Run R&D", "Run Risk", "Run cross-examination", "Run financial stress test", "Run revised positions", "Generate consensus", "Generate validation plan", "Generate executive summary"];

export default function Lab() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Inputs");
  const [locked, setLocked] = useState<Inputs | null>(null);
  const [step, setStep] = useState(-1);
  const [tr, setTr] = useState<TraceName | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) { const saved = JSON.parse(s) as Inputs; setInputs({ ...DEFAULT_INPUTS, ...saved }); }
    } catch { /* storage unavailable: defaults are used */ }
  }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(inputs)); } catch { /* ignore */ } }, [inputs]);

  const set = (k: string, patch: Partial<Inputs[string]>) => setInputs((prev) => ({ ...prev, [k]: { ...prev[k], ...patch } }));
  const live = locked ?? inputs;
  const d = useMemo(() => runDebate(live), [live]);
  const { ctx } = d;
  const dec = decide(ctx);
  const running = step >= 0 && step < STEPS.length;

  const generate = () => {
    setTab("Management Business Case");
    setStep(0);
    const snap = JSON.parse(JSON.stringify(inputs)) as Inputs;
    STEPS.forEach((_, i) => setTimeout(() => {
      setStep(i);
      if (i === 0) setLocked(snap);
      if (i === STEPS.length - 1) setTimeout(() => setStep(STEPS.length), 350);
    }, i * 350));
  };

  const T = (n: TraceName) => trace(n, live, ctx.r);
  const rev = T("revenue"), thr = T("throughput"), cus = T("customers"), con = T("contribution"), cac = T("cac"), pay = T("payback");
  const nCrit = getRisks(ctx).filter((r) => r.critical).length;

  return (
    <div className="wrap">
      <div className="top">
        <div>
          <h1>AMAN GOLD - Business Case Lab <DemoTag /></h1>
          <div className="mut">Internal decision-support tool. Not customer-facing. Agents are deterministic demos; research is sourced (Research tab).</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <PosBadge p={dec.position} />
          {locked && <button className="btn sec" onClick={() => { setLocked(null); setStep(-1); }}>Unlock inputs</button>}
          {!locked && <button className="btn sec" onClick={() => { if (confirm("Reset all inputs to the session defaults?")) setInputs(DEFAULT_INPUTS); }}>Reset inputs</button>}
          <button className="btn gold" onClick={generate} disabled={running}>Generate Management Business Case</button>
        </div>
      </div>

      <p className="mut" style={{ fontSize: 12, margin: "0 0 8px" }}>Legend: S1, S2... are source IDs listed in the Research &amp; Sources tab (S1 = FRA statement, 6 May 2025; FRA = Egypt's Financial Regulatory Authority). Click any dashboard number to trace it.</p>
      <div className="grid g6">
        <Tile label="Strategic fit" value="Moderate" type="Qualitative judgement" />
        <Tile label="Customer opportunity" value="Weak evidence" type="Funnel = ASSUMPTION" />
        <Tile label="Market opportunity" value="Moderate evidence" type="EXTERNAL FACT (S1, S5)" />
        <Tile label="Revenue (36m)" value={egp(ctx.r.h36.revenue)} type={rev.type} onClick={() => setTr("revenue")} />
        <Tile label="Gold throughput (36m)" value={egp(ctx.r.h36.throughput)} type={thr.type} onClick={() => setTr("throughput")} />
        <Tile label="Customers (36m buyers)" value={num(ctx.r.h36.buyers)} type={cus.type} onClick={() => setTr("customers")} />
        <Tile label="CAC" value={egp(ctx.r.unit.cac)} type={cac.type} onClick={() => setTr("cac")} />
        <Tile label="Contribution (36m)" value={egp(ctx.r.h36.contribution)} type={con.type} onClick={() => setTr("contribution")} />
        <Tile label="CAC payback" value={months(ctx.r.unit.paybackMonths).replace(" (unit margin <= 0)", "")} type={pay.type} onClick={() => setTr("payback")} />
        <Tile label="Critical risks" value={String(nCrit)} type="Risk register" />
        <Tile label="Critical unknowns" value={String(ctx.unknowns.length)} type="UNKNOWN" />
        <Tile label="Validation experiments" value={String(experiments(ctx).length)} type="Validation plan" />
      </div>
      {ctx.r.unit.marginPct > 0 && ctx.r.unit.ltvCac !== null && ctx.r.unit.ltvCac < 1 && (
        <p className="alert" style={{ marginTop: 10 }}><b>Acquisition economics warning:</b> unit margin is positive ({ctx.r.unit.marginPct.toFixed(2)}%), but lifetime contribution per buyer ({egp(ctx.r.unit.ltv)}) is below CAC ({egp(ctx.r.unit.cac)}): LTV/CAC {ctx.r.unit.ltvCac.toFixed(2)}.</p>
      )}
      {ctx.r.unit.marginPct <= 0 && (
        <p className="alert" style={{ marginTop: 10 }}><b>Unit economics warning:</b> take rate is below variable cost, so each EGP transacted loses {Math.abs(ctx.r.unit.marginPct).toFixed(2)}%. See Financial Model and Consensus tabs.</p>
      )}

      <div className="tabs">{TABS.map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>

      {tab === "Inputs" && <InputsPanel inputs={live} set={set} locked={!!locked} />}
      {tab === "Financial Model" && <FinancePanel ctx={ctx} inputs={live} set={set} locked={!!locked} openTrace={setTr} />}
      {tab === "Agents & Debate" && <DebatePanel d={d} />}
      {tab === "Consensus & Validation" && <DecisionPanel d={d} />}
      {tab === "Research & Sources" && <ResearchPanel />}
      {tab === "Management Business Case" && (
        <div>
          {step >= 0 && step < STEPS.length && (
            <div className="card"><h2>Generating (DEMO AI AGENTS)</h2><ul className="steps">{STEPS.map((s, i) => <li key={s} className={i <= step ? "" : "mut"}>{i < step ? "[done]" : i === step ? "[running]" : "[ ]"} {s}</li>)}</ul></div>
          )}
          {locked && step >= STEPS.length && <p className="note">Inputs are locked for this business case. Use "Unlock inputs" to change them.</p>}
          {locked && step >= STEPS.length ? <ReportPanel d={d} /> : step < 0 && <div className="card"><p>Click <b>Generate Management Business Case</b> to lock the assumptions and run the full sequence.</p></div>}
          {locked && step >= STEPS.length && <p className="noprint"><button className="btn sec" onClick={() => window.print()}>Print / save as PDF</button></p>}
        </div>
      )}

      {tr && <TraceModal t={T(tr)} title={`Trace: ${tr}`} onClose={() => setTr(null)} />}
    </div>
  );
}
