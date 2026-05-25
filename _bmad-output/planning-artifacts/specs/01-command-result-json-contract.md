# CommandResult JSON Contract（命令结果 JSON 契约）

## Status（状态）

已接受用于 MVP planning。

## Ownership（所有权）

本 SPEC 是 MVP user-facing commands 输出的 public JSON 的 canonical contract。

- PRD 负责 product requirement 和 acceptance intent。
- Architecture 负责 implementation mapping 和 module responsibility。
- 本 SPEC 负责 field schema、ordering、path policy、timestamp policy、compatibility 和 fixture comparison rules。
- 如果 PRD 或 Architecture 文本与本 SPEC 冲突，public JSON behavior 以本 SPEC 为准。

Related contracts：

- `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 负责 `SourceDescriptor` trust 和 evidence semantics。
- `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` 负责 pre-write planning、external access 和 write authorization semantics。
- `_bmad-output/planning-artifacts/specs/04-manifest-index-contract.md` 负责 manifest/index installed-state projections。
- `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 负责 `ValidationIssue` category 和 issue id semantics。
- `_bmad-output/planning-artifacts/specs/06-resolve-command-contract.md` 负责 `speclite resolve` exception behavior。
- `_bmad-output/planning-artifacts/specs/08-fixture-contract.md` 负责 fixture layout 和 snapshot comparison policy。

本 SPEC 中的 public projection snippets 是 `CommandResult` 暴露的 JSON fields 的快照。它们不是 domain objects 的独立 semantic sources。如果 projection snippet 与 related contract 冲突，domain semantics 以 related contract 为准，并且必须修正本 SPEC 以保持一致。

## Executable Contract Anchor（可执行契约锚点）

本 Markdown SPEC 仍是 canonical contract。Implementation 必须提供单一 executable schema module，作为此 contract 的 implementation anchor。

MVP implementation anchor：

- `src/diagnostics/command-result-schema.ts`

该 module 必须定义以下 runtime schemas：

- `CommandResult`
- `ValidationIssue`
- command-specific `data` payloads
- public projection types referenced by command data

JSON reporters、fixture assertions 和 contract tests 必须复用此 schema module。它们不得各自 hand-roll separate field checks。

Executable schema module 不是第二个 contract source。如果 schema module 与本 SPEC 冲突，以本 SPEC 为准，并且必须修正 schema module。

Schema module 不得添加本 SPEC 未声明的 public JSON fields。Public JSON additions 必须遵循以下顺序：

1. 更新本 SPEC。
2. 更新 executable schema module。
3. 更新 fixture expected outputs 或 contract tests。

除非本 SPEC 和 `src/diagnostics/command-result-schema.ts` 在同一变更中更新，否则不得 merge 会改变 public JSON behavior 的 reporter 或 fixture changes。Fixture snapshots 是 contract 的 evidence，不是 contract source。

MVP 不维护单独的 JSON Schema file。如果未来 external consumers 需要 published JSON Schema，它必须从 executable schema module 生成，或以其他方式证明与 executable schema module 等价，同时本 SPEC 仍是 semantic source。

Executable schema module 必须先于 JSON reporters、fixture assertions 或 contract tests 对 `CommandResult` 的依赖而引入。Reporter implementations 不得先 hand-roll public field validation，再随后 retrofit schema module。

## Scope（范围）

Covered commands：

- `speclite install --json`
- `speclite status --json`
- `speclite validate --json`
- `speclite update --json`
- `speclite update --repair --json`

Explicit exception：

- `speclite resolve` 不使用 `CommandResult`。它是 installed skills 的 runtime support command。它的 stdout 必须保持为 pure resolve-result JSON；diagnostics 使用 `ValidationIssue` shape，以 JSON Lines 输出到 stderr。

## MVP CLI Flag Matrix（MVP CLI Flag 矩阵）

