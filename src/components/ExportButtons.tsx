"use client";

import { toJsonString, toMarkdownSummary } from "@/lib/export";
import type { ContractAnalysis } from "@/lib/schema";

function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportButtons({ analysis }: { analysis: ContractAnalysis }) {
  const base =
    analysis.meta.fileName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "_") ||
    "contract-review";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() =>
          downloadFile(
            `${base}.analysis.json`,
            toJsonString(analysis),
            "application/json",
          )
        }
        className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/[0.04]"
      >
        Export JSON
      </button>
      <button
        type="button"
        onClick={() =>
          downloadFile(
            `${base}.summary.md`,
            toMarkdownSummary(analysis),
            "text/markdown",
          )
        }
        className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/[0.04]"
      >
        Export summary
      </button>
    </div>
  );
}
