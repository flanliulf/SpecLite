# Changelog（变更记录）

## [2.1.0] - 2026-08-25

### Changed（变更）

- 改为直接消费独立 `speclite-code-review-contract` package，不再依赖 runner 或本地 locator。
- 审查输出模板改为中文正文与中文字段标签优先，技术字段和 enum 保持英文。
- 新增语义完整的英文 mirror，并与中文 canonical 的能力、HALT、输出和 standalone handoff 对齐。
- 将详细步骤下沉到 `references/reviewer-workflow.md`，入口保留激活边界、硬门禁和输出契约。
- 对齐 Review frontmatter 的完整 scope manifest 字段。

## [2.0.0] - 2026-08-25

### Changed（变更）

- 增加 review scope manifest、v2 frontmatter、finding fingerprint 与 current review series。
- 三层 quorum 改为 3/3 才能建议 PASS；2/3 固定 `REVIEW_DEGRADED`。
- 删除 finding 数量目标，未声明改动不再静默漏审。

本文件记录 `speclite-code-review-01-reviewer` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.1.0] - 2026-08-17

### Changed（变更）

- 新增 B0.5 共同审查约束（可验证性路由 / 新颖性 / 元数据非阻塞），必须注入 B1/B2/B3 每层 prompt。
- Phase D 新增 D0 分类前置过滤，扩展为含 `verify-obligation` 桶（D1/D2 及 bucket 枚举）。

## [1.0.1] - 2026-05-27

### Added（新增）

- Acceptance Auditor 读取 `Anchor Evidence Summary` 和 story-completion gate report。
- CR 审查输入增加 fixed path hard gate 与 equivalent implementation policy 的核对要求。

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
