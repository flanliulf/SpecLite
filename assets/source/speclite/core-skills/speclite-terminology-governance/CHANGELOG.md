# Changelog（变更日志）

本文件记录 `speclite-terminology-governance` 的版本变更。

## [1.0.0] - 2026-08-24

### Added（新增）

- 新增 Epic Glossary、Story Expansion、Cross-Artifact Governance 和 Chinese Term Inclusion 模式。
- 新增 Terminology Inventory、Glossary Projection 与 Domain Candidate Handoff 三层模型。
- 新增来源职责、provenance、alias、scope 和 conflict 治理规则。
- 新增 Epic Glossary 与 Terminology Inventory 模板。
- 新增 `validate_glossary.py` 确定性验证脚本。
- 新增 Story 消费场景的 Flow Gate guidance，明确本 Skill 不推进状态。

### Known Limitations（已知限制）

- 术语候选提取与语义判断依赖执行 Agent；脚本只验证结构、一致性和可导航性。
- DDD 候选必须经人工确认并交给 `speclite-domain-modeling`，本 Skill 不直接维护 `CONTEXT.md`。
