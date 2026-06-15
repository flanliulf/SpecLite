import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { resolveTargetProjectDisplayName, createInitCommandResult } from "../diagnostics/command-result.js";
import type {
  InitCommandData,
  InitCommandResult,
  InitPlanAction,
  UpdateConflict,
  ValidationIssue,
} from "../diagnostics/command-result-schema.js";
import { normalizeTargetDirectory } from "../fs/path-normalizer.js";
import { acquireProjectOperationLock } from "../fs/operation-lock.js";
import { safeWriteFile } from "../fs/safe-write.js";
import { serializeConfigToml } from "../config/config-writer.js";
import { createConfigInitializationPlan } from "../installer/config-initialization.js";
import type { PlannedWrite } from "../installer/install-plan-schema.js";
import { hashBytes, hashFile } from "../manifest/hash.js";
import { FilesIndexSchema, ManifestSchema, type FilesIndex, type Manifest } from "../manifest/manifest-schema.js";
import { discoverOfficialModules } from "../modules/module-metadata.js";

export type InitCommandOptions = {
  dryRun?: boolean;
  json?: boolean;
  yes?: boolean;
};

export type InitCommandRuntime = {
  cwd?: string;
  targetProject?: string;
};

export type InitCommandOutcome = {
  result: InitCommandResult;
  exitCode: 0 | 1;
};

const CONFIG_PATH = "_speclite/config.toml";
const USER_CONFIG_PATH = "_speclite/config.user.toml";
const CUSTOM_CONFIG_PATH = "_speclite/custom/config.toml";
const CUSTOM_USER_CONFIG_PATH = "_speclite/custom/config.user.toml";
const MANIFEST_PATH = "_speclite/_config/manifest.yaml";
const FILES_INDEX_PATH = "_speclite/_config/files-index.json";
const INIT_STEPS = ["read-installed-state", "plan-project-config", "write-project-config"] as const;
const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export async function runInitCommand(input: {
  options?: InitCommandOptions;
  runtime?: InitCommandRuntime;
  targetDirectory?: string;
} = {}): Promise<InitCommandOutcome> {
  const cwd = input.runtime?.cwd ?? process.cwd();
  const normalizedTarget = normalizeTargetDirectory({
    cwd,
    ...(input.targetDirectory === undefined ? {} : { targetDirectory: input.targetDirectory }),
  });
  const targetProject = await resolveTargetProjectDisplayName({
    targetRoot: normalizedTarget.targetRoot,
    ...(input.runtime?.targetProject === undefined ? {} : { explicitName: input.runtime.targetProject }),
  });
  const writeRequested = input.options?.yes === true && input.options?.dryRun !== true;
  const modules = await discoverOfficialModules({ projectRoot: PACKAGE_ROOT });
  const installedContext = await readInstalledContext(normalizedTarget.targetRoot);
  const configPlan = await createConfigInitializationPlan({
    targetRoot: normalizedTarget.targetRoot,
    targetProject,
    selectedModules: modules,
  });

  if (!configPlan.ok) {
    return createInitCommandResult({
      targetProject,
      summary: configPlan.summary,
      nextActions: configPlan.nextActions,
      data: emptyInitCommandData(installedContext.installedState, {
        completedSteps: ["read-installed-state"],
        failedStep: "plan-project-config",
        pendingSteps: ["write-project-config"],
      }),
      issues: configPlan.issues,
      commandCompleted: false,
    });
  }

  const desiredContents = new Map([
    [CONFIG_PATH, serializeConfigToml(configPlan.configToml)],
    [USER_CONFIG_PATH, serializeConfigToml(configPlan.configUserToml)],
    [CUSTOM_CONFIG_PATH, "# SpecLite team customization.\n"],
    [CUSTOM_USER_CONFIG_PATH, "# SpecLite user customization.\n"],
  ]);
  const plan = await createInitPlan({
    projectRoot: normalizedTarget.targetRoot,
    plannedWrites: configPlan.plannedWrites,
    desiredContents,
    ...(installedContext.filesIndex === undefined ? {} : { filesIndex: installedContext.filesIndex }),
  });
  const conflicts = plan.actions
    .filter((action) => action.action === "conflict")
    .map((action): UpdateConflict => ({
      affectedPath: action.affectedPath,
      ownership: action.ownership,
      ...(action.currentHash === undefined ? {} : { currentHash: action.currentHash }),
      ...(action.expectedHash === undefined ? {} : { expectedHash: action.expectedHash }),
      reason: action.reason ?? "unsafe-overwrite-risk",
    }));
  const requiresConfirmation = hasWritableAction(plan.actions) && !writeRequested;

  if (!writeRequested || conflicts.length > 0) {
    return createInitCommandResult({
      targetProject,
      summary: summarizeInit({
        writeAuthorized: false,
        conflicts,
        actions: plan.actions,
      }),
      nextActions: [
        "Review the init plan and rerun speclite init --yes to authorize non-conflicting writes.",
        "Run speclite validate after authorized init writes if this project already has installed state.",
      ],
      data: {
        initPlan: { actions: plan.actions },
        installedState: installedContext.installedState,
        changedPaths: [],
        skippedPaths: skippedPaths(plan.actions),
        conflicts,
        completedSteps: ["read-installed-state", "plan-project-config"],
        pendingSteps: ["write-project-config"],
        requiresConfirmation,
        writeAuthorized: false,
      },
    });
  }

  const lock = await acquireProjectOperationLock({
    projectRoot: normalizedTarget.targetRoot,
    operation: "init",
  });
  if (!lock.ok) {
    return createInitCommandResult({
      targetProject,
      summary: "SpecLite init stopped before writing because the project operation lock is held.",
      nextActions: ["Wait for the active operation to finish before rerunning init."],
      data: emptyInitCommandData(installedContext.installedState, {
        completedSteps: ["read-installed-state", "plan-project-config"],
        failedStep: "acquire-operation-lock",
        pendingSteps: ["write-project-config"],
      }),
      issues: [lock.issue],
      commandCompleted: false,
    });
  }

  try {
    const applyResult = await applyInitPlan({
      projectRoot: normalizedTarget.targetRoot,
      actions: plan.actions,
      desiredContents,
      ...(installedContext.filesIndex === undefined ? {} : { filesIndex: installedContext.filesIndex }),
    });
    return createInitCommandResult({
      targetProject,
      summary: summarizeInit({
        writeAuthorized: true,
        conflicts: [],
        actions: plan.actions,
        changedPaths: applyResult.changedPaths,
      }),
      nextActions: ["Run speclite status or speclite validate to inspect installed-state after init."],
      data: {
        initPlan: { actions: plan.actions },
        installedState: installedContext.installedState,
        changedPaths: applyResult.changedPaths,
        skippedPaths: skippedPaths(plan.actions),
        conflicts: [],
        completedSteps: INIT_STEPS.slice(),
        pendingSteps: [],
        requiresConfirmation: false,
        writeAuthorized: true,
      },
      issues: applyResult.issues,
      commandCompleted: applyResult.issues.length === 0,
    });
  } finally {
    await lock.lock.release();
  }
}

