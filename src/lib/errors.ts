export type AnalysisErrorCode =
  | "config"
  | "input"
  | "ingest"
  | "model"
  | "validation"
  | "internal";

/** Typed error thrown across ingestion / extraction / comparison. */
export class AnalysisError extends Error {
  constructor(
    public readonly code: AnalysisErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AnalysisError";
  }

  get httpStatus(): number {
    switch (this.code) {
      case "input":
        return 400;
      case "ingest":
      case "validation":
        return 422;
      case "model":
        return 502;
      default:
        return 500;
    }
  }
}
