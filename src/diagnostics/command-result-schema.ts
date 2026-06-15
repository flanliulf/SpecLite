import { z } from "zod";
import { IdeTargetIdSchema, isProjectRelativePosixPath } from "../manifest/manifest-schema.js";
import { SourceDescriptorSchema } from "../source/source-descriptor-schema.js";
import { ExternalAccessSchema } from "../installer/install-plan-schema.js";
import {
  findUnsafeIssueValue,
  ISSUE_CATEGORIES,
  ISSUE_SEVERITIES,
  isValidationIssueAffectedPath,
} from "../validation/issue-model.js";

export const COMMAND_RESULT_SCHEMA_VERSION = "speclite.command-result.v1" as const;

export const CommandIdSchema = z.enum([
  "install",
  "init",
  "list",
  "status",
  "validate",
  "update",
  "update.repair",
  "doctor",
  "sync",
  "uninstall",
  "governance-report",
]);
const OwnershipSchema = z.enum(["installer-owned", "human-owned", "workflow-owned"]);
const ConflictOwnershipSchema = z.enum(["installer-owned", "human-owned", "workflow-owned", "unknown"]);
const UpdateReasonCodeSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "reason code must be stable lower-kebab text");

export const ValidationIssueSchema = z
  .object({
    issueId: z.string().min(1),
    category: z.enum(ISSUE_CATEGORIES),
    severity: z.enum(ISSUE_SEVERITIES),
    affectedPath: z
      .string()
      .min(1)
      .refine(isValidationIssueAffectedPath, "affectedPath must be project-relative POSIX or .")
      .optional(),
    component: z.string().min(1).optional(),
    details: z.record(z.string(), z.unknown()).optional(),
    impact: z.string().min(1),
    suggestedNextStep: z.string().min(1),
  })
  .strict()
  .superRefine((issue, ctx) => {
    if (!issue.issueId.startsWith(`${issue.category}.`)) {
      ctx.addIssue({
        code: "custom",
        path: ["issueId"],
        message: "issueId must use the issue category prefix",
      });
    }

    for (const [field, value] of [
      ["affectedPath", issue.affectedPath],
      ["details", issue.details],
      ["impact", issue.impact],
      ["suggestedNextStep", issue.suggestedNextStep],
    ] as const) {
      const unsafePath = findUnsafeIssueValue(value);
      if (unsafePath !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: `${field} contains redaction-unsafe value at ${unsafePath}`,
        });
      }
    }
  });

export const IdeTargetStatusSchema = z
  .object({
    id: z.string().min(1),
    status: z.enum(["not-configured", "configured", "partial", "failed"]),
    targetPath: z.string().min(1).optional(),
    skillCount: z.number().int().nonnegative().optional(),
    reason: z.string().min(1).optional(),
    affectedPath: z.string().min(1).optional(),
  })
  .strict();

export const CommandPathSummarySchema = z
  .object({
    projectRoot: z.literal("."),
    specliteRoot: z
      .string()
      .min(1)
      .refine(isProjectRelativePosixPath, "specliteRoot must be project-relative POSIX")
      .optional(),
    artifactRoot: z
      .string()
      .min(1)
      .refine(isProjectRelativePosixPath, "artifactRoot must be project-relative POSIX")
      .optional(),
    manifestPath: z
      .string()
      .min(1)
      .refine(isProjectRelativePosixPath, "manifestPath must be project-relative POSIX")
      .optional(),
  })
  .strict();

export const StatusCommandDataSchema = z
  .object({
    sourceDescriptor: SourceDescriptorSchema.optional(),
    manifestPresent: z.boolean(),
    manifestVersion: z.string().min(1).optional(),
    installedModules: z.array(z.string()),
    ideTargets: z.array(IdeTargetStatusSchema),
    highLevelHealth: z.enum(["not-configured", "configured", "partial", "failed"]),
    paths: CommandPathSummarySchema,
  })
  .strict();

