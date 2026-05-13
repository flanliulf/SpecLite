# Changelog

本文件记录 `speclite-agent-pm` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/bmm-skills/2-plan-workflows/bmad-agent-pm` 迁移 John / Product Manager Agent 定义。
- 转换 Agent 激活流程、custom fallback、项目配置读取和菜单目标到 Speclite 运行模型。
- 将 PRD、Epic/Story、readiness 和 course correction 菜单项映射到已存在的 Speclite Skill。

### 已知限制

- 本 Agent 负责产品规划入口分发；具体 PRD 和 Epic/Story 业务语义由对应 Speclite Skill 承担。
