# Changelog（变更记录）

## [Unreleased] - 2026-09-11

- Story 11.9 restart：CR 目录只消费传入的 `crDir`（来自 `speclite resolve cr-directory`），不重推导；移除 2026-09-09 的 directoryContext / validate-context 依赖。
- restart CR round 1 修复：Inputs 登记 `crDir` / `compatibilityMode` / `legacyArtifactPaths`（zh/en）。
- restart CR round 1 修复：Step 7 注明 HALTED report 写入后重入必须使用传入的同一 `crDir`。

## [2.1.1] - 2026-08-26

### Changed（变更）

- 入口同步 fail-closed coordinated write 语义（写前/写后 hash + 失败逆序回退），不再表述为「原子收口」。
- Inputs 补 `confirmationPolicy` 与 `authorizationSource`，`preauthorized` 缺授权来源时 HALT，与共享契约调用参数矩阵对齐。

## [2.1.0] - 2026-08-25

### Changed（变更）

- 改为直接消费独立 `speclite-code-review-contract` package，不再依赖 runner 或本地 locator。
- 新增语义完整的英文 mirror，并补齐 exact gate、partial write、no-commit 与 standalone handoff。
- 将详细 fail-closed closeout 下沉到 `references/finalizer-workflow.md`。
- Finalizer 改为自身独立重算 scope，并新增 `speclite.cr-finalizer.v2` canonical report 与中文优先模板。

## [2.0.0] - 2026-08-25

- 只接受 current v2 evaluation 的精确 PASS verdict，删除 prose keyword approval。
- completion gate 必须晚于最后 source mutation，scope hash 必须匹配。
- required tracker 缺失 fail closed，并在写入后重读验证原子一致性。

本文件记录 `speclite-code-review-06-finalizer` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.0.1] - 2026-05-27

### Added（新增）

- 标记 Story 为 Done 前要求 story-completion gate result 为 `PASS` 或 `PASS_EQUIVALENT`。
- Epic 全部 Story 完成时推荐先运行 `speclite-flow-gate mode=epic-completion` 生成 Epic 实现证据摘要。

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
