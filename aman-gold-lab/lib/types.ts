export type DataType = "ACTUAL" | "EXTERNAL FACT" | "BENCHMARK" | "ASSUMPTION" | "ESTIMATE" | "UNKNOWN";
export type Confidence = "High" | "Medium" | "Low" | "None";

export interface Input {
  key: string;
  label: string;
  group: string;
  value: number | null; // null => UNKNOWN
  unit: string;
  source: string;
  type: DataType;
  confidence: Confidence;
}
export type Inputs = Record<string, Input>;

export type Position = "PROCEED" | "PROCEED WITH CONDITIONS" | "VALIDATE FURTHER" | "DO NOT PROCEED";

export interface Traced {
  value: number | null;
  unit: string;
  type: DataType; // weakest type among components (never upgraded)
  formula: string;
  components: { label: string; value: string; type: DataType; source: string }[];
}

export interface Assumptions {
  v: Record<string, number | null>;
  t: Record<string, DataType>;
}

export type Evidence = "Strong Evidence" | "Moderate Evidence" | "Weak Evidence" | "Unknown";

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  objective: string;
  systemPrompt: string;
  inputs: string[];
  outputs: string[];
}

export interface Challenge {
  from: string;
  to: string;
  strongest: string;
  weakest: string;
  missing: string;
  contradiction: string;
  question: string;
}

export interface AgentReport {
  id: string;
  name: string;
  demo: true;
  thesis: string;
  sections: { title: string; items: string[] }[];
  confidence: Confidence;
  assumptions: string[];
  sourcesUsed: string[];
  position: Position;
  positionReason: string;
}
