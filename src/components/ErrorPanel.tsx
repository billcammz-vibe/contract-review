"use client";

export function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] px-6 py-10 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
        !
      </div>
      <p className="mt-4 text-sm font-medium text-slate-100">
        The analysis could not be completed
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg border border-hairline bg-surface px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.04]"
      >
        Try another file
      </button>
    </div>
  );
}
