# Install Plan Contract（安装计划契约）

## Status（状态）

Draft for MVP implementation.

## Ownership（所有权）

This SPEC defines the internal planning contract for install and update write authorization. It exists to keep source trust decisions, external access, planned writes, and write authorization separate.

CommandResult JSON owns public command output. This install plan contract owns pre-write planning semantics.

## Planning Stages（规划阶段）

Install and update planning has two ordered stages:

1. `SourceResolutionPlan` declares external access intent before network, registry, remote Git, tarball, or bundle resolution happens.
2. `InstallPlan` records the resolved `SourceDescriptor`, selected modules, target adapter plan, planned writes, confirmation state, and write authorization before any file is written.

MVP does not need to expose `SourceResolutionPlan` in public command JSON, but implementation must preserve this ordering. Hidden source downloads, remote freshness checks, or provenance revalidation outside these stages are not allowed.

```ts
type SourceResolutionPlan = {
  requestedSourceType: string;
  // Redacted/display-safe value only.
  requestedSourceValue: string;
  externalAccesses: ExternalAccess[];
  requiresConfirmation: boolean;
  confirmed: boolean;
};
```

## Install Plan（安装计划）

MVP install/update planning must produce an internal plan before writing files:

```ts
type InstallPlan = {
  sourceDescriptor: SourceDescriptor;
  selectedModules: string[];
  targetAdapters: Array<{
    targetId: "claude" | "agents";
    targetDirectory: string;
    status: "planned" | "unsupported" | "failed";
  }>;
  externalAccesses: ExternalAccess[];
  plannedWrites: PlannedWrite[];
  requiresConfirmation: boolean;
  writeAuthorized: boolean;
};

type ExternalAccess = {
  sourceType: string;
  // Redacted/display-safe value only.
  sourceValue: string;
  reason: string;
  confirmationState: "not-required" | "pending" | "confirmed" | "denied";
};

type PlannedWrite = {
  path: string;
  ownership: "installer-owned" | "human-owned" | "workflow-owned";
  action: "create" | "update" | "restore-canonical" | "regenerate" | "skip" | "conflict";
  currentHash?: string;
  expectedHash?: string;
  reason?: string;
};
```

Path fields must use project-relative POSIX paths for target project paths.

`requestedSourceValue` and `ExternalAccess.sourceValue` must be redacted/display-safe. They must not contain authentication tokens, credential-bearing URLs, private query strings, local absolute paths, home directories, drive letters, npm cache paths, temporary extraction paths, or OS-specific separators. Raw source locators may exist only in private in-memory planning state.

## Planning Model Boundaries（规划模型边界）

| Model | Owner | Visibility | Meaning |
| --- | --- | --- | --- |
| `SourceResolutionPlan` | This SPEC | Internal planning contract | External access intent before resolving a source. |
| `InstallPlan` | This SPEC | Internal planning contract | Resolved source descriptor, target adapter plan, planned writes, confirmation, and write authorization before writes. |
| `UpdatePlan` | `docs/specs/01-command-result-json-contract.en.md` | Public command result projection | Planned update effects emitted in `update --json`. |
| `RepairPlan` | `docs/specs/01-command-result-json-contract.en.md` | Public command result projection | Planned repair effects emitted in `update --repair --json`. |
| `changedPaths` / `skippedPaths` | `docs/specs/01-command-result-json-contract.en.md` | Public command result fields | Actual apply result for the current command only. |

Internal `InstallPlan.plannedWrites` may include private planning detail. Public reporters must project only the fields declared in the CommandResult JSON contract.

## Authorization Semantics（授权语义）

`requiresConfirmation` and `writeAuthorized` describe command-level write authorization only.

`--yes` or interactive confirmation authorizes planned writes. It must not automatically accept an unverified source, floating Git source, unsupported source, failed evidence verification, or source policy rejection.

Unverified source selection is a separate source selection decision. It must be represented by `SourceDescriptor.trustStatus: "unverified"` plus recorded reproducible evidence, not by `writeAuthorized`.

## Dry-Run Semantics（Dry Run 语义）

MVP supports plan-before-write semantics.

If the CLI exposes `--dry-run`, it must mean:

- produce the plan
- do not write files
- set `writeAuthorized: false`
- keep real planned actions in the plan
- leave `changedPaths` and `skippedPaths` empty in public command JSON

If no explicit `--dry-run` flag is used, interactive confirmation pending or script mode without `--yes` still behaves as an unapplied plan. It must not rewrite planned actions to `skip` with `reason: "not-authorized"`.

## External Access（外部访问）

Install planning must declare external accesses before executing them when the source requires network, registry, remote Git, tarball, or bundle resolution.

Each external access records source type, source value, reason, and confirmation state.

MVP must not perform hidden source downloads or remote freshness checks outside explicit source resolution, install, or update planning.

## Project Operation Lock（项目操作锁）

Install, update, and repair must acquire a project-level operation lock before planning can write or apply changes. MVP lock path is `_speclite/.lock`.

