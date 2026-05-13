# Changelog

本文件记录 `speclite-brainstorming` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-brainstorming` 迁移 Brainstorming core Skill。
- 将 workflow 和 steps 迁入 `references/`，将模板迁入 `assets/`。
- 转换配置来源、模板路径和输出标注到 Speclite 运行模型。

### 已知限制

- 长步骤文件保留源流程语义，后续如需更细的 Speclite 状态机可继续拆分优化。
