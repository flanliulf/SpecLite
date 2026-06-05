import { constants as fsConstants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { ValidationIssue } from "../../diagnostics/command-result-schema.js";
import { CANONICAL_TARGET_ORDER, type IdeTargetId } from "../../ide/adapter-registry.js";
import {
  FILES_INDEX_SCHEMA_VERSION,
  FilesIndexSchema,
  HELP_INDEX_SCHEMA_VERSION,
  HelpIndexSchema,
  MANIFEST_SCHEMA_VERSION,
  PHASE_COVERAGE_SCHEMA_VERSION,
  PhaseCoverageSchema,
  ManifestSchema,
  SKILL_INDEX_SCHEMA_VERSION,
  SkillIndexSchema,
  type FilesIndex,
  type HelpIndex,
  type Manifest,
  type PhaseCoverage,
  type SkillIndex,
} from "../../manifest/manifest-schema.js";

export type ManifestSchemaValidationResult = {
  issues: ValidationIssue[];
  validatedPaths: string[];
  checkedTargets: IdeTargetId[];
  manifest?: Manifest;
  skillIndex?: SkillIndex;
  helpIndex?: HelpIndex;
  filesIndex?: FilesIndex;
  phaseCoverage?: PhaseCoverage;
};

type ArtifactKind = "manifest" | "skill-index" | "help-index" | "files-index" | "phase-coverage";
type ManifestSchemaIssueId =
  | "manifest-schema.missing-version"
  | "manifest-schema.unsupported-version"
  | "manifest-schema.migration-needed"
  | "manifest-schema.malformed-field"
  | "manifest-schema.schema-corruption";

type ArtifactDefinition<TValue> = {
  kind: ArtifactKind;
  relativePath: string;
  schemaVersion: string;
  parseMode: "yaml" | "json";
  schema: { safeParse(value: unknown): { success: true; data: TValue } | { success: false; error: unknown } };
};

const ARTIFACTS = {
  manifest: {
    kind: "manifest",
    relativePath: "_speclite/_config/manifest.yaml",
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    parseMode: "yaml",
    schema: ManifestSchema,
  },
  skillIndex: {
    kind: "skill-index",
    relativePath: "_speclite/_config/skill-index.json",
    schemaVersion: SKILL_INDEX_SCHEMA_VERSION,
    parseMode: "json",
    schema: SkillIndexSchema,
  },
  helpIndex: {
    kind: "help-index",
    relativePath: "_speclite/_config/help-index.json",
    schemaVersion: HELP_INDEX_SCHEMA_VERSION,
    parseMode: "json",
    schema: HelpIndexSchema,
  },
  filesIndex: {
    kind: "files-index",
    relativePath: "_speclite/_config/files-index.json",
    schemaVersion: FILES_INDEX_SCHEMA_VERSION,
    parseMode: "json",
    schema: FilesIndexSchema,
  },
  phaseCoverage: {
    kind: "phase-coverage",
    relativePath: "_speclite/_config/phase-coverage.json",
    schemaVersion: PHASE_COVERAGE_SCHEMA_VERSION,
    parseMode: "json",
    schema: PhaseCoverageSchema,
  },
} as const;

const CORE_SDLC_BASELINE_ENTRY_COUNT = 54;
const EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS = {
  core: [
    "assets/source/speclite/core-skills/speclite-advanced-elicitation",
    "assets/source/speclite/core-skills/speclite-brainstorming",
    "assets/source/speclite/core-skills/speclite-customize",
    "assets/source/speclite/core-skills/speclite-distillator",
    "assets/source/speclite/core-skills/speclite-editorial-review-prose",
    "assets/source/speclite/core-skills/speclite-editorial-review-structure",
    "assets/source/speclite/core-skills/speclite-help",
    "assets/source/speclite/core-skills/speclite-index-docs",
    "assets/source/speclite/core-skills/speclite-party-mode",
    "assets/source/speclite/core-skills/speclite-review-acceptance-auditor",
    "assets/source/speclite/core-skills/speclite-review-adversarial-general",
    "assets/source/speclite/core-skills/speclite-review-edge-case-hunter",
    "assets/source/speclite/core-skills/speclite-shard-doc",
  ],
  sdlc: [
    "assets/source/speclite/sdlc-skills/1-analysis/research/speclite-domain-research",
    "assets/source/speclite/sdlc-skills/1-analysis/research/speclite-market-research",
    "assets/source/speclite/sdlc-skills/1-analysis/research/speclite-technical-research",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-analyst",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief",
    "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-pm",
    "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-agent-ux-designer",
    "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-prd",
    "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-create-ux-design",
    "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-edit-prd",
    "assets/source/speclite/sdlc-skills/2-plan-workflows/speclite-validate-prd",
    "assets/source/speclite/sdlc-skills/3-solutioning/speclite-agent-architect",
    "assets/source/speclite/sdlc-skills/3-solutioning/speclite-check-implementation-readiness",
    "assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-architecture",
    "assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories",
    "assets/source/speclite/sdlc-skills/3-solutioning/speclite-generate-project-context",
    "assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-01-reviewer",
    "assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-02-evaluator",
    "assets/source/speclite/sdlc-skills/3-solutioning/speclite-story-review-03-fixer",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-agent-dev",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-checkpoint-preview",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-01-reviewer",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-02-evaluator",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-03-fixer",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-04-rules-extractor",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-05-todo-tracker",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-code-review-06-finalizer",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-correct-course",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-create-story",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-dev-story",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-flow-gate",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status",
    "assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher",
  ],
} as const;

export async function validateManifestSchema(input: {
  projectRoot: string;
}): Promise<ManifestSchemaValidationResult> {
  const manifestResult = await readArtifact<Manifest>(input.projectRoot, ARTIFACTS.manifest);
  const skillIndexResult = await readArtifact<SkillIndex>(input.projectRoot, ARTIFACTS.skillIndex);
  const helpIndexResult = await readArtifact<HelpIndex>(input.projectRoot, ARTIFACTS.helpIndex);
  const filesIndexResult = await readArtifact<FilesIndex>(input.projectRoot, ARTIFACTS.filesIndex);
  const phaseCoverageResult = await readArtifact<PhaseCoverage>(input.projectRoot, ARTIFACTS.phaseCoverage);

  const issues = [
    ...manifestResult.issues,
    ...skillIndexResult.issues,
    ...helpIndexResult.issues,
    ...filesIndexResult.issues,
    ...phaseCoverageResult.issues,
  ];
  const checkedTargets = new Set<IdeTargetId>();

  for (const targetId of manifestResult.value?.targetIds ?? []) {
    checkedTargets.add(targetId);
  }
  for (const entry of skillIndexResult.value?.entries ?? []) {
    for (const targetId of entry.installedTargets) {
      checkedTargets.add(targetId);
    }
  }
  for (const entry of helpIndexResult.value?.entries ?? []) {
    for (const targetId of entry.targetIds) {
      checkedTargets.add(targetId);
    }
  }
  for (const row of phaseCoverageResult.value?.rows ?? []) {
    for (const target of row.ideTargets) {
      checkedTargets.add(target.targetId);
    }
  }

  if (manifestResult.value !== undefined && skillIndexResult.value !== undefined) {
    const completenessIssue = validateSelectedModuleCompleteness({
      manifest: manifestResult.value,
      skillIndex: skillIndexResult.value,
    });
    if (completenessIssue !== undefined) issues.push(completenessIssue);
  }

  if (skillIndexResult.value !== undefined) {
    const identityIssue = validateSkillIndexIdentity(skillIndexResult.value);
    if (identityIssue !== undefined) issues.push(identityIssue);
  }

  return {
    issues: dedupeIssues(issues),
    validatedPaths: [
      ARTIFACTS.filesIndex.relativePath,
      ARTIFACTS.helpIndex.relativePath,
      ARTIFACTS.manifest.relativePath,
      ARTIFACTS.phaseCoverage.relativePath,
      ARTIFACTS.skillIndex.relativePath,
    ],
    checkedTargets: CANONICAL_TARGET_ORDER.filter((targetId) => checkedTargets.has(targetId)),
    ...(manifestResult.value === undefined ? {} : { manifest: manifestResult.value }),
    ...(skillIndexResult.value === undefined ? {} : { skillIndex: skillIndexResult.value }),
    ...(helpIndexResult.value === undefined ? {} : { helpIndex: helpIndexResult.value }),
    ...(filesIndexResult.value === undefined ? {} : { filesIndex: filesIndexResult.value }),
    ...(phaseCoverageResult.value === undefined ? {} : { phaseCoverage: phaseCoverageResult.value }),
  };
}

async function readArtifact<TValue>(
  projectRoot: string,
  definition: ArtifactDefinition<TValue>,
): Promise<{ value?: TValue; issues: ValidationIssue[] }> {
  const absolutePath = path.join(projectRoot, definition.relativePath);
  if (!(await fileExists(absolutePath))) {
    return {
      issues: [
        createManifestSchemaIssue("manifest-schema.schema-corruption", definition, {
          reason: "missing-required-artifact",
        }),
      ],
    };
  }

  let parsed: unknown;
  try {
    const raw = await readFile(absolutePath, "utf8");
    parsed = definition.parseMode === "yaml" ? parseYaml(raw) : JSON.parse(raw);
  } catch {
    return {
      issues: [
        createManifestSchemaIssue("manifest-schema.schema-corruption", definition, {
          reason: "parse-failed",
        }),
      ],
    };
  }

  if (!isRecord(parsed) || typeof parsed.schemaVersion !== "string" || parsed.schemaVersion.length === 0) {
    return {
      issues: [
        createManifestSchemaIssue("manifest-schema.missing-version", definition, {
          reason: "missing-version",
          expectedSchemaVersion: definition.schemaVersion,
        }),
      ],
    };
  }

  if (parsed.schemaVersion !== definition.schemaVersion) {
    const migration = classifySchemaVersion(parsed.schemaVersion, definition.schemaVersion);
    return {
      issues: [
        createManifestSchemaIssue(migration.issueId, definition, {
          reason: migration.reason,
          currentSchemaVersion: parsed.schemaVersion,
          supportedSchemaVersion: definition.schemaVersion,
          ...(migration.issueId === "manifest-schema.migration-needed"
            ? {
                migrationKind: "manual",
                manualActionRequired: true,
              }
            : {}),
        }),
      ],
    };
  }

  const result = definition.schema.safeParse(parsed);
  if (!result.success) {
    return {
      issues: [
        createManifestSchemaIssue("manifest-schema.malformed-field", definition, {
          reason: "invalid-field",
          field: getFirstIssueField(result.error),
        }),
      ],
    };
  }

  return {
    value: result.data,
    issues: [],
  };
}

function validateSelectedModuleCompleteness(input: {
  manifest: Manifest;
  skillIndex: SkillIndex;
}): ValidationIssue | undefined {
  const selected = new Set(input.manifest.installedModules);
  if (!selected.has("core") || !selected.has("sdlc")) {
    return undefined;
  }

  if (input.skillIndex.entries.length !== CORE_SDLC_BASELINE_ENTRY_COUNT) {
    return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
      reason: "missing-required-field",
      field: "entries",
      expectedCount: CORE_SDLC_BASELINE_ENTRY_COUNT,
      actualCount: input.skillIndex.entries.length,
    });
  }

  const rootCoverageIssue = validateSelectedModuleRootCoverage(input.skillIndex);
  if (rootCoverageIssue !== undefined) return rootCoverageIssue;

  return undefined;
}

