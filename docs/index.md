# Docs Index（文档索引）

`docs/` 是 SpecLite 的官网文档源，用于承载面向使用者、开发者和维护者的公开项目文档。

本目录不替代 `_bmad-output/` 的研发过程产物，也不替代 `assets/source/speclite/` 的 canonical methodology package source。

## Read First（优先阅读）

| 路径 | 说明 |
|---|---|
| [`_STYLE_GUIDE.md`](_STYLE_GUIDE.md) | SpecLite 文档写作、目录职责和目标校验规范。 |
| [`tutorials/quick-start.md`](tutorials/quick-start.md) | 从零完成安装、验证和首次使用的完整教程。 |
| [`quick-start.md`](quick-start.md) | npm package 携带的精简快速开始入口。 |

## Documentation Types（文档类型）

| 目录 | 类型 | 职责 |
|---|---|---|
| [`tutorials/`](tutorials/index.md) | Tutorial | 学习导向，从零带用户完成一条完整路径。 |
| [`how-to/`](how-to/index.md) | How-To | 任务导向，帮助已有基础的用户解决具体问题。 |
| [`explanation/`](explanation/index.md) | Explanation | 理解导向，解释架构、概念、原理和设计取舍。 |
| [`reference/`](reference/index.md) | Reference | 查阅导向，提供命令、配置、目录、字段、issue 和 skill catalog。 |

## Core Topics（核心主题）

| 主题 | 推荐入口 |
|---|---|
| 安装和首次使用 | [`tutorials/quick-start.md`](tutorials/quick-start.md) |
| npm package 精简快速开始 | [`quick-start.md`](quick-start.md) |
| 安装验证 | [`how-to/validate-installation.md`](how-to/validate-installation.md) |
| 更新与修复 | [`how-to/update-and-repair.md`](how-to/update-and-repair.md) |
| 已安装项目治理命令 | [`how-to/manage-installed-project.md`](how-to/manage-installed-project.md) |
| CI 和企业自动化 | [`how-to/ci-enterprise-automation.md`](how-to/ci-enterprise-automation.md) |
| 流程治理覆盖报告 | [`how-to/process-governance-report.md`](how-to/process-governance-report.md) |
| CLI 命令参考 | [`reference/cli.md`](reference/cli.md) |
| CLI human output 覆盖矩阵 | [`reference/cli-human-output-matrix.md`](reference/cli-human-output-matrix.md) |
| CommandResult JSON | [`reference/command-result-json.md`](reference/command-result-json.md) |
| runtime layout | [`reference/runtime-layout.md`](reference/runtime-layout.md) |
| canonical source layout | [`reference/canonical-source-layout.md`](reference/canonical-source-layout.md) |
| 文件所有权模型 | [`explanation/file-ownership-model.md`](explanation/file-ownership-model.md) |
| 文件所有权边界术语 | [`glossary/file-ownership-boundaries.md`](glossary/file-ownership-boundaries.md) |
| local-first control plane | [`explanation/local-first-control-plane.md`](explanation/local-first-control-plane.md) |
| canonical methodology framework | [`explanation/canonical-methodology-framework.md`](explanation/canonical-methodology-framework.md) |
| SpecLite Agent 体系 | [`explanation/speclite-agents.md`](explanation/speclite-agents.md) |
| SpecLite Module 体系 | [`explanation/speclite-modules.md`](explanation/speclite-modules.md) |
| SpecLite Workflow 体系 | [`explanation/speclite-workflows.md`](explanation/speclite-workflows.md) |

## Compatibility Entrypoints（兼容入口）

| 路径 | 状态 | 说明 |
|---|---|---|
| [`quick-start.md`](quick-start.md) | 保留 | README 和 npm package 使用的精简入口；完整教程位于 `tutorials/quick-start.md`。 |
| [`glossary/`](glossary/glossary.md) | 保留 | 旧 glossary 入口。后续可迁移到 `reference/glossary/` 并保留跳转。 |

## Migrated Material（已迁移材料）

| 原内容 | 新位置 | 简要说明 |
|---|---|---|
| AI Coding / Harness Engineering 体系讨论 | `/Users/fancyliu/AIBase/aicoding-ideal/system-design-discuss/` | 泛化体系思想的衍生探讨已迁移到 `aicoding-ideal` 项目继续维护。 |

## Maintenance Rules（维护规则）

- 新增、重命名或迁移 `docs/` 下的 Markdown 文件时，同步更新本文档。
- 文档正文使用中文；章节标题使用 English（中文）形式。
- GitHub 和 npm 是当前主要渲染目标，不使用 Starlight-only admonition 语法。
- `tutorials/`、`how-to/`、`explanation/`、`reference/` 按 Diataxis 职责分层，避免同一文档同时承担过多目的。
- 泛化 AI Coding 思想放到 `aicoding-ideal`；由 SpecLite 当前实现、fixtures、canonical source 支撑的工程化解释留在本目录。
