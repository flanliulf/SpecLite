# SpecLite Modules（SpecLite Module 简介）

SpecLite Module 是一组可安装、可配置、可索引的方法论能力集合。它把多个 Skill package、Agent roster、菜单 help、输出目录和配置提示组织成一个 CLI 可以发现和安装的单位。

在当前仓库中，显式模块 metadata 由 `assets/source/speclite/core-skills/module.yaml`、`assets/source/speclite/sdlc-skills/module.yaml` 以及各自的 `module-help.csv` 承载。

## Overview（概览）

Module 解决的问题是“这一组能力如何被安装到目标项目，并在本地 runtime 中被追踪”。它不是单个 Skill，也不是一个文档目录，而是 CLI 安装、配置和验证的组织边界。

当前官方模块包括 `SpecLite Core Module` 和 `SpecLite SDLC Module`。`core` 是 required module；`sdlc` 默认被选中，并声明依赖 `core`。安装后，目标项目会获得 `_speclite` runtime、IDE skill mirrors、输出目录和 selected modules 记录。

> Note: 当前公开实现应按仓库事实理解：`core` 和 `sdlc` 都有显式 `module.yaml`；`core` 提供共享基础能力，`sdlc` 提供软件开发生命周期能力。不要把未实现的第三方 custom module API 写成当前能力。

## Module Components（Module 组件）

| 组件 | 当前文件 | 作用 |
|---|---|---|
| Module metadata | `module.yaml` | 声明 `code`、`name`、`version`、description、默认选择、依赖、配置 prompts、目录和 Agent roster。 |
| Help catalog | `module-help.csv` | 为 Skill 提供 display name、menu code、阶段、前后置关系、输出位置和产物类型。 |
| Skill package roots | `core-skills/<skill>/`、`sdlc-skills/<phase>/<skill>/` | Module 内实际安装的 Agent 和 Workflow Skill 包。 |
| Runtime scripts | `scripts/` | 安装到 `_speclite/scripts` 的配置和 customization resolver。 |
| Custom examples | `custom/` | 团队级和用户级 customization 覆盖示例。 |

## Current Module Shape（当前模块形态）

| 模块身份 | 当前表现 | 说明 |
|---|---|---|
| `core` | `assets/source/speclite/core-skills/module.yaml` | required module，提供共享配置和基础能力。 |
| `sdlc` | `assets/source/speclite/sdlc-skills/module.yaml` | default-selected module，覆盖分析、计划、方案、实现和 DevOps。 |

`sdlc` 的 `required_dependencies` 包含 `core`。这表达了一个重要边界：SDLC 方法论不是孤立运行的，它依赖 core 中的通用对话、文档、review 和协作能力。

## Configuration Model（配置模型）

Module 会把配置写入目标项目的 `_speclite/config.toml`。`core` 写入 `[core]`，`sdlc` 写入 `[modules.sdlc]`。

`SpecLite Core Module` 提供共享配置：

| 配置项 | 默认值 | 作用 |
|---|---|---|
| `user_name` | `SpecLite` | Agent 与 Workflow 在对话中称呼用户或团队的名称。 |
| `project_name` | `{directory_name}` | 目标项目名称。 |
| `communication_language` | `Chinese` | Agent 与用户对话使用的语言。 |
| `document_output_language` | `Chinese` | 文档产物默认输出语言。 |
| `output_folder` | `_speclite-output` | workflow artifact 的默认根目录。 |

`SpecLite SDLC Module` 提供 SDLC 配置：

| 配置项 | 默认值 | 作用 |
|---|---|---|
| `user_skill_level` | `intermediate` | 影响 Agent 在对话中解释概念的细致程度。 |
| `planning_artifacts` | `{output_folder}/planning-artifacts` | 存放 Brainstorming、Brief、PRD、UX、Architecture、Epics 等规划产物。 |
| `implementation_artifacts` | `{output_folder}/implementation-artifacts` | 存放 Sprint、Story、Review、Retrospective 和 Quick Flow 产物。 |
| `devops_artifacts` | `{output_folder}/devops-artifacts` | 存放 CI/CD、release gate、deployment 和 publishing report。 |
| `project_knowledge` | `docs` | 存放长期项目知识、研究资料和 reference。 |

