# CI And Enterprise Automation（CI 与企业自动化）

本文说明 CI 和企业自动化工具链如何安全消费 SpecLite 的 machine-readable output。核心适用范围是本地执行 `speclite status --json`、`speclite validate --json`、`speclite update --json` 和 `speclite update --repair --json` 后读取 `CommandResult` JSON。

本文不定义 hosted service、enterprise dashboard、GitHub Action package 或 SaaS integration。自动化只能使用现有 public JSON contract；不要解析 human-readable output，不得定义企业私有 status semantics。

## Contract Boundary（契约边界）

所有 covered commands 的 JSON output 都使用同一个 envelope：

```json
{
  "schemaVersion": "speclite.command-result.v1",
  "status": "success",
  "command": "status",
  "targetProject": "example-project",
  "issues": [],
  "data": {}
}
```

CI 判断必须遵守三层语义：

| Layer | Stable fields | Automation rule |
|---|---|---|
| Command envelope | `CommandResult.status`、`issues` | 判断 command 是否完成、是否有 blocking issue、exit code 是否应为 non-zero。 |
| Command-specific data | `status.data.highLevelHealth`、`validate.data.issueCounts`、`update.data.conflicts` | 判断对应 command 的业务状态。 |
| Human-readable output | 无 stable contract | 不作为 CI contract；不要解析 human-readable output。 |

新增 automation data field 时，必须先更新 owning SPEC，再更新 `src/diagnostics/command-result-schema.ts`、parser/schema tests 和 fixture expected outputs。不得直接从 reporter 或文档示例反推新字段。

## Status Health（Status 健康判断）

`speclite status --json` 是 lightweight installed-state summary。它可以成功读取“未安装”或“不完整”状态，因此 `CommandResult.status: "success"` 和 `issues: []` 不等价于安装健康。

CI 应读取 `status.data.highLevelHealth`：

| `status.data.highLevelHealth` | CI meaning |
|---|---|
| `configured` | Lightweight installed-state summary 可作为通过条件。 |
| `not-configured` | 项目尚未安装 SpecLite；需要运行 install。 |
| `partial` | manifest 可读，但 installed summary 不完整；需要运行 validate。 |
| `failed` | status 无法产生稳定 installed summary；需要运行 validate 或 repair。 |

示例 gate：

```js
const status = JSON.parse(stdout);
const statusCiPass =
  status.schemaVersion === "speclite.command-result.v1" &&
  status.command === "status" &&
  status.status === "success" &&
  status.data.highLevelHealth === "configured";
```

如果需要详细 issue list，不要从 `status` 推断，改运行 `speclite validate --json`。

## Validate Coverage（Validate 覆盖字段）

`speclite validate --json` 是自动化验证安装健康的主入口。CI 应读取：

| Field | Automation rule |
|---|---|
| `validate.data.issueCounts` | 根据 `error` 和 `critical` 判断 blocking failure；可按团队策略处理 `warning`。 |
| `validate.data.checkedCategories` | 确认本次覆盖了所需 validation categories。 |
| `validate.data.checkedTargets` | 确认本次覆盖了所需 IDE targets。 |
| `validate.data.validatedPaths` | 确认关键 project-relative POSIX paths 被纳入验证。 |

示例 gate：

```js
const validate = JSON.parse(stdout);
const counts = validate.data.issueCounts;
const validateCiPass =
  validate.schemaVersion === "speclite.command-result.v1" &&
  validate.command === "validate" &&
  counts.error === 0 &&
  counts.critical === 0 &&
  validate.data.checkedCategories.includes("manifest-schema") &&
  validate.data.checkedTargets.includes("agents") &&
  validate.data.checkedTargets.includes("claude");
```

`validate.data.validatedPaths` 中的 paths 必须是 project-relative POSIX paths。Automation artifact 不得记录 home directory、absolute checkout root、package cache path、temporary extraction path、credential-bearing URL 或 raw private source URL。

## Update Lifecycle（Update 生命周期）

`speclite update --json` 和 `speclite update --repair --json` 需要区分计划、执行、conflict 和 no-op。不要只看 command name 或 human output。

| Scenario | Stable fields |
|---|---|
| Unapplied plan | `update.data.updatePlan.actions.length > 0`、`changedPaths: []`、`writeAuthorized: false`、`conflicts: []` |
| Applied result | `writeAuthorized: true`、`changedPaths` 非空、`conflicts: []` |
| Conflict | `CommandResult.status: "failure"`、`update.data.conflicts.length > 0`、`issues` 只包含一个 command-level `update.conflicts` |
| No-op | plan 或 repair actions 全部为 `skip`，`changedPaths: []`，`conflicts: []` |

