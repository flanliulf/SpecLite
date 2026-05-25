# CommandResult JSON Contract（命令结果 JSON 契约）

## Status（状态）

Accepted for MVP planning.

## Ownership（所有权）

This SPEC is the canonical contract for public JSON emitted by MVP user-facing commands.

- PRD owns product requirement and acceptance intent.
- Architecture owns implementation mapping and module responsibility.
- This SPEC owns field schema, ordering, path policy, timestamp policy, compatibility, and fixture comparison rules.
- If PRD or architecture text conflicts with this SPEC, this SPEC wins for public JSON behavior.

Related contracts:

- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.en.md` owns `SourceDescriptor` trust and evidence semantics.
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.en.md` owns pre-write planning, external access, and write authorization semantics.
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.en.md` owns manifest/index installed-state projections.
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.en.md` owns `ValidationIssue` category and issue id semantics.
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.en.md` owns the `speclite resolve` exception behavior.
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.en.md` owns fixture layout and snapshot comparison policy.

Public projection snippets in this SPEC are snapshots of the JSON fields exposed by `CommandResult`. They are not independent semantic sources for domain objects. If a projection snippet conflicts with its related contract, the related contract wins for domain semantics and this SPEC must be corrected to match it.

## Executable Contract Anchor（可执行契约锚点）

This Markdown SPEC remains the canonical contract. The implementation must provide a single executable schema module as the implementation anchor for this contract.

MVP implementation anchor:

- `src/diagnostics/command-result-schema.ts`

This module must define runtime schemas for:

- `CommandResult`
- `ValidationIssue`
- command-specific `data` payloads
- public projection types referenced by command data

JSON reporters, fixture assertions, and contract tests must reuse this schema module. They must not each hand-roll separate field checks.

The executable schema module is not a second contract source. If the schema module and this SPEC conflict, this SPEC wins, and the schema module must be corrected.

The schema module must not add public JSON fields that are not declared in this SPEC. Public JSON additions must follow this order:

1. Update this SPEC.
2. Update the executable schema module.
3. Update fixture expected outputs or contract tests.

Reporter or fixture changes that alter public JSON behavior must not be merged unless this SPEC and `src/diagnostics/command-result-schema.ts` are updated in the same change. Fixture snapshots are evidence for the contract, not the contract source.

MVP does not maintain a separate JSON Schema file. If external consumers later need a published JSON Schema, it must be generated from or otherwise proven equivalent to the executable schema module, while this SPEC remains the semantic source.

The executable schema module must be introduced before JSON reporters, fixture assertions, or contract tests depend on `CommandResult`. Reporter implementations must not hand-roll public field validation and then retrofit the schema module later.

## Scope（范围）

Covered commands:

- `speclite install --json`
- `speclite status --json`
- `speclite validate --json`
- `speclite update --json`
- `speclite update --repair --json`

Explicit exception:

- `speclite resolve` does not use `CommandResult`. It is a runtime support command for installed skills. Its stdout must remain pure resolve-result JSON; diagnostics go to stderr as JSON Lines using the `ValidationIssue` shape.

## CommandResult Envelope（命令结果信封）

All covered commands must emit the same top-level envelope:

```ts
type CommandId =
  | "install"
  | "status"
  | "validate"
  | "update"
  | "update.repair";

type CommandResult<TData> = {
  schemaVersion: "speclite.command-result.v1";
  status: "success" | "warning" | "failure";
  command: CommandId;
  targetProject: string;
  summary: string;
  issues: ValidationIssue[];
  nextActions: string[];
  data: TData;
};
```

`command` is a normalized command id, not raw argv, a shell command string, a command alias, or a string containing flags. `speclite update --repair --json` must emit `command: "update.repair"`.

`targetProject` is a stable display identifier. It must use the trimmed non-empty project config name when present; otherwise it falls back to the target project directory basename. It must not be an absolute path, an empty string, a slugified id, or a checkout-root-dependent path.

`data.paths.projectRoot` must be `"."`.

## Schema Evolution（Schema 演进）

