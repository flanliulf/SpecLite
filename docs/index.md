# Docs Index

本目录用于维护项目文档与设计讨论材料的入口索引。

## 目录索引

| 路径 | 类型 | 简要说明 |
|---|---|---|
| `glossary/` | 目录 | SpecLite 项目术语说明目录，包含术语总览与拆分条目。 |
| `system-design-discuss/` | 目录 | 对 SpecLite 源码所承载体系思想的衍生探讨文档。 |
| `system-design-discuss/reference/` | 目录 | `system-design-discuss/` 讨论所使用的参考源文档。 |

## 文件索引

| 路径 | 简要说明 |
|---|---|
| `glossary/glossary.md` | 术语总览文档，作为 glossary 条目的聚合入口。 |
| `glossary/file-ownership-boundaries.md` | File Ownership Boundaries（文件所有权边界）术语说明。 |
| `glossary/ide-specific-discovery-metadata.md` | IDE-specific Discovery Metadata 术语说明。 |
| `glossary/speclite-runtime-boundaries.md` | SpecLite Runtime Boundaries（SpecLite 运行边界）术语说明。 |
| `glossary/workflow-artifact.md` | Workflow Artifact（Workflow 产物）术语说明。 |
| `system-design-discuss/ai-coding-harness-framework.md` | AI Coding / Harness Engineering 顶层框架设计，覆盖 PRD、ADD、ADR、SPEC、TSD、Instructions、Skills、Agents、Hooks、Scripts / CI 等层级与职责。 |
| `system-design-discuss/reference/ADD & ADR & TSD 三者区别及关系（gpt）.md` | ADD、ADR、TSD 三类技术文档的职责边界、协同关系和示例参考源文档。 |
| `system-design-discuss/reference/万字干货！Harness Engineering如何工程化落地？.md` | Harness Engineering 工程化落地参考源文档，来源为微信文章。 |

## 维护规则

- 新增 `docs/` 下的子目录或 Markdown 文件时，同步更新本文档。
- 文件说明应保持简短，优先说明文档用途和主要内容。
- SpecLite 项目术语类文档优先放入 `glossary/`，并同步更新 `glossary/glossary.md`。
- 体系思想的衍生探讨类文档优先放入 `system-design-discuss/`。
- `system-design-discuss/` 讨论过程中引用、摘录或整理的外部/本地参考源文档放入 `system-design-discuss/reference/`。
