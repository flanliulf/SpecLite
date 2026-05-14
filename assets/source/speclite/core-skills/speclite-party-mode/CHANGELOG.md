# Changelog

本文件记录 `speclite-party-mode` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-party-mode` 迁移 Party Mode core Skill。
- 将 agent roster 解析、配置读取和 project context 加载转换为 Speclite runtime。
- 保留 subagent 默认模式、solo fallback、声音选择和原文呈现规则。

### 已知限制

- 默认模式依赖当前运行环境可 spawn subagent；不可用时需使用 `--solo`。