export const InstallCommandDataSchema = z
  .object({
    sourceDescriptor: SourceDescriptorSchema,
    manifestVersion: z.string().min(1),
    installedModules: z.array(z.string()),
    ideTargets: z.array(IdeTargetStatusSchema),
    paths: CommandPathSummarySchema,
    completedSteps: z.array(z.string()),
    pendingSteps: z.array(z.string()),
  })
  .strict();

export const InitPlanActionSchema = z
  .object({
    affectedPath: z.string().min(1).refine(isProjectRelativePosixPath),
    ownership: ConflictOwnershipSchema,
    action: z.enum(["create", "update", "skip", "conflict"]),
    currentHash: z.string().min(1).optional(),
    expectedHash: z.string().min(1).optional(),
    reason: UpdateReasonCodeSchema.optional(),
  })
  .strict();

export const InitInstalledStateSummarySchema = z
  .object({
    manifestPresent: z.boolean(),
    ownershipIndexPresent: z.boolean(),
    configLayersRead: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    installedModules: z.array(z.string().min(1)),
    ideTargets: z.array(z.string().min(1)),
  })
  .strict();

export const InitCommandDataSchema = z
  .object({
    initPlan: z
      .object({
        actions: z.array(InitPlanActionSchema),
      })
      .strict(),
    installedState: InitInstalledStateSummarySchema,
    changedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    skippedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    conflicts: z.array(z.lazy(() => UpdateConflictSchema)),
    completedSteps: z.array(z.string().min(1)),
    failedStep: z.string().min(1).optional(),
    pendingSteps: z.array(z.string().min(1)),
    requiresConfirmation: z.boolean(),
    writeAuthorized: z.boolean(),
  })
  .strict();

export const ListModuleProjectionSchema = z
  .object({
    moduleId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    version: z.string().min(1),
    sourceDirectory: z.string().min(1).refine(isProjectRelativePosixPath),
    required: z.boolean(),
    defaultSelected: z.boolean(),
    skillCount: z.number().int().nonnegative(),
  })
  .strict();

export const ListSkillProjectionSchema = z
  .object({
    canonicalSkillId: z.string().min(1),
    moduleId: z.string().min(1),
    displayName: z.string().min(1),
    phaseIds: z.array(z.string().min(1)),
    sourcePackagePath: z.string().min(1).refine(isProjectRelativePosixPath).optional(),
    installedTargets: z.array(IdeTargetIdSchema).optional(),
  })
  .strict();

export const ListIdeTargetProjectionSchema = z
  .object({
    id: IdeTargetIdSchema,
    targetDirectory: z.string().min(1).refine(isProjectRelativePosixPath),
    targetOrder: z.number().int().nonnegative(),
  })
  .strict();

export const ListVersionProjectionSchema = z
  .object({
    name: z.string().min(1),
    version: z.string().min(1),
  })
  .strict();

export const ListInstalledStateSummarySchema = z
  .object({
    manifestPresent: z.boolean(),
    installedModules: z.array(z.string().min(1)),
    installedSkillCount: z.number().int().nonnegative(),
  })
  .strict();

export const ListCommandDataSchema = z
  .object({
    modules: z.array(ListModuleProjectionSchema),
    skills: z.array(ListSkillProjectionSchema),
    ideTargets: z.array(ListIdeTargetProjectionSchema),
    versions: z.array(ListVersionProjectionSchema),
    installedState: ListInstalledStateSummarySchema,
  })
  .strict();

export const ValidationIssueCountsSchema = z
  .object({
    info: z.number().int().nonnegative(),
    warning: z.number().int().nonnegative(),
    error: z.number().int().nonnegative(),
    critical: z.number().int().nonnegative(),
  })
  .strict();

export const ValidateCommandDataSchema = z
  .object({
    issueCounts: ValidationIssueCountsSchema,
    checkedCategories: z.array(z.enum(ISSUE_CATEGORIES)),
    checkedTargets: z.array(z.string().min(1)),
    validatedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
  })
  .strict();

export const DoctorCommandDataSchema = ValidateCommandDataSchema.extend({
  externalAccesses: z.array(ExternalAccessSchema),
}).strict();