`speclite.command-result.v1` allows only backward-compatible additive changes.

Allowed in `v1`:

- Add optional fields.
- Add optional command-specific `data` subfields that consumers can ignore.
- Add new issue ids without changing existing issue semantics.

Breaking changes require a new schema version such as `speclite.command-result.v2`:

- Delete a field.
- Rename a field.
- Change an existing field meaning.
- Narrow an enum.
- Change a field type incompatibly.
- Add a required field.

## Command Status（命令状态）

`CommandResult.status` is derived from command completion and issue severity:

- `failure`: command cannot complete, or any `error` / `critical` issue exists.
- `warning`: command completes and only `warning` issues exist.
- `success`: command completes and no `warning` / `error` / `critical` issue exists.

For `update` and `update.repair`, `data.conflicts.length > 0` is also a blocking failure condition. `CommandResult.status` must be `failure` and the exit code must be non-zero even when the command is a dry-run or `writeAuthorized === false`. Conflicts are planning blockers; automation must not treat a plan with conflicts as a successful plan.

When `data.conflicts.length > 0`, `issues` must include exactly one command-level blocking issue for the conflict set:

- `issueId`: `update.conflicts`
- `category`: `update`
- `severity`: `error`
- `affectedPath`: omitted
- `details.conflictCount`: number of entries in `data.conflicts`

The command must not duplicate each conflict as a separate `issues[]` entry. Per-path conflict details belong in `data.conflicts`.

`operation-lock.project-locked` must not be placed in `data.conflicts`. It is a command-level blocker, not a path-level update conflict.

When a write-capable command fails before acquiring the project operation lock, reporters must not emit `updatePlan`, `repairPlan`, `changedPaths`, `skippedPaths`, or `conflicts` as if planning had safely completed. The command result should stop at command-level failure with `issues[]` and `nextActions`.

Exit code must follow `CommandResult.status`:

- `failure`: non-zero
- `success`: 0
- `warning`: 0

For write-capable commands, `operation-lock.project-locked` is a blocking `error` issue and must produce `CommandResult.status: "failure"` with a non-zero exit code. For `validate`, `operation-lock.stale-lock` may be reported as a `warning`; in that case `validate` may return `CommandResult.status: "warning"` and exit code 0.

`status.data.highLevelHealth` is independent from `CommandResult.status`.

Allowed `highLevelHealth` values:

- `not-configured`
- `configured`
- `partial`
- `failed`

`not-configured` is a valid status summary, not a command failure. If `status` successfully determines that SpecLite is not installed, it must return `CommandResult.status: "success"`, exit code 0, and a next action recommending install.

`partial` and `failed` must not automatically create warning issues. Detailed diagnostics belong to explicit `speclite validate`.

`status.data.highLevelHealth` must be computed with this deterministic aggregation order; first match wins:

1. `not-configured`: `manifestPresent === false`, and this lightweight status run did not find a readable installed-state manifest.
2. `failed`: the manifest/index/source descriptor shape is corrupted or unreadable, preventing status from producing a stable installed summary; or any installed/explicitly selected IDE target summary is `failed`.
3. `partial`: the manifest is readable, but the installed summary is incomplete, such as empty `installedModules`, any installed/explicitly selected IDE target in `not-configured` or `partial`, or missing required runtime path summary.
4. `configured`: the manifest, source descriptor, installed modules, required runtime paths, and all installed/explicitly selected IDE target summaries are readable and configured.

This aggregation may only use local manifest/index data, source descriptor projection, adapter summary, and required path presence; it must not run a full hash scan, remote source access, implicit update check, or repair planning. Detailed issue lists require `speclite validate`.

`status` does not provide full validation category coverage and does not prove that installation is healthy. Automation that needs a health assertion must read `data.highLevelHealth`; automation that needs actionable findings must run `speclite validate`.

`speclite status --json` must not check the project operation lock by default. Lock checks are reserved for write-capable commands and explicit `speclite validate`, so a concurrent write operation does not by itself force lightweight status output to include `operation-lock.project-locked`.

## ValidationIssue Model（验证问题模型）

