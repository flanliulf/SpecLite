import { z } from "zod";
import { SourceDescriptorSchema } from "../source/source-descriptor-schema.js";
import { ISSUE_CATEGORIES, ISSUE_SEVERITIES } from "../validation/issue-model.js";

export const COMMAND_RESULT_SCHEMA_VERSION = "speclite.command-result.v1" as const;

export const CommandIdSchema = z.enum(["install", "status", "validate", "update", "update.repair"]);

export const ValidationIssueSchema = z
  .object({
    issueId: z.string().min(1),
    category: z.enum(ISSUE_CATEGORIES),
    severity: z.enum(ISSUE_SEVERITIES),
    affectedPath: z.string().min(1).optional(),
    component: z.string().min(1).optional(),
    details: z.record(z.string(), z.unknown()).optional(),
    impact: z.string().min(1),
    suggestedNextStep: z.string().min(1),
  })
  .strict();

export const IdeTargetStatusSchema = z
  .object({
    id: z.string().min(1),
    status: z.enum(["not-configured", "configured", "partial", "failed"]),
    targetPath: z.string().min(1).optional(),
    skillCount: z.number().int().nonnegative().optional(),
  })
  .strict();

export const CommandPathSummarySchema = z
  .object({
    projectRoot: z.literal("."),
    specliteRoot: z.string().min(1).optional(),
    artifactRoot: z.string().min(1).optional(),
    manifestPath: z.string().min(1).optional(),
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

export type CommandId = z.infer<typeof CommandIdSchema>;
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export type IdeTargetStatus = z.infer<typeof IdeTargetStatusSchema>;
export type CommandPathSummary = z.infer<typeof CommandPathSummarySchema>;
export type InstallCommandData = z.infer<typeof InstallCommandDataSchema>;
export type InstallCommandResult = z.infer<typeof InstallCommandResultSchema>;

