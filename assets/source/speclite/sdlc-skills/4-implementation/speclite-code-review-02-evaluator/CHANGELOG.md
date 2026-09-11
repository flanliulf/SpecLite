# Changelog（变更记录）

## [Unreleased] - 2026-09-11

- Story 11.9 restart：CR 目录只消费传入的 `crDir`（来自 `speclite resolve cr-directory`），不重推导；移除 2026-09-09 的 directoryContext / validate-context 依赖。

## [2.1.0] - 2026-08-25

### Changed（变更）

- 改为直接消费独立 `speclite-code-review-contract` package，不再依赖 runner 或本地 locator。
- evaluation 输出模板改为中文正文与中文字段标签优先，技术字段和 enum 保持英文。
- 新增语义完整的英文 mirror，补齐一对一绑定、主动反证、HALT 与 standalone handoff。
- 将详细评估步骤下沉到 `references/evaluator-workflow.md`，入口保留 exact verdict 和 read-only 边界。

## [2.0.0] - 2026-08-25

### Changed（变更）

- evaluation 与 review hash/round 一对一绑定，输出 `speclite.cr-evaluation.v2`。
- 引入精确 verdict、fingerprint disposition、反证检查和机械收敛度量。
- `VERIFY_REQUIRED` 不再允许直接降级 TODO/finalizer。

本文件记录 `speclite-code-review-02-evaluator` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.1.0] - 2026-08-17

### Changed（变更）

- Step 4 评估新增可验证性路由 / 元数据非阻塞 / 新颖性三道门；输出收敛信号供编排器 `Convergence Control` 判定 `PASS_WITH_VERIFY_OBLIGATIONS` / `ARCHITECTURE_TRIAGE`。

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
