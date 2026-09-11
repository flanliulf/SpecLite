import { access, lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type {
  CommandPathSummary,
  IdeTargetStatus,
  ValidationIssue,
} from "../diagnostics/command-result-schema.js";
import { CANONICAL_TARGET_ORDER, type IdeTargetId } from "../ide/adapter-registry.js";
import { ARTIFACT_ROOT_REGISTRY } from "../config/artifact-root-resolver.js";
import {
  FilesIndexSchema,
  HelpIndexSchema,
  ManifestSchema,
  PhaseCoverageSchema,
  SkillIndexSchema,
  type ArtifactRootProjection,
  type HelpIndex,
  type Manifest,
  type PhaseCoverage,
  type SkillIndex,
} from "../manifest/manifest-schema.js";
import type { OfficialModule } from "../modules/module-metadata.js";
import { SourceDescriptorSchema, type SourceDescriptor } from "../source/source-descriptor-schema.js";
import { validateMenuTargets } from "../validation/rules/menu-target.js";
import type { InstallLifecycleStepId } from "./progress-events.js";

export type ReadyCheckResult =
  | {
      ok: true;
      manifestVersion: string;
      installedModules: string[];
      ideTargets: IdeTargetStatus[];
      paths: ReadyPathSummary;
      completedSteps: InstallLifecycleStepId[];
      pendingSteps: InstallLifecycleStepId[];
    }
  | {
      ok: false;
      issue: ValidationIssue;
      completedSteps: InstallLifecycleStepId[];
      pendingSteps: InstallLifecycleStepId[];
    };

type ReadyPathSummary = {
  projectRoot: ".";
  specliteRoot: string;
  artifactRoot: string;
  manifestPath: string;
  artifactRoots?: ArtifactRootProjection[];
};

const ARTIFACT_ROOT_PROJECTION_FIELDS = ARTIFACT_ROOT_REGISTRY.map((definition) => definition.field);
const ARTIFACT_ROOT_PROJECTION_COMPARISON_KEYS = [
  "field",
  "configPath",
  "placeholder",
  "resolvedRoot",
  "resolutionMode",
  "plane",
  "ownership",
  "contractRefs",
] as const satisfies readonly (keyof ArtifactRootProjection)[];

export async function runReadyCheck(input: {
  projectRoot: string;
  sourceDescriptor: SourceDescriptor;
  installedModules: string[];
  selectedModules?: OfficialModule[];
  ideTargets: IdeTargetStatus[];
  paths: CommandPathSummary;
  blockingIssues?: ValidationIssue[];
  failedRequiredSteps?: string[];
}): Promise<ReadyCheckResult> {
  const blockingIssue = input.blockingIssues?.find((issue) =>
    issue.severity === "error" || issue.severity === "critical"
  );
  if (blockingIssue !== undefined) return createReadyCheckFailure(blockingIssue);

  if ((input.failedRequiredSteps ?? []).length > 0) {
    return createReadyCheckFailure({
      issueId: "operation-lock.required-step-failed",
      category: "operation-lock",
      severity: "error",
      component: "ReadyCheck",
      details: {
        failedRequiredSteps: input.failedRequiredSteps,
      },
      impact: "ReadyCheck cannot run while a required install lifecycle step failed.",
      suggestedNextStep: "Resolve the failed install step and rerun speclite install --yes.",
    });
  }

  const paths = normalizeReadyPaths(input.paths);
  if (paths === undefined) {
    return createReadyCheckFailure(createMissingRuntimePathIssue("install-data.paths"));
  }

  const sourceDescriptor = SourceDescriptorSchema.safeParse(input.sourceDescriptor);
  if (!sourceDescriptor.success) {
    return createReadyCheckFailure({
      issueId: "source-integrity.unsupported-source",
      category: "source-integrity",
      severity: "error",
      component: "ReadyCheck",
      impact: "Install source descriptor projection is missing or invalid.",
      suggestedNextStep: "Rerun speclite install after restoring source descriptor metadata.",
    });
  }

  const manifestResult = await readManifest(projectRootPath(input.projectRoot, paths.manifestPath));
  if (!manifestResult.ok) return createReadyCheckFailure(manifestResult.issue);

  const manifest = manifestResult.manifest;
  const artifactRootsIssue = validateArtifactRootProjectionReconciliation({
    expectedArtifactRoots: paths.artifactRoots,
    manifestArtifactRoots: manifest.paths.artifactRoots,
  });
  if (artifactRootsIssue !== undefined) return createReadyCheckFailure(artifactRootsIssue);

  const indexesResult = await readRequiredIndexes(input.projectRoot);
  if (!indexesResult.ok) return createReadyCheckFailure(indexesResult.issue);
  const menuTargetIssues = validateMenuTargets({
    skillIndex: indexesResult.skillIndex,
    helpIndex: indexesResult.helpIndex,
    phaseCoverage: indexesResult.phaseCoverage,
  });
  const blockingMenuTargetIssue = menuTargetIssues.find((issue) =>
    issue.severity === "error" || issue.severity === "critical"
  );
  if (blockingMenuTargetIssue !== undefined) {
    return createReadyCheckFailure(blockingMenuTargetIssue);
  }

  const expectedSkillEntries = createExpectedSkillEntries({
    installedModules: input.installedModules,
    selectedModules: input.selectedModules ?? [],
  });
  const expectedSkillIssue = validateExpectedSkillEntries({
    expectedSkillEntries,
    skillIndex: indexesResult.skillIndex,
  });
  if (expectedSkillIssue !== undefined) {
    return createReadyCheckFailure(expectedSkillIssue);
  }

  const readyPaths: ReadyPathSummary = {
    ...paths,
    ...(manifest.paths.artifactRoots === undefined
      ? {}
      : { artifactRoots: manifest.paths.artifactRoots }),
  };
  const runtimePaths = [
    readyPaths.specliteRoot,
    "_speclite/_config",
    readyPaths.artifactRoot,
    readyPaths.manifestPath,
    ...(readyPaths.artifactRoots ?? []).map((root) => root.resolvedRoot),
  ];
  for (const runtimePath of runtimePaths) {
    if (!(await pathExists(projectRootPath(input.projectRoot, runtimePath)))) {
      return createReadyCheckFailure(createMissingRuntimePathIssue(runtimePath));
    }
  }

  if (!SourceDescriptorSchema.safeParse(manifest.sourceDescriptor).success) {
    return createReadyCheckFailure({
      issueId: "source-integrity.unsupported-source",
      category: "source-integrity",
      severity: "error",
      affectedPath: paths.manifestPath,
      component: "ReadyCheck",
      impact: "Installed manifest source descriptor projection is invalid.",
      suggestedNextStep: "Regenerate the installed manifest from a valid install source descriptor.",
    });
  }

  for (const moduleId of input.installedModules) {
    if (!indexesResult.skillIndex.entries.some((entry) => entry.moduleId === moduleId)) {
      return createReadyCheckFailure({
        issueId: "source-integrity.unsupported-source",
        category: "source-integrity",
        severity: "error",
        component: "ReadyCheck",
        details: {
          missingModuleId: moduleId,
        },
        impact: "A selected installed module has no canonical package evidence in skill-index.json.",
        suggestedNextStep: "Restore bundled canonical SKILL.md packages and rerun speclite install --yes.",
      });
    }
  }

  const orderedTargets = CANONICAL_TARGET_ORDER.filter((targetId) =>
    input.ideTargets.some((target) => target.id === targetId),
  );
  for (const targetId of orderedTargets) {
    const target = input.ideTargets.find((candidate) => candidate.id === targetId);
    if (target?.targetPath === undefined || target.status !== "configured") {
      return createReadyCheckFailure(createMissingIdeMirrorIssue(targetId, target?.targetPath));
    }

    const indexedTargetSkillCount = indexesResult.skillIndex.entries.filter((skill) =>
      skill.installedTargets.includes(targetId),
    ).length;
    if (target.skillCount !== undefined && target.skillCount !== indexedTargetSkillCount) {
      return createReadyCheckFailure(createTargetSkillCountIssue({
        targetId,
        targetPath: target.targetPath,
        reportedSkillCount: target.skillCount,
        indexedSkillCount: indexedTargetSkillCount,
      }));
    }

    for (const entry of indexesResult.skillIndex.entries.filter((skill) =>
      skill.installedTargets.includes(targetId),
    )) {
      const skillEntryPath = `${target.targetPath}/${entry.canonicalSkillId}/SKILL.md`;
      if (!(await pathExists(projectRootPath(input.projectRoot, skillEntryPath)))) {
        return createReadyCheckFailure(createMissingIdeMirrorIssue(targetId, skillEntryPath));
      }
    }

    for (const expectedEntry of expectedSkillEntries) {
      const indexedEntry = indexesResult.skillIndex.entries.find((entry) =>
        entry.moduleId === expectedEntry.moduleId &&
        entry.canonicalSkillId === expectedEntry.canonicalSkillId
      );
      if (indexedEntry !== undefined && !indexedEntry.installedTargets.includes(targetId)) {
        return createReadyCheckFailure(createMissingIdeMirrorIssue(
          targetId,
          `${target.targetPath}/${expectedEntry.canonicalSkillId}/SKILL.md`,
          {
            missingModuleId: expectedEntry.moduleId,
            missingCanonicalSkillId: expectedEntry.canonicalSkillId,
            reason: "selected-package-root-not-installed-for-target",
          },
        ));
      }
    }
  }

  return {
    ok: true,
    manifestVersion: manifest.schemaVersion,
    installedModules: manifest.installedModules,
    ideTargets: orderIdeTargets(input.ideTargets),
    paths: readyPaths,
    completedSteps: ["ready-check"],
    pendingSteps: ["ready-summary"],
  };
}

type ExpectedSkillEntry = {
  moduleId: string;
  canonicalSkillId: string;
};

function createExpectedSkillEntries(input: {
  installedModules: string[];
  selectedModules: OfficialModule[];
}): ExpectedSkillEntry[] {
  const installedModuleIds = new Set(input.installedModules);
  return input.selectedModules
    .filter((module) => installedModuleIds.has(module.code))
    .flatMap((module) =>
      module.packageRoots.map((packageRoot) => ({
        moduleId: module.code,
        canonicalSkillId: path.posix.basename(packageRoot),
      })),
    )
    .sort((left, right) =>
      `${left.moduleId}:${left.canonicalSkillId}`.localeCompare(
        `${right.moduleId}:${right.canonicalSkillId}`,
      ),
    );
}

function validateExpectedSkillEntries(input: {
  expectedSkillEntries: ExpectedSkillEntry[];
  skillIndex: SkillIndex;
}): ValidationIssue | undefined {
  if (input.expectedSkillEntries.length === 0) return undefined;

  const installedKeys = new Set(
    input.skillIndex.entries.map((entry) => `${entry.moduleId}:${entry.canonicalSkillId}`),
  );
  const missing = input.expectedSkillEntries.find((entry) =>
    !installedKeys.has(`${entry.moduleId}:${entry.canonicalSkillId}`),
  );
  if (missing === undefined) return undefined;

  return createMissingSkillIndexEntryIssue(missing);
}

function normalizeReadyPaths(paths: CommandPathSummary): ReadyPathSummary | undefined {
  if (
    paths.specliteRoot === undefined ||
    paths.artifactRoot === undefined ||
    paths.manifestPath === undefined
  ) {
    return undefined;
  }

  return {
    projectRoot: ".",
    specliteRoot: paths.specliteRoot,
    artifactRoot: paths.artifactRoot,
    manifestPath: paths.manifestPath,
    ...(paths.artifactRoots === undefined ? {} : { artifactRoots: paths.artifactRoots }),
  };
}

async function readManifest(
  absolutePath: string,
): Promise<{ ok: true; manifest: Manifest } | { ok: false; issue: ValidationIssue }> {
  try {
    const raw = await readFile(absolutePath, "utf8");
    const parsed = ManifestSchema.safeParse(parseYaml(raw));
    if (!parsed.success) {
      const artifactRootsIssue = createArtifactRootsSchemaIssue(parsed.error.issues);
      if (artifactRootsIssue !== undefined) {
        return {
          ok: false,
          issue: artifactRootsIssue,
        };
      }

      return {
        ok: false,
        issue: {
          issueId: "manifest-schema.unsupported-version",
          category: "manifest-schema",
          severity: "error",
          affectedPath: "_speclite/_config/manifest.yaml",
          component: "ReadyCheck",
          impact: "Installed manifest is readable but does not match the supported schema.",
          suggestedNextStep: "Regenerate the installed manifest with a supported SpecLite version.",
        },
      };
    }

    return { ok: true, manifest: parsed.data };
  } catch {
    return {
      ok: false,
      issue: {
        issueId: "manifest-schema.unreadable",
        category: "manifest-schema",
        severity: "error",
        affectedPath: "_speclite/_config/manifest.yaml",
        component: "ReadyCheck",
        impact: "Installed manifest is missing or unreadable.",
        suggestedNextStep: "Rerun speclite install --yes after restoring _speclite/_config.",
      },
    };
  }
}

function validateArtifactRootProjectionReconciliation(input: {
  expectedArtifactRoots: ArtifactRootProjection[] | undefined;
  manifestArtifactRoots: ArtifactRootProjection[] | undefined;
}): ValidationIssue | undefined {
  if (input.expectedArtifactRoots !== undefined && input.manifestArtifactRoots === undefined) {
    return createArtifactRootsMalformedIssue({
      reason: "missing-fresh-projection",
      expectedCount: input.expectedArtifactRoots.length,
      actualCount: 0,
    });
  }

  if (input.manifestArtifactRoots === undefined) return undefined;

  const manifestShapeIssue = validateArtifactRootProjectionShape(
    input.manifestArtifactRoots,
    "manifest",
  );
  if (manifestShapeIssue !== undefined) return manifestShapeIssue;

  if (input.expectedArtifactRoots === undefined) return undefined;

  const expectedShapeIssue = validateArtifactRootProjectionShape(
    input.expectedArtifactRoots,
    "expected",
  );
  if (expectedShapeIssue !== undefined) return expectedShapeIssue;

  for (let index = 0; index < input.expectedArtifactRoots.length; index += 1) {
    const expectedRoot = input.expectedArtifactRoots[index];
    const manifestRoot = input.manifestArtifactRoots[index];
    if (expectedRoot === undefined || manifestRoot === undefined) {
      return createArtifactRootsMalformedIssue({
        reason: "artifact-roots-count-mismatch",
        expectedCount: input.expectedArtifactRoots.length,
        actualCount: input.manifestArtifactRoots.length,
      });
    }

    const mismatchedFields = ARTIFACT_ROOT_PROJECTION_COMPARISON_KEYS.filter((field) =>
      !artifactRootProjectionValueEqual(expectedRoot[field], manifestRoot[field]),
    );
    if (mismatchedFields.length > 0) {
      return createArtifactRootsMalformedIssue({
        reason: "artifact-root-entry-mismatch",
        index,
        artifactRootField: expectedRoot.field,
        mismatchedFields,
      });
    }
  }

  return undefined;
}

function validateArtifactRootProjectionShape(
  artifactRoots: readonly ArtifactRootProjection[],
  projection: "expected" | "manifest",
): ValidationIssue | undefined {
  if (artifactRoots.length !== ARTIFACT_ROOT_PROJECTION_FIELDS.length) {
    return createArtifactRootsMalformedIssue({
      reason: "artifact-roots-count-mismatch",
      projection,
      expectedCount: ARTIFACT_ROOT_PROJECTION_FIELDS.length,
      actualCount: artifactRoots.length,
    });
  }

  const uniqueFields = new Set(artifactRoots.map((artifactRoot) => artifactRoot.field));
  const seenFields = new Set<string>();
  for (const artifactRoot of artifactRoots) {
    if (seenFields.has(artifactRoot.field)) {
      return createArtifactRootsMalformedIssue({
        reason: "duplicate-artifact-root-field",
        projection,
        duplicateField: artifactRoot.field,
        actualCount: artifactRoots.length,
        uniqueCount: uniqueFields.size,
      });
    }
    seenFields.add(artifactRoot.field);
  }

  for (let index = 0; index < ARTIFACT_ROOT_PROJECTION_FIELDS.length; index += 1) {
    const expectedField = ARTIFACT_ROOT_PROJECTION_FIELDS[index];
    const artifactRoot = artifactRoots[index];
    if (expectedField === undefined || artifactRoot === undefined) continue;
    if (artifactRoot.field !== expectedField) {
      return createArtifactRootsMalformedIssue({
        reason: "artifact-roots-order-mismatch",
        projection,
        index,
        expectedField,
        actualField: artifactRoot.field,
      });
    }
  }

  return undefined;
}

function createArtifactRootsSchemaIssue(
  schemaIssues: Array<{ path: PropertyKey[] }>,
): ValidationIssue | undefined {
  const artifactRootsIssue = schemaIssues.find((issue) =>
    issue.path[0] === "paths" && issue.path[1] === "artifactRoots"
  );
  if (artifactRootsIssue === undefined) return undefined;

  return createArtifactRootsMalformedIssue({
    reason: "invalid-field",
    invalidFieldPath: artifactRootsIssue.path.map(String).join("."),
    issueCount: schemaIssues.length,
  });
}

function artifactRootProjectionValueEqual(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    return left.every((value, index) => value === right[index]);
  }

  return left === right;
}

