import { MODEL } from "./anthropic";
import { runExtraction } from "./extraction";
import { ingest, locateEvidence, type RawFile } from "./ingest";
import { DEFAULT_PLAYBOOK, comparePlaybook } from "./playbook";
import { buildScorecard } from "./scorecard";
import type { ContractAnalysis } from "./schema";

export { DEFAULT_PLAYBOOK } from "./playbook";
export type { RawFile } from "./ingest";

/**
 * The full pipeline: ingest -> extract + risk (model call #1) -> playbook
 * comparison (model call #2) -> resolve every evidence quote to a source
 * location -> derive the scorecard.
 */
export async function analyzeContract(
  file: RawFile,
): Promise<ContractAnalysis> {
  const started = Date.now();

  const doc = await ingest(file);
  const extraction = await runExtraction(doc);
  const comparison = await comparePlaybook(doc, extraction, DEFAULT_PLAYBOOK);

  const clauses = extraction.clauses.map((c) => ({
    ...c,
    evidence: c.evidence.map((e) => locateEvidence(e, doc)),
  }));
  const risks = extraction.risks.map((r) => ({
    ...r,
    evidence: r.evidence ? locateEvidence(r.evidence, doc) : null,
  }));
  const playbook = comparison.comparisons.map((p) => ({
    ...p,
    evidence: p.evidence ? locateEvidence(p.evidence, doc) : null,
  }));

  return {
    schemaVersion: "1.0",
    meta: {
      fileName: doc.meta.fileName,
      fileType: doc.meta.fileType,
      pageCount: doc.meta.pageCount,
      wordCount: doc.meta.wordCount,
      model: MODEL,
      analyzedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
    },
    documentSummary: extraction.documentSummary,
    clauses,
    risks,
    playbook,
    scorecard: buildScorecard(risks, playbook),
  };
}
