import type { AnalysedPlaybookItem } from "@/lib/schema";
import { PlaybookStatusBadge, SeverityBadge } from "./badges";
import { EvidenceQuote } from "./EvidenceQuote";

export function PlaybookTable({ items }: { items: AnalysedPlaybookItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">Playbook item</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">This contract</th>
            <th className="px-4 py-3 font-medium">Severity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr
              key={p.playbookItemId}
              className="border-b border-hairline/60 align-top last:border-0"
            >
              <td className="px-4 py-3">
                <div className="font-medium text-slate-100">{p.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Preferred: {p.preferredPosition}
                </div>
              </td>
              <td className="px-4 py-3">
                <PlaybookStatusBadge status={p.status} />
              </td>
              <td className="px-4 py-3 text-slate-300">
                <div>
                  {p.contractPosition ?? (
                    <span className="text-slate-500">Not addressed</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-slate-500">{p.explanation}</div>
                {p.evidence && (
                  <div className="mt-2">
                    <EvidenceQuote evidence={p.evidence} />
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                {p.status === "meets" ? (
                  <span className="text-xs text-slate-600">—</span>
                ) : (
                  <SeverityBadge severity={p.severity} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
