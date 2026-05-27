import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse as parseCsv } from "csv-parse/sync";
import { parse as parseYaml } from "yaml";
import { BUNDLED_SOURCE_DISPLAY_ROOT } from "../source/source-discovery.js";

export type OfficialModule = {
  code: string;
  name: string;
  description: string;
  version: string;
  sourceDirectory: string;
  defaultSelected: boolean;
  required: boolean;
  requiredDependencies: string[];
  packageRoots: string[];
  capabilitySummary: string[];
  helpEntries: ModuleHelpEntry[];
  directories: string[];
  configTable?: string;
  configPrompts: ModuleConfigPrompt[];
};

export type ModuleHelpEntry = {
  canonicalSkillId: string;
  displayName: string;
  menuCode?: string;
  phaseId: string;
  required: boolean;
  outputLocation?: string;
  outputArtifactType?: string;
};

export type ModuleConfigPrompt = {
  key: string;
  prompt: string[];
  scope?: "user";
  defaultValue: string;
  resultTemplate?: string;
  choices: ModuleConfigChoice[];
};

export type ModuleConfigChoice = {
  value: string;
  label: string;
};

export class ModuleMetadataError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ModuleMetadataError";
  }
}

export async function discoverOfficialModules(input: {
  projectRoot?: string;
  sourceRoot?: string;
}): Promise<OfficialModule[]> {
  const sourceRoot =
    input.sourceRoot ?? path.join(input.projectRoot ?? process.cwd(), BUNDLED_SOURCE_DISPLAY_ROOT);
  const moduleDirectories = await findModuleDirectories(sourceRoot);
  const modules = await Promise.all(
    moduleDirectories.map((moduleDirectory) => readOfficialModule(sourceRoot, moduleDirectory)),
  );

  assertUniqueModuleCodes(modules);
  assertUniqueSkillIds(modules);
  assertHelpEntriesReferenceDiscoveredPackageRoots(modules);
  assertKnownRequiredDependencies(modules);

  return modules.sort((left, right) => left.sourceDirectory.localeCompare(right.sourceDirectory));
}

async function findModuleDirectories(sourceRoot: string): Promise<string[]> {
  const entries = await readdir(sourceRoot, { withFileTypes: true });
  const moduleDirectories: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const moduleDirectory = path.join(sourceRoot, entry.name);
    if (await fileExists(path.join(moduleDirectory, "module.yaml"))) {
      moduleDirectories.push(moduleDirectory);
    }
  }

  return moduleDirectories.sort();
}

async function readOfficialModule(
  sourceRoot: string,
  moduleDirectory: string,
): Promise<OfficialModule> {
  const sourceDirectory = toPosixRelative(sourceRoot, moduleDirectory);
  const metadata = await readModuleYaml(path.join(moduleDirectory, "module.yaml"), sourceDirectory);
  const capabilitySummary = await readModuleHelpSummary(
    path.join(moduleDirectory, "module-help.csv"),
    sourceDirectory,
  );
  const helpEntries = await readModuleHelpEntries(
    path.join(moduleDirectory, "module-help.csv"),
    sourceDirectory,
  );
  const packageRoots = await findPackageRoots(moduleDirectory);

  if (packageRoots.length === 0) {
    throw new ModuleMetadataError(
      "module-metadata.missing-package-roots",
      `Module ${metadata.code} has no canonical SKILL.md package roots`,
    );
  }

  return {
    code: metadata.code,
    name: metadata.name,
    description: metadata.description,
    version: metadata.version,
    sourceDirectory,
    defaultSelected: metadata.defaultSelected,
    required: metadata.required,
    requiredDependencies: metadata.requiredDependencies,
    packageRoots,
    capabilitySummary,
    helpEntries,
    directories: metadata.directories,
    ...(metadata.configTable === undefined ? {} : { configTable: metadata.configTable }),
    configPrompts: metadata.configPrompts,
  };
}

