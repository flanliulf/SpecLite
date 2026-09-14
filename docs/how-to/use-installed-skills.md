# Use Installed Skills（使用已安装 Skills）

本文帮助你在已经安装 SpecLite 的目标项目中发现并首次使用 installed Skills。完成后，你可以让 `speclite-help` 基于当前项目证据说明 workflow 状态、推荐下一步 Skill，并判断何时直接调用 Workflow、何时先激活 Agent。

## When to Use This（何时使用）

在以下场景使用本文：

- 已经完成 SpecLite 安装和校验，但不知道如何在 Claude 或 Codex 中开始第一次对话。
- 能看到 `.claude/skills/` 或 `.agents/skills/`，但不确定该调用哪个 Skill。
- 想确认自然语言触发与显式指定 Skill 的区别。
- 想排查 Skill 不可见、激活后 HALT 或推荐结果缺少项目证据等问题。

如果目标项目还没有 `_speclite/`，先完成 [`Install SpecLite（安装 SpecLite）`](install-speclite.md)。如果 `speclite validate` 已经报告 installed-state 错误，先按 [`Update and Repair（更新与修复）`](update-and-repair.md) 处理，不要通过手工修改 Skill mirror 绕过校验。

## Prerequisites（前置条件）

本文使用以下变量表示目标项目根目录：

```sh
PROJECT_ROOT=/path/to/project
```

开始前确认：

- `PROJECT_ROOT` 是包含 `_speclite/` 的目标项目根目录，不是 SpecLite source checkout。
- 目标项目已经安装所需 Module，并为当前 IDE 选择了对应 target。
- 当前 AI 会话的 shell 能从 `PATH` 执行裸 `speclite` 命令。
- 你会在目标项目 workspace 中开启对话，而不是在任意目录中让 AI 猜测项目根目录。

在**将要运行 Skill 的同一个 AI 会话**中执行：

```sh
cd "$PROJECT_ROOT"
command -v speclite
speclite status .
```

`command -v speclite` 必须返回可执行文件路径。如果命令不可用，installed Skill 应停止执行并报告 `SpecLite CLI command speclite is not available in this AI session PATH`，因为正常 activation 依赖 Node CLI runtime。

全局安装的常见准备方式是：

```sh
npm install -g @fancyliu/speclite
command -v speclite
```

使用 SpecLite 仓库开发版安装目标项目时，`npm run dev -- install ...` 只完成目标项目安装，不会自动把裸 `speclite` 命令加入后续 AI 会话的 `PATH`。开发环境还需要通过 `npm link` 或团队认可的 PATH symlink 暴露 CLI。

## Discovery Model（发现模型）

SpecLite 把 selected canonical Skill packages 安装为 IDE 可以加载的 self-contained mirrors：

| IDE target | Installed entry | 使用方式 |
|---|---|---|
| Claude | `.claude/skills/<skill-id>/` | 在包含该目录的目标项目 workspace 中，让 Claude 通过名称和 description 发现 Skill。 |
| Agents / Codex | `.agents/skills/<skill-id>/` | 在包含该目录的目标项目 workspace 中，让 Codex 通过名称和 description 发现 Skill。 |

默认无交互安装会选择 `claude` 和 `agents` 两个 targets；interactive install 可以只选择其中一部分。因此，canonical source 中存在某个 Skill，不代表当前目标项目或当前 IDE target 已安装它。安装态以 `_speclite/_config/manifest.yaml`、`skill-index.json` 和实际 mirror 为准。

> Caution: `.claude/skills/` 与 `.agents/skills/` 是 `installer-owned` projection，不是新的 Skill source。不要在这些目录中直接修订流程；手工修改会形成 hash drift，并可能被 `speclite validate` 报告。

## Step 1: Open the Project Root（打开项目根目录）

在 Claude 或 Codex 中把 `PROJECT_ROOT` 作为当前项目 workspace，并确认 AI 会话的工作目录：

```sh
pwd
test -d _speclite
```

