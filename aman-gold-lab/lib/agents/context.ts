import type { AgentConfig, AgentReport, Inputs } from "../types";
import { breakEven, paramsFromInputs, run, scenarios, sensitivity, stress, type Params, type Result } from "../business-case/financial-model";

export interface Ctx {
  inp: Inputs; p: Params; r: Result;
  scen: ReturnType<typeof scenarios>;
  stress: ReturnType<typeof stress>;
  sens: ReturnType<typeof sensitivity>;
  be: ReturnType<typeof breakEven>;
  unknowns: string[];
  assumptionKeys: string[];
}

export interface AgentOut extends AgentReport {
  strength: string; weak: string; missing: string;
  config: AgentConfig;
}

export function buildCtx(inp: Inputs): Ctx {
  const p = paramsFromInputs(inp);
  const vals = Object.values(inp);
  return {
    inp, p, r: run(p), scen: scenarios(p), stress: stress(p), sens: sensitivity(p), be: breakEven(p),
    unknowns: vals.filter((i) => i.value === null || i.type === "UNKNOWN").map((i) => i.label),
    assumptionKeys: vals.filter((i) => i.type === "ASSUMPTION" || i.type === "ESTIMATE").map((i) => i.key),
  };
}

export const egp = (n: number | null | undefined) => {
  if (n === null || n === undefined || !isFinite(n)) return "n/a";
  const a = Math.abs(n), s = n < 0 ? "-" : "";
  if (a >= 1e9) return `${s}EGP ${(a / 1e9).toFixed(2)}bn`;
  if (a >= 1e6) return `${s}EGP ${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}EGP ${(a / 1e3).toFixed(1)}K`;
  return `${s}EGP ${a.toFixed(0)}`;
};
export const num = (n: number) => Math.round(n).toLocaleString("en-US");
export const pct = (n: number, d = 2) => `${n.toFixed(d)}%`;
export const months = (n: number | null) => (n === null ? "Never (unit margin <= 0)" : `${n.toFixed(1)} months`);
