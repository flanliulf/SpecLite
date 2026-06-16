# CommandResult JSON（CommandResult JSON）

`--json` 输出使用统一的 `CommandResult` envelope。它面向脚本、CI 和其它工具，不受 locale、human-readable 文本或终端渲染影响。

## Envelope（顶层结构）

所有 covered commands 都共享这些字段：

```json
{
  "schemaVersion": "speclite.command-result.v1",
  "status": "success",
  "command": "validate",
  "targetProject": "example-project",
  "summary": "SpecLite validation completed.",
  "issues": [],
  "nextActions": [],
  "data": {}
}
```

| Field | Meaning |
|---|---|
| `schemaVersion` | 当前稳定值为 `speclite.command-result.v1`。 |
| `status` | `success`、`warning` 或 `failure`。Exit code 跟随该状态。 |
| `command` | 命令 id。`update --repair` 的 command id 是 `update.repair`。 |
| `targetProject` | 面向用户和工具展示的目标项目名。 |
| `summary` | 人类可读摘要；不要把它当作机器契约。 |
| `issues` | `ValidationIssue[]`，用于表达 blocker、warning 或 info。 |
| `nextActions` | 建议动作；面向人类和 agent，不作为稳定状态机。 |
| `data` | 命令专属 payload。 |

## Covered Commands（覆盖命令）

| `command` | CLI Invocation | `data` focus |
|---|---|---|
| `install` | `speclite install --json` | 安装计划、写入授权、changed/skipped paths、source evidence、config 和 ReadyCheck 结果。 |
| `init` | `speclite init --json` | `initPlan.actions`、installed-state summary、changed/skipped paths、conflicts、step lifecycle 和 write authorization。 |
| `list` | `speclite list --json` | canonical modules、skills、IDE targets、versions 和 installed-state summary。 |
| `status` | `speclite status --json` | lightweight installed-state summary，例如 `highLevelHealth`。 |
| `validate` | `speclite validate --json` | `issueCounts`、`checkedCategories`、`checkedTargets` 和 `validatedPaths`。 |
| `doctor` | `speclite doctor --json` | `validate` data 加上 `externalAccesses`。 |
| `update` | `speclite update --json` | `updatePlan.actions`、changed/skipped paths、conflicts、step lifecycle 和 write authorization。 |
| `update.repair` | `speclite update --repair --json` | `repairPlan.actions`、changed/skipped paths、conflicts 和 write authorization。 |
| `sync` | `speclite sync --json` | `syncPlan.actions`、changed/skipped paths、conflicts、step lifecycle 和 write authorization。 |
| `uninstall` | `speclite uninstall --json` | `uninstallPlan.actions`、removed/preserved paths、step lifecycle 和 write authorization。 |
| `governance-report` | `speclite governance-report --json` | governance metrics、phase gaps、artifact checks、issue counts、checked categories、validated paths 和 report scope。 |

## Human Output Boundary（人类输出边界）

Outcome-oriented human output 不改变 `CommandResult` JSON contract。Human renderer 可以根据 locale、terminal profile 和 command outcome 调整标题、empty state、evidence block 和 `Next Actions` prose，但这些变化不得改变 JSON。

| Human-readable concern | JSON rule |
|---|---|
| `--locale zh-CN` / `--locale en-US` | 不改变 `schemaVersion`、`status`、`command`、`issues`、`data` 或 exit code。 |
| `SPECLITE_LOCALE` | 只影响 human-readable output；`--json` 不读取它作为 schema 行为。 |
| `NO_COLOR`、CI、non-TTY、terminal width | 只影响 human display profile；JSON 不含 ANSI、spinner 或 layout fallback。 |
| `Outcome` label | 不作为 JSON 顶层字段。命令状态仍由 `status`、`issues` 和 command-specific `data` 表达。 |
| install target presentation context | 可让 human output 展示目标绝对路径、命令执行目录和 path-safe `Next Actions`；不得作为 enumerable JSON field 输出。 |
| `Next Actions` prose | 可帮助人和 agent 操作者，但不作为稳定状态机或 CI gate。 |
| docs 示例 | 不是 contract source；contract source 是 SPEC、schema、focused tests 和 fixture policy。 |

`resolve config` 和 `resolve customization` 是例外的 runtime support surface：默认 stdout 是 resolved JSON object，而不是 `CommandResult` envelope。只有显式传入 `--human` 时，`resolve` 才渲染 human-readable support frame；此时仍不得改变默认 machine output contract。

## Issue Model（Issue 模型）

`issues` 使用统一 `ValidationIssue` 形态。工具应优先读取 `issueId`、`category`、`severity`、`affectedPath`、`details` 和 `suggestedNextStep`，不要解析 `summary` 或 human-readable output。

稳定路径必须使用 project-relative POSIX form，例如 `_speclite/_config/manifest.yaml`。JSON 中不得依赖 home directory、absolute checkout root、temporary extraction path、credential-bearing URL、raw private source URL、stack trace、timestamp 或 random id。

## Plan And Apply Fields（计划与应用字段）

写入类命令通常暴露 plan/apply 信息：

| Field | Used by | Meaning |
|---|---|---|
| `requiresConfirmation` | `install`、`init`、`update`、`sync`、`uninstall`、`update.repair` | 当前结果是否需要显式授权后才能写入或移除。 |
| `writeAuthorized` | `install`、`init`、`update`、`sync`、`uninstall`、`update.repair` | 本次命令是否已获得 command-level write authorization。 |
| `changedPaths` | `install`、`init`、`update`、`sync`、`update.repair` | 本次已写入或更新的 project-relative paths。 |
| `removedPaths` | `uninstall` | 本次已移除的 installer-owned project-relative paths。 |
| `skippedPaths` | `install`、`init`、`update`、`sync`、`update.repair` | 计划中跳过的 project-relative paths。 |
| `conflicts` | `init`、`update`、`sync`、`update.repair` | 阻止自动写入的 path-level conflicts。 |
| `completedSteps` / `failedStep` / `pendingSteps` | `init`、`update`、`sync`、`uninstall` | 失败或分阶段执行时的 lifecycle evidence。 |

`--dry-run` 或缺少 `--yes` 时，写入类命令应产生 plan，并保持 mutation fields 为空数组或未授权状态。

## Governance Metrics（治理指标）

`governance-report.data.metrics` 包含：

| Field | Meaning |
|---|---|
| `phaseEntryCoverage` | phase coverage 中已映射 phase/target 的比例。 |
| `artifactPresenceRate` | workflow artifact contract 存在且 metadata 有效的比例。 |
| `validatePassRate` | checked validation categories 中未出现 issue 的比例。 |
| `openGapCount` | phase gaps 与 artifact-path issue 的合计数量。 |

治理报告只证明本地 contract evidence，不证明文档内容质量、人工 review 质量或团队真实执行质量。

## Automation Rules（自动化规则）

- 只解析 `CommandResult` JSON，不解析 human-readable output。
- 以 `schemaVersion` 和 `command` 识别 payload。
- 用 `status`、`issues` 和 command-specific `data` 共同决定 gate 结果。
- 不把 `summary`、`nextActions` 或 human renderer 的 `Outcome` 文案当作稳定状态机。
- 对写入类命令，区分 plan、authorized apply、conflict 和 no-op。
- 对 external access，读取 `externalAccesses[].confirmationState`，不要把 `--yes` 以外的信号当作授权。
