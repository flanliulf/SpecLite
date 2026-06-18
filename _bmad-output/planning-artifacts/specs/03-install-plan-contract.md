# Install Plan Contract（安装计划契约）

## Status（状态）

已接受用于 MVP planning。

## Ownership（所有权）

本 SPEC 定义 install 和 update write authorization 的 internal planning contract。它用于保持 source trust decisions、external access、planned writes 和 write authorization 相互分离。

CommandResult JSON 负责 public command output。本 install plan contract 负责 pre-write planning semantics。

## Implementation Anchor（实现锚点）

Implementation 必须提供 `src/installer/install-plan-schema.ts` 作为 `SourceResolutionPlan`、`InstallPlan`、planned writes、confirmation state 和 write authorization 的 executable schema/parser anchor。该 module 不是第二份契约真源；若它与本 SPEC 冲突，以本 SPEC 为准。

## Planning Stages（规划阶段）

Install 和 update planning 包含两个有序阶段：

1. `SourceResolutionPlan` 在 network、registry、remote Git、tarball 或 bundle resolution 发生之前声明 external access intent。
2. `InstallPlan` 在任何文件写入之前记录 resolved `SourceDescriptor`、selected modules、target adapter plan、planned writes、confirmation state 和 write authorization。

MVP 不需要在 public command JSON 中暴露 `SourceResolutionPlan`，但 implementation 必须保留此 ordering。不允许在这些阶段之外执行 hidden source downloads、remote freshness checks 或 provenance revalidation。

```ts
type SourceResolutionPlan = {
  requestedSourceType: string;
  // 仅允许 redacted/display-safe value。
  requestedSourceValue: string;
  externalAccesses: ExternalAccess[];
  requiresConfirmation: boolean;
  confirmed: boolean;
};
```

## Install Plan（安装计划）

MVP install/update planning 必须在写入文件之前生成 internal plan：

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
  // 仅允许 redacted/display-safe value。
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

对 target project paths，path fields 必须使用 project-relative POSIX paths。

`requestedSourceValue` 和 `ExternalAccess.sourceValue` 必须 redacted/display-safe。它们不得包含 authentication tokens、credential-bearing URLs、private query strings、local absolute paths、home directories、drive letters、npm cache paths、temporary extraction paths 或 OS-specific separators。Raw source locators 只能存在于 private in-memory planning state。

Local source 在进入 `InstallPlan` 前必须完成 self-reference guard。Source resolution 不得把 target project 中的 installed-state、execution-plane、workflow-output、dependency、cache、temporary 或 build directories 当作 canonical source root；至少必须阻止 `_speclite/`、`.claude/skills/`、`.agents/skills/`、`_speclite-output/`、fixture output、`node_modules/`、cache、temporary 和 build output。违反该规则时 source 必须被标记为 `blocked`，并产生 `source-integrity.local-source-self-reference`；不得继续进入 planned writes。

## Runtime Config TOML Content（Runtime Config TOML 内容）

Fresh install 和后续 regenerate/repair 生成 `_speclite/config.toml` 与 `_speclite/config.user.toml` 时，必须把这两个文件视为 installer-managed TOML。它们每次安装都会重新生成，用户不得把它们当作持久手写覆盖层。

`_speclite/config.toml` 必须以以下注释块开头，注释块之后再写入 TOML tables：

```toml
# ─────────────────────────────────────────────────────────────────
# 由安装程序管理。每次安装时都会重新生成，请视为只读文件。
#
# 该文件需要提交到代码仓库，适用于项目中的每位开发者。
#
# 直接编辑此文件的内容会在下次安装时被覆盖。
#
# 如需持久修改安装配置，请重新运行安装程序
# （你之前填写的回答会作为默认值保留）。
#
# 如需固定某个值，使其不受安装时回答内容的影响，或添加自定义代理 / 覆盖描述符，请使用：
#   _speclite/custom/config.toml       （团队配置，需提交）
#   _speclite/custom/config.user.toml  （个人配置，已加入 gitignore）
#
# 安装程序绝不会修改这些文件。
# ─────────────────────────────────────────────────────────────────
```

`_speclite/config.user.toml` 必须以以下注释块开头：

