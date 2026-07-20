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
import { BUNDLED_SOURCE_DISPLAY_ROOT } from "../../source/source-discovery.js";

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
type ExpectedSelectedModulePackageRoots = Readonly<Record<string, readonly string[]>>;

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

const OFFICIAL_BUNDLED_SELECTED_MODULE_PACKAGE_ROOTS: ExpectedSelectedModulePackageRoots = {
  core: [
    "assets/source/speclite/core-skills/speclite-advanced-elicitation",
    "assets/source/speclite/core-skills/speclite-brainstorming",
    "assets/source/speclite/core-skills/speclite-customize",
    "assets/source/speclite/core-skills/speclite-distillator",
    "assets/source/speclite/core-skills/speclite-domain-modeling",
    "assets/source/speclite/core-skills/speclite-editorial-review-prose",
    "assets/source/speclite/core-skills/speclite-editorial-review-structure",
    "assets/source/speclite/core-skills/speclite-grill-with-docs",
    "assets/source/speclite/core-skills/speclite-grilling",
    "assets/source/speclite/core-skills/speclite-handoff",
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
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-docs-steward",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-agent-tech-writer",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-backend-tech-stack-digger",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-brownfield-context-builder",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-document-project",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-prfaq",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-product-brief",
    "assets/source/speclite/sdlc-skills/1-analysis/speclite-write-opensource-docs",
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
    "assets/source/speclite/sdlc-skills/3-solutioning/speclite-ir-grill-consistency-reviewer",
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
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-code-review-runner",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-goal-orchestrator-epic-story-review-runner",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-generate-e2e-tests",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-qa-write-test-guide",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-quick-dev",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-retrospective",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-planning",
    "assets/source/speclite/sdlc-skills/4-implementation/speclite-sprint-status",
    "assets/source/speclite/sdlc-skills/5-devops/speclite-npm-publisher",
  ],
  "ecosystem-backend-java-springboot": [
    "assets/source/speclite/ecosystems/backend/java-springboot/speclite-brownfield-java-springboot-backend-tech-stack-digger",
  ],
  "ecosystem-backend-nodejs": [
    "assets/source/speclite/ecosystems/backend/nodejs/speclite-brownfield-nodejs-backend-tech-stack-digger",
  ],
  "ecosystem-backend-python": [
    "assets/source/speclite/ecosystems/backend/python/speclite-brownfield-python-backend-tech-stack-digger",
  ],
  "ecosystem-frontend-react": [
    "assets/source/speclite/ecosystems/frontend/react/speclite-react-project-context-and-review",
  ],
  "ecosystem-frontend-vue": [
    "assets/source/speclite/ecosystems/frontend/vue/speclite-vue-project-context-and-review",
  ],
  "ecosystem-other-cli-tool": [
    "assets/source/speclite/ecosystems/other/cli-tool/speclite-cli-tool-contract-auditor",
  ],
  "ecosystem-other-documentation-only": [
    "assets/source/speclite/ecosystems/other/documentation-only/speclite-documentation-only-project-auditor",
  ],
  "ecosystem-other-npm-package": [
    "assets/source/speclite/ecosystems/other/npm-package/speclite-npm-package-project-auditor",
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

  if (
    manifestResult.value !== undefined &&
    skillIndexResult.value !== undefined &&
    helpIndexResult.value !== undefined &&
    filesIndexResult.value !== undefined &&
    phaseCoverageResult.value !== undefined
  ) {
    const completenessIssue = validateInstalledStateSelection({
      manifest: manifestResult.value,
      skillIndex: skillIndexResult.value,
      helpIndex: helpIndexResult.value,
      filesIndex: filesIndexResult.value,
      phaseCoverage: phaseCoverageResult.value,
      expectedSelectedModulePackageRoots: expectedSelectedModulePackageRootsForManifest(manifestResult.value),
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

function validateInstalledStateSelection(input: {
  manifest: Manifest;
  skillIndex: SkillIndex;
  helpIndex: HelpIndex;
  filesIndex: FilesIndex;
  phaseCoverage: PhaseCoverage;
  expectedSelectedModulePackageRoots?: ExpectedSelectedModulePackageRoots;
}): ValidationIssue | undefined {
  const installedModules = new Set(input.manifest.installedModules);
  const uniqueRootsByModule = new Map<string, Set<string>>();
  const seenRoots = new Set<string>();

  for (const entry of input.skillIndex.entries) {
    if (!installedModules.has(entry.moduleId)) {
      return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
        reason: "invalid-field",
        field: "entries.moduleId",
        unexpectedModuleId: entry.moduleId,
        installedModules: input.manifest.installedModules,
      });
    }
    const rootKey = `${entry.moduleId}:${entry.sourcePackagePath}`;
    if (seenRoots.has(rootKey)) {
      return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
        reason: "missing-required-field",
        field: "entries",
        actualCount: input.skillIndex.entries.length,
        uniqueRootCount: seenRoots.size,
        duplicateRoot: rootKey,
      });
    }
    seenRoots.add(rootKey);

    const roots = uniqueRootsByModule.get(entry.moduleId) ?? new Set<string>();
    roots.add(entry.sourcePackagePath);
    uniqueRootsByModule.set(entry.moduleId, roots);
  }

  const missingModuleId = input.manifest.installedModules.find((moduleId) => !uniqueRootsByModule.has(moduleId));
  if (missingModuleId !== undefined) {
    return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
      reason: "missing-required-field",
      field: "entries",
      actualCount: input.skillIndex.entries.length,
      missingModuleId,
    });
  }

  const sourcePathIssue = validateSelectedSourcePackagePaths({
    installedModules,
    skillIndex: input.skillIndex,
  });
  if (sourcePathIssue !== undefined) return sourcePathIssue;

  const packageRootCompletenessIssue = validateSelectedPackageRootCompleteness({
    installedModules: input.manifest.installedModules,
    uniqueRootsByModule,
    expectedSelectedModulePackageRoots: input.expectedSelectedModulePackageRoots,
    actualCount: input.skillIndex.entries.length,
  });
  if (packageRootCompletenessIssue !== undefined) return packageRootCompletenessIssue;

  const phaseModuleIssue = validatePhaseCoverageSelectedModules({
    installedModules,
    phaseCoverage: input.phaseCoverage,
  });
  if (phaseModuleIssue !== undefined) return phaseModuleIssue;

  const filesIndexIssue = validateFilesIndexSelectedSourceRefs({
    installedModules,
    filesIndex: input.filesIndex,
  });
  if (filesIndexIssue !== undefined) return filesIndexIssue;

  const helpIssue = validateHelpTargetsReferenceInstalledSkills({
    helpIndex: input.helpIndex,
    skillIndex: input.skillIndex,
  });
  if (helpIssue !== undefined) return helpIssue;

  return undefined;
}