function createArtifactRootsMalformedIssue(details: Record<string, unknown>): ValidationIssue {
  return {
    issueId: "manifest-schema.malformed-field",
    category: "manifest-schema",
    severity: "error",
    affectedPath: "_speclite/_config/manifest.yaml",
    component: "ReadyCheck",
    details: {
      field: "paths.artifactRoots",
      ...details,
    },
    impact: "Installed manifest artifact root projection does not match the install path projection.",
    suggestedNextStep: "Regenerate the installed manifest and artifact root directories by rerunning speclite install --yes.",
  };
}

async function readRequiredIndexes(
  projectRoot: string,
): Promise<
  | { ok: true; skillIndex: SkillIndex; helpIndex: HelpIndex; phaseCoverage: PhaseCoverage }
  | { ok: false; issue: ValidationIssue }
> {
  const indexes = [
    {
      path: "_speclite/_config/skill-index.json",
      schema: SkillIndexSchema,
      label: "skill-index.json",
    },
    {
      path: "_speclite/_config/help-index.json",
      schema: HelpIndexSchema,
      label: "help-index.json",
    },
    {
      path: "_speclite/_config/files-index.json",
      schema: FilesIndexSchema,
      label: "files-index.json",
    },
    {
      path: "_speclite/_config/phase-coverage.json",
      schema: PhaseCoverageSchema,
      label: "phase-coverage.json",
    },
  ] as const;

  let skillIndex: SkillIndex | undefined;
  let helpIndex: HelpIndex | undefined;
  let phaseCoverage: PhaseCoverage | undefined;
  for (const index of indexes) {
    try {
      const raw = JSON.parse(await readFile(projectRootPath(projectRoot, index.path), "utf8"));
      const parsed = index.schema.safeParse(raw);
      if (!parsed.success) {
        return {
          ok: false,
          issue: createInvalidIndexIssue(index.path, index.label, parsed.error.issues),
        };
      }

      if (index.path.endsWith("skill-index.json")) {
        skillIndex = parsed.data as SkillIndex;
      } else if (index.path.endsWith("help-index.json")) {
        helpIndex = parsed.data as HelpIndex;
      } else if (index.path.endsWith("phase-coverage.json")) {
        phaseCoverage = parsed.data as PhaseCoverage;
      }
    } catch {
      return {
        ok: false,
        issue: createInvalidIndexIssue(index.path, index.label),
      };
    }
  }

  return {
    ok: true,
    skillIndex: skillIndex ?? { schemaVersion: "speclite.skill-index.v1", entries: [] },
    helpIndex: helpIndex ?? { schemaVersion: "speclite.help-index.v1", entries: [] },
    phaseCoverage: phaseCoverage ?? { schemaVersion: "speclite.phase-coverage.v1", rows: [] },
  };
}

