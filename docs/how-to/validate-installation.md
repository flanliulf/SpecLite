# Validate Installation（验证安装）

本文说明如何用 `speclite status` 和 `speclite validate` 检查已安装项目。两个命令都是 read-only flow，不写项目文件。

## Read-Only Summary（只读摘要）

```sh
PROJECT_ROOT=/path/to/project
NO_COLOR=1 speclite status "$PROJECT_ROOT"
```

`status` 适合快速判断 installed-state summary。默认 locale 为 `zh-CN`，以下是节选后的真实骨架（`State` 中的 filesystem planes 与关键路径已省略）：

```text
SpecLite status
Outcome（结果）: installed

Summary（摘要）
- 完成状态：已完成
- 写入状态：未写入项目文件
- 用户动作：需要
installed-state summary 显示 SpecLite 已配置。
命令状态：success 表示 status read 已完成；不代表安装健康检查通过。

Scope（范围）
targetProject=example-project
projectRoot=.

State（状态）
高层健康：configured
已安装 modules：core, sdlc
IDE targets（技术标识）：
- claude: configured, skills=69, path=.claude/skills
- agents: configured, skills=69, path=.agents/skills

Issues（问题）
- 无问题

Next Actions（下一步）
- 无需操作。
```

如果 outcome 是 `not-installed`、`partial` 或 `failed`，先按 `Next Actions` 运行 `validate` 或回到 install/update flow，不要把 command success 当作安装健康通过。

## Validation Flow（校验流程）

```sh
NO_COLOR=1 speclite validate "$PROJECT_ROOT"
```

human-readable output 的稳定骨架是 `Outcome`、`Summary`、`Scope`、`State`、`Issues` 和 `Next Actions`。每条 issue 渲染为一行，字段顺序固定为 `severity`、`category`、`issueId`、`location`、`affectedPath`、`details`、`impact`、`suggestedNextStep`。下面是删除 `_speclite/config.toml` 后的真实节选（`info` 级别的 `artifact-path.missing-required-artifact` 行已省略）：

```text
SpecLite validate
Outcome（结果）: invalid

Summary（摘要）
- 完成状态：未完成
- 写入状态：未写入项目文件
- 用户动作：需要
已检查 categories 存在 error 或 critical issue。
命令状态：failure
输出形式：证据 (compact-table)

Scope（范围）
targetProject=example-project
已检查 categories：manifest-schema, source-integrity, ide-mirror, runtime-path, menu-target, legacy-namespace, artifact-path, file-integrity
未检查 categories：environment, operation-lock, update
已检查 targets：claude, agents

State（状态）
issue counts：critical=0, error=1, warning=0, info=43

Issues（问题）
[error] severity=error category=file-integrity issueId=file-integrity.missing-installer-owned-file location=_speclite/config.toml affectedPath=_speclite/config.toml details=artifactKind=runtime-config;expectedHashAlgorithm=sha256;ownership=installer-owned;reason=missing-installer-owned-file ...

Next Actions（下一步）
- 修复 file-integrity.missing-installer-owned-file（affectedPath=_speclite/config.toml; reason=missing-installer-owned-file）。
- 修复上方 issue 后运行 `speclite validate <target>` 复查 checked categories。
```

Fresh install 后立即运行 `validate` 会得到 `valid-with-warnings`：所有契约产物目录都尚未产出，对应 issue 为 `info` 级别（`details.reason=not-yet-produced`），不影响通过判定。issue id 的含义见 [`../reference/validation-issues.md`](../reference/validation-issues.md)。

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
| issue id 参考 | [`../reference/validation-issues.md`](../reference/validation-issues.md) |
| 更新与修复 | [`update-and-repair.md`](update-and-repair.md) |