| Command（命令） | MVP flags（MVP flags） | JSON behavior（JSON 行为） | Write behavior（写入行为） |
| --- | --- | --- | --- |
| `speclite install` | `--json`、`--yes` | `--json` 输出 `CommandResult<InstallCommandData>`。 | Write-capable；必须先通过 runtime/platform guard、source resolution plan、install plan、operation lock 和 explicit confirmation / `--yes`。 |
| `speclite status` | `--json` | `--json` 输出 `CommandResult<StatusCommandData>`。 | Read-only；默认不检查 project operation lock，不执行 full validation。 |
| `speclite validate` | `--json` | `--json` 输出 `CommandResult<ValidateCommandData>`。 | Read-only；可以报告 stale lock warning，但不得自动删除 lock。 |
| `speclite update` | `--json`、`--yes`、`--dry-run` | `--json` 输出 `CommandResult<UpdateCommandData>`。 | Write-capable；普通 dry-run、交互确认前或脚本模式缺少 `--yes` 时必须保留 unapplied plan，并保持 `writeAuthorized: false`。 |
| `speclite update --repair` | `--json`、`--yes`、`--dry-run` | `--json` 输出 `CommandResult<RepairCommandData>`，且 `command` 为 `update.repair`。 | Write-capable；只修复可安全恢复或重建的 installer-owned drift。 |
| `speclite resolve config` | `--project-root`、`--key` | 不使用 `CommandResult`；stdout 只输出 resolve-result JSON，stderr 输出 JSON Lines diagnostics。 | Read-only runtime support command。 |
| `speclite resolve customization` | `--project-root`、`--skill`、`--key` | 不使用 `CommandResult`；stdout 只输出 resolve-result JSON，stderr 输出 JSON Lines diagnostics。 | Read-only runtime support command。 |

新增 MVP flag、改变 flag meaning、或让某个 flag 影响 public JSON 字段时，必须先更新对应 owning SPEC，再更新 executable parser/schema 和 fixture expected outputs。

## CommandResult Envelope（命令结果信封）

所有 covered commands 必须输出相同的 top-level envelope：

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

`command` 是 normalized command id，不是 raw argv、shell command string、command alias，或包含 flags 的 string。`speclite update --repair --json` 必须输出 `command: "update.repair"`。

`targetProject` 是 stable display identifier。当存在 trimmed non-empty project config name 时必须使用它；否则 fallback 到 target project directory basename。它不得是 absolute path、empty string、slugified id 或 checkout-root-dependent path。

`data.paths.projectRoot` 必须是 `"."`。

## Schema Evolution（Schema 演进）

`speclite.command-result.v1` 只允许 backward-compatible additive changes。

`v1` 中允许：

- 添加 optional fields。
- 添加 consumers 可以忽略的 optional command-specific `data` subfields。
- 在不改变 existing issue semantics 的前提下添加 new issue ids。

Breaking changes 需要新的 schema version，例如 `speclite.command-result.v2`：

- 删除 field。
- 重命名 field。
- 改变 existing field meaning。
- 收窄 enum。
- 不兼容地改变 field type。
- 添加 required field。

## Command Status（命令状态）

`CommandResult.status` 由 command completion 和 issue severity 派生：

- `failure`：command 无法完成，或存在任何 `error` / `critical` issue。
- `warning`：command 完成，且只存在 `warning` issues。
- `success`：command 完成，且不存在 `warning` / `error` / `critical` issue。

对 `update` 和 `update.repair`，`data.conflicts.length > 0` 也是 blocking failure condition。即使命令是 dry-run 或 `writeAuthorized === false`，`CommandResult.status` 也必须为 `failure`，且 exit code 必须 non-zero。Conflicts 是 planning blockers；automation 不得将带 conflicts 的 plan 视为 successful plan。

当 `data.conflicts.length > 0` 时，`issues` 必须为 conflict set 包含且仅包含一个 command-level blocking issue：

- `issueId`: `update.conflicts`
- `category`: `update`
- `severity`: `error`
- `affectedPath`: omitted
- `details.conflictCount`: number of entries in `data.conflicts`

Command 不得将每个 conflict 重复为独立的 `issues[]` entry。Per-path conflict details 属于 `data.conflicts`。

`operation-lock.project-locked` 不得放入 `data.conflicts`。它是 command-level blocker，不是 path-level update conflict。

当 write-capable command 在获取 project operation lock 之前失败时，reporters 不得像 planning 已安全完成一样输出 `updatePlan`、`repairPlan`、`changedPaths`、`skippedPaths` 或 `conflicts`。Command result 应停留在包含 `issues[]` 和 `nextActions` 的 command-level failure。

Exit code 必须跟随 `CommandResult.status`：

- `failure`：non-zero
- `success`：0
- `warning`：0

