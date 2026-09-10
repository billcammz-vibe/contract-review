import { z } from "zod";

/**
 * The eleven clause categories every contract is analysed against.
 * The extractor must return exactly one entry per value here.
 */
export const CLAUSE_TYPES = [
  "parties",
  "effective_date",
  "term",
  "renewal",
  "termination",
  "liability_cap",
  "indemnification",
  "governing_law",
  "confidentiality",
  "payment",
  "assignment",
] as const;

export const clauseTypeSchema = z.enum(CLAUSE_TYPES);
export type ClauseType = z.infer<typeof clauseTypeSchema>;

export const CLAUSE_LABELS: Record<ClauseType, string> = {
  parties: "Parties",
  effective_date: "Effective date",
  term: "Term length",
  renewal: "Renewal / auto-renew",
  termination: "Termination rights",
  liability_cap: "Limitation of liability",
  indemnification: "Indemnification",
  governing_law: "Governing law",
  confidentiality: "Confidentiality",
  payment: "Payment terms",
  assignment: "Assignment",
};

export const severitySchema = z.enum(["high", "medium", "low"]);
export type Severity = z.infer<typeof severitySchema>;

export const foundStateSchema = z.enum(["found", "partial", "not_found"]);
export type FoundState = z.infer<typeof foundStateSchema>;

export const issueTypeSchema = z.enum([
  "missing",
  "one_sided",
  "non_standard",
  "ambiguous",
  "onerous",
]);
export type IssueType = z.infer<typeof issueTypeSchema>;

export const playbookStatusSchema = z.enum(["meets", "deviates", "missing"]);
export type PlaybookStatus = z.infer<typeof playbookStatusSchema>;
