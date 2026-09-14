# Changelog

本文件记录 `speclite-agent-docs-steward` 的版本变更。

## [1.1.0] - 2026-09-13

### Changed（变更）

- `references/docs-style-guide-baseline.md` 同步 SpecLite `docs/_STYLE_GUIDE.md` 的新规则：标题数量与单元格长度上限、本机绝对路径禁令、Research Note、Draft / Moved 标记、生成说明页脚、Related Documents 表头，以及以 `docs:check` 职责表替换原目标命令清单；示例文档名同步为 `tutorials/first-install-walkthrough.md` 与 `explanation/speclite-modules.md`。

## [1.0.0] - 2026-06-11

### 新增

- 新增 Sarah / Open Source Docs Steward Agent 定义。
- 支持开源项目 `docs/` 目录定位、Diataxis 信息架构、GitHub/npm 渲染约束和 package-facing 入口治理。
- 菜单分发到 `speclite-write-opensource-docs`，覆盖文档架构评估、写作、规范、脚手架和验证。
- 保留 SpecLite Agent runtime 激活流程、`[agent]` customization 和持续 persona 语义。
- 新增 `references/docs-style-guide-baseline.md`，作为项目 `docs/_STYLE_GUIDE.md` 缺失时的内置文档规范基线。

### 已知限制

- 本 Agent 负责治理和分发，不直接替代 `speclite-write-opensource-docs` 的实际文档生成 workflow。
