import type { ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { extractionResultSchema } from "./extraction";
import { playbookResultSchema } from "./playbook";

/**
 * Convert a Zod schema into a JSON Schema suitable for an Anthropic tool
 * `input_schema`: refs inlined (Claude handles a flat schema more reliably),
 * no `$schema` / `definitions` wrapper keys.
 */
export function toToolInputSchema(schema: ZodTypeAny): Record<string, unknown> {
  const json = zodToJsonSchema(schema, {
    target: "openApi3",
    $refStrategy: "none",
  }) as Record<string, unknown>;
  delete json.$schema;
  delete json.definitions;
  delete json.$defs;
  return json;
}

/** JSON Schema handed to Claude for model call #1. */
export const EXTRACTION_INPUT_SCHEMA = toToolInputSchema(extractionResultSchema);

/** JSON Schema handed to Claude for model call #2. */
export const PLAYBOOK_INPUT_SCHEMA = toToolInputSchema(playbookResultSchema);
