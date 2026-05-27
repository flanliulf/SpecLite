import { constants as fsConstants } from "node:fs";
import { access, lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { IdeTargetStatus, ValidationIssue } from "../diagnostics/command-result-schema.js";
import { CANONICAL_TARGET_ORDER, getIdeAdapterRegistry } from "../ide/adapter-registry.js";
import {
  FilesIndexEntrySchema,
  FilesIndexSchema,
  HELP_INDEX_SCHEMA_VERSION,
  HelpIndexEntrySchema,
  HelpIndexSchema,
  MANIFEST_SCHEMA_VERSION,
  ManifestSchema,
  PHASE_COVERAGE_SCHEMA_VERSION,
  PhaseCoverageRowSchema,
  PhaseCoverageSchema,
  SKILL_INDEX_SCHEMA_VERSION,
  SkillIndexEntrySchema,
  SkillIndexSchema,
  FILES_INDEX_SCHEMA_VERSION,
  type Manifest,
} from "../manifest/manifest-schema.js";

export const INSTALLED_STATE_PATHS = [
  "_speclite/_config",
  "_speclite/_config/manifest.yaml",
  "_speclite/_config/skill-index.json",
  "_speclite/_config/help-index.json",
  "_speclite/_config/files-index.json",
  "_speclite/_config/phase-coverage.json",
] as const;

export type TargetDirectoryState =
  | {
      kind: "missing";
      targetRoot: string;
      detectedRuntime: false;
      issues: [];
    }
  | {
      kind: "empty";
      targetRoot: string;
      detectedRuntime: false;
      issues: [];
    }
  | {
      kind: "non-empty";
      targetRoot: string;
      detectedRuntime: false;
      entryCount: number;
      issues: [];
    }
  | {
      kind: "regular-file";
      targetRoot: string;
      detectedRuntime: false;
      issues: [];
    }
  | {
      kind: "unsafe-symlink";
      targetRoot: string;
      detectedRuntime: false;
      issues: ValidationIssue[];
    }
  | {
      kind: "existing-install";
      targetRoot: string;
      detectedRuntime: boolean;
      manifestVersion?: string;
      installedModules: string[];
      ideTargets: IdeTargetStatus[];
      issues: ValidationIssue[];
    };

export async function inspectTargetDirectory(input: {
  targetRoot: string;
}): Promise<TargetDirectoryState> {
  const targetStat = await safeLstat(input.targetRoot);

  if (targetStat === "missing") {
    return {
      kind: "missing",
      targetRoot: input.targetRoot,
      detectedRuntime: false,
      issues: [],
    };
  }

  if (targetStat.isSymbolicLink()) {
    return {
      kind: "unsafe-symlink",
      targetRoot: input.targetRoot,
      detectedRuntime: false,
      issues: [
        createRuntimePathIssue("runtime-path.symlink-escape", ".", {
          reason: "target-root-symlink",
        }),
      ],
    };
  }

  if (!targetStat.isDirectory()) {
    return {
      kind: "regular-file",
      targetRoot: input.targetRoot,
      detectedRuntime: false,
      issues: [],
    };
  }

  const installedStateBoundaryIssues = await inspectInstalledStateBoundary(input.targetRoot);
  if (installedStateBoundaryIssues.length > 0) {
    return {
      kind: "existing-install",
      targetRoot: input.targetRoot,
      detectedRuntime: true,
      installedModules: [],
      ideTargets: await createIdeTargetStatuses(input.targetRoot, undefined),
      issues: installedStateBoundaryIssues,
    };
  }

  const installedStatePresent = await hasInstalledState(input.targetRoot);
  if (installedStatePresent) {
    return inspectExistingInstall(input.targetRoot);
  }

  const entries = (await readdir(input.targetRoot)).filter((entry) => entry !== "." && entry !== "..").sort();

  if (entries.length === 0) {
    return {
      kind: "empty",
      targetRoot: input.targetRoot,
      detectedRuntime: false,
      issues: [],
    };
  }

  return {
    kind: "non-empty",
    targetRoot: input.targetRoot,
    detectedRuntime: false,
    entryCount: entries.length,
    issues: [],
  };
}

async function inspectExistingInstall(targetRoot: string): Promise<TargetDirectoryState> {
  const installedStateIssues = await inspectInstalledStateBoundary(targetRoot);
  if (installedStateIssues.length > 0) {
    return {
      kind: "existing-install",
      targetRoot,
      detectedRuntime: true,
      installedModules: [],
      ideTargets: await createIdeTargetStatuses(targetRoot, undefined),
      issues: installedStateIssues,
    };
  }

  const manifestPath = path.join(targetRoot, "_speclite/_config/manifest.yaml");
  const manifestProjection = await readManifestProjection(manifestPath);
  const indexIssues = await readIndexProjectionIssues(targetRoot);

  return {
    kind: "existing-install",
    targetRoot,
    detectedRuntime: await pathExists(path.join(targetRoot, "_speclite")),
    ...manifestProjection.manifestFields,
    ideTargets: await createIdeTargetStatuses(targetRoot, manifestProjection.manifest),
    issues: [...manifestProjection.issues, ...indexIssues],
  };
}

async function readManifestProjection(manifestPath: string): Promise<{
  manifest?: Manifest;
  manifestFields: {
    manifestVersion?: string;
    installedModules: string[];
  };
  issues: ValidationIssue[];
}> {
  const manifestExists = await pathExists(manifestPath);
  if (!manifestExists) {
    return {
      manifestFields: {
        installedModules: [],
      },
      issues: [],
    };
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(await readFile(manifestPath, "utf8"));
  } catch {
    return {
      manifestFields: {
        installedModules: [],
      },
      issues: [
        createManifestSchemaIssue(
          "manifest-schema.schema-corruption",
          "_speclite/_config/manifest.yaml",
        ),
      ],
    };
  }

  if (!isObjectRecord(parsed) || parsed.schemaVersion === undefined) {
    return {
      manifestFields: {
        installedModules: [],
      },
      issues: [
        createManifestSchemaIssue(
          "manifest-schema.missing-version",
          "_speclite/_config/manifest.yaml",
        ),
      ],
    };
  }

  if (parsed.schemaVersion !== MANIFEST_SCHEMA_VERSION) {
    return {
      manifestFields: {
        installedModules: [],
      },
      issues: [
        createManifestSchemaIssue(
          "manifest-schema.unsupported-version",
          "_speclite/_config/manifest.yaml",
          {
            currentSchemaVersion: String(parsed.schemaVersion),
            supportedSchemaVersion: MANIFEST_SCHEMA_VERSION,
          },
        ),
      ],
    };
  }

  const result = ManifestSchema.safeParse(parsed);
  if (!result.success) {
    return {
      manifestFields: {
        manifestVersion: MANIFEST_SCHEMA_VERSION,
        installedModules: [],
      },
      issues: [
        createManifestSchemaIssue(
          "manifest-schema.malformed-field",
          "_speclite/_config/manifest.yaml",
        ),
      ],
    };
  }

  return {
    manifest: result.data,
    manifestFields: {
      manifestVersion: result.data.schemaVersion,
      installedModules: result.data.installedModules,
    },
    issues: [],
  };
}

async function inspectInstalledStateBoundary(targetRoot: string): Promise<ValidationIssue[]> {
  const runtimeRoot = path.join(targetRoot, "_speclite");
  const stat = await safeLstat(runtimeRoot);
  if (stat === "missing" || !stat.isSymbolicLink()) {
    return [];
  }

  return [
    createRuntimePathIssue("runtime-path.symlink-escape", "_speclite", {
      reason: "installed-state-symlink",
    }),
  ];
}

async function readIndexProjectionIssues(targetRoot: string): Promise<ValidationIssue[]> {
  const indexDefinitions = [
    {
      relativePath: "_speclite/_config/skill-index.json",
      schemaVersion: SKILL_INDEX_SCHEMA_VERSION,
      schema: SkillIndexSchema,
    },
    {
      relativePath: "_speclite/_config/help-index.json",
      schemaVersion: HELP_INDEX_SCHEMA_VERSION,
      schema: HelpIndexSchema,
    },
    {
      relativePath: "_speclite/_config/files-index.json",
      schemaVersion: FILES_INDEX_SCHEMA_VERSION,
      schema: FilesIndexSchema,
    },
    {
      relativePath: "_speclite/_config/phase-coverage.json",
      schemaVersion: PHASE_COVERAGE_SCHEMA_VERSION,
      schema: PhaseCoverageSchema,
    },
  ] as const;

  const issues: ValidationIssue[] = [];
  for (const definition of indexDefinitions) {
    const indexPath = path.join(targetRoot, definition.relativePath);
    if (!(await pathExistsNoFollow(indexPath))) {
      continue;
    }

    issues.push(...(await readSingleIndexProjectionIssues(indexPath, definition)));
  }

  return issues;
}

async function readSingleIndexProjectionIssues(
  indexPath: string,
  definition: {
    relativePath: string;
    schemaVersion: string;
    schema: { safeParse(value: unknown): { success: boolean } };
  },
): Promise<ValidationIssue[]> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(indexPath, "utf8"));
  } catch {
    return [
      createManifestSchemaIssue("manifest-schema.schema-corruption", definition.relativePath),
    ];
  }

  const entries = Array.isArray(parsed) ? parsed : [parsed];
  const firstIssue = entries
    .map((entry) => validateIndexEntry(entry, definition))
    .find((issue) => issue !== undefined);

  return firstIssue === undefined ? [] : [firstIssue];
}