对 write-capable commands，`operation-lock.project-locked` 是 blocking `error` issue，必须产生 `CommandResult.status: "failure"` 和 non-zero exit code。对 `validate`，`operation-lock.stale-lock` 可以报告为 `warning`；此时 `validate` 可以返回 `CommandResult.status: "warning"` 和 exit code 0。

`status.data.highLevelHealth` 独立于 `CommandResult.status`。

允许的 `highLevelHealth` values：

- `not-configured`
- `configured`
- `partial`
- `failed`

`not-configured` 是 valid status summary，不是 command failure。如果 `status` 成功判断 SpecLite 未安装，它必须返回 `CommandResult.status: "success"`、exit code 0，并给出推荐 install 的 next action。

`partial` 和 `failed` 不得自动创建 warning issues。Detailed diagnostics 属于显式 `speclite validate`。

`status.data.highLevelHealth` 必须按以下 deterministic aggregation order 计算；first match wins：

1. `not-configured`：`manifestPresent === false`，且本次 lightweight status 没有发现可读的 installed-state manifest。
2. `failed`：manifest/index/source descriptor 形状损坏或不可读，导致 status 无法产生稳定 installed summary；或任何已安装/显式选择的 IDE target summary 为 `failed`。
3. `partial`：manifest 可读，但 installed summary 不完整，例如 `installedModules` 为空、任一已安装/显式选择的 IDE target 为 `not-configured` 或 `partial`，或 required runtime path summary 缺失。
4. `configured`：manifest、source descriptor、installed modules、required runtime paths 和所有已安装/显式选择的 IDE target summary 都可读且为 configured。

该聚合只能使用本地 manifest/index、source descriptor projection、adapter summary 和 required path presence；不得执行 full hash scan、远程 source access、implicit update check 或 repair planning。需要详细错误列表时必须运行 `speclite validate`。

`status` 不提供 full validation category coverage，也不证明 installation healthy。Automation 若需要安装健康断言，必须读取 `data.highLevelHealth`；若需要可修复的问题列表，必须运行 `speclite validate`。

`speclite status --json` 默认不得检查 project operation lock。Lock checks 保留给 write-capable commands 和显式 `speclite validate`，因此 concurrent write operation 本身不会强制 lightweight status output 包含 `operation-lock.project-locked`。

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

`issueId` 必须使用：

```text
<category>.<stable-code>
```

它不得包含 path、IDE target、source name、hash、count、timestamp、random id 或其他 dynamic values。

Dynamic context 必须通过 `affectedPath`、`component` 或 `details` 承载。

### Category（类别）

MVP canonical issue category order：

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

`environment` 用于 runtime/platform guard failures，例如 unsupported Node.js runtime 或 unsupported OS/platform。它是 command-level diagnostic category，不表示 installed state drift。

`source-integrity` 用于 source resolver 或 install planning issues：missing integrity evidence、hash mismatch、lock mismatch、unsupported source、local source self-reference、bundled packaging evidence 缺失、registry/proxy/authentication failure、unreadable tarball/offline bundle 或 Post-MVP source policy rejection。

`file-integrity` 用于 installed files、manifest files index、installer-owned files 或 IDE mirror hash mismatch。

`operation-lock` 用于阻止 safe write-capable operations 的 project-level SpecLite lock problems。

`update` 用于 command-level update 或 repair planning blockers，例如 `update.conflicts`。

这些 categories 不得为彼此的 phase 复用。

### Severity（严重级别）

Severity 具有固定 semantics：

- `critical`：unsafe overwrite、schema corruption、missing required runtime contract，或等价 blocking condition。
- `error`：command 或 validation 无法完成，或 installation unusable。
- `warning`：flow 可以继续，但需要 human action。
- `info`：status note 或 recommendation。

Validation rules 不得在本地重新定义 severity。

### Details（详情）

`details` 仅用于 machine-readable structured context。

它必须是：

- JSON-serializable
- deterministic
- redaction-safe
- stable enough for fixture snapshots when included

它不得包含：

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

`impact` 和 `suggestedNextStep` 是 JSON contract 内的 human-readable fields。它们必须使用 stable short sentence templates。

它们不得包含：

- path
- IDE target
- source name
- timestamp
- stack trace
- hash
- random value
- long-form explanation

Dynamic context 属于 `affectedPath`、`component` 或 `details`。

Human reporters 可以在此 JSON contract 之外渲染更丰富的 prose。

## Command Data Payloads（命令数据载荷）

MVP command-specific `data` payloads 必须是 stable schemas，而不是 `Record<string, unknown>`。

