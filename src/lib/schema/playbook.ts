import { z } from "zod";
import { clauseTypeSchema, playbookStatusSchema, severitySchema } from "./enums";
import { modelEvidenceSchema } from "./evidence";

/* -------------------------------------------------------------------------- */
/*  Playbook definition (static JSON, see lib/playbook/default-playbook.json). */
/* -------------------------------------------------------------------------- */

export const playbookItemSchema = z
  .object({
    id: z.string(),
    clauseType: clauseTypeSchema,
    title: z.string(),
    preferredPosition: z.string(),
    rationale: z.string(),
    severityIfMissing: severitySchema,
    severityIfDeviates: severitySchema,
  })
  .strict();
export type PlaybookItem = z.infer<typeof playbookItemSchema>;

export const playbookSchema = z
  .object({
    name: z.string(),
    version: z.string(),
    governingLawPreference: z.string(),
    items: z.array(playbookItemSchema).min(1),
  })
  .strict();
export type Playbook = z.infer<typeof playbookSchema>;

/* -------------------------------------------------------------------------- */
/*  Result of model call #2 (playbook comparison).                            */
/* -------------------------------------------------------------------------- */

export const playbookComparisonSchema = z
  .object({
    playbookItemId: z.string(),
    clauseType: clauseTypeSchema,
    title: z.string(),
    status: playbookStatusSchema,
    preferredPosition: z.string(),
    contractPosition: z.string().nullable(),
    explanation: z.string(),
    severity: severitySchema,
    evidence: modelEvidenceSchema.nullable(),
  })
  .strict();
export type PlaybookComparison = z.infer<typeof playbookComparisonSchema>;

export const playbookResultSchema = z
  .object({
    comparisons: z.array(playbookComparisonSchema),
  })
  .strict();
export type PlaybookResult = z.infer<typeof playbookResultSchema>;
