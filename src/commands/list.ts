import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { createListCommandResult, resolveTargetProjectDisplayName } from "../diagnostics/command-result.js";
import type { ListCommandData, ListCommandResult } from "../diagnostics/command-result-schema.js";
import { normalizeTargetDirectory } from "../fs/path-normalizer.js";
import { getIdeAdapterRegistry } from "../ide/adapter-registry.js";
import { ManifestSchema, SkillIndexSchema, type Manifest, type SkillIndex } from "../manifest/manifest-schema.js";
import { discoverOfficialModules, type OfficialModule } from "../modules/module-metadata.js";

export type ListCommandOptions = {
  json?: boolean;
};

export type ListCommandRuntime = {
  cwd?: string;
  targetProject?: string;
};

export type ListCommandOutcome = {
  result: ListCommandResult;
  exitCode: 0 | 1;
};

const MANIFEST_PATH = "_speclite/_config/manifest.yaml";
const SKILL_INDEX_PATH = "_speclite/_config/skill-index.json";
const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export async function runListCommand(input: {
  options?: ListCommandOptions;
  runtime?: ListCommandRuntime;
  targetDirectory?: string;
} = {}): Promise<ListCommandOutcome> {
  const cwd = input.runtime?.cwd ?? process.cwd();
  const normalizedTarget = normalizeTargetDirectory({
    cwd,
    ...(input.targetDirectory === undefined ? {} : { targetDirectory: input.targetDirectory }),
  });
  const targetProject = await resolveTargetProjectDisplayName({
    targetRoot: normalizedTarget.targetRoot,
    ...(input.runtime?.targetProject === undefined ? {} : { explicitName: input.runtime.targetProject }),
  });
  const modules = await discoverOfficialModules({ projectRoot: PACKAGE_ROOT });
  const manifest = await readManifest(normalizedTarget.targetRoot);
  const skillIndex = await readSkillIndex(normalizedTarget.targetRoot);
  const data = createListData({
    modules,
    ...(manifest === undefined ? {} : { manifest }),
    ...(skillIndex === undefined ? {} : { skillIndex }),
  });

  return createListCommandResult({
    targetProject,
    summary: "SpecLite list returned canonical modules, skills, IDE targets and versions.",
    nextActions: ["Use speclite install or speclite init to apply project-level configuration changes."],
    data,
  });
}

function createListData(input: {
  modules: OfficialModule[];
  manifest?: Manifest;
  skillIndex?: SkillIndex;
}): ListCommandData {
  const installedBySkill = new Map(input.skillIndex?.entries.map((entry) => [entry.canonicalSkillId, entry]) ?? []);
  const packageVersion = readPackageVersion();

  return {
    modules: input.modules.map((module) => ({
      moduleId: module.code,
      name: module.name,
      description: module.description,
      version: module.version,
      sourceDirectory: module.sourceDirectory,
      required: module.required,
      defaultSelected: module.defaultSelected,
      skillCount: module.packageRoots.length,
    })),
    skills: input.modules.flatMap((module) =>
      module.helpEntries.map((entry) => {
        const installed = installedBySkill.get(entry.canonicalSkillId);
        return {
          canonicalSkillId: entry.canonicalSkillId,
          moduleId: module.code,
          displayName: entry.displayName,
          phaseIds: uniqueSorted([
            entry.phaseId,
            ...(installed?.phaseIds ?? []),
          ]),
          ...(installed === undefined ? {} : { sourcePackagePath: installed.sourcePackagePath }),
          ...(installed === undefined ? {} : { installedTargets: installed.installedTargets }),
        };
      }),
    ),
    ideTargets: getIdeAdapterRegistry().map((adapter) => ({
      id: adapter.id,
      targetDirectory: adapter.targetDirectory,
      targetOrder: adapter.targetOrder,
    })),
    versions: [
      { name: "@fancyliu/speclite", version: packageVersion },
      ...input.modules.map((module) => ({
        name: `module:${module.code}`,
        version: module.version,
      })),
    ],
    installedState: {
      manifestPresent: input.manifest !== undefined,
      installedModules: input.manifest?.installedModules ?? [],
      installedSkillCount: input.skillIndex?.entries.length ?? 0,
    },
  };
}

async function readManifest(projectRoot: string): Promise<Manifest | undefined> {
  try {
    return ManifestSchema.parse(parseYaml(await readFile(path.join(projectRoot, MANIFEST_PATH), "utf8")));
  } catch {
    return undefined;
  }
}

async function readSkillIndex(projectRoot: string): Promise<SkillIndex | undefined> {
  try {
    return SkillIndexSchema.parse(JSON.parse(await readFile(path.join(projectRoot, SKILL_INDEX_PATH), "utf8")));
  } catch {
    return undefined;
  }
}

function readPackageVersion(): string {
  const require = createRequire(import.meta.url);
  const packageJson = require("../../package.json") as { version?: unknown };
  return typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}
