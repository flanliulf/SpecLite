import { z } from "zod";
import { isProjectRelativePosixPath } from "../manifest/manifest-schema.js";
import { SourceDescriptorSchema } from "../source/source-descriptor-schema.js";
import {
  findUnsafeIssueValue,
  ISSUE_CATEGORIES,
  ISSUE_SEVERITIES,
  isValidationIssueAffectedPath,
  UPDATE_REASON_CODES,
} from "../validation/issue-model.js";

export const COMMAND_RESULT_SCHEMA_VERSION = "speclite.command-result.v1" as const;

export const CommandIdSchema = z.enum(["install", "status", "validate", "update", "update.repair"]);
const OwnershipSchema = z.enum(["installer-owned", "human-owned", "workflow-owned"]);
const ConflictOwnershipSchema = z.enum(["installer-owned", "human-owned", "workflow-owned", "unknown"]);
const UpdateReasonCodeSchema = z.enum(UPDATE_REASON_CODES);

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
    requiresConfirmation: z.boolean(),
    writeAuthorized: z.boolean(),
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
export const StatusCommandResultSchema = commandResultSchema(StatusCommandDataSchema).extend({
  command: z.literal("status"),
});
export const ValidateCommandResultSchema = commandResultSchema(ValidateCommandDataSchema).extend({
  command: z.literal("validate"),
});
export const UpdateCommandResultSchema = commandResultSchema(UpdateCommandDataSchema).extend({
  command: z.literal("update"),
});
export const RepairCommandResultSchema = commandResultSchema(RepairCommandDataSchema).extend({
  command: z.literal("update.repair"),
});
export const CoveredCommandResultSchema = z.union([
  InstallCommandResultSchema,
  StatusCommandResultSchema,
  ValidateCommandResultSchema,
  UpdateCommandResultSchema,
  RepairCommandResultSchema,
]);

export type CommandId = z.infer<typeof CommandIdSchema>;
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export type IdeTargetStatus = z.infer<typeof IdeTargetStatusSchema>;
export type CommandPathSummary = z.infer<typeof CommandPathSummarySchema>;
export type StatusCommandData = z.infer<typeof StatusCommandDataSchema>;
export type InstallCommandData = z.infer<typeof InstallCommandDataSchema>;
export type ValidationIssueCounts = z.infer<typeof ValidationIssueCountsSchema>;
export type ValidateCommandData = z.infer<typeof ValidateCommandDataSchema>;
export type UpdateConflict = z.infer<typeof UpdateConflictSchema>;
export type UpdatePlanAction = z.infer<typeof UpdatePlanActionSchema>;
export type RepairPlanAction = z.infer<typeof RepairPlanActionSchema>;
export type UpdatePlan = z.infer<typeof UpdatePlanSchema>;
export type RepairPlan = z.infer<typeof RepairPlanSchema>;
export type UpdateCommandData = z.infer<typeof UpdateCommandDataSchema>;
export type RepairCommandData = z.infer<typeof RepairCommandDataSchema>;
export type InstallCommandResult = z.infer<typeof InstallCommandResultSchema>;
export type StatusCommandResult = z.infer<typeof StatusCommandResultSchema>;
export type ValidateCommandResult = z.infer<typeof ValidateCommandResultSchema>;
export type UpdateCommandResult = z.infer<typeof UpdateCommandResultSchema>;
export type RepairCommandResult = z.infer<typeof RepairCommandResultSchema>;
export type CoveredCommandResult = z.infer<typeof CoveredCommandResultSchema>;