function validateIndexEntry(
  entry: unknown,
  definition: {
    relativePath: string;
    schemaVersion: string;
    schema: { safeParse(value: unknown): { success: boolean } };
  },
): ValidationIssue | undefined {
  if (!isObjectRecord(entry) || entry.schemaVersion === undefined) {
    return createManifestSchemaIssue("manifest-schema.missing-version", definition.relativePath);
  }

  if (entry.schemaVersion !== definition.schemaVersion) {
    return createManifestSchemaIssue(
      "manifest-schema.unsupported-version",
      definition.relativePath,
      {
        currentSchemaVersion: String(entry.schemaVersion),
        supportedSchemaVersion: definition.schemaVersion,
      },
    );
  }

  if (!definition.schema.safeParse(entry).success) {
    return createManifestSchemaIssue("manifest-schema.malformed-field", definition.relativePath);
  }

  return undefined;
}

async function hasInstalledState(targetRoot: string): Promise<boolean> {
  for (const installedStatePath of INSTALLED_STATE_PATHS) {
    if (await pathExistsNoFollow(path.join(targetRoot, installedStatePath))) {
      return true;
    }
  }

  return false;
}

async function createIdeTargetStatuses(
  targetRoot: string,
  manifest: Manifest | undefined,
): Promise<IdeTargetStatus[]> {
  const adapters = getIdeAdapterRegistry();
  const manifestTargetIds = manifest?.targetIds;
  const statuses: IdeTargetStatus[] = [];

  for (const targetId of CANONICAL_TARGET_ORDER) {
    const adapter = adapters.find((candidate) => candidate.id === targetId);
    if (adapter === undefined) continue;

    const targetPath = adapter.targetDirectory;
    const targetExists = await pathExists(path.join(targetRoot, targetPath));
    const expectedByManifest = manifestTargetIds?.includes(targetId) ?? false;

    statuses.push({
      id: targetId,
      status: targetExists && expectedByManifest ? "configured" : targetExists ? "partial" : "not-configured",
      targetPath,
    });
  }

  return statuses;
}

