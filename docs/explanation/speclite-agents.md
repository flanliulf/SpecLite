# SpecLite Agents（SpecLite Agent 简介）

SpecLite Agent 是面向某个研发职责的 role activation Skill。它不只是一个普通提示词，而是把 persona、持续身份、菜单入口、事实加载和 workflow 分发规则封装在一个可安装的 Skill 包里。

在当前 SpecLite 体系中，Agent 负责“谁来判断和分发”；Workflow 负责“按什么流程完成工作”；Module 负责“把哪些 Agent 和 Workflow 一起安装、配置和索引”。

## Overview（概览）

当前 SpecLite 的 Agent 以 `speclite-agent-*` 目录存在于 `assets/source/speclite/sdlc-skills/` 下。每个 Agent 都有自己的 `SKILL.md` 和 `customize.toml`，其中 `customize.toml` 的 `[agent]` block 定义 persona、菜单、持久事实和交互风格。

安装后，Agent 作为本地 IDE 可发现的 Skill 被使用。用户可以要求“talk to Alice”“激活 PM”“使用 docs steward”等，Agent 会先加载自身身份和上下文，再把明确任务分发给对应 Workflow Skill 或 prompt。

> Note: 当前仓库里的 Agent 是 role activation Skill，不等同于 support tooling。`speclite-agent-creator` 和 `speclite-agent-lint` 是维护 Agent 定义包的支撑工具，本身不是业务 persona Agent。

## Current Roster（当前角色）

当前 `SpecLite SDLC Module` 在 `module.yaml` 中声明 7 个 Agent：

| Agent | Persona | 阶段 | 主要职责 |
|---|---|---|---|
| `speclite-agent-analyst` | Alice / Business Analyst | `1-analysis` | 需求分析、调研、Product Brief、PRFAQ。 |
| `speclite-agent-tech-writer` | Taylor / Technical Writer | `1-analysis` | 技术文档、Mermaid、概念解释、文档验证。 |
| `speclite-agent-docs-steward` | Sarah / Open Source Docs Steward | `1-analysis` | `docs/` 信息架构、Diataxis、公开文档质量。 |
| `speclite-agent-pm` | Paul / Product Manager | `2-plan-workflows` | PRD、需求发现、Epic 和 readiness 对齐。 |
| `speclite-agent-ux-designer` | Uma / UX Designer | `2-plan-workflows` | UX 设计、界面规划、用户约束。 |
| `speclite-agent-architect` | Adam / System Architect | `3-solutioning` | 架构方案、技术取舍、implementation readiness。 |
| `speclite-agent-dev` | David / Senior Software Engineer | `4-implementation` | Story 实现、test-first 执行、代码交付。 |

这些 Agent 与 SDLC 阶段对齐，但并不强制用户只能按阶段调用。`module-help.csv` 也把部分 Agent 标为 `anytime`，例如文档、分析和快速处理类能力可在任意阶段介入。

## Agent Components（Agent 组件）

| 组件 | 当前实现 | 作用 |
|---|---|---|
| `SKILL.md` | Agent 的入口说明和激活协议。 | 告诉 AI 何时激活、如何加载配置、如何保持 persona。 |
| `customize.toml` | `[agent]` 默认配置。 | 定义 `name`、`title`、`icon`、`role`、`identity`、`communication_style`、`principles` 和菜单。 |
| `agent.menu` | `[[agent.menu]]` 数组。 | 把菜单项映射到 Workflow Skill 或本地 prompt。 |
| `persistent_facts` | 文件路径或 glob。 | 激活时读取稳定项目事实，例如 docs 规范、README、package metadata。 |
| `module.yaml` roster | `agents:` 列表。 | 让 Module 公开 Agent 名称、title、本地化说明和团队归属。 |
| Runtime descriptor | `_speclite/config.toml` 的 `[agents.<agent-id>]`。 | 安装时记录 Agent `module`、`team`、`name`、`title`、`icon` 和 description，供 runtime config 与 customization 使用。 |
| 支撑检查 | `speclite-agent-lint`。 | 检查 `[agent]` block、菜单目标、persona 语义和 runtime 残留。 |

