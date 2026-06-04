# Quick Start（快速开始）

本文面向第一次接触 SpecLite 的使用者，说明如何把 SpecLite 安装到一个本地项目中，并完成安装后的基础使用和检查。

SpecLite 不是普通文档包。它是一套面向企业级生产项目的 AI Coding 落地方法论，通过 CLI 安装到本地项目后，会生成 runtime、IDE skill mirrors、manifest/index 和过程产物目录，让团队可以在多个 AI IDE 中使用一致的工作流入口。

## Prerequisites（前置条件）

安装前请确认：

- 本机已安装 Node.js `>=22`；推荐 Node.js 24 LTS。
- 目标项目是一个本地目录。
- 你知道要把 SpecLite 安装到哪个项目根目录，例如 `/path/to/project`。
- 如果目标项目已有 SpecLite 安装状态，先执行 `status` 或 `validate` 了解现状，不要直接覆盖。

## Install CLI（安装 CLI）

如果团队已经发布了 `speclite` npm 包，可以按团队发布渠道安装：

```sh
npm install -g speclite
```

如果你正在使用本仓库开发版，请在 SpecLite 仓库中安装依赖并构建：

```sh
npm install
npm run build
```

开发版可以通过 `npm run dev --` 运行 CLI：

```sh
npm run dev -- status /path/to/project
```

后续示例默认使用发布包命令 `speclite`。如果你使用开发版，把命令前缀替换为 `npm run dev --` 即可。

## Choose Target Project（选择目标项目）

`target-directory` 是你要安装 SpecLite 的项目根目录：

```sh
speclite status /path/to/project
```

如果省略 `target-directory`，SpecLite 会以当前工作目录作为目标项目：

```sh
cd /path/to/project
speclite status
```

建议新用户显式传入目标路径，避免把 SpecLite 安装到错误目录。

## Run Preflight（执行安装前检查）

先不授权写入，只检查目标目录状态：

```sh
speclite install /path/to/project
```

这一步不会写入项目文件。当前实现会在没有 `--yes` 时停在写入授权之前，并提示下一步如何继续。它适合用来确认目标目录是否存在、是否是已有安装、是否存在不安全路径或明显阻塞。

## Install SpecLite（安装 SpecLite）

确认目标目录正确后，使用 `--yes` 授权安装写入：

```sh
speclite install /path/to/project --yes
```

默认安装使用 bundled source，也就是随当前 CLI 包携带的 `assets/source/speclite/` 方法论源包。安装过程会选择官方模块、初始化配置、创建 runtime 结构、写入 IDE mirrors、生成 manifest/index，并执行 ReadyCheck。

默认模块和目标包括：

| Item | Default |
|---|---|
| Required module | `core` |
| Default-selected module | `sdlc` |
| IDE targets | `claude`、`agents` |
| Claude skill directory | `.claude/skills` |
| Generic agent skill directory | `.agents/skills` |
| Runtime root | `_speclite` |
| Artifact root | `_speclite-output` |

安装成功后，命令会提示你：

- 从配置好的 IDE 中打开 `.claude/skills` 或 `.agents/skills` 下的 skills。
- 运行 `speclite status` 查看 installed-state summary。
- 运行 `speclite validate` 做更深入的本地校验。

## Quick Config vs Detailed Config（快速配置与详细配置）

安装时的配置阶段支持两种模式：

- `quick`：使用 deterministic defaults，适合大多数新用户。
- `detailed`：允许调整项目名、用户显示名、沟通语言、文档输出语言、输出目录、模块产物路径和 IDE targets。

如果你不确定选什么，使用默认 `quick`。

常见默认值：

| Field | Default |
|---|---|
| `user_name` | `SpecLite` |
| `project_name` | 目标目录名 |
| `communication_language` | `Chinese` |
| `document_output_language` | `Chinese` |
| `output_folder` | `_speclite-output` |
| `planning_artifacts` | `_speclite-output/planning-artifacts` |
| `implementation_artifacts` | `_speclite-output/implementation-artifacts` |
| `project_knowledge` | `docs` |

## Verify Installation（验证安装）

安装后先看 summary：

```sh
speclite status /path/to/project
```

再执行完整校验：

```sh
speclite validate /path/to/project
```

如果你需要给 CI、脚本或其它工具消费结果，使用 JSON 输出：

```sh
speclite status /path/to/project --json
speclite validate /path/to/project --json
```

