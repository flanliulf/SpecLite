# Changelog

本文件记录 `speclite-agent-creator` 的版本变更。

## [1.1.0] - 2026-06-11

### Changed

- 纳入 SpecLite canonical `support-skills/` 体系，默认目标路径改为 `assets/source/speclite/sdlc-skills/`。
- 入口章节改为本项目 `English（中文）` 标题规范，并补充 `SKILL.en.md` 英文 mirror。
- 明确 Agent 包的 `SKILL.en.md` 是可选镜像，不套用普通 workflow Skill 的双语硬规则。
- 生成标注改为由 `speclite-agent-creator` 维护，并要求同步 `SKILL.md`、`SKILL.en.md`、`CHANGELOG.md` 与 references。

## [1.0.0] - 2026-05-07

### 新增

- 新增 Speclite Agent 专用创建器定义。
- 定义 `bmad-agent-*` 到 `speclite-agent-*` 的迁移边界和文件归类规则。
- 覆盖 `[agent]` 定制块、persona 激活、菜单分发、prompt 文件迁移、Speclite runtime 路径转换和 lint 交接。

### 已知限制

- 本 Skill 负责 Agent 定义迁移规划和生成，不替代对菜单目标 Skill 行为语义的人工审核。
- 对尚未迁移到 Speclite 的菜单目标，只能列为风险或待办，不应虚构目标实现。
