# Changelog

本文件记录 `speclite-help` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/core-skills/bmad-help` 迁移 Help core Skill。
- 将 catalog/config/artifact/project knowledge 读取规则转换为 Speclite runtime。
- 保留 next skill 推荐、quick start 和通用问答语义。

### 已知限制

- 依赖目标项目生成或安装的 Speclite help catalog；缺失 catalog 时只能基于可见文件和用户上下文回答。