function createInvalidIndexIssue(
  affectedPath: string,
  label: string,
  schemaIssues?: Array<{ path: PropertyKey[] }>,
): ValidationIssue {
  const menuTargetIssue = createMenuTargetIndexIssue(affectedPath, schemaIssues ?? []);
  if (menuTargetIssue !== undefined) return menuTargetIssue;

  return {
    issueId: "manifest-schema.unreadable",
    category: "manifest-schema",
    severity: "error",
    affectedPath,
    component: "ReadyCheck",
    impact: `Required installed-state index ${label} is missing, unreadable or schema-invalid.`,
    suggestedNextStep: "Regenerate installed-state indexes by rerunning speclite install --yes.",
  };
}

function createMenuTargetIndexIssue(
  affectedPath: string,
  schemaIssues: Array<{ path: PropertyKey[] }>,
): ValidationIssue | undefined {
  if (!affectedPath.endsWith("help-index.json") && !affectedPath.endsWith("phase-coverage.json")) {
    return undefined;
  }

  const semanticFields = new Set(["activationTarget", "entryPath", "targetId", "targetIds", "status"]);
  const semanticIssue = schemaIssues.find((issue) =>
    issue.path.some((segment) => semanticFields.has(String(segment))),
  );
  if (semanticIssue === undefined) return undefined;

  const statusIssue = semanticIssue.path.some((segment) => String(segment) === "status");
  return {
    issueId: statusIssue ? "menu-target.no-mapped-target" : "menu-target.missing-target",
    category: "menu-target",
    severity: "error",
    affectedPath,
    component: "ReadyCheck",
    details: {
      invalidFieldPath: semanticIssue.path.map(String).join("."),
      reason: statusIssue ? "invalid-coverage-status" : "invalid-installed-target-reference",
    },
    impact: statusIssue
      ? "A phase coverage entry has an invalid target mapping status."
      : "An installed-state menu target entry does not point to a valid installed target reference.",
    suggestedNextStep: "Regenerate help-index.json and phase-coverage.json from installed skill target metadata.",
  };
}

