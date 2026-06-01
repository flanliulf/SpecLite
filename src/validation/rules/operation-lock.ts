import type { ValidationIssue } from "../../diagnostics/command-result-schema.js";
import {
  createStaleOperationLockIssue,
  inspectProjectOperationLock,
} from "../../fs/operation-lock.js";

export type OperationLockValidationResult = {
  issues: ValidationIssue[];
  validatedPaths: string[];
};

export async function validateOperationLock(input: {
  projectRoot: string;
  now?: Date;
  staleAfterMs?: number;
}): Promise<OperationLockValidationResult> {
  const inspection = await inspectProjectOperationLock(input);
  if (inspection.state === "missing") {
    return {
      issues: [],
      validatedPaths: [],
    };
  }

  if (inspection.state === "stale") {
    return {
      issues: [createStaleOperationLockIssue()],
      validatedPaths: ["_speclite/.lock"],
    };
  }

  return {
    issues: [],
    validatedPaths: ["_speclite/.lock"],
  };
}