async function readInstalledContext(projectRoot: string): Promise<{
  manifest?: Manifest;
  filesIndex?: FilesIndex;
  installedState: InitCommandData["installedState"];
}> {
  const manifest = await readManifest(projectRoot);
  const filesIndex = await readFilesIndex(projectRoot);
  const configLayersRead = [];
  for (const relativePath of [CONFIG_PATH, USER_CONFIG_PATH, CUSTOM_CONFIG_PATH, CUSTOM_USER_CONFIG_PATH]) {
    if (await fileExists(path.join(projectRoot, relativePath))) {
      configLayersRead.push(relativePath);
    }
  }

  return {
    ...(manifest === undefined ? {} : { manifest }),
    ...(filesIndex === undefined ? {} : { filesIndex }),
    installedState: {
      manifestPresent: manifest !== undefined,
      ownershipIndexPresent: filesIndex !== undefined,
      configLayersRead,
      installedModules: manifest?.installedModules ?? [],
      ideTargets: manifest?.targetIds ?? [],
    },
  };
}

async function createInitPlan(input: {
  projectRoot: string;
  plannedWrites: PlannedWrite[];
  filesIndex?: FilesIndex;
  desiredContents: Map<string, string>;
}): Promise<{
  actions: InitPlanAction[];
}> {
  const actions: InitPlanAction[] = [];
  const filesByPath = new Map(input.filesIndex?.entries.map((entry) => [entry.path, entry]) ?? []);

  for (const plannedWrite of input.plannedWrites) {
    const desiredContents = input.desiredContents.get(plannedWrite.path);
    const currentHash = await readCurrentHash(input.projectRoot, plannedWrite.path);
    const expectedHash = desiredContents === undefined ? undefined : hashBytes(desiredContents);

    if (plannedWrite.ownership === "human-owned") {
      actions.push({
        affectedPath: plannedWrite.path,
        ownership: "human-owned",
        action: plannedWrite.action === "skip" ? "skip" : "create",
        ...(currentHash === undefined ? {} : { currentHash }),
        ...(expectedHash === undefined ? {} : { expectedHash }),
        reason: plannedWrite.reason,
      });
      continue;
    }

    const ownershipEntry = filesByPath.get(plannedWrite.path);
    if (currentHash !== undefined && ownershipEntry === undefined) {
      actions.push({
        affectedPath: plannedWrite.path,
        ownership: "unknown",
        action: "conflict",
        currentHash,
        ...(expectedHash === undefined ? {} : { expectedHash }),
        reason: "missing-source-evidence",
      });
      continue;
    }

    if (ownershipEntry !== undefined && ownershipEntry.ownership !== "installer-owned") {
      actions.push({
        affectedPath: plannedWrite.path,
        ownership: ownershipEntry.ownership,
        action: "skip",
        ...(currentHash === undefined ? {} : { currentHash }),
        ...(expectedHash === undefined ? {} : { expectedHash }),
        reason: ownershipEntry.ownership,
      });
      continue;
    }

    actions.push({
      affectedPath: plannedWrite.path,
      ownership: "installer-owned",
      action: currentHash === undefined ? "create" : "update",
      ...(currentHash === undefined ? {} : { currentHash }),
      ...(expectedHash === undefined ? {} : { expectedHash }),
    });
  }

  return { actions };
}

