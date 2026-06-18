# Install SpecLite（安装 SpecLite）

本文说明如何把 SpecLite 安装到一个目标项目，并区分安全预览、默认无交互安装、自定义交互安装和自动化 JSON 输出。

## When to Use This（何时使用）

当你需要把 SpecLite methodology package 安装到一个本地项目时，使用本文流程。

安装会在目标项目中创建：

- `_speclite/` metadata/control hub。
- `_speclite-output/` workflow artifact repository。
- `.claude/skills/` 和 `.agents/skills/` IDE execution plane。
- `_speclite/_config/manifest.yaml` 和 skill index 等 installed-state projection。

## When to Skip This（何时跳过）

如果目标项目已经安装过 SpecLite，不要重新执行 fresh install。先运行：

```sh
speclite status /path/to/project
speclite validate /path/to/project
```

需要更新或修复时，改读 [`update-and-repair.md`](update-and-repair.md)。

## Prerequisites（前置条件）

- Node.js `>=22`，推荐 Node.js 24 LTS。
- 已安装 CLI：`npm install -g @fancyliu/speclite`，或准备使用 `npx @fancyliu/speclite@latest`。
- 已确认目标项目根目录，例如 `/path/to/project`。
- 对 existing install、regular file target、unsafe symlink target 等异常状态，先按输出中的 next action 处理。

`npx @fancyliu/speclite@latest` 可以完成一次安装命令，但不会为后续 AI 会话提供裸 `speclite` 命令。安装完成后如果要激活 `.agents/skills/` 或 `.claude/skills/` 中的 installed skills，当前 AI 会话必须能通过 `command -v speclite` 找到 Node CLI；使用本仓库开发版安装时也需要先通过 `npm link` 或团队认可的 PATH symlink 暴露本地构建出的 CLI。

## Steps（步骤）

### Step 1: Preview Target（预览目标）

不带 `--yes` 的 `install` 只做 target preflight，不会进入 source selection、module selection、config initialization 或 write phase。

```sh
speclite install /path/to/project
```

这一步用于确认 target project root 是否存在、是否已安装、是否是安全目录。输出会说明当前没有写入项目文件，并给出下一步建议。

`Scope` 会展示目标项目、目标路径和命令执行目录。即使命令从 SpecLite 仓库或其它非目标目录执行，`Next Actions` 也会使用可从原执行目录复制的 target：绝对 target 保持绝对路径，`../project` 这类相对跨目录 target 不会退化成 basename。

### Step 2: Run Default Install（执行默认安装）

大多数新用户使用默认无交互 happy path：

```sh
speclite install /path/to/project --yes
```

`--yes` 表示 command-level write authorization。当前默认安装会使用：

| Item | Default |
|---|---|
| Modules | `core`、`sdlc` |
| Config mode | `quick` |
| IDE targets | `claude`、`agents` |
| Source type | `bundled` |
| Human-readable locale | `zh-CN` |

安装成功后，中文 Ready Summary 会展示 selected modules、config mode、IDE targets、key paths 和 next actions。

使用 installed skills 前，按 Ready Summary 中的 next action 在目标 AI 会话运行：

```sh
command -v speclite
```

如果没有输出路径，先把全局安装或本地开发版 `speclite` CLI 暴露到 `PATH`，再重试 Skill 激活。

### Step 3: Customize Install（自定义安装）

需要自定义 modules、config mode 或 IDE targets 时，显式加入 `--interactive`：

```sh
speclite install /path/to/project --yes --interactive
```

`--interactive` 只控制 human prompts；写入授权仍由 `--yes` 表示。交互流程会把 summary block 和 prompt 分开显示，prompt 单独占行。

在 interactive mode 中，`quick` 与 `detailed` 都会要求输入用户显示名 `user_name`。`quick` 只要求这个必填个人字段，其他项目名、语言和路径使用 defaults；`detailed` 继续允许逐项确认或调整其他配置。空 `user_name` 会重新提示，不会静默写入 `SpecLite`。

> Note: `--json` 路径不会等待 stdin。`speclite install /path/to/project --json --yes` 适合脚本和自动化。

### Step 4: Choose Output Locale（选择输出语言）

Human-readable install output 默认使用 `zh-CN`。英文输出可以通过 `--locale` 或 `SPECLITE_LOCALE` 指定：

```sh
speclite install /path/to/project --yes --locale en-US
SPECLITE_LOCALE=en-US speclite install /path/to/project --yes
```

支持的 locale 为 `zh-CN` 和 `en-US`。locale 只影响自然语言提示、阶段标题和摘要说明，不翻译 command name、flag、module id、target id、step id、path、schema id、issue id、reason code 或 JSON field。

### Step 5: Verify Installation（验证安装）

安装完成后执行只读检查：

```sh
speclite status /path/to/project
speclite validate /path/to/project
```

需要 machine-readable output 时使用：

```sh
speclite status /path/to/project --json
speclite validate /path/to/project --json
```

## What You Get（你会得到什么）

成功安装后，目标项目至少应出现：

| Path | Purpose |
|---|---|
| `_speclite/` | SpecLite metadata/control hub。 |
| `_speclite-output/` | planning、implementation、devops 等 workflow artifacts 默认输出位置。 |
| `.claude/skills/` | Claude Code skill mirror。 |
| `.agents/skills/` | Generic agent skill mirror。 |
| `_speclite/_config/manifest.yaml` | installed-state projection。 |

## Examples（示例）

安全预览：

```sh
PROJECT_ROOT=/path/to/project
NO_COLOR=1 speclite install "$PROJECT_ROOT"
```

默认中文无交互安装：

```sh
NO_COLOR=1 speclite install "$PROJECT_ROOT" --yes
```

英文输出：

```sh
speclite install /path/to/project --yes --locale en-US
```

自定义交互安装：

```sh
speclite install /path/to/project --yes --interactive
```

自动化安装并读取 JSON：

```sh
speclite install "$PROJECT_ROOT" --json --yes
```

安全预览的稳定 human-readable 骨架：

```text
SpecLite install
Outcome（结果）: prewrite-paused

Summary（摘要）
完成状态：已完成
写入状态：未写入项目文件
用户动作：需要

Scope（范围）
目标项目：example-project
目标路径：/path/to/project
命令执行目录：/path/to/current-cwd

Issues（问题）
- 无问题

Next Actions（下一步）
- 运行 `speclite install /path/to/project --yes` 使用默认配置完成安装。
- 运行 `speclite install /path/to/project --yes --interactive` 进入交互模式自定义安装。
```

如果出现 `blocked-before-write`、`write-failed` 或 `ready-check-failed`，先处理 `Issues` 和 `Next Actions`，不要为了修复错误而改变安装需求或跳过写入前 gates。

## Tips（提示）

- 首次安装优先使用 bundled source，不需要传 `--source`。
- `--yes` 不代表接受 blocked source、existing install overwrite 或 policy rejection。
- `Issues` 为空时会显示 `- 无问题`；`未写入项目文件` 属于 `Summary` / write state，不会混入问题列表。
- `NO_COLOR`、non-TTY、CI 和窄终端输出不依赖 ANSI color、spinner 或动态覆盖行表达唯一语义。
- 安装后不知道下一步时，先运行 `speclite status`，再运行 `speclite validate`。
