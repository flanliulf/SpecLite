# Changelog

本文件记录 `speclite-create-story` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.0.1] - 2026-05-27

### Changed

- Story 文件默认写入 `{implementation_artifacts}/stories/`，上一 Story 扫描也统一读取该子目录。
- Story 模板和 checklist 增加 Flow Gate、Anchor Contract Map、Equivalent Implementation Policy、Evidence Plan 与 Anchor Evidence Summary 要求。
- 后续 CR 指引改为从 `code-review-01-reviewer` 开始，不再指向已删除的非编号 `code-review` 聚合入口。

## [1.0.0] - 2026-04-26

### 初始版本

- 目标 Story 解析（用户显式指定 + 从 `sprint-status.yaml` 自动发现）
- 核心制品穷尽加载（Epics / PRD / Architecture / UX，整文件或分片）
- 上一 Story 智能继承（Dev Notes、File List、教训）
- 架构防护栏提取（技术栈、目录、API、Schema、安全、性能、测试）
- 待修改文件三段式影响分析（现状—变更—必须保留）
- 最新技术信息核对（版本、破坏性变更、安全更新）
- 基于模板渲染完整 Story 并置为 `ready-for-dev`
- Checklist 自检与 `sprint-status.yaml` 状态同步
- 同时提供中文 SKILL.md 与英文 SKILL.en.md 双版定义

### 已知问题

- 当 `sprint-status.yaml` 不存在时仅能引导用户，不会自动创建
- 最新技术信息核对依赖运行环境是否具备外部检索能力

---

版本变更类型说明：
- **Added**：新增功能
- **Changed**：已有功能的变更
- **Fixed**：缺陷修复
- **Removed**：移除的功能
