import { CLAUSE_LABELS } from "./schema/enums";
import type {
  AnalysedPlaybookItem,
  ContractAnalysis,
  LocatedEvidence,
} from "./schema";

/** Pretty-printed JSON export. */
export function toJsonString(analysis: ContractAnalysis): string {
  return JSON.stringify(analysis, null, 2);
}

function locationLabel(ev: LocatedEvidence | null): string {
  if (!ev) return "";
  const { page, paragraph } = ev.location;
  if (page != null) return ` _(p. ${page})_`;
  if (paragraph != null) return ` _(¶ ${paragraph + 1})_`;
  return ev.matched ? "" : " _(quote not located)_";
}

const STATUS_MARK: Record<AnalysedPlaybookItem["status"], string> = {
  meets: "✅ MEETS",
  deviates: "⚠️ DEVIATES",
  missing: "❌ MISSING",
};

/** Human-readable Markdown summary export. */
export function toMarkdownSummary(analysis: ContractAnalysis): string {
  const { meta, scorecard, documentSummary, clauses, risks, playbook } = analysis;
  const lines: string[] = [];

  lines.push(`# Contract Review — ${meta.fileName}`);
  lines.push("");
  lines.push(
    `_Analysed ${new Date(meta.analyzedAt).toUTCString()} with ${meta.model}._`,
  );
  lines.push("");
  lines.push(documentSummary);
  lines.push("");

  lines.push("## Scorecard");
  lines.push("");
  lines.push(
    `- Risks: ${scorecard.risk.total} total — ${scorecard.risk.high} high, ${scorecard.risk.medium} medium, ${scorecard.risk.low} low`,
  );
  lines.push(
    `- Playbook: ${scorecard.playbook.score}/100 — ${scorecard.playbook.meets} meets, ${scorecard.playbook.deviates} deviates, ${scorecard.playbook.missing} missing`,
  );
  lines.push("");

  lines.push("## Risk flags");
  lines.push("");
  if (risks.length === 0) {
    lines.push("_No risks flagged._");
  } else {
    const order = { high: 0, medium: 1, low: 2 } as const;
    for (const r of [...risks].sort(
      (a, b) => order[a.severity] - order[b.severity],
    )) {
      lines.push(
        `### [${r.severity.toUpperCase()}] ${r.title}${locationLabel(r.evidence)}`,
      );
      lines.push("");
      lines.push(`- **Type:** ${r.issueType.replace(/_/g, " ")}`);
      lines.push(`- **Risk:** ${r.explanation}`);
      if (r.evidence) lines.push(`- **Source:** "${r.evidence.sourceText}"`);
      if (r.suggestedFix) lines.push(`- **Suggested fix:** ${r.suggestedFix}`);
      lines.push("");
    }
  }

  lines.push("## Playbook comparison");
  lines.push("");
  for (const p of playbook) {
    lines.push(`### ${STATUS_MARK[p.status]} — ${p.title}`);
    lines.push("");
    lines.push(`- **Preferred:** ${p.preferredPosition}`);
    lines.push(`- **This contract:** ${p.contractPosition ?? "not addressed"}`);
    lines.push(`- **Assessment:** ${p.explanation}`);
    if (p.evidence) lines.push(`- **Source:** "${p.evidence.sourceText}"`);
    lines.push("");
  }

  lines.push("## Extracted clauses");
  lines.push("");
  for (const c of clauses) {
    lines.push(
      `### ${CLAUSE_LABELS[c.clauseType]} — ${c.status.replace(/_/g, " ")}`,
    );
    lines.push("");
    lines.push(c.plainSummary);
    if (c.value) {
      lines.push("");
      lines.push("```json");
      lines.push(JSON.stringify(c.value, null, 2));
      lines.push("```");
    }
    for (const ev of c.evidence) {
      lines.push(`- "${ev.sourceText}"${locationLabel(ev)}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
