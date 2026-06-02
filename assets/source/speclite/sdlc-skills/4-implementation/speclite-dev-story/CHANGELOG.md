# Changelog

本文件记录 `speclite-dev-story` 的版本变更。

## [1.0.3] - 2026-05-27

### 新增

- 开发前执行 `speclite-flow-gate mode=story-kickoff`，通过后才允许推进到 `in-progress`。
- 完成前填写 Anchor Evidence Summary，并执行 `story-completion` gate 后才允许推进到 `review`。
- Story 自动发现优先使用 `sprint-status.yaml` 的 `story_location`，默认回退到 `{implementation_artifacts}/stories`。
- 完成后 CR 指引改为运行 `code-review-01-reviewer`。

## [1.0.2] - 2026-05-06

### 修复

- 将运行配置来源从 `{project-root}/_bmad/bmm/config.yaml` 改为 `{project-root}/_speclite/config.toml`。
- 将 `resolve_customization.py` 与 `workflow.on_complete` 解析路径改为 `{speclite-runtime-root}/scripts/resolve_customization.py`。
- 将 team/user customize fallback 路径改为 `{speclite-runtime-root}/custom/{skill-name}.toml` 与 `{skill-name}.user.toml`。
- 移除入口与执行规约中的 BMad 当前运行语义残留，后续 Test Architect 指引改为 Speclite 中性表述。

### 新增

- 新增 `config.toml.example`，作为目标项目 `_speclite/config.toml` 字段结构参考。

## [1.0.1] - 2026-04-27

### 修复
- **YML-05 / DESC-03**：去除 description 中的 `<path>` 尖括号，避免被识别为注入风险（改为 `'develop story file'`）
- **BODY-01**：把 `[激活流程]` 6 步与 `[执行流程]` 10 个 Step 的完整细节拆分到 `references/activation.md` 与 `references/workflow-steps.md`，SKILL.md 主体由 17021 字符精简至 ≤ 5000 字符
- **BODY-05**：核心能力由 12 条合并为 6 条（customize 解析 + 持久事实 + 配置激活 → "三层 customize 解析与配置激活"；Story 发现 + 评审延续 → 合并；红-绿-重构 + 多层级测试 + 回归 → "测试驱动实现与质量门"；HALT + DoD → "HALT 与 DoD 校验"），落入 4-8 推荐区间
- 同步更新 SKILL.en.md（英文定义）

## [1.0.0] - 2026-04-27

### 新增
- 初始版本，从 `bmad-dev-story` 移植为 speclite 系列
- 三层 customize 解析（base/team/user）：通过 `resolve_customization.py` 或自行合并 `customize.toml`、`{skill-name}.toml`、`{skill-name}.user.toml`
- `workflow.persistent_facts` 加载（支持 `file:` 前缀的路径或 glob）
- 从 `{project-root}/_bmad/bmm/config.yaml` 加载并解析 `project_name`、`user_name`、`communication_language`、`document_output_language`、`user_skill_level`、`implementation_artifacts`、`date`
- Story 自动发现：用户显式 `{story_path}` / 基于 `sprint-status.yaml` `development_status` 顺序扫描 / 无 sprint-status 时直接搜索 `{implementation_artifacts}`
- 评审延续检测：识别 "Senior Developer Review (AI)" 与 "Review Follow-ups (AI)" 段，提取评审结论、未完成项与严重度计数
- 红-绿-重构（red-green-refactor）实现循环
- 多层级测试：单元、集成、端到端，覆盖 Dev Notes 中的边界情况
- 回归与质量门：完整测试集、新测试、lint/静态检查、量化 AC 校验
- HALT 触发器：依赖超出 Story 规格、连续 3 次实现失败、必要配置缺失
- Definition of Done 校验（参见 `checklist.md`）
- Sprint 状态同步：开始时 `ready-for-dev → in-progress`；完成时 `in-progress → review`；保留 sprint-status.yaml 全部注释与结构
- `workflow.on_complete` 终止指令解析与执行
- 同时提供 SKILL.md（中文）与 SKILL.en.md（英文）双语定义

### 已知限制
- 仅修改 Story 文件中的允许区段（Tasks/Subtasks 复选框、Dev Agent Record、File List、Change Log、Status）；其余区段一律不得改动
- 必须从头到尾完整读取 `sprint-status.yaml` 文件以保留顺序，禁止跳读
- 测试不存在或未通过时**绝不**把任务标为 `[x]`
- 评审跟进任务（`[AI-Review]`）必须双向勾选（Review Follow-ups 段 + Senior Developer Review → Action Items 段）
- 除显式 HALT 条件外，不得安排"下一次会话"或请求暂停