`validate` 会检查 installed-state、runtime path、manifest/index、IDE mirrors、source integrity、file ownership 等安装健康度相关问题。

## Use Installed Skills（使用已安装的 Skills）

安装完成后，在目标项目中打开对应 AI IDE：

- Claude Code：查看 `.claude/skills/`。
- 支持 `.agents/skills` 的 IDE 或 agent runtime：查看 `.agents/skills/`。

SpecLite skills 按能力分层：

- Core skills：帮助、头脑风暴、文档索引、文档拆分、评审辅助、customization 等共享能力。
- SDLC skills：从分析、计划、方案设计到实现和评审的一整套 AI Coding workflow。

新用户通常可以从这些入口开始：

| Goal | Skill / Menu |
|---|---|
| 查看可用能力和下一步建议 | `speclite-help` |
| 为既有项目生成上下文 | `speclite-generate-project-context` |
| 分析 brownfield 项目 | `speclite-brownfield-context-builder` |
| 撰写 PRD | `speclite-create-prd` |
| 创建架构文档 | `speclite-create-architecture` |
| 拆分 Epic 和 Story | `speclite-create-epics-and-stories` |
| 进入实现阶段 | `speclite-sprint-planning`、`speclite-create-story`、`speclite-dev-story` |
| 执行代码审查闭环 | `speclite-code-review-01-reviewer` 到 `speclite-code-review-06-finalizer` |

如果不知道从哪里开始，先调用 `speclite-help`，让它根据当前项目状态和你的意图推荐下一步。

## Update and Repair（更新与修复）

查看可用更新计划：

```sh
speclite update /path/to/project
```

应用非冲突的 installer-owned 更新：

```sh
speclite update /path/to/project --yes
```

生成 repair plan：

```sh
speclite update /path/to/project --repair
```

应用可安全修复的 installer-owned drift：

```sh
speclite update /path/to/project --repair --yes
```

`update` 和 `repair` 遵守文件所有权边界：human-owned custom files 和 workflow-owned artifacts 不会被静默覆盖。

## Custom Sources（自定义来源）

默认安装来源是 `bundled`。CLI 也接受以下 source type：

- `npm`
- `private-registry`
- `local-tarball`
- `offline-bundle`
- `git`
- `local`

自定义来源需要提供 `--source-value`，例如：

```sh
speclite install /path/to/project --yes --source local --source-value /path/to/source
```

非 bundled source 会先记录 source access intent，并在读取外部 metadata 或本地 artifact 前要求确认。不同 source resolver 的可用程度取决于当前实现状态；如果遇到 `source-integrity.unsupported-source`，请改用 bundled source 或等待对应 source resolver 完成。

## Automation（自动化用法）

脚本或 CI 中建议使用 `--json`：

```sh
speclite install /path/to/project --yes --json
speclite status /path/to/project --json
speclite validate /path/to/project --json
```

注意：

- `--json` 会输出 machine-readable CommandResult JSON。
- 自动化不要依赖 spinner、颜色、emoji 或 human-readable 文本。
- 写入类命令仍然需要显式 `--yes`。

## Troubleshooting（排查问题）

| Symptom | What to do |
|---|---|
| 安装没有写入文件 | 检查是否缺少 `--yes`。无 `--yes` 时 install 会停在写入授权前。 |
| 目标目录已有安装 | 先运行 `speclite status` 或 `speclite validate`，确认 installed-state 后再决定 update 或 repair。 |
| Validate 报 IDE mirror 问题 | 检查 `.claude/skills` 和 `.agents/skills` 是否被手工改动，再运行 `speclite update --repair` 查看 repair plan。 |
| Update 发现 conflict | 先阅读 update plan 和 conflicts，不要手工覆盖 human-owned 或 workflow-owned 文件。 |
| 自定义来源被阻塞 | 优先使用 bundled source；如果必须使用自定义来源，确认 source type、source value 和 resolver 支持状态。 |

## Next Steps（下一步）

完成安装和验证后，建议按这个顺序开始使用：

1. 在 IDE 中打开已安装的 SpecLite skills。
2. 调用 `speclite-help` 查看当前项目适合的下一步。
3. 对 brownfield 项目，先生成项目上下文或 brownfield baseline。
4. 对新项目，从 PRD、Architecture、Epics/Stories 开始建立计划。
5. 进入实现阶段后，用 Sprint Planning、Story、Dev Story 和 Code Review 链路闭环交付。
