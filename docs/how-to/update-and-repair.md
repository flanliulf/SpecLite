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

典型 human-readable output 会包含：

```text
SpecLite update
Outcome: plan-ready

Summary
Completed: yes
Writes: no project files changed
User action: required
Output profile: Evidence (key-value)

Issues:
No issues

Next Actions / Next actions:
- Review the update plan, then run `speclite update <target> --yes`.
```

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

## Handle Conflicts（处理冲突）

如果 output 是 `blocked-by-conflict`，不要直接追加普通 `--yes` 试图绕过。先阅读 `Issues`、`conflicts` 和 `Next Actions`：

```text
SpecLite update
Outcome: blocked-by-conflict

Summary
Completed: no
Writes: no project files changed
User action: required

Issues:
[error] severity=error category=update issueId=update.conflicts affectedPath=_speclite/config.toml

Next Actions / Next actions:
- Resolve the blocker before authorizing writes.
```

docs 示例只解释人类输出。脚本、CI 和 gate 判断应使用 `speclite update "$PROJECT_ROOT" --json`、`speclite validate "$PROJECT_ROOT" --json` 以及 `CommandResult` schema。
