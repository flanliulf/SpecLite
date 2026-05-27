import { access, lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type {
  CommandPathSummary,
  IdeTargetStatus,
  ValidationIssue,
} from "../diagnostics/command-result-schema.js";
import { CANONICAL_TARGET_ORDER, type IdeTargetId } from "../ide/adapter-registry.js";
import {
  FilesIndexSchema,
  HelpIndexSchema,
  ManifestSchema,
  PhaseCoverageSchema,
  SkillIndexSchema,
  type HelpIndex,
  type Manifest,
  type PhaseCoverage,
  type SkillIndex,
} from "../manifest/manifest-schema.js";
import { SourceDescriptorSchema, type SourceDescriptor } from "../source/source-descriptor-schema.js";
import { validateMenuTargets } from "../validation/rules/menu-target.js";
import type { InstallLifecycleStepId } from "./progress-events.js";

export type ReadyCheckResult =
  | {
      ok: true;
      manifestVersion: string;
      installedModules: string[];
      ideTargets: IdeTargetStatus[];
      paths: Required<CommandPathSummary>;
      completedSteps: InstallLifecycleStepId[];
      pendingSteps: InstallLifecycleStepId[];
    }
  | {
      ok: false;
      issue: ValidationIssue;
      completedSteps: InstallLifecycleStepId[];
      pendingSteps: InstallLifecycleStepId[];
    };

export async function runReadyCheck(input: {
  projectRoot: string;
  sourceDescriptor: SourceDescriptor;
  installedModules: string[];
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

  const runtimePaths = [
    paths.specliteRoot,
    "_speclite/_config",
    paths.artifactRoot,
    paths.manifestPath,
  ];
  for (const runtimePath of runtimePaths) {
    if (!(await pathExists(projectRootPath(input.projectRoot, runtimePath)))) {
      return createReadyCheckFailure(createMissingRuntimePathIssue(runtimePath));
    }
  }

  const manifest = manifestResult.manifest;
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

    for (const entry of indexesResult.skillIndex.entries.filter((skill) =>
      skill.installedTargets.includes(targetId),
    )) {
      const skillEntryPath = `${target.targetPath}/${entry.canonicalSkillId}/SKILL.md`;
      if (!(await pathExists(projectRootPath(input.projectRoot, skillEntryPath)))) {
        return createReadyCheckFailure(createMissingIdeMirrorIssue(targetId, skillEntryPath));
      }
    }
  }

  return {
    ok: true,
    manifestVersion: manifest.schemaVersion,
    installedModules: manifest.installedModules,
    ideTargets: orderIdeTargets(input.ideTargets),
    paths,
    completedSteps: ["ready-check"],
    pendingSteps: ["ready-summary"],
  };
}

function normalizeReadyPaths(paths: CommandPathSummary): Required<CommandPathSummary> | undefined {
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
  };
}

async function readManifest(
  absolutePath: string,
): Promise<{ ok: true; manifest: Manifest } | { ok: false; issue: ValidationIssue }> {
  try {
    const raw = await readFile(absolutePath, "utf8");
    const parsed = ManifestSchema.safeParse(parseYaml(raw));
    if (!parsed.success) {
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

function createMissingIdeMirrorIssue(targetId: IdeTargetId, affectedPath: string | undefined): ValidationIssue {
  return {
    issueId: "ide-mirror.missing-entry",
    category: "ide-mirror",
    severity: "error",
    ...(affectedPath === undefined ? {} : { affectedPath }),
    component: `ReadyCheck:${targetId}`,
    impact: "A selected IDE mirror target is missing a required installed skill entry.",
    suggestedNextStep: "Rerun speclite install --yes to restore selected IDE mirror entries.",
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
