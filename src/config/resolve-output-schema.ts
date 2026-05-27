import { z } from "zod";
import { ValidationIssueSchema } from "../diagnostics/command-result-schema.js";

export const ResolveStdoutObjectSchema = z.record(z.string(), z.unknown());

export const ResolveStderrJsonLineSchema = ValidationIssueSchema;

export const ResolveMergeResultSchema = z
  .object({
    value: ResolveStdoutObjectSchema,
    issues: z.array(ResolveStderrJsonLineSchema),
    exitCode: z.union([z.literal(0), z.literal(1)]),
  })
  .strict();

export const ResolveOutputSchema = ResolveStdoutObjectSchema;

export type ResolveOutput = z.infer<typeof ResolveStdoutObjectSchema>;
