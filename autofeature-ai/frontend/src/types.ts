export interface Column {
  name: string;
  type: string;
  position: number;
  nullable: boolean;
}

export interface TableInfo {
  name: string;
  columns: Column[];
}

export interface LLMFeature {
  name: string;
  sql: string;
  explanation: string;
  importance: number;
}

export interface FTFeature {
  name: string;
  type: string;
  importance: number;
}

export interface RankedFeature {
  name: string;
  importance: number;
  source: "LLM" | "Featuretools";
  description: string;
}

export interface GenerateResult {
  llm_features: LLMFeature[];
  featuretools_features: FTFeature[];
  ranked_features: RankedFeature[];
  summary: string;
}

export interface SummaryReport {
  report: string;
}
