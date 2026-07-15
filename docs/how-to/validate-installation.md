# Validate Installation（验证安装）

本文说明如何用 `speclite status` 和 `speclite validate` 检查已安装项目。两个命令都是 read-only flow，不写项目文件。

## Read-Only Summary（只读摘要）

```sh
PROJECT_ROOT=/path/to/project
NO_COLOR=1 speclite status "$PROJECT_ROOT"
```

`status` 适合快速判断 installed-state summary：

```text
SpecLite status
Outcome: installed

Summary
Completed: yes
Writes: no project files changed
User action: not required

Issues:
- No issues

Next Actions / Next actions:
- No action required.
```

如果 outcome 是 `not-installed`、`partial` 或 `failed`，先按 `Next Actions` 运行 `validate` 或回到 install/update flow，不要把 command success 当作安装健康通过。

## Validation Flow（校验流程）

```sh
NO_COLOR=1 speclite validate "$PROJECT_ROOT"
```

窄终端、non-TTY 或 CI 中，human-readable evidence 会降级为 key-value block，仍保留 `Outcome`、`Summary`、`Issues` 和 `Next Actions`：

```text
SpecLite validate
Outcome: invalid

Summary
Completed: no
Writes: no project files changed
User action: required
Presentation profile: Diagnostic (key-value)

Issues:
[error] severity=error category=runtime-path issueId=runtime-path.missing-entry affectedPath=_speclite/config.toml

Next Actions / Next actions:
- Restore _speclite/config.toml, then rerun speclite validate.
```

## JSON For Automation（自动化 JSON）

自动化不要解析 human-readable output：

```sh
speclite status "$PROJECT_ROOT" --json
speclite validate "$PROJECT_ROOT" --json
```

`--json` 不受 locale、TTY、terminal width 或颜色影响。公共语义以 [`../reference/specs/command-result-json-contract.md`](../reference/specs/command-result-json-contract.md) 为准，`CommandResult` schema 和 focused tests 提供 executable evidence；docs 示例不是规范来源。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 安装操作 | [`install-speclite.md`](install-speclite.md) |
| CLI 参数参考 | [`../reference/cli.md`](../reference/cli.md) |
| JSON 消费者参考 | [`../reference/command-result-json.md`](../reference/command-result-json.md) |
| 更新与修复 | [`update-and-repair.md`](update-and-repair.md) |
