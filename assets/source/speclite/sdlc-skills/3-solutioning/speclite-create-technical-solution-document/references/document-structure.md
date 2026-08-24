# Document Structure（文档结构）

## Design Principles（设计原则）

- 文档首先服务快速评审，再服务实现细查；Executive Summary 应在一页阅读量内说明问题、方案、影响和风险。
- Current State、Target State 与 Change Delta 必须分开。
- 每节先给结论，随后给图表或表格，再解释实现、失败路径和验证方式。
- 条件章节不得留空：省略时在 Applicability Matrix 记录 `N/A` 和理由；未知时记录 `TBD`、owner、due date 和影响。
- 术语、系统名、组件名、API 名和状态名在全文保持一致。

## Required Sections（必需章节）

1. Document Control（文档控制）
   - requirement id、状态、版本、作者、评审人、目标发布、更新时间和 source baseline。
2. Executive Summary（执行摘要）
   - 问题、目标、方案摘要、主要影响、关键风险和 readiness。
3. Context and Scope（背景与范围）
   - 背景、Goals、Non-goals、In Scope、Out of Scope、约束和假设。
4. Current and Target State（现状与目标态）
   - 当前事实、目标设计、变更清单和不变部分。
5. Architecture Overview（架构总览）
   - 系统上下文、职责、组件边界、依赖、架构决策与替代方案。
6. Detailed Design（详细设计）
   - 按场景或阶段描述前置条件、主流程、异常流程、状态变化和验证。
7. Quality Attributes（质量属性）
   - 性能容量、可靠性、一致性、安全隐私、可观测性、降级和成本约束。
8. Deployment and Migration（部署与迁移）
   - 配置、发布顺序、Feature Flag、灰度、迁移、回滚和恢复。
9. Test and Acceptance（测试与验收）
   - Unit、Integration、E2E、Performance、Security、故障演练和验收标准。
10. Risks and Open Questions（风险与开放问题）
    - risk、dependency、TBD、owner、due date、阻塞级别和关闭条件。
11. Traceability and Appendices（追溯与附录）
    - Requirement → Design → Contract / Component → Verification、Decision Log、Glossary 和权威链接。

## Conditional Sections（条件章节）

- Terminology and Domain Model（术语与领域模型）：出现新领域概念、状态机或跨团队歧义时启用。
- Integration Contracts（集成契约）：存在 API、MQ/Event、Webhook、批处理、文件交换或第三方依赖时启用。
- Data Design（数据设计）：存在实体、Schema、索引、数据迁移、保留或清理变化时启用。
- UI and Interaction（界面与交互）：存在用户界面或行为变化时启用，并链接 UX owner artifact。
- Work Estimate（工作量估算）：仅作为可选附录；必须注明估算口径、角色和日期，不作为架构事实。

## Content Boundaries（内容边界）

- PRD owner 负责 what / why；技术方案引用需求，不重写业务优先级。
- Architecture / SPEC owner 负责系统级技术决策；技术方案投影与本需求相关的部分，不创建竞争性全局架构。
- Story owner 负责实现任务与验收条件；技术方案聚合跨 Story 的人类阅读路径，不替代 Story 执行清单。
- OpenAPI、AsyncAPI、Apifox、YAPI、migration 或 schema registry 负责完整 contract；技术方案记录 delta、语义和版本链接。
- 源码和运行证据负责 Current State；没有证据时标记 `Proposed` 或 `TBD`，不得写成已实现。