export const UpdateConflictSchema = z
  .object({
    affectedPath: z.string().min(1).refine(isProjectRelativePosixPath),
    ownership: ConflictOwnershipSchema,
    currentHash: z.string().min(1).optional(),
    expectedHash: z.string().min(1).optional(),
    reason: UpdateReasonCodeSchema,
  })
  .strict();

export const UpdatePlanActionSchema = z
  .object({
    affectedPath: z.string().min(1).refine(isProjectRelativePosixPath),
    ownership: OwnershipSchema,
    action: z.enum(["create", "update", "skip", "conflict"]),
    currentHash: z.string().min(1).optional(),
    expectedHash: z.string().min(1).optional(),
    reason: UpdateReasonCodeSchema.optional(),
  })
  .strict()
  .superRefine((action, ctx) => {
    if (action.action === "skip" && action.reason === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "skip actions must include a producer reason code",
      });
    }
    if (action.action !== "skip" && action.reason !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "non-skip update actions must omit reason",
      });
    }
  });

export const RepairPlanActionSchema = z
  .object({
    affectedPath: z.string().min(1).refine(isProjectRelativePosixPath),
    ownership: z.literal("installer-owned"),
    currentHash: z.string().min(1).optional(),
    expectedHash: z.string().min(1),
    action: z.enum(["restore-canonical", "regenerate", "skip"]),
    reason: UpdateReasonCodeSchema.optional(),
  })
  .strict()
  .superRefine((action, ctx) => {
    if (action.action === "skip" && action.reason === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "skip actions must include a producer reason code",
      });
    }
    if (action.action !== "skip" && action.reason !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "non-skip repair actions must omit reason",
      });
    }
  });

export const UpdatePlanSchema = z
  .object({
    actions: z.array(UpdatePlanActionSchema),
  })
  .strict();

export const RepairPlanSchema = z
  .object({
    actions: z.array(RepairPlanActionSchema),
  })
  .strict();

export const UpdateCommandDataSchema = z
  .object({
    updatePlan: UpdatePlanSchema,
    changedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    skippedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    conflicts: z.array(UpdateConflictSchema),
    completedSteps: z.array(z.string().min(1)).optional(),
    failedStep: z.string().min(1).optional(),
    pendingSteps: z.array(z.string().min(1)).optional(),
    requiresConfirmation: z.boolean(),
    writeAuthorized: z.boolean(),
  })
  .strict();

export const SyncPlanSchema = z
  .object({
    actions: z.array(UpdatePlanActionSchema),
  })
  .strict();

export const SyncCommandDataSchema = z
  .object({
    syncPlan: SyncPlanSchema,
    changedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    skippedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    conflicts: z.array(UpdateConflictSchema),
    completedSteps: z.array(z.string().min(1)).optional(),
    failedStep: z.string().min(1).optional(),
    pendingSteps: z.array(z.string().min(1)).optional(),
    requiresConfirmation: z.boolean(),
    writeAuthorized: z.boolean(),
  })
  .strict();

export const UninstallPlanActionSchema = z
  .object({
    affectedPath: z.string().min(1).refine(isProjectRelativePosixPath),
    ownership: ConflictOwnershipSchema,
    action: z.enum(["remove", "preserve", "manual-action", "skip"]),
    currentHash: z.string().min(1).optional(),
    reason: UpdateReasonCodeSchema.optional(),
  })
  .strict()
  .superRefine((action, ctx) => {
    if ((action.action === "preserve" || action.action === "manual-action" || action.action === "skip") && action.reason === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "non-remove uninstall actions must include a producer reason code",
      });
    }
    if (action.action === "remove" && action.reason !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "remove uninstall actions must omit reason",
      });
    }
  });

export const UninstallPlanSchema = z
  .object({
    actions: z.array(UninstallPlanActionSchema),
  })
  .strict();

export const UninstallCommandDataSchema = z
  .object({
    uninstallPlan: UninstallPlanSchema,
    removedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    preservedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    completedSteps: z.array(z.string().min(1)).optional(),
    failedStep: z.string().min(1).optional(),
    pendingSteps: z.array(z.string().min(1)).optional(),
    requiresConfirmation: z.boolean(),
    writeAuthorized: z.boolean(),
  })
  .strict();

