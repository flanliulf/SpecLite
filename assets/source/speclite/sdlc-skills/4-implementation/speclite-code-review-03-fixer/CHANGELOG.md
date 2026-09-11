# Changelog（变更记录）

## [Unreleased] - 2026-09-11

- Story 11.9 restart：CR 目录只消费传入的 `crDir`（来自 `speclite resolve cr-directory`），不重推导；移除 2026-09-09 的 directoryContext / validate-context 依赖。

## [2.1.0] - 2026-08-25

### Changed（变更）

- 改为直接消费独立 `speclite-code-review-contract` package，不再依赖 runner 或本地 locator。
- 新增语义完整的英文 mirror，并补齐 confirmation、churn、blocked fixRecord 和 fresh handoff。
- 将详细修复步骤下沉到 `references/fixer-workflow.md`。
- `preauthorized` 与 convergence handoff 同时支持 runner、人工 orchestrator 和当前用户明确授权，不再把 runner 作为唯一 authority。

## [2.0.0] - 2026-08-25

### Changed（变更）

- 新增 `patch` / `verify-only` 双模式并精确绑定 current evaluation/scope。
- fixer 更新结构化 fixRecord；完成后必须 fresh reviewer/evaluator。
- 强化 fingerprint/location churn guard，禁止顺手吸收 deferred finding。

本文件记录 `speclite-code-review-03-fixer` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.1.0] - 2026-08-17

### Changed（变更）

- Step 2 新增“防 patch loop / 冻结靶子”修复风格约束：可验证属性优先补测试固化（`verify-obligation`）而非增补实现；最小定点修复；反 churn；反复触及同一处即交编排器 `Convergence Control` 判定。

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