If the lock cannot be acquired because another SpecLite operation is active, the command must not write files. It must emit an `operation-lock.project-locked` issue and a non-zero failure status for write-capable commands. Public JSON must not include planned writes, update plans, repair plans, changed paths, skipped paths, or conflicts for this failure because safe planning did not begin.

MVP lock file shape:

```ts
type OperationLockFile = {
  schemaVersion: "speclite.operation-lock.v1";
  operation: "install" | "update" | "update.repair";
  pid?: number;
  createdAt: string;
  projectRootHash: string;
};
```

`createdAt` is an ISO 8601 timestamp and must be excluded from stable fixture snapshot comparison. Tests that exercise stale-lock behavior must use an injected or normalized fixture clock; they must not compare the real current time in stable snapshots. `projectRootHash` is derived from the normalized project root and must not expose the original path in public JSON. It is a lock ownership hint only, not a cross-checkout stable public value; fixtures must normalize or ignore it.

`pid` is a best-effort process hint. It must not be the sole stale-lock criterion because PID reuse and cross-platform process visibility can produce false decisions. Stale-lock handling should combine lock age, process checks when available, project ownership hints, and conservative manual action guidance.

The lock file is a volatile installer-owned control file. It must not be recorded in the files index and must not contribute to stable files-index hashes. Validation may inspect its shape and stale state separately. Stale lock handling must be conservative in MVP: report the lock with a suggested manual action rather than deleting it automatically.

`speclite validate` must not fail solely because a stale lock exists. It may report `operation-lock.stale-lock` as a warning. Write-capable commands that cannot acquire the lock must fail with `operation-lock.project-locked`.

`speclite status --json` is a lightweight summary and must not check the project operation lock by default. Lock checks belong to write-capable commands and explicit `speclite validate`.

## Safe Write Semantics（安全写入语义）

Installer-owned file mutation must use safe writes: write candidate content to a temporary file in the same directory, flush when supported, then rename into place. Implementations must not truncate or partially rewrite target files in place.

`changedPaths` includes only paths whose mutation actually completed in the current command. Planned writes that were not attempted or did not complete remain represented in `InstallPlan.plannedWrites`, `UpdatePlan.actions`, or `RepairPlan.actions`; they must not be converted into `skippedPaths` unless the command actually reached a planned skip outcome.

If a write fails after some paths were already changed, the command result must be `failure`; `changedPaths` lists completed mutations, and issues/conflicts describe the blocking failure without pretending the operation was transactional.

MVP does not provide transactional rollback. After a partial write failure, recovery is explicit: users run `speclite validate`, `speclite update`, or `speclite update --repair` after addressing the reported issue. Reporters must not claim rollback happened unless a future explicit rollback feature exists.

Temporary safe-write files must not be recorded in the files index. `validate` may report stale temp files as `file-integrity.stale-temp-file` warning when they require manual cleanup but do not block a safe write. If a stale temp file blocks safe-write target naming, rename, or safe mutation, it must be reported as an `error`. MVP update/repair must not clean lock files or stale temp files automatically.

Operation locks should be released after controlled success or controlled failure. A process crash may leave a stale lock; MVP handles that through `operation-lock.stale-lock` validation warning and manual cleanup guidance, not automatic deletion.

## Repair Source Policy（修复来源策略）

`restore-canonical` requires either a resolved canonical source or an installed canonical package baseline that can prove the expected content hash. It must not reconstruct canonical skill content from stale IDE mirror files.

`regenerate` is allowed only for installer-owned generated metadata/control files that can be derived from the current source descriptor and installer templates.

If source evidence or canonical baseline is missing, the planner must produce a conflict with `reason: "missing-source-evidence"` instead of a repair action.

## Target Status Mapping（目标状态映射）

Target status vocabulary is layer-specific:

| Layer | Field | Values | Meaning |
| --- | --- | --- | --- |
| Install planning | `InstallPlan.targetAdapters[].status` | `planned`, `unsupported`, `failed` | Whether the adapter can participate in the planned write. |
| Installed projection | `PhaseCoverageRow.ideTargets[].status` | `mapped`, `unsupported`, `failed` | Whether an installed phase entry is visible through a target. |
| Status summary | `StatusCommandData.highLevelHealth` / `IdeTargetStatus.status` | `not-configured`, `configured`, `partial`, `failed` | Health summary for an installed project or target. |

These vocabularies must not be reused across layers. `unsupported` means an adapter-declared capability gap, not a write failure. `failed` means an attempted or planned operation failed.

If the user explicitly selected a target and that target is unsupported, install/update planning must produce a blocking error. If a target was not selected or is optional for the current module set, adapter-declared unsupported status may be reported as a warning, info, or known limitation according to `docs/specs/07-validation-issue-taxonomy.en.md`.

## Human-Owned TOML Stubs（人工维护 TOML Stub）

MVP may create human-owned TOML stub files during fresh install when the target path does not exist. This is `create-if-absent` only.

Install, update, and repair must not overwrite, rewrite, reformat, or normalize existing human-owned TOML files such as `_speclite/custom/*.toml` and `_speclite/custom/*.user.toml`. Existing files are read for resolver behavior and protected by ownership metadata.
