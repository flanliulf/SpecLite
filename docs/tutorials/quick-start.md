# Quick Start Tutorial（快速开始教程）

本教程带你从零完成一次 SpecLite 安装、验证和首次使用。完成后，你会知道哪些命令只是读取状态，哪些命令会写入项目文件，以及如何在人工阅读输出和自动化 JSON 之间切换。

如果你只想查命令清单，读 [`../reference/cli.md`](../reference/cli.md)。如果你需要 npm package 中的精简入口，读 [`../quick-start.md`](../quick-start.md)。

## What You'll Learn（你会学到什么）

- 如何安装并启动 `speclite` CLI。
- 如何选择 target project root。
- 如何先做安全预览，再授权写入。
- 如何读取 `status`、`validate`、`update` 和 `repair` 的 human-readable output。
- 什么时候使用 `--json`，什么时候只看 `Next Actions`。

## Prerequisites（前置条件）

开始前请确认：

- 本机已安装 Node.js `>=22`。
- 你有一个本地目标项目，例如 `/path/to/project`。
- 你知道自己是在运行已发布 CLI、`npx`，还是本仓库开发版。

本文命令统一使用：

```sh
PROJECT_ROOT=/path/to/project
```

把 `/path/to/project` 替换为你的目标项目根目录。

## Quick Path（快速路径）

```sh
npm install -g @fancyliu/speclite
speclite --version

PROJECT_ROOT=/path/to/project
speclite install "$PROJECT_ROOT"
speclite install "$PROJECT_ROOT" --yes
speclite status "$PROJECT_ROOT"
speclite validate "$PROJECT_ROOT"
```

第一条 `install` 是安全预览，不写文件。第二条 `install --yes` 才授权写入。

## Command Prefix（命令前缀）

后续示例默认使用全局安装后的 `speclite`。如果你使用其它方式，只替换命令前缀，子命令和参数保持不变。

| Scenario | Prefix | Example |
|---|---|---|
| 全局安装 | `speclite` | `speclite install "$PROJECT_ROOT" --yes` |
| 临时运行 npm 包 | `npx @fancyliu/speclite@latest` | `npx @fancyliu/speclite@latest install "$PROJECT_ROOT" --yes` |
| 本仓库开发版 | `npm run dev --` | `npm run dev -- install "$PROJECT_ROOT" --yes` |

开发版命令必须在 SpecLite 仓库目录执行：

```sh
cd /path/to/SpecLite
npm install
npm run build
npm run dev -- install "$PROJECT_ROOT" --yes
```

## Step 1: Preview The Target（预览目标）

先运行不带 `--yes` 的安装命令：

```sh
speclite install "$PROJECT_ROOT"
```

这一步只检查 target project root，不进入 source selection、module selection、config initialization 或 write phase。它适合确认：

- target path 是否存在或可创建。
- 目标是否已经安装过 SpecLite。
- 是否存在 unsafe symlink、regular file target 或明显 blocker。

human-readable output 会给出 `Outcome`、`Summary`、`Issues` 和 `Next Actions`。如果没有 blocker，下一步通常是运行：

```sh
speclite install "$PROJECT_ROOT" --yes
```

## Step 2: Authorize Install（授权安装）

确认目标正确后，使用 `--yes` 授权默认安装：

```sh
speclite install "$PROJECT_ROOT" --yes
```

默认安装使用：

| Item | Default |
|---|---|
| Source | `bundled` |
| Modules | `core`、`sdlc` |
| Config mode | `quick` |
| IDE targets | `claude`、`agents` |
| Human output locale | `zh-CN` |

安装完成后，目标项目会出现：

| Path | Purpose |
|---|---|
| `_speclite/` | metadata/control hub。 |
| `_speclite-output/` | workflow artifacts repository。 |
| `.claude/skills/` | Claude Code skill mirror。 |
| `.agents/skills/` | generic agent skill mirror。 |

## Step 3: Check Installed State（检查安装状态）

安装后先运行轻量只读摘要：

```sh
speclite status "$PROJECT_ROOT"
```

`status` 的职责是给方向感：项目是否 configured、not-configured、partial 或 failed。它不是完整健康校验。

如果 `status` 提示需要更深入检查，再运行：

```sh
speclite validate "$PROJECT_ROOT"
```

`validate` 会读取 manifest/index、runtime path、IDE mirrors、source integrity、file ownership 等本地证据，并输出 issue category、severity、affected path 和建议动作。

## Step 4: Read Human Output（读取人类输出）

SpecLite 的默认 human-readable output 面向终端阅读。当前 CLI 的常用命令共享 outcome-oriented frame：

| Section | What to look for |
|---|---|
| `Outcome` | 当前结果，例如 `ready`、`installed`、`invalid`、`plan-ready`。 |
| `Summary` | 是否完成、是否写入项目文件、是否需要用户动作。 |
| `Issues` | blocker、warning 或 info。没有问题时会明确显示空状态。 |
| `Next Actions` | 下一步命令或人工处理动作。 |

