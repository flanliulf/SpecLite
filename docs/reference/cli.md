# CLI Reference（CLI 参考）

本文记录当前 `speclite` CLI 的命令、参数、输出模式和典型调用方式。

## Usage（用法）

```sh
speclite <command> [options] [target-directory]
```

`target-directory` 是目标项目根目录。省略时，多数项目级命令使用当前工作目录。

## Commands（命令）

| Command | Purpose |
|---|---|
| `speclite install [target-directory]` | 执行 fresh install preflight，并在 `--yes` 授权后写入 runtime、IDE mirrors、manifest/index 和 artifact root。 |
| `speclite init [target-directory]` | 创建或重建 SpecLite project config plan，在授权后写入非冲突配置文件。 |
| `speclite list [target-directory]` | 列出 canonical modules、skills、IDE targets、版本和目标项目 installed-state 摘要。 |
| `speclite status [target-directory]` | 查看本地 SpecLite installed-state summary。 |
| `speclite validate [target-directory]` | 校验 installed-state、runtime path、manifest/index、IDE mirrors 和相关安装健康度。 |
| `speclite doctor [target-directory]` | 执行更丰富的诊断，不改变 `validate` 的 local-only contract。 |
| `speclite update [target-directory]` | 生成或执行安全 update plan。 |
| `speclite update --repair [target-directory]` | 显式修复可安全恢复的 installer-owned drift。 |
| `speclite sync [target-directory]` | 对齐 installed source projections 和 IDE mirrors，不隐藏 repair 语义。 |
| `speclite uninstall [target-directory]` | 移除 installer-owned SpecLite 文件，并保留 human-owned 与 workflow-owned 路径。 |
| `speclite governance-report [target-directory]` | 从 installed-state evidence 生成只读流程治理覆盖报告。 |
| `speclite resolve config` | 输出解析后的 runtime config JSON。 |
| `speclite resolve customization` | 输出解析后的 skill customization JSON。 |

`resolve` 是 runtime support API surface，主要给已安装 skills 和工具调用使用。

## Install Options（安装参数）

