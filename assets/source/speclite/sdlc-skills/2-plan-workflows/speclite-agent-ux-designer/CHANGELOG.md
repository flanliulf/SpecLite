# Changelog

本文件记录 `speclite-agent-ux-designer` 的版本变更。

## [1.1.0] - 2026-06-11

### Changed

- 入口章节标题改为 `English（中文）` 形式，保持与 SpecLite canonical 文档规范一致。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/bmm-skills/2-plan-workflows/bmad-agent-ux-designer` 迁移 Sally / UX Designer Agent 定义。
- 转换 Agent 激活流程、custom fallback、项目配置读取和菜单目标到 Speclite 运行模型。
- 将 UX 创建菜单项映射到已存在的 `speclite-create-ux-design`。

### 已知限制

- 本 Agent 负责 UX 入口分发；具体 UX 规格产出由 `speclite-create-ux-design` 承担。