function createManifestSchemaIssue(
  issueId:
    | "manifest-schema.missing-version"
    | "manifest-schema.unsupported-version"
    | "manifest-schema.malformed-field"
    | "manifest-schema.schema-corruption",
  affectedPath: string,
  details?: Record<string, unknown>,
): ValidationIssue {
  return {
    issueId,
    category: "manifest-schema",
    severity: "critical",
    affectedPath,
    component: "target-directory",
    ...(details === undefined ? {} : { details }),
    impact: "SpecLite cannot safely read the existing installed-state metadata.",
    suggestedNextStep: "Run speclite validate or inspect the installed metadata before continuing.",
  };
}

function createRuntimePathIssue(
  issueId: "runtime-path.symlink-escape",
  affectedPath: string,
  details?: Record<string, unknown>,
): ValidationIssue {
  return {
    issueId,
    category: "runtime-path",
    severity: "critical",
    affectedPath,
    component: "target-directory",
    ...(details === undefined ? {} : { details }),
    impact: "SpecLite cannot safely inspect a symlinked runtime target.",
    suggestedNextStep: "Choose a real project directory before continuing.",
  };
}

async function safeLstat(targetPath: string): Promise<Awaited<ReturnType<typeof lstat>> | "missing"> {
  try {
    return await lstat(targetPath);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return "missing";
    }
    throw error;
  }
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function pathExistsNoFollow(targetPath: string): Promise<boolean> {
  const stat = await safeLstat(targetPath);
  return stat !== "missing";
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