function validateSelectedPackageRootCompleteness(input: {
  installedModules: readonly string[];
  uniqueRootsByModule: Map<string, Set<string>>;
  expectedSelectedModulePackageRoots?: ExpectedSelectedModulePackageRoots;
  actualCount: number;
}): ValidationIssue | undefined {
  if (input.expectedSelectedModulePackageRoots === undefined) return undefined;

  for (const moduleId of input.installedModules) {
    const expectedRoots = input.expectedSelectedModulePackageRoots[moduleId];
    if (expectedRoots === undefined) continue;

    const actualRoots = input.uniqueRootsByModule.get(moduleId) ?? new Set<string>();
    const missingSourcePackagePath = expectedRoots.find((expectedRoot) => !actualRoots.has(expectedRoot));
    if (missingSourcePackagePath === undefined) continue;

    return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
      reason: "missing-required-field",
      field: "entries",
      actualCount: input.actualCount,
      actualRootCount: actualRoots.size,
      expectedRootCount: expectedRoots.length,
      missingModuleId: moduleId,
      missingSourcePackagePath,
    });
  }

  return undefined;
}

function validateSelectedSourcePackagePaths(input: {
  installedModules: Set<string>;
  skillIndex: SkillIndex;
}): ValidationIssue | undefined {
  for (const entry of input.skillIndex.entries) {
    if (!sourcePackagePathMatchesModule(entry.sourcePackagePath, entry.moduleId)) {
      return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
        reason: "invalid-field",
        field: "entries.sourcePackagePath",
        moduleId: entry.moduleId,
        sourcePackagePath: entry.sourcePackagePath,
      });
    }
    const ecosystemModuleId = ecosystemModuleIdFromSourcePath(entry.sourcePackagePath);
    if (ecosystemModuleId !== undefined && !input.installedModules.has(ecosystemModuleId)) {
      return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
        reason: "invalid-field",
        field: "entries.sourcePackagePath",
        unexpectedModuleId: ecosystemModuleId,
        sourcePackagePath: entry.sourcePackagePath,
      });
    }
  }

  return undefined;
}

