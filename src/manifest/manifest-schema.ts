import { z } from "zod";
import { SourceDescriptorSchema } from "../source/source-descriptor-schema.js";

export const MANIFEST_SCHEMA_VERSION = "speclite.manifest.v1" as const;
export const SKILL_INDEX_SCHEMA_VERSION = "speclite.skill-index.v1" as const;
export const HELP_INDEX_SCHEMA_VERSION = "speclite.help-index.v1" as const;
export const FILES_INDEX_SCHEMA_VERSION = "speclite.files-index.v1" as const;
export const PHASE_COVERAGE_SCHEMA_VERSION = "speclite.phase-coverage.v1" as const;
const ARTIFACT_CONTRACT_REQUIRED_METADATA_FIELDS = [
  "workflowType",
  "sourceSkill",
  "generatedAt",
] as const;

export function isProjectRelativePosixPath(value: string): boolean {
  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.includes("\\") ||
    trimmed.includes("//") ||
    trimmed.startsWith("~") ||
    trimmed.startsWith("/") ||
    /^[A-Za-z]:(?:\/|$)/.test(trimmed)
  ) {
    return false;
  }

  const normalized = trimmed.replace(/\/+$/g, "");
  const posixNormalized = normalized.split("/").filter(Boolean).join("/");
  if (
    normalized !== posixNormalized ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("/../")
  ) {
    return false;
  }

  return true;
}

export function isInstalledSkillEntryPath(value: string): boolean {
  if (!isProjectRelativePosixPath(value)) return false;
  return /^\.claude\/skills\/[^/]+$/.test(value) || /^\.agents\/skills\/[^/]+$/.test(value);
}

export function isInstalledSkillActivationTarget(value: string): boolean {
  if (!isProjectRelativePosixPath(value)) return false;
  if (value.startsWith("assets/source/") || value.startsWith("_bmad-output/")) return false;
  return (
    /^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(value) ||
    /^\.agents\/skills\/[^/]+\/SKILL\.md$/.test(value)
  );
}

export function isStableSourceRef(value: string): boolean {
  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.includes("\\") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("~") ||
    /^[A-Za-z]:(?:\/|\\|$)/.test(trimmed)
  ) {
    return false;
  }

  if (trimmed.includes(":")) {
    return /^[a-z][a-z0-9-]*:[a-z0-9._/-]+$/.test(trimmed);
  }

  return isProjectRelativePosixPath(trimmed);
}

export const IdeTargetIdSchema = z.enum(["claude", "agents"]);
export const InstalledPhaseCoverageStatusSchema = z.enum(["mapped", "unsupported", "failed"]);
export const InstalledSkillEntryPathSchema = z
  .string()
  .min(1)
  .refine(isInstalledSkillEntryPath, "entryPath must be an installed project-relative POSIX skill directory");
export const InstalledSkillActivationTargetSchema = z
  .string()
  .min(1)
  .refine(
    isInstalledSkillActivationTarget,
    "activationTarget must be an installed project-relative POSIX SKILL.md path",
  );
export const WorkflowArtifactMetadataSchema = z
  .object({
    workflowType: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    sourceSkill: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    generatedAt: z
      .string()
      .min(1)
      .refine((value) => {
        const parsed = Date.parse(value);
        return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
      }, "generatedAt must be a canonical UTC ISO string produced by Date.toISOString()"),
  })
  .passthrough();
export const ArtifactRootFieldSchema = z.enum([
  "brainstorming_artifacts",
  "analysis_artifacts",
  "planning_artifacts",
  "solutioning_artifacts",
  "implementation_artifacts",
  "devops_artifacts",
  "project_knowledge",
]);
export const ArtifactRootConfigPathSchema = z.enum([
  "core.brainstorming_artifacts",
  "modules.sdlc.analysis_artifacts",
  "modules.sdlc.planning_artifacts",
  "modules.sdlc.solutioning_artifacts",
  "modules.sdlc.implementation_artifacts",
  "modules.sdlc.devops_artifacts",
  "modules.sdlc.project_knowledge",
]);
export const ArtifactRootProjectionSchema = z
  .object({
    field: ArtifactRootFieldSchema,
    configPath: ArtifactRootConfigPathSchema,
    placeholder: z
      .string()
      .min(1)
      .regex(/^\{[a-z_]+\}$/),
    resolvedRoot: z
      .string()
      .min(1)
      .refine(isProjectRelativePosixPath, "resolvedRoot must be project-relative POSIX"),
    resolutionMode: z.enum(["fresh-default", "explicit-config", "legacy-compatible"]),
    plane: z.enum([
      "brainstorming",
      "analysis",
      "planning",
      "solutioning",
      "implementation",
      "devops",
      "project-knowledge",
    ]),
    ownership: z.literal("workflow-owned"),
    contractRefs: z.array(z.string().min(1)),
  })
  .strict();
export const ArtifactContractSchema = z
  .object({
    artifactType: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    defaultOutputPath: z
      .string()
      .min(1)
      .refine(isProjectRelativePosixPath, "defaultOutputPath must be project-relative POSIX"),
    requiredMetadata: z
      .array(z.enum(ARTIFACT_CONTRACT_REQUIRED_METADATA_FIELDS))
      .refine(
        (fields) =>
          ARTIFACT_CONTRACT_REQUIRED_METADATA_FIELDS.every((field) => fields.includes(field)),
        "artifactContract.requiredMetadata must include workflowType, sourceSkill and generatedAt",
      ),
  })
  .strict();

