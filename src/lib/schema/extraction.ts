import { z } from "zod";
import {
  clauseTypeSchema,
  foundStateSchema,
  issueTypeSchema,
  severitySchema,
  CLAUSE_TYPES,
} from "./enums";
import { modelEvidenceSchema } from "./evidence";

/* -------------------------------------------------------------------------- */
/*  Typed structured value for each clause category.                          */
/*  `kind` is the discriminant and MUST equal the clause's `clauseType`.      */
/* -------------------------------------------------------------------------- */

const partySchema = z
  .object({
    name: z.string(),
    role: z.string().describe('e.g. "Customer", "Vendor", "Disclosing Party"'),
    entityType: z.string().nullable().describe('e.g. "Delaware corporation"'),
    jurisdiction: z.string().nullable(),
  })
  .strict();

const terminationRightSchema = z
  .object({
    trigger: z.enum([
      "for_convenience",
      "for_cause",
      "material_breach",
      "insolvency",
      "non_payment",
      "other",
    ]),
    exercisableBy: z.enum(["customer", "vendor", "either"]),
    noticeDays: z.number().nullable(),
    curePeriodDays: z.number().nullable(),
    raw: z.string(),
  })
  .strict();

const indemnityObligationSchema = z
  .object({
    indemnitor: z.enum(["customer", "vendor", "mutual"]),
    coveredClaims: z.array(z.string()),
    capped: z.boolean().nullable(),
    raw: z.string(),
  })
  .strict();

export const clauseValueSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("parties"), parties: z.array(partySchema) }).strict(),
  z
    .object({
      kind: z.literal("effective_date"),
      isoDate: z.string().nullable().describe("YYYY-MM-DD if determinable"),
      raw: z.string(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("term"),
      lengthMonths: z.number().nullable(),
      startTrigger: z.string().nullable(),
      perpetual: z.boolean(),
      raw: z.string(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("renewal"),
      autoRenews: z.boolean(),
      renewalTermMonths: z.number().nullable(),
      noticeToStopDays: z.number().nullable(),
      raw: z.string(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("termination"),
      rights: z.array(terminationRightSchema),
    })
    .strict(),
  z
    .object({
      kind: z.literal("liability_cap"),
      capType: z.enum([
        "uncapped",
        "fees_paid_lookback",
        "fees_multiple",
        "fixed_amount",
        "other",
      ]),
      lookbackMonths: z.number().nullable(),
      multiple: z.number().nullable(),
      fixedAmount: z.number().nullable(),
      currency: z.string().nullable(),
      mutual: z.boolean(),
      carveouts: z.array(z.string()),
      raw: z.string(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("indemnification"),
      obligations: z.array(indemnityObligationSchema),
    })
    .strict(),
  z
    .object({
      kind: z.literal("governing_law"),
      jurisdiction: z.string().nullable(),
      venue: z.string().nullable(),
      raw: z.string(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("confidentiality"),
      present: z.boolean(),
      mutual: z.boolean(),
      durationYears: z.number().nullable(),
      perpetualForTradeSecrets: z.boolean(),
      survivesTermination: z.boolean(),
      raw: z.string(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("payment"),
      netDays: z.number().nullable(),
      currency: z.string().nullable(),
      lateFeePercentPerMonth: z.number().nullable(),
      autoIncreasePercent: z.number().nullable(),
      raw: z.string(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("assignment"),
      consentRequired: z.boolean(),
      consentStandard: z
        .enum(["sole_discretion", "not_unreasonably_withheld", "none"])
        .nullable(),
      affiliateException: z.boolean(),
      changeOfControlException: z.boolean(),
      raw: z.string(),
    })
    .strict(),
]);
export type ClauseValue = z.infer<typeof clauseValueSchema>;

/* -------------------------------------------------------------------------- */
/*  One extracted clause.                                                     */
/* -------------------------------------------------------------------------- */

export const extractedClauseSchema = z
  .object({
    clauseType: clauseTypeSchema,
    status: foundStateSchema,
    plainSummary: z.string(),
    value: clauseValueSchema.nullable(),
    evidence: z.array(modelEvidenceSchema).max(3),
  })
  .strict();
export type ExtractedClause = z.infer<typeof extractedClauseSchema>;

/* -------------------------------------------------------------------------- */
/*  Risk flags.                                                               */
/* -------------------------------------------------------------------------- */

export const riskFlagSchema = z
  .object({
    id: z.string().describe("stable kebab-case slug"),
    clauseType: z.union([clauseTypeSchema, z.literal("other")]),
    title: z.string(),
    severity: severitySchema,
    issueType: issueTypeSchema,
    explanation: z.string().describe("one sentence"),
    evidence: modelEvidenceSchema.nullable(),
    suggestedFix: z.string().nullable(),
  })
  .strict();
export type RiskFlag = z.infer<typeof riskFlagSchema>;

/* -------------------------------------------------------------------------- */
/*  Full result of model call #1 (extraction + risk).                         */
/* -------------------------------------------------------------------------- */

export const extractionResultSchema = z
  .object({
    documentSummary: z.string(),
    clauses: z.array(extractedClauseSchema),
    risks: z.array(riskFlagSchema),
  })
  .strict()
  .superRefine((data, ctx) => {
    const seen = new Set(data.clauses.map((c) => c.clauseType));
    for (const t of CLAUSE_TYPES) {
      if (!seen.has(t)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `missing a clause entry for "${t}"`,
          path: ["clauses"],
        });
      }
    }
    data.clauses.forEach((c, i) => {
      if (c.value && c.value.kind !== c.clauseType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `value.kind "${c.value.kind}" does not match clauseType "${c.clauseType}"`,
          path: ["clauses", i, "value", "kind"],
        });
      }
      if (c.status === "not_found" && c.value !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `value must be null when status is "not_found"`,
          path: ["clauses", i, "value"],
        });
      }
    });
  });
export type ExtractionResult = z.infer<typeof extractionResultSchema>;
