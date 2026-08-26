# Changelog（变更记录）

## [2.0.0] - 2026-08-25

- JSON finding 增加 category、invariant、expected/actual result，支持稳定 fingerprint。
- 无具体 trigger 与错误结果时禁止输出 finding。

本文件记录 `speclite-review-edge-case-hunter` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-review-edge-case-hunter` 迁移 edge-case hunter core Skill。
- 保留范围识别、穷举路径、只报未处理路径和严格 JSON 输出规则。

### 已知限制

- 本 Skill 只报告边界缺口，不评价实现质量或提出广义设计意见。
