"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Extracting document text",
  "Extracting clauses & key terms",
  "Assessing risk",
  "Comparing against the playbook",
];

export function AnalyzingPanel({ fileName }: { fileName: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-hairline bg-surface px-6 py-12">
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <div className="relative h-12 w-12">
          <span className="absolute inset-0 rounded-full bg-brand/30 [animation:pulse-ring_2s_ease-in-out_infinite]" />
          <span className="absolute inset-[6px] animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>

        <p className="mt-5 text-sm font-medium text-slate-200">
          Analysing <span className="text-slate-400">{fileName}</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Two schema-validated model passes — this usually takes 20–45 seconds.
        </p>

        <ul className="mt-6 w-full space-y-2 text-left">
          {STEPS.map((label, i) => {
            const state =
              i < step ? "done" : i === step ? "active" : "pending";
            return (
              <li
                key={label}
                className="flex items-center gap-3 text-sm"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                    state === "done"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : state === "active"
                        ? "bg-brand/20 text-brand"
                        : "bg-white/5 text-slate-600"
                  }`}
                >
                  {state === "done" ? "✓" : "•"}
                </span>
                <span
                  className={
                    state === "pending" ? "text-slate-600" : "text-slate-300"
                  }
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
