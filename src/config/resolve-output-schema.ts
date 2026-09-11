import { z } from "zod";
import { ValidationIssueSchema } from "../diagnostics/command-result-schema.js";
import { ArtifactRootProjectionSchema, isProjectRelativePosixPath } from "../manifest/manifest-schema.js";
import { findUnsafeIssueValue } from "../validation/issue-model.js";
import { ARTIFACT_DOCUMENT_DISCOVERY_SCHEMA_VERSION } from "./artifact-document-discovery.js";
import { CR_DIRECTORY_RESOLUTION_SCHEMA_VERSION } from "./cr-directory.js";

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

export const RESOLVE_CR_DIRECTORY_SCHEMA_VERSION = CR_DIRECTORY_RESOLUTION_SCHEMA_VERSION;

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

const ProjectRelativePosixPathSchema = z
  .string()
  .min(1)
  .refine(isProjectRelativePosixPath, "path must be project-relative POSIX");

export const ResolveCrDirectoryIssueSchema = z
  .object({
    issueId: z.enum([
      "cr-directory.ambiguous-resume-root",
      "cr-directory.invalid-story-id",
      "cr-directory.invalid-review-series",
      "cr-directory.invalid-implementation-artifacts",
      "cr-directory.symlink-escape",
    ]),
    category: z.enum(["identity", "lifecycle", "path-safety"]),
    severity: z.literal("error"),
    continuation: z.literal("block"),
    affectedPath: ProjectRelativePosixPathSchema.optional(),
    component: z.literal("cr-directory-resolver"),
    details: z.record(z.string(), z.unknown()),
    impact: z.string().min(1),
    suggestedNextStep: z.string().min(1),
  })
  .strict()
  .superRefine((issue, ctx) => {
    const unsafePath = findUnsafeIssueValue(issue.details);
    if (unsafePath !== undefined) {
      ctx.addIssue({ code: "custom", path: ["details"], message: `details contains redaction-unsafe value at ${unsafePath}` });
    }
  });

export const ResolveCrDirectoryOutputSchema = z
  .object({
    schemaVersion: z.literal(RESOLVE_CR_DIRECTORY_SCHEMA_VERSION),
    ok: z.boolean(),
    storyId: z.string().regex(/^[1-9]\d*-[1-9]\d*$/).nullable(),
    reviewSeries: z.string().regex(/^[a-z0-9][a-z0-9-]{0,31}$/).nullable(),
    crDir: ProjectRelativePosixPathSchema.nullable(),
    canonicalCrDir: ProjectRelativePosixPathSchema.nullable(),
    compatibilityMode: z.enum(["canonical", "legacy-resume"]).nullable(),
    legacyCrDirs: z.array(ProjectRelativePosixPathSchema),
    roundEvidence: z.array(
      z
        .object({
          crDir: ProjectRelativePosixPathSchema,
          summaryRounds: z.array(z.number().int().positive()),
          finalizerRounds: z.array(z.number().int().positive()),
          unfinished: z.boolean(),
        })
        .strict(),
    ),
    continuation: z.enum(["continue", "block"]),
    issues: z.array(ResolveCrDirectoryIssueSchema),
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
export type ResolveCrDirectoryOutput = z.infer<typeof ResolveCrDirectoryOutputSchema>;
export type ResolveHumanOutcome = z.infer<typeof ResolveHumanOutcomeSchema>;