```sh
speclite install [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。不会等待 stdin。 |
| `--yes` | 在 preflight gates 通过后授权 command-level writes。 |
| `--interactive` | 使用显式 human prompts 自定义 modules、config 和 IDE targets。 |
| `--locale <locale>` | 设置 human-readable install output 和 prompts 的 locale：`zh-CN` 或 `en-US`。 |
| `--source <type>` | 选择 source type：`bundled`、`npm`、`private-registry`、`local-tarball`、`offline-bundle`、`git` 或 `local`。 |
| `--source-value <value>` | 为 custom source type 提供 source value。 |
| `--channel <channel>` | 记录 source resolution 前请求的 channel。 |
| `--version <version>` | 记录 source resolution 前请求的 version、tag、range 或 ref。 |

### Install Modes（安装模式）

| Invocation | Behavior |
|---|---|
| `speclite install /path/to/project` | 只执行 target preflight。没有 `--yes` 时不会进入后续 source/module/config/write 阶段。 |
| `speclite install /path/to/project --yes` | 默认无交互安装，使用 `core`、`sdlc`、`quick` config、`claude` 和 `agents`。 |
| `speclite install /path/to/project --yes --interactive` | 显式交互安装，可自定义 module/config/IDE target 选择。 |
| `speclite install /path/to/project --json --yes` | 自动化安装输出 JSON，不等待 stdin。 |

Human-readable install output 默认 locale 为 `zh-CN`。解析顺序是 `--locale`、`SPECLITE_LOCALE`、默认 `zh-CN`。不支持的 locale 会回退到 `zh-CN`。

Locale 只影响自然语言，不改变 `CommandResult` JSON、exit code、issue ordering、path normalization、manifest/index 内容或 fixture stable JSON comparison。

## Init Options（初始化参数）

```sh
speclite init [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。 |
| `--dry-run` | 生成 unapplied init plan，不授权写入。 |
| `--yes` | 授权非冲突 project config writes。 |

`init` 用于创建或重建 `_speclite/config.toml`、`_speclite/config.user.toml`、`_speclite/custom/config.toml` 和 `_speclite/custom/config.user.toml` 的计划。它会读取现有 manifest/files index，并保护 human-owned custom files，不会静默覆盖。

## List Options（列表参数）

```sh
speclite list [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。 |

`list` 同时返回 canonical package 侧的 modules、skills、IDE targets、版本，以及目标项目中可读取的 installed-state projection。

## Status Options（状态参数）

```sh
speclite status [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。 |
| `--locale <locale>` | 设置 human-readable status output 的 locale：`zh-CN` 或 `en-US`。 |

## Validate Options（校验参数）

```sh
speclite validate [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。 |
| `--locale <locale>` | 设置 human-readable validate output 的 locale：`zh-CN` 或 `en-US`。 |

## Doctor Options（诊断参数）

```sh
speclite doctor [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。 |
| `--revalidate-source` | 计划 remote source freshness/provenance revalidation。 |
| `--yes` | 授权 `doctor` 明确计划的 external access。 |

未带 `--revalidate-source` 时，`doctor` 只基于本地 validation evidence 产生诊断。带 `--revalidate-source` 但未带 `--yes` 时，命令会停止在 external access authorization gate。

## Update Options（更新参数）

```sh
speclite update [options] [target-directory]
```

| Option | Description |
|---|---|
| `--repair` | 使用 explicit repair command id 和 repair behavior。 |
| `--json` | 输出 machine-readable `CommandResult` JSON。 |
| `--dry-run` | 生成未应用的 update plan，不授权写入。 |
| `--yes` | 授权 non-conflicting planned update writes。 |
| `--locale <locale>` | 设置 human-readable update output 的 locale：`zh-CN` 或 `en-US`。 |

## Sync Options（同步参数）

```sh
speclite sync [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。 |
| `--dry-run` | 生成 unapplied sync plan，不授权写入。 |
| `--yes` | 授权非冲突 installer-owned sync writes。 |

`sync` 复用 update planning 的 source-to-mirror reconciliation 语义，但 command id 和 output data 为 `sync`。它不等价于 `update --repair`，也不会隐藏执行 repair。

## Uninstall Options（卸载参数）

```sh
speclite uninstall [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。 |
| `--dry-run` | 生成 unapplied uninstall plan，不移除文件。 |
| `--yes` | 授权移除 installer-owned files。 |

`uninstall` 根据 files index 和 ownership model 移除 installer-owned paths，保留 human-owned 与 workflow-owned paths。移除后仍应人工检查 preserved paths。

## Governance Report Options（治理报告参数）

```sh
speclite governance-report [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。 |

`governance-report` 是只读命令，基于 manifest、phase coverage、workflow artifact contract 和 validate evidence 计算流程治理覆盖指标。它不评价文档内容质量或人工 review 充分性。

## Resolve Options（解析参数）

解析项目 config：

```sh
speclite resolve config --project-root /path/to/project
speclite resolve config --project-root /path/to/project --key core.project_name
speclite resolve config --project-root /path/to/project --key core.project_name --human
```

| Option | Description |
|---|---|
| `--project-root <projectRoot>` | 包含 `_speclite` 的项目根目录。 |
| `--key <dottedKey>` | 选择 merged config 中的 dotted key。可重复。 |
| `--human` | 显式输出 human-readable support frame。未传入时 stdout 仍只输出 resolved JSON object。 |

解析 skill customization：

```sh
speclite resolve customization --skill /path/to/project/.agents/skills/speclite-help --project-root /path/to/project
speclite resolve customization --skill /path/to/project/.agents/skills/speclite-help --project-root /path/to/project --key agent.menu
speclite resolve customization --skill /path/to/project/.agents/skills/speclite-help --project-root /path/to/project --key agent.menu --human
```

| Option | Description |
|---|---|
| `--skill <skillDir>` | 包含 `customize.toml` 的 installed skill 目录。 |
| `--project-root <projectRoot>` | 包含 `_speclite` 的项目根目录。Installed Skill activation 必须显式传入；省略只保留为 CLI compatibility fallback，不作为推荐运行契约。 |
| `--key <dottedKey>` | 选择 merged customization 中的 dotted key。可重复。 |
| `--human` | 显式输出 human-readable support frame。未传入时 stdout 仍只输出 resolved JSON object。 |

默认 resolve output 是 runtime support machine contract：stdout 只包含 resolved JSON object，stderr 只包含 `ValidationIssue` JSON Lines diagnostics。Missing key 默认仍输出 `{}`、exit code 为 `0`、stderr 为空。Installed Skill 激活前必须确认当前 AI 会话 `PATH` 中存在 `speclite`；不可用时应 HALT 并暴露或安装 Node CLI 后重试，不得回退 Python resolver 或单独读取 `_speclite/config.toml`。`--human` 只用于人工排查，会把结果渲染为 `Outcome`、`Summary`、`Scope`、`Evidence`、`Issues` 和 `Next Actions`；其中 `source path` 表示 selected dotted key 的 effective source，`unresolved` 只适用于显式 human mode。

## Python Resolver Compatibility Assets（Python Resolver 兼容资产）

`_speclite/scripts/resolve_*.py` 可能存在于已安装项目中，并以 `runtime-compat-script` 记录在 `files-index.json`。这些文件只用于 legacy compatibility、migration aid 和 troubleshooting，不是默认 activation resolver，也不是默认 CLI resolver runtime dependency。正常 installed Skill activation 的唯一默认 resolver 是 `speclite resolve config` 与 `speclite resolve customization`；文档和脚本不应建议用户在默认激活路径中运行 Python resolver。

## Output Modes（输出模式）

| Mode | How to request | Notes |
|---|---|---|
| Human-readable | 默认 | 面向终端阅读。`install` 默认中文，支持 `--locale en-US`。 |
| JSON | `--json` | 面向脚本和工具。使用 `CommandResult` contract。 |
| Resolve support | `resolve ... --human` | 仅适用于 `resolve config/customization`。默认 resolve 不使用 `CommandResult`，stdout 保持 pure JSON。 |

Human-readable output 可以包含分阶段 heading、key-value block、summary 和 next actions。JSON output 不应被 locale 影响。

Human-readable output 会按 command intent 选择 presentation profile：

| Profile | Commands | Notes |
|---|---|---|
| Operation | `install`、`init`、`update`、`update --repair`、`sync`、`uninstall` | 优先展示写入意图、scope、state / authorization、plan / evidence、issues / conflicts 和 next actions。 |
| Diagnostic | `status`、`validate`、`doctor` | 让 issues 靠近关键 state；error / critical issue 不应被深埋在长 evidence 之后。 |
| Report / Support | `list`、`governance-report`、`resolve ... --human` | 使用 results、metrics、gaps、artifacts 或 evidence 等更贴近任务的主体 section。 |

## Human Output Flows（人类输出流程）

| Flow | Command example | Output contract |
|---|---|---|
| read-only | `NO_COLOR=1 speclite status "$PROJECT_ROOT"` | `Outcome`、`Summary`、`Issues`、`Next Actions`；不写项目文件。 |
| validation | `NO_COLOR=1 speclite validate "$PROJECT_ROOT"` | 按 issue severity 和 category 稳定排序；窄终端使用 key-value evidence。 |
| prewrite preview | `NO_COLOR=1 speclite install "$PROJECT_ROOT"` | 停在写入前，`Writes` 显示未写项目文件。 |
| prewrite update preview | `NO_COLOR=1 speclite update "$PROJECT_ROOT"` | 展示 update plan，不授权写入。 |
| write-authorized | `NO_COLOR=1 speclite install "$PROJECT_ROOT" --yes` | 只在 gates 通过后写入。 |
| repair-authorized | `NO_COLOR=1 speclite update "$PROJECT_ROOT" --repair --yes` | 只执行显式 repair writes。 |
| resolve human mode | `NO_COLOR=1 speclite resolve config --project-root "$PROJECT_ROOT" --key core.project_name --human` | 人工排查 support frame；默认 resolve stdout 仍是 pure JSON。 |

`install` prewrite preview 的 `Scope` 会展示目标项目、目标路径和命令执行目录。`Next Actions` 使用从原执行目录可复制的 target：绝对 target 保持绝对路径，`../project` 这类相对跨目录 target 保留相对参数，不降级为 basename。没有 issue 时，`Issues` section 显示 `- 无问题`；写入状态由 `Summary` / state 表达。

CLI human-readable output 的完整 command/outcome/test/docs matrix 见 [`cli-human-output-matrix.md`](cli-human-output-matrix.md)。docs 示例不是 contract source；`--json` contract 以 schema、SPEC 和 focused tests 为准。

## Exit Codes（退出码）

| Exit code | Meaning |
|---|---|
| `0` | 命令成功完成。 |
| `1` | 命令发现 blocker、参数缺失或校验失败。 |

## Common Invocations（常用调用）

```sh
speclite install /path/to/project
speclite install /path/to/project --yes
speclite install /path/to/project --yes --interactive
speclite install /path/to/project --yes --locale en-US
speclite install /path/to/project --json --yes
speclite init /path/to/project --dry-run
speclite init /path/to/project --yes
speclite list /path/to/project
speclite list /path/to/project --json
speclite status /path/to/project
speclite status /path/to/project --json
speclite validate /path/to/project
speclite validate /path/to/project --json
speclite doctor /path/to/project
speclite doctor /path/to/project --revalidate-source --yes
speclite update /path/to/project --dry-run
speclite update /path/to/project --yes
speclite update /path/to/project --repair
speclite update /path/to/project --repair --yes
speclite sync /path/to/project --dry-run
speclite sync /path/to/project --yes
speclite uninstall /path/to/project --dry-run
speclite uninstall /path/to/project --yes
speclite governance-report /path/to/project
speclite governance-report /path/to/project --json
NO_COLOR=1 speclite status "$PROJECT_ROOT"
NO_COLOR=1 speclite validate "$PROJECT_ROOT"
NO_COLOR=1 speclite update "$PROJECT_ROOT"
NO_COLOR=1 speclite update "$PROJECT_ROOT" --repair
NO_COLOR=1 speclite update "$PROJECT_ROOT" --repair --yes
NO_COLOR=1 speclite resolve config --project-root "$PROJECT_ROOT" --key core.project_name --human
```
