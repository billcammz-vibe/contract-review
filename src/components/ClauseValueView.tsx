import type { ReactNode } from "react";
import type { ClauseValue } from "@/lib/schema";

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function Scalar({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-500">—</span>;
  }
  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-emerald-300" : "text-slate-400"}>
        {value ? "Yes" : "No"}
      </span>
    );
  }
  return <span className="text-slate-200">{String(value)}</span>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-3">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

function renderValue(v: unknown): ReactNode {
  if (Array.isArray(v)) {
    if (v.length === 0) return <span className="text-slate-500">none</span>;

    if (typeof v[0] === "object" && v[0] !== null) {
      return (
        <ul className="space-y-2">
          {v.map((item, i) => (
            <li
              key={i}
              className="rounded-lg border border-hairline bg-canvas/60 px-3 py-1.5"
            >
              <dl className="divide-y divide-hairline/60">
                {Object.entries(item as Record<string, unknown>).map(([k, iv]) => (
                  <Row key={k} label={humanize(k)}>
                    {renderValue(iv)}
                  </Row>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ul className="flex flex-wrap gap-1.5">
        {v.map((item, i) => (
          <li
            key={i}
            className="rounded-md bg-slate-500/10 px-2 py-0.5 text-xs text-slate-300"
          >
            {String(item)}
          </li>
        ))}
      </ul>
    );
  }

  return <Scalar value={v} />;
}

export function ClauseValueView({ value }: { value: ClauseValue }) {
  const entries = Object.entries(value).filter(([k]) => k !== "kind");
  return (
    <dl className="divide-y divide-hairline/60">
      {entries.map(([key, v]) => (
        <Row key={key} label={humanize(key)}>
          {renderValue(v)}
        </Row>
      ))}
    </dl>
  );
}
