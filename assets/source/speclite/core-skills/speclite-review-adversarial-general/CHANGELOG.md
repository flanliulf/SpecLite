# Changelog（变更记录）

## [2.0.0] - 2026-08-25

- 删除“至少十项 finding”数量配额，零 finding 成为合法结果。
- blocking finding 必须提供 category、invariant、具体失败场景和 primary location。

本文件记录 `speclite-review-adversarial-general` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-review-adversarial-general` 迁移 adversarial review core Skill。
- 初版保留内容加载、怀疑式分析、finding 数量目标和空输入 HALT 规则；数量目标已由 2.0.0 删除。

### 已知限制

- 本 Skill 输出 findings，不直接修改被审查内容。
