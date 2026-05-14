# Changelog

本文件记录 `speclite-advanced-elicitation` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-advanced-elicitation` 迁移 Advanced Elicitation core Skill。
- 将 `methods.csv` 迁入 `references/methods.csv`。
- 转换 agent roster 解析路径到 Speclite runtime。

### 已知限制

- 方法执行质量依赖 `references/methods.csv` 的描述完整性和当前上下文质量。
