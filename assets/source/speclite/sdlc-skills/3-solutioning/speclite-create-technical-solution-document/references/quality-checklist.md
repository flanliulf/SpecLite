# Quality Checklist（质量检查清单）

## Document Governance（文档治理）

- requirement id、状态、版本、作者、评审人、目标发布和更新时间完整。
- source baseline 可定位，Current / Proposed / TBD / N/A 明确。
- `Review` / `Approved` 状态有相应 readiness 与人工审批证据。
- 文档是 derived artifact，没有覆盖 PRD、Architecture、Story 或 contract owner。

## Human Readability（人类可读性）

- Executive Summary 在一页阅读量内说明问题、方案、影响、风险和决策需求。
- 标题层级连续，缩写首次出现时解释，术语全文一致。
- 每节先结论再细节；长清单转换为表格或拆分小节。
- 没有空章节、无解释的“暂无”、孤立图表或整页 DDL / Schema dump。
- Current、Target、Changed、Unchanged 和 External 清晰区分。

## Design Completeness（设计完整性）

- Scope、Non-goals、约束、假设和不变部分明确。
- 主要场景覆盖 happy path、failure path、边界和恢复。
- Alternatives 与 trade-offs 可见，关键决策有 owner 和状态。
- 性能容量、可靠性、一致性、安全隐私、可观测性和降级已评估。
- 部署、灰度、迁移、兼容、rollback、测试和验收形成闭环。

## Multi-system Contract（多系统契约）

- 系统职责、data owner 和 operational owner 唯一明确。
- 每条交互记录 direction、transport、mode、authority 和版本。
- authentication、authorization、timeout、retry、idempotency、error、compatibility 和 observability 已说明。
- 异步流程覆盖重复、乱序、部分成功、reconciliation 和 poison message。
- 外部系统不可控变更和不可用场景有过渡方案。

## Diagram Quality（图表质量）

- 每张图有图示目的、关键结论和一致术语。
- 单图复杂度受控；大型时序已拆分 overview 与 detail。
- Mermaid code fence 成对，语法由实际 renderer 验证或明确记录未验证。
- 不依赖颜色传达唯一含义，黑白打印仍可理解。

## Evidence and Traceability（证据与追溯）

- 每个 Current State 事实有来源；每个 Proposed decision 有理由和状态。
- 每个 TBD 有 owner、due date、影响和关闭条件。
- Requirements 能追溯到 Design、Component / Contract 和 Verification。
- 固定路径遵守 owning SPEC / equivalent implementation policy。
- blocking conflict、missing contract 或 readiness failure 会阻止 Finalization。

## Exit Criteria（退出标准）

- `validate_technical_solution.py --mode final` 无 error。
- 所有 Warning 已修复、接受或在 handoff 中说明。
- Mermaid 已渲染验证，或明确记录 render verification 未执行。
- 文档状态最多为 `Review`，除非存在显式人工 `Approved` 证据。
- 输出路径、source baseline、风险和下一步已向用户报告。
