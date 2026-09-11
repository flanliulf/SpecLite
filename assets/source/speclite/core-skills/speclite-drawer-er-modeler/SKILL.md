---
name: speclite-drawer-er-modeler
description: "Design evidence-aware ER models and render technical entity-relationship diagrams. Use when the user says 'ER图绘制', '数据库建模', 'ER diagram', or 'entity relationship model'. Core capabilities: gate field inference, classify existing/new/modified objects, apply deterministic visual semantics, and explain integrity and indexing decisions."
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Drawer ER Modeler（ER 图建模器）

[Overview（技能说明）]
    将用户描述、PRD、Architecture、领域材料或既有 schema 转换为可复核的 ER 模型与技术图。Skill 名称不绑定 Mermaid、PlantUML 等载体；当前默认 renderer 为 Mermaid `erDiagram`，具体语法属于内部实现。不得把需求推断冒充已确认事实，也不得把设计图冒充数据库已实现证据。

[Core Capabilities（核心能力）]
    - **字段推理门控**：区分明确字段、关系必然推出的候选字段和惯例性补全；字段材料不足时只画最小可信模型。
    - **分层数据设计**：根据调用上下文选择 conceptual、logical 或 physical 模型；只有信息足够时才给出具体 SQL 类型、索引和约束。
    - **变更对象识别**：从用户表达和可用证据中区分 `existing`、`new`、`modified` 和 `unresolved` 对象。
    - **确定性视觉语义**：用固定颜色和线型表达对象变更类别，并生成图例；禁止每次随机配色。
    - **图形语法生成**：通过选定 renderer 生成合法代码；Mermaid 实现需保证 key/comment 分离，并以简短的 `中文(英文)` 表达关系标签。
    - **多重性语言化**：在图后逐条输出 `1 : 0..N` 等多重性，并用两个方向的自然语言说明 optional/mandatory 约束。
    - **完整性与性能说明**：补充唯一约束、外键策略、必要索引、热点查询和范式/反范式权衡，不臆造数据库产品特性。

[Conventions（约定）]
    - 实体 identifier 默认使用大写 `SNAKE_CASE`，字段名使用小写 `snake_case`；display alias 使用 `中文对象名（ENGLISH_IDENTIFIER）`。
    - Mermaid 实现的属性语法使用 `type name [key] ["comment"]`；`PK`、`FK`、`UK` 属于 key，说明属于 comment。
    - 关系使用 Crow's Foot 基数；Mermaid 关系标签统一使用双引号包裹的 `中文(英文)` 动词或动词短语，例如 `"包含(contains)"`。
    - 物理模型中的 M:N 关系默认转换为显式关联实体；conceptual 模型可保留 M:N，但必须标注其层级。
    - SQL 类型必须服从已确认的数据库方言。方言未知时使用保守通用类型，或省略不可靠的长度、精度与产品专属类型。
    - 字段证据门、对象分类、固定视觉语义、renderer 语法、基数矩阵和输出契约见 `references/er-drawing-rules.md`；执行本 Skill 时必须完整读取该文件。

[Workflow（执行流程）]
    1. 确认范围、受众、数据库方言、模型层级、renderer 和输出位置；缺少会实质改变模型的信息时 HALT。
    2. 建立 evidence ledger：分别记录明确对象/字段、结构性候选、惯例性猜测和未决问题。
    3. 执行字段充分性门：材料不足时降级到 conceptual 或最小 logical 图，不自动补全 `id`、名称、状态和审计字段。
    4. 分类对象：依据明确措辞与既有 schema/code，将对象标记为 `existing`、`new`、`modified` 或 `unresolved`；不按名称猜测。
    5. 设计关系与最小字段集，应用固定颜色、图例和中英双语 display alias，再生成 renderer 代码。
    6. 在图后为每条关系生成多重性摘要和双向自然语言说明；随后自检实体引用、字段证据、分类证据、PK/FK、基数、M:N、颜色、关系标签和说明一致性。

[Output Contract（输出契约）]
    输出依次包含：建模层级与范围、renderer、字段充分性结论、对象变更分类表、假设/未决问题、完整图形代码、关系多重性说明、设计说明、约束与索引建议。输入不足时输出最小可信图或缺口清单，不伪造完整 ER 模型。

    写入独立运行产物时，文档末尾必须追加：

    `*本文档由 speclite-drawer-er-modeler Skill 自动生成*`

[Notes（注意事项）]
    - `speclite-domain-modeling` 负责 ubiquitous language、bounded context 与 ADR；本 Skill 消费这些语义并生成数据模型，不把字段或 SQL 类型写回 `CONTEXT.md`。
    - Architecture 或 Technical Solution 文档在需要持久化边界、跨实体一致性或 schema 决策时适合调用本 Skill，并应将结果标为设计态。
    - PRD 默认不调用 physical ER 建模；只有产品需求确实依赖核心信息对象及其关系时，才调用 conceptual 模式，避免把实现方案提前固化为产品需求。
    - 颜色表达的是本次变更身份，不代表业务状态、数据敏感级别或 implementation completion。
    - 本 Skill 不推进 Story/Epic 状态，也不生成 implementation completion evidence，因此不消费 `speclite-flow-gate` report。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/core-skills/speclite-drawer-er-modeler/` 与实际安装副本。
