import { constants } from "node:fs";
import { access, lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import type { RuntimeHookDescriptor } from "../config/config-schema.js";
import type { ValidationIssue } from "../diagnostics/command-result-schema.js";
import { ensureSafeDirectory, safeWriteFile } from "../fs/safe-write.js";
import type { IdeTargetId } from "../ide/adapter-registry.js";
import { hashBytes, type FileHash } from "../manifest/hash.js";
import type { FilesIndexEntry } from "../manifest/manifest-schema.js";

const HOOK_PLATFORM_CONFIGS = [".claude/settings.json", ".codex/hooks.json"] as const;
const HOOK_TRUST_NOTE = "Codex 项目 hooks 需要通过 /hooks review/trust 后才会生效。";

type HookRegistryEntry = {
  hookId: string;
  module: string;
  sourceSkill: string;
  protectedSkill?: string;
  protectedSurface?: string;
  description: string;
  sourceRoot: string;
  runtimeRoot: string;
  events: string[];
};

type PlatformHookConfig = {
  path: ".claude/settings.json" | ".codex/hooks.json";
  contents: string;
  sourceRef: string;
};

const HOOK_REGISTRY: HookRegistryEntry[] = [
  {
    hookId: "flow-gate-enforcement",
    module: "sdlc",
    sourceSkill: "speclite-flow-gate",
    protectedSkill: "speclite-dev-story",
    description: "在执行 speclite-dev-story 前检查 story-kickoff Flow Gate 通过证据。",
    sourceRoot: "hooks/flow-gate-enforcement",
    runtimeRoot: "_speclite/hooks/flow-gate-enforcement",
    events: ["UserPromptSubmit"],
  },
  {
    hookId: "canonical-source-change-check",
    module: "support",
    sourceSkill: "speclite-check-canonical-source-change",
    protectedSurface: "assets/source/speclite",
    description: "在 canonical source 发生变更后 warning-only 提醒运行一致性检查。",
    sourceRoot: "hooks/canonical-source-change-check",
    runtimeRoot: "_speclite/hooks/canonical-source-change-check",
    events: ["PostToolUse", "Stop"],
  },
];

export function createRuntimeHookDescriptors(): Record<string, RuntimeHookDescriptor> {
  return Object.fromEntries(HOOK_REGISTRY.map((hook) => [hook.hookId, createRuntimeHookDescriptor(hook)]));
}

export function createFlowGateHookRuntimeDescriptor(): RuntimeHookDescriptor {
  return createRuntimeHookDescriptor(HOOK_REGISTRY[0]);
}

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
  return detectHookConfigConflict(input);
}

export async function detectHookConfigConflict(input: {
  projectRoot: string;
  targetIds: IdeTargetId[];
}): Promise<ValidationIssue | undefined> {
  for (const targetId of input.targetIds) {
    const config = createPlatformHookConfig(targetId);
    if (config === undefined) continue;

    const existingConfig = await readInstallerOwnedHookConfigBaseline({
      projectRoot: input.projectRoot,
      config,
    });
    if (!existingConfig.ok) return existingConfig.issue;
  }

  return undefined;
}

export async function writeFlowGateHookArtifacts(input: {
  projectRoot: string;
  canonicalSourceRoot: string;
  canonicalSourceRefRoot: string;
  targetIds: IdeTargetId[];
}): Promise<HookArtifactProjectionResult> {
  return writeHookArtifacts(input);
}