示例：

```text
SpecLite validate
Outcome: invalid

Summary
Completed: no
Writes: no project files changed
User action: required

Issues:
[error] severity=error category=runtime-path issueId=runtime-path.missing-entry affectedPath=_speclite/config.toml

Next Actions / Next actions:
- Restore _speclite/config.toml, then rerun speclite validate.
```

> Note: 默认 locale 是 `zh-CN`，实际输出会使用 `Summary（摘要）`、`Issues（问题）`、`Next Actions（下一步）` 这样的双语标题。命令、flag、path、schema id、issue id 和 reason code 保持英文技术标识。

需要复制无颜色日志时，可以给任意 human-readable 命令加 `NO_COLOR=1`：

```sh
NO_COLOR=1 speclite validate "$PROJECT_ROOT"
```

## Step 5: Use JSON For Automation（自动化使用 JSON）

脚本、CI 和 agent 工具不要解析 human-readable output。使用 `--json`：

```sh
speclite status "$PROJECT_ROOT" --json
speclite validate "$PROJECT_ROOT" --json
speclite update "$PROJECT_ROOT" --json
```

JSON 输出遵守 `CommandResult` contract，不受 locale、TTY、terminal width、颜色或 human renderer 影响。

自动化判断时：

- 用 `CommandResult.status` 判断命令是否成功、warning 或 failure。
- 用 `issues[]` 判断 blocker 和 warning。
- 用 command-specific `data` 判断业务状态，例如 `status.data.highLevelHealth` 或 `validate.data.issueCounts`。
- 不要把 `summary` 或 `nextActions` 当作稳定状态机。

字段细节见 [`../reference/command-result-json.md`](../reference/command-result-json.md)。

## Step 6: Update Or Repair（更新或修复）

后续维护时，先预览 update plan：

```sh
speclite update "$PROJECT_ROOT"
```

确认只包含 non-conflicting installer-owned writes 后再授权：

```sh
speclite update "$PROJECT_ROOT" --yes
speclite validate "$PROJECT_ROOT"
```

如果需要修复 installer-owned drift，使用显式 repair flow：

```sh
speclite update "$PROJECT_ROOT" --repair
speclite update "$PROJECT_ROOT" --repair --yes
speclite validate "$PROJECT_ROOT"
```

`update --repair` 不是普通 update 的隐藏模式。它只处理可安全恢复的 installer-owned drift，不覆盖 human-owned custom files 或 workflow-owned artifacts。

## What You've Accomplished（完成结果）

完成本教程后，你已经：

- 安装并运行了 `speclite` CLI。
- 把 SpecLite runtime 和 skill mirrors 安装到目标项目。
- 用 `status` 获取轻量 installed-state summary。
- 用 `validate` 做本地 deterministic validation。
- 理解了 human-readable output 和 `CommandResult` JSON 的边界。

## Quick Reference（快速参考）

| Task | Command |
|---|---|
| 安装预览 | `speclite install "$PROJECT_ROOT"` |
| 默认安装 | `speclite install "$PROJECT_ROOT" --yes` |
| 自定义交互安装 | `speclite install "$PROJECT_ROOT" --yes --interactive` |
| 英文 human output | `speclite install "$PROJECT_ROOT" --yes --locale en-US` |
| 查看状态 | `speclite status "$PROJECT_ROOT"` |
| 完整校验 | `speclite validate "$PROJECT_ROOT"` |
| 预览 update | `speclite update "$PROJECT_ROOT"` |
| 授权 update | `speclite update "$PROJECT_ROOT" --yes` |
| 预览 repair | `speclite update "$PROJECT_ROOT" --repair` |
| 授权 repair | `speclite update "$PROJECT_ROOT" --repair --yes` |
| 自动化校验 | `speclite validate "$PROJECT_ROOT" --json` |

## Common Questions（常见问题）

| Question | Answer |
|---|---|
| 不带 `--yes` 的 `install` 为什么没写文件？ | 这是安全预览。只有 `install --yes` 才授权写入。 |
| `status` 成功是否代表安装健康？ | 不一定。`status` 是轻量摘要；完整健康检查使用 `validate`。 |
| 我可以让 CI 解析 `Next Actions` 吗？ | 不建议。CI 应解析 `--json` 的 stable fields。 |
| 想切换英文输出怎么办？ | 对支持 locale 的命令传 `--locale en-US`，或设置 `SPECLITE_LOCALE=en-US`。 |
| `resolve --human` 什么时候用？ | 只在人工排查 config/customization resolver 时使用；默认 `resolve` stdout 仍是 pure JSON。 |

## Key Takeaways（关键要点）

- `install` 默认先预览，`--yes` 才写入。
- `status` 和 `validate` 始终是 read-only checks。
- human-readable output 面向人；`--json` 面向自动化。
- docs 示例不是 contract source；contract 来自 SPEC、schema 和 focused tests。
