# Changelog（变更记录）

## [Unreleased] - 2026-09-09

- Story-mode TODO result 消费 frozen `directoryContext` 并在写入前调用 production validator；project utility mode 不变。

## [2.1.1] - 2026-08-26

### Changed（变更）

- Inputs mode 枚举补 `closeout`（Story 收口专用），与共享契约状态机 `TODO(mode=closeout)` 对齐。
- 明确只读 `list`/`check` 默认不写 durable result、不产生 workspace mutation。

## [2.1.0] - 2026-08-25

### Changed（变更）

- 改为直接消费独立 `speclite-code-review-contract` package，不再依赖 runner 或本地 locator。
- TODO backlog 模板改为中文正文与中文字段标签优先，技术 enum 保持英文。
- 新增语义完整的英文 mirror，并同步五种 mode、confirmation policy 和 standalone 边界。
- 将详细 backlog 操作下沉到 `references/todo-tracker-workflow.md`。
- 新增 `speclite.cr-todo-result.v2` durable result；`preauthorized` 支持 runner、人工 orchestrator 或当前用户明确授权。

## [2.0.0] - 2026-08-25

- backlog 紧迫度改为 `T1/T2/T3`，消除与 CR P0/P1/P2/P3 的语义冲突。
- 增加 `confirmationPolicy` 与 finding fingerprint；VERIFY_REQUIRED 禁止进入 TODO。

本文件记录 `speclite-code-review-05-todo-tracker` 技能的版本变更历史。

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