```ts
type ValidationIssue = {
  issueId: string;
  category: string;
  severity: "info" | "warning" | "error" | "critical";
  affectedPath?: string;
  component?: string;
  details?: Record<string, unknown>;
  impact: string;
  suggestedNextStep: string;
};
```

### Issue Id（问题 ID）

`issueId` must use:

```text
<category>.<stable-code>
```

It must not include path, IDE target, source name, hash, count, timestamp, random id, or other dynamic values.

Dynamic context must be carried by `affectedPath`, `component`, or `details`.

### Category（类别）

MVP canonical issue category order:

1. `environment`
2. `manifest-schema`
3. `source-integrity`
4. `ide-mirror`
5. `runtime-path`
6. `menu-target`
7. `legacy-namespace`
8. `artifact-path`
9. `file-integrity`
10. `operation-lock`
11. `update`

`environment` is for runtime/platform guard failures such as unsupported Node.js runtime or unsupported OS/platform. It is a command-level diagnostic category and does not represent installed state drift.

`source-integrity` is for source resolver or install planning issues: missing integrity evidence, hash mismatch, lock mismatch, unsupported source, local source self-reference, missing bundled packaging evidence, registry/proxy/authentication failure, unreadable tarball/offline bundle, or Post-MVP source policy rejection.

`file-integrity` is for installed files, manifest files index, installer-owned files, or IDE mirror hash mismatch.

`operation-lock` is for project-level SpecLite lock problems that prevent safe write-capable operations.

`update` is for command-level update or repair planning blockers such as `update.conflicts`.

These categories must not be reused for each other's phase.

### Severity（严重级别）

Severity has fixed semantics:

- `critical`: unsafe overwrite, schema corruption, missing required runtime contract, or equivalent blocking condition.
- `error`: command or validation cannot complete, or the installation is unusable.
- `warning`: flow can continue but human action is needed.
- `info`: status note or recommendation.

Validation rules must not redefine severity locally.

### Details（详情）

`details` is for machine-readable structured context only.

It must be:

- JSON-serializable
- deterministic
- redaction-safe
- stable enough for fixture snapshots when included

It must not contain:

- human-readable long text
- absolute path
- home directory
- stack trace
- raw exception object
- environment variable value
- credential or token
- timestamp
- random id
- non-deterministic field

### Impact And Suggested Next Step（影响与建议动作）

`impact` and `suggestedNextStep` are human-readable fields inside the JSON contract. They must use stable short sentence templates.

They must not contain:

- path
- IDE target
- source name
- timestamp
- stack trace
- hash
- random value
- long-form explanation

Dynamic context belongs in `affectedPath`, `component`, or `details`.

Human reporters may render richer prose outside this JSON contract.

## Command Data Payloads（命令数据载荷）

MVP command-specific `data` payloads must be stable schemas, not `Record<string, unknown>`.

Minimum payload shapes:

```ts
type InstallCommandData = {
  sourceDescriptor: SourceDescriptor;
  manifestVersion: string;
  installedModules: string[];
  ideTargets: IdeTargetStatus[];
  paths: CommandPathSummary;
  completedSteps: string[];
  pendingSteps: string[];
};

type StatusCommandData = {
  sourceDescriptor?: SourceDescriptor;
  manifestPresent: boolean;
  manifestVersion?: string;
  installedModules: string[];
  ideTargets: IdeTargetStatus[];
  highLevelHealth: "not-configured" | "configured" | "partial" | "failed";
  paths: CommandPathSummary;
};

type ValidationIssueCounts = {
  info: number;
  warning: number;
  error: number;
  critical: number;
};

type IssueCategory =
  | "environment"
  | "manifest-schema"
  | "source-integrity"
  | "ide-mirror"
  | "runtime-path"
  | "menu-target"
  | "legacy-namespace"
  | "artifact-path"
  | "file-integrity"
  | "operation-lock"
  | "update";

type ValidateCommandData = {
  issueCounts: ValidationIssueCounts;
  checkedCategories: IssueCategory[];
  checkedTargets: string[];
  validatedPaths: string[];
};

type UpdateCommandData = {
  updatePlan: UpdatePlan;
  changedPaths: string[];
  skippedPaths: string[];
  conflicts: UpdateConflict[];
  requiresConfirmation: boolean;
  writeAuthorized: boolean;
};

type RepairCommandData = {
  repairPlan: RepairPlan;
  changedPaths: string[];
  skippedPaths: string[];
  conflicts: UpdateConflict[];
  requiresConfirmation: boolean;
  writeAuthorized: boolean;
};
```