async function readModuleYaml(
  moduleYamlPath: string,
  sourceDirectory: string,
): Promise<{
  code: string;
  name: string;
  description: string;
  version: string;
  defaultSelected: boolean;
  required: boolean;
  requiredDependencies: string[];
  configTable?: string;
  configPrompts: ModuleConfigPrompt[];
  directories: string[];
}> {
  let parsed: unknown;
  try {
    parsed = parseYaml(await readFile(moduleYamlPath, "utf8"));
  } catch {
    throw new ModuleMetadataError(
      "module-metadata.malformed-yaml",
      `Malformed module.yaml in ${sourceDirectory}`,
    );
  }

  if (!isRecord(parsed)) {
    throw new ModuleMetadataError(
      "module-metadata.malformed-yaml",
      `module.yaml must be an object in ${sourceDirectory}`,
    );
  }

  const code = readRequiredString(parsed, "code", sourceDirectory);
  const name = readRequiredString(parsed, "name", sourceDirectory);
  const description = readRequiredString(parsed, "description", sourceDirectory);
  const version = readRequiredString(parsed, "version", sourceDirectory);
  const requiredDependencies = readStringArray(parsed.required_dependencies, sourceDirectory);
  const configTable = typeof parsed.config_table === "string" ? parsed.config_table : undefined;

  return {
    code,
    name,
    description,
    version,
    defaultSelected: parsed.default_selected === true,
    required: parsed.required === true,
    requiredDependencies,
    ...(configTable === undefined ? {} : { configTable }),
    configPrompts: readConfigPrompts(parsed),
    directories: readStringArray(parsed.directories, sourceDirectory).sort(),
  };
}

function readConfigPrompts(metadata: Record<string, unknown>): ModuleConfigPrompt[] {
  const prompts: ModuleConfigPrompt[] = [];

  for (const [key, value] of Object.entries(metadata)) {
    if (!isRecord(value) || value.default === undefined || value.prompt === undefined) {
      continue;
    }

    const defaultValue = typeof value.default === "string" ? value.default : String(value.default);
    const resultTemplate = typeof value.result === "string" ? value.result : undefined;
    const scope = value.scope === "user" ? "user" : undefined;
    const prompt = Array.isArray(value.prompt)
      ? value.prompt.filter((entry): entry is string => typeof entry === "string")
      : typeof value.prompt === "string"
        ? [value.prompt]
        : [];
    const choices = readConfigChoices(value["single-select"]);

    prompts.push({
      key,
      prompt,
      ...(scope === undefined ? {} : { scope }),
      defaultValue,
      ...(resultTemplate === undefined ? {} : { resultTemplate }),
      choices,
    });
  }

  return prompts.sort((left, right) => left.key.localeCompare(right.key));
}

function readConfigChoices(value: unknown): ModuleConfigChoice[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry): ModuleConfigChoice[] => {
    if (!isRecord(entry) || typeof entry.value !== "string" || typeof entry.label !== "string") {
      return [];
    }

    return [
      {
        value: entry.value,
        label: entry.label,
      },
    ];
  });
}