```toml
# ─────────────────────────────────────────────────────────────────
# 由安装程序管理。每次安装时都会重新生成，请视为只读文件。
#
# 该文件不应提交到代码仓库（已加入 gitignore），仅适用于你的本地安装，
# 用于保存与你个人相关的安装回答。
#
# 直接编辑此文件的内容会在下次安装时被覆盖。
#
# 如需持久修改某个回答，请重新运行安装程序
# （你之前填写的回答会作为默认值保留）。
#
# 如需固定覆盖某个值，或添加安装程序未知的自定义配置段，请使用：
#   _speclite/custom/config.user.toml
#
# 安装程序绝不会修改该文件。
# ─────────────────────────────────────────────────────────────────
```

Runtime config 中所有表示 target project 内目录的 generated values 必须使用 literal `{project-root}` 前缀，而不是 bare project-relative path，也不得写入真实 absolute path。例如：

```toml
[core]
output_folder = "{project-root}/_speclite-output"

[modules.sdlc]
planning_artifacts = "{project-root}/_speclite-output/planning-artifacts"
implementation_artifacts = "{project-root}/_speclite-output/implementation-artifacts"
devops_artifacts = "{project-root}/_speclite-output/devops-artifacts"
project_knowledge = "{project-root}/docs"
```

`{project-root}` 是 portable runtime token。Resolver、hook runner、installed skills 和 workflow code 在执行 filesystem I/O 前必须把它解析为当前 target project root；public JSON、manifest/index 和 fixture snapshots 不得因此泄露真实 absolute path。

## Runtime Config Descriptor Sections（Runtime Config 描述符段）

`_speclite/config.toml` 必须投射 selected modules 中的 runtime-facing descriptors，至少包括 agent descriptors 和 hook descriptors。Descriptor tables 是 skill/agent 可读配置真源之一，但不替代 canonical source package、skill index、files index 或 platform hook config。

Agent descriptor table 使用 `[agents.<canonicalSkillId>]`。最小字段为：

```ts
type RuntimeAgentDescriptor = {
  module: string;
  team: string;
  name: string;
  title: string;
  icon: string;
  description: string;
};
```

默认 `sdlc` module 必须为每个 source module roster 中的 agent 生成一个 table。例如：

```toml
[agents.speclite-agent-analyst]
module = "sdlc"
team = "software-development"
name = "Alice"
title = "业务分析师"
icon = "📊"
description = "融合波特(Channels Porter)的战略严谨性与明托金字塔原则(Minto's Pyramid Principle)，将每一项发现都建立在可验证的证据之上，并代表所有利益相关者的声音。说话风格如同一位讲述发现过程的寻宝者：为每一条线索而兴奋，在模式浮现后又精准笃定。"
```

Agent descriptor 的 `title` 和 `description` 必须来自 source module metadata 中的 localized display descriptor；若 source metadata 缺少 localized descriptor，implementation 必须先补 source metadata contract 和 fixture，再生成 runtime config，不得在 writer 中硬编码自由翻译。

Hook descriptor table 使用 `[hooks.<hookId>]`。Flow Gate hook 的最小字段为：

```toml
[hooks.flow-gate-enforcement]
module = "sdlc"
source_skill = "speclite-flow-gate"
protected_skill = "speclite-dev-story"
description = "在执行 speclite-dev-story 前检查 story-kickoff Flow Gate 通过证据。"
runtime_root = "{project-root}/_speclite/hooks/flow-gate-enforcement"
runner = "{project-root}/_speclite/hooks/flow-gate-enforcement/runner.mjs"
events = ["UserPromptSubmit"]
platform_configs = [".claude/settings.json", ".codex/hooks.json"]
trust_note = "Codex 项目 hooks 需要通过 /hooks review/trust 后才会生效。"
```

Hook descriptor 只描述 installed runtime expectation 和 user-facing trust boundary。Hook runner、hook source metadata、platform hook config、hash、ownership 和 executable intent 的 integrity 真源仍是 files index。

## Planning Model Boundaries（规划模型边界）

