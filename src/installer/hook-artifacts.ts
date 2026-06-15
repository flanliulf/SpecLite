import { constants } from "node:fs";
import { access, lstat, readFile } from "node:fs/promises";
import path from "node:path";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { ensureSafeDirectory, safeWriteFile } from "../fs/safe-write.js";
import type { FilesIndexEntry } from "../manifest/manifest-schema.js";
import type { IdeTargetId } from "../ide/adapter-registry.js";

const HOOK_ID = "flow-gate-enforcement";
const HOOK_SOURCE_ROOT = "hooks/flow-gate-enforcement";
const HOOK_RUNTIME_ROOT = `_speclite/hooks/${HOOK_ID}`;

export type HookArtifactProjectionResult =
  | {
      ok: true;
      files: FilesIndexEntry[];
      changedPaths: string[];
    }
  | {
      ok: false;
      issue: ValidationIssue;
      changedPaths: string[];
    };

export async function detectFlowGateHookConfigConflict(input: {
  projectRoot: string;
  targetIds: IdeTargetId[];
}): Promise<ValidationIssue | undefined> {
  for (const targetId of input.targetIds) {
    const config = createPlatformHookConfig(targetId);
    if (config === undefined) continue;

    const conflict = await detectExistingConfigConflict({
      projectRoot: input.projectRoot,
      relativePath: config.path,
    });
    if (conflict !== undefined) return conflict;
  }

  return undefined;
}

export async function writeFlowGateHookArtifacts(input: {
  projectRoot: string;
  canonicalSourceRoot: string;
  canonicalSourceRefRoot: string;
  targetIds: IdeTargetId[];
}): Promise<HookArtifactProjectionResult> {
  const files: FilesIndexEntry[] = [];
  const changedPaths: string[] = [];
  const sourceRoot = path.join(input.canonicalSourceRoot, HOOK_SOURCE_ROOT);
  const sourceRefRoot = `${input.canonicalSourceRefRoot}/${HOOK_SOURCE_ROOT}`;

  const conflict = await detectFlowGateHookConfigConflict({
    projectRoot: input.projectRoot,
    targetIds: input.targetIds,
  });
  if (conflict !== undefined) return { ok: false, issue: conflict, changedPaths };

  const runtimeDirectory = await ensureSafeDirectory({
    projectRoot: input.projectRoot,
    relativePath: HOOK_RUNTIME_ROOT,
    component: "hook-artifact-writer",
  });
  if (!runtimeDirectory.ok) return { ok: false, issue: runtimeDirectory.issue, changedPaths };

  for (const artifact of [
    { file: "runner.mjs", executable: true, artifactKind: "hook-runner" },
    { file: "hook-manifest.json", executable: false, artifactKind: "hook-source-metadata" },
  ] as const) {
    const contents = await readFile(path.join(sourceRoot, artifact.file));
    const result = await safeWriteFile({
      projectRoot: input.projectRoot,
      relativePath: `${HOOK_RUNTIME_ROOT}/${artifact.file}`,
      contents,
      executable: artifact.executable,
      component: "hook-artifact-writer",
    });
    if (!result.ok) return { ok: false, issue: result.issue, changedPaths };
    changedPaths.push(result.path);
    files.push({
      schemaVersion: "speclite.files-index.v1",
      path: result.path,
      ownership: "installer-owned",
      hash: result.hash,
      hashAlgorithm: "sha256",
      executable: result.executable,
      artifactKind: artifact.artifactKind,
      sourceRef: `${sourceRefRoot}/${artifact.file}`,
    });
  }

  for (const targetId of input.targetIds) {
    const config = createPlatformHookConfig(targetId);
    if (config === undefined) continue;

    const result = await safeWriteFile({
      projectRoot: input.projectRoot,
      relativePath: config.path,
      contents: config.contents,
      component: "hook-config-writer",
    });
    if (!result.ok) return { ok: false, issue: result.issue, changedPaths };
    changedPaths.push(result.path);
    files.push({
      schemaVersion: "speclite.files-index.v1",
      path: result.path,
      ownership: "installer-owned",
      hash: result.hash,
      hashAlgorithm: "sha256",
      executable: false,
      artifactKind: "platform-hook-config",
      sourceRef: config.sourceRef,
    });
  }

  return {
    ok: true,
    files: files.sort((left, right) => left.path.localeCompare(right.path)),
    changedPaths,
  };
}

function createPlatformHookConfig(
  targetId: IdeTargetId,
):
  | {
      path: ".claude/settings.json" | ".codex/hooks.json";
      contents: string;
      sourceRef: string;
    }
  | undefined {
  if (targetId === "claude") {
    return {
      path: ".claude/settings.json",
      sourceRef: "generated:claude-flow-gate-hook-config",
      contents: `${JSON.stringify(
        {
          hooks: {
            UserPromptSubmit: [
              {
                matcher: "",
                hooks: [
                  {
                    type: "command",
                    command: `node ${HOOK_RUNTIME_ROOT}/runner.mjs --platform claude`,
                  },
                ],
              },
            ],
          },
        },
        null,
        2,
      )}\n`,
    };
  }

  if (targetId === "agents") {
    return {
      path: ".codex/hooks.json",
      sourceRef: "generated:codex-flow-gate-hook-config",
      contents: `${JSON.stringify(
        {
          hooks: [
            {
              event: "UserPromptSubmit",
              id: "speclite-flow-gate-enforcement",
              description: "Block speclite-dev-story until story-kickoff Flow Gate evidence passes.",
              command: `node ${HOOK_RUNTIME_ROOT}/runner.mjs --platform codex`,
            },
          ],
        },
        null,
        2,
      )}\n`,
    };
  }

  return undefined;
}

async function detectExistingConfigConflict(input: {
  projectRoot: string;
  relativePath: string;
}): Promise<ValidationIssue | undefined> {
  const absolutePath = path.join(input.projectRoot, input.relativePath);
  try {
    await access(absolutePath, constants.F_OK);
  } catch {
    return undefined;
  }

  const stat = await lstat(absolutePath);
  if (!stat.isFile()) return undefined;

  return {
    issueId: "ide-mirror.hook-config-conflict",
    category: "ide-mirror",
    severity: "error",
    affectedPath: input.relativePath,
    component: "hook-config-writer",
    details: {
      reason: "existing-project-hook-config",
      manualAction:
        "Review the existing project hook config and merge the SpecLite Flow Gate hook manually before rerunning install.",
    },
    impact: "SpecLite will not overwrite existing project-level hook configuration or trust decisions.",
    suggestedNextStep:
      "Keep existing hooks intact, add the SpecLite Flow Gate hook command manually, then rerun speclite install.",
  };
}