然后检查当前 IDE 对应的 `speclite-help` entry：

```sh
test -f .claude/skills/speclite-help/SKILL.md
test -f .agents/skills/speclite-help/SKILL.md
```

只需要当前 IDE 对应的检查通过。例如只安装 `agents` target 时，`.agents/skills/speclite-help/SKILL.md` 存在而 `.claude/skills/` 不存在是合理结果。

如果 SpecLite 是在当前 AI 会话启动后才安装或修复的，请刷新客户端的 Skill 列表，或在同一个项目根目录开启 fresh context。是否支持热刷新由 IDE 决定，不属于 SpecLite runtime contract。

## Step 2: Start with SpecLite Help（从 SpecLite Help 开始）

`speclite-help` 是最适合第一次使用的路由入口。它会读取 installed help catalog、phase coverage、runtime config、已有 workflow artifacts 和项目知识，然后回答当前状态或推荐下一步 Skill。它不会凭空补全项目事实。

你可以使用两种触发方式。

### Natural-Language Trigger（自然语言触发）

直接描述意图，让 IDE 根据 installed Skill 的 name 和 description 匹配：

```text
请检查当前 SpecLite workflow 状态，告诉我已经完成了什么，以及下一步最适合使用哪个 Skill。
```

以下表达也会明确命中 `speclite-help` 的使用场景：

- “我现在该做什么？”
- “下一步应该使用哪个 SpecLite Skill？”
- “帮我定位当前 workflow phase，并给出有证据的建议。”

自然语言适合初次探索，但 IDE 仍可能在多个相近 Skill 之间判断。对训练、复现和故障排查，优先使用显式触发。

### Explicit Skill Trigger（显式 Skill 触发）

在提示中明确写出 canonical Skill id：

```text
请使用 `speclite-help`，基于当前项目的 installed config、catalog 和已有产物，判断 workflow 状态并推荐一个明确的下一步。
```

如果客户端提供 Skill picker 或 Skill mention，选择其中的 `speclite-help` entry；具体 UI 语法由 Claude 或 Codex 客户端决定。显式触发是对话级 Skill activation，不是运行名为 `speclite-help` 的 CLI subcommand，也不需要把 `SKILL.md` 的本地绝对路径粘贴到提示中。

为了让结果更聚焦，可以补充目标和约束：

```text
请使用 `speclite-help`。我正在接手一个既有项目，希望先恢复规划基线；只读取当前仓库和 SpecLite 产物，不修改业务代码。请推荐下一步 Skill，并说明推荐依据、主要输入和预期输出。
```

### Complete First-Use Example（完整首次使用示例）

以下示例使用 Codex 对应的 `agents` target；Claude 用户把 entry 检查改为 `.claude/skills/speclite-help/SKILL.md`：

```sh
PROJECT_ROOT=/path/to/project
cd "$PROJECT_ROOT"
command -v speclite
speclite status .
test -f .agents/skills/speclite-help/SKILL.md
```

四个检查都通过后，在同一项目 workspace 的 AI 对话中发送：

```text
请使用 `speclite-help` 分析当前项目。

目标：我正在接手这个既有项目，需要知道当前 SpecLite workflow 到了哪一步，以及下一步应该使用哪个 Skill。
边界：只读取仓库、installed config、catalog 和已有 artifacts；本次不修改业务代码或创建 workflow 产物。
输出：列出已确认事实、缺失证据、推荐的 canonical Skill id、推荐依据、主要输入和预期输出。若存在 required gate，请明确标出。
```

成功响应应采用类似结构：

```text
已确认事实：<来自 config、catalog、artifact 或 project knowledge 的证据>
缺失证据：<无法从当前项目确认的状态>
推荐下一步：<canonical-skill-id>
推荐依据：<phase、前后置关系、required gate 或 outputs>
调用准备：<主要输入、args 和预期输出>
```

其中 `<...>` 必须由当前项目证据填充，不能把这段结构示例当作项目事实。完成本次路由后，再单独授权并运行推荐的 Workflow。