async function applyInitPlan(input: {
  projectRoot: string;
  actions: InitPlanAction[];
  desiredContents: Map<string, string>;
  filesIndex?: FilesIndex;
}): Promise<{
  changedPaths: string[];
  issues: ValidationIssue[];
}> {
  const changedPaths: string[] = [];
  const issues: ValidationIssue[] = [];
  const filesByPath = new Map(input.filesIndex?.entries.map((entry) => [entry.path, entry]) ?? []);

  for (const action of input.actions) {
    if (action.action !== "create" && action.action !== "update") continue;

    const contents = input.desiredContents.get(action.affectedPath);
    if (contents === undefined) continue;
    if (action.affectedPath.startsWith("_speclite/custom/")) {
      await mkdir(path.join(input.projectRoot, path.dirname(action.affectedPath)), { recursive: true });
    }
    const ownershipEntry = filesByPath.get(action.affectedPath);
    const result = await safeWriteFile({
      projectRoot: input.projectRoot,
      relativePath: action.affectedPath,
      contents,
      allowExisting: action.action === "update",
      component: "init-command",
      ...(action.action === "update" && ownershipEntry !== undefined
        ? {
            expectedExistingFile: {
              ownership: ownershipEntry.ownership,
              hash: ownershipEntry.hash as `sha256:${string}`,
            },
          }
        : {}),
    });

    if (!result.ok) {
      issues.push(result.issue);
      break;
    }
    changedPaths.push(result.path);
  }

  return { changedPaths, issues };
}

async function readManifest(projectRoot: string): Promise<Manifest | undefined> {
  try {
    return ManifestSchema.parse(parseYaml(await readFile(path.join(projectRoot, MANIFEST_PATH), "utf8")));
  } catch {
    return undefined;
  }
}

async function readFilesIndex(projectRoot: string): Promise<FilesIndex | undefined> {
  try {
    return FilesIndexSchema.parse(JSON.parse(await readFile(path.join(projectRoot, FILES_INDEX_PATH), "utf8")));
  } catch {
    return undefined;
  }
}

async function readCurrentHash(projectRoot: string, relativePath: string): Promise<`sha256:${string}` | undefined> {
  try {
    return await hashFile(path.join(projectRoot, relativePath));
  } catch {
    return undefined;
  }
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await readFile(targetPath, "utf8");
    return true;
  } catch {
    return false;
  }
}

function emptyInitCommandData(
  installedState: InitCommandData["installedState"],
  lifecycle: {
    completedSteps: string[];
    failedStep?: string;
    pendingSteps: string[];
  },
): InitCommandData {
  return {
    initPlan: { actions: [] },
    installedState,
    changedPaths: [],
    skippedPaths: [],
    conflicts: [],
    completedSteps: lifecycle.completedSteps,
    ...(lifecycle.failedStep === undefined ? {} : { failedStep: lifecycle.failedStep }),
    pendingSteps: lifecycle.pendingSteps,
    requiresConfirmation: false,
    writeAuthorized: false,
  };
}

function hasWritableAction(actions: InitPlanAction[]): boolean {
  return actions.some((action) => action.action === "create" || action.action === "update");
}

function skippedPaths(actions: InitPlanAction[]): string[] {
  return actions.filter((action) => action.action === "skip").map((action) => action.affectedPath);
}

function summarizeInit(input: {
  writeAuthorized: boolean;
  conflicts: UpdateConflict[];
  actions: InitPlanAction[];
  changedPaths?: string[];
}): string {
  if (input.conflicts.length > 0) {
    return "SpecLite init found config ownership conflicts before write. No project files were changed.";
  }
  if (input.writeAuthorized) {
    return (input.changedPaths?.length ?? 0) > 0
      ? "SpecLite init applied authorized project config writes."
      : "SpecLite init completed with authorization; no file mutations were required.";
  }
  if (hasWritableAction(input.actions)) {
    return "SpecLite init produced an unapplied project config plan. No project files were changed.";
  }
  return "SpecLite init found no project config writes to apply.";
}