## Activation Model（激活模型）

Agent 激活时通常遵循同一模式：

1. 解析 `customize.toml` 的 `[agent]` block。
2. 合并团队级和用户级 customization。
3. 读取 `persistent_facts` 指向的项目事实。
4. 读取已安装项目中的 `_speclite/config.toml`，取得语言、输出目录和项目知识路径。
5. 采用对应 persona，并在 dismiss 前保持持续身份。
6. 如果用户意图匹配菜单，直接分发给菜单目标；否则展示菜单等待用户选择。

这种模式让 Agent 在多轮对话中保持同一个角色判断框架，同时避免把所有流程细节塞进 Agent 自身。

## Agents vs Workflows（Agent 与 Workflow 的区别）

| 维度 | Agent | Workflow |
|---|---|---|
| 核心问题 | 谁来协助判断和路由？ | 按什么步骤完成任务？ |
| 主要文件 | `SKILL.md` + `customize.toml` `[agent]`。 | `SKILL.md` + `references/`、`assets/`、`scripts/`。 |
| 状态语义 | 激活 persona，并持续到用户 dismiss。 | 执行一个任务、检查、生成或修改产物。 |
| 菜单职责 | 展示能力入口，分发到 Workflow。 | 承载具体步骤、规则、模板和验证。 |
| 典型输出 | 建议、分发、角色化协作。 | PRD、Architecture、Story、Review、Report、Docs。 |

Agent 不应该替代 Workflow。以 `speclite-agent-docs-steward` 为例，Sarah 负责判断文档类型、目录边界和公开文档质量；真正的写作、迁移、校验会分发到 `speclite-write-opensource-docs`。

## Agents vs Support Skills（Agent 与支撑 Skill 的区别）

SpecLite 里有一组名字也包含 `agent` 的支撑工具：

| 支撑工具 | 作用 |
|---|---|
| `speclite-agent-creator` | 创建或迁移 `speclite-agent-*` / `bmad-agent-*` role activation 定义包。 |
| `speclite-agent-lint` | 只读检查 Agent 包是否保留 `[agent]`、persona、菜单和持续身份语义。 |

这两者属于 `support-skills/`，服务 canonical source 维护，不是用户在项目里协作的角色 persona。

## When to Use（何时使用）

适合使用 Agent 的场景：

| 场景 | 推荐方式 |
|---|---|
| 你需要某个研发角色先判断问题 | 激活对应 Agent，例如 `speclite-agent-pm` 或 `speclite-agent-architect`。 |
| 任务入口很多，不确定该走哪个 Workflow | 使用 Agent 菜单或让 Agent 分发。 |
| 任务需要保持角色口径 | 让 Agent 在多轮对话中持续保持 persona。 |
| 需要基于项目事实做文档或架构判断 | 使用带 `persistent_facts` 的 Agent。 |

不适合使用 Agent 的场景：

| 场景 | 更合适的入口 |
|---|---|
| 已经明确要执行某个流程 | 直接调用 Workflow Skill。 |
| 只想查命令、字段或 catalog | 查看 `reference/` 文档。 |
| 要维护 canonical Agent 包本身 | 使用 `speclite-agent-creator` 或 `speclite-agent-lint`。 |

## Evidence Anchors（事实锚点）

| 事实 | 来源 |
|---|---|
| Agent roster、title、本地化说明和阶段 | `assets/source/speclite/sdlc-skills/module.yaml` |
| Agent 菜单和 persona 默认配置 | `assets/source/speclite/sdlc-skills/*/speclite-agent-*/customize.toml` |
| Agent 激活协议 | `assets/source/speclite/sdlc-skills/*/speclite-agent-*/SKILL.md` |
| Runtime Agent descriptor | `_speclite/config.toml` 的 `[agents.<agent-id>]`，生成逻辑见 `src/installer/config-initialization.ts` |
| Agent 支撑工具边界 | `assets/source/speclite/support-skills/speclite-agent-creator/` 和 `speclite-agent-lint/` |
| Module help 中的菜单入口 | `assets/source/speclite/sdlc-skills/module-help.csv` |

本文档由 speclite-agent-docs-steward Skill 自动生成
