# Changelog

本文件记录 `speclite-write-opensource-docs` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.1.0] - 2026-09-13

### Changed（变更）

- `references/docs-style-guide-baseline.md` 同步 SpecLite `docs/_STYLE_GUIDE.md` 的新规则：标题数量与单元格长度上限、本机绝对路径禁令、Research Note、Draft / Moved 标记、生成说明页脚、Related Documents 表头，以及以 `docs:check` 职责表替换原目标命令清单；示例文档名同步为 `tutorials/first-install-walkthrough.md` 与 `explanation/speclite-modules.md`。

## [1.0.0] - 2026-06-11

### 初始版本

- 新增开源项目 `docs/` 目录文档写作与维护 workflow。
- 覆盖 Tutorials、How-To、Explanation、Reference 和 Glossary 五类文档。
- 支持 `docs/index.md`、`docs/_STYLE_GUIDE.md`、README/package-facing 入口同步。
- 明确 GitHub/npm 友好 Markdown 约束，暂不使用 Starlight-only admonition。
- 提供文档脚手架、写作、迁移、验证和规范沉淀模式。
- 新增 `references/docs-style-guide-baseline.md`，作为目标项目缺少 `docs/_STYLE_GUIDE.md` 时的内置文档规范基线。

### 已知问题

- `npm run docs:*` 命令仅作为目标 tooling 规范；项目未接入对应脚本前，本 Skill 只记录缺口并跳过执行。