| Model（模型） | Owner（所有者） | Visibility（可见性） | Meaning（含义） |
| --- | --- | --- | --- |
| `SourceResolutionPlan` | 本 SPEC | Internal planning contract | 解析 source 前的 external access intent。 |
| `InstallPlan` | 本 SPEC | Internal planning contract | 写入前的 resolved source descriptor、target adapter plan、planned writes、confirmation 和 write authorization。 |
| `UpdatePlan` | `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` | Public command result projection | `update --json` 输出的 planned update effects。 |
| `RepairPlan` | `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` | Public command result projection | `update --repair --json` 输出的 planned repair effects。 |
| `changedPaths` / `skippedPaths` | `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` | Public command result fields | 仅表示当前命令的 actual apply result。 |

Internal `InstallPlan.plannedWrites` 可以包含 private planning detail。Public reporters 只能 project CommandResult JSON contract 中声明的字段。

## Authorization Semantics（授权语义）

`requiresConfirmation` 和 `writeAuthorized` 只描述 command-level write authorization。

`--yes` 或 interactive confirmation 授权 planned writes。它不得自动接受 unverified source、floating Git source、unsupported source、failed evidence verification 或 source policy rejection。

Unverified source selection 是独立的 source selection decision。它必须由 `SourceDescriptor.trustStatus: "unverified"` 加 recorded reproducible evidence 表达，而不是由 `writeAuthorized` 表达。

## Dry-Run Semantics（Dry Run 语义）

MVP 支持 plan-before-write semantics。

如果 CLI 暴露 `--dry-run`，它必须表示：

- 生成 plan
- 不写入文件
- 设置 `writeAuthorized: false`
- 在 plan 中保留真实 planned actions
- 在 public command JSON 中保持 `changedPaths` 和 `skippedPaths` 为空

如果没有使用显式 `--dry-run` flag，interactive confirmation pending 或没有 `--yes` 的 script mode 仍表现为 unapplied plan。它不得把 planned actions 改写为带 `reason: "not-authorized"` 的 `skip`。

## External Access（外部访问）

当 source 需要 network、registry、remote Git、tarball 或 bundle resolution 时，install planning 必须先声明 external accesses，再执行它们。

每个 external access 记录 source type、source value、reason 和 confirmation state。

MVP 不得在显式 source resolution、install 或 update planning 之外执行 hidden source downloads 或 remote freshness checks。

Post-MVP `speclite doctor --revalidate-source` 使用同一个 `ExternalAccess` shape 表达 remote freshness / provenance revalidation intent。它不得发明第二套 authorization model。`confirmationState: "pending"` 时，doctor 必须停在 external access 前并输出 blocking `source-integrity` issue；只有在 explicit authorization 后才可继续执行 remote check。

`speclite validate` 保持 local-only contract。Doctor 的 external access intent 不得被反向套用到 validate，也不得让 validate 隐式访问 network、registry、remote Git、tarball 或 bundle source。

## Project Operation Lock（项目操作锁）

Install、update 和 repair 在 planning 可以写入或应用变更之前，必须获取 project-level operation lock。MVP lock path 是 `_speclite/.lock`。

Fresh install 中如果 `_speclite/` 尚不存在，install 可以在 target confirmation、source trust / integrity gate 和 final configuration summary confirmation 完成后，创建 `_speclite/` 作为 `_speclite/.lock` 的 parent directory。该受限目录创建是 lock acquisition 的一部分，不是 runtime/config/manifest/mirror mutation。除 lock parent 和 lock file 外，任何 `_speclite` runtime file、config file、manifest/index、artifact directory、IDE mirror 或 source package mutation 仍必须在 lock 获取成功后执行。

MVP project operation lock 是 non-reentrant。即使同一 process 已持有 lock，也不得通过再次执行 public write-capable command 绕过 lock acquisition。若内部 orchestration 需要复用同一次写入流程，必须传递 private lock handle，而不是重新进入 public command path。

Post-MVP write-capable commands `sync` 和 `uninstall` 也必须在写入或移除 installer-owned state 前获取同一个 project operation lock。若未来 `doctor` 增加写入能力，也必须先获取该 lock；当前 doctor 的 default diagnostics 和 pending external access intent 不写入项目，因此不获取 lock。

