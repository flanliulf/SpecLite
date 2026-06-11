# Changelog

本文件记录 `speclite-agent-analyst` 的版本变更。

## [1.1.0] - 2026-06-11

### Changed

- 入口章节标题改为 `English（中文）` 形式，保持与 SpecLite canonical 文档规范一致。
- `BP` 菜单项改为指向已存在的 `speclite-brainstorming` Skill，不再使用本地 `references/brainstorming.md` prompt fallback。

### Removed

- 删除不再引用的本地 brainstorming prompt 文件。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/bmm-skills/1-analysis/bmad-agent-analyst` 迁移 Mary / Business Analyst Agent 定义。
- 转换 Agent 激活流程、custom fallback、项目配置读取和菜单目标到 Speclite 运行模型。
- 将缺失独立 Speclite 目标的 brainstorming 菜单项改为本地 prompt，以保留分析阶段头脑风暴能力。

### 已知限制

- ~~`BP` 菜单项未映射到独立 `speclite-brainstorming` Skill，因为当前 forge 中未发现该目标。~~ 已在 v1.1.0 修复。