export const RatioMetricSchema = z
  .object({
    covered: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
    rate: z.number().min(0).max(1),
  })
  .strict();

export const GovernanceReportMetricsSchema = z
  .object({
    phaseEntryCoverage: RatioMetricSchema,
    artifactPresenceRate: RatioMetricSchema,
    validatePassRate: RatioMetricSchema,
    openGapCount: z.number().int().nonnegative(),
  })
  .strict();

export const GovernancePhaseGapSchema = z
  .object({
    phaseId: z.string().min(1),
    phaseLabel: z.string().min(1),
    moduleId: z.string().min(1),
    canonicalSkillId: z.string().min(1),
    targetId: z.string().min(1),
    missingReason: z.enum(["missing-target-entry", "unsupported-target", "failed-target"]),
  })
  .strict();

export const GovernanceArtifactCheckSchema = z
  .object({
    artifactType: z.string().min(1),
    defaultOutputPath: z.string().min(1).refine(isProjectRelativePosixPath),
    present: z.boolean(),
    valid: z.boolean(),
    artifactPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    issueIds: z.array(z.string().min(1)),
  })
  .strict();

export const GovernanceReportDataSchema = z
  .object({
    metrics: GovernanceReportMetricsSchema,
    phaseGaps: z.array(GovernancePhaseGapSchema),
    artifactChecks: z.array(GovernanceArtifactCheckSchema),
    validateIssueCounts: ValidationIssueCountsSchema,
    checkedCategories: z.array(z.enum(ISSUE_CATEGORIES)),
    validatedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    scope: z
      .object({
        manifestPath: z.string().min(1).refine(isProjectRelativePosixPath),
        phaseCoveragePath: z.string().min(1).refine(isProjectRelativePosixPath),
        artifactRoot: z.string().min(1).refine(isProjectRelativePosixPath),
      })
      .strict(),
  })
  .strict();

export const RepairCommandDataSchema = z
  .object({
    repairPlan: RepairPlanSchema,
    changedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    skippedPaths: z.array(z.string().min(1).refine(isProjectRelativePosixPath)),
    conflicts: z.array(UpdateConflictSchema),
    requiresConfirmation: z.boolean(),
    writeAuthorized: z.boolean(),
  })
  .strict();

export const commandResultSchema = <TDataSchema extends z.ZodType>(dataSchema: TDataSchema) =>
  z
    .object({
      schemaVersion: z.literal(COMMAND_RESULT_SCHEMA_VERSION),
      status: z.enum(["success", "warning", "failure"]),
      command: CommandIdSchema,
      targetProject: z.string().min(1),
      summary: z.string().min(1),
      issues: z.array(ValidationIssueSchema),
      nextActions: z.array(z.string()),
      data: dataSchema,
    })
    .strict();

export const InstallCommandResultSchema = commandResultSchema(InstallCommandDataSchema).extend({
  command: z.literal("install"),
});
export const InitCommandResultSchema = commandResultSchema(InitCommandDataSchema).extend({
  command: z.literal("init"),
});
export const ListCommandResultSchema = commandResultSchema(ListCommandDataSchema).extend({
  command: z.literal("list"),
});
export const StatusCommandResultSchema = commandResultSchema(StatusCommandDataSchema).extend({
  command: z.literal("status"),
});
export const ValidateCommandResultSchema = commandResultSchema(ValidateCommandDataSchema).extend({
  command: z.literal("validate"),
});
export const DoctorCommandResultSchema = commandResultSchema(DoctorCommandDataSchema).extend({
  command: z.literal("doctor"),
});
export const UpdateCommandResultSchema = commandResultSchema(UpdateCommandDataSchema).extend({
  command: z.literal("update"),
});
export const RepairCommandResultSchema = commandResultSchema(RepairCommandDataSchema).extend({
  command: z.literal("update.repair"),
});
export const SyncCommandResultSchema = commandResultSchema(SyncCommandDataSchema).extend({
  command: z.literal("sync"),
});
export const UninstallCommandResultSchema = commandResultSchema(UninstallCommandDataSchema).extend({
  command: z.literal("uninstall"),
});
export const GovernanceReportCommandResultSchema = commandResultSchema(GovernanceReportDataSchema).extend({
  command: z.literal("governance-report"),
});
export const CoveredCommandResultSchema = z.union([
  InstallCommandResultSchema,
  InitCommandResultSchema,
  ListCommandResultSchema,
  StatusCommandResultSchema,
  ValidateCommandResultSchema,
  DoctorCommandResultSchema,
  UpdateCommandResultSchema,
  RepairCommandResultSchema,
  SyncCommandResultSchema,
  UninstallCommandResultSchema,
  GovernanceReportCommandResultSchema,
]);