如果由于另一个 SpecLite operation 正在运行而无法获取 lock，命令不得写入文件。对 write-capable commands，它必须输出 `operation-lock.project-locked` issue 和 non-zero failure status。由于 safe planning 尚未开始，此 failure 的 public JSON 不得包含 planned writes、update plans、repair plans、changed paths、skipped paths 或 conflicts。

MVP lock file shape：

```ts
type OperationLockFile = {
  schemaVersion: "speclite.operation-lock.v1";
  operation: "install" | "update" | "update.repair" | "doctor" | "sync" | "uninstall";
  pid?: number;
  createdAt: string;
  projectRootHash: string;
};
```

`createdAt` 是 ISO 8601 timestamp，必须从 stable fixture snapshot comparison 中排除。测试 stale-lock behavior 时必须使用 injected 或 normalized fixture clock；不得在 stable snapshots 中比较真实当前时间。`projectRootHash` 派生自 normalized project root，且不得在 public JSON 中暴露原始 path。它只是 lock ownership hint，不是 cross-checkout stable public value；fixtures 必须 normalize 或 ignore 它。

`pid` 是 best-effort process hint。它不得作为唯一 stale-lock criterion，因为 PID reuse 和 cross-platform process visibility 可能导致错误判断。Stale-lock handling 应结合 lock age、可用时的 process checks、project ownership hints，以及保守的 manual action guidance。

Lock file 是 volatile installer-owned control file。它不得记录在 files index 中，也不得影响 stable files-index hashes。Validation 可以单独检查它的 shape 和 stale state。MVP 中的 stale lock handling 必须保守：报告该 lock 并提供 suggested manual action，而不是自动删除。

`speclite validate` 不得仅因为 stale lock 存在而失败。它可以将 `operation-lock.stale-lock` 报告为 warning。无法获取 lock 的 write-capable commands 必须以 `operation-lock.project-locked` 失败。

`speclite status --json` 是 lightweight summary，默认不得检查 project operation lock。Lock checks 属于 write-capable commands 和显式 `speclite validate`。

## Safe Write Semantics（安全写入语义）

Installer-owned file mutation 必须使用 safe writes：将 candidate content 写入同一目录下的 temporary file，在支持时 flush，然后 rename into place。Implementations 不得在原位置 truncate 或 partial rewrite target files。

Safe-write temporary files 必须位于 target file 同一目录，文件名必须带 `.speclite-tmp-` 前缀或后缀，并且只能包含 private nonce 或 operation-local id。Temporary filename、nonce、pid、timestamp 或 absolute temp path 不得出现在 public JSON、manifest/index、files index 或 stable fixture snapshots。

`changedPaths` 只包含当前命令中 mutation 实际完成的 paths。未尝试或未完成的 planned writes 仍保留在 `InstallPlan.plannedWrites`、`UpdatePlan.actions` 或 `RepairPlan.actions` 中；除非命令实际到达 planned skip outcome，否则不得将它们转换为 `skippedPaths`。

如果某些 paths 已经变更后 write 失败，command result 必须为 `failure`；`changedPaths` 列出 completed mutations，issues/conflicts 描述 blocking failure，不得假装 operation 是 transactional。

MVP 不提供 transactional rollback。Partial write failure 后，recovery 是显式的：用户在处理 reported issue 后运行 `speclite validate`、`speclite update` 或 `speclite update --repair`。除非未来存在显式 rollback feature，否则 reporters 不得声称发生了 rollback。

Temporary safe-write files 不得记录到 files index。Controlled success 或 controlled failure 应 best-effort 清理 temporary files。若 cleanup failure 只留下不阻塞后续 safe write 的 stale temp file，`validate` 可以将其报告为 `file-integrity.stale-temp-file` warning。如果 stale temp file 阻塞 safe-write target naming、rename 或 safe mutation，必须报告为 `error`。MVP update/repair 不得自动清理 lock files 或 stale temp files。

Operation locks 应在 controlled success 或 controlled failure 后释放。Process crash 可能留下 stale lock；MVP 通过 `operation-lock.stale-lock` validation warning 和 manual cleanup guidance 处理，而不是自动删除。

## Repair Source Policy（修复来源策略）

