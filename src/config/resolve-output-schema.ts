import { z } from "zod";
import { ValidationIssueSchema } from "../diagnostics/command-result-schema.js";

export const ResolveStdoutObjectSchema = z.record(z.string(), z.unknown());

export const ResolveStderrJsonLineSchema = ValidationIssueSchema;

export const ResolveSourceMetadataSchema = z
  .object({
    key: z.string(),
    affectedPath: z.string(),
    role: z.string(),
  })
  .strict();

export const ResolveMergeResultSchema = z
  .object({
    value: ResolveStdoutObjectSchema,
    issues: z.array(ResolveStderrJsonLineSchema),
    exitCode: z.union([z.literal(0), z.literal(1)]),
    sources: z.record(z.string(), ResolveSourceMetadataSchema),
  })
  .strict();

export const ResolveHumanOutcomeSchema = z.enum([
  "resolved",
  "resolved-with-warnings",
  "unresolved",
  "invalid-input",
]);

export const ResolveOutputSchema = ResolveStdoutObjectSchema;

export type ResolveOutput = z.infer<typeof ResolveStdoutObjectSchema>;
export type ResolveHumanOutcome = z.infer<typeof ResolveHumanOutcomeSchema>;