export type CommandId = z.infer<typeof CommandIdSchema>;
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export type IdeTargetStatus = z.infer<typeof IdeTargetStatusSchema>;
export type CommandPathSummary = z.infer<typeof CommandPathSummarySchema>;
export type StatusCommandData = z.infer<typeof StatusCommandDataSchema>;
export type InstallCommandData = z.infer<typeof InstallCommandDataSchema>;
export type InitPlanAction = z.infer<typeof InitPlanActionSchema>;
export type InitCommandData = z.infer<typeof InitCommandDataSchema>;
export type ListCommandData = z.infer<typeof ListCommandDataSchema>;
export type ValidationIssueCounts = z.infer<typeof ValidationIssueCountsSchema>;
export type ValidateCommandData = z.infer<typeof ValidateCommandDataSchema>;
export type DoctorCommandData = z.infer<typeof DoctorCommandDataSchema>;
export type UpdateConflict = z.infer<typeof UpdateConflictSchema>;
export type UpdatePlanAction = z.infer<typeof UpdatePlanActionSchema>;
export type RepairPlanAction = z.infer<typeof RepairPlanActionSchema>;
export type SyncPlan = z.infer<typeof SyncPlanSchema>;
export type UninstallPlanAction = z.infer<typeof UninstallPlanActionSchema>;
export type UninstallPlan = z.infer<typeof UninstallPlanSchema>;
export type RatioMetric = z.infer<typeof RatioMetricSchema>;
export type GovernanceReportMetrics = z.infer<typeof GovernanceReportMetricsSchema>;
export type GovernancePhaseGap = z.infer<typeof GovernancePhaseGapSchema>;
export type GovernanceArtifactCheck = z.infer<typeof GovernanceArtifactCheckSchema>;
export type GovernanceReportData = z.infer<typeof GovernanceReportDataSchema>;
export type UpdatePlan = z.infer<typeof UpdatePlanSchema>;
export type RepairPlan = z.infer<typeof RepairPlanSchema>;
export type UpdateCommandData = z.infer<typeof UpdateCommandDataSchema>;
export type RepairCommandData = z.infer<typeof RepairCommandDataSchema>;
export type SyncCommandData = z.infer<typeof SyncCommandDataSchema>;
export type UninstallCommandData = z.infer<typeof UninstallCommandDataSchema>;
export type InstallCommandResult = z.infer<typeof InstallCommandResultSchema>;
export type StatusCommandResult = z.infer<typeof StatusCommandResultSchema>;
export type ValidateCommandResult = z.infer<typeof ValidateCommandResultSchema>;
export type DoctorCommandResult = z.infer<typeof DoctorCommandResultSchema>;
export type UpdateCommandResult = z.infer<typeof UpdateCommandResultSchema>;
export type RepairCommandResult = z.infer<typeof RepairCommandResultSchema>;
export type SyncCommandResult = z.infer<typeof SyncCommandResultSchema>;
export type UninstallCommandResult = z.infer<typeof UninstallCommandResultSchema>;
export type GovernanceReportCommandResult = z.infer<typeof GovernanceReportCommandResultSchema>;
export type InitCommandResult = z.infer<typeof InitCommandResultSchema>;
export type ListCommandResult = z.infer<typeof ListCommandResultSchema>;
export type CoveredCommandResult = z.infer<typeof CoveredCommandResultSchema>;
