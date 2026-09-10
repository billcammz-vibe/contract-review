import { z } from "zod";

/**
 * Where a piece of evidence sits in the source document. Populated
 * deterministically by the ingestion layer (never by the model) by
 * locating the model's verbatim quote in the normalised text.
 */
export const sourceLocationSchema = z
  .object({
    /** 1-indexed page number (PDF only). */
    page: z.number().int().positive().nullable(),
    /** 0-indexed paragraph number (DOCX only). */
    paragraph: z.number().int().nonnegative().nullable(),
    /** Character offset into the normalised full text. */
    charStart: z.number().int().nonnegative().nullable(),
    charEnd: z.number().int().nonnegative().nullable(),
  })
  .strict();
export type SourceLocation = z.infer<typeof sourceLocationSchema>;

/**
 * Evidence as returned by the model: a verbatim quote plus a confidence.
 * The model is deliberately not asked for offsets.
 */
export const modelEvidenceSchema = z
  .object({
    sourceText: z.string().min(1),
    confidence: z.enum(["high", "medium", "low"]),
  })
  .strict();
export type ModelEvidence = z.infer<typeof modelEvidenceSchema>;

/** Evidence after the ingestion layer has resolved its location. */
export interface LocatedEvidence extends ModelEvidence {
  location: SourceLocation;
  /** False when the verbatim quote could not be found in the source text. */
  matched: boolean;
}
