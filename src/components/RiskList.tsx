import { CLAUSE_LABELS } from "@/lib/schema/enums";
import type { AnalysedRisk } from "@/lib/schema";
import { SeverityBadge } from "./badges";
import { EvidenceQuote } from "./EvidenceQuote";

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export function RiskList({ risks }: { risks: AnalysedRisk[] }) {
  if (risks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-hairline bg-surface px-4 py-10 text-center text-sm text-slate-400">
        No risks were flagged against this contract.
      </div>
    );
  }

  const sorted = [...risks].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  return (
    <ul className="space-y-3">
      {sorted.map((r) => (
        <li
          key={r.id}
          className="rounded-xl border border-hairline bg-surface p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-medium text-slate-100">{r.title}</h3>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">
                {r.clauseType === "other"
                  ? "General"
                  : CLAUSE_LABELS[r.clauseType]}{" "}
                · {r.issueType.replace(/_/g, " ")}
              </p>
            </div>
            <SeverityBadge severity={r.severity} />
          </div>

          <p className="mt-3 text-sm text-slate-300">{r.explanation}</p>

          {r.evidence && (
            <div className="mt-3">
              <EvidenceQuote evidence={r.evidence} />
            </div>
          )}

          {r.suggestedFix && (
            <p className="mt-3 rounded-lg bg-brand/5 px-3 py-2 text-sm text-slate-300 ring-1 ring-inset ring-brand/15">
              <span className="font-medium text-brand">Suggested fix — </span>
              {r.suggestedFix}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
