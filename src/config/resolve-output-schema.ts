import { z } from "zod";
import { ValidationIssueSchema } from "../diagnostics/command-result-schema.js";
import { ArtifactRootProjectionSchema } from "../manifest/manifest-schema.js";
import { ARTIFACT_DOCUMENT_DISCOVERY_SCHEMA_VERSION } from "./artifact-document-discovery.js";

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

export const RESOLVE_ARTIFACT_ROOTS_SCHEMA_VERSION = "speclite.resolve.artifact-roots.v1" as const;

export const RESOLVE_ARTIFACT_DOCUMENTS_SCHEMA_VERSION = ARTIFACT_DOCUMENT_DISCOVERY_SCHEMA_VERSION;

export const ResolveArtifactRootsOutputSchema = z
  .object({
    schemaVersion: z.literal(RESOLVE_ARTIFACT_ROOTS_SCHEMA_VERSION),
    lifecycle: z.enum(["fresh", "existing"]),
    roots: z.array(ArtifactRootProjectionSchema),
    configSources: z.record(z.string(), ResolveSourceMetadataSchema),
  })
  .strict();

export const ResolveArtifactDocumentsOutputSchema = z
  .object({
    schemaVersion: z.literal(RESOLVE_ARTIFACT_DOCUMENTS_SCHEMA_VERSION),
    ok: z.boolean(),
    subject: z.enum(["prd", "epics", "architecture"]),
    resolvedRoot: z.string().min(1),
    resolutionMode: z.enum(["fresh-default", "explicit-config", "legacy-compatible"]),
    subjectDirectory: z.string().min(1),
    canonicalWholePath: z.string().min(1),
    shardedIndexPath: z.string().min(1),
    actualConsumedPath: z.string().min(1).nullable(),
    consumedPaths: z.array(z.string().min(1)),
    declaredShardPaths: z.array(z.string().min(1)),
    discoveryShape: z.enum([
      "whole-only",
      "sharded-only",
      "whole+sharded",
      "invalid-sharded",
      "subject-missing",
    ]),
    ambiguityStatus: z.enum([
      "not-ambiguous",
      "selection-required",
      "resolved-by-explicit-selection",
    ]),
    selection: z
      .object({
        value: z.enum(["whole", "sharded"]).nullable(),
        source: z.enum(["none", "invocation"]),
      })
      .strict(),
    unselectedPath: z.string().min(1).nullable(),
    continuation: z.enum(["continue", "block"]),
    issues: z.array(ValidationIssueSchema),
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
export type ResolveArtifactRootsOutput = z.infer<typeof ResolveArtifactRootsOutputSchema>;
export type ResolveArtifactDocumentsOutput = z.infer<typeof ResolveArtifactDocumentsOutputSchema>;
export type ResolveHumanOutcome = z.infer<typeof ResolveHumanOutcomeSchema>;
