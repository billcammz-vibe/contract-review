"use client";

import { useRef, useState } from "react";

const MAX_MB = 10;

function isSupported(name: string): boolean {
  const ext = name.toLowerCase().split(".").pop();
  return ext === "pdf" || ext === "docx";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadPanel({
  onAnalyze,
}: {
  onAnalyze: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function take(next: File | null | undefined) {
    if (!next) return;
    if (!isSupported(next.name)) {
      setError("Only PDF and .docx files are supported.");
      setFile(null);
      return;
    }
    if (next.size > MAX_MB * 1024 * 1024) {
      setError(`That file is ${formatSize(next.size)} — the limit is ${MAX_MB} MB.`);
      setFile(null);
      return;
    }
    setError(null);
    setFile(next);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          take(e.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center transition ${
          dragging
            ? "border-brand/60 bg-brand/5"
            : "border-hairline bg-surface hover:border-white/20"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => take(e.target.files?.[0])}
        />
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8 text-slate-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M12 16V4m0 0L7 9m5-5l5 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"
            strokeLinecap="round"
          />
        </svg>
        <p className="mt-3 text-sm text-slate-300">
          {file ? (
            <span className="font-medium text-slate-100">{file.name}</span>
          ) : (
            <>
              Drop a contract here, or{" "}
              <span className="text-brand">browse</span>
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {file
            ? `${formatSize(file.size)} · click to choose a different file`
            : `PDF or .docx · up to ${MAX_MB} MB`}
        </p>
      </div>

      {error && (
        <p className="mt-3 text-sm text-rose-300">{error}</p>
      )}

      <button
        type="button"
        disabled={!file}
        onClick={() => file && onAnalyze(file)}
        className="mt-4 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-slate-950 transition enabled:hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        Analyse contract
      </button>
    </div>
  );
}
