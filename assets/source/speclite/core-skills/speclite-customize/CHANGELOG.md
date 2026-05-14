# Changelog

本文件记录 `speclite-customize` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-customize` 迁移 Customize core Skill。
- 将发现脚本和测试迁入 `scripts/`。
- 将 runtime custom 路径、resolver 路径和安装预检转换为 Speclite 运行模型。

### 已知限制

- 只处理 per-skill agent/workflow override；中央配置覆盖仍需独立流程处理。
