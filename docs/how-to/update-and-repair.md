# Update And Repair（更新与修复）

本文说明如何生成 update plan、处理 conflict，并在明确授权后执行 update 或 repair。`update` 和 `update --repair` 都遵守 ownership boundary，不会静默覆盖 human-owned custom files 或 workflow-owned artifacts。

## Before You Start（开始前）

先设置目标项目变量，后续命令直接复制执行：

```sh
PROJECT_ROOT=/path/to/project
```

如果你只想检查现状，先运行 read-only 命令：

```sh
NO_COLOR=1 speclite status "$PROJECT_ROOT"
NO_COLOR=1 speclite validate "$PROJECT_ROOT"
```

## Preview Update Plan（预览更新计划）

不带 `--yes` 的 update 是 prewrite preview，只展示计划，不写项目文件：

```sh
NO_COLOR=1 speclite update "$PROJECT_ROOT"
```

典型 human-readable output（默认 `zh-CN`，`Evidence` 中逐文件的 plan entry 已省略）：

```text
SpecLite update
Outcome（结果）: plan-ready

Summary（摘要）
- 完成状态：已完成
- 写入状态：未写入项目文件
- 用户动作：需要
update plan 已生成，尚未写入项目文件。
命令状态：success
模式：update
输出形式：证据 (compact-table)
plan 状态：plan-ready

Scope（范围）
targetProject=example-project

State（状态）
授权状态
requiresConfirmation=true
writeAuthorized=false
尚未授权写入。确认 plan 后运行 speclite update <target> --yes 授权 non-conflicting planned update writes。
无 conflict

Evidence（证据）
update plan / planned effects（计划影响）
- affectedPath=.agents/skills/speclite-help/SKILL.md; ownership=installer-owned; action=skip; currentHash=sha256:…; expectedHash=sha256:…; reason=unchanged; nextAction=无需操作。
```

没有任何 drift 时，`update --repair` 会返回 `no-op`，`requiresConfirmation=false`，且不需要 `--yes`。

## Authorize Update Writes（授权更新写入）

确认计划只包含 non-conflicting installer-owned writes 后，再显式授权：

```sh
NO_COLOR=1 speclite update "$PROJECT_ROOT" --yes
```

写入后立即执行 validation flow：

```sh
NO_COLOR=1 speclite validate "$PROJECT_ROOT"
```

## Preview Repair Plan（预览修复计划）

`update --repair` 是显式 repair flow，不是普通 update 的隐藏模式。不带 `--yes` 时只生成 repair plan：

```sh
NO_COLOR=1 speclite update "$PROJECT_ROOT" --repair
```

如果 output 是 `repair-plan-ready`，先确认 repair plan 只恢复 installer-owned drift，再授权：

```sh
NO_COLOR=1 speclite update "$PROJECT_ROOT" --repair --yes
NO_COLOR=1 speclite validate "$PROJECT_ROOT"
```

Repair plan 会把 human-owned custom files 和 workflow-owned artifacts 列为 `action: "skip"`，`reason` 为 `human-owned` 或 `workflow-owned`。这些 protected paths 不是 conflict，也不会阻断其余 installer-owned drift 的修复；授权写入后它们出现在 `skippedPaths` 中，内容保持不变。安装器在 fresh install 创建的 `_speclite/custom/config.toml`、`_speclite/custom/config.user.toml` 与 `.gitignore` 同样按 skip 处理。

## Handle Conflicts（处理冲突）

`conflicts` 只保留真正无法安全处理的 blocker：unknown ownership、path escape、missing source evidence 和 unsupported repair。Protected ownership 本身不会产生 conflict。

如果 output 是 `blocked-by-conflict`，不要直接追加普通 `--yes` 试图绕过。先阅读 `Issues`、`conflicts` 和 `Next Actions`：

```text
SpecLite update
Outcome（结果）: blocked-by-conflict

Summary（摘要）
- 完成状态：未完成
- 写入状态：未写入项目文件
- 用户动作：需要
conflict 阻止写入授权；普通 --yes 不能绕过 conflict。

Issues（问题）
[error] severity=error category=update issueId=update.conflicts details=conflictCount=1;...

Next Actions（下一步）
- 先修复 blocker（affectedPath=<path>; reason=<reason>）。
```

`update.conflicts` 的 `data.conflicts[]` 会给出每个 conflict 的 `affectedPath`、`ownership` 与 `reason`（例如 `unknown-ownership`、`missing-source-evidence`），含义见 [`../reference/validation-issues.md`](../reference/validation-issues.md)。

docs 示例只解释人类输出。脚本、CI 和 gate 判断应使用 `speclite update "$PROJECT_ROOT" --json`、`speclite validate "$PROJECT_ROOT" --json` 以及 `CommandResult` schema。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| CLI 参数参考 | [`../reference/cli.md`](../reference/cli.md) |
| JSON 消费者参考 | [`../reference/command-result-json.md`](../reference/command-result-json.md) |
| 文件所有权解释 | [`../explanation/file-ownership-model.md`](../explanation/file-ownership-model.md) |
| issue id 与 reason code 参考 | [`../reference/validation-issues.md`](../reference/validation-issues.md) |
| 安装验证 | [`validate-installation.md`](validate-installation.md) |
