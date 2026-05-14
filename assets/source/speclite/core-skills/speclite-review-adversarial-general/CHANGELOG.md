# Changelog

本文件记录 `speclite-review-adversarial-general` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-review-adversarial-general` 迁移 adversarial review core Skill。
- 保留内容加载、怀疑式分析、至少十项 findings 和空输入 HALT 规则。

### 已知限制

- 本 Skill 输出 findings，不直接修改被审查内容。