async function readModuleHelpSummary(
  moduleHelpPath: string,
  sourceDirectory: string,
): Promise<string[]> {
  let rows: Record<string, string>[];
  try {
    rows = parseCsv(await readFile(moduleHelpPath, "utf8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];
  } catch {
    throw new ModuleMetadataError(
      "module-metadata.malformed-csv",
      `Malformed module-help.csv in ${sourceDirectory}`,
    );
  }

  return rows
    .filter((row) => row.skill !== "_meta")
    .map((row) => row["display-name"] ?? row.skill)
    .filter((value): value is string => value !== undefined && value.length > 0)
    .slice(0, 5);
}

async function readModuleHelpEntries(
  moduleHelpPath: string,
  sourceDirectory: string,
): Promise<ModuleHelpEntry[]> {
  let rows: Record<string, string>[];
  try {
    rows = parseCsv(await readFile(moduleHelpPath, "utf8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];
  } catch {
    throw new ModuleMetadataError(
      "module-metadata.malformed-csv",
      `Malformed module-help.csv in ${sourceDirectory}`,
    );
  }

  return rows
    .filter((row) => row.skill !== "_meta")
    .flatMap((row): ModuleHelpEntry[] => {
      const canonicalSkillId = row.skill;
      if (canonicalSkillId === undefined || canonicalSkillId.length === 0) {
        return [];
      }

      return [
        {
          canonicalSkillId,
          displayName: row["display-name"] || canonicalSkillId,
          ...(row["menu-code"] === undefined || row["menu-code"].length === 0
            ? {}
            : { menuCode: row["menu-code"] }),
          phaseId: row.phase || "anytime",
          required: row.required === "true",
          ...(row["output-location"] === undefined || row["output-location"].length === 0
            ? {}
            : { outputLocation: row["output-location"] }),
          ...(row.outputs === undefined || row.outputs.length === 0
            ? {}
            : { outputArtifactType: row.outputs }),
        },
      ];
    })
    .sort((left, right) =>
      `${left.phaseId}:${left.canonicalSkillId}:${left.displayName}`.localeCompare(
        `${right.phaseId}:${right.canonicalSkillId}:${right.displayName}`,
      ),
    );
}

async function findPackageRoots(moduleDirectory: string): Promise<string[]> {
  const packageRoots: string[] = [];

  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && entry.name === "SKILL.md")) {
      packageRoots.push(toPosixRelative(moduleDirectory, directory));
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      await visit(path.join(directory, entry.name));
    }
  }

  await visit(moduleDirectory);
  return packageRoots.sort();
}

function assertUniqueModuleCodes(modules: OfficialModule[]): void {
  const seen = new Set<string>();
  for (const module of modules) {
    if (seen.has(module.code)) {
      throw new ModuleMetadataError(
        "module-metadata.duplicate-code",
        `Duplicate module code: ${module.code}`,
      );
    }
    seen.add(module.code);
  }
}

function assertUniqueSkillIds(modules: OfficialModule[]): void {
  const seen = new Set<string>();
  for (const module of modules) {
    for (const packageRoot of module.packageRoots) {
      const skillId = packageRoot.split("/").at(-1);
      if (skillId === undefined) continue;
      if (seen.has(skillId)) {
        throw new ModuleMetadataError(
          "module-metadata.duplicate-skill-id",
          `Duplicate skill id: ${skillId}`,
        );
      }
      seen.add(skillId);
    }
  }
}

function assertHelpEntriesReferenceDiscoveredPackageRoots(modules: OfficialModule[]): void {
  const knownSkillIds = new Set(
    modules.flatMap((module) =>
      module.packageRoots.map((packageRoot) => path.posix.basename(packageRoot)),
    ),
  );

  for (const module of modules) {
    const missingSkillIds = [
      ...new Set(
        module.helpEntries
          .map((entry) => entry.canonicalSkillId)
          .filter((canonicalSkillId) => !knownSkillIds.has(canonicalSkillId)),
      ),
    ].sort();

    if (missingSkillIds.length === 0) continue;

    throw new ModuleMetadataError(
      "module-metadata.unknown-help-skill",
      `Module ${module.code} has module-help.csv entries for missing canonical skill package roots: ${missingSkillIds.join(", ")}`,
    );
  }
}

function assertKnownRequiredDependencies(modules: OfficialModule[]): void {
  const knownModuleCodes = new Set(modules.map((module) => module.code));

  for (const module of modules) {
    for (const dependencyId of module.requiredDependencies) {
      if (!knownModuleCodes.has(dependencyId)) {
        throw new ModuleMetadataError(
          "module-metadata.unknown-required-dependency",
          `Module ${module.code} requires unknown module: ${dependencyId}`,
        );
      }
    }
  }
}

function readRequiredString(
  metadata: Record<string, unknown>,
  field: string,
  sourceDirectory: string,
): string {
  const value = metadata[field];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new ModuleMetadataError(
    "module-metadata.missing-required-field",
    `Module ${sourceDirectory} is missing required field: ${field}`,
  );
}

function readStringArray(value: unknown, sourceDirectory: string): string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new ModuleMetadataError(
      "module-metadata.malformed-field",
      `Module ${sourceDirectory} has malformed required_dependencies`,
    );
  }

  return [...value].sort();
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await readFile(targetPath, "utf8");
    return true;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function toPosixRelative(root: string, target: string): string {
  return path.relative(root, target).split(path.sep).join("/") || ".";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
