import type { ValidateCommandData, ValidationIssue } from "../diagnostics/command-result-schema.js";
import type { IdeTargetId } from "../ide/adapter-registry.js";
import {
  ISSUE_SEVERITIES,
  type IssueCategory,
  type IssueSeverity,
} from "./issue-model.js";
import {
  sortCheckedTargets,
  sortIssueCategories,
  sortValidatedPaths,
  sortValidationIssues,
} from "./validation-order.js";
import { validateFileIntegrity } from "./rules/file-integrity.js";
import { validateIdeMirror } from "./rules/ide-mirror.js";
import { validateManifestSchema } from "./rules/manifest-schema.js";
import { validateRuntimePaths } from "./rules/runtime-path.js";
import { validateMenuTargets } from "./rules/menu-target.js";
import { validateLegacyNamespace } from "./rules/legacy-namespace.js";
import { validateArtifactPaths } from "./artifact-paths.js";
import { validateOperationLock } from "./rules/operation-lock.js";
import { validateSourceIntegrity } from "./rules/source-integrity.js";

export type ValidateProjectResult = {
  issues: ValidationIssue[];
  data: ValidateCommandData;
};

export async function validateProject(input: { projectRoot: string }): Promise<ValidateProjectResult> {
  const manifestSchemaResult = await validateManifestSchema({ projectRoot: input.projectRoot });
  const issues: ValidationIssue[] = [...manifestSchemaResult.issues];
  const checkedCategories = new Set<IssueCategory>(["manifest-schema"]);
  const checkedTargets = new Set<IdeTargetId>(manifestSchemaResult.checkedTargets);
  const validatedPaths = new Set(manifestSchemaResult.validatedPaths);
  const manifest = manifestSchemaResult.manifest;

  if (
    manifestSchemaResult.issues.length === 0 &&
    manifest !== undefined &&
    manifestSchemaResult.skillIndex !== undefined &&
    manifestSchemaResult.helpIndex !== undefined &&
    manifestSchemaResult.filesIndex !== undefined &&
    manifestSchemaResult.phaseCoverage !== undefined
  ) {
    const ideMirrorResult = await validateIdeMirror({
      projectRoot: input.projectRoot,
      skillIndex: manifestSchemaResult.skillIndex,
    });
    issues.push(...ideMirrorResult.issues);
    checkedCategories.add("ide-mirror");
    for (const targetId of ideMirrorResult.checkedTargets) checkedTargets.add(targetId);
    for (const validatedPath of ideMirrorResult.validatedPaths) validatedPaths.add(validatedPath);

    const runtimePathResult = await validateRuntimePaths({
      projectRoot: input.projectRoot,
      manifest,
      filesIndex: manifestSchemaResult.filesIndex,
    });
    issues.push(...runtimePathResult.issues);
    checkedCategories.add("runtime-path");
    for (const validatedPath of runtimePathResult.validatedPaths) validatedPaths.add(validatedPath);

    const menuTargetIssues = validateMenuTargets({
      skillIndex: manifestSchemaResult.skillIndex,
      helpIndex: manifestSchemaResult.helpIndex,
      phaseCoverage: manifestSchemaResult.phaseCoverage,
    });
    issues.push(...menuTargetIssues);
    checkedCategories.add("menu-target");
    validatedPaths.add("_speclite/_config/help-index.json");
    validatedPaths.add("_speclite/_config/phase-coverage.json");

    const legacyNamespaceResult = await validateLegacyNamespace({
      projectRoot: input.projectRoot,
      skillIndex: manifestSchemaResult.skillIndex,
      filesIndex: manifestSchemaResult.filesIndex,
    });
    issues.push(...legacyNamespaceResult.issues);
    checkedCategories.add("legacy-namespace");
    for (const targetId of legacyNamespaceResult.checkedTargets) checkedTargets.add(targetId);
    for (const validatedPath of legacyNamespaceResult.validatedPaths) validatedPaths.add(validatedPath);

    const artifactPathResult = await validateArtifactPaths({
      projectRoot: input.projectRoot,
      configuredRoot: manifest.paths.artifactRoot,
      defaultOutputPaths: manifestSchemaResult.phaseCoverage.rows
        .map((row) => row.artifactContract)
        .filter((contract): contract is NonNullable<typeof contract> => contract !== undefined),
    });
    issues.push(...artifactPathResult.issues);
    checkedCategories.add("artifact-path");
    for (const validatedPath of artifactPathResult.validatedPaths) validatedPaths.add(validatedPath);

    const fileIntegrityResult = await validateFileIntegrity({
      projectRoot: input.projectRoot,
      filesIndex: manifestSchemaResult.filesIndex,
      artifactRoot: manifest.paths.artifactRoot,
    });
    issues.push(...fileIntegrityResult.issues);
    checkedCategories.add("file-integrity");
    for (const validatedPath of fileIntegrityResult.validatedPaths) validatedPaths.add(validatedPath);

    const sourceIntegrityResult = validateSourceIntegrity({
      manifest,
    });
    if (sourceIntegrityResult.issues.length > 0 || sourceIntegrityResult.validatedPaths.length > 0) {
      issues.push(...sourceIntegrityResult.issues);
      checkedCategories.add("source-integrity");
      for (const validatedPath of sourceIntegrityResult.validatedPaths) validatedPaths.add(validatedPath);
    }
  }

  const operationLockResult = await validateOperationLock({ projectRoot: input.projectRoot });
  if (operationLockResult.validatedPaths.length > 0 || operationLockResult.issues.length > 0) {
    issues.push(...operationLockResult.issues);
    checkedCategories.add("operation-lock");
    for (const validatedPath of operationLockResult.validatedPaths) validatedPaths.add(validatedPath);
  }

  const sortedIssues = sortValidationIssues(issues);
  return {
    issues: sortedIssues,
    data: {
      issueCounts: countIssues(sortedIssues),
      checkedCategories: sortIssueCategories(checkedCategories),
      checkedTargets: sortCheckedTargets(checkedTargets),
      validatedPaths: sortValidatedPaths(validatedPaths),
    },
  };
}

function countIssues(issues: ValidationIssue[]): ValidateCommandData["issueCounts"] {
  const counts: Record<IssueSeverity, number> = {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  };

  for (const issue of issues) {
    counts[issue.severity] += 1;
  }

  return counts;
}
