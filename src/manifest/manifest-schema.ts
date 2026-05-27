import { z } from "zod";
import { SourceDescriptorSchema } from "../source/source-descriptor-schema.js";

export const MANIFEST_SCHEMA_VERSION = "speclite.manifest.v1" as const;
export const SKILL_INDEX_SCHEMA_VERSION = "speclite.skill-index.v1" as const;
export const HELP_INDEX_SCHEMA_VERSION = "speclite.help-index.v1" as const;
export const FILES_INDEX_SCHEMA_VERSION = "speclite.files-index.v1" as const;
export const PHASE_COVERAGE_SCHEMA_VERSION = "speclite.phase-coverage.v1" as const;

export const ManifestSchema = z
  .object({
    schemaVersion: z.literal(MANIFEST_SCHEMA_VERSION),
    sourceDescriptor: SourceDescriptorSchema,
    installedModules: z.array(z.string().min(1)),
    targetIds: z.array(z.enum(["claude", "agents"])),
    paths: z
      .object({
        projectRoot: z.literal("."),
        specliteRoot: z.string().min(1),
        artifactRoot: z.string().min(1),
        manifestPath: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const SkillIndexEntrySchema = z
  .object({
    schemaVersion: z.literal(SKILL_INDEX_SCHEMA_VERSION),
    canonicalSkillId: z.string().min(1),
    moduleId: z.string().min(1),
    sourcePackagePath: z.string().min(1),
    canonicalPackageHash: z.string().min(1),
    installedTargets: z.array(z.enum(["claude", "agents"])),
    phaseIds: z.array(z.string().min(1)),
  })
  .strict();

export const HelpIndexEntrySchema = z
  .object({
    schemaVersion: z.literal(HELP_INDEX_SCHEMA_VERSION),
    phaseId: z.string().min(1),
    entryLabel: z.string().min(1),
    canonicalSkillId: z.string().min(1),
    activationTarget: z.string().min(1),
    targetIds: z.array(z.enum(["claude", "agents"])),
  })
  .strict();

export const FilesIndexEntrySchema = z
  .object({
    schemaVersion: z.literal(FILES_INDEX_SCHEMA_VERSION),
    path: z.string().min(1),
    ownership: z.enum(["installer-owned", "human-owned", "workflow-owned"]),
    hash: z.string().min(1).optional(),
    hashAlgorithm: z.literal("sha256").optional(),
    executable: z.boolean(),
    artifactKind: z.string().min(1),
    sourceRef: z.string().min(1).optional(),
  })
  .strict();

export const SkillIndexSchema = z
  .object({
    schemaVersion: z.literal(SKILL_INDEX_SCHEMA_VERSION),
    entries: z.array(SkillIndexEntrySchema),
  })
  .strict();

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
          targetId: z.enum(["claude", "agents"]),
          entryPath: z.string().min(1),
          activationTarget: z.string().min(1),
          status: z.enum(["mapped", "unsupported", "failed"]),
        })
        .strict(),
    ),
    artifactContract: z
      .object({
        artifactType: z.string().min(1),
        defaultOutputPath: z.string().min(1),
        requiredMetadata: z.array(z.enum(["workflowType", "sourceSkill", "generatedAt"])),
      })
      .strict()
      .optional(),
  })
  .strict();

export const PhaseCoverageSchema = z
  .object({
    schemaVersion: z.literal(PHASE_COVERAGE_SCHEMA_VERSION),
    rows: z.array(PhaseCoverageRowSchema),
  })
  .strict();

export type Manifest = z.infer<typeof ManifestSchema>;
export type SkillIndexEntry = z.infer<typeof SkillIndexEntrySchema>;
export type HelpIndexEntry = z.infer<typeof HelpIndexEntrySchema>;
export type FilesIndexEntry = z.infer<typeof FilesIndexEntrySchema>;
export type PhaseCoverageRow = z.infer<typeof PhaseCoverageRowSchema>;
export type SkillIndex = z.infer<typeof SkillIndexSchema>;
export type HelpIndex = z.infer<typeof HelpIndexSchema>;
export type FilesIndex = z.infer<typeof FilesIndexSchema>;
export type PhaseCoverage = z.infer<typeof PhaseCoverageSchema>;