function validateSelectedModuleRootCoverage(skillIndex: SkillIndex): ValidationIssue | undefined {
  const uniqueRootsByModule = new Map<string, Set<string>>();
  const seenRoots = new Set<string>();
  const actualRoots = new Set<string>();

  for (const entry of skillIndex.entries) {
    const rootKey = `${entry.moduleId}:${entry.sourcePackagePath}`;
    if (seenRoots.has(rootKey)) {
      return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
        reason: "missing-required-field",
        field: "entries",
        expectedCount: CORE_SDLC_BASELINE_ENTRY_COUNT,
        actualCount: skillIndex.entries.length,
        uniqueRootCount: seenRoots.size,
        duplicateRoot: rootKey,
      });
    }
    seenRoots.add(rootKey);
    actualRoots.add(rootKey);

    const roots = uniqueRootsByModule.get(entry.moduleId) ?? new Set<string>();
    roots.add(entry.sourcePackagePath);
    uniqueRootsByModule.set(entry.moduleId, roots);
  }

  const coreRootCount = uniqueRootsByModule.get("core")?.size ?? 0;
  const sdlcRootCount = uniqueRootsByModule.get("sdlc")?.size ?? 0;
  if (
    coreRootCount !== EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS.core.length ||
    sdlcRootCount !== EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS.sdlc.length
  ) {
    return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
      reason: "missing-required-field",
      field: "entries",
      expectedCount: CORE_SDLC_BASELINE_ENTRY_COUNT,
      actualCount: skillIndex.entries.length,
      expectedModuleCounts: {
        core: EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS.core.length,
        sdlc: EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS.sdlc.length,
      },
      actualModuleCounts: {
        core: coreRootCount,
        sdlc: sdlcRootCount,
      },
    });
  }

  const expectedRoots = createExpectedSelectedModuleRootKeys();
  const missingRoot = [...expectedRoots].find((rootKey) => !actualRoots.has(rootKey));
  const unexpectedRoot = [...actualRoots].find((rootKey) => !expectedRoots.has(rootKey));
  if (missingRoot !== undefined || unexpectedRoot !== undefined) {
    return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
      reason: "missing-required-field",
      field: "entries",
      expectedCount: CORE_SDLC_BASELINE_ENTRY_COUNT,
      actualCount: skillIndex.entries.length,
      expectedModuleCounts: {
        core: EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS.core.length,
        sdlc: EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS.sdlc.length,
      },
      actualModuleCounts: {
        core: coreRootCount,
        sdlc: sdlcRootCount,
      },
      ...(missingRoot === undefined ? {} : { missingRoot }),
      ...(unexpectedRoot === undefined ? {} : { unexpectedRoot }),
    });
  }

  return undefined;
}

