"use client";

import type { ContractAnalysis } from "@/lib/schema";
import { ClauseTable } from "./ClauseTable";
import { ExportButtons } from "./ExportButtons";
import { PlaybookTable } from "./PlaybookTable";
import { RiskList } from "./RiskList";
import { ScoreOverview } from "./ScoreOverview";

function Section({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          {title}
        </h2>
        {meta && <span className="text-xs text-slate-500">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

export function Dashboard({
  analysis,
  onReset,
}: {
  analysis: ContractAnalysis;
  onReset: () => void;
}) {
  const { scorecard } = analysis;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ExportButtons analysis={analysis} />
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:text-slate-200"
        >
          ← Analyse another contract
        </button>
      </div>

      <div className="mt-6">
        <ScoreOverview analysis={analysis} />
      </div>

      <Section
        title="Risk flags"
        meta={`${scorecard.risk.high} high · ${scorecard.risk.medium} medium · ${scorecard.risk.low} low`}
      >
        <RiskList risks={analysis.risks} />
      </Section>

      <Section
        title="Playbook comparison"
        meta={`${scorecard.playbook.score}/100 · ${scorecard.playbook.meets} meets · ${scorecard.playbook.deviates} deviates · ${scorecard.playbook.missing} missing`}
      >
        <PlaybookTable items={analysis.playbook} />
      </Section>

      <Section title="Extracted clauses" meta={`${analysis.clauses.length} categories`}>
        <ClauseTable clauses={analysis.clauses} />
      </Section>
    </div>
  );
}
