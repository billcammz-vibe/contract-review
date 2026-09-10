import type { ClauseType, IssueType, PlaybookStatus, Severity } from "./enums";
import type { ClauseValue } from "./extraction";
import type { LocatedEvidence } from "./evidence";

/**
 * The fully assembled analysis returned by POST /api/analyze and rendered by
 * the dashboard. Model output (extraction.ts / playbook.ts) is post-processed:
 * every `evidence` entry is re-typed as {@link LocatedEvidence} with a resolved
 * source location, and `meta` + `scorecard` are computed deterministically.
 */
export interface ContractAnalysis {
  schemaVersion: "1.0";
  meta: AnalysisMeta;
  documentSummary: string;
  clauses: AnalysedClause[];
  risks: AnalysedRisk[];
  playbook: AnalysedPlaybookItem[];
  scorecard: Scorecard;
}

export interface AnalysisMeta {
  fileName: string;
  fileType: "pdf" | "docx";
  pageCount: number | null;
  wordCount: number;
  model: string;
  analyzedAt: string;
  /** Milliseconds spent in ingestion + both model calls. */
  durationMs: number;
}

export interface AnalysedClause {
  clauseType: ClauseType;
  status: "found" | "partial" | "not_found";
  plainSummary: string;
  value: ClauseValue | null;
  evidence: LocatedEvidence[];
}

export interface AnalysedRisk {
  id: string;
  clauseType: ClauseType | "other";
  title: string;
  severity: Severity;
  issueType: IssueType;
  explanation: string;
  evidence: LocatedEvidence | null;
  suggestedFix: string | null;
}

export interface AnalysedPlaybookItem {
  playbookItemId: string;
  clauseType: ClauseType;
  title: string;
  status: PlaybookStatus;
  preferredPosition: string;
  contractPosition: string | null;
  explanation: string;
  severity: Severity;
  evidence: LocatedEvidence | null;
}

export interface Scorecard {
  risk: { high: number; medium: number; low: number; total: number };
  playbook: {
    meets: number;
    deviates: number;
    missing: number;
    total: number;
    /** 0-100. meets = full credit, deviates = half credit, missing = none. */
    score: number;
  };
}

/** Error envelope returned by the API on failure. */
export interface AnalysisErrorBody {
  error: { code: string; message: string };
}