export const ManifestSchema = z
  .object({
    schemaVersion: z.literal(MANIFEST_SCHEMA_VERSION),
    sourceDescriptor: SourceDescriptorSchema,
    installedModules: z.array(z.string().min(1)),
    targetIds: z.array(IdeTargetIdSchema),
    paths: z
      .object({
        projectRoot: z.literal("."),
        specliteRoot: z
          .string()
          .min(1)
          .refine(isProjectRelativePosixPath, "specliteRoot must be project-relative POSIX"),
        artifactRoot: z
          .string()
          .min(1)
          .refine(isProjectRelativePosixPath, "artifactRoot must be project-relative POSIX"),
        manifestPath: z
          .string()
          .min(1)
          .refine(isProjectRelativePosixPath, "manifestPath must be project-relative POSIX"),
        artifactRoots: z.array(ArtifactRootProjectionSchema).optional(),
      })
      .strict(),
  })
  .strict();

export const SkillIndexEntrySchema = z
  .object({
    schemaVersion: z.literal(SKILL_INDEX_SCHEMA_VERSION),
    canonicalSkillId: z.string().min(1),
    renamedFromCanonicalSkillIds: z.array(z.string().min(1)).optional(),
    moduleId: z.string().min(1),
    sourcePackagePath: z
      .string()
      .min(1)
      .refine(isProjectRelativePosixPath, "sourcePackagePath must be project-relative POSIX"),
    canonicalPackageHash: z.string().min(1),
    installedTargets: z.array(IdeTargetIdSchema),
    phaseIds: z.array(z.string().min(1)),
  })
  .strict();

export const HelpIndexEntrySchema = z
  .object({
    schemaVersion: z.literal(HELP_INDEX_SCHEMA_VERSION),
    phaseId: z.string().min(1),
    entryLabel: z.string().min(1),
    canonicalSkillId: z.string().min(1),
    activationTarget: InstalledSkillActivationTargetSchema,
    targetIds: z.array(IdeTargetIdSchema),
  })
  .strict();

export const FilesIndexEntrySchema = z
  .object({
    schemaVersion: z.literal(FILES_INDEX_SCHEMA_VERSION),
    path: z
      .string()
      .min(1)
      .refine(isProjectRelativePosixPath, "path must be project-relative POSIX"),
    ownership: z.enum(["installer-owned", "human-owned", "workflow-owned"]),
    hash: z.string().min(1),
    hashAlgorithm: z.literal("sha256"),
    executable: z.boolean(),
    artifactKind: z.string().min(1),
    sourceRef: z
      .string()
      .min(1)
      .refine(isStableSourceRef, "sourceRef must be a stable project-relative path or local reference token"),
  })
  .strict();

export const SkillIndexSchema = z
  .object({
    schemaVersion: z.literal(SKILL_INDEX_SCHEMA_VERSION),
    entries: z.array(SkillIndexEntrySchema),
  })
  .strict()
  .superRefine((index, context) => {
    const activeIds = new Set(index.entries.map((entry) => entry.canonicalSkillId));
    const oldIds = new Set<string>();
    for (const [entryIndex, entry] of index.entries.entries()) {
      for (const oldId of entry.renamedFromCanonicalSkillIds ?? []) {
        if (oldId === entry.canonicalSkillId || activeIds.has(oldId) || oldIds.has(oldId)) {
          context.addIssue({
            code: "custom",
            path: ["entries", entryIndex, "renamedFromCanonicalSkillIds"],
            message: "renamed canonical skill ids must be distinct, globally unique, and inactive",
          });
        }
        oldIds.add(oldId);
      }
    }
  });

export const HelpIndexSchema = z
  .object({
    schemaVersion: z.literal(HELP_INDEX_SCHEMA_VERSION),
    entries: z.array(HelpIndexEntrySchema),
  })
  .strict();

export const FilesIndexSchema = z
  .object({
    schemaVersion: z.literal(FILES_INDEX_SCHEMA_VERSION),
    entries: z.array(FilesIndexEntrySchema),
  })
  .strict();

export const PhaseCoverageRowSchema = z
  .object({
    schemaVersion: z.literal(PHASE_COVERAGE_SCHEMA_VERSION),
    phaseId: z.string().min(1),
    phaseLabel: z.string().min(1),
    moduleId: z.string().min(1),
    canonicalSkillId: z.string().min(1),
    ideTargets: z.array(
      z
        .object({
          targetId: IdeTargetIdSchema,
          entryPath: InstalledSkillEntryPathSchema,
          activationTarget: InstalledSkillActivationTargetSchema,
          status: InstalledPhaseCoverageStatusSchema,
        })
        .strict(),
    ),
    artifactContract: ArtifactContractSchema.optional(),
  })
  .strict();

export const PhaseCoverageSchema = z
  .object({
    schemaVersion: z.literal(PHASE_COVERAGE_SCHEMA_VERSION),
    rows: z.array(PhaseCoverageRowSchema),
  })
  .strict();

export type Manifest = z.infer<typeof ManifestSchema>;
export type ArtifactRootProjection = z.infer<typeof ArtifactRootProjectionSchema>;
export type SkillIndexEntry = z.infer<typeof SkillIndexEntrySchema>;
export type HelpIndexEntry = z.infer<typeof HelpIndexEntrySchema>;
export type FilesIndexEntry = z.infer<typeof FilesIndexEntrySchema>;
export type PhaseCoverageRow = z.infer<typeof PhaseCoverageRowSchema>;
export type ArtifactContract = z.infer<typeof ArtifactContractSchema>;
export type WorkflowArtifactMetadata = z.infer<typeof WorkflowArtifactMetadataSchema>;
export type SkillIndex = z.infer<typeof SkillIndexSchema>;
export type HelpIndex = z.infer<typeof HelpIndexSchema>;
export type FilesIndex = z.infer<typeof FilesIndexSchema>;
export type PhaseCoverage = z.infer<typeof PhaseCoverageSchema>;
