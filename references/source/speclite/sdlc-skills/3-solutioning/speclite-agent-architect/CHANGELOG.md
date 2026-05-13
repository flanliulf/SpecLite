# Changelog

本文件记录 `speclite-agent-architect` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/bmm-skills/3-solutioning/bmad-agent-architect` 迁移 Winston / System Architect Agent 定义。
- 转换 Agent 激活流程、custom fallback、项目配置读取和菜单目标到 Speclite 运行模型。
- 将架构创建和实现就绪检查菜单项映射到已存在的 Speclite Skill。

### 已知限制

- 本 Agent 负责架构入口分发；具体架构产物由 `speclite-create-architecture` 等目标 Skill 承担。
