import type { AnalysedPlaybookItem, AnalysedRisk, Scorecard } from "./schema";

/**
 * Deterministically derive the dashboard scorecard from the (already validated)
 * risk flags and playbook comparisons. Never produced by the model.
 */
export function buildScorecard(
  risks: AnalysedRisk[],
  playbook: AnalysedPlaybookItem[],
): Scorecard {
  const risk = { high: 0, medium: 0, low: 0, total: risks.length };
  for (const r of risks) risk[r.severity] += 1;

  const pb = {
    meets: 0,
    deviates: 0,
    missing: 0,
    total: playbook.length,
    score: 0,
  };
  for (const p of playbook) pb[p.status] += 1;
  pb.score =
    pb.total === 0
      ? 100
      : Math.round((100 * (pb.meets + pb.deviates * 0.5)) / pb.total);

  return { risk, playbook: pb };
}
