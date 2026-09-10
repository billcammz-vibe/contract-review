import { CLAUSE_LABELS } from "@/lib/schema/enums";
import type { AnalysedClause } from "@/lib/schema";
import { ClauseStatusBadge } from "./badges";
import { ClauseValueView } from "./ClauseValueView";
import { EvidenceQuote } from "./EvidenceQuote";

export function ClauseTable({ clauses }: { clauses: AnalysedClause[] }) {
  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-surface">
      {clauses.map((c) => (
        <details key={c.clauseType} className="group">
          <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3 hover:bg-white/[0.02]">
            <svg
              viewBox="0 0 16 16"
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-90"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
              <span className="font-medium text-slate-100 sm:w-44 sm:shrink-0">
                {CLAUSE_LABELS[c.clauseType]}
              </span>
              <ClauseStatusBadge status={c.status} />
              <span className="min-w-0 truncate text-sm text-slate-400 group-open:whitespace-normal">
                {c.plainSummary}
              </span>
            </div>
          </summary>

          <div className="space-y-4 border-t border-hairline bg-canvas/40 px-4 py-4 sm:pl-11">
            <p className="text-sm text-slate-300">{c.plainSummary}</p>
            {c.value && <ClauseValueView value={c.value} />}
            {c.evidence.length > 0 && (
              <div className="space-y-3 pt-1">
                {c.evidence.map((ev, j) => (
                  <EvidenceQuote key={j} evidence={ev} />
                ))}
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
