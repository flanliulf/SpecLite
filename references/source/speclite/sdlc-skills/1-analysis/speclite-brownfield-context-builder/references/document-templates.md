<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Document Templates — 模板说明

> 本文档说明 assets/ 目录下各模板的用途、占位符规范、适用阶段和模板→生成文档的映射关系。

## 1 模板清单

| 模板文件 | 生成文档 | 适用阶段 | 优先级 |
|:---------|:---------|:---------|:-------|
| brownfield-planning-brief-template.md | planning/brownfield-planning-brief.md | Phase 5 | MVP |
| prd-template.md | planning/prd.md | Phase 5 | MVP |
| architecture-template.md | planning/architecture.md | Phase 5 | MVP |
| epics-template.md | planning/epics.md | Phase 5 | MVP |
| story-template.md | planning/stories/*.md | Phase 5 | P2 |

## 2 占位符规范

### 2.1 占位符格式

模板中的占位符使用双花括号格式：`{{placeholder_name}}`

### 2.2 占位符类型

| 类型 | 格式 | 说明 | 示例 |
|:-----|:-----|:-----|:-----|
| 简单替换 | `{{name}}` | 直接替换为文本值 | `{{feature_name}}` → "订单导出" |
| 表格行 | `{{row_field}}` | 表格中的单元格值 | `{{module}}` → "orders" |
| 条件章节 | 整个章节使用注释标注 | 有数据时保留，无数据时删除 | `<!-- 从 reuse-opportunities.md 提取 -->` |
| 列表项 | `- {{item}}` | 列表中的条目 | `- {{constraint}}` |

### 2.3 数据来源标注

每个占位符所在的章节，使用 HTML 注释标注数据应从哪个证据/基线文件获取：

```markdown
## 2 与本次需求相关的现有模块

<!-- 从 as-is-architecture.md 和 system-overview.md 提取 -->

| 模块 | 职责 | 当前状态 | 关联 API |
|:-----|:-----|:---------|:---------|
| {{module}} | {{responsibility}} | {{status}} | {{apis}} |
```

## 3 模板→生成文档映射

### 3.1 brownfield-planning-brief-template.md

| 章节 | 数据来源 |
|:-----|:---------|
| 当前系统相关能力摘要 | baseline/business-capability-matrix.md |
| 与本次需求相关的现有模块 | baseline/as-is-architecture.md, baseline/system-overview.md |
| 可复用能力 | baseline/reuse-opportunities.md（如有） |
| 不可突破的约束 | baseline/constraints-and-invariants.md（如有） |
| 风险与未知点 | baseline/change-risk-map.md |
| 候选变更切片 | 基线综合分析推导 |
| 推荐的迭代范围边界 | 基线综合分析推导 |

### 3.2 prd-template.md

| 章节 | 数据来源 |
|:-----|:---------|
| 背景 — 系统现状 | baseline/system-overview.md, planning-brief |
| 背景 — 需求动机 | 用户输入 |
| 目标 | 用户输入 |
| 范围 | 用户输入 + planning-brief |
| 用户价值 | 用户输入 |
| 功能需求 | 用户输入 |
| 验收标准 | 用户输入 + 基线约束 |
| 约束与风险 | baseline/constraints-and-invariants.md, baseline/change-risk-map.md |

### 3.3 architecture-template.md

| 章节 | 数据来源 |
|:-----|:---------|
| 当前基线 — 模块现状 | baseline/as-is-architecture.md |
| 当前基线 — 数据模型现状 | baseline/data-models.md（如有） |
| 增量目标 | prd.md |
| 模块变更 | prd.md + baseline/as-is-architecture.md |
| 数据变更 | prd.md + evidence/data-model-inventory.json |
| API 变更 | prd.md + baseline/api-contracts.md |
| 集成变更 | prd.md + evidence/config-surface.json |
| 风险与缓解 | baseline/change-risk-map.md |
| 实施顺序 | 综合分析 |

### 3.4 epics-template.md

| 章节 | 数据来源 |
|:-----|:---------|
| Epic 总览表 | prd.md + architecture.md |
| 每个 Epic 的详情 | prd.md 功能需求 + architecture.md 模块变更 |
| Epic 依赖关系 | architecture.md + baseline/change-risk-map.md |

### 3.5 story-template.md

| 章节 | 数据来源 |
|:-----|:---------|
| 背景 | 所属 Epic |
| 用户价值 | prd.md |
| 验收标准 | prd.md + 基线约束 |
| 受影响模块 | architecture.md |
| 依赖与前置条件 | epics.md 依赖关系 |
| 开发注意事项 | baseline/change-risk-map.md, deep-dives/（如有） |
| 测试要点 | evidence/test-surface.json |

## 4 使用注意事项

- 模板是起点而非终点，生成时可根据项目特点调整章节
- 核心章节（标注为模板中的一级/二级标题）不可删除
- 无对应数据的章节标注 `[信息不足，待补充]`
- 所有从基线引用的内容必须标注来源
