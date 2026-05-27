import { z } from "zod";
import { InstallCommandResultSchema, ValidationIssueSchema } from "../diagnostics/command-result-schema.js";

export const RELEASE_GATE_FIXTURE_CASES = [
  "fresh-install-empty-project",
  "existing-install-update",
  "ide-drift",
  "source-integrity",
  "resolve-parity",
  "path-portability",
  "skill-artifact-loop",
] as const;

export const FixtureCaseManifestSchema = z
  .object({
    caseId: z.enum(RELEASE_GATE_FIXTURE_CASES),
    releaseGate: z.boolean(),
    purpose: z.string().min(1),
  })
  .strict();

export const ExpectedCommandJsonSchema = InstallCommandResultSchema;

export const ExpectedStderrJsonLineSchema = ValidationIssueSchema;

export type FixtureCaseManifest = z.infer<typeof FixtureCaseManifestSchema>;

export function parseExpectedCommandJson(value: unknown) {
  return ExpectedCommandJsonSchema.parse(value);
}
