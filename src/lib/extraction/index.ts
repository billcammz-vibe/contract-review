import { callStructured } from "@/lib/anthropic";
import type { NormalizedDoc } from "@/lib/ingest";
import {
  EXTRACTION_INPUT_SCHEMA,
  extractionResultSchema,
  type ExtractionResult,
} from "@/lib/schema";
import {
  EXTRACTION_SYSTEM,
  EXTRACTION_TOOL_DESCRIPTION,
  EXTRACTION_TOOL_NAME,
  buildExtractionUserMessage,
} from "./prompt";

/**
 * Model call #1 — extract the structured clause schema and risk flags from the
 * full contract text. Output is schema-validated inside {@link callStructured}.
 */
export async function runExtraction(
  doc: NormalizedDoc,
): Promise<ExtractionResult> {
  return callStructured({
    system: EXTRACTION_SYSTEM,
    user: buildExtractionUserMessage(doc),
    toolName: EXTRACTION_TOOL_NAME,
    toolDescription: EXTRACTION_TOOL_DESCRIPTION,
    inputSchema: EXTRACTION_INPUT_SCHEMA,
    schema: extractionResultSchema,
    maxTokens: 16000,
  });
}
