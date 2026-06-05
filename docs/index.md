# Docs Index

本目录用于维护项目文档与设计讨论材料的入口索引。

## 目录索引

| 路径 | 类型 | 简要说明 |
|---|---|---|
| `glossary/` | 目录 | SpecLite 项目术语说明目录，包含术语总览与拆分条目。 |

## 文件索引

| 路径 | 简要说明 |
|---|---|
| `quick-start.md` | 面向新用户的 SpecLite 安装、首次使用、验证、更新与排查指南。 |
| `glossary/glossary.md` | 术语总览文档，作为 glossary 条目的聚合入口。 |
| `glossary/file-ownership-boundaries.md` | File Ownership Boundaries（文件所有权边界）术语说明。 |
| `glossary/ide-specific-discovery-metadata.md` | IDE-specific Discovery Metadata 术语说明。 |
| `glossary/speclite-runtime-boundaries.md` | SpecLite Runtime Boundaries（SpecLite 运行边界）术语说明。 |
| `glossary/workflow-artifact.md` | Workflow Artifact（Workflow 产物）术语说明。 |

## 已迁移文档

| 原内容 | 新位置 | 简要说明 |
|---|---|---|
| AI Coding / Harness Engineering 体系讨论 | `/Users/fancyliu/AIBase/aicoding-ideal/system-design-discuss/` | 对 SpecLite 源码所承载体系思想的衍生探讨已迁移到 `aicoding-ideal` 项目继续维护。 |

## 维护规则

- 新增 `docs/` 下的子目录或 Markdown 文件时，同步更新本文档。
- 文件说明应保持简短，优先说明文档用途和主要内容。
- SpecLite 项目术语类文档优先放入 `glossary/`，并同步更新 `glossary/glossary.md`。
- 体系思想的衍生探讨类文档已迁移到 `/Users/fancyliu/AIBase/aicoding-ideal/system-design-discuss/`，后续不再放入本仓库 `docs/`。