function createExpectedSelectedModuleRootKeys(): Set<string> {
  return new Set(
    Object.entries(EXPECTED_SELECTED_MODULE_PACKAGE_ROOTS).flatMap(([moduleId, roots]) =>
      roots.map((root) => `${moduleId}:${root}`),
    ),
  );
}

function validateSkillIndexIdentity(skillIndex: SkillIndex): ValidationIssue | undefined {
  for (const entry of skillIndex.entries) {
    if (path.posix.basename(entry.sourcePackagePath) !== entry.canonicalSkillId) {
      return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
        reason: "invalid-field",
        field: "canonicalSkillId",
      });
    }
  }

  return undefined;
}

function classifySchemaVersion(
  currentSchemaVersion: string,
  supportedSchemaVersion: string,
): { issueId: ManifestSchemaIssueId; reason: "migration-needed" | "unsupported-version" } {
  const currentMajor = readSchemaVersionNumber(currentSchemaVersion);
  const supportedMajor = readSchemaVersionNumber(supportedSchemaVersion);

  if (
    currentSchemaVersion.startsWith(supportedSchemaVersion.replace(/\.v\d+$/, ".")) &&
    currentMajor !== undefined &&
    supportedMajor !== undefined &&
    currentMajor < supportedMajor
  ) {
    return {
      issueId: "manifest-schema.migration-needed",
      reason: "migration-needed",
    };
  }

  return {
    issueId: "manifest-schema.unsupported-version",
    reason: "unsupported-version",
  };
}

function readSchemaVersionNumber(schemaVersion: string): number | undefined {
  const match = /\.v(\d+)$/.exec(schemaVersion);
  if (match === null) return undefined;
  return Number.parseInt(match[1], 10);
}

function createManifestSchemaIssue(
  issueId: ManifestSchemaIssueId,
  definition: ArtifactDefinition<unknown>,
  details: Record<string, unknown>,
): ValidationIssue {
  return {
    issueId,
    category: "manifest-schema",
    severity: "critical",
    affectedPath: definition.relativePath,
    component: definition.kind,
    details: {
      artifactKind: definition.kind,
      ...details,
    },
    impact: "SpecLite cannot safely read the installed manifest/index schema projection.",
    suggestedNextStep: "Inspect the installed metadata or rerun speclite install --yes before continuing.",
  };
}

function getFirstIssueField(error: unknown): string | undefined {
  if (!isRecord(error) || !Array.isArray(error.issues)) return undefined;
  const firstIssue = error.issues.find(isRecord);
  if (firstIssue === undefined || !Array.isArray(firstIssue.path)) return undefined;
  return firstIssue.path.map(String).join(".");
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return false;
    throw error;
  }
}

function dedupeIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.issueId}:${issue.affectedPath ?? ""}:${issue.component ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
