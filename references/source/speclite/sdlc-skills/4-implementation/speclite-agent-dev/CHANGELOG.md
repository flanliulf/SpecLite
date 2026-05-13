# Changelog

本文件记录 `speclite-agent-dev` 的版本变更。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/bmm-skills/4-implementation/bmad-agent-dev` 迁移 Amelia / Senior Software Engineer Agent 定义。
- 转换 Agent 激活流程、custom fallback、项目配置读取和菜单目标到 Speclite 运行模型。
- 将 story 开发、quick dev、测试生成、代码审查、sprint planning、story 准备和 retrospective 菜单项映射到已存在的 Speclite Skill。

### 已知限制

- 本 Agent 负责实现阶段入口分发；具体开发、测试和评审行为由对应 Speclite Skill 承担。
