# Manage Installed Project（管理已安装项目）

本文说明安装完成后，如何用 Epic 7 引入的 Post-MVP governance commands 管理已安装 SpecLite 项目。

如果你还没有安装 SpecLite，先看 [`../quick-start.md`](../quick-start.md)。如果你只需要常规 update 或 repair，先看 [`update-and-repair.md`](update-and-repair.md)。

## Command Selection（命令选择）

| Goal | Command | Writes by default |
|---|---|---|
| 查看 canonical modules、skills、IDE targets 和版本 | `speclite list` | 否 |
| 创建或重建项目 config plan | `speclite init` | 否，需 `--yes` |
| 执行比 `validate` 更丰富的诊断 | `speclite doctor` | 否 |
| 对齐 source projections 和 IDE mirrors | `speclite sync` | 否，需 `--yes` |
| 移除 installer-owned SpecLite 文件 | `speclite uninstall` | 否，需 `--yes` |
| 生成流程治理覆盖报告 | `speclite governance-report` | 否 |

这些命令都接受 `[target-directory]`。建议显式传入目标项目路径，避免把当前工作目录误当作 target project root。

## Inspect Catalog（查看目录）

查看当前 CLI 携带的 canonical modules、skills、IDE targets、版本，以及目标项目已安装状态：

```sh
speclite list /path/to/project
speclite list /path/to/project --json
```

`list --json` 的 `data` 包含：

- `modules`
- `skills`
- `ideTargets`
- `versions`
- `installedState`

如果只想确认项目是否安装健康，使用 `status` 或 `validate`；`list` 更适合查可用目录和版本投影。

## Initialize Config（初始化配置）

先生成 plan：

```sh
speclite init /path/to/project --dry-run
```

授权非冲突写入：

```sh
speclite init /path/to/project --yes
```

`init` 会围绕这些文件生成 plan：

- `_speclite/config.toml`
- `_speclite/config.user.toml`
- `_speclite/custom/config.toml`
- `_speclite/custom/config.user.toml`

它会读取现有 manifest/files index，保护 human-owned custom files。遇到 conflict 时，不要手工覆盖；先阅读 `initPlan.actions`、`conflicts` 和 `nextActions`。

## Run Doctor（运行诊断）

本地丰富诊断：

```sh
speclite doctor /path/to/project
speclite doctor /path/to/project --json
```

`doctor` 默认复用 local validation evidence。需要远程 freshness/provenance revalidation 时，必须显式请求并授权：

```sh
speclite doctor /path/to/project --revalidate-source --yes
```

如果只加 `--revalidate-source` 而不加 `--yes`，命令会停在 external access authorization gate，并在 `issues` 中返回 `source-integrity.external-access-not-authorized`。

## Sync Projections（同步投影）

先查看 source-to-mirror reconciliation plan：

```sh
speclite sync /path/to/project --dry-run
```

授权非冲突 installer-owned writes：

```sh
speclite sync /path/to/project --yes
```

`sync` 用于对齐 installed source projections 和 IDE mirrors。它不是 `update --repair` 的别名，也不会隐藏 repair semantics。出现 conflict 时，先处理 conflict，不要绕过 ownership model。

## Uninstall Safely（安全卸载）

先查看卸载计划：

```sh
speclite uninstall /path/to/project --dry-run
```

授权移除 installer-owned files：

```sh
speclite uninstall /path/to/project --yes
```

`uninstall` 只移除 files index 和 ownership model 判定为 installer-owned 的路径。human-owned 和 workflow-owned paths 会进入 `preservedPaths` 或 manual action，不会被静默删除。

卸载后应人工检查：

- `removedPaths`
- `preservedPaths`
- `issues`
- `nextActions`

## Governance Report（治理报告）

生成本地流程治理覆盖报告：

```sh
speclite governance-report /path/to/project
speclite governance-report /path/to/project --json
```

治理报告只读取本地 installed-state evidence，包括 manifest、phase coverage、workflow artifact contract 和 validate evidence。它不评价文档内容质量、人工 review 是否充分，也不定义 hosted dashboard 或数据库服务。

## Automation Notes（自动化注意事项）

自动化中只读取 `CommandResult` JSON：

```sh
speclite list /path/to/project --json
speclite init /path/to/project --dry-run --json
speclite doctor /path/to/project --json
speclite sync /path/to/project --dry-run --json
speclite uninstall /path/to/project --dry-run --json
speclite governance-report /path/to/project --json
```

判断写入类命令时，至少读取：

- `requiresConfirmation`
- `writeAuthorized`
- `changedPaths` 或 `removedPaths`
- `conflicts`
- `completedSteps` / `failedStep` / `pendingSteps`

自动化不要解析 human-readable output，也不要把 `summary` 当作稳定 contract。字段细节见 [`../reference/command-result-json.md`](../reference/command-result-json.md)。
