# Changelog

本文件记录 `speclite-agent-tech-writer` 的版本变更。

## [1.1.0] - 2026-06-11

### Changed

- 入口章节标题改为 `English（中文）` 形式，保持与 SpecLite canonical 文档规范一致。

## [1.0.0] - 2026-05-07

### 新增

- 从 `vault/bmad-skills-src/bmm-skills/1-analysis/bmad-agent-tech-writer` 迁移 Paige / Technical Writer Agent 定义。
- 转换 Agent 激活流程、custom fallback、项目配置读取和菜单目标到 Speclite 运行模型。
- 将 `write-document.md`、`mermaid-gen.md`、`validate-doc.md`、`explain-concept.md` 从根目录迁入 `references/` 并更新菜单 prompt 路径。

### 已知限制

- 本地 prompt 保留源 Agent 的轻量指令形态；复杂文档生成质量仍依赖 Paige 与用户的后续对话澄清。
