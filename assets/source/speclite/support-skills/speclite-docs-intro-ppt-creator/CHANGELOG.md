# Changelog

## [1.1.0] - 2026-07-06

### Changed
- 将 HTML PPT 生成依赖从外部 `guizang-ppt-skill` 切换为 SpecLite canonical support skill `speclite-html-ppt-generator`。
- 移除 workflow 中的个人全局 skill 绝对路径，改用 canonical source 相对路径调用 Swiss validator。

## [1.0.0] - 2026-07-06

### Added
- 新增 `speclite-docs-intro-ppt-creator` support skill，用于把项目体系、系统设计、治理机制、理念或工作流生成到 `docs/` 下的介绍型 HTML PPT。
- 增加双语入口 `SKILL.md` 与 `SKILL.en.md`，定义输出目录治理、事实素材归纳、guizang 集成、单 HTML 交付和验证收口。
- 增加 `references/docs-intro-ppt-workflow.md`，承载详细 workflow、输出契约、验证命令和停止条件。
- 增加 `scripts/validate_docs_intro_ppt.mjs`，用于检查输出 HTML 是否位于 `docs/`、是否包含 deck 结构、是否清理模板占位符。

### Known Limitations
- 视觉质量依赖 `speclite-html-ppt-generator` 的模板与 validator；浏览器渲染检查需要本地可用的浏览器自动化能力。
