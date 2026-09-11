# Changelog（变更记录）

## [Unreleased] - 2026-09-11

- Story 11.9 restart：CR 目录只消费传入的 `crDir`（来自 `speclite resolve cr-directory`），不重推导；移除 2026-09-09 的 directoryContext / validate-context 依赖。

## [2.1.0] - 2026-08-25

### Changed（变更）

- 改为直接消费独立 `speclite-code-review-contract` package，不再依赖 runner 或本地 locator。
- 新增语义完整的英文 mirror，并与七项中文核心能力和授权边界对齐。
- 将详细分析步骤下沉到 `references/rules-extractor-workflow.md`。
- 新增 `speclite.cr-rules-extraction.v2` durable report 与中文优先输出模板，支持 fresh session 恢复和验证。

## [2.0.0] - 2026-08-25

- 只消费 evaluator accepted、非 dismissed/superseded 且有验证证据的 v2 finding。
- 全局规则默认要求跨两个 Story 复现；Correct Course 旧 series 不再按轮次数放大。

本文件记录 `speclite-code-review-04-rules-extractor` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.0.0] - 2026-05-11

### Added（新增）

- 从对应的 BMEnhance review skill 迁移为 Speclite skill。
- 保留原有审查语义、阶段编号、执行流程、references 与 assets 结构。
- 将运行路径改造为 Speclite 运行模型，使用 `_speclite-output`、`_speclite` 与 `config.toml` 口径。
- 增加 Speclite metadata：`author` 与 `catalog`。

---

版本变更类型说明：
- **Added（新增）**：新增功能
- **Changed（变更）**：已有功能的变更
- **Fixed（修复）**：缺陷修复
- **Removed（移除）**：移除的功能

后续版本更新时，在最新版本之前插入新版本记录，并同步更新 SKILL.md 中的 metadata.version。
