import type { LocatedEvidence } from "@/lib/schema";

export function locationText(ev: LocatedEvidence): string | null {
  if (ev.location.page != null) return `Page ${ev.location.page}`;
  if (ev.location.paragraph != null) return `Paragraph ${ev.location.paragraph + 1}`;
  return null;
}

export function EvidenceQuote({ evidence }: { evidence: LocatedEvidence }) {
  const loc = locationText(evidence);
  return (
    <figure className="border-l-2 border-brand/40 pl-3">
      <blockquote className="font-mono text-[13px] leading-relaxed text-slate-300">
        &ldquo;{evidence.sourceText}&rdquo;
      </blockquote>
      <figcaption className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wide text-slate-500">
        <span>confidence: {evidence.confidence}</span>
        {loc && <span className="text-slate-400">· {loc}</span>}
        {!evidence.matched && (
          <span className="text-amber-400/80">· quote not located in source</span>
        )}
      </figcaption>
    </figure>
  );
}