function validatePhaseCoverageSelectedModules(input: {
  installedModules: Set<string>;
  phaseCoverage: PhaseCoverage;
}): ValidationIssue | undefined {
  for (const row of input.phaseCoverage.rows) {
    if (!input.installedModules.has(row.moduleId)) {
      return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.phaseCoverage, {
        reason: "invalid-field",
        field: "rows.moduleId",
        unexpectedModuleId: row.moduleId,
      });
    }
  }

  return undefined;
}

function validateFilesIndexSelectedSourceRefs(input: {
  installedModules: Set<string>;
  filesIndex: FilesIndex;
}): ValidationIssue | undefined {
  for (const entry of input.filesIndex.entries) {
    const sourceModuleId = moduleIdFromSourcePath(entry.sourceRef);
    if (sourceModuleId !== undefined && !input.installedModules.has(sourceModuleId)) {
      return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.filesIndex, {
        reason: "invalid-field",
        field: "entries.sourceRef",
        unexpectedModuleId: sourceModuleId,
        sourceRef: entry.sourceRef,
      });
    }
  }

  return undefined;
}

function validateHelpTargetsReferenceInstalledSkills(input: {
  helpIndex: HelpIndex;
  skillIndex: SkillIndex;
}): ValidationIssue | undefined {
  const installedSkillIds = new Set(input.skillIndex.entries.map((entry) => entry.canonicalSkillId));
  const unknownHelpEntry = input.helpIndex.entries.find((entry) => !installedSkillIds.has(entry.canonicalSkillId));
  if (unknownHelpEntry !== undefined) {
    return createManifestSchemaIssue("manifest-schema.malformed-field", ARTIFACTS.skillIndex, {
      reason: "invalid-field",
      field: "entries",
      unknownHelpCanonicalSkillId: unknownHelpEntry.canonicalSkillId,
    });
  }

  return undefined;
}

function sourcePackagePathMatchesModule(sourcePackagePath: string, moduleId: string): boolean {
  return moduleIdFromSourcePath(sourcePackagePath) === moduleId;
}

function moduleIdFromSourcePath(sourcePath: string): string | undefined {
  if (hasSourcePathSegment(sourcePath, "core-skills")) return "core";
  if (hasSourcePathSegment(sourcePath, "sdlc-skills")) return "sdlc";
  return ecosystemModuleIdFromSourcePath(sourcePath);
}

function ecosystemModuleIdFromSourcePath(sourcePath: string): string | undefined {
  const match = /(?:^|\/)ecosystems\/([^/]+)\/([^/]+)\//.exec(sourcePath);
  if (match === null || match[1] === undefined || match[2] === undefined) return undefined;
  return `ecosystem-${match[1]}-${match[2]}`;
}

function hasSourcePathSegment(sourcePath: string, segment: "core-skills" | "sdlc-skills"): boolean {
  return sourcePath === segment || sourcePath.startsWith(`${segment}/`) || sourcePath.includes(`/${segment}/`);
}

function expectedSelectedModulePackageRootsForManifest(
  manifest: Manifest,
): ExpectedSelectedModulePackageRoots | undefined {
  if (
    manifest.sourceDescriptor.sourceType !== "bundled" ||
    manifest.sourceDescriptor.resolvedRoot !== BUNDLED_SOURCE_DISPLAY_ROOT
  ) {
    return undefined;
  }

  return OFFICIAL_BUNDLED_SELECTED_MODULE_PACKAGE_ROOTS;
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