Conflict 示例：

```json
{
  "status": "failure",
  "command": "update",
  "issues": [
    {
      "issueId": "update.conflicts",
      "category": "update",
      "severity": "error",
      "details": {
        "conflictCount": 2
      },
      "impact": "Update planning found one or more path-level conflicts.",
      "suggestedNextStep": "Inspect the conflict details before authorizing update writes."
    }
  ],
  "data": {
    "conflicts": [
      {
        "affectedPath": ".agents/skills/speclite-help/SKILL.md",
        "ownership": "human-owned",
        "reason": "human-owned"
      },
      {
        "affectedPath": "_speclite/config.toml",
        "ownership": "installer-owned",
        "reason": "installer-owned-drift"
      }
    ]
  }
}
```

Path-level conflicts 属于 `update.data.conflicts` 或 `repair.data.conflicts`。不要把每个 path-level conflict 当成多个 command-level issues。

## Post-MVP Governance Commands（Post-MVP 治理命令）

Epic 7 新增的治理命令同样使用 `CommandResult` envelope，但不要把它们混同为 MVP local validation gate。

| Command | Automation use | Boundary |
|---|---|---|
| `speclite doctor --json` | 读取 richer diagnostics 和 `externalAccesses`。 | 不替代 `validate --json` 的 local-only contract；remote revalidation 需要 `--revalidate-source --yes`。 |
| `speclite sync --json` | 读取 `syncPlan.actions`、`changedPaths`、`conflicts` 和 write authorization。 | 不等价于 `update --repair`。 |
| `speclite uninstall --json` | 读取 `uninstallPlan.actions`、`removedPaths`、`preservedPaths` 和 write authorization。 | 只移除 installer-owned paths。 |
| `speclite init --json` | 读取 config init plan、conflicts 和 step lifecycle。 | 不静默覆盖 human-owned custom files。 |
| `speclite list --json` | 读取 canonical modules、skills、IDE targets、versions 和 installed-state summary。 | 不作为安装健康 gate。 |
| `speclite governance-report --json` | 读取 governance metrics、phase gaps、artifact checks 和 validate issue counts。 | 只证明本地 contract evidence，不证明人工执行质量。 |

## Exit Code Policy（Exit Code 策略）

Exit code 跟随 `CommandResult.status`：

| `CommandResult.status` | Exit code |
|---|---|
| `success` | `0` |
| `warning` | `0` |
| `failure` | non-zero |

对 `update` 和 `update.repair`，只要 `data.conflicts.length > 0`，就是 blocking failure。即使没有写入、即使只是 dry-run，也不得把带 conflicts 的 plan 视为成功 plan。

## Artifact Safety（产物安全）

CI logs、reports 和 artifacts 可以记录 stable fields，但必须保持 redaction-safe：

- Paths 使用 project-relative POSIX form，例如 `_speclite/config.toml`。
- Source metadata 使用 public redacted label，例如 `redacted-git-remote`。
- 不记录 home directory、absolute checkout root、package cache path、temporary extraction path、credential-bearing URL、raw private source URL、stack trace、timestamp、random id 或 environment secret value。
- JSON snippets 保持无 ANSI、无图标、稳定排序；需要排序时使用 schema/parser 输出后的字段顺序，不从 human-readable output 抽取。

## Recommended CI Flow（推荐 CI 流程）

```sh
speclite status /path/to/project --json
speclite validate /path/to/project --json
speclite update /path/to/project --json
speclite governance-report /path/to/project --json
```

推荐策略：

1. 先运行 `status --json`，只用 `status.data.highLevelHealth` 做 lightweight gate。
2. 对 `configured` 以外的状态运行 `validate --json`，读取 `validate.data.issueCounts` 和 coverage fields。
3. 对 release 或 update preview 运行 `update --json`，读取 `update.data.updatePlan.actions`、`update.data.changedPaths`、`update.data.skippedPaths` 和 `update.data.conflicts`。
4. 需要流程治理证据时运行 `governance-report --json`，读取 metrics 和 phase gaps，不解析 human-readable report。
5. 只有在人工或自动策略明确允许时，才运行带 `--yes` 的 write-capable command。