function createMissingRuntimePathIssue(affectedPath: string): ValidationIssue {
  return {
    issueId: "runtime-path.missing-required-path",
    category: "runtime-path",
    severity: "error",
    affectedPath,
    component: "ReadyCheck",
    impact: "A required local runtime path for installed-state readiness is missing.",
    suggestedNextStep: "Restore the required runtime path or rerun speclite install --yes.",
  };
}

function createMissingIdeMirrorIssue(
  targetId: IdeTargetId,
  affectedPath: string | undefined,
  details?: Record<string, unknown>,
): ValidationIssue {
  return {
    issueId: "ide-mirror.missing-entry",
    category: "ide-mirror",
    severity: "error",
    ...(affectedPath === undefined ? {} : { affectedPath }),
    component: `ReadyCheck:${targetId}`,
    ...(details === undefined ? {} : { details }),
    impact: "A selected IDE mirror target is missing a required installed skill entry.",
    suggestedNextStep: "Rerun speclite install --yes to restore selected IDE mirror entries.",
  };
}

function createMissingSkillIndexEntryIssue(missing: ExpectedSkillEntry): ValidationIssue {
  return {
    issueId: "ide-mirror.missing-entry",
    category: "ide-mirror",
    severity: "error",
    affectedPath: "_speclite/_config/skill-index.json",
    component: "ReadyCheck:skill-index",
    details: {
      missingModuleId: missing.moduleId,
      missingCanonicalSkillId: missing.canonicalSkillId,
      reason: "selected-package-root-missing-from-skill-index",
    },
    impact: "A selected module package root is missing from the installed skill index.",
    suggestedNextStep: "Regenerate skill-index.json from the selected module package roots.",
  };
}

