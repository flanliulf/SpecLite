# Docs Index（文档索引）

`docs/` 是 SpecLite 的公开文档入口，用于承载面向使用者、开发者和维护者的长期项目文档。

本目录不替代 `_bmad-output/` 的研发过程产物，也不替代 `assets/source/speclite/` 的 canonical methodology package source。

本索引默认描述当前仓库 `main` 的文档状态。使用已发布 npm package 时，应优先阅读该 package 自带的 [`quick-start.md`](quick-start.md)，其内容适用于携带该文件的 package version。

## Read First（优先阅读）

| 路径 | 说明 |
|---|---|
| [`tutorials/speclite-orientation.md`](tutorials/speclite-orientation.md) | 面向初学者的 10–15 分钟全景导览，先理解职责、概念和学习路线。 |
| [`tutorials/speclite-developer-training.md`](tutorials/speclite-developer-training.md) | 面向讲师和学习者的 13 篇材料、3 小时培训组织与验收清单。 |
| [`tutorials/quick-start.md`](tutorials/quick-start.md) | 按顺序理解安装预览、写入授权、状态检查和输出边界的学习教程。 |
| [`quick-start.md`](quick-start.md) | npm package 携带的 Distribution Entrypoint（发布入口），覆盖安装、验证、排错和必要维护。 |

## Documentation Types（文档类型）

| 目录 | 类型 | 职责 |
|---|---|---|
| [`tutorials/`](tutorials/index.md) | Tutorial | 学习导向，从零带用户完成一条完整路径。 |
| [`how-to/`](how-to/index.md) | How-To | 任务导向，帮助已有基础的用户解决具体问题。 |
| [`explanation/`](explanation/index.md) | Explanation | 理解导向，解释架构、概念、原理和设计取舍。 |
| [`reference/`](reference/index.md) | Reference | 查阅导向，提供命令、配置、目录、字段、issue 和 skill catalog。 |
| [`reference/specs/`](reference/specs/index.md) | Normative Specification | 规定实现与外部消费者必须共同遵守的公共契约。 |

## Distribution Entrypoint（发布入口）

[`quick-start.md`](quick-start.md) 是随 npm package 发布并持续维护的自包含入口。它不是 legacy compatibility page，不能缩减为依赖完整仓库文档的跳转页。

## Core Topics（核心主题）

| 主题 | 推荐入口 |
|---|---|
| 新开发者全景导览 | [`tutorials/speclite-orientation.md`](tutorials/speclite-orientation.md) |
| 13 篇开发者入门培训 | [`tutorials/speclite-developer-training.md`](tutorials/speclite-developer-training.md) |
| 安装和首次使用 | [`tutorials/quick-start.md`](tutorials/quick-start.md) |
| npm package 自包含快速开始 | [`quick-start.md`](quick-start.md) |
| 安装验证 | [`how-to/validate-installation.md`](how-to/validate-installation.md) |
| Installed Skill 首次调用 | [`how-to/use-installed-skills.md`](how-to/use-installed-skills.md) |
| 第一次 brownfield baseline | [`tutorials/first-brownfield-project.md`](tutorials/first-brownfield-project.md) |
| 更新与修复 | [`how-to/update-and-repair.md`](how-to/update-and-repair.md) |
| 已安装项目治理命令 | [`how-to/manage-installed-project.md`](how-to/manage-installed-project.md) |
| CI 和企业自动化 | [`how-to/ci-enterprise-automation.md`](how-to/ci-enterprise-automation.md) |
| 流程治理覆盖报告 | [`how-to/process-governance-report.md`](how-to/process-governance-report.md) |
| CLI 命令参考 | [`reference/cli.md`](reference/cli.md) |
| CLI human output 覆盖矩阵 | [`reference/cli-human-output-matrix.md`](reference/cli-human-output-matrix.md) |
| CommandResult JSON | [`reference/command-result-json.md`](reference/command-result-json.md) |
| CommandResult JSON 规范性说明 | [`reference/specs/command-result-json-contract.md`](reference/specs/command-result-json-contract.md) |
| runtime layout | [`reference/runtime-layout.md`](reference/runtime-layout.md) |
| workflow artifact layout | [`reference/workflow-artifact-layout.md`](reference/workflow-artifact-layout.md) |
| workflow artifact 术语 | [`reference/glossary/workflow-artifact.md`](reference/glossary/workflow-artifact.md) |
| canonical source layout | [`reference/canonical-source-layout.md`](reference/canonical-source-layout.md) |
| canonical source governance | [`reference/canonical-source-governance.md`](reference/canonical-source-governance.md) |
| optional ecosystem skill catalog | [`reference/skills/ecosystem-skills.md`](reference/skills/ecosystem-skills.md) |
| 文件所有权模型 | [`explanation/file-ownership-model.md`](explanation/file-ownership-model.md) |
| 文件所有权边界术语 | [`reference/glossary/file-ownership.md`](reference/glossary/file-ownership.md) |
| local-first control plane | [`explanation/local-first-control-plane.md`](explanation/local-first-control-plane.md) |
| runtime boundaries | [`explanation/runtime-boundaries.md`](explanation/runtime-boundaries.md) |
| Skill 分类与 SDLC 入口选择 | [`explanation/skill-taxonomy-and-sdlc.md`](explanation/skill-taxonomy-and-sdlc.md) |
| SpecLite Agent 体系 | [`explanation/speclite-agents.md`](explanation/speclite-agents.md) |
| SpecLite Module 体系 | [`explanation/speclite-modules.md`](explanation/speclite-modules.md) |
| SpecLite Workflow 体系 | [`explanation/speclite-workflows.md`](explanation/speclite-workflows.md) |

## Compatibility Entrypoints（兼容入口）

| 路径 | 状态 | 说明 |
|---|---|---|
| [`glossary/`](glossary/glossary.md) | Frozen | 旧 glossary 兼容入口；主要术语表位于 `reference/glossary/`。 |

## Supplementary Materials（补充材料）

| 类型 | 入口 | 说明 |
|---|---|---|
| Presentation | [`presentations/`](presentations/index.md) | 面向分享和演示的公开补充材料；关键结论必须回链主要公开文档或规范性说明。 |

## Migrated Material（已迁移材料）

| 原内容 | 新位置 | 简要说明 |
|---|---|---|
| AI Coding / Harness Engineering 体系讨论 | `aicoding-ideal` 项目的 `system-design-discuss/` | 泛化体系思想的衍生探讨已迁移到 `aicoding-ideal` 项目继续维护。 |

## Maintainers（维护者）

- 文档目录职责、归类、索引和迁移规则：[`README.md`](README.md)
- 写作格式、文档类型模板与自动检查：[`_STYLE_GUIDE.md`](_STYLE_GUIDE.md)