The nested types referenced by command data are public projections. They are the only fields that consumers may depend on; internal resolver, installer, validation, and update models may carry additional private fields, but reporters must not leak private fields into public JSON.

### Public Projection Types（公开投影类型）

`SourceDescriptor` and `SourceIntegrityEvidence` below are public JSON projections. Trust, evidence, write eligibility, source type rules, and validate no-network boundaries are owned by `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.en.md`.

```ts
type SourceDescriptor = {
  sourceType:
    | "npm"
    | "private-registry"
    | "local-tarball"
    | "offline-bundle"
    | "git"
    | "bundled"
    | "local";
  channel?: string;
  requestedVersion?: string;
  version?: string;
  resolvedRoot?: string;
  contentHash?: string;
  integrityEvidence: SourceIntegrityEvidence[];
  trustStatus: "trusted" | "unverified" | "blocked";
};

type SourceIntegrityEvidence =
  | {
      kind: "registry-integrity";
      packageName: string;
      version: string;
      integrity: string;
      verified: boolean;
    }
  | {
      kind: "version-lock";
      packageName: string;
      version: string;
      lockPath: string;
      verified: boolean;
    }
  | {
      kind: "content-hash";
      algorithm: "sha256";
      value: string;
      verified: boolean;
    }
  | {
      kind: "git-commit";
      commitSha: string;
      verified: boolean;
    };

type IdeTargetStatus = {
  id: string;
  status: "not-configured" | "configured" | "partial" | "failed";
  targetPath?: string;
  skillCount?: number;
};

type CommandPathSummary = {
  projectRoot: ".";
  specliteRoot?: string;
  artifactRoot?: string;
  manifestPath?: string;
};

type UpdateConflict = {
  affectedPath: string;
  ownership: "installer-owned" | "human-owned" | "workflow-owned" | "unknown";
  currentHash?: string;
  expectedHash?: string;
  // stable lower-kebab reason code from the MVP registry
  reason: string;
};

type UpdatePlan = {
  actions: Array<{
    affectedPath: string;
    ownership: "installer-owned" | "human-owned" | "workflow-owned";
    action: "create" | "update" | "skip" | "conflict";
    currentHash?: string;
    expectedHash?: string;
    // required when action is "skip"; stable lower-kebab reason code from the MVP registry
    reason?: string;
  }>;
};

type RepairPlan = {
  actions: Array<{
    affectedPath: string;
    ownership: "installer-owned";
    currentHash?: string;
    expectedHash: string;
    action: "restore-canonical" | "regenerate" | "skip";
    // required when action is "skip"; stable lower-kebab reason code from the MVP registry
    reason?: string;
  }>;
};
```

`SourceDescriptor.contentHash` is required only for content-addressable source artifacts such as local tarballs, offline bundles, and local source snapshots. Registry and Git sources must not fabricate `contentHash`.

`SourceDescriptor.integrityEvidence` must contain at least one entry before an install or update writes files. In MVP, `trustStatus: "trusted"` is produced only by an expected hash, lock match, or the equivalent packaging manifest / package hash / package lock match for bundled source; the MVP contract does not define a general trusted source allowlist schema. `trustStatus: "unverified"` may still enter install or update write planning only when the user explicitly selected that source, at least one reproducible integrity evidence entry is recorded, and no hash mismatch, lock mismatch, unsupported source, local source self-reference, or source policy rejection was detected. `verified: false` means the evidence is recorded and reproducible but not matched against an expected hash, lock match, or bundled packaging trust anchor. It must not represent hash mismatch, lock mismatch, local source self-reference, Post-MVP source policy rejection, or failed verification; those states must produce a `source-integrity` issue and `trustStatus: "blocked"`.

