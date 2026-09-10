import { AnalysisError } from "@/lib/errors";
import { ingestDocx } from "./docx";
import { ingestPdf } from "./pdf";
import type { NormalizedDoc, RawFile } from "./types";

export type { NormalizedDoc, DocSegment, RawFile } from "./types";
export { locate, locateEvidence } from "./locate";

/** Below this many non-whitespace chars we assume extraction failed. */
const MIN_TEXT_CHARS = 200;

export async function ingest(file: RawFile): Promise<NormalizedDoc> {
  let doc: NormalizedDoc;
  try {
    doc =
      file.fileType === "pdf"
        ? await ingestPdf(file.buffer, file.name)
        : await ingestDocx(file.buffer, file.name);
  } catch (err) {
    throw new AnalysisError(
      "ingest",
      `Could not read ${file.fileType.toUpperCase()} file: ${
        (err as Error).message
      }`,
    );
  }

  if (doc.fullText.replace(/\s/g, "").length < MIN_TEXT_CHARS) {
    throw new AnalysisError(
      "ingest",
      "The document has little or no extractable text. If it is a scanned PDF, run OCR first.",
    );
  }
  return doc;
}
