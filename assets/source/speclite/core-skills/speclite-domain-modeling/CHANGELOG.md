# Changelog（变更日志）

本文件记录 `speclite-domain-modeling` 的版本变更。

## [1.1.0] - 2026-09-13

### Changed（变更）

- 将 `CONTEXT.md`、`CONTEXT-MAP.md` 与 ADR 的位置从硬编码的 `_speclite-output/planning-artifacts/architecture/` 改为 SPEC 09 的 `{solutioning_artifacts}/architecture/`，并要求先通过 `speclite resolve artifact-roots` 取 `resolvedRoot`。
- `module-help.csv` 的 output-location 同步为 `{solutioning_artifacts}/architecture`。
- `CONTEXT.md`、`CONTEXT-MAP.md` 与 ADR 模板增加 SpecLite artifact metadata frontmatter（`workflowType`、`sourceSkill`、`generatedAt`），以满足 artifact contract 的 required metadata。

## [1.0.0] - 2026-07-20

### Added（新增）

- 从附件 `SKILL (3).md` 创建英文入口及其中文翻译。
- 添加附件 `ADR-FORMAT.md` 与 `CONTEXT-FORMAT.md` 作为 reference。
- 按要求将 ADR、根 `CONTEXT.md` 与 `CONTEXT-MAP.md` 路径迁移到 `_speclite-output/planning-artifacts/architecture/`。
- 添加符合 SpecLite 契约的 YAML metadata 与生成信息。