Every path in public projection types must follow the Path Policy in this SPEC. This includes `resolvedRoot` when it refers to a target project path, `lockPath`, `targetPath`, `specliteRoot`, `artifactRoot`, `manifestPath`, `affectedPath`, and any future public path field.

`UpdatePlan` and `RepairPlan` describe planned effects, not execution logs. `RepairPlan` may only include installer-owned actions; human-owned custom files and workflow-owned artifacts must not appear as repairable actions.

Planning model boundaries:

| Model | Owner | Visibility | Meaning |
| --- | --- | --- | --- |
| `InstallPlan` | `_bmad-output/planning-artifacts/specs/03-install-plan-contract.en.md` | Internal planning contract | Pre-write source resolution, external access declaration, target adapter planning, planned writes, confirmation, and write authorization. |
| `UpdatePlan` | This SPEC | Public `update --json` projection | Planned update effects visible to automation; not an execution log. |
| `RepairPlan` | This SPEC | Public `update --repair --json` projection | Planned installer-owned repair effects visible to automation; not an execution log. |
| `changedPaths` / `skippedPaths` | This SPEC | Public command result fields | Actual apply result for the current command only. Empty when `writeAuthorized === false`. |

Normal `update` must treat installer-owned drift as a conflict; interactive confirmation or `--yes` for normal `update` only authorizes conflict-free planned update writes and must not convert a drift conflict into a repair action. Drift may be repaired only when the command is `update --repair` and repair writes are explicitly authorized through interactive confirmation or `--yes`. In `update --repair`, installer-owned drift that can be safely restored or regenerated from the resolved canonical source and installer templates should become a `repairPlan.actions[]` entry, not a `conflicts[]` entry. `conflicts[]` in repair output is reserved for blockers that cannot be safely repaired, such as human-owned or workflow-owned paths, unknown ownership, missing source evidence, or unsupported repair.

`conflicts` describe planning diagnostics, not apply execution results. They do not depend on write authorization. Dry-run output and output with `writeAuthorized === false` must still include discovered conflicts so automation can detect blockers before applying writes. `conflicts` must not be interpreted as paths that failed during the current apply phase.

`changedPaths` and `skippedPaths` in `UpdateCommandData` and `RepairCommandData` describe actual execution results for the current command, not planned effects. When `writeAuthorized === false`, both arrays must be empty even if the plan contains `update`, `restore-canonical`, `regenerate`, or `skip` actions. Consumers must derive planned changes and planned skips from `updatePlan.actions` or `repairPlan.actions`, not from `changedPaths` or `skippedPaths`.

`UpdateCommandData.requiresConfirmation`, `UpdateCommandData.writeAuthorized`, `RepairCommandData.requiresConfirmation`, and `RepairCommandData.writeAuthorized` describe command-level write authorization. A normal dry-run, a pending interactive confirmation, or script mode without `--yes` must keep the real planned action in `UpdatePlan` / `RepairPlan`; it must not rewrite that action to `skip` with `reason: "not-authorized"`.

`RepairPlan.actions[].expectedHash` is required for every repair action. `regenerate` must dry-run candidate content first, compute its expected hash, and only then enter the repair plan. A repair action without an expected hash is not auditable, not snapshot-stable, and must not be written.

`UpdateConflict.reason` and `reason` on `UpdatePlan.actions[]` / `RepairPlan.actions[]` when `action === "skip"` remain strings, but SpecLite producers must emit only codes from the MVP reason code registry below. The executable schema and contract tests must enforce this producer rule in producer mode. Consumer or parser mode must keep the field as a string and tolerate unknown future codes. New reason codes are backward-compatible additive changes to `speclite.command-result.v1` when they follow this registry policy.

Consumers must tolerate unknown future reason codes. A consumer that does not recognize a code must preserve it as a stable display string and must not fail parsing only because the code is unknown.