## Step 3: Read the Result（读取结果）

第一次调用 `speclite-help` 时，按以下契约检查结果：

| 项目 | 预期内容 |
|---|---|
| 输入 | 当前项目根目录、用户目标，以及 `_speclite/_config/`、runtime config、已有 artifacts 和 project knowledge 中可读取的证据。 |
| 处理 | 根据 phase、前后置关系、`required` gate 和 outputs 判断 workflow 位置；证据不足时明确说明。 |
| 输出 | 当前状态摘要、相关 Skill id、必要的 menu code 或 args、推荐依据与下一步调用方式。 |
| 写入 | `speclite-help` 主要读取和路由；不要因为获得建议就假设某个 Workflow 已经执行或产物已经创建。 |

一次成功的首次调用应满足：

- 明确说明建议基于哪些 installed config、catalog、产物或项目知识。
- 给出 canonical Skill id，而不只给模糊的阶段名称。
- 缺少证据时区分“未发现”与“未完成”，不制造项目状态。
- 如果只有一个明确的下一步，说明如何调用；是否立即执行仍由你决定。

如果回答只是泛泛介绍 SpecLite，没有读取当前项目证据，请显式补充 `PROJECT_ROOT`、当前目标和“使用 `speclite-help`”的要求，然后在 fresh context 中重试。

## Step 4: Choose Agent or Workflow（选择 Agent 或 Workflow）

Installed Skills 中既有 Agent，也有 Workflow。它们解决的问题不同：

| 入口 | 核心问题 | 适用场景 | 典型结果 |
|---|---|---|---|
| `speclite-help` | 我现在在哪里，下一步用什么？ | 不确定入口，或需要基于当前产物路由。 | 状态说明和下一步 Skill 建议。 |
| `speclite-agent-*` | 谁来协助判断和分发？ | 希望由 PM、Architect、Developer 等 persona 持续协作，或需要角色菜单。 | 角色化建议、菜单和 Workflow 分发。 |
| Workflow Skill | 按什么步骤完成明确任务？ | 已经知道要创建 PRD、恢复 brownfield baseline、执行 review 或实现 Story。 | 文档、报告、Story、review、代码或其他受契约约束的产物。 |

选择原则：

- 不知道下一步：先调用 `speclite-help`。
- 知道需要哪类专业角色，但还没确定流程：激活对应 `speclite-agent-*`。
- 已经明确目标、输入和产物：直接调用对应 Workflow Skill。

Agent 不替代 Workflow。Agent 可以保持 persona 并通过菜单路由；真正的任务步骤、写入范围和验证规则仍由被调用的 Workflow Skill 负责。

## Step 5: Run the Recommended Skill（运行推荐 Skill）

在执行建议前，先复核四项信息：

1. Skill id 是否确实出现在当前 installed target 中。
2. 主要输入是否已经存在，路径是否属于当前目标项目。
3. 预期输出位置和写入范围是否可接受。
4. 是否存在 `required` gate、前置 Workflow 或需要用户确认的高影响操作。

确认后，在 fresh context 中显式指定推荐的 Skill，并带上目标、输入、写入授权和成功判据。例如：

```text
请使用 `<recommended-skill-id>` 处理当前项目。输入是 `<input-path-or-goal>`；只允许写入 `<authorized-path>`。完成后请说明实际产物路径、验证证据和仍未解决的问题。
```

不同 Workflow 的输入和输出差异很大。需要快速查看 SDLC catalog 时，使用 [`SDLC Workflows Reference（SDLC Workflow 参考）`](../reference/skills/sdlc-workflows.md)，不要从 Skill 名称猜测它一定会写什么。

## Troubleshooting（故障排查）