Minimum payload shapes：

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

Per-command data contract：

| Command（命令） | Data type（Data 类型） | Required fields（必填字段） | Optional fields（可选字段） | Non-goals（非目标） |
| --- | --- | --- | --- | --- |
| `install` | `InstallCommandData` | `sourceDescriptor`、`manifestVersion`、`installedModules`、`ideTargets`、`paths`、`completedSteps`、`pendingSteps` | 无；新增 optional fields 必须先更新本 SPEC。 | 不输出未契约化 `readySummary` blob，不输出 timing。 |
| `status` | `StatusCommandData` | `manifestPresent`、`installedModules`、`ideTargets`、`highLevelHealth`、`paths` | `sourceDescriptor`、`manifestVersion` | 不输出 `issueCounts`，不执行 full validation。 |
| `validate` | `ValidateCommandData` | `issueCounts`、`checkedCategories`、`checkedTargets`、`validatedPaths` | 无；新增 optional fields 必须先更新本 SPEC。 | 不访问 remote source，不做 repair。 |
| `update` | `UpdateCommandData` | `updatePlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized` | 无；新增 optional fields 必须先更新本 SPEC。 | 不把 conflicts 复制成多个 command-level issues，不修复 drift。 |
| `update.repair` | `RepairCommandData` | `repairPlan`、`changedPaths`、`skippedPaths`、`conflicts`、`requiresConfirmation`、`writeAuthorized` | 无；新增 optional fields 必须先更新本 SPEC。 | 不修复 human-owned 或 workflow-owned paths，不生成 standalone report artifact。 |

Command data 引用的 nested types 是 public projections。它们是 consumers 可以依赖的唯一字段；internal resolver、installer、validation 和 update models 可以携带额外 private fields，但 reporters 不得把 private fields 泄露到 public JSON。

### Public Projection Types（公开投影类型）

下面的 `SourceDescriptor` 和 `SourceIntegrityEvidence` 是 public JSON projections。Trust、evidence、write eligibility、source type rules 和 validate no-network boundaries 由 `_bmad-output/planning-artifacts/specs/02-source-descriptor-contract.md` 负责。

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
  // 来自 MVP registry 的 stable lower-kebab reason code
  reason: string;
};

