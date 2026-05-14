<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Changelog

本文件记录 `speclite-brownfield-context-builder` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.2.0] - 2026-04-24

### Speclite Migration

- 迁移为 Speclite `1-analysis` 阶段 Skill：入口名称改为 `speclite-brownfield-context-builder`。
- 运行模型改为读取 `{project-root}/_speclite/config.toml`，默认输出定位到 `{project_knowledge}/brownfield` 和 `{planning_artifacts}`。
- 新增 `customize.toml` 与 `config.toml.example`，保留源 skill 的 Evidence-First / LLM-Last 质量护栏。

### Added

- **Mechanism 2 — 框架适配器（轻量 AST）**：
  - `extract_api_inventory.py` 新增 Spring 类级 `@RequestMapping` 前缀拼接（修复 KFP-002）
  - `extract_data_models.py` 新增 MyBatis-Plus `@TableName` / `@TableId` / `@TableField` 抽取分支（修复 KFP-003）
  - 新增 `references/framework-adapters/spring-mvc.md`、`mybatis-plus.md` 适配器契约文档
- **Mechanism 3 — 骨架渲染器**：新增 `scripts/render_baseline_skeleton.py`，从 evidence
  机械性地渲染 baseline 骨架（api-contracts、business-capability-matrix、system-overview、
  as-is-architecture），LLM 仅可在 `<!-- DESC: ... -->` 占位符中补描述
- **Mechanism 6 — 黄金集回归**：新增 `golden/` 目录（spring-mvc-basic、mybatis-plus-basic）
  + `scripts/run_golden.py` runner，子集匹配，CI 可阻断
- **v2.0 设计文档**：新增 `references/v2-paradigm-design.md` 阐述 Evidence-First / LLM-Last
  范式与五大不变量

### Changed

- SKILL.md 在 Phase 3 强制要求"骨架优先 + 对抗反查 + 严格 Anchor"
- 注意事项新增"不确定性传播 / 覆盖率红线 / 黄金集回归"三条工程纪律

## [1.1.0] - 2026-04-24

### Added

- **Mechanism 1 — 覆盖率契约**：所有抽取脚本同时输出 `*.gaps.json` 兄弟文件，
  含 `gap_ratio` / `gap_threshold (0.05)` / `status`；`validate_outputs.py` 在 evidence
  阶段强制校验红线
- **Mechanism 4 — Evidence Anchor 强类型化**：`validate_outputs.py` 新增
  `[anchor:file#fragment]` 解析（支持 `#L<行号>` 与 `#/json/pointer` 两种）；
  `--strict-anchors` 将 unanchored-fact 提升为错误
- **Mechanism 5 — 对抗性 grounding 反查**：新增 `scripts/adversarial_grounding_check.py`，
  反查 baseline 中所有 endpoint / classname / tech 是否真实存在，输出
  `validation/hallucination-report.json` 与 `validation/confidence-report.json`，
  `failure_rate > 0.01` 时退出码 1
- **Mechanism 7 — 依赖白名单严格识别**：`collect_config_surface.py` 新增
  `TECH_WHITELIST`（RocketMQ / RabbitMQ / Kafka / MyBatis-Plus / Nacos / XXL-Job 等
  20+ 项），仅扫描 pom.xml / package.json / requirements.txt 等依赖清单，
  输出 `evidence/tech-stack-strict.json`，根治 RocketMQ ↔ RabbitMQ 误译（KFP-004）
- **失败模式知识库**：新增 `references/known-failure-patterns.md`，含 5 条 KFP（KFP-001
  端点幻觉 / KFP-002 类前缀漏拼接 / KFP-003 MyBatis-Plus 漏抽 / KFP-004 队列误译 /
  KFP-005 业务回调误标），每条含识别特征、防御机制编号、guard_action 与 wrong/right 示例

### Fixed

- ~~RocketMQ 被误写为 RabbitMQ~~ → 已在 v1.1.0 修复（M7）
- ~~Spring Controller 类前缀未拼接，端点扁平化~~ → 已在 v1.2.0 修复（M2）
- ~~MyBatis-Plus 实体被静默丢弃（仅识别 JPA `@Entity`）~~ → 已在 v1.2.0 修复（M2）
- ~~Controller 端点稀疏时 LLM 自动补全 CRUD 端点~~ → 由 M1+M3+M5 联合防御



### 初始版本

- 单入口混合内核架构，支持 4 种运行模式（initial_scan / full_rescan / targeted_deep_dive / planning_generation）
- 6 阶段执行流程（Mode Routing → Repository Classification → Evidence Extraction → Baseline Synthesis → Deep-Dive → Planning Synthesis）
- 仓库分类与结构识别（monolith / monorepo / multi-part）
- 证据层提取：API 清单、数据模型、依赖图、配置面、测试面等结构化技术事实
- 历史文档摄取与交叉验证，支持 5 级状态标签（CODE_CONFIRMED / DOC_SUPPORTED / INFERRED / SUPERSEDED / UNVERIFIED）
- 现状基线合成：系统概览、架构现状、业务能力矩阵、变更风险图、API 合约
- 局部深潜分析：对高风险或目标区域做 exhaustive 高密度分析
- 规划产物生成：brownfield-planning-brief、PRD、Architecture、Epics
- 状态持久化与 resume 恢复机制
- 4 层产物分离：证据层 / 现状层 / 深潜层 / 规划层

### 已知限制

- Stories 批量自动生成尚未实现（计划 v1.1.0）
- 复杂事实冲突自动裁决尚未支持，需用户手动确认
- API governance 完整自动提炼尚未实现
- 深度类似实现检索尚未实现

---

版本变更类型说明：
- **Added**：新增功能
- **Changed**：已有功能的变更
- **Fixed**：缺陷修复
- **Removed**：移除的功能

后续版本更新时，在 [1.0.0] 之前插入新版本记录，并同步更新 SKILL.md 中的 metadata.version。
已知问题修复后，用删除线标注并注明修复版本，如：
- ~~**问题描述**~~ → 已在 vX.Y.Z 修复