| 现象 | 检查 | 处理 |
|---|---|---|
| AI 会话找不到裸 `speclite` | 在同一 AI 会话运行 `command -v speclite`。 | 全局安装 CLI，或为开发版配置 `npm link` / PATH symlink；刷新会话环境后重试。不要回退到 Python resolver。 |
| IDE 看不到 `speclite-help` | 检查当前 workspace root 和对应 mirror；运行 `speclite status .`、`speclite validate .`。 | 回到正确项目根目录；确认安装时选择了当前 IDE target。存在 drift 时按 repair flow 处理。 |
| 只有 Claude 或 Codex 一侧可见 | 检查 manifest 中的 selected IDE targets。 | 这是只选择单一 target 时的正常结果；需要另一 target 时，回到安装负责人确认重新配置方式，不要复制目录或手改 manifest。 |
| Skill 存在但没有被触发 | 显式写出 `speclite-help`，并说明“检查状态、推荐下一步”。 | 使用客户端 Skill picker / mention，或开启 fresh context 后再次显式触发。 |
| 推荐的 ecosystem Skill 不存在 | 运行 `speclite list .`，检查 installed modules 与 Skills。 | Optional ecosystem module 不会被默认安装；确认需求后再显式选择对应 module。 |
| 回答缺少项目证据 | 确认工作目录、`_speclite/_config/help-index.json` 和已有 artifact paths。 | 补充目标项目根目录和任务目标，要求区分已确认事实与缺失证据。 |
| `validate` 报告 mirror drift | 查看 issue 的 `affectedPath` 和 `Next Actions`。 | 先预览 `speclite update . --repair`，确认后再授权；不要直接编辑 installer-owned mirror。 |

只有排查 runtime config 或 customization merge 时，才需要人工运行 resolver：

```sh
speclite resolve config --project-root "$PROJECT_ROOT"
speclite resolve customization \
  --skill "$PROJECT_ROOT/.agents/skills/speclite-help" \
  --project-root "$PROJECT_ROOT"
```

Claude target 排查时，把 `--skill` 路径改为 `$PROJECT_ROOT/.claude/skills/speclite-help`。这两个命令默认输出 JSON，主要是 installed Skill 和工具的 runtime support surface，不是普通首次使用步骤。`_speclite/scripts/resolve_*.py` 只用于 legacy compatibility、migration aid 和 troubleshooting，不是默认 activation resolver。

## Success Checklist（成功检查清单）

完成本文后，你应该能够确认：

- 当前 AI 会话可以从 `PATH` 执行 `speclite`。
- 当前 workspace root 包含 `_speclite/` 和本 IDE 对应的 Skill mirror。
- 你可以用自然语言或显式 Skill id 触发 `speclite-help`。
- `speclite-help` 的建议引用了项目证据，并明确下一步 Skill。
- 你能区分 Agent 的角色分发职责与 Workflow 的任务执行职责。
- 执行下一步 Workflow 前，你已经复核输入、输出、写入范围和 gate。

## Related Documents（相关文档）

| Relationship | Document |
|---|---|
| 前置教程 | [`First Install Walkthrough（首次安装演练）`](../tutorials/first-install-walkthrough.md) |
| 安装操作 | [`Install SpecLite（安装 SpecLite）`](install-speclite.md) |
| 安装校验 | [`Validate Installation（验证安装）`](validate-installation.md) |
| 故障修复 | [`Update and Repair（更新与修复）`](update-and-repair.md) |
| 运行边界 | [`Runtime Boundaries（运行边界）`](../explanation/runtime-boundaries.md) |
| 入口分类与 SDLC 路线 | [`Skill Taxonomy And SDLC（Skill 分类与 SDLC）`](../explanation/skill-taxonomy-and-sdlc.md) |
| Agent 概念 | [`SpecLite Agents（SpecLite Agent 简介）`](../explanation/speclite-agents.md) |
| Workflow 概念 | [`SpecLite Workflows（SpecLite Workflow 简介）`](../explanation/speclite-workflows.md) |
| Installed 目录参考 | [`Runtime Layout（运行时目录结构）`](../reference/runtime-layout.md) |
| SDLC catalog | [`SDLC Workflows Reference（SDLC Workflow 参考）`](../reference/skills/sdlc-workflows.md) |