type UpdatePlan = {
  actions: Array<{
    affectedPath: string;
    ownership: "installer-owned" | "human-owned" | "workflow-owned";
    action: "create" | "update" | "skip" | "conflict";
    currentHash?: string;
    expectedHash?: string;
    // 当 action 为 "skip" 时 required；来自 MVP registry 的 stable lower-kebab reason code
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
    // 当 action 为 "skip" 时 required；来自 MVP registry 的 stable lower-kebab reason code
    reason?: string;
  }>;
};
```

`SourceDescriptor.contentHash` 只对 content-addressable source artifacts required，例如 local tarballs、offline bundles 和 local source snapshots。Registry 和 Git sources 不得虚构 `contentHash`。

在 install 或 update 写入文件前，`SourceDescriptor.integrityEvidence` 必须至少包含一个 entry。在 MVP 中，`trustStatus: "trusted"` 只能由 expected hash、lock match，或 bundled source 的等价 packaging manifest / package hash / package lock match 产生；MVP contract 不定义通用 trusted source allowlist schema。只有当用户显式选择该 source、至少记录一个 reproducible integrity evidence entry，且未检测到 hash mismatch、lock mismatch、unsupported source、local source self-reference 或 source policy rejection 时，`trustStatus: "unverified"` 才能进入 install 或 update write planning。`verified: false` 表示 evidence 已记录且可复现，但未与 expected hash、lock match 或 bundled packaging trust anchor 匹配。它不得表示 hash mismatch、lock mismatch、local source self-reference、Post-MVP source policy rejection 或 failed verification；这些状态必须产生 `source-integrity` issue 和 `trustStatus: "blocked"`。

Public projection types 中的每个 path 都必须遵循本 SPEC 的 Path Policy。这包括在引用 target project path 时的 `resolvedRoot`、`lockPath`、`targetPath`、`specliteRoot`、`artifactRoot`、`manifestPath`、`affectedPath`，以及任何未来 public path field。

`UpdatePlan` 和 `RepairPlan` 描述 planned effects，不是 execution logs。`RepairPlan` 只能包含 installer-owned actions；human-owned custom files 和 workflow-owned artifacts 不得作为 repairable actions 出现。

Planning model boundaries：

| Model（模型） | Owner（所有者） | Visibility（可见性） | Meaning（含义） |
| --- | --- | --- | --- |
| `InstallPlan` | `_bmad-output/planning-artifacts/specs/03-install-plan-contract.md` | Internal planning contract | Pre-write source resolution、external access declaration、target adapter planning、planned writes、confirmation 和 write authorization。 |
| `UpdatePlan` | 本 SPEC | Public `update --json` projection | 对 automation 可见的 planned update effects；不是 execution log。 |
| `RepairPlan` | 本 SPEC | Public `update --repair --json` projection | 对 automation 可见的 planned installer-owned repair effects；不是 execution log。 |
| `changedPaths` / `skippedPaths` | 本 SPEC | Public command result fields | 仅表示当前 command 的 actual apply result。当 `writeAuthorized === false` 时为空。 |

Normal `update` 必须将 installer-owned drift 视为 conflict；普通 `update` 的 interactive confirmation 或 `--yes` 只授权无 conflict 的 planned update writes，不得把 drift conflict 转成 repair action。只有 command 为 `update --repair`，且 repair writes 通过 interactive confirmation 或 `--yes` 显式授权时，才可以修复 drift。在 `update --repair` 中，可以从 resolved canonical source 和 installer templates 安全 restore 或 regenerate 的 installer-owned drift 应成为 `repairPlan.actions[]` entry，而不是 `conflicts[]` entry。Repair output 中的 `conflicts[]` 保留给无法安全 repair 的 blockers，例如 human-owned 或 workflow-owned paths、unknown ownership、missing source evidence 或 unsupported repair。

`conflicts` 描述 planning diagnostics，不是 apply execution results。它们不依赖 write authorization。Dry-run output 和 `writeAuthorized === false` 的 output 仍必须包含 discovered conflicts，以便 automation 在 applying writes 前检测 blockers。`conflicts` 不得被解释为当前 apply phase 中失败的 paths。

`UpdateCommandData` 和 `RepairCommandData` 中的 `changedPaths` 与 `skippedPaths` 描述当前 command 的 actual execution results，而不是 planned effects。当 `writeAuthorized === false` 时，即使 plan 包含 `update`、`restore-canonical`、`regenerate` 或 `skip` actions，这两个 arrays 也必须为空。Consumers 必须从 `updatePlan.actions` 或 `repairPlan.actions` 派生 planned changes 和 planned skips，而不是从 `changedPaths` 或 `skippedPaths` 派生。

`UpdateCommandData.requiresConfirmation`、`UpdateCommandData.writeAuthorized`、`RepairCommandData.requiresConfirmation` 和 `RepairCommandData.writeAuthorized` 描述 command-level write authorization。Normal dry-run、pending interactive confirmation，或没有 `--yes` 的 script mode 必须在 `UpdatePlan` / `RepairPlan` 中保留真实 planned action；不得将该 action 改写为带 `reason: "not-authorized"` 的 `skip`。

每个 repair action 都 required `RepairPlan.actions[].expectedHash`。`regenerate` 必须先 dry-run candidate content，计算其 expected hash，然后才能进入 repair plan。没有 expected hash 的 repair action 不可审计、不是 snapshot-stable，且不得写入。

当 `action === "skip"` 时，`UpdateConflict.reason` 以及 `UpdatePlan.actions[]` / `RepairPlan.actions[]` 上的 `reason` 仍为 strings，但 SpecLite producers 只能输出下方 MVP reason code registry 中的 codes。Executable schema 和 contract tests 必须在 producer mode 强制执行此 producer rule。Consumer 或 parser mode 必须保持该字段为 string，并容忍 unknown future codes。当遵循此 registry policy 时，new reason codes 是对 `speclite.command-result.v1` 的 backward-compatible additive changes。

Consumers 必须容忍 unknown future reason codes。无法识别某个 code 的 consumer 必须将其保留为 stable display string，不得仅因 code unknown 而 parsing failed。

Reason codes 必须是 stable lower-kebab strings。它们不得包含 paths、hashes、timestamps、source names、IDE targets 或 free-form prose。`skip` actions 必须包含 `reason`；non-`skip` actions 应省略它。Human explanation 属于 human-readable output 或 `suggestedNextStep`。

MVP reason code registry：

- `unchanged`：affected path 已匹配 expected installed state，因此 plan 有意保持不变。
- `installer-owned-drift`：installer-owned path 与 recorded hash 或 expected content 不同，normal update 不得静默覆盖它。
- `human-owned`：affected path 是 human-owned，不得由 automatic update 或 repair planning 变更。
- `workflow-owned`：affected path 是 workflow-owned，不得由 automatic update 或 repair planning 变更。
- `unknown-ownership`：无法从 manifest 或 files index 建立 ownership，因此 automatic mutation 不安全。
- `missing-source-evidence`：缺少 required source integrity evidence，或该 evidence 不足以支持 safe update 或 repair plan。
- `unsupported-repair`：planner 无法为 affected installer-owned path 或 artifact kind 派生 safe repair action。
- `not-authorized`：path-level authorization policy 阻止此 specific path 进入 executable update 或 repair plan。它不得表示 normal dry-run mode、pending confirmation，或没有 `--yes` 的 script mode；这些状态属于 command-level `requiresConfirmation` 和 `writeAuthorized`。

Repair action semantics：

- `restore-canonical` 从 resolved canonical source content restore installer-owned canonical package content，例如 IDE mirror files 或 canonical skill package files。它不是 backup restore。
- `regenerate` 从 current source descriptor 和 installer templates rebuild installer-owned generated metadata/control files，例如 manifest、index、runtime scripts 或 `_speclite` control files。
- `skip` 保持 affected installer-owned path 不变。

`restore-canonical` 需要 resolved canonical source，或能证明 expected content hash 的 installed canonical package baseline。`regenerate` 仅限可从 current source descriptor 和 installer templates 派生的 installer-owned generated metadata/control files。Missing source evidence 或 missing canonical baseline 必须产生 `reason: "missing-source-evidence"`，而不是 repair action。

`status.data` 不得包含 `issueCounts`；issue counts 只属于 `validate.data`。

`validate.data.issueCounts` 必须始终包含全部四个 keys：`info`、`warning`、`error`、`critical`，包括 zero values。

## Ordering Rules（排序规则）

所有 public JSON arrays 都必须声明 ordering rule。如果未声明 special order，则按 normalized stable key 进行 lexicographic sort。

Special orders：

- `issues`：severity order（`critical`、`error`、`warning`、`info`）-> category order -> normalized affected path -> issue id。
- `nextActions`：command-specific priority order：blocking remediation -> recommended next step -> optional exploration；每个 tier 内使用 command-defined stable order。
- `checkedCategories`：canonical issue category order，仅限 validate 实际检查的 categories。
- `checkedTargets`：manifest / adapter registry canonical target order。
- `ideTargets`：与 `checkedTargets` 相同的 canonical target order。
- `validatedPaths`：project-relative POSIX paths 在 normalization 后按 lexicographic sort。
- `sourceDescriptor.integrityEvidence`：source-specific stable order：registry integrity / version lock -> content hash -> git commit；同 kind 的多个 entries 按 normalized stable key 排序。
- `updatePlan.actions`：normalized affected path -> action -> ownership -> reason（如存在）。
- `repairPlan.actions`：normalized affected path -> action -> reason（如存在）。
- `conflicts`：normalized affected path -> ownership -> reason。
- `changedPaths`：normalized project-relative POSIX path。
- `skippedPaths`：normalized project-relative POSIX path。
- `completedSteps`：command-defined stable lifecycle step order，不是 execution timing。
- `pendingSteps`：command-defined stable lifecycle step order，不是 execution timing。
- `installedModules`：source manifest module order；如果不存在，则按 normalized module id lexicographically 排序。

Public JSON arrays 不得依赖 filesystem traversal、object insertion、validation rule execution、adapter completion 或 async completion order。

Duration、elapsed time、per-step timing、p95 measurement 和 profiling samples 默认不属于 stable public JSON。若未来 command payload 显式加入 timing field，该 field 必须在 schema 中标记为 non-stable，并由 fixture comparison normalize 或 exclude；不得把阶段耗时混入 `completedSteps`、`pendingSteps` 或其他 stable lifecycle fields。

## Path Policy（路径策略）

所有 public JSON path fields 必须使用 project-relative POSIX paths。

Covered examples（覆盖示例）：

- `data.paths`
- `data.validatedPaths`
- `data.changedPaths`
- `data.skippedPaths`
- `issues[].affectedPath`
- `updatePlan.actions[].affectedPath`
- `repairPlan.actions[].affectedPath`

`data.paths.projectRoot` 必须是 `"."`。

Absolute local paths、OS-specific separators、home directory paths 和 checkout-root-dependent paths 不得出现在 stable public JSON fields 中。

Public JSON 中的 source display values 也必须 redacted/display-safe。它们不得包含 authentication tokens、credential-bearing URLs、private query strings、local absolute paths、npm cache paths、temporary extraction directories、drive letters 或 home directories。

如果 diagnostics 需要 project-external path，它必须被显式标记为 redacted absolute path，并从 stable fixture snapshot comparison 中排除。

Project-external absolute paths 不得输出到 stable public path fields。如果 command 需要报告此类 path 曾存在，必须在 `details` 中使用 non-snapshot diagnostic object，且 shape 必须完全如下：

```ts
type RedactedExternalPathDiagnostic = {
  kind: "redacted-absolute-path";
  label: string;
  redacted: true;
};
```

该 object 不得包含 original path、home directory、drive letter 或 OS-specific separator。Fixture snapshots 必须省略该 object，或将其作为 non-stable diagnostic field normalize。

## Timestamp Policy（时间戳策略）

Public `CommandResult` JSON 默认不得包含 timestamps。

只有 schema-declared manifest 或 generated metadata fields 可以使用 ISO 8601 timestamps。

Allowed timestamp fields 必须从 stable fixture snapshot comparison 中排除。

以下字段不得依赖 current time：

- `summary`
- `issues[]`
- `issues[].details`
- `impact`
- `suggestedNextStep`
- `nextActions`
- command-specific automation fields

Human-readable output 可以在 stable JSON contract 之外显示时间。

## Summary And Human Output（摘要与人类输出）

`CommandResult.summary` 必须使用 command-specific stable template。它只用于 JSON，不得从 human-readable output 复制。

除非 automation 预期 parse `summary`，否则本 SPEC 不要求每个 command 的 exact prose templates。Automation 必须依赖 command-specific `data`、`status`、`issues` 和 `nextActions`，而不是 summary wording。Fixture snapshots 仍可以为了 producer stability 约束具体 summary strings。

`summary` 不得包含：

- timestamp
- absolute path
- home directory
- environment-specific wording
- random ordering
- unnormalized path

Human-readable output 可以更丰富，但 automation dependencies 必须由 structured `data`、`issues` 或 `nextActions` 表示。

Human-readable output 不得成为 automation-relevant state 出现的唯一位置。如果 script、fixture、CI job 或 installed skill 需要某个 value，该 value 必须在 structured JSON 或 file contract 中表示。

Human-readable output 对 credentials、cache paths、temporary extraction paths、home directories 和 local absolute source paths 应遵循相同的 redaction/display-safe policy。它可以在有用时显示 user-selected target project path，但 public fixture snapshots 仍必须使用 project-relative POSIX paths 或 redacted labels。

Progress events 和 spinner output 不是 MVP automation API。Machine-readable progress `stepId` 是 fixture-observable deterministic signal，用于断言阶段顺序、ready summary gate 和 human-readable output 的稳定性；它不得被当作长期自动化集成 API。Automation 必须改为消费 `CommandResult.data.completedSteps`、`CommandResult.data.pendingSteps`、`speclite resolve` JSON、manifest/index files 或 fixture outputs。

## Fixture Comparison Policy（Fixture 比较策略）

Fixture expected outputs 必须 parse JSON 并比较 semantic fields，而不是 raw bytes。

Stable snapshot comparison 只能忽略明确声明为 non-stable 的字段，例如 allowed generated metadata timestamps。

对于相同 input state 的 repeated runs，以下内容必须 stable：

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

`speclite resolve` 位于 unified `CommandResult` contract 之外。

Required behavior：

- stdout 只包含 resolve-result JSON。
- stderr 以 JSON Lines 输出 diagnostics。
- 每一行 diagnostic 使用 `ValidationIssue` shape。
- 如果 parsing 成功，warning diagnostics 不会使 resolve fail。
- error 或 critical diagnostics 产生 non-zero exit code。

Resolve output formatting preference：

- 2-space indentation
- trailing newline
- non-ASCII characters 不转义

Resolve parity fixtures 应比较 parsed JSON semantics，而不是 byte-for-byte formatting。
