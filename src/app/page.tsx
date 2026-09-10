"use client";

import { useState } from "react";
import { AnalyzingPanel } from "@/components/AnalyzingPanel";
import { Dashboard } from "@/components/Dashboard";
import { ErrorPanel } from "@/components/ErrorPanel";
import { UploadPanel } from "@/components/UploadPanel";
import type { AnalysisErrorBody, ContractAnalysis } from "@/lib/schema";

type State =
  | { phase: "idle" }
  | { phase: "analyzing"; fileName: string }
  | { phase: "done"; analysis: ContractAnalysis }
  | { phase: "error"; message: string };

export default function Page() {
  const [state, setState] = useState<State>({ phase: "idle" });

  async function analyze(file: File) {
    setState({ phase: "analyzing", fileName: file.name });
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/analyze", { method: "POST", body });
      const json: unknown = await res.json();

      if (!res.ok) {
        const message =
          (json as AnalysisErrorBody)?.error?.message ??
          `Request failed (${res.status})`;
        setState({ phase: "error", message });
        return;
      }
      setState({ phase: "done", analysis: json as ContractAnalysis });
    } catch (err) {
      setState({
        phase: "error",
        message:
          err instanceof Error ? err.message : "Network error — please retry.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <div className="flex items-center gap-2 text-brand">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path
              d="M8 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-3"
              strokeLinecap="round"
            />
            <path
              d="M9 3.5A1.5 1.5 0 0110.5 2h3A1.5 1.5 0 0115 3.5V5H9V3.5z"
            />
            <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            Contract Review
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
          Structured contract analysis
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Upload a contract (PDF or .docx). Claude extracts the key terms into a
          strict schema, flags risky or non-standard clauses by severity, and
          scores the document against a standard negotiation playbook. Every
          extracted item links back to its verbatim source text.
        </p>
      </header>

      {state.phase === "idle" && <UploadPanel onAnalyze={analyze} />}
      {state.phase === "analyzing" && (
        <AnalyzingPanel fileName={state.fileName} />
      )}
      {state.phase === "error" && (
        <ErrorPanel
          message={state.message}
          onRetry={() => setState({ phase: "idle" })}
        />
      )}
      {state.phase === "done" && (
        <Dashboard
          analysis={state.analysis}
          onReset={() => setState({ phase: "idle" })}
        />
      )}

      <footer className="mt-16 border-t border-hairline pt-6 text-xs text-slate-600">
        Structured output via Anthropic tool use · schema-validated with Zod ·
        files are processed in-memory and never stored.
      </footer>
    </div>
  );
}
