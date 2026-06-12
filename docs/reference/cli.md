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
| `speclite status [target-directory]` | 查看本地 SpecLite installed-state summary。 |
| `speclite validate [target-directory]` | 校验 installed-state、runtime path、manifest/index、IDE mirrors 和相关安装健康度。 |
| `speclite update [target-directory]` | 生成或执行安全 update plan。 |
| `speclite update --repair [target-directory]` | 显式修复可安全恢复的 installer-owned drift。 |
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

## Status Options（状态参数）

```sh
speclite status [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。 |

## Validate Options（校验参数）

```sh
speclite validate [options] [target-directory]
```

| Option | Description |
|---|---|
| `--json` | 输出 machine-readable `CommandResult` JSON。 |

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

## Resolve Options（解析参数）

解析项目 config：

```sh
speclite resolve config --project-root /path/to/project
speclite resolve config --project-root /path/to/project --key core.project_name
```

| Option | Description |
|---|---|
| `--project-root <projectRoot>` | 包含 `_speclite` 的项目根目录。 |
| `--key <dottedKey>` | 选择 merged config 中的 dotted key。可重复。 |

解析 skill customization：

```sh
speclite resolve customization --skill /path/to/project/.agents/skills/speclite-help --project-root /path/to/project
speclite resolve customization --skill /path/to/project/.agents/skills/speclite-help --key agent.menu
```

| Option | Description |
|---|---|
| `--skill <skillDir>` | 包含 `customize.toml` 的 installed skill 目录。 |
| `--project-root <projectRoot>` | 包含 `_speclite` 的项目根目录。可省略。 |
| `--key <dottedKey>` | 选择 merged customization 中的 dotted key。可重复。 |

## Output Modes（输出模式）

| Mode | How to request | Notes |
|---|---|---|
| Human-readable | 默认 | 面向终端阅读。`install` 默认中文，支持 `--locale en-US`。 |
| JSON | `--json` | 面向脚本和工具。使用 `CommandResult` contract。 |

Human-readable output 可以包含分阶段 heading、key-value block、summary 和 next actions。JSON output 不应被 locale 影响。

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
speclite status /path/to/project
speclite status /path/to/project --json
speclite validate /path/to/project
speclite validate /path/to/project --json
speclite update /path/to/project --dry-run
speclite update /path/to/project --yes
speclite update /path/to/project --repair
speclite update /path/to/project --repair --yes
```
