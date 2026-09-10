import type { ContractAnalysis, Severity } from "@/lib/schema";
import { SEVERITY_TONE } from "./badges";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Meter({
  value,
  total,
  barClass,
}: {
  value: number;
  total: number;
  barClass: string;
}) {
  const pct = total > 0 ? Math.round((100 * value) / total) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full ${barClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-300";
  if (score >= 55) return "text-amber-300";
  return "text-rose-300";
}

const SEVERITY_BAR: Record<Severity, string> = {
  high: "bg-rose-400/80",
  medium: "bg-amber-400/80",
  low: "bg-sky-400/80",
};

export function ScoreOverview({ analysis }: { analysis: ContractAnalysis }) {
  const { meta, scorecard, documentSummary, clauses } = analysis;
  const risk = scorecard.risk;
  const pb = scorecard.playbook;

  const coverage = clauses.reduce(
    (acc, c) => {
      acc[c.status] += 1;
      return acc;
    },
    { found: 0, partial: 0, not_found: 0 } as Record<string, number>,
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-hairline bg-surface p-5">
        <p className="text-sm leading-relaxed text-slate-300">{documentSummary}</p>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>{meta.fileName}</span>
          <span>·</span>
          <span>{meta.fileType.toUpperCase()}</span>
          {meta.pageCount != null && (
            <>
              <span>·</span>
              <span>{meta.pageCount} pages</span>
            </>
          )}
          <span>·</span>
          <span>~{meta.wordCount.toLocaleString()} words</span>
          <span>·</span>
          <span>{meta.model}</span>
          <span>·</span>
          <span>{(meta.durationMs / 1000).toFixed(1)}s</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Risk flags">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums text-slate-100">
              {risk.total}
            </span>
            <span className="text-xs text-slate-500">total</span>
          </div>
          <dl className="mt-3 space-y-2">
            {(["high", "medium", "low"] as const).map((s) => (
              <div key={s}>
                <div className="flex items-center justify-between text-xs">
                  <dt className={`capitalize ${SEVERITY_TONE[s].text}`}>{s}</dt>
                  <dd className="tabular-nums text-slate-400">{risk[s]}</dd>
                </div>
                <div className="mt-1">
                  <Meter
                    value={risk[s]}
                    total={Math.max(risk.total, 1)}
                    barClass={SEVERITY_BAR[s]}
                  />
                </div>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Playbook score">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-3xl font-semibold tabular-nums ${scoreColor(
                pb.score,
              )}`}
            >
              {pb.score}
            </span>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <div className="mt-3">
            <Meter
              value={pb.meets * 2 + pb.deviates}
              total={Math.max(pb.total * 2, 1)}
              barClass="bg-emerald-400/70"
            />
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <dt className="text-emerald-300">Meets</dt>
              <dd className="mt-0.5 tabular-nums text-slate-200">{pb.meets}</dd>
            </div>
            <div>
              <dt className="text-amber-300">Deviates</dt>
              <dd className="mt-0.5 tabular-nums text-slate-200">{pb.deviates}</dd>
            </div>
            <div>
              <dt className="text-rose-300">Missing</dt>
              <dd className="mt-0.5 tabular-nums text-slate-200">{pb.missing}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Clause coverage">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums text-slate-100">
              {coverage.found}
              <span className="text-lg text-slate-500">/{clauses.length}</span>
            </span>
            <span className="text-xs text-slate-500">found</span>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <dt className="text-emerald-300">Found</dt>
              <dd className="mt-0.5 tabular-nums text-slate-200">
                {coverage.found}
              </dd>
            </div>
            <div>
              <dt className="text-amber-300">Partial</dt>
              <dd className="mt-0.5 tabular-nums text-slate-200">
                {coverage.partial}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Missing</dt>
              <dd className="mt-0.5 tabular-nums text-slate-200">
                {coverage.not_found}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
