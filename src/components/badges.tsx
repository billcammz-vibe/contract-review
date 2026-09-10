import type { PlaybookStatus, Severity } from "@/lib/schema";

type Tone = {
  text: string;
  bg: string;
  ring: string;
  dot: string;
};

export const SEVERITY_TONE: Record<Severity, Tone> = {
  high: {
    text: "text-rose-200",
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/30",
    dot: "bg-rose-400",
  },
  medium: {
    text: "text-amber-200",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/30",
    dot: "bg-amber-400",
  },
  low: {
    text: "text-sky-200",
    bg: "bg-sky-500/10",
    ring: "ring-sky-500/25",
    dot: "bg-sky-400",
  },
};

const PLAYBOOK_TONE: Record<PlaybookStatus, Tone> = {
  meets: {
    text: "text-emerald-200",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/30",
    dot: "bg-emerald-400",
  },
  deviates: {
    text: "text-amber-200",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/30",
    dot: "bg-amber-400",
  },
  missing: {
    text: "text-rose-200",
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/30",
    dot: "bg-rose-400",
  },
};

const CLAUSE_STATUS_TONE: Record<string, Tone> = {
  found: {
    text: "text-emerald-200",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/25",
    dot: "bg-emerald-400",
  },
  partial: {
    text: "text-amber-200",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/25",
    dot: "bg-amber-400",
  },
  not_found: {
    text: "text-slate-400",
    bg: "bg-slate-500/10",
    ring: "ring-slate-500/25",
    dot: "bg-slate-500",
  },
};

function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ring-1 ring-inset ${tone.text} ${tone.bg} ${tone.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Pill tone={SEVERITY_TONE[severity]}>{severity}</Pill>;
}

export function PlaybookStatusBadge({ status }: { status: PlaybookStatus }) {
  return <Pill tone={PLAYBOOK_TONE[status]}>{status}</Pill>;
}

export function ClauseStatusBadge({ status }: { status: string }) {
  return (
    <Pill tone={CLAUSE_STATUS_TONE[status] ?? CLAUSE_STATUS_TONE.not_found}>
      {status.replace(/_/g, " ")}
    </Pill>
  );
}
