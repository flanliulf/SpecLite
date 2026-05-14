# Changelog

本文件记录 `speclite-distillator` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-distillator` 迁移 Distillator core Skill。
- 将 compressor/reconstructor 指令迁入 `references/agents/`，格式和拆分规则迁入 `references/resources/`。
- 将分析脚本和测试迁入 `scripts/`。

### 已知限制

- Round-trip validation 需要可用的子代理能力；不可用时只能报告跳过验证。