Reason codes must be stable lower-kebab strings. They must not contain paths, hashes, timestamps, source names, IDE targets, or free-form prose. `skip` actions must include `reason`; non-`skip` actions should omit it. Human explanation belongs in human-readable output or `suggestedNextStep`.

MVP reason code registry:

- `unchanged`: the affected path already matches the expected installed state, so the plan intentionally leaves it unchanged.
- `installer-owned-drift`: an installer-owned path differs from recorded hash or expected content, and normal update must not silently overwrite it.
- `human-owned`: the affected path is human-owned and must not be changed by automatic update or repair planning.
- `workflow-owned`: the affected path is workflow-owned and must not be changed by automatic update or repair planning.
- `unknown-ownership`: ownership cannot be established from manifest or files index, so automatic mutation is unsafe.
- `missing-source-evidence`: required source integrity evidence is missing or not sufficient for a safe update or repair plan.
- `unsupported-repair`: the planner cannot derive a safe repair action for the affected installer-owned path or artifact kind.
- `not-authorized`: path-level authorization policy prevents this specific path from entering an executable update or repair plan. It must not represent normal dry-run mode, pending confirmation, or script mode without `--yes`; those states belong to command-level `requiresConfirmation` and `writeAuthorized`.

Repair action semantics:

- `restore-canonical` restores installer-owned canonical package content, such as IDE mirror files or canonical skill package files, from the resolved canonical source content. It is not backup restore.
- `regenerate` rebuilds installer-owned generated metadata/control files, such as manifest, index, runtime scripts, or `_speclite` control files, from the current source descriptor and installer templates.
- `skip` leaves the affected installer-owned path unchanged.

`restore-canonical` requires either a resolved canonical source or an installed canonical package baseline that proves the expected content hash. `regenerate` is limited to installer-owned generated metadata/control files derivable from the current source descriptor and installer templates. Missing source evidence or missing canonical baseline must produce `reason: "missing-source-evidence"` rather than a repair action.

`status.data` must not contain `issueCounts`; issue counts belong only to `validate.data`.

`validate.data.issueCounts` must always contain all four keys: `info`, `warning`, `error`, `critical`, including zero values.

## Ordering Rules（排序规则）

All public JSON arrays must declare an ordering rule. If no special order is declared, sort by normalized stable key lexicographically.

Special orders:

- `issues`: severity order (`critical`, `error`, `warning`, `info`) -> category order -> normalized affected path -> issue id.
- `nextActions`: command-specific priority order: blocking remediation -> recommended next step -> optional exploration; within each tier, command-defined stable order.
- `checkedCategories`: canonical issue category order, limited to categories actually checked by validate.
- `checkedTargets`: manifest / adapter registry canonical target order.
- `ideTargets`: same canonical target order as `checkedTargets`.
- `validatedPaths`: project-relative POSIX paths sorted lexicographically after normalization.
- `sourceDescriptor.integrityEvidence`: source-specific stable order: registry integrity / version lock -> content hash -> git commit; multiple entries of the same kind sort by normalized stable key.
- `updatePlan.actions`: normalized affected path -> action -> ownership -> reason when present.
- `repairPlan.actions`: normalized affected path -> action -> reason when present.
- `conflicts`: normalized affected path -> ownership -> reason.
- `changedPaths`: normalized project-relative POSIX path.
- `skippedPaths`: normalized project-relative POSIX path.
- `completedSteps`: command-defined stable lifecycle step order, not execution timing.
- `pendingSteps`: command-defined stable lifecycle step order, not execution timing.
- `installedModules`: source manifest module order; if absent, normalized module id lexicographically.

Public JSON arrays must not rely on filesystem traversal, object insertion, validation rule execution, adapter completion, or async completion order.

Duration, elapsed time, per-step timing, p95 measurements, and profiling samples are not stable public JSON by default. If a future command payload explicitly adds a timing field, that field must be marked non-stable in the schema and normalized or excluded by fixture comparison; per-step duration must not be mixed into `completedSteps`, `pendingSteps`, or other stable lifecycle fields.

## Path Policy（路径策略）

