# Changelog

本文件记录 `speclite-code-review-06-finalizer` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.0.1] - 2026-05-27

### Added

- 标记 Story 为 Done 前要求 story-completion gate result 为 `PASS` 或 `PASS_EQUIVALENT`。
- Epic 全部 Story 完成时推荐先运行 `speclite-flow-gate mode=epic-completion` 生成 Epic 实现证据摘要。

## [1.0.0] - 2026-05-11

### Added

- 从对应的 BMEnhance review skill 迁移为 Speclite skill。
- 保留原有审查语义、阶段编号、执行流程、references 与 assets 结构。
- 将运行路径改造为 Speclite 运行模型，使用 `_speclite-output`、`_speclite` 与 `config.toml` 口径。
- 增加 Speclite metadata：`author` 与 `catalog`。

---

版本变更类型说明：
- **Added**：新增功能
- **Changed**：已有功能的变更
- **Fixed**：缺陷修复
- **Removed**：移除的功能

后续版本更新时，在最新版本之前插入新版本记录，并同步更新 SKILL.md 中的 metadata.version。
