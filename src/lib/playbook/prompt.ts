import type { NormalizedDoc } from "@/lib/ingest";
import type { ExtractionResult, Playbook } from "@/lib/schema";

export const PLAYBOOK_TOOL_NAME = "submit_playbook_comparison";

export const PLAYBOOK_TOOL_DESCRIPTION =
  "Return one comparison entry for each playbook item, in the same order as the playbook. Call this exactly once.";

export const PLAYBOOK_SYSTEM = `You compare ONE contract against a customer-side negotiation playbook. For every playbook item, decide how the contract measures up.

Return everything through the ${PLAYBOOK_TOOL_NAME} tool.

For each playbook item, produce exactly one comparison with:
- playbookItemId, clauseType, title: copied from the playbook item.
- status:
  - "meets"    — the contract's position satisfies or is more favourable than the preferred position.
  - "deviates" — the contract addresses the point but is less favourable than the preferred position.
  - "missing"  — the contract is silent on the point.
- contractPosition: one sentence describing what THIS contract actually says (null when status is "missing").
- preferredPosition: copied verbatim from the playbook item.
- explanation: one sentence. For "deviates"/"missing" state the gap and its impact; for "meets" briefly say why it qualifies.
- severity:
  - status "missing"  -> use the item's severityIfMissing.
  - status "deviates" -> use the item's severityIfDeviates.
  - status "meets"    -> "low".
- evidence: a verbatim quote from the contract for the relevant language (exact substring, no paraphrasing), or null when status is "missing".

Output the comparisons in the same order as the playbook items. Base your reading on the contract text; the pre-computed extraction is provided only as a guide.`;

export function buildPlaybookUserMessage(
  doc: NormalizedDoc,
  extraction: ExtractionResult,
  playbook: Playbook,
): string {
  const extractionDigest = extraction.clauses
    .map(
      (c) =>
        `- ${c.clauseType} [${c.status}]: ${c.plainSummary}` +
        (c.value ? `\n  value: ${JSON.stringify(c.value)}` : ""),
    )
    .join("\n");

  return `PLAYBOOK
${JSON.stringify(playbook, null, 2)}

PRE-COMPUTED EXTRACTION (guide only)
${extractionDigest}

CONTRACT TEXT
<contract>
${doc.fullText}
</contract>`;
}