All public JSON path fields must use project-relative POSIX paths.

Covered examples:

- `data.paths`
- `data.validatedPaths`
- `data.changedPaths`
- `data.skippedPaths`
- `issues[].affectedPath`
- `updatePlan.actions[].affectedPath`
- `repairPlan.actions[].affectedPath`

`data.paths.projectRoot` must be `"."`.

Absolute local paths, OS-specific separators, home directory paths, and checkout-root-dependent paths must not appear in stable public JSON fields.

Source display values in public JSON must also be redacted/display-safe. They must not contain authentication tokens, credential-bearing URLs, private query strings, local absolute paths, npm cache paths, temporary extraction directories, drive letters, or home directories.

If a project-external path is required for diagnostics, it must be explicitly marked as a redacted absolute path and excluded from stable fixture snapshot comparison.

Project-external absolute paths must not be emitted in stable public path fields. If a command needs to report that such a path existed, it must use a non-snapshot diagnostic object in `details` with this exact shape:

```ts
type RedactedExternalPathDiagnostic = {
  kind: "redacted-absolute-path";
  label: string;
  redacted: true;
};
```

The object must not contain the original path, home directory, drive letter, or OS-specific separator. Fixture snapshots must either omit this object or normalize it as a non-stable diagnostic field.

## Timestamp Policy（时间戳策略）

Public `CommandResult` JSON must not contain timestamps by default.

Only schema-declared manifest or generated metadata fields may use ISO 8601 timestamps.

Allowed timestamp fields must be excluded from stable fixture snapshot comparison.

These fields must not depend on current time:

- `summary`
- `issues[]`
- `issues[].details`
- `impact`
- `suggestedNextStep`
- `nextActions`
- command-specific automation fields

Human-readable output may show time outside the stable JSON contract.

## Summary And Human Output（摘要与人类输出）

`CommandResult.summary` must use a command-specific stable template. It is JSON-only and must not be copied from human-readable output.

The SPEC does not require exact prose templates for each command unless automation is expected to parse `summary`. Automation must depend on command-specific `data`, `status`, `issues`, and `nextActions`, not on summary wording. Fixture snapshots may still constrain concrete summary strings for producer stability.

`summary` must not contain:

- timestamp
- absolute path
- home directory
- environment-specific wording
- random ordering
- unnormalized path

Human-readable output may be richer, but automation dependencies must be represented in structured `data`, `issues`, or `nextActions`.

Human-readable output must not become the only place where automation-relevant state appears. If a script, fixture, CI job, or installed skill needs a value, that value must be represented in structured JSON or a file contract.

Human-readable output should follow the same redaction/display-safe policy for credentials, cache paths, temporary extraction paths, home directories, and local absolute source paths. It may show the user-selected target project path when useful, but public fixture snapshots must still use project-relative POSIX paths or redacted labels.

Progress events and spinner output are not an MVP automation API. Automation must consume `CommandResult`, `speclite resolve` JSON, manifest/index files, or fixture outputs instead.

## Fixture Comparison Policy（Fixture 比较策略）

Fixture expected outputs must parse JSON and compare semantic fields, not raw bytes.

Stable snapshot comparison must ignore only fields explicitly declared as non-stable, such as allowed generated metadata timestamps.

The following must be stable across repeated runs for the same input state:

- `schemaVersion`
- `command`
- `targetProject`
- `status`
- `summary`
- `issues`
- `nextActions`
- command-specific `data`
- public path fields after normalization
- public array ordering

## Resolve Exception（解析命令例外）

`speclite resolve` is outside the unified `CommandResult` contract.

Required behavior:

- stdout contains only resolve-result JSON.
- stderr emits diagnostics as JSON Lines.
- Each diagnostic line uses `ValidationIssue` shape.
- warning diagnostics do not make resolve fail if parsing succeeds.
- error or critical diagnostics produce non-zero exit code.

Resolve output formatting preference:

- 2-space indentation
- trailing newline
- non-ASCII characters not escaped

Resolve parity fixtures should compare parsed JSON semantics, not byte-for-byte formatting.