function createTargetSkillCountIssue(input: {
  targetId: IdeTargetId;
  targetPath: string;
  reportedSkillCount: number;
  indexedSkillCount: number;
}): ValidationIssue {
  return {
    issueId: "ide-mirror.missing-entry",
    category: "ide-mirror",
    severity: "error",
    affectedPath: input.targetPath,
    component: `ReadyCheck:${input.targetId}`,
    details: {
      reportedSkillCount: input.reportedSkillCount,
      indexedSkillCount: input.indexedSkillCount,
      reason: "target-skill-count-mismatch",
    },
    impact: "The IDE target summary does not match the installed skill index.",
    suggestedNextStep: "Regenerate IDE mirrors and installed-state indexes from the same selected module set.",
  };
}

function createReadyCheckFailure(issue: ValidationIssue): ReadyCheckResult {
  return {
    ok: false,
    issue,
    completedSteps: [],
    pendingSteps: ["ready-check", "ready-summary"],
  };
}

function orderIdeTargets(targets: IdeTargetStatus[]): IdeTargetStatus[] {
  return CANONICAL_TARGET_ORDER.flatMap((targetId) =>
    targets.filter((target) => target.id === targetId),
  );
}

async function pathExists(absolutePath: string): Promise<boolean> {
  try {
    await access(absolutePath);
    await lstat(absolutePath);
    return true;
  } catch {
    return false;
  }
}

function projectRootPath(projectRoot: string, relativePath: string): string {
  return path.join(projectRoot, relativePath);
}
