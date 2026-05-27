import { z } from "zod";
import { ValidationIssueSchema } from "../diagnostics/command-result-schema.js";

export const ResolveOutputSchema = z
  .object({
    value: z.unknown(),
    sources: z.array(z.string().min(1)),
    diagnostics: z.array(ValidationIssueSchema),
  })
  .strict();

export const ResolveStderrJsonLineSchema = ValidationIssueSchema;

export type ResolveOutput = z.infer<typeof ResolveOutputSchema>;

