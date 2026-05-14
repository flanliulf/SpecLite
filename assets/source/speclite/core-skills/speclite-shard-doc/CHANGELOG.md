# Changelog

本文件记录 `speclite-shard-doc` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-shard-doc` 迁移 Shard Doc core Skill。
- 保留源文档校验、目标目录选择、npx sharding、输出验证、完成报告和原文处理流程。

### 已知限制

- 运行依赖 `npx @kayvan/markdown-tree-parser` 可用；工具缺失或执行失败时必须 HALT。