Module 还声明安装时要创建的目录，包括 `planning-artifacts/epics`、`implementation-artifacts/stories`、`implementation-artifacts/code-reviews`、`implementation-artifacts/story-reviews`、`implementation-artifacts/flow-gates` 和 `devops-artifacts/npm-releases` 等。

## Installation Model（安装模型）

CLI 的安装流程会基于 bundled source 发现 Module，计算 selected modules，并把结果写入目标项目 runtime：

1. 从 canonical source root 读取带有 `module.yaml` 的 Module。
2. 根据默认选择、用户选择和 `required_dependencies` 计算 selected module ids。
3. 使用 Module metadata 初始化 `_speclite/config.toml`。
4. 根据 package roots 生成 IDE skill mirrors。
5. 写入 `_speclite/_config` 下的 manifest、skill index、help index、files index 和 phase coverage。
6. 在 `status`、`validate` 和 `governance-report` 中读取 installed-state。

当前 baseline 校验明确关注 `core` 与 `sdlc` 同时出现时的 package root 完整性，这说明 Module 不只是 UI 选择项，也是可验证的安装契约。

## Module vs Agent vs Workflow（Module、Agent、Workflow 的区别）

| 维度 | Module | Agent | Workflow |
|---|---|---|---|
| 主要问题 | 哪些能力一起安装和配置？ | 谁以什么角色协作？ | 按什么流程完成任务？ |
| 当前文件 | `module.yaml`、`module-help.csv`、Skill package roots。 | `speclite-agent-*` 的 `SKILL.md` 和 `[agent]`。 | Workflow Skill 的 `SKILL.md`、`references/`、`assets/`。 |
| Runtime 影响 | selected modules、config、indexes、directories。 | persona、菜单和角色分发。 | 产物、检查、迁移、实现或发布流程。 |
| 使用者感知 | 安装时选择和后续验证。 | 对话中激活角色。 | 执行具体研发任务。 |

## What Belongs in a Module（什么应该属于 Module）

适合放入 Module 的内容：

| 内容 | 原因 |
|---|---|
| 同一方法论阶段的一组 Workflow | 需要一起安装、索引和维护。 |
| 与这些 Workflow 配套的 Agent | 需要在菜单和 config 中公开角色入口。 |
| 输出目录和配置 prompts | 安装时需要生成稳定 runtime contract。 |
| help catalog 和阶段关系 | 用户、Agent 和 CLI 都需要发现入口。 |

不适合放入 Module 的内容：

| 内容 | 原因 |
|---|---|
| `_speclite-output/` 里的过程产物 | 那是目标项目运行结果，不是 canonical source。 |
| 单次任务的临时 prompt | 没有安装、索引和版本治理价值。 |
| 维护 canonical source 的支撑工具 | 应放在 `support-skills/`，除非明确进入用户安装面。 |

## Current Boundaries（当前边界）

当前 SpecLite Module 仍以 local-first CLI 和 filesystem contract 为核心。它不依赖 hosted service、数据库或浏览器 UI；Module 的真实性来自仓库中的 `module.yaml`、`module-help.csv`、canonical Skill package roots、manifest schema 和验证测试。

如果未来要扩展更多官方 Module，应先补齐：

| 事项 | 原因 |
|---|---|
| 新 Module 的 `module.yaml` | 让 CLI 可以发现和选择。 |
| 对应 `module-help.csv` | 让菜单、阶段和输出位置可查。 |
| package roots 和 manifest baseline | 让安装结果可验证。 |
| docs/reference 和 explanation 更新 | 让用户知道模块边界和配置影响。 |

## Evidence Anchors（事实锚点）

| 事实 | 来源 |
|---|---|
| `core` 模块名称、版本、required 状态和配置项 | `assets/source/speclite/core-skills/module.yaml` |
| `sdlc` 模块名称、版本、依赖和配置项 | `assets/source/speclite/sdlc-skills/module.yaml` |
| 菜单 code、阶段、前后置关系和输出位置 | `assets/source/speclite/core-skills/module-help.csv` 和 `assets/source/speclite/sdlc-skills/module-help.csv` |
| Module discovery 和 metadata 读取 | `src/modules/module-metadata.ts` |
| Module selection 和依赖选择 | `src/modules/module-selection.ts` |
| installed-state 和 baseline 校验 | `src/validation/rules/manifest-schema.ts` |
| Runtime config 初始化 | `src/installer/config-initialization.ts` |

本文档由 speclite-agent-docs-steward Skill 自动生成