`restore-canonical` 需要 resolved canonical source，或能够证明 expected content hash 的 installed canonical package baseline。它不得从 stale IDE mirror files 重构 canonical skill content。

`regenerate` 只允许用于可由 current source descriptor 和 installer templates 派生的 installer-owned generated metadata/control files。

如果缺少 source evidence 或 canonical baseline，planner 必须产生带 `reason: "missing-source-evidence"` 的 conflict，而不是 repair action。

## Target Status Mapping（目标状态映射）

Target status vocabulary 按 layer 区分：

| Layer（层） | Field（字段） | Values（取值） | Meaning（含义） |
| --- | --- | --- | --- |
| Install planning | `InstallPlan.targetAdapters[].status` | `planned`, `unsupported`, `failed` | adapter 是否可以参与 planned write。 |
| Installed projection | `PhaseCoverageRow.ideTargets[].status` | `mapped`, `unsupported`, `failed` | installed phase entry 是否可通过 target 可见。 |
| Status summary | `StatusCommandData.highLevelHealth` / `IdeTargetStatus.status` | `not-configured`, `configured`, `partial`, `failed` | installed project 或 target 的 health summary。 |

同名 literal 可以出现在不同 layer，但必须由 layer-scoped type 解释：`InstallPlanningTargetStatus`、`InstalledPhaseCoverageStatus`、`StatusSummaryTargetHealth`。不得把某一层的 `unsupported` 或 `failed` 直接当作另一层语义。`unsupported` 表示 adapter-declared capability gap，不是 write failure。`failed` 表示 attempted 或 planned operation failed。

如果用户显式选择某个 target 且该 target unsupported，install/update planning 必须产生 blocking error。如果 target 未被选择，或对 current module set 来说是 optional，则 adapter-declared unsupported status 可以按 `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` 报告为 warning、info 或 known limitation。

## Human-Owned TOML Stubs（人工维护 TOML Stub）

当 target path 不存在时，MVP 可以在 fresh install 期间创建 human-owned TOML stub files。这仅限 `create-if-absent`，且只适用于 `_speclite/custom/config.toml` 与 `_speclite/custom/config.user.toml` project-level stubs。

`_speclite/custom/config.toml` 创建时必须以以下注释块开头：

```toml
# ─────────────────────────────────────────────────────────────────
# _speclite/config.toml 的团队 / 企业覆盖配置。
#
# 该文件需要提交到代码仓库，适用于项目中的每位开发者。
#
# 表结构会在基础配置之上进行深度合并；键值条目会按 key 合并。
# 示例：覆盖某个 Agent 描述符，或添加一个新 Agent。
#
# [agents.speclite-agent-pm]
# description = "相比叙述式草稿，更偏好简短的项目符号式 PRD。"
# ─────────────────────────────────────────────────────────────────
```

`_speclite/custom/config.user.toml` 创建时必须以以下注释块开头：

```toml
# ─────────────────────────────────────────────────────────────────
# _speclite/config.toml 的个人覆盖配置。
#
# 该文件不应提交到代码仓库（已加入 gitignore），仅适用于你的本地安装。
#
# 其优先级高于基础配置和团队覆盖配置。
# ─────────────────────────────────────────────────────────────────
```

Installer 必须确保 user-scoped TOML 不进入版本控制默认路径：`_speclite/config.user.toml` 和 `_speclite/custom/config.user.toml` 都必须被 target project gitignore 覆盖，或在 install summary / validation 中产生明确 manual action。`_speclite/config.toml` 和 `_speclite/custom/config.toml` 是 team/project 配置，应该提交。

Install、update 和 repair 不得 overwrite、rewrite、reformat 或 normalize 现有 human-owned TOML files，例如 `_speclite/custom/*.toml` 和 `_speclite/custom/*.user.toml`。Existing files 只为 resolver behavior 而读取，并由 ownership metadata 保护。

Fresh install 不得为每个 installed skill 自动创建 `_speclite/custom/{skill}.toml` 或 `_speclite/custom/{skill}.user.toml`。这些 skill-specific stubs 只能由用户手工创建，或由未来显式 customization 命令在更新本 SPEC 后创建。
