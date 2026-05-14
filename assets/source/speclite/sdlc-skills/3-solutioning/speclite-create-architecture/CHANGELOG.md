# Changelog

All notable changes to the `speclite-create-architecture` skill are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-05-07

### Directory Layout

- 将微文件步骤从根级 `steps/` 移动到 `references/steps/`，使工作流执行规约归入 references 目录
- 更新 `SKILL.md`、`SKILL.en.md`、`references/workflow-steps.md` 与 `references/inputs-outputs.md` 中的步骤路径引用
- 版本号 `metadata.version` 由 `1.0.2` 升至 `1.0.3`

## [1.0.2] - 2026-05-07

### Fixed

- 将当前运行规约从 `_bmad` / `config.yaml` / `_bmad/custom` 迁移到 Speclite runtime：`{project-root}/_speclite`、`config.toml`、`{speclite-runtime-root}/custom` 与 `{speclite-runtime-root}/scripts`
- 将架构模板从 Skill 根目录移动到 `assets/architecture-decision-template.md`，符合根目录 Markdown 白名单
- 将旧 `bmad-*` 外部 Skill 调用改为本步骤内的中性 A/P/C 分支说明
- 新增 `config.toml.example`，声明目标项目 `{project-root}/_speclite/config.toml` 的字段结构，且不作为 runtime fallback
- 压缩中文入口正文并修复中英文入口 Markdown 诊断问题

## [1.0.1] - 2026-04-27

### Changed

- 重构 `SKILL.md` 与 `SKILL.en.md` 以满足 skills-lint **BODY-01**（正文 ≤ 5000 字符）与 **BODY-05**（核心能力 4-8 条）
- 核心能力从 10 条压缩到 8 条（合并相近职责，保留全部语义）
- 详细的 8 步骤索引、A/P/C 协议、frontmatter 推进规则、`on_complete` 解析与生成标注规则迁移到 `references/workflow-steps.md`
- 输入产物 / 输出产物 / 资源文件清单迁移到 `references/inputs-outputs.md`
- 英文版激活流程详细规则迁移到 `references/activation-en.md`
- 英文版操作注意事项迁移到 `references/notes-en.md`
- 版本号 `metadata.version` 由 `1.0.0` 升至 `1.0.1`

### Notes

- 全部源文件（`steps/`、`data/`、`customize.toml`、`architecture-decision-template.md`）继续保持 verbatim 不动
- 经字符数核对：SKILL.md 正文 4600 字符，SKILL.en.md 正文 4599 字符，均通过 BODY-01

## [1.0.0] - 2026-04-26

### Added

- 初始版本，由 `bmad-create-architecture` 重构为 speclite 体系下的 `speclite-create-architecture`
- 中文 SKILL.md（主入口）+ 英文 SKILL.en.md（镜像）
- 8 步微文件工作流 verbatim 保留：`steps/step-01-init.md`、`steps/step-01b-continue.md`、`steps/step-02-context.md`、`steps/step-03-starter.md`、`steps/step-04-decisions.md`、`steps/step-05-patterns.md`、`steps/step-06-structure.md`、`steps/step-07-validation.md`、`steps/step-08-complete.md`
- 架构文档模板 `architecture-decision-template.md` verbatim 保留
- workflow 配置默认值 `customize.toml` verbatim 保留
- 项目类型映射数据 `data/project-types.csv` verbatim 保留
- 业务领域复杂度映射数据 `data/domain-complexity.csv` verbatim 保留

### Capabilities

- 三层 customize.toml 解析（base→team→user）
- 持久事实（`workflow.persistent_facts`）加载，支持 `file:` 前缀
- 从 `{project-root}/_bmad/bmm/config.yaml` 加载 `user_name`、`communication_language`、`document_output_language`、`planning_artifacts`、`project_knowledge`
- 既有架构文档检测与续作分支（[R]/[C]/[O]/[X]）
- 强制 A/P/C 协同决策菜单（Advanced Elicitation / Party Mode / Continue）
- WebSearch 驱动的实时技术版本验证
- AI 智能体一致性模式提取（命名/结构/格式/通信/流程 5 大类）
- 完整、具体的项目树生成（按技术栈给出实际示例）
- `workflow.on_complete` 终止指令解析与执行
- 输出文档末尾自动追加生成标注

### Known Limitations

- PRD 缺失为 HALT 条件，不提供绕过；需先运行 PRD workflow
- A/P 子流程依赖 `bmad-advanced-elicitation` 与 `bmad-party-mode` 两个外部 skill
- Step 8 收尾依赖 `bmad-help` skill
- 所有技术版本必须依赖在线 WebSearch；离线环境受限
- 严禁任何形式的时间估算（AI 开发节奏已根本改变）