export async function writeHookArtifacts(input: {
  projectRoot: string;
  canonicalSourceRoot: string;
  canonicalSourceRefRoot: string;
  targetIds: IdeTargetId[];
}): Promise<HookArtifactProjectionResult> {
  const files: FilesIndexEntry[] = [];
  const changedPaths: string[] = [];

  const conflict = await detectHookConfigConflict({
    projectRoot: input.projectRoot,
    targetIds: input.targetIds,
  });
  if (conflict !== undefined) return { ok: false, issue: conflict, changedPaths };

  for (const hook of HOOK_REGISTRY) {
    const sourceRoot = path.join(input.canonicalSourceRoot, hook.sourceRoot);
    const sourceRefRoot = `${input.canonicalSourceRefRoot}/${hook.sourceRoot}`;

    const runtimeDirectory = await ensureSafeDirectory({
      projectRoot: input.projectRoot,
      relativePath: hook.runtimeRoot,
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
        relativePath: `${hook.runtimeRoot}/${artifact.file}`,
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
  }

  for (const targetId of input.targetIds) {
    const config = createPlatformHookConfig(targetId);
    if (config === undefined) continue;

    const existingConfig = await readInstallerOwnedHookConfigBaseline({
      projectRoot: input.projectRoot,
      config,
    });
    if (!existingConfig.ok) return { ok: false, issue: existingConfig.issue, changedPaths };

    const result = await safeWriteFile({
      projectRoot: input.projectRoot,
      relativePath: config.path,
      contents: config.contents,
      component: "hook-config-writer",
      allowExisting: existingConfig.expectedExistingFile !== undefined,
      ...(existingConfig.expectedExistingFile === undefined
        ? {}
        : { expectedExistingFile: existingConfig.expectedExistingFile }),
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

function createRuntimeHookDescriptor(hook: HookRegistryEntry): RuntimeHookDescriptor {
  return {
    module: hook.module,
    source_skill: hook.sourceSkill,
    protected_skill: hook.protectedSkill,
    protected_surface: hook.protectedSurface,
    description: hook.description,
    runtime_root: `{project-root}/${hook.runtimeRoot}`,
    runner: `{project-root}/${hook.runtimeRoot}/runner.mjs`,
    events: [...hook.events],
    platform_configs: [...HOOK_PLATFORM_CONFIGS],
    trust_note: HOOK_TRUST_NOTE,
  };
}

function createPlatformHookConfig(
  targetId: IdeTargetId,
): PlatformHookConfig | undefined {
  if (targetId === "claude") {
    return {
      path: ".claude/settings.json",
      sourceRef: "generated:claude-hook-registry-config",
      contents: `${JSON.stringify({ hooks: createClaudeHooks() }, null, 2)}\n`,
    };
  }

  if (targetId === "agents") {
    return {
      path: ".codex/hooks.json",
      sourceRef: "generated:codex-hook-registry-config",
      contents: `${JSON.stringify({ hooks: createCodexHooks() }, null, 2)}\n`,
    };
  }

  return undefined;
}

function createClaudeHooks(): Record<string, unknown[]> {
  return {
    UserPromptSubmit: [
      {
        matcher: "",
        hooks: [
          {
            type: "command",
            command: "node _speclite/hooks/flow-gate-enforcement/runner.mjs --platform claude",
          },
        ],
      },
    ],
    PostToolUse: [
      {
        matcher: "Write|Edit|MultiEdit",
        hooks: [
          {
            type: "command",
            command: "node _speclite/hooks/canonical-source-change-check/runner.mjs --platform claude --mode warn",
          },
        ],
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command",
            command:
              "node _speclite/hooks/canonical-source-change-check/runner.mjs --platform claude --mode warn --stop-summary",
          },
        ],
      },
    ],
  };
}

function createCodexHooks(): Record<string, unknown[]> {
  return {
    UserPromptSubmit: [
      {
        matcher: "",
        hooks: [
          {
            type: "command",
            command: "node _speclite/hooks/flow-gate-enforcement/runner.mjs --platform codex",
            statusMessage: "Checking SpecLite Flow Gate",
          },
        ],
      },
    ],
    PostToolUse: [
      {
        matcher: "apply_patch|Edit|Write",
        hooks: [
          {
            type: "command",
            command: "node _speclite/hooks/canonical-source-change-check/runner.mjs --platform codex --mode warn",
            statusMessage: "Checking SpecLite canonical source changes",
          },
        ],
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command",
            command:
              "node _speclite/hooks/canonical-source-change-check/runner.mjs --platform codex --mode warn --stop-summary",
            statusMessage: "Summarizing SpecLite canonical source checks",
          },
        ],
      },
    ],
  };
}

async function readInstallerOwnedHookConfigBaseline(input: {
  projectRoot: string;
  config: PlatformHookConfig;
}): Promise<
  | {
      ok: true;
      expectedExistingFile?: {
        ownership: "installer-owned";
        hash: FileHash;
      };
    }
  | {
      ok: false;
      issue: ValidationIssue;
    }
> {
  const absolutePath = path.join(input.projectRoot, input.config.path);
  try {
    await access(absolutePath, constants.F_OK);
  } catch {
    return { ok: true };
  }

  const stat = await lstat(absolutePath);
  if (!stat.isFile()) return { ok: true };

  const contents = await readFile(absolutePath, "utf8");
  if (isRecognizedInstallerOwnedHookConfig({ config: input.config, contents })) {
    return {
      ok: true,
      expectedExistingFile: {
        ownership: "installer-owned",
        hash: hashBytes(contents),
      },
    };
  }

  return {
    ok: false,
    issue: createHookConfigConflictIssue(input.config.path),
  };
}

function isRecognizedInstallerOwnedHookConfig(input: {
  config: PlatformHookConfig;
  contents: string;
}): boolean {
  if (isJsonEquivalent(input.contents, input.config.contents)) return true;

  const parsed = parseJson(input.contents);
  if (parsed === undefined) return false;

  if (input.config.path === ".claude/settings.json") {
    return isDeepStrictEqual(parsed, {
      hooks: {
        UserPromptSubmit: [
          {
            matcher: "",
            hooks: [
              {
                type: "command",
                command: "node _speclite/hooks/flow-gate-enforcement/runner.mjs --platform claude",
              },
            ],
          },
        ],
      },
    });
  }

  return isDeepStrictEqual(parsed, {
    hooks: [
      {
        event: "UserPromptSubmit",
        id: "speclite-flow-gate-enforcement",
        description: "Block speclite-dev-story until story-kickoff Flow Gate evidence passes.",
        command: "node _speclite/hooks/flow-gate-enforcement/runner.mjs --platform codex",
      },
    ],
  });
}

function isJsonEquivalent(left: string, right: string): boolean {
  const leftParsed = parseJson(left);
  const rightParsed = parseJson(right);
  return leftParsed !== undefined && rightParsed !== undefined && isDeepStrictEqual(leftParsed, rightParsed);
}

function parseJson(value: string): unknown | undefined {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function createHookConfigConflictIssue(affectedPath: ".claude/settings.json" | ".codex/hooks.json"): ValidationIssue {
  return {
    issueId: "ide-mirror.hook-config-conflict",
    category: "ide-mirror",
    severity: "error",
    affectedPath,
    component: "hook-config-writer",
    details: {
      reason: "existing-project-hook-config",
      manualAction:
        "Review the existing project hook config and merge the SpecLite hook registry manually before rerunning install.",
    },
    impact: "SpecLite will not overwrite existing project-level hook configuration or trust decisions.",
    suggestedNextStep:
      "Keep existing hooks intact, add the SpecLite hook registry commands manually, then rerun speclite install.",
  };
}
