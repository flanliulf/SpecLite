# Changelog

本文件记录 `speclite-index-docs` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-index-docs` 迁移 Index Docs core Skill。
- 保留目录扫描、内容读取、描述生成、index.md 写入和 HALT 条件。

### 已知限制

- 对二进制或无法读取的文件，只能标注为不可解析或跳过，需用户确认。
