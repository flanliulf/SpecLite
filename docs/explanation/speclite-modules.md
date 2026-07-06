# SpecLite Modules（SpecLite Module 简介）

SpecLite Module 是一组可安装、可配置、可索引的方法论能力集合。它把多个 Skill package、Agent roster、菜单 help、输出目录和配置提示组织成一个 CLI 可以发现和安装的单位。

在当前仓库中，显式模块 metadata 由 `assets/source/speclite/core-skills/module.yaml`、`assets/source/speclite/sdlc-skills/module.yaml`、`assets/source/speclite/ecosystems/<category>/<id>/module.yaml` 以及各自的 `module-help.csv` 承载。

## Overview（概览）

Module 解决的问题是“这一组能力如何被安装到目标项目，并在本地 runtime 中被追踪”。它不是单个 Skill，也不是一个文档目录，而是 CLI 安装、配置和验证的组织边界。

当前官方模块包括 `SpecLite Core Module`、`SpecLite SDLC Module` 和可选 `Ecosystem Modules`。`core` 是 required module；`sdlc` 默认被选中，并声明依赖 `core`；ecosystem module 是 optional extension module，依赖 `sdlc`，只有用户显式选择后才投影。安装后，目标项目会获得 `_speclite` runtime、IDE skill mirrors、输出目录和 selected modules 记录。

> Note: 当前公开实现应按仓库事实理解：`core`、`sdlc` 和官方 ecosystem modules 都有显式 `module.yaml`；`core` 提供共享基础能力，`sdlc` 提供软件开发生命周期能力，ecosystem module 提供特定技术生态扩展。不要把未实现的第三方 custom module API 写成当前能力。

## Module Components（Module 组件）

| 组件 | 当前文件 | 作用 |
|---|---|---|
| Module metadata | `module.yaml` | 声明 `code`、`name`、`version`、description、默认选择、依赖、配置 prompts、目录和 Agent roster。 |
| Help catalog | `module-help.csv` | 为 Skill 提供 display name、menu code、阶段、前后置关系、输出位置和产物类型。 |
| Skill package roots | `core-skills/<skill>/`、`sdlc-skills/<phase>/<skill>/`、`ecosystems/<category>/<id>/<skill>/` | Module 内实际安装的 Agent 和 Workflow Skill 包。 |
| Runtime scripts | `scripts/` | 安装到 `_speclite/scripts` 的配置和 customization resolver。 |
| Runtime hooks | `hooks/` | 安装到 `_speclite/hooks` 的 deterministic guardrails，例如 flow gate enforcement。 |
| Custom examples | `custom/` | 团队级和用户级 customization 覆盖示例。 |

## Current Module Shape（当前模块形态）

| 模块身份 | 当前表现 | 说明 |
|---|---|---|
| `core` | `assets/source/speclite/core-skills/module.yaml` | required module，提供共享配置和基础能力。 |
| `sdlc` | `assets/source/speclite/sdlc-skills/module.yaml` | default-selected module，覆盖分析、计划、方案、实现和 DevOps。 |
| `ecosystem-<category>-<id>` | `assets/source/speclite/ecosystems/<category>/<id>/module.yaml` | optional extension module，具化到某个技术生态，依赖 `sdlc`。 |

`sdlc` 的 `required_dependencies` 包含 `core`。Ecosystem module 的 `required_dependencies: [sdlc]`，`default_selected: false`，`required: false`。这表达了一个重要边界：SDLC 方法论不是孤立运行的，它依赖 core 中的通用对话、文档、review 和协作能力；生态扩展依赖 SDLC，但不会改变 `core` / `sdlc` 默认行为。

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
4. 写入 runtime Agent descriptors 和 Hook descriptors。
5. 根据 package roots 生成 IDE skill mirrors，并按 selected IDE targets 生成 hook config。
6. 写入 `_speclite/_config` 下的 manifest、skill index、help index、files index 和 phase coverage。
7. 在 `status`、`validate` 和 `governance-report` 中读取 installed-state。

当前 baseline 校验明确关注 selected modules 的 package root 完整性。默认 no-ecosystem 安装仍只投影 `core` + `sdlc`；选择某个 ecosystem module 时，通过 dependency closure 自动包含 `sdlc` 和 `core`，但未选择的 ecosystem modules 不进入 IDE mirrors、help index、phase coverage、files index 或 installed tree。这说明 Module 不只是 UI 选择项，也是可验证的安装契约。

