<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Story：{{story_name}}

> {{epic_id}} / {{story_id}}
> 优先级：{{priority}} | 预估复杂度：{{complexity}}

## 背景

<!-- 简要说明该 Story 的上下文，引用所属 Epic 和相关基线文档 -->

本 Story 属于 {{epic_name}}（{{epic_id}}），目标是 {{story_goal}}。

## 用户价值

作为 {{role}}，我希望 {{action}}，以便 {{benefit}}。

## 验收标准（Acceptance Criteria）

- [ ] {{ac_1}}
- [ ] {{ac_2}}
- [ ] {{ac_3}}

## 受影响模块

<!-- 从 planning/architecture.md 的模块变更表中提取 -->

| 模块 | 变更类型 | 变更说明 | 当前状态 |
|:-----|:---------|:---------|:---------|
| {{module}} | 新增 / 修改 / 扩展 | {{change_description}} | {{current_status}} |

## 现有能力复用

<!-- 从 baseline/reuse-opportunities.md 或 deep-dives/ 中提取可复用项 -->

- {{reusable_item}}：{{how_to_reuse}}

## 依赖与前置条件

- [ ] {{precondition_or_dependency}}

### Story 间依赖

| 依赖 Story | 原因 |
|:-----------|:-----|
| {{dependent_story_id}} | {{reason}} |

## 开发注意事项（Dev Notes）

<!-- 从 baseline/change-risk-map.md 和 deep-dives/ 提取风险和注意事项 -->

- **风险点**：{{risk_note}}
- **约束**：{{constraint_note}}
- **推荐实现方式**：{{implementation_hint}}

## 测试要点

<!-- 从 evidence/test-surface.json 提取现有测试信息，补充新测试要求 -->

- [ ] {{test_point_1}}
- [ ] {{test_point_2}}

### 现有测试参考

- {{existing_test_file}}：{{what_it_covers}}

## 参考文档

- planning/epics.md — 所属 Epic
- planning/architecture.md — 增量架构设计
- baseline/{{relevant_baseline_doc}} — 相关基线
