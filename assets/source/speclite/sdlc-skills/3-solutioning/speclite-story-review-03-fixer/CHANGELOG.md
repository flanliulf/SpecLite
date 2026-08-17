# Changelog

本文件记录 `speclite-story-review-03-fixer` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.1.0] - 2026-08-17

### Changed

- Step 2 新增“冻结靶子”修订风格约束：优先澄清/删除而非增补；禁止为满足 totality/determinism/replay 等可验证属性向契约新增命名构造或转移表（应为 `verify-obligation` 交实现阶段）；文档持续膨胀即交编排器 `Convergence Control` 判定。

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
