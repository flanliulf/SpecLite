# Changelog

本文件记录 `speclite-agent-lint` 的版本变更。

## [1.1.0] - 2026-06-11

### Added

- 新增 `SKILL.en.md` 英文 mirror。
- 新增只读脚本 `scripts/check_agent_skill.py`，用于批量检查 `speclite-agent-*` 的 `[agent]`、菜单目标、prompt 引用和 runtime 残留。

### Changed

- 纳入 SpecLite canonical `support-skills/` 体系，目标 skill 查找根改为 `assets/source/speclite/`。
- 明确 Agent 包的 `SKILL.en.md` 是可选镜像，存在时才检查版本和运行模型一致性。
- 入口章节改为本项目 `English（中文）` 标题规范，并将报告模板更新为引用 deterministic checker。

## [1.0.0] - 2026-05-07

### 新增

- 新增 Speclite Agent 专用只读 lint Skill。
- 定义 `[agent]` 定制块、激活流程、persona 语义、菜单目标、prompt 文件和 Speclite runtime 路径检查。
- 提供结构化报告模板，按 Critical / Major / Minor / Observation 输出修复方案。

### 已知限制

- 本 Skill 只输出问题和修复方案，不直接修改文件。
- 对菜单目标 Skill 的业务行为是否等价，只能基于已存在文件证据判断，不能替代人工语义审核。
