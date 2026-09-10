import { callStructured } from "@/lib/anthropic";
import { AnalysisError } from "@/lib/errors";
import type { NormalizedDoc } from "@/lib/ingest";
import {
  PLAYBOOK_INPUT_SCHEMA,
  playbookResultSchema,
  playbookSchema,
  type ExtractionResult,
  type Playbook,
  type PlaybookResult,
} from "@/lib/schema";
import rawPlaybook from "./default-playbook.json";
import {
  PLAYBOOK_SYSTEM,
  PLAYBOOK_TOOL_DESCRIPTION,
  PLAYBOOK_TOOL_NAME,
  buildPlaybookUserMessage,
} from "./prompt";

/** The bundled playbook, validated once at module load. */
export const DEFAULT_PLAYBOOK: Playbook = playbookSchema.parse(rawPlaybook);

/**
 * Model call #2 — compare the contract against the playbook. Every playbook item
 * gets exactly one comparison; a mismatch in count is treated as a validation
 * failure so the caller can surface it.
 */
export async function comparePlaybook(
  doc: NormalizedDoc,
  extraction: ExtractionResult,
  playbook: Playbook = DEFAULT_PLAYBOOK,
): Promise<PlaybookResult> {
  const result = await callStructured({
    system: PLAYBOOK_SYSTEM,
    user: buildPlaybookUserMessage(doc, extraction, playbook),
    toolName: PLAYBOOK_TOOL_NAME,
    toolDescription: PLAYBOOK_TOOL_DESCRIPTION,
    inputSchema: PLAYBOOK_INPUT_SCHEMA,
    schema: playbookResultSchema,
    maxTokens: 12000,
  });

  const expectedIds = new Set(playbook.items.map((i) => i.id));
  const gotIds = new Set(result.comparisons.map((c) => c.playbookItemId));
  const missing = [...expectedIds].filter((id) => !gotIds.has(id));
  if (missing.length > 0) {
    throw new AnalysisError(
      "validation",
      `Playbook comparison is missing entries for: ${missing.join(", ")}`,
    );
  }

  return result;
}