## Ecosystem Modules（生态模块）

Ecosystem Modules 是 optional extension module，用来承载 React、Vue、Java、Spring Boot、Node.js、Python、npm package、CLI tool、documentation-only project 等具化生态能力。它们的 canonical root 是 `assets/source/speclite/ecosystems/<category>/<id>/`，其中 `category` 只允许 `frontend`、`backend`、`other`，`id` 使用 stable lowercase kebab-case。

Ecosystem module 的存在不改变 `core` / `sdlc` 默认行为。`--yes`、JSON 默认路径和用户 skip ecosystem 时，安装结果仍是 selected `core` + `sdlc`。只有用户显式选择 module code，例如 `ecosystem-backend-java-springboot`，该 module 下的 Skill package 才会投影到目标项目 runtime。

Ecosystem module 不是项目依赖安装器、不是 package manager，也不是 UI framework installer。它只选择 SpecLite Skill packages；不会替目标项目安装 React / Vue / Java / Node.js / Python / npm package runtime dependencies。

Frontend ecosystem modules 当前包含 `ecosystem-frontend-react` 与 `ecosystem-frontend-vue`。它们用于 framework-specific project context and review，例如 React component architecture / hook state / routing / test strategy，或 Vue SFC / Composition API / routing / state / test strategy。通用 frontend discussion、UX、PRD、Architecture、Story creation 和 Code Review workflow 仍留在 `sdlc`，除非工作明确绑定到具体 React / Vue project evidence。

Other ecosystem modules 当前包含 `ecosystem-other-npm-package`、`ecosystem-other-cli-tool` 和 `ecosystem-other-documentation-only`。它们不是兜底目录，而是稳定项目形态扩展：npm package 关注 `package.json`、package surface、tarball / `npx` smoke 和 release gate readiness；CLI tool 关注 `bin` entry、command surface、TTY / non-TTY、exit code、JSON contract 和 shell portability；documentation-only project 关注 `docs/`、README、Diataxis、package-facing docs、link integrity 和 public docs source。

这些 other modules 都只是 companion guidance。真实 npm 发布仍归 `speclite-npm-publisher`；公开文档写作和目录治理仍归 `speclite-write-opensource-docs` 与 `speclite-agent-docs-steward`；通用 CLI output、Dev Story 和 Code Review workflow 仍归 `sdlc`。新增 other id 必须说明 `why-not-frontend`、`why-not-backend`、目标项目事实、安装价值和 selected-only 验收，不能使用 `other/misc`、`other/general`、`other/tools` 这类无边界命名。

SpecLite 本身仍是 CLI + filesystem control plane。新增 frontend ecosystem module 不代表新增 Web UI、dashboard、browser runtime 或 GUI product scope。

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
| hook descriptor 和 runtime projection | 流程门禁需要随 module 安装进入本地项目。 |
| 技术生态专属 Workflow | 放入 `ecosystems/<category>/<id>/` 后可以 selected-only 安装，不污染通用 SDLC。 |

不适合放入 Module 的内容：

| 内容 | 原因 |
|---|---|
| `_speclite-output/` 里的过程产物 | 那是目标项目运行结果，不是 canonical source。 |
| 单次任务的临时 prompt | 没有安装、索引和版本治理价值。 |
| 维护 canonical source 的支撑工具 | 应放在 `support-skills/`，除非明确进入用户安装面。 |
| generic SDLC workflow | 应继续留在 `sdlc-skills/`，不能因为未来可能被某技术栈使用而移入 ecosystem。 |

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
| ecosystem module metadata 和 selected-only 边界 | `assets/source/speclite/ecosystems/<category>/<id>/module.yaml` |
| 菜单 code、阶段、前后置关系和输出位置 | 各 module root 下的 `module-help.csv` |
| Module discovery 和 metadata 读取 | `src/modules/module-metadata.ts` |
| Module selection 和依赖选择 | `src/modules/module-selection.ts` |
| installed-state 和 baseline 校验 | `src/validation/rules/manifest-schema.ts` |
| Runtime config 初始化 | `src/installer/config-initialization.ts` |
| Hook runtime projection | `assets/source/speclite/hooks/` 和 `src/installer/hook-artifacts.ts` |

本文档由 speclite-agent-docs-steward Skill 自动生成
