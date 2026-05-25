# Changelog

本文件记录 `speclite-create-epics-and-stories` 技能的版本变更历史。

格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [Semantic Versioning](https://semver.org/)。

## [1.0.0] - 2026-05-07

### 初始版本

- 将源工作流迁移为 SpecLite 运行模型，目标目录为 `assets/source/speclite/sdlc-skills/3-solutioning/speclite-create-epics-and-stories/`
- 增加中文 `SKILL.md` 与英文 `SKILL.en.md` 双入口
- 增加 `references/activation.md`，定义三层 customize、`persistent_facts`、runtime `config.toml` 与 `workflow.on_complete` 解析流程
- 增加 `references/workflow-steps.md`，保留需求抽取、Epic 设计、Story 生成、最终校验四步交互工作流
- 将输出模板迁入 `assets/epics-template.md`
- 增加 `customize.toml` 与 `config.toml.example`，明确配置示例仅作字段参考

### 已知问题

- 工作流依赖 PRD 与 Architecture 制品存在；缺失时会 HALT 并要求用户补充
- 高级启发式澄清与 Party Mode 菜单项依赖运行环境是否提供相应中性能力

---

版本变更类型说明：
- **Added**：新增功能
- **Changed**：已有功能的变更
- **Fixed**：缺陷修复
- **Removed**：移除的功能
