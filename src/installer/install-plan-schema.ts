import { z } from "zod";
import { SourceDescriptorSchema } from "../source/source-descriptor-schema.js";

export const ExternalAccessSchema = z
  .object({
    sourceType: z.string().min(1),
    sourceValue: z.string().min(1),
    reason: z.string().min(1),
    confirmationState: z.enum(["not-required", "pending", "confirmed", "denied"]),
  })
  .strict();

export const PlannedWriteSchema = z
  .object({
    path: z.string().min(1),
    ownership: z.enum(["installer-owned", "human-owned", "workflow-owned"]),
    action: z.enum(["create", "update", "restore-canonical", "regenerate", "skip", "conflict"]),
    currentHash: z.string().min(1).optional(),
    expectedHash: z.string().min(1).optional(),
    reason: z.string().min(1).optional(),
  })
  .strict();

export const SourceResolutionPlanSchema = z
  .object({
    requestedSourceType: z.string().min(1),
    requestedSourceValue: z.string().min(1),
    externalAccesses: z.array(ExternalAccessSchema),
    requiresConfirmation: z.boolean(),
    confirmed: z.boolean(),
  })
  .strict();

export const InstallPlanTargetAdapterSchema = z
  .object({
    targetId: z.enum(["claude", "agents"]),
    targetDirectory: z.string().min(1),
    status: z.enum(["planned", "unsupported", "failed"]),
  })
  .strict();

export const InstallPlanSchema = z
  .object({
    sourceDescriptor: SourceDescriptorSchema,
    selectedModules: z.array(z.string().min(1)),
    targetAdapters: z.array(InstallPlanTargetAdapterSchema),
    externalAccesses: z.array(ExternalAccessSchema),
    plannedWrites: z.array(PlannedWriteSchema),
    requiresConfirmation: z.boolean(),
    writeAuthorized: z.boolean(),
  })
  .strict()
  .superRefine((plan, context) => {
    if (plan.writeAuthorized && plan.sourceDescriptor.trustStatus === "blocked") {
      context.addIssue({
        code: "custom",
        message: "Blocked source descriptors cannot authorize install writes.",
        path: ["sourceDescriptor", "trustStatus"],
      });
    }
  });

export type ExternalAccess = z.infer<typeof ExternalAccessSchema>;
export type PlannedWrite = z.infer<typeof PlannedWriteSchema>;
export type SourceResolutionPlan = z.infer<typeof SourceResolutionPlanSchema>;
export type InstallPlanTargetAdapter = z.infer<typeof InstallPlanTargetAdapterSchema>;
export type InstallPlan = z.infer<typeof InstallPlanSchema>;
